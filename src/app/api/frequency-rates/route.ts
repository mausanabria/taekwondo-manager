import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schema de validación para tarifas por frecuencia
const frequencyRateSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
  rates: z.array(
    z.object({
      weeklyFrequency: z.number().int().min(1).max(7),
      amount: z.number().positive(),
    })
  ),
});

// GET: Obtener tarifas por frecuencia de un mes específico
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener la escuela del usuario
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { schools: true },
    });

    if (!user || user.schools.length === 0) {
      return NextResponse.json({ error: 'No se encontró la escuela' }, { status: 404 });
    }

    const schoolId = user.schools[0].id;

    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams;
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    // Obtener tarifas por frecuencia
    const frequencyRates = await prisma.frequencyRate.findMany({
      where: {
        schoolId,
        year,
        month,
      },
      orderBy: {
        weeklyFrequency: 'asc',
      },
    });

    // Formatear respuesta
    const rates = frequencyRates.map((rate: any) => ({
      weeklyFrequency: rate.weeklyFrequency,
      amount: parseFloat(rate.amount.toString()),
    }));

    return NextResponse.json({
      year,
      month,
      rates,
    });
  } catch (error) {
    console.error('Error al obtener tarifas por frecuencia:', error);
    return NextResponse.json(
      { error: 'Error al obtener tarifas por frecuencia' },
      { status: 500 }
    );
  }
}

// POST: Crear o actualizar tarifas por frecuencia de un mes
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener la escuela del usuario
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { schools: true },
    });

    if (!user || user.schools.length === 0) {
      return NextResponse.json({ error: 'No se encontró la escuela' }, { status: 404 });
    }

    const schoolId = user.schools[0].id;

    // Validar datos de entrada
    const body = await request.json();
    const validatedData = frequencyRateSchema.parse(body);

    const { year, month, rates } = validatedData;

    // Usar transacción para actualizar todas las tarifas
    const result = await prisma.$transaction(async (tx: any) => {
      // Eliminar tarifas existentes del mes
      await tx.frequencyRate.deleteMany({
        where: {
          schoolId,
          year,
          month,
        },
      });

      // Crear nuevas tarifas
      const createdRates = await Promise.all(
        rates.map((rate) =>
          tx.frequencyRate.create({
            data: {
              schoolId,
              year,
              month,
              weeklyFrequency: rate.weeklyFrequency,
              amount: rate.amount,
            },
          })
        )
      );

      return createdRates;
    });

    return NextResponse.json({
      message: 'Tarifas actualizadas correctamente',
      year,
      month,
      rates: result.map((rate: any) => ({
        weeklyFrequency: rate.weeklyFrequency,
        amount: parseFloat(rate.amount.toString()),
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error al actualizar tarifas por frecuencia:', error);
    return NextResponse.json(
      { error: 'Error al actualizar tarifas por frecuencia' },
      { status: 500 }
    );
  }
}

// Made with Bob

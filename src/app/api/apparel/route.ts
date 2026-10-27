import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/apparel — list all apparel sales for the school
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const school = await prisma.school.findFirst({ where: { ownerId: session.user.id } })
    if (!school) return NextResponse.json({ error: "School not found" }, { status: 404 })

    const sales = await prisma.apparelSale.findMany({
      where: { schoolId: school.id },
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(
      sales.map((s) => ({ ...s, amount: Number(s.amount) }))
    )
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/apparel — create an apparel sale
// Body: { studentId, description, amount }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const school = await prisma.school.findFirst({ where: { ownerId: session.user.id } })
    if (!school) return NextResponse.json({ error: "School not found" }, { status: 404 })

    const { studentId, description, amount } = await req.json()
    const numAmount = Number(amount)

    if (!studentId || !description?.trim() || !Number.isFinite(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: "Alumno, descripción y monto (mayor a 0) son requeridos" },
        { status: 400 }
      )
    }

    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId: school.id },
    })
    if (!student) return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })

    const sale = await prisma.apparelSale.create({
      data: {
        studentId,
        schoolId: school.id,
        description: description.trim(),
        amount: numAmount,
      },
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
    })

    return NextResponse.json({ ...sale, amount: Number(sale.amount) }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Made with Bob

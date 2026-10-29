import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/apparel/[id] — toggle isPaid and/or edit studentId, description, amount
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const school = await prisma.school.findFirst({ where: { ownerId: session.user.id } })
    if (!school) return NextResponse.json({ error: "School not found" }, { status: 404 })

    const existing = await prisma.apparelSale.findFirst({
      where: { id: params.id, schoolId: school.id },
    })
    if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

    const { isPaid, isDelivered, studentId, description, amount } = await req.json()
    const data: Record<string, unknown> = {}

    if (isDelivered !== undefined) {
      if (typeof isDelivered !== "boolean") {
        return NextResponse.json({ error: "isDelivered inválido" }, { status: 400 })
      }
      data.isDelivered = isDelivered
      data.deliveredDate = isDelivered ? new Date() : null
    }

    if (isPaid !== undefined) {
      if (typeof isPaid !== "boolean") {
        return NextResponse.json({ error: "isPaid inválido" }, { status: 400 })
      }
      data.isPaid = isPaid
      data.paidDate = isPaid ? new Date() : null
    }

    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        return NextResponse.json({ error: "La descripción es requerida" }, { status: 400 })
      }
      data.description = description.trim()
    }

    if (amount !== undefined) {
      const numAmount = Number(amount)
      if (!Number.isFinite(numAmount) || numAmount <= 0) {
        return NextResponse.json({ error: "El monto debe ser mayor a 0" }, { status: 400 })
      }
      data.amount = numAmount
    }

    if (studentId !== undefined) {
      const student = await prisma.student.findFirst({
        where: { id: studentId, schoolId: school.id },
      })
      if (!student) return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })
      data.studentId = studentId
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 })
    }

    const updated = await prisma.apparelSale.update({
      where: { id: params.id },
      data,
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
    })

    return NextResponse.json({ ...updated, amount: Number(updated.amount) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/apparel/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const school = await prisma.school.findFirst({ where: { ownerId: session.user.id } })
    if (!school) return NextResponse.json({ error: "School not found" }, { status: 404 })

    const existing = await prisma.apparelSale.findFirst({
      where: { id: params.id, schoolId: school.id },
    })
    if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

    await prisma.apparelSale.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Made with Bob

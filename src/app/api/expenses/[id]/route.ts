import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/expenses/[id] — toggle isPaid or update fields
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const school = await prisma.school.findFirst({ where: { ownerId: session.user.id } })
    if (!school) return NextResponse.json({ error: "School not found" }, { status: 404 })

    const existing = await prisma.monthlyExpense.findFirst({
      where: { id: params.id, schoolId: school.id },
    })
    if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

    const body = await req.json()

    const updated = await prisma.monthlyExpense.update({
      where: { id: params.id },
      data: {
        ...(body.isPaid !== undefined && {
          isPaid: body.isPaid,
          paidDate: body.isPaid ? new Date() : null,
        }),
        ...(body.amount !== undefined && { amount: body.amount }),
        ...(body.description !== undefined && { description: body.description }),
      },
    })

    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/expenses/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const school = await prisma.school.findFirst({ where: { ownerId: session.user.id } })
    if (!school) return NextResponse.json({ error: "School not found" }, { status: 404 })

    const existing = await prisma.monthlyExpense.findFirst({
      where: { id: params.id, schoolId: school.id },
    })
    if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

    await prisma.monthlyExpense.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Made with Bob

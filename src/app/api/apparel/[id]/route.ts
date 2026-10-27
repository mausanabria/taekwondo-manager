import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/apparel/[id] — toggle isPaid
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

    const { isPaid } = await req.json()
    if (typeof isPaid !== "boolean") {
      return NextResponse.json({ error: "isPaid es requerido" }, { status: 400 })
    }

    const updated = await prisma.apparelSale.update({
      where: { id: params.id },
      data: { isPaid, paidDate: isPaid ? new Date() : null },
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

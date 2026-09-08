import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/expenses — list all expenses for the school
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const school = await prisma.school.findFirst({ where: { ownerId: session.user.id } })
    if (!school) return NextResponse.json({ error: "School not found" }, { status: 404 })

    const expenses = await prisma.monthlyExpense.findMany({
      where: { schoolId: school.id },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    })

    return NextResponse.json(expenses)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/expenses — create or update expense for a month/year
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const school = await prisma.school.findFirst({ where: { ownerId: session.user.id } })
    if (!school) return NextResponse.json({ error: "School not found" }, { status: 404 })

    const { month, year, amount, description } = await req.json()

    if (!month || !year || amount === undefined || amount < 0) {
      return NextResponse.json({ error: "month, year y amount son requeridos" }, { status: 400 })
    }

    const expense = await prisma.monthlyExpense.upsert({
      where: { schoolId_month_year: { schoolId: school.id, month, year } },
      create: {
        schoolId: school.id,
        month,
        year,
        amount,
        description: description || null,
        isPaid: false,
        createdById: session.user.id,
      },
      update: {
        amount,
        description: description || null,
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Made with Bob

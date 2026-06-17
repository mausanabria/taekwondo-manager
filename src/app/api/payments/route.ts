import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { paymentService } from "@/services/paymentService"
import { recordPaymentSchema } from "@/lib/validations/payment"

/**
 * GET /api/payments
 * Get all payments for the school with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    // Get user's school
    const { prisma } = await import("@/lib/prisma")
    const school = await prisma.school.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!school) {
      return NextResponse.json(
        { error: "School not found" },
        { status: 404 }
      )
    }

    // If studentId is provided, get payments for that student
    if (studentId) {
      const payments = await paymentService.getStudentPayments(
        studentId,
        school.id
      )
      return NextResponse.json(payments)
    }

    // Otherwise, get all payments for the school
    const payments = await prisma.payment.findMany({
      where: { schoolId: school.id },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            belt: true
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { paymentDate: 'desc' }
      ]
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/payments
 * Record a new payment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user's school
    const { prisma } = await import("@/lib/prisma")
    const school = await prisma.school.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!school) {
      return NextResponse.json(
        { error: "School not found" },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Validate request body
    const validation = recordPaymentSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Record the payment
    const payment = await paymentService.recordPayment({
      studentId: data.studentId,
      schoolId: school.id,
      year: data.year,
      month: data.month,
      amount: data.amount,
      paymentDate: new Date(data.paymentDate),
      paymentMethod: data.paymentMethod,
      notes: data.notes
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error("Error recording payment:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    )
  }
}

// Made with Bob
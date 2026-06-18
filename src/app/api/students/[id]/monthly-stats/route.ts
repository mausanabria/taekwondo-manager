import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.schoolId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studentId = params.id

    // Verify student belongs to school
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId: session.user.schoolId
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Get current month start and end
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // Get month name in Spanish
    const monthName = startOfMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

    // Count attendances for current month
    const attendanceCount = await prisma.attendance.count({
      where: {
        studentId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        wasPresent: true
      }
    })

    // Get payments for current month
    const payments = await prisma.payment.findMany({
      where: {
        studentId,
        paymentDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      select: {
        amount: true
      }
    })

    const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)

    // Get monthly fee
    const monthlyFeeResponse = await fetch(
      `${request.nextUrl.origin}/api/students/${studentId}/monthly-fee`,
      {
        headers: {
          cookie: request.headers.get('cookie') || ''
        }
      }
    )

    let monthlyFee = 0
    if (monthlyFeeResponse.ok) {
      const feeData = await monthlyFeeResponse.json()
      monthlyFee = feeData.totalMonthlyFee || 0
    }

    // Calculate debt
    const debt = attendanceCount > 0 ? Math.max(0, monthlyFee - totalPaid) : 0

    // Determine payment status
    let paymentStatus: 'paid' | 'debt' | 'no_attendance' = 'no_attendance'
    let paymentStatusColor: 'green' | 'red' | 'gray' = 'gray'

    if (attendanceCount > 0) {
      if (debt > 0) {
        paymentStatus = 'debt'
        paymentStatusColor = 'red'
      } else {
        paymentStatus = 'paid'
        paymentStatusColor = 'green'
      }
    } else {
      paymentStatus = 'no_attendance'
      paymentStatusColor = 'green'
    }

    return NextResponse.json({
      month: monthName,
      attendanceCount,
      totalPaid,
      monthlyFee,
      debt,
      paymentStatus,
      paymentStatusColor,
      hasAttendances: attendanceCount > 0
    })

  } catch (error) {
    console.error("Error fetching monthly stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Made with Bob
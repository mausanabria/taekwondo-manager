import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/students/[id]/monthly-fee
 * Get the total monthly fee for a student based on their enrollments
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const studentId = params.id

    // Get user's school
    const school = await prisma.school.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!school) {
      return NextResponse.json(
        { error: "School not found" },
        { status: 404 }
      )
    }

    // Verify student belongs to school
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }

    if (student.schoolId !== school.id) {
      return NextResponse.json(
        { error: "Unauthorized: Student does not belong to your school" },
        { status: 403 }
      )
    }

    // Get student's active enrollments with schedule details
    const enrollments = await prisma.studentSchedule.findMany({
      where: {
        studentId,
        isActive: true
      },
      select: {
        id: true,
        weeklyFrequency: true,
        monthlyFee: true,
        schedule: {
          select: {
            id: true,
            name: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true
          }
        }
      }
    })

    // Get the general monthly fee for the current month
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    const generalFee = await prisma.monthlyFee.findFirst({
      where: {
        schoolId: school.id,
        year: currentYear,
        month: currentMonth
      }
    })

    const generalFeeAmount = generalFee ? Number(generalFee.amount) : 0

    // Calculate total monthly fee and build breakdown
    let totalMonthlyFee = 0
    const breakdown = enrollments.map((enrollment) => {
      const feeAmount = enrollment.monthlyFee 
        ? Number(enrollment.monthlyFee) 
        : generalFeeAmount

      totalMonthlyFee += feeAmount

      // Format schedule name with day and time
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
      const dayName = dayNames[enrollment.schedule.dayOfWeek]
      const scheduleName = `${dayName} ${enrollment.schedule.startTime}`

      return {
        scheduleId: enrollment.schedule.id,
        scheduleName,
        fullScheduleName: enrollment.schedule.name,
        dayOfWeek: enrollment.schedule.dayOfWeek,
        startTime: enrollment.schedule.startTime,
        endTime: enrollment.schedule.endTime,
        weeklyFrequency: enrollment.weeklyFrequency,
        monthlyFee: feeAmount,
        isCustom: enrollment.monthlyFee !== null
      }
    })

    return NextResponse.json({
      totalMonthlyFee,
      breakdown,
      generalFee: generalFeeAmount,
      hasCustomFees: breakdown.some(b => b.isCustom),
      enrollmentCount: enrollments.length
    })
  } catch (error) {
    console.error("Error fetching student monthly fee:", error)
    return NextResponse.json(
      { error: "Failed to fetch student monthly fee" },
      { status: 500 }
    )
  }
}

// Made with Bob
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

    // Get the general monthly fee for the current month
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    // Get student's active enrollments with schedule details and frequency history
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
        },
        frequencyHistory: {
          where: {
            OR: [
              {
                // History that started before or during current month
                effectiveFrom: {
                  lte: new Date(currentYear, currentMonth, 0) // End of current month
                },
                effectiveTo: null // Still active
              },
              {
                // History that was active during current month
                effectiveFrom: {
                  lte: new Date(currentYear, currentMonth, 0)
                },
                effectiveTo: {
                  gte: new Date(currentYear, currentMonth - 1, 1) // Start of current month
                }
              }
            ]
          },
          orderBy: {
            effectiveFrom: 'desc'
          }
        }
      }
    })

    const generalFee = await prisma.monthlyFee.findFirst({
      where: {
        schoolId: school.id,
        year: currentYear,
        month: currentMonth
      }
    })

    const generalFeeAmount = generalFee ? Number(generalFee.amount) : 0

    // Get frequency rates for current month
    const frequencyRates = await prisma.frequencyRate.findMany({
      where: {
        schoolId: school.id,
        year: currentYear,
        month: currentMonth
      }
    })

    // Create a map for quick lookup: weeklyFrequency -> amount
    const frequencyRateMap = new Map<number, number>()
    frequencyRates.forEach((rate: any) => {
      frequencyRateMap.set(rate.weeklyFrequency, Number(rate.amount))
    })

    // Calculate total monthly fee and build breakdown
    let totalMonthlyFee = 0
    const breakdown = enrollments.map((enrollment) => {
      let feeAmount: number
      let effectiveFrequency = enrollment.weeklyFrequency
      
      // Check if there's frequency history for current month
      if (enrollment.frequencyHistory && enrollment.frequencyHistory.length > 0) {
        const monthStart = new Date(currentYear, currentMonth - 1, 1)
        const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59)
        
        // Find the most recent history entry that applies to current month
        const currentHistory = enrollment.frequencyHistory.find(h => {
          const effectiveFrom = new Date(h.effectiveFrom)
          const effectiveTo = h.effectiveTo ? new Date(h.effectiveTo) : null
          
          // Check if this history entry overlaps with current month
          return effectiveFrom <= monthEnd && (!effectiveTo || effectiveTo >= monthStart)
        })
        
        if (currentHistory) {
          effectiveFrequency = currentHistory.weeklyFrequency
          
          // Priority: 1) Custom fee from history, 2) Custom fee from enrollment, 3) Frequency rate, 4) General fee
          if (currentHistory.monthlyFee) {
            feeAmount = Number(currentHistory.monthlyFee)
          } else if (enrollment.monthlyFee) {
            feeAmount = Number(enrollment.monthlyFee)
          } else if (frequencyRateMap.has(effectiveFrequency)) {
            feeAmount = frequencyRateMap.get(effectiveFrequency)!
          } else {
            feeAmount = generalFeeAmount
          }
        } else {
          // No history for current month, use current enrollment values
          if (enrollment.monthlyFee) {
            feeAmount = Number(enrollment.monthlyFee)
          } else if (frequencyRateMap.has(effectiveFrequency)) {
            feeAmount = frequencyRateMap.get(effectiveFrequency)!
          } else {
            feeAmount = generalFeeAmount
          }
        }
      } else {
        // No history, use current enrollment values
        if (enrollment.monthlyFee) {
          feeAmount = Number(enrollment.monthlyFee)
        } else if (frequencyRateMap.has(effectiveFrequency)) {
          feeAmount = frequencyRateMap.get(effectiveFrequency)!
        } else {
          feeAmount = generalFeeAmount
        }
      }

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
        weeklyFrequency: effectiveFrequency,
        monthlyFee: feeAmount,
        isCustom: enrollment.monthlyFee !== null,
        hasFrequencyHistory: enrollment.frequencyHistory && enrollment.frequencyHistory.length > 0
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
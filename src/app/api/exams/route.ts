import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getBeltOrder } from "@/lib/belt-utils"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

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

    const schoolId = school.id

    // Get all data in a single optimized query with includes
    const students = await prisma.student.findMany({
      where: {
        schoolId: schoolId,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        belt: true,
        createdAt: true,
        enrollments: {
          where: {
            isActive: true,
          },
          select: {
            scheduleId: true,
            schedule: {
              select: {
                id: true,
                name: true,
                dayOfWeek: true,
                startTime: true,
                endTime: true,
              },
            },
          },
        },
        beltHistory: {
          orderBy: {
            changeDate: 'desc',
          },
          take: 1,
          select: {
            changeDate: true,
          },
        },
        attendances: {
          where: {
            wasPresent: true,
          },
          select: {
            id: true,
            date: true,
          },
        },
      },
    })

    if (students.length === 0) {
      return NextResponse.json([])
    }

    // Process students with attendance counts
    const studentsWithData = students.map((student) => {
      const latestBeltChange = student.beltHistory[0]?.changeDate
      const referenceDate = latestBeltChange ? new Date(latestBeltChange) : new Date(student.createdAt)
      const isFirstBelt = !latestBeltChange

      // Count attendances after reference date
      const attendanceCount = student.attendances.filter(
        (att) => new Date(att.date) >= referenceDate
      ).length

      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        belt: student.belt,
        beltOrder: getBeltOrder(student.belt),
        attendanceCount,
        lastBeltChangeDate: referenceDate.toISOString(),
        isFirstBelt,
        schedules: student.enrollments.map((ss: any) => ({
          id: ss.schedule.id,
          name: ss.schedule.name,
          dayOfWeek: ss.schedule.dayOfWeek,
          startTime: ss.schedule.startTime,
          endTime: ss.schedule.endTime,
        })),
        createdAt: student.createdAt,
      }
    })

    // Group by schedule
    const groupedBySchedule: Record<string, any[]> = {}
    
    studentsWithData.forEach((student) => {
      student.schedules.forEach((schedule: any) => {
        if (!groupedBySchedule[schedule.id]) {
          groupedBySchedule[schedule.id] = []
        }
        
        const exists = groupedBySchedule[schedule.id].some(s => s.id === student.id)
        if (!exists) {
          groupedBySchedule[schedule.id].push({
            ...student,
            scheduleName: schedule.name,
            scheduleTime: `${schedule.startTime} - ${schedule.endTime}`,
          })
        }
      })
    })

    // Sort students by belt order
    Object.keys(groupedBySchedule).forEach(scheduleId => {
      groupedBySchedule[scheduleId].sort((a, b) => b.beltOrder - a.beltOrder)
    })

    const scheduleIds = Object.keys(groupedBySchedule)
    
    if (scheduleIds.length === 0) {
      return NextResponse.json([])
    }

    // Get schedule details
    const scheduleDetails = await prisma.schedule.findMany({
      where: {
        id: { in: scheduleIds },
        schoolId: schoolId,
      },
      select: {
        id: true,
        name: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
      },
    })

    const result = scheduleDetails.map(schedule => ({
      schedule: {
        id: schedule.id,
        name: schedule.name,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      },
      students: groupedBySchedule[schedule.id] || [],
    }))

    console.log('[EXAMS API] Returning result with', result.length, 'schedules')
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[EXAMS API] Error:", error)
    console.error("[EXAMS API] Error message:", error.message)
    console.error("[EXAMS API] Error stack:", error.stack)
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch exam data",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        type: error.constructor.name
      },
      { status: 500 }
    )
  }
}

// Made with Bob
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getBeltOrder } from "@/lib/belt-utils"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const schoolId = session.user.schoolId
    
    if (!schoolId) {
      return NextResponse.json(
        { error: "No school associated with user" },
        { status: 400 }
      )
    }

    // Get all active students with their schedules and belt history
    const students = await prisma.student.findMany({
      where: {
        schoolId: schoolId,
        isActive: true,
      },
      include: {
        enrollments: {
          where: {
            isActive: true,
          },
          include: {
            schedule: true,
          },
        },
        beltHistory: {
          orderBy: {
            changeDate: 'desc',
          },
          take: 1, // Get only the most recent belt change
        },
        attendances: {
          where: {
            wasPresent: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
      },
    })

    // Process each student to calculate attendance since last belt change
    const examData = students.map(student => {
      const lastBeltChange = student.beltHistory[0]
      const referenceDate = lastBeltChange 
        ? new Date(lastBeltChange.changeDate)
        : new Date(student.createdAt)

      // Count attendances since reference date
      const attendancesSinceChange = student.attendances.filter(
        att => new Date(att.date) >= referenceDate
      ).length

      // Get unique schedules (classes)
      const schedules = student.enrollments.map(e => ({
        id: e.schedule.id,
        name: e.schedule.name,
        dayOfWeek: e.schedule.dayOfWeek,
        startTime: e.schedule.startTime,
        endTime: e.schedule.endTime,
      }))

      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        belt: student.belt,
        beltOrder: getBeltOrder(student.belt),
        attendanceCount: attendancesSinceChange,
        lastBeltChangeDate: lastBeltChange?.changeDate || student.createdAt,
        isFirstBelt: !lastBeltChange,
        schedules: schedules,
        createdAt: student.createdAt,
      }
    })

    // Group by schedule
    const groupedBySchedule: Record<string, any[]> = {}
    
    examData.forEach(student => {
      student.schedules.forEach(schedule => {
        if (!groupedBySchedule[schedule.id]) {
          groupedBySchedule[schedule.id] = []
        }
        
        // Check if student is not already in this schedule group
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

    // Sort students within each schedule by belt order (highest first)
    Object.keys(groupedBySchedule).forEach(scheduleId => {
      groupedBySchedule[scheduleId].sort((a, b) => b.beltOrder - a.beltOrder)
    })

    // Get schedule details for response
    const scheduleDetails = await prisma.schedule.findMany({
      where: {
        id: { in: Object.keys(groupedBySchedule) },
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

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error fetching exam data:", error)
    
    return NextResponse.json(
      { error: "Failed to fetch exam data" },
      { status: 500 }
    )
  }
}

// Made with Bob
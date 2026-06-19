import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getBeltOrder } from "@/lib/belt-utils"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60 // Increase timeout to 60 seconds

export async function GET(request: NextRequest) {
  try {
    console.log('[EXAMS API] Starting request')
    
    const session = await getServerSession()
    
    if (!session || !session.user) {
      console.log('[EXAMS API] Unauthorized - no session')
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const schoolId = session.user.schoolId
    
    if (!schoolId) {
      console.log('[EXAMS API] No school ID found')
      return NextResponse.json(
        { error: "No school associated with user" },
        { status: 400 }
      )
    }

    console.log('[EXAMS API] School ID:', schoolId)

    // Simple query - get only active students
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
      },
    })
    
    console.log('[EXAMS API] Found students:', students.length)

    if (students.length === 0) {
      return NextResponse.json([])
    }

    const studentIds = students.map(s => s.id)

    // Get enrollments
    const enrollments = await prisma.studentSchedule.findMany({
      where: {
        studentId: { in: studentIds },
        isActive: true,
      },
      select: {
        studentId: true,
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
    })

    console.log('[EXAMS API] Found enrollments:', enrollments.length)

    // Get belt histories
    const beltHistories = await prisma.beltHistory.findMany({
      where: {
        studentId: { in: studentIds },
      },
      orderBy: {
        changeDate: 'desc',
      },
      select: {
        studentId: true,
        changeDate: true,
      },
    })

    console.log('[EXAMS API] Found belt histories:', beltHistories.length)

    // Create a map of latest belt change per student
    const latestBeltChange = new Map<string, Date>()
    beltHistories.forEach(history => {
      if (!latestBeltChange.has(history.studentId)) {
        latestBeltChange.set(history.studentId, new Date(history.changeDate))
      }
    })

    // Process students with attendance counts
    const studentsWithData = await Promise.all(
      students.map(async (student) => {
        const referenceDate = latestBeltChange.get(student.id) || new Date(student.createdAt)
        const isFirstBelt = !latestBeltChange.has(student.id)

        // Count attendances
        const attendanceCount = await prisma.attendance.count({
          where: {
            studentId: student.id,
            wasPresent: true,
            date: {
              gte: referenceDate,
            },
          },
        })

        // Get student's schedules
        const studentEnrollments = enrollments.filter(e => e.studentId === student.id)
        
        return {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          belt: student.belt,
          beltOrder: getBeltOrder(student.belt),
          attendanceCount,
          lastBeltChangeDate: referenceDate.toISOString(),
          isFirstBelt,
          schedules: studentEnrollments.map(e => ({
            id: e.schedule.id,
            name: e.schedule.name,
            dayOfWeek: e.schedule.dayOfWeek,
            startTime: e.schedule.startTime,
            endTime: e.schedule.endTime,
          })),
          createdAt: student.createdAt,
        }
      })
    )

    console.log('[EXAMS API] Processed students with data')

    // Group by schedule
    const groupedBySchedule: Record<string, any[]> = {}
    
    studentsWithData.forEach(student => {
      student.schedules.forEach(schedule => {
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
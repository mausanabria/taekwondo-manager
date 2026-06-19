import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getBeltOrder } from "@/lib/belt-utils"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

    // Get all active students with minimal data first
    console.log('[EXAMS API] Fetching students...')
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

    // Get enrollments separately
    const enrollments = await prisma.studentSchedule.findMany({
      where: {
        studentId: { in: students.map(s => s.id) },
        isActive: true,
      },
      include: {
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

    // Get belt history separately
    const beltHistories = await prisma.beltHistory.findMany({
      where: {
        studentId: { in: students.map(s => s.id) },
      },
      orderBy: {
        changeDate: 'desc',
      },
      select: {
        id: true,
        studentId: true,
        changeDate: true,
      },
    })

    console.log('[EXAMS API] Found belt histories:', beltHistories.length)

    // Group belt histories by student (get most recent)
    const latestBeltHistory = new Map<string, Date>()
    beltHistories.forEach(history => {
      if (!latestBeltHistory.has(history.studentId)) {
        latestBeltHistory.set(history.studentId, new Date(history.changeDate))
      }
    })

    // Process each student
    const examDataPromises = students.map(async (student) => {
      const referenceDate = latestBeltHistory.get(student.id) || new Date(student.createdAt)
      const isFirstBelt = !latestBeltHistory.has(student.id)

      // Count attendances since reference date
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
      const schedules = studentEnrollments.map(e => ({
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
        attendanceCount: attendanceCount,
        lastBeltChangeDate: referenceDate.toISOString(),
        isFirstBelt: isFirstBelt,
        schedules: schedules,
        createdAt: student.createdAt,
      }
    })

    const examData = await Promise.all(examDataPromises)
    
    console.log('[EXAMS API] Processed exam data:', examData.length)

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
    const scheduleIds = Object.keys(groupedBySchedule)
    
    if (scheduleIds.length === 0) {
      return NextResponse.json([])
    }

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
    console.error("[EXAMS API] Error fetching exam data:", error)
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
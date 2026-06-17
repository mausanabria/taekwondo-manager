import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { attendanceService } from "@/services/attendanceService"
import { 
  markAttendanceSchema, 
  getAttendanceQuerySchema 
} from "@/lib/validations/attendance"

/**
 * GET /api/attendance
 * Get attendances with optional filters
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const queryData = {
      scheduleId: searchParams.get("scheduleId") || undefined,
      studentId: searchParams.get("studentId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      date: searchParams.get("date") || undefined
    }

    // Validate query parameters
    const validation = getAttendanceQuerySchema.safeParse(queryData)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error.errors },
        { status: 400 }
      )
    }

    const { scheduleId, studentId, startDate, endDate, date } = validation.data

    let attendances

    // Get attendances based on filters
    if (scheduleId && date) {
      // Get attendances for a specific schedule and date
      attendances = await attendanceService.getAttendanceByDate(
        scheduleId,
        new Date(date),
        school.id
      )
    } else if (scheduleId) {
      // Get attendances for a schedule with date range
      attendances = await attendanceService.getScheduleAttendances(
        scheduleId,
        school.id,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      )
    } else if (studentId) {
      // Get attendances for a student with date range
      attendances = await attendanceService.getStudentAttendances(
        studentId,
        school.id,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      )
    } else {
      return NextResponse.json(
        { error: "Either scheduleId or studentId is required" },
        { status: 400 }
      )
    }

    return NextResponse.json(attendances)
  } catch (error: any) {
    console.error("Error fetching attendances:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch attendances" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/attendance
 * Mark attendance for a single student
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

    // Parse request body
    const body = await request.json()

    // Validate request data
    const validation = markAttendanceSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      )
    }

    const { scheduleId, studentId, date, wasPresent, notes } = validation.data

    // Mark attendance
    const attendance = await attendanceService.markAttendance(
      {
        scheduleId,
        studentId,
        date: new Date(date),
        wasPresent,
        notes: notes || null
      },
      school.id
    )

    return NextResponse.json(attendance, { status: 201 })
  } catch (error: any) {
    console.error("Error marking attendance:", error)
    return NextResponse.json(
      { error: error.message || "Failed to mark attendance" },
      { status: 500 }
    )
  }
}

// Made with Bob
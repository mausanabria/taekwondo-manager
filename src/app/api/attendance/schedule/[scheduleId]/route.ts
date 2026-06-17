import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { attendanceService } from "@/services/attendanceService"

/**
 * GET /api/attendance/schedule/[scheduleId]
 * Get attendance history for a specific schedule
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { scheduleId: string } }
) {
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

    const { scheduleId } = params

    // Parse query parameters for date range
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const date = searchParams.get("date")

    // If specific date is provided, get attendance for that date
    if (date) {
      const attendances = await attendanceService.getAttendanceByDate(
        scheduleId,
        new Date(date),
        school.id
      )
      return NextResponse.json(attendances)
    }

    // Otherwise, get attendance history with optional date range
    const attendances = await attendanceService.getScheduleAttendances(
      scheduleId,
      school.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    )

    return NextResponse.json(attendances)
  } catch (error: any) {
    console.error("Error fetching schedule attendances:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch schedule attendances" },
      { status: 500 }
    )
  }
}

// Made with Bob
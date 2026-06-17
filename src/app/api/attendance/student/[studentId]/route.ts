import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { attendanceService } from "@/services/attendanceService"

/**
 * GET /api/attendance/student/[studentId]
 * Get attendance history for a specific student
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
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

    const { studentId } = params

    // Parse query parameters for date range
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const year = searchParams.get("year")
    const month = searchParams.get("month")

    // If year and month are provided, get monthly attendance
    if (year && month) {
      const attendances = await attendanceService.getMonthlyAttendance(
        studentId,
        parseInt(year),
        parseInt(month),
        school.id
      )
      return NextResponse.json(attendances)
    }

    // Otherwise, get attendance history with optional date range
    const attendances = await attendanceService.getStudentAttendances(
      studentId,
      school.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    )

    return NextResponse.json(attendances)
  } catch (error: any) {
    console.error("Error fetching student attendances:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch student attendances" },
      { status: 500 }
    )
  }
}

// Made with Bob
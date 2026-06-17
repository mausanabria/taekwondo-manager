import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { attendanceService } from "@/services/attendanceService"

/**
 * GET /api/attendance/stats/[studentId]
 * Get attendance statistics for a specific student
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

    // Get attendance statistics
    const stats = await attendanceService.getAttendanceStats(
      studentId,
      school.id
    )

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error("Error fetching attendance stats:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch attendance statistics" },
      { status: 500 }
    )
  }
}

// Made with Bob
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { attendanceService } from "@/services/attendanceService"
import { bulkAttendanceSchema } from "@/lib/validations/attendance"

/**
 * POST /api/attendance/bulk
 * Mark attendance for multiple students at once
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
    const validation = bulkAttendanceSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      )
    }

    const { scheduleId, date, attendances } = validation.data

    // Mark bulk attendance
    const result = await attendanceService.bulkMarkAttendance(
      scheduleId,
      new Date(date),
      attendances.map(a => ({
        studentId: a.studentId,
        wasPresent: a.wasPresent,
        notes: a.notes || null
      })),
      school.id
    )

    return NextResponse.json(
      {
        message: "Bulk attendance marked successfully",
        created: result.created,
        updated: result.updated,
        total: result.created + result.updated
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error marking bulk attendance:", error)
    return NextResponse.json(
      { error: error.message || "Failed to mark bulk attendance" },
      { status: 500 }
    )
  }
}

// Made with Bob
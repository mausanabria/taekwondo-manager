import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/student-schedules
 * Get all student schedules (enrollments) for the school
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
    const school = await prisma.school.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!school) {
      return NextResponse.json(
        { error: "School not found" },
        { status: 404 }
      )
    }

    // Get all student schedules for this school
    const studentSchedules = await prisma.studentSchedule.findMany({
      where: {
        student: {
          schoolId: school.id
        }
      },
      select: {
        id: true,
        studentId: true,
        scheduleId: true,
        isActive: true,
        weeklyFrequency: true,
        monthlyFee: true,
        enrolledAt: true
      }
    })

    return NextResponse.json(studentSchedules)
  } catch (error) {
    console.error("Error fetching student schedules:", error)
    return NextResponse.json(
      { error: "Failed to fetch student schedules" },
      { status: 500 }
    )
  }
}

// Made with Bob
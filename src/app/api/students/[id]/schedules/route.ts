import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { scheduleService } from "@/services/scheduleService"

// GET /api/students/[id]/schedules - Get all schedules for a student
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const schedules = await scheduleService.getStudentSchedules(params.id, schoolId)

    return NextResponse.json(schedules)
  } catch (error: any) {
    console.error("Error fetching student schedules:", error)
    
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to fetch student schedules" },
      { status: 500 }
    )
  }
}

// Made with Bob
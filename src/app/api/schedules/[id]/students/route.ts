import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { scheduleService } from "@/services/scheduleService"
import { z } from "zod"

// Validation schema for enrolling a student
const enrollStudentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  weeklyFrequency: z.number().int().min(1).max(7).default(1),
  monthlyFee: z.number().positive().optional(),
  notes: z.string().optional()
})

// GET /api/schedules/[id]/students - Get all students enrolled in a schedule
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

    const students = await scheduleService.getScheduleStudents(params.id, schoolId)

    return NextResponse.json(students)
  } catch (error: any) {
    console.error("Error fetching schedule students:", error)
    
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    if (error.message.includes("not found")) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to fetch schedule students" },
      { status: 500 }
    )
  }
}

// POST /api/schedules/[id]/students - Enroll a student in a schedule
export async function POST(
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

    const body = await request.json()

    // Validate request body
    const validationResult = enrollStudentSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { studentId, weeklyFrequency, monthlyFee, notes } = validationResult.data

    const enrollment = await scheduleService.enrollStudent(
      params.id,
      studentId,
      schoolId,
      weeklyFrequency,
      monthlyFee,
      notes
    )

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error: any) {
    console.error("Error enrolling student:", error)
    
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    if (error.message.includes("not found")) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }
    
    if (error.message.includes("already enrolled")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    
    if (error.message.includes("full capacity")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to enroll student" },
      { status: 500 }
    )
  }
}

// Made with Bob
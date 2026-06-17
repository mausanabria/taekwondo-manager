import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { scheduleService } from "@/services/scheduleService"
import { z } from "zod"

// Validation schema for updating enrollment
const updateEnrollmentSchema = z.object({
  weeklyFrequency: z.number().int().min(1).max(7).optional(),
  monthlyFee: z.number().positive().nullable().optional(),
  notes: z.string().nullable().optional()
})

// PUT /api/schedules/[id]/students/[studentId] - Update student enrollment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; studentId: string } }
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
    const validationResult = updateEnrollmentSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { weeklyFrequency, monthlyFee, notes } = validationResult.data

    const enrollment = await scheduleService.updateEnrollment(
      params.id,
      params.studentId,
      schoolId,
      weeklyFrequency,
      monthlyFee,
      notes
    )

    return NextResponse.json(enrollment)
  } catch (error: any) {
    console.error("Error updating enrollment:", error)
    
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    if (error.message.includes("not found") || error.message.includes("not enrolled")) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update enrollment" },
      { status: 500 }
    )
  }
}

// DELETE /api/schedules/[id]/students/[studentId] - Unenroll a student from a schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; studentId: string } }
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

    await scheduleService.unenrollStudent(params.id, params.studentId, schoolId)

    return NextResponse.json({ message: "Student unenrolled successfully" })
  } catch (error: any) {
    console.error("Error unenrolling student:", error)
    
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    if (error.message.includes("not found") || error.message.includes("not enrolled")) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to unenroll student" },
      { status: 500 }
    )
  }
}

// Made with Bob
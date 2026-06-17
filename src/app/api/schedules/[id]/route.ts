import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { scheduleService } from "@/services/scheduleService"
import { z } from "zod"

// Validation schema for updating a schedule
const updateScheduleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  dayOfWeek: z.number().int().min(0).max(6, "Day of week must be between 0 (Sunday) and 6 (Saturday)").optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1, "At least one day must be selected").optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM").optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM").optional(),
  capacity: z.number().int().positive("Capacity must be positive").optional().nullable(),
  isActive: z.boolean().optional()
})

// GET /api/schedules/[id] - Get a specific schedule
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

    const schedule = await scheduleService.getScheduleById(params.id, schoolId)

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(schedule)
  } catch (error: any) {
    console.error("Error fetching schedule:", error)
    
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    )
  }
}

// PUT /api/schedules/[id] - Update a schedule
export async function PUT(
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
    const validationResult = updateScheduleSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const schedule = await scheduleService.updateSchedule(params.id, data, schoolId)

    return NextResponse.json(schedule)
  } catch (error: any) {
    console.error("Error updating schedule:", error)
    
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
    
    if (error.message.includes("overlaps")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    
    if (error.message.includes("Invalid time format") || error.message.includes("End time must be after start time")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    )
  }
}

// DELETE /api/schedules/[id] - Delete a schedule (soft delete)
export async function DELETE(
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

    await scheduleService.deleteSchedule(params.id, schoolId)

    return NextResponse.json({ message: "Schedule deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting schedule:", error)
    
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
      { error: "Failed to delete schedule" },
      { status: 500 }
    )
  }
}

// Made with Bob
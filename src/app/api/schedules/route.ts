import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { scheduleService } from "@/services/scheduleService"
import { z } from "zod"

// Validation schema for creating a schedule
const createScheduleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  dayOfWeek: z.number().int().min(0).max(6, "Day of week must be between 0 (Sunday) and 6 (Saturday)"),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1, "At least one day must be selected"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"),
  capacity: z.number().int().positive("Capacity must be positive").optional().nullable()
})

// GET /api/schedules - Get all schedules for the authenticated user's school
export async function GET(request: NextRequest) {
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

    const schedules = await scheduleService.getAllSchedules(schoolId)

    return NextResponse.json(schedules)
  } catch (error) {
    console.error("Error fetching schedules:", error)
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    )
  }
}

// POST /api/schedules - Create a new schedule
export async function POST(request: NextRequest) {
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
    const validationResult = createScheduleSchema.safeParse(body)
    
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

    const scheduleData = {
      ...data,
      schoolId
    }

    const schedule = await scheduleService.createSchedule(scheduleData)

    return NextResponse.json(schedule, { status: 201 })
  } catch (error: any) {
    console.error("Error creating schedule:", error)
    
    // Handle specific errors
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
      { error: "Failed to create schedule" },
      { status: 500 }
    )
  }
}

// Made with Bob
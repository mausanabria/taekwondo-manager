import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { BELT_VALUES } from "@/lib/validations/student"
import { getBeltOrder } from "@/lib/belt-utils"

// Validation schema for belt change
const changeBeltSchema = z.object({
  newBelt: z.enum(BELT_VALUES),
  changeDate: z.string().datetime(),
  notes: z.string().optional(),
})

// POST /api/students/[id]/change-belt - Change student's belt
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
    const validationResult = changeBeltSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { newBelt, changeDate, notes } = validationResult.data

    // Verify student exists and belongs to the school
    const student = await prisma.student.findFirst({
      where: {
        id: params.id,
        schoolId: schoolId,
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }

    // Update student's belt and create history record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update student's current belt
      const updatedStudent = await tx.student.update({
        where: { id: params.id },
        data: { belt: newBelt },
      })

      // Create belt history record
      const beltHistory = await tx.beltHistory.create({
        data: {
          studentId: params.id,
          belt: newBelt,
          changeDate: new Date(changeDate),
          notes: notes || null,
          createdById: session.user.id,
        },
      })

      return { student: updatedStudent, history: beltHistory }
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error changing belt:", error)
    
    return NextResponse.json(
      { error: error.message || "Failed to change belt" },
      { status: 500 }
    )
  }
}

// GET /api/students/[id]/change-belt - Get belt change history
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

    // Verify student exists and belongs to the school
    const student = await prisma.student.findFirst({
      where: {
        id: params.id,
        schoolId: schoolId,
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }

    // Get belt history ordered by date (most recent first)
    const history = await prisma.beltHistory.findMany({
      where: {
        studentId: params.id,
      },
      orderBy: {
        changeDate: 'desc',
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(history)
  } catch (error: any) {
    console.error("Error fetching belt history:", error)
    
    return NextResponse.json(
      { error: "Failed to fetch belt history" },
      { status: 500 }
    )
  }
}

// Made with Bob
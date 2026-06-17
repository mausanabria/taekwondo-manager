import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const changeFrequencySchema = z.object({
  weeklyFrequency: z.number().int().min(1).max(7),
  monthlyFee: z.number().nullable().optional(),
  effectiveFrom: z.string().datetime(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = changeFrequencySchema.parse(body)

    // Get the student schedule to verify ownership
    const studentSchedule = await prisma.studentSchedule.findUnique({
      where: { id: params.id },
      include: {
        student: {
          include: {
            school: true,
          },
        },
      },
    })

    if (!studentSchedule) {
      return NextResponse.json(
        { error: "Student schedule not found" },
        { status: 404 }
      )
    }

    // Verify the user owns this school
    if (studentSchedule.student.school.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You don't own this school" },
        { status: 403 }
      )
    }

    const effectiveFromDate = new Date(validatedData.effectiveFrom)

    // Start a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // 1. Close the current frequency history record
      await tx.frequencyHistory.updateMany({
        where: {
          studentScheduleId: params.id,
          effectiveTo: null,
        },
        data: {
          effectiveTo: effectiveFromDate,
        },
      })

      // 2. Create new frequency history record
      await tx.frequencyHistory.create({
        data: {
          studentScheduleId: params.id,
          weeklyFrequency: validatedData.weeklyFrequency,
          monthlyFee: validatedData.monthlyFee,
          effectiveFrom: effectiveFromDate,
          effectiveTo: null, // Current/active
        },
      })

      // 3. Update the StudentSchedule with the new current frequency
      await tx.studentSchedule.update({
        where: { id: params.id },
        data: {
          weeklyFrequency: validatedData.weeklyFrequency,
          monthlyFee: validatedData.monthlyFee,
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: "Frequency changed successfully",
    })
  } catch (error) {
    console.error("Error changing frequency:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to change frequency" },
      { status: 500 }
    )
  }
}

// Made with Bob

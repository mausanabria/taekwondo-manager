import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
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

    // Get the student schedule to verify ownership
    const studentSchedule = await prisma.studentSchedule.findUnique({
      where: { id: params.id },
      include: {
        student: {
          include: {
            school: true,
          },
        },
        frequencyHistory: {
          orderBy: { effectiveFrom: 'desc' },
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

    // Return the frequency history
    return NextResponse.json({
      history: studentSchedule.frequencyHistory.map((record) => ({
        id: record.id,
        weeklyFrequency: record.weeklyFrequency,
        monthlyFee: record.monthlyFee ? Number(record.monthlyFee) : null,
        effectiveFrom: record.effectiveFrom.toISOString(),
        effectiveTo: record.effectiveTo?.toISOString() || null,
        isCurrent: !record.effectiveTo,
      })),
    })
  } catch (error) {
    console.error("Error fetching frequency history:", error)

    return NextResponse.json(
      { error: "Failed to fetch frequency history" },
      { status: 500 }
    )
  }
}

// Made with Bob

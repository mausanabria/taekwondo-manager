import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * GET /api/payments/fees/[id]
 * Get a specific monthly fee by ID
 */
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

    const fee = await prisma.monthlyFee.findUnique({
      where: { id: params.id }
    })

    if (!fee) {
      return NextResponse.json(
        { error: "Monthly fee not found" },
        { status: 404 }
      )
    }

    // Verify fee belongs to user's school
    if (fee.schoolId !== school.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    return NextResponse.json(fee)
  } catch (error) {
    console.error("Error fetching monthly fee:", error)
    return NextResponse.json(
      { error: "Failed to fetch monthly fee" },
      { status: 500 }
    )
  }
}

// Made with Bob
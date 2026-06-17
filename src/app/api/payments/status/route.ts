import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { paymentService } from "@/services/paymentService"

/**
 * GET /api/payments/status
 * Get payment status for all students in the school
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

    const statuses = await paymentService.getAllStudentsPaymentStatus(school.id)

    return NextResponse.json(statuses)
  } catch (error) {
    console.error("Error fetching payment statuses:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment statuses" },
      { status: 500 }
    )
  }
}

// Made with Bob
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { paymentService } from "@/services/paymentService"

/**
 * GET /api/payments/stats
 * Get payment statistics for the school
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

    const stats = await paymentService.getPaymentStats(school.id)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching payment stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment statistics" },
      { status: 500 }
    )
  }
}

// Made with Bob
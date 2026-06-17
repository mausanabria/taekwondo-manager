import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { paymentService } from "@/services/paymentService"
import { requireAdmin, UserRole } from "@/lib/rbac"

/**
 * DELETE /api/payments/[id]
 * Delete a payment (admin only)
 * This is used to correct mistakes in payment registration
 */
export async function DELETE(
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

    // Get user's role from database
    const { prisma } = await import("@/lib/prisma")
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Only admins can delete payments
    try {
      requireAdmin({ id: user.id, role: user.role as UserRole })
    } catch (error) {
      return NextResponse.json(
        { error: "Only administrators can delete payments" },
        { status: 403 }
      )
    }

    // Get user's school
    const school = await prisma.school.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!school) {
      return NextResponse.json(
        { error: "School not found" },
        { status: 404 }
      )
    }

    const paymentId = params.id

    // Delete the payment
    await paymentService.deletePayment(paymentId, school.id)

    return NextResponse.json(
      { message: "Payment deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting payment:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    )
  }
}

// Made with Bob
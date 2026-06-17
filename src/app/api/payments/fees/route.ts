import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { paymentService } from "@/services/paymentService"
import { createMonthlyFeeSchema, updateMonthlyFeeSchema } from "@/lib/validations/payment"

/**
 * GET /api/payments/fees
 * Get all monthly fees for the school
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

    const { searchParams } = new URL(request.url)
    const year = searchParams.get("year")
    const month = searchParams.get("month")

    // If year and month are provided, get specific fee
    if (year && month) {
      const fee = await paymentService.getMonthlyFee(
        school.id,
        parseInt(year),
        parseInt(month)
      )
      
      if (!fee) {
        return NextResponse.json(
          { error: "Monthly fee not found" },
          { status: 404 }
        )
      }
      
      return NextResponse.json(fee)
    }

    // Otherwise, get all fees
    const fees = await paymentService.getAllMonthlyFees(school.id)

    return NextResponse.json(fees)
  } catch (error) {
    console.error("Error fetching monthly fees:", error)
    return NextResponse.json(
      { error: "Failed to fetch monthly fees" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/payments/fees
 * Create a new monthly fee
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()

    // Validate request body
    const validation = createMonthlyFeeSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Create the monthly fee
    const fee = await paymentService.createMonthlyFee({
      schoolId: school.id,
      year: data.year,
      month: data.month,
      amount: data.amount,
      description: data.description
    })

    return NextResponse.json(fee, { status: 201 })
  } catch (error) {
    console.error("Error creating monthly fee:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create monthly fee" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/payments/fees
 * Update a monthly fee (requires id in query params)
 */
export async function PUT(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Fee ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate request body
    const validation = updateMonthlyFeeSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Update the monthly fee
    const fee = await paymentService.updateMonthlyFee(
      id,
      data.amount,
      school.id
    )

    return NextResponse.json(fee)
  } catch (error) {
    console.error("Error updating monthly fee:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update monthly fee" },
      { status: 500 }
    )
  }
}

// Made with Bob
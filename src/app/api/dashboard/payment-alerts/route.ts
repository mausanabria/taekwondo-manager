import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { dashboardService } from "@/services/dashboardService"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await requireAuth()
    const schoolId = session.user.schoolId

    if (!schoolId) {
      return NextResponse.json(
        { error: "No school associated with user" },
        { status: 400 }
      )
    }

    const paymentAlerts = await dashboardService.getPaymentAlerts(schoolId, 5)

    return NextResponse.json(paymentAlerts)
  } catch (error) {
    console.error("Error fetching payment alerts:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment alerts" },
      { status: 500 }
    )
  }
}

// Made with Bob
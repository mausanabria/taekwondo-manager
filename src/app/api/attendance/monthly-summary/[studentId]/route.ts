import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * GET /api/attendance/monthly-summary/[studentId]
 * Returns attendance counts grouped by month for the last 12 months (year-to-date).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { prisma: prismaImport } = await import("@/lib/prisma")
    const school = await prismaImport.school.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 })
    }

    const { studentId } = params

    // Verify student belongs to school
    const student = await prismaImport.student.findUnique({
      where: { id: studentId },
      select: { id: true, firstName: true, lastName: true, schoolId: true }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    if (student.schoolId !== school.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Build 12-month range: from start of same month last year up to end of current month
    const now = new Date()
    const startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const attendances = await prismaImport.attendance.findMany({
      where: {
        studentId,
        date: { gte: startDate, lte: endDate }
      },
      select: { date: true, wasPresent: true }
    })

    // Group by year-month
    const monthMap = new Map<string, { present: number; absent: number }>()

    // Pre-fill all 12 months with zeros so months with no data still appear
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      monthMap.set(key, { present: 0, absent: 0 })
    }

    for (const a of attendances) {
      const d = new Date(a.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      if (monthMap.has(key)) {
        const entry = monthMap.get(key)!
        if (a.wasPresent) {
          entry.present++
        } else {
          entry.absent++
        }
      }
    }

    const summary = Array.from(monthMap.entries()).map(([month, counts]) => ({
      month,
      present: counts.present,
      absent: counts.absent,
      total: counts.present + counts.absent
    }))

    return NextResponse.json({ student, summary })
  } catch (error: any) {
    console.error("Error fetching monthly attendance summary:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch monthly attendance summary" },
      { status: 500 }
    )
  }
}

// Made with Bob

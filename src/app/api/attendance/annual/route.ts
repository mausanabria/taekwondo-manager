import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/**
 * GET /api/attendance/annual?year=2024
 * Returns total present attendances per student for a given year.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const school = await prisma.school.findFirst({
      where: { ownerId: session.user.id },
    })

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 })
    }

    const yearParam = request.nextUrl.searchParams.get("year")
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear()

    const startDate = new Date(`${year}-01-01T00:00:00.000Z`)
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`)

    // Fetch all students (active and inactive) that belong to this school
    const students = await prisma.student.findMany({
      where: { schoolId: school.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        belt: true,
        isActive: true,
        attendances: {
          where: {
            wasPresent: true,
            date: { gte: startDate, lte: endDate },
          },
          select: { id: true },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    })

    const result = students.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      belt: s.belt,
      isActive: s.isActive,
      attendanceCount: s.attendances.length,
    }))

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[ANNUAL ATTENDANCE] Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch annual attendance" },
      { status: 500 }
    )
  }
}

// Made with Bob

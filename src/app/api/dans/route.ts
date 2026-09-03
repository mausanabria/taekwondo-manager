import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const BLACK_BELTS = ["negro", "negro-1dan", "negro-2dan", "negro-3dan", "negro-4dan", "negro-5dan"]

/**
 * GET /api/dans
 * Returns all students with black belt, with their dan records.
 */
export async function GET(_request: NextRequest) {
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

    const students = await prisma.student.findMany({
      where: {
        schoolId: school.id,
        belt: { in: BLACK_BELTS },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        belt: true,
        isActive: true,
        danRecords: {
          orderBy: { dan: "asc" },
          select: {
            id: true,
            dan: true,
            examDate: true,
            ar: true,
            danId: true,
            notes: true,
          },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    })

    return NextResponse.json(students)
  } catch (error: any) {
    console.error("[DANS GET]", error)
    return NextResponse.json({ error: error.message || "Error" }, { status: 500 })
  }
}

/**
 * POST /api/dans
 * Create or update a dan record for a student.
 * Body: { studentId, dan, examDate?, ar?, danId?, notes? }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { id, studentId, dan, examDate, ar, danId, notes } = body

    if (!studentId || !dan || dan < 1 || dan > 9) {
      return NextResponse.json(
        { error: "studentId y dan (1-9) son requeridos" },
        { status: 400 }
      )
    }

    // Verify student belongs to school
    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId: school.id },
    })
    if (!student) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })
    }

    const updateData = {
      examDate: examDate ? new Date(examDate) : null,
      ar: ar || null,
      danId: danId || null,
      notes: notes || null,
    }

    let record
    if (id) {
      // Edit existing record by PK — safe, no dan confusion
      record = await prisma.danRecord.update({
        where: { id },
        data: updateData,
      })
    } else {
      // Create new record
      record = await prisma.danRecord.create({
        data: {
          studentId,
          dan,
          ...updateData,
          createdById: session.user.id,
        },
      })
    }

    return NextResponse.json(record, { status: 201 })
  } catch (error: any) {
    console.error("[DANS POST]", error)
    return NextResponse.json({ error: error.message || "Error" }, { status: 500 })
  }
}

// Made with Bob

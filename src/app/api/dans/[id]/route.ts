import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * DELETE /api/dans/[id]
 * Delete a specific dan record.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify record belongs to a student of this school
    const record = await prisma.danRecord.findFirst({
      where: {
        id: params.id,
        student: { schoolId: school.id },
      },
    })

    if (!record) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 })
    }

    await prisma.danRecord.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[DANS DELETE]", error)
    return NextResponse.json({ error: error.message || "Error" }, { status: 500 })
  }
}

// Made with Bob

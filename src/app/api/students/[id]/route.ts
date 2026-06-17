import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { studentService } from "@/services/studentService"
import { updateStudentSchema } from "@/lib/validations/student"

// GET /api/students/[id] - Get a specific student
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const schoolId = session.user.schoolId
    
    if (!schoolId) {
      return NextResponse.json(
        { error: "No school associated with user" },
        { status: 400 }
      )
    }

    const student = await studentService.getStudentById(params.id, schoolId)

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(student)
  } catch (error: any) {
    console.error("Error fetching student:", error)
    
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    )
  }
}

// PUT /api/students/[id] - Update a student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      console.log("❌ Unauthorized: No session found")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const schoolId = session.user.schoolId
    
    if (!schoolId) {
      console.log("❌ No school associated with user")
      return NextResponse.json(
        { error: "No school associated with user" },
        { status: 400 }
      )
    }

    const body = await request.json()
    console.log("📝 Updating student with data:", JSON.stringify(body, null, 2))

    // Validate request body using official schema
    const validationResult = updateStudentSchema.safeParse(body)
    
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      console.error("❌ Validation errors:", formattedErrors)
      
      return NextResponse.json(
        {
          error: "Validation failed",
          details: formattedErrors
        },
        { status: 400 }
      )
    }

    console.log("✅ Validation passed")
    const data = validationResult.data

    // Convert birthDate and inactiveDate strings to Date if provided
    const updateData: any = { ...data }
    if (data.birthDate !== undefined) {
      updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null
    }
    if (data.inactiveDate !== undefined) {
      updateData.inactiveDate = data.inactiveDate ? new Date(data.inactiveDate) : null
    }

    console.log("🔄 Calling studentService.updateStudent for ID:", params.id)
    const student = await studentService.updateStudent(
      params.id,
      updateData,
      schoolId
    )

    console.log("✅ Student updated successfully:", student.id)
    return NextResponse.json(student)
  } catch (error: any) {
    console.error("❌ Error updating student:", error)
    
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to update student" },
      { status: 500 }
    )
  }
}

// DELETE /api/students/[id] - Delete a student
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const schoolId = session.user.schoolId
    
    if (!schoolId) {
      return NextResponse.json(
        { error: "No school associated with user" },
        { status: 400 }
      )
    }

    await studentService.deleteStudent(params.id, schoolId)

    return NextResponse.json(
      { message: "Student deleted successfully" },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error deleting student:", error)
    
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    )
  }
}

// Made with Bob
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { studentService } from "@/services/studentService"
import { createStudentSchema } from "@/lib/validations/student"

// GET /api/students - Get all students for the authenticated user's school
export async function GET(request: NextRequest) {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const isActiveParam = searchParams.get("isActive")
    const belt = searchParams.get("belt")
    const search = searchParams.get("search")

    const filters: any = {}
    
    if (isActiveParam !== null) {
      filters.isActive = isActiveParam === "true"
    }
    
    if (belt) {
      filters.belt = belt
    }
    
    if (search) {
      filters.search = search
    }

    const students = await studentService.getAllStudents(schoolId, filters)

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    )
  }
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    
    // Log received data for debugging
    console.log("📝 Creating student with data:", JSON.stringify(body, null, 2))

    // Validate request body
    const validationResult = createStudentSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.error("❌ Validation failed:", validationResult.error.errors)
      
      // Format validation errors for better user experience
      const formattedErrors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return NextResponse.json(
        {
          error: "Validation failed",
          details: formattedErrors,
          rawErrors: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Convert birthDate and inactiveDate strings to Date if provided
    const studentData = {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      inactiveDate: data.inactiveDate ? new Date(data.inactiveDate) : null,
      schoolId
    }
    
    console.log("✅ Validation passed, creating student...")

    const student = await studentService.createStudent(studentData)
    
    console.log("✅ Student created successfully:", student.id)

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error("❌ Error creating student:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create student" },
      { status: 500 }
    )
  }
}

// Made with Bob
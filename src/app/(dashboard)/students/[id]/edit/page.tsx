"use client"

import { useState, useEffect } from "react"
import { Student } from "@/types"
import { StudentForm, StudentFormData } from "@/components/students/StudentForm"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

export default function EditStudentPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudent()
  }, [studentId])

  const fetchStudent = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/students/${studentId}`)

      if (!response.ok) {
        throw new Error("Error al cargar el alumno")
      }

      const data = await response.json()
      setStudent(data)
    } catch (err: any) {
      setError(err.message || "Error al cargar el alumno")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: StudentFormData) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const result = await response.json()
        
        // Handle detailed validation errors
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details
            .map((err: any) => `${err.field}: ${err.message}`)
            .join(', ')
          throw new Error(errorMessages)
        }
        
        throw new Error(result.error || "Error al actualizar el alumno")
      }

      // Redirect to student detail page on success
      router.push(`/students/${studentId}`)
      router.refresh()
    } catch (error: any) {
      console.error("Error updating student:", error)
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/students/${studentId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando alumno...</p>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error || "Alumno no encontrado"}</span>
          <div className="mt-4">
            <Link
              href="/students"
              className="text-sm underline"
            >
              Volver a la lista
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/students/${studentId}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver al detalle
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Editar Alumno</h1>
        <p className="mt-2 text-sm text-gray-600">
          Actualiza la información de {student.firstName} {student.lastName}
        </p>
      </div>

      {/* Form */}
      <StudentForm 
        student={student} 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
      />
    </div>
  )
}

// Made with Bob
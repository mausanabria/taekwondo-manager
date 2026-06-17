"use client"

import { useState } from "react"
import { StudentForm, StudentFormData } from "@/components/students/StudentForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewStudentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true)
    
    try {
      console.log("📤 Sending student data:", data)
      
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("❌ Server error:", error)
        
        // If there are validation details, format them nicely
        if (error.details && Array.isArray(error.details)) {
          const errorMessages = error.details
            .map((detail: any) => `${detail.field}: ${detail.message}`)
            .join(", ")
          throw new Error(`Validation failed: ${errorMessages}`)
        }
        
        throw new Error(error.error || "Error al crear el alumno")
      }

      console.log("✅ Student created successfully")
      
      // Redirect to students list on success
      router.push("/students")
      router.refresh()
    } catch (error: any) {
      console.error("❌ Error in handleSubmit:", error)
      setIsSubmitting(false)
      throw error
    }
  }

  const handleCancel = () => {
    router.push("/students")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/students"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver a la lista
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Alumno</h1>
        <p className="mt-2 text-sm text-gray-600">
          Completa el formulario para agregar un nuevo alumno a tu escuela
        </p>
      </div>

      {/* Form */}
      <StudentForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  )
}

// Made with Bob
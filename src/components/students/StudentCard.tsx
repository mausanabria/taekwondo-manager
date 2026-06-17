"use client"

import { Student } from "@/types"
import { Pencil, Eye, Phone, Mail, UserCheck, UserX } from "lucide-react"
import Link from "next/link"

interface StudentCardProps {
  student: Student
}

export function StudentCard({ student }: StudentCardProps) {
  const calculateAge = (birthDate: Date | null): number | null => {
    if (!birthDate) return null
    
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const getBeltColor = (belt: string | null) => {
    const colors: Record<string, string> = {
      blanco: "bg-gray-100 text-gray-800",
      amarillo: "bg-yellow-100 text-yellow-800",
      verde: "bg-green-100 text-green-800",
      azul: "bg-blue-100 text-blue-800",
      rojo: "bg-red-100 text-red-800",
      negro: "bg-gray-900 text-white"
    }
    return colors[belt || ""] || "bg-gray-100 text-gray-800"
  }

  const age = calculateAge(student.birthDate ?? null)
  const fullName = `${student.firstName} ${student.lastName}`

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Header with status */}
      <div className={`h-2 ${student.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
      
      <div className="p-6">
        {/* Name and Belt */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {fullName}
            </h3>
            {student.belt && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBeltColor(student.belt)}`}>
                {student.belt.charAt(0).toUpperCase() + student.belt.slice(1)}
              </span>
            )}
          </div>
          <div className="ml-4">
            {student.isActive ? (
              <UserCheck className="w-6 h-6 text-green-500" />
            ) : (
              <UserX className="w-6 h-6 text-red-500" />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-4">
          {age && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Edad:</span> {age} años
            </p>
          )}
          
          {student.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              {student.phone}
            </div>
          )}
          
          {student.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              {student.email}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <Link
            href={`/students/${student.id}`}
            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Eye className="w-4 h-4 mr-1" />
            Ver
          </Link>
          <Link
            href={`/students/${student.id}/edit`}
            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Editar
          </Link>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
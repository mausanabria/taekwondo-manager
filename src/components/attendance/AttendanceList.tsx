"use client"

import { useState } from "react"
import { Check, X, Search, User } from "lucide-react"

interface Student {
  id: string
  firstName: string
  lastName: string
  belt?: string | null
}

interface Attendance {
  id: string
  wasPresent: boolean
  notes?: string | null
}

interface StudentWithAttendance {
  student: Student
  attendance: Attendance | null
}

interface AttendanceListProps {
  studentsWithAttendance: StudentWithAttendance[]
  onAttendanceChange: (studentId: string, wasPresent: boolean) => void
  disabled?: boolean
}

export default function AttendanceList({
  studentsWithAttendance,
  onAttendanceChange,
  disabled = false
}: AttendanceListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter students based on search term
  const filteredStudents = studentsWithAttendance.filter(({ student }) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase())
  })

  // Get attendance status for a student
  const getAttendanceStatus = (attendance: Attendance | null) => {
    if (!attendance) return "unmarked"
    return attendance.wasPresent ? "present" : "absent"
  }

  // Get status color classes
  const getStatusClasses = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-50 border-green-200"
      case "absent":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar alumno..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Students list */}
      <div className="space-y-2">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? "No se encontraron alumnos" : "No hay alumnos inscritos en este horario"}
          </div>
        ) : (
          filteredStudents.map(({ student, attendance }) => {
            const status = getAttendanceStatus(attendance)
            const isPresent = status === "present"
            const isAbsent = status === "absent"

            return (
              <div
                key={student.id}
                className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${getStatusClasses(
                  status
                )}`}
              >
                {/* Student info */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </p>
                    {student.belt && (
                      <p className="text-sm text-gray-500 capitalize">
                        Cinturón {student.belt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Attendance buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => onAttendanceChange(student.id, true)}
                    disabled={disabled}
                    className={`p-2 rounded-lg transition-colors ${
                      isPresent
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-400 hover:bg-green-50 hover:text-green-500 border border-gray-300"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    title="Marcar presente"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onAttendanceChange(student.id, false)}
                    disabled={disabled}
                    className={`p-2 rounded-lg transition-colors ${
                      isAbsent
                        ? "bg-red-500 text-white"
                        : "bg-white text-gray-400 hover:bg-red-50 hover:text-red-500 border border-gray-300"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    title="Marcar ausente"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary */}
      {filteredStudents.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-6">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-lg font-semibold text-gray-900">
                {filteredStudents.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Presentes</p>
              <p className="text-lg font-semibold text-green-600">
                {
                  filteredStudents.filter(
                    ({ attendance }) => attendance?.wasPresent
                  ).length
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ausentes</p>
              <p className="text-lg font-semibold text-red-600">
                {
                  filteredStudents.filter(
                    ({ attendance }) =>
                      attendance && !attendance.wasPresent
                  ).length
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sin marcar</p>
              <p className="text-lg font-semibold text-gray-600">
                {
                  filteredStudents.filter(({ attendance }) => !attendance)
                    .length
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Made with Bob

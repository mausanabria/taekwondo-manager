"use client"

import { useState, useEffect } from "react"
import { Loader2, GraduationCap, Calendar, TrendingUp, Users } from "lucide-react"
import { getBeltLabel, getBeltColorClasses } from "@/lib/belt-utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

interface Student {
  id: string
  firstName: string
  lastName: string
  belt: string | null
  beltOrder: number
  attendanceCount: number
  lastBeltChangeDate: string
  isFirstBelt: boolean
  scheduleName: string
  scheduleTime: string
  createdAt: string
}

interface Schedule {
  id: string
  name: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface ExamGroup {
  schedule: Schedule
  students: Student[]
}

const DAYS_OF_WEEK = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
]

export default function ExamsPage() {
  const [examData, setExamData] = useState<ExamGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExamData()
  }, [])

  const fetchExamData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/exams")

      if (!response.ok) {
        throw new Error("Error al cargar los datos de exámenes")
      }

      const data = await response.json()
      setExamData(data)
    } catch (err: any) {
      setError(err.message || "Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: es })
  }

  const getDaysSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando datos de exámenes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={fetchExamData}
            className="mt-2 text-sm underline"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    )
  }

  const totalStudents = examData.reduce((sum, group) => sum + group.students.length, 0)
  const uniqueStudents = new Set(examData.flatMap(group => group.students.map(s => s.id))).size

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              Exámenes y Progreso
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Seguimiento de asistencias desde el último cambio de graduación
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Total Alumnos</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">
                {uniqueStudents}
              </div>
            </div>
            <Users className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Clases Activas</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">
                {examData.length}
              </div>
            </div>
            <Calendar className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Inscripciones</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">
                {totalStudents}
              </div>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Exam Groups by Schedule */}
      {examData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay datos disponibles</h3>
          <p className="mt-1 text-sm text-gray-500">
            No hay alumnos activos inscritos en horarios.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {examData.map((group) => (
            <div key={group.schedule.id} className="bg-white shadow rounded-lg overflow-hidden">
              {/* Schedule Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {group.schedule.name}
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {DAYS_OF_WEEK[group.schedule.dayOfWeek]} • {group.schedule.startTime} - {group.schedule.endTime}
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <p className="text-white text-sm font-medium">
                      {group.students.length} alumno{group.students.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Alumno
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Graduación Actual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asistencias
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Desde
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Días Transcurridos
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {group.students.map((student) => {
                      const daysSince = getDaysSince(student.lastBeltChangeDate)
                      
                      return (
                        <tr key={`${group.schedule.id}-${student.id}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.belt ? (
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getBeltColorClasses(student.belt)}`}>
                                {getBeltLabel(student.belt)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">Sin cinturón</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                              <span className="text-lg font-bold text-green-600">
                                {student.attendanceCount}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">clases</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(student.lastBeltChangeDate)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {student.isFirstBelt ? "Fecha de ingreso" : "Último cambio"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {daysSince} día{daysSince !== 1 ? 's' : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/students/${student.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Ver perfil
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Información sobre el contador de asistencias
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>El contador muestra las asistencias desde el último cambio de graduación</li>
                <li>Si el alumno nunca cambió de graduación, cuenta desde su fecha de ingreso</li>
                <li>Al subir de graduación, el contador se reinicia automáticamente</li>
                <li>Al bajar de graduación (corrección), el contador se restaura al valor anterior</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
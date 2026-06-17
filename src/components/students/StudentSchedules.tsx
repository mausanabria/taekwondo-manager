"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, DollarSign, Loader2 } from "lucide-react"
import Link from "next/link"

interface Schedule {
  id: string
  name: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface StudentScheduleEnrollment {
  id: string
  weeklyFrequency: number
  monthlyFee?: number | null
  notes?: string | null
  schedule: Schedule
}

interface StudentSchedulesProps {
  studentId: string
}

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado"
]

export function StudentSchedules({ studentId }: StudentSchedulesProps) {
  const [schedules, setSchedules] = useState<StudentScheduleEnrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSchedules()
  }, [studentId])

  const fetchSchedules = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/students/${studentId}/schedules`)
      if (!response.ok) {
        throw new Error("Error al cargar los horarios")
      }

      const data = await response.json()
      setSchedules(data)
    } catch (err: any) {
      setError(err.message || "Error al cargar los horarios")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Horarios Inscritos</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Horarios Inscritos</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    )
  }

  if (schedules.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Horarios Inscritos</h2>
        <p className="text-sm text-gray-500">
          Este alumno no está inscrito en ningún horario actualmente.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Horarios Inscritos ({schedules.length})
      </h2>
      <div className="space-y-4">
        {schedules.map((enrollment) => {
          const schedule = enrollment.schedule
          const feeDisplay = enrollment.monthlyFee 
            ? `$${Number(enrollment.monthlyFee).toLocaleString('es-AR')}/mes`
            : "Cuota general"

          return (
            <Link
              key={enrollment.id}
              href={`/schedules/${schedule.id}`}
              className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600">
                    {schedule.name}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{DAY_NAMES[schedule.dayOfWeek]}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{schedule.startTime} - {schedule.endTime}</span>
                    </div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                    {enrollment.weeklyFrequency}x/semana
                  </div>
                  <div className="mt-2 flex items-center justify-end text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-medium">{feeDisplay}</span>
                  </div>
                </div>
              </div>
              {enrollment.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    📝 {enrollment.notes}
                  </p>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// Made with Bob
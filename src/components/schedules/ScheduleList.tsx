"use client"

import { useState } from "react"
import { Schedule } from "@/types"
import { Pencil, Trash2, Eye, Clock, Users, Calendar } from "lucide-react"
import Link from "next/link"

interface ScheduleWithCount extends Schedule {
  _count?: {
    enrollments: number
  }
}

interface ScheduleListProps {
  schedules: ScheduleWithCount[]
  onDelete?: (id: string) => void
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

const DAY_NAMES_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

// Helper function to format multiple days
function formatDaysOfWeek(daysOfWeek: number[]): string {
  if (!daysOfWeek || daysOfWeek.length === 0) {
    return 'Sin días'
  }

  const sortedDays = [...daysOfWeek].sort()
  
  if (sortedDays.length === 1) {
    return DAY_NAMES[sortedDays[0]]
  }

  return sortedDays.map(d => DAY_NAMES_SHORT[d]).join(', ')
}

export function ScheduleList({ schedules, onDelete }: ScheduleListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el horario "${name}"?`)) {
      return
    }

    setDeletingId(id)
    try {
      if (onDelete) {
        await onDelete(id)
      }
    } finally {
      setDeletingId(null)
    }
  }

  // Group schedules by day - now considering multiple days per schedule
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    // Get days from daysOfWeek array, fallback to dayOfWeek for compatibility
    const days = (schedule as any).daysOfWeek && (schedule as any).daysOfWeek.length > 0
      ? (schedule as any).daysOfWeek
      : [schedule.dayOfWeek]
    
    // Add schedule to each of its days
    days.forEach((day: number) => {
      if (!acc[day]) {
        acc[day] = []
      }
      acc[day].push(schedule)
    })
    
    return acc
  }, {} as Record<number, ScheduleWithCount[]>)

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay horarios</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza agregando un nuevo horario de clase.
        </p>
        <div className="mt-6">
          <Link
            href="/schedules/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Agregar Horario
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Group by day */}
      {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => {
        const daySchedules = schedulesByDay[dayOfWeek]
        if (!daySchedules || daySchedules.length === 0) return null

        return (
          <div key={dayOfWeek} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Day Header */}
            <div className="bg-blue-50 px-6 py-3 border-b border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900">
                {DAY_NAMES[dayOfWeek]}
              </h3>
            </div>

            {/* Schedules for this day */}
            <div className="divide-y divide-gray-200">
              {daySchedules.map((schedule) => {
                const enrolledCount = schedule._count?.enrollments || 0
                const capacityText = schedule.capacity 
                  ? `${enrolledCount}/${schedule.capacity}`
                  : `${enrolledCount}`

                return (
                  <div key={schedule.id} className="p-6 hover:bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      {/* Schedule Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {schedule.name}
                          </h4>
                          {!schedule.isActive && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Inactivo
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{capacityText} alumnos</span>
                          </div>
                        </div>
                        
                        {/* Show all days if schedule has multiple days */}
                        {((schedule as any).daysOfWeek && (schedule as any).daysOfWeek.length > 1) && (
                          <div className="mt-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <div className="flex flex-wrap gap-1">
                              {(schedule as any).daysOfWeek.map((day: number) => (
                                <span
                                  key={day}
                                  className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700"
                                >
                                  {DAY_NAMES_SHORT[day]}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <Link
                          href={`/schedules/${schedule.id}`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Link>
                        <Link
                          href={`/schedules/${schedule.id}/edit`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(schedule.id, schedule.name)}
                          disabled={deletingId === schedule.id}
                          className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Made with Bob

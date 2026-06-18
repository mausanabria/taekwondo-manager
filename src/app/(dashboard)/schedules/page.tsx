"use client"

import { useState, useEffect } from "react"
import { Schedule } from "@/types"
import { ScheduleList } from "@/components/schedules/ScheduleList"
import { WeeklyCalendar } from "@/components/schedules/WeeklyCalendar"
import { Plus, Calendar, List, Loader2 } from "lucide-react"
import Link from "next/link"

interface ScheduleWithCount extends Schedule {
  _count?: {
    enrollments: number
  }
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduleWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch("/api/schedules")
      
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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el horario")
      }

      // Refresh the list
      await fetchSchedules()
    } catch (err: any) {
      alert(err.message || "Error al eliminar el horario")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando horarios...</p>
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
            onClick={fetchSchedules}
            className="mt-2 text-sm underline"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    )
  }

  // Group schedules by day
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.dayOfWeek]) {
      acc[schedule.dayOfWeek] = []
    }
    acc[schedule.dayOfWeek].push(schedule)
    return acc
  }, {} as Record<number, ScheduleWithCount[]>)

  // Calculate total enrolled students
  const totalEnrolled = schedules.reduce((sum, schedule) => {
    return sum + (schedule._count?.enrollments || 0)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Horarios de Clases</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona los horarios de tu escuela de taekwondo
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/schedules/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Horario
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Horarios</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {schedules.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Alumnos Inscritos</div>
          <div className="mt-2 text-3xl font-semibold text-blue-600">
            {totalEnrolled}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Días con Clases</div>
          <div className="mt-2 text-3xl font-semibold text-green-600">
            {Object.keys(schedulesByDay).length}
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6 flex justify-end">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
              viewMode === "list"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <List className="w-5 h-5 inline mr-2" />
            Lista
          </button>
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b ${
              viewMode === "calendar"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            Calendario
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <ScheduleList schedules={schedules} onDelete={handleDelete} />
      ) : (
        <WeeklyCalendar schedules={schedules} />
      )}
    </div>
  )
}

// Made with Bob

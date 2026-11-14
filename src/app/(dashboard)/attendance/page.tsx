"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, BarChart2, User } from "lucide-react"
import { format } from "date-fns"
import ScheduleAttendanceBlock from "@/components/attendance/ScheduleAttendanceBlock"

interface Schedule {
  id: string
  name: string
  dayOfWeek: number
  daysOfWeek?: number[]
  startTime: string
  endTime: string
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

export default function AttendancePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loadingSchedules, setLoadingSchedules] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  )

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const response = await fetch("/api/schedules")
        if (!response.ok) throw new Error("Failed to load schedules")
        setSchedules(await response.json())
      } catch (e) {
        console.error("Error loading schedules:", e)
        setError("Error al cargar los horarios")
      } finally {
        setLoadingSchedules(false)
      }
    }
    loadSchedules()
  }, [])

  // Schedules that run on the selected date's weekday, ordered by start time
  const selectedDayOfWeek = new Date(selectedDate + "T00:00:00").getDay()
  const schedulesForDay = schedules
    .filter((schedule) =>
      schedule.daysOfWeek && schedule.daysOfWeek.length > 0
        ? schedule.daysOfWeek.includes(selectedDayOfWeek)
        : schedule.dayOfWeek === selectedDayOfWeek
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Registro de Asistencia
          </h1>
          <p className="text-gray-600 mt-2">
            Marca la asistencia de los alumnos por fecha
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/attendance/student-summary"
            className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <User className="h-5 w-5" />
            <span>Resumen por alumno</span>
          </Link>
          <Link
            href="/attendance/annual"
            className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart2 className="h-5 w-5" />
            <span>Resumen anual</span>
          </Link>
        </div>
      </div>

      {/* Date filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fecha
        </label>
        <div className="relative max-w-sm">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            max={format(new Date(), "yyyy-MM-dd")}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {DAY_NAMES[selectedDayOfWeek]}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}

      {/* One block per class of the day */}
      {loadingSchedules ? (
        <div className="text-center py-8 text-gray-500">
          Cargando horarios...
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay horarios disponibles
          </h3>
          <p className="text-gray-600">
            Crea un horario primero para poder registrar asistencias
          </p>
        </div>
      ) : schedulesForDay.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center text-amber-600">
          No hay horarios para {DAY_NAMES[selectedDayOfWeek]}. Selecciona otra
          fecha.
        </div>
      ) : (
        schedulesForDay.map((schedule) => (
          <ScheduleAttendanceBlock
            key={schedule.id}
            schedule={schedule}
            date={selectedDate}
          />
        ))
      )}
    </div>
  )
}

// Made with Bob

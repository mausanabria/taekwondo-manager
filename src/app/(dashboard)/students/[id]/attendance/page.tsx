"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import AttendanceStats from "@/components/attendance/AttendanceStats"

interface Student {
  id: string
  firstName: string
  lastName: string
  belt?: string | null
  email?: string | null
  phone?: string | null
}

interface Schedule {
  id: string
  name: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface AttendanceRecord {
  id: string
  date: Date
  wasPresent: boolean
  notes?: string | null
  schedule: Schedule
}

interface AttendanceStats {
  totalAttendances: number
  totalPresent: number
  totalAbsent: number
  attendanceRate: number
  currentStreak: number
  longestStreak: number
}

export default function StudentAttendancePage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudentData()
    loadAttendances()
    loadStats()
  }, [studentId, selectedMonth])

  const loadStudentData = async () => {
    try {
      const response = await fetch(`/api/students/${studentId}`)
      if (!response.ok) throw new Error("Failed to load student")
      const data = await response.json()
      setStudent(data)
    } catch (error) {
      console.error("Error loading student:", error)
    }
  }

  const loadAttendances = async () => {
    setLoading(true)
    try {
      const year = selectedMonth.getFullYear()
      const month = selectedMonth.getMonth() + 1

      const response = await fetch(
        `/api/attendance/student/${studentId}?year=${year}&month=${month}`
      )
      if (!response.ok) throw new Error("Failed to load attendances")
      const data = await response.json()
      setAttendances(data)
    } catch (error) {
      console.error("Error loading attendances:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/attendance/stats/${studentId}`)
      if (!response.ok) throw new Error("Failed to load stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const handlePreviousMonth = () => {
    setSelectedMonth(
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1)
    )
  }

  const handleNextMonth = () => {
    const nextMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      1
    )
    const today = new Date()
    if (nextMonth <= today) {
      setSelectedMonth(nextMonth)
    }
  }

  const getAttendanceForDate = (date: Date) => {
    return attendances.find((a) =>
      isSameDay(new Date(a.date), date)
    )
  }

  const renderCalendar = () => {
    const monthStart = startOfMonth(selectedMonth)
    const monthEnd = endOfMonth(selectedMonth)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = monthStart.getDay()

    // Create array with empty slots for days before month starts
    const calendarDays = Array(firstDayOfMonth).fill(null).concat(days)

    return (
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-600 py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const attendance = getAttendanceForDate(day)
          const isToday = isSameDay(day, new Date())
          const isCurrentMonth = isSameMonth(day, selectedMonth)

          return (
            <div
              key={day.toISOString()}
              className={`aspect-square p-2 border rounded-lg ${
                !isCurrentMonth
                  ? "bg-gray-50 text-gray-400"
                  : attendance?.wasPresent
                  ? "bg-green-100 border-green-300"
                  : attendance && !attendance.wasPresent
                  ? "bg-red-100 border-red-300"
                  : "bg-white border-gray-200"
              } ${isToday ? "ring-2 ring-blue-500" : ""}`}
            >
              <div className="text-sm font-medium text-center">
                {format(day, "d")}
              </div>
              {attendance && (
                <div className="text-center mt-1">
                  <span
                    className={`text-xs ${
                      attendance.wasPresent ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {attendance.wasPresent ? "✓" : "✗"}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push(`/students/${studentId}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver al perfil</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          Asistencias de {student.firstName} {student.lastName}
        </h1>
        {student.belt && (
          <p className="text-gray-600 mt-2 capitalize">
            Cinturón {student.belt}
          </p>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <AttendanceStats
          totalAttendances={stats.totalAttendances}
          totalPresent={stats.totalPresent}
          totalAbsent={stats.totalAbsent}
          attendanceRate={stats.attendanceRate}
          currentStreak={stats.currentStreak}
          longestStreak={stats.longestStreak}
        />
      )}

      {/* Calendar */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Calendario de Asistencias
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePreviousMonth}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              ← Anterior
            </button>
            <span className="text-lg font-medium text-gray-900">
              {format(selectedMonth, "MMMM yyyy", { locale: es })}
            </span>
            <button
              onClick={handleNextMonth}
              disabled={
                selectedMonth.getMonth() === new Date().getMonth() &&
                selectedMonth.getFullYear() === new Date().getFullYear()
              }
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Cargando calendario...
          </div>
        ) : (
          <>
            {renderCalendar()}

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span className="text-sm text-gray-600">Presente</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span className="text-sm text-gray-600">Ausente</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                <span className="text-sm text-gray-600">Sin registro</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent attendances list */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Asistencias del Mes
        </h2>

        {attendances.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p>No hay registros de asistencia para este mes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {attendances.map((attendance) => (
              <div
                key={attendance.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  attendance.wasPresent
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {format(new Date(attendance.date), "EEEE, d 'de' MMMM", {
                      locale: es
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {attendance.schedule.name} -{" "}
                    {attendance.schedule.startTime}
                  </p>
                  {attendance.notes && (
                    <p className="text-sm text-gray-500 mt-1">
                      {attendance.notes}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    attendance.wasPresent
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {attendance.wasPresent ? "Presente" : "Ausente"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Made with Bob
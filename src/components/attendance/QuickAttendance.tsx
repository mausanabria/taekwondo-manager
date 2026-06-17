"use client"

import { useState, useEffect } from "react"
import { Calendar, Check, X, Clock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Schedule {
  id: string
  name: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface Student {
  id: string
  firstName: string
  lastName: string
}

interface StudentWithAttendance {
  student: Student
  attendance: { wasPresent: boolean } | null
}

export default function QuickAttendance() {
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([])
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("")
  const [students, setStudents] = useState<StudentWithAttendance[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string>("")

  const today = new Date()
  const todayDayOfWeek = today.getDay()

  useEffect(() => {
    loadTodaySchedules()
  }, [])

  useEffect(() => {
    if (selectedScheduleId) {
      loadStudents()
    }
  }, [selectedScheduleId])

  const loadTodaySchedules = async () => {
    try {
      const response = await fetch("/api/schedules")
      if (!response.ok) throw new Error("Failed to load schedules")
      const allSchedules = await response.json()
      
      // Filter schedules for today - check both dayOfWeek and daysOfWeek array
      const todaySchedules = allSchedules.filter((s: any) => {
        const daysOfWeek = s.daysOfWeek
        if (daysOfWeek && daysOfWeek.length > 0) {
          return daysOfWeek.includes(todayDayOfWeek)
        }
        return s.dayOfWeek === todayDayOfWeek
      })
      
      setTodaySchedules(todaySchedules)
      if (todaySchedules.length > 0) {
        setSelectedScheduleId(todaySchedules[0].id)
      }
    } catch (error) {
      console.error("Error loading schedules:", error)
    }
  }

  const loadStudents = async () => {
    if (!selectedScheduleId) return

    setLoading(true)
    try {
      // Get enrolled students
      const studentsResponse = await fetch(
        `/api/schedules/${selectedScheduleId}/students`
      )
      if (!studentsResponse.ok) throw new Error("Failed to load students")
      const enrollments = await studentsResponse.json()

      // Get today's attendances
      const todayStr = format(today, "yyyy-MM-dd")
      const attendanceResponse = await fetch(
        `/api/attendance/schedule/${selectedScheduleId}?date=${todayStr}`
      )
      
      let attendances = []
      if (attendanceResponse.ok) {
        attendances = await attendanceResponse.json()
      }

      // Create attendance map
      const attendanceMap = new Map(
        attendances.map((a: any) => [a.studentId, a])
      )

      // Combine data
      const combined = enrollments.map((enrollment: any) => ({
        student: enrollment.student,
        attendance: attendanceMap.get(enrollment.student.id) || null
      }))

      setStudents(combined)
    } catch (error) {
      console.error("Error loading students:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickMark = async (studentId: string, wasPresent: boolean) => {
    setSaving(true)
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: selectedScheduleId,
          studentId,
          date: format(today, "yyyy-MM-dd"),
          wasPresent
        })
      })

      if (!response.ok) throw new Error("Failed to mark attendance")

      // Update local state
      setStudents((prev) =>
        prev.map((item) =>
          item.student.id === studentId
            ? { ...item, attendance: { wasPresent } }
            : item
        )
      )

      setMessage("Asistencia marcada")
      setTimeout(() => setMessage(""), 2000)
    } catch (error) {
      console.error("Error marking attendance:", error)
      setMessage("Error al marcar asistencia")
      setTimeout(() => setMessage(""), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (todaySchedules.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Asistencia Rápida
          </h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p>No hay clases programadas para hoy</p>
          <p className="text-sm mt-1">
            {format(today, "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Asistencia Rápida
          </h3>
        </div>
        <span className="text-sm text-gray-500">
          {format(today, "d 'de' MMMM", { locale: es })}
        </span>
      </div>

      {/* Schedule selector */}
      {todaySchedules.length > 1 && (
        <div className="mb-4">
          <select
            value={selectedScheduleId}
            onChange={(e) => setSelectedScheduleId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {todaySchedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {schedule.name} - {schedule.startTime}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="mb-4 p-2 bg-blue-50 text-blue-700 text-sm rounded-lg text-center">
          {message}
        </div>
      )}

      {/* Students list */}
      {loading ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          Cargando alumnos...
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          No hay alumnos inscritos en este horario
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {students.map(({ student, attendance }) => (
            <div
              key={student.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                attendance?.wasPresent
                  ? "bg-green-50 border-green-200"
                  : attendance && !attendance.wasPresent
                  ? "bg-red-50 border-red-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <span className="text-sm font-medium text-gray-900">
                {student.firstName} {student.lastName}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleQuickMark(student.id, true)}
                  disabled={saving}
                  className={`p-1.5 rounded transition-colors ${
                    attendance?.wasPresent
                      ? "bg-green-500 text-white"
                      : "bg-white text-gray-400 hover:bg-green-50 hover:text-green-500 border border-gray-300"
                  }`}
                  title="Presente"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleQuickMark(student.id, false)}
                  disabled={saving}
                  className={`p-1.5 rounded transition-colors ${
                    attendance && !attendance.wasPresent
                      ? "bg-red-500 text-white"
                      : "bg-white text-gray-400 hover:bg-red-50 hover:text-red-500 border border-gray-300"
                  }`}
                  title="Ausente"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {students.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Total: {students.length} alumnos
          </span>
          <div className="flex items-center space-x-4">
            <span className="text-green-600">
              ✓ {students.filter((s) => s.attendance?.wasPresent).length}
            </span>
            <span className="text-red-600">
              ✗{" "}
              {
                students.filter((s) => s.attendance && !s.attendance.wasPresent)
                  .length
              }
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Made with Bob
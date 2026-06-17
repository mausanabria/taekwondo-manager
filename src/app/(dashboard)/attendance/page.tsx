"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Calendar, Save, CheckCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import AttendanceList from "@/components/attendance/AttendanceList"

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

export default function AttendancePage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  )
  const [hasPreselected, setHasPreselected] = useState(false)
  const [studentsWithAttendance, setStudentsWithAttendance] = useState<
    StudentWithAttendance[]
  >([])
  const [attendanceChanges, setAttendanceChanges] = useState<
    Map<string, boolean>
  >(new Map())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  // Load schedules on mount
  useEffect(() => {
    loadSchedules()
  }, [])

  // Preselect schedule from URL parameter when schedules are loaded
  useEffect(() => {
    if (schedules.length > 0 && !hasPreselected) {
      const scheduleParam = searchParams.get('schedule')
      if (scheduleParam) {
        // Check if the schedule exists and is valid for today
        const schedule = schedules.find(s => s.id === scheduleParam)
        if (schedule) {
          const today = new Date().getDay()
          const daysOfWeek = (schedule as any).daysOfWeek
          let isValidForToday = false
          
          if (daysOfWeek && daysOfWeek.length > 0) {
            isValidForToday = daysOfWeek.includes(today)
          } else {
            isValidForToday = schedule.dayOfWeek === today
          }
          
          if (isValidForToday) {
            setSelectedScheduleId(scheduleParam)
          }
        }
      }
      setHasPreselected(true)
    }
  }, [schedules, searchParams, hasPreselected])

  // Load students when schedule or date changes
  useEffect(() => {
    if (selectedScheduleId) {
      loadStudentsWithAttendance()
    }
  }, [selectedScheduleId, selectedDate])

  // Reset selected schedule if it's not valid for the selected date
  useEffect(() => {
    if (selectedScheduleId && schedules.length > 0) {
      const selectedDayOfWeek = new Date(selectedDate + 'T00:00:00').getDay()
      const selectedSchedule = schedules.find(s => s.id === selectedScheduleId)
      
      if (selectedSchedule) {
        const daysOfWeek = (selectedSchedule as any).daysOfWeek
        let isValidForDate = false
        
        if (daysOfWeek && daysOfWeek.length > 0) {
          isValidForDate = daysOfWeek.includes(selectedDayOfWeek)
        } else {
          isValidForDate = selectedSchedule.dayOfWeek === selectedDayOfWeek
        }
        
        if (!isValidForDate) {
          setSelectedScheduleId("")
        }
      }
    }
  }, [selectedDate, schedules, selectedScheduleId])

  const loadSchedules = async () => {
    try {
      const response = await fetch("/api/schedules")
      if (!response.ok) throw new Error("Failed to load schedules")
      const data = await response.json()
      setSchedules(data)
      // Don't auto-select if there's a schedule parameter in URL or already selected
      const scheduleParam = searchParams.get('schedule')
      if (data.length > 0 && !selectedScheduleId && !scheduleParam) {
        setSelectedScheduleId(data[0].id)
      }
    } catch (error) {
      console.error("Error loading schedules:", error)
      showMessage("error", "Error al cargar los horarios")
    }
  }

  const loadStudentsWithAttendance = async () => {
    if (!selectedScheduleId) return

    setLoading(true)
    try {
      // Get enrolled students
      const studentsResponse = await fetch(
        `/api/schedules/${selectedScheduleId}/students`
      )
      if (!studentsResponse.ok) throw new Error("Failed to load students")
      const enrollments = await studentsResponse.json()

      // Get attendances for the selected date
      const attendanceResponse = await fetch(
        `/api/attendance/schedule/${selectedScheduleId}?date=${selectedDate}`
      )
      if (!attendanceResponse.ok)
        throw new Error("Failed to load attendances")
      const attendances = await attendanceResponse.json()

      // Create a map of student ID to attendance
      const attendanceMap = new Map(
        attendances.map((a: any) => [a.studentId, a])
      )

      // Combine students with their attendance
      const combined = enrollments.map((enrollment: any) => ({
        student: enrollment.student,
        attendance: attendanceMap.get(enrollment.student.id) || null
      }))

      setStudentsWithAttendance(combined)
      setAttendanceChanges(new Map())
    } catch (error) {
      console.error("Error loading students with attendance:", error)
      showMessage("error", "Error al cargar los datos de asistencia")
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = (studentId: string, wasPresent: boolean) => {
    const newChanges = new Map(attendanceChanges)
    newChanges.set(studentId, wasPresent)
    setAttendanceChanges(newChanges)

    // Update local state immediately for better UX
    setStudentsWithAttendance((prev) =>
      prev.map((item) =>
        item.student.id === studentId
          ? {
              ...item,
              attendance: {
                id: item.attendance?.id || "",
                wasPresent,
                notes: item.attendance?.notes || null
              }
            }
          : item
      )
    )
  }

  const handleSaveAttendances = async () => {
    if (attendanceChanges.size === 0) {
      showMessage("error", "No hay cambios para guardar")
      return
    }

    setSaving(true)
    try {
      const attendances = Array.from(attendanceChanges.entries()).map(
        ([studentId, wasPresent]) => ({
          studentId,
          wasPresent,
          notes: null
        })
      )

      const response = await fetch("/api/attendance/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: selectedScheduleId,
          date: selectedDate,
          attendances
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save attendances")
      }

      const result = await response.json()
      showMessage(
        "success",
        `Asistencias guardadas: ${result.total} registros (${result.created} nuevos, ${result.updated} actualizados)`
      )
      setAttendanceChanges(new Map())
      
      // Reload to get fresh data
      await loadStudentsWithAttendance()
    } catch (error: any) {
      console.error("Error saving attendances:", error)
      showMessage("error", error.message || "Error al guardar las asistencias")
    } finally {
      setSaving(false)
    }
  }

  const handleMarkAllPresent = () => {
    const newChanges = new Map<string, boolean>()
    studentsWithAttendance.forEach(({ student }) => {
      newChanges.set(student.id, true)
    })
    setAttendanceChanges(newChanges)

    // Update local state
    setStudentsWithAttendance((prev) =>
      prev.map((item) => ({
        ...item,
        attendance: {
          id: item.attendance?.id || "",
          wasPresent: true,
          notes: item.attendance?.notes || null
        }
      }))
    )
  }

  const handleMarkAllAbsent = () => {
    const newChanges = new Map<string, boolean>()
    studentsWithAttendance.forEach(({ student }) => {
      newChanges.set(student.id, false)
    })
    setAttendanceChanges(newChanges)

    // Update local state
    setStudentsWithAttendance((prev) =>
      prev.map((item) => ({
        ...item,
        attendance: {
          id: item.attendance?.id || "",
          wasPresent: false,
          notes: item.attendance?.notes || null
        }
      }))
    )
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const getDayName = (dayOfWeek: number) => {
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado"
    ]
    return days[dayOfWeek]
  }

  // Format multiple days for display
  const formatScheduleDays = (schedule: Schedule) => {
    const daysOfWeek = (schedule as any).daysOfWeek
    if (daysOfWeek && daysOfWeek.length > 0) {
      if (daysOfWeek.length === 1) {
        return getDayName(daysOfWeek[0])
      }
      const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      return daysOfWeek.map((d: number) => dayNames[d]).join(', ')
    }
    return getDayName(schedule.dayOfWeek)
  }

  // Filter schedules that include the selected date's day of week
  const selectedDayOfWeek = new Date(selectedDate + 'T00:00:00').getDay()
  const schedulesForDay = schedules.filter(schedule => {
    const daysOfWeek = (schedule as any).daysOfWeek
    if (daysOfWeek && daysOfWeek.length > 0) {
      return daysOfWeek.includes(selectedDayOfWeek)
    }
    return schedule.dayOfWeek === selectedDayOfWeek
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Registro de Asistencia
        </h1>
        <p className="text-gray-600 mt-2">
          Marca la asistencia de los alumnos por horario y fecha
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Schedule selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horario
            </label>
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar horario</option>
              {schedulesForDay.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.name} - {formatScheduleDays(schedule)}{" "}
                  {schedule.startTime} - {schedule.endTime}
                </option>
              ))}
            </select>
            {schedulesForDay.length === 0 && schedules.length > 0 && (
              <p className="mt-1 text-sm text-amber-600">
                No hay horarios para {getDayName(selectedDayOfWeek)}. Selecciona otra fecha.
              </p>
            )}
          </div>

          {/* Date selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={format(new Date(), "yyyy-MM-dd")}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Quick actions */}
        {selectedScheduleId && studentsWithAttendance.length > 0 && (
          <div className="mt-4 flex items-center space-x-2">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              disabled={saving}
              className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              Marcar todos presentes
            </button>
            <button
              type="button"
              onClick={handleMarkAllAbsent}
              disabled={saving}
              className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              Marcar todos ausentes
            </button>
          </div>
        )}
      </div>

      {/* Attendance list */}
      {selectedScheduleId && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando alumnos...
            </div>
          ) : (
            <>
              <AttendanceList
                studentsWithAttendance={studentsWithAttendance}
                onAttendanceChange={handleAttendanceChange}
                disabled={saving}
              />

              {/* Save button */}
              {studentsWithAttendance.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveAttendances}
                    disabled={saving || attendanceChanges.size === 0}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-5 w-5" />
                    <span>
                      {saving
                        ? "Guardando..."
                        : `Guardar asistencias${
                            attendanceChanges.size > 0
                              ? ` (${attendanceChanges.size})`
                              : ""
                          }`}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Empty state */}
      {!selectedScheduleId && schedules.length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay horarios disponibles
          </h3>
          <p className="text-gray-600">
            Crea un horario primero para poder registrar asistencias
          </p>
        </div>
      )}
    </div>
  )
}

// Made with Bob

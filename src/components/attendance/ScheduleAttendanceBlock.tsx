"use client"

import { useState, useEffect, useCallback } from "react"
import { Save, CheckCircle, AlertCircle, Clock } from "lucide-react"
import AttendanceList from "@/components/attendance/AttendanceList"

interface Schedule {
  id: string
  name: string
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

interface ScheduleAttendanceBlockProps {
  schedule: Schedule
  date: string // yyyy-MM-dd
}

export default function ScheduleAttendanceBlock({
  schedule,
  date
}: ScheduleAttendanceBlockProps) {
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

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const loadStudentsWithAttendance = useCallback(async () => {
    setLoading(true)
    try {
      const studentsResponse = await fetch(
        `/api/schedules/${schedule.id}/students`
      )
      if (!studentsResponse.ok) throw new Error("Failed to load students")
      const enrollments = await studentsResponse.json()

      const attendanceResponse = await fetch(
        `/api/attendance/schedule/${schedule.id}?date=${date}`
      )
      if (!attendanceResponse.ok) throw new Error("Failed to load attendances")
      const attendances = await attendanceResponse.json()

      const attendanceMap = new Map(
        attendances.map((a: any) => [a.studentId, a])
      )

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
  }, [schedule.id, date])

  useEffect(() => {
    loadStudentsWithAttendance()
  }, [loadStudentsWithAttendance])

  const handleAttendanceChange = (studentId: string, wasPresent: boolean) => {
    setAttendanceChanges((prev) => new Map(prev).set(studentId, wasPresent))
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

  const markAll = (wasPresent: boolean) => {
    const newChanges = new Map<string, boolean>()
    studentsWithAttendance.forEach(({ student }) => {
      newChanges.set(student.id, wasPresent)
    })
    setAttendanceChanges(newChanges)
    setStudentsWithAttendance((prev) =>
      prev.map((item) => ({
        ...item,
        attendance: {
          id: item.attendance?.id || "",
          wasPresent,
          notes: item.attendance?.notes || null
        }
      }))
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
          scheduleId: schedule.id,
          date,
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
      await loadStudentsWithAttendance()
    } catch (error: any) {
      console.error("Error saving attendances:", error)
      showMessage("error", error.message || "Error al guardar las asistencias")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
      {/* Block header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {schedule.name}
          </h2>
          <p className="text-sm text-gray-500 flex items-center mt-1">
            <Clock className="h-4 w-4 mr-1" />
            {schedule.startTime} - {schedule.endTime}
          </p>
        </div>

        {studentsWithAttendance.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => markAll(true)}
              disabled={saving}
              className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              Marcar todos presentes
            </button>
            <button
              type="button"
              onClick={() => markAll(false)}
              disabled={saving}
              className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              Marcar todos ausentes
            </button>
          </div>
        )}
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

          {studentsWithAttendance.length > 0 && (
            <div className="flex justify-end">
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
  )
}

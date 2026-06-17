"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Calendar, Filter, Download, CheckCircle, XCircle } from "lucide-react"
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
  belt?: string | null
}

interface AttendanceRecord {
  id: string
  date: Date
  wasPresent: boolean
  notes?: string | null
  student: Student
  schedule: Schedule
}

export default function AttendanceHistoryPage() {
  const { data: session } = useSession()
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  
  // Filters
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("")
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all") // all, present, absent

  useEffect(() => {
    loadSchedules()
    loadStudents()
  }, [])

  useEffect(() => {
    loadAttendances()
  }, [selectedScheduleId, selectedStudentId, startDate, endDate, statusFilter])

  const loadSchedules = async () => {
    try {
      const response = await fetch("/api/schedules")
      if (!response.ok) throw new Error("Failed to load schedules")
      const data = await response.json()
      setSchedules(data)
    } catch (error) {
      console.error("Error loading schedules:", error)
    }
  }

  const loadStudents = async () => {
    try {
      const response = await fetch("/api/students")
      if (!response.ok) throw new Error("Failed to load students")
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error("Error loading students:", error)
    }
  }

  const loadAttendances = async () => {
    setLoading(true)
    try {
      let url = "/api/attendance?"
      const params = new URLSearchParams()

      if (selectedScheduleId) params.append("scheduleId", selectedScheduleId)
      if (selectedStudentId) params.append("studentId", selectedStudentId)
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      // If no schedule or student is selected, don't fetch
      if (!selectedScheduleId && !selectedStudentId) {
        setAttendances([])
        setLoading(false)
        return
      }

      const response = await fetch(url + params.toString())
      if (!response.ok) throw new Error("Failed to load attendances")
      let data = await response.json()

      // Apply status filter
      if (statusFilter === "present") {
        data = data.filter((a: AttendanceRecord) => a.wasPresent)
      } else if (statusFilter === "absent") {
        data = data.filter((a: AttendanceRecord) => !a.wasPresent)
      }

      setAttendances(data)
    } catch (error) {
      console.error("Error loading attendances:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setSelectedScheduleId("")
    setSelectedStudentId("")
    setStartDate("")
    setEndDate("")
    setStatusFilter("all")
  }

  const handleExportCSV = () => {
    if (attendances.length === 0) return

    const headers = ["Fecha", "Alumno", "Horario", "Estado", "Notas"]
    const rows = attendances.map((a) => [
      format(new Date(a.date), "dd/MM/yyyy"),
      `${a.student.firstName} ${a.student.lastName}`,
      a.schedule.name,
      a.wasPresent ? "Presente" : "Ausente",
      a.notes || ""
    ])

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `asistencias_${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
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

  const stats = {
    total: attendances.length,
    present: attendances.filter((a) => a.wasPresent).length,
    absent: attendances.filter((a) => !a.wasPresent).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Historial de Asistencias
          </h1>
          <p className="text-gray-600 mt-2">
            Consulta y exporta el historial completo de asistencias
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={attendances.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-5 w-5" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Schedule filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horario
            </label>
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los horarios</option>
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.name} - {getDayName(schedule.dayOfWeek)}
                </option>
              ))}
            </select>
          </div>

          {/* Student filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alumno
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los alumnos</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="present">Solo presentes</option>
              <option value="absent">Solo ausentes</option>
            </select>
          </div>

          {/* Start date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha desde
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* End date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha hasta
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Clear filters button */}
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {attendances.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total de registros</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
            <p className="text-sm text-green-600">Presentes</p>
            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-200">
            <p className="text-sm text-red-600">Ausentes</p>
            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          </div>
        </div>
      )}

      {/* Attendance table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Cargando historial...
          </div>
        ) : attendances.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay registros
            </h3>
            <p className="text-gray-600">
              {!selectedScheduleId && !selectedStudentId
                ? "Selecciona un horario o alumno para ver el historial"
                : "No se encontraron registros con los filtros seleccionados"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alumno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notas
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendances.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(attendance.date), "dd/MM/yyyy", {
                        locale: es
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {attendance.student.firstName}{" "}
                        {attendance.student.lastName}
                      </div>
                      {attendance.student.belt && (
                        <div className="text-sm text-gray-500 capitalize">
                          {attendance.student.belt}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {attendance.schedule.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getDayName(attendance.schedule.dayOfWeek)}{" "}
                        {attendance.schedule.startTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attendance.wasPresent ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Presente
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="h-4 w-4 mr-1" />
                          Ausente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {attendance.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// Made with Bob
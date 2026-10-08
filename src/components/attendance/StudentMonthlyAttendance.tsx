"use client"

import { useState, useEffect } from "react"
import { User, BarChart2 } from "lucide-react"

interface Student {
  id: string
  firstName: string
  lastName: string
  belt?: string | null
}

interface MonthSummary {
  month: string // "YYYY-MM"
  present: number
  absent: number
  total: number
}

const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
]

function formatMonthLabel(month: string) {
  const [year, m] = month.split("-")
  return `${MONTH_NAMES[parseInt(m) - 1]} ${year}`
}

export default function StudentMonthlyAttendance() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [summary, setSummary] = useState<MonthSummary[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/students?isActive=true")
        if (!res.ok) throw new Error("Error al cargar alumnos")
        const data: Student[] = await res.json()
        setStudents(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoadingStudents(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedStudentId) {
      setSummary([])
      return
    }

    const load = async () => {
      setLoadingSummary(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/attendance/monthly-summary/${selectedStudentId}`
        )
        if (!res.ok) throw new Error("Error al cargar resumen")
        const data = await res.json()
        setSummary(data.summary)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoadingSummary(false)
      }
    }
    load()
  }, [selectedStudentId])

  const maxTotal = Math.max(...summary.map((s) => s.total), 1)

  const totalPresent = summary.reduce((acc, s) => acc + s.present, 0)
  const totalAbsent = summary.reduce((acc, s) => acc + s.absent, 0)
  const totalClasses = totalPresent + totalAbsent
  const rate = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-5">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
          <BarChart2 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Resumen de Asistencias por Alumno
          </h2>
          <p className="text-sm text-gray-500">Últimos 12 meses (year to date)</p>
        </div>
      </div>

      {/* Student selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alumno
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loadingStudents}
          >
            <option value="">
              {loadingStudents ? "Cargando alumnos..." : "Seleccionar alumno"}
            </option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.lastName}, {s.firstName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {/* Loading */}
      {loadingSummary && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Cargando resumen...
        </div>
      )}

      {/* Summary table + mini bar chart */}
      {!loadingSummary && selectedStudentId && summary.length > 0 && (
        <>
          {/* YTD totals */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Total clases</p>
              <p className="text-2xl font-bold text-blue-700">{totalClasses}</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Presentes</p>
              <p className="text-2xl font-bold text-green-700">{totalPresent}</p>
            </div>
            <div
              className={`rounded-lg p-3 text-center border ${
                rate >= 90
                  ? "bg-green-50 border-green-100"
                  : rate >= 75
                  ? "bg-yellow-50 border-yellow-100"
                  : "bg-red-50 border-red-100"
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">Asistencia</p>
              <p
                className={`text-2xl font-bold ${
                  rate >= 90
                    ? "text-green-700"
                    : rate >= 75
                    ? "text-yellow-700"
                    : "text-red-700"
                }`}
              >
                {rate}%
              </p>
            </div>
          </div>

          {/* Monthly breakdown */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium">
                    Mes
                  </th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">
                    Presentes
                  </th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">
                    Ausentes
                  </th>
                  <th className="text-right py-2 pl-3 text-gray-500 font-medium">
                    Total
                  </th>
                  <th className="py-2 pl-4 w-40 text-gray-500 font-medium text-left">
                    Gráfico
                  </th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row) => (
                  <tr
                    key={row.month}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2 pr-4 font-medium text-gray-800">
                      {formatMonthLabel(row.month)}
                    </td>
                    <td className="text-right py-2 px-3 text-green-700 font-semibold">
                      {row.present}
                    </td>
                    <td className="text-right py-2 px-3 text-red-500">
                      {row.absent}
                    </td>
                    <td className="text-right py-2 pl-3 text-gray-700">
                      {row.total}
                    </td>
                    <td className="py-2 pl-4">
                      <div className="flex items-center space-x-1 h-5">
                        {row.total > 0 ? (
                          <>
                            <div
                              className="bg-green-400 rounded-sm h-4"
                              style={{
                                width: `${(row.present / maxTotal) * 120}px`
                              }}
                              title={`${row.present} presentes`}
                            />
                            {row.absent > 0 && (
                              <div
                                className="bg-red-300 rounded-sm h-4"
                                style={{
                                  width: `${(row.absent / maxTotal) * 120}px`
                                }}
                                title={`${row.absent} ausentes`}
                              />
                            )}
                          </>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Empty state after selecting */}
      {!loadingSummary && selectedStudentId && summary.length === 0 && !error && (
        <div className="text-center py-6 text-gray-400 text-sm">
          No hay registros de asistencia en los últimos 12 meses.
        </div>
      )}
    </div>
  )
}

// Made with Bob

"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart2, Search, Users, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { getBeltLabel, getBeltColorClasses, getBeltOrder } from "@/lib/belt-utils"

interface StudentAnnual {
  id: string
  firstName: string
  lastName: string
  belt: string | null
  isActive: boolean
  attendanceCount: number
}

type SortKey = "attendance" | "belt"
type SortDir = "asc" | "desc"

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - i)

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey) return <ChevronsUpDown className="inline h-3.5 w-3.5 ml-1 text-gray-400" />
  return sortDir === "desc"
    ? <ChevronDown className="inline h-3.5 w-3.5 ml-1 text-blue-600" />
    : <ChevronUp className="inline h-3.5 w-3.5 ml-1 text-blue-600" />
}

export default function AnnualAttendancePage() {
  const [year, setYear] = useState(currentYear)
  const [search, setSearch] = useState("")
  const [data, setData] = useState<StudentAnnual[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>("attendance")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/attendance/annual?year=${year}`)
        if (!res.ok) throw new Error("Error al cargar los datos")
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        setError(err.message || "Error desconocido")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [year])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const base = term
      ? data.filter((s) =>
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(term)
        )
      : data

    return [...base].sort((a, b) => {
      let diff = 0
      if (sortKey === "attendance") {
        diff = a.attendanceCount - b.attendanceCount
      } else {
        diff = getBeltOrder(a.belt) - getBeltOrder(b.belt)
      }
      return sortDir === "desc" ? -diff : diff
    })
  }, [data, search, sortKey, sortDir])

  const totalPresent = filtered.reduce((sum, s) => sum + s.attendanceCount, 0)
  const activeCount = filtered.filter((s) => s.isActive).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-8 h-8 text-blue-600" />
          Resumen Anual de Asistencias
        </h1>
        <p className="text-gray-600 mt-2">
          Total de clases asistidas por alumno en el año seleccionado
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Year selector */}
          <div className="sm:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Student search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar alumno
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre o apellido..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Alumnos mostrados</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {filtered.length}
                </p>
              </div>
              <Users className="h-10 w-10 text-blue-400 opacity-40" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Alumnos activos</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {activeCount}
                </p>
              </div>
              <Users className="h-10 w-10 text-green-400 opacity-40" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total clases asistidas</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {totalPresent}
                </p>
              </div>
              <BarChart2 className="h-10 w-10 text-blue-400 opacity-40" />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            Cargando datos...
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <BarChart2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-700">Sin resultados</p>
            <p className="text-sm mt-1">
              {search
                ? "Ningún alumno coincide con la búsqueda"
                : `No hay datos para el año ${year}`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alumno
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("belt")}
                  >
                    <span className={sortKey === "belt" ? "text-blue-600" : "text-gray-500"}>
                      Graduación
                      <SortIcon column="belt" sortKey={sortKey} sortDir={sortDir} />
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("attendance")}
                  >
                    <span className={sortKey === "attendance" ? "text-blue-600" : "text-gray-500"}>
                      Clases asistidas {year}
                      <SortIcon column="attendance" sortKey={sortKey} sortDir={sortDir} />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {student.belt ? (
                        <span
                          className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full border ${getBeltColorClasses(student.belt)}`}
                        >
                          {getBeltLabel(student.belt)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`text-2xl font-bold ${
                          student.attendanceCount === 0
                            ? "text-gray-300"
                            : "text-blue-600"
                        }`}
                      >
                        {student.attendanceCount}
                      </span>
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

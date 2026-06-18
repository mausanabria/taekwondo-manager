"use client"

import { useState, useEffect } from "react"
import { Student } from "@/types"
import { X, Search, Loader2, UserPlus, Info } from "lucide-react"

interface StudentEnrollmentProps {
  scheduleId: string
  scheduleName: string
  onClose: () => void
  onSuccess: () => void
}

export function StudentEnrollment({
  scheduleId,
  scheduleName,
  onClose,
  onSuccess
}: StudentEnrollmentProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [weeklyFrequency, setWeeklyFrequency] = useState<number>(1)
  const [monthlyFee, setMonthlyFee] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [frequencyRates, setFrequencyRates] = useState<Record<number, number>>({})
  const [loadingRates, setLoadingRates] = useState(false)

  useEffect(() => {
    fetchAvailableStudents()
    fetchFrequencyRates()
  }, [])

  useEffect(() => {
    applySearch()
  }, [students, searchTerm])

  const fetchAvailableStudents = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get all students
      const studentsResponse = await fetch("/api/students")
      if (!studentsResponse.ok) {
        throw new Error("Error al cargar los alumnos")
      }
      const allStudents = await studentsResponse.json()

      // Get enrolled students in THIS schedule
      const enrolledResponse = await fetch(`/api/schedules/${scheduleId}/students`)
      if (!enrolledResponse.ok) {
        throw new Error("Error al cargar los alumnos inscritos")
      }
      const enrolledData = await enrolledResponse.json()
      const enrolledIds = new Set(enrolledData.map((e: any) => e.student.id))

      // Filter: only show active students NOT enrolled in THIS schedule
      // Students can be enrolled in multiple schedules, so we only filter out
      // those already in THIS specific schedule
      const available = allStudents.filter(
        (student: Student) => !enrolledIds.has(student.id) && student.isActive
      )

      setStudents(available)
    } catch (err: any) {
      setError(err.message || "Error al cargar los alumnos")
    } finally {
      setIsLoading(false)
    }
  }

  const applySearch = () => {
    if (!searchTerm) {
      setFilteredStudents(students)
      return
    }

    const search = searchTerm.toLowerCase()
    const filtered = students.filter(student => 
      student.firstName.toLowerCase().includes(search) ||
      student.lastName.toLowerCase().includes(search) ||
      student.email?.toLowerCase().includes(search) ||
      student.phone?.toLowerCase().includes(search)
    )
    setFilteredStudents(filtered)
  }

  const fetchFrequencyRates = async () => {
    try {
      setLoadingRates(true)
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1

      const response = await fetch(`/api/frequency-rates?year=${year}&month=${month}`)
      if (response.ok) {
        const data = await response.json()
        const ratesMap: Record<number, number> = {}
        data.rates.forEach((rate: any) => {
          ratesMap[rate.weeklyFrequency] = rate.amount
        })
        setFrequencyRates(ratesMap)
      }
    } catch (err) {
      console.error('Error fetching frequency rates:', err)
    } finally {
      setLoadingRates(false)
    }
  }

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student)
    setWeeklyFrequency(1)
    setMonthlyFee("")
    setNotes("")
  }

  const getApplicableRate = (frequency: number): number | null => {
    return frequencyRates[frequency] || null
  }

  const handleEnroll = async () => {
    if (!selectedStudent) return

    setEnrolling(selectedStudent.id)
    try {
      const enrollmentData: any = {
        studentId: selectedStudent.id,
        weeklyFrequency
      }

      // Only include monthlyFee if it's provided
      if (monthlyFee && parseFloat(monthlyFee) > 0) {
        enrollmentData.monthlyFee = parseFloat(monthlyFee)
      }

      // Only include notes if provided
      if (notes.trim()) {
        enrollmentData.notes = notes.trim()
      }

      const response = await fetch(`/api/schedules/${scheduleId}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(enrollmentData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al inscribir al alumno")
      }

      onSuccess()
    } catch (err: any) {
      alert(err.message || "Error al inscribir al alumno")
      setEnrolling(null)
    }
  }

  const handleBack = () => {
    setSelectedStudent(null)
    setWeeklyFrequency(1)
    setMonthlyFee("")
    setNotes("")
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Inscribir Alumno</h2>
            <p className="mt-1 text-sm text-gray-500">
              Selecciona un alumno para inscribir en "{scheduleName}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar alumno por nombre, email o teléfono..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : selectedStudent ? (
            /* Enrollment Form */
            <div className="space-y-6">
              {/* Selected Student Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Alumno Seleccionado</h3>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-blue-900">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </span>
                  {selectedStudent.belt && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {selectedStudent.belt.charAt(0).toUpperCase() + selectedStudent.belt.slice(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Weekly Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia Semanal <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((freq) => {
                    const rate = getApplicableRate(freq)
                    return (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setWeeklyFrequency(freq)}
                        className={`px-4 py-3 text-sm font-medium rounded-md border ${
                          weeklyFrequency === freq
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="font-bold">{freq}x</span>
                          {rate && (
                            <span className={`text-xs mt-1 ${
                              weeklyFrequency === freq ? "text-blue-100" : "text-gray-500"
                            }`}>
                              ${rate.toLocaleString('es-AR')}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Selecciona cuántas veces por semana asistirá el alumno
                </p>
                {getApplicableRate(weeklyFrequency) && (
                  <div className="mt-2 bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-green-800">
                        <strong>Tarifa automática:</strong> ${getApplicableRate(weeklyFrequency)?.toLocaleString('es-AR')} por mes
                        <br />
                        <span className="text-xs text-green-700">
                          Esta tarifa se aplicará automáticamente. Puedes configurar una cuota personalizada abajo si es necesario.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Monthly Fee */}
              <div>
                <label htmlFor="monthlyFee" className="block text-sm font-medium text-gray-700 mb-2">
                  Cuota Mensual Personalizada (opcional)
                  {getApplicableRate(weeklyFrequency) && (
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      (Sobrescribe la tarifa automática)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="monthlyFee"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="mt-2 flex items-start gap-2 text-xs text-gray-500">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Dejar vacío para usar la cuota general de la escuela. Si se especifica, esta cuota personalizada se usará para este alumno.
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notas del Plan (opcional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Ej: Plan 2x semana - Lunes y Miércoles"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm
                  ? "No se encontraron alumnos con ese criterio de búsqueda"
                  : "No hay alumnos disponibles para inscribir"}
              </p>
            </div>
          ) : (
            /* Student List */
            <div className="space-y-2">
              {filteredStudents.map((student) => {
                const fullName = `${student.firstName} ${student.lastName}`

                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-medium text-gray-900">
                          {fullName}
                        </span>
                        {student.belt && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {student.belt.charAt(0).toUpperCase() + student.belt.slice(1)}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {student.phone && <span>📞 {student.phone}</span>}
                        {student.email && <span className="ml-4">✉️ {student.email}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectStudent(student)}
                      className="ml-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Seleccionar
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          {selectedStudent ? (
            <>
              <button
                onClick={handleBack}
                disabled={!!enrolling}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Volver
              </button>
              <button
                onClick={handleEnroll}
                disabled={!!enrolling}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrolling ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Inscribiendo...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Inscribir Alumno
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="ml-auto px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Made with Bob
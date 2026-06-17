"use client"

import { useState, useEffect } from "react"
import { Schedule, Student } from "@/types"
import { StudentEnrollment } from "@/components/schedules/StudentEnrollment"
import { EditEnrollmentForm } from "@/components/schedules/EditEnrollmentForm"
import { ChangeFrequencyDialog } from "@/components/schedules/ChangeFrequencyDialog"
import { FrequencyHistoryView } from "@/components/schedules/FrequencyHistoryView"
import { ArrowLeft, Loader2, Clock, Users, Calendar, Pencil, Trash2, UserPlus, Edit, DollarSign, RefreshCw, History } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

interface EnrollmentData {
  id: string
  weeklyFrequency: number
  monthlyFee?: number | null
  notes?: string | null
  student: Student
}

interface ScheduleWithStudents extends Schedule {
  _count?: {
    enrollments: number
  }
  enrollments?: EnrollmentData[]
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

export default function ScheduleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const scheduleId = params.id as string

  const [schedule, setSchedule] = useState<ScheduleWithStudents | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEnrollment, setShowEnrollment] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingEnrollment, setEditingEnrollment] = useState<EnrollmentData | null>(null)
  const [changingFrequency, setChangingFrequency] = useState<EnrollmentData | null>(null)
  const [viewingHistory, setViewingHistory] = useState<string | null>(null)

  useEffect(() => {
    fetchSchedule()
  }, [scheduleId])

  const fetchSchedule = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/schedules/${scheduleId}`)

      if (!response.ok) {
        throw new Error("Error al cargar el horario")
      }

      const data = await response.json()
      setSchedule(data)
    } catch (err: any) {
      setError(err.message || "Error al cargar el horario")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el horario "${schedule?.name}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el horario")
      }

      router.push("/schedules")
    } catch (err: any) {
      alert(err.message || "Error al eliminar el horario")
      setIsDeleting(false)
    }
  }

  const handleUnenroll = async (studentId: string, studentName: string) => {
    if (!confirm(`¿Deseas desinscribir a ${studentName} de este horario?`)) {
      return
    }

    try {
      const response = await fetch(`/api/schedules/${scheduleId}/students/${studentId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Error al desinscribir al alumno")
      }

      // Refresh schedule data
      await fetchSchedule()
    } catch (err: any) {
      alert(err.message || "Error al desinscribir al alumno")
    }
  }

  const handleEnrollmentSuccess = () => {
    setShowEnrollment(false)
    fetchSchedule()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando horario...</p>
        </div>
      </div>
    )
  }

  if (error || !schedule) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error || "Horario no encontrado"}</span>
          <Link
            href="/schedules"
            className="mt-2 text-sm underline block"
          >
            Volver a Horarios
          </Link>
        </div>
      </div>
    )
  }

  const enrolledCount = schedule._count?.enrollments || 0
  const capacityText = schedule.capacity 
    ? `${enrolledCount} / ${schedule.capacity}`
    : `${enrolledCount}`
  const hasCapacity = !schedule.capacity || enrolledCount < schedule.capacity

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/schedules"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver a Horarios
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{schedule.name}</h1>
            <p className="mt-2 text-sm text-gray-600">
              Detalles del horario y alumnos inscritos
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Link
              href={`/schedules/${scheduleId}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Horario</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-500">Día</div>
              <div className="mt-1 text-base text-gray-900">{DAY_NAMES[schedule.dayOfWeek]}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-500">Horario</div>
              <div className="mt-1 text-base text-gray-900">
                {schedule.startTime} - {schedule.endTime}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-500">Alumnos Inscritos</div>
              <div className="mt-1 text-base text-gray-900">{capacityText}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Alumnos Inscritos ({enrolledCount})
          </h2>
          <button
            onClick={() => setShowEnrollment(true)}
            disabled={!hasCapacity}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Inscribir Alumno
          </button>
        </div>

        {!hasCapacity && (
          <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-100">
            <p className="text-sm text-yellow-800">
              Este horario ha alcanzado su capacidad máxima
            </p>
          </div>
        )}

        {schedule.enrollments && schedule.enrollments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {schedule.enrollments.map((enrollment) => {
              const student = enrollment.student
              const fullName = `${student.firstName} ${student.lastName}`
              const feeDisplay = enrollment.monthlyFee
                ? `$${Number(enrollment.monthlyFee).toLocaleString('es-AR')}/mes`
                : "Cuota general"

              return (
                <div key={enrollment.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/students/${student.id}`}
                          className="text-base font-medium text-gray-900 hover:text-blue-600"
                        >
                          {fullName}
                        </Link>
                        {student.belt && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {student.belt.charAt(0).toUpperCase() + student.belt.slice(1)}
                          </span>
                        )}
                        {!student.isActive && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span className="font-medium">{enrollment.weeklyFrequency}x por semana</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="font-medium">{feeDisplay}</span>
                        </div>
                      </div>
                      {enrollment.notes && (
                        <div className="mt-1 text-sm text-gray-500">
                          📝 {enrollment.notes}
                        </div>
                      )}
                      {student.phone && (
                        <div className="mt-1 text-sm text-gray-500">
                          📞 {student.phone}
                          {student.email && <span className="ml-4">✉️ {student.email}</span>}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={() => setChangingFrequency(enrollment)}
                        className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                        title="Cambiar frecuencia"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Frecuencia
                      </button>
                      <button
                        onClick={() => setViewingHistory(enrollment.id)}
                        className="inline-flex items-center px-3 py-2 border border-purple-300 shadow-sm text-sm font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50"
                        title="Ver historial"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingEnrollment(enrollment)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleUnenroll(student.id, fullName)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Desinscribir
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay alumnos inscritos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza inscribiendo alumnos en este horario.
            </p>
          </div>
        )}
      </div>

      {/* Student Enrollment Modal */}
      {showEnrollment && (
        <StudentEnrollment
          scheduleId={scheduleId}
          scheduleName={schedule.name}
          onClose={() => setShowEnrollment(false)}
          onSuccess={handleEnrollmentSuccess}
        />
      )}

      {/* Edit Enrollment Modal */}
      {editingEnrollment && (
        <EditEnrollmentForm
          scheduleId={scheduleId}
          studentId={editingEnrollment.student.id}
          studentName={`${editingEnrollment.student.firstName} ${editingEnrollment.student.lastName}`}
          currentFrequency={editingEnrollment.weeklyFrequency}
          currentMonthlyFee={editingEnrollment.monthlyFee}
          currentNotes={editingEnrollment.notes}
          onClose={() => setEditingEnrollment(null)}
          onSuccess={() => {
            setEditingEnrollment(null)
            fetchSchedule()
          }}
        />
      )}

      {/* Change Frequency Dialog */}
      {changingFrequency && (
        <ChangeFrequencyDialog
          enrollment={{
            id: changingFrequency.id,
            weeklyFrequency: changingFrequency.weeklyFrequency,
            monthlyFee: changingFrequency.monthlyFee ?? null,
            student: changingFrequency.student,
            schedule: schedule,
          }}
          open={!!changingFrequency}
          onOpenChange={(open) => !open && setChangingFrequency(null)}
          onSuccess={() => {
            setChangingFrequency(null)
            fetchSchedule()
          }}
        />
      )}

      {/* Frequency History Modal */}
      {viewingHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Historial de Frecuencias
              </h2>
              <button
                onClick={() => setViewingHistory(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <FrequencyHistoryView enrollmentId={viewingHistory} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Made with Bob
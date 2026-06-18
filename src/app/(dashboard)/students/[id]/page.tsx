"use client"

import { useState, useEffect } from "react"
import { Student } from "@/types"
import { StudentStats } from "@/services/studentService"
import { StudentSchedules } from "@/components/students/StudentSchedules"
import { getBeltLabel, getBeltColorClasses } from "@/lib/belt-utils"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Loader2,
  CreditCard
} from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

interface MonthlyStats {
  month: string
  attendanceCount: number
  totalPaid: number
  monthlyFee: number
  debt: number
  paymentStatus: 'paid' | 'debt' | 'no_attendance'
  paymentStatusColor: 'green' | 'red' | 'gray'
  hasAttendances: boolean
}

interface MonthlyFeeBreakdown {
  scheduleId: string
  scheduleName: string
  fullScheduleName: string
  dayOfWeek: number
  startTime: string
  endTime: string
  weeklyFrequency: number
  monthlyFee: number
  isCustom: boolean
}

interface MonthlyFeeData {
  totalMonthlyFee: number
  breakdown: MonthlyFeeBreakdown[]
  generalFee: number
  hasCustomFees: boolean
  enrollmentCount: number
}

export default function StudentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [monthlyFeeData, setMonthlyFeeData] = useState<MonthlyFeeData | null>(null)
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudentData()
  }, [studentId])

  const fetchStudentData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch student details
      const studentResponse = await fetch(`/api/students/${studentId}`)
      if (!studentResponse.ok) {
        throw new Error("Error al cargar el alumno")
      }
      const studentData = await studentResponse.json()
      setStudent(studentData)

      // Fetch monthly fee data
      try {
        const feeResponse = await fetch(`/api/students/${studentId}/monthly-fee`)
        if (feeResponse.ok) {
          const feeData = await feeResponse.json()
          setMonthlyFeeData(feeData)
        }
      } catch (feeErr) {
        console.error('Error fetching monthly fee:', feeErr)
      }

      // Fetch monthly stats
      try {
        const statsResponse = await fetch(`/api/students/${studentId}/monthly-stats`)
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setMonthlyStats(statsData)
        }
      } catch (statsErr) {
        console.error('Error fetching monthly stats:', statsErr)
      }

    } catch (err: any) {
      setError(err.message || "Error al cargar el alumno")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!student) return

    const fullName = `${student.firstName} ${student.lastName}`
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${fullName}? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el alumno")
      }

      // Redirect to students list
      router.push("/students")
      router.refresh()
    } catch (err: any) {
      alert(err.message || "Error al eliminar el alumno")
    }
  }

  const calculateAge = (birthDate: Date | null): number | null => {
    if (!birthDate) return null
    
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const formatDate = (date: Date | null): string => {
    if (!date) return "No especificada"
    return new Date(date).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando alumno...</p>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error || "Alumno no encontrado"}</span>
          <div className="mt-4">
            <Link href="/students" className="text-sm underline">
              Volver a la lista
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const age = calculateAge(student.birthDate ?? null)
  const fullName = `${student.firstName} ${student.lastName}`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/students"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver a la lista
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
            <div className="mt-2 flex items-center gap-2">
              {student.belt && (
                <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getBeltColorClasses(student.belt)}`}>
                  {getBeltLabel(student.belt)}
                </span>
              )}
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                student.isActive 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {student.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Link
              href={`/students/${studentId}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Información Personal
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Nombre Completo
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{fullName}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Edad
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {age ? `${age} años` : "No especificada"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fecha de Nacimiento
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(student.birthDate ?? null)}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Cinturón Actual
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {getBeltLabel(student.belt || null)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Contact Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Información de Contacto
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Teléfono
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {student.phone || "No especificado"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {student.email || "No especificado"}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Dirección
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {student.address || "No especificada"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Emergency Contact */}
          {(student.emergencyContact || student.emergencyPhone) && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                Contacto de Emergencia
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {student.emergencyContact || "No especificado"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {student.emergencyPhone || "No especificado"}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Notes */}
          {student.notes && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Notas
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {student.notes}
              </p>
            </div>
          )}

          {/* Student Schedules */}
          <StudentSchedules studentId={studentId} />
        </div>

        {/* Sidebar - Stats */}
        <div className="space-y-6">
          {/* Monthly Fee Card */}
          {monthlyFeeData && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Cuota Mensual
                </h2>
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              
              <div className="text-center py-4 bg-blue-50 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-1">Total Mensual</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${monthlyFeeData.totalMonthlyFee.toLocaleString('es-AR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {monthlyFeeData.enrollmentCount} horario{monthlyFeeData.enrollmentCount !== 1 ? 's' : ''} inscrito{monthlyFeeData.enrollmentCount !== 1 ? 's' : ''}
                </p>
              </div>

              {monthlyFeeData.breakdown.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Desglose
                  </p>
                  {monthlyFeeData.breakdown.map((item) => (
                    <div key={item.scheduleId} className="flex justify-between items-start py-2 border-t border-gray-100">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.scheduleName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.weeklyFrequency}x por semana
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ${item.monthlyFee.toLocaleString('es-AR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </p>
                        {item.isCustom && (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            Personalizada
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Monthly Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-1">
              Estadísticas
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {monthlyStats?.month || 'Mes actual'}
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Asistencias</span>
                </div>
                <span className="text-lg font-semibold text-blue-600">
                  {monthlyStats?.attendanceCount || 0}
                </span>
              </div>

              <div className={`flex items-center justify-between p-3 rounded-lg ${
                monthlyStats?.paymentStatusColor === 'green'
                  ? 'bg-green-50'
                  : monthlyStats?.paymentStatusColor === 'red'
                  ? 'bg-red-50'
                  : 'bg-gray-50'
              }`}>
                <div className="flex items-center">
                  <DollarSign className={`w-5 h-5 mr-2 ${
                    monthlyStats?.paymentStatusColor === 'green'
                      ? 'text-green-600'
                      : monthlyStats?.paymentStatusColor === 'red'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Pagos</span>
                    {monthlyStats?.hasAttendances && monthlyStats.debt > 0 && (
                      <span className="text-xs text-red-600">Deuda: ${monthlyStats.debt.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-semibold ${
                    monthlyStats?.paymentStatusColor === 'green'
                      ? 'text-green-600'
                      : monthlyStats?.paymentStatusColor === 'red'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}>
                    {monthlyStats?.hasAttendances
                      ? (monthlyStats.debt > 0
                        ? `$${monthlyStats.totalPaid.toFixed(2)}`
                        : 'Al día')
                      : '$0'}
                  </span>
                  {!monthlyStats?.hasAttendances && (
                    <p className="text-xs text-gray-500">Sin asistencias</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Acciones Rápidas
            </h2>
            <div className="space-y-2">
              <Link
                href={`/attendance?student=${studentId}`}
                className="block w-full px-4 py-2 text-sm font-medium text-center text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Registrar Asistencia
              </Link>
              <Link
                href={`/payments?student=${studentId}`}
                className="block w-full px-4 py-2 text-sm font-medium text-center text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Registrar Pago
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
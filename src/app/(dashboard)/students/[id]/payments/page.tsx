"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, DollarSign, Calendar, CreditCard, Plus, Loader2, AlertCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useSession } from "next-auth/react"
import DebtCalculator from "@/components/payments/DebtCalculator"
import PaymentForm from "@/components/payments/PaymentForm"

interface Student {
  id: string
  firstName: string
  lastName: string
  belt?: string | null
}

interface Payment {
  id: string
  amount: number
  month: number
  year: number
  paymentDate: Date
  paymentMethod?: string | null
  notes?: string | null
}

export default function StudentPaymentsPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string
  const { data: session } = useSession()

  const [student, setStudent] = useState<Student | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean
    payment: Payment | null
  }>({ show: false, payment: null })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [studentId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch student info
      const studentResponse = await fetch(`/api/students/${studentId}`)
      if (!studentResponse.ok) throw new Error('Failed to fetch student')
      const studentData = await studentResponse.json()
      setStudent(studentData)

      // Fetch payments
      const paymentsResponse = await fetch(`/api/payments/student/${studentId}`)
      if (!paymentsResponse.ok) throw new Error('Failed to fetch payments')
      const paymentsData = await paymentsResponse.json()
      setPayments(paymentsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false)
    fetchData()
  }

  const handleDeleteClick = (payment: Payment) => {
    setDeleteConfirmation({ show: true, payment })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.payment) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/payments/${deleteConfirmation.payment.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete payment')
      }

      // Close modal and refresh data
      setDeleteConfirmation({ show: false, payment: null })
      fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar el pago')
      console.error('Error deleting payment:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ show: false, payment: null })
  }

  // Allow any authenticated user to delete payments
  const isAdmin = !!session?.user

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const formatDate = (date: Date) => {
    try {
      return format(new Date(date), "dd/MM/yyyy", { locale: es })
    } catch {
      return "Fecha inválida"
    }
  }

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando información de pagos...</p>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="space-y-4">
        <Link
          href="/payments"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Pagos
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Error al cargar información</h3>
              <p className="text-sm">{error || 'Alumno no encontrado'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/payments"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pagos de {student.firstName} {student.lastName}
            </h1>
            {student.belt && (
              <p className="text-gray-600 mt-1">Cinturón: {student.belt}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowPaymentForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Registrar Pago
        </button>
      </div>

      {/* Debt Calculator */}
      <DebtCalculator studentId={studentId} />

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pagado</p>
              <p className="text-2xl font-bold text-green-600">
                ${totalPaid.toLocaleString('es-AR', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Pagos</p>
              <p className="text-2xl font-bold text-blue-600">{payments.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Último Pago</p>
              <p className="text-sm font-semibold text-gray-900">
                {payments.length > 0 
                  ? formatDate(payments[0].paymentDate)
                  : "Sin pagos"}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Historial de Pagos</h2>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sin pagos registrados
            </h3>
            <p className="text-gray-600 mb-4">
              Este alumno aún no tiene pagos registrados.
            </p>
            <button
              onClick={() => setShowPaymentForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Registrar Primer Pago
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notas
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {monthNames[payment.month - 1]} {payment.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${Number(payment.amount).toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.paymentMethod || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.notes || "-"}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteClick(payment)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                          title="Eliminar pago"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Registrar Pago</h2>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <PaymentForm
                studentId={studentId}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPaymentForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && deleteConfirmation.payment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    ¿Eliminar este pago?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Período:</span>
                    <span className="font-medium text-gray-900">
                      {monthNames[deleteConfirmation.payment.month - 1]} {deleteConfirmation.payment.year}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto:</span>
                    <span className="font-semibold text-green-600">
                      ${Number(deleteConfirmation.payment.amount).toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha de pago:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(deleteConfirmation.payment.paymentDate)}
                    </span>
                  </div>
                  {deleteConfirmation.payment.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Método:</span>
                      <span className="font-medium text-gray-900">
                        {deleteConfirmation.payment.paymentMethod}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Al eliminar este pago, la deuda del alumno se recalculará automáticamente.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Eliminar pago
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Made with Bob
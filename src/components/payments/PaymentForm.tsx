"use client"

import { useState, useEffect } from "react"
import { DollarSign, Calendar, CreditCard, FileText, AlertCircle, Loader2 } from "lucide-react"

interface Student {
  id: string
  firstName: string
  lastName: string
}

interface DebtDetails {
  studentId: string
  studentName: string
  totalDebt: number
  monthsOwed: Array<{
    month: number
    year: number
    amount: number
  }>
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

interface PaymentFormProps {
  studentId?: string | null
  onSuccess: () => void
  onCancel: () => void
}

export default function PaymentForm({ studentId, onSuccess, onCancel }: PaymentFormProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState(studentId || "")
  const [debtDetails, setDebtDetails] = useState<DebtDetails | null>(null)
  const [monthlyFeeData, setMonthlyFeeData] = useState<MonthlyFeeData | null>(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [amount, setAmount] = useState("")
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingDebt, setLoadingDebt] = useState(false)
  const [loadingFee, setLoadingFee] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    if (selectedStudentId) {
      fetchDebtDetails(selectedStudentId)
      fetchMonthlyFee(selectedStudentId)
    } else {
      setDebtDetails(null)
      setMonthlyFeeData(null)
    }
  }, [selectedStudentId])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (!response.ok) throw new Error('Failed to fetch students')
      const data = await response.json()
      setStudents(data)
    } catch (err) {
      console.error('Error fetching students:', err)
    }
  }

  const fetchDebtDetails = async (studentId: string) => {
    try {
      setLoadingDebt(true)
      const response = await fetch(`/api/payments/student/${studentId}/debt`)
      if (!response.ok) throw new Error('Failed to fetch debt details')
      const data = await response.json()
      setDebtDetails(data)
      
      // Auto-fill amount with first month owed if available
      if (data.monthsOwed.length > 0) {
        const firstMonth = data.monthsOwed[0]
        setAmount(firstMonth.amount.toString())
        setMonth(firstMonth.month)
        setYear(firstMonth.year)
      }
    } catch (err) {
      console.error('Error fetching debt details:', err)
    } finally {
      setLoadingDebt(false)
    }
  }

  const fetchMonthlyFee = async (studentId: string) => {
    try {
      setLoadingFee(true)
      const response = await fetch(`/api/students/${studentId}/monthly-fee`)
      if (!response.ok) throw new Error('Failed to fetch monthly fee')
      const data = await response.json()
      setMonthlyFeeData(data)
      
      // Auto-fill amount with total monthly fee if no debt or if amount is empty
      if (!amount && data.totalMonthlyFee > 0) {
        setAmount(data.totalMonthlyFee.toString())
      }
    } catch (err) {
      console.error('Error fetching monthly fee:', err)
    } finally {
      setLoadingFee(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedStudentId) {
      setError("Por favor selecciona un alumno")
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("El monto debe ser mayor a 0")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudentId,
          month,
          year,
          amount: parseFloat(amount),
          paymentDate,
          paymentMethod: paymentMethod || null,
          notes: notes || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to record payment')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Student Selection */}
      <div>
        <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-2">
          Alumno *
        </label>
        <select
          id="student"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          disabled={!!studentId || loading}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Seleccionar alumno...</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.firstName} {student.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Monthly Fee Information */}
      {loadingFee && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          <p className="text-sm text-blue-700">Cargando cuota mensual...</p>
        </div>
      )}

      {monthlyFeeData && !loadingFee && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            Cuota Mensual del Alumno
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            ${monthlyFeeData.totalMonthlyFee.toLocaleString('es-AR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
          
          {monthlyFeeData.breakdown.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-blue-700">
                Desglose por horario:
              </p>
              {monthlyFeeData.breakdown.map((item) => (
                <div key={item.scheduleId} className="bg-white rounded p-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        📅 {item.scheduleName}
                      </p>
                      <p className="text-gray-600 mt-0.5">
                        📊 {item.weeklyFrequency}x por semana
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${item.monthlyFee.toLocaleString('es-AR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </p>
                      {item.isCustom && (
                        <p className="text-blue-600 text-xs">
                          Personalizada
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!monthlyFeeData.hasCustomFees && monthlyFeeData.generalFee > 0 && (
            <p className="text-xs text-blue-600 mt-2">
              Usando cuota general de la escuela
            </p>
          )}
        </div>
      )}

      {/* Debt Information */}
      {loadingDebt && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-orange-600 animate-spin" />
          <p className="text-sm text-orange-700">Cargando información de deuda...</p>
        </div>
      )}

      {debtDetails && !loadingDebt && (
        <div className={`border rounded-lg p-4 ${
          debtDetails.totalDebt > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className={`text-sm font-semibold ${
                debtDetails.totalDebt > 0 ? 'text-red-800' : 'text-green-800'
              }`}>
                Deuda Actual
              </h3>
              <p className={`text-2xl font-bold mt-1 ${
                debtDetails.totalDebt > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                ${debtDetails.totalDebt.toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
              {debtDetails.monthsOwed.length > 0 && (
                <p className="text-sm text-red-700 mt-2">
                  {debtDetails.monthsOwed.length} mes{debtDetails.monthsOwed.length !== 1 ? 'es' : ''} adeudado{debtDetails.monthsOwed.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Month and Year */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
            Mes *
          </label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            disabled={loading}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            {monthNames.map((name, index) => (
              <option key={index + 1} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
            Año *
          </label>
          <input
            type="number"
            id="year"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            disabled={loading}
            required
            min="2000"
            max="2100"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Monto * <span className="text-gray-500 font-normal">(ARS)</span>
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            required
            min="0.01"
            step="0.01"
            placeholder="0.00"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Payment Date */}
      <div>
        <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-2">
          Fecha de Pago *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="date"
            id="paymentDate"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            disabled={loading}
            required
            max={new Date().toISOString().split('T')[0]}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
          Método de Pago
        </label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={loading}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="">Seleccionar...</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta de Débito">Tarjeta de Débito</option>
            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
            <option value="Mercado Pago">Mercado Pago</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notas
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
            rows={3}
            maxLength={500}
            placeholder="Información adicional sobre el pago..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {notes.length}/500 caracteres
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !selectedStudentId}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <DollarSign className="h-4 w-4" />
              Registrar Pago
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// Made with Bob
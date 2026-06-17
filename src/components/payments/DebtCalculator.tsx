"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, Calendar, Loader2, Info } from "lucide-react"

interface MonthDebt {
  month: number
  year: number
  amount: number
  feeAmount: number
  paidAmount: number
  hasAttended: boolean
}

interface DebtDetails {
  studentId: string
  studentName: string
  totalDebt: number
  monthsOwed: MonthDebt[]
  totalPaid: number
  lastPaymentDate?: Date | null
}

interface DebtCalculatorProps {
  studentId: string
}

export default function DebtCalculator({ studentId }: DebtCalculatorProps) {
  const [debtDetails, setDebtDetails] = useState<DebtDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDebtDetails()
  }, [studentId])

  const fetchDebtDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/payments/student/${studentId}/debt`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch debt details')
      }

      const data = await response.json()
      setDebtDetails(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching debt details:', err)
    } finally {
      setLoading(false)
    }
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Calculando deuda...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">Error al calcular deuda</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!debtDetails) {
    return null
  }

  const hasDebt = debtDetails.totalDebt > 0

  return (
    <div className={`rounded-lg shadow p-6 ${
      hasDebt ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {hasDebt ? (
            <AlertCircle className="h-8 w-8 text-red-600" />
          ) : (
            <CheckCircle className="h-8 w-8 text-green-600" />
          )}
          <div>
            <h2 className={`text-2xl font-bold ${
              hasDebt ? 'text-red-800' : 'text-green-800'
            }`}>
              {hasDebt ? 'Deuda Pendiente' : 'Sin Deuda'}
            </h2>
            <p className={`text-sm ${
              hasDebt ? 'text-red-700' : 'text-green-700'
            }`}>
              {hasDebt 
                ? `${debtDetails.monthsOwed.length} mes${debtDetails.monthsOwed.length !== 1 ? 'es' : ''} adeudado${debtDetails.monthsOwed.length !== 1 ? 's' : ''}`
                : 'El alumno está al día con los pagos'
              }
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold ${
            hasDebt ? 'text-red-600' : 'text-green-600'
          }`}>
            ${debtDetails.totalDebt.toLocaleString('es-AR', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Total pagado: ${debtDetails.totalPaid.toLocaleString('es-AR', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </p>
        </div>
      </div>

      {/* Important Notice about Attendance-Based Debt */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Cálculo Inteligente de Deuda</p>
            <p>
              Solo se genera deuda para los meses en los que el alumno asistió al menos una vez. 
              Los meses sin asistencia no generan cargos.
            </p>
          </div>
        </div>
      </div>

      {/* Debt Details */}
      {hasDebt && debtDetails.monthsOwed.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 mb-3">Detalle de Deuda por Mes</h3>
          <div className="space-y-2">
            {debtDetails.monthsOwed.map((monthDebt, index) => (
              <div
                key={`${monthDebt.year}-${monthDebt.month}`}
                className="bg-white rounded-lg p-4 border border-red-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {monthNames[monthDebt.month - 1]} {monthDebt.year}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                          ✓ Asistió
                        </span>
                        {monthDebt.paidAmount > 0 && (
                          <span className="text-xs text-blue-600">
                            Pagado: ${monthDebt.paidAmount.toLocaleString('es-AR', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      ${monthDebt.amount.toLocaleString('es-AR', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </p>
                    <p className="text-xs text-gray-600">
                      Cuota: ${monthDebt.feeAmount.toLocaleString('es-AR', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Summary */}
          <div className="bg-red-100 rounded-lg p-4 mt-4 border-2 border-red-300">
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-900">TOTAL ADEUDADO</span>
              <span className="text-2xl font-bold text-red-600">
                ${debtDetails.totalDebt.toLocaleString('es-AR', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* No Debt Message */}
      {!hasDebt && (
        <div className="text-center py-4">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-3" />
          <p className="text-lg font-semibold text-green-800 mb-2">
            ¡Excelente!
          </p>
          <p className="text-green-700">
            Este alumno no tiene deudas pendientes. Todos los meses con asistencia han sido pagados.
          </p>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={fetchDebtDetails}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Actualizar cálculo
        </button>
      </div>
    </div>
  )
}

// Made with Bob
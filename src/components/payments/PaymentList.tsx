"use client"

import { DollarSign, Eye, AlertCircle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface PaymentStatus {
  studentId: string
  studentName: string
  belt?: string | null
  isActive: boolean
  totalDebt: number
  monthsOwed: number
  lastPaymentDate?: Date | null
  status: 'paid' | 'partial' | 'overdue' | 'no_debt'
}

interface PaymentListProps {
  paymentStatuses: PaymentStatus[]
  onRegisterPayment: (studentId: string) => void
  onRefresh: () => void
}

export default function PaymentList({
  paymentStatuses,
  onRegisterPayment,
  onRefresh
}: PaymentListProps) {
  const getStatusBadge = (status: PaymentStatus) => {
    if (status.totalDebt === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Al día
        </span>
      )
    } else if (status.monthsOwed === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3" />
          1 mes adeudado
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3" />
          {status.monthsOwed} meses adeudados
        </span>
      )
    }
  }

  const formatLastPayment = (date?: Date | null) => {
    if (!date) return "Sin pagos"
    
    try {
      return format(new Date(date), "dd/MM/yyyy", { locale: es })
    } catch {
      return "Fecha inválida"
    }
  }

  if (paymentStatuses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No se encontraron alumnos
        </h3>
        <p className="text-gray-600">
          No hay alumnos que coincidan con los filtros seleccionados.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alumno
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cinturón
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Pago
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deuda Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paymentStatuses.map((status) => (
              <tr key={status.studentId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {status.studentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {status.studentName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {status.belt || "Sin cinturón"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {formatLastPayment(status.lastPaymentDate)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-semibold ${
                    status.totalDebt > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    ${status.totalDebt.toLocaleString('es-AR', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/students/${status.studentId}/payments`}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Ver detalle
                    </Link>
                    <button
                      onClick={() => onRegisterPayment(status.studentId)}
                      className="text-green-600 hover:text-green-900 inline-flex items-center gap-1"
                    >
                      <DollarSign className="h-4 w-4" />
                      Registrar pago
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Mostrando {paymentStatuses.length} alumno{paymentStatuses.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onRefresh}
            className="text-blue-600 hover:text-blue-900 font-medium"
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  )
}

// Made with Bob

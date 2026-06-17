"use client"

import Link from "next/link"
import { PaymentAlert } from "@/services/dashboardService"
import { AlertCircle, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface PaymentAlertsProps {
  alerts: PaymentAlert[]
}

export function PaymentAlerts({ alerts }: PaymentAlertsProps) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Alertas de Pagos
        </h2>
        <div className="text-center py-8">
          <div className="text-green-500 text-5xl mb-2">✓</div>
          <p className="text-gray-600 font-medium">¡Todos los alumnos están al día!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-500" />
        Alertas de Pagos
      </h2>
      
      <div className="space-y-3">
        {alerts.map((alert) => (
          <Link
            key={alert.studentId}
            href={`/students/${alert.studentId}/payments`}
            className="block p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{alert.studentName}</h3>
                {alert.belt && (
                  <p className="text-sm text-gray-600">Cinturón: {alert.belt}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {alert.monthsOwed} {alert.monthsOwed === 1 ? 'mes' : 'meses'} adeudado{alert.monthsOwed !== 1 ? 's' : ''}
                </p>
                {alert.lastPaymentDate && (
                  <p className="text-xs text-gray-400 mt-1">
                    Último pago: {format(new Date(alert.lastPaymentDate), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">
                  ${alert.totalDebt.toLocaleString('es-AR')}
                </div>
                <div className="text-xs text-gray-500">ARS</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">
            Total deuda: ${alerts.reduce((sum, a) => sum + a.totalDebt, 0).toLocaleString('es-AR')} ARS
          </span>
          <Link
            href="/payments"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todos los pagos →
          </Link>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
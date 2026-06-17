"use client"

import { useState, useEffect } from "react"
import { TrendingUp, DollarSign, Users, Calendar, Loader2 } from "lucide-react"

interface PaymentStats {
  totalStudents: number
  studentsPaid: number
  studentsWithDebt: number
  currentMonthRevenue: number
  currentYearRevenue: number
  totalRevenue: number
  totalDebt: number
  averageDebtPerStudent: number
}

export default function PaymentStats() {
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/payments/stats')
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Error fetching payment stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Cargando estadísticas...</span>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('es-AR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`
  }

  const currentMonth = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  const currentYear = new Date().getFullYear()

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Estadísticas de Pagos</h2>
        <button
          onClick={fetchStats}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Month Revenue */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Recaudado en {currentMonth}</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.currentMonthRevenue)}
          </p>
        </div>

        {/* Current Year Revenue */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Recaudado en {currentYear}</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats.currentYearRevenue)}
          </p>
        </div>

        {/* Total Revenue */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">Total Recaudado</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>

        {/* Average Debt */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Deuda Promedio</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(stats.averageDebtPerStudent)}
          </p>
        </div>
      </div>

      {/* Payment Rate Progress Bar */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Tasa de Pago
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {stats.totalStudents > 0 
              ? Math.round((stats.studentsPaid / stats.totalStudents) * 100)
              : 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-500"
            style={{
              width: stats.totalStudents > 0 
                ? `${(stats.studentsPaid / stats.totalStudents) * 100}%`
                : '0%'
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
          <span>{stats.studentsPaid} al día</span>
          <span>{stats.studentsWithDebt} con deuda</span>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
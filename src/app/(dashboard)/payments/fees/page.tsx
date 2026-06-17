"use client"

import { useState, useEffect } from "react"
import { DollarSign, Plus, Edit2, Calendar, ArrowLeft, Loader2, AlertCircle, Repeat } from "lucide-react"
import Link from "next/link"
import MonthlyFeeForm from "@/components/payments/MonthlyFeeForm"
import FrequencyRatesForm from "@/components/payments/FrequencyRatesForm"

interface MonthlyFee {
  id: string
  amount: number
  month: number
  year: number
  description?: string | null
  createdAt: Date
}

export default function FeesConfigPage() {
  const [fees, setFees] = useState<MonthlyFee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingFee, setEditingFee] = useState<MonthlyFee | null>(null)
  const [showFrequencyRates, setShowFrequencyRates] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    fetchFees()
  }, [])

  const fetchFees = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/payments/fees')
      
      if (!response.ok) {
        throw new Error('Failed to fetch fees')
      }

      const data = await response.json()
      setFees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching fees:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingFee(null)
    fetchFees()
  }

  const handleEdit = (fee: MonthlyFee) => {
    setEditingFee(fee)
    setShowForm(true)
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  // Group fees by year
  const feesByYear = fees.reduce((acc, fee) => {
    if (!acc[fee.year]) {
      acc[fee.year] = []
    }
    acc[fee.year].push(fee)
    return acc
  }, {} as Record<number, MonthlyFee[]>)

  const years = Object.keys(feesByYear).map(Number).sort((a, b) => b - a)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando cuotas...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Configuración de Cuotas</h1>
            <p className="text-gray-600 mt-1">
              Gestiona los valores de las cuotas mensuales
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingFee(null)
            setShowForm(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Cuota
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Error al cargar cuotas</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total de Cuotas Configuradas</p>
            <p className="text-4xl font-bold mt-2">{fees.length}</p>
          </div>
          <DollarSign className="h-16 w-16 text-blue-200 opacity-50" />
        </div>
      </div>

      {/* Fees by Year */}
      {fees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay cuotas configuradas
          </h3>
          <p className="text-gray-600 mb-6">
            Comienza configurando las cuotas mensuales para tu escuela.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Configurar Primera Cuota
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {years.map((year) => (
            <div key={year} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Año {year}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
                {feesByYear[year]
                  .sort((a, b) => a.month - b.month)
                  .map((fee) => (
                    <div
                      key={fee.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            {monthNames[fee.month - 1]}
                          </p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            ${Number(fee.amount).toLocaleString('es-AR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setSelectedYear(fee.year)
                              setSelectedMonth(fee.month)
                              setShowFrequencyRates(true)
                            }}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Configurar tarifas por frecuencia"
                          >
                            <Repeat className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(fee)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar cuota general"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {fee.description && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {fee.description}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Monthly Fee Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingFee ? 'Editar Cuota' : 'Nueva Cuota Mensual'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingFee(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <MonthlyFeeForm
                fee={editingFee}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowForm(false)
                  setEditingFee(null)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Frequency Rates Form Modal */}
      {showFrequencyRates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Repeat className="h-6 w-6 text-green-600" />
                  Tarifas por Frecuencia
                </h2>
                <button
                  onClick={() => setShowFrequencyRates(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <FrequencyRatesForm
                year={selectedYear}
                month={selectedMonth}
                onSuccess={() => {
                  // Optionally close modal or show success message
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Made with Bob
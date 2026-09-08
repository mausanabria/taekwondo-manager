"use client"

import { useState, useEffect } from "react"
import { DollarSign, Plus, Edit2, Calendar, ArrowLeft, Loader2, AlertCircle, Repeat, Home, Check, Clock, Trash2, Pencil } from "lucide-react"
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

interface MonthlyExpense {
  id: string
  month: number
  year: number
  amount: number
  description?: string | null
  isPaid: boolean
  paidDate?: string | null
}

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 4 }, (_, i) => currentYear - i)

export default function FeesConfigPage() {
  const [fees, setFees] = useState<MonthlyFee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingFee, setEditingFee] = useState<MonthlyFee | null>(null)
  const [showFrequencyRates, setShowFrequencyRates] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  // Expenses state
  const [expenses, setExpenses] = useState<MonthlyExpense[]>([])
  const [expenseYear, setExpenseYear] = useState(new Date().getFullYear())
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<MonthlyExpense | null>(null)
  const [expenseForm, setExpenseForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), amount: "", description: "" })
  const [savingExpense, setSavingExpense] = useState(false)

  useEffect(() => {
    fetchFees()
    fetchExpenses()
  }, [])

  const fetchFees = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/payments/fees')
      if (!response.ok) throw new Error('Failed to fetch fees')
      setFees(await response.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses')
      if (res.ok) setExpenses(await res.json())
    } catch (err) {
      console.error('Error fetching expenses:', err)
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

  const handleOpenExpenseForm = (expense?: MonthlyExpense) => {
    if (expense) {
      setEditingExpense(expense)
      setExpenseForm({ month: expense.month, year: expense.year, amount: String(expense.amount), description: expense.description || "" })
    } else {
      setEditingExpense(null)
      setExpenseForm({ month: new Date().getMonth() + 1, year: expenseYear, amount: "", description: "" })
    }
    setShowExpenseForm(true)
  }

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingExpense(true)
    try {
      if (editingExpense) {
        await fetch(`/api/expenses/${editingExpense.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: Number(expenseForm.amount), description: expenseForm.description }),
        })
      } else {
        await fetch('/api/expenses', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ month: expenseForm.month, year: expenseForm.year, amount: Number(expenseForm.amount), description: expenseForm.description }),
        })
      }
      setShowExpenseForm(false)
      setEditingExpense(null)
      await fetchExpenses()
    } finally {
      setSavingExpense(false)
    }
  }

  const handleTogglePaid = async (expense: MonthlyExpense) => {
    await fetch(`/api/expenses/${expense.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaid: !expense.isPaid }),
    })
    await fetchExpenses()
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("¿Eliminar este gasto?")) return
    await fetch(`/api/expenses/${id}`, { method: "DELETE" })
    await fetchExpenses()
  }

  const expensesByYear = expenses.reduce((acc, e) => {
    if (!acc[e.year]) acc[e.year] = []
    acc[e.year].push(e)
    return acc
  }, {} as Record<number, MonthlyExpense[]>)

  const filteredExpenses = (expensesByYear[expenseYear] || []).sort((a, b) => a.month - b.month)

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

      {/* ── Gastos Mensuales ───────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Home className="h-5 w-5 text-orange-500" />
              Gastos Mensuales
            </h2>
            <div className="flex items-center gap-3">
              <select
                value={expenseYear}
                onChange={(e) => setExpenseYear(Number(e.target.value))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
              >
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <button
                onClick={() => handleOpenExpenseForm()}
                className="px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Nuevo Gasto
              </button>
            </div>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <Home className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">No hay gastos registrados para {expenseYear}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Paid toggle */}
                  <button
                    onClick={() => handleTogglePaid(expense)}
                    title={expense.isPaid ? "Marcar como pendiente" : "Marcar como pagado"}
                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors border-2 ${
                      expense.isPaid
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-white border-gray-300 text-gray-300 hover:border-orange-400"
                    }`}
                  >
                    {expense.isPaid ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </button>
                  <div>
                    <p className="font-medium text-gray-900">
                      {monthNames[expense.month - 1]} {expense.year}
                    </p>
                    {expense.description && (
                      <p className="text-xs text-gray-500">{expense.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">
                      ${Number(expense.amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-xs font-medium ${expense.isPaid ? "text-green-600" : "text-amber-600"}`}>
                      {expense.isPaid ? "✓ Pagado" : "Pendiente"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenExpenseForm(expense)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Home className="h-5 w-5 text-orange-500" />
                  {editingExpense ? "Editar Gasto" : "Nuevo Gasto"}
                </h2>
                <button onClick={() => setShowExpenseForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
              <form onSubmit={handleSaveExpense} className="space-y-4">
                {!editingExpense && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                      <select
                        value={expenseForm.month}
                        onChange={(e) => setExpenseForm({ ...expenseForm, month: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
                      >
                        {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                      <select
                        value={expenseForm.year}
                        onChange={(e) => setExpenseForm({ ...expenseForm, year: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
                      >
                        {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="Ej: 50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    placeholder="Ej: Alquiler del salón"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowExpenseForm(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                    Cancelar
                  </button>
                  <button type="submit" disabled={savingExpense} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium disabled:opacity-50">
                    {savingExpense ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {savingExpense ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
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
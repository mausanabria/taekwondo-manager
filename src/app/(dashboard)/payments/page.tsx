"use client"

import { useState, useEffect } from "react"
import { DollarSign, Search, Filter, Plus, TrendingUp, Users, AlertCircle } from "lucide-react"
import Link from "next/link"
import PaymentList from "@/components/payments/PaymentList"
import PaymentForm from "@/components/payments/PaymentForm"
import PaymentStats from "@/components/payments/PaymentStats"

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

export default function PaymentsPage() {
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatus[]>([])
  const [filteredStatuses, setFilteredStatuses] = useState<PaymentStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'debt'>('all')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentStatuses()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [paymentStatuses, searchTerm, filterStatus])

  const fetchPaymentStatuses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/payments/status')
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment statuses')
      }
      
      const data = await response.json()
      setPaymentStatuses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching payment statuses:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterPayments = () => {
    let filtered = paymentStatuses

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(status =>
        status.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (filterStatus === 'paid') {
      filtered = filtered.filter(status => status.totalDebt === 0)
    } else if (filterStatus === 'debt') {
      filtered = filtered.filter(status => status.totalDebt > 0)
    }

    setFilteredStatuses(filtered)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false)
    setSelectedStudentId(null)
    fetchPaymentStatuses()
  }

  const handleRegisterPayment = (studentId?: string) => {
    setSelectedStudentId(studentId || null)
    setShowPaymentForm(true)
  }

  // Calculate summary statistics
  const totalStudents = paymentStatuses.length
  const studentsPaid = paymentStatuses.filter(s => s.totalDebt === 0).length
  const studentsWithDebt = paymentStatuses.filter(s => s.totalDebt > 0).length
  const totalDebt = paymentStatuses.reduce((sum, s) => sum + s.totalDebt, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de pagos...</p>
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
            <h3 className="font-semibold">Error al cargar pagos</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Pagos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los pagos y cuotas de tus alumnos
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/payments/fees"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Configurar Cuotas
          </Link>
          <button
            onClick={() => handleRegisterPayment()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Registrar Pago
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Alumnos</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Al Día</p>
              <p className="text-2xl font-bold text-green-600">{studentsPaid}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Con Deuda</p>
              <p className="text-2xl font-bold text-red-600">{studentsWithDebt}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Deuda Total</p>
              <p className="text-2xl font-bold text-orange-600">
                ${totalDebt.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Payment Statistics Component */}
      <PaymentStats />

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar alumno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'paid' | 'debt')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="paid">Al día</option>
              <option value="debt">Con deuda</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <PaymentList
        paymentStatuses={filteredStatuses}
        onRegisterPayment={handleRegisterPayment}
        onRefresh={fetchPaymentStatuses}
      />

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Registrar Pago</h2>
                <button
                  onClick={() => {
                    setShowPaymentForm(false)
                    setSelectedStudentId(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <PaymentForm
                studentId={selectedStudentId}
                onSuccess={handlePaymentSuccess}
                onCancel={() => {
                  setShowPaymentForm(false)
                  setSelectedStudentId(null)
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

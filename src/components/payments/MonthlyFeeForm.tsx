"use client"

import { useState, useEffect } from "react"
import { DollarSign, Calendar, FileText, AlertCircle, Loader2, Copy, Clock } from "lucide-react"

interface ScheduleFeeValue {
  scheduleId: string
  amount: number
}

interface MonthlyFee {
  id: string
  amount: number
  month: number
  year: number
  description?: string | null
  scheduleFees?: ScheduleFeeValue[]
}

interface ScheduleOption {
  id: string
  name: string
  startTime: string
  endTime: string
  daysOfWeek?: number[]
  dayOfWeek: number
}

interface MonthlyFeeFormProps {
  fee?: MonthlyFee | null
  onSuccess: () => void
  onCancel: () => void
}

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

const formatScheduleDays = (s: ScheduleOption) => {
  const days = s.daysOfWeek && s.daysOfWeek.length > 0 ? s.daysOfWeek : [s.dayOfWeek]
  return days.map((d) => DAY_SHORT[d]).join(", ")
}

// Convierte las cuotas por clase guardadas en el estado del formulario (texto por clase)
const toInputMap = (values?: ScheduleFeeValue[]) => {
  const map: Record<string, string> = {}
  values?.forEach((v) => {
    map[v.scheduleId] = String(v.amount)
  })
  return map
}

export default function MonthlyFeeForm({ fee, onSuccess, onCancel }: MonthlyFeeFormProps) {
  const currentDate = new Date()
  const [month, setMonth] = useState(fee?.month || currentDate.getMonth() + 1)
  const [year, setYear] = useState(fee?.year || currentDate.getFullYear())
  const [amount, setAmount] = useState(fee?.amount.toString() || "")
  const [description, setDescription] = useState(fee?.description || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFee, setLastFee] = useState<MonthlyFee | null>(null)
  const [schedules, setSchedules] = useState<ScheduleOption[]>([])
  const [scheduleAmounts, setScheduleAmounts] = useState<Record<string, string>>(
    toInputMap(fee?.scheduleFees)
  )

  useEffect(() => {
    if (!fee) {
      fetchLastFee()
    }
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedules')
      if (response.ok) {
        const data: ScheduleOption[] = await response.json()
        setSchedules([...data].sort((a, b) => a.startTime.localeCompare(b.startTime)))
      }
    } catch (err) {
      console.error('Error fetching schedules:', err)
    }
  }

  const fetchLastFee = async () => {
    try {
      const response = await fetch('/api/payments/fees')
      if (response.ok) {
        const fees = await response.json()
        if (fees.length > 0) {
          // Get the most recent fee
          const sorted = fees.sort((a: MonthlyFee, b: MonthlyFee) => {
            if (a.year !== b.year) return b.year - a.year
            return b.month - a.month
          })
          setLastFee(sorted[0])
        }
      }
    } catch (err) {
      console.error('Error fetching last fee:', err)
    }
  }

  const copyFromLastFee = () => {
    if (lastFee) {
      setAmount(lastFee.amount.toString())
      setDescription(lastFee.description || "")
      setScheduleAmounts(toInputMap(lastFee.scheduleFees))
    }
  }

  const handleScheduleAmountChange = (scheduleId: string, value: string) => {
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setScheduleAmounts((prev) => ({ ...prev, [scheduleId]: value }))
    }
  }

  // Cuotas por clase a enviar. Al editar se envían todas las clases: vacío = quitar la cuota propia.
  const buildScheduleFees = () => {
    const items = schedules.map((s) => {
      const raw = scheduleAmounts[s.id]
      const parsed = raw ? parseFloat(raw) : NaN
      return { scheduleId: s.id, amount: parsed > 0 ? parsed : null }
    })
    return fee ? items : items.filter((i) => i.amount !== null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || parseFloat(amount) <= 0) {
      setError("El monto debe ser mayor a 0")
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (fee) {
        // Update existing fee
        const response = await fetch(`/api/payments/fees?id=${fee.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            scheduleFees: buildScheduleFees()
          })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to update fee')
        }
      } else {
        // Create new fee
        const response = await fetch('/api/payments/fees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            month,
            year,
            amount: parseFloat(amount),
            description: description || null,
            scheduleFees: buildScheduleFees()
          })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to create fee')
        }
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

      {/* Copy from last fee */}
      {!fee && lastFee && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-800 mb-1">
                Última cuota configurada
              </p>
              <p className="text-sm text-blue-700">
                {monthNames[lastFee.month - 1]} {lastFee.year}: ${Number(lastFee.amount).toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={copyFromLastFee}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copiar
            </button>
          </div>
        </div>
      )}

      {/* Month and Year (only for new fees) */}
      {!fee && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
              Mes *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                id="month"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                disabled={loading}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                {monthNames.map((name, index) => (
                  <option key={index + 1} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
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
      )}

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Cuota base * <span className="text-gray-500 font-normal">(ARS)</span>
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
        <p className="text-xs text-gray-500 mt-1">
          Valor de la cuota mensual para {fee ? `${monthNames[fee.month - 1]} ${fee.year}` : 'el período seleccionado'}.
          Se usa en las clases que no tengan un precio propio.
        </p>
      </div>

      {/* Per-class prices */}
      {schedules.length > 0 && (
        <div>
          <div className="mb-2">
            <p className="block text-sm font-medium text-gray-700">
              Precio por clase <span className="text-gray-500 font-normal">(opcional)</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Si das clases en lugares distintos o con precios diferentes, pon el precio de cada una.
              Si lo dejas vacío, esa clase usa la cuota base.
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{schedule.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatScheduleDays(schedule)} · {schedule.startTime} - {schedule.endTime}
                  </p>
                </div>
                <div className="relative w-40 flex-shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={scheduleAmounts[schedule.id] ?? ""}
                    onChange={(e) => handleScheduleAmountChange(schedule.id, e.target.value)}
                    disabled={loading}
                    placeholder={amount ? `${amount} (base)` : "Cuota base"}
                    aria-label={`Precio de ${schedule.name}`}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description (only for new fees) */}
      {!fee && (
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción <span className="text-gray-500 font-normal">(opcional)</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
              maxLength={500}
              placeholder="Ej: Incluye seguro, materiales, etc."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {description.length}/500 caracteres
          </p>
        </div>
      )}

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
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {fee ? 'Actualizando...' : 'Guardando...'}
            </>
          ) : (
            <>
              <DollarSign className="h-4 w-4" />
              {fee ? 'Actualizar Cuota' : 'Guardar Cuota'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// Made with Bob
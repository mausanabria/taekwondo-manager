"use client"

import { useState, useEffect } from "react"
import { Loader2, Save, AlertCircle } from "lucide-react"

interface FrequencyRate {
  weeklyFrequency: number
  amount: number
}

interface FrequencyRatesFormProps {
  year: number
  month: number
  onSuccess?: () => void
}

const FREQUENCY_LABELS: Record<number, string> = {
  1: "1x por semana",
  2: "2x por semana",
  3: "3x por semana",
  4: "4x por semana",
  5: "5x por semana",
  6: "6x por semana",
  7: "7x por semana (todos los días)",
}

export default function FrequencyRatesForm({ year, month, onSuccess }: FrequencyRatesFormProps) {
  const [rates, setRates] = useState<Record<number, string>>({
    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
    6: "",
    7: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchRates()
  }, [year, month])

  const fetchRates = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/frequency-rates?year=${year}&month=${month}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar tarifas')
      }

      const data = await response.json()
      
      // Populate rates from API
      const newRates: Record<number, string> = { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "" }
      data.rates.forEach((rate: FrequencyRate) => {
        newRates[rate.weeklyFrequency] = rate.amount.toString()
      })
      
      setRates(newRates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tarifas')
      console.error('Error fetching frequency rates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRateChange = (frequency: number, value: string) => {
    // Allow only numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setRates(prev => ({ ...prev, [frequency]: value }))
      setSuccess(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      // Filter out empty rates and convert to numbers
      const validRates: FrequencyRate[] = Object.entries(rates)
        .filter(([_, amount]) => amount !== "" && parseFloat(amount) > 0)
        .map(([frequency, amount]) => ({
          weeklyFrequency: parseInt(frequency),
          amount: parseFloat(amount),
        }))

      if (validRates.length === 0) {
        setError("Debes configurar al menos una tarifa")
        return
      }

      const response = await fetch('/api/frequency-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year,
          month,
          rates: validRates,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al guardar tarifas')
      }

      setSuccess(true)
      
      if (onSuccess) {
        onSuccess()
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar tarifas')
      console.error('Error saving frequency rates:', err)
    } finally {
      setSaving(false)
    }
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          Tarifas por Frecuencia - {monthNames[month - 1]} {year}
        </h3>
        <p className="text-sm text-blue-700">
          Configura las tarifas mensuales según la frecuencia de asistencia semanal. 
          Estas tarifas se aplicarán automáticamente a todos los alumnos según su frecuencia.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-medium text-green-800">
            ✓ Tarifas guardadas correctamente
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(FREQUENCY_LABELS).map(([frequency, label]) => (
          <div key={frequency} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="text"
                value={rates[parseInt(frequency)]}
                onChange={(e) => handleRateChange(parseInt(frequency), e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Nota:</strong> Al guardar estas tarifas, se aplicarán automáticamente a todos los alumnos 
          con la frecuencia correspondiente. Las tarifas personalizadas de alumnos individuales tienen prioridad.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar Tarifas
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// Made with Bob
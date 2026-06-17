"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar, AlertCircle, X } from "lucide-react"

interface Enrollment {
  id: string
  weeklyFrequency: number
  monthlyFee: number | null
  student: {
    firstName: string
    lastName: string
  }
  schedule: {
    name: string
  }
}

interface ChangeFrequencyDialogProps {
  enrollment: Enrollment
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ChangeFrequencyDialog({
  enrollment,
  open,
  onOpenChange,
  onSuccess,
}: ChangeFrequencyDialogProps) {
  const [frequency, setFrequency] = useState(enrollment.weeklyFrequency)
  const [useCustomFee, setUseCustomFee] = useState(!!enrollment.monthlyFee)
  const [customFee, setCustomFee] = useState(
    enrollment.monthlyFee ? Number(enrollment.monthlyFee) : 0
  )
  const [effectiveFrom, setEffectiveFrom] = useState(
    format(new Date(), "yyyy-MM-dd")
  )
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch(
        `/api/student-schedules/${enrollment.id}/change-frequency`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            weeklyFrequency: frequency,
            monthlyFee: useCustomFee ? customFee : null,
            effectiveFrom: new Date(effectiveFrom).toISOString(),
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to change frequency")
      }

      onOpenChange(false)
      onSuccess?.()
      setError(null)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-[500px] w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Cambiar Frecuencia
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {enrollment.student.firstName} {enrollment.student.lastName} -{" "}
              {enrollment.schedule.name}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Current Frequency */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900">
              Frecuencia Actual
            </p>
            <p className="text-lg font-semibold text-blue-700 mt-1">
              {enrollment.weeklyFrequency}x por semana
            </p>
            {enrollment.monthlyFee && (
              <p className="text-sm text-blue-600 mt-1">
                Cuota personalizada: ${Number(enrollment.monthlyFee).toLocaleString()}
              </p>
            )}
          </div>

          {/* New Frequency */}
          <div className="space-y-2">
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
              Nueva Frecuencia
            </label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1">1x por semana</option>
              <option value="2">2x por semana</option>
              <option value="3">3x por semana</option>
              <option value="4">4x por semana</option>
              <option value="5">5x por semana</option>
              <option value="6">6x por semana</option>
              <option value="7">7x por semana</option>
            </select>
          </div>

          {/* Effective Date */}
          <div className="space-y-2">
            <label htmlFor="effectiveFrom" className="block text-sm font-medium text-gray-700">
              <Calendar className="inline w-4 h-4 mr-1" />
              Efectivo Desde
            </label>
            <input
              id="effectiveFrom"
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600">
              💡 Puedes seleccionar cualquier fecha, incluyendo fechas pasadas. Los meses anteriores mantendrán la frecuencia anterior para cálculos de deuda.
            </p>
          </div>

          {/* Custom Fee */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                id="useCustomFee"
                type="checkbox"
                checked={useCustomFee}
                onChange={(e) => setUseCustomFee(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="useCustomFee" className="text-sm font-medium text-gray-700 cursor-pointer">
                Usar cuota personalizada
              </label>
            </div>

            {useCustomFee && (
              <div className="space-y-2">
                <label htmlFor="customFee" className="block text-sm font-medium text-gray-700">
                  Monto Personalizado
                </label>
                <input
                  id="customFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={customFee}
                  onChange={(e) => setCustomFee(Number(e.target.value))}
                  placeholder="Ej: 10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-900 mb-2">
                  Vista Previa del Cambio
                </p>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p>
                    • Meses anteriores a {format(new Date(effectiveFrom), "dd/MM/yyyy")}:{" "}
                    <strong>{enrollment.weeklyFrequency}x/semana</strong>
                  </p>
                  <p>
                    • Desde {format(new Date(effectiveFrom), "dd/MM/yyyy")}:{" "}
                    <strong>{frequency}x/semana</strong>
                  </p>
                  {useCustomFee && (
                    <p>
                      • Cuota personalizada: <strong>${customFee.toLocaleString()}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Guardando..."
                : "Guardar Cambio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Made with Bob

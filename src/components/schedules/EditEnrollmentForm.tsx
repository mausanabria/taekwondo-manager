"use client"

import { useState } from "react"
import { X, Loader2, Save, Info } from "lucide-react"

interface EditEnrollmentFormProps {
  scheduleId: string
  studentId: string
  studentName: string
  currentFrequency: number
  currentMonthlyFee?: number | null
  currentNotes?: string | null
  onClose: () => void
  onSuccess: () => void
}

export function EditEnrollmentForm({
  scheduleId,
  studentId,
  studentName,
  currentFrequency,
  currentMonthlyFee,
  currentNotes,
  onClose,
  onSuccess
}: EditEnrollmentFormProps) {
  const [weeklyFrequency, setWeeklyFrequency] = useState<number>(currentFrequency)
  const [monthlyFee, setMonthlyFee] = useState<string>(
    currentMonthlyFee ? currentMonthlyFee.toString() : ""
  )
  const [notes, setNotes] = useState<string>(currentNotes || "")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const updateData: any = {
        weeklyFrequency
      }

      // Handle monthlyFee - send null if empty, otherwise send the number
      if (monthlyFee.trim() === "") {
        updateData.monthlyFee = null
      } else {
        const feeValue = parseFloat(monthlyFee)
        if (isNaN(feeValue) || feeValue < 0) {
          throw new Error("La cuota mensual debe ser un número positivo")
        }
        updateData.monthlyFee = feeValue
      }

      // Handle notes - send null if empty
      updateData.notes = notes.trim() || null

      const response = await fetch(`/api/schedules/${scheduleId}/students/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al actualizar la inscripción")
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || "Error al actualizar la inscripción")
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Editar Inscripción</h2>
            <p className="mt-1 text-sm text-gray-500">
              Modificar frecuencia y cuota de {studentName}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Weekly Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frecuencia Semanal <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setWeeklyFrequency(freq)}
                    disabled={isSaving}
                    className={`px-4 py-2 text-sm font-medium rounded-md border ${
                      weeklyFrequency === freq
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    } disabled:opacity-50`}
                  >
                    {freq}x
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Selecciona cuántas veces por semana asistirá el alumno
              </p>
            </div>

            {/* Monthly Fee */}
            <div>
              <label htmlFor="monthlyFee" className="block text-sm font-medium text-gray-700 mb-2">
                Cuota Mensual Personalizada (opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="monthlyFee"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isSaving}
                  className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                />
              </div>
              <div className="mt-2 flex items-start gap-2 text-xs text-gray-500">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Dejar vacío para usar la cuota general de la escuela. Si se especifica, esta cuota personalizada se usará para este alumno.
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notas del Plan (opcional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Ej: Plan 2x semana - Lunes y Miércoles"
                disabled={isSaving}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
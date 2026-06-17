"use client"

import { useState, useEffect } from "react"
import { Schedule } from "@/types"
import { Loader2, Save, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface ScheduleFormProps {
  schedule?: Schedule
  mode: "create" | "edit"
}

const DAY_OPTIONS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" }
]

export function ScheduleForm({ schedule, mode }: ScheduleFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Initialize selectedDays from schedule data
  const [selectedDays, setSelectedDays] = useState<number[]>(() => {
    if (schedule) {
      // If schedule has daysOfWeek array, use it; otherwise use dayOfWeek as fallback
      return (schedule as any).daysOfWeek && (schedule as any).daysOfWeek.length > 0
        ? (schedule as any).daysOfWeek
        : [schedule.dayOfWeek]
    }
    return [1] // Default to Monday
  })

  const [formData, setFormData] = useState({
    name: schedule?.name || "",
    startTime: schedule?.startTime || "18:00",
    endTime: schedule?.endTime || "19:00",
    capacity: schedule?.capacity?.toString() || ""
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "El nombre es requerido"
    }

    if (selectedDays.length === 0) {
      errors.daysOfWeek = "Debes seleccionar al menos un día"
    }

    if (!formData.startTime) {
      errors.startTime = "La hora de inicio es requerida"
    }

    if (!formData.endTime) {
      errors.endTime = "La hora de fin es requerida"
    }

    // Validate that endTime is after startTime
    if (formData.startTime && formData.endTime) {
      const [startHour, startMinute] = formData.startTime.split(':').map(Number)
      const [endHour, endMinute] = formData.endTime.split(':').map(Number)
      
      const startMinutes = startHour * 60 + startMinute
      const endMinutes = endHour * 60 + endMinute
      
      if (endMinutes <= startMinutes) {
        errors.endTime = "La hora de fin debe ser posterior a la hora de inicio"
      }
    }

    if (formData.capacity && parseInt(formData.capacity) <= 0) {
      errors.capacity = "La capacidad debe ser un número positivo"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const payload = {
        name: formData.name.trim(),
        daysOfWeek: selectedDays,
        dayOfWeek: selectedDays[0], // First day as primary for compatibility
        startTime: formData.startTime,
        endTime: formData.endTime,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      }

      const url = mode === "create"
        ? "/api/schedules"
        : `/api/schedules/${schedule?.id}`

      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al guardar el horario")
      }

      setSuccess(true)
      
      // Redirect after success
      setTimeout(() => {
        router.push("/schedules")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Error al guardar el horario")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          <strong className="font-bold">¡Éxito! </strong>
          <span className="block sm:inline">
            Horario {mode === "create" ? "creado" : "actualizado"} correctamente. Redirigiendo...
          </span>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Horario <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            validationErrors.name ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Ej: Clase Principiantes"
          disabled={isSubmitting}
        />
        {validationErrors.name && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
        )}
      </div>

      {/* Days of Week - Multiple Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Días de la Semana <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DAY_OPTIONS.map((day) => (
            <label
              key={day.value}
              className={`
                flex items-center gap-2 p-3 border rounded-lg cursor-pointer
                transition-colors
                ${selectedDays.includes(day.value)
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                  : 'bg-white border-gray-300 hover:border-gray-400'
                }
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="checkbox"
                checked={selectedDays.includes(day.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedDays([...selectedDays, day.value].sort())
                  } else {
                    setSelectedDays(selectedDays.filter(d => d !== day.value))
                  }
                  // Clear validation error
                  if (validationErrors.daysOfWeek) {
                    setValidationErrors(prev => {
                      const newErrors = { ...prev }
                      delete newErrors.daysOfWeek
                      return newErrors
                    })
                  }
                }}
                disabled={isSubmitting}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="font-medium text-gray-900">{day.label}</span>
            </label>
          ))}
        </div>
        
        {/* Preview of selected days */}
        {selectedDays.length > 0 && (
          <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Días seleccionados:</strong> {selectedDays.map(d =>
                DAY_OPTIONS.find(day => day.value === d)?.label
              ).join(', ')}
            </p>
          </div>
        )}
        
        {/* Validation error */}
        {validationErrors.daysOfWeek && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.daysOfWeek}</p>
        )}
        
        {selectedDays.length === 0 && !validationErrors.daysOfWeek && (
          <p className="mt-1 text-sm text-gray-500">
            Selecciona uno o más días de la semana para este horario
          </p>
        )}
      </div>

      {/* Time Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Time */}
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
            Hora de Inicio <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            id="startTime"
            value={formData.startTime}
            onChange={(e) => handleChange("startTime", e.target.value)}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              validationErrors.startTime ? "border-red-300" : "border-gray-300"
            }`}
            disabled={isSubmitting}
          />
          {validationErrors.startTime && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.startTime}</p>
          )}
        </div>

        {/* End Time */}
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
            Hora de Fin <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            id="endTime"
            value={formData.endTime}
            onChange={(e) => handleChange("endTime", e.target.value)}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              validationErrors.endTime ? "border-red-300" : "border-gray-300"
            }`}
            disabled={isSubmitting}
          />
          {validationErrors.endTime && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.endTime}</p>
          )}
        </div>
      </div>

      {/* Capacity */}
      <div>
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
          Capacidad Máxima (opcional)
        </label>
        <input
          type="number"
          id="capacity"
          value={formData.capacity}
          onChange={(e) => handleChange("capacity", e.target.value)}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            validationErrors.capacity ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Dejar vacío para sin límite"
          min="1"
          disabled={isSubmitting}
        />
        {validationErrors.capacity && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.capacity}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Número máximo de alumnos que pueden inscribirse en este horario
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin w-5 h-5 mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              {mode === "create" ? "Crear Horario" : "Guardar Cambios"}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push("/schedules")}
          disabled={isSubmitting}
          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <X className="w-5 h-5 mr-2" />
          Cancelar
        </button>
      </div>
    </form>
  )
}

// Made with Bob
"use client"

import { useState, useEffect } from "react"
import { Schedule } from "@/types"
import { ScheduleForm } from "@/components/schedules/ScheduleForm"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function EditSchedulePage() {
  const params = useParams()
  const scheduleId = params.id as string

  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSchedule()
  }, [scheduleId])

  const fetchSchedule = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/schedules/${scheduleId}`)

      if (!response.ok) {
        throw new Error("Error al cargar el horario")
      }

      const data = await response.json()
      setSchedule(data)
    } catch (err: any) {
      setError(err.message || "Error al cargar el horario")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando horario...</p>
        </div>
      </div>
    )
  }

  if (error || !schedule) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error || "Horario no encontrado"}</span>
          <Link
            href="/schedules"
            className="mt-2 text-sm underline block"
          >
            Volver a Horarios
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/schedules"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver a Horarios
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Editar Horario</h1>
        <p className="mt-2 text-sm text-gray-600">
          Modifica la información del horario "{schedule.name}"
        </p>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <ScheduleForm schedule={schedule} mode="edit" />
      </div>
    </div>
  )
}

// Made with Bob
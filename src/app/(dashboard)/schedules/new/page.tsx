import { ScheduleForm } from "@/components/schedules/ScheduleForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewSchedulePage() {
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
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Horario</h1>
        <p className="mt-2 text-sm text-gray-600">
          Crea un nuevo horario de clase para tu escuela
        </p>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <ScheduleForm mode="create" />
      </div>
    </div>
  )
}

// Made with Bob
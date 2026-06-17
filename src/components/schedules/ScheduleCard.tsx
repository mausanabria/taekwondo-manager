"use client"

import { Schedule } from "@/types"
import { Clock, Users, Calendar } from "lucide-react"
import Link from "next/link"

interface ScheduleWithCount extends Schedule {
  _count?: {
    enrollments: number
  }
}

interface ScheduleCardProps {
  schedule: ScheduleWithCount
}

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado"
]

const DAY_COLORS: Record<number, string> = {
  0: "bg-purple-100 text-purple-800",
  1: "bg-blue-100 text-blue-800",
  2: "bg-green-100 text-green-800",
  3: "bg-yellow-100 text-yellow-800",
  4: "bg-orange-100 text-orange-800",
  5: "bg-red-100 text-red-800",
  6: "bg-pink-100 text-pink-800"
}

export function ScheduleCard({ schedule }: ScheduleCardProps) {
  const enrolledCount = schedule._count?.enrollments || 0
  const capacityText = schedule.capacity 
    ? `${enrolledCount}/${schedule.capacity}`
    : `${enrolledCount}`
  const dayColor = DAY_COLORS[schedule.dayOfWeek] || "bg-gray-100 text-gray-800"

  return (
    <Link
      href={`/schedules/${schedule.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
    >
      {/* Day Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${dayColor}`}>
          {DAY_NAMES[schedule.dayOfWeek]}
        </span>
        {!schedule.isActive && (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Inactivo
          </span>
        )}
      </div>

      {/* Schedule Name */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        {schedule.name}
      </h3>

      {/* Schedule Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{schedule.startTime} - {schedule.endTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{capacityText} alumnos</span>
        </div>
      </div>

      {/* Capacity Bar */}
      {schedule.capacity && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                enrolledCount >= schedule.capacity
                  ? "bg-red-500"
                  : enrolledCount >= schedule.capacity * 0.8
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min((enrolledCount / schedule.capacity) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {enrolledCount >= schedule.capacity
              ? "Capacidad completa"
              : `${schedule.capacity - enrolledCount} lugares disponibles`}
          </p>
        </div>
      )}
    </Link>
  )
}

// Made with Bob
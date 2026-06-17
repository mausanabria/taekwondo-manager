"use client"

import Link from "next/link"
import { UpcomingClass } from "@/services/dashboardService"
import { Clock, Users, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface UpcomingClassesProps {
  classes: UpcomingClass[]
}

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function UpcomingClasses({ classes }: UpcomingClassesProps) {
  if (classes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Clases Próximas</h2>
        <p className="text-gray-500 text-center py-8">No hay clases programadas para hoy o mañana</p>
      </div>
    )
  }

  const today = new Date().getDay()

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Clases Próximas</h2>
      
      <div className="space-y-3">
        {classes.map((classItem) => {
          const isToday = classItem.dayOfWeek === today
          
          return (
            <div
              key={classItem.id}
              className={`p-4 rounded-lg border-2 ${
                isToday 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{classItem.name}</h3>
                    {isToday && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                        Hoy
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {dayNames[classItem.dayOfWeek]}
                  </p>
                </div>
                {classItem.hasAttendanceToday && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{classItem.startTime} - {classItem.endTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{classItem.enrolledCount} alumnos</span>
                </div>
              </div>

              {isToday && !classItem.hasAttendanceToday && (
                <Link
                  href={`/attendance?schedule=${classItem.id}`}
                  className="mt-3 block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors text-sm font-medium"
                >
                  Marcar Asistencia
                </Link>
              )}

              {classItem.hasAttendanceToday && (
                <div className="mt-3 text-center text-sm text-green-600 font-medium">
                  ✓ Asistencia registrada
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          href="/schedules"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver todos los horarios →
        </Link>
      </div>
    </div>
  )
}

// Made with Bob
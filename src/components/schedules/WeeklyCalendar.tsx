"use client"

import { Schedule } from "@/types"
import { Clock, Users } from "lucide-react"
import Link from "next/link"

interface ScheduleWithCount extends Schedule {
  _count?: {
    enrollments: number
  }
}

interface WeeklyCalendarProps {
  schedules: ScheduleWithCount[]
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

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6) // 6 AM to 8 PM

export function WeeklyCalendar({ schedules }: WeeklyCalendarProps) {
  // Group schedules by day
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.dayOfWeek]) {
      acc[schedule.dayOfWeek] = []
    }
    acc[schedule.dayOfWeek].push(schedule)
    return acc
  }, {} as Record<number, ScheduleWithCount[]>)

  const getSchedulePosition = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    
    const startMinutes = (startHour - 6) * 60 + startMinute
    const endMinutes = (endHour - 6) * 60 + endMinute
    const duration = endMinutes - startMinutes
    
    return {
      top: `${(startMinutes / 60) * 4}rem`, // 4rem per hour
      height: `${(duration / 60) * 4}rem`
    }
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No hay horarios para mostrar en el calendario</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Calendar Grid */}
          <div className="flex">
            {/* Time Column */}
            <div className="flex-shrink-0 w-20 border-r border-gray-200">
              <div className="h-12 border-b border-gray-200"></div>
              {HOURS.map((hour) => (
                <div key={hour} className="h-16 border-b border-gray-200 px-2 py-1 text-xs text-gray-500">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Days Columns */}
            {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => {
              const daySchedules = schedulesByDay[dayOfWeek] || []
              
              return (
                <div key={dayOfWeek} className="flex-1 min-w-[150px] border-r border-gray-200 last:border-r-0">
                  {/* Day Header */}
                  <div className="h-12 border-b border-gray-200 px-2 py-2 bg-gray-50">
                    <div className="text-sm font-semibold text-gray-900 text-center">
                      {DAY_NAMES[dayOfWeek]}
                    </div>
                  </div>

                  {/* Day Content */}
                  <div className="relative" style={{ height: `${HOURS.length * 4}rem` }}>
                    {/* Hour Lines */}
                    {HOURS.map((hour, index) => (
                      <div
                        key={hour}
                        className="absolute w-full border-b border-gray-100"
                        style={{ top: `${index * 4}rem`, height: '4rem' }}
                      />
                    ))}

                    {/* Schedules */}
                    {daySchedules.map((schedule) => {
                      const position = getSchedulePosition(schedule.startTime, schedule.endTime)
                      const enrolledCount = schedule._count?.enrollments || 0
                      const capacityText = schedule.capacity 
                        ? `${enrolledCount}/${schedule.capacity}`
                        : `${enrolledCount}`

                      return (
                        <Link
                          key={schedule.id}
                          href={`/schedules/${schedule.id}`}
                          className="absolute left-1 right-1 bg-blue-100 border-l-4 border-blue-500 rounded p-2 hover:bg-blue-200 transition-colors overflow-hidden"
                          style={{
                            top: position.top,
                            height: position.height,
                            minHeight: '3rem'
                          }}
                        >
                          <div className="text-xs font-semibold text-blue-900 truncate">
                            {schedule.name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-blue-700 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{schedule.startTime}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-blue-700">
                            <Users className="w-3 h-3" />
                            <span>{capacityText}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-l-4 border-blue-500 rounded"></div>
            <span>Horario de clase</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Hora de inicio</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Alumnos inscritos</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
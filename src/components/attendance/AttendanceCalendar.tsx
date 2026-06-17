"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from "date-fns"
import { es } from "date-fns/locale"

interface AttendanceRecord {
  date: Date
  wasPresent: boolean
}

interface AttendanceCalendarProps {
  attendances: AttendanceRecord[]
  onDateClick?: (date: Date) => void
  maxDate?: Date
}

export default function AttendanceCalendar({
  attendances,
  onDateClick,
  maxDate = new Date()
}: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1)
    if (nextMonth <= maxDate) {
      setCurrentMonth(nextMonth)
    }
  }

  const getAttendanceForDate = (date: Date) => {
    return attendances.find((a) => isSameDay(new Date(a.date), date))
  }

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = monthStart.getDay()

    // Create array with empty slots for days before month starts
    const calendarDays = Array(firstDayOfMonth).fill(null).concat(days)

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const attendance = getAttendanceForDate(day)
          const isToday = isSameDay(day, new Date())
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isFuture = day > maxDate

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateClick && !isFuture && onDateClick(day)}
              disabled={isFuture || !onDateClick}
              className={`aspect-square p-1 rounded-lg border transition-all ${
                !isCurrentMonth
                  ? "bg-gray-50 text-gray-400 border-gray-100"
                  : attendance?.wasPresent
                  ? "bg-green-100 border-green-300 text-green-900 hover:bg-green-200"
                  : attendance && !attendance.wasPresent
                  ? "bg-red-100 border-red-300 text-red-900 hover:bg-red-200"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              } ${isToday ? "ring-2 ring-blue-500" : ""} ${
                isFuture ? "opacity-50 cursor-not-allowed" : ""
              } ${onDateClick && !isFuture ? "cursor-pointer" : ""}`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-sm font-medium">{format(day, "d")}</span>
                {attendance && (
                  <span
                    className={`text-xs mt-0.5 ${
                      attendance.wasPresent ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {attendance.wasPresent ? "✓" : "✗"}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  const canGoNext =
    addMonths(currentMonth, 1).getTime() <= maxDate.getTime()

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePreviousMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Mes anterior"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>

        <h3 className="text-lg font-semibold text-gray-900 capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h3>

        <button
          onClick={handleNextMonth}
          disabled={!canGoNext}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Mes siguiente"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar grid */}
      {renderCalendar()}

      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-xs text-gray-600">Presente</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-xs text-gray-600">Ausente</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
          <span className="text-xs text-gray-600">Sin registro</span>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
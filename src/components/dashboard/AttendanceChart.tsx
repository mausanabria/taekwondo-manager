"use client"

import { AttendanceTrend } from "@/services/dashboardService"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface AttendanceChartProps {
  trends: AttendanceTrend[]
}

export function AttendanceChart({ trends }: AttendanceChartProps) {
  if (trends.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Tendencia de Asistencia</h2>
        <p className="text-gray-500 text-center py-8">No hay datos de asistencia</p>
      </div>
    )
  }

  const maxAttendances = Math.max(...trends.map(t => t.totalAttendances), 1)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Tendencia de Asistencia (Últimos 7 días)</h2>
      
      <div className="space-y-4">
        {/* Chart */}
        <div className="flex items-end justify-between h-48 gap-2">
          {trends.map((trend, index) => {
            const height = (trend.totalAttendances / maxAttendances) * 100
            const isToday = index === trends.length - 1
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                {/* Bar */}
                <div className="w-full flex flex-col justify-end h-40">
                  <div
                    className={`w-full rounded-t transition-all ${
                      isToday ? 'bg-blue-500' : 'bg-blue-300'
                    } hover:bg-blue-600 relative group`}
                    style={{ height: `${height}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        <div>{trend.totalAttendances} asistencias</div>
                        <div>{trend.attendanceRate.toFixed(1)}% presentes</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Label */}
                <div className="text-xs text-center text-gray-600">
                  <div className="font-medium">
                    {format(trend.date, 'EEE', { locale: es })}
                  </div>
                  <div className="text-gray-400">
                    {format(trend.date, 'd/M')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {trends.reduce((sum, t) => sum + t.totalAttendances, 0)}
            </div>
            <div className="text-xs text-gray-600">Total Asistencias</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {(trends.reduce((sum, t) => sum + t.attendanceRate, 0) / trends.length).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Promedio Asistencia</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {trends.reduce((sum, t) => sum + t.totalClasses, 0)}
            </div>
            <div className="text-xs text-gray-600">Clases Realizadas</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
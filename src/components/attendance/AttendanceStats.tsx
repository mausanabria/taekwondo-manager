"use client"

import { TrendingUp, Calendar, Award, Zap } from "lucide-react"

interface AttendanceStatsProps {
  totalAttendances: number
  totalPresent: number
  totalAbsent: number
  attendanceRate: number
  currentStreak: number
  longestStreak: number
}

export default function AttendanceStats({
  totalAttendances,
  totalPresent,
  totalAbsent,
  attendanceRate,
  currentStreak,
  longestStreak
}: AttendanceStatsProps) {
  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 90) return "text-green-600"
    if (rate >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const getAttendanceRateBgColor = (rate: number) => {
    if (rate >= 90) return "bg-green-50 border-green-200"
    if (rate >= 75) return "bg-yellow-50 border-yellow-200"
    return "bg-red-50 border-red-200"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Attendances */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Total de Clases
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {totalAttendances}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-green-600">
                ✓ {totalPresent} presentes
              </span>
              <span className="text-sm text-red-600">
                ✗ {totalAbsent} ausentes
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Attendance Rate */}
      <div
        className={`p-6 rounded-lg shadow-sm border ${getAttendanceRateBgColor(
          attendanceRate
        )}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Porcentaje de Asistencia
            </p>
            <p
              className={`text-3xl font-bold mt-2 ${getAttendanceRateColor(
                attendanceRate
              )}`}
            >
              {attendanceRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {attendanceRate >= 90
                ? "¡Excelente asistencia!"
                : attendanceRate >= 75
                ? "Buena asistencia"
                : "Mejorar asistencia"}
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              attendanceRate >= 90
                ? "bg-green-200"
                : attendanceRate >= 75
                ? "bg-yellow-200"
                : "bg-red-200"
            }`}
          >
            <TrendingUp
              className={`h-6 w-6 ${getAttendanceRateColor(attendanceRate)}`}
            />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                attendanceRate >= 90
                  ? "bg-green-600"
                  : attendanceRate >= 75
                  ? "bg-yellow-600"
                  : "bg-red-600"
              }`}
              style={{ width: `${Math.min(attendanceRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Streaks */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-600">Rachas</p>
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Zap className="h-6 w-6 text-purple-600" />
          </div>
        </div>

        <div className="space-y-3">
          {/* Current Streak */}
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div>
              <p className="text-xs text-gray-600">Racha Actual</p>
              <p className="text-2xl font-bold text-purple-600">
                {currentStreak}
              </p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>

          {/* Longest Streak */}
          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div>
              <p className="text-xs text-gray-600">Mejor Racha</p>
              <p className="text-2xl font-bold text-amber-600">
                {longestStreak}
              </p>
            </div>
            <Award className="h-8 w-8 text-amber-600" />
          </div>
        </div>

        {currentStreak > 0 && (
          <p className="text-xs text-gray-500 mt-3 text-center">
            {currentStreak === longestStreak
              ? "¡Récord personal! 🎉"
              : `${longestStreak - currentStreak} clases para récord`}
          </p>
        )}
      </div>
    </div>
  )
}

// Made with Bob
"use client"

import { DashboardStats as Stats } from "@/services/dashboardService"
import { Users, TrendingUp, DollarSign, Cake, AlertCircle, CheckCircle } from "lucide-react"

interface DashboardStatsProps {
  stats: Stats
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Alumnos Activos",
      value: stats.activeStudents,
      subtitle: `${stats.studentsAttendedThisMonth} asistieron este mes`,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600"
    },
    {
      title: "Asistencia del Mes",
      value: `${stats.monthlyAttendanceRate}%`,
      subtitle: "Porcentaje de asistencia",
      icon: TrendingUp,
      color: "bg-green-500",
      textColor: "text-green-600"
    },
    {
      title: "Recaudación Mensual",
      value: `$${stats.monthlyRevenue.toLocaleString('es-AR')}`,
      subtitle: "ARS del mes actual",
      icon: DollarSign,
      color: "bg-yellow-500",
      textColor: "text-yellow-600"
    },
    {
      title: "Alumnos al Día",
      value: stats.studentsUpToDate,
      subtitle: `${stats.activeStudents > 0 ? Math.round((stats.studentsUpToDate / stats.activeStudents) * 100) : 0}% sin deuda`,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-600"
    },
    {
      title: "Alumnos con Deuda",
      value: stats.studentsWithDebt,
      subtitle: `$${stats.totalDebt.toLocaleString('es-AR')} ARS total`,
      icon: AlertCircle,
      color: "bg-red-500",
      textColor: "text-red-600"
    },
    {
      title: "Próximo Cumpleaños",
      value: stats.nextBirthday ? stats.nextBirthday.studentName : "N/A",
      subtitle: stats.nextBirthday
        ? `En ${stats.nextBirthday.daysUntil} día${stats.nextBirthday.daysUntil !== 1 ? 's' : ''}`
        : "No hay cumpleaños próximos",
      icon: Cake,
      color: "bg-pink-500",
      textColor: "text-pink-600"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className={`${card.title === "Próximo Cumpleaños" ? "text-lg" : "text-3xl"} font-bold ${card.textColor} mb-1 ${card.title === "Próximo Cumpleaños" ? "truncate" : ""}`}>
                  {card.value}
                </p>
                <p className="text-xs text-gray-500">
                  {card.subtitle}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Made with Bob

"use client"

import Link from "next/link"
import { RecentActivity as Activity } from "@/services/dashboardService"
import { UserPlus, DollarSign, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
        <p className="text-gray-500 text-center py-8">No hay actividad reciente</p>
      </div>
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'student':
        return <UserPlus className="w-5 h-5 text-blue-500" />
      case 'payment':
        return <DollarSign className="w-5 h-5 text-green-500" />
      case 'attendance':
        return <CheckCircle className="w-5 h-5 text-purple-500" />
      default:
        return null
    }
  }

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'student':
        return 'bg-blue-50'
      case 'payment':
        return 'bg-green-50'
      case 'attendance':
        return 'bg-purple-50'
      default:
        return 'bg-gray-50'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`p-3 rounded-lg ${getBackgroundColor(activity.type)} border border-gray-200`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  {activity.description}
                </p>
                {activity.amount && (
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    ${activity.amount.toLocaleString('es-AR')} ARS
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(activity.date), "d 'de' MMMM, HH:mm", { locale: es })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          Mostrando las {activities.length} actividades más recientes
        </p>
      </div>
    </div>
  )
}

// Made with Bob
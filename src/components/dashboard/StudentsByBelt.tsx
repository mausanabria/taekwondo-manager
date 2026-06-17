"use client"

import { BeltDistribution } from "@/services/dashboardService"

interface StudentsByBeltProps {
  distribution: BeltDistribution[]
}

const beltColors: Record<string, string> = {
  "Blanco": "bg-gray-100 border-gray-300",
  "Amarillo": "bg-yellow-100 border-yellow-400",
  "Naranja": "bg-orange-100 border-orange-400",
  "Verde": "bg-green-100 border-green-400",
  "Azul": "bg-blue-100 border-blue-400",
  "Rojo": "bg-red-100 border-red-400",
  "Negro": "bg-gray-800 border-gray-900 text-white",
  "Sin cinturón": "bg-gray-50 border-gray-200"
}

export function StudentsByBelt({ distribution }: StudentsByBeltProps) {
  if (distribution.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Distribución por Cinturón</h2>
        <p className="text-gray-500 text-center py-8">No hay alumnos registrados</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Distribución por Cinturón</h2>
      <div className="space-y-3">
        {distribution.map((item) => {
          const colorClass = beltColors[item.belt] || "bg-gray-100 border-gray-300"
          
          return (
            <div key={item.belt} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">{item.belt}</span>
                <span className="text-gray-600">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full border-2 ${colorClass} transition-all duration-300`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm font-semibold">
          <span>Total</span>
          <span>{distribution.reduce((sum, item) => sum + item.count, 0)} alumnos</span>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
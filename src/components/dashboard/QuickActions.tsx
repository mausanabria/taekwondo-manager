import Link from "next/link"
import { UserPlus, ClipboardCheck, DollarSign, BarChart3 } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      title: "Registrar Alumno",
      description: "Agregar nuevo alumno",
      icon: UserPlus,
      href: "/students/new",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Marcar Asistencia",
      description: "Registrar asistencia de clase",
      icon: ClipboardCheck,
      href: "/attendance",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Registrar Pago",
      description: "Registrar pago de alumno",
      icon: DollarSign,
      href: "/payments",
      color: "bg-yellow-500 hover:bg-yellow-600"
    },
    {
      title: "Ver Reportes",
      description: "Estadísticas y reportes",
      icon: BarChart3,
      href: "/payments/fees",
      color: "bg-purple-500 hover:bg-purple-600"
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.title}
              href={action.href}
              className={`${action.color} text-white rounded-lg p-4 transition-all hover:shadow-lg transform hover:-translate-y-1`}
            >
              <div className="flex flex-col items-center text-center">
                <Icon className="w-8 h-8 mb-2" />
                <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                <p className="text-xs opacity-90">{action.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// Made with Bob
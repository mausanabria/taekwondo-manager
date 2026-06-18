"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { 
  Settings as SettingsIcon, 
  DollarSign, 
  Users, 
  Bell, 
  Shield,
  Database,
  ChevronRight
} from "lucide-react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"

  const settingsSections = [
    {
      title: "Configuración de Pagos",
      description: "Gestiona las cuotas mensuales y valores de pago",
      icon: DollarSign,
      href: "/payments/fees",
      color: "bg-green-100 text-green-600",
      show: true
    },
    {
      title: "Gestión de Usuarios",
      description: "Administra los usuarios del sistema",
      icon: Users,
      href: "/settings/users",
      color: "bg-blue-100 text-blue-600",
      show: isAdmin
    },
    {
      title: "Notificaciones",
      description: "Configura alertas y recordatorios",
      icon: Bell,
      href: "#",
      color: "bg-yellow-100 text-yellow-600",
      show: true,
      comingSoon: true
    },
    {
      title: "Seguridad",
      description: "Configuración de seguridad y privacidad",
      icon: Shield,
      href: "#",
      color: "bg-red-100 text-red-600",
      show: isAdmin,
      comingSoon: true
    },
    {
      title: "Respaldo de Datos",
      description: "Gestiona copias de seguridad de la base de datos",
      icon: Database,
      href: "#",
      color: "bg-purple-100 text-purple-600",
      show: isAdmin,
      comingSoon: true
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">
          Administra la configuración de tu escuela de Taekwondo
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{session?.user?.name || "Usuario"}</h2>
            <p className="text-blue-100">{session?.user?.email}</p>
            <div className="mt-2">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                {session?.user?.role === "ADMIN" ? "Administrador" : "Instructor"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section) => {
          if (!section.show) return null
          
          const Icon = section.icon
          const content = (
            <div className={`bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg ${
              section.comingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-1 cursor-pointer'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`${section.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {section.title}
                      {section.comingSoon && (
                        <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          Próximamente
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                </div>
                {!section.comingSoon && (
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </div>
            </div>
          )

          if (section.comingSoon) {
            return <div key={section.title}>{content}</div>
          }

          return (
            <Link key={section.title} href={section.href}>
              {content}
            </Link>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-sm text-gray-600">Versión</p>
            <p className="text-xl font-bold text-gray-900">1.0.0</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-sm text-gray-600">Estado</p>
            <p className="text-xl font-bold text-green-600">Activo</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <p className="text-sm text-gray-600">Última actualización</p>
            <p className="text-xl font-bold text-gray-900">Hoy</p>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <SettingsIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              ¿Necesitas ayuda?
            </h3>
            <p className="text-blue-700 text-sm mb-3">
              Si tienes problemas con la configuración o necesitas asistencia, 
              consulta la documentación o contacta al soporte técnico.
            </p>
            <div className="flex gap-3">
              <Link 
                href="/docs/SETUP.md" 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Ver Documentación
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Made with Bob

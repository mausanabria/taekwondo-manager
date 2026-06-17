"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { UserRole } from "@/lib/rbac"

export default function DashboardNav() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === UserRole.ADMIN

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">🥋</span>
              <span className="text-xl font-semibold text-gray-900">
                Taekwondo Manager
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-4">
              <Link
                href="/"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/students"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Alumnos
              </Link>
              <Link
                href="/schedules"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Horarios
              </Link>
              <Link
                href="/attendance"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Asistencia
              </Link>
              <Link
                href="/payments"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Pagos
              </Link>
              
              {/* Admin-only link */}
              {isAdmin && (
                <Link
                  href="/settings/users"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Usuarios
                </Link>
              )}
              
              <Link
                href="/settings"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Configuración
              </Link>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {session?.user?.email}
                  {isAdmin && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                      ADMIN
                    </span>
                  )}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>

            {/* Logout Button */}
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}

// Made with Bob
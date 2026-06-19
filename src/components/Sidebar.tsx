"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { UserRole } from "@/lib/rbac"
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardCheck,
  DollarSign,
  UserCog,
  Settings,
  Menu,
  X,
  LogOut,
  Cake,
  GraduationCap
} from "lucide-react"

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === UserRole.ADMIN

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: true
    },
    {
      name: "Alumnos",
      href: "/students",
      icon: Users,
      show: true
    },
    {
      name: "Horarios",
      href: "/schedules",
      icon: Calendar,
      show: true
    },
    {
      name: "Asistencia",
      href: "/attendance",
      icon: ClipboardCheck,
      show: true
    },
    {
      name: "Exámenes",
      href: "/exams",
      icon: GraduationCap,
      show: true
    },
    {
      name: "Pagos",
      href: "/payments",
      icon: DollarSign,
      show: true
    },
    {
      name: "Cumpleaños",
      href: "/birthdays",
      icon: Cake,
      show: true
    },
    {
      name: "Usuarios",
      href: "/settings/users",
      icon: UserCog,
      show: isAdmin
    },
    {
      name: "Configuración",
      href: "/settings",
      icon: Settings,
      show: true
    }
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard"
    }
    return pathname?.startsWith(href)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg border border-gray-200 hover:bg-gray-50"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-600" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
          w-64 bg-white border-r border-gray-200 shadow-lg lg:shadow-none
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-3xl">🥋</span>
              <span className="text-lg font-bold text-gray-900">
                Taekwondo
              </span>
            </Link>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || "Usuario"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
                {isAdmin && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                    ADMIN
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              if (!item.show) return null
              
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      active
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${active ? "text-blue-700" : "text-gray-400"}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="px-3 py-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

// Made with Bob
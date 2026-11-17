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
  GraduationCap,
  Shield,
  Shirt,
  ChevronRight
} from "lucide-react"

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === UserRole.ADMIN

  const navigation = [
    {
      title: "GESTIÓN",
      items: [
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
          name: "Danes",
          href: "/danes",
          icon: Shield,
          show: true
        }
      ]
    },
    {
      title: "FINANZAS",
      items: [
        {
          name: "Pagos",
          href: "/payments",
          icon: DollarSign,
          show: true
        },
        {
          name: "Indumentaria",
          href: "/apparel",
          icon: Shirt,
          show: true
        }
      ]
    },
    {
      title: "REPORTES",
      items: [
        {
          name: "Exámenes",
          href: "/exams",
          icon: GraduationCap,
          show: true
        },
        {
          name: "Cumpleaños",
          href: "/birthdays",
          icon: Cake,
          show: true
        }
      ]
    },
    {
      title: "SISTEMA",
      items: [
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
    }
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard"
    }
    if (href === "/attendance") {
      return pathname?.startsWith("/attendance")
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-md border border-slate-200 hover:bg-slate-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-5 w-5 text-slate-700" />
        ) : (
          <Menu className="h-5 w-5 text-slate-700" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
          w-64 bg-white border-r border-slate-200/90 shadow-sm lg:shadow-none flex flex-col flex-shrink-0
        `}
      >
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xl shadow-sm flex-shrink-0">
            🥋
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[16px] font-bold text-slate-900 tracking-tight leading-tight">
              TaekwondoApp
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Panel de Control
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {navigation.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                {section.title}
              </p>
              <div className="space-y-0.5 pt-1">
                {section.items.map((item) => {
                  if (!item.show) return null

                  const Icon = item.icon
                  const active = isActive(item.href)

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150
                        ${
                          active
                            ? "bg-slate-900 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                        }
                      `}
                    >
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 transition-colors ${
                          active
                            ? "text-white"
                            : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                      <span className="flex-1">{item.name}</span>
                      {active && (
                        <ChevronRight className="h-4 w-4 text-slate-400 ml-auto flex-shrink-0" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User & Sign Out section */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 mt-auto">
          <div className="flex items-center gap-3 px-2 py-2 mb-1.5">
            <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 shadow-sm">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {session?.user?.name || "Usuario"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {isAdmin ? "Administrador" : "Profesor"}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}

// Made with Bob
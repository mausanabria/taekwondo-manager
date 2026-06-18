"use client"

import { useEffect, useState } from "react"
import { Cake, Calendar, Users, PartyPopper, Clock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Birthday {
  id: string
  name: string
  birthDate: string
  nextBirthday: string
  age: number
  nextAge: number
  daysUntil: number
  hasClassOnBirthday: boolean
  classesOnBirthday: string[]
  birthdayDayOfWeek: number
}

const DAYS_OF_WEEK = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado"
]

export default function BirthdaysPage() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "upcoming" | "withClass">("all")

  useEffect(() => {
    fetchBirthdays()
  }, [])

  const fetchBirthdays = async () => {
    try {
      const response = await fetch("/api/birthdays")
      if (response.ok) {
        const data = await response.json()
        setBirthdays(data)
      }
    } catch (error) {
      console.error("Error fetching birthdays:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBirthdays = birthdays.filter(birthday => {
    if (filter === "upcoming") return birthday.daysUntil <= 30
    if (filter === "withClass") return birthday.hasClassOnBirthday
    return true
  })

  const upcomingCount = birthdays.filter(b => b.daysUntil <= 30).length
  const withClassCount = birthdays.filter(b => b.hasClassOnBirthday).length

  const getDaysUntilText = (days: number) => {
    if (days === 0) return "¡Hoy!"
    if (days === 1) return "Mañana"
    if (days <= 7) return `En ${days} días`
    if (days <= 30) return `En ${days} días`
    return `En ${days} días`
  }

  const getDaysUntilColor = (days: number) => {
    if (days === 0) return "bg-red-100 text-red-800 border-red-200"
    if (days <= 7) return "bg-orange-100 text-orange-800 border-orange-200"
    if (days <= 30) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cumpleaños...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Cake className="h-8 w-8 text-pink-600" />
            Cumpleaños
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Próximos cumpleaños de los alumnos
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{birthdays.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Próximos 30 días</p>
              <p className="text-2xl font-bold text-orange-600">{upcomingCount}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Con clase ese día</p>
              <p className="text-2xl font-bold text-green-600">{withClassCount}</p>
            </div>
            <PartyPopper className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todos ({birthdays.length})
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "upcoming"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Próximos 30 días ({upcomingCount})
          </button>
          <button
            onClick={() => setFilter("withClass")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "withClass"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Con clase ({withClassCount})
          </button>
        </div>
      </div>

      {/* Birthdays List */}
      {filteredBirthdays.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-200">
          <Cake className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay cumpleaños
          </h3>
          <p className="text-gray-500">
            {filter === "all"
              ? "No hay alumnos con fecha de nacimiento registrada"
              : filter === "upcoming"
              ? "No hay cumpleaños en los próximos 30 días"
              : "No hay cumpleaños que coincidan con días de clase"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBirthdays.map((birthday) => (
            <div
              key={birthday.id}
              className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {birthday.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDaysUntilColor(
                        birthday.daysUntil
                      )}`}
                    >
                      {getDaysUntilText(birthday.daysUntil)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {format(new Date(birthday.nextBirthday), "EEEE, d 'de' MMMM", {
                          locale: es,
                        })}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="font-medium text-blue-600">
                        Cumple {birthday.nextAge} años
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Cake className="h-4 w-4 text-gray-400" />
                      <span>
                        Fecha de nacimiento:{" "}
                        {format(new Date(birthday.birthDate), "d 'de' MMMM 'de' yyyy", {
                          locale: es,
                        })}
                      </span>
                    </div>

                    {birthday.hasClassOnBirthday ? (
                      <div className="flex items-start gap-2 mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <PartyPopper className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-green-800">
                            ¡Tiene clase ese día!
                          </p>
                          <p className="text-sm text-green-700 mt-1">
                            {birthday.classesOnBirthday.join(", ")}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <p className="text-sm text-gray-600">
                          No tiene clase ese día ({DAYS_OF_WEEK[birthday.birthdayDayOfWeek]})
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {birthday.daysUntil}
                  </div>
                  <div className="text-xs text-gray-500">
                    {birthday.daysUntil === 1 ? "día" : "días"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Made with Bob
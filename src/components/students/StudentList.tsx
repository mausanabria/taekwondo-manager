"use client"

import { useState } from "react"
import { Student } from "@/types"
import { Pencil, Trash2, Eye, UserCheck, UserX, Calendar, ChevronUp, ChevronDown } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { getBeltLabel, getBeltColorClasses, getNextBelt, getPreviousBelt } from "@/lib/belt-utils"

interface StudentListProps {
  students: Student[]
  onDelete?: (id: string) => void
  onStatusChange?: () => void
}

export function StudentList({ students, onDelete, onStatusChange }: StudentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    student: Student | null
    open: boolean
  }>({ student: null, open: false })
  const [beltChangeDialog, setBeltChangeDialog] = useState<{
    student: Student | null
    newBelt: string | null
    open: boolean
  }>({ student: null, newBelt: null, open: false })
  const [inactiveDate, setInactiveDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [changeDate, setChangeDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [changeNotes, setChangeNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${name}?`)) {
      return
    }

    setDeletingId(id)
    try {
      if (onDelete) {
        await onDelete(id)
      }
    } finally {
      setDeletingId(null)
    }
  }

  const handleStatusClick = (student: Student) => {
    setStatusChangeDialog({ student, open: true })
    setInactiveDate(format(new Date(), "yyyy-MM-dd"))
    setError(null)
  }

  const handleStatusChange = async () => {
    if (!statusChangeDialog.student) return

    setIsSubmitting(true)
    setError(null)

    try {
      const newStatus = !statusChangeDialog.student.isActive
      const updateData: any = {
        isActive: newStatus
      }

      // If changing to inactive, include the inactive date
      if (!newStatus) {
        updateData.inactiveDate = inactiveDate
      } else {
        // If reactivating, clear the inactive date
        updateData.inactiveDate = null
      }

      const response = await fetch(`/api/students/${statusChangeDialog.student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update status")
      }

      setStatusChangeDialog({ student: null, open: false })
      onStatusChange?.()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBeltChangeClick = (student: Student, direction: 'up' | 'down') => {
    const newBelt = direction === 'up'
      ? getNextBelt(student.belt || null)
      : getPreviousBelt(student.belt || null)
    
    if (!newBelt) {
      alert(direction === 'up'
        ? 'El alumno ya tiene el cinturón más alto'
        : 'El alumno ya tiene el cinturón más bajo')
      return
    }

    setBeltChangeDialog({ student, newBelt, open: true })
    setChangeDate(format(new Date(), "yyyy-MM-dd"))
    setChangeNotes("")
    setError(null)
  }

  const handleBeltChange = async () => {
    if (!beltChangeDialog.student || !beltChangeDialog.newBelt) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/students/${beltChangeDialog.student.id}/change-belt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newBelt: beltChangeDialog.newBelt,
          changeDate: new Date(changeDate).toISOString(),
          notes: changeNotes || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to change belt")
      }

      setBeltChangeDialog({ student: null, newBelt: null, open: false })
      onStatusChange?.() // Refresh the list
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateAge = (birthDate: Date | null): number | null => {
    if (!birthDate) return null
    
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <UserX className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay alumnos</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza agregando un nuevo alumno a tu escuela.
        </p>
        <div className="mt-6">
          <Link
            href="/students/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Agregar Alumno
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Edad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cinturón
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => {
              const age = calculateAge(student.birthDate ?? null)
              const fullName = `${student.firstName} ${student.lastName}`
              
              return (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {fullName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {age ? `${age} años` : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {/* Demote button (-) */}
                      <button
                        onClick={() => handleBeltChangeClick(student, 'down')}
                        disabled={!getPreviousBelt(student.belt || null)}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Bajar graduación"
                      >
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      </button>
                      
                      {/* Belt display */}
                      {student.belt ? (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getBeltColorClasses(student.belt)}`}>
                          {getBeltLabel(student.belt)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Sin cinturón</span>
                      )}
                      
                      {/* Promote button (+) */}
                      <button
                        onClick={() => handleBeltChangeClick(student, 'up')}
                        disabled={!getNextBelt(student.belt || null)}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Subir graduación"
                      >
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.phone || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.email || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleStatusClick(student)}
                      className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                      title="Clic para cambiar estado"
                    >
                      {student.isActive ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer">
                          <UserCheck className="w-4 h-4 mr-1" />
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 hover:bg-red-200 transition-colors cursor-pointer">
                          <UserX className="w-4 h-4 mr-1" />
                          Inactivo
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/students/${student.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/students/${student.id}/edit`}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Editar"
                      >
                        <Pencil className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(student.id, fullName)}
                        disabled={deletingId === student.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {students.map((student) => {
          const age = calculateAge(student.birthDate ?? null)
          const fullName = `${student.firstName} ${student.lastName}`
          
          return (
            <div key={student.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{fullName}</h3>
                  <p className="text-sm text-gray-500">
                    {age ? `${age} años` : "Edad no especificada"}
                  </p>
                </div>
                <button
                  onClick={() => handleStatusClick(student)}
                  className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                >
                  {student.isActive ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer">
                      Activo
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 hover:bg-red-200 transition-colors cursor-pointer">
                      Inactivo
                    </span>
                  )}
                </button>
              </div>
              
              <div className="space-y-1 mb-3">
                {student.belt && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Cinturón:</span>
                    <button
                      onClick={() => handleBeltChangeClick(student, 'down')}
                      disabled={!getPreviousBelt(student.belt || null)}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                    </button>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getBeltColorClasses(student.belt)}`}>
                      {getBeltLabel(student.belt)}
                    </span>
                    <button
                      onClick={() => handleBeltChangeClick(student, 'up')}
                      disabled={!getNextBelt(student.belt || null)}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                )}
                {student.phone && (
                  <p className="text-sm text-gray-600">📞 {student.phone}</p>
                )}
                {student.email && (
                  <p className="text-sm text-gray-600">✉️ {student.email}</p>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <Link
                  href={`/students/${student.id}`}
                  className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Link>
                <Link
                  href={`/students/${student.id}/edit`}
                  className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(student.id, fullName)}
                  disabled={deletingId === student.id}
                  className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Status Change Dialog */}
      {statusChangeDialog.open && statusChangeDialog.student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Cambiar Estado
              </h2>
              <button
                onClick={() => setStatusChangeDialog({ student: null, open: false })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                <UserX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">
                  {statusChangeDialog.student.firstName} {statusChangeDialog.student.lastName}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Estado actual: {statusChangeDialog.student.isActive ? "Activo" : "Inactivo"}
                </p>
              </div>

              <p className="text-sm text-gray-700">
                {statusChangeDialog.student.isActive ? (
                  <>¿Deseas marcar este alumno como <strong>Inactivo</strong>?</>
                ) : (
                  <>¿Deseas reactivar este alumno?</>
                )}
              </p>

              {/* Inactive Date Input - Only show when changing to inactive */}
              {statusChangeDialog.student.isActive && (
                <div className="space-y-2">
                  <label htmlFor="inactiveDate" className="block text-sm font-medium text-gray-700">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Fecha de Inactivación
                  </label>
                  <input
                    id="inactiveDate"
                    type="date"
                    value={inactiveDate}
                    onChange={(e) => setInactiveDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-600">
                    💡 Si debe un mes anterior y se marca inactivo con fecha de ese mes anterior, la deuda de ese mes NO aparecerá.
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStatusChangeDialog({ student: null, open: false })}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleStatusChange}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    statusChangeDialog.student.isActive
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isSubmitting
                    ? "Guardando..."
                    : statusChangeDialog.student.isActive
                    ? "Marcar Inactivo"
                    : "Reactivar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Belt Change Dialog */}
      {beltChangeDialog.open && beltChangeDialog.student && beltChangeDialog.newBelt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Cambiar Graduación
              </h2>
              <button
                onClick={() => setBeltChangeDialog({ student: null, newBelt: null, open: false })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">
                  {beltChangeDialog.student.firstName} {beltChangeDialog.student.lastName}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-blue-700">Cinturón actual:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getBeltColorClasses(beltChangeDialog.student.belt || null)}`}>
                    {getBeltLabel(beltChangeDialog.student.belt || null)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-blue-700">Nuevo cinturón:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getBeltColorClasses(beltChangeDialog.newBelt)}`}>
                    {getBeltLabel(beltChangeDialog.newBelt)}
                  </span>
                </div>
              </div>

              {/* Change Date Input */}
              <div className="space-y-2">
                <label htmlFor="changeDate" className="block text-sm font-medium text-gray-700">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Fecha del Cambio
                </label>
                <input
                  id="changeDate"
                  type="date"
                  value={changeDate}
                  onChange={(e) => setChangeDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Notes Input */}
              <div className="space-y-2">
                <label htmlFor="changeNotes" className="block text-sm font-medium text-gray-700">
                  Notas (opcional)
                </label>
                <textarea
                  id="changeNotes"
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  rows={3}
                  placeholder="Ej: Examen aprobado, buen desempeño..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Footer */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setBeltChangeDialog({ student: null, newBelt: null, open: false })}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleBeltChange}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Guardando..." : "Confirmar Cambio"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Made with Bob

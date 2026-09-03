"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield, Plus, Pencil, Trash2, X, Save, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getBeltLabel, getBeltColorClasses } from "@/lib/belt-utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface DanRecord {
  id: string
  dan: number
  examDate: string | null
  ar: string | null
  danId: string | null
  notes: string | null
}

interface BlackBeltStudent {
  id: string
  firstName: string
  lastName: string
  belt: string | null
  isActive: boolean
  danRecords: DanRecord[]
}

interface DanFormState {
  dan: number
  examDate: string
  ar: string
  danId: string
  notes: string
}

const DAN_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const emptyForm = (): DanFormState => ({
  dan: 1,
  examDate: "",
  ar: "",
  danId: "",
  notes: "",
})

// ─── Modal ────────────────────────────────────────────────────────────────────

function DanModal({
  student,
  editingRecord,
  onClose,
  onSaved,
}: {
  student: BlackBeltStudent
  editingRecord: DanRecord | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<DanFormState>(() => {
    if (editingRecord) {
      // Parse date avoiding timezone shift: take only the date part of the ISO string
      const rawDate = editingRecord.examDate
        ? editingRecord.examDate.slice(0, 10)
        : ""
      return {
        dan: editingRecord.dan,
        examDate: rawDate,
        ar: editingRecord.ar ?? "",
        danId: editingRecord.danId ?? "",
        notes: editingRecord.notes ?? "",
      }
    }
    // Pre-select the next dan not yet registered
    const usedDans = new Set(student.danRecords.map((r) => r.dan))
    const nextDan = DAN_LEVELS.find((d) => !usedDans.has(d)) ?? 1
    return { ...emptyForm(), dan: nextDan }
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/dans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingRecord?.id ?? null,   // pass id so API can update by PK
          studentId: student.id,
          dan: form.dan,
          examDate: form.examDate || null,
          ar: form.ar || null,
          danId: form.danId || null,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al guardar")
      }
      onSaved()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editingRecord ? "Editar Dan" : "Agregar Dan"}
            </h2>
            <p className="text-sm text-gray-500">
              {student.firstName} {student.lastName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Dan selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dan <span className="text-red-500">*</span>
            </label>
            {editingRecord ? (
              // When editing, dan is fixed — show it as read-only text
              <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700">
                {form.dan}° Dan
              </div>
            ) : (
              <select
                value={form.dan}
                onChange={(e) => setForm({ ...form, dan: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm"
                required
              >
                {DAN_LEVELS.map((d) => (
                  <option key={d} value={d}>
                    {d}° Dan
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Exam date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Examen
            </label>
            <input
              type="date"
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm"
            />
          </div>

          {/* AR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AR
            </label>
            <input
              type="text"
              value={form.ar}
              onChange={(e) => setForm({ ...form, ar: e.target.value })}
              placeholder="Número AR"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm"
            />
          </div>

          {/* ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID
            </label>
            <input
              type="text"
              value={form.danId}
              onChange={(e) => setForm({ ...form, danId: e.target.value })}
              placeholder="Número de ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Observaciones opcionales..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DansPage() {
  const [students, setStudents] = useState<BlackBeltStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [modalStudent, setModalStudent] = useState<BlackBeltStudent | null>(null)
  const [editingRecord, setEditingRecord] = useState<DanRecord | null>(null)

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/dans")
      if (!res.ok) throw new Error("Error al cargar los datos")
      setStudents(await res.json())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleOpenAdd = (student: BlackBeltStudent) => {
    setEditingRecord(null)
    setModalStudent(student)
  }

  const handleOpenEdit = (student: BlackBeltStudent, record: DanRecord) => {
    setEditingRecord(record)
    setModalStudent(student)
  }

  const handleModalSaved = async () => {
    await fetchStudents()
    setModalStudent(null)
    setEditingRecord(null)
  }

  const handleDelete = async (recordId: string) => {
    setDeletingId(recordId)
    try {
      const res = await fetch(`/api/dans/${recordId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error al eliminar")
      fetchStudents()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-8 h-8 text-gray-900" />
          Danés
        </h1>
        <p className="text-gray-600 mt-2">
          Registro de graduaciones Dan para cinturones negros
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-16">
          <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-700">No hay cinturones negros registrados</p>
          <p className="text-sm text-gray-500 mt-1">
            Los alumnos con cinturón negro aparecerán aquí automáticamente
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Student header */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-900">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-base">
                      {student.firstName} {student.lastName}
                    </p>
                    <span
                      className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full border ${getBeltColorClasses(student.belt)}`}
                    >
                      {getBeltLabel(student.belt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!student.isActive && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-gray-200">
                      Inactivo
                    </span>
                  )}
                  <button
                    onClick={() => handleOpenAdd(student)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Dan
                  </button>
                </div>
              </div>

              {/* Dan records */}
              {student.danRecords.length === 0 ? (
                <div className="px-6 py-5 text-sm text-gray-500 text-center">
                  Sin registros de Dan cargados —{" "}
                  <button
                    onClick={() => handleOpenAdd(student)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Agregar el primero
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha de Examen
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          AR
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notas
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {student.danRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-900 text-white text-sm font-bold">
                              {record.dan}
                            </span>
                            <span className="ml-2 text-sm text-gray-600">° Dan</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {record.examDate
                              ? format(new Date(record.examDate), "dd/MM/yyyy", { locale: es })
                              : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {record.ar || <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {record.danId || <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {record.notes || <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEdit(student, record)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                disabled={deletingId === record.id}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                                title="Eliminar"
                              >
                                {deletingId === record.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalStudent && (
        <DanModal
          student={modalStudent}
          editingRecord={editingRecord}
          onClose={() => { setModalStudent(null); setEditingRecord(null) }}
          onSaved={handleModalSaved}
        />
      )}
    </div>
  )
}

// Made with Bob

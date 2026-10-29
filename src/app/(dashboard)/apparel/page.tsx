"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Shirt, Plus, Pencil, Trash2, X, Save, Loader2, Check, Undo2, PackageCheck } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApparelSale {
  id: string
  description: string
  amount: number
  isPaid: boolean
  paidDate: string | null
  isDelivered: boolean
  deliveredDate: string | null
  createdAt: string
  student: { id: string; firstName: string; lastName: string }
}

interface StudentOption {
  id: string
  firstName: string
  lastName: string
}

type Filter = "pending" | "paid" | "undelivered" | "all"

const formatMoney = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(n)

// ─── Modal ────────────────────────────────────────────────────────────────────

function SaleModal({
  students,
  editing,
  onClose,
  onSaved,
}: {
  students: StudentOption[]
  editing: ApparelSale | null
  onClose: () => void
  onSaved: () => void
}) {
  const [studentId, setStudentId] = useState(editing?.student.id ?? "")
  const [studentQuery, setStudentQuery] = useState(
    editing ? `${editing.student.lastName}, ${editing.student.firstName}` : ""
  )
  const [listOpen, setListOpen] = useState(false)
  const [description, setDescription] = useState(editing?.description ?? "")
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const normalize = (v: string) =>
    v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

  const filteredStudents = useMemo(() => {
    const words = normalize(studentQuery).split(/\s+/).filter(Boolean)
    if (words.length === 0) return students
    return students.filter((s) => {
      const full = normalize(`${s.lastName} ${s.firstName}`)
      return words.every((w) => full.includes(w))
    })
  }, [students, studentQuery])

  const selectStudent = (s: StudentOption) => {
    setStudentId(s.id)
    setStudentQuery(`${s.lastName}, ${s.firstName}`)
    setListOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId) {
      setError("Elegí un alumno de la lista")
      setListOpen(true)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(editing ? `/api/apparel/${editing.id}` : "/api/apparel", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, description, amount: Number(amount) }),
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

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {editing ? "Editar venta" : "Nueva venta"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alumno <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={studentQuery}
              onChange={(e) => {
                setStudentQuery(e.target.value)
                setStudentId("")
                setListOpen(true)
              }}
              onFocus={() => setListOpen(true)}
              onBlur={() => setListOpen(false)}
              placeholder="Escribí nombre o apellido..."
              autoComplete="off"
              autoFocus
              className={inputClass}
            />
            {listOpen && (
              <ul className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                {filteredStudents.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-gray-500">Sin resultados</li>
                ) : (
                  filteredStudents.map((s) => (
                    <li
                      key={s.id}
                      // onMouseDown fires before the input's onBlur closes the list
                      onMouseDown={(e) => {
                        e.preventDefault()
                        selectStudent(s)
                      }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                        s.id === studentId ? "bg-gray-100 font-medium" : "text-gray-800"
                      }`}
                    >
                      {s.lastName}, {s.firstName}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción del artículo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Dobok talle 3"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={inputClass}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

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
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ApparelPage() {
  const [sales, setSales] = useState<ApparelSale[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingSale, setEditingSale] = useState<ApparelSale | null>(null)
  const closeModal = () => {
    setShowModal(false)
    setEditingSale(null)
  }
  const [filter, setFilter] = useState<Filter>("pending")
  const [busyId, setBusyId] = useState<string | null>(null)

  const fetchSales = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch("/api/apparel")
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(
          `Error al cargar las ventas (${res.status})${data?.error ? `: ${data.error}` : ""}`
        )
      }
      setSales(await res.json())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSales()
    fetch("/api/students?isActive=true")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: StudentOption[]) =>
        setStudents(
          [...data].sort((a, b) =>
            `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
          )
        )
      )
      .catch(() => setStudents([]))
  }, [fetchSales])

  const togglePaid = (sale: ApparelSale) => updateSale(sale, { isPaid: !sale.isPaid })
  const toggleDelivered = (sale: ApparelSale) => updateSale(sale, { isDelivered: !sale.isDelivered })

  const updateSale = async (sale: ApparelSale, body: { isPaid?: boolean; isDelivered?: boolean }) => {
    setBusyId(sale.id)
    try {
      const res = await fetch(`/api/apparel/${sale.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Error al actualizar")
      const updated: ApparelSale = await res.json()
      setSales((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    } catch (err: any) {
      alert(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (sale: ApparelSale) => {
    if (!confirm(`¿Eliminar "${sale.description}" de ${sale.student.firstName} ${sale.student.lastName}?`)) return
    setBusyId(sale.id)
    try {
      const res = await fetch(`/api/apparel/${sale.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error al eliminar")
      setSales((prev) => prev.filter((s) => s.id !== sale.id))
    } catch (err: any) {
      alert(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const pendingTotal = useMemo(
    () => sales.filter((s) => !s.isPaid).reduce((acc, s) => acc + s.amount, 0),
    [sales]
  )
  const pendingCount = useMemo(() => sales.filter((s) => !s.isPaid).length, [sales])
  const undeliveredCount = useMemo(() => sales.filter((s) => !s.isDelivered).length, [sales])

  const visible = useMemo(
    () =>
      sales.filter((s) =>
        filter === "all"
          ? true
          : filter === "pending"
            ? !s.isPaid
            : filter === "paid"
              ? s.isPaid
              : !s.isDelivered
      ),
    [sales, filter]
  )

  const filterButton = (value: Filter, label: string) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
        filter === value
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shirt className="w-8 h-8 text-gray-900" />
            Indumentaria
          </h1>
          <p className="text-gray-600 mt-2">Ventas de ropa y artículos a alumnos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Nueva venta
        </button>
      </div>

      {/* Summary + filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {filterButton("pending", "Pendientes")}
          {filterButton("paid", "Pagados")}
          {filterButton("undelivered", "Sin entregar")}
          {filterButton("all", "Todos")}
        </div>
        <div className="text-sm text-gray-700 text-right">
          <p>
            Pendiente de cobro:{" "}
            <span className="font-semibold text-red-600">{formatMoney(pendingTotal)}</span>{" "}
            <span className="text-gray-500">({pendingCount})</span>
          </p>
          <p>
            Sin entregar: <span className="font-semibold text-amber-600">{undeliveredCount}</span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-16">
          <Shirt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-700">
            {filter === "pending"
              ? "No hay ventas pendientes de pago"
              : filter === "undelivered"
                ? "No hay ventas sin entregar"
                : "No hay ventas para mostrar"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Fecha", "Alumno", "Artículo", "Monto", "Pago", "Entrega", "Acciones"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      i === 6 ? "text-right" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {format(new Date(sale.createdAt), "dd/MM/yyyy", { locale: es })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sale.student.firstName} {sale.student.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{sale.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatMoney(sale.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sale.isPaid ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Pagado
                        {sale.paidDate &&
                          ` ${format(new Date(sale.paidDate), "dd/MM", { locale: es })}`}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sale.isDelivered ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Entregado
                        {sale.deliveredDate &&
                          ` ${format(new Date(sale.deliveredDate), "dd/MM", { locale: es })}`}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Sin entregar
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => togglePaid(sale)}
                        disabled={busyId === sale.id}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          sale.isPaid
                            ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {sale.isPaid ? (
                          <>
                            <Undo2 className="h-3.5 w-3.5" /> Desmarcar
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5" /> Marcar pagado
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => toggleDelivered(sale)}
                        disabled={busyId === sale.id}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          sale.isDelivered
                            ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {sale.isDelivered ? (
                          <>
                            <Undo2 className="h-3.5 w-3.5" /> Desmarcar
                          </>
                        ) : (
                          <>
                            <PackageCheck className="h-3.5 w-3.5" /> Marcar entregado
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingSale(sale)
                          setShowModal(true)
                        }}
                        disabled={busyId === sale.id}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sale)}
                        disabled={busyId === sale.id}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <SaleModal
          students={students}
          editing={editingSale}
          onClose={closeModal}
          onSaved={() => {
            closeModal()
            fetchSales()
          }}
        />
      )}
    </div>
  )
}

// Made with Bob

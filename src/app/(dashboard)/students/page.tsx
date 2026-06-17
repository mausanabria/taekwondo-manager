"use client"

import { useState, useEffect } from "react"
import { Student } from "@/types"
import { StudentList } from "@/components/students/StudentList"
import { Plus, Search, Filter, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function StudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBelt, setFilterBelt] = useState("")
  const [filterActive, setFilterActive] = useState<string>("all")

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [students, searchTerm, filterBelt, filterActive])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch("/api/students")
      
      if (!response.ok) {
        throw new Error("Error al cargar los alumnos")
      }
      
      const data = await response.json()
      setStudents(data)
    } catch (err: any) {
      setError(err.message || "Error al cargar los alumnos")
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...students]

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(student => 
        student.firstName.toLowerCase().includes(search) ||
        student.lastName.toLowerCase().includes(search) ||
        student.email?.toLowerCase().includes(search) ||
        student.phone?.toLowerCase().includes(search)
      )
    }

    // Belt filter
    if (filterBelt) {
      filtered = filtered.filter(student => student.belt === filterBelt)
    }

    // Active status filter
    if (filterActive !== "all") {
      const isActive = filterActive === "active"
      filtered = filtered.filter(student => student.isActive === isActive)
    }

    setFilteredStudents(filtered)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el alumno")
      }

      // Refresh the list
      await fetchStudents()
    } catch (err: any) {
      alert(err.message || "Error al eliminar el alumno")
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterBelt("")
    setFilterActive("all")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando alumnos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={fetchStudents}
            className="mt-2 text-sm underline"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alumnos</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona los alumnos de tu escuela de taekwondo
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/students/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Alumno
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Alumnos</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {students.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Alumnos Activos</div>
          <div className="mt-2 text-3xl font-semibold text-green-600">
            {students.filter(s => s.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Alumnos Inactivos</div>
          <div className="mt-2 text-3xl font-semibold text-red-600">
            {students.filter(s => !s.isActive).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-medium text-gray-900">Filtros</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre, email o teléfono..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Belt Filter */}
          <div>
            <label htmlFor="filterBelt" className="block text-sm font-medium text-gray-700 mb-1">
              Cinturón
            </label>
            <select
              id="filterBelt"
              value={filterBelt}
              onChange={(e) => setFilterBelt(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Todos</option>
              <option value="blanco">Blanco</option>
              <option value="amarillo">Amarillo</option>
              <option value="verde">Verde</option>
              <option value="azul">Azul</option>
              <option value="rojo">Rojo</option>
              <option value="negro">Negro</option>
            </select>
          </div>

          {/* Active Status Filter */}
          <div>
            <label htmlFor="filterActive" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="filterActive"
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || filterBelt || filterActive !== "all") && (
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Mostrando {filteredStudents.length} de {students.length} alumnos
        </p>
      </div>

      {/* Student List */}
      <StudentList
        students={filteredStudents}
        onDelete={handleDelete}
        onStatusChange={fetchStudents}
      />
    </div>
  )
}

// Made with Bob

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import UserList from "@/components/users/UserList"
import UserForm, { UserFormData } from "@/components/users/UserForm"
import { UserRole } from "@/lib/rbac"

interface User {
  id: string
  name: string | null
  email: string
  role: UserRole
  createdAt: Date
  schools?: { id: string; name: string }[]
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== UserRole.ADMIN) {
      router.push("/dashboard")
    }
  }, [status, session, router])

  // Fetch users
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === UserRole.ADMIN) {
      fetchUsers()
    }
  }, [status, session])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users")
      
      if (!response.ok) {
        throw new Error("Error al cargar usuarios")
      }
      
      const data = await response.json()
      setUsers(data)
    } catch (error: any) {
      console.error("Error fetching users:", error)
      setError(error.message || "Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (data: UserFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear usuario")
      }
      
      await fetchUsers()
      setShowModal(false)
    } catch (error: any) {
      console.error("Error creating user:", error)
      setError(error.message || "Error al crear usuario")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateUser = async (data: UserFormData) => {
    if (!editingUser) return
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar usuario")
      }
      
      await fetchUsers()
      setShowModal(false)
      setEditingUser(null)
    } catch (error: any) {
      console.error("Error updating user:", error)
      setError(error.message || "Error al actualizar usuario")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${user.name || user.email}?`)) {
      return
    }
    
    try {
      setError(null)
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar usuario")
      }
      
      await fetchUsers()
    } catch (error: any) {
      console.error("Error deleting user:", error)
      setError(error.message || "Error al eliminar usuario")
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setError(null)
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== UserRole.ADMIN) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <UserList
          users={users}
          onEdit={handleEdit}
          onDelete={handleDeleteUser}
          currentUserId={session.user.id}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            <UserForm
              user={editingUser || undefined}
              onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
              onCancel={handleCloseModal}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Made with Bob
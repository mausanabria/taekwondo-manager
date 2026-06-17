// Role-Based Access Control (RBAC) utilities

export enum UserRole {
  ADMIN = "ADMIN",
  PROFESOR = "PROFESOR",
}

export interface RBACUser {
  id: string
  role: UserRole
  schoolId?: string | null
}

/**
 * Check if user has ADMIN role
 */
export function isAdmin(user: RBACUser | null | undefined): boolean {
  return user?.role === UserRole.ADMIN
}

/**
 * Check if user has PROFESOR role
 */
export function isProfesor(user: RBACUser | null | undefined): boolean {
  return user?.role === UserRole.PROFESOR
}

/**
 * Check if user can access admin-only routes
 */
export function canAccessAdminRoutes(user: RBACUser | null | undefined): boolean {
  return isAdmin(user)
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(user: RBACUser | null | undefined): boolean {
  return isAdmin(user)
}

/**
 * Check if user can view all school data
 */
export function canViewAllData(user: RBACUser | null | undefined): boolean {
  return isAdmin(user)
}

/**
 * Get filter for data queries based on user role
 * ADMIN: no filter (sees all data)
 * PROFESOR: filter by createdById
 */
export function getDataFilter(user: RBACUser | null | undefined) {
  if (!user) {
    throw new Error("User not authenticated")
  }

  if (isAdmin(user)) {
    // Admin sees all data - no additional filter
    return {}
  }

  // Profesor only sees their own data
  return {
    createdById: user.id,
  }
}

/**
 * Get filter for data queries with optional override
 * Useful when you want to apply the filter conditionally
 */
export function getOptionalDataFilter(
  user: RBACUser | null | undefined,
  applyFilter: boolean = true
) {
  if (!applyFilter || !user) {
    return {}
  }

  return getDataFilter(user)
}

/**
 * Check if user can access a specific resource
 * ADMIN: can access any resource
 * PROFESOR: can only access resources they created
 */
export function canAccessResource(
  user: RBACUser | null | undefined,
  resourceCreatorId: string | null | undefined
): boolean {
  if (!user) {
    return false
  }

  if (isAdmin(user)) {
    return true
  }

  // Profesor can only access resources they created
  return resourceCreatorId === user.id
}

/**
 * Throw error if user doesn't have required role
 */
export function requireRole(
  user: RBACUser | null | undefined,
  requiredRole: UserRole
): void {
  if (!user) {
    throw new Error("Authentication required")
  }

  if (user.role !== requiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}`)
  }
}

/**
 * Throw error if user is not an admin
 */
export function requireAdmin(user: RBACUser | null | undefined): void {
  requireRole(user, UserRole.ADMIN)
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Administrador",
    [UserRole.PROFESOR]: "Profesor",
  }

  return roleNames[role] || role
}

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return Object.values(UserRole)
}

/**
 * Validate if a string is a valid UserRole
 */
export function isValidRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole)
}

// Made with Bob
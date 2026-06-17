import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { UserRole } from "./lib/rbac"

// Admin-only routes
const ADMIN_ROUTES = [
  "/settings/users",
  "/api/users",
]

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname
    
    console.log('🔒 [MIDDLEWARE] Checking auth for:', pathname)
    console.log('🔒 [MIDDLEWARE] Token exists:', !!token)
    console.log('🔒 [MIDDLEWARE] User role:', token?.role)
    
    // Check if route requires admin access
    const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route))
    
    if (isAdminRoute) {
      console.log('🔐 [MIDDLEWARE] Admin route detected')
      
      if (token?.role !== UserRole.ADMIN) {
        console.log('❌ [MIDDLEWARE] Access denied - User is not ADMIN')
        // Redirect to dashboard if not admin
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      
      console.log('✅ [MIDDLEWARE] Admin access granted')
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log('🔐 [MIDDLEWARE] Authorized callback - Token:', !!token)
        console.log('🔐 [MIDDLEWARE] Path:', req.nextUrl.pathname)
        return !!token
      },
    },
    pages: {
      signIn: "/login",
    },
  }
)

// Protect all routes except public ones
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - login (login page)
     * - register (register page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|login|register|_next/static|_next/image|favicon.ico|public).*)",
  ],
}

// Made with Bob
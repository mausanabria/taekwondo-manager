import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Force dynamic rendering to avoid caching issues in production
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Made with Bob

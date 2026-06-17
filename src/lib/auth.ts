import { NextAuthOptions, getServerSession as nextGetServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { UserRole } from "./rbac"

// Extended session type to include userId, schoolId, and role
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      schoolId?: string | null
      role: UserRole
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    schoolId?: string | null
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    schoolId?: string | null
    role: UserRole
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 [AUTH] Starting authorization...');
        console.log('📧 [AUTH] Email:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [AUTH] Missing credentials');
          throw new Error("Invalid credentials")
        }

        console.log('🔍 [AUTH] Looking up user in database...');
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true,
            role: true,
            schools: {
              take: 1,
              orderBy: {
                createdAt: 'desc'
              },
              select: {
                id: true,
                name: true,
              }
            }
          }
        })

        console.log('👤 [AUTH] User found:', user ? 'YES' : 'NO');
        if (user) {
          console.log('📝 [AUTH] User has password:', user.password ? 'YES' : 'NO');
        }

        if (!user || !user?.password) {
          console.log('❌ [AUTH] User not found or no password');
          throw new Error("Invalid credentials")
        }

        console.log('🔑 [AUTH] Comparing passwords...');
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        console.log('✅ [AUTH] Password match:', isCorrectPassword ? 'YES' : 'NO');

        if (!isCorrectPassword) {
          console.log('❌ [AUTH] Password mismatch');
          throw new Error("Invalid credentials")
        }

        console.log('🎉 [AUTH] Authentication successful!');
        console.log('👤 [AUTH] User role:', user.role);

        // Return user with schoolId from their first school and role
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          schoolId: user.schools[0]?.id || null,
          role: user.role as UserRole
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      console.log('🎫 [JWT] Callback triggered:', trigger)
      console.log('🎫 [JWT] User provided:', !!user)
      console.log('🎫 [JWT] Token before:', token)
      
      if (user) {
        console.log('🎫 [JWT] Adding user data to token')
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.schoolId = user.schoolId
        token.role = user.role
      }
      
      console.log('🎫 [JWT] Token after:', token)
      return token
    },
    async session({ session, token }) {
      console.log('📋 [SESSION] Building session')
      console.log('📋 [SESSION] Token:', token)
      
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string | null
        session.user.schoolId = token.schoolId as string | null
        session.user.role = token.role as UserRole
      }
      
      console.log('📋 [SESSION] Final session:', session)
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Helper function to get server session
export async function getServerSession() {
  return await nextGetServerSession(authOptions)
}

// Helper function to require authentication on server components
export async function requireAuth() {
  const session = await getServerSession()
  
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }
  
  return session
}

// Made with Bob

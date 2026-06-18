import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { rateLimit, RATE_LIMITS, getIdentifier } from "@/lib/rate-limit"

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function POST(request: Request) {
  try {
    // Rate limiting por IP
    const identifier = getIdentifier(request)
    const rateLimitResult = rateLimit(
      `register:${identifier}`,
      RATE_LIMITS.REGISTER
    )

    if (!rateLimitResult.success) {
      const resetTime = new Date(rateLimitResult.reset)
      return NextResponse.json(
        {
          error: `Too many registration attempts. Please try again after ${resetTime.toLocaleTimeString()}`,
          resetTime: rateLimitResult.reset
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validationResult = registerSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      )
    }

    const { name, email, password } = validationResult.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and default school in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        }
      })

      // Create default school for the user
      const school = await tx.school.create({
        data: {
          name: `${name}'s Taekwondo School`,
          ownerId: user.id,
        }
      })

      return { user, school }
    })

    // Return success (without sensitive data)
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Registration error:", error)
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Made with Bob
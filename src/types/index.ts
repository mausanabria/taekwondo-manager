// Common types for the application
import { Decimal } from "@prisma/client/runtime/library"

export interface Student {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  birthDate?: Date | null
  belt?: string | null
  address?: string | null
  emergencyContact?: string | null
  emergencyPhone?: string | null
  notes?: string | null
  isActive: boolean
  inactiveDate?: Date | null
  schoolId: string
  createdAt: Date
  updatedAt: Date
}

export interface Schedule {
  id: string
  name: string
  dayOfWeek: number
  startTime: string
  endTime: string
  capacity?: number | null
  isActive: boolean
  schoolId: string
  createdAt: Date
  updatedAt: Date
}

export interface Attendance {
  id: string
  date: Date
  wasPresent: boolean
  notes?: string | null
  studentId: string
  scheduleId: string
  createdAt: Date
}

export interface Payment {
  id: string
  amount: Decimal | number
  month: number
  year: number
  paymentDate: Date
  paymentMethod?: string | null
  notes?: string | null
  studentId: string
  schoolId: string
  createdById?: string | null
  createdAt: Date
}

export interface MonthlyFee {
  id: string
  amount: Decimal | number
  month: number
  year: number
  description?: string | null
  schoolId: string
  createdAt: Date
}

export interface School {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  description?: string | null
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

// Dashboard statistics
export interface DashboardStats {
  totalStudents: number
  activeStudents: number
  totalClasses: number
  attendanceRate: number
  pendingPayments: number
  monthlyRevenue: number
}

// Debt calculation
export interface StudentDebt {
  studentId: string
  studentName: string
  totalDebt: number
  monthsOwed: Array<{
    month: number
    year: number
    amount: number
  }>
}

// Made with Bob

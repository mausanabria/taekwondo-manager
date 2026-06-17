import { prisma } from "@/lib/prisma"
import { Student } from "@/types"

export interface CreateStudentData {
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
  isActive?: boolean
  inactiveDate?: Date | null
  schoolId: string
}

export interface UpdateStudentData {
  firstName?: string
  lastName?: string
  email?: string | null
  phone?: string | null
  birthDate?: Date | null
  belt?: string | null
  address?: string | null
  emergencyContact?: string | null
  emergencyPhone?: string | null
  notes?: string | null
  isActive?: boolean
  inactiveDate?: Date | null
}

export interface StudentStats {
  totalAttendances: number
  attendanceRate: number
  totalPayments: number
  totalPaid: number
  lastAttendance?: Date | null
  lastPayment?: Date | null
}

export const studentService = {
  // Get all students for a school with optional filters
  async getAllStudents(
    schoolId: string,
    filters?: {
      isActive?: boolean
      belt?: string
      search?: string
    }
  ) {
    const where: any = { schoolId }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters?.belt) {
      where.belt = filters.belt
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    return await prisma.student.findMany({
      where,
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    })
  },

  // Get a single student by ID with school validation
  async getStudentById(id: string, schoolId: string) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        school: true,
        enrollments: {
          include: {
            schedule: true
          }
        }
      }
    })

    // Validate that student belongs to the school
    if (student && student.schoolId !== schoolId) {
      throw new Error("Unauthorized: Student does not belong to your school")
    }

    return student
  },

  // Create a new student
  async createStudent(data: CreateStudentData) {
    return await prisma.student.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        birthDate: data.birthDate,
        belt: data.belt,
        address: data.address,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        notes: data.notes,
        isActive: data.isActive ?? true,
        inactiveDate: data.inactiveDate,
        schoolId: data.schoolId
      }
    })
  },

  // Update a student with school validation
  async updateStudent(id: string, data: UpdateStudentData, schoolId: string) {
    // First verify the student belongs to the school
    const student = await prisma.student.findUnique({
      where: { id }
    })

    if (!student) {
      throw new Error("Student not found")
    }

    if (student.schoolId !== schoolId) {
      throw new Error("Unauthorized: Student does not belong to your school")
    }

    return await prisma.student.update({
      where: { id },
      data
    })
  },

  // Delete a student (hard delete) with school validation
  async deleteStudent(id: string, schoolId: string) {
    // First verify the student belongs to the school
    const student = await prisma.student.findUnique({
      where: { id }
    })

    if (!student) {
      throw new Error("Student not found")
    }

    if (student.schoolId !== schoolId) {
      throw new Error("Unauthorized: Student does not belong to your school")
    }

    return await prisma.student.delete({
      where: { id }
    })
  },

  // Soft delete - mark student as inactive
  async deactivateStudent(id: string, schoolId: string) {
    return await this.updateStudent(id, { isActive: false }, schoolId)
  },

  // Get student statistics
  async getStudentStats(studentId: string, schoolId: string): Promise<StudentStats> {
    // Verify student belongs to school
    const student = await this.getStudentById(studentId, schoolId)
    
    if (!student) {
      throw new Error("Student not found")
    }

    // Get attendance statistics
    const attendances = await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' }
    })

    const totalAttendances = attendances.length
    const presentCount = attendances.filter((a: any) => a.wasPresent).length
    const attendanceRate = totalAttendances > 0 
      ? (presentCount / totalAttendances) * 100 
      : 0

    // Get payment statistics
    const payments = await prisma.payment.findMany({
      where: { studentId },
      orderBy: { paymentDate: 'desc' }
    })

    const totalPayments = payments.length
    const totalPaid = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0)

    return {
      totalAttendances,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      totalPayments,
      totalPaid,
      lastAttendance: attendances[0]?.date || null,
      lastPayment: payments[0]?.paymentDate || null
    }
  },

  // Get recent attendances for a student
  async getStudentAttendances(studentId: string, schoolId: string, limit: number = 10) {
    // Verify student belongs to school
    await this.getStudentById(studentId, schoolId)

    return await prisma.attendance.findMany({
      where: { studentId },
      include: {
        schedule: true
      },
      orderBy: { date: 'desc' },
      take: limit
    })
  },

  // Get recent payments for a student
  async getStudentPayments(studentId: string, schoolId: string, limit: number = 10) {
    // Verify student belongs to school
    await this.getStudentById(studentId, schoolId)

    return await prisma.payment.findMany({
      where: { studentId },
      orderBy: { paymentDate: 'desc' },
      take: limit
    })
  },

  // Calculate student age from birthDate
  calculateAge(birthDate: Date | null): number | null {
    if (!birthDate) return null
    
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }
}

// Made with Bob

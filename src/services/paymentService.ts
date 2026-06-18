import { prisma } from "@/lib/prisma"
import { Payment, MonthlyFee } from "@/types"
import { attendanceService } from "./attendanceService"
import { startOfMonth, endOfMonth, isBefore, isAfter } from "date-fns"

export interface CreateMonthlyFeeData {
  schoolId: string
  year: number
  month: number
  amount: number
  description?: string | null
}

export interface RecordPaymentData {
  studentId: string
  schoolId: string
  year: number
  month: number
  amount: number
  paymentDate: Date
  paymentMethod?: string | null
  notes?: string | null
}

export interface MonthDebt {
  month: number
  year: number
  amount: number
  feeAmount: number
  paidAmount: number
  hasAttended: boolean
}

export interface StudentDebtDetails {
  studentId: string
  studentName: string
  totalDebt: number
  monthsOwed: MonthDebt[]
  totalPaid: number
  lastPaymentDate?: Date | null
}

export interface PaymentStatus {
  studentId: string
  studentName: string
  belt?: string | null
  isActive: boolean
  totalDebt: number
  monthsOwed: number
  lastPaymentDate?: Date | null
  status: 'paid' | 'partial' | 'overdue' | 'no_debt'
}

export const paymentService = {
  /**
   * Create or configure a monthly fee for a specific month/year
   */
  async createMonthlyFee(data: CreateMonthlyFeeData): Promise<MonthlyFee> {
    // Validate amount
    if (data.amount <= 0) {
      throw new Error("Amount must be greater than 0")
    }

    // Validate month
    if (data.month < 1 || data.month > 12) {
      throw new Error("Month must be between 1 and 12")
    }

    // Check if fee already exists for this month/year
    const existingFee = await prisma.monthlyFee.findUnique({
      where: {
        schoolId_month_year: {
          schoolId: data.schoolId,
          month: data.month,
          year: data.year
        }
      }
    })

    if (existingFee) {
      throw new Error(`Monthly fee for ${data.month}/${data.year} already exists`)
    }

    return await prisma.monthlyFee.create({
      data: {
        schoolId: data.schoolId,
        month: data.month,
        year: data.year,
        amount: data.amount,
        description: data.description
      }
    })
  },

  /**
   * Get monthly fee for a specific month/year
   */
  async getMonthlyFee(
    schoolId: string,
    year: number,
    month: number
  ): Promise<MonthlyFee | null> {
    return await prisma.monthlyFee.findUnique({
      where: {
        schoolId_month_year: {
          schoolId,
          month,
          year
        }
      }
    })
  },

  /**
   * Get all monthly fees for a school
   */
  async getAllMonthlyFees(schoolId: string): Promise<MonthlyFee[]> {
    return await prisma.monthlyFee.findMany({
      where: { schoolId },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    })
  },

  /**
   * Update a monthly fee amount
   */
  async updateMonthlyFee(
    id: string,
    amount: number,
    schoolId: string
  ): Promise<MonthlyFee> {
    // Validate amount
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0")
    }

    // Verify fee belongs to school
    const fee = await prisma.monthlyFee.findUnique({
      where: { id }
    })

    if (!fee) {
      throw new Error("Monthly fee not found")
    }

    if (fee.schoolId !== schoolId) {
      throw new Error("Unauthorized: Fee does not belong to your school")
    }

    return await prisma.monthlyFee.update({
      where: { id },
      data: { amount }
    })
  },

  /**
   * Record a payment for a student
   */
  async recordPayment(data: RecordPaymentData): Promise<Payment> {
    // Validate amount
    if (data.amount <= 0) {
      throw new Error("Amount must be greater than 0")
    }

    // Validate month
    if (data.month < 1 || data.month > 12) {
      throw new Error("Month must be between 1 and 12")
    }

    // Validate payment date is not in the future
    const now = new Date()
    if (isAfter(data.paymentDate, now)) {
      throw new Error("Payment date cannot be in the future")
    }

    // Verify student belongs to school
    const student = await prisma.student.findUnique({
      where: { id: data.studentId }
    })

    if (!student) {
      throw new Error("Student not found")
    }

    if (student.schoolId !== data.schoolId) {
      throw new Error("Unauthorized: Student does not belong to your school")
    }

    // Create payment record
    return await prisma.payment.create({
      data: {
        studentId: data.studentId,
        schoolId: data.schoolId,
        month: data.month,
        year: data.year,
        amount: data.amount,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod,
        notes: data.notes
      }
    })
  },

  /**
   * Get all payments for a student
   */
  async getStudentPayments(
    studentId: string,
    schoolId: string
  ): Promise<Payment[]> {
    // Verify student belongs to school
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      throw new Error("Student not found")
    }

    if (student.schoolId !== schoolId) {
      throw new Error("Unauthorized: Student does not belong to your school")
    }

    return await prisma.payment.findMany({
      where: { studentId },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { paymentDate: 'desc' }
      ]
    })
  },

  /**
   * Get payment status for a specific month
   */
  async getPaymentStatus(
    studentId: string,
    year: number,
    month: number,
    schoolId: string
  ): Promise<{ paid: boolean; amount: number; feeAmount: number }> {
    // Verify student belongs to school
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student || student.schoolId !== schoolId) {
      throw new Error("Student not found or unauthorized")
    }

    // Get monthly fee
    const fee = await this.getMonthlyFee(schoolId, year, month)
    const feeAmount = fee ? Number(fee.amount) : 0

    // Get payments for this month
    const payments = await prisma.payment.findMany({
      where: {
        studentId,
        year,
        month
      }
    })

    const totalPaid = payments.reduce((sum: number, p: Payment) => sum + Number(p.amount), 0)

    return {
      paid: totalPaid >= feeAmount,
      amount: totalPaid,
      feeAmount
    }
  },

  /**
   * Calculate total debt for a student with intelligent logic
   * CRITICAL: Only generates debt for months where student attended at least once
   */
  async calculateDebt(
    studentId: string,
    schoolId: string
  ): Promise<number> {
    const details = await this.getStudentDebtDetails(studentId, schoolId)
    return details.totalDebt
  },

  /**
   * Get detailed debt information for a student
   * CRITICAL: Only includes months where student attended at least once
   * UPDATED: Now considers custom monthly fees from StudentSchedule
   */
  async getStudentDebtDetails(
    studentId: string,
    schoolId: string
  ): Promise<StudentDebtDetails> {
    // Verify student belongs to school
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        schoolId: true,
        createdAt: true,
        isActive: true,
        inactiveDate: true
      }
    })

    if (!student) {
      throw new Error("Student not found")
    }

    if (student.schoolId !== schoolId) {
      throw new Error("Unauthorized: Student does not belong to your school")
    }

    const studentName = `${student.firstName} ${student.lastName}`

    // Get student's creation date (enrollment date)
    const enrollmentDate = student.createdAt
    const now = new Date()

    // Get all payments for the student
    const payments = await prisma.payment.findMany({
      where: { studentId }
    })

    // Get all monthly fees for the school (general fees)
    const fees = await prisma.monthlyFee.findMany({
      where: { schoolId }
    })

    // Get student's enrollments with custom fees, frequency, and frequency history
    const enrollments = await prisma.studentSchedule.findMany({
      where: {
        studentId,
        isActive: true
      },
      include: {
        schedule: true,
        frequencyHistory: {
          orderBy: { effectiveFrom: 'asc' }
        }
      }
    })

    // Get all frequency rates for the school
    const frequencyRates = await prisma.frequencyRate.findMany({
      where: { schoolId }
    })

    // Create a map of frequency rates by month/year/frequency
    const frequencyRateMap = new Map<string, number>()
    frequencyRates.forEach((rate) => {
      const key = `${rate.year}-${rate.month}-${rate.weeklyFrequency}`
      frequencyRateMap.set(key, Number(rate.amount))
    })

    // Calculate monthly fee for student based on enrollments and historical frequency
    // Priority: 1. Custom fee (monthlyFee) 2. Frequency rate 3. General fee
    const calculateMonthlyFeeForStudent = (year: number, month: number): number => {
      let totalFee = 0
      let hasAnyCustomFee = false

      // Create date for the month we're calculating
      const monthDate = new Date(year, month - 1, 15) // Use middle of month for comparison

      for (const enrollment of enrollments) {
        let weeklyFrequency = enrollment.weeklyFrequency
        let customFee: number | null = enrollment.monthlyFee ? Number(enrollment.monthlyFee) : null

        // Find the frequency history that was active during this month
        const historicalFrequency = enrollment.frequencyHistory.find(history => {
          const from = new Date(history.effectiveFrom)
          const to = history.effectiveTo ? new Date(history.effectiveTo) : new Date()
          
          return monthDate >= from && monthDate <= to
        })

        // If historical frequency found, use it; otherwise use current enrollment values
        if (historicalFrequency) {
          weeklyFrequency = historicalFrequency.weeklyFrequency
          if (historicalFrequency.monthlyFee) {
            customFee = Number(historicalFrequency.monthlyFee)
          }
        }

        // Priority 1: Custom fee (from history or enrollment)
        if (customFee) {
          totalFee += customFee
          hasAnyCustomFee = true
        } else {
          // Priority 2: Frequency rate based on weekly frequency
          const frequencyKey = `${year}-${month}-${weeklyFrequency}`
          const frequencyRate = frequencyRateMap.get(frequencyKey)
          
          if (frequencyRate) {
            totalFee += frequencyRate
            hasAnyCustomFee = true
          }
        }
      }

      // Priority 3: General fee (if no custom fees or frequency rates)
      if (!hasAnyCustomFee) {
        const generalFee = fees.find(f => f.year === year && f.month === month)
        if (generalFee) {
          totalFee = Number(generalFee.amount)
        }
      }

      return totalFee
    }

    // Create a map of fees by month/year using the new calculation
    const feeMap = new Map<string, number>()
    fees.forEach((fee) => {
      const key = `${fee.year}-${fee.month}`
      const feeAmount = calculateMonthlyFeeForStudent(fee.year, fee.month)
      feeMap.set(key, feeAmount)
    })

    // Also add frequency rates to fee map for months that don't have general fees
    frequencyRates.forEach((rate) => {
      const key = `${rate.year}-${rate.month}`
      if (!feeMap.has(key)) {
        const feeAmount = calculateMonthlyFeeForStudent(rate.year, rate.month)
        if (feeAmount > 0) {
          feeMap.set(key, feeAmount)
        }
      }
    })

    // Create a map of payments by month/year
    const paymentMap = new Map<string, number>()
    payments.forEach((payment: Payment) => {
      const key = `${payment.year}-${payment.month}`
      const current = paymentMap.get(key) || 0
      paymentMap.set(key, current + Number(payment.amount))
    })

    // Calculate debt for each month from enrollment to now
    const monthsOwed: MonthDebt[] = []
    let totalDebt = 0
    let totalPaid = 0

    // Iterate through each month from enrollment to current month
    let currentDate = startOfMonth(enrollmentDate)
    const endDate = endOfMonth(now)

    while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const key = `${year}-${month}`

      // CRITICAL: Check if student attended at least once in this month
      const hasAttended = await attendanceService.hasAttendedInMonth(
        studentId,
        year,
        month,
        schoolId
      )

      // CRITICAL: Check if student was inactive during this month
      // Only skip debt generation if inactiveDate falls within or before this specific month
      let wasInactiveDuringMonth = false
      if (student.inactiveDate) {
        const inactiveDate = new Date(student.inactiveDate)
        const monthStart = new Date(year, month - 1, 1)
        const monthEnd = new Date(year, month, 0) // Last day of the month
        
        // Student was inactive during this month if inactiveDate is within or before this month
        // AND the month being evaluated is on or before the inactive month
        if (inactiveDate >= monthStart && inactiveDate <= monthEnd) {
          // inactiveDate falls within this month - student became inactive this month
          wasInactiveDuringMonth = true
        } else if (inactiveDate < monthStart) {
          // inactiveDate is before this month - student was already inactive
          wasInactiveDuringMonth = true
        }
        // If inactiveDate > monthEnd, student was still active during this month
      }

      // Get fee for this month
      const feeAmount = feeMap.get(key) || 0

      // Get payments for this month
      const paidAmount = paymentMap.get(key) || 0
      totalPaid += paidAmount

      // Only generate debt if:
      // 1. Student attended at least once in the month
      // 2. There is a configured fee for the month
      // 3. Payment is less than the fee
      // 4. Student was NOT inactive during this month (based on inactiveDate)
      if (hasAttended && feeAmount > 0 && !wasInactiveDuringMonth) {
        const debt = Math.max(0, feeAmount - paidAmount)
        
        if (debt > 0) {
          monthsOwed.push({
            month,
            year,
            amount: debt,
            feeAmount,
            paidAmount,
            hasAttended: true
          })
          totalDebt += debt
        }
      }

      // Move to next month
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    }

    // Get last payment date
    const lastPayment = payments.length > 0
      ? payments.reduce((latest, p) =>
          p.paymentDate > latest.paymentDate ? p : latest
        )
      : null

    return {
      studentId,
      studentName,
      totalDebt,
      monthsOwed,
      totalPaid,
      lastPaymentDate: lastPayment?.paymentDate || null
    }
  },

  /**
   * Get payment status for all students in a school
   */
  async getAllStudentsPaymentStatus(
    schoolId: string
  ): Promise<PaymentStatus[]> {
    // Get all active students
    const students = await prisma.student.findMany({
      where: { 
        schoolId,
        isActive: true
      },
      orderBy: {
        lastName: 'asc'
      }
    })

    const statuses: PaymentStatus[] = []

    for (const student of students) {
      try {
        const debtDetails = await this.getStudentDebtDetails(student.id, schoolId)
        
        let status: 'paid' | 'partial' | 'overdue' | 'no_debt' = 'no_debt'
        
        if (debtDetails.totalDebt === 0) {
          status = 'paid'
        } else if (debtDetails.monthsOwed.length === 1) {
          status = 'partial'
        } else if (debtDetails.monthsOwed.length > 1) {
          status = 'overdue'
        }

        statuses.push({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          belt: student.belt,
          isActive: student.isActive,
          totalDebt: debtDetails.totalDebt,
          monthsOwed: debtDetails.monthsOwed.length,
          lastPaymentDate: debtDetails.lastPaymentDate,
          status
        })
      } catch (error) {
        console.error(`Error calculating debt for student ${student.id}:`, error)
        // Continue with next student
      }
    }

    return statuses
  },

  /**
   * Get payment statistics for a school
   */
  async getPaymentStats(schoolId: string) {
    const students = await prisma.student.findMany({
      where: { 
        schoolId,
        isActive: true
      }
    })

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    // Get payments for current month
    const currentMonthPayments = await prisma.payment.findMany({
      where: {
        schoolId,
        year: currentYear,
        month: currentMonth
      }
    })

    // Get payments for current year
    const currentYearPayments = await prisma.payment.findMany({
      where: {
        schoolId,
        year: currentYear
      }
    })

    // Get all payments
    const allPayments = await prisma.payment.findMany({
      where: { schoolId }
    })

    // Calculate totals
    const currentMonthRevenue = currentMonthPayments.reduce(
      (sum: number, p: Payment) => sum + Number(p.amount),
      0
    )
    const currentYearRevenue = currentYearPayments.reduce(
      (sum: number, p: Payment) => sum + Number(p.amount),
      0
    )
    const totalRevenue = allPayments.reduce(
      (sum: number, p: Payment) => sum + Number(p.amount),
      0
    )

    // Calculate debt statistics
    let totalDebt = 0
    let studentsWithDebt = 0
    let studentsPaid = 0

    for (const student of students) {
      try {
        const debt = await this.calculateDebt(student.id, schoolId)
        totalDebt += debt
        
        if (debt > 0) {
          studentsWithDebt++
        } else {
          studentsPaid++
        }
      } catch (error) {
        console.error(`Error calculating debt for student ${student.id}:`, error)
      }
    }

    return {
      totalStudents: students.length,
      studentsPaid,
      studentsWithDebt,
      currentMonthRevenue,
      currentYearRevenue,
      totalRevenue,
      totalDebt,
      averageDebtPerStudent: students.length > 0 ? totalDebt / students.length : 0
    }
  },

  /**
   * Delete a payment (for corrections)
   */
  async deletePayment(
    paymentId: string,
    schoolId: string
  ): Promise<void> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    })

    if (!payment) {
      throw new Error("Payment not found")
    }

    if (payment.schoolId !== schoolId) {
      throw new Error("Unauthorized: Payment does not belong to your school")
    }

    await prisma.payment.delete({
      where: { id: paymentId }
    })
  }
}

// Made with Bob

import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subDays, addDays } from "date-fns"
import { studentService } from "./studentService"
import { paymentService } from "./paymentService"
import { attendanceService } from "./attendanceService"
import { scheduleService } from "./scheduleService"

export interface DashboardStats {
  totalStudents: number
  activeStudents: number
  inactiveStudents: number
  totalSchedules: number
  monthlyAttendanceRate: number
  monthlyRevenue: number
  totalDebt: number
  studentsUpToDate: number
  studentsWithDebt: number
  studentsByBelt: BeltDistribution[]
  todayAttendances: number
  todayPayments: number
  studentsAttendedThisMonth: number
  nextBirthday: {
    studentName: string
    date: Date
    daysUntil: number
  } | null
}

export interface BeltDistribution {
  belt: string
  count: number
  percentage: number
}

export interface RecentActivity {
  id: string
  type: 'student' | 'payment' | 'attendance'
  description: string
  date: Date
  studentName?: string
  amount?: number
}

export interface UpcomingClass {
  id: string
  name: string
  dayOfWeek: number
  startTime: string
  endTime: string
  enrolledCount: number
  hasAttendanceToday: boolean
  date: Date
}

export interface PaymentAlert {
  studentId: string
  studentName: string
  belt?: string | null
  totalDebt: number
  monthsOwed: number
  lastPaymentDate?: Date | null
}

export interface AttendanceTrend {
  date: Date
  totalClasses: number
  totalAttendances: number
  attendanceRate: number
}

export const dashboardService = {
  /**
   * Get all dashboard statistics in a single call
   */
  async getDashboardStats(schoolId: string): Promise<DashboardStats> {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    // Get all students
    const allStudents = await prisma.student.findMany({
      where: { schoolId }
    })

    const activeStudents = allStudents.filter((s: any) => s.isActive)
    const inactiveStudents = allStudents.filter((s: any) => !s.isActive)

    // Get total schedules
    const totalSchedules = await prisma.schedule.count({
      where: { 
        schoolId,
        isActive: true
      }
    })

    // Calculate monthly attendance rate
    const startDate = startOfMonth(now)
    const endDate = endOfMonth(now)

    const monthlyAttendances = await prisma.attendance.findMany({
      where: {
        schedule: {
          schoolId
        },
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const totalPresent = monthlyAttendances.filter((a: any) => a.wasPresent).length
    const monthlyAttendanceRate = monthlyAttendances.length > 0
      ? (totalPresent / monthlyAttendances.length) * 100
      : 0

    // Get monthly revenue
    const monthlyPayments = await prisma.payment.findMany({
      where: {
        schoolId,
        year: currentYear,
        month: currentMonth
      }
    })

    const monthlyGrossRevenue = monthlyPayments.reduce(
      (sum: number, p: any) => sum + Number(p.amount),
      0
    )

    // Subtract monthly expenses (e.g. rent) for this month
    const monthlyExpense = await prisma.monthlyExpense.findUnique({
      where: { schoolId_month_year: { schoolId, month: currentMonth, year: currentYear } }
    })
    const monthlyExpenseAmount = monthlyExpense ? Number(monthlyExpense.amount) : 0
    const monthlyRevenue = Math.max(0, monthlyGrossRevenue - monthlyExpenseAmount)

    // Calculate debt statistics
    let totalDebt = 0
    let studentsWithDebt = 0
    let studentsUpToDate = 0

    for (const student of activeStudents) {
      try {
        const debt = await paymentService.calculateDebt(student.id, schoolId)
        totalDebt += debt
        
        if (debt > 0) {
          studentsWithDebt++
        } else {
          studentsUpToDate++
        }
      } catch (error) {
        console.error(`Error calculating debt for student ${student.id}:`, error)
      }
    }

    // Get belt distribution
    const beltCounts = new Map<string, number>()
    activeStudents.forEach((student: any) => {
      const belt = student.belt || 'Sin cinturón'
      beltCounts.set(belt, (beltCounts.get(belt) || 0) + 1)
    })

    const studentsByBelt: BeltDistribution[] = Array.from(beltCounts.entries())
      .map(([belt, count]) => ({
        belt,
        count,
        percentage: activeStudents.length > 0 
          ? Math.round((count / activeStudents.length) * 100) 
          : 0
      }))
      .sort((a, b) => b.count - a.count)

    // Get today's attendances
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)

    const todayAttendances = await prisma.attendance.count({
      where: {
        schedule: {
          schoolId
        },
        date: {
          gte: todayStart,
          lte: todayEnd
        },
        wasPresent: true
      }
    })

    // Get today's payments
    const todayPayments = await prisma.payment.count({
      where: {
        schoolId,
        paymentDate: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    })

    // Get unique students who attended this month
    const monthlyAttendancesWithStudents = await prisma.attendance.findMany({
      where: {
        schedule: {
          schoolId
        },
        date: {
          gte: startDate,
          lte: endDate
        },
        wasPresent: true
      },
      select: {
        studentId: true
      },
      distinct: ['studentId']
    })
    const studentsAttendedThisMonth = monthlyAttendancesWithStudents.length

    // Find next birthday
    let nextBirthday: { studentName: string; date: Date; daysUntil: number } | null = null
    const studentsWithBirthday = activeStudents.filter((s: any) => s.birthDate)
    
    if (studentsWithBirthday.length > 0) {
      const today = new Date()
      const currentYear = today.getFullYear()
      
      // Calculate next birthday for each student
      const upcomingBirthdays = studentsWithBirthday.map((student: any) => {
        const birthDate = new Date(student.birthDate)
        let nextBirthdayDate = new Date(currentYear, birthDate.getMonth(), birthDate.getDate())
        
        // If birthday already passed this year, use next year
        if (nextBirthdayDate < today) {
          nextBirthdayDate = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate())
        }
        
        const daysUntil = Math.ceil((nextBirthdayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        return {
          studentName: `${student.firstName} ${student.lastName}`,
          date: nextBirthdayDate,
          daysUntil
        }
      })
      
      // Sort by days until and get the closest one
      upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil)
      nextBirthday = upcomingBirthdays[0]
    }

    return {
      totalStudents: allStudents.length,
      activeStudents: activeStudents.length,
      inactiveStudents: inactiveStudents.length,
      totalSchedules,
      monthlyAttendanceRate: Math.round(monthlyAttendanceRate * 100) / 100,
      monthlyRevenue,
      totalDebt,
      studentsUpToDate,
      studentsWithDebt,
      studentsByBelt,
      todayAttendances,
      todayPayments,
      studentsAttendedThisMonth,
      nextBirthday
    }
  },

  /**
   * Get recent activity (students, payments, attendances)
   */
  async getRecentActivity(schoolId: string, limit: number = 10): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = []

    // Get recent students (last 5)
    const recentStudents = await prisma.student.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    recentStudents.forEach((student: any) => {
      activities.push({
        id: student.id,
        type: 'student',
        description: `Nuevo alumno registrado: ${student.firstName} ${student.lastName}`,
        date: student.createdAt,
        studentName: `${student.firstName} ${student.lastName}`
      })
    })

    // Get recent payments (last 5)
    const recentPayments = await prisma.payment.findMany({
      where: { schoolId },
      include: {
        student: true
      },
      orderBy: { paymentDate: 'desc' },
      take: 5
    })

    recentPayments.forEach((payment: any) => {
      activities.push({
        id: payment.id,
        type: 'payment',
        description: `Pago recibido de ${payment.student.firstName} ${payment.student.lastName}`,
        date: payment.paymentDate,
        studentName: `${payment.student.firstName} ${payment.student.lastName}`,
        amount: Number(payment.amount)
      })
    })

    // Get recent attendances (last 5)
    const recentAttendances = await prisma.attendance.findMany({
      where: {
        schedule: {
          schoolId
        },
        wasPresent: true
      },
      include: {
        student: true,
        schedule: true
      },
      orderBy: { date: 'desc' },
      take: 5
    })

    recentAttendances.forEach((attendance: any) => {
      activities.push({
        id: attendance.id,
        type: 'attendance',
        description: `${attendance.student.firstName} ${attendance.student.lastName} asistió a ${attendance.schedule.name}`,
        date: attendance.date,
        studentName: `${attendance.student.firstName} ${attendance.student.lastName}`
      })
    })

    // Sort by date and limit
    return activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit)
  },

  /**
   * Get upcoming classes (today and tomorrow)
   */
  async getUpcomingClasses(schoolId: string): Promise<UpcomingClass[]> {
    const now = new Date()
    const today = now.getDay()
    const tomorrow = (today + 1) % 7

    // Get schedules for today and tomorrow
    const schedules = await prisma.schedule.findMany({
      where: {
        schoolId,
        isActive: true,
        OR: [
          { dayOfWeek: today },
          { dayOfWeek: tomorrow }
        ]
      },
      include: {
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    })

    const upcomingClasses: UpcomingClass[] = []

    for (const schedule of schedules) {
      // Determine the date for this class
      let classDate = new Date(now)
      if (schedule.dayOfWeek === tomorrow) {
        classDate = addDays(now, 1)
      }
      classDate = startOfDay(classDate)

      // Check if attendance has been marked for today
      const hasAttendanceToday = schedule.dayOfWeek === today
        ? await prisma.attendance.count({
            where: {
              scheduleId: schedule.id,
              date: {
                gte: startOfDay(now),
                lte: endOfDay(now)
              }
            }
          }) > 0
        : false

      upcomingClasses.push({
        id: schedule.id,
        name: schedule.name,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        enrolledCount: schedule._count.enrollments,
        hasAttendanceToday,
        date: classDate
      })
    }

    return upcomingClasses
  },

  /**
   * Get payment alerts (students with debt)
   */
  async getPaymentAlerts(schoolId: string, limit: number = 5): Promise<PaymentAlert[]> {
    const activeStudents = await prisma.student.findMany({
      where: { 
        schoolId,
        isActive: true
      },
      orderBy: {
        lastName: 'asc'
      }
    })

    const alerts: PaymentAlert[] = []

    for (const student of activeStudents) {
      try {
        const debtDetails = await paymentService.getStudentDebtDetails(student.id, schoolId)
        
        if (debtDetails.totalDebt > 0) {
          alerts.push({
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            belt: student.belt,
            totalDebt: debtDetails.totalDebt,
            monthsOwed: debtDetails.monthsOwed.length,
            lastPaymentDate: debtDetails.lastPaymentDate
          })
        }
      } catch (error) {
        console.error(`Error getting debt for student ${student.id}:`, error)
      }
    }

    // Sort by total debt (highest first) and limit
    return alerts
      .sort((a, b) => b.totalDebt - a.totalDebt)
      .slice(0, limit)
  },

  /**
   * Get attendance trend for the last N days
   */
  async getAttendanceTrend(schoolId: string, days: number = 7): Promise<AttendanceTrend[]> {
    const now = new Date()
    const trends: AttendanceTrend[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i)
      const startDate = startOfDay(date)
      const endDate = endOfDay(date)

      // Get all attendances for this day
      const attendances = await prisma.attendance.findMany({
        where: {
          schedule: {
            schoolId
          },
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      })

      // Count unique schedules that had classes this day
      const uniqueSchedules = new Set(attendances.map((a: any) => a.scheduleId))
      const totalClasses = uniqueSchedules.size

      const totalAttendances = attendances.length
      const totalPresent = attendances.filter((a: any) => a.wasPresent).length
      const attendanceRate = totalAttendances > 0
        ? (totalPresent / totalAttendances) * 100
        : 0

      // Use ISO date string (yyyy-MM-dd) to avoid timezone shift on the client
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      trends.push({
        date: new Date(`${year}-${month}-${day}T12:00:00.000Z`),
        totalClasses,
        totalAttendances,
        attendanceRate: Math.round(attendanceRate * 100) / 100
      })
    }

    return trends
  },

  /**
   * Get monthly attendance statistics
   */
  async getMonthlyAttendanceStats(schoolId: string, year: number, month: number) {
    const startDate = startOfMonth(new Date(year, month - 1, 1))
    const endDate = endOfMonth(new Date(year, month - 1, 1))

    const attendances = await prisma.attendance.findMany({
      where: {
        schedule: {
          schoolId
        },
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const totalAttendances = attendances.length
    const totalPresent = attendances.filter((a: any) => a.wasPresent).length
    const totalAbsent = totalAttendances - totalPresent
    const attendanceRate = totalAttendances > 0
      ? (totalPresent / totalAttendances) * 100
      : 0

    return {
      totalAttendances,
      totalPresent,
      totalAbsent,
      attendanceRate: Math.round(attendanceRate * 100) / 100
    }
  },

  /**
   * Get students count by status
   */
  async getStudentsByStatus(schoolId: string) {
    const total = await prisma.student.count({
      where: { schoolId }
    })

    const active = await prisma.student.count({
      where: { 
        schoolId,
        isActive: true
      }
    })

    const inactive = total - active

    return {
      total,
      active,
      inactive,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0
    }
  }
}

// Made with Bob
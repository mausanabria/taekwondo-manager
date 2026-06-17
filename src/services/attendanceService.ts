import { prisma } from "@/lib/prisma"
import { Attendance } from "@/types"
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns"

export interface MarkAttendanceData {
  scheduleId: string
  studentId: string
  date: Date
  wasPresent: boolean
  notes?: string | null
}

export interface BulkAttendanceData {
  studentId: string
  wasPresent: boolean
  notes?: string | null
}

export interface AttendanceStats {
  totalAttendances: number
  totalPresent: number
  totalAbsent: number
  attendanceRate: number
  currentStreak: number
  longestStreak: number
}

export interface AttendanceWithDetails extends Attendance {
  student?: {
    id: string
    firstName: string
    lastName: string
    belt?: string | null
  }
  schedule?: {
    id: string
    name: string
    dayOfWeek: number
    startTime: string
    endTime: string
  }
}

export const attendanceService = {
  /**
   * Get attendances for a specific schedule on a specific date
   */
  async getAttendanceByDate(
    scheduleId: string,
    date: Date,
    schoolId: string
  ): Promise<AttendanceWithDetails[]> {
    // Verify schedule belongs to school
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId }
    })

    if (!schedule) {
      throw new Error("Schedule not found")
    }

    if (schedule.schoolId !== schoolId) {
      throw new Error("Unauthorized: Schedule does not belong to your school")
    }

    const startDate = startOfDay(date)
    const endDate = endOfDay(date)

    return await prisma.attendance.findMany({
      where: {
        scheduleId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            belt: true
          }
        },
        schedule: {
          select: {
            id: true,
            name: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: {
        student: {
          lastName: 'asc'
        }
      }
    })
  },

  /**
   * Mark attendance for a single student
   */
  async markAttendance(
    data: MarkAttendanceData,
    schoolId: string
  ): Promise<Attendance> {
    // Validate that date is not in the future
    const now = new Date()
    if (data.date > now) {
      throw new Error("Cannot mark attendance for future dates")
    }

    // Verify schedule belongs to school
    const schedule = await prisma.schedule.findUnique({
      where: { id: data.scheduleId }
    })

    if (!schedule) {
      throw new Error("Schedule not found")
    }

    if (schedule.schoolId !== schoolId) {
      throw new Error("Unauthorized: Schedule does not belong to your school")
    }

    // Verify student belongs to school
    const student = await prisma.student.findUnique({
      where: { id: data.studentId }
    })

    if (!student) {
      throw new Error("Student not found")
    }

    if (student.schoolId !== schoolId) {
      throw new Error("Unauthorized: Student does not belong to your school")
    }

    // Verify student is enrolled in the schedule
    const enrollment = await prisma.studentSchedule.findUnique({
      where: {
        studentId_scheduleId: {
          studentId: data.studentId,
          scheduleId: data.scheduleId
        }
      }
    })

    if (!enrollment || !enrollment.isActive) {
      throw new Error("Student is not enrolled in this schedule")
    }

    // Normalize date to start of day for consistency
    const normalizedDate = startOfDay(data.date)

    // Check if attendance already exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentId_scheduleId_date: {
          studentId: data.studentId,
          scheduleId: data.scheduleId,
          date: normalizedDate
        }
      }
    })

    if (existingAttendance) {
      // Update existing attendance
      return await prisma.attendance.update({
        where: {
          studentId_scheduleId_date: {
            studentId: data.studentId,
            scheduleId: data.scheduleId,
            date: normalizedDate
          }
        },
        data: {
          wasPresent: data.wasPresent,
          notes: data.notes
        }
      })
    }

    // Create new attendance record
    return await prisma.attendance.create({
      data: {
        studentId: data.studentId,
        scheduleId: data.scheduleId,
        date: normalizedDate,
        wasPresent: data.wasPresent,
        notes: data.notes
      }
    })
  },

  /**
   * Mark attendance for multiple students at once
   */
  async bulkMarkAttendance(
    scheduleId: string,
    date: Date,
    attendances: BulkAttendanceData[],
    schoolId: string
  ): Promise<{ created: number; updated: number }> {
    // Validate that date is not in the future
    const now = new Date()
    if (date > now) {
      throw new Error("Cannot mark attendance for future dates")
    }

    // Verify schedule belongs to school
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId }
    })

    if (!schedule) {
      throw new Error("Schedule not found")
    }

    if (schedule.schoolId !== schoolId) {
      throw new Error("Unauthorized: Schedule does not belong to your school")
    }

    // Normalize date
    const normalizedDate = startOfDay(date)

    let created = 0
    let updated = 0

    // Process each attendance record
    for (const attendance of attendances) {
      try {
        // Verify student belongs to school
        const student = await prisma.student.findUnique({
          where: { id: attendance.studentId }
        })

        if (!student || student.schoolId !== schoolId) {
          continue // Skip unauthorized students
        }

        // Verify student is enrolled in the schedule
        const enrollment = await prisma.studentSchedule.findUnique({
          where: {
            studentId_scheduleId: {
              studentId: attendance.studentId,
              scheduleId: scheduleId
            }
          }
        })

        if (!enrollment || !enrollment.isActive) {
          continue // Skip non-enrolled students
        }

        // Check if attendance already exists
        const existingAttendance = await prisma.attendance.findUnique({
          where: {
            studentId_scheduleId_date: {
              studentId: attendance.studentId,
              scheduleId: scheduleId,
              date: normalizedDate
            }
          }
        })

        if (existingAttendance) {
          // Update existing attendance
          await prisma.attendance.update({
            where: {
              studentId_scheduleId_date: {
                studentId: attendance.studentId,
                scheduleId: scheduleId,
                date: normalizedDate
              }
            },
            data: {
              wasPresent: attendance.wasPresent,
              notes: attendance.notes
            }
          })
          updated++
        } else {
          // Create new attendance record
          await prisma.attendance.create({
            data: {
              studentId: attendance.studentId,
              scheduleId: scheduleId,
              date: normalizedDate,
              wasPresent: attendance.wasPresent,
              notes: attendance.notes
            }
          })
          created++
        }
      } catch (error) {
        console.error(`Error processing attendance for student ${attendance.studentId}:`, error)
        // Continue with next student
      }
    }

    return { created, updated }
  },

  /**
   * Get attendance history for a student with optional date range
   */
  async getStudentAttendances(
    studentId: string,
    schoolId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AttendanceWithDetails[]> {
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

    const where: any = { studentId }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = startOfDay(startDate)
      }
      if (endDate) {
        where.date.lte = endOfDay(endDate)
      }
    }

    return await prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            belt: true
          }
        },
        schedule: {
          select: {
            id: true,
            name: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })
  },

  /**
   * Get attendance history for a schedule with optional date range
   */
  async getScheduleAttendances(
    scheduleId: string,
    schoolId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AttendanceWithDetails[]> {
    // Verify schedule belongs to school
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId }
    })

    if (!schedule) {
      throw new Error("Schedule not found")
    }

    if (schedule.schoolId !== schoolId) {
      throw new Error("Unauthorized: Schedule does not belong to your school")
    }

    const where: any = { scheduleId }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = startOfDay(startDate)
      }
      if (endDate) {
        where.date.lte = endOfDay(endDate)
      }
    }

    return await prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            belt: true
          }
        },
        schedule: {
          select: {
            id: true,
            name: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { student: { lastName: 'asc' } }
      ]
    })
  },

  /**
   * Get attendance statistics for a student
   */
  async getAttendanceStats(
    studentId: string,
    schoolId: string
  ): Promise<AttendanceStats> {
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

    // Get all attendances for the student
    const attendances = await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' }
    })

    const totalAttendances = attendances.length
    const totalPresent = attendances.filter((a: any) => a.wasPresent).length
    const totalAbsent = totalAttendances - totalPresent
    const attendanceRate = totalAttendances > 0 
      ? (totalPresent / totalAttendances) * 100 
      : 0

    // Calculate current streak (consecutive present days from most recent)
    let currentStreak = 0
    for (const attendance of attendances) {
      if (attendance.wasPresent) {
        currentStreak++
      } else {
        break
      }
    }

    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 0
    for (const attendance of attendances.reverse()) {
      if (attendance.wasPresent) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    return {
      totalAttendances,
      totalPresent,
      totalAbsent,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      currentStreak,
      longestStreak
    }
  },

  /**
   * Get monthly attendance for a student (specific month/year)
   */
  async getMonthlyAttendance(
    studentId: string,
    year: number,
    month: number,
    schoolId: string
  ): Promise<AttendanceWithDetails[]> {
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

    // Create date range for the month
    const startDate = startOfMonth(new Date(year, month - 1, 1))
    const endDate = endOfMonth(new Date(year, month - 1, 1))

    return await prisma.attendance.findMany({
      where: {
        studentId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            belt: true
          }
        },
        schedule: {
          select: {
            id: true,
            name: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })
  },

  /**
   * Check if student attended at least once in a specific month
   * Critical for payment system - only generate debt if student attended
   */
  async hasAttendedInMonth(
    studentId: string,
    year: number,
    month: number,
    schoolId: string
  ): Promise<boolean> {
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

    // Create date range for the month
    const startDate = startOfMonth(new Date(year, month - 1, 1))
    const endDate = endOfMonth(new Date(year, month - 1, 1))

    // Check if there's at least one present attendance in the month
    const attendance = await prisma.attendance.findFirst({
      where: {
        studentId,
        wasPresent: true,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    return attendance !== null
  },

  /**
   * Get students enrolled in a schedule with their attendance status for a specific date
   */
  async getScheduleStudentsWithAttendance(
    scheduleId: string,
    date: Date,
    schoolId: string
  ) {
    // Verify schedule belongs to school
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId }
    })

    if (!schedule) {
      throw new Error("Schedule not found")
    }

    if (schedule.schoolId !== schoolId) {
      throw new Error("Unauthorized: Schedule does not belong to your school")
    }

    const normalizedDate = startOfDay(date)

    // Get all enrolled students
    const enrollments = await prisma.studentSchedule.findMany({
      where: {
        scheduleId,
        isActive: true
      },
      include: {
        student: true
      },
      orderBy: {
        student: {
          lastName: 'asc'
        }
      }
    })

    // Get attendances for this date
    const attendances = await prisma.attendance.findMany({
      where: {
        scheduleId,
        date: {
          gte: normalizedDate,
          lte: endOfDay(date)
        }
      }
    })

    // Create a map of student attendance
    const attendanceMap = new Map(
      attendances.map((a: any) => [a.studentId, a])
    )

    // Combine student data with attendance status
    return enrollments.map((enrollment: any) => ({
      student: enrollment.student,
      attendance: attendanceMap.get(enrollment.student.id) || null
    }))
  },

  /**
   * Delete an attendance record (for corrections)
   */
  async deleteAttendance(
    studentId: string,
    scheduleId: string,
    date: Date,
    schoolId: string
  ): Promise<void> {
    // Verify schedule belongs to school
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId }
    })

    if (!schedule || schedule.schoolId !== schoolId) {
      throw new Error("Unauthorized: Schedule does not belong to your school")
    }

    // Verify student belongs to school
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student || student.schoolId !== schoolId) {
      throw new Error("Unauthorized: Student does not belong to your school")
    }

    const normalizedDate = startOfDay(date)

    await prisma.attendance.delete({
      where: {
        studentId_scheduleId_date: {
          studentId,
          scheduleId,
          date: normalizedDate
        }
      }
    })
  }
}

// Made with Bob

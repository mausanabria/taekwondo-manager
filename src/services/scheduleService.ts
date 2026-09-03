import { prisma } from "@/lib/prisma"
import { Schedule } from "@/types"

export interface CreateScheduleData {
  name: string
  dayOfWeek: number
  daysOfWeek: number[]
  startTime: string
  endTime: string
  capacity?: number | null
  schoolId: string
}

export interface UpdateScheduleData {
  name?: string
  dayOfWeek?: number
  daysOfWeek?: number[]
  startTime?: string
  endTime?: string
  capacity?: number | null
  isActive?: boolean
}

export interface ScheduleWithStudents extends Schedule {
  _count?: {
    enrollments: number
  }
  enrollments?: Array<{
    student: {
      id: string
      firstName: string
      lastName: string
      belt?: string | null
    }
  }>
}

export const scheduleService = {
  // Get all schedules for a school
  async getAllSchedules(schoolId: string): Promise<ScheduleWithStudents[]> {
    return await prisma.schedule.findMany({
      where: { 
        schoolId,
        isActive: true 
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
  },

  // Get a single schedule by ID with school validation
  async getScheduleById(id: string, schoolId: string): Promise<ScheduleWithStudents | null> {
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        _count: {
          select: { enrollments: true }
        },
        enrollments: {
          where: { isActive: true },
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                belt: true,
                email: true,
                phone: true,
                isActive: true
              }
            }
          },
          orderBy: {
            student: {
              lastName: 'asc'
            }
          }
        }
      }
    })

    // Validate that schedule belongs to the school
    if (schedule && schedule.schoolId !== schoolId) {
      throw new Error("Unauthorized: Schedule does not belong to your school")
    }

    return schedule
  },

  // Create a new schedule
  async createSchedule(data: CreateScheduleData): Promise<Schedule> {
    // Validate time format
    this.validateTimeFormat(data.startTime)
    this.validateTimeFormat(data.endTime)

    // Validate that endTime is after startTime
    if (!this.isEndTimeAfterStartTime(data.startTime, data.endTime)) {
      throw new Error("End time must be after start time")
    }

    // Validate daysOfWeek
    if (!data.daysOfWeek || data.daysOfWeek.length === 0) {
      throw new Error("At least one day must be selected")
    }

    // Check for overlapping schedules on each selected day
    for (const day of data.daysOfWeek) {
      const hasOverlap = await this.checkScheduleOverlap(
        data.schoolId,
        day,
        data.startTime,
        data.endTime
      )

      if (hasOverlap) {
        const dayName = this.getDayName(day)
        throw new Error(`Schedule overlaps with an existing schedule on ${dayName}`)
      }
    }

    return await prisma.schedule.create({
      data: {
        name: data.name,
        dayOfWeek: data.dayOfWeek,
        daysOfWeek: data.daysOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        capacity: data.capacity,
        schoolId: data.schoolId
      }
    })
  },

  // Update a schedule with school validation
  async updateSchedule(id: string, data: UpdateScheduleData, schoolId: string): Promise<Schedule> {
    // First verify the schedule belongs to the school
    const schedule = await prisma.schedule.findUnique({
      where: { id }
    })

    if (!schedule) {
      throw new Error("Schedule not found")
    }

    if (schedule.schoolId !== schoolId) {
      throw new Error("Unauthorized: Schedule does not belong to your school")
    }

    // Validate time formats if provided
    if (data.startTime) {
      this.validateTimeFormat(data.startTime)
    }
    if (data.endTime) {
      this.validateTimeFormat(data.endTime)
    }

    // Validate that endTime is after startTime
    const startTime = data.startTime || schedule.startTime
    const endTime = data.endTime || schedule.endTime
    
    if (!this.isEndTimeAfterStartTime(startTime, endTime)) {
      throw new Error("End time must be after start time")
    }

    // Validate daysOfWeek if provided
    if (data.daysOfWeek && data.daysOfWeek.length === 0) {
      throw new Error("At least one day must be selected")
    }

    // Get the days to check for overlaps
    const daysToCheck = data.daysOfWeek || (schedule as any).daysOfWeek || [schedule.dayOfWeek]

    // Check for overlapping schedules on each day (excluding current schedule)
    for (const day of daysToCheck) {
      const hasOverlap = await this.checkScheduleOverlap(
        schoolId,
        day,
        startTime,
        endTime,
        id
      )

      if (hasOverlap) {
        const dayName = this.getDayName(day)
        throw new Error(`Schedule overlaps with an existing schedule on ${dayName}`)
      }
    }

    // If daysOfWeek is being updated, also update dayOfWeek to the first day
    const updateData: any = { ...data }
    if (data.daysOfWeek && data.daysOfWeek.length > 0) {
      updateData.dayOfWeek = data.daysOfWeek[0]
    }

    return await prisma.schedule.update({
      where: { id },
      data: updateData
    })
  },

  // Delete a schedule (soft delete) with school validation
  async deleteSchedule(id: string, schoolId: string): Promise<Schedule> {
    // First verify the schedule belongs to the school
    const schedule = await prisma.schedule.findUnique({
      where: { id }
    })

    if (!schedule) {
      throw new Error("Schedule not found")
    }

    if (schedule.schoolId !== schoolId) {
      throw new Error("Unauthorized: Schedule does not belong to your school")
    }

    // Soft delete by marking as inactive
    return await prisma.schedule.update({
      where: { id },
      data: { isActive: false }
    })
  },

  // Get students enrolled in a schedule
  async getScheduleStudents(scheduleId: string, schoolId: string) {
    // Verify schedule belongs to school
    await this.getScheduleById(scheduleId, schoolId)

    return await prisma.studentSchedule.findMany({
      where: {
        scheduleId,
        isActive: true,
        student: {
          isActive: true
        }
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
  },

  // Enroll a student in a schedule
  async enrollStudent(
    scheduleId: string,
    studentId: string,
    schoolId: string,
    weeklyFrequency: number = 1,
    monthlyFee?: number,
    notes?: string
  ) {
    // Validate weeklyFrequency
    if (weeklyFrequency < 1 || weeklyFrequency > 7) {
      throw new Error("Weekly frequency must be between 1 and 7")
    }

    // Validate monthlyFee if provided
    if (monthlyFee !== undefined && monthlyFee < 0) {
      throw new Error("Monthly fee must be a positive number")
    }

    // Verify schedule belongs to school
    const schedule = await this.getScheduleById(scheduleId, schoolId)
    
    if (!schedule) {
      throw new Error("Schedule not found")
    }

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

    // Check if student is already enrolled
    const existingEnrollment = await prisma.studentSchedule.findUnique({
      where: {
        studentId_scheduleId: {
          studentId,
          scheduleId
        }
      }
    })

    if (existingEnrollment) {
      if (existingEnrollment.isActive) {
        throw new Error("Student is already enrolled in this schedule")
      }
      // Reactivate enrollment with new data
      return await prisma.studentSchedule.update({
        where: {
          studentId_scheduleId: {
            studentId,
            scheduleId
          }
        },
        data: {
          isActive: true,
          weeklyFrequency,
          monthlyFee,
          notes
        }
      })
    }

    // Check capacity
    if (schedule.capacity) {
      const enrollmentCount = schedule._count?.enrollments || 0
      if (enrollmentCount >= schedule.capacity) {
        throw new Error("Schedule is at full capacity")
      }
    }

    // Create enrollment
    return await prisma.studentSchedule.create({
      data: {
        studentId,
        scheduleId,
        weeklyFrequency,
        monthlyFee,
        notes
      }
    })
  },

  // Update student enrollment
  async updateEnrollment(
    scheduleId: string,
    studentId: string,
    schoolId: string,
    weeklyFrequency?: number,
    monthlyFee?: number | null,
    notes?: string | null
  ) {
    // Validate weeklyFrequency if provided
    if (weeklyFrequency !== undefined && (weeklyFrequency < 1 || weeklyFrequency > 7)) {
      throw new Error("Weekly frequency must be between 1 and 7")
    }

    // Validate monthlyFee if provided
    if (monthlyFee !== undefined && monthlyFee !== null && monthlyFee < 0) {
      throw new Error("Monthly fee must be a positive number")
    }

    // Verify schedule belongs to school
    await this.getScheduleById(scheduleId, schoolId)

    // Verify student belongs to school
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student || student.schoolId !== schoolId) {
      throw new Error("Unauthorized: Student does not belong to your school")
    }

    // Check if enrollment exists
    const enrollment = await prisma.studentSchedule.findUnique({
      where: {
        studentId_scheduleId: {
          studentId,
          scheduleId
        }
      }
    })

    if (!enrollment) {
      throw new Error("Student is not enrolled in this schedule")
    }

    // Update enrollment
    const updateData: any = {}
    if (weeklyFrequency !== undefined) updateData.weeklyFrequency = weeklyFrequency
    if (monthlyFee !== undefined) updateData.monthlyFee = monthlyFee
    if (notes !== undefined) updateData.notes = notes

    return await prisma.studentSchedule.update({
      where: {
        studentId_scheduleId: {
          studentId,
          scheduleId
        }
      },
      data: updateData
    })
  },

  // Unenroll a student from a schedule
  async unenrollStudent(scheduleId: string, studentId: string, schoolId: string) {
    // Verify schedule belongs to school
    await this.getScheduleById(scheduleId, schoolId)

    // Verify student belongs to school
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student || student.schoolId !== schoolId) {
      throw new Error("Unauthorized: Student does not belong to your school")
    }

    // Check if enrollment exists
    const enrollment = await prisma.studentSchedule.findUnique({
      where: {
        studentId_scheduleId: {
          studentId,
          scheduleId
        }
      }
    })

    if (!enrollment) {
      throw new Error("Student is not enrolled in this schedule")
    }

    // Soft delete by marking as inactive
    return await prisma.studentSchedule.update({
      where: {
        studentId_scheduleId: {
          studentId,
          scheduleId
        }
      },
      data: { isActive: false }
    })
  },

  // Get all schedules for a student
  async getStudentSchedules(studentId: string, schoolId: string) {
    // Verify student belongs to school
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student || student.schoolId !== schoolId) {
      throw new Error("Unauthorized: Student does not belong to your school")
    }

    return await prisma.studentSchedule.findMany({
      where: {
        studentId,
        isActive: true
      },
      include: {
        schedule: true
      },
      orderBy: [
        {
          schedule: {
            dayOfWeek: 'asc'
          }
        },
        {
          schedule: {
            startTime: 'asc'
          }
        }
      ]
    })
  },

  // Helper: Validate time format (HH:MM)
  validateTimeFormat(time: string): void {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(time)) {
      throw new Error(`Invalid time format: ${time}. Expected HH:MM format`)
    }
  },

  // Helper: Check if end time is after start time
  isEndTimeAfterStartTime(startTime: string, endTime: string): boolean {
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute
    
    return endMinutes > startMinutes
  },

  // Helper: Check for schedule overlap
  async checkScheduleOverlap(
    schoolId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeScheduleId?: string
  ): Promise<boolean> {
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    // Get all schedules for the same day
    const schedules = await prisma.schedule.findMany({
      where: {
        schoolId,
        dayOfWeek,
        isActive: true,
        ...(excludeScheduleId && { id: { not: excludeScheduleId } })
      }
    })

    // Check for overlaps
    for (const schedule of schedules) {
      const [schedStartHour, schedStartMinute] = schedule.startTime.split(':').map(Number)
      const [schedEndHour, schedEndMinute] = schedule.endTime.split(':').map(Number)
      
      const schedStartMinutes = schedStartHour * 60 + schedStartMinute
      const schedEndMinutes = schedEndHour * 60 + schedEndMinute

      // Check if times overlap
      if (
        (startMinutes >= schedStartMinutes && startMinutes < schedEndMinutes) ||
        (endMinutes > schedStartMinutes && endMinutes <= schedEndMinutes) ||
        (startMinutes <= schedStartMinutes && endMinutes >= schedEndMinutes)
      ) {
        return true
      }
    }

    return false
  },

  // Get day name from day number
  getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayOfWeek] || 'Unknown'
  }
}

// Made with Bob

import { z } from "zod"

// Validation schema for marking single attendance
export const markAttendanceSchema = z.object({
  scheduleId: z.string()
    .min(1, "Schedule ID is required")
    .cuid("Invalid schedule ID format"),
  
  studentId: z.string()
    .min(1, "Student ID is required")
    .cuid("Invalid student ID format"),
  
  date: z.string()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine((dateStr) => {
      const date = new Date(dateStr)
      const now = new Date()
      return date <= now
    }, "Cannot mark attendance for future dates"),
  
  wasPresent: z.boolean({
    required_error: "Attendance status is required",
    invalid_type_error: "Attendance status must be a boolean"
  }),
  
  notes: z.string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .nullable()
    .or(z.literal(""))
})

// Validation schema for bulk attendance
export const bulkAttendanceSchema = z.object({
  scheduleId: z.string()
    .min(1, "Schedule ID is required")
    .cuid("Invalid schedule ID format"),
  
  date: z.string()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine((dateStr) => {
      const date = new Date(dateStr)
      const now = new Date()
      return date <= now
    }, "Cannot mark attendance for future dates"),
  
  attendances: z.array(
    z.object({
      studentId: z.string()
        .min(1, "Student ID is required")
        .cuid("Invalid student ID format"),
      
      wasPresent: z.boolean({
        required_error: "Attendance status is required",
        invalid_type_error: "Attendance status must be a boolean"
      }),
      
      notes: z.string()
        .max(500, "Notes cannot exceed 500 characters")
        .optional()
        .nullable()
        .or(z.literal(""))
    })
  ).min(1, "At least one attendance record is required")
})

// Validation schema for querying attendances
export const getAttendanceQuerySchema = z.object({
  scheduleId: z.string()
    .cuid("Invalid schedule ID format")
    .optional(),
  
  studentId: z.string()
    .cuid("Invalid student ID format")
    .optional(),
  
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format")
    .optional(),
  
  endDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format")
    .optional(),
  
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional()
}).refine((data) => {
  // If both startDate and endDate are provided, startDate must be before or equal to endDate
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate)
  }
  return true
}, {
  message: "Start date must be before or equal to end date",
  path: ["startDate"]
})

// Validation schema for monthly attendance query
export const monthlyAttendanceSchema = z.object({
  year: z.number()
    .int("Year must be an integer")
    .min(2000, "Year must be 2000 or later")
    .max(2100, "Year must be 2100 or earlier"),
  
  month: z.number()
    .int("Month must be an integer")
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12")
})

// Validation schema for deleting attendance
export const deleteAttendanceSchema = z.object({
  scheduleId: z.string()
    .min(1, "Schedule ID is required")
    .cuid("Invalid schedule ID format"),
  
  studentId: z.string()
    .min(1, "Student ID is required")
    .cuid("Invalid student ID format"),
  
  date: z.string()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
})

// Type inference from schemas
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>
export type GetAttendanceQuery = z.infer<typeof getAttendanceQuerySchema>
export type MonthlyAttendanceQuery = z.infer<typeof monthlyAttendanceSchema>
export type DeleteAttendanceInput = z.infer<typeof deleteAttendanceSchema>

// Helper functions to validate attendance data
export function validateMarkAttendance(data: unknown) {
  return markAttendanceSchema.safeParse(data)
}

export function validateBulkAttendance(data: unknown) {
  return bulkAttendanceSchema.safeParse(data)
}

export function validateGetAttendanceQuery(data: unknown) {
  return getAttendanceQuerySchema.safeParse(data)
}

export function validateMonthlyAttendance(data: unknown) {
  return monthlyAttendanceSchema.safeParse(data)
}

export function validateDeleteAttendance(data: unknown) {
  return deleteAttendanceSchema.safeParse(data)
}

// Made with Bob
import { z } from "zod"

// Validation schema for creating monthly fee
export const createMonthlyFeeSchema = z.object({
  month: z.number()
    .int("Month must be an integer")
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
  
  year: z.number()
    .int("Year must be an integer")
    .min(2000, "Year must be 2000 or later")
    .max(2100, "Year must be 2100 or earlier"),
  
  amount: z.number()
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places")
    .max(999999.99, "Amount cannot exceed 999,999.99"),
  
  description: z.string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable()
    .or(z.literal(""))
})

// Validation schema for updating monthly fee
export const updateMonthlyFeeSchema = z.object({
  amount: z.number()
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places")
    .max(999999.99, "Amount cannot exceed 999,999.99")
})

// Validation schema for recording payment
export const recordPaymentSchema = z.object({
  studentId: z.string()
    .min(1, "Student ID is required")
    .cuid("Invalid student ID format"),
  
  month: z.number()
    .int("Month must be an integer")
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
  
  year: z.number()
    .int("Year must be an integer")
    .min(2000, "Year must be 2000 or later")
    .max(2100, "Year must be 2100 or earlier"),
  
  amount: z.number()
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places")
    .max(999999.99, "Amount cannot exceed 999,999.99"),
  
  paymentDate: z.string()
    .min(1, "Payment date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Payment date must be in YYYY-MM-DD format")
    .refine((dateStr: string) => {
      const date = new Date(dateStr)
      const now = new Date()
      return date <= now
    }, "Payment date cannot be in the future"),
  
  paymentMethod: z.string()
    .max(100, "Payment method cannot exceed 100 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  
  notes: z.string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .nullable()
    .or(z.literal(""))
})

// Validation schema for querying payments
export const getPaymentsQuerySchema = z.object({
  studentId: z.string()
    .cuid("Invalid student ID format")
    .optional(),
  
  year: z.number()
    .int("Year must be an integer")
    .min(2000, "Year must be 2000 or later")
    .max(2100, "Year must be 2100 or earlier")
    .optional(),
  
  month: z.number()
    .int("Month must be an integer")
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12")
    .optional()
})

// Validation schema for monthly fee query
export const monthlyFeeQuerySchema = z.object({
  year: z.number()
    .int("Year must be an integer")
    .min(2000, "Year must be 2000 or later")
    .max(2100, "Year must be 2100 or earlier")
    .optional(),
  
  month: z.number()
    .int("Month must be an integer")
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12")
    .optional()
})

// Type inference from schemas
export type CreateMonthlyFeeInput = z.infer<typeof createMonthlyFeeSchema>
export type UpdateMonthlyFeeInput = z.infer<typeof updateMonthlyFeeSchema>
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>
export type GetPaymentsQuery = z.infer<typeof getPaymentsQuerySchema>
export type MonthlyFeeQuery = z.infer<typeof monthlyFeeQuerySchema>

// Helper functions to validate payment data
export function validateCreateMonthlyFee(data: unknown) {
  return createMonthlyFeeSchema.safeParse(data)
}

export function validateUpdateMonthlyFee(data: unknown) {
  return updateMonthlyFeeSchema.safeParse(data)
}

export function validateRecordPayment(data: unknown) {
  return recordPaymentSchema.safeParse(data)
}

export function validateGetPaymentsQuery(data: unknown) {
  return getPaymentsQuerySchema.safeParse(data)
}

export function validateMonthlyFeeQuery(data: unknown) {
  return monthlyFeeQuerySchema.safeParse(data)
}

// Made with Bob
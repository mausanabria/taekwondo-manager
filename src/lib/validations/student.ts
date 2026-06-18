import { z } from "zod"

// Belt options - Complete list with intermediate levels (puntas)
export const BELT_VALUES = [
  "blanco",
  "blanco-amarillo",
  "amarillo",
  "amarillo-verde",
  "verde",
  "verde-azul",
  "azul",
  "azul-rojo",
  "rojo",
  "rojo-negro",
  "negro-1",
  "negro-2",
  "negro-3",
  "negro-4",
  "negro-5"
] as const

// Validation schema for creating a student
export const createStudentSchema = z.object({
  firstName: z.string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim(),
  
  lastName: z.string()
    .min(1, "El apellido es requerido")
    .max(100, "El apellido no puede exceder 100 caracteres")
    .trim(),
  
  email: z.string()
    .email("Formato de email inválido")
    .max(255, "El email no puede exceder 255 caracteres")
    .optional()
    .nullable()
    .or(z.literal("")),
  
  phone: z.string()
    .min(1, "El teléfono es requerido")
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .regex(/^[0-9\s\-\+\(\)]+$/, "El teléfono solo puede contener números y caracteres especiales válidos")
    .trim(),
  
  birthDate: z.string()
    .optional()
    .nullable()
    .or(z.literal("")),
  
  belt: z.enum(BELT_VALUES)
    .optional()
    .nullable()
    .or(z.literal("")),
  
  address: z.string()
    .max(500, "La dirección no puede exceder 500 caracteres")
    .optional()
    .nullable()
    .or(z.literal("")),
  
  emergencyContact: z.string()
    .max(100, "El nombre del contacto no puede exceder 100 caracteres")
    .optional()
    .nullable()
    .or(z.literal("")),
  
  emergencyPhone: z.string()
    .max(20, "El teléfono de emergencia no puede exceder 20 caracteres")
    .regex(/^$|^[0-9\s\-\+\(\)]+$/, "El teléfono solo puede contener números y caracteres especiales válidos")
    .optional()
    .nullable()
    .or(z.literal("")),
  
  notes: z.string()
    .optional()
    .nullable()
    .or(z.literal("")),
  
  isActive: z.boolean()
    .optional()
    .default(true),
  
  inactiveDate: z.string()
    .optional()
    .nullable()
    .or(z.literal(""))
})

// Validation schema for updating a student (all fields optional except those that should remain required)
export const updateStudentSchema = z.object({
  firstName: z.string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim()
    .optional(),
  
  lastName: z.string()
    .min(1, "El apellido es requerido")
    .max(100, "El apellido no puede exceder 100 caracteres")
    .trim()
    .optional(),
  
  email: z.string()
    .email("Formato de email inválido")
    .max(255, "El email no puede exceder 255 caracteres")
    .optional()
    .nullable()
    .or(z.literal("")),
  
  phone: z.string()
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .regex(/^[0-9\s\-\+\(\)]+$/, "El teléfono solo puede contener números y caracteres especiales válidos")
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  
  birthDate: z.string()
    .optional()
    .nullable()
    .or(z.literal("")),
  
  belt: z.enum(BELT_VALUES)
    .optional()
    .nullable()
    .or(z.literal("")),
  
  address: z.string()
    .max(500, "La dirección no puede exceder 500 caracteres")
    .optional()
    .nullable()
    .or(z.literal("")),
  
  emergencyContact: z.string()
    .max(100, "El nombre del contacto no puede exceder 100 caracteres")
    .optional()
    .nullable()
    .or(z.literal("")),
  
  emergencyPhone: z.string()
    .max(20, "El teléfono de emergencia no puede exceder 20 caracteres")
    .regex(/^$|^[0-9\s\-\+\(\)]+$/, "El teléfono solo puede contener números y caracteres especiales válidos")
    .optional()
    .nullable()
    .or(z.literal("")),
  
  notes: z.string()
    .optional()
    .nullable()
    .or(z.literal("")),
  
  isActive: z.boolean()
    .optional(),
  
  inactiveDate: z.string()
    .optional()
    .nullable()
    .or(z.literal(""))
})

// Type inference from schemas
export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>

// Helper function to validate student data
export function validateCreateStudent(data: unknown) {
  return createStudentSchema.safeParse(data)
}

export function validateUpdateStudent(data: unknown) {
  return updateStudentSchema.safeParse(data)
}

// Made with Bob
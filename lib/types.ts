/**
 * Patient Types and Schemas
 */

import { z } from 'zod'

// Zod schemas for validation
export const PatientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name required').max(100),
  age: z.number().int().min(0).max(150),
  gender: z.enum(['M', 'F', 'Other']),
  phone: z.string().regex(/^\d{10}$/, 'Invalid phone number'),
  address: z.string().max(500),
  riskLevel: z.enum(['low', 'medium', 'high']).default('low'),
  chronicConditions: z.array(z.string()).default([]),
  lastVisitDate: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
  synced: z.boolean().default(false),
})

export type Patient = z.infer<typeof PatientSchema>

export const CreatePatientSchema = PatientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  synced: true,
})

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>

// Visit/Consultation types
export const SymptomSchema = z.object({
  name: z.string(),
  duration: z.string().optional(),
})

export const VitalSignsSchema = z.object({
  bp: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'BP format: 120/80'),
  pulse: z.number().int().min(30).max(200),
  temperature: z.number().min(35).max(42),
  weight: z.number().min(1).max(300),
  respiratoryRate: z.number().int().min(10).max(60).optional(),
})

export type VitalSigns = z.infer<typeof VitalSignsSchema>

export const VisitSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  date: z.string(),
  symptoms: z.array(SymptomSchema),
  vitals: VitalSignsSchema,
  observations: z.string(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  aiAnalysis: z
    .object({
      riskLevel: z.enum(['low', 'medium', 'high']),
      possibleConditions: z.array(z.string()),
      recommendations: z.array(z.string()),
      confidence: z.number().min(0).max(100),
      referralRequired: z.boolean(),
    })
    .optional(),
  medicalProvider: z.string().optional(),
  synced: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Visit = z.infer<typeof VisitSchema>

export const CreateVisitSchema = VisitSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  synced: true,
})

export type CreateVisitInput = z.infer<typeof CreateVisitSchema>

/**
 * Zustand Store for Patients
 */

import { create } from 'zustand'
import { Patient, CreatePatientInput, PatientSchema } from '@/lib/types'
import { getDB } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

interface PatientState {
  patients: Patient[]
  loading: boolean
  error: string | null

  // Actions
  fetchPatients: () => Promise<void>
  addPatient: (data: CreatePatientInput) => Promise<Patient>
  updatePatient: (id: string, data: Partial<Patient>) => Promise<Patient>
  deletePatient: (id: string) => Promise<void>
  getPatient: (id: string) => Patient | undefined
  searchPatients: (query: string, type: 'name' | 'phone' | 'family') => Patient[]
  setError: (error: string | null) => void
  clearError: () => void
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: [],
  loading: false,
  error: null,

  fetchPatients: async () => {
    set({ loading: true })
    try {
      const db = await getDB()
      const patients = await db.getAll<Patient>('patients')
      set({ patients, error: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch patients'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },

  addPatient: async (data) => {
    try {
      // Validate input
      const validatedData = PatientSchema.parse({
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: false,
      })

      const db = await getDB()
      await db.put('patients', validatedData)

      // Update local state
      set((state) => ({
        patients: [...state.patients, validatedData],
        error: null,
      }))

      return validatedData
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add patient'
      set({ error: message })
      throw error
    }
  },

  updatePatient: async (id, data) => {
    try {
      const existing = get().getPatient(id)
      if (!existing) throw new Error('Patient not found')

      const updatedPatient: Patient = {
        ...existing,
        ...data,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      }

      const db = await getDB()
      await db.put('patients', updatedPatient)

      // Update local state
      set((state) => ({
        patients: state.patients.map((p) =>
          p.id === id ? updatedPatient : p
        ),
        error: null,
      }))

      return updatedPatient
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update patient'
      set({ error: message })
      throw error
    }
  },

  deletePatient: async (id) => {
    try {
      const db = await getDB()
      await db.delete('patients', id)

      // Update local state
      set((state) => ({
        patients: state.patients.filter((p) => p.id !== id),
        error: null,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete patient'
      set({ error: message })
      throw error
    }
  },

  getPatient: (id) => {
    return get().patients.find((p) => p.id === id)
  },

  searchPatients: (query, type) => {
    if (!query) return get().patients

    const lowerQuery = query.toLowerCase()
    return get().patients.filter((p) => {
      if (type === 'name') return p.name.toLowerCase().includes(lowerQuery)
      if (type === 'phone') return p.phone.includes(lowerQuery)
      if (type === 'family') return p.name.toLowerCase().includes(lowerQuery)
      return false
    })
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))

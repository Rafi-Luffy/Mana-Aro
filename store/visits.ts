/**
 * Zustand Store for Visits/Consultations
 */

import { create } from 'zustand'
import { Visit, CreateVisitInput, VisitSchema } from '@/lib/types'
import { getDB } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

interface VisitState {
  visits: Visit[]
  currentDraft: Partial<CreateVisitInput> | null
  loading: boolean
  error: string | null

  // Actions
  fetchVisits: () => Promise<void>
  fetchPatientVisits: (patientId: string) => Promise<Visit[]>
  addVisit: (data: CreateVisitInput) => Promise<Visit>
  updateVisit: (id: string, data: Partial<Visit>) => Promise<Visit>
  deleteVisit: (id: string) => Promise<void>
  getVisit: (id: string) => Visit | undefined
  
  // Draft management
  saveDraft: (key: string, data: Partial<CreateVisitInput>) => Promise<void>
  loadDraft: (key: string) => Promise<Partial<CreateVisitInput> | null>
  clearDraft: (key: string) => Promise<void>
  
  setError: (error: string | null) => void
  clearError: () => void
}

export const useVisitStore = create<VisitState>((set, get) => ({
  visits: [],
  currentDraft: null,
  loading: false,
  error: null,

  fetchVisits: async () => {
    set({ loading: true })
    try {
      const db = await getDB()
      const visits = await db.getAll<Visit>('visits')
      set({ visits, error: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch visits'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },

  fetchPatientVisits: async (patientId) => {
    try {
      const db = await getDB()
      const visits = await db.queryByIndex<Visit>('visits', 'patientId', patientId)
      return visits.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch patient visits'
      set({ error: message })
      return []
    }
  },

  addVisit: async (data) => {
    try {
      // Validate input
      const visitData: Visit = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: false,
      }

      const db = await getDB()
      await db.put('visits', visitData)

      // Add to sync queue
      await db.add('syncQueue', {
        id: uuidv4(),
        type: 'visit',
        recordId: visitData.id,
        timestamp: new Date().toISOString(),
        data: visitData,
      })

      // Update local state
      set((state) => ({
        visits: [...state.visits, visitData],
        error: null,
      }))

      return visitData
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add visit'
      set({ error: message })
      throw error
    }
  },

  updateVisit: async (id, data) => {
    try {
      const existing = get().getVisit(id)
      if (!existing) throw new Error('Visit not found')

      const updatedVisit: Visit = {
        ...existing,
        ...data,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      }

      const db = await getDB()
      await db.put('visits', updatedVisit)

      // Update local state
      set((state) => ({
        visits: state.visits.map((v) => (v.id === id ? updatedVisit : v)),
        error: null,
      }))

      return updatedVisit
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update visit'
      set({ error: message })
      throw error
    }
  },

  deleteVisit: async (id) => {
    try {
      const db = await getDB()
      await db.delete('visits', id)

      // Update local state
      set((state) => ({
        visits: state.visits.filter((v) => v.id !== id),
        error: null,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete visit'
      set({ error: message })
      throw error
    }
  },

  getVisit: (id) => {
    return get().visits.find((v) => v.id === id)
  },

  // Draft management
  saveDraft: async (key, data) => {
    try {
      const db = await getDB()
      await db.put('drafts', {
        id: key,
        data,
        timestamp: new Date().toISOString(),
      })
      set({ currentDraft: data })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save draft'
      set({ error: message })
    }
  },

  loadDraft: async (key) => {
    try {
      const db = await getDB()
      const draft = await db.get<{
        key: string
        data: Partial<CreateVisitInput>
        timestamp: string
      }>('drafts', key)
      return draft?.data || null
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load draft'
      set({ error: message })
      return null
    }
  },

  clearDraft: async (key) => {
    try {
      const db = await getDB()
      await db.delete('drafts', key)
      set({ currentDraft: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to clear draft'
      set({ error: message })
    }
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))

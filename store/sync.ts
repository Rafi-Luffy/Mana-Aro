/**
 * Zustand Store for Network/Sync State
 */

import { create } from 'zustand'

export type SyncStatus = 'synced' | 'syncing' | 'offline'

export interface SyncState {
  status: SyncStatus
  pendingCount: number
  lastSyncTime: string | null
  isOnline: boolean
  error: string | null

  // Actions
  setOnline: (online: boolean) => void
  setSyncing: (syncing: boolean) => void
  setPendingCount: (count: number) => void
  setLastSyncTime: (time: string) => void
  setError: (error: string | null) => void
  addPending: () => void
  removePending: () => void
}

export const useSyncStore = create<SyncState>((set) => {
  // Initialize network detection
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      set({ isOnline: true, status: 'syncing' })
      // Trigger auto-sync here
      setTimeout(() => {
        set((state) => ({
          status: state.pendingCount === 0 ? 'synced' : 'syncing',
        }))
      }, 500)
    })

    window.addEventListener('offline', () => {
      set({ isOnline: false, status: 'offline' })
    })

    // Initial check
    set({ isOnline: navigator.onLine })
  }

  return {
    status: 'synced',
    pendingCount: 0,
    lastSyncTime: null,
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    error: null,

    setOnline: (online) =>
      set({
        isOnline: online,
        status: online ? 'syncing' : 'offline',
      }),

    setSyncing: (syncing) =>
      set({
        status: syncing ? 'syncing' : 'synced',
      }),

    setPendingCount: (count) =>
      set({
        pendingCount: count,
      }),

    setLastSyncTime: (time) =>
      set({
        lastSyncTime: time,
      }),

    setError: (error) =>
      set({
        error,
      }),

    addPending: () =>
      set((state) => ({
        pendingCount: state.pendingCount + 1,
        status: 'syncing',
      })),

    removePending: () =>
      set((state) => ({
        pendingCount: Math.max(0, state.pendingCount - 1),
        status: state.pendingCount <= 1 ? 'synced' : 'syncing',
      })),
  }
})

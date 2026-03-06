/**
 * Sync Engine
 * Handles offline queue and syncing to backend
 */

import { getDB } from '@/lib/db'
import { useSyncStore } from '@/store/sync'
import { usePatientStore } from '@/store/patients'
import { useVisitStore } from '@/store/visits'

export interface SyncQueueItem {
  id: string
  type: 'patient' | 'visit'
  recordId: string
  timestamp: string
  data: any
  retries?: number
}

export interface SyncLogEntry {
  id: string
  timestamp: string
  status: 'success' | 'failed'
  recordsCount: number
  type: 'patient' | 'visit'
  error?: string
}

export class SyncEngine {
  private isOnline = navigator.onLine
  private syncInterval: ReturnType<typeof setInterval> | null = null

  constructor() {
    this.initNetworkDetection()
  }

  /**
   * Initialize network detection
   */
  private initNetworkDetection() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.onOnline())
      window.addEventListener('offline', () => this.onOffline())
      this.isOnline = navigator.onLine
    }
  }

  /**
   * Called when device comes online
   */
  private async onOnline() {
    this.isOnline = true
    useSyncStore.setState({ isOnline: true })
    await this.syncAll()
  }

  /**
   * Called when device goes offline
   */
  private onOffline() {
    this.isOnline = false
    useSyncStore.setState({ isOnline: false })
  }

  /**
   * Get pending sync items
   */
  async getPendingItems(): Promise<SyncQueueItem[]> {
    try {
      const db = await getDB()
      return await db.getAll<SyncQueueItem>('syncQueue')
    } catch (error) {
      console.error('Failed to get pending items:', error)
      return []
    }
  }

  /**
   * Add item to sync queue
   */
  async queueSync(
    type: 'patient' | 'visit',
    recordId: string,
    data: any
  ): Promise<void> {
    try {
      const db = await getDB()
      const syncItem: SyncQueueItem = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        recordId,
        data,
        timestamp: new Date().toISOString(),
        retries: 0,
      }

      await db.add('syncQueue', syncItem)
      useSyncStore.getState().addPending()
    } catch (error) {
      console.error('Failed to queue sync:', error)
    }
  }

  /**
   * Sync all pending items
   */
  async syncAll(): Promise<{ success: number; failed: number }> {
    if (!this.isOnline) {
      console.log('Offline - skipping sync')
      return { success: 0, failed: 0 }
    }

    const syncStore = useSyncStore.getState()
    syncStore.setSyncing(true)
    const db = await getDB()

    try {
      const pendingItems = await this.getPendingItems()
      let successCount = 0
      let failedCount = 0

      for (const item of pendingItems) {
        try {
          const success = await this.syncItem(item)
          if (success) {
            await db.delete('syncQueue', item.id)
            successCount++
            syncStore.removePending()
          } else {
            failedCount++
          }
        } catch (error) {
          failedCount++
          console.error(`Failed to sync ${item.type}:`, error)
        }
      }

      // Log sync activity
      if (successCount > 0 || failedCount > 0) {
        await this.logSync(
          successCount > 0 ? 'success' : 'failed',
          successCount + failedCount,
          pendingItems[0]?.type || 'unknown'
        )
      }

      syncStore.setLastSyncTime(new Date().toLocaleTimeString())
      if (pendingItems.length === 0) {
        syncStore.setSyncing(false)
      }

      return { success: successCount, failed: failedCount }
    } catch (error) {
      console.error('Sync failed:', error)
      syncStore.setError(error instanceof Error ? error.message : 'Sync failed')
      return { success: 0, failed: 0 }
    }
  }

  /**
   * Sync a single item
   */
  private async syncItem(item: SyncQueueItem): Promise<boolean> {
    try {
      // In production, this would call actual API
      // For now, simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Simulate occasional failures
      if (Math.random() < 0.1) {
        throw new Error('Simulated sync failure')
      }

      // Mark as synced in database
      if (item.type === 'patient') {
        const patientStore = usePatientStore.getState()
        const patient = patientStore.getPatient(item.recordId)
        if (patient) {
          await patientStore.updatePatient(item.recordId, {
            ...patient,
            synced: true,
          } as any)
        }
      } else if (item.type === 'visit') {
        const visitStore = useVisitStore.getState()
        const visit = visitStore.getVisit(item.recordId)
        if (visit) {
          await visitStore.updateVisit(item.recordId, {
            ...visit,
            synced: true,
          } as any)
        }
      }

      return true
    } catch (error) {
      console.error('Sync item failed:', error)
      return false
    }
  }

  /**
   * Log sync activity
   */
  private async logSync(
    status: 'success' | 'failed',
    count: number,
    type: string
  ): Promise<void> {
    try {
      const db = await getDB()
      const logEntry: SyncLogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        status,
        recordsCount: count,
        type: type as 'patient' | 'visit',
      }

      await db.add('syncLog', logEntry)
    } catch (error) {
      console.error('Failed to log sync:', error)
    }
  }

  /**
   * Get sync history
   */
  async getSyncHistory(): Promise<SyncLogEntry[]> {
    try {
      const db = await getDB()
      const history = await db.getAll<SyncLogEntry>('syncLog')
      return history.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    } catch (error) {
      console.error('Failed to get sync history:', error)
      return []
    }
  }

  /**
   * Start auto-sync interval
   */
  startAutoSync(intervalMs: number = 30000) {
    if (this.syncInterval) return

    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncAll().catch(console.error)
      }
    }, intervalMs)
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  /**
   * Get pending count
   */
  async getPendingCount(): Promise<number> {
    try {
      const db = await getDB()
      return await db.count('syncQueue')
    } catch (error) {
      console.error('Failed to get pending count:', error)
      return 0
    }
  }

  /**
   * Clear all pending
   */
  async clearPending(): Promise<void> {
    try {
      const db = await getDB()
      await db.clear('syncQueue')
      useSyncStore.setState({ pendingCount: 0 })
    } catch (error) {
      console.error('Failed to clear pending:', error)
    }
  }
}

// Singleton instance
let syncEngineInstance: SyncEngine | null = null

export function getSyncEngine(): SyncEngine {
  if (!syncEngineInstance) {
    syncEngineInstance = new SyncEngine()
  }
  return syncEngineInstance
}

// Initialize on app load
if (typeof window !== 'undefined') {
  const engine = getSyncEngine()
  engine.startAutoSync()
}

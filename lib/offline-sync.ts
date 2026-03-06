interface SyncQueue {
  id: string
  action: "create" | "update" | "delete"
  entity: "patient" | "visit" | "consultation" | "analysis"
  data: any
  timestamp: number
  synced: boolean
}

class OfflineSyncManager {
  private syncQueue: SyncQueue[] = []
  private readonly STORAGE_KEY = "mana_sync_queue"
  private readonly BATCH_SIZE = 10
  private isSyncing = false

  constructor() {
    this.loadQueue()
    this.setupSyncListener()
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      this.syncQueue = stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to load sync queue:", error)
      this.syncQueue = []
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error("Failed to save sync queue:", error)
    }
  }

  private setupSyncListener() {
    // Sync when connection is restored
    window.addEventListener("online", () => {
      console.log("[Offline Sync] Connection restored, syncing...")
      this.syncAll()
    })

    // Periodic sync attempt every 30 seconds
    setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.syncAll()
      }
    }, 30000)
  }

  addToQueue(action: SyncQueue["action"], entity: SyncQueue["entity"], data: any) {
    const item: SyncQueue = {
      id: `${entity}_${Date.now()}`,
      action,
      entity,
      data,
      timestamp: Date.now(),
      synced: false,
    }

    this.syncQueue.push(item)
    this.saveQueue()

    console.log(`[Offline Sync] Added ${action} for ${entity}:`, item.id)
  }

  async syncAll() {
    if (this.isSyncing || !navigator.onLine) return

    this.isSyncing = true
    const unsynced = this.syncQueue.filter((item) => !item.synced)

    if (unsynced.length === 0) {
      this.isSyncing = false
      return
    }

    console.log(`[Offline Sync] Starting sync of ${unsynced.length} items`)

    try {
      // Process in batches
      for (let i = 0; i < unsynced.length; i += this.BATCH_SIZE) {
        const batch = unsynced.slice(i, i + this.BATCH_SIZE)
        await this.processBatch(batch)
      }

      // Mark all as synced
      this.syncQueue.forEach((item) => {
        if (!item.synced) item.synced = true
      })
      this.saveQueue()

      console.log("[Offline Sync] All items synced successfully")
    } catch (error) {
      console.error("[Offline Sync] Sync failed:", error)
    } finally {
      this.isSyncing = false
    }
  }

  private async processBatch(batch: SyncQueue[]) {
    const promises = batch.map((item) => this.syncItem(item))
    await Promise.allSettled(promises)
  }

  private async syncItem(item: SyncQueue) {
    try {
      const response = await fetch(`/api/sync/${item.entity}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: item.action,
          data: item.data,
          timestamp: item.timestamp,
        }),
      })

      if (!response.ok) {
        throw new Error(`Sync failed with status ${response.status}`)
      }

      console.log(`[Offline Sync] Synced ${item.entity} ${item.id}`)
      return true
    } catch (error) {
      console.error(`[Offline Sync] Failed to sync ${item.id}:`, error)
      throw error
    }
  }

  getQueueStatus() {
    const total = this.syncQueue.length
    const synced = this.syncQueue.filter((item) => item.synced).length
    const pending = total - synced

    return { total, synced, pending, isSyncing: this.isSyncing }
  }

  clearQueue() {
    this.syncQueue = []
    this.saveQueue()
    console.log("[Offline Sync] Queue cleared")
  }
}

export const offlineSyncManager = new OfflineSyncManager()

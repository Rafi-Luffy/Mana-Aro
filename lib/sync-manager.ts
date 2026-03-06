import { getSyncQueue, removeSyncItem } from "./offline-storage"

// Get simulated offline mode from hook global state
let getSimulatedOfflineMode = () => false

export function setSyncManagerOfflineFn(fn: () => boolean) {
  getSimulatedOfflineMode = fn
}

interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: number | null
  pendingItems: number
  isSimulatedOffline?: boolean
}

const syncStatus: SyncStatus = {
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  isSyncing: false,
  lastSyncTime: null,
  pendingItems: 0,
  isSimulatedOffline: false,
}

const syncListeners: Set<(status: SyncStatus) => void> = new Set()

export function initializeSyncManager() {
  if (typeof window === "undefined") return

  // Listen for online/offline events
  window.addEventListener("online", handleOnline)
  window.addEventListener("offline", handleOffline)

  // Check connectivity periodically
  setInterval(checkConnectivity, 30000)
}

async function checkConnectivity() {
  const isSimulatedOffline = getSimulatedOfflineMode()
  
  if (isSimulatedOffline) {
    syncStatus.isSimulatedOffline = true
    handleOffline()
    return
  }

  try {
    const response = await fetch("/api/health", { method: "HEAD" })
    if (response.ok) {
      syncStatus.isSimulatedOffline = false
      handleOnline()
    } else {
      handleOffline()
    }
  } catch {
    handleOffline()
  }
}

function handleOnline() {
  syncStatus.isOnline = true
  notifyListeners()
  syncPendingData()
}

function handleOffline() {
  syncStatus.isOnline = false
  notifyListeners()
}

export async function syncPendingData() {
  const isSimulatedOffline = getSimulatedOfflineMode()
  
  if (syncStatus.isSyncing || !syncStatus.isOnline || isSimulatedOffline) return

  syncStatus.isSyncing = true
  notifyListeners()

  try {
    const queue = await getSyncQueue()
    syncStatus.pendingItems = queue.length

    for (const item of queue) {
      try {
        const response = await fetch(`/api/sync/${item.store}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: item.action, data: item.data }),
        })

        if (response.ok) {
          await removeSyncItem(item.id)
          syncStatus.pendingItems--
        } else if (item.retries < 3) {
          item.retries++
        } else {
          await removeSyncItem(item.id)
        }
      } catch (error) {
        console.error("Sync error:", error)
        if (item.retries < 3) {
          item.retries++
        }
      }
    }

    syncStatus.lastSyncTime = Date.now()
  } finally {
    syncStatus.isSyncing = false
    notifyListeners()
  }
}

export function subscribeSyncStatus(listener: (status: SyncStatus) => void): () => void {
  syncListeners.add(listener)
  return () => syncListeners.delete(listener)
}

function notifyListeners() {
  syncListeners.forEach((listener) => listener(syncStatus))
}

export function getSyncStatus(): SyncStatus {
  return { ...syncStatus }
}

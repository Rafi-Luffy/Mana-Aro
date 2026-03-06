"use client"

import { useEffect, useState } from "react"
import {
  getCurrentSyncStatus,
  initializeConnectivityListeners,
  initializeAppData,
  processSyncQueue,
  refreshSyncSnapshot,
  subscribeToSyncStatus,
  type SyncSnapshot,
} from "@/lib/app-data"

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncSnapshot>(getCurrentSyncStatus())

  useEffect(() => {
    let mounted = true

    const boot = async () => {
      await initializeAppData()
      await initializeConnectivityListeners()
      const snapshot = await refreshSyncSnapshot()
      if (mounted) {
        setStatus(snapshot)
      }

      if (snapshot.isOnline && snapshot.pendingItems > 0) {
        const updated = await processSyncQueue()
        if (mounted) {
          setStatus(updated)
        }
      }
    }

    void boot()

    const unsubscribe = subscribeToSyncStatus((nextStatus) => {
      if (mounted) {
        setStatus(nextStatus)
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  return {
    ...status,
    isSyncing: status.syncState === "syncing",
  }
}

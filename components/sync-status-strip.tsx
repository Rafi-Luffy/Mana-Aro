"use client"

import { useSyncStatus } from "@/hooks/use-sync-status"
import { StatusStrip } from "@/components/status-strip"

export function SyncStatusStrip() {
  const { syncState, pendingItems, lastSyncTime } = useSyncStatus()

  return (
    <StatusStrip
      status={syncState === "idle" ? "synced" : syncState}
      pendingRecords={pendingItems}
      lastSyncTime={lastSyncTime ?? undefined}
    />
  )
}

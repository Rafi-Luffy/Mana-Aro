"use client"

import { useSyncStatus } from "@/hooks/use-sync-status"
import { Loader2, CheckCircle, WifiOff } from "lucide-react"

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingItems, lastSyncTime } = useSyncStatus()

  if (isOnline && !isSyncing && pendingItems === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          {!isOnline ? (
            <WifiOff className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          ) : isSyncing ? (
            <Loader2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 animate-spin" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            {!isOnline ? (
              <>
                <p className="font-medium text-foreground">Offline Mode</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {pendingItems > 0
                    ? `${pendingItems} changes waiting to sync`
                    : "Changes will sync when connection is restored"}
                </p>
              </>
            ) : isSyncing ? (
              <>
                <p className="font-medium text-foreground">Syncing Data</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {pendingItems > 0 ? `Syncing ${pendingItems} items...` : "Syncing changes..."}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-foreground">Synced</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {lastSyncTime ? `Last sync: ${new Date(lastSyncTime).toLocaleTimeString()}` : "All data synced"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

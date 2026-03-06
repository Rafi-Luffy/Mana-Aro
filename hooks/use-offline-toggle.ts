"use client"

import { useCallback } from "react"
import { setOfflineMode, toggleOfflineMode } from "@/lib/app-data"
import { useSyncStatus } from "@/hooks/use-sync-status"

export function useOfflineToggle() {
  const { isOfflineMode, isOnline } = useSyncStatus()

  const toggle = useCallback(async () => {
    await toggleOfflineMode()
  }, [])

  const setOffline = useCallback(async (enabled: boolean) => {
    await setOfflineMode(enabled)
  }, [])

  return {
    isOffline: !isOnline,
    isSimulatedOffline: isOfflineMode,
    isActuallyOnline: typeof navigator === "undefined" ? true : navigator.onLine,
    toggle,
    setOffline,
  }
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useOfflineToggle } from "@/hooks/use-offline-toggle"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineToggle() {
  const [mounted, setMounted] = useState(false)
  const { isOffline, toggle } = useOfflineToggle()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Button
      variant={isOffline ? "destructive" : "ghost"}
      size="sm"
      onClick={toggle}
      className="w-full justify-start gap-2"
      title={isOffline ? "Click to restore connection" : "Click to simulate offline mode"}
    >
      {isOffline ? (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Offline Mode</span>
        </>
      ) : (
        <>
          <Wifi className="w-4 h-4" />
          <span>Online</span>
        </>
      )}
    </Button>
  )
}

'use client'

import React from 'react'
import { Cloud, CloudOff, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

type SyncStatus = 'synced' | 'syncing' | 'offline'

interface StatusStripProps {
  status?: SyncStatus
  pendingRecords?: number
  lastSyncTime?: string
}

export function StatusStrip({
  status = 'synced',
  pendingRecords = 0,
  lastSyncTime,
}: StatusStripProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-2 text-xs font-medium transition-colors',
        status === 'offline'
          ? 'bg-amber-50 text-amber-900 border-b border-amber-200'
          : status === 'syncing'
            ? 'bg-blue-50 text-blue-900 border-b border-blue-200'
            : 'bg-green-50 text-green-900 border-b border-green-200'
      )}
    >
      <div className="flex items-center gap-2">
        {status === 'offline' && (
          <>
            <CloudOff className="w-4 h-4" />
            <span>Offline Mode</span>
          </>
        )}
        {status === 'syncing' && (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Syncing changes...{pendingRecords > 0 ? ` (${pendingRecords})` : ''}</span>
          </>
        )}
        {status === 'synced' && (
          <>
            <Cloud className="w-4 h-4" />
            <span>
              ✓ Synced
              {lastSyncTime && ` at ${lastSyncTime}`}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

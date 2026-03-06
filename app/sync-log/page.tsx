'use client'

import React, { useState } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Cloud, CloudOff, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'

const mockSyncLog = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 5 * 60000),
    status: 'success',
    recordsCount: 3,
    type: 'visits',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 30 * 60000),
    status: 'success',
    recordsCount: 2,
    type: 'patients',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 2 * 3600000),
    status: 'success',
    recordsCount: 5,
    type: 'vitals',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 24 * 3600000),
    status: 'failed',
    recordsCount: 1,
    type: 'reports',
  },
]

export default function SyncLogScreen() {
  const [isSyncing, setIsSyncing] = useState(false)
  const pendingRecords = 3
  const lastSyncTime = new Date(Date.now() - 5 * 60000)

  const handleManualSync = async () => {
    setIsSyncing(true)
    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsSyncing(false)
  }

  return (
    <AuthGuard>
      <div className="pb-24">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sync Status</h1>
            <p className="text-muted-foreground mt-1">Manage offline data & sync history</p>
          </div>

          {/* Current Sync Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Cloud className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium">Last Sync</p>
                  <p className="text-sm text-muted-foreground">
                    {format(lastSyncTime, 'MMM dd, yyyy h:mm a')}
                  </p>
                </div>
              </div>

              {pendingRecords > 0 && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-900">Pending Records</p>
                    <p className="text-sm text-amber-800">{pendingRecords} records waiting to sync</p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="w-full"
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </CardContent>
          </Card>

          {/* Sync History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sync History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockSyncLog.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                  {log.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  ) : (
                    <CloudOff className="w-5 h-5 text-red-600 shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm capitalize">{log.type}</p>
                      <Badge variant="secondary" className="text-xs">
                        {log.recordsCount} records
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(log.timestamp, 'MMM dd, h:mm a')}
                    </p>
                  </div>

                  <Badge
                    variant={log.status === 'success' ? 'default' : 'destructive'}
                    className="text-xs capitalize"
                  >
                    {log.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Conflict Resolution Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">If Sync Conflicts Occur</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>
                If the same patient is edited in multiple places, we'll show you a comparison view where
                you can choose which version to keep.
              </p>
              <p>
                Always review conflicts carefully before syncing. Your clinical judgment is the final
                decision point.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}

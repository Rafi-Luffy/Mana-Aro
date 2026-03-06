'use client'

import React, { useEffect, useState } from 'react'
import { getDB } from '@/lib/db'
import { getSyncEngine } from '@/lib/sync-engine'
import { useSyncStore } from '@/store/sync'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, CheckCircle2, AlertCircle, Cloud, WifiOff, RefreshCw, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardSkeleton } from '@/components/loading-skeletons'

export default function SyncStatusPage() {
  const [pendingItems, setPendingItems] = useState<any[]>([])
  const [syncHistory, setSyncHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const syncStatus = useSyncStore((state) => state.status)
  const isOnline = useSyncStore((state) => state.isOnline)
  const pendingCount = useSyncStore((state) => state.pendingCount)
  const lastSyncTime = useSyncStore((state) => state.lastSyncTime)

  const loadSyncData = async () => {
    try {
      setError(null)
      setLoading(true)

      const db = await getDB()
      if (!db) {
        throw new Error('Database failed to initialize')
      }

      let pending: any[] = []
      let history: any[] = []

      try {
        pending = (await db.getAll('syncQueue')) || []
      } catch (err) {
        console.error('Failed to fetch sync queue:', err)
        pending = []
      }

      try {
        history = (await db.getAll('syncLog')) || []
      } catch (err) {
        console.error('Failed to fetch sync history:', err)
        history = []
      }

      setPendingItems(pending.sort((a: any, b: any) => (b?.timestamp || 0) - (a?.timestamp || 0)))
      setSyncHistory(
        history
          .sort((a: any, b: any) => (b?.timestamp || 0) - (a?.timestamp || 0))
          .slice(0, 50)
      )
    } catch (error) {
      console.error('Failed to load sync data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load sync status')
      toast.error('Failed to load sync status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSyncData()

    // Refresh every 5 seconds
    const interval = setInterval(loadSyncData, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSyncNow = async () => {
    setSyncing(true)
    try {
      const syncEngine = getSyncEngine()
      await syncEngine.syncAll()
      await loadSyncData()
      toast.success('Sync completed successfully')
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Sync failed - check connection')
    } finally {
      setSyncing(false)
    }
  }

  const handleClearSyncQueue = async () => {
    if (!confirm('Are you sure? This will discard all pending items.')) return

    try {
      const db = await getDB()
      await db.clear('syncQueue')
      await loadSyncData()
      toast.success('Sync queue cleared')
    } catch (error) {
      console.error('Clear queue error:', error)
      toast.error('Failed to clear sync queue')
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-semibold">Failed to load sync status</p>
              <p className="text-sm">{error}</p>
              <Button onClick={loadSyncData} variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-3 h-3" />
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header with Connection Status */}
      <div className="mb-6 space-y-4">
        <h1 className="text-3xl font-bold">🔄 Sync Status</h1>

        {/* Connection Alert */}
        <Alert
          variant={isOnline ? 'default' : 'destructive'}
          className={isOnline ? 'bg-green-50 border-green-200' : ''}
        >
          {isOnline ? (
            <>
              <Cloud className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✓ Connected - Data will sync automatically
              </AlertDescription>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-destructive" />
              <AlertDescription>
                ⊙ Offline - Changes are saved locally and will sync when connection is restored
              </AlertDescription>
            </>
          )}
        </Alert>

        {/* Sync Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  {syncStatus === 'syncing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      <span className="font-semibold text-amber-600">Syncing...</span>
                    </>
                  ) : syncStatus === 'synced' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-600">Synced</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <span className="font-semibold text-destructive">Offline</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pending Items</p>
                <p className="text-3xl font-bold">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Sync</p>
                <p className="text-sm font-medium">
                  {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Never'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sync Controls */}
      <div className="mb-6 flex gap-2">
        <Button
          onClick={handleSyncNow}
          disabled={syncing || !isOnline}
          className="flex-1"
        >
          {syncing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Now
            </>
          )}
        </Button>
        <Button
          onClick={handleClearSyncQueue}
          variant="destructive"
          size="sm"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Pending ({pendingItems.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({syncHistory.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Items Tab */}
        <TabsContent value="pending">
          {pendingItems.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-muted-foreground">All items synced!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="secondary" className="mb-2">
                          {item.type.toUpperCase()}
                        </Badge>
                        <p className="font-mono text-sm text-muted-foreground">{item.recordId}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </CardHeader>
                  {item.data && (
                    <CardContent className="pt-0">
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(item.data, null, 2)}
                      </pre>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Sync History Tab */}
        <TabsContent value="history">
          {syncHistory.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No sync history yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {syncHistory.map((entry, idx) => (
                <Card key={idx} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {entry.status === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                        <Badge
                          variant={
                            entry.status === 'success'
                              ? 'outline'
                              : 'destructive'
                          }
                        >
                          {entry.status.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Type</p>
                        <p className="font-medium">{entry.type || 'system'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Records</p>
                        <p className="font-medium">{entry.recordsCount || 0}</p>
                      </div>
                    </div>

                    {entry.error && (
                      <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive">
                        {entry.error}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Sync Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">ℹ️ How Sync Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            • <strong>Automatic:</strong> Every 30 seconds, pending items are synced if you're online
          </p>
          <p>
            • <strong>Offline:</strong> When offline, all new data is saved locally and queued for sync
          </p>
          <p>
            • <strong>Manual:</strong> Click "Sync Now" to force immediate sync of pending items
          </p>
          <p>
            • <strong>History:</strong> View past sync attempts to verify data was uploaded
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

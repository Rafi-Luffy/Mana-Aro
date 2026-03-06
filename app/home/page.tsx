'use client'

import React, { useState } from 'react'
import { Plus, RefreshCw, Clipboard, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth-guard'
import { StatusStrip } from '@/components/status-strip'
import { FloatingActionButton } from '@/components/floating-action-button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function HomeScreen() {
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced')
  const [pendingRecords, setPendingRecords] = useState(0)

  // Mock data - replace with real API calls
  const workerName = 'Sunita Devi'
  const todaysVisits = 4
  const highRiskToday = 1
  const lastSyncTime = '3:45 PM'

  const handleSync = async () => {
    setSyncStatus('syncing')
    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setSyncStatus('synced')
    setPendingRecords(0)
  }

  const alerts = [
    {
      id: 1,
      type: 'high-risk' as const,
      message: 'Lakshmi (45) - High BP reading yesterday',
      patientId: 'pat_001',
    },
    {
      id: 2,
      type: 'immunization' as const,
      message: 'Ravi (2) - Polio booster due',
      patientId: 'pat_002',
    },
    {
      id: 3,
      type: 'pregnancy' as const,
      message: 'Priya (28) - 3rd trimester check',
      patientId: 'pat_003',
    },
  ]

  return (
    <AuthGuard>
      <div className="pb-24 pt-12">
        <StatusStrip status={syncStatus} lastSyncTime={lastSyncTime} pendingRecords={pendingRecords} />

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Worker Overview Card */}
          <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">👋 Welcome, {workerName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">{todaysVisits}</div>
                  <div className="text-sm text-muted-foreground">Today's Visits</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-destructive">{highRiskToday}</div>
                  <div className="text-sm text-muted-foreground">High-Risk Today</div>
                </div>
                <div className="space-y-1">
                  <Badge variant="secondary" className="w-fit">
                    ☁ Synced
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions - Large Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/patients?action=add">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-20 flex-col gap-2 bg-card hover:bg-primary/5"
                >
                  <Plus className="w-6 h-6" />
                  <span>Add Patient</span>
                </Button>
              </Link>
              <Link href="/consultation?action=start">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-20 flex-col gap-2 bg-card hover:bg-primary/5"
                >
                  <Clipboard className="w-6 h-6" />
                  <span>Start Visit</span>
                </Button>
              </Link>
              <Link href="/reports">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-20 flex-col gap-2 bg-card hover:bg-primary/5"
                >
                  <CheckCircle className="w-6 h-6" />
                  <span>Follow-ups</span>
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={handleSync}
                disabled={syncStatus === 'syncing'}
                className="w-full h-20 flex-col gap-2 bg-card hover:bg-primary/5"
              >
                <RefreshCw className={`w-6 h-6 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </Button>
            </div>
          </div>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Active Alerts</h3>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <Link key={alert.id} href={`/patients/${alert.patientId}`}>
                    <Alert className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <AlertCircle
                        className={`w-4 h-4 ${
                          alert.type === 'high-risk'
                            ? 'text-destructive'
                            : alert.type === 'immunization'
                              ? 'text-amber-600'
                              : 'text-blue-600'
                        }`}
                      />
                      <AlertDescription>{alert.message}</AlertDescription>
                    </Alert>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Export Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full gap-2">
                <Download className="w-4 h-4" />
                Export This Month's Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton
          primary={{
            id: 'start-visit',
            label: 'Start Visit',
            icon: <Clipboard className="w-6 h-6" />,
            href: '/consultation?action=start',
          }}
          secondary={[
            {
              id: 'add-patient',
              label: 'Add Patient',
              icon: <Plus className="w-6 h-6" />,
              href: '/patients?action=add',
            },
          ]}
        />
      </div>
    </AuthGuard>
  )
}

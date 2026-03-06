'use client'

import React from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { name: 'Week 1', visits: 12, completed: 10 },
  { name: 'Week 2', visits: 15, completed: 13 },
  { name: 'Week 3', visits: 10, completed: 9 },
  { name: 'Week 4', visits: 18, completed: 16 },
]

export default function ReportsScreenSimplified() {
  const metrics = [
    { label: 'This Month Visits', value: '55', unit: '' },
    { label: 'High-Risk Patients', value: '4', unit: 'requiring follow-up' },
    { label: 'Immunizations Completed', value: '12', unit: 'this month' },
    { label: 'Pending Follow-ups', value: '6', unit: 'due this week' },
  ]

  return (
    <AuthGuard>
      <div className="pb-24">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-1">Your clinic activity & insights</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {metrics.map((metric, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold text-primary">{metric.value}</div>
                      {metric.unit && <span className="text-xs text-muted-foreground">{metric.unit}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Simple Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Weekly Visits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visits" fill="#0D9488" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Export */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Export Data</h3>
            <Button className="w-full gap-2">
              <Download className="w-4 h-4" />
              Export This Month Report (CSV)
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

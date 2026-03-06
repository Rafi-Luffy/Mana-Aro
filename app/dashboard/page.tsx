"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, Activity, AlertTriangle, Clock, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { toast } from "sonner"
import { buildDashboardSummary, downloadTextFile, subscribeToDataChanges, type DashboardSummary } from "@/lib/app-data"

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await buildDashboardSummary()
      setSummary(data)
    } catch {
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboard()
    const unsubscribe = subscribeToDataChanges(() => {
      void loadDashboard()
    })
    return unsubscribe
  }, [])

  const handleRefresh = async () => {
    await loadDashboard()
    toast.success("Dashboard refreshed")
  }

  const handleExport = () => {
    if (!summary) return

    const csvRows = [
      ["Metric", "Value"],
      ["Total Patients", String(summary.totalPatients)],
      ["Visits Today", String(summary.visitsToday)],
      ["High Risk Patients", String(summary.highRiskPatients)],
      ["Avg Consultation Time (min)", String(summary.avgConsultationTime)],
    ]

    const csv = csvRows.map((row) => row.map((value) => `"${value}"`).join(",")).join("\n")
    downloadTextFile(csv, "dashboard-summary.csv", "text/csv")
    toast.success("Dashboard summary exported")
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading dashboard...</p>
  }

  if (error || !summary) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>{error ?? "Unable to render dashboard"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const isEmpty = summary.totalPatients === 0 && summary.visitsToday === 0

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clinic Dashboard</h1>
          <p className="text-muted-foreground">Live metrics from IndexedDB</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void handleRefresh()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Link href="/patients">
            <Button className="gap-2">
              <Users className="w-4 h-4" />
              Manage Patients
            </Button>
          </Link>
        </div>
      </div>

      {isEmpty ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <h2 className="text-lg font-semibold">No patients yet</h2>
            <p className="text-sm text-muted-foreground">Add your first patient to populate dashboard analytics.</p>
            <Link href="/patients">
              <Button>Add First Patient</Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.totalPatients}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Visits Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.visitsToday}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">High Risk Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{summary.highRiskPatients}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Avg Consultation Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.avgConsultationTime} min</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Visits</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={summary.weeklyVisits}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={summary.riskDistribution} dataKey="value" nameKey="name" outerRadius={80}>
                  {summary.riskDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Patients</CardTitle>
          <CardDescription>Last 5 added</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.recentPatients.length === 0 ? (
            <p className="text-sm text-muted-foreground">No patients yet</p>
          ) : (
            summary.recentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.age} • {patient.gender} • {patient.village}
                  </p>
                </div>
                <Badge variant="secondary">{patient.riskLevel} risk</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

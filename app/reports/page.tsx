"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Download, FileText, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import {
  buildConsultationsCsv,
  buildPatientsCsv,
  buildReportsSummary,
  downloadTextFile,
  getConsultations,
  getPatients,
  getSettings,
  subscribeToDataChanges,
  type ReportsSummary,
} from "@/lib/app-data"
import { generateClinicSummaryPdf } from "@/lib/pdf-export"

export default function ReportsPage() {
  const [summary, setSummary] = useState<ReportsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const loadReports = async () => {
    setLoading(true)
    try {
      const data = await buildReportsSummary()
      setSummary(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadReports()
    const unsubscribe = subscribeToDataChanges(() => {
      void loadReports()
    })
    return unsubscribe
  }, [])

  const handleRefresh = async () => {
    await loadReports()
    toast.success("Reports refreshed")
  }

  const handleExportCsv = async () => {
    try {
      const [patients, consultations] = await Promise.all([getPatients(), getConsultations()])
      downloadTextFile(buildPatientsCsv(patients), "patients.csv", "text/csv")
      downloadTextFile(buildConsultationsCsv(consultations), "consultations.csv", "text/csv")
      toast.success("patients.csv and consultations.csv exported")
    } catch {
      toast.error("Failed to export CSV files")
    }
  }

  const handleExportPdf = async () => {
    if (!summary) return
    try {
      const settings = await getSettings()
      generateClinicSummaryPdf({
        clinicName: settings.clinicName,
        totalPatients: summary.totalPatients,
        totalVisits: summary.totalVisits,
        riskDistribution: summary.riskDistribution.map((row) => ({ name: row.name, value: row.value })),
      })
      toast.success("PDF report exported")
    } catch {
      toast.error("Failed to export PDF")
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading reports...</p>
  }

  if (!summary) {
    return <p className="text-muted-foreground">Unable to load reports.</p>
  }

  const isEmpty = summary.totalPatients === 0 && summary.totalVisits === 0

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Dynamic analytics from IndexedDB records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void handleRefresh()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => void handleExportPdf()} className="gap-2" disabled={isEmpty}>
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
          <Button onClick={() => void handleExportCsv()} className="gap-2" disabled={isEmpty}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {isEmpty ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <h2 className="text-lg font-semibold">No consultations recorded</h2>
            <p className="text-sm text-muted-foreground">Reports will appear once patient visits are saved.</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Patients" value={summary.totalPatients} />
        <MetricCard title="Total Visits" value={summary.totalVisits} />
        <MetricCard title="High Risk Patients" value={summary.highRiskPatients} />
        <MetricCard title="Monthly Visits" value={summary.monthlyVisits} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={summary.weeklyTrend}>
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
    </div>
  )
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

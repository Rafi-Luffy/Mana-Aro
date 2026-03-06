"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Heart, Stethoscope, AlertCircle, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"

interface Visit {
  id: string
  date: string | Date
  diagnosis?: string
  symptoms?: Array<{ name: string }>
  vitals?: {
    bp: string
    pulse: number
    temperature: number
    weight: number
    respiratoryRate?: number
  }
  observations?: string
  aiAnalysis?: {
    riskLevel: "low" | "medium" | "high"
    confidence?: number
  }
  synced?: boolean
}

interface VisitTimelineProps {
  visits: Visit[]
  onStartNewVisit?: () => void
}

export function VisitTimeline({ visits }: VisitTimelineProps) {
  // Sort visits by date, most recent first
  const sortedVisits = [...visits].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (sortedVisits.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Stethoscope className="w-8 h-8 mx-auto text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No visits recorded yet</p>
            <p className="text-xs text-muted-foreground">Start a new visit to begin tracking patient health</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative space-y-4">
      {/* Timeline line */}
      <div className="absolute left-4 top-8 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20" />

      {sortedVisits.map((visit, index) => (
        <div key={visit.id} className="relative pl-16">
          {/* Timeline dot */}
          <div className="absolute left-0 top-2 w-9 h-9 bg-background border-2 border-primary rounded-full flex items-center justify-center">
            {visit.aiAnalysis?.riskLevel === "high" ? (
              <AlertCircle className="w-4 h-4 text-red-600" />
            ) : visit.synced ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </div>

          {/* Visit Card */}
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <p className="font-semibold text-sm">
                      {format(new Date(visit.date), "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(visit.date), "h:mm a")} • {index === 0 ? "Most Recent" : `${index} visit${index > 1 ? "s" : ""} ago`}
                  </p>
                </div>
                <div className="flex gap-1">
                  {visit.synced ? (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      ✓ Synced
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      ⊙ Pending
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-4">
              {/* Diagnosis */}
              {visit.diagnosis && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Diagnosis</p>
                  <p className="text-sm font-semibold text-foreground">{visit.diagnosis}</p>
                </div>
              )}

              {/* Symptoms */}
              {visit.symptoms && visit.symptoms.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Reported Symptoms</p>
                  <div className="flex flex-wrap gap-1">
                    {visit.symptoms.map((symptom: any, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {symptom.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Vitals */}
              {visit.vitals && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Vitals Recorded</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded border border-blue-200 dark:border-blue-800">
                      <p className="text-muted-foreground text-xs">Blood Pressure</p>
                      <p className="font-semibold text-foreground">{visit.vitals.bp}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950 p-2 rounded border border-red-200 dark:border-red-800">
                      <p className="text-muted-foreground text-xs">Heart Rate</p>
                      <p className="font-semibold text-foreground">{visit.vitals.pulse} bpm</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-950 p-2 rounded border border-orange-200 dark:border-orange-800">
                      <p className="text-muted-foreground text-xs">Temperature</p>
                      <p className="font-semibold text-foreground">{visit.vitals.temperature}°C</p>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-950 p-2 rounded border border-teal-200 dark:border-teal-800">
                      <p className="text-muted-foreground text-xs">Weight</p>
                      <p className="font-semibold text-foreground">{visit.vitals.weight} kg</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Observations */}
              {visit.observations && (
                <div className="bg-muted p-3 rounded border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Clinical Notes</p>
                  <p className="text-sm text-foreground line-clamp-3">{visit.observations}</p>
                </div>
              )}

              {/* AI Analysis Risk */}
              {visit.aiAnalysis?.riskLevel && (
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <Heart className="w-3 h-3" />
                      <span className="font-medium">AI Assessment</span>
                    </div>
                    <Badge
                      variant={
                        visit.aiAnalysis.riskLevel === "high"
                          ? "destructive"
                          : visit.aiAnalysis.riskLevel === "medium"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {visit.aiAnalysis.riskLevel.toUpperCase()}
                      {visit.aiAnalysis.confidence && ` (${visit.aiAnalysis.confidence}%)`}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}

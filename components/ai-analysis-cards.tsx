"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, TrendingUp, AlertCircle } from "lucide-react"

interface AIAnalysisCardsProps {
  riskLevel: "low" | "medium" | "high"
  confidence: number
  possibleConditions: string[]
  recommendations: string[]
  referralRequired?: boolean
}

export function AIAnalysisCards({
  riskLevel,
  confidence,
  possibleConditions,
  recommendations,
  referralRequired = false,
}: AIAnalysisCardsProps) {
  const riskConfig: Record<"high" | "medium" | "low", { color: "destructive" | "secondary" | "outline"; icon: typeof AlertTriangle; label: string; bgColor: string }> = {
    high: { color: "destructive", icon: AlertTriangle, label: "High Risk", bgColor: "bg-red-50" },
    medium: { color: "secondary", icon: AlertCircle, label: "Medium Risk", bgColor: "bg-yellow-50" },
    low: { color: "outline", icon: CheckCircle, label: "Low Risk", bgColor: "bg-green-50" },
  }

  const config = riskConfig[riskLevel]
  const RiskIcon = config.icon

  return (
    <div className="space-y-4">
      {/* Risk Level Card */}
      <Card className={`border-2 ${riskLevel === "high" ? "border-red-200" : riskLevel === "medium" ? "border-yellow-200" : "border-green-200"}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RiskIcon className={`w-5 h-5 ${riskLevel === "high" ? "text-red-600" : riskLevel === "medium" ? "text-yellow-600" : "text-green-600"}`} />
              <CardTitle className="text-base">Risk Assessment</CardTitle>
            </div>
            <Badge variant={config.color} className="text-sm">
              {config.label.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Confidence Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Confidence Level
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold text-primary">{confidence}%</div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                confidence >= 80
                  ? "bg-green-500"
                  : confidence >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {confidence >= 80
              ? "High confidence in analysis"
              : confidence >= 60
                ? "Moderate confidence - recommend specialist review"
                : "Low confidence - clinical verification recommended"}
          </p>
        </CardContent>
      </Card>

      {/* Possible Conditions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Possible Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          {possibleConditions?.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {possibleConditions.slice(0, 5).map((condition, index) => (
                <div key={condition} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <span className="text-xs font-semibold text-primary w-6">{index + 1}.</span>
                  <span className="text-sm text-foreground">{condition}</span>
                </div>
              ))}
              {possibleConditions.length > 5 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{possibleConditions.length - 5} more conditions detected
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No specific conditions identified</p>
          )}
        </CardContent>
      </Card>

      {/* Recommendations Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clinical Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations?.length > 0 ? (
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <span className="text-primary font-bold">→</span>
                  <span className="text-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No specific recommendations at this time</p>
          )}
        </CardContent>
      </Card>

      {/* Referral Alert */}
      {referralRequired && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 font-medium">
            ⚠️ Specialist referral recommended based on symptoms and risk profile
          </AlertDescription>
        </Alert>
      )}

      {/* Disclaimer */}
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-700" />
        <AlertDescription className="text-amber-800 text-sm">
          AI analysis is for clinical reference only. The healthcare provider's professional judgment is the final authority in patient care decisions.
        </AlertDescription>
      </Alert>
    </div>
  )
}

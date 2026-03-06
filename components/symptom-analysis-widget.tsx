"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap } from "lucide-react"
import Link from "next/link"

export function SymptomAnalysisWidget() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <CardTitle>AI Symptom Analysis</CardTitle>
        </div>
        <CardDescription>Get medicine recommendations powered by AI</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Describe patient symptoms using text or voice recording. Get AI-powered analysis and medicine recommendations.
        </p>
        <Link href="/symptom-analysis">
          <Button className="w-full">Start Analysis</Button>
        </Link>
      </CardContent>
    </Card>
  )
}

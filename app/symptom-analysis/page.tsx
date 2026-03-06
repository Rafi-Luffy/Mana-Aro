"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mic, Loader2, AlertCircle, CheckCircle, Pill, ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { analyzeSymptomsLocally, saveAnalysisRecord } from "@/lib/app-data"

export default function SymptomAnalysisPage() {
  const [symptomInput, setSymptomInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ReturnType<typeof analyzeSymptomsLocally> | null>(null)
  const [error, setError] = useState("")

  const startRecording = () => {
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError("Voice recording is not supported in this browser")
      toast.error("Voice recording not supported")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-IN"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    setIsRecording(true)
    setError("")

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? ""
      setSymptomInput((current) => [current, transcript].filter(Boolean).join(" ").trim())
      setIsRecording(false)
      toast.success("Voice notes captured")
    }

    recognition.onerror = () => {
      setIsRecording(false)
      setError("Unable to capture voice input")
      toast.error("Voice capture failed")
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.start()
  }

  const analyzeSymptoms = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!symptomInput.trim()) {
      setError("Please enter or record symptoms")
      return
    }

    setIsAnalyzing(true)
    setError("")
    try {
      await new Promise((resolve) => setTimeout(resolve, 400))
      const result = analyzeSymptomsLocally(symptomInput)
      setAnalysisResult(result)
      toast.success("Analysis complete")
    } catch {
      setError("Failed to analyze symptoms")
      toast.error("Analysis failed")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveAnalysis = async () => {
    if (!analysisResult) return

    try {
      await saveAnalysisRecord({ ...analysisResult, sourceText: symptomInput })
      toast.success("Analysis saved")
    } catch {
      toast.error("Unable to save analysis")
    }
  }

  const getSeverityTone = (severity: "mild" | "moderate" | "severe") => {
    if (severity === "severe") return "bg-red-100 text-red-800"
    if (severity === "moderate") return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Symptom Analysis</h1>
              <p className="text-muted-foreground mt-1">Local AI simulation for offline-ready demo analysis</p>
            </div>
            <Link href="/patients">
              <Button variant="outline" className="gap-2 bg-transparent">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Describe Symptoms</CardTitle>
              <CardDescription>Use text or voice recording, then run local analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={analyzeSymptoms} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Symptoms</label>
                  <Textarea
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    placeholder="e.g. Fever with headache and body pain for 2 days"
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    className={`gap-2 bg-transparent ${isRecording ? "border-primary" : ""}`}
                    onClick={startRecording}
                    disabled={isAnalyzing || isRecording}
                  >
                    <Mic className={`w-4 h-4 ${isRecording ? "animate-pulse" : ""}`} />
                    {isRecording ? "Listening..." : "Voice Recording"}
                  </Button>
                  <Button type="submit" disabled={isAnalyzing || !symptomInput.trim()} className="gap-2">
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing symptoms...
                      </>
                    ) : (
                      "Analyze Symptoms"
                    )}
                  </Button>
                </div>

                {error ? (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                ) : null}
              </form>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Rule Engine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">fever + headache</span> → Viral Fever</p>
              <p><span className="font-medium text-foreground">cough + fever</span> → Common Cold</p>
              <p><span className="font-medium text-foreground">fatigue + thirst</span> → Diabetes Risk</p>
              <p className="pt-2 border-t border-primary/10 text-xs italic">Use as clinical aid, not final diagnosis.</p>
            </CardContent>
          </Card>
        </div>

        {analysisResult ? (
          <div className="mt-8 space-y-6">
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Severity</p>
                  <p className="text-lg font-semibold capitalize">{analysisResult.severity}</p>
                </div>
                <Badge className={getSeverityTone(analysisResult.severity)}>{analysisResult.severity}</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Possible Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysisResult.possibleConditions.map((condition) => (
                  <div key={condition} className="p-3 bg-muted rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{condition}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Medicine Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {analysisResult.medicineSuggestions.map((suggestion) => (
                    <li key={suggestion}>{suggestion}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  Advice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">{analysisResult.advice}</p>
              </CardContent>
            </Card>

            <div className="flex gap-3 flex-wrap">
              <Button className="flex-1 gap-2" onClick={() => void saveAnalysis()}>
                <Save className="w-4 h-4" />
                Save Analysis
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setAnalysisResult(null)}>
                Analyze Another Case
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

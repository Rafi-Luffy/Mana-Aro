"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Mic, Save, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  analyzeSymptomsLocally,
  getConsultationById,
  getPatientById,
  saveConsultation,
  subscribeToDataChanges,
  type AnalysisResult,
  type ConsultationRecord,
  type PatientRecord,
} from "@/lib/app-data"

export default function ConsultationPage() {
  const params = useParams<{ id: string }>()
  const [consultation, setConsultation] = useState<ConsultationRecord | null>(null)
  const [patient, setPatient] = useState<PatientRecord | null>(null)
  const [symptoms, setSymptoms] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [notes, setNotes] = useState("")
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!params.id) return
      setLoading(true)
      try {
        const record = await getConsultationById(params.id)
        if (!record) {
          setConsultation(null)
          setPatient(null)
          return
        }

        setConsultation(record)
        setSymptoms(record.symptoms)
        setDiagnosis(record.diagnosis)
        setNotes(record.notes)
        setAnalysis(record.aiAnalysis)
        setPatient(await getPatientById(record.patientId))
      } finally {
        setLoading(false)
      }
    }

    void load()
    const unsubscribe = subscribeToDataChanges(() => {
      void load()
    })
    return unsubscribe
  }, [params.id])

  const startVoiceCapture = () => {
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition

    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-IN"
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? ""
      setSymptoms((current) => [current, transcript].filter(Boolean).join(" ").trim())
      toast.success("Voice notes added")
    }
    recognition.onerror = () => toast.error("Unable to capture voice input")
    recognition.start()
  }

  const runAnalysis = async () => {
    if (!symptoms.trim()) {
      toast.error("Enter symptoms before analysis")
      return
    }

    setAnalyzing(true)
    try {
      const result = analyzeSymptomsLocally(symptoms)
      setAnalysis(result)
      if (!diagnosis.trim()) {
        setDiagnosis(result.possibleConditions[0] ?? "")
      }
      if (!notes.trim()) {
        setNotes(result.advice)
      }
      toast.success("Analysis completed")
    } finally {
      setAnalyzing(false)
    }
  }

  const consultationDuration = useMemo(() => {
    if (!consultation) return 0
    return Math.max(5, Math.round((Date.now() - new Date(consultation.createdAt).getTime()) / 60000))
  }, [consultation])

  const handleSave = async () => {
    if (!consultation || !patient) return

    setSaving(true)
    try {
      await saveConsultation({
        id: consultation.id,
        patientId: patient.id,
        patientName: patient.name,
        date: consultation.date,
        symptoms: symptoms.trim(),
        diagnosis: diagnosis.trim(),
        notes: notes.trim(),
        riskLevel: patient.riskLevel,
        status: "completed",
        durationMinutes: consultationDuration,
        aiAnalysis: analysis,
      })
      toast.success("Consultation saved")
    } catch {
      toast.error("Failed to save consultation")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading consultation...</p>
  }

  if (!consultation || !patient) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Consultation not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/consultation" className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to consultations
          </Link>
          <h1 className="text-3xl font-bold">Consultation Detail</h1>
          <p className="text-muted-foreground">Review symptoms, local AI analysis, and follow-up notes.</p>
        </div>
        <Button onClick={() => void handleSave()} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Consultation"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Patient Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{patient.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Age</p>
              <p className="font-medium">{patient.age}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Village</p>
              <p className="font-medium">{patient.village}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Risk</p>
              <Badge>{patient.riskLevel.toUpperCase()}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Symptoms</CardTitle>
            <CardDescription>Use text input or voice recording for the consultation notes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={symptoms} onChange={(event) => setSymptoms(event.target.value)} rows={7} />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={startVoiceCapture}>
                <Mic className="h-4 w-4" />
                Voice Recording
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => void runAnalysis()} disabled={analyzing}>
                <Sparkles className="h-4 w-4" />
                {analyzing ? "Analyzing symptoms..." : "Run Local Analysis"}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Diagnosis</label>
                <Textarea value={diagnosis} onChange={(event) => setDiagnosis(event.target.value)} rows={3} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Follow-up Notes</label>
                <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Analysis Result</CardTitle>
          <CardDescription>Demo-safe local simulation powered by symptom rules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis ? (
            <>
              <div>
                <p className="mb-2 text-sm font-medium">Possible Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.possibleConditions.map((condition) => (
                    <Badge key={condition} variant="secondary">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Medicine Suggestions</p>
                <ul className="list-inside list-disc text-sm text-muted-foreground">
                  {analysis.medicineSuggestions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Follow-up Advice</p>
                <p className="text-sm text-muted-foreground">{analysis.advice}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Run analysis to view possible conditions and suggestions.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Mic, AlertTriangle, Save, ChevronDown } from 'lucide-react'
import { useState as useLocalStorage } from 'react'

interface VisitData {
  patientId: string
  patientName: string
  patientAge: number
  symptoms: string[]
  vitals: {
    bp: string
    pulse: string
    temperature: string
    weight: string
  }
  observations: string
  aiSuggestion?: {
    riskLevel: 'low' | 'medium' | 'high'
    suggestion: string
    confidence: number
  }
}

const commonSymptoms = [
  'Fever',
  'Cough',
  'Cold',
  'Headache',
  'Body Pain',
  'Fatigue',
  'Chest Pain',
  'Shortness of Breath',
  'Diarrhea',
  'Nausea',
  'Vomiting',
  'Abdominal Pain',
]

export default function VisitScreenOptimized() {
  const [visitData, setVisitData] = useState<VisitData>({
    patientId: 'pat_001',
    patientName: 'Lakshmi',
    patientAge: 45,
    symptoms: [],
    vitals: { bp: '', pulse: '', temperature: '', weight: '' },
    observations: '',
    aiSuggestion: {
      riskLevel: 'medium',
      suggestion: 'Monitor BP regularly, follow-up in 3 days',
      confidence: 92,
    },
  })

  const [isListening, setIsListening] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showAISuggestion, setShowAISuggestion] = useState(false)
  const [draftAutoSaved, setDraftAutoSaved] = useState(false)

  // Auto-draft every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(`visit_draft_${visitData.patientId}`, JSON.stringify(visitData))
      setDraftAutoSaved(true)
      setTimeout(() => setDraftAutoSaved(false), 2000)
    }, 5000)

    return () => clearInterval(interval)
  }, [visitData])

  const handleSymptomToggle = (symptom: string) => {
    setVisitData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }))
  }

  const handleVitalChange = (key: keyof typeof visitData.vitals, value: string) => {
    setVisitData((prev) => ({
      ...prev,
      vitals: { ...prev.vitals, [key]: value },
    }))
  }

  const handleVoiceInput = (field: string) => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported')
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    setIsListening(true)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      if (field === 'observations') {
        setVisitData((prev) => ({
          ...prev,
          observations: prev.observations + (prev.observations ? ' ' : '') + transcript,
        }))
      }
      setIsListening(false)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.start()
  }

  const handleSaveVisit = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    localStorage.removeItem(`visit_draft_${visitData.patientId}`)
    setIsSaving(false)
    alert('Visit saved successfully!')
  }

  const hasRedFlags = ['Chest Pain', 'Severe Dehydration'].some((s) => visitData.symptoms.includes(s))

  return (
    <AuthGuard>
      <div className="pb-24">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {/* Sticky Patient Summary */}
          <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 -mx-4 px-4 py-3 border-b">
            <div className="space-y-1">
              <h2 className="font-bold text-lg">
                {visitData.patientName}
                <span className="text-muted-foreground ml-2 font-normal">
                  {visitData.patientAge}y
                </span>
              </h2>
              <p className="text-sm text-muted-foreground">Last visit: Yesterday</p>
            </div>
          </div>

          {/* Red Flag Alert */}
          {hasRedFlags && (
            <Alert className="border-destructive bg-destructive/10">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <AlertDescription className="text-destructive">
                ⚠ Immediate Referral Recommended
                <Button size="sm" className="ml-2 h-7">
                  Call PHC
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Symptoms Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Symptoms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Common Symptoms Grid */}
              <div className="grid grid-cols-2 gap-2">
                {commonSymptoms.map((symptom) => (
                  <label
                    key={symptom}
                    className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-primary/5"
                  >
                    <Checkbox
                      checked={visitData.symptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                    />
                    <span className="text-sm font-medium">{symptom}</span>
                  </label>
                ))}
              </div>

              {/* Custom Symptom Input */}
              <div className="space-y-2 pt-2 border-t">
                <label className="text-sm font-medium">Other Symptoms</label>
                <Input placeholder="Add other symptoms..." className="h-10" />
              </div>
            </CardContent>
          </Card>

          {/* Vitals Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vitals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-2">BP (mmHg)</label>
                  <Input
                    value={visitData.vitals.bp}
                    onChange={(e) => handleVitalChange('bp', e.target.value)}
                    placeholder="120/80"
                    className="h-12 text-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Pulse (bpm)</label>
                  <Input
                    value={visitData.vitals.pulse}
                    onChange={(e) => handleVitalChange('pulse', e.target.value)}
                    placeholder="70"
                    className="h-12 text-lg"
                    type="number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Temp (°C)</label>
                  <Input
                    value={visitData.vitals.temperature}
                    onChange={(e) => handleVitalChange('temperature', e.target.value)}
                    placeholder="98.6"
                    className="h-12 text-lg"
                    type="number"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Weight (kg)</label>
                  <Input
                    value={visitData.vitals.weight}
                    onChange={(e) => handleVitalChange('weight', e.target.value)}
                    placeholder="60"
                    className="h-12 text-lg"
                    type="number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observations Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Observations</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleVoiceInput('observations')}
                disabled={isListening}
                className={isListening ? 'bg-red-50' : ''}
              >
                <Mic
                  className={`w-4 h-4 ${isListening ? 'animate-pulse text-red-500' : ''}`}
                />
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                value={visitData.observations}
                onChange={(e) =>
                  setVisitData((prev) => ({
                    ...prev,
                    observations: e.target.value,
                  }))
                }
                placeholder="Clinical observations and notes..."
                className="min-h-24 resize-none"
              />
            </CardContent>
          </Card>

          {/* AI Suggestion */}
          {visitData.aiSuggestion && (
            <Card>
              <button
                onClick={() => setShowAISuggestion(!showAISuggestion)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50"
              >
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    💡 AI Assistant
                    <Badge variant="secondary" className="text-xs">
                      Review Required
                    </Badge>
                  </CardTitle>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showAISuggestion ? 'rotate-180' : ''}`}
                />
              </button>

              {showAISuggestion && (
                <CardContent className="space-y-3 pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Risk Level:</span>
                      <Badge
                        variant={
                          visitData.aiSuggestion.riskLevel === 'high'
                            ? 'destructive'
                            : visitData.aiSuggestion.riskLevel === 'medium'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {visitData.aiSuggestion.riskLevel.charAt(0).toUpperCase() +
                          visitData.aiSuggestion.riskLevel.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{visitData.aiSuggestion.suggestion}</p>
                    <p className="text-xs text-muted-foreground">
                      Confidence: {visitData.aiSuggestion.confidence}%
                    </p>
                  </div>
                  <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                    ⚠ AI suggestions are for reference. Clinical decision rests with the healthcare
                    provider.
                  </p>
                </CardContent>
              )}
            </Card>
          )}

          {/* Save Button */}
          <div className="space-y-2">
            <Button
              onClick={handleSaveVisit}
              disabled={isSaving}
              className="w-full h-12 gap-2 sticky bottom-20"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Visit'}
            </Button>
            {draftAutoSaved && (
              <p className="text-xs text-center text-green-600">✓ Draft auto-saved</p>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

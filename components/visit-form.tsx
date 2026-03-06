'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateVisitSchema, CreateVisitInput } from '@/lib/types'
import { useVisitStore } from '@/store/visits'
import { usePatientStore } from '@/store/patients'
import { useSyncStore } from '@/store/sync'
import { getAIAnalysisService } from '@/lib/ai-analysis'
import { AIAnalysisCards } from '@/components/ai-analysis-cards'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, AlertCircle, Mic, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

const COMMON_SYMPTOMS = [
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

interface VisitFormProps {
  patientId: string
  onSuccess?: (visitId: string) => void
  onCancel?: () => void
}

export function VisitForm({ patientId, onSuccess, onCancel }: VisitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)
  const [aiAnalysis, setAIAnalysis] = useState<any>(null)
  const [isListening, setIsListening] = useState(false)

  const addVisit = useVisitStore((state) => state.addVisit)
  const saveDraft = useVisitStore((state) => state.saveDraft)
  const loadDraft = useVisitStore((state) => state.loadDraft)
  const patient = usePatientStore((state) => state.getPatient(patientId))
  const syncStatus = useSyncStore((state) => state.status)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue,
    watch,
  } = useForm<CreateVisitInput>({
    resolver: zodResolver(CreateVisitSchema),
    defaultValues: {
      patientId,
      date: new Date().toISOString().split('T')[0],
      symptoms: [],
      vitals: {
        bp: '',
        pulse: 0,
        temperature: 0,
        weight: 0,
        respiratoryRate: undefined,
      },
      observations: '',
    },
  })

  // Auto-save draft every 10 seconds
  useEffect(() => {
    const draftKey = `visit_draft_${patientId}`
    const interval = setInterval(async () => {
      const currentValues = getValues()
      await saveDraft(draftKey, currentValues)
    }, 10000)

    return () => clearInterval(interval)
  }, [patientId, saveDraft, getValues])

  // Load draft on mount
  useEffect(() => {
    const loadSavedDraft = async () => {
      const draftKey = `visit_draft_${patientId}`
      const draft = await loadDraft(draftKey)
      if (draft) {
        Object.keys(draft).forEach((key) => {
          setValue(key as any, (draft as any)[key])
        })
      }
    }

    loadSavedDraft()
  }, [patientId, loadDraft, setValue])

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) => {
      const newSymptoms = prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]

      setValue('symptoms', newSymptoms.map((s) => ({ name: s })))
      return newSymptoms
    })
  }

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Speech recognition not supported')
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    setIsListening(true)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      const currentObs = getValues('observations')
      setValue('observations', currentObs + (currentObs ? ' ' : '') + transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
      toast.error('Voice input failed')
    }

    recognition.start()
  }

  const handleAnalyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error('Please select at least one symptom')
      return
    }

    setIsAnalyzing(true)

    try {
      const aiService = getAIAnalysisService()
      const analysis = await aiService.analyzeSymptoms(selectedSymptoms)
      setAIAnalysis(analysis)
      setValue('aiAnalysis', {
        riskLevel: analysis.riskLevel,
        possibleConditions: analysis.possibleConditions.map((c) => c.name),
        recommendations: analysis.recommendations,
        confidence: analysis.confidence,
        referralRequired: analysis.referralRequired,
      })
      setShowAIAnalysis(true)
      toast.success('Symptom analysis complete')
    } catch (error) {
      toast.error('Failed to analyze symptoms')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const onSubmit = async (data: CreateVisitInput) => {
    if (!patient) {
      toast.error('Patient not found')
      return
    }

    setIsSubmitting(true)

    try {
      const visit = await addVisit(data)
      reset()
      setSelectedSymptoms([])
      setAIAnalysis(null)
      toast.success('Visit recorded successfully')
      onSuccess?.(visit.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to record visit'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!patient) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>Patient not found</AlertDescription>
      </Alert>
    )
  }

  const aiAnalysisData = aiAnalysis || getValues('aiAnalysis')
  const hasRedFlags =
    selectedSymptoms.some((s) =>
      ['Chest Pain', 'Severe Dehydration', 'Shortness of Breath'].includes(s)
    ) || aiAnalysisData?.referralRequired

  return (
    <div className="w-full max-w-3xl mx-auto pb-24">
      {/* Sticky Patient Summary */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 -mx-4 px-4 py-3 mb-4 border-b">
        <div className="space-y-1">
          <h2 className="font-bold text-lg">
            {patient.name}
            <span className="text-muted-foreground ml-2 font-normal">{patient.age}y</span>
          </h2>
          <p className="text-sm text-muted-foreground">Last visit: {patient.lastVisitDate || 'Never'}</p>
        </div>
      </div>

      {/* Red Flag Alert */}
      {hasRedFlags && (
        <Alert className="border-destructive bg-destructive/10 mb-4">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <AlertDescription className="text-destructive">
            ⚠️ Immediate Referral Recommended - Contact health facility
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Tabs defaultValue="symptoms" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="observations">Notes</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          </TabsList>

          {/* Symptoms Tab */}
          <TabsContent value="symptoms">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select Symptoms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {COMMON_SYMPTOMS.map((symptom) => (
                    <label
                      key={symptom}
                      className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-primary/5"
                    >
                      <Checkbox
                        checked={selectedSymptoms.includes(symptom)}
                        onCheckedChange={() => handleSymptomToggle(symptom)}
                      />
                      <span className="text-sm font-medium">{symptom}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor="customSymptom">Other Symptoms</Label>
                  <Input
                    id="customSymptom"
                    placeholder="Add other symptoms..."
                    className="h-10"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleAnalyzeSymptoms}
                  disabled={isAnalyzing || selectedSymptoms.length === 0}
                  className="w-full mt-4"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    '🤖 Analyze Symptoms'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vitals Tab */}
          <TabsContent value="vitals">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Record Vitals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="bp">Blood Pressure (mmHg)</Label>
                    <Input
                      id="bp"
                      placeholder="120/80"
                      {...register('vitals.bp')}
                      className="h-12 text-lg font-semibold"
                    />
                    {errors.vitals?.bp && (
                      <p className="text-sm text-destructive">{errors.vitals.bp.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pulse">Pulse (bpm)</Label>
                    <Input
                      id="pulse"
                      type="number"
                      placeholder="70"
                      {...register('vitals.pulse', { valueAsNumber: true })}
                      className="h-12 text-lg font-semibold"
                    />
                    {errors.vitals?.pulse && (
                      <p className="text-sm text-destructive">{errors.vitals.pulse.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temp">Temperature (°C)</Label>
                    <Input
                      id="temp"
                      type="number"
                      step="0.1"
                      placeholder="98.6"
                      {...register('vitals.temperature', { valueAsNumber: true })}
                      className="h-12 text-lg font-semibold"
                    />
                    {errors.vitals?.temperature && (
                      <p className="text-sm text-destructive">
                        {errors.vitals.temperature.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="60"
                      {...register('vitals.weight', { valueAsNumber: true })}
                      className="h-12 text-lg font-semibold"
                    />
                    {errors.vitals?.weight && (
                      <p className="text-sm text-destructive">{errors.vitals.weight.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Observations Tab */}
          <TabsContent value="observations">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Clinical Observations</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleVoiceInput}
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
                  placeholder="Enter clinical observations and notes..."
                  className="min-h-32 resize-none"
                  {...register('observations')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="analysis">
            {aiAnalysisData ? (
              <AIAnalysisCards
                riskLevel={aiAnalysisData.riskLevel}
                confidence={aiAnalysisData.confidence}
                possibleConditions={aiAnalysisData.possibleConditions || []}
                recommendations={aiAnalysisData.recommendations || []}
                referralRequired={aiAnalysisData.referralRequired}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Complete symptom analysis to see AI recommendations
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Sync Status */}
        {syncStatus === 'offline' && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-800">
              🔵 Offline mode - Visit will be saved locally and synced automatically
            </AlertDescription>
          </Alert>
        )}

        {/* Form Actions */}
        <div className="flex gap-3 sticky bottom-0 bg-background/95 backdrop-blur-sm -mx-4 px-4 py-4 border-t">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-12"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              '💾 Save Visit'
            )}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-12"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

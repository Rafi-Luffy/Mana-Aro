'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Phone, Share2, AlertTriangle } from 'lucide-react'

interface EmergencyModeProps {
  patientName: string
  patientAge: number
  symptoms: string[]
  vitals: {
    bp: string
    pulse: string
    temperature: string
  }
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function EmergencyMode({
  patientName,
  patientAge,
  symptoms,
  vitals,
  isOpen,
  onOpenChange,
}: EmergencyModeProps) {
  const [callInitiated, setCallInitiated] = useState(false)
  const [shareInitiated, setShareInitiated] = useState(false)

  const phcPhone = '+91-XXXXX-XXXXX' // Replace with actual PHC number

  const handleCallPHC = () => {
    setCallInitiated(true)
    // In production, trigger actual call
    window.location.href = `tel:${phcPhone}`
    setTimeout(() => setCallInitiated(false), 3000)
  }

  const generateSummary = () => {
    return `EMERGENCY REFERRAL - Patient Summary:
    
Name: ${patientName}
Age: ${patientAge}
Date: ${new Date().toLocaleString()}

SYMPTOMS: ${symptoms.join(', ')}

VITALS:
- BP: ${vitals.bp}
- Pulse: ${vitals.pulse}
- Temperature: ${vitals.temperature}

⚠️ Patient requires immediate medical attention. Please admit to healthcare facility immediately.`
  }

  const handleShareSummary = async () => {
    const summary = generateSummary()
    setShareInitiated(true)

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emergency Patient Summary',
          text: summary,
        })
      } catch (err) {
        console.log('Share cancelled or failed')
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(summary)
      alert('Patient summary copied to clipboard')
    }

    setTimeout(() => setShareInitiated(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-destructive">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <DialogTitle>Emergency Mode</DialogTitle>
          </div>
          <DialogDescription>
            Immediate referral required for {patientName}
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-destructive bg-destructive/10">
          <AlertDescription className="text-destructive">
            This patient requires immediate medical attention. Contact PHC immediately.
          </AlertDescription>
        </Alert>

        {/* Patient Summary */}
        <div className="space-y-3 bg-secondary/10 p-4 rounded-lg">
          <h4 className="font-semibold text-sm">Patient Summary</h4>
          <div className="text-sm space-y-2">
            <p>
              <span className="font-medium">Name:</span> {patientName}, {patientAge}y
            </p>
            <p>
              <span className="font-medium">Symptoms:</span> {symptoms.join(', ')}
            </p>
            <div className="space-y-1">
              <p className="font-medium">Vitals:</p>
              <p className="text-xs ml-2">
                BP: {vitals.bp} | Pulse: {vitals.pulse} | Temp: {vitals.temperature}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleCallPHC}
            disabled={callInitiated}
            className="gap-2 bg-destructive hover:bg-destructive/90 h-12"
          >
            <Phone className="w-4 h-4" />
            {callInitiated ? 'Calling PHC...' : 'Call PHC Now'}
          </Button>

          <Button
            onClick={handleShareSummary}
            disabled={shareInitiated}
            variant="outline"
            className="gap-2 h-12"
          >
            <Share2 className="w-4 h-4" />
            {shareInitiated ? 'Shared...' : 'Share Patient Summary'}
          </Button>

          <Button onClick={() => onOpenChange(false)} variant="ghost" className="h-10">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

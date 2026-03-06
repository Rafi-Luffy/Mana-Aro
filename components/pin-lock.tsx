'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PINLockProps {
  onUnlock: (pin: string) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function PINLock({ onUnlock, isOpen, onOpenChange }: PINLockProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const maxAttempts = 5

  const handleSubmit = () => {
    // Mock validation - in production, compare with stored hash
    if (pin.length !== 4) {
      setError('PIN must be 4 digits')
      return
    }

    if (pin === '1234') {
      // Mock PIN for demo
      onUnlock(pin)
      setPin('')
      setError('')
      setAttempts(0)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setError(`Incorrect PIN. ${maxAttempts - newAttempts} attempts remaining.`)

      if (newAttempts >= maxAttempts) {
        // Trigger lock-out logic
        alert('Too many failed attempts. App locked for 30 minutes.')
        onOpenChange(false)
      }
    }
  }

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num)
      setError('')
    }
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>App Lock</DialogTitle>
          <DialogDescription>Enter your 4-digit PIN to continue</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* PIN Display */}
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="w-12 h-12 rounded-lg border-2 border-border flex items-center justify-center bg-card"
              >
                {pin[idx] ? '●' : ''}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="text-xs">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="outline"
                size="lg"
                onClick={() => handleNumberClick(String(num))}
                className="h-12 text-lg font-semibold"
              >
                {num}
              </Button>
            ))}
            <Button
              variant="outline"
              size="lg"
              className="h-12"
              onClick={() => {
                /* Biometric */
              }}
            >
              👆
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleNumberClick('0')}
              className="h-12 text-lg font-semibold"
            >
              0
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleBackspace}
              className="h-12 text-lg font-semibold"
            >
              ←
            </Button>
          </div>

          {/* Unlock Button */}
          <Button
            onClick={handleSubmit}
            disabled={pin.length !== 4}
            className="w-full"
          >
            Unlock
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

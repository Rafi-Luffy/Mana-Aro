'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function PatientError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-3">
            <p className="font-semibold">Failed to load patients</p>
            <p className="text-sm">An error occurred while loading the patient list.</p>
            <Button onClick={reset} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}

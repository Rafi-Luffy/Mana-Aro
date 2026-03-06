'use client'

import React, { useSearchParams, useRouter } from 'next/navigation'
import { VisitForm } from '@/components/visit-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function VisitNewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')

  if (!patientId) {
    return (
      <div className="max-w-3xl mx-auto p-4 text-center">
        <p className="text-muted-foreground">Patient not specified</p>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">New Visit</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <VisitForm
          patientId={patientId}
          onSuccess={(visitId) => {
            router.push(`/patients/${patientId}`)
          }}
          onCancel={() => {
            router.back()
          }}
        />
      </div>
    </div>
  )
}
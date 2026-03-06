'use client'

import React, { Suspense } from 'react'
import { VisitNewContent } from './visit-new-content'

export default function VisitNewPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto p-4 text-center">Loading...</div>}>
      <VisitNewContent />
    </Suspense>
  )
}

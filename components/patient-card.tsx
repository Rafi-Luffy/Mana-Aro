'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PatientCardProps {
  id: string
  name: string
  age: number
  gender: 'M' | 'F'
  riskLevel: 'low' | 'medium' | 'high'
  lastVisitDate?: string
  isSynced?: boolean
}

export function PatientCard({
  id,
  name,
  age,
  gender,
  riskLevel,
  lastVisitDate,
  isSynced = true,
}: PatientCardProps) {
  const riskColors = {
    low: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-red-50 text-red-700 border-red-200',
  }

  const riskLabels = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
  }

  return (
    <Link href={`/patients/${id}`}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary">
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-base">
                {name}
                <span className="text-muted-foreground ml-2 font-normal">{gender}</span>
              </h3>
              <p className="text-sm text-muted-foreground">{age} years</p>
            </div>
            {!isSynced && (
              <div className="w-2 h-2 rounded-full bg-amber-500" title="Pending sync" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className={cn('text-xs', riskColors[riskLevel])}>
              {riskLabels[riskLevel]}
            </Badge>
            {lastVisitDate && <span className="text-xs text-muted-foreground">{lastVisitDate}</span>}
          </div>
        </div>
      </Card>
    </Link>
  )
}

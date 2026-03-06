'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface FamilyMember {
  id: string
  name: string
  age: number
  gender: 'M' | 'F'
  relation: string
  riskLevel: 'low' | 'medium' | 'high'
}

interface FamilyClusterProps {
  familyHead: FamilyMember
  members: FamilyMember[]
  noOfDiabetic?: number
  noOfPregnant?: number
  noOfHighRisk?: number
}

export function FamilyCluster({
  familyHead,
  members,
  noOfDiabetic = 0,
  noOfPregnant = 0,
  noOfHighRisk = 0,
}: FamilyClusterProps) {
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

  const familyRiskLevel =
    noOfHighRisk > 0 ? 'high' : noOfDiabetic > 0 || noOfPregnant > 0 ? 'medium' : 'low'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-5 h-5" />
          Family Cluster
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Family Risk Summary */}
        <div
          className={cn(
            'p-3 rounded-lg border',
            familyRiskLevel === 'high'
              ? 'bg-red-50 border-red-200'
              : familyRiskLevel === 'medium'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-green-50 border-green-200'
          )}
        >
          <h4 className="font-semibold text-sm mb-2">Family Health Profile</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {noOfDiabetic > 0 && <div>🩺 {noOfDiabetic} Diabetic</div>}
            {noOfPregnant > 0 && <div>🤰 {noOfPregnant} Pregnant</div>}
            {noOfHighRisk > 0 && <div>⚠️ {noOfHighRisk} High-Risk</div>}
          </div>
        </div>

        {/* Family Head */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">Family Head</h4>
          <Link href={`/patients/${familyHead.id}`}>
            <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">
                    {familyHead.name}
                    <span className="text-muted-foreground ml-2 font-normal">{familyHead.gender}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{familyHead.age} years old</p>
                </div>
                <Badge variant="outline" className={cn('text-xs', riskColors[familyHead.riskLevel])}>
                  {riskLabels[familyHead.riskLevel]}
                </Badge>
              </div>
            </div>
          </Link>
        </div>

        {/* Family Members */}
        {members.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground">Family Members</h4>
            <div className="space-y-2">
              {members.map((member) => (
                <Link key={member.id} href={`/patients/${member.id}`}>
                  <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {member.name}
                          <span className="text-muted-foreground ml-2 font-normal">{member.gender}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.age}y • {member.relation}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn('text-xs', riskColors[member.riskLevel])}
                      >
                        {riskLabels[member.riskLevel]}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

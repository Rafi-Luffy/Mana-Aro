'use client'

import { useMemo, useState } from 'react'
import type React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Gender = 'Male' | 'Female' | 'Other'
type RiskLevel = 'low' | 'medium' | 'high'

interface PatientFormValues {
  name: string
  age: string
  gender: Gender
  phone: string
  village: string
  riskLevel: RiskLevel
  conditions: string
}

interface PatientFormProps {
  onSubmit: (data: {
    name: string
    age: number
    gender: Gender
    phone: string
    village: string
    riskLevel: RiskLevel
    conditions: string[]
  }) => void | Promise<void>
  onCancel: () => void
  initialData?: {
    name?: string
    age?: number
    gender?: Gender
    phone?: string
    village?: string
    riskLevel?: RiskLevel
    conditions?: string[]
  }
}

function getInitialValues(initialData?: PatientFormProps['initialData']): PatientFormValues {
  return {
    name: initialData?.name ?? '',
    age: initialData?.age ? String(initialData.age) : '',
    gender: initialData?.gender ?? 'Male',
    phone: initialData?.phone ?? '',
    village: initialData?.village ?? '',
    riskLevel: initialData?.riskLevel ?? 'low',
    conditions: initialData?.conditions?.join(', ') ?? '',
  }
}

export default function PatientForm({ onSubmit, onCancel, initialData }: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormValues>(getInitialValues(initialData))
  const [errors, setErrors] = useState<Partial<Record<keyof PatientFormValues, string>>>({})
  const [isSaving, setIsSaving] = useState(false)

  const parsedConditions = useMemo(
    () => formData.conditions.split(',').map((item) => item.trim()).filter(Boolean),
    [formData.conditions],
  )

  const validate = () => {
    const nextErrors: Partial<Record<keyof PatientFormValues, string>> = {}
    const age = Number(formData.age)

    if (!/^[A-Za-z ]{3,}$/.test(formData.name.trim())) {
      nextErrors.name = 'Enter at least 3 letters using alphabetic characters only.'
    }

    if (!Number.isInteger(age) || age < 1 || age > 120) {
      nextErrors.age = 'Age must be between 1 and 120.'
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      nextErrors.phone = 'Enter a valid 10-digit Indian phone number.'
    }

    if (!formData.village.trim()) {
      nextErrors.village = 'Village is required.'
    }

    if (formData.conditions.includes(',,')) {
      nextErrors.conditions = 'Use comma-separated medical conditions without empty items.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleFieldChange = (field: keyof PatientFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    setIsSaving(true)
    try {
      await onSubmit({
        name: formData.name.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        phone: formData.phone.trim(),
        village: formData.village.trim(),
        riskLevel: formData.riskLevel,
        conditions: parsedConditions,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" value={formData.name} onChange={(e) => handleFieldChange('name', e.target.value)} />
          {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age *</Label>
          <Input id="age" type="number" value={formData.age} onChange={(e) => handleFieldChange('age', e.target.value)} />
          {errors.age ? <p className="text-xs text-destructive">{errors.age}</p> : null}
        </div>

        <div className="space-y-2">
          <Label>Gender *</Label>
          <Select value={formData.gender} onValueChange={(value) => handleFieldChange('gender', value as Gender)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value.replace(/\D/g, ''))}
            maxLength={10}
          />
          {errors.phone ? <p className="text-xs text-destructive">{errors.phone}</p> : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="village">Village *</Label>
          <Input id="village" value={formData.village} onChange={(e) => handleFieldChange('village', e.target.value)} />
          {errors.village ? <p className="text-xs text-destructive">{errors.village}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Risk Level</Label>
        <Select value={formData.riskLevel} onValueChange={(value) => handleFieldChange('riskLevel', value as RiskLevel)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="conditions">Medical Conditions (comma separated)</Label>
        <Input
          id="conditions"
          value={formData.conditions}
          onChange={(e) => handleFieldChange('conditions', e.target.value)}
          placeholder="Hypertension, Diabetes"
        />
        {errors.conditions ? <p className="text-xs text-destructive">{errors.conditions}</p> : null}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Patient'}
        </Button>
      </div>
    </form>
  )
}

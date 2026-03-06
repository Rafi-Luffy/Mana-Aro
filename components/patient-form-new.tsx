'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreatePatientSchema, CreatePatientInput } from '@/lib/types'
import { usePatientStore } from '@/store/patients'
import { useSyncStore } from '@/store/sync'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PatientFormProps {
  onSuccess?: (patientId: string) => void
  onCancel?: () => void
  isLoading?: boolean
}

export function PatientFormComponent({
  onSuccess,
  onCancel,
  isLoading = false,
}: PatientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const addPatient = usePatientStore((state) => state.addPatient)
  const setError = usePatientStore((state) => state.setError)
  const error = usePatientStore((state) => state.error)
  const syncStatus = useSyncStore((state) => state.status)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreatePatientInput>({
    resolver: zodResolver(CreatePatientSchema) as any,
    defaultValues: {
      name: '',
      age: 25,
      gender: 'M',
      phone: '',
      address: '',
      riskLevel: 'low',
      chronicConditions: [],
    },
  })

  const chronicConditionsValue = watch('chronicConditions')

  const onSubmit = async (data: CreatePatientInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const patient = await addPatient(data)
      reset()
      toast.success(`Patient ${patient.name} added successfully`)
      onSuccess?.(patient.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add patient'
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Patient</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Patient name"
                disabled={isSubmitting || isLoading}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Age and Gender Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  max="150"
                  disabled={isSubmitting || isLoading}
                  {...register('age', { valueAsNumber: true })}
                />
                {errors.age && (
                  <p className="text-sm text-destructive">{errors.age.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select defaultValue="M" {...register('gender')}>
                  <SelectTrigger id="gender" disabled={isSubmitting || isLoading}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-destructive">{errors.gender.message}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="10-digit phone number"
                disabled={isSubmitting || isLoading}
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Patient address"
                disabled={isSubmitting || isLoading}
                {...register('address')}
              />
            </div>

            {/* Risk Level */}
            <div className="space-y-2">
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Select defaultValue="low" {...register('riskLevel')}>
                <SelectTrigger id="riskLevel" disabled={isSubmitting || isLoading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chronic Conditions */}
            <div className="space-y-2">
              <Label>Chronic Conditions</Label>
              <div className="space-y-2">
                {[
                  'Diabetes',
                  'Hypertension',
                  'Asthma',
                  'Heart Disease',
                  'Thyroid',
                  'Other',
                ].map((condition) => (
                  <label key={condition} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={condition}
                      {...register('chronicConditions')}
                      disabled={isSubmitting || isLoading}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{condition}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sync Status */}
            {syncStatus === 'offline' && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertDescription className="text-amber-800">
                  🔵 Offline mode - Data will sync when connection is restored
                </AlertDescription>
              </Alert>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Patient'
                )}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting || isLoading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

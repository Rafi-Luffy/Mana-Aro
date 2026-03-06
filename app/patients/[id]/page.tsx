'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, Edit2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  deletePatientById,
  getConsultationsByPatient,
  getPatientById,
  startConsultation,
  type ConsultationRecord,
  type PatientRecord,
} from '@/lib/app-data'

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [patient, setPatient] = useState<PatientRecord | null>(null)
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!params.id) return
      setLoading(true)
      try {
        const [patientRecord, patientConsultations] = await Promise.all([
          getPatientById(params.id),
          getConsultationsByPatient(params.id),
        ])
        setPatient(patientRecord)
        setConsultations(patientConsultations)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [params.id])

  const handleDelete = async () => {
    if (!patient) return
    try {
      await deletePatientById(patient.id)
      toast.success('Patient deleted')
      router.push('/patients')
    } catch (error) {
      toast.error('Failed to delete patient')
    }
  }

  const handleStartConsultation = async () => {
    if (!patient) return
    try {
      const consultation = await startConsultation(patient.id)
      toast.success('Consultation started')
      router.push(`/consultation/${consultation.id}`)
    } catch (error) {
      toast.error('Unable to start consultation')
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  if (!patient) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Patient not found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{patient.name}</h1>
          <p className="text-muted-foreground">
            {patient.age} • {patient.gender} • {patient.village}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push(`/patients?edit=${patient.id}`)} className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
          <Button onClick={() => void handleStartConsultation()} className="gap-2">
            <Plus className="h-4 w-4" />
            Start Consultation
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete patient?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the patient and every consultation linked to the record.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex justify-end gap-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => void handleDelete()}>Delete</AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{patient.phone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Risk</p>
            <Badge>{patient.riskLevel.toUpperCase()}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Village</p>
            <p className="font-medium">{patient.village}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Conditions</p>
            <p className="font-medium">{patient.conditions.length ? patient.conditions.join(', ') : 'None'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consultation History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {consultations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No consultations recorded.</p>
          ) : (
            consultations.map((consultation) => (
              <Link key={consultation.id} href={`/consultation/${consultation.id}`}>
                <div className="rounded-lg border p-4 transition-colors hover:bg-muted/40">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{consultation.diagnosis || 'Pending diagnosis'}</p>
                      <p className="text-sm text-muted-foreground">{consultation.symptoms || 'No symptoms recorded yet'}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(consultation.date).toLocaleDateString('en-IN')}
                      </p>
                      <p>{consultation.status}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

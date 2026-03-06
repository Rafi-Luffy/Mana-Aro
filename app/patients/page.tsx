'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Search, Trash2, Edit2, Stethoscope, RefreshCw, MapPin, Phone, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import PatientForm from '@/components/patient-form'
import { PatientListSkeleton } from '@/components/loading-skeletons'
import { toast } from 'sonner'
import {
  deletePatientById,
  getPatients,
  savePatient,
  startConsultation,
  subscribeToDataChanges,
  type PatientRecord,
} from '@/lib/app-data'

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState<PatientRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const loadPatients = async () => {
    setLoading(true)
    try {
      setPatients(await getPatients())
    } catch (error) {
      toast.error('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPatients()
    const unsubscribe = subscribeToDataChanges(() => {
      void loadPatients()
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const action = searchParams.get('action')
    const editId = searchParams.get('edit')

    if (action === 'add') {
      setEditingPatient(null)
      setShowForm(true)
    } else if (editId) {
      const patient = patients.find((item) => item.id === editId)
      if (patient) {
        setEditingPatient(patient)
        setShowForm(true)
      }
    }
  }, [patients, searchParams])

  const filteredPatients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return patients

    return patients.filter((patient) =>
      [patient.name, patient.phone, patient.village].some((value) => value.toLowerCase().includes(query)),
    )
  }, [patients, searchTerm])

  const patientStats = useMemo(
    () => ({
      total: patients.length,
      low: patients.filter((patient) => patient.riskLevel === 'low').length,
      medium: patients.filter((patient) => patient.riskLevel === 'medium').length,
      high: patients.filter((patient) => patient.riskLevel === 'high').length,
    }),
    [patients],
  )

  const closeForm = () => {
    setShowForm(false)
    setEditingPatient(null)
    router.replace('/patients')
  }

  const handleSavePatient = async (data: {
    name: string
    age: number
    gender: 'Male' | 'Female' | 'Other'
    phone: string
    village: string
    riskLevel: 'low' | 'medium' | 'high'
    conditions: string[]
  }) => {
    setSaving(true)
    try {
      await savePatient({ id: editingPatient?.id, ...data })
      toast.success(editingPatient ? 'Patient updated' : 'Patient added')
      closeForm()
    } catch (error) {
      toast.error('Failed to save patient')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePatient = async (patient: PatientRecord) => {
    try {
      await deletePatientById(patient.id)
      toast.success('Patient deleted')
    } catch (error) {
      toast.error('Failed to delete patient')
    }
  }

  const handleStartConsultation = async (patientId: string) => {
    try {
      const consultation = await startConsultation(patientId)
      toast.success('Consultation started')
      router.push(`/consultation/${consultation.id}`)
    } catch (error) {
      toast.error('Unable to start consultation')
    }
  }

  const getRiskClasses = (riskLevel: PatientRecord['riskLevel']) => {
    if (riskLevel === 'high') return 'bg-red-100 text-red-700'
    if (riskLevel === 'medium') return 'bg-amber-100 text-amber-700'
    return 'bg-green-100 text-green-700'
  }

  if (loading) {
    return <PatientListSkeleton />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {(showForm || editingPatient) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>{editingPatient ? 'Edit Patient' : 'Add Patient'}</CardTitle>
              <CardDescription>Save patient details locally in IndexedDB for offline use.</CardDescription>
            </CardHeader>
            <CardContent>
              <PatientForm initialData={editingPatient ?? undefined} onSubmit={handleSavePatient} onCancel={closeForm} />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground">Manage patient records, risk levels, and consultation starts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void loadPatients()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowForm(true)} className="gap-2" disabled={saving}>
            <Plus className="h-4 w-4" />
            Add Patient
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="patient-search" className="text-sm font-medium">
          Search patients by name or phone
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="patient-search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, phone, or village"
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Patients', value: patientStats.total },
          { label: 'Low Risk', value: patientStats.low },
          { label: 'Medium Risk', value: patientStats.medium },
          { label: 'High Risk', value: patientStats.high },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-3xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <AlertTriangle className="h-10 w-10 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No patients yet</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Add a patient to start consultations and generate dashboard and report metrics.
            </p>
            <Button onClick={() => setShowForm(true)}>Add First Patient</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div>
                      <Link href={`/patients/${patient.id}`} className="text-xl font-semibold hover:underline">
                        {patient.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {patient.age} • {patient.gender}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {patient.village}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {patient.phone}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Medical Conditions</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.conditions.length > 0 ? patient.conditions.join(', ') : 'None'}
                      </p>
                    </div>

                    <Badge className={getRiskClasses(patient.riskLevel)}>
                      {patient.riskLevel.charAt(0).toUpperCase() + patient.riskLevel.slice(1)} Risk
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => setEditingPatient(patient)}>
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button className="gap-2" onClick={() => void handleStartConsultation(patient.id)}>
                      <Stethoscope className="h-4 w-4" />
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
                          <AlertDialogTitle>Delete patient record?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This removes {patient.name} and all linked consultations from the offline database.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex justify-end gap-2">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => void handleDeletePatient(patient)}>Delete</AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

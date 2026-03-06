"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getConsultations,
  getPatients,
  startConsultation,
  subscribeToDataChanges,
  type ConsultationRecord,
  type PatientRecord,
} from "@/lib/app-data"
import { toast } from "sonner"

export default function ConsultationsPage() {
  const router = useRouter()
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([])
  const [patients, setPatients] = useState<PatientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showStartForm, setShowStartForm] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState("")

  const loadData = async () => {
    setLoading(true)
    try {
      const [consultationRecords, patientRecords] = await Promise.all([getConsultations(), getPatients()])
      setConsultations(consultationRecords)
      setPatients(patientRecords)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    const unsubscribe = subscribeToDataChanges(() => {
      void loadData()
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const query = new URLSearchParams(window.location.search)
    if (query.get("action") === "new") {
      setShowStartForm(true)
      setSelectedPatientId(query.get("patientId") ?? "")
    }
  }, [])

  const handleStartConsultation = async () => {
    if (!selectedPatientId) return
    try {
      const consultation = await startConsultation(selectedPatientId)
      toast.success("Consultation started")
      router.push(`/consultation/${consultation.id}`)
    } catch (error) {
      toast.error("Unable to start consultation")
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Consultations</h1>
          <p className="text-muted-foreground">Track consultation records and start new visits without hardcoded routes.</p>
        </div>
        <Button onClick={() => setShowStartForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Start New Consultation
        </Button>
      </div>

      {showStartForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Start New Consultation</CardTitle>
            <CardDescription>Select a patient to open a live consultation record.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row">
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger className="md:max-w-sm">
                <SelectValue placeholder="Choose patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} • {patient.village}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowStartForm(false)}>
                Cancel
              </Button>
              <Button onClick={() => void handleStartConsultation()} disabled={!selectedPatientId}>
                Open Consultation
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Consultation List</CardTitle>
          <CardDescription>Patient Name, Date, Symptoms, and Diagnosis are stored in IndexedDB.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading consultations...</p>
          ) : consultations.length === 0 ? (
            <p className="text-muted-foreground">No consultations recorded</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="py-3 pr-4">Patient Name</th>
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">Symptoms</th>
                    <th className="py-3 pr-4">Diagnosis</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((consultation) => (
                    <tr key={consultation.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{consultation.patientName}</td>
                      <td className="py-3 pr-4">{new Date(consultation.date).toLocaleDateString("en-IN")}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{consultation.symptoms || "Pending"}</td>
                      <td className="py-3 pr-4">{consultation.diagnosis || "Pending"}</td>
                      <td className="py-3">
                        <Button variant="outline" onClick={() => router.push(`/consultation/${consultation.id}`)}>
                          Open
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

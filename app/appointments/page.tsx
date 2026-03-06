"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, X } from "lucide-react"

interface Appointment {
  id: string
  patientName: string
  date: string
  time: string
  reason: string
  status: "scheduled" | "completed" | "cancelled"
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      patientName: "Rajesh Kumar",
      date: "2025-10-28",
      time: "10:00 AM",
      reason: "Follow-up Checkup",
      status: "scheduled",
    },
    {
      id: "2",
      patientName: "Priya Sharma",
      date: "2025-10-29",
      time: "02:00 PM",
      reason: "Diabetes Management",
      status: "scheduled",
    },
    {
      id: "3",
      patientName: "Amit Patel",
      date: "2025-10-27",
      time: "11:00 AM",
      reason: "Vaccination",
      status: "completed",
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    patientName: "",
    date: "",
    time: "",
    reason: "",
  })

  const handleAddAppointment = () => {
    if (formData.patientName && formData.date && formData.time) {
      setAppointments([
        ...appointments,
        {
          id: String(appointments.length + 1),
          ...formData,
          status: "scheduled",
        },
      ])
      setFormData({ patientName: "", date: "", time: "", reason: "" })
      setShowForm(false)
    }
  }

  const handleCancelAppointment = (id: string) => {
    setAppointments(appointments.map((apt) => (apt.id === id ? { ...apt, status: "cancelled" } : apt)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background md:ml-0">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-8 h-8 text-primary" />
                Appointments
              </h1>
              <p className="text-muted-foreground mt-1">Schedule and manage patient appointments</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Schedule Appointment
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Schedule New Appointment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Patient Name</label>
                  <Input
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="Enter patient name"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Reason</label>
                  <Input
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="e.g., Follow-up Checkup"
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)} className="bg-transparent">
                  Cancel
                </Button>
                <Button onClick={handleAddAppointment}>Schedule</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-foreground">{appointment.patientName}</h3>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {appointment.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {appointment.time}
                      </div>
                      <div>{appointment.reason}</div>
                    </div>
                  </div>
                  {appointment.status === "scheduled" && (
                    <Button size="icon" variant="ghost" onClick={() => handleCancelAppointment(appointment.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

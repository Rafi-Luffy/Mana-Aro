"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, FileText, Eye } from "lucide-react"
import Link from "next/link"

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  phone: string
  village: string
  lastVisit: string
  status: "active" | "follow-up" | "stable"
  conditions: string[]
}

const mockPatients: Patient[] = [
  {
    id: "P001",
    name: "Lakshmi Devi",
    age: 45,
    gender: "Female",
    phone: "+91 98765 43210",
    village: "Tatikonda",
    lastVisit: "2025-10-20",
    status: "follow-up",
    conditions: ["Hypertension", "Diabetes"],
  },
  {
    id: "P002",
    name: "Rajesh Kumar",
    age: 38,
    gender: "Male",
    phone: "+91 98765 43211",
    village: "Tatikonda",
    lastVisit: "2025-10-18",
    status: "stable",
    conditions: ["Asthma"],
  },
  {
    id: "P003",
    name: "Priya Sharma",
    age: 28,
    gender: "Female",
    phone: "+91 98765 43212",
    village: "Tatikonda",
    lastVisit: "2025-10-15",
    status: "active",
    conditions: ["Pregnancy", "Anemia"],
  },
  {
    id: "P004",
    name: "Gopal Singh",
    age: 62,
    gender: "Male",
    phone: "+91 98765 43213",
    village: "Tatikonda",
    lastVisit: "2025-10-10",
    status: "follow-up",
    conditions: ["Heart Disease", "Hypertension"],
  },
  {
    id: "P005",
    name: "Anjali Verma",
    age: 35,
    gender: "Female",
    phone: "+91 98765 43214",
    village: "Tatikonda",
    lastVisit: "2025-10-22",
    status: "stable",
    conditions: ["Thyroid"],
  },
]

const statusColors = {
  active: "bg-green-100 text-green-800",
  "follow-up": "bg-yellow-100 text-yellow-800",
  stable: "bg-blue-100 text-blue-800",
}

export default function PatientList({ searchQuery }: { searchQuery: string }) {
  const filteredPatients = mockPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      {filteredPatients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No patients found matching your search</p>
          </CardContent>
        </Card>
      ) : (
        filteredPatients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {patient.id}</p>
                    </div>
                    <Badge className={statusColors[patient.status]}>
                      {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Age</p>
                      <p className="font-medium">{patient.age} years</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gender</p>
                      <p className="font-medium">{patient.gender}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Village</p>
                      <p className="font-medium">{patient.village}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Visit</p>
                      <p className="font-medium">{new Date(patient.lastVisit).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Conditions</p>
                    <div className="flex flex-wrap gap-2">
                      {patient.conditions.map((condition) => (
                        <Badge key={condition} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link href={`/patients/${patient.id}`}>
                      <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Record
                      </Button>
                    </Link>
                    <Link href={`/consultation/${patient.id}`}>
                      <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Start Consultation
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Print Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

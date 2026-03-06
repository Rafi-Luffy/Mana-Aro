'use client'

import React, { useState } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { PatientSearch } from '@/components/patient-search'
import { PatientCard } from '@/components/patient-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

// Mock patient data
const mockPatients = [
  {
    id: 'pat_001',
    name: 'Lakshmi',
    age: 45,
    gender: 'F' as const,
    riskLevel: 'high' as const,
    lastVisitDate: 'Yesterday',
    isSynced: true,
  },
  {
    id: 'pat_002',
    name: 'Ravi',
    age: 2,
    gender: 'M' as const,
    riskLevel: 'low' as const,
    lastVisitDate: '3 days ago',
    isSynced: true,
  },
  {
    id: 'pat_003',
    name: 'Priya',
    age: 28,
    gender: 'F' as const,
    riskLevel: 'medium' as const,
    lastVisitDate: '1 week ago',
    isSynced: false,
  },
  {
    id: 'pat_004',
    name: 'Arjun',
    age: 62,
    gender: 'M' as const,
    riskLevel: 'high' as const,
    lastVisitDate: '2 weeks ago',
    isSynced: true,
  },
]

export default function PatientsScreen() {
  const [filteredPatients, setFilteredPatients] = useState(mockPatients)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string, type: string) => {
    if (!query) {
      setFilteredPatients(mockPatients)
      setSearchQuery('')
      return
    }

    const lowerQuery = query.toLowerCase()
    const results =
      type === 'name'
        ? mockPatients.filter((p) => p.name.toLowerCase().includes(lowerQuery))
        : mockPatients // Add other search types as needed

    setFilteredPatients(results)
    setSearchQuery(query)
  }

  const handleVoiceSearch = (transcript: string) => {
    handleSearch(transcript, 'name')
  }

  return (
    <AuthGuard>
      <div className="pb-24">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Patients</h1>
              <p className="text-muted-foreground mt-1">
                {filteredPatients.length} registered patients
              </p>
            </div>
            <Link href="/patients?action=add">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Patient
              </Button>
            </Link>
          </div>

          {/* Search */}
          <PatientSearch onSearch={handleSearch} onVoiceSearch={handleVoiceSearch} />

          {/* Patient Grid */}
          {filteredPatients.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  id={patient.id}
                  name={patient.name}
                  age={patient.age}
                  gender={patient.gender}
                  riskLevel={patient.riskLevel}
                  lastVisitDate={patient.lastVisitDate}
                  isSynced={patient.isSynced}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? 'No patients found matching your search' : 'No patients registered yet'}
              </p>
              {!searchQuery && (
                <Link href="/patients?action=add">
                  <Button className="mt-4">Add First Patient</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}

export interface Patient {
  id: string
  name: string
  age: number
  phone: string
  village: string
  bloodGroup: string
  emergencyContact: string
  conditions: string[]
  lastVisit: string
  medicalHistory?: string
  allergies?: string[]
  medications?: string[]
}

export interface Visit {
  id: string
  patientId: string
  date: string
  symptoms: string
  diagnosis: string
  prescription: string
  notes: string
  doctorName?: string
}

export interface Consultation {
  id: string
  patientId: string
  doctorId: string
  type: "chat" | "video" | "audio"
  startTime: string
  endTime?: string
  messages: Array<{
    id: string
    sender: string
    content: string
    timestamp: string
    type: "text" | "image" | "audio"
  }>
  status: "active" | "completed" | "cancelled"
}

const STORAGE_KEYS = {
  PATIENTS: "mana_patients",
  VISITS: "mana_visits",
  CONSULTATIONS: "mana_consultations",
  SYNC_QUEUE: "mana_sync_queue",
  LAST_SYNC: "mana_last_sync",
}

// Patient Management
export const PatientManager = {
  async getAll(): Promise<Patient[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error loading patients:", error)
      return []
    }
  },

  async getById(id: string): Promise<Patient | null> {
    const patients = await this.getAll()
    return patients.find((p) => p.id === id) || null
  },

  async create(patient: Omit<Patient, "id">): Promise<Patient> {
    const patients = await this.getAll()
    const newPatient: Patient = {
      ...patient,
      id: `patient_${Date.now()}`,
    }
    patients.push(newPatient)
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients))
    return newPatient
  },

  async update(id: string, updates: Partial<Patient>): Promise<Patient | null> {
    const patients = await this.getAll()
    const index = patients.findIndex((p) => p.id === id)
    if (index === -1) return null

    patients[index] = { ...patients[index], ...updates }
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients))
    return patients[index]
  },

  async delete(id: string): Promise<boolean> {
    const patients = await this.getAll()
    const filtered = patients.filter((p) => p.id !== id)
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(filtered))
    return filtered.length < patients.length
  },

  async search(query: string): Promise<Patient[]> {
    const patients = await this.getAll()
    const q = query.toLowerCase()
    return patients.filter(
      (p) => p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.village.toLowerCase().includes(q),
    )
  },

  async exportCSV(): Promise<string> {
    const patients = await this.getAll()
    const headers = ["ID", "Name", "Age", "Phone", "Village", "Blood Group", "Conditions", "Last Visit"]
    const rows = patients.map((p) => [
      p.id,
      p.name,
      p.age,
      p.phone,
      p.village,
      p.bloodGroup,
      p.conditions.join("; "),
      p.lastVisit,
    ])

    return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
  },
}

// Visit Management
export const VisitManager = {
  async getByPatient(patientId: string): Promise<Visit[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VISITS)
      const visits = data ? JSON.parse(data) : []
      return visits.filter((v: Visit) => v.patientId === patientId)
    } catch (error) {
      console.error("Error loading visits:", error)
      return []
    }
  },

  async create(visit: Omit<Visit, "id">): Promise<Visit> {
    const visits = localStorage.getItem(STORAGE_KEYS.VISITS)
    const allVisits = visits ? JSON.parse(visits) : []
    const newVisit: Visit = {
      ...visit,
      id: `visit_${Date.now()}`,
    }
    allVisits.push(newVisit)
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(allVisits))
    return newVisit
  },

  async delete(id: string): Promise<boolean> {
    const visits = localStorage.getItem(STORAGE_KEYS.VISITS)
    const allVisits = visits ? JSON.parse(visits) : []
    const filtered = allVisits.filter((v: Visit) => v.id !== id)
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(filtered))
    return filtered.length < allVisits.length
  },
}

// Consultation Management
export const ConsultationManager = {
  async getByPatient(patientId: string): Promise<Consultation[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONSULTATIONS)
      const consultations = data ? JSON.parse(data) : []
      return consultations.filter((c: Consultation) => c.patientId === patientId)
    } catch (error) {
      console.error("Error loading consultations:", error)
      return []
    }
  },

  async create(consultation: Omit<Consultation, "id">): Promise<Consultation> {
    const consultations = localStorage.getItem(STORAGE_KEYS.CONSULTATIONS)
    const allConsultations = consultations ? JSON.parse(consultations) : []
    const newConsultation: Consultation = {
      ...consultation,
      id: `consultation_${Date.now()}`,
    }
    allConsultations.push(newConsultation)
    localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify(allConsultations))
    return newConsultation
  },

  async addMessage(consultationId: string, message: Consultation["messages"][0]): Promise<Consultation | null> {
    const consultations = localStorage.getItem(STORAGE_KEYS.CONSULTATIONS)
    const allConsultations = consultations ? JSON.parse(consultations) : []
    const consultation = allConsultations.find((c: Consultation) => c.id === consultationId)

    if (!consultation) return null

    consultation.messages.push(message)
    localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify(allConsultations))
    return consultation
  },
}

// Sync Management
export const SyncManager = {
  async addToQueue(action: string, data: any): Promise<void> {
    const queue = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE)
    const syncQueue = queue ? JSON.parse(queue) : []
    syncQueue.push({
      id: `sync_${Date.now()}`,
      action,
      data,
      timestamp: new Date().toISOString(),
      retries: 0,
    })
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(syncQueue))
  },

  async getQueue(): Promise<any[]> {
    const queue = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE)
    return queue ? JSON.parse(queue) : []
  },

  async clearQueue(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE)
  },

  async getLastSync(): Promise<string | null> {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC)
  },

  async setLastSync(): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString())
  },
}

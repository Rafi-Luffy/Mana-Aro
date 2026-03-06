import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { v4 as uuidv4 } from "uuid"

interface Patient {
  id: string
  name: string
  age: number
  phone: string
  village: string
  medicalHistory: string[]
  createdAt: string
}

interface Visit {
  id: string
  patientId: string
  patientName: string
  date: string
  symptoms: string
  diagnosis: string
  prescription: string
  notes: string
}

interface DataStore {
  patients: Patient[]
  visits: Visit[]
  addPatient: (patient: Omit<Patient, "id" | "createdAt">) => Promise<void>
  addVisit: (visit: Omit<Visit, "id">) => Promise<void>
  getPatient: (id: string) => Patient | undefined
  getPatientVisits: (patientId: string) => Visit[]
  getStats: () => Promise<any>
  loadData: () => Promise<void>
}

export const useDataStore = create<DataStore>((set, get) => ({
  patients: [],
  visits: [],

  addPatient: async (patient) => {
    const newPatient: Patient = {
      ...patient,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    }

    const { patients } = get()
    const updated = [...patients, newPatient]
    set({ patients: updated })

    try {
      await AsyncStorage.setItem("patients", JSON.stringify(updated))
    } catch (error) {
      console.error("Failed to save patient:", error)
    }
  },

  addVisit: async (visit) => {
    const newVisit: Visit = {
      ...visit,
      id: uuidv4(),
    }

    const { visits } = get()
    const updated = [...visits, newVisit]
    set({ visits: updated })

    try {
      await AsyncStorage.setItem("visits", JSON.stringify(updated))
    } catch (error) {
      console.error("Failed to save visit:", error)
    }
  },

  getPatient: (id) => {
    const { patients } = get()
    return patients.find((p) => p.id === id)
  },

  getPatientVisits: (patientId) => {
    const { visits } = get()
    return visits.filter((v) => v.patientId === patientId)
  },

  getStats: async () => {
    const { patients, visits } = get()
    return {
      totalPatients: patients.length,
      totalVisits: visits.length,
      medicinesUsed: Math.floor(Math.random() * 50),
      avgVisitTime: Math.floor(Math.random() * 30) + 10,
    }
  },

  loadData: async () => {
    try {
      const [patientsData, visitsData] = await Promise.all([
        AsyncStorage.getItem("patients"),
        AsyncStorage.getItem("visits"),
      ])

      if (patientsData) {
        set({ patients: JSON.parse(patientsData) })
      }
      if (visitsData) {
        set({ visits: JSON.parse(visitsData) })
      }
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  },
}))

"use client"

import { getDB } from "@/lib/db"

export type RiskLevel = "low" | "medium" | "high"
export type SyncState = "idle" | "syncing" | "offline"

export interface PatientRecord {
  id: string
  name: string
  age: number
  gender: "Male" | "Female" | "Other"
  phone: string
  village: string
  riskLevel: RiskLevel
  conditions: string[]
  createdAt: string
  updatedAt: string
}

export interface AnalysisResult {
  symptoms: string[]
  possibleConditions: string[]
  medicineSuggestions: string[]
  advice: string
  severity: "mild" | "moderate" | "severe"
}

export interface ConsultationRecord {
  id: string
  patientId: string
  patientName: string
  date: string
  symptoms: string
  diagnosis: string
  notes: string
  riskLevel: RiskLevel
  status: "draft" | "completed"
  durationMinutes: number
  aiAnalysis: AnalysisResult | null
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  id: "app-settings"
  clinicName: string
  workerName: string
  notificationsEnabled: boolean
  language: "english" | "telugu" | "hindi"
  autoSync: boolean
  updatedAt: string
}

export interface SyncQueueRecord {
  id: string
  entity: "patient" | "consultation" | "settings"
  action: "create" | "update" | "delete"
  recordId: string
  payload: unknown
  createdAt: string
}

export interface SyncSnapshot {
  syncState: SyncState
  pendingItems: number
  lastSyncTime: string | null
  isOnline: boolean
  isOfflineMode: boolean
}

export interface DashboardSummary {
  totalPatients: number
  visitsToday: number
  highRiskPatients: number
  avgConsultationTime: number
  recentPatients: PatientRecord[]
  weeklyVisits: Array<{ label: string; visits: number }>
  riskDistribution: Array<{ name: string; value: number; color: string }>
}

export interface ReportsSummary {
  totalPatients: number
  totalVisits: number
  highRiskPatients: number
  monthlyVisits: number
  weeklyTrend: Array<{ label: string; visits: number }>
  riskDistribution: Array<{ name: string; value: number; color: string }>
}

const SETTINGS_ID = "app-settings"
const OFFLINE_MODE_KEY = "mana-offline-mode"
const DATA_EVENT = "mana-data-updated"
const SYNC_EVENT = "mana-sync-updated"

const syncListeners = new Set<(snapshot: SyncSnapshot) => void>()
let initializationPromise: Promise<void> | null = null
let connectivityListenersInitialized = false
let syncSnapshot: SyncSnapshot = {
  syncState: "idle",
  pendingItems: 0,
  lastSyncTime: null,
  isOnline: true,
  isOfflineMode: false,
}

const demoPatients: Array<Omit<PatientRecord, "id" | "createdAt" | "updatedAt">> = [
  {
    name: "Ramesh Kumar",
    age: 65,
    gender: "Male",
    phone: "9876543210",
    village: "Tati",
    riskLevel: "medium",
    conditions: ["Hypertension"],
  },
  {
    name: "Lakshmi Devi",
    age: 58,
    gender: "Female",
    phone: "9123456780",
    village: "Narasaraopet",
    riskLevel: "high",
    conditions: ["Diabetes"],
  },
  {
    name: "Suresh Babu",
    age: 45,
    gender: "Male",
    phone: "9988776655",
    village: "Tati",
    riskLevel: "low",
    conditions: [],
  },
  {
    name: "Anitha Reddy",
    age: 32,
    gender: "Female",
    phone: "9012345678",
    village: "Sattenapalli",
    riskLevel: "low",
    conditions: ["Anemia"],
  },
  {
    name: "Rajesh Naidu",
    age: 50,
    gender: "Male",
    phone: "9090909090",
    village: "Tati",
    riskLevel: "medium",
    conditions: ["BP"],
  },
]

const DEFAULT_SETTINGS: AppSettings = {
  id: SETTINGS_ID,
  clinicName: "Mana Aarogyam Rural Clinic",
  workerName: "ASHA Worker",
  notificationsEnabled: true,
  language: "english",
  autoSync: true,
  updatedAt: new Date().toISOString(),
}

const PLACEHOLDER_PATIENT_NAMES = new Set(["asdasd", "test", "demo", "sample"])

function isValidIndianPhone(phone: string) {
  return /^[6-9]\d{9}$/.test(phone.trim())
}

function isPlaceholderPatientRecord(patient: PatientRecord) {
  const normalizedName = patient.name.trim().toLowerCase()
  const hasPlaceholderCondition = patient.conditions.some((condition) =>
    ["dia", "test", "none"].includes(condition.trim().toLowerCase()),
  )

  return (
    PLACEHOLDER_PATIENT_NAMES.has(normalizedName) ||
    patient.age < 1 ||
    patient.age > 120 ||
    !isValidIndianPhone(patient.phone) ||
    !patient.village.trim() ||
    hasPlaceholderCondition
  )
}

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getOfflinePreference() {
  if (typeof window === "undefined") return false
  return window.localStorage.getItem(OFFLINE_MODE_KEY) === "true"
}

function getEffectiveOfflineState() {
  const simulatedOffline = getOfflinePreference()
  const isOnline = typeof navigator === "undefined" ? true : navigator.onLine

  return {
    isOfflineMode: simulatedOffline,
    isOnline: isOnline && !simulatedOffline,
  }
}

function updateSyncSnapshot(partial: Partial<SyncSnapshot>) {
  syncSnapshot = { ...syncSnapshot, ...partial }
  syncListeners.forEach((listener) => listener({ ...syncSnapshot }))

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { ...syncSnapshot } }))
  }
}

function emitDataUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(DATA_EVENT))
  }
}

async function queueSync(
  entity: SyncQueueRecord["entity"],
  action: SyncQueueRecord["action"],
  recordId: string,
  payload: unknown,
) {
  const db = await getDB()
  const syncItem: SyncQueueRecord = {
    id: generateId("sync"),
    entity,
    action,
    recordId,
    payload,
    createdAt: new Date().toISOString(),
  }

  await db.put("syncQueue", syncItem)
  await refreshSyncSnapshot()
}

export async function initializeAppData() {
  if (initializationPromise) {
    await initializationPromise
    return
  }

  initializationPromise = (async () => {
    const db = await getDB()

    await migrateLegacyLocalStorage()

    const settings = await db.get<AppSettings>("settings", SETTINGS_ID)
    if (!settings) {
      await db.put("settings", DEFAULT_SETTINGS)
    }

    const existingPatients = await db.getAll<PatientRecord>("patients")
    for (const patient of existingPatients) {
      if (isPlaceholderPatientRecord(patient)) {
        await db.delete("patients", patient.id)
      }
    }

    const patientCount = await db.count("patients")
    if (patientCount === 0) {
      await seedDemoPatients(db)
    }

    const consultationCount = await db.count("consultations")
    if (consultationCount === 0) {
      const patients = await db.getAll<PatientRecord>("patients")
      const seededConsultations = patients.slice(0, 5).map((patient, index) => {
        const createdAt = new Date(Date.now() - index * 86400000).toISOString()
        const symptomsByIndex = [
          "Fever and headache for 2 days",
          "Fatigue and excessive thirst",
          "Routine blood pressure follow-up",
          "Cough with mild fever",
          "Low energy and dizziness",
        ]
        const analysis = analyzeSymptomsLocally(symptomsByIndex[index] || "General checkup")

        return {
          id: generateId("consultation"),
          patientId: patient.id,
          patientName: patient.name,
          date: createdAt,
          symptoms: symptomsByIndex[index] || "Routine checkup",
          diagnosis: analysis.possibleConditions[0] || "General Review",
          notes: analysis.advice,
          riskLevel: patient.riskLevel,
          status: "completed",
          durationMinutes: 12 + index * 3,
          aiAnalysis: analysis,
          createdAt,
          updatedAt: createdAt,
        } satisfies ConsultationRecord
      })

      for (const consultation of seededConsultations) {
        await db.put("consultations", consultation)
      }
    }

    const effectiveState = getEffectiveOfflineState()
    updateSyncSnapshot({
      isOnline: effectiveState.isOnline,
      isOfflineMode: effectiveState.isOfflineMode,
      syncState: effectiveState.isOnline ? "idle" : "offline",
    })
    await refreshSyncSnapshot()
  })()

  await initializationPromise
}

async function seedDemoPatients(db: Awaited<ReturnType<typeof getDB>>) {
  const seededPatients = demoPatients.map((patient, index) => {
    const createdAt = new Date(Date.now() - (5 - index) * 86400000).toISOString()
    return {
      ...patient,
      id: generateId("patient"),
      createdAt,
      updatedAt: createdAt,
    } satisfies PatientRecord
  })

  for (const patient of seededPatients) {
    await db.put("patients", patient)
  }
}

async function migrateLegacyLocalStorage() {
  if (typeof window === "undefined") return

  const db = await getDB()
  const patientsCount = await db.count("patients")
  const consultationsCount = await db.count("consultations")

  if (patientsCount === 0) {
    const rawPatients = window.localStorage.getItem("mana_patients")
    if (rawPatients) {
      const legacyPatients = JSON.parse(rawPatients) as Array<Record<string, unknown>>
      for (const legacyPatient of legacyPatients) {
        const patient = normalizePatient(legacyPatient)
        await db.put("patients", patient)
      }
    }
  }

  if (consultationsCount === 0) {
    const rawConsultations = window.localStorage.getItem("mana_consultations")
    if (rawConsultations) {
      const legacyConsultations = JSON.parse(rawConsultations) as Array<Record<string, unknown>>
      for (const legacyConsultation of legacyConsultations) {
        const consultation = normalizeConsultation(legacyConsultation)
        await db.put("consultations", consultation)
      }
    }

    const rawVisits = window.localStorage.getItem("mana_visits")
    if (rawVisits) {
      const legacyVisits = JSON.parse(rawVisits) as Array<Record<string, unknown>>
      for (const legacyVisit of legacyVisits) {
        const consultation = normalizeConsultation(legacyVisit)
        await db.put("consultations", consultation)
      }
    }
  }
}

function normalizePatient(raw: Record<string, unknown>): PatientRecord {
  const now = new Date().toISOString()
  const genderRaw = String(raw.gender ?? "Other")
  const normalizedGender =
    genderRaw.toLowerCase() === "male" || genderRaw === "M"
      ? "Male"
      : genderRaw.toLowerCase() === "female" || genderRaw === "F"
        ? "Female"
        : "Other"

  const rawConditions = Array.isArray(raw.conditions)
    ? raw.conditions.map(String)
    : Array.isArray(raw.chronicConditions)
      ? (raw.chronicConditions as unknown[]).map(String)
      : typeof raw.conditions === "string"
        ? raw.conditions.split(",").map((item) => item.trim()).filter(Boolean)
        : []

  const filteredConditions = rawConditions.filter(
    (condition) => !["dia", "test", "placeholder"].includes(condition.trim().toLowerCase()),
  )

  const parsedAge = Number(raw.age ?? 0)
  const safeAge = Number.isFinite(parsedAge) && parsedAge >= 1 && parsedAge <= 120 ? parsedAge : 45

  return {
    id: String(raw.id ?? generateId("patient")),
    name: String(raw.name ?? "Unknown Patient"),
    age: safeAge,
    gender: normalizedGender,
    phone: isValidIndianPhone(String(raw.phone ?? "")) ? String(raw.phone) : "9000000000",
    village: String(raw.village ?? raw.address ?? "Unknown"),
    riskLevel: normalizeRiskLevel(raw.riskLevel),
    conditions: filteredConditions,
    createdAt: String(raw.createdAt ?? now),
    updatedAt: String(raw.updatedAt ?? raw.createdAt ?? now),
  }
}

function normalizeConsultation(raw: Record<string, unknown>): ConsultationRecord {
  const createdAt = String(raw.createdAt ?? raw.date ?? raw.startTime ?? new Date().toISOString())
  const symptoms =
    typeof raw.symptoms === "string"
      ? raw.symptoms
      : Array.isArray(raw.symptoms)
        ? raw.symptoms.map((item) => String(item)).join(", ")
        : typeof raw.content === "string"
          ? raw.content
          : "General follow-up"

  const diagnosis = String(raw.diagnosis ?? raw.title ?? "Pending review")
  const analysis = raw.aiAnalysis && typeof raw.aiAnalysis === "object"
    ? (raw.aiAnalysis as AnalysisResult)
    : analyzeSymptomsLocally(symptoms)

  return {
    id: String(raw.id ?? generateId("consultation")),
    patientId: String(raw.patientId ?? raw.recordId ?? ""),
    patientName: String(raw.patientName ?? raw.patient ?? "Unknown Patient"),
    date: String(raw.date ?? raw.startTime ?? createdAt),
    symptoms,
    diagnosis,
    notes: String(raw.notes ?? raw.observations ?? analysis.advice),
    riskLevel: normalizeRiskLevel(raw.riskLevel ?? analysis.severity),
    status: raw.status === "completed" ? "completed" : "draft",
    durationMinutes: Number(raw.durationMinutes ?? 15),
    aiAnalysis: analysis,
    createdAt,
    updatedAt: String(raw.updatedAt ?? createdAt),
  }
}

function normalizeRiskLevel(value: unknown): RiskLevel {
  const normalized = String(value ?? "low").toLowerCase()
  if (normalized.includes("high") || normalized.includes("severe")) return "high"
  if (normalized.includes("medium") || normalized.includes("moderate")) return "medium"
  return "low"
}

export async function getPatients() {
  await initializeAppData()
  const db = await getDB()
  const patients = await db.getAll<PatientRecord>("patients")
  return patients.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getPatientById(id: string) {
  await initializeAppData()
  const db = await getDB()
  return (await db.get<PatientRecord>("patients", id)) ?? null
}

export async function savePatient(input: Omit<PatientRecord, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
  await initializeAppData()
  const db = await getDB()
  const existing = input.id ? await db.get<PatientRecord>("patients", input.id) : null
  const now = new Date().toISOString()

  const patient: PatientRecord = {
    id: input.id ?? generateId("patient"),
    name: input.name.trim(),
    age: input.age,
    gender: input.gender,
    phone: input.phone,
    village: input.village.trim(),
    riskLevel: input.riskLevel,
    conditions: input.conditions,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  await db.put("patients", patient)
  await queueSync("patient", existing ? "update" : "create", patient.id, patient)
  emitDataUpdated()
  void processSyncQueue()
  return patient
}

export async function deletePatientById(id: string) {
  await initializeAppData()
  const db = await getDB()
  const consultations = await getConsultationsByPatient(id)

  await db.delete("patients", id)
  for (const consultation of consultations) {
    await db.delete("consultations", consultation.id)
  }

  await queueSync("patient", "delete", id, { id })
  emitDataUpdated()
  void processSyncQueue()
}

export async function getConsultations() {
  await initializeAppData()
  const db = await getDB()
  const consultations = await db.getAll<ConsultationRecord>("consultations")
  return consultations.sort((a, b) => b.date.localeCompare(a.date))
}

export async function getConsultationById(id: string) {
  await initializeAppData()
  const db = await getDB()
  return (await db.get<ConsultationRecord>("consultations", id)) ?? null
}

export async function getConsultationsByPatient(patientId: string) {
  await initializeAppData()
  const db = await getDB()
  const consultations = await db.queryByIndex<ConsultationRecord>("consultations", "patientId", patientId)
  return consultations.sort((a, b) => b.date.localeCompare(a.date))
}

export async function startConsultation(patientId: string) {
  const patient = await getPatientById(patientId)
  if (!patient) {
    throw new Error("Patient not found")
  }

  return saveConsultation({
    patientId: patient.id,
    patientName: patient.name,
    date: new Date().toISOString(),
    symptoms: "",
    diagnosis: "",
    notes: "",
    riskLevel: patient.riskLevel,
    status: "draft",
    durationMinutes: 0,
    aiAnalysis: null,
  })
}

export async function saveConsultation(
  input: Omit<ConsultationRecord, "id" | "createdAt" | "updatedAt"> & { id?: string },
) {
  await initializeAppData()
  const db = await getDB()
  const existing = input.id ? await db.get<ConsultationRecord>("consultations", input.id) : null
  const now = new Date().toISOString()

  const consultation: ConsultationRecord = {
    id: input.id ?? generateId("consultation"),
    patientId: input.patientId,
    patientName: input.patientName,
    date: input.date,
    symptoms: input.symptoms,
    diagnosis: input.diagnosis,
    notes: input.notes,
    riskLevel: input.riskLevel,
    status: input.status,
    durationMinutes: input.durationMinutes,
    aiAnalysis: input.aiAnalysis,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  await db.put("consultations", consultation)
  await queueSync("consultation", existing ? "update" : "create", consultation.id, consultation)
  emitDataUpdated()
  void processSyncQueue()
  return consultation
}

export async function deleteConsultationById(id: string) {
  await initializeAppData()
  const db = await getDB()
  await db.delete("consultations", id)
  await queueSync("consultation", "delete", id, { id })
  emitDataUpdated()
  void processSyncQueue()
}

export async function getSettings() {
  await initializeAppData()
  const db = await getDB()
  return (await db.get<AppSettings>("settings", SETTINGS_ID)) ?? DEFAULT_SETTINGS
}

export async function saveSettings(settings: Partial<AppSettings>) {
  await initializeAppData()
  const db = await getDB()
  const current = await getSettings()
  const nextSettings: AppSettings = {
    ...current,
    ...settings,
    id: SETTINGS_ID,
    updatedAt: new Date().toISOString(),
  }

  await db.put("settings", nextSettings)
  await queueSync("settings", "update", SETTINGS_ID, nextSettings)
  emitDataUpdated()
  void processSyncQueue()
  return nextSettings
}

export async function saveAnalysisRecord(analysis: AnalysisResult & { sourceText: string }) {
  await initializeAppData()
  const db = await getDB()
  await db.put("aiAnalysis", {
    id: generateId("analysis"),
    ...analysis,
    createdAt: new Date().toISOString(),
  })
  emitDataUpdated()
}

export async function getStorageSummary() {
  await initializeAppData()
  const db = await getDB()
  const [patients, consultations, syncQueue] = await Promise.all([
    db.count("patients"),
    db.count("consultations"),
    db.count("syncQueue"),
  ])

  return {
    patients,
    consultations,
    pendingSyncs: syncQueue,
  }
}

export function analyzeSymptomsLocally(symptomText: string): AnalysisResult {
  const lower = symptomText.toLowerCase()
  const symptoms = Array.from(
    new Set(
      ["fever", "headache", "cough", "fatigue", "thirst", "dizziness", "body pain", "bp", "cold"]
        .filter((item) => lower.includes(item)),
    ),
  )

  const conditions: string[] = []
  const medicineSuggestions: string[] = []
  let advice = "Encourage hydration and review symptoms again within 24 hours."
  let severity: AnalysisResult["severity"] = "mild"

  if (lower.includes("chest pain") || lower.includes("breathlessness")) {
    conditions.push("Urgent Cardio-Respiratory Review")
    medicineSuggestions.push("Immediate referral - no self-medication")
    advice = "Refer to the nearest hospital immediately and monitor vitals."
    severity = "severe"
  }

  if (lower.includes("fever") && lower.includes("headache")) {
    conditions.push("Viral Fever")
    medicineSuggestions.push("Paracetamol 500mg after food")
    advice = "Ensure fluids, rest, and temperature monitoring for 48 hours."
    severity = severity === "severe" ? "severe" : "moderate"
  }

  if (lower.includes("cough") && lower.includes("fever")) {
    conditions.push("Common Cold")
    medicineSuggestions.push("Cetirizine at night")
    medicineSuggestions.push("Warm saline gargles")
    advice = "Review if cough persists beyond 3 days or breathing worsens."
  }

  if (lower.includes("fatigue") && lower.includes("thirst")) {
    conditions.push("Diabetes Risk")
    medicineSuggestions.push("Check fasting blood sugar")
    advice = "Schedule sugar screening and provide dietary counselling."
    severity = severity === "mild" ? "moderate" : severity
  }

  if (lower.includes("dizziness") || lower.includes("low energy")) {
    conditions.push("Anemia Review")
    medicineSuggestions.push("Iron and folic acid tablets")
    advice = "Check hemoglobin at next camp and increase iron-rich foods."
  }

  if (lower.includes("bp") || lower.includes("pressure")) {
    conditions.push("Blood Pressure Follow-up")
    medicineSuggestions.push("Continue regular BP medication")
    advice = "Record BP readings for the next 3 visits."
  }

  if (conditions.length === 0) {
    conditions.push("General Clinical Review")
    medicineSuggestions.push("ORS and rest as needed")
  }

  return {
    symptoms: symptoms.length > 0 ? symptoms : symptomText.split(/[,.]/).map((item) => item.trim()).filter(Boolean),
    possibleConditions: Array.from(new Set(conditions)),
    medicineSuggestions: Array.from(new Set(medicineSuggestions)),
    advice,
    severity,
  }
}

export async function buildDashboardSummary(): Promise<DashboardSummary> {
  const [patients, consultations] = await Promise.all([getPatients(), getConsultations()])
  const todayKey = formatDayKey(new Date())
  const completedConsultations = consultations.filter((item) => item.status === "completed")
  const avgConsultationTime =
    completedConsultations.length > 0
      ? Math.round(
          completedConsultations.reduce((sum, item) => sum + (item.durationMinutes || 0), 0) /
            completedConsultations.length,
        )
      : 0

  return {
    totalPatients: patients.length,
    visitsToday: consultations.filter((item) => formatDayKey(new Date(item.date)) === todayKey).length,
    highRiskPatients: patients.filter((patient) => patient.riskLevel === "high").length,
    avgConsultationTime,
    recentPatients: patients.slice(0, 5),
    weeklyVisits: buildWeeklyTrend(consultations),
    riskDistribution: buildRiskDistribution(patients),
  }
}

export async function buildReportsSummary(): Promise<ReportsSummary> {
  const [patients, consultations] = await Promise.all([getPatients(), getConsultations()])
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  return {
    totalPatients: patients.length,
    totalVisits: consultations.length,
    highRiskPatients: patients.filter((patient) => patient.riskLevel === "high").length,
    monthlyVisits: consultations.filter((item) => new Date(item.date) >= monthStart).length,
    weeklyTrend: buildWeeklyTrend(consultations),
    riskDistribution: buildRiskDistribution(patients),
  }
}

function buildWeeklyTrend(consultations: ConsultationRecord[]) {
  const data = new Map<string, number>()
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - offset)
    data.set(formatDayKey(date), 0)
  }

  consultations.forEach((consultation) => {
    const key = formatDayKey(new Date(consultation.date))
    if (data.has(key)) {
      data.set(key, (data.get(key) ?? 0) + 1)
    }
  })

  return Array.from(data.entries()).map(([key, visits]) => ({
    label: new Date(key).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
    visits,
  }))
}

function buildRiskDistribution(patients: PatientRecord[]) {
  const counts = {
    low: patients.filter((patient) => patient.riskLevel === "low").length,
    medium: patients.filter((patient) => patient.riskLevel === "medium").length,
    high: patients.filter((patient) => patient.riskLevel === "high").length,
  }

  return [
    { name: "Low Risk", value: counts.low, color: "#22c55e" },
    { name: "Medium Risk", value: counts.medium, color: "#f59e0b" },
    { name: "High Risk", value: counts.high, color: "#ef4444" },
  ]
}

function formatDayKey(date: Date) {
  const cloned = new Date(date)
  cloned.setHours(0, 0, 0, 0)
  return cloned.toISOString().split("T")[0]
}

export async function refreshSyncSnapshot() {
  await initializeAppData()
  const db = await getDB()
  const queue = await db.getAll<SyncQueueRecord>("syncQueue")
  const effectiveState = getEffectiveOfflineState()

  updateSyncSnapshot({
    pendingItems: queue.length,
    isOnline: effectiveState.isOnline,
    isOfflineMode: effectiveState.isOfflineMode,
    syncState: effectiveState.isOnline ? syncSnapshot.syncState === "syncing" ? "syncing" : "idle" : "offline",
  })

  return { ...syncSnapshot }
}

export async function processSyncQueue() {
  await initializeAppData()
  const effectiveState = getEffectiveOfflineState()
  if (!effectiveState.isOnline) {
    await refreshSyncSnapshot()
    return { ...syncSnapshot }
  }

  const db = await getDB()
  const queue = await db.getAll<SyncQueueRecord>("syncQueue")
  if (queue.length === 0) {
    updateSyncSnapshot({
      syncState: "idle",
      pendingItems: 0,
      isOnline: true,
      isOfflineMode: false,
    })
    return { ...syncSnapshot }
  }

  updateSyncSnapshot({ syncState: "syncing", pendingItems: queue.length, isOnline: true, isOfflineMode: false })
  await new Promise((resolve) => setTimeout(resolve, 400))

  for (const item of queue) {
    await db.delete("syncQueue", item.id)
  }

  updateSyncSnapshot({
    syncState: "idle",
    pendingItems: 0,
    lastSyncTime: new Date().toISOString(),
    isOnline: true,
    isOfflineMode: false,
  })

  return { ...syncSnapshot }
}

export function subscribeToSyncStatus(listener: (snapshot: SyncSnapshot) => void) {
  syncListeners.add(listener)
  listener({ ...syncSnapshot })
  return () => syncListeners.delete(listener)
}

export function getCurrentSyncStatus() {
  return { ...syncSnapshot }
}

export function subscribeToDataChanges(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined
  }

  const handler = () => listener()
  window.addEventListener(DATA_EVENT, handler)
  return () => window.removeEventListener(DATA_EVENT, handler)
}

export async function setOfflineMode(enabled: boolean) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(OFFLINE_MODE_KEY, String(enabled))
  }

  const effectiveState = getEffectiveOfflineState()
  updateSyncSnapshot({
    isOfflineMode: effectiveState.isOfflineMode,
    isOnline: effectiveState.isOnline,
    syncState: effectiveState.isOnline ? "idle" : "offline",
  })

  if (!enabled) {
    await processSyncQueue()
  } else {
    await refreshSyncSnapshot()
  }
}

export async function toggleOfflineMode() {
  await setOfflineMode(!getOfflinePreference())
}

export async function initializeConnectivityListeners() {
  await initializeAppData()
  if (typeof window === "undefined" || connectivityListenersInitialized) return

  const handleStatusChange = async () => {
    await refreshSyncSnapshot()
    if (!getOfflinePreference() && navigator.onLine) {
      await processSyncQueue()
    }
  }

  window.addEventListener("online", handleStatusChange)
  window.addEventListener("offline", handleStatusChange)
  connectivityListenersInitialized = true
}

export function buildPatientsCsv(patients: PatientRecord[]) {
  const rows = [
    ["Name", "Age", "Gender", "Village", "Phone", "Risk Level", "Medical Conditions"],
    ...patients.map((patient) => [
      patient.name,
      String(patient.age),
      patient.gender,
      patient.village,
      patient.phone,
      patient.riskLevel,
      patient.conditions.join("; "),
    ]),
  ]

  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n")
}

export function buildConsultationsCsv(consultations: ConsultationRecord[]) {
  const rows = [
    ["Patient Name", "Date", "Symptoms", "Diagnosis", "Risk Level", "Status"],
    ...consultations.map((consultation) => [
      consultation.patientName,
      consultation.date,
      consultation.symptoms,
      consultation.diagnosis,
      consultation.riskLevel,
      consultation.status,
    ]),
  ]

  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n")
}

function escapeCsv(value: string) {
  const safeValue = value.split('"').join('""')
  return `"${safeValue}"`
}

export function downloadTextFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

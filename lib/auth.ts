export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "doctor" | "asha_worker" | "clinic_staff"
  clinic: string
  phone: string
  verified: boolean
  createdAt: string
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: string
}

const STORAGE_KEY = "mana_auth_session"
const USERS_KEY = "mana_users"

// Initialize default users for demo
const DEFAULT_USERS = [
  {
    id: "user_1",
    email: "admin@manahealth.com",
    password: "admin123", // In production, use hashed passwords
    name: "Admin User",
    role: "admin" as const,
    clinic: "Tatikonda Primary Health Center",
    phone: "9876543200",
    verified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "user_2",
    email: "doctor@manahealth.com",
    password: "doctor123",
    name: "Dr. Ramesh",
    role: "doctor" as const,
    clinic: "Tatikonda Primary Health Center",
    phone: "9876543201",
    verified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "user_3",
    email: "asha@manahealth.com",
    password: "asha123",
    name: "Lakshmi (ASHA Worker)",
    role: "asha_worker" as const,
    clinic: "Tatikonda Primary Health Center",
    phone: "9876543202",
    verified: true,
    createdAt: new Date().toISOString(),
  },
]

export const AuthManager = {
  async initializeUsers(): Promise<void> {
    const existing = localStorage.getItem(USERS_KEY)
    if (!existing) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS))
    }
  },

  async login(email: string, password: string): Promise<AuthSession> {
    await this.initializeUsers()
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]")
    const user = users.find((u: any) => u.email === email && u.password === password)

    if (!user) {
      throw new Error("Invalid email or password")
    }

    const session: AuthSession = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clinic: user.clinic,
        phone: user.phone,
        verified: user.verified,
        createdAt: user.createdAt,
      },
      token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    return session
  },

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY)
  },

  async getSession(): Promise<AuthSession | null> {
    const session = localStorage.getItem(STORAGE_KEY)
    if (!session) return null

    const parsed = JSON.parse(session)
    if (new Date(parsed.expiresAt) < new Date()) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return parsed
  },

  async register(data: {
    email: string
    password: string
    name: string
    role: User["role"]
    clinic: string
    phone: string
  }): Promise<User> {
    await this.initializeUsers()
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]")

    if (users.some((u: any) => u.email === data.email)) {
      throw new Error("Email already registered")
    }

    const newUser = {
      id: `user_${Date.now()}`,
      ...data,
      verified: false,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      clinic: newUser.clinic,
      phone: newUser.phone,
      verified: newUser.verified,
      createdAt: newUser.createdAt,
    }
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]")
    const userIndex = users.findIndex((u: any) => u.id === userId)

    if (userIndex === -1) {
      throw new Error("User not found")
    }

    users[userIndex] = { ...users[userIndex], ...updates }
    localStorage.setItem(USERS_KEY, JSON.stringify(users))

    return users[userIndex]
  },

  async getAllUsers(): Promise<User[]> {
    await this.initializeUsers()
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]")
    return users.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      clinic: u.clinic,
      phone: u.phone,
      verified: u.verified,
      createdAt: u.createdAt,
    }))
  },
}

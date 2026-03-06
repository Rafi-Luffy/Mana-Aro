import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface User {
  id: string
  email: string
  name: string
  role: "doctor" | "nurse" | "asha" | "admin"
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user")
      if (storedUser) {
        set({ user: JSON.parse(storedUser), isAuthenticated: true })
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error)
    } finally {
      set({ isInitialized: true })
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      // Mock authentication
      const user: User = {
        id: "1",
        email,
        name: email.split("@")[0],
        role: "doctor",
      }

      await AsyncStorage.setItem("user", JSON.stringify(user))
      set({ user, isAuthenticated: true })
    } catch (error) {
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem("user")
      set({ user: null, isAuthenticated: false })
    } catch (error) {
      throw error
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true })
    try {
      const user: User = {
        id: Date.now().toString(),
        email,
        name,
        role: "asha",
      }

      await AsyncStorage.setItem("user", JSON.stringify(user))
      set({ user, isAuthenticated: true })
    } catch (error) {
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
}))

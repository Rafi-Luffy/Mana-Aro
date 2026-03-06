"use client"
import { useState, useEffect, useCallback } from "react"
import { AuthManager, type AuthSession } from "@/lib/auth"

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentSession = await AuthManager.getSession()
        setSession(currentSession)
      } catch (error) {
        console.error("Failed to check session:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const logout = useCallback(async () => {
    await AuthManager.logout()
    setSession(null)
  }, [])

  return {
    session,
    user: session?.user || null,
    loading,
    isAuthenticated: !!session,
    logout,
  }
}

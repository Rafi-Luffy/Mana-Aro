"use client"

import { ClerkProvider } from "@clerk/clerk-react"
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Heart } from "lucide-react"
import Link from "next/link"

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

const isValidKey = (key?: string) => {
  return key && !key.includes("YOUR_") && (key.startsWith("pk_live_") || key.startsWith("pk_test_"))
}

export function ClerkWrapper({ children }: { children: React.ReactNode }) {
  // If no valid Clerk key, show setup instructions
  if (!isValidKey(publishableKey)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          {/* Setup Card */}
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Clerk Setup Required
              </CardTitle>
              <CardDescription>Configure authentication to continue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-900 mb-2">Missing Clerk Publishable Key</p>
                <p className="text-xs text-amber-800 mb-4">
                  The Clerk authentication provider needs your Publishable Key to function. Follow these steps:
                </p>

                <ol className="text-xs text-amber-800 space-y-2 mb-4">
                  <li className="flex gap-2">
                    <span className="font-bold">1.</span>
                    <span>
                      Go to{" "}
                      <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                        Clerk Dashboard
                      </a>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">2.</span>
                    <span>Navigate to <strong>API Keys</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">3.</span>
                    <span>Copy your <strong>Publishable Key</strong> (starts with pk_test_ or pk_live_)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">4.</span>
                    <span>
                      Update <code className="bg-white px-1 rounded">.env.local</code>:
                      <div className="bg-white mt-1 p-2 rounded border border-amber-100 font-mono text-xs">
                        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx...
                      </div>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">5.</span>
                    <span>Restart the development server</span>
                  </li>
                </ol>
              </div>

              <p className="text-xs text-muted-foreground">
                The Clerk free tier includes everything you need: email/password auth, OAuth, user management, and more.
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Empowering rural healthcare with offline-first technology
          </p>
        </div>
      </div>
    )
  }

  const validatedKey = publishableKey as string

  return (
    <ClerkProvider publishableKey={validatedKey} afterSignOutUrl="/">
      {children}
    </ClerkProvider>
  )
}

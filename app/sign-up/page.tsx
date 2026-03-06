"use client"
import { SignUp } from "@clerk/clerk-react"
import { Card } from "@/components/ui/card"
import { Heart } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        {/* Card Wrapper */}
        <Card className="p-0 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2 text-foreground">Mana Aarogyam</h1>
            <p className="text-sm text-muted-foreground mb-6">Create your account</p>
            
            {/* Clerk SignUp Component */}
            <SignUp
              routing="path"
              path="/sign-up"
              redirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent border-0 shadow-none",
                  form: "space-y-4",
                },
              }}
            />
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Empowering rural healthcare with offline-first technology
        </p>
      </div>
    </div>
  )
}

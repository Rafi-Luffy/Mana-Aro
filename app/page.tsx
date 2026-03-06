"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, Smartphone, Zap, Shield, Globe } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/clerk-react"

export default function Home() {
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">Mana Aarogyam</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Link href="/patients">
                  <Button>Get Started</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-sm font-medium text-primary">Empowering Rural Healthcare</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Digital Health for Every Village
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Mana Aarogyam brings offline-first healthcare technology to rural clinics. Digitize patient records,
              enable remote consultations, and provide better care—even without internet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {user ? (
                <>
                  <Link href="/patients">
                    <Button size="lg" className="w-full sm:w-auto">
                      Start Managing Patients
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                      View Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/sign-up">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="col-span-2 md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">98% Time Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">6.5 min → 8 sec</p>
                <p className="text-xs text-muted-foreground mt-1">Record access time</p>
              </CardContent>
            </Card>
            <Card className="col-span-2 md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">100% Offline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-accent">Always Available</p>
                <p className="text-xs text-muted-foreground mt-1">Works without internet</p>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">54 Families Digitized</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">Complete Health History</p>
                <p className="text-xs text-muted-foreground mt-1">Pilot phase target</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Comprehensive Healthcare Solution</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything ASHA workers and clinic staff need to deliver better care
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              title: "Patient Records",
              description: "Digitize and manage complete patient histories with visit records and prescriptions",
            },
            {
              icon: Smartphone,
              title: "Remote Consultations",
              description: "Chat, video calls, and image sharing for seamless doctor-patient communication",
            },
            {
              icon: Zap,
              title: "Voice Symptom Analysis",
              description: "Speech-to-text recording with AI-powered medicine recommendations",
            },
            {
              icon: Shield,
              title: "Offline-First",
              description: "Complete functionality without internet—sync when connectivity returns",
            },
            {
              icon: Globe,
              title: "Low-Spec Friendly",
              description: "Optimized for older smartphones with minimal data usage",
            },
            {
              icon: Heart,
              title: "Printable Reports",
              description: "Generate summaries and prescriptions for patient documentation",
            },
          ].map((feature, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Impact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-primary/5 rounded-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Real Impact in Rural Communities</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { number: "98%", label: "Time Reduction", desc: "In patient record access" },
            { number: "54", label: "Families", desc: "Digitized in pilot phase" },
            { number: "5", label: "Workers", desc: "Fully trained and empowered" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.number}</p>
              <p className="text-lg font-semibold text-foreground mb-1">{stat.label}</p>
              <p className="text-sm text-muted-foreground">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl">Ready to Transform Healthcare?</CardTitle>
            <CardDescription className="text-base mt-2">
              Start managing patient records and consultations today
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/patients">
              <Button size="lg">Access Patient Records</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                View Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-primary" />
                <span className="font-bold">Mana Aarogyam</span>
              </div>
              <p className="text-sm text-muted-foreground">Empowering rural healthcare with offline-first technology</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/patients" className="hover:text-foreground">
                    Patients
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Our Mission
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Mana Aarogyam. Empowering rural healthcare with technology.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

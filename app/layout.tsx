import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { OfflineIndicator } from "@/components/offline-indicator"
import { SidebarNav } from "@/components/sidebar-nav"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SyncStatusStrip } from "@/components/sync-status-strip"
import { Toaster } from "sonner"
import { ClerkWrapper } from "@/components/clerk-provider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0D9488",
}

export const metadata: Metadata = {
  title: "Mana Aarogyam - Rural Healthcare Management System",
  description:
    "Offline-first healthcare solution for rural clinics and ASHA workers. Digitize patient records, enable remote consultations, and provide better care.",
  generator: "v0.app",
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mana Aarogyam",
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0D9488" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mana Aarogyam" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`font-sans antialiased`}>
        <ClerkWrapper>
          <SyncStatusStrip />
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <SidebarNav />
          </div>
          <div className="md:ml-64">
            {children}
            <OfflineIndicator />
          </div>
          {/* Mobile Bottom Navigation */}
          <div className="md:hidden">
            <BottomNavigation />
          </div>
          <Toaster position="top-center" />
          <Analytics />
        </ClerkWrapper>
      </body>
    </html>
  )
}

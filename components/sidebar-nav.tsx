"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, useUser } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import { Heart, LayoutDashboard, Users, MessageSquare, Mic, FileText, Settings, Menu, X } from "lucide-react"
import { OfflineToggle } from "@/components/offline-toggle"
import { useSyncStatus } from "@/hooks/use-sync-status"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/consultation", label: "Consultations", icon: MessageSquare },
  { href: "/symptom-analysis", label: "Symptom Analysis", icon: Mic },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function SidebarNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, isLoaded } = useUser()
  const { isOnline, isSyncing, pendingItems, syncState } = useSyncStatus()

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button size="icon" variant="outline" onClick={() => setIsOpen(!isOpen)} className="bg-background">
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">Mana Aarogyam</span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 border-t border-border bg-muted/50">
          {/* Sync Status Badge */}
          <div className="text-xs bg-background rounded-md p-2 border border-border">
            {syncState === "offline" ? (
              <div className="flex items-center gap-2 text-amber-600">
                <span>Offline Mode</span>
              </div>
            ) : isSyncing ? (
              <div className="flex items-center gap-2 text-primary">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Syncing changes...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <span>✓ Synced</span>
              </div>
            )}
          </div>

          {/* Offline Toggle */}
          <OfflineToggle />

          {/* User Profile */}
          {isLoaded && user && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.firstName || user.emailAddresses[0]?.emailAddress}</p>
                <p className="text-xs text-muted-foreground truncate">{user.emailAddresses[0]?.emailAddress}</p>
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center">
            Empowering rural healthcare with offline-first technology
          </p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 md:hidden z-30" onClick={() => setIsOpen(false)} />}
    </>
  )
}

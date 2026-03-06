'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Stethoscope, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    id: 'home',
    label: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    id: 'patients',
    label: 'Patients',
    href: '/patients',
    icon: Users,
  },
  {
    id: 'visits',
    label: 'Visits',
    href: '/consultation',
    icon: Stethoscope,
  },
  {
    id: 'more',
    label: 'More',
    href: '/settings',
    icon: MoreVertical,
  },
]

export function BottomNavigation() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm z-40"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-20 max-w-7xl mx-auto w-full">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

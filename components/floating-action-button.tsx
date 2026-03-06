'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

interface FABAction {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
}

interface FloatingActionButtonProps {
  primary?: FABAction
  secondary?: FABAction[]
}

export function FloatingActionButton({
  primary,
  secondary = [],
}: FloatingActionButtonProps) {
  if (secondary.length === 0) {
    // Single FAB
    if (primary?.href) {
      return (
        <Link href={primary.href}>
          <Button
            size="lg"
            className="fixed bottom-24 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl"
          >
            {primary.icon}
          </Button>
        </Link>
      )
    }

    return (
      <Button
        size="lg"
        onClick={primary?.onClick}
        className="fixed bottom-24 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl"
      >
        {primary?.icon}
      </Button>
    )
  }

  // Multiple FABs with dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-24 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mb-4">
        {primary && (
          <DropdownMenuItem asChild>
            {primary.href ? (
              <Link href={primary.href} className="flex items-center gap-2 cursor-pointer">
                {primary.icon}
                <span>{primary.label}</span>
              </Link>
            ) : (
              <button onClick={primary.onClick} className="flex items-center gap-2 w-full">
                {primary.icon}
                <span>{primary.label}</span>
              </button>
            )}
          </DropdownMenuItem>
        )}
        {secondary.map((action) => (
          <DropdownMenuItem key={action.id} asChild>
            {action.href ? (
              <Link href={action.href} className="flex items-center gap-2 cursor-pointer">
                {action.icon}
                <span>{action.label}</span>
              </Link>
            ) : (
              <button onClick={action.onClick} className="flex items-center gap-2 w-full">
                {action.icon}
                <span>{action.label}</span>
              </button>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

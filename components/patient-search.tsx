'use client'

import React, { useState } from 'react'
import { Search, Mic, Phone, Hash } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type SearchType = 'name' | 'phone' | 'family-head' | 'abha-id'

interface PatientSearchProps {
  onSearch: (query: string, type: SearchType) => void
  onVoiceSearch?: (transcript: string) => void
}

export function PatientSearch({ onSearch, onVoiceSearch }: PatientSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('name')
  const [isListening, setIsListening] = useState(false)

  const searchTypeLabels: Record<SearchType, string> = {
    name: 'Name',
    phone: 'Phone',
    'family-head': 'Family Head',
    'abha-id': 'ABHA ID',
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value, searchType)
  }

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser')
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    setIsListening(true)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setSearchQuery(transcript)
      onVoiceSearch?.(transcript)
      onSearch(transcript, 'name')
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search by ${searchTypeLabels[searchType]}...`}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {searchTypeLabels[searchType]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSearchType('name')}>
              <span>Name</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchType('phone')}>
              <Phone className="w-4 h-4 mr-2" />
              <span>Phone</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchType('family-head')}>
              <span>Family Head</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchType('abha-id')}>
              <Hash className="w-4 h-4 mr-2" />
              <span>ABHA ID</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          variant="outline"
          onClick={handleVoiceSearch}
          disabled={isListening}
          className={isListening ? 'bg-red-50' : ''}
        >
          <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse text-red-500' : ''}`} />
        </Button>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface BookingNotesProps {
  value: string
  onChange: (value: string) => void
}

export function BookingNotes({ value, onChange }: BookingNotesProps) {
  const [isExpanded, setIsExpanded] = useState(!!value)

  return (
    <div className="rounded-xl border border-stone-200 overflow-hidden bg-gradient-to-b from-white to-stone-50/50">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors"
      >
        <span className="text-sm font-semibold text-stone-700">Booking Notes</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-stone-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-stone-400" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Special requests, group name, occasion..."
            rows={3}
            className="w-full px-3 py-2.5 border border-stone-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none placeholder:text-stone-400"
          />
        </div>
      )}
    </div>
  )
}

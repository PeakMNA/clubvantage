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
    <div className="rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden bg-gradient-to-b from-white to-stone-50/50 dark:from-stone-800 dark:to-stone-900/50">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
      >
        <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">Booking Notes</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-stone-400 dark:text-stone-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-stone-400 dark:text-stone-500" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Special requests, group name, occasion..."
            rows={3}
            className="w-full px-3 py-2.5 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none placeholder:text-stone-400 dark:placeholder:text-stone-500"
          />
        </div>
      )}
    </div>
  )
}

'use client'

import { cn } from '@clubvantage/ui'

export interface HoleSelectorProps {
  value: 9 | 18
  onChange: (holes: 9 | 18) => void
}

export function HoleSelector({ value, onChange }: HoleSelectorProps) {
  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
        Holes
      </label>
      <div className="flex gap-2">
        {([9, 18] as const).map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            aria-label={`Select ${num} holes`}
            className={cn(
              'flex-1 py-3 text-lg font-bold rounded-xl border-2 transition-all',
              value === num
                ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/25'
                : 'border-stone-200 bg-white text-stone-700 hover:border-amber-300 hover:bg-amber-50'
            )}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  )
}

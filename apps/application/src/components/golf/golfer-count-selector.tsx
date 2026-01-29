'use client'

import { cn } from '@clubvantage/ui'

export interface GolferCountSelectorProps {
  value: number
  onChange: (count: number) => void
}

export function GolferCountSelector({ value, onChange }: GolferCountSelectorProps) {
  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
        Golfers
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            aria-label={`Select ${num} golfer${num > 1 ? 's' : ''}`}
            className={cn(
              'flex-1 py-3 text-lg font-bold rounded-xl border-2 transition-all',
              value === num
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25'
                : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-300 hover:bg-emerald-50'
            )}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  )
}

'use client'

import { cn } from '@clubvantage/ui'

export interface GolferCountSelectorProps {
  value: number
  onChange: (count: number) => void
}

export function GolferCountSelector({ value, onChange }: GolferCountSelectorProps) {
  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
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
                : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
            )}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  )
}

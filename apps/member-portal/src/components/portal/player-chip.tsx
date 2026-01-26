'use client'

import { cn } from '@clubvantage/ui'
import { X } from 'lucide-react'
import type { BookingPlayer } from '@/lib/types'

interface PlayerChipProps {
  player: BookingPlayer
  editable?: boolean
  isSelf?: boolean
  onRemove?: () => void
}

const typeConfig = {
  member: { letter: 'M', bg: 'bg-blue-500', text: 'text-white' },
  dependent: { letter: 'D', bg: 'bg-teal-500', text: 'text-white' },
  guest: { letter: 'G', bg: 'bg-amber-500', text: 'text-white' },
}

export function PlayerChip({
  player,
  editable = false,
  isSelf = false,
  onRemove,
}: PlayerChipProps) {
  const config = typeConfig[player.type]
  const initials = player.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-full',
        'bg-stone-100 dark:bg-stone-800'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full',
          'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300',
          'text-xs font-medium'
        )}
      >
        {initials}
      </div>

      {/* Name */}
      <span className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate max-w-[120px]">
        {player.name}
      </span>

      {/* Type badge */}
      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full',
          'text-[10px] font-semibold',
          config.bg,
          config.text
        )}
      >
        {config.letter}
      </span>

      {/* Remove button */}
      {editable && !isSelf && onRemove && (
        <button
          onClick={onRemove}
          className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
        >
          <X className="h-3.5 w-3.5 text-stone-400 hover:text-stone-600" />
        </button>
      )}
    </div>
  )
}

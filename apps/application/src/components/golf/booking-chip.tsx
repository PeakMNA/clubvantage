'use client'

import { cn } from '@clubvantage/ui'
import { Link } from 'lucide-react'
import type { BookingStatus } from './types'

interface BookingChipProps {
  booking: {
    id: string
    playerNames: string[]
    playerCount: number
    status: BookingStatus
    partyId?: string
    partyName?: string
  }
  bookingIndex: 0 | 1
  isSelected?: boolean
  onSelect: (bookingId: string) => void
  onContextMenu: (bookingId: string, position: { x: number; y: number }) => void
}

/**
 * Status color configurations for booking chips
 * Each status has background, border, and text colors
 */
const statusColors: Record<
  BookingStatus,
  { bg: string; border: string; text: string; strikethrough?: boolean }
> = {
  AVAILABLE: {
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    text: 'text-stone-500',
  },
  BOOKED: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
  },
  CHECKED_IN: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
  },
  STARTED: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
  },
  COMPLETED: {
    bg: 'bg-stone-100',
    border: 'border-stone-200',
    text: 'text-stone-500',
  },
  CANCELLED: {
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    text: 'text-stone-400',
    strikethrough: true,
  },
  NO_SHOW: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-600',
  },
  BLOCKED: {
    bg: 'bg-stone-100',
    border: 'border-stone-200',
    text: 'text-stone-500',
  },
}

/**
 * Purple color scheme for the second booking in a time slot
 */
const secondBookingColors = {
  bg: 'bg-purple-50',
  border: 'border-purple-200',
  text: 'text-purple-700',
}

/**
 * Get the display text for player names
 * Comma-separated, truncated if too long
 */
function formatPlayerNames(names: string[], maxLength = 20): string {
  if (names.length === 0) return 'No players'

  const joined = names.join(', ')
  if (joined.length <= maxLength) return joined

  // Truncate with ellipsis
  return joined.slice(0, maxLength - 1).replace(/\s+$/, '') + '…'
}

/**
 * BookingChip - A clickable chip representing a single booking on the tee sheet
 *
 * Features:
 * - Displays player names (comma-separated, truncated if long)
 * - Shows player count badge on right
 * - Status-aware styling (different colors per booking status)
 * - Multi-booking differentiation: first booking uses status colors, second uses purple
 * - Clickable with hover state
 * - Right-click emits onContextMenu event
 * - Shows link icon for party bookings
 */
export function BookingChip({
  booking,
  bookingIndex,
  isSelected = false,
  onSelect,
  onContextMenu,
}: BookingChipProps) {
  const { id, playerNames, playerCount, status, partyId, partyName } = booking

  // Determine colors based on booking index
  // First booking (index 0) uses status colors
  // Second booking (index 1) uses purple scheme
  const colors = bookingIndex === 1 ? secondBookingColors : statusColors[status]
  const isStrikethrough = bookingIndex === 0 && statusColors[status].strikethrough

  const handleClick = () => {
    onSelect(id)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onContextMenu(id, { x: e.clientX, y: e.clientY })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={cn(
        // Base styles
        'group flex items-center justify-between gap-2',
        'min-w-[120px] h-9 px-3 py-2',
        'rounded-lg border',
        'cursor-pointer transition-all duration-150',
        // Color scheme
        colors.bg,
        colors.border,
        colors.text,
        // Text styles
        isStrikethrough && 'line-through',
        // Hover state
        'hover:shadow-md hover:scale-[1.02]',
        // Selected state
        isSelected && 'ring-2 ring-amber-500 ring-offset-1',
        // Focus state for accessibility
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1'
      )}
      title={partyName ? `Party: ${partyName}` : playerNames.join(', ')}
    >
      {/* Left section: Party icon (if applicable) and player names */}
      <span className="flex items-center gap-1.5 min-w-0">
        {partyId && (
          <Link
            className={cn('h-3.5 w-3.5 flex-shrink-0', colors.text)}
            aria-label={`Part of party: ${partyName || 'Unnamed party'}`}
          />
        )}
        <span className="truncate text-sm font-medium">
          {formatPlayerNames(playerNames)}
        </span>
      </span>

      {/* Right section: Player count badge */}
      <span
        className={cn(
          'flex-shrink-0 text-xs font-semibold px-1.5 rounded',
          // Badge uses slightly darker/more opaque version of the chip color
          bookingIndex === 1
            ? 'bg-purple-100 text-purple-800'
            : status === 'BOOKED'
              ? 'bg-blue-100 text-blue-800'
              : status === 'CHECKED_IN'
                ? 'bg-emerald-100 text-emerald-800'
                : status === 'STARTED'
                  ? 'bg-amber-100 text-amber-800'
                  : status === 'NO_SHOW'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-stone-200 text-stone-600'
        )}
      >
        {playerCount}
      </span>
    </button>
  )
}

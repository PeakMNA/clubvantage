'use client'

import { cn } from '@clubvantage/ui'
import { Plus } from 'lucide-react'
import { BookingChip } from './booking-chip'
import { BlockElement } from './block-element'
import type { BookingStatus } from './types'

interface TimeSlotRowProps {
  teeTime: string
  bookings: Array<{
    id: string
    playerNames: string[]
    playerCount: number
    status: BookingStatus
    partyId?: string
    partyName?: string
  }>
  totalPlayers: number
  capacity: number
  block?: {
    id: string
    type: 'STARTER' | 'MAINTENANCE'
    reason: string
    createdByName?: string
    createdAt?: string
    recurring?: boolean
    recurrencePattern?: string
  }
  placementMode?: {
    active: boolean
    canAccept: boolean
    incomingPlayers: number
    isSource?: boolean
  }
  onAddBooking: (teeTime: string) => void
  onBookingSelect: (bookingId: string) => void
  onBookingContextMenu: (bookingId: string, position: { x: number; y: number }) => void
  onSlotContextMenu: (teeTime: string, position: { x: number; y: number }) => void
  onReleaseBlock: (blockId: string) => void
  onPlacementSelect?: (teeTime: string) => void
}

/**
 * TimeSlotRow - A row in the tee sheet grid representing a single tee time
 *
 * Layout:
 * ┌────────┬─────────────────────────────────────────────┬───────┐
 * │ 06:00  │ [Booking Chip 1] [Booking Chip 2]          │ 2/4   │
 * └────────┴─────────────────────────────────────────────┴───────┘
 *
 * Features:
 * - Time label on the left
 * - Booking chips in the center
 * - Capacity indicator on the right
 * - Empty slot shows dashed "Add Booking" button
 * - Blocked slots show BlockElement component
 * - Placement mode highlights for move/copy operations
 */
export function TimeSlotRow({
  teeTime,
  bookings,
  totalPlayers,
  capacity,
  block,
  placementMode,
  onAddBooking,
  onBookingSelect,
  onBookingContextMenu,
  onSlotContextMenu,
  onReleaseBlock,
  onPlacementSelect,
}: TimeSlotRowProps) {
  const isFull = totalPlayers >= capacity
  const isBlocked = !!block
  const isEmpty = bookings.length === 0 && !isBlocked

  // Handle row context menu (right-click on empty area)
  const handleRowContextMenu = (e: React.MouseEvent) => {
    // Only trigger if clicking on the row itself, not on a booking chip
    if ((e.target as HTMLElement).closest('[data-booking-chip]')) {
      return
    }
    e.preventDefault()
    onSlotContextMenu(teeTime, { x: e.clientX, y: e.clientY })
  }

  // Handle click on empty slot to add booking
  const handleEmptySlotClick = () => {
    if (placementMode?.active && onPlacementSelect) {
      onPlacementSelect(teeTime)
    } else {
      onAddBooking(teeTime)
    }
  }

  // Handle placement mode click on the row
  const handlePlacementClick = () => {
    if (placementMode?.active && placementMode.canAccept && onPlacementSelect) {
      onPlacementSelect(teeTime)
    }
  }

  // Determine placement mode styling
  const getPlacementModeStyles = () => {
    if (!placementMode?.active) return ''

    if (placementMode.isSource) {
      // Source slot - amber ring
      return 'ring-2 ring-amber-400 bg-amber-50/50'
    }

    if (placementMode.canAccept) {
      // Valid target - emerald ring
      return 'ring-2 ring-emerald-400 bg-emerald-50/50 cursor-pointer'
    }

    // Invalid target (full) - reduced opacity, red tint
    return 'opacity-50 bg-red-50/30'
  }

  return (
    <div
      className={cn(
        // Base styles
        'flex items-center min-h-[52px] border-b border-stone-200',
        // Hover state
        'hover:bg-stone-50',
        // Full row styling
        isFull && !isBlocked && 'bg-stone-50/50',
        // Placement mode styling
        getPlacementModeStyles()
      )}
      onContextMenu={handleRowContextMenu}
      onClick={placementMode?.active && placementMode.canAccept ? handlePlacementClick : undefined}
    >
      {/* Time Column */}
      <div className="w-20 flex-shrink-0 px-3 py-2">
        <span className="text-sm font-medium text-stone-600">{teeTime}</span>
      </div>

      {/* Booking Area */}
      <div className="flex-1 flex items-center gap-2 px-2 py-2 min-h-[40px]">
        {isBlocked && block ? (
          // Blocked slot - show BlockElement
          <BlockElement
            block={block}
            onRelease={onReleaseBlock}
          />
        ) : isEmpty ? (
          // Empty slot - show "Add Booking" button
          <button
            type="button"
            onClick={handleEmptySlotClick}
            className={cn(
              'group flex items-center justify-center gap-2',
              'h-10 px-4 py-2 w-full max-w-[200px]',
              'border-2 border-dashed border-stone-300 rounded-lg',
              'bg-transparent hover:bg-stone-50 hover:border-stone-400',
              'transition-all duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1'
            )}
          >
            <Plus className="h-4 w-4 text-stone-400 group-hover:text-stone-500 transition-colors" />
            <span className="text-sm text-stone-400 group-hover:text-stone-500 transition-colors">
              Add Booking
            </span>
          </button>
        ) : (
          // Show booking chips
          bookings.map((booking, index) => (
            <div key={booking.id} data-booking-chip>
              <BookingChip
                booking={booking}
                bookingIndex={index as 0 | 1}
                onSelect={onBookingSelect}
                onContextMenu={onBookingContextMenu}
              />
            </div>
          ))
        )}
      </div>

      {/* Capacity Column */}
      <div className="w-12 flex-shrink-0 px-2 py-2 text-right">
        {isBlocked ? (
          // Blocked slots show dash
          <span className="text-xs text-stone-400">-</span>
        ) : (
          <span
            className={cn(
              'text-xs',
              // Full capacity gets amber styling
              isFull ? 'text-amber-600 font-medium' : 'text-stone-500'
            )}
          >
            {totalPlayers}/{capacity}
          </span>
        )}
      </div>
    </div>
  )
}

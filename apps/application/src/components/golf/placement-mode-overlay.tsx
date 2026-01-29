'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import { cn } from '@clubvantage/ui'
import { Clipboard, Copy, X, Loader2, MoveRight } from 'lucide-react'
import type { PlacementModeState, Flight } from './types'
import {
  validateAllSlotsForPlacement,
  placementValidationClasses,
  type SlotValidation,
  type SlotValidationResult,
} from '@/lib/golf/placement-utils'

// Re-export validation classes for backward compatibility
export { placementValidationClasses }

// ============================================================================
// Slot Highlighting CSS Classes (for use in tee sheet components)
// ============================================================================

/**
 * @deprecated Use placementValidationClasses from @/lib/golf/placement-utils instead
 * CSS class configurations for highlighting time slots during placement mode
 */
export const placementSlotClasses = {
  /** Valid target slot - can accept the booking */
  valid: 'ring-2 ring-emerald-400 bg-emerald-50/50 cursor-pointer',
  /** Invalid target slot - cannot accept the booking (e.g., full, blocked) */
  invalid: 'opacity-50 bg-red-50/30 cursor-not-allowed',
  /** Source slot - where the booking is being moved/copied from */
  source: 'ring-2 ring-amber-400 bg-amber-50/50',
}

// ============================================================================
// Hover Preview Component
// ============================================================================

interface PlacementHoverPreviewProps {
  playerCount: number
  visible: boolean
}

/**
 * Floating badge shown when hovering over a valid target slot
 * Displays the number of players that will be added
 */
export function PlacementHoverPreview({
  playerCount,
  visible,
}: PlacementHoverPreviewProps) {
  if (!visible) return null

  return (
    <div
      className={cn(
        'absolute -top-8 left-1/2 -translate-x-1/2',
        'px-2 py-1 rounded-full',
        'bg-emerald-500 text-white',
        'text-xs font-semibold whitespace-nowrap',
        'shadow-md',
        'pointer-events-none',
        'animate-in fade-in zoom-in-95 duration-150'
      )}
    >
      +{playerCount} player{playerCount !== 1 ? 's' : ''}
    </div>
  )
}

// ============================================================================
// Placement Mode Banner
// ============================================================================

interface PlacementModeOverlayProps {
  active: boolean
  action: 'move' | 'copy'
  sourceBooking: {
    id: string
    bookingNumber: string
    playerNames: string[]
    playerCount: number
    sourceTeeTime: string
  }
  isProcessing?: boolean
  onCancel: () => void
}

/**
 * PlacementModeOverlay - Banner displayed at top of tee sheet during move/copy operations
 *
 * Features:
 * - Shows which booking is being moved/copied
 * - Displays player names and count
 * - Different styling for move (blue) vs copy (purple) modes
 * - Cancel button to exit placement mode
 * - Loading spinner when processing
 * - Escape key handler to cancel
 */
export function PlacementModeOverlay({
  active,
  action,
  sourceBooking,
  isProcessing = false,
  onCancel,
}: PlacementModeOverlayProps) {
  // Handle Escape key to cancel placement mode
  useEffect(() => {
    if (!active) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [active, isProcessing, onCancel])

  if (!active) return null

  const isMove = action === 'move'

  // Format player names for display
  const playerNamesDisplay =
    sourceBooking.playerNames.length > 0
      ? sourceBooking.playerNames.join(', ')
      : 'No players'

  return (
    <div
      className={cn(
        'sticky top-0 z-40',
        'flex items-center justify-between gap-4',
        'px-4 py-3',
        'border-b',
        // Mode-specific colors
        isMove
          ? 'bg-blue-50 border-blue-200'
          : 'bg-purple-50 border-purple-200',
        // Animation
        'animate-in slide-in-from-top-2 duration-200'
      )}
      role="status"
      aria-live="polite"
    >
      {/* Left section: Icon + action text + booking info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 p-1.5 rounded-lg',
            isMove ? 'bg-blue-100' : 'bg-purple-100'
          )}
        >
          {isMove ? (
            <Clipboard
              className={cn('h-5 w-5', isMove ? 'text-blue-600' : 'text-purple-600')}
              aria-hidden="true"
            />
          ) : (
            <Copy className="h-5 w-5 text-purple-600" aria-hidden="true" />
          )}
        </div>

        {/* Text content */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              'font-medium whitespace-nowrap',
              isMove ? 'text-blue-800' : 'text-purple-800'
            )}
          >
            {isMove ? 'Moving' : 'Copying'} from {sourceBooking.sourceTeeTime}:
          </span>
          <span
            className={cn(
              'truncate',
              isMove ? 'text-blue-700' : 'text-purple-700'
            )}
            title={playerNamesDisplay}
          >
            {playerNamesDisplay}
          </span>
          <span
            className={cn(
              'flex-shrink-0 text-sm',
              isMove ? 'text-blue-600' : 'text-purple-600'
            )}
          >
            ({sourceBooking.playerCount} player
            {sourceBooking.playerCount !== 1 ? 's' : ''})
          </span>
          <MoveRight className={cn('h-4 w-4 flex-shrink-0', isMove ? 'text-blue-500' : 'text-purple-500')} />
          <span className={cn('text-sm', isMove ? 'text-blue-600' : 'text-purple-600')}>
            Click a <span className="text-emerald-600 font-medium">green</span> slot to place
          </span>
        </div>

        {/* Processing spinner */}
        {isProcessing && (
          <Loader2
            className={cn(
              'h-4 w-4 animate-spin flex-shrink-0',
              isMove ? 'text-blue-600' : 'text-purple-600'
            )}
            aria-label="Processing"
          />
        )}
      </div>

      {/* Right section: Cancel button */}
      <button
        type="button"
        onClick={onCancel}
        disabled={isProcessing}
        className={cn(
          'flex items-center gap-1.5',
          'px-3 py-1.5 rounded-lg',
          'text-sm font-medium underline',
          'transition-colors duration-150',
          // Mode-specific colors
          isMove
            ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
            : 'text-purple-600 hover:text-purple-800 hover:bg-purple-100',
          // Disabled state
          isProcessing && 'opacity-50 cursor-not-allowed',
          // Focus state
          'focus:outline-none focus-visible:ring-2',
          isMove
            ? 'focus-visible:ring-blue-500'
            : 'focus-visible:ring-purple-500'
        )}
        aria-label="Cancel placement mode"
      >
        <X className="h-4 w-4" aria-hidden="true" />
        Cancel
      </button>
    </div>
  )
}

// ============================================================================
// usePlacementMode Hook
// ============================================================================

/**
 * Source booking data for placement mode
 */
export interface SourceBooking {
  id: string
  bookingNumber: string
  playerNames: string[]
  playerCount: number
  sourceTeeTime: string
  sourceDate: string
  playerIds?: string[]
}

/**
 * Hook for managing placement mode state with smart validation
 *
 * Usage:
 * ```tsx
 * const placementMode = usePlacementMode(flights)
 *
 * // Start move mode
 * placementMode.startMove({
 *   id: 'booking-123',
 *   bookingNumber: 'CV-240128-001',
 *   playerNames: ['John Smith', 'Mary Lee'],
 *   playerCount: 2,
 *   sourceTeeTime: '08:00',
 *   sourceDate: '2024-01-28',
 *   playerIds: ['player-1', 'player-2'],
 * })
 *
 * // Get validation for a slot
 * const validation = placementMode.getSlotValidation('09:00')
 * // Returns: { status: 'valid' | 'partial' | 'invalid' | 'source', ... }
 *
 * // Render the overlay
 * {placementMode.state.active && placementMode.state.sourceBooking && (
 *   <PlacementModeOverlay
 *     active={placementMode.state.active}
 *     action={placementMode.state.action}
 *     sourceBooking={placementMode.state.sourceBooking}
 *     onCancel={placementMode.cancel}
 *   />
 * )}
 * ```
 */
export function usePlacementMode(flights: Flight[] = []) {
  const [state, setState] = useState<PlacementModeState>({
    active: false,
    action: 'move',
    sourceBooking: null,
  })

  // Calculate validation for all slots when placement mode is active
  const validationMap = useMemo(() => {
    if (!state.active || !state.sourceBooking) {
      return new Map<string, SlotValidationResult>()
    }

    return validateAllSlotsForPlacement(flights, {
      playerCount: state.sourceBooking.playerCount,
      sourceTeeTime: state.sourceBooking.sourceTeeTime,
      playerIds: state.sourceBooking.playerIds,
    })
  }, [state.active, state.sourceBooking, flights])

  /**
   * Get validation result for a specific slot
   */
  const getSlotValidation = useCallback(
    (teeTime: string): SlotValidationResult | null => {
      if (!state.active) return null
      return validationMap.get(teeTime) || null
    },
    [state.active, validationMap]
  )

  /**
   * Get CSS class for a slot based on its validation status
   */
  const getSlotClass = useCallback(
    (teeTime: string): string => {
      const validation = getSlotValidation(teeTime)
      if (!validation) return ''
      return placementValidationClasses[validation.status]
    },
    [getSlotValidation]
  )

  /**
   * Start move mode for a booking
   */
  const startMove = useCallback((booking: SourceBooking) => {
    setState({
      active: true,
      action: 'move',
      sourceBooking: booking,
    })
  }, [])

  /**
   * Start copy mode for a booking
   */
  const startCopy = useCallback((booking: SourceBooking) => {
    setState({
      active: true,
      action: 'copy',
      sourceBooking: booking,
    })
  }, [])

  /**
   * Cancel placement mode and reset state
   */
  const cancel = useCallback(() => {
    setState({
      active: false,
      action: 'move',
      sourceBooking: null,
    })
  }, [])

  /**
   * Complete placement mode (called after successful move/copy)
   */
  const complete = useCallback(() => {
    setState({
      active: false,
      action: 'move',
      sourceBooking: null,
    })
  }, [])

  return {
    state,
    validationMap,
    getSlotValidation,
    getSlotClass,
    startMove,
    startCopy,
    cancel,
    complete,
  }
}

// Export types for external use
export type { SlotValidation, SlotValidationResult }

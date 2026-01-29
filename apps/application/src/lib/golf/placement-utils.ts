import type { Flight } from '@/components/golf/types'

/**
 * Slot validation result for placement mode
 */
export type SlotValidation = 'valid' | 'partial' | 'invalid' | 'source'

/**
 * Validation details for a single slot
 */
export interface SlotValidationResult {
  status: SlotValidation
  availablePositions: number
  canFit: number // How many players from source can fit
  reason?: string // Why invalid (if applicable)
}

/**
 * Validate if a target slot can accept players from source booking
 */
export function validateSlotForPlacement(
  targetFlight: Flight,
  sourceBooking: {
    playerCount: number
    sourceTeeTime: string
    playerIds?: string[]
  }
): SlotValidationResult {
  // Source slot - mark as source, not a valid target
  if (targetFlight.time === sourceBooking.sourceTeeTime) {
    return {
      status: 'source',
      availablePositions: 0,
      canFit: 0,
      reason: 'Source slot',
    }
  }

  // Blocked slot - invalid
  if (targetFlight.status === 'blocked') {
    return {
      status: 'invalid',
      availablePositions: 0,
      canFit: 0,
      reason: 'Slot is blocked',
    }
  }

  // Count available positions
  const filledPositions = targetFlight.players.filter(Boolean).length
  const availablePositions = 4 - filledPositions

  // Check for player conflicts (same player already in target slot)
  if (sourceBooking.playerIds && sourceBooking.playerIds.length > 0) {
    const targetPlayerIds = targetFlight.players
      .filter(Boolean)
      .map((p) => p.id)
    const hasConflict = sourceBooking.playerIds.some((id) =>
      targetPlayerIds.includes(id)
    )
    if (hasConflict) {
      return {
        status: 'invalid',
        availablePositions,
        canFit: 0,
        reason: 'Player already in this slot',
      }
    }
  }

  // No available positions
  if (availablePositions === 0) {
    return {
      status: 'invalid',
      availablePositions: 0,
      canFit: 0,
      reason: 'Slot is full',
    }
  }

  // Check how many can fit
  const canFit = Math.min(availablePositions, sourceBooking.playerCount)

  // All players fit - valid
  if (canFit >= sourceBooking.playerCount) {
    return {
      status: 'valid',
      availablePositions,
      canFit,
    }
  }

  // Some players fit - partial
  return {
    status: 'partial',
    availablePositions,
    canFit,
    reason: `Only ${canFit} of ${sourceBooking.playerCount} players fit`,
  }
}

/**
 * Validate all slots for placement mode
 * Returns a map of flight time -> validation result
 */
export function validateAllSlotsForPlacement(
  flights: Flight[],
  sourceBooking: {
    playerCount: number
    sourceTeeTime: string
    playerIds?: string[]
  }
): Map<string, SlotValidationResult> {
  const validationMap = new Map<string, SlotValidationResult>()

  for (const flight of flights) {
    const result = validateSlotForPlacement(flight, sourceBooking)
    validationMap.set(flight.time, result)
  }

  return validationMap
}

/**
 * CSS classes for each validation state
 */
export const placementValidationClasses: Record<SlotValidation, string> = {
  source: 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30',
  valid:
    'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40',
  partial:
    'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-900/20 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/40',
  invalid: 'opacity-50 cursor-not-allowed',
}

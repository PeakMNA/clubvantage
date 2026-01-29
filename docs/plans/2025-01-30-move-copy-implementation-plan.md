# Move/Copy Booking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement smart slot validation for move/copy with valid/partial/invalid states and add buttons to the booking modal.

**Architecture:** Enhanced usePlacementMode hook calculates validation for all slots, tee sheet applies CSS classes, modal buttons trigger placement mode.

**Tech Stack:** React hooks, TypeScript, Tailwind CSS

---

## Task 1: Create placement-utils.ts

Create utility functions for slot validation logic.

**Files:**
- Create: `apps/application/src/lib/golf/placement-utils.ts`

**Step 1: Write the utility file**

```typescript
import type { Flight, Booking } from '@/components/golf/types'

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
  valid: 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40',
  partial: 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-900/20 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/40',
  invalid: 'opacity-50 cursor-not-allowed',
}
```

**Step 2: Commit**

```bash
git add apps/application/src/lib/golf/placement-utils.ts
git commit -m "feat(golf): add placement validation utilities"
```

---

## Task 2: Create PartialFitDialog component

Create a dialog for confirming partial moves.

**Files:**
- Create: `apps/application/src/components/golf/partial-fit-dialog.tsx`

**Step 1: Write the component**

```typescript
'use client'

import { useState } from 'react'
import { cn } from '@clubvantage/ui'
import { AlertTriangle, X } from 'lucide-react'

interface Player {
  id: string
  name: string
}

interface PartialFitDialogProps {
  isOpen: boolean
  action: 'move' | 'copy'
  players: Player[]
  canFit: number
  targetTime: string
  sourceTime: string
  onConfirm: (selectedPlayerIds: string[]) => void
  onCancel: () => void
}

export function PartialFitDialog({
  isOpen,
  action,
  players,
  canFit,
  targetTime,
  sourceTime,
  onConfirm,
  onCancel,
}: PartialFitDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    players.slice(0, canFit).map((p) => p.id)
  )

  if (!isOpen) return null

  const togglePlayer = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pid) => pid !== id)
      }
      if (prev.length < canFit) {
        return [...prev, id]
      }
      // At max, swap last selected with new one
      return [...prev.slice(0, -1), id]
    })
  }

  const handleConfirm = () => {
    onConfirm(selectedIds)
  }

  const actionVerb = action === 'move' ? 'Move' : 'Copy'
  const remainingCount = players.length - canFit

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Partial {actionVerb}
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Only {canFit} of {players.length} players can fit
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="h-5 w-5 text-stone-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {actionVerb} {canFit} player{canFit !== 1 ? 's' : ''} to {targetTime}
            {action === 'move' && (
              <>
                {' '}and leave {remainingCount} player{remainingCount !== 1 ? 's' : ''} at {sourceTime}
              </>
            )}
            ?
          </p>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Select players to {action} ({selectedIds.length}/{canFit})
            </label>
            <div className="space-y-1">
              {players.map((player) => {
                const isSelected = selectedIds.includes(player.id)
                const willStay = !isSelected && action === 'move'

                return (
                  <button
                    key={player.id}
                    onClick={() => togglePlayer(player.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-colors text-left',
                      isSelected
                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30'
                        : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                    )}
                  >
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isSelected
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-stone-700 dark:text-stone-300'
                      )}
                    >
                      {player.name}
                    </span>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        isSelected
                          ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300'
                          : willStay
                          ? 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
                          : 'bg-transparent'
                      )}
                    >
                      {isSelected ? `${actionVerb}s to ${targetTime}` : willStay ? `Stays at ${sourceTime}` : ''}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-stone-200 dark:border-stone-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
            className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionVerb} {selectedIds.length} Player{selectedIds.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/golf/partial-fit-dialog.tsx
git commit -m "feat(golf): add PartialFitDialog for partial move/copy"
```

---

## Task 3: Enhance usePlacementMode hook

Update the hook to include validation state.

**Files:**
- Modify: `apps/application/src/components/golf/placement-mode-overlay.tsx`

**Step 1: Update the hook to accept flights and return validation**

Add to the hook:
1. Accept `flights` parameter
2. Calculate validation map when placement mode is active
3. Return `getSlotValidation(teeTime)` helper function

**Step 2: Update PlacementModeOverlay banner**

Show source time in the banner message.

**Step 3: Commit**

```bash
git add apps/application/src/components/golf/placement-mode-overlay.tsx
git commit -m "feat(golf): enhance usePlacementMode with smart validation"
```

---

## Task 4: Update tee-sheet-booking-view.tsx

Apply validation-based CSS classes.

**Files:**
- Modify: `apps/application/src/components/golf/tee-sheet-booking-view.tsx`

**Step 1: Import placement utilities**

Add imports for validation functions and CSS classes.

**Step 2: Replace inline placement styling**

Replace the hardcoded placement mode styling (lines 280-286) with calls to the validation utilities.

**Step 3: Handle partial slot clicks**

Add state and handler for showing PartialFitDialog when clicking a partial slot.

**Step 4: Commit**

```bash
git add apps/application/src/components/golf/tee-sheet-booking-view.tsx
git commit -m "feat(golf): apply smart validation styling to tee sheet"
```

---

## Task 5: Integration testing

Wire everything together and test the flow.

**Files:**
- Modify: `apps/application/src/app/(dashboard)/golf/page.tsx` (if needed)

**Step 1: Verify Move/Copy buttons work in modal**

The buttons should already be wired via `onMove` and `onCopy` props.

**Step 2: Test the full flow**

1. Open booking detail modal
2. Click "Move" button
3. Verify modal closes and placement mode activates
4. Verify valid slots show green, partial show amber, invalid show grey
5. Verify source slot shows blue
6. Click valid slot - verify move completes
7. Click partial slot - verify dialog appears

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix(golf): wire up move/copy integration"
```

---

## Verification Checklist

- [ ] Modal has Move/Copy buttons visible for "booked" status
- [ ] Clicking Move closes modal and activates placement mode
- [ ] Clicking Copy closes modal and activates placement mode
- [ ] Source slot highlighted in blue
- [ ] Valid slots (all players fit) highlighted in green
- [ ] Partial slots (some players fit) highlighted in amber
- [ ] Invalid slots (blocked/full/conflict) dimmed
- [ ] Clicking valid slot completes move/copy
- [ ] Clicking partial slot shows confirmation dialog
- [ ] ESC key cancels placement mode
- [ ] Cancel button in banner cancels placement mode

'use client'

import { Link2 } from 'lucide-react'
import { cn } from '@clubvantage/ui'

interface PartyChipPrefixProps {
  partyName: string
  className?: string
}

interface PartyConnectorProps {
  partyId: string
  slotIndices: number[] // Which row indices belong to this party
}

interface PartyBannerProps {
  party: {
    id: string
    name: string
    slotCount: number
    totalPlayers: number
  }
  onViewParty: (partyId: string) => void
}

/**
 * Prefix component for booking chips that are part of a party.
 * Shows chain icon and party name before player names.
 * Example: [🔗 Smith Wedding: John, Mary, Tom, Sue]
 */
export function PartyChipPrefix({ partyName, className }: PartyChipPrefixProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-indigo-700', className)}>
      <Link2 className="h-3.5 w-3.5 shrink-0" />
      <span className="font-medium">{partyName}:</span>
    </span>
  )
}

/**
 * Vertical connector line that visually links consecutive party slots on the tee sheet.
 * Renders a 3px indigo bar on the left side spanning from first to last party slot.
 */
export function PartyConnector({ partyId, slotIndices }: PartyConnectorProps) {
  if (slotIndices.length === 0) {
    return null
  }

  const minIndex = Math.min(...slotIndices)
  const maxIndex = Math.max(...slotIndices)
  const spanCount = maxIndex - minIndex + 1

  return (
    <div
      data-party-id={partyId}
      className="absolute left-0 top-0 w-[3px] bg-indigo-400"
      style={{
        // Spans the full height of all connected slots
        height: `${spanCount * 100}%`,
      }}
      aria-hidden="true"
    />
  )
}

/**
 * Banner displayed in the booking modal when a booking is part of a party.
 * Shows party name, slot count, total players, and a link to view the entire party.
 */
export function PartyBanner({ party, onViewParty }: PartyBannerProps) {
  return (
    <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
      <div className="flex items-start gap-2">
        <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-700" />
        <div className="flex-1">
          <p className="text-sm text-indigo-800">
            <span className="font-medium">Part of: {party.name}</span>
            <span className="ml-1 text-indigo-600">
              ({party.slotCount} {party.slotCount === 1 ? 'slot' : 'slots'}, {party.totalPlayers}{' '}
              {party.totalPlayers === 1 ? 'player' : 'players'})
            </span>
          </p>
          <button
            type="button"
            onClick={() => onViewParty(party.id)}
            className="mt-1 text-sm text-indigo-600 hover:underline"
          >
            View Entire Party
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { cn } from '@clubvantage/ui'
import { Users, UserPlus } from 'lucide-react'
import type { BookingGroup, Player } from './types'

export type BookingType = 'add' | 'new'

interface BookingTypeSelectorProps {
  value: BookingType
  onChange: (value: BookingType) => void
  existingGroups: BookingGroup[]
  existingPlayers: (Player | null)[]
}

export function BookingTypeSelector({
  value,
  onChange,
  existingGroups,
  existingPlayers,
}: BookingTypeSelectorProps) {
  const filledPlayers = existingPlayers.filter((p): p is Player => p !== null)
  const hasExistingBooking = filledPlayers.length > 0
  const existingGroupCount = existingGroups.length

  if (!hasExistingBooking) return null

  // Get players from the first booking group only (Group 1)
  // When adding to existing booking, new players join Group 1
  const firstGroup = existingGroups[0]
  const firstGroupPlayers = firstGroup
    ? filledPlayers.filter(p =>
        p.groupId === 1 ||
        firstGroup.playerIds.includes(p.id) ||
        // If no groupId set, include if only one group exists
        (!p.groupId && existingGroupCount <= 1)
      )
    : filledPlayers

  const getExistingGroupInfo = () => {
    if (existingGroupCount === 0 || existingGroupCount === 1) {
      const primaryBooker = firstGroup?.bookedBy
      return {
        label: primaryBooker ? `${primaryBooker.name}'s booking` : 'Existing booking',
        playerCount: firstGroupPlayers.length,
      }
    }
    return {
      label: `${existingGroupCount} existing groups`,
      playerCount: firstGroupPlayers.length,
    }
  }

  const existingInfo = getExistingGroupInfo()

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-muted-foreground">
        Booking Type
      </label>
      <div className="grid grid-cols-2 gap-3">
        {/* Add to existing booking */}
        <button
          type="button"
          onClick={() => onChange('add')}
          className={cn(
            'relative flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left',
            value === 'add'
              ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
              : 'border-border hover:border-muted-foreground/30'
          )}
        >
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg mb-3',
            value === 'add'
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          )}>
            <UserPlus className="h-5 w-5" />
          </div>
          <span className="font-semibold text-sm text-foreground">
            Add to existing booking
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            Join {existingInfo.label}
          </span>
          {value === 'add' && (
            <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
          )}
        </button>

        {/* Create new booking */}
        <button
          type="button"
          onClick={() => onChange('new')}
          className={cn(
            'relative flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left',
            value === 'new'
              ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
              : 'border-border hover:border-muted-foreground/30'
          )}
        >
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg mb-3',
            value === 'new'
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          )}>
            <Users className="h-5 w-5" />
          </div>
          <span className="font-semibold text-sm text-foreground">
            Create new booking
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            Separate group in same slot
          </span>
          {value === 'new' && (
            <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
          )}
        </button>
      </div>

      {/* Existing group info when "add" is selected */}
      {value === 'add' && hasExistingBooking && (
        <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-3 border border-blue-200 dark:border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-sm bg-blue-500" />
            <div className="text-xs font-medium text-blue-700 dark:text-blue-400">
              Existing Booking
            </div>
          </div>
          <div className="space-y-1 pl-3">
            {firstGroupPlayers.map((player) => (
              <div key={player.id} className="text-sm text-foreground">
                {player.name}
              </div>
            ))}
          </div>
          {firstGroup?.bookedBy && (
            <div className="text-xs text-muted-foreground mt-2 pl-3">
              Booked by {firstGroup.bookedBy.name}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

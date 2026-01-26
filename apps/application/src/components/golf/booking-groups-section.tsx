'use client'

import { cn } from '@clubvantage/ui'
import { Users } from 'lucide-react'
import type { BookingGroup, Player } from './types'

interface BookingGroupsSectionProps {
  bookingGroups: BookingGroup[]
  players: (Player | null)[]
}

function getGroupColor(groupNumber: 1 | 2): { bg: string; border: string; text: string; indicator: string } {
  if (groupNumber === 1) {
    return {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-200 dark:border-blue-500/30',
      text: 'text-blue-700 dark:text-blue-400',
      indicator: 'bg-blue-500',
    }
  }
  return {
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    border: 'border-purple-200 dark:border-purple-500/30',
    text: 'text-purple-700 dark:text-purple-400',
    indicator: 'bg-purple-500',
  }
}

export function BookingGroupsSection({ bookingGroups, players }: BookingGroupsSectionProps) {
  if (bookingGroups.length <= 1) return null

  const getPlayersForGroup = (group: BookingGroup): Player[] => {
    return players.filter((p): p is Player => p !== null && group.playerIds.includes(p.id))
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border/60 bg-card/80 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />

      <div className="relative p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200/50 shadow-inner">
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Booking Groups</h3>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {bookingGroups.length} groups
          </span>
        </div>

        <div className="space-y-3">
          {bookingGroups.map((group) => {
            const colors = getGroupColor(group.groupNumber)
            const groupPlayers = getPlayersForGroup(group)

            return (
              <div
                key={group.id}
                className={cn(
                  'relative rounded-lg border p-3',
                  colors.bg,
                  colors.border
                )}
              >
                {/* Group indicator bar */}
                <div className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-lg', colors.indicator)} />

                <div className="pl-2">
                  {/* Group header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn('text-sm font-semibold', colors.text)}>
                      Group {group.groupNumber}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {groupPlayers.length} player{groupPlayers.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Player names */}
                  <div className="space-y-1 mb-2">
                    {groupPlayers.map((player) => (
                      <div key={player.id} className="text-sm text-foreground">
                        {player.name}
                      </div>
                    ))}
                  </div>

                  {/* Booked by attribution */}
                  <div className="text-xs text-muted-foreground">
                    Booked by <span className="font-medium">{group.bookedBy.name}</span>
                    {group.bookedBy.memberId && (
                      <span className="ml-1">({group.bookedBy.memberId})</span>
                    )}
                  </div>

                  {/* Preferences */}
                  {group.preferences && (group.preferences.stayTogether || group.preferences.openToPairing) && (
                    <div className="flex items-center gap-2 mt-2">
                      {group.preferences.stayTogether && (
                        <span className="text-xs bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">
                          Stay together
                        </span>
                      )}
                      {group.preferences.openToPairing && (
                        <span className="text-xs bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">
                          Open to pairing
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

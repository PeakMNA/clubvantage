'use client'

import { useMemo, memo, useCallback } from 'react'
import { cn } from '@clubvantage/ui'
import { PlayerBlock, PlayerBlockGroup, type PlayerBlockStatus, type PlayerBlockType } from './player-block'
import { PlayerBlockPopover, BookedPlayerBlock } from './player-block-popover'
import type { PlayerType } from './types'
import type { WeekViewSlot, WeekViewPosition, NineType } from './types'

// Rule: rerender-memo-with-default-value - Hoist default prop values outside component
const EMPTY_SLOTS: WeekViewSlot[] = []
const FRONT_NINE: NineType[] = ['FRONT']
const BOTH_NINES: NineType[] = ['FRONT', 'BACK']

interface TeeSheetWeekViewProps {
  startDate: Date
  weekViewSlots?: WeekViewSlot[]
  onDayClick: (date: Date) => void
  onSlotClick?: (date: Date, time: string, nine: NineType, position?: number, slot?: WeekViewSlot) => void
  onPlayerClick?: (player: {
    id: string
    name: string
    type: PlayerType
    memberId?: string
  }, date: Date, time: string, nine: NineType, position: number) => void
  onPlayerEdit?: (playerId: string, date: Date, time: string, nine: NineType) => void
  onPlayerRemove?: (playerId: string, date: Date, time: string, nine: NineType) => void
  onViewMember?: (memberId: string) => void
  isLoading?: boolean
  /** First tee time (default: 06:00) */
  firstTeeTime?: string
  /** Last tee time (default: 17:00) */
  lastTeeTime?: string
  /** Interval in minutes (default: 8) */
  interval?: number
  /** Enable crossover mode - shows Front 9 and Back 9 rows */
  crossoverMode?: boolean
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0] as string
}

// Convert 24h time to 12h display format
function formatDisplayTime(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number)
  const displayHour = hours! > 12 ? hours! - 12 : hours === 0 ? 12 : hours!
  const ampm = hours! >= 12 ? 'PM' : 'AM'
  return `${displayHour}:${minutes?.toString().padStart(2, '0')} ${ampm}`
}

// Map PlayerType to PlayerBlockType letter
const playerTypeLetters: Record<string, PlayerBlockType> = {
  MEMBER: 'M',
  GUEST: 'G',
  DEPENDENT: 'D',
  WALK_UP: 'W',
}

// Convert PositionStatusType to PlayerBlockStatus (both use UPPER_CASE now)
function mapPositionStatus(status: string): PlayerBlockStatus {
  switch (status) {
    case 'AVAILABLE': return 'AVAILABLE'
    case 'BOOKED': return 'BOOKED'
    case 'BLOCKED': return 'BLOCKED'
    default: return 'AVAILABLE'
  }
}

export const TeeSheetWeekView = memo(function TeeSheetWeekView({
  startDate,
  weekViewSlots = EMPTY_SLOTS,
  onDayClick,
  onSlotClick,
  onPlayerEdit,
  onPlayerRemove,
  onViewMember,
  isLoading,
  firstTeeTime = '06:00',
  lastTeeTime = '17:00',
  interval = 8,
  crossoverMode = true,
}: TeeSheetWeekViewProps) {
  // Rule: rerender-lazy-state-init - Memoize expensive date computations
  // Generate 7 days from start date
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      return date
    })
  }, [startDate])

  // Rule: js-cache-function-results - Memoize today's date key (only changes once per day)
  const today = useMemo(() => formatDateKey(new Date()), [])

  // Rule: js-index-maps - Build Map for O(1) lookups (already correctly implemented)
  const slotsMap = useMemo(() => {
    const map = new Map<string, WeekViewSlot>()
    for (const slot of weekViewSlots) {
      const key = `${slot.date}|${slot.time}|${slot.nine}`
      map.set(key, slot)
    }
    return map
  }, [weekViewSlots])

  // Rule: rerender-simple-expression-in-memo - Simple boolean check, no memo needed
  const hasOccupancyData = weekViewSlots.length > 0

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots: string[] = []
    const [startHour = 6, startMin = 0] = firstTeeTime.split(':').map(Number)
    const [endHour = 17, endMin = 0] = lastTeeTime.split(':').map(Number)

    let currentHour = startHour
    let currentMin = startMin

    while (currentHour < endHour || (currentHour === endHour && currentMin <= endMin)) {
      slots.push(`${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`)

      currentMin += interval
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60)
        currentMin = currentMin % 60
      }
    }

    return slots
  }, [firstTeeTime, lastTeeTime, interval])

  // Rule: rerender-memo-with-default-value - Use hoisted constants
  const nines = crossoverMode ? BOTH_NINES : FRONT_NINE

  // Rule: rerender-functional-setstate - Stable callback with useCallback
  const handlePositionClick = useCallback((date: Date, time: string, nine: NineType, position: number, slot?: WeekViewSlot) => {
    const positionData = slot?.positions.find(p => p.position === position)

    if (!positionData || positionData.status === 'AVAILABLE') {
      // Available slot - open booking modal, pass slot so parent can check for existing bookings
      onSlotClick?.(date, time, nine, position, slot)
    }
    // For booked positions, the popover handles the click
  }, [onSlotClick])

  return (
    <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          {/* Header */}
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20 sticky left-0 bg-muted/50 z-10">
                Time
              </th>
              {crossoverMode && (
                <th className="px-1 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-6 sticky left-[80px] bg-muted/50 z-10">
                  9
                </th>
              )}
              {days.map((date) => {
                const dateKey = formatDateKey(date)
                const isToday = dateKey === today

                return (
                  <th
                    key={dateKey}
                    onClick={() => onDayClick(date)}
                    className={cn(
                      'px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-muted transition-colors min-w-[120px]',
                      isToday && 'ring-2 ring-inset ring-blue-500'
                    )}
                  >
                    <div className="text-muted-foreground">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={cn('text-lg font-bold', isToday ? 'text-blue-600' : 'text-foreground')}>
                      {date.getDate()}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b">
                  <td className="px-3 py-2 sticky left-0 bg-card z-10">
                    <div className="h-4 w-14 bg-muted rounded animate-pulse" />
                  </td>
                  {crossoverMode && (
                    <td className="px-1 py-2 sticky left-[80px] bg-card z-10">
                      <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                    </td>
                  )}
                  {days.map((_, colIndex) => (
                    <td key={colIndex} className="px-2 py-2">
                      <div className="h-6 bg-muted/50 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              timeSlots.map((time) =>
                nines.map((nine, nineIndex) => (
                  <tr
                    key={`${time}-${nine}`}
                    className={cn(
                      'border-b hover:bg-muted/30',
                      nineIndex === nines.length - 1 && 'border-b-2 border-stone-200'
                    )}
                  >
                    {/* Time column - only show on first row of each time slot */}
                    {nineIndex === 0 ? (
                      <td
                        rowSpan={nines.length}
                        className="px-3 py-2 text-sm font-medium text-muted-foreground whitespace-nowrap sticky left-0 bg-card z-10 align-top"
                      >
                        {formatDisplayTime(time)}
                      </td>
                    ) : null}

                    {/* Nine indicator column */}
                    {crossoverMode && (
                      <td className="px-1 py-1 text-[10px] font-semibold text-muted-foreground sticky left-[80px] bg-card z-10">
                        {nine === 'FRONT' ? 'F' : 'B'}
                      </td>
                    )}

                    {/* Day cells with player blocks */}
                    {days.map((date) => {
                      const dateKey = formatDateKey(date)
                      const slotKey = `${dateKey}|${time}|${nine}`
                      const slot = slotsMap.get(slotKey)

                      return (
                        <td key={dateKey} className="px-2 py-1">
                          <div className="flex items-center justify-center gap-0.5">
                            {hasOccupancyData && slot ? (
                              // Render 4 player blocks using data from the query
                              slot.positions.map((pos) => {
                                const blockStatus = mapPositionStatus(pos.status)
                                const playerType = pos.player ? (playerTypeLetters[pos.player.type] || 'M') : undefined

                                if (pos.status === 'BOOKED' && pos.player) {
                                  // Booked position - show with popover
                                  return (
                                    <BookedPlayerBlock
                                      key={pos.position}
                                      position={pos.position}
                                      player={{
                                        id: pos.player.id,
                                        name: pos.player.name,
                                        type: pos.player.type,
                                        memberId: pos.player.memberId,
                                      }}
                                      onEdit={() => onPlayerEdit?.(pos.player!.id, date, time, nine)}
                                      onViewMember={pos.player.memberId ? () => onViewMember?.(pos.player!.memberId!) : undefined}
                                      onRemove={() => onPlayerRemove?.(pos.player!.id, date, time, nine)}
                                    />
                                  )
                                }

                                // Available or blocked position
                                return (
                                  <PlayerBlock
                                    key={pos.position}
                                    status={blockStatus}
                                    playerType={playerType}
                                    onClick={
                                      blockStatus === 'AVAILABLE'
                                        ? () => handlePositionClick(date, time, nine, pos.position, slot)
                                        : undefined
                                    }
                                    disabled={blockStatus === 'BLOCKED'}
                                  />
                                )
                              })
                            ) : (
                              // No data yet - show 4 empty available blocks
                              <PlayerBlockGroup
                                positions={[
                                  { status: 'AVAILABLE' },
                                  { status: 'AVAILABLE' },
                                  { status: 'AVAILABLE' },
                                  { status: 'AVAILABLE' },
                                ]}
                                onPositionClick={(pos) => handlePositionClick(date, time, nine, pos + 1)}
                              />
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="border-t px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="text-muted-foreground font-medium">Legend:</span>
        <div className="flex items-center gap-2">
          <PlayerBlock status="AVAILABLE" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <PlayerBlock status="BOOKED" playerType="M" />
          <span>Member</span>
        </div>
        <div className="flex items-center gap-2">
          <PlayerBlock status="BOOKED" playerType="G" />
          <span>Guest</span>
        </div>
        <div className="flex items-center gap-2">
          <PlayerBlock status="BOOKED" playerType="D" />
          <span>Dependent</span>
        </div>
        <div className="flex items-center gap-2">
          <PlayerBlock status="BOOKED" playerType="W" />
          <span>Walk-up</span>
        </div>
        <div className="flex items-center gap-2">
          <PlayerBlock status="BLOCKED" />
          <span>Blocked</span>
        </div>
      </div>
    </div>
  )
})

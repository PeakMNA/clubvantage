'use client'

import { useMemo } from 'react'
import { cn } from '@clubvantage/ui'
import type { AvailabilityLevel, DayAvailability, TimeSlotOccupancy, SlotPositionStatus } from './types'

interface TeeSheetWeekViewProps {
  startDate: Date
  availability?: DayAvailability[]
  slotOccupancy?: TimeSlotOccupancy[]
  onDayClick: (date: Date) => void
  onSlotClick?: (date: Date, time: string) => void
  isLoading?: boolean
  /** First tee time (default: 06:00) */
  firstTeeTime?: string
  /** Last tee time (default: 17:00) */
  lastTeeTime?: string
  /** Interval in minutes (default: 8) */
  interval?: number
}

function getAvailabilityStyles(level: AvailabilityLevel): string {
  switch (level) {
    case 'open': return 'bg-emerald-100 hover:bg-emerald-200'
    case 'limited': return 'bg-amber-100 hover:bg-amber-200'
    case 'full': return 'bg-blue-100 hover:bg-blue-200'
    case 'blocked': return 'bg-muted cursor-not-allowed'
    default: return 'bg-muted/50'
  }
}

function getPositionStyle(status: SlotPositionStatus): string {
  switch (status) {
    case 'available': return 'bg-emerald-200 border-emerald-300'
    case 'occupied': return 'bg-blue-400 border-blue-500'
    case 'blocked': return 'bg-muted border-border bg-stripes'
    default: return 'bg-muted/50 border-border'
  }
}

interface SlotIndicatorProps {
  positions: [SlotPositionStatus, SlotPositionStatus, SlotPositionStatus, SlotPositionStatus]
  isBlocked?: boolean
  onClick?: () => void
}

function SlotIndicator({ positions, isBlocked, onClick }: SlotIndicatorProps) {
  if (isBlocked) {
    return (
      <div className="w-full h-6 rounded bg-muted cursor-not-allowed flex items-center justify-center">
        <div className="grid grid-cols-4 gap-0.5">
          {positions.map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-4 rounded-sm bg-muted border border-border"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)'
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      className="w-full h-6 rounded bg-card hover:bg-muted/50 transition-colors flex items-center justify-center border border-border"
    >
      <div className="grid grid-cols-4 gap-0.5">
        {positions.map((status, i) => (
          <div
            key={i}
            className={cn(
              'w-2.5 h-4 rounded-sm border transition-colors',
              getPositionStyle(status)
            )}
            style={status === 'blocked' ? {
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)'
            } : undefined}
          />
        ))}
      </div>
    </button>
  )
}

function getAvailabilityLabel(level: AvailabilityLevel): string {
  switch (level) {
    case 'open': return '4 of 4 available'
    case 'limited': return '1-3 of 4 available'
    case 'full': return 'All positions booked'
    case 'blocked': return 'Blocked'
    default: return ''
  }
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0] as string
}

export function TeeSheetWeekView({
  startDate,
  availability = [],
  slotOccupancy = [],
  onDayClick,
  onSlotClick,
  isLoading,
  firstTeeTime = '06:00',
  lastTeeTime = '17:00',
  interval = 8,
}: TeeSheetWeekViewProps) {
  // Generate 7 days from start date
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    return date
  })

  const today = formatDateKey(new Date())

  // Convert availability array to Map for efficient lookup
  const availabilityMap = useMemo(() => {
    return new Map(availability.map(a => [a.date, a]))
  }, [availability])

  // Convert slot occupancy to Map for efficient lookup (key: "date|time")
  const occupancyMap = useMemo(() => {
    return new Map(slotOccupancy.map(s => [`${s.date}|${s.time}`, s]))
  }, [slotOccupancy])

  const hasOccupancyData = slotOccupancy.length > 0

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots: string[] = []
    const [startHour = 6, startMin = 0] = firstTeeTime.split(':').map(Number)
    const [endHour = 17, endMin = 0] = lastTeeTime.split(':').map(Number)

    let currentHour = startHour
    let currentMin = startMin

    while (currentHour < endHour || (currentHour === endHour && currentMin <= endMin)) {
      const displayHour = currentHour > 12 ? currentHour - 12 : currentHour === 0 ? 12 : currentHour
      const ampm = currentHour >= 12 ? 'PM' : 'AM'
      slots.push(`${displayHour}:${currentMin.toString().padStart(2, '0')} ${ampm}`)

      currentMin += interval
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60)
        currentMin = currentMin % 60
      }
    }

    return slots
  }, [firstTeeTime, lastTeeTime, interval])

  // Get availability level for a specific day
  const getDayAvailability = (date: Date): AvailabilityLevel => {
    const dateKey = formatDateKey(date)
    const dayData = availabilityMap.get(dateKey)
    return dayData?.level || 'open'
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          {/* Header */}
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20 sticky left-0 bg-muted/50">
                Time
              </th>
              {days.map((date) => {
                const dateKey = formatDateKey(date)
                const isToday = dateKey === today

                return (
                  <th
                    key={dateKey}
                    onClick={() => onDayClick(date)}
                    className={cn(
                      'px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-muted transition-colors min-w-[100px]',
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
                  <td className="px-3 py-2 sticky left-0 bg-card">
                    <div className="h-4 w-14 bg-muted rounded animate-pulse" />
                  </td>
                  {days.map((_, colIndex) => (
                    <td key={colIndex} className="px-2 py-2">
                      <div className="h-6 bg-muted/50 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              timeSlots.map((time) => (
                <tr key={time} className="border-b hover:bg-muted/50/50">
                  <td className="px-3 py-2 text-sm font-medium text-muted-foreground whitespace-nowrap sticky left-0 bg-card">
                    {time}
                  </td>
                  {days.map((date) => {
                    const dateKey = formatDateKey(date)
                    const dayAvailability = getDayAvailability(date)
                    const slotKey = `${dateKey}|${time}`
                    const slotData = occupancyMap.get(slotKey)

                    return (
                      <td key={dateKey} className="px-2 py-1">
                        {hasOccupancyData && slotData ? (
                          <SlotIndicator
                            positions={slotData.positions}
                            isBlocked={slotData.isBlocked}
                            onClick={() => !slotData.isBlocked && onSlotClick?.(date, time)}
                          />
                        ) : (
                          <button
                            onClick={() => dayAvailability !== 'blocked' && onSlotClick?.(date, time)}
                            disabled={dayAvailability === 'blocked'}
                            title={getAvailabilityLabel(dayAvailability)}
                            className={cn(
                              'w-full h-6 rounded transition-colors',
                              getAvailabilityStyles(dayAvailability)
                            )}
                          />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="border-t px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="text-muted-foreground font-medium">Legend:</span>
        {hasOccupancyData ? (
          <>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <span className="w-2.5 h-4 rounded-sm bg-emerald-200 border border-emerald-300" />
                <span className="w-2.5 h-4 rounded-sm bg-emerald-200 border border-emerald-300" />
                <span className="w-2.5 h-4 rounded-sm bg-emerald-200 border border-emerald-300" />
                <span className="w-2.5 h-4 rounded-sm bg-emerald-200 border border-emerald-300" />
              </div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <span className="w-2.5 h-4 rounded-sm bg-blue-400 border border-blue-500" />
                <span className="w-2.5 h-4 rounded-sm bg-blue-400 border border-blue-500" />
                <span className="w-2.5 h-4 rounded-sm bg-emerald-200 border border-emerald-300" />
                <span className="w-2.5 h-4 rounded-sm bg-emerald-200 border border-emerald-300" />
              </div>
              <span>Partial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <span className="w-2.5 h-4 rounded-sm bg-blue-400 border border-blue-500" />
                <span className="w-2.5 h-4 rounded-sm bg-blue-400 border border-blue-500" />
                <span className="w-2.5 h-4 rounded-sm bg-blue-400 border border-blue-500" />
                <span className="w-2.5 h-4 rounded-sm bg-blue-400 border border-blue-500" />
              </div>
              <span>Full</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <span
                  className="w-2.5 h-4 rounded-sm bg-muted border border-border"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }}
                />
                <span
                  className="w-2.5 h-4 rounded-sm bg-muted border border-border"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }}
                />
                <span
                  className="w-2.5 h-4 rounded-sm bg-muted border border-border"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }}
                />
                <span
                  className="w-2.5 h-4 rounded-sm bg-muted border border-border"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }}
                />
              </div>
              <span>Blocked</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-emerald-100" />
              <span>Open</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-amber-100" />
              <span>Partial</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-blue-100" />
              <span>Full</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-muted" />
              <span>Blocked</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

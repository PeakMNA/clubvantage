'use client'

import { useState, useMemo } from 'react'
import { cn } from '@clubvantage/ui'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import type { DayAvailability, AvailabilityLevel } from './types'

interface TeeSheetMonthViewProps {
  /** Current month to display */
  currentMonth: Date
  /** Availability data for days */
  availability?: DayAvailability[]
  /** Called when a day is clicked */
  onDayClick: (date: Date) => void
  /** Called when month changes via navigation */
  onMonthChange?: (date: Date) => void
  /** Loading state */
  isLoading?: boolean
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0] as string
}

function getOccupancyColor(bookedSlots: number, totalSlots: number): {
  bg: string
  text: string
  label: string
} {
  if (totalSlots === 0) {
    return { bg: 'bg-stone-100', text: 'text-stone-500', label: 'No data' }
  }
  const percent = (bookedSlots / totalSlots) * 100
  if (percent === 0) {
    return { bg: 'bg-stone-50', text: 'text-stone-400', label: 'Empty' }
  }
  if (percent < 30) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Low' }
  }
  if (percent < 60) {
    return { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Moderate' }
  }
  if (percent < 85) {
    return { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Busy' }
  }
  return { bg: 'bg-red-50', text: 'text-red-700', label: 'Full' }
}

function getProgressColor(bookedSlots: number, totalSlots: number): string {
  if (totalSlots === 0) return 'bg-stone-300'
  const percent = (bookedSlots / totalSlots) * 100
  if (percent === 0) return 'bg-stone-200'
  if (percent < 30) return 'bg-emerald-500'
  if (percent < 60) return 'bg-blue-500'
  if (percent < 85) return 'bg-amber-500'
  return 'bg-red-500'
}

export function TeeSheetMonthView({
  currentMonth,
  availability = [],
  onDayClick,
  onMonthChange,
  isLoading,
}: TeeSheetMonthViewProps) {
  const [viewMonth, setViewMonth] = useState(currentMonth)

  // Convert availability array to Map for efficient lookup
  const availabilityMap = useMemo(() => {
    return new Map(availability.map(a => [a.date, a]))
  }, [availability])

  const goToPrevMonth = () => {
    const newDate = new Date(viewMonth)
    newDate.setMonth(newDate.getMonth() - 1)
    setViewMonth(newDate)
    onMonthChange?.(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(viewMonth)
    newDate.setMonth(newDate.getMonth() + 1)
    setViewMonth(newDate)
    onMonthChange?.(newDate)
  }

  // Generate calendar days
  const firstDayOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
  const lastDayOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0)
  const startDay = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const calendarDays: (Date | null)[] = []

  // Previous month padding
  for (let i = 0; i < startDay; i++) {
    const date = new Date(firstDayOfMonth)
    date.setDate(date.getDate() - (startDay - i))
    calendarDays.push(date)
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i))
  }

  // Next month padding
  const remaining = 42 - calendarDays.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(lastDayOfMonth)
    date.setDate(date.getDate() + i)
    calendarDays.push(date)
  }

  const isCurrentMonth = (date: Date) => date.getMonth() === viewMonth.getMonth()
  const isToday = (date: Date) => formatDateKey(date) === formatDateKey(new Date())

  return (
    <div className="bg-card rounded-lg shadow-sm border">
      {/* Month Navigation */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={goToPrevMonth}
          className="p-2 hover:bg-muted rounded-md transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold">
          {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-muted rounded-md transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b">
        {DAYS.map((day) => (
          <div
            key={day}
            className="px-2 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, index) => {
          if (!date) return <div key={index} className="h-24 border-b border-r" />

          const dateKey = formatDateKey(date)
          const data = availabilityMap.get(dateKey)
          const isBlockedDay = data?.level === 'BLOCKED'
          const bookedSlots = data?.bookedSlots || 0
          const totalSlots = data?.totalSlots || 0
          const playerCount = data?.playerCount || 0
          const occupancyPercent = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0
          const occupancyStyle = getOccupancyColor(bookedSlots, totalSlots)

          return (
            <button
              key={index}
              onClick={() => onDayClick(date)}
              disabled={isBlockedDay}
              className={cn(
                'h-24 p-2 border-b border-r text-left transition-colors flex flex-col',
                !isCurrentMonth(date) && 'bg-muted/30 text-muted-foreground/50',
                isCurrentMonth(date) && !isBlockedDay && 'hover:bg-muted/50',
                isToday(date) && 'ring-2 ring-inset ring-amber-500',
                isBlockedDay && 'bg-stone-100 cursor-not-allowed'
              )}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between">
                <span className={cn(
                  'text-sm font-semibold',
                  isToday(date) && 'text-amber-600'
                )}>
                  {date.getDate()}
                </span>
                {isToday(date) && (
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                    Today
                  </span>
                )}
              </div>

              {isLoading && isCurrentMonth(date) ? (
                <div className="mt-auto space-y-1.5">
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-1.5 w-full bg-muted/50 rounded animate-pulse" />
                </div>
              ) : data && data.totalSlots > 0 && isCurrentMonth(date) ? (
                <div className="mt-auto space-y-1">
                  {/* Booking Stats */}
                  {isBlockedDay ? (
                    <span className="text-xs text-stone-500 font-medium">Blocked</span>
                  ) : (
                    <>
                      {/* Show player count prominently */}
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-stone-400" />
                        <span className={cn('text-xs font-medium', occupancyStyle.text)}>
                          {playerCount > 0 ? `${playerCount} players` : 'No bookings'}
                        </span>
                      </div>

                      {/* Slots info */}
                      <div className="flex items-center justify-between text-[10px] text-stone-500">
                        <span>{bookedSlots}/{totalSlots} slots</span>
                        <span>{Math.round(occupancyPercent)}%</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', getProgressColor(bookedSlots, totalSlots))}
                          style={{ width: `${Math.max(occupancyPercent, bookedSlots > 0 ? 5 : 0)}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              ) : isCurrentMonth(date) ? (
                <div className="mt-auto">
                  <span className="text-[10px] text-stone-400">No data</span>
                </div>
              ) : (
                <div className="mt-auto">
                  <span className="text-[10px] text-stone-400">—</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="border-t px-4 py-3 flex flex-wrap items-center gap-6 text-xs">
        <span className="text-stone-600 font-medium">Occupancy:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-1.5 rounded bg-stone-200" />
          <span className="text-stone-500">Empty</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-1.5 rounded bg-emerald-500" />
          <span className="text-stone-500">&lt; 30%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-1.5 rounded bg-blue-500" />
          <span className="text-stone-500">30-60%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-1.5 rounded bg-amber-500" />
          <span className="text-stone-500">60-85%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-1.5 rounded bg-red-500" />
          <span className="text-stone-500">&gt; 85%</span>
        </div>
      </div>
    </div>
  )
}

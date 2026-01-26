'use client'

import { useState, useMemo } from 'react'
import { cn } from '@clubvantage/ui'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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

function getAvailabilityLabel(level: AvailabilityLevel): string {
  switch (level) {
    case 'open': return 'Open'
    case 'limited': return 'Limited'
    case 'full': return 'Full'
    case 'blocked': return 'Blocked'
    default: return ''
  }
}

function getProgressColor(available: number, total: number): string {
  const percent = total > 0 ? ((total - available) / total) * 100 : 0
  if (percent < 50) return 'bg-emerald-500'
  if (percent < 80) return 'bg-amber-500'
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
          if (!date) return <div key={index} className="h-20 border-b border-r" />

          const dateKey = formatDateKey(date)
          const data = availabilityMap.get(dateKey)
          const isBlockedDay = data?.level === 'blocked'
          const occupancyPercent = data ? ((data.totalSlots - data.availableSlots) / data.totalSlots) * 100 : 0

          return (
            <button
              key={index}
              onClick={() => onDayClick(date)}
              disabled={isBlockedDay}
              className={cn(
                'h-20 p-2 border-b border-r text-left transition-colors flex flex-col',
                !isCurrentMonth(date) && 'bg-muted/50 text-muted-foreground/60',
                isCurrentMonth(date) && !isBlockedDay && 'hover:bg-muted/50',
                isToday(date) && 'ring-2 ring-inset ring-blue-500',
                isBlockedDay && 'bg-muted/50 cursor-not-allowed'
              )}
            >
              {/* Day Number */}
              <span className="text-sm font-medium">
                {date.getDate()}
              </span>

              {isLoading ? (
                <div className="mt-auto space-y-1">
                  <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                  <div className="h-1.5 w-full bg-muted/50 rounded animate-pulse" />
                </div>
              ) : data ? (
                <div className="mt-auto space-y-1">
                  {/* Status Label */}
                  <span className={cn(
                    'text-xs',
                    isBlockedDay ? 'text-muted-foreground' : 'text-muted-foreground'
                  )}>
                    {getAvailabilityLabel(data.level)}
                  </span>

                  {/* Progress Bar */}
                  {!isBlockedDay && (
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', getProgressColor(data.availableSlots, data.totalSlots))}
                        style={{ width: `${occupancyPercent}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="border-t px-4 py-3 flex flex-wrap items-center gap-4 text-sm">
        <span className="text-muted-foreground font-medium">Occupancy:</span>
        <div className="flex items-center gap-2">
          <span className="w-8 h-1.5 rounded bg-emerald-500" />
          <span>&lt; 50%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-1.5 rounded bg-amber-500" />
          <span>50-80%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-1.5 rounded bg-red-500" />
          <span>&gt; 80%</span>
        </div>
      </div>
    </div>
  )
}

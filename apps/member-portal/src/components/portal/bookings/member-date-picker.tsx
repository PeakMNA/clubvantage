'use client'

import { useState, useMemo } from 'react'
import { cn, Button } from '@clubvantage/ui'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

export interface DateAvailability {
  date: string // YYYY-MM-DD
  status: 'available' | 'limited' | 'unavailable'
  slotsCount?: number
}

export interface MemberDatePickerProps {
  selectedDate?: string // YYYY-MM-DD
  onSelectDate?: (date: string) => void
  availability?: DateAvailability[]
  minDate?: string
  maxDate?: string
  className?: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDate(dateStr: string): Date {
  const parts = dateStr.split('-').map(Number)
  const year = parts[0] ?? 2000
  const month = parts[1] ?? 1
  const day = parts[2] ?? 1
  return new Date(year, month - 1, day)
}

/**
 * MemberDatePicker (PRT-16)
 *
 * Calendar-style date picker with availability indicators for booking.
 */
export function MemberDatePicker({
  selectedDate,
  onSelectDate,
  availability = [],
  minDate,
  maxDate,
  className,
}: MemberDatePickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [viewMonth, setViewMonth] = useState(() => {
    if (selectedDate) {
      const date = parseDate(selectedDate)
      return { year: date.getFullYear(), month: date.getMonth() }
    }
    return { year: today.getFullYear(), month: today.getMonth() }
  })

  // Build availability map
  const availabilityMap = useMemo(() => {
    const map = new Map<string, DateAvailability>()
    availability.forEach((a) => map.set(a.date, a))
    return map
  }, [availability])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewMonth.year, viewMonth.month, 1)
    const lastDay = new Date(viewMonth.year, viewMonth.month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = []

    // Previous month days
    const prevMonthLastDay = new Date(viewMonth.year, viewMonth.month, 0).getDate()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(viewMonth.year, viewMonth.month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(viewMonth.year, viewMonth.month, i),
        isCurrentMonth: true,
      })
    }

    // Next month days
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(viewMonth.year, viewMonth.month + 1, i),
        isCurrentMonth: false,
      })
    }

    return days
  }, [viewMonth])

  const goToPrevMonth = () => {
    setViewMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 }
      }
      return { ...prev, month: prev.month - 1 }
    })
  }

  const goToNextMonth = () => {
    setViewMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 }
      }
      return { ...prev, month: prev.month + 1 }
    })
  }

  const isDateDisabled = (date: Date): boolean => {
    if (date < today) return true
    if (minDate && date < parseDate(minDate)) return true
    if (maxDate && date > parseDate(maxDate)) return true

    const dateKey = formatDateKey(date)
    const avail = availabilityMap.get(dateKey)
    if (avail && avail.status === 'unavailable') return true

    return false
  }

  const getDateStatus = (date: Date): 'available' | 'limited' | 'unavailable' | 'unknown' => {
    const dateKey = formatDateKey(date)
    const avail = availabilityMap.get(dateKey)
    return avail?.status ?? 'unknown'
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-sm font-semibold text-foreground">
          {MONTHS[viewMonth.month]} {viewMonth.year}
        </h3>
        <button
          type="button"
          onClick={goToNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAYS.map((day) => (
          <div key={day} className="py-1 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          const dateKey = formatDateKey(date)
          const isSelected = selectedDate === dateKey
          const isToday = formatDateKey(today) === dateKey
          const disabled = isDateDisabled(date) || !isCurrentMonth
          const status = getDateStatus(date)

          return (
            <button
              key={index}
              type="button"
              onClick={() => !disabled && onSelectDate?.(dateKey)}
              disabled={disabled}
              className={cn(
                'relative flex h-10 w-full items-center justify-center rounded-lg text-sm transition-all',
                isSelected
                  ? 'bg-amber-500 font-semibold text-white'
                  : isToday && !disabled
                  ? 'border border-amber-300 font-medium text-foreground dark:border-amber-500'
                  : !isCurrentMonth
                  ? 'text-muted-foreground/30'
                  : disabled
                  ? 'cursor-not-allowed text-muted-foreground/50'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {date.getDate()}

              {/* Availability indicator */}
              {isCurrentMonth && !disabled && !isSelected && (
                <span
                  className={cn(
                    'absolute bottom-1 h-1 w-1 rounded-full',
                    status === 'available' && 'bg-emerald-500',
                    status === 'limited' && 'bg-amber-500',
                    status === 'unknown' && 'bg-stone-300 dark:bg-stone-600'
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Available
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Limited
        </span>
      </div>
    </div>
  )
}

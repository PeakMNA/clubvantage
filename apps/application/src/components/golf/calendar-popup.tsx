'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@clubvantage/ui'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import type { AvailabilityLevel, DayAvailability } from './types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0] as string
}

function getAvailabilityColor(level: AvailabilityLevel): string {
  switch (level) {
    case 'OPEN': return 'bg-emerald-500'
    case 'LIMITED': return 'bg-amber-500'
    case 'FULL': return 'bg-red-500'
    case 'BLOCKED': return 'bg-muted-foreground'
    default: return 'bg-muted'
  }
}

interface DateNavigatorProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  availability?: DayAvailability[]
}

export function DateNavigator({ currentDate, onDateChange, availability }: DateNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(new Date(currentDate))
  const popupRef = useRef<HTMLDivElement>(null)

  // Convert array to Map for efficient lookup
  const availabilityMap = new Map(availability?.map(a => [a.date, a]) || [])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const goToPrevDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    onDateChange(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    onDateChange(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    setViewDate(today)
    onDateChange(today)
    setIsOpen(false)
  }

  const goToPrevMonth = () => {
    const newDate = new Date(viewDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setViewDate(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(viewDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setViewDate(newDate)
  }

  const handleDateClick = (date: Date) => {
    onDateChange(date)
    setIsOpen(false)
  }

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Generate calendar days
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const lastDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0)
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
    calendarDays.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), i))
  }

  // Next month padding to complete 42 cells (6 weeks)
  const remaining = 42 - calendarDays.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(lastDayOfMonth)
    date.setDate(date.getDate() + i)
    calendarDays.push(date)
  }

  const isCurrentMonth = (date: Date) => date.getMonth() === viewDate.getMonth()
  const isSelected = (date: Date) => formatDateKey(date) === formatDateKey(currentDate)
  const isToday = (date: Date) => formatDateKey(date) === formatDateKey(new Date())

  return (
    <div className="relative" ref={popupRef}>
      <div className="flex items-center gap-2">
        <button
          onClick={goToPrevDay}
          className="p-2 hover:bg-muted rounded-md transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 font-semibold hover:bg-muted rounded-md transition-colors flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          {formattedDate}
        </button>
        <button
          onClick={goToNextDay}
          className="p-2 hover:bg-muted rounded-md transition-colors"
          aria-label="Next day"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <button
          onClick={goToToday}
          className="px-3 py-1.5 text-sm border rounded-md hover:bg-muted/50 transition-colors"
        >
          Today
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-card rounded-lg shadow-lg border z-50 w-80">
          {/* Month Navigation */}
          <div className="flex items-center justify-between p-3 border-b">
            <button
              onClick={goToPrevMonth}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-semibold">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-0 px-2 pt-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="h-10 flex items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0 px-2 pb-2">
            {calendarDays.map((date, index) => {
              if (!date) return <div key={index} className="h-10" />

              const dateKey = formatDateKey(date)
              const dayAvailability = availabilityMap.get(dateKey)

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    'h-10 w-10 flex flex-col items-center justify-center rounded-full text-sm transition-colors relative',
                    !isCurrentMonth(date) && 'text-muted-foreground',
                    isCurrentMonth(date) && 'hover:bg-muted',
                    isSelected(date) && 'bg-primary text-primary-foreground hover:bg-primary/90',
                    isToday(date) && !isSelected(date) && 'ring-2 ring-primary'
                  )}
                >
                  {date.getDate()}
                  {dayAvailability && (
                    <span
                      className={cn(
                        'absolute bottom-1 w-1.5 h-1.5 rounded-full',
                        getAvailabilityColor(dayAvailability.level)
                      )}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="border-t p-2 flex justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Open</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Limited</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>Full</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// CalendarPopup is now deprecated, use DateNavigator instead
export const CalendarPopup = DateNavigator

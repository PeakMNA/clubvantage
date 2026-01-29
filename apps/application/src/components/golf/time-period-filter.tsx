'use client'

import { useMemo, memo, useCallback } from 'react'
import { cn } from '@clubvantage/ui'
import { Star, Clock } from 'lucide-react'
import type { TimePeriod } from '@/lib/golf/schedule-utils'

export interface TimePeriodFilterProps {
  periods: TimePeriod[]
  selectedPeriod: string | null // period ID or null for "All"
  onSelect: (periodId: string | null) => void
  className?: string
}

/**
 * Format time for display (12-hour format, compact)
 */
function formatTimeCompact(time: string): string {
  const parts = time.split(':')
  const hours = parts[0] ?? '0'
  const minutes = parts[1] ?? '00'
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'p' : 'a'
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${displayHour}${minutes === '00' ? '' : ':' + minutes}${ampm}`
}

interface FilterButtonProps {
  isActive: boolean
  onClick: () => void
  children: React.ReactNode
  isPrimeTime?: boolean
}

// Memoize FilterButton to prevent unnecessary re-renders
const FilterButton = memo(function FilterButton({ isActive, onClick, children, isPrimeTime }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200',
        'flex items-center gap-1.5 whitespace-nowrap',
        isActive
          ? isPrimeTime
            ? 'bg-amber-500 text-white shadow-sm'
            : 'bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-800 shadow-sm'
          : isPrimeTime
          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-700'
          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-600'
      )}
    >
      {children}
    </button>
  )
})

export const TimePeriodFilter = memo(function TimePeriodFilter({
  periods,
  selectedPeriod,
  onSelect,
  className,
}: TimePeriodFilterProps) {
  // Sort periods by sort order - memoize to avoid re-sorting on every render
  const sortedPeriods = useMemo(
    () => [...periods].sort((a, b) => a.sortOrder - b.sortOrder),
    [periods]
  )

  // Stable callback for "All" button - prevents FilterButton re-render
  const handleSelectAll = useCallback(() => onSelect(null), [onSelect])

  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto pb-1', className)}>
      <span className="text-sm text-stone-500 dark:text-stone-400 mr-1">Filter:</span>

      {/* All button */}
      <FilterButton
        isActive={selectedPeriod === null}
        onClick={handleSelectAll}
      >
        <Clock className="h-3.5 w-3.5" />
        All
      </FilterButton>

      {/* Period buttons */}
      {sortedPeriods.map((period) => (
        <PeriodButton
          key={period.id}
          period={period}
          isActive={selectedPeriod === period.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
})

// Extracted component to prevent inline callback on every render
// Rule: rerender-functional-setstate - stable callbacks
const PeriodButton = memo(function PeriodButton({
  period,
  isActive,
  onSelect,
}: {
  period: TimePeriod
  isActive: boolean
  onSelect: (id: string | null) => void
}) {
  const handleClick = useCallback(() => onSelect(period.id), [onSelect, period.id])

  return (
    <FilterButton
      isActive={isActive}
      onClick={handleClick}
      isPrimeTime={period.isPrimeTime}
    >
      {period.isPrimeTime && <Star className="h-3.5 w-3.5" />}
      {period.name}
      <span className="text-xs opacity-75">
        {formatTimeCompact(period.startTime)}
        {period.endTime && `-${formatTimeCompact(period.endTime)}`}
      </span>
    </FilterButton>
  )
})

/**
 * Hook to filter flights by time period
 */
export function useTimePeriodFilter<T extends { time: string }>(
  items: T[],
  periods: TimePeriod[],
  selectedPeriodId: string | null,
): T[] {
  if (selectedPeriodId === null) {
    return items
  }

  const period = periods.find((p) => p.id === selectedPeriodId)
  if (!period) {
    return items
  }

  return items.filter((item) => {
    // Parse the time from the item (handles both HH:MM and display formats like "7:00 AM")
    const itemTime = parseTimeToMinutes(item.time)
    const startTime = timeToMinutes(period.startTime)
    const endTime = period.endTime ? timeToMinutes(period.endTime) : 24 * 60 // End of day if null

    return itemTime >= startTime && itemTime < endTime
  })
}

/**
 * Parse time string to minutes (handles both HH:MM and 12-hour formats)
 */
function parseTimeToMinutes(time: string): number {
  // Check for 12-hour format (e.g., "7:00 AM", "1:30 PM")
  const match12Hour = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (match12Hour && match12Hour[1] && match12Hour[2] && match12Hour[3]) {
    let hours = parseInt(match12Hour[1])
    const minutes = parseInt(match12Hour[2])
    const isPM = match12Hour[3].toUpperCase() === 'PM'

    if (isPM && hours !== 12) hours += 12
    if (!isPM && hours === 12) hours = 0

    return hours * 60 + minutes
  }

  // Assume 24-hour format (HH:MM)
  return timeToMinutes(time)
}

function timeToMinutes(time: string): number {
  const parts = time.split(':').map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  return hours * 60 + minutes
}

/**
 * Get the scroll target for a time period
 * Returns the time string of the first slot in that period
 */
export function getScrollTargetForPeriod(
  period: TimePeriod,
): string {
  return period.startTime
}

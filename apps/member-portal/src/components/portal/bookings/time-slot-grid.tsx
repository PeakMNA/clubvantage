'use client'

import { cn, Button } from '@clubvantage/ui'
import { Clock, Users } from 'lucide-react'
import type { TimeSlot } from '@/lib/types'

export interface TimeSlotGridProps {
  slots: TimeSlot[]
  selectedSlotId?: string
  onSelectSlot?: (slot: TimeSlot) => void
  showCapacity?: boolean
  className?: string
}

function formatTime(time: string | undefined): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours ?? '0', 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes ?? '00'} ${ampm}`
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * TimeSlotGrid (PRT-12)
 *
 * Displays available time slots in a grid format for booking selection.
 */
export function TimeSlotGrid({
  slots,
  selectedSlotId,
  onSelectSlot,
  showCapacity = false,
  className,
}: TimeSlotGridProps) {
  // Group slots by time period
  const morningSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime?.split(':')[0] ?? '0', 10)
    return hour < 12
  })
  const afternoonSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime?.split(':')[0] ?? '0', 10)
    return hour >= 12 && hour < 17
  })
  const eveningSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime?.split(':')[0] ?? '0', 10)
    return hour >= 17
  })

  const renderSlotGroup = (groupSlots: TimeSlot[], label: string) => {
    if (groupSlots.length === 0) return null

    return (
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">{label}</h4>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {groupSlots.map((slot) => {
            const isSelected = selectedSlotId === slot.id
            const isAvailable = slot.status === 'available'
            const isLimited = slot.status === 'limited'

            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => isAvailable || isLimited ? onSelectSlot?.(slot) : undefined}
                disabled={!isAvailable && !isLimited}
                className={cn(
                  'relative flex flex-col items-center rounded-lg border p-2 text-center transition-all',
                  isSelected
                    ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-400 dark:border-amber-500 dark:bg-amber-500/10 dark:ring-amber-500'
                    : isAvailable
                    ? 'border-border bg-card hover:border-amber-300 hover:bg-amber-50/50 dark:hover:border-amber-500/50 dark:hover:bg-amber-500/5'
                    : isLimited
                    ? 'border-amber-200 bg-amber-50/50 hover:border-amber-300 dark:border-amber-500/30 dark:bg-amber-500/10'
                    : 'cursor-not-allowed border-border bg-muted/50 opacity-50'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-medium',
                    isSelected
                      ? 'text-amber-700 dark:text-amber-400'
                      : isAvailable || isLimited
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {formatTime(slot.startTime)}
                </span>

                {slot.price && slot.price !== slot.basePrice && (
                  <span className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(slot.price)}
                  </span>
                )}

                {showCapacity && slot.spotsAvailable !== undefined && (
                  <span
                    className={cn(
                      'mt-1 flex items-center gap-0.5 text-[10px]',
                      slot.spotsAvailable <= 2
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-muted-foreground'
                    )}
                  >
                    <Users className="h-2.5 w-2.5" />
                    {slot.spotsAvailable}
                  </span>
                )}

                {isLimited && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-amber-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className={cn('rounded-lg border border-dashed border-border p-8 text-center', className)}>
        <Clock className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">
          No available time slots for this date
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {renderSlotGroup(morningSlots, 'Morning')}
      {renderSlotGroup(afternoonSlots, 'Afternoon')}
      {renderSlotGroup(eveningSlots, 'Evening')}
    </div>
  )
}

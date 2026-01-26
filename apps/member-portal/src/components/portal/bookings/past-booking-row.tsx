'use client'

import { cn, Badge } from '@clubvantage/ui'
import { ChevronRight } from 'lucide-react'
import type { PortalBooking, PortalBookingStatus } from '@/lib/types'

export interface PastBookingRowProps {
  booking: PortalBooking
  onView?: (bookingId: string) => void
  className?: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

const statusConfig: Record<PortalBookingStatus, { label: string; bg: string; text: string }> = {
  pending: {
    label: 'Pending',
    bg: 'bg-amber-100 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
  },
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-emerald-100 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  checked_in: {
    label: 'Checked In',
    bg: 'bg-blue-100 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-400',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-100 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-stone-100 dark:bg-stone-500/20',
    text: 'text-stone-500 dark:text-stone-500 line-through',
  },
  no_show: {
    label: 'No Show',
    bg: 'bg-red-100 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-400',
  },
}

/**
 * PastBookingRow (PRT-03)
 *
 * Displays a past booking in a compact row format for history lists.
 */
export function PastBookingRow({
  booking,
  onView,
  className,
}: PastBookingRowProps) {
  const statusStyle = statusConfig[booking.status]

  const title = booking.type === 'facility'
    ? booking.facility.name
    : booking.service.name

  return (
    <button
      type="button"
      onClick={() => onView?.(booking.id)}
      className={cn(
        'flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/50',
        booking.status === 'cancelled' && 'opacity-60',
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm font-medium',
            booking.status === 'cancelled' ? 'text-muted-foreground line-through' : 'text-foreground'
          )}>
            {title}
          </span>
          <Badge className={cn('text-[10px]', statusStyle.bg, statusStyle.text)}>
            {statusStyle.label}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDate(booking.date)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className={cn(
          'text-sm font-medium',
          booking.status === 'cancelled' ? 'text-muted-foreground line-through' : 'text-foreground'
        )}>
          {formatCurrency(booking.pricing.total)}
        </span>
        {onView && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </button>
  )
}

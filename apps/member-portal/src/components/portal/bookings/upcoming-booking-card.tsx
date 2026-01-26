'use client'

import { cn, Button, Badge } from '@clubvantage/ui'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  MoreVertical,
  X,
  Edit,
  ChevronRight,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@clubvantage/ui'
import type { PortalBooking, PortalBookingStatus } from '@/lib/types'

export interface UpcomingBookingCardProps {
  booking: PortalBooking
  onView?: (bookingId: string) => void
  onModify?: (bookingId: string) => void
  onCancel?: (bookingId: string) => void
  className?: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(time: string | undefined): string {
  if (!time) return ''
  // Convert 24h format to 12h
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
    bg: 'bg-stone-100 dark:bg-stone-500/20',
    text: 'text-stone-600 dark:text-stone-400',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-stone-100 dark:bg-stone-500/20',
    text: 'text-stone-500 dark:text-stone-500',
  },
  no_show: {
    label: 'No Show',
    bg: 'bg-red-100 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-400',
  },
}

/**
 * UpcomingBookingCard (PRT-02)
 *
 * Displays an upcoming booking with service/facility info, date/time, and quick actions.
 */
export function UpcomingBookingCard({
  booking,
  onView,
  onModify,
  onCancel,
  className,
}: UpcomingBookingCardProps) {
  const statusStyle = statusConfig[booking.status]
  const isUpcoming = booking.status === 'confirmed' || booking.status === 'pending'

  const title = booking.type === 'facility'
    ? booking.facility.name
    : booking.service.name

  const subtitle = booking.type === 'facility'
    ? booking.facility.location
    : booking.staff
      ? booking.staff.name
      : booking.facility?.location || ''

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 transition-all hover:border-amber-300 hover:shadow-sm dark:hover:border-amber-500/50',
        className
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-foreground">
              {title}
            </h3>
            <Badge className={cn('shrink-0 text-[10px]', statusStyle.bg, statusStyle.text)}>
              {statusStyle.label}
            </Badge>
          </div>
          {subtitle && (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              {booking.type === 'service' && booking.staff ? (
                <User className="h-3 w-3" />
              ) : (
                <MapPin className="h-3 w-3" />
              )}
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions Menu */}
        {isUpcoming && (onModify || onCancel) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onModify && (
                <DropdownMenuItem onClick={() => onModify(booking.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modify Booking
                </DropdownMenuItem>
              )}
              {onCancel && (
                <DropdownMenuItem
                  onClick={() => onCancel(booking.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Booking
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Date & Time */}
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="flex items-center gap-1.5 text-foreground">
          <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          {formatDate(booking.date)}
        </span>
        <span className="flex items-center gap-1.5 text-foreground">
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
        </span>
      </div>

      {/* Variation (for service bookings) */}
      {booking.type === 'service' && booking.variation && (
        <p className="mb-3 text-sm text-muted-foreground">
          Add-on: {booking.variation.name}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-lg font-bold text-foreground">
          {formatCurrency(booking.pricing.total)}
        </span>
        {onView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(booking.id)}
            className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          >
            View Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

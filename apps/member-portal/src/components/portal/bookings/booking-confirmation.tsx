'use client'

import { cn, Button } from '@clubvantage/ui'
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  User,
  CalendarPlus,
  Share2,
  Home,
} from 'lucide-react'

export interface BookingConfirmationProps {
  bookingId: string
  title: string
  subtitle?: string
  date: string
  time: string
  location?: string
  staffName?: string
  totalPaid: number
  onAddToCalendar?: () => void
  onShare?: () => void
  onGoHome?: () => void
  onViewBooking?: () => void
  className?: string
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * BookingConfirmation (PRT-22)
 *
 * Success screen after a booking is confirmed.
 */
export function BookingConfirmation({
  bookingId,
  title,
  subtitle,
  date,
  time,
  location,
  staffName,
  totalPaid,
  onAddToCalendar,
  onShare,
  onGoHome,
  onViewBooking,
  className,
}: BookingConfirmationProps) {
  return (
    <div className={cn('flex flex-col items-center px-4 py-8', className)}>
      {/* Success icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
        <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
      </div>

      {/* Title */}
      <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
        Booking Confirmed!
      </h1>
      <p className="mb-6 text-center text-muted-foreground">
        Your reservation has been successfully made
      </p>

      {/* Booking details card */}
      <div className="mb-6 w-full max-w-sm rounded-xl border border-border bg-card p-5">
        <div className="mb-4 border-b border-border pb-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{date}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{time}</span>
          </div>
          {location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{location}</span>
            </div>
          )}
          {staffName && (
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{staffName}</span>
            </div>
          )}
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Paid</span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(totalPaid)}
            </span>
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Booking ID: <span className="font-mono font-medium">{bookingId}</span>
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-6 flex w-full max-w-sm gap-3">
        {onAddToCalendar && (
          <Button
            variant="outline"
            onClick={onAddToCalendar}
            className="flex-1"
          >
            <CalendarPlus className="mr-2 h-4 w-4" />
            Calendar
          </Button>
        )}
        {onShare && (
          <Button
            variant="outline"
            onClick={onShare}
            className="flex-1"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}
      </div>

      {/* Primary actions */}
      <div className="flex w-full max-w-sm flex-col gap-3">
        {onViewBooking && (
          <Button
            onClick={onViewBooking}
            className="w-full bg-amber-500 text-white hover:bg-amber-600"
          >
            View Booking Details
          </Button>
        )}
        {onGoHome && (
          <Button
            variant="outline"
            onClick={onGoHome}
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        )}
      </div>
    </div>
  )
}

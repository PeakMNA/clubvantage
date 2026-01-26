'use client'

import { cn, Button, Badge } from '@clubvantage/ui'
import {
  Calendar,
  Clock,
  User,
  Bell,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import type { PortalWaitlistEntry } from '@/lib/types'

export interface WaitlistEntryCardProps {
  entry: PortalWaitlistEntry
  serviceName?: string
  facilityName?: string
  onAcceptOffer?: (entryId: string) => void
  onDeclineOffer?: (entryId: string) => void
  onCancel?: (entryId: string) => void
  onView?: (entryId: string) => void
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
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours ?? '0', 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes ?? '00'} ${ampm}`
}

function getTimeRemaining(expiresAt: string): { minutes: number; isUrgent: boolean } {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diffMs = expires.getTime() - now.getTime()
  const minutes = Math.max(0, Math.floor(diffMs / 60000))
  return { minutes, isUrgent: minutes <= 5 }
}

const statusConfig: Record<PortalWaitlistEntry['status'], { label: string; bg: string; text: string }> = {
  waiting: {
    label: 'Waiting',
    bg: 'bg-amber-100 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
  },
  offered: {
    label: 'Slot Available!',
    bg: 'bg-emerald-100 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  booked: {
    label: 'Booked',
    bg: 'bg-blue-100 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-400',
  },
  expired: {
    label: 'Expired',
    bg: 'bg-stone-100 dark:bg-stone-500/20',
    text: 'text-stone-500 dark:text-stone-500',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-stone-100 dark:bg-stone-500/20',
    text: 'text-stone-500 dark:text-stone-500',
  },
}

/**
 * WaitlistEntryCard (PRT-04)
 *
 * Displays a waitlist entry with status and actions.
 * Shows offer details and countdown when a slot becomes available.
 */
export function WaitlistEntryCard({
  entry,
  serviceName,
  facilityName,
  onAcceptOffer,
  onDeclineOffer,
  onCancel,
  onView,
  className,
}: WaitlistEntryCardProps) {
  const statusStyle = statusConfig[entry.status]
  const isOffered = entry.status === 'offered'
  const isWaiting = entry.status === 'waiting'

  const title = serviceName || facilityName || 'Booking'
  const timeRemaining = isOffered && entry.offerExpiresAt
    ? getTimeRemaining(entry.offerExpiresAt)
    : null

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-4 transition-all',
        isOffered
          ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-500/50 dark:bg-emerald-500/10'
          : 'border-border',
        className
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isOffered && (
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <h3 className="truncate text-base font-semibold text-foreground">
              {title}
            </h3>
            <Badge className={cn('shrink-0 text-[10px]', statusStyle.bg, statusStyle.text)}>
              {statusStyle.label}
            </Badge>
          </div>
          {entry.position && isWaiting && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              Position #{entry.position} in queue
            </p>
          )}
        </div>

        {isWaiting && onCancel && (
          <button
            type="button"
            onClick={() => onCancel(entry.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Preferred Time */}
      {isWaiting && (
        <div className="mb-3 rounded-lg bg-muted/50 px-3 py-2">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Preferred Time</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(entry.preferredDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(entry.preferredTimeStart)} - {formatTime(entry.preferredTimeEnd)}
            </span>
          </div>
        </div>
      )}

      {/* Offered Slot */}
      {isOffered && entry.offeredSlot && (
        <div className="mb-3 rounded-lg bg-emerald-100/50 px-3 py-2 dark:bg-emerald-500/20">
          <p className="mb-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Available Slot
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(entry.offeredSlot.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(entry.offeredSlot.startTime)} - {formatTime(entry.offeredSlot.endTime)}
            </span>
            {entry.offeredSlot.staffName && (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {entry.offeredSlot.staffName}
              </span>
            )}
          </div>

          {/* Countdown */}
          {timeRemaining && (
            <div className={cn(
              'mt-2 flex items-center gap-1.5 text-xs font-medium',
              timeRemaining.isUrgent
                ? 'text-red-600 dark:text-red-400'
                : 'text-amber-600 dark:text-amber-400'
            )}>
              <Bell className="h-3.5 w-3.5" />
              Offer expires in {timeRemaining.minutes} {timeRemaining.minutes === 1 ? 'minute' : 'minutes'}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {isOffered && (onAcceptOffer || onDeclineOffer) && (
        <div className="flex gap-2">
          {onAcceptOffer && (
            <Button
              onClick={() => onAcceptOffer(entry.id)}
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Accept & Book
            </Button>
          )}
          {onDeclineOffer && (
            <Button
              variant="outline"
              onClick={() => onDeclineOffer(entry.id)}
              className="flex-1"
            >
              Decline
            </Button>
          )}
        </div>
      )}

      {/* View Link for past entries */}
      {!isOffered && !isWaiting && onView && (
        <button
          type="button"
          onClick={() => onView(entry.id)}
          className="flex w-full items-center justify-center gap-1 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
        >
          View Details
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

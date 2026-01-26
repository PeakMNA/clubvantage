'use client'

import { useState, useEffect } from 'react'
import { cn, Button } from '@clubvantage/ui'
import {
  Sparkles,
  Calendar,
  Clock,
  User,
  Timer,
  X,
} from 'lucide-react'

export interface WaitlistOfferAlertProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  onDecline: () => void
  serviceName: string
  offeredDate: string
  offeredTime: string
  staffName?: string
  expiresAt: string // ISO datetime
  className?: string
}

function formatTimeRemaining(expiresAt: string): { minutes: number; seconds: number } {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diffMs = Math.max(0, expires.getTime() - now.getTime())
  const totalSeconds = Math.floor(diffMs / 1000)
  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
  }
}

/**
 * WaitlistOfferAlert (PRT-21)
 *
 * Full-screen alert when a waitlist slot becomes available.
 */
export function WaitlistOfferAlert({
  isOpen,
  onClose,
  onAccept,
  onDecline,
  serviceName,
  offeredDate,
  offeredTime,
  staffName,
  expiresAt,
  className,
}: WaitlistOfferAlertProps) {
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(expiresAt))

  // Update countdown every second
  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      const remaining = formatTimeRemaining(expiresAt)
      setTimeRemaining(remaining)

      if (remaining.minutes === 0 && remaining.seconds === 0) {
        clearInterval(interval)
        onClose()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, expiresAt, onClose])

  if (!isOpen) return null

  const isUrgent = timeRemaining.minutes < 5

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Alert */}
      <div
        className={cn(
          'relative w-full max-w-sm overflow-hidden rounded-2xl border-2 border-emerald-400 bg-gradient-to-b from-emerald-50 to-white shadow-2xl dark:border-emerald-500 dark:from-emerald-950 dark:to-stone-900',
          className
        )}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
              <Sparkles className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <h2 className="mb-2 text-center text-xl font-bold text-foreground">
            Slot Available!
          </h2>
          <p className="mb-4 text-center text-sm text-muted-foreground">
            A spot opened up for your waitlisted booking
          </p>

          {/* Service details */}
          <div className="mb-4 rounded-xl bg-emerald-100/50 p-4 dark:bg-emerald-500/10">
            <p className="mb-2 text-center text-lg font-semibold text-emerald-800 dark:text-emerald-300">
              {serviceName}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-emerald-700 dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {offeredDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {offeredTime}
              </span>
              {staffName && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {staffName}
                </span>
              )}
            </div>
          </div>

          {/* Countdown */}
          <div
            className={cn(
              'mb-6 flex items-center justify-center gap-2 rounded-lg py-2',
              isUrgent
                ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
            )}
          >
            <Timer className="h-4 w-4" />
            <span className="text-sm font-medium">
              Offer expires in{' '}
              <span className="font-bold">
                {String(timeRemaining.minutes).padStart(2, '0')}:
                {String(timeRemaining.seconds).padStart(2, '0')}
              </span>
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onDecline}
              className="flex-1"
            >
              Decline
            </Button>
            <Button
              onClick={onAccept}
              className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600"
            >
              Accept & Book
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

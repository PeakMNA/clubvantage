'use client'

import { cn, Button } from '@clubvantage/ui'
import {
  AlertTriangle,
  Calendar,
  Clock,
  X,
  Loader2,
} from 'lucide-react'

export interface CancelBookingDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  bookingTitle: string
  bookingDate: string
  bookingTime: string
  refundAmount?: number
  refundPercentage?: number
  cancellationDeadline?: string
  isLoading?: boolean
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
 * CancelBookingDialog (PRT-20)
 *
 * Confirmation dialog for cancelling a booking with refund info.
 */
export function CancelBookingDialog({
  isOpen,
  onClose,
  onConfirm,
  bookingTitle,
  bookingDate,
  bookingTime,
  refundAmount,
  refundPercentage,
  cancellationDeadline,
  isLoading = false,
  className,
}: CancelBookingDialogProps) {
  if (!isOpen) return null

  const hasRefund = refundAmount !== undefined && refundAmount > 0
  const noRefund = refundAmount !== undefined && refundAmount === 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={cn(
          'relative w-full max-w-sm rounded-xl border border-border bg-card shadow-xl',
          className
        )}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Title */}
          <h3 className="mb-2 text-center text-lg font-semibold text-foreground">
            Cancel Booking?
          </h3>
          <p className="mb-4 text-center text-sm text-muted-foreground">
            Are you sure you want to cancel this booking?
          </p>

          {/* Booking details */}
          <div className="mb-4 rounded-lg bg-muted/50 p-3">
            <p className="mb-2 font-medium text-foreground">{bookingTitle}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {bookingDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {bookingTime}
              </span>
            </div>
          </div>

          {/* Refund info */}
          {hasRefund && (
            <div className="mb-4 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-500/10">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Refund Amount
              </p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {formatCurrency(refundAmount)}
                {refundPercentage !== undefined && (
                  <span className="ml-2 text-sm font-normal">
                    ({refundPercentage}%)
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-500">
                Will be credited to your member account
              </p>
            </div>
          )}

          {noRefund && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-500/10">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                No Refund
              </p>
              <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                {cancellationDeadline
                  ? `Cancellation deadline was ${cancellationDeadline}`
                  : 'This booking is past the cancellation deadline'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Keep Booking
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-red-500 text-white hover:bg-red-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Booking'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

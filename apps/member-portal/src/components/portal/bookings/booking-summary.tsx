'use client'

import { cn, Button } from '@clubvantage/ui'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CreditCard,
  AlertCircle,
  Loader2,
} from 'lucide-react'

export interface BookingSummaryItem {
  label: string
  value: string
  icon?: React.ReactNode
}

export interface BookingPriceBreakdown {
  label: string
  amount: number
  isDiscount?: boolean
}

export interface BookingSummaryProps {
  title: string
  subtitle?: string
  imageUrl?: string
  details: BookingSummaryItem[]
  priceBreakdown: BookingPriceBreakdown[]
  totalPrice: number
  memberBalance?: number
  onConfirm?: () => void
  onBack?: () => void
  isLoading?: boolean
  error?: string
  confirmLabel?: string
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
 * BookingSummary (PRT-19)
 *
 * Final confirmation step showing all booking details and pricing.
 */
export function BookingSummary({
  title,
  subtitle,
  imageUrl,
  details,
  priceBreakdown,
  totalPrice,
  memberBalance,
  onConfirm,
  onBack,
  isLoading = false,
  error,
  confirmLabel = 'Confirm Booking',
  className,
}: BookingSummaryProps) {
  const insufficientBalance = memberBalance !== undefined && memberBalance < totalPrice

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex gap-4 rounded-xl border border-border bg-card p-4">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="h-20 w-20 rounded-lg object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h4 className="text-sm font-medium text-foreground">Booking Details</h4>
        <div className="space-y-2">
          {details.map((detail, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              {detail.icon && (
                <span className="text-muted-foreground">{detail.icon}</span>
              )}
              <span className="text-muted-foreground">{detail.label}:</span>
              <span className="font-medium text-foreground">{detail.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h4 className="mb-3 text-sm font-medium text-foreground">Price Summary</h4>
        <div className="space-y-2">
          {priceBreakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span
                className={cn(
                  'font-medium',
                  item.isDiscount
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-foreground'
                )}
              >
                {item.isDiscount ? '-' : ''}
                {formatCurrency(Math.abs(item.amount))}
              </span>
            </div>
          ))}
          <div className="my-2 border-t border-border" />
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>

        {/* Balance info */}
        {memberBalance !== undefined && (
          <div className="mt-4 rounded-lg bg-muted/50 px-3 py-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your Balance</span>
              <span
                className={cn(
                  'font-medium',
                  insufficientBalance
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-foreground'
                )}
              >
                {formatCurrency(memberBalance)}
              </span>
            </div>
            {insufficientBalance && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-3 w-3" />
                Insufficient balance. Please top up before booking.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="flex-1"
          >
            Back
          </Button>
        )}
        {onConfirm && (
          <Button
            onClick={onConfirm}
            disabled={isLoading || insufficientBalance}
            className="flex-1 bg-amber-500 text-white hover:bg-amber-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        )}
      </div>

      {/* Terms note */}
      <p className="text-center text-xs text-muted-foreground">
        By confirming, you agree to the club's booking terms and cancellation policy.
      </p>
    </div>
  )
}

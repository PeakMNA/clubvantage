'use client'

import { cn } from '@clubvantage/ui'
import { Check, AlertCircle, DollarSign, Circle } from 'lucide-react'
import type { PaymentStatus } from '@clubvantage/api-client'

export interface CheckInStatusBadgeProps {
  paymentStatus: PaymentStatus
  isCheckedIn: boolean
  className?: string
}

// Status configurations - HOIST OUTSIDE COMPONENT for performance
const statusConfig = {
  PREPAID: {
    label: 'Pre-paid',
    icon: Check,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
  PARTIAL: {
    label: 'Partial',
    icon: AlertCircle,
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  },
  UNPAID: {
    label: 'Unpaid',
    icon: DollarSign,
    className: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  },
  NO_CHARGES: {
    label: 'No Charges',
    icon: Circle,
    className: 'bg-stone-100 text-stone-600 dark:bg-stone-500/20 dark:text-stone-400',
  },
} as const

export function CheckInStatusBadge({
  paymentStatus,
  isCheckedIn,
  className,
}: CheckInStatusBadgeProps) {
  // If already checked in, show checked-in badge
  if (isCheckedIn) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
          'bg-emerald-500 text-white',
          className
        )}
      >
        <Check className="h-3 w-3" />
        Checked In
      </span>
    )
  }

  const config = statusConfig[paymentStatus]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}

// Settlement status badge for showing settlement state
export interface SettlementStatusBadgeProps {
  isSettled: boolean
  balanceDue: number
  className?: string
}

export function SettlementStatusBadge({
  isSettled,
  balanceDue,
  className,
}: SettlementStatusBadgeProps) {
  if (isSettled) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
          'bg-emerald-500 text-white',
          className
        )}
      >
        <Check className="h-3 w-3" />
        Settled
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
        className
      )}
    >
      <DollarSign className="h-3 w-3" />
      Due: ${balanceDue.toFixed(2)}
    </span>
  )
}

// Suspended member warning badge
export interface SuspendedBadgeProps {
  reason?: string | null
  className?: string
}

export function SuspendedBadge({ reason, className }: SuspendedBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        'bg-red-500 text-white',
        className
      )}
      title={reason || 'Account suspended'}
    >
      <AlertCircle className="h-3 w-3" />
      Suspended
    </span>
  )
}

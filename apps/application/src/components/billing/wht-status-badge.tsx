'use client'

import { cn } from '@clubvantage/ui'

export type WhtStatus = 'pending' | 'verified' | 'rejected'

interface WhtStatusBadgeProps {
  /** WHT certificate verification status */
  status: WhtStatus
  /** Additional class names */
  className?: string
}

const statusConfig: Record<WhtStatus, {
  label: string
  bgColor: string
  textColor: string
}> = {
  pending: {
    label: 'Pending',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  verified: {
    label: 'Verified',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
  rejected: {
    label: 'Rejected',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
}

export function WhtStatusBadge({ status, className }: WhtStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.pending

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      {config.label}
      <span className="sr-only">WHT certificate status: {config.label}</span>
    </span>
  )
}

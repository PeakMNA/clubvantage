'use client'

import { cn } from '@clubvantage/ui'

type BadgeStatus =
  | 'confirmed'
  | 'verified'
  | 'paid'
  | 'pending'
  | 'submitted'
  | 'partial'
  | 'outstanding'
  | 'overdue'
  | 'rejected'
  | 'cancelled'
  | 'suspended'
  | 'completed'
  | 'no-show'

interface StatusBadgeProps {
  status: BadgeStatus
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outline'
  className?: string
}

const statusConfig: Record<BadgeStatus, { bg: string; text: string; label: string }> = {
  confirmed: { bg: 'bg-emerald-500', text: 'text-white', label: 'Confirmed' },
  verified: { bg: 'bg-emerald-500', text: 'text-white', label: 'Verified' },
  paid: { bg: 'bg-emerald-500', text: 'text-white', label: 'Paid' },
  completed: { bg: 'bg-stone-100', text: 'text-stone-600', label: 'Completed' },
  pending: { bg: 'bg-amber-500', text: 'text-white', label: 'Pending' },
  submitted: { bg: 'bg-blue-500', text: 'text-white', label: 'Submitted' },
  partial: { bg: 'bg-amber-500', text: 'text-white', label: 'Partial' },
  outstanding: { bg: 'bg-amber-500', text: 'text-white', label: 'Outstanding' },
  overdue: { bg: 'bg-red-500', text: 'text-white', label: 'Overdue' },
  rejected: { bg: 'bg-red-500', text: 'text-white', label: 'Rejected' },
  cancelled: { bg: 'bg-stone-200', text: 'text-stone-600', label: 'Cancelled' },
  suspended: { bg: 'bg-red-500', text: 'text-white', label: 'Suspended' },
  'no-show': { bg: 'bg-red-500', text: 'text-white', label: 'No Show' },
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px] h-5',
  md: 'px-2.5 py-0.5 text-xs h-6',
  lg: 'px-3 py-1 text-sm h-7',
}

export function StatusBadge({
  status,
  size = 'md',
  variant = 'solid',
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status]

  if (variant === 'outline') {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium',
          'border-2',
          sizeClasses[size],
          config.bg.replace('bg-', 'border-'),
          config.bg.replace('bg-', 'text-'),
          'bg-transparent',
          className
        )}
      >
        {config.label}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        sizeClasses[size],
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  )
}

'use client'

import { cn } from '@clubvantage/ui'
import { Lock, Unlock, RotateCcw } from 'lucide-react'
import type { PeriodStatus } from '@/hooks/use-ar-statements'

interface PeriodStatusBadgeProps {
  /** Statement period status */
  status: PeriodStatus
  /** Additional class names */
  className?: string
  /** Show icon */
  showIcon?: boolean
}

const statusConfig: Record<PeriodStatus, {
  label: string
  bgColor: string
  textColor: string
  Icon: typeof Lock
}> = {
  OPEN: {
    label: 'Open',
    bgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    Icon: Unlock,
  },
  CLOSED: {
    label: 'Closed',
    bgColor: 'bg-stone-100 dark:bg-stone-500/20',
    textColor: 'text-stone-600 dark:text-stone-400',
    Icon: Lock,
  },
  REOPENED: {
    label: 'Reopened',
    bgColor: 'bg-amber-100 dark:bg-amber-500/20',
    textColor: 'text-amber-700 dark:text-amber-400',
    Icon: RotateCcw,
  },
}

export function PeriodStatusBadge({ status, className, showIcon = true }: PeriodStatusBadgeProps) {
  const config = statusConfig[status]
  const { Icon } = config

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
      <span className="sr-only">Period status: {config.label}</span>
    </span>
  )
}

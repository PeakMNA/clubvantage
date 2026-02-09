'use client'

import { cn } from '@clubvantage/ui'
import { Clock, Loader2, CheckCircle, XCircle, Ban } from 'lucide-react'
import type { StatementRunStatus } from '@/hooks/use-ar-statements'

interface RunStatusBadgeProps {
  /** Statement run status */
  status: StatementRunStatus
  /** Additional class names */
  className?: string
  /** Show icon */
  showIcon?: boolean
}

const statusConfig: Record<StatementRunStatus, {
  label: string
  bgColor: string
  textColor: string
  Icon: typeof Clock
  animate?: boolean
}> = {
  PENDING: {
    label: 'Pending',
    bgColor: 'bg-stone-100 dark:bg-stone-500/20',
    textColor: 'text-stone-600 dark:text-stone-400',
    Icon: Clock,
  },
  IN_PROGRESS: {
    label: 'Running',
    bgColor: 'bg-blue-100 dark:bg-blue-500/20',
    textColor: 'text-blue-700 dark:text-blue-400',
    Icon: Loader2,
    animate: true,
  },
  COMPLETED: {
    label: 'Completed',
    bgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    Icon: CheckCircle,
  },
  FAILED: {
    label: 'Failed',
    bgColor: 'bg-red-100 dark:bg-red-500/20',
    textColor: 'text-red-700 dark:text-red-400',
    Icon: XCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    bgColor: 'bg-stone-100 dark:bg-stone-500/20',
    textColor: 'text-stone-500 dark:text-stone-400',
    Icon: Ban,
  },
}

export function RunStatusBadge({ status, className, showIcon = true }: RunStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.PENDING
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
      {showIcon && Icon && <Icon className={cn('h-3 w-3', config.animate && 'animate-spin')} />}
      {config.label}
      <span className="sr-only">Run status: {config.label}</span>
    </span>
  )
}

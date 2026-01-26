'use client'

import { cn } from '@clubvantage/ui'
import { Lock } from 'lucide-react'

export type AgingStatus = 'current' | '30' | '60' | '90' | 'suspended'

interface AgingBadgeProps {
  /** Days overdue - will be converted to status automatically */
  daysOverdue?: number
  /** Direct status override */
  status?: AgingStatus
  /** Additional class names */
  className?: string
}

/**
 * Converts days overdue to aging status
 */
function getStatusFromDays(days: number): AgingStatus {
  if (days <= 30) return 'current'
  if (days <= 60) return '30'
  if (days <= 90) return '60'
  // 91+ days - check if suspended would be handled by parent
  // Default to '90' as suspended requires explicit booking block
  return '90'
}

const statusConfig: Record<AgingStatus, {
  label: string
  bgColor: string
  textColor: string
  showIcon?: boolean
}> = {
  current: {
    label: 'Current',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
  '30': {
    label: '30',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  '60': {
    label: '60',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
  },
  '90': {
    label: '90',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
  suspended: {
    label: 'Suspended',
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    showIcon: true,
  },
}

export function AgingBadge({ daysOverdue, status, className }: AgingBadgeProps) {
  // Determine the status to display
  const displayStatus: AgingStatus = status ?? (daysOverdue !== undefined ? getStatusFromDays(daysOverdue) : 'current')
  const config = statusConfig[displayStatus]

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full text-xs font-medium',
        config.bgColor,
        config.textColor,
        config.showIcon ? 'gap-1 px-2.5 py-1' : 'px-2 py-0.5',
        className
      )}
    >
      {config.showIcon && <Lock className="h-3 w-3" />}
      {config.label}
      <span className="sr-only">
        {displayStatus === 'current'
          ? 'Payment is current'
          : displayStatus === 'suspended'
          ? 'Member suspended - booking blocked'
          : `${config.label} days overdue`}
      </span>
    </span>
  )
}

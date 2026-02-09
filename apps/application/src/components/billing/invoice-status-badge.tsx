'use client'

import { cn } from '@clubvantage/ui'
import type { InvoiceStatus } from '@clubvantage/types'

export type { InvoiceStatus }

interface InvoiceStatusBadgeProps {
  /** Invoice lifecycle status */
  status: InvoiceStatus
  /** Additional class names */
  className?: string
}

const statusConfig: Record<InvoiceStatus, {
  label: string
  bgColor: string
  textColor: string
  strikethrough?: boolean
}> = {
  DRAFT: {
    label: 'Draft',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
  },
  SENT: {
    label: 'Sent',
    bgColor: 'bg-blue-100 dark:bg-blue-500/20',
    textColor: 'text-blue-700 dark:text-blue-400',
  },
  PARTIALLY_PAID: {
    label: 'Partial',
    bgColor: 'bg-amber-100 dark:bg-amber-500/20',
    textColor: 'text-amber-700 dark:text-amber-400',
  },
  PAID: {
    label: 'Paid',
    bgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
    textColor: 'text-emerald-700 dark:text-emerald-400',
  },
  OVERDUE: {
    label: 'Overdue',
    bgColor: 'bg-red-100 dark:bg-red-500/20',
    textColor: 'text-red-700 dark:text-red-400',
  },
  VOID: {
    label: 'Void',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
    strikethrough: true,
  },
  CANCELLED: {
    label: 'Cancelled',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
    strikethrough: true,
  },
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status ?? 'Unknown',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bgColor,
        config.textColor,
        config.strikethrough && 'line-through',
        className
      )}
    >
      {config.label}
      <span className="sr-only">Invoice status: {config.label}</span>
    </span>
  )
}

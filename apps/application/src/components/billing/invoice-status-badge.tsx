'use client'

import { cn } from '@clubvantage/ui'

export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled'

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
  draft: {
    label: 'Draft',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
  },
  sent: {
    label: 'Sent',
    bgColor: 'bg-blue-100 dark:bg-blue-500/20',
    textColor: 'text-blue-700 dark:text-blue-400',
  },
  partial: {
    label: 'Partial',
    bgColor: 'bg-amber-100 dark:bg-amber-500/20',
    textColor: 'text-amber-700 dark:text-amber-400',
  },
  paid: {
    label: 'Paid',
    bgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
    textColor: 'text-emerald-700 dark:text-emerald-400',
  },
  overdue: {
    label: 'Overdue',
    bgColor: 'bg-red-100 dark:bg-red-500/20',
    textColor: 'text-red-700 dark:text-red-400',
  },
  cancelled: {
    label: 'Cancelled',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
    strikethrough: true,
  },
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status]

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

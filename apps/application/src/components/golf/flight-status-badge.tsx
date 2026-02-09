'use client'

import { cn } from '@clubvantage/ui'
import { AlertTriangle } from 'lucide-react'
import type { TeeTimeStatus } from '@clubvantage/types'

// Backwards-compatible alias
export type FlightStatus = TeeTimeStatus

interface FlightStatusBadgeProps {
  status: TeeTimeStatus
  className?: string
  size?: 'sm' | 'md' // sm for compact views, md is default
}

const statusConfig: Record<TeeTimeStatus, {
  label: string
  bgColor: string
  textColor: string
  icon?: boolean
  strikethrough?: boolean
}> = {
  AVAILABLE: {
    label: 'Available',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
  },
  BOOKED: {
    label: 'Booked',
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
  },
  CHECKED_IN: {
    label: 'Checked In',
    bgColor: 'bg-emerald-500',
    textColor: 'text-white',
  },
  STARTED: {
    label: 'On Course',
    bgColor: 'bg-amber-500',
    textColor: 'text-white',
  },
  COMPLETED: {
    label: 'Finished',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
  },
  NO_SHOW: {
    label: 'No Show',
    bgColor: 'bg-red-500',
    textColor: 'text-white',
  },
  CANCELLED: {
    label: 'Cancelled',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
    strikethrough: true,
  },
  BLOCKED: {
    label: 'Blocked',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
    icon: true,
  },
}

export function FlightStatusBadge({ status, className, size = 'md' }: FlightStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status ?? 'Unknown',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px] h-4' : 'px-2.5 py-0.5 text-xs h-6',
        config.bgColor,
        config.textColor,
        config.strikethrough && 'line-through',
        className
      )}
    >
      {config.icon && <AlertTriangle className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />}
      {size === 'sm' ? config.label.slice(0, 3) : config.label}
      <span className="sr-only">Status: {config.label}</span>
    </span>
  )
}

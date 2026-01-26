'use client'

import { cn } from '@clubvantage/ui'
import { AlertTriangle } from 'lucide-react'

export type FlightStatus =
  | 'available'
  | 'booked'
  | 'checked-in'
  | 'on-course'
  | 'finished'
  | 'no-show'
  | 'cancelled'
  | 'blocked'

interface FlightStatusBadgeProps {
  status: FlightStatus
  className?: string
  size?: 'sm' | 'md' // sm for compact views, md is default
}

const statusConfig: Record<FlightStatus, {
  label: string
  bgColor: string
  textColor: string
  icon?: boolean
  strikethrough?: boolean
}> = {
  available: {
    label: 'Available',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
  },
  booked: {
    label: 'Booked',
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
  },
  'checked-in': {
    label: 'Checked In',
    bgColor: 'bg-emerald-500',
    textColor: 'text-white',
  },
  'on-course': {
    label: 'On Course',
    bgColor: 'bg-amber-500',
    textColor: 'text-white',
  },
  finished: {
    label: 'Finished',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
  },
  'no-show': {
    label: 'No Show',
    bgColor: 'bg-red-500',
    textColor: 'text-white',
  },
  cancelled: {
    label: 'Cancelled',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
    strikethrough: true,
  },
  blocked: {
    label: 'Blocked',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
    icon: true,
  },
}

export function FlightStatusBadge({ status, className, size = 'md' }: FlightStatusBadgeProps) {
  const config = statusConfig[status]

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

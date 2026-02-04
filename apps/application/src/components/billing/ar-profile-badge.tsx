'use client'

import { cn } from '@clubvantage/ui'
import { User, Building2 } from 'lucide-react'
import type { ARProfileType, ARProfileStatus } from '@/hooks/use-ar-statements'

// ==================== Profile Type Badge ====================

interface ARProfileTypeBadgeProps {
  /** AR profile type */
  type: ARProfileType
  /** Additional class names */
  className?: string
  /** Show icon */
  showIcon?: boolean
}

const typeConfig: Record<ARProfileType, {
  label: string
  bgColor: string
  textColor: string
  Icon: typeof User
}> = {
  MEMBER: {
    label: 'Member',
    bgColor: 'bg-blue-100 dark:bg-blue-500/20',
    textColor: 'text-blue-700 dark:text-blue-400',
    Icon: User,
  },
  CITY_LEDGER: {
    label: 'City Ledger',
    bgColor: 'bg-purple-100 dark:bg-purple-500/20',
    textColor: 'text-purple-700 dark:text-purple-400',
    Icon: Building2,
  },
}

export function ARProfileTypeBadge({ type, className, showIcon = true }: ARProfileTypeBadgeProps) {
  const config = typeConfig[type]
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
      <span className="sr-only">Profile type: {config.label}</span>
    </span>
  )
}

// ==================== Profile Status Badge ====================

interface ARProfileStatusBadgeProps {
  /** AR profile status */
  status: ARProfileStatus
  /** Additional class names */
  className?: string
}

const statusConfig: Record<ARProfileStatus, {
  label: string
  bgColor: string
  textColor: string
}> = {
  ACTIVE: {
    label: 'Active',
    bgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
    textColor: 'text-emerald-700 dark:text-emerald-400',
  },
  SUSPENDED: {
    label: 'Suspended',
    bgColor: 'bg-amber-100 dark:bg-amber-500/20',
    textColor: 'text-amber-700 dark:text-amber-400',
  },
  CLOSED: {
    label: 'Closed',
    bgColor: 'bg-stone-100 dark:bg-stone-500/20',
    textColor: 'text-stone-500 dark:text-stone-400',
  },
}

export function ARProfileStatusBadge({ status, className }: ARProfileStatusBadgeProps) {
  const config = statusConfig[status]

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
      <span className="sr-only">Profile status: {config.label}</span>
    </span>
  )
}

// ==================== Delivery Status Badge ====================

import type { DeliveryStatus } from '@/hooks/use-ar-statements'

interface DeliveryStatusBadgeProps {
  /** Delivery status */
  status: DeliveryStatus
  /** Delivery channel for context */
  channel?: 'email' | 'print' | 'portal' | 'sms'
  /** Additional class names */
  className?: string
}

const deliveryStatusConfig: Record<DeliveryStatus, {
  label: string
  bgColor: string
  textColor: string
}> = {
  PENDING: {
    label: 'Pending',
    bgColor: 'bg-stone-100 dark:bg-stone-500/20',
    textColor: 'text-stone-600 dark:text-stone-400',
  },
  SENT: {
    label: 'Sent',
    bgColor: 'bg-blue-100 dark:bg-blue-500/20',
    textColor: 'text-blue-700 dark:text-blue-400',
  },
  DELIVERED: {
    label: 'Delivered',
    bgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
    textColor: 'text-emerald-700 dark:text-emerald-400',
  },
  FAILED: {
    label: 'Failed',
    bgColor: 'bg-red-100 dark:bg-red-500/20',
    textColor: 'text-red-700 dark:text-red-400',
  },
  NOT_APPLICABLE: {
    label: 'N/A',
    bgColor: 'bg-stone-100 dark:bg-stone-500/20',
    textColor: 'text-stone-400 dark:text-stone-500',
  },
}

export function DeliveryStatusBadge({ status, channel, className }: DeliveryStatusBadgeProps) {
  const config = deliveryStatusConfig[status]

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
      <span className="sr-only">
        {channel ? `${channel} delivery` : 'Delivery'} status: {config.label}
      </span>
    </span>
  )
}

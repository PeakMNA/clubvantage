'use client'

import Link from 'next/link'
import { AlertTriangle, UserPlus, FileText, CheckCircle, ChevronRight } from 'lucide-react'
import { cn } from '@clubvantage/ui'

type AlertType = 'warning' | 'action' | 'info' | 'success'

interface AlertCardProps {
  type: AlertType
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  href?: string
  className?: string
}

const alertConfig = {
  warning: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    iconColor: 'text-red-600',
    actionColor: 'text-red-600 hover:text-red-700',
    Icon: AlertTriangle,
  },
  action: {
    bg: 'bg-purple-50',
    border: 'border-purple-500',
    iconColor: 'text-purple-600',
    actionColor: 'text-purple-600 hover:text-purple-700',
    Icon: UserPlus,
  },
  info: {
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    iconColor: 'text-amber-600',
    actionColor: 'text-amber-600 hover:text-amber-700',
    Icon: FileText,
  },
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-500',
    iconColor: 'text-emerald-600',
    actionColor: 'text-emerald-600 hover:text-emerald-700',
    Icon: CheckCircle,
  },
}

export function AlertCard({
  type,
  title,
  description,
  actionLabel,
  onAction,
  href,
  className,
}: AlertCardProps) {
  const config = alertConfig[type]
  const Icon = config.Icon

  const content = (
    <div
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border-l-4 p-4 transition-colors',
        config.bg,
        config.border,
        'hover:brightness-95',
        className
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.iconColor)} />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-stone-900">{title}</h3>
        <p className="text-sm text-stone-600">{description}</p>
      </div>
      {(actionLabel || href) && (
        <div className={cn('flex items-center gap-1 text-sm shrink-0', config.actionColor)}>
          {actionLabel || 'View'}
          <ChevronRight className="h-4 w-4" />
        </div>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  if (onAction) {
    return (
      <button onClick={onAction} className="w-full text-left">
        {content}
      </button>
    )
  }

  return content
}

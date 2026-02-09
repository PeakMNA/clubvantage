'use client'

import { cn } from '@clubvantage/ui'
import type { PlayerType } from '@clubvantage/types'

export type { PlayerType }

interface PlayerTypeBadgeProps {
  type: PlayerType
  className?: string
  showLabel?: boolean
  size?: 'xs' | 'sm' | 'md' // xs for compact views, sm and md are standard sizes
}

const typeConfig: Record<PlayerType, {
  letter: string
  label: string
  bgColor: string
  textColor: string
}> = {
  MEMBER: {
    letter: 'M',
    label: 'Member',
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
  },
  GUEST: {
    letter: 'G',
    label: 'Guest',
    bgColor: 'bg-amber-500',
    textColor: 'text-white',
  },
  DEPENDENT: {
    letter: 'D',
    label: 'Dependent',
    bgColor: 'bg-teal-500',
    textColor: 'text-white',
  },
  WALK_UP: {
    letter: 'W',
    label: 'Walk-up',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
  },
}

export function PlayerTypeBadge({ type, className, showLabel = false, size = 'md' }: PlayerTypeBadgeProps) {
  const config = typeConfig[type] || typeConfig.MEMBER

  const sizeClasses = {
    xs: showLabel ? 'px-1 py-0 h-3.5 text-[8px]' : 'w-3.5 h-3.5 text-[8px]',
    sm: showLabel ? 'px-1.5 py-0 h-4 text-[10px]' : 'w-4 h-4 text-[10px]',
    md: showLabel ? 'px-2 py-0.5 h-5 text-xs' : 'w-5 h-5 text-xs',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        sizeClasses[size],
        config.bgColor,
        config.textColor,
        className
      )}
    >
      {showLabel ? config.label : config.letter}
      <span className="sr-only">{config.label}</span>
    </span>
  )
}

'use client'

import { cn } from '@clubvantage/ui'
import { Lock } from 'lucide-react'

export type AgingStatus = 'current' | '30' | '60' | '90' | 'suspended'

export interface AgingBarData {
  status: AgingStatus
  value: number
  percentage: number
}

export interface AgingBarProps {
  data: AgingBarData[]
  onSegmentClick?: (status: AgingStatus) => void
  showLabels?: boolean
  className?: string
}

const statusConfig: Record<
  AgingStatus,
  { color: string; label: string; textColor: string }
> = {
  current: {
    color: 'bg-emerald-500',
    label: 'Current',
    textColor: 'text-white',
  },
  '30': {
    color: 'bg-amber-500',
    label: '1-30 Days',
    textColor: 'text-white',
  },
  '60': {
    color: 'bg-orange-500',
    label: '31-60 Days',
    textColor: 'text-white',
  },
  '90': {
    color: 'bg-red-500',
    label: '61-90 Days',
    textColor: 'text-white',
  },
  suspended: {
    color: 'bg-red-700',
    label: '91+ Suspended',
    textColor: 'text-white',
  },
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function AgingBar({
  data,
  onSegmentClick,
  showLabels = false,
  className,
}: AgingBarProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className={cn('space-y-3', className)}>
      {/* Bar */}
      <div className="flex h-8 overflow-hidden rounded-lg">
        {data.map((item) => {
          if (item.percentage <= 0) return null
          const config = statusConfig[item.status]

          return (
            <button
              key={item.status}
              onClick={() => onSegmentClick?.(item.status)}
              className={cn(
                'relative flex items-center justify-center transition-opacity',
                config.color,
                onSegmentClick && 'cursor-pointer hover:opacity-90',
                !onSegmentClick && 'cursor-default'
              )}
              style={{ width: `${item.percentage}%` }}
              title={`${config.label}: ${formatCurrency(item.value)} (${item.percentage.toFixed(1)}%)`}
            >
              {showLabels && item.percentage >= 10 && (
                <span className={cn('text-xs font-medium', config.textColor)}>
                  {item.status === 'suspended' && <Lock className="inline h-3 w-3 mr-0.5" />}
                  {item.percentage.toFixed(0)}%
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4">
        {data.map((item) => {
          const config = statusConfig[item.status]
          return (
            <button
              key={item.status}
              onClick={() => onSegmentClick?.(item.status)}
              className={cn(
                'flex items-center gap-2 text-sm text-stone-600',
                onSegmentClick && 'hover:text-stone-900'
              )}
            >
              <div className={cn('h-3 w-3 rounded', config.color)} />
              <span>{config.label}</span>
              <span className="text-stone-400">
                {formatCurrency(item.value)} ({item.percentage.toFixed(1)}%)
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

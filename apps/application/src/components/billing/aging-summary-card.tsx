'use client'

import { cn } from '@clubvantage/ui'
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

export interface AgingBucketSummary {
  label: string
  amount: number
  memberCount: number
  percentage: number
}

export interface AgingSummaryData {
  totalOutstanding: number
  current: AgingBucketSummary
  days1To30: AgingBucketSummary
  days31To60: AgingBucketSummary
  days61To90: AgingBucketSummary
  days90Plus: AgingBucketSummary
  previousPeriodTotal?: number
  membersAtRisk?: number
}

export interface AgingSummaryCardProps {
  data: AgingSummaryData
  title?: string
  showTrend?: boolean
  compact?: boolean
  className?: string
}

const bucketConfig = [
  { key: 'CURRENT', label: 'Current', color: 'bg-emerald-500', textColor: 'text-emerald-700', lightBg: 'bg-emerald-50' },
  { key: 'DAYS_30', label: '1-30 Days', color: 'bg-amber-500', textColor: 'text-amber-700', lightBg: 'bg-amber-50' },
  { key: 'DAYS_60', label: '31-60 Days', color: 'bg-orange-500', textColor: 'text-orange-700', lightBg: 'bg-orange-50' },
  { key: 'DAYS_90', label: '61-90 Days', color: 'bg-red-400', textColor: 'text-red-700', lightBg: 'bg-red-50' },
  { key: 'SUSPENDED', label: '90+ Days', color: 'bg-red-600', textColor: 'text-red-800', lightBg: 'bg-red-100' },
] as const

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`
  }
  return formatCurrency(amount)
}

export function AgingSummaryCard({
  data,
  title = 'Aging Summary',
  showTrend = true,
  compact = false,
  className,
}: AgingSummaryCardProps) {
  const trend = data.previousPeriodTotal
    ? ((data.totalOutstanding - data.previousPeriodTotal) / data.previousPeriodTotal) * 100
    : null

  const buckets = [
    data.current,
    data.days1To30,
    data.days31To60,
    data.days61To90,
    data.days90Plus,
  ]

  // Calculate risk percentage (60+ days)
  const riskAmount = data.days61To90.amount + data.days90Plus.amount
  const riskPercentage = data.totalOutstanding > 0
    ? (riskAmount / data.totalOutstanding) * 100
    : 0

  if (compact) {
    return (
      <div className={cn('rounded-lg border bg-card p-4', className)}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <span className="text-lg font-semibold">{formatCurrency(data.totalOutstanding)}</span>
        </div>

        {/* Distribution bar */}
        <div className="h-2 rounded-full bg-stone-100 overflow-hidden flex">
          {buckets.map((bucket, idx) => {
            const config = bucketConfig[idx]
            if (!config || bucket.percentage === 0) return null
            return (
              <div
                key={config.key}
                className={cn('h-full transition-all', config.color)}
                style={{ width: `${bucket.percentage}%` }}
              />
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs">
          {buckets.map((bucket, idx) => {
            const config = bucketConfig[idx]
            if (!config) return null
            return (
              <div key={config.key} className="flex items-center gap-1.5">
                <div className={cn('w-2 h-2 rounded-full', config.color)} />
                <span className="text-muted-foreground">{config.label}</span>
                <span className="font-medium">{bucket.percentage.toFixed(0)}%</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">{title}</h3>
        {showTrend && trend !== null && (
          <div className={cn(
            'flex items-center gap-1 text-sm',
            trend > 0 ? 'text-red-600' : 'text-emerald-600'
          )}>
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.abs(trend).toFixed(1)}% from last period</span>
          </div>
        )}
      </div>

      {/* Total Outstanding */}
      <div className="p-4 border-b bg-stone-50/50">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total Outstanding</span>
          <span className="text-2xl font-bold">{formatCurrency(data.totalOutstanding)}</span>
        </div>
        {riskPercentage > 20 && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{riskPercentage.toFixed(0)}% of receivables are 60+ days overdue</span>
          </div>
        )}
      </div>

      {/* Distribution Bar */}
      <div className="px-4 py-3">
        <div className="h-3 rounded-full bg-stone-100 overflow-hidden flex">
          {buckets.map((bucket, idx) => {
            const config = bucketConfig[idx]
            if (!config || bucket.percentage === 0) return null
            return (
              <div
                key={config.key}
                className={cn('h-full transition-all first:rounded-l-full last:rounded-r-full', config.color)}
                style={{ width: `${bucket.percentage}%` }}
                title={`${config.label}: ${formatCurrency(bucket.amount)} (${bucket.percentage.toFixed(1)}%)`}
              />
            )
          })}
        </div>
      </div>

      {/* Bucket Details */}
      <div className="grid grid-cols-5 divide-x border-t">
        {buckets.map((bucket, idx) => {
          const config = bucketConfig[idx]
          if (!config) return null
          return (
            <div key={config.key} className="p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className={cn('w-2 h-2 rounded-full', config.color)} />
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </div>
              <div className="text-sm font-semibold">{formatCompactCurrency(bucket.amount)}</div>
              <div className="text-xs text-muted-foreground">{bucket.memberCount} members</div>
            </div>
          )
        })}
      </div>

      {/* Risk Alert */}
      {data.membersAtRisk && data.membersAtRisk > 0 && (
        <div className="p-3 border-t bg-red-50/50">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4" />
            <span><strong>{data.membersAtRisk}</strong> members at risk of suspension (90+ days)</span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * A horizontal inline version for embedding in tables or compact spaces
 */
export function AgingDistributionBar({
  data,
  showLabels = false,
  height = 'h-2',
  className,
}: {
  data: AgingSummaryData
  showLabels?: boolean
  height?: string
  className?: string
}) {
  const buckets = [
    data.current,
    data.days1To30,
    data.days31To60,
    data.days61To90,
    data.days90Plus,
  ]

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('rounded-full bg-stone-100 overflow-hidden flex', height)}>
        {buckets.map((bucket, idx) => {
          const config = bucketConfig[idx]
          if (!config || bucket.percentage === 0) return null
          return (
            <div
              key={config.key}
              className={cn('transition-all', config.color)}
              style={{ width: `${bucket.percentage}%` }}
              title={`${config.label}: ${formatCurrency(bucket.amount)}`}
            />
          )
        })}
      </div>
      {showLabels && (
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>Current</span>
          <span>90+ Days</span>
        </div>
      )}
    </div>
  )
}

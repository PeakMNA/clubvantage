'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus, AlertCircle, RefreshCw } from 'lucide-react'
import { cn, Card, CardContent } from '@clubvantage/ui'

interface ReportKpiCardProps {
  label: string
  value: string | number
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  sparklineData?: number[]
  href?: string
  onClick?: () => void
  isLoading?: boolean
  error?: boolean
  onRetry?: () => void
}

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 100
  const height = 40
  const padding = 2

  // Normalize data to fit in the SVG
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return { x, y }
  })

  // Create path for the line
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  // Create path for the area (closed shape)
  const lastPoint = points[points.length - 1]!
  const areaPath = `${linePath} L ${lastPoint.x} ${height - padding} L ${padding} ${height - padding} Z`

  // Determine trend for color
  const firstValue = data[0]!
  const lastValue = data[data.length - 1]!
  const trendUp = lastValue > firstValue
  const trendDown = lastValue < firstValue

  const strokeColor = trendUp ? '#10b981' : trendDown ? '#ef4444' : '#78716c'
  const fillColor = trendUp ? '#d1fae5' : trendDown ? '#fee2e2' : '#f5f5f4'

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('w-full', className)}
      style={{ height: '40px' }}
    >
      <path d={areaPath} fill={fillColor} />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2" />
    </svg>
  )
}

function LoadingSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-stone-200" />
          <div className="h-8 w-32 rounded bg-stone-200" />
          <div className="h-4 w-20 rounded bg-stone-200" />
          <div className="h-10 w-full rounded bg-stone-100" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ReportKpiCard({
  label,
  value,
  trend,
  sparklineData,
  href,
  onClick,
  isLoading,
  error,
  onRetry,
}: ReportKpiCardProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <Card className="transition-shadow">
        <CardContent className="flex min-h-[140px] flex-col items-center justify-center p-4">
          <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
          <p className="mb-2 text-sm text-stone-600">Failed to load</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          )}
        </CardContent>
      </Card>
    )
  }

  const content = (
    <Card
      className={cn(
        'transition-all duration-200',
        (href || onClick) && 'cursor-pointer hover:shadow-md hover:scale-[1.02]'
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-stone-500">{label}</p>
          <p className="text-3xl font-bold text-stone-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              {trend.direction === 'up' ? (
                <>
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-600">+{trend.value}%</span>
                </>
              ) : trend.direction === 'down' ? (
                <>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">-{Math.abs(trend.value)}%</span>
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 text-stone-500" />
                  <span className="text-stone-500">0%</span>
                </>
              )}
              <span className="text-stone-400">{trend.label || 'vs last month'}</span>
            </div>
          )}
        </div>
        {sparklineData && sparklineData.length > 1 && (
          <div className="mt-3">
            <Sparkline data={sparklineData} />
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    )
  }

  return content
}

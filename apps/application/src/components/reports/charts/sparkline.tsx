'use client'

import { cn } from '@clubvantage/ui'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  className?: string
}

export function Sparkline({ data, width = 100, height = 40, className }: SparklineProps) {
  if (!data || data.length < 2) {
    return (
      <div
        className={cn('bg-stone-100 rounded', className)}
        style={{ width, height }}
      />
    )
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 2

  // Normalize data to fit in the SVG
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return { x, y }
  })

  // Create smooth curve path using quadratic bezier curves
  const firstPoint = points[0]!
  const lastPoint = points[points.length - 1]!

  let linePath = `M ${firstPoint.x} ${firstPoint.y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!
    const curr = points[i]!
    const midX = (prev.x + curr.x) / 2
    linePath += ` Q ${prev.x} ${prev.y} ${midX} ${(prev.y + curr.y) / 2}`
  }
  linePath += ` L ${lastPoint.x} ${lastPoint.y}`

  // Create area path (closed shape)
  const areaPath = `${linePath} L ${lastPoint.x} ${height - padding} L ${padding} ${height - padding} Z`

  // Determine trend for color
  const startValue = data[0]!
  const endValue = data[data.length - 1]!
  const trendUp = endValue > startValue
  const trendDown = endValue < startValue

  const strokeColor = trendUp ? '#10b981' : trendDown ? '#ef4444' : '#78716c'
  const fillColor = trendUp ? '#d1fae5' : trendDown ? '#fee2e2' : '#f5f5f4'

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('shrink-0', className)}
      style={{ width, height }}
    >
      <path d={areaPath} fill={fillColor} />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

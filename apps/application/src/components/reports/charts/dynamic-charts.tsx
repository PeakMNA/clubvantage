'use client'

import dynamic from 'next/dynamic'
import { cn } from '@clubvantage/ui'

// Loading skeleton for charts
function ChartLoadingSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="animate-pulse w-full" style={{ height }}>
      <div className="flex h-full items-end justify-around gap-2 p-4">
        {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
          <div
            key={i}
            className="w-8 rounded-t bg-stone-200"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}

// Dynamic imports with loading states - only load recharts when needed
export const DynamicBarChart = dynamic(
  () => import('./bar-chart').then((mod) => mod.BarChart),
  {
    loading: () => <ChartLoadingSkeleton />,
    ssr: false,
  }
)

export const DynamicLineChart = dynamic(
  () => import('./line-chart').then((mod) => mod.LineChart),
  {
    loading: () => <ChartLoadingSkeleton />,
    ssr: false,
  }
)

export const DynamicDonutChart = dynamic(
  () => import('./donut-chart').then((mod) => mod.DonutChart),
  {
    loading: () => <ChartLoadingSkeleton />,
    ssr: false,
  }
)

export const DynamicSparkline = dynamic(
  () => import('./sparkline').then((mod) => mod.Sparkline),
  {
    loading: () => <div className="h-8 w-20 animate-pulse bg-stone-100 rounded" />,
    ssr: false,
  }
)

export const DynamicAgingBar = dynamic(
  () => import('./aging-bar').then((mod) => mod.AgingBar),
  {
    loading: () => <div className="h-6 w-full animate-pulse bg-stone-100 rounded" />,
    ssr: false,
  }
)

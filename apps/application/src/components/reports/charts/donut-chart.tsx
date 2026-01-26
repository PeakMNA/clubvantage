'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { cn } from '@clubvantage/ui'

interface DonutChartData {
  name: string
  value: number
  color?: string
}

interface DonutChartProps {
  data: DonutChartData[]
  centerLabel?: string | number
  showLegend?: boolean
  legendPosition?: 'right' | 'bottom'
  onSegmentClick?: (data: DonutChartData) => void
  height?: number
  className?: string
}

const DEFAULT_COLORS = [
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#3b82f6', // blue-500
  '#8b5cf6', // purple-500
  '#78716c', // stone-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0]
  const total = payload[0].payload.total || 0
  const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0

  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-lg">
      <p className="font-medium text-stone-900">{data.name}</p>
      <p className="text-sm text-stone-600">
        {formatCurrency(data.value)} ({percentage}%)
      </p>
    </div>
  )
}

function CustomLegend({ payload, onClick }: any) {
  return (
    <div className="flex flex-wrap gap-3">
      {payload?.map((entry: any, index: number) => (
        <button
          key={`legend-${index}`}
          onClick={() => onClick?.(entry)}
          className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
        >
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </button>
      ))}
    </div>
  )
}

export function DonutChart({
  data,
  centerLabel,
  showLegend = true,
  legendPosition = 'bottom',
  onSegmentClick,
  height = 280,
  className,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Add total to each data point for tooltip percentage calculation
  const chartData = data.map((item, index) => ({
    ...item,
    total,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }))

  return (
    <div className={cn('flex flex-col', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            onClick={(_, index) => {
              const item = data[index]
              if (item) onSegmentClick?.(item)
            }}
            style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {centerLabel !== undefined && (
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-stone-900 text-2xl font-bold"
            >
              {typeof centerLabel === 'number' ? formatCurrency(centerLabel) : centerLabel}
            </text>
          )}
        </PieChart>
      </ResponsiveContainer>

      {showLegend && (
        <div className={cn('mt-4', legendPosition === 'right' && 'ml-4')}>
          <div className="flex flex-wrap justify-center gap-4">
            {chartData.map((entry, index) => {
              const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0
              return (
                <button
                  key={index}
                  onClick={() => {
                    const item = data[index]
                    if (item) onSegmentClick?.(item)
                  }}
                  className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span>{entry.name}</span>
                  <span className="text-stone-400">({percentage}%)</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts'
import { cn } from '@clubvantage/ui'

interface BarChartData {
  category: string
  value: number
  previousValue?: number
}

interface BarChartProps {
  data: BarChartData[]
  orientation?: 'horizontal' | 'vertical'
  showComparison?: boolean
  valueFormatter?: (value: number) => string
  onBarClick?: (data: BarChartData) => void
  height?: number
  className?: string
}

const defaultFormatter = (value: number) =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

function CustomTooltip({ active, payload, formatter }: any) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-lg">
      <p className="font-medium text-stone-900">{payload[0]?.payload?.category}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.fill }}>
          {entry.name}: {formatter(entry.value)}
        </p>
      ))}
    </div>
  )
}

export function BarChart({
  data,
  orientation = 'horizontal',
  showComparison = false,
  valueFormatter = defaultFormatter,
  onBarClick,
  height = 300,
  className,
}: BarChartProps) {
  // Sort by value descending
  const sortedData = [...data].sort((a, b) => b.value - a.value)

  const isHorizontal = orientation === 'horizontal'

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={sortedData}
          layout={isHorizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f5f5f4"
            horizontal={!isHorizontal}
            vertical={isHorizontal}
          />
          {isHorizontal ? (
            <>
              <XAxis type="number" tickFormatter={valueFormatter} stroke="#78716c" fontSize={12} />
              <YAxis
                type="category"
                dataKey="category"
                width={120}
                stroke="#78716c"
                fontSize={12}
                tickLine={false}
              />
            </>
          ) : (
            <>
              <XAxis dataKey="category" stroke="#78716c" fontSize={12} tickLine={false} />
              <YAxis tickFormatter={valueFormatter} stroke="#78716c" fontSize={12} />
            </>
          )}
          <Tooltip content={<CustomTooltip formatter={valueFormatter} />} />

          {showComparison && (
            <>
              <Legend
                wrapperStyle={{ paddingTop: 16 }}
                formatter={(value) => (
                  <span className="text-sm text-stone-600">{value}</span>
                )}
              />
              <Bar
                dataKey="previousValue"
                name="Previous Period"
                fill="#d6d3d1"
                radius={[4, 4, 4, 4]}
                barSize={20}
              />
            </>
          )}

          <Bar
            dataKey="value"
            name={showComparison ? 'Current Period' : 'Value'}
            fill="#f59e0b"
            radius={[4, 4, 4, 4]}
            barSize={showComparison ? 20 : 24}
            onClick={(data: any) => {
              if (data && data.category !== undefined && data.value !== undefined) {
                onBarClick?.(data as BarChartData)
              }
            }}
            style={{ cursor: onBarClick ? 'pointer' : 'default' }}
          >
            {sortedData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                className="transition-opacity hover:opacity-80"
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

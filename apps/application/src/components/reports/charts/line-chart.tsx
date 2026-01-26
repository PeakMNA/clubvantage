'use client'

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Legend,
} from 'recharts'
import { format } from 'date-fns'
import { cn } from '@clubvantage/ui'

interface LineChartData {
  date: Date | string
  value: number
  previousValue?: number
}

interface ReferenceLine {
  value: number
  label: string
}

interface LineChartProps {
  data: LineChartData[]
  showArea?: boolean
  showComparison?: boolean
  referenceLines?: ReferenceLine[]
  valueFormatter?: (value: number) => string
  dateFormatter?: (date: Date) => string
  onPointClick?: (data: LineChartData) => void
  height?: number
  className?: string
}

const defaultValueFormatter = (value: number) =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

const defaultDateFormatter = (date: Date) => format(date, 'MMM d')

function CustomTooltip({ active, payload, label, valueFormatter, dateFormatter }: any) {
  if (!active || !payload || !payload.length) return null

  const date = payload[0]?.payload?.date
  const formattedDate = date instanceof Date ? dateFormatter(date) : date

  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-lg">
      <p className="font-medium text-stone-900">{formattedDate}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.stroke }}>
          {entry.name}: {valueFormatter(entry.value)}
        </p>
      ))}
    </div>
  )
}

export function LineChart({
  data,
  showArea = false,
  showComparison = false,
  referenceLines = [],
  valueFormatter = defaultValueFormatter,
  dateFormatter = defaultDateFormatter,
  onPointClick,
  height = 300,
  className,
}: LineChartProps) {
  // Prepare data with formatted dates
  const chartData = data.map((item) => ({
    ...item,
    formattedDate:
      item.date instanceof Date ? dateFormatter(item.date) : item.date,
  }))

  const ChartComponent = showArea ? AreaChart : RechartsLineChart

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          onClick={(e: any) => {
            if (e?.activePayload?.[0]?.payload && onPointClick) {
              onPointClick(e.activePayload[0].payload)
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
          <XAxis
            dataKey="formattedDate"
            stroke="#78716c"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            tickFormatter={valueFormatter}
            stroke="#78716c"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip
            content={
              <CustomTooltip
                valueFormatter={valueFormatter}
                dateFormatter={dateFormatter}
              />
            }
          />

          {referenceLines.map((line, index) => (
            <ReferenceLine
              key={index}
              y={line.value}
              stroke="#78716c"
              strokeDasharray="5 5"
              label={{
                value: line.label,
                position: 'right',
                fill: '#78716c',
                fontSize: 12,
              }}
            />
          ))}

          {showComparison && (
            <>
              <Legend
                wrapperStyle={{ paddingTop: 16 }}
                formatter={(value) => (
                  <span className="text-sm text-stone-600">{value}</span>
                )}
              />
              {showArea ? (
                <Area
                  type="monotone"
                  dataKey="previousValue"
                  name="Previous Period"
                  stroke="#d6d3d1"
                  strokeDasharray="5 5"
                  fill="transparent"
                  strokeWidth={2}
                  dot={false}
                />
              ) : (
                <Line
                  type="monotone"
                  dataKey="previousValue"
                  name="Previous Period"
                  stroke="#d6d3d1"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </>
          )}

          {showArea ? (
            <Area
              type="monotone"
              dataKey="value"
              name={showComparison ? 'Current Period' : 'Value'}
              stroke="#f59e0b"
              fill="#fef3c7"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 0, r: 4 }}
              activeDot={{ fill: '#f59e0b', strokeWidth: 2, stroke: 'white', r: 6 }}
              style={{ cursor: onPointClick ? 'pointer' : 'default' }}
            />
          ) : (
            <Line
              type="monotone"
              dataKey="value"
              name={showComparison ? 'Current Period' : 'Value'}
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 0, r: 4 }}
              activeDot={{ fill: '#f59e0b', strokeWidth: 2, stroke: 'white', r: 6 }}
              style={{ cursor: onPointClick ? 'pointer' : 'default' }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )
}

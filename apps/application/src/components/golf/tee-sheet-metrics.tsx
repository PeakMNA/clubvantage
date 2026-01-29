'use client'

import { cn } from '@clubvantage/ui'
import { Calendar, Users, CheckCircle, Flag, DollarSign, Car } from 'lucide-react'

interface TeeSheetMetricsProps {
  slots: { booked: number; total: number }
  players: number
  checkedIn: number
  onCourse: number
  revenue: number
  carts: { assigned: number; total: number }
  currency?: string
  isLoading?: boolean
}

interface MetricItemProps {
  icon: typeof Calendar
  iconBgColor?: string
  iconColor?: string
  label: string
  value: string
  subValue?: string
  isLoading?: boolean
  highlight?: boolean
}

function MetricItem({ icon: Icon, iconBgColor, iconColor, label, value, subValue, isLoading, highlight }: MetricItemProps) {
  return (
    <div className={cn(
      'relative flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-4 transition-all duration-300',
      'first:rounded-tl-xl last:rounded-br-xl sm:first:rounded-l-xl sm:last:rounded-r-xl',
      highlight && 'bg-gradient-to-br from-emerald-50/50 to-transparent'
    )}>
      <div className={cn(
        'flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl shadow-inner transition-all duration-300',
        iconBgColor || 'bg-gradient-to-br from-muted to-muted/50'
      )}>
        <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', iconColor || 'text-muted-foreground')} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        {isLoading ? (
          <div className="h-5 sm:h-6 w-14 sm:w-16 bg-muted animate-pulse rounded mt-0.5" />
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold tracking-tight text-foreground">{value}</span>
            {subValue && (
              <span className="text-xs text-muted-foreground">{subValue}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function formatCurrency(amount: number, currency: string = '฿'): string {
  return `${currency}${amount.toLocaleString()}`
}

export function TeeSheetMetrics({
  slots,
  players,
  checkedIn,
  onCourse,
  revenue,
  carts,
  currency = '฿',
  isLoading = false,
}: TeeSheetMetricsProps) {
  const slotPercentage = slots.total > 0 ? Math.round((slots.booked / slots.total) * 100) : 0
  const cartPercentage = carts.total > 0 ? Math.round((carts.assigned / carts.total) * 100) : 0

  const metrics = [
    {
      icon: Calendar,
      iconBgColor: 'bg-gradient-to-br from-blue-100 to-blue-200/50 dark:from-blue-900/50 dark:to-blue-800/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      label: 'Slots',
      value: `${slots.booked}/${slots.total}`,
      subValue: `${slotPercentage}%`,
    },
    {
      icon: Users,
      iconBgColor: 'bg-gradient-to-br from-violet-100 to-violet-200/50 dark:from-violet-900/50 dark:to-violet-800/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
      label: 'Players',
      value: players.toString(),
    },
    {
      icon: CheckCircle,
      iconBgColor: 'bg-gradient-to-br from-emerald-100 to-emerald-200/50 dark:from-emerald-900/50 dark:to-emerald-800/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      label: 'Checked In',
      value: checkedIn.toString(),
      highlight: checkedIn > 0,
    },
    {
      icon: Flag,
      iconBgColor: 'bg-gradient-to-br from-amber-100 to-amber-200/50 dark:from-amber-900/50 dark:to-amber-800/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      label: 'On Course',
      value: onCourse.toString(),
    },
    {
      icon: DollarSign,
      iconBgColor: 'bg-gradient-to-br from-emerald-100 to-emerald-200/50 dark:from-emerald-900/50 dark:to-emerald-800/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      label: 'Revenue',
      value: formatCurrency(revenue, currency),
    },
    {
      icon: Car,
      iconBgColor: 'bg-gradient-to-br from-muted to-muted/50',
      iconColor: 'text-muted-foreground',
      label: 'Carts',
      value: `${carts.assigned}/${carts.total}`,
      subValue: `${cartPercentage}%`,
    },
  ]

  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border/60 bg-card/80 shadow-lg shadow-slate-200/30 dark:shadow-black/20 backdrop-blur-sm">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />

      {/* Decorative accent line */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-300" />

      {/* Metrics grid */}
      <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={cn(
              'relative',
              // Vertical dividers (hidden on smallest screens)
              index > 0 && 'sm:border-l border-border',
              // Horizontal dividers for 2-col layout
              index >= 2 && 'border-t sm:border-t-0 border-border',
              // For lg screens, reset borders
              index >= 2 && 'lg:border-t-0',
              // First row has no top border
              index < 2 && 'border-t-0'
            )}
          >
            <MetricItem
              icon={metric.icon}
              iconBgColor={metric.iconBgColor}
              iconColor={metric.iconColor}
              label={metric.label}
              value={metric.value}
              subValue={metric.subValue}
              isLoading={isLoading}
              highlight={metric.highlight}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

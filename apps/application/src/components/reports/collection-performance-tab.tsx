'use client'

import { useState } from 'react'
import { ReportKpiCard } from './report-kpi-card'
import { DrillDownLink } from './drill-down-link'
import { FilterBar } from './filter-bar'
import { ChartWrapper, LineChart, DonutChart, BarChart } from './charts'
import { Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'
import { cn } from '@clubvantage/ui'

interface CollectionTrendData {
  date: string
  value: number
  previousValue?: number
}

interface PaymentMethodBreakdown {
  name: string
  value: number
  color?: string
}

interface OutletCollection {
  id: string
  name: string
  collected: number
  vsLastPeriod: number
  percentOfTotal: number
}

interface ReminderEffectiveness {
  stage: string
  percentage: number
}

interface MembershipCollection {
  type: string
  invoiced: number
  collected: number
  collectionRate: number
  avgDays: number
}

interface CollectionPerformanceTabProps {
  collectionRate?: number
  avgDaysToPay?: number
  collectedThisPeriod?: number
  vsLastPeriod?: number
  trendData?: CollectionTrendData[]
  paymentMethods?: PaymentMethodBreakdown[]
  outletCollections?: OutletCollection[]
  reminderEffectiveness?: ReminderEffectiveness[]
  membershipCollections?: MembershipCollection[]
  isLoading?: boolean
  showComparison?: boolean
  onShowComparisonChange?: (show: boolean) => void
}

const defaultTrendData: CollectionTrendData[] = [
  { date: 'Jan 1', value: 92, previousValue: 88 },
  { date: 'Jan 5', value: 93, previousValue: 89 },
  { date: 'Jan 10', value: 91, previousValue: 90 },
  { date: 'Jan 15', value: 95, previousValue: 91 },
  { date: 'Jan 19', value: 94.5, previousValue: 92 },
]

const defaultPaymentMethods: PaymentMethodBreakdown[] = [
  { name: 'Card', value: 945000, color: '#3b82f6' },
  { name: 'Bank Transfer', value: 735000, color: '#10b981' },
  { name: 'Cash', value: 315000, color: '#f59e0b' },
  { name: 'WHT Certificate', value: 105000, color: '#8b5cf6' },
]

const defaultOutletCollections: OutletCollection[] = [
  { id: '1', name: 'Main Office', collected: 1200000, vsLastPeriod: 12, percentOfTotal: 57 },
  { id: '2', name: 'Pro Shop', collected: 450000, vsLastPeriod: 8, percentOfTotal: 21 },
  { id: '3', name: 'Restaurant', collected: 320000, vsLastPeriod: -3, percentOfTotal: 15 },
  { id: '4', name: 'Fitness Center', collected: 130000, vsLastPeriod: 15, percentOfTotal: 7 },
]

const defaultReminderEffectiveness: ReminderEffectiveness[] = [
  { stage: 'Sent', percentage: 100 },
  { stage: 'Opened', percentage: 75 },
  { stage: 'Paid after 1st', percentage: 45 },
  { stage: 'Paid after 2nd', percentage: 25 },
  { stage: 'Paid after 3rd', percentage: 10 },
  { stage: 'Escalated', percentage: 20 },
]

const defaultMembershipCollections: MembershipCollection[] = [
  { type: 'Individual', invoiced: 1200000, collected: 1140000, collectionRate: 95, avgDays: 15 },
  { type: 'Corporate', invoiced: 680000, collected: 612000, collectionRate: 90, avgDays: 22 },
  { type: 'Family', invoiced: 420000, collected: 399000, collectionRate: 95, avgDays: 18 },
  { type: 'Junior', invoiced: 150000, collected: 135000, collectionRate: 90, avgDays: 20 },
]

const filterConfig = [
  {
    id: 'outlet',
    label: 'Outlet',
    type: 'select' as const,
    options: [
      { value: '', label: 'All Outlets' },
      { value: 'main', label: 'Main Office' },
      { value: 'proshop', label: 'Pro Shop' },
      { value: 'restaurant', label: 'Restaurant' },
      { value: 'fitness', label: 'Fitness Center' },
    ],
  },
  {
    id: 'paymentMethod',
    label: 'Payment Method',
    type: 'select' as const,
    options: [
      { value: '', label: 'All Methods' },
      { value: 'card', label: 'Card' },
      { value: 'transfer', label: 'Bank Transfer' },
      { value: 'cash', label: 'Cash' },
      { value: 'wht', label: 'WHT Certificate' },
    ],
  },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercentage(value: number) {
  return `${value.toFixed(1)}%`
}

export function CollectionPerformanceTab({
  collectionRate = 94.5,
  avgDaysToPay = 18,
  collectedThisPeriod = 2100000,
  vsLastPeriod = 8.2,
  trendData = defaultTrendData,
  paymentMethods = defaultPaymentMethods,
  outletCollections = defaultOutletCollections,
  reminderEffectiveness = defaultReminderEffectiveness,
  membershipCollections = defaultMembershipCollections,
  isLoading,
  showComparison = false,
  onShowComparisonChange,
}: CollectionPerformanceTabProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string | boolean>>({})

  const reminderChartData = reminderEffectiveness.map((item) => ({
    category: item.stage,
    value: item.percentage,
  }))

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <FilterBar
        filters={filterConfig}
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
        onClearAll={() => setActiveFilters({})}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportKpiCard
          label="Collection Rate"
          value={formatPercentage(collectionRate)}
          trend={{ value: collectionRate - 93, direction: collectionRate >= 93 ? 'up' : 'down' }}
          isLoading={isLoading}
        />
        <ReportKpiCard
          label="Avg Days to Pay"
          value={`${avgDaysToPay} days`}
          isLoading={isLoading}
        />
        <ReportKpiCard
          label="Collected This Period"
          value={formatCurrency(collectedThisPeriod)}
          isLoading={isLoading}
        />
        <ReportKpiCard
          label="vs Last Period"
          value={`+${vsLastPeriod}%`}
          trend={{ value: vsLastPeriod, direction: vsLastPeriod >= 0 ? 'up' : 'down' }}
          isLoading={isLoading}
        />
      </div>

      {/* Collection Rate Trend */}
      <ChartWrapper
        title="Collection Rate Trend"
        state={isLoading ? 'loading' : 'success'}
        actions={
          <label className="flex items-center gap-2 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={showComparison}
              onChange={(e) => onShowComparisonChange?.(e.target.checked)}
              className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
            />
            Compare to Previous Period
          </label>
        }
      >
        <LineChart
          data={trendData}
          showArea
          showComparison={showComparison}
          referenceLines={[{ value: 95, label: 'Target 95%' }]}
          valueFormatter={(v) => `${v}%`}
          height={280}
        />
      </ChartWrapper>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Method Breakdown */}
        <ChartWrapper
          title="Payment Method Breakdown"
          state={isLoading ? 'loading' : 'success'}
        >
          <DonutChart
            data={paymentMethods}
            centerLabel={formatCurrency(paymentMethods.reduce((sum, m) => sum + m.value, 0))}
            height={280}
          />
        </ChartWrapper>

        {/* Reminder Effectiveness */}
        <ChartWrapper
          title="Reminder Effectiveness"
          state={isLoading ? 'loading' : 'success'}
        >
          <BarChart
            data={reminderChartData}
            orientation="horizontal"
            valueFormatter={(v) => `${v}%`}
            height={280}
          />
        </ChartWrapper>
      </div>

      {/* Collections by Outlet */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Collections by Outlet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="py-3 text-left text-sm font-medium text-stone-500">Outlet</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">Collected</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">vs Last Period</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {outletCollections.map((outlet) => (
                  <tr key={outlet.id} className="border-b border-stone-50 hover:bg-stone-50">
                    <td className="py-3">
                      <DrillDownLink
                        href={`/billing?filter=outlet:${outlet.id}`}
                        destination="Billing"
                      >
                        {outlet.name}
                      </DrillDownLink>
                    </td>
                    <td className="py-3 text-right font-medium">{formatCurrency(outlet.collected)}</td>
                    <td className="py-3 text-right">
                      <span
                        className={cn(
                          'font-medium',
                          outlet.vsLastPeriod >= 0 ? 'text-emerald-600' : 'text-red-600'
                        )}
                      >
                        {outlet.vsLastPeriod >= 0 ? '+' : ''}{outlet.vsLastPeriod}%
                      </span>
                    </td>
                    <td className="py-3 text-right text-stone-600">{outlet.percentOfTotal}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Collections by Membership Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Collections by Membership Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="py-3 text-left text-sm font-medium text-stone-500">Type</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">Invoiced</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">Collected</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">Collection Rate</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">Avg Days</th>
                </tr>
              </thead>
              <tbody>
                {membershipCollections.map((item, index) => (
                  <tr key={index} className="border-b border-stone-50 hover:bg-stone-50">
                    <td className="py-3 font-medium">{item.type}</td>
                    <td className="py-3 text-right">{formatCurrency(item.invoiced)}</td>
                    <td className="py-3 text-right">{formatCurrency(item.collected)}</td>
                    <td className="py-3 text-right">
                      <span
                        className={cn(
                          'font-medium',
                          item.collectionRate >= 95 ? 'text-emerald-600' :
                          item.collectionRate >= 85 ? 'text-amber-600' : 'text-red-600'
                        )}
                      >
                        {item.collectionRate}%
                      </span>
                    </td>
                    <td className="py-3 text-right text-stone-600">{item.avgDays} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

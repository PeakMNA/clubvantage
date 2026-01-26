'use client'

import { useState } from 'react'
import { ReportKpiCard } from './report-kpi-card'
import { DrillDownLink } from './drill-down-link'
import { FilterBar } from './filter-bar'
import { ChartWrapper, LineChart } from './charts'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@clubvantage/ui'
import { BarChart3, TrendingUp } from 'lucide-react'
import { cn } from '@clubvantage/ui'

interface RevenueBreakdownItem {
  id: string
  name: string
  revenue: number
  percentOfTotal: number
  vsLast: number
}

interface RevenueReportsTabProps {
  totalRevenue?: number
  collected?: number
  outstanding?: number
  growth?: number
  lateFeeRevenue?: number
  trendData?: Array<{ date: Date | string; value: number; previousValue?: number }>
  breakdownData?: RevenueBreakdownItem[]
  isLoading?: boolean
  showComparison?: boolean
  onShowComparisonChange?: (show: boolean) => void
}

const defaultTrendData = [
  { date: 'Jan 1', value: 280000 },
  { date: 'Jan 5', value: 320000 },
  { date: 'Jan 10', value: 290000 },
  { date: 'Jan 15', value: 350000 },
  { date: 'Jan 19', value: 380000 },
]

const defaultBreakdownByType: RevenueBreakdownItem[] = [
  { id: '1', name: 'Individual Membership', revenue: 1200000, percentOfTotal: 49, vsLast: 12 },
  { id: '2', name: 'Corporate Membership', revenue: 680000, percentOfTotal: 28, vsLast: 8 },
  { id: '3', name: 'Family Membership', revenue: 420000, percentOfTotal: 17, vsLast: 5 },
  { id: '4', name: 'Junior Membership', revenue: 150000, percentOfTotal: 6, vsLast: 15 },
]

const filterConfig = [
  {
    id: 'membershipType',
    label: 'Membership Type',
    type: 'select' as const,
    options: [
      { value: '', label: 'All Types' },
      { value: 'individual', label: 'Individual' },
      { value: 'corporate', label: 'Corporate' },
      { value: 'family', label: 'Family' },
      { value: 'junior', label: 'Junior' },
    ],
  },
  {
    id: 'revenueCenter',
    label: 'Revenue Center',
    type: 'select' as const,
    options: [
      { value: '', label: 'All Centers' },
      { value: 'fnb', label: 'Food & Beverage' },
      { value: 'golf', label: 'Golf Operations' },
      { value: 'membership', label: 'Membership Fees' },
      { value: 'proshop', label: 'Pro Shop' },
    ],
  },
  {
    id: 'category',
    label: 'Category',
    type: 'select' as const,
    options: [
      { value: '', label: 'All Categories' },
      { value: 'dues', label: 'Membership Dues' },
      { value: 'greenfees', label: 'Green Fees' },
      { value: 'fnb', label: 'F&B Charges' },
      { value: 'other', label: 'Other' },
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

type GroupingOption = 'type' | 'category' | 'center'

export function RevenueReportsTab({
  totalRevenue = 2450000,
  collected = 2100000,
  outstanding = 350000,
  growth = 12.5,
  lateFeeRevenue = 45000,
  trendData = defaultTrendData,
  breakdownData = defaultBreakdownByType,
  isLoading,
  showComparison = false,
  onShowComparisonChange,
}: RevenueReportsTabProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string | boolean>>({})
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [grouping, setGrouping] = useState<GroupingOption>('type')

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <ReportKpiCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          isLoading={isLoading}
        />
        <ReportKpiCard
          label="Collected"
          value={formatCurrency(collected)}
          isLoading={isLoading}
        />
        <ReportKpiCard
          label="Outstanding"
          value={formatCurrency(outstanding)}
          isLoading={isLoading}
        />
        <ReportKpiCard
          label="Growth"
          value={`+${growth}%`}
          trend={{ value: growth, direction: growth >= 0 ? 'up' : 'down' }}
          isLoading={isLoading}
        />
        <ReportKpiCard
          label="Late Fee Revenue"
          value={formatCurrency(lateFeeRevenue)}
          isLoading={isLoading}
        />
      </div>

      {/* Revenue Trend Chart */}
      <ChartWrapper
        title="Revenue Over Time"
        state={isLoading ? 'loading' : 'success'}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-stone-200">
              <button
                onClick={() => setChartType('line')}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 text-sm',
                  chartType === 'line' ? 'bg-amber-100 text-amber-700' : 'text-stone-600 hover:bg-stone-50'
                )}
              >
                <TrendingUp className="h-4 w-4" />
                Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 text-sm',
                  chartType === 'bar' ? 'bg-amber-100 text-amber-700' : 'text-stone-600 hover:bg-stone-50'
                )}
              >
                <BarChart3 className="h-4 w-4" />
                Bar
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={showComparison}
                onChange={(e) => onShowComparisonChange?.(e.target.checked)}
                className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
              />
              Compare to Previous Period
            </label>
          </div>
        }
      >
        <LineChart
          data={trendData}
          showArea={true}
          showComparison={showComparison}
          height={300}
        />
      </ChartWrapper>

      {/* Breakdown Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
            <div className="flex rounded-lg border border-stone-200">
              {(['type', 'category', 'center'] as GroupingOption[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setGrouping(option)}
                  className={cn(
                    'px-3 py-1.5 text-sm capitalize',
                    grouping === option ? 'bg-amber-100 text-amber-700' : 'text-stone-600 hover:bg-stone-50'
                  )}
                >
                  By {option === 'center' ? 'Revenue Center' : option === 'type' ? 'Membership Type' : 'Category'}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="py-3 text-left text-sm font-medium text-stone-500">Name</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">Revenue</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">% of Total</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">vs Previous</th>
                </tr>
              </thead>
              <tbody>
                {breakdownData.map((item) => (
                  <tr key={item.id} className="border-b border-stone-50 hover:bg-stone-50">
                    <td className="py-3">
                      <DrillDownLink
                        href={`/billing?filter=${grouping}:${item.id}`}
                        destination="Billing"
                      >
                        {item.name}
                      </DrillDownLink>
                    </td>
                    <td className="py-3 text-right font-medium">{formatCurrency(item.revenue)}</td>
                    <td className="py-3 text-right text-stone-600">{item.percentOfTotal}%</td>
                    <td className="py-3 text-right">
                      <span
                        className={cn(
                          'font-medium',
                          item.vsLast >= 0 ? 'text-emerald-600' : 'text-red-600'
                        )}
                      >
                        {item.vsLast >= 0 ? '+' : ''}{item.vsLast}%
                      </span>
                    </td>
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

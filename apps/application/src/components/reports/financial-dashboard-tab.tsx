'use client'

import { useState } from 'react'
import { ReportKpiCard } from './report-kpi-card'
import { DrillDownLink } from './drill-down-link'
import { FilterBar } from './filter-bar'
import { ChartWrapper, BarChart, DonutChart } from './charts'
import { Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'
import { ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@clubvantage/ui'

interface RevenueCenterData {
  id: string
  name: string
  revenue: number
  percentOfTotal: number
  vsLastPeriod: number
  trend: number[]
}

interface OutletData {
  id: string
  name: string
  revenue: number
  transactions: number
}

interface ProfitCenterData {
  id: string
  name: string
  revenue: number
  costs: number
  margin: number
}

interface FinancialDashboardTabProps {
  totalRevenue?: number
  topRevenueCenter?: { name: string; revenue: number }
  topOutlet?: { name: string; revenue: number }
  periodGrowth?: number
  revenueCenters?: RevenueCenterData[]
  outlets?: OutletData[]
  profitCenters?: ProfitCenterData[]
  glSyncStatus?: { lastSynced: Date; status: 'synced' | 'pending' | 'error' }
  isLoading?: boolean
  onCenterClick?: (centerId: string) => void
  onOutletClick?: (outletId: string) => void
}

const defaultRevenueCenters: RevenueCenterData[] = [
  { id: '1', name: 'Food & Beverage', revenue: 1200000, percentOfTotal: 49, vsLastPeriod: 15, trend: [100, 110, 105, 115, 120] },
  { id: '2', name: 'Golf Operations', revenue: 680000, percentOfTotal: 28, vsLastPeriod: 8, trend: [60, 62, 65, 67, 68] },
  { id: '3', name: 'Membership Fees', revenue: 420000, percentOfTotal: 17, vsLastPeriod: 3, trend: [40, 41, 41, 42, 42] },
  { id: '4', name: 'Pro Shop', revenue: 150000, percentOfTotal: 6, vsLastPeriod: -2, trend: [18, 17, 16, 15, 15] },
]

const defaultOutlets: OutletData[] = [
  { id: '1', name: 'Main Restaurant', revenue: 800000, transactions: 1250 },
  { id: '2', name: 'Clubhouse Bar', revenue: 400000, transactions: 890 },
  { id: '3', name: 'Pro Shop', revenue: 150000, transactions: 320 },
  { id: '4', name: 'Halfway House', revenue: 120000, transactions: 450 },
  { id: '5', name: 'Pool Bar', revenue: 80000, transactions: 210 },
]

const defaultProfitCenters: ProfitCenterData[] = [
  { id: '1', name: 'Golf Division', revenue: 680000, costs: 420000, margin: 38 },
  { id: '2', name: 'F&B Division', revenue: 1200000, costs: 780000, margin: 35 },
  { id: '3', name: 'Membership', revenue: 420000, costs: 120000, margin: 71 },
]

const filterConfig = [
  { id: 'all', label: 'All Centers', type: 'toggle' as const },
  { id: 'fnb', label: 'Food & Beverage', type: 'toggle' as const },
  { id: 'golf', label: 'Golf', type: 'toggle' as const },
  { id: 'membership', label: 'Membership', type: 'toggle' as const },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function FinancialDashboardTab({
  totalRevenue = 2450000,
  topRevenueCenter = { name: 'F&B', revenue: 1200000 },
  topOutlet = { name: 'Main Restaurant', revenue: 800000 },
  periodGrowth = 12.5,
  revenueCenters = defaultRevenueCenters,
  outlets = defaultOutlets,
  profitCenters = defaultProfitCenters,
  glSyncStatus = { lastSynced: new Date(), status: 'synced' as const },
  isLoading,
  onCenterClick,
  onOutletClick,
}: FinancialDashboardTabProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string | boolean>>({ all: true })
  const [showProfitCenters, setShowProfitCenters] = useState(false)

  const barChartData = revenueCenters.map((center) => ({
    category: center.name,
    value: center.revenue,
  }))

  const donutChartData = outlets.map((outlet) => ({
    name: outlet.name,
    value: outlet.revenue,
  }))

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <FilterBar
        filters={filterConfig}
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
        onClearAll={() => setActiveFilters({ all: true })}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportKpiCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          isLoading={isLoading}
        />
        <ReportKpiCard
          label="Top Revenue Center"
          value={`${topRevenueCenter.name} (${formatCurrency(topRevenueCenter.revenue)})`}
          isLoading={isLoading}
        />
        <ReportKpiCard
          label="Top Outlet"
          value={`${topOutlet.name} (${formatCurrency(topOutlet.revenue)})`}
          isLoading={isLoading}
        />
        <ReportKpiCard
          label="Period Growth"
          value={`+${periodGrowth}%`}
          trend={{ value: periodGrowth, direction: periodGrowth >= 0 ? 'up' : 'down' }}
          isLoading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Center */}
        <ChartWrapper
          title="Revenue by Center"
          state={isLoading ? 'loading' : 'success'}
        >
          <BarChart
            data={barChartData}
            orientation="horizontal"
            height={280}
            onBarClick={(data) => {
              const center = revenueCenters.find((c) => c.name === data.category)
              if (center) onCenterClick?.(center.id)
            }}
          />
        </ChartWrapper>

        {/* Revenue by Outlet */}
        <ChartWrapper
          title="Revenue by Outlet"
          state={isLoading ? 'loading' : 'success'}
        >
          <DonutChart
            data={donutChartData}
            centerLabel={formatCurrency(totalRevenue)}
            height={280}
            onSegmentClick={(data) => {
              const outlet = outlets.find((o) => o.name === data.name)
              if (outlet) onOutletClick?.(outlet.id)
            }}
          />
        </ChartWrapper>
      </div>

      {/* Revenue Center Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenue by Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="py-3 text-left text-sm font-medium text-stone-500">Revenue Center</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">Revenue</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">% of Total</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">vs Last Period</th>
                </tr>
              </thead>
              <tbody>
                {revenueCenters.map((center) => (
                  <tr key={center.id} className="border-b border-stone-50 hover:bg-stone-50">
                    <td className="py-3">
                      <DrillDownLink
                        href={`/billing?filter=revenue-center:${center.id}`}
                        destination="Billing"
                      >
                        {center.name}
                      </DrillDownLink>
                    </td>
                    <td className="py-3 text-right font-medium">{formatCurrency(center.revenue)}</td>
                    <td className="py-3 text-right text-stone-600">{center.percentOfTotal}%</td>
                    <td className="py-3 text-right">
                      <span
                        className={cn(
                          'font-medium',
                          center.vsLastPeriod >= 0 ? 'text-emerald-600' : 'text-red-600'
                        )}
                      >
                        {center.vsLastPeriod >= 0 ? '+' : ''}{center.vsLastPeriod}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Profit Center Summary (Collapsible) */}
      <Card>
        <button
          onClick={() => setShowProfitCenters(!showProfitCenters)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <span className="text-lg font-semibold text-stone-900">Profit Center Summary</span>
          {showProfitCenters ? (
            <ChevronDown className="h-5 w-5 text-stone-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-stone-500" />
          )}
        </button>
        {showProfitCenters && (
          <CardContent className="pt-0">
            <div className="grid gap-4 sm:grid-cols-3">
              {profitCenters.map((center) => (
                <div
                  key={center.id}
                  className="rounded-lg border border-stone-200 p-4"
                >
                  <h4 className="font-medium text-stone-900">{center.name}</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Revenue</span>
                      <span>{formatCurrency(center.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Costs</span>
                      <span>{formatCurrency(center.costs)}</span>
                    </div>
                    <div className="flex justify-between border-t border-stone-100 pt-1">
                      <span className="font-medium text-stone-700">Margin</span>
                      <span className="font-medium text-emerald-600">{center.margin}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* GL Sync Status */}
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <CheckCircle2 className={cn(
          'h-4 w-4',
          glSyncStatus.status === 'synced' ? 'text-emerald-500' : 'text-amber-500'
        )} />
        <span>
          Last synced: {glSyncStatus.lastSynced.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

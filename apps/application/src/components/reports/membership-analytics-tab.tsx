'use client'

import { useState } from 'react'
import { ReportKpiCard } from './report-kpi-card'
import { DrillDownLink } from './drill-down-link'
import { FilterBar } from './filter-bar'
import { ChartWrapper, LineChart, BarChart } from './charts'
import { Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'
import { ChevronDown, ChevronRight, Users, UserPlus, UserMinus, ArrowRight } from 'lucide-react'
import { cn } from '@clubvantage/ui'

interface MembershipTrendData {
  date: string
  value: number
}

interface MembershipTypeBreakdown {
  id: string
  type: string
  count: number
  percentOfTotal: number
  revenueContribution: number
}

interface LifecycleStage {
  name: string
  count: number
  color: string
}

interface PipelineCard {
  label: string
  value: number | string
  color?: string
}

interface CohortData {
  period: string
  count: number
}

interface MembershipAnalyticsTabProps {
  totalActive?: number
  newThisPeriod?: number
  churned?: number
  netChange?: number
  currentlySuspended?: number
  trendData?: MembershipTrendData[]
  typeBreakdown?: MembershipTypeBreakdown[]
  lifecycleStages?: LifecycleStage[]
  pipelineCards?: PipelineCard[]
  cohortData?: CohortData[]
  avgTimeToDecision?: number
  approvalRate?: number
  isLoading?: boolean
  onStageClick?: (stage: string) => void
  onTypeClick?: (typeId: string) => void
}

const defaultTrendData: MembershipTrendData[] = [
  { date: 'Jul', value: 1180 },
  { date: 'Aug', value: 1195 },
  { date: 'Sep', value: 1200 },
  { date: 'Oct', value: 1210 },
  { date: 'Nov', value: 1220 },
  { date: 'Dec', value: 1228 },
  { date: 'Jan', value: 1234 },
]

const defaultTypeBreakdown: MembershipTypeBreakdown[] = [
  { id: '1', type: 'Individual', count: 680, percentOfTotal: 55, revenueContribution: 1200000 },
  { id: '2', type: 'Corporate', count: 210, percentOfTotal: 17, revenueContribution: 680000 },
  { id: '3', type: 'Family', count: 280, percentOfTotal: 23, revenueContribution: 420000 },
  { id: '4', type: 'Junior', count: 64, percentOfTotal: 5, revenueContribution: 150000 },
]

const defaultLifecycleStages: LifecycleStage[] = [
  { name: 'Application', count: 12, color: '#e5e7eb' },
  { name: 'Under Review', count: 5, color: '#fef3c7' },
  { name: 'Board Approval', count: 3, color: '#fed7aa' },
  { name: 'Active', count: 1234, color: '#d1fae5' },
  { name: 'Suspended', count: 8, color: '#fecaca' },
]

const defaultPipelineCards: PipelineCard[] = [
  { label: 'Submitted', value: 12, color: 'stone' },
  { label: 'In Review', value: 5, color: 'amber' },
  { label: 'Pending Board', value: 3, color: 'orange' },
  { label: 'Approved', value: 15, color: 'emerald' },
  { label: 'Rejected', value: 2, color: 'red' },
]

const defaultCohortData: CohortData[] = [
  { period: '2024', count: 15 },
  { period: '2023', count: 145 },
  { period: '2022', count: 189 },
  { period: '2021', count: 201 },
  { period: '2020', count: 178 },
  { period: 'Before 2020', count: 506 },
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
    id: 'status',
    label: 'Status',
    type: 'select' as const,
    options: [
      { value: '', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'suspended', label: 'Suspended' },
      { value: 'pending', label: 'Pending' },
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

export function MembershipAnalyticsTab({
  totalActive = 1234,
  newThisPeriod = 15,
  churned = 3,
  netChange = 12,
  currentlySuspended = 8,
  trendData = defaultTrendData,
  typeBreakdown = defaultTypeBreakdown,
  lifecycleStages = defaultLifecycleStages,
  pipelineCards = defaultPipelineCards,
  cohortData = defaultCohortData,
  avgTimeToDecision = 14,
  approvalRate = 88,
  isLoading,
  onStageClick,
  onTypeClick,
}: MembershipAnalyticsTabProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string | boolean>>({})
  const [showDistribution, setShowDistribution] = useState(false)

  const barChartData = typeBreakdown.map((item) => ({
    category: item.type,
    value: item.count,
  }))

  const cohortChartData = cohortData.map((item) => ({
    category: item.period,
    value: item.count,
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <ReportKpiCard
          label="Total Active"
          value={totalActive.toLocaleString()}
          sparklineData={trendData.map((d) => d.value)}
          isLoading={isLoading}
        />
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <UserPlus className="h-4 w-4 text-emerald-500" />
              New This Period
            </div>
            <p className="text-2xl font-bold text-emerald-600">{newThisPeriod}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <UserMinus className="h-4 w-4 text-red-500" />
              Churned
            </div>
            <p className="text-2xl font-bold text-red-600">{churned}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-sm text-stone-500">Net Change</span>
            <p className={cn(
              'text-2xl font-bold',
              netChange >= 0 ? 'text-emerald-600' : 'text-red-600'
            )}>
              {netChange >= 0 ? '+' : ''}{netChange}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <span className="text-sm text-stone-500">Currently Suspended</span>
            <p className="text-2xl font-bold text-red-600">{currentlySuspended}</p>
          </CardContent>
        </Card>
      </div>

      {/* Membership Trend Chart */}
      <ChartWrapper
        title="Membership Count Over Time"
        state={isLoading ? 'loading' : 'success'}
      >
        <LineChart
          data={trendData}
          showArea
          height={280}
          valueFormatter={(v) => v.toLocaleString()}
        />
      </ChartWrapper>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Breakdown by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Breakdown by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="py-3 text-left text-sm font-medium text-stone-500">Type</th>
                    <th className="py-3 text-right text-sm font-medium text-stone-500">Count</th>
                    <th className="py-3 text-right text-sm font-medium text-stone-500">% of Total</th>
                    <th className="py-3 text-right text-sm font-medium text-stone-500">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {typeBreakdown.map((item) => (
                    <tr key={item.id} className="border-b border-stone-50 hover:bg-stone-50">
                      <td className="py-3">
                        <DrillDownLink
                          href={`/members?filter=type:${item.id}`}
                          destination="Members"
                        >
                          {item.type}
                        </DrillDownLink>
                      </td>
                      <td className="py-3 text-right font-medium">{item.count}</td>
                      <td className="py-3 text-right text-stone-600">{item.percentOfTotal}%</td>
                      <td className="py-3 text-right text-stone-600">{formatCurrency(item.revenueContribution)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Lifecycle Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lifecycle Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lifecycleStages.map((stage, index) => (
                <button
                  key={stage.name}
                  onClick={() => onStageClick?.(stage.name)}
                  className="flex w-full items-center gap-3 rounded-lg p-3 transition-colors hover:bg-stone-50"
                >
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: stage.color }}
                  >
                    <Users className="h-5 w-5 text-stone-700" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-stone-900">{stage.name}</p>
                    <p className="text-sm text-stone-500">{stage.count.toLocaleString()} members</p>
                  </div>
                  {index < lifecycleStages.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-stone-400" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {pipelineCards.map((card, index) => (
              <div
                key={index}
                className="rounded-lg border border-stone-200 p-4 text-center"
              >
                <p className="text-sm text-stone-500">{card.label}</p>
                <p className={cn(
                  'text-2xl font-bold',
                  card.color === 'emerald' && 'text-emerald-600',
                  card.color === 'red' && 'text-red-600',
                  card.color === 'amber' && 'text-amber-600',
                  card.color === 'orange' && 'text-orange-600',
                  !card.color || card.color === 'stone' && 'text-stone-900'
                )}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-8 border-t border-stone-100 pt-4">
            <div className="text-center">
              <p className="text-sm text-stone-500">Avg Time to Decision</p>
              <p className="text-xl font-bold text-stone-900">{avgTimeToDecision} days</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-stone-500">Approval Rate</p>
              <p className="text-xl font-bold text-emerald-600">{approvalRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Distribution (Collapsible) */}
      <Card>
        <button
          onClick={() => setShowDistribution(!showDistribution)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <span className="text-lg font-semibold text-stone-900">Member Distribution</span>
          {showDistribution ? (
            <ChevronDown className="h-5 w-5 text-stone-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-stone-500" />
          )}
        </button>
        {showDistribution && (
          <CardContent className="pt-0">
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-sm font-medium text-stone-700">By Join Date Cohort</h4>
                <BarChart
                  data={cohortChartData}
                  orientation="vertical"
                  height={200}
                  valueFormatter={(v) => v.toLocaleString()}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

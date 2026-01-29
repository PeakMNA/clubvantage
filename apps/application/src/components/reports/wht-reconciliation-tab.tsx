'use client'

import { useState } from 'react'
import { ReportKpiCard } from './report-kpi-card'
import { DrillDownLink } from './drill-down-link'
import { FilterBar } from './filter-bar'
import { ChartWrapper, DynamicBarChart as BarChart } from './charts'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@clubvantage/ui'
import { CheckCircle, XCircle, Clock, FileText, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@clubvantage/ui'
import { format } from 'date-fns'

type WhtStatus = 'pending' | 'verified' | 'rejected'

interface WhtCertificate {
  id: string
  certificateNumber: string
  memberId: string
  memberName: string
  amount: number
  dateSubmitted: Date
  daysPending: number
  status: WhtStatus
}

interface WhtAgingBucket {
  range: string
  count: number
  amount: number
}

interface MonthlySummary {
  month: string
  verifiedCount: number
  verifiedAmount: number
  pendingAmount: number
}

interface WhtReconciliationTabProps {
  pendingCount?: number
  verifiedThisMonth?: number
  totalReceivable?: number
  rejectedCount?: number
  certificates?: WhtCertificate[]
  agingBuckets?: WhtAgingBucket[]
  monthlySummary?: MonthlySummary[]
  isLoading?: boolean
  onVerify?: (certificateId: string) => void
  onReject?: (certificateId: string) => void
  onViewDocument?: (certificateId: string) => void
}

const defaultCertificates: WhtCertificate[] = [
  {
    id: '1',
    certificateNumber: 'WHT-2024-0001',
    memberId: 'M001',
    memberName: 'Sarah Johnson',
    amount: 600,
    dateSubmitted: new Date('2024-01-18'),
    daysPending: 1,
    status: 'pending',
  },
  {
    id: '2',
    certificateNumber: 'WHT-2024-0002',
    memberId: 'M002',
    memberName: 'Michael Chen',
    amount: 1500,
    dateSubmitted: new Date('2024-01-10'),
    daysPending: 9,
    status: 'pending',
  },
  {
    id: '3',
    certificateNumber: 'WHT-2024-0003',
    memberId: 'M003',
    memberName: 'Emily Davis',
    amount: 900,
    dateSubmitted: new Date('2024-01-05'),
    daysPending: 0,
    status: 'verified',
  },
]

const defaultAgingBuckets: WhtAgingBucket[] = [
  { range: '0-7 days', count: 5, amount: 3500 },
  { range: '8-14 days', count: 3, amount: 2800 },
  { range: '15-30 days', count: 2, amount: 1200 },
  { range: '30+ days', count: 1, amount: 500 },
]

const defaultMonthlySummary: MonthlySummary[] = [
  { month: 'January 2024', verifiedCount: 23, verifiedAmount: 45000, pendingAmount: 8000 },
  { month: 'December 2023', verifiedCount: 28, verifiedAmount: 52000, pendingAmount: 0 },
  { month: 'November 2023', verifiedCount: 31, verifiedAmount: 58000, pendingAmount: 0 },
]

const filterConfig = [
  { id: 'all', label: 'All', type: 'toggle' as const },
  { id: 'pending', label: 'Pending', type: 'toggle' as const },
  { id: 'verified', label: 'Verified', type: 'toggle' as const },
  { id: 'rejected', label: 'Rejected', type: 'toggle' as const },
]

const statusConfig: Record<WhtStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Pending' },
  verified: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Verified' },
  rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Rejected' },
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function WhtStatusBadge({ status }: { status: WhtStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        config.bg,
        config.color
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}

export function WhtReconciliationTab({
  pendingCount = 8,
  verifiedThisMonth = 23,
  totalReceivable = 125000,
  rejectedCount = 2,
  certificates = defaultCertificates,
  agingBuckets = defaultAgingBuckets,
  monthlySummary = defaultMonthlySummary,
  isLoading,
  onVerify,
  onReject,
  onViewDocument,
}: WhtReconciliationTabProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string | boolean>>({ all: true })
  const [showMonthlySummary, setShowMonthlySummary] = useState(false)

  const agingChartData = agingBuckets.map((bucket) => ({
    category: bucket.range,
    value: bucket.amount,
  }))

  const filteredCertificates = certificates.filter((cert) => {
    if (activeFilters.all) return true
    if (activeFilters.pending && cert.status === 'pending') return true
    if (activeFilters.verified && cert.status === 'verified') return true
    if (activeFilters.rejected && cert.status === 'rejected') return true
    return false
  })

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <span className="text-sm text-stone-500">Pending Verification</span>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <span className="text-sm text-stone-500">Verified This Month</span>
            <p className="text-2xl font-bold text-emerald-600">{verifiedThisMonth}</p>
          </CardContent>
        </Card>
        <ReportKpiCard
          label="Total WHT Receivable"
          value={formatCurrency(totalReceivable)}
          isLoading={isLoading}
        />
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <span className="text-sm text-stone-500">Rejected</span>
            <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filterConfig}
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
        onClearAll={() => setActiveFilters({ all: true })}
      />

      {/* Certificate Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Certificate Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="py-3 text-left text-sm font-medium text-stone-500">Certificate #</th>
                  <th className="py-3 text-left text-sm font-medium text-stone-500">Member</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">Amount</th>
                  <th className="py-3 text-left text-sm font-medium text-stone-500">Date Submitted</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">Days Pending</th>
                  <th className="py-3 text-left text-sm font-medium text-stone-500">Status</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.map((cert) => (
                  <tr
                    key={cert.id}
                    className={cn(
                      'border-b border-stone-50 hover:bg-stone-50',
                      cert.status === 'pending' && 'border-l-2 border-l-amber-500'
                    )}
                  >
                    <td className="py-3 font-mono text-sm">{cert.certificateNumber}</td>
                    <td className="py-3">
                      <DrillDownLink href={`/members/${cert.memberId}`} destination="Members">
                        {cert.memberName}
                      </DrillDownLink>
                    </td>
                    <td className="py-3 text-right font-medium">{formatCurrency(cert.amount)}</td>
                    <td className="py-3 text-sm text-stone-600">
                      {format(cert.dateSubmitted, 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={cn(
                          cert.daysPending > 14 && 'text-red-600 font-medium'
                        )}
                      >
                        {cert.daysPending}
                      </span>
                    </td>
                    <td className="py-3">
                      <WhtStatusBadge status={cert.status} />
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {cert.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onVerify?.(cert.id)}
                              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            >
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onReject?.(cert.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewDocument?.(cert.id)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* WHT Receivable Aging Chart */}
      <ChartWrapper
        title="WHT Receivable Aging"
        state={isLoading ? 'loading' : 'success'}
      >
        <BarChart
          data={agingChartData}
          orientation="vertical"
          height={200}
        />
      </ChartWrapper>

      {/* Monthly Summary (Collapsible) */}
      <Card>
        <button
          onClick={() => setShowMonthlySummary(!showMonthlySummary)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <span className="text-lg font-semibold text-stone-900">Monthly Summary (Tax Filing)</span>
          {showMonthlySummary ? (
            <ChevronDown className="h-5 w-5 text-stone-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-stone-500" />
          )}
        </button>
        {showMonthlySummary && (
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="py-3 text-left text-sm font-medium text-stone-500">Month</th>
                    <th className="py-3 text-right text-sm font-medium text-stone-500">Verified Count</th>
                    <th className="py-3 text-right text-sm font-medium text-stone-500">Verified Amount</th>
                    <th className="py-3 text-right text-sm font-medium text-stone-500">Pending Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySummary.map((row, index) => (
                    <tr key={index} className="border-b border-stone-50">
                      <td className="py-3 font-medium">{row.month}</td>
                      <td className="py-3 text-right">{row.verifiedCount}</td>
                      <td className="py-3 text-right">{formatCurrency(row.verifiedAmount)}</td>
                      <td className="py-3 text-right">
                        {row.pendingAmount > 0 ? (
                          <span className="text-amber-600">{formatCurrency(row.pendingAmount)}</span>
                        ) : (
                          <span className="text-stone-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm">
                Export for Accountant
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

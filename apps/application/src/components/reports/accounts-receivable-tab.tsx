'use client'

import { useState } from 'react'
import { DrillDownLink } from './drill-down-link'
import { FilterBar } from './filter-bar'
import { DynamicAgingBar as AgingBar } from './charts'
import { Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'
import { Lock, AlertTriangle, Search, MoreHorizontal } from 'lucide-react'
import { cn } from '@clubvantage/ui'

type AgingStatus = 'CURRENT' | 'DAYS_30' | 'DAYS_60' | 'DAYS_90' | 'SUSPENDED'

interface AgingBucket {
  status: AgingStatus
  label: string
  amount: number
  count: number
  percentage: number
}

interface AgingMember {
  id: string
  name: string
  membershipNumber: string
  invoiceCount: number
  totalDue: number
  oldestInvoice: Date
  daysOverdue: number
  status: AgingStatus
  photoUrl?: string
}

interface AccountsReceivableTabProps {
  agingBuckets?: AgingBucket[]
  members?: AgingMember[]
  suspendedCount?: number
  suspendedTotal?: number
  avgReinstatementDays?: number
  isLoading?: boolean
  onMemberClick?: (memberId: string) => void
  onSendReminder?: (memberId: string) => void
  onOverrideSuspension?: (memberId: string) => void
  canOverrideSuspension?: boolean
}

const defaultAgingBuckets: AgingBucket[] = [
  { status: 'CURRENT', label: 'Current (0-30)', amount: 450000, count: 234, percentage: 50 },
  { status: 'DAYS_30', label: '1-30 Days', amount: 180000, count: 45, percentage: 20 },
  { status: 'DAYS_60', label: '31-60 Days', amount: 120000, count: 28, percentage: 13 },
  { status: 'DAYS_90', label: '61-90 Days', amount: 85000, count: 15, percentage: 10 },
  { status: 'SUSPENDED', label: '91+ Suspended', amount: 55000, count: 8, percentage: 7 },
]

const defaultMembers: AgingMember[] = [
  {
    id: 'M001',
    name: 'Robert Wilson',
    membershipNumber: 'MEM-0001',
    invoiceCount: 3,
    totalDue: 120000,
    oldestInvoice: new Date('2023-09-15'),
    daysOverdue: 125,
    status: 'SUSPENDED',
  },
  {
    id: 'M002',
    name: 'Michael Chen',
    membershipNumber: 'MEM-0002',
    invoiceCount: 2,
    totalDue: 55000,
    oldestInvoice: new Date('2023-11-01'),
    daysOverdue: 78,
    status: 'DAYS_90',
  },
  {
    id: 'M003',
    name: 'Sarah Johnson',
    membershipNumber: 'MEM-0003',
    invoiceCount: 1,
    totalDue: 32000,
    oldestInvoice: new Date('2023-12-15'),
    daysOverdue: 35,
    status: 'DAYS_60',
  },
  {
    id: 'M004',
    name: 'Emily Davis',
    membershipNumber: 'MEM-0004',
    invoiceCount: 1,
    totalDue: 18000,
    oldestInvoice: new Date('2024-01-05'),
    daysOverdue: 14,
    status: 'DAYS_30',
  },
]

const filterConfig = [
  { id: 'all', label: 'All', type: 'toggle' as const },
  { id: 'CURRENT', label: 'Current', type: 'toggle' as const },
  { id: 'DAYS_30_PLUS', label: '30+', type: 'toggle' as const },
  { id: 'DAYS_60_PLUS', label: '60+', type: 'toggle' as const },
  { id: 'DAYS_90_PLUS', label: '90+', type: 'toggle' as const },
  { id: 'SUSPENDED', label: 'Suspended', type: 'toggle' as const },
]

const statusConfig: Record<AgingStatus, { bg: string; text: string; label: string }> = {
  CURRENT: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Current' },
  DAYS_30: { bg: 'bg-amber-100', text: 'text-amber-700', label: '30 Days' },
  DAYS_60: { bg: 'bg-orange-100', text: 'text-orange-700', label: '60 Days' },
  DAYS_90: { bg: 'bg-red-100', text: 'text-red-700', label: '90 Days' },
  SUSPENDED: { bg: 'bg-red-500', text: 'text-white', label: 'Suspended' },
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function AgingBadge({ status }: { status: AgingStatus }) {
  const config = statusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        config.bg,
        config.text
      )}
    >
      {status === 'SUSPENDED' && <Lock className="h-3 w-3" />}
      {config.label}
    </span>
  )
}

export function AccountsReceivableTab({
  agingBuckets = defaultAgingBuckets,
  members = defaultMembers,
  suspendedCount = 8,
  suspendedTotal = 55000,
  avgReinstatementDays = 12,
  isLoading,
  onMemberClick,
  onSendReminder,
  onOverrideSuspension,
  canOverrideSuspension = false,
}: AccountsReceivableTabProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string | boolean>>({ all: true })
  const [searchQuery, setSearchQuery] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const agingBarData = agingBuckets.map((bucket) => ({
    status: bucket.status,
    value: bucket.amount,
    percentage: bucket.percentage,
  }))

  const filteredMembers = members.filter((member) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        member.name.toLowerCase().includes(query) ||
        member.membershipNumber.toLowerCase().includes(query)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Aging Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {agingBuckets.map((bucket) => (
          <Card
            key={bucket.status}
            className={cn(
              'border-l-4',
              bucket.status === 'CURRENT' && 'border-l-emerald-500',
              bucket.status === 'DAYS_30' && 'border-l-amber-500',
              bucket.status === 'DAYS_60' && 'border-l-orange-500',
              bucket.status === 'DAYS_90' && 'border-l-red-500',
              bucket.status === 'SUSPENDED' && 'border-l-red-700'
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-stone-500">{bucket.label}</span>
                {bucket.status === 'SUSPENDED' && <Lock className="h-3 w-3 text-red-500" />}
              </div>
              <p className="text-2xl font-bold text-stone-900">{formatCurrency(bucket.amount)}</p>
              <p className="text-sm text-stone-500">{bucket.count} invoices</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Aging Distribution Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aging Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <AgingBar
            data={agingBarData}
            showLabels={true}
            onSegmentClick={(status) => {
              setActiveFilters({ [status]: true })
            }}
          />
        </CardContent>
      </Card>

      {/* Suspended Members Callout */}
      {suspendedCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-red-100 p-3">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">
                {suspendedCount} Members Currently Suspended
              </h3>
              <p className="text-sm text-red-700">
                Total at Risk: {formatCurrency(suspendedTotal)} &bull; Avg Time to Reinstatement: {avgReinstatementDays} days
              </p>
            </div>
            <DrillDownLink
              href="/billing?filter=suspended"
              destination="Billing"
              showArrow
              className="text-red-600 hover:text-red-700"
            >
              Manage Suspensions
            </DrillDownLink>
          </CardContent>
        </Card>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <FilterBar
          filters={filterConfig}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
          onClearAll={() => setActiveFilters({ all: true })}
        />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-stone-200 py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
      </div>

      {/* Member Aging Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Member Aging</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="py-3 text-left text-sm font-medium text-stone-500">Member</th>
                  <th className="py-3 text-left text-sm font-medium text-stone-500">Membership #</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">Invoices</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">Total Due</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">Days Overdue</th>
                  <th className="py-3 text-left text-sm font-medium text-stone-500">Status</th>
                  <th className="py-3 text-right text-sm font-medium text-stone-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className={cn(
                      'border-b border-stone-50 hover:bg-stone-50',
                      member.status === 'SUSPENDED' && 'bg-red-50/50'
                    )}
                  >
                    <td className="py-3">
                      <DrillDownLink
                        href={`/members/${member.id}`}
                        destination="Members"
                      >
                        {member.name}
                      </DrillDownLink>
                    </td>
                    <td className="py-3 font-mono text-sm text-stone-600">{member.membershipNumber}</td>
                    <td className="py-3 text-right">{member.invoiceCount}</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(member.totalDue)}</td>
                    <td className="py-3 text-right">{member.daysOverdue} days</td>
                    <td className="py-3">
                      <AgingBadge status={member.status} />
                    </td>
                    <td className="py-3 text-right">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)}
                          className="rounded-lg p-1 hover:bg-stone-100"
                        >
                          <MoreHorizontal className="h-4 w-4 text-stone-500" />
                        </button>
                        {openMenu === member.id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
                            <button
                              onClick={() => {
                                onSendReminder?.(member.id)
                                setOpenMenu(null)
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50"
                            >
                              Send Reminder
                            </button>
                            <button
                              onClick={() => {
                                onMemberClick?.(member.id)
                                setOpenMenu(null)
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50"
                            >
                              View Member
                            </button>
                            {member.status === 'SUSPENDED' && canOverrideSuspension && (
                              <button
                                onClick={() => {
                                  onOverrideSuspension?.(member.id)
                                  setOpenMenu(null)
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-amber-600 hover:bg-amber-50"
                              >
                                Override Suspension
                              </button>
                            )}
                          </div>
                        )}
                      </div>
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

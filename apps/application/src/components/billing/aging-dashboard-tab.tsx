'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@clubvantage/ui'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Lock,
  MoreVertical,
  Send,
  FileText,
  ShieldCheck,
  User,
} from 'lucide-react'
import { AgingBadge, type AgingStatus } from './aging-badge'

export interface AgingBucket {
  id: AgingStatus
  label: string
  memberCount: number
  totalAmount: number
  percentage: number
}

export interface AgingMember {
  id: string
  name: string
  photoUrl?: string
  membershipType: string
  oldestInvoiceDate: Date | string
  balance: number
  daysOutstanding: number
  status: AgingStatus
}

export interface ReinstatedMember {
  id: string
  name: string
  clearedDate: Date | string
  previousBalance: number
  receiptId: string
  receiptNumber: string
}

type AgingFilter = 'all' | '30+' | '60+' | '90+' | 'suspended'
type SortOption = 'balance-desc' | 'days-desc' | 'name-asc'

interface AgingDashboardTabProps {
  /** Aging bucket data */
  buckets: AgingBucket[]
  /** Member aging list */
  members: AgingMember[]
  /** Reinstated members in last 7 days */
  reinstatedMembers: ReinstatedMember[]
  /** Current page */
  currentPage: number
  /** Total pages */
  totalPages: number
  /** Total count */
  totalCount: number
  /** Items per page */
  pageSize: number
  /** Loading state */
  isLoading?: boolean
  /** Whether user has suspension override permission */
  canOverrideSuspension?: boolean
  /** Callback when filter changes */
  onFilterChange?: (filter: AgingFilter) => void
  /** Callback when sort changes */
  onSortChange?: (sort: SortOption) => void
  /** Callback when page changes */
  onPageChange?: (page: number) => void
  /** Callback for member actions */
  onMemberAction?: (action: string, memberId: string) => void
  /** Additional class names */
  className?: string
}

const bucketColors: Record<AgingStatus, { border: string; bg: string; text: string }> = {
  current: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-500',
    text: 'text-emerald-700',
  },
  '30': {
    border: 'border-l-amber-500',
    bg: 'bg-amber-500',
    text: 'text-amber-700',
  },
  '60': {
    border: 'border-l-orange-500',
    bg: 'bg-orange-500',
    text: 'text-orange-700',
  },
  '90': {
    border: 'border-l-red-500',
    bg: 'bg-red-500',
    text: 'text-red-700',
  },
  suspended: {
    border: 'border-l-red-600',
    bg: 'bg-red-600',
    text: 'text-red-700',
  },
}

const agingFilters: { id: AgingFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: '30+', label: '30+' },
  { id: '60+', label: '60+' },
  { id: '90+', label: '90+' },
  { id: 'suspended', label: 'Suspended Only' },
]

const sortOptions: { id: SortOption; label: string }[] = [
  { id: 'balance-desc', label: 'Balance (High to Low)' },
  { id: 'days-desc', label: 'Days Outstanding' },
  { id: 'name-asc', label: 'Member Name' },
]

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function BucketCard({
  bucket,
  isActive,
  onClick,
}: {
  bucket: AgingBucket
  isActive: boolean
  onClick: () => void
}) {
  const colors = bucketColors[bucket.id]
  const isSuspended = bucket.id === 'suspended'

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-1 flex-col rounded-xl border-l-4 bg-card p-4 text-left transition-all',
        colors.border,
        isActive
          ? 'ring-2 ring-amber-500/50 shadow-lg'
          : 'shadow-sm hover:shadow-md'
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('text-sm font-medium', colors.text)}>{bucket.label}</span>
        {isSuspended && <Lock className="h-3.5 w-3.5 text-red-600" />}
      </div>
      <div className="mt-2 text-3xl font-bold text-foreground">
        {bucket.memberCount}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">
        ฿{formatCurrency(bucket.totalAmount)}
      </div>
    </button>
  )
}

function DistributionBar({ buckets }: { buckets: AgingBucket[] }) {
  return (
    <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-muted">
      {buckets.map((bucket) => {
        const colors = bucketColors[bucket.id]
        if (bucket.percentage <= 0) return null
        return (
          <div
            key={bucket.id}
            className={cn('h-full transition-all', colors.bg)}
            style={{ width: `${bucket.percentage}%` }}
            title={`${bucket.label}: ฿${formatCurrency(bucket.totalAmount)} (${bucket.percentage.toFixed(1)}%)`}
          />
        )
      })}
    </div>
  )
}

function MemberTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg bg-card p-4"
        >
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="ml-auto h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}

export function AgingDashboardTab({
  buckets,
  members,
  reinstatedMembers,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  isLoading = false,
  canOverrideSuspension = false,
  onFilterChange,
  onSortChange,
  onPageChange,
  onMemberAction,
  className,
}: AgingDashboardTabProps) {
  const [activeFilter, setActiveFilter] = useState<AgingFilter>('all')
  const [activeSort, setActiveSort] = useState<SortOption>('balance-desc')
  const [selectedBucket, setSelectedBucket] = useState<AgingStatus | null>(null)
  const [isReinstatementExpanded, setIsReinstatementExpanded] = useState(false)

  const handleBucketClick = (bucketId: AgingStatus) => {
    if (selectedBucket === bucketId) {
      setSelectedBucket(null)
      onFilterChange?.('all')
    } else {
      setSelectedBucket(bucketId)
      // Map bucket to filter
      const filterMap: Record<AgingStatus, AgingFilter> = {
        current: 'all',
        '30': '30+',
        '60': '60+',
        '90': '90+',
        suspended: 'suspended',
      }
      onFilterChange?.(filterMap[bucketId])
    }
  }

  const handleFilterClick = (filter: AgingFilter) => {
    setActiveFilter(filter)
    setSelectedBucket(null)
    onFilterChange?.(filter)
  }

  const handleSortChange = (sort: SortOption) => {
    setActiveSort(sort)
    onSortChange?.(sort)
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Dashboard Section */}
      <section className="rounded-xl border border-border bg-muted/50 p-4">
        <div className="flex flex-wrap gap-3">
          {buckets.map((bucket) => (
            <BucketCard
              key={bucket.id}
              bucket={bucket}
              isActive={selectedBucket === bucket.id}
              onClick={() => handleBucketClick(bucket.id)}
            />
          ))}
        </div>
        <DistributionBar buckets={buckets} />
      </section>

      {/* Member Aging List */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {agingFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter.id)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  activeFilter === filter.id
                    ? 'border-amber-200 bg-amber-100 text-amber-700'
                    : 'border-border bg-card text-muted-foreground hover:border-border'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:border-border">
                Sort: {sortOptions.find((o) => o.id === activeSort)?.label}
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => handleSortChange(option.id)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && <MemberTableSkeleton />}

        {/* Data table */}
        {!isLoading && members.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Member
                  </th>
                  <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Membership Type
                  </th>
                  <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Oldest Invoice
                  </th>
                  <th className="p-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Balance
                  </th>
                  <th className="p-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Days Outstanding
                  </th>
                  <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="w-12 p-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {members.map((member) => {
                  const isSuspended = member.status === 'suspended'
                  return (
                    <tr
                      key={member.id}
                      className={cn(
                        'transition-colors hover:bg-muted/50',
                        isSuspended && 'bg-red-50/50'
                      )}
                    >
                      <td className="p-3">
                        <Link
                          href={`/members/${member.id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
                            {member.photoUrl ? (
                              <img
                                src={member.photoUrl}
                                alt={member.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-foreground hover:text-amber-600 hover:underline">
                            {member.name}
                          </span>
                        </Link>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {member.membershipType}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {formatDate(member.oldestInvoiceDate)}
                      </td>
                      <td className="p-3 text-right text-sm font-semibold text-foreground">
                        ฿{formatCurrency(member.balance)}
                      </td>
                      <td className="p-3 text-right text-sm text-muted-foreground">
                        {member.daysOutstanding} days
                      </td>
                      <td className="p-3">
                        <AgingBadge status={member.status} />
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded p-1 hover:bg-muted">
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onMemberAction?.('send-reminder', member.id)}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onMemberAction?.('create-arrangement', member.id)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Create Arrangement
                            </DropdownMenuItem>
                            {isSuspended && (
                              <DropdownMenuItem
                                onClick={() => onMemberAction?.('override-suspension', member.id)}
                                disabled={!canOverrideSuspension}
                                className={!canOverrideSuspension ? 'opacity-50' : ''}
                              >
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Override Suspension
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => onMemberAction?.('view-member', member.id)}
                            >
                              <User className="mr-2 h-4 w-4" />
                              View Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && members.length > 0 && (
          <div className="flex items-center justify-end gap-4">
            <span className="text-sm text-muted-foreground">
              Showing {startItem}-{endItem} of {totalCount}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-lg border border-border p-2 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-border p-2 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Reinstatement Queue (Collapsible) */}
      {reinstatedMembers.length > 0 && (
        <section className="rounded-xl border border-border bg-card">
          <button
            onClick={() => setIsReinstatementExpanded(!isReinstatementExpanded)}
            className="flex w-full items-center justify-between p-4"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Recently Reinstated</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                {reinstatedMembers.length}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform',
                isReinstatementExpanded && 'rotate-180'
              )}
            />
          </button>
          {isReinstatementExpanded && (
            <div className="border-t border-border">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Member
                    </th>
                    <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Cleared Date
                    </th>
                    <th className="p-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Previous Balance
                    </th>
                    <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Payment Receipt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reinstatedMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/50">
                      <td className="p-3">
                        <Link
                          href={`/members/${member.id}`}
                          className="font-medium text-foreground hover:text-amber-600 hover:underline"
                        >
                          {member.name}
                        </Link>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {formatDate(member.clearedDate)}
                      </td>
                      <td className="p-3 text-right text-sm text-muted-foreground">
                        ฿{formatCurrency(member.previousBalance)}
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/billing/receipts/${member.receiptId}`}
                          className="font-mono text-sm text-foreground hover:text-amber-600 hover:underline"
                        >
                          {member.receiptNumber}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

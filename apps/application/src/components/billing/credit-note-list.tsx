'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@clubvantage/ui'
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  FileText,
  CheckCircle,
  Ban,
  RefreshCw,
  CreditCard,
  FileCheck,
} from 'lucide-react'

export type CreditNoteStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'applied'
  | 'partially_applied'
  | 'refunded'
  | 'voided'

export type CreditNoteType =
  | 'refund'
  | 'adjustment'
  | 'courtesy'
  | 'promo'
  | 'write_off'
  | 'return'
  | 'cancellation'

export interface CreditNoteListItem {
  id: string
  creditNoteNumber: string
  memberId: string
  memberName: string
  issueDate: Date | string
  type: CreditNoteType
  reason: string
  totalAmount: number
  appliedAmount: number
  status: CreditNoteStatus
}

export interface CreditNoteSummary {
  totalIssued: number
  pendingApproval: number
  applied: number
  availableBalance: number
}

type QuickFilter = 'all' | 'pending' | 'approved' | 'applied' | 'voided'

export interface CreditNoteListProps {
  /** Credit note data to display */
  creditNotes: CreditNoteListItem[]
  /** Summary metrics */
  summary: CreditNoteSummary
  /** Current page number (1-indexed) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Total number of credit notes */
  totalCount: number
  /** Items per page */
  pageSize: number
  /** Loading state */
  isLoading?: boolean
  /** Error state */
  error?: string
  /** Callback when filter changes */
  onFilterChange?: (filter: QuickFilter) => void
  /** Callback when page changes */
  onPageChange?: (page: number) => void
  /** Callback when creating credit note */
  onCreateCreditNote?: () => void
  /** Callback for row actions */
  onRowAction?: (action: string, creditNoteId: string) => void
  /** Callback when retry is clicked (on error) */
  onRetry?: () => void
  /** Additional class names */
  className?: string
}

const quickFilters: { id: QuickFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending Approval' },
  { id: 'approved', label: 'Approved' },
  { id: 'applied', label: 'Applied' },
  { id: 'voided', label: 'Voided' },
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

function SummaryMetric({
  label,
  value,
  colorClass,
}: {
  label: string
  value: number
  colorClass?: string
}) {
  return (
    <div className="flex flex-1 flex-col items-center border-r border-border px-4 py-2 last:border-r-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-2xl font-semibold', colorClass || 'text-foreground')}>
        ฿{formatCurrency(value)}
      </span>
    </div>
  )
}

function CreditNoteStatusBadge({ status }: { status: CreditNoteStatus }) {
  const config: Record<
    CreditNoteStatus,
    { label: string; bgClass: string; textClass: string }
  > = {
    draft: { label: 'Draft', bgClass: 'bg-stone-100', textClass: 'text-stone-600' },
    pending_approval: {
      label: 'Pending',
      bgClass: 'bg-amber-100',
      textClass: 'text-amber-700',
    },
    approved: {
      label: 'Approved',
      bgClass: 'bg-blue-100',
      textClass: 'text-blue-700',
    },
    applied: {
      label: 'Applied',
      bgClass: 'bg-emerald-100',
      textClass: 'text-emerald-700',
    },
    partially_applied: {
      label: 'Partial',
      bgClass: 'bg-teal-100',
      textClass: 'text-teal-700',
    },
    refunded: {
      label: 'Refunded',
      bgClass: 'bg-purple-100',
      textClass: 'text-purple-700',
    },
    voided: {
      label: 'Voided',
      bgClass: 'bg-red-100',
      textClass: 'text-red-700',
    },
  }

  const { label, bgClass, textClass } = config[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        bgClass,
        textClass
      )}
    >
      {label}
    </span>
  )
}

function CreditNoteTypeBadge({ type }: { type: CreditNoteType }) {
  const config: Record<CreditNoteType, { label: string }> = {
    refund: { label: 'Refund' },
    adjustment: { label: 'Adjustment' },
    courtesy: { label: 'Courtesy' },
    promo: { label: 'Promo' },
    write_off: { label: 'Write-off' },
    return: { label: 'Return' },
    cancellation: { label: 'Cancellation' },
  }

  return (
    <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
      {config[type].label}
    </span>
  )
}

function CreditNoteTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg bg-card p-4"
        >
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="ml-auto h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}

export function CreditNoteList({
  creditNotes,
  summary,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  isLoading = false,
  error,
  onFilterChange,
  onPageChange,
  onCreateCreditNote,
  onRowAction,
  onRetry,
  className,
}: CreditNoteListProps) {
  const [activeFilter, setActiveFilter] = useState<QuickFilter>('all')

  const handleFilterChange = (filter: QuickFilter) => {
    setActiveFilter(filter)
    onFilterChange?.(filter)
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Metrics */}
      <div className="flex rounded-xl border border-border bg-card">
        <SummaryMetric label="Total Issued" value={summary.totalIssued} />
        <SummaryMetric
          label="Pending Approval"
          value={summary.pendingApproval}
          colorClass="text-amber-600"
        />
        <SummaryMetric
          label="Applied"
          value={summary.applied}
          colorClass="text-emerald-600"
        />
        <SummaryMetric
          label="Available Balance"
          value={summary.availableBalance}
          colorClass="text-blue-600"
        />
      </div>

      {/* Filters & Actions Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {quickFilters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange(filter.id)}
              className={
                activeFilter === filter.id
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white'
                  : ''
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600">{error}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && <CreditNoteTableSkeleton />}

      {/* Credit Note Table */}
      {!isLoading && !error && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/50 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
            <div className="col-span-2">Credit Note #</div>
            <div className="col-span-3">Member</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-1"></div>
          </div>

          {/* Table Body */}
          {creditNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="mb-4 h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">No credit notes found</p>
              <p className="text-sm">
                {activeFilter === 'all'
                  ? 'Create your first credit note to get started'
                  : `No credit notes with status: ${activeFilter}`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {creditNotes.map((note) => (
                <div
                  key={note.id}
                  className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="col-span-2">
                    <Link
                      href={`/billing/credit-notes/${note.id}`}
                      className="font-medium text-foreground hover:text-amber-600 hover:underline"
                    >
                      {note.creditNoteNumber}
                    </Link>
                  </div>
                  <div className="col-span-3">
                    <Link
                      href={`/members/${note.memberId}`}
                      className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {note.memberName}
                    </Link>
                  </div>
                  <div className="col-span-1 text-sm text-muted-foreground">
                    {formatDate(note.issueDate)}
                  </div>
                  <div className="col-span-2">
                    <CreditNoteTypeBadge type={note.type} />
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="font-medium text-foreground">
                      ฿{formatCurrency(note.totalAmount)}
                    </div>
                    {note.appliedAmount > 0 && note.appliedAmount < note.totalAmount && (
                      <div className="text-xs text-muted-foreground">
                        Applied: ฿{formatCurrency(note.appliedAmount)}
                      </div>
                    )}
                  </div>
                  <div className="col-span-1 text-center">
                    <CreditNoteStatusBadge status={note.status} />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onRowAction?.('view', note.id)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {note.status === 'pending_approval' && (
                          <DropdownMenuItem
                            onClick={() => onRowAction?.('approve', note.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        {(note.status === 'approved' ||
                          note.status === 'partially_applied') && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onRowAction?.('apply-balance', note.id)}
                            >
                              <CreditCard className="mr-2 h-4 w-4" />
                              Apply to Balance
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onRowAction?.('apply-invoice', note.id)}
                            >
                              <FileCheck className="mr-2 h-4 w-4" />
                              Apply to Invoice
                            </DropdownMenuItem>
                          </>
                        )}
                        {note.status !== 'voided' && note.status !== 'applied' && (
                          <DropdownMenuItem
                            onClick={() => onRowAction?.('void', note.id)}
                            className="text-red-600"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Void
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <div className="text-sm text-muted-foreground">
                Showing {startItem} to {endItem} of {totalCount} credit notes
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

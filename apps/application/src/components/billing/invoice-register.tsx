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
  ChevronDown,
  Filter,
  Calendar,
  MoreVertical,
  FileText,
  Send,
  Clock,
  Receipt,
  Download,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import { AgingBadge, type AgingStatus } from './aging-badge'
import { InvoiceStatusBadge, type InvoiceStatus } from './invoice-status-badge'

export interface InvoiceRegisterItem {
  id: string
  invoiceNumber: string
  memberId: string
  memberName: string
  date: Date | string
  dueDate: Date | string
  amount: number
  balance: number
  status: InvoiceStatus
  agingStatus: AgingStatus
}

export interface InvoiceRegisterSummary {
  totalInvoiced: number
  outstanding: number
  current: number
  days30to60: number
  days61to90: number
  days91Plus: number
}

type QuickFilter = 'all' | 'DRAFT' | 'SENT' | 'OVERDUE' | 'PAID'

export interface InvoiceRegisterProps {
  /** Invoice data to display */
  invoices: InvoiceRegisterItem[]
  /** Summary metrics */
  summary: InvoiceRegisterSummary
  /** Current page number (1-indexed) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Total number of invoices */
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
  /** Callback when creating invoice */
  onCreateInvoice?: () => void
  /** Callback for row actions */
  onRowAction?: (action: string, invoiceId: string) => void
  /** Callback when retry is clicked (on error) */
  onRetry?: () => void
  /** Additional class names */
  className?: string
}

const quickFilters: { id: QuickFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'DRAFT', label: 'Draft' },
  { id: 'SENT', label: 'Sent' },
  { id: 'OVERDUE', label: 'Overdue' },
  { id: 'PAID', label: 'Paid' },
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

function InvoiceTableSkeleton() {
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
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onCreateInvoice }: { onCreateInvoice?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 rounded-full bg-muted p-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-foreground">No invoices found</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Get started by creating your first invoice
      </p>
      {onCreateInvoice && (
        <Button onClick={onCreateInvoice} className="bg-gradient-to-br from-amber-500 to-amber-600">
          Create Invoice
        </Button>
      )}
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-center gap-3">
        <XCircle className="h-5 w-5 text-red-500" />
        <span className="text-sm text-red-800">{error}</span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-auto border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}

export function InvoiceRegister({
  invoices,
  summary,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  isLoading = false,
  error,
  onFilterChange,
  onPageChange,
  onCreateInvoice,
  onRowAction,
  onRetry,
  className,
}: InvoiceRegisterProps) {
  const [activeFilter, setActiveFilter] = useState<QuickFilter>('all')
  const [isCompactView, setIsCompactView] = useState(false)

  const handleFilterClick = (filter: QuickFilter) => {
    setActiveFilter(filter)
    onFilterChange?.(filter)
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header area */}
      <div className="flex items-center justify-end gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Generate Batch
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Monthly Membership Fees</DropdownMenuItem>
            <DropdownMenuItem>F&B Outstanding</DropdownMenuItem>
            <DropdownMenuItem>Event Charges</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          onClick={onCreateInvoice}
          className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
        >
          + Create Invoice
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                activeFilter === filter.id
                  ? 'border-amber-200 dark:border-amber-500/30 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                  : 'border-border bg-card text-foreground hover:bg-muted'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">
            <Calendar className="h-4 w-4" />
            <span>Jan 1 - Jan 31, 2024</span>
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex rounded-xl border border-border bg-muted/50 p-2">
        <SummaryMetric label="Total Invoiced" value={summary.totalInvoiced} />
        <SummaryMetric label="Outstanding" value={summary.outstanding} />
        <SummaryMetric label="Current" value={summary.current} colorClass="text-emerald-600" />
        <SummaryMetric label="30-60 Days" value={summary.days30to60} colorClass="text-amber-600" />
        <SummaryMetric label="61-90 Days" value={summary.days61to90} colorClass="text-orange-600" />
        <SummaryMetric label="91+ Suspended" value={summary.days91Plus} colorClass="text-red-600" />
      </div>

      {/* Error state */}
      {error && <ErrorState error={error} onRetry={onRetry} />}

      {/* Loading state */}
      {isLoading && <InvoiceTableSkeleton />}

      {/* Empty state */}
      {!isLoading && !error && invoices.length === 0 && (
        <EmptyState onCreateInvoice={onCreateInvoice} />
      )}

      {/* Data table */}
      {!isLoading && !error && invoices.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Invoice #
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Member
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Due Date
                </th>
                <th className="p-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Amount
                </th>
                <th className="p-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Balance
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                {!isCompactView && (
                  <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Aging
                  </th>
                )}
                <th className="w-12 p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className={cn(
                    'transition-colors hover:bg-muted/50',
                    isCompactView ? 'h-10' : 'h-14'
                  )}
                >
                  <td className="p-3">
                    <Link
                      href={`/billing/invoices/${invoice.id}`}
                      className="font-mono text-sm text-foreground hover:text-amber-600 dark:hover:text-amber-400 hover:underline"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/members/${invoice.memberId}`}
                      className={cn(
                        'text-sm text-foreground hover:text-amber-600 dark:hover:text-amber-400 hover:underline',
                        isCompactView && 'max-w-[140px] truncate'
                      )}
                    >
                      {isCompactView && invoice.memberName.length > 20
                        ? `${invoice.memberName.slice(0, 20)}...`
                        : invoice.memberName}
                    </Link>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {formatDate(invoice.date)}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="p-3 text-right text-sm text-muted-foreground">
                    ฿{formatCurrency(invoice.amount)}
                  </td>
                  <td className="p-3 text-right text-sm font-medium text-foreground">
                    ฿{formatCurrency(invoice.balance)}
                  </td>
                  <td className="p-3">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  {!isCompactView && (
                    <td className="p-3">
                      <AgingBadge status={invoice.agingStatus} />
                    </td>
                  )}
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded p-1 hover:bg-muted">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onRowAction?.('view', invoice.id)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onRowAction?.('send', invoice.id)}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onRowAction?.('late-fee', invoice.id)}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Apply Late Fee
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onRowAction?.('create-receipt', invoice.id)}
                        >
                          <Receipt className="mr-2 h-4 w-4" />
                          Create Receipt
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onRowAction?.('download', invoice.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onRowAction?.('void', invoice.id)}
                          className="text-red-600"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Void
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toolbar */}
      {!isLoading && !error && invoices.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={isCompactView}
                onChange={(e) => setIsCompactView(e.target.checked)}
                className="h-4 w-4 rounded border-border text-amber-500 focus:ring-amber-500/30"
              />
              Compact view
            </label>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Showing {startItem}-{endItem} of {totalCount}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-lg border border-border p-2 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-border p-2 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

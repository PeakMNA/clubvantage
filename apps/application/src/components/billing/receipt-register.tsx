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
  Calendar,
  Receipt,
  CreditCard,
  Banknote,
  Building2,
  MoreVertical,
  FileText,
  Download,
  XCircle,
  Eye,
} from 'lucide-react'

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'check'

export interface ReceiptAllocation {
  invoiceId: string
  invoiceNumber: string
  amountAllocated: number
  balanceAfter: number
}

export interface ReceiptRegisterItem {
  id: string
  receiptNumber: string
  memberId: string
  memberName: string
  date: Date | string
  method: PaymentMethod
  amount: number
  whtAmount?: number
  outlet: string
  allocations: ReceiptAllocation[]
  status: 'pending' | 'completed' | 'void'
}

export interface ReceiptRegisterSummary {
  totalReceipts: number
  cashReceived: number
  whtReceived: number
  invoicesSettled: number
  depositsToCredit: number
}

interface ReceiptRegisterProps {
  /** Receipt data to display */
  receipts: ReceiptRegisterItem[]
  /** Summary metrics */
  summary: ReceiptRegisterSummary
  /** Available outlets for filtering */
  outlets: string[]
  /** Current page number (1-indexed) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Total count of receipts */
  totalCount: number
  /** Items per page */
  pageSize: number
  /** Loading state */
  isLoading?: boolean
  /** Callback when filter changes */
  onFilterChange?: (filters: { outlet?: string; method?: PaymentMethod; hasWht?: boolean }) => void
  /** Callback when page changes */
  onPageChange?: (page: number) => void
  /** Callback when creating receipt */
  onCreateReceipt?: () => void
  /** Callback for row actions */
  onRowAction?: (action: string, receiptId: string) => void
  /** Additional class names */
  className?: string
}

const paymentMethods: { id: PaymentMethod | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'transfer', label: 'Transfer' },
  { id: 'check', label: 'Check' },
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

function getMethodIcon(method: PaymentMethod) {
  switch (method) {
    case 'cash':
      return <Banknote className="h-4 w-4" />
    case 'card':
      return <CreditCard className="h-4 w-4" />
    case 'transfer':
      return <Building2 className="h-4 w-4" />
    case 'check':
      return <Receipt className="h-4 w-4" />
  }
}

function SummaryMetric({
  label,
  value,
  isCurrency = false,
}: {
  label: string
  value: number
  isCurrency?: boolean
}) {
  return (
    <div className="flex flex-1 flex-col items-center border-r border-border px-4 py-2 last:border-r-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold text-foreground">
        {isCurrency ? `฿${formatCurrency(value)}` : value.toLocaleString()}
      </span>
    </div>
  )
}

function ReceiptTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg bg-card p-4"
        >
          <div className="h-4 w-4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="ml-auto h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onCreateReceipt }: { onCreateReceipt?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Receipt className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-foreground">No receipts found</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Start recording payments to track settlements
      </p>
      {onCreateReceipt && (
        <Button onClick={onCreateReceipt} className="bg-gradient-to-br from-amber-500 to-amber-600">
          Create Receipt
        </Button>
      )}
    </div>
  )
}

function ReceiptRow({
  receipt,
  isExpanded,
  onToggleExpand,
  onRowAction,
}: {
  receipt: ReceiptRegisterItem
  isExpanded: boolean
  onToggleExpand: () => void
  onRowAction?: (action: string, receiptId: string) => void
}) {
  const hasWht = receipt.whtAmount && receipt.whtAmount > 0
  const invoiceCount = receipt.allocations.length

  return (
    <>
      <tr className="border-b border-border transition-colors hover:bg-muted/50">
        <td className="p-3">
          <button
            onClick={onToggleExpand}
            className="rounded p-1 hover:bg-muted"
          >
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          </button>
        </td>
        <td className="p-3">
          <Link
            href={`/billing/receipts/${receipt.id}`}
            className="font-mono text-sm text-foreground hover:text-amber-600 hover:underline"
          >
            {receipt.receiptNumber}
          </Link>
        </td>
        <td className="p-3">
          <Link
            href={`/members/${receipt.memberId}`}
            className="text-sm text-foreground hover:text-amber-600 hover:underline"
          >
            {receipt.memberName}
          </Link>
        </td>
        <td className="p-3 text-sm text-muted-foreground">{formatDate(receipt.date)}</td>
        <td className="p-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {getMethodIcon(receipt.method)}
            <span className="capitalize">{receipt.method}</span>
          </div>
        </td>
        <td className="p-3 text-right text-sm font-medium text-foreground">
          ฿{formatCurrency(receipt.amount)}
        </td>
        <td className="p-3 text-right text-sm text-muted-foreground">
          {hasWht ? (
            <div className="flex items-center justify-end gap-1.5">
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                WHT
              </span>
              <span>฿{formatCurrency(receipt.whtAmount!)}</span>
            </div>
          ) : (
            '—'
          )}
        </td>
        <td className="p-3 text-sm text-muted-foreground">{receipt.outlet}</td>
        <td className="p-3">
          {invoiceCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {invoiceCount} {invoiceCount === 1 ? 'invoice' : 'invoices'}
            </span>
          )}
        </td>
        <td className="p-3">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              receipt.status === 'completed' && 'bg-emerald-100 text-emerald-700',
              receipt.status === 'pending' && 'bg-amber-100 text-amber-700',
              receipt.status === 'void' && 'bg-muted text-muted-foreground line-through'
            )}
          >
            {receipt.status === 'completed' ? 'Completed' : receipt.status === 'pending' ? 'Pending' : 'Void'}
          </span>
        </td>
        <td className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded p-1 hover:bg-muted">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onRowAction?.('view', receipt.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRowAction?.('download', receipt.id)}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </DropdownMenuItem>
              {receipt.status !== 'void' && (
                <DropdownMenuItem
                  onClick={() => onRowAction?.('void', receipt.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Void Receipt
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
      {isExpanded && receipt.allocations.length > 0 && (
        <tr>
          <td colSpan={11} className="bg-muted/50 p-0">
            <div className="px-12 py-3">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Invoice #</th>
                    <th className="pb-2 text-right font-medium">Amount Allocated</th>
                    <th className="pb-2 text-right font-medium">Balance After</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {receipt.allocations.map((allocation) => (
                    <tr key={allocation.invoiceId} className="border-t border-border">
                      <td className="py-2">
                        <Link
                          href={`/billing/invoices/${allocation.invoiceId}`}
                          className="font-mono text-foreground hover:text-amber-600 hover:underline"
                        >
                          {allocation.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-2 text-right text-muted-foreground">
                        ฿{formatCurrency(allocation.amountAllocated)}
                      </td>
                      <td className="py-2 text-right text-foreground">
                        ฿{formatCurrency(allocation.balanceAfter)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export function ReceiptRegister({
  receipts,
  summary,
  outlets,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  isLoading = false,
  onFilterChange,
  onPageChange,
  onCreateReceipt,
  onRowAction,
  className,
}: ReceiptRegisterProps) {
  const [activeOutlet, setActiveOutlet] = useState<string>('all')
  const [activeMethod, setActiveMethod] = useState<PaymentMethod | 'all'>('all')
  const [hasWhtFilter, setHasWhtFilter] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const handleOutletChange = (outlet: string) => {
    setActiveOutlet(outlet)
    onFilterChange?.({
      outlet: outlet === 'all' ? undefined : outlet,
      method: activeMethod === 'all' ? undefined : activeMethod,
      hasWht: hasWhtFilter,
    })
  }

  const handleMethodChange = (method: PaymentMethod | 'all') => {
    setActiveMethod(method)
    onFilterChange?.({
      outlet: activeOutlet === 'all' ? undefined : activeOutlet,
      method: method === 'all' ? undefined : method,
      hasWht: hasWhtFilter,
    })
  }

  const handleWhtFilterChange = (checked: boolean) => {
    setHasWhtFilter(checked)
    onFilterChange?.({
      outlet: activeOutlet === 'all' ? undefined : activeOutlet,
      method: activeMethod === 'all' ? undefined : activeMethod,
      hasWht: checked,
    })
  }

  const toggleRowExpand = (receiptId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(receiptId)) {
        next.delete(receiptId)
      } else {
        next.add(receiptId)
      }
      return next
    })
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header area */}
      <div className="flex items-center justify-end">
        <Button
          onClick={onCreateReceipt}
          className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
        >
          + Create Receipt
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Outlet filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleOutletChange('all')}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              activeOutlet === 'all'
                ? 'border-amber-200 bg-amber-100 text-amber-700'
                : 'border-border bg-card text-muted-foreground hover:border-border'
            )}
          >
            All Outlets
          </button>
          {outlets.map((outlet) => (
            <button
              key={outlet}
              onClick={() => handleOutletChange(outlet)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                activeOutlet === outlet
                  ? 'border-amber-200 bg-amber-100 text-amber-700'
                  : 'border-border bg-card text-muted-foreground hover:border-border'
              )}
            >
              {outlet}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-muted" />

        {/* Payment method filter */}
        <div className="flex gap-2">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => handleMethodChange(method.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                activeMethod === method.id
                  ? 'border-amber-200 bg-amber-100 text-amber-700'
                  : 'border-border bg-card text-muted-foreground hover:border-border'
              )}
            >
              {method.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:border-border">
            <Calendar className="h-4 w-4" />
            <span>Jan 1 - Jan 31, 2024</span>
          </button>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={hasWhtFilter}
              onChange={(e) => handleWhtFilterChange(e.target.checked)}
              className="h-4 w-4 rounded border-border text-amber-500 focus:ring-amber-500/30"
            />
            Has WHT
          </label>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex rounded-xl border border-border bg-muted/50 p-2">
        <SummaryMetric label="Total Receipts" value={summary.totalReceipts} />
        <SummaryMetric label="Cash Received" value={summary.cashReceived} isCurrency />
        <SummaryMetric label="WHT Received" value={summary.whtReceived} isCurrency />
        <SummaryMetric label="Invoices Settled" value={summary.invoicesSettled} />
        <SummaryMetric label="Deposits to Credit" value={summary.depositsToCredit} isCurrency />
      </div>

      {/* Loading state */}
      {isLoading && <ReceiptTableSkeleton />}

      {/* Empty state */}
      {!isLoading && receipts.length === 0 && (
        <EmptyState onCreateReceipt={onCreateReceipt} />
      )}

      {/* Data table */}
      {!isLoading && receipts.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="w-12 p-3" />
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Receipt #
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Member
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Method
                </th>
                <th className="p-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Amount
                </th>
                <th className="p-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  WHT
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Outlet
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Invoices
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="w-12 p-3" />
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt) => (
                <ReceiptRow
                  key={receipt.id}
                  receipt={receipt}
                  isExpanded={expandedRows.has(receipt.id)}
                  onToggleExpand={() => toggleRowExpand(receipt.id)}
                  onRowAction={onRowAction}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toolbar */}
      {!isLoading && receipts.length > 0 && (
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
    </div>
  )
}

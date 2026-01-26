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
  Calendar,
  FileText,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Download,
} from 'lucide-react'
import { WhtStatusBadge, type WhtStatus } from './wht-status-badge'

export interface WhtCertificateItem {
  id: string
  certificateNumber: string
  memberId: string
  memberName: string
  receiptId: string
  receiptNumber: string
  amount: number
  rate: string
  date: Date | string
  status: WhtStatus
  verifiedBy?: string
  verifiedAt?: Date | string
}

export interface WhtCertificatesSummary {
  pending: number
  verified: number
  totalAmount: number
}

type StatusFilter = 'all' | WhtStatus

interface WhtCertificatesTabProps {
  /** Certificate data */
  certificates: WhtCertificateItem[]
  /** Summary metrics */
  summary: WhtCertificatesSummary
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
  /** Callback when filter changes */
  onFilterChange?: (status: StatusFilter) => void
  /** Callback when page changes */
  onPageChange?: (page: number) => void
  /** Callback when certificate is clicked */
  onCertificateClick?: (certificateId: string) => void
  /** Callback when bulk verify is clicked */
  onBulkVerify?: (certificateIds: string[]) => void
  /** Callback for row actions */
  onRowAction?: (action: string, certificateId: string) => void
  /** Additional class names */
  className?: string
}

const statusFilters: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'verified', label: 'Verified' },
  { id: 'rejected', label: 'Rejected' },
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
  isCurrency = false,
}: {
  label: string
  value: number
  colorClass?: string
  isCurrency?: boolean
}) {
  return (
    <div className="flex flex-1 flex-col items-center border-r border-border px-4 py-2 last:border-r-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-2xl font-semibold', colorClass || 'text-foreground')}>
        {isCurrency ? `฿${formatCurrency(value)}` : value.toLocaleString()}
      </span>
    </div>
  )
}

function CertificateTableSkeleton() {
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
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="ml-auto h-6 w-16 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 rounded-full bg-muted p-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-foreground">No WHT certificates</h3>
      <p className="text-sm text-muted-foreground">
        WHT certificates will appear here when receipts include withholding tax
      </p>
    </div>
  )
}

export function WhtCertificatesTab({
  certificates,
  summary,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  isLoading = false,
  onFilterChange,
  onPageChange,
  onCertificateClick,
  onBulkVerify,
  onRowAction,
  className,
}: WhtCertificatesTabProps) {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all')
  const [selectedCertificates, setSelectedCertificates] = useState<Set<string>>(new Set())

  const handleFilterClick = (filter: StatusFilter) => {
    setActiveFilter(filter)
    onFilterChange?.(filter)
    setSelectedCertificates(new Set())
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = certificates
        .filter((c) => c.status === 'pending')
        .map((c) => c.id)
      setSelectedCertificates(new Set(pendingIds))
    } else {
      setSelectedCertificates(new Set())
    }
  }

  const handleSelectCertificate = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedCertificates)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedCertificates(newSelected)
  }

  const handleBulkVerify = () => {
    onBulkVerify?.(Array.from(selectedCertificates))
  }

  const pendingCertificates = certificates.filter((c) => c.status === 'pending')
  const hasSelectedPending = selectedCertificates.size > 0

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
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
        <div className="ml-auto flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:border-border">
            <Calendar className="h-4 w-4" />
            <span>Jan 1 - Jan 31, 2024</span>
          </button>
          {hasSelectedPending && (
            <Button
              onClick={handleBulkVerify}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
            >
              Verify Selected ({selectedCertificates.size})
            </Button>
          )}
        </div>
      </div>

      {/* Summary metrics */}
      <div className="flex rounded-xl border border-border bg-muted/50 p-2">
        <SummaryMetric label="Pending" value={summary.pending} colorClass="text-amber-600" />
        <SummaryMetric label="Verified" value={summary.verified} colorClass="text-emerald-600" />
        <SummaryMetric label="Total WHT Amount" value={summary.totalAmount} isCurrency />
      </div>

      {/* Loading state */}
      {isLoading && <CertificateTableSkeleton />}

      {/* Empty state */}
      {!isLoading && certificates.length === 0 && <EmptyState />}

      {/* Data table */}
      {!isLoading && certificates.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="w-12 p-3">
                  <input
                    type="checkbox"
                    checked={
                      pendingCertificates.length > 0 &&
                      pendingCertificates.every((c) => selectedCertificates.has(c.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-[18px] w-[18px] rounded border-border text-amber-500 focus:ring-amber-500/30"
                    disabled={pendingCertificates.length === 0}
                  />
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Certificate #
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Member
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Receipt #
                </th>
                <th className="p-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Amount
                </th>
                <th className="p-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Rate
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Verified By
                </th>
                <th className="w-12 p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {certificates.map((cert) => {
                const isPending = cert.status === 'pending'
                return (
                  <tr
                    key={cert.id}
                    onClick={() => onCertificateClick?.(cert.id)}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-muted/50',
                      isPending && 'border-l-2 border-l-amber-400'
                    )}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedCertificates.has(cert.id)}
                        onChange={(e) => handleSelectCertificate(cert.id, e.target.checked)}
                        className="h-[18px] w-[18px] rounded border-border text-amber-500 focus:ring-amber-500/30"
                        disabled={!isPending}
                      />
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-sm text-foreground">
                        {cert.certificateNumber}
                      </span>
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/members/${cert.memberId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-foreground hover:text-amber-600 hover:underline"
                      >
                        {cert.memberName}
                      </Link>
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/billing/receipts/${cert.receiptId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-sm text-foreground hover:text-amber-600 hover:underline"
                      >
                        {cert.receiptNumber}
                      </Link>
                    </td>
                    <td className="p-3 text-right text-sm font-medium text-foreground">
                      ฿{formatCurrency(cert.amount)}
                    </td>
                    <td className="p-3 text-center text-sm text-muted-foreground">{cert.rate}</td>
                    <td className="p-3 text-sm text-muted-foreground">{formatDate(cert.date)}</td>
                    <td className="p-3">
                      <WhtStatusBadge status={cert.status} />
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {cert.verifiedBy && cert.verifiedAt ? (
                        <span>
                          {cert.verifiedBy}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(cert.verifiedAt)}
                          </span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded p-1 hover:bg-muted">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => onRowAction?.('view', cert.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {isPending && (
                            <>
                              <DropdownMenuItem
                                onClick={() => onRowAction?.('verify', cert.id)}
                                className="text-emerald-600 focus:text-emerald-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verify
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onRowAction?.('reject', cert.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => onRowAction?.('download', cert.id)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
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

      {/* Toolbar */}
      {!isLoading && certificates.length > 0 && (
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

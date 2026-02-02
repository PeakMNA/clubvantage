'use client'

import { useState, useMemo } from 'react'
import { cn } from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Mail,
  Printer,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
} from 'lucide-react'

export interface StatementTransaction {
  id: string
  date: Date | string
  type: 'INVOICE' | 'PAYMENT' | 'CREDIT' | 'ADJUSTMENT'
  description: string
  reference?: string
  debit?: number
  credit?: number
  runningBalance: number
}

export interface StatementMember {
  id: string
  name: string
  memberNumber: string
  membershipType: string
  email?: string
  address?: string
}

export interface MemberStatementProps {
  /** Member information */
  member: StatementMember
  /** Statement period start date */
  periodStart: Date
  /** Statement period end date */
  periodEnd: Date
  /** Opening balance at period start */
  openingBalance: number
  /** Closing balance at period end */
  closingBalance: number
  /** Transaction list */
  transactions: StatementTransaction[]
  /** Loading state */
  isLoading?: boolean
  /** Callback for download PDF */
  onDownload?: () => void
  /** Callback for email statement */
  onEmail?: () => void
  /** Callback for print */
  onPrint?: () => void
  /** Additional class names */
  className?: string
}

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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))
}

function TransactionTypeBadge({ type }: { type: StatementTransaction['type'] }) {
  const config: Record<
    StatementTransaction['type'],
    { label: string; icon: typeof ArrowUpRight; colorClass: string }
  > = {
    INVOICE: {
      label: 'Invoice',
      icon: ArrowUpRight,
      colorClass: 'text-red-600 bg-red-50',
    },
    PAYMENT: {
      label: 'Payment',
      icon: ArrowDownRight,
      colorClass: 'text-emerald-600 bg-emerald-50',
    },
    CREDIT: {
      label: 'Credit',
      icon: ArrowDownRight,
      colorClass: 'text-blue-600 bg-blue-50',
    },
    ADJUSTMENT: {
      label: 'Adjustment',
      icon: FileText,
      colorClass: 'text-amber-600 bg-amber-50',
    },
  }

  const { label, icon: Icon, colorClass } = config[type]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        colorClass
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

function StatementSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-4 w-24 rounded bg-muted ml-auto" />
          <div className="h-4 w-32 rounded bg-muted ml-auto" />
        </div>
      </div>

      {/* Balance summary skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="mt-2 h-6 w-28 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border">
        <div className="border-b p-3">
          <div className="flex gap-4">
            {[80, 100, 200, 80, 80, 100].map((w, i) => (
              <div key={i} className="h-4 rounded bg-muted" style={{ width: w }} />
            ))}
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border-b p-4 last:border-b-0">
            <div className="flex gap-4">
              {[80, 100, 200, 80, 80, 100].map((w, j) => (
                <div key={j} className="h-4 rounded bg-muted/50" style={{ width: w }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MemberStatement({
  member,
  periodStart,
  periodEnd,
  openingBalance,
  closingBalance,
  transactions,
  isLoading = false,
  onDownload,
  onEmail,
  onPrint,
  className,
}: MemberStatementProps) {
  // Calculate totals
  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, t) => ({
        debits: acc.debits + (t.debit || 0),
        credits: acc.credits + (t.credit || 0),
      }),
      { debits: 0, credits: 0 }
    )
  }, [transactions])

  if (isLoading) {
    return <StatementSkeleton />
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with member info and actions */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Account Statement</h2>
          <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{member.name}</p>
            <p>
              {member.memberNumber} • {member.membershipType}
            </p>
            {member.email && <p>{member.email}</p>}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(periodStart)} - {formatDate(periodEnd)}
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            {onPrint && (
              <Button variant="outline" size="sm" onClick={onPrint}>
                <Printer className="mr-1 h-4 w-4" />
                Print
              </Button>
            )}
            {onEmail && (
              <Button variant="outline" size="sm" onClick={onEmail}>
                <Mail className="mr-1 h-4 w-4" />
                Email
              </Button>
            )}
            {onDownload && (
              <Button size="sm" onClick={onDownload}>
                <Download className="mr-1 h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Opening Balance
          </p>
          <p
            className={cn(
              'mt-1 text-2xl font-semibold',
              openingBalance >= 0 ? 'text-foreground' : 'text-emerald-600'
            )}
          >
            {openingBalance < 0 && '('}฿{formatCurrency(openingBalance)}
            {openingBalance < 0 && ')'}
          </p>
          <p className="text-xs text-muted-foreground">As of {formatDate(periodStart)}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Period Activity
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg text-red-600">+฿{formatCurrency(totals.debits)}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-lg text-emerald-600">
              -฿{formatCurrency(totals.credits)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {transactions.length} transactions
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Closing Balance
          </p>
          <p
            className={cn(
              'mt-1 text-2xl font-semibold',
              closingBalance > 0
                ? 'text-red-600'
                : closingBalance < 0
                  ? 'text-emerald-600'
                  : 'text-foreground'
            )}
          >
            {closingBalance < 0 && '('}฿{formatCurrency(closingBalance)}
            {closingBalance < 0 && ')'}
          </p>
          <p className="text-xs text-muted-foreground">
            {closingBalance > 0
              ? 'Amount due'
              : closingBalance < 0
                ? 'Credit balance'
                : 'Fully settled'}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/50 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-3">Description</div>
          <div className="col-span-1">Reference</div>
          <div className="col-span-1 text-right">Debit</div>
          <div className="col-span-1 text-right">Credit</div>
          <div className="col-span-2 text-right">Balance</div>
        </div>

        {/* Opening Balance Row */}
        <div className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-muted/30 border-b border-border">
          <div className="col-span-2 text-sm font-medium">{formatDate(periodStart)}</div>
          <div className="col-span-2">
            <span className="text-xs text-muted-foreground italic">Opening Balance</span>
          </div>
          <div className="col-span-3"></div>
          <div className="col-span-1"></div>
          <div className="col-span-1"></div>
          <div className="col-span-1"></div>
          <div className="col-span-2 text-right font-medium">
            ฿{formatCurrency(openingBalance)}
          </div>
        </div>

        {/* Transaction Rows */}
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="mb-4 h-12 w-12 opacity-50" />
            <p className="text-lg font-medium">No transactions</p>
            <p className="text-sm">No activity during this period</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="col-span-2 text-sm">{formatDate(transaction.date)}</div>
                <div className="col-span-2">
                  <TransactionTypeBadge type={transaction.type} />
                </div>
                <div className="col-span-3 text-sm truncate" title={transaction.description}>
                  {transaction.description}
                </div>
                <div className="col-span-1 text-sm text-muted-foreground">
                  {transaction.reference || '-'}
                </div>
                <div className="col-span-1 text-right text-sm">
                  {transaction.debit ? (
                    <span className="text-red-600">฿{formatCurrency(transaction.debit)}</span>
                  ) : (
                    '-'
                  )}
                </div>
                <div className="col-span-1 text-right text-sm">
                  {transaction.credit ? (
                    <span className="text-emerald-600">
                      ฿{formatCurrency(transaction.credit)}
                    </span>
                  ) : (
                    '-'
                  )}
                </div>
                <div className="col-span-2 text-right text-sm font-medium">
                  ฿{formatCurrency(transaction.runningBalance)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Closing Balance Row */}
        <div className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-muted/30 border-t border-border">
          <div className="col-span-2 text-sm font-medium">{formatDate(periodEnd)}</div>
          <div className="col-span-2">
            <span className="text-xs text-muted-foreground italic">Closing Balance</span>
          </div>
          <div className="col-span-3"></div>
          <div className="col-span-1"></div>
          <div className="col-span-1 text-right font-medium text-red-600">
            ฿{formatCurrency(totals.debits)}
          </div>
          <div className="col-span-1 text-right font-medium text-emerald-600">
            ฿{formatCurrency(totals.credits)}
          </div>
          <div
            className={cn(
              'col-span-2 text-right text-lg font-semibold',
              closingBalance > 0
                ? 'text-red-600'
                : closingBalance < 0
                  ? 'text-emerald-600'
                  : 'text-foreground'
            )}
          >
            ฿{formatCurrency(closingBalance)}
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-xs text-muted-foreground text-center">
        This statement was generated on {formatDate(new Date())}. For questions, please
        contact the membership office.
      </p>
    </div>
  )
}

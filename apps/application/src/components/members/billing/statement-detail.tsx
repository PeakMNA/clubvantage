'use client';

import { cn, Badge, Button } from '@clubvantage/ui';
import type { ARStatement, ARStatementTransaction } from '@/hooks/use-ar-statements';
import {
  ArrowLeft,
  Download,
  Calendar,
  FileText,
  ArrowDownRight,
  Minus,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface StatementDetailProps {
  statement: ARStatement;
  memberId: string;
  memberName?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatPeriodLabel(start: Date): string {
  return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${startStr} – ${endStr}`;
}

// Aging bar component
function AgingBar({
  label,
  amount,
  percentage,
  color,
}: {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-xs font-medium text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-4 rounded-full bg-muted/50 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${Math.max(percentage, percentage > 0 ? 2 : 0)}%` }}
        />
      </div>
      <span className="w-24 text-right text-xs font-semibold text-foreground shrink-0">
        {formatCurrency(amount)}
      </span>
      <span className="w-10 text-right text-[10px] text-muted-foreground shrink-0">
        {percentage.toFixed(0)}%
      </span>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: ARStatementTransaction }) {
  const isDebit = transaction.type === 'INVOICE';

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0">
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
        isDebit ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
      )}>
        {isDebit ? (
          <FileText className="h-4 w-4" />
        ) : (
          <ArrowDownRight className="h-4 w-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{transaction.description}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(transaction.date)}
          {transaction.invoiceNumber && ` · ${transaction.invoiceNumber}`}
        </p>
      </div>
      <p className={cn(
        'text-sm font-semibold shrink-0',
        isDebit ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
      )}>
        {isDebit ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
      </p>
    </div>
  );
}

export function StatementDetail({ statement, memberId, memberName }: StatementDetailProps) {
  const isPaid = statement.closingBalance <= 0;
  const totalAging = statement.agingCurrent + statement.aging1to30 + statement.aging31to60 + statement.aging61to90 + statement.aging90Plus;

  const agingBuckets = [
    { label: 'Current', amount: statement.agingCurrent, color: 'bg-emerald-500' },
    { label: '1-30d', amount: statement.aging1to30, color: 'bg-amber-500' },
    { label: '31-60d', amount: statement.aging31to60, color: 'bg-orange-500' },
    { label: '61-90d', amount: statement.aging61to90, color: 'bg-red-500' },
    { label: '90d+', amount: statement.aging90Plus, color: 'bg-red-700' },
  ];

  // Sort transactions by date
  const sortedTransactions = [...statement.transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/members/${memberId}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-white/80 dark:bg-stone-900/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Statement: {formatPeriodLabel(statement.periodStart)}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatDateRange(statement.periodStart, statement.periodEnd)}</span>
              <span>·</span>
              <Badge
                className={cn(
                  'text-[10px] font-medium',
                  isPaid
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/30'
                    : 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/30'
                )}
              >
                {isPaid ? 'Paid' : 'Due'}
              </Badge>
            </div>
          </div>
        </div>
        {statement.pdfUrl && (
          <a
            href={statement.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </a>
        )}
      </div>

      {/* Balance Summary */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 dark:bg-stone-900/80 shadow-lg shadow-slate-200/30 dark:shadow-stone-900/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
        <div className="relative p-4 sm:p-6">
          <h2 className="text-base font-semibold text-foreground">Balance Summary</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground">Opening Balance</span>
              <span className="text-sm font-medium text-foreground">{formatCurrency(statement.openingBalance)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground">Charges</span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">+{formatCurrency(statement.totalDebits)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground">Payments & Credits</span>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">-{formatCurrency(statement.totalCredits)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-semibold text-foreground">Closing Balance</span>
              <span className={cn(
                'text-lg font-bold',
                statement.closingBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
              )}>
                {formatCurrency(statement.closingBalance)}
              </span>
            </div>
            {statement.dueDate && (
              <div className="flex items-center justify-between py-2 border-t border-border/40">
                <span className="text-sm text-muted-foreground">Due Date</span>
                <span className={cn(
                  'text-sm font-medium',
                  new Date(statement.dueDate) < new Date() && statement.closingBalance > 0
                    ? 'text-red-600'
                    : 'text-foreground'
                )}>
                  {formatDate(statement.dueDate)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Aging Breakdown */}
      {totalAging > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 dark:bg-stone-900/80 shadow-lg shadow-slate-200/30 dark:shadow-stone-900/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
          <div className="relative p-4 sm:p-6">
            <h2 className="text-base font-semibold text-foreground">Aging Breakdown</h2>
            <div className="mt-4 space-y-3">
              {agingBuckets.map((bucket) => (
                <AgingBar
                  key={bucket.label}
                  label={bucket.label}
                  amount={bucket.amount}
                  percentage={totalAging > 0 ? (bucket.amount / totalAging) * 100 : 0}
                  color={bucket.color}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 dark:bg-stone-900/80 shadow-lg shadow-slate-200/30 dark:shadow-stone-900/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
        <div className="relative p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Transactions</h2>
            <span className="text-xs text-muted-foreground">
              {sortedTransactions.length} transaction{sortedTransactions.length !== 1 ? 's' : ''}
            </span>
          </div>
          {sortedTransactions.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border bg-muted/50 py-8">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">No transactions in this period</p>
            </div>
          ) : (
            <div className="mt-4">
              {sortedTransactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
export function StatementDetailSkeleton() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      <span className="ml-3 text-muted-foreground">Loading statement...</span>
    </div>
  );
}

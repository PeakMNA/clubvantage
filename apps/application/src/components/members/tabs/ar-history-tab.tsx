'use client';

import { cn, Badge } from '@clubvantage/ui';
import { Member, ARTransaction, AgingBucket } from '../types';
import { ArrowUpRight, ArrowDownRight, Minus, FileText, Receipt, Calendar, Wallet } from 'lucide-react';

export interface ARHistoryTabProps {
  member: Member;
  transactions: ARTransaction[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const agingBucketLabels: Record<AgingBucket, string> = {
  CURRENT: 'Current',
  '30': '30 Days',
  '60': '60 Days',
  '90': '90 Days',
  '91+': '91+ Days',
};

const agingBucketColors: Record<AgingBucket, string> = {
  CURRENT: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/30',
  '30': 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/30',
  '60': 'bg-orange-50 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-200/60 dark:border-orange-500/30',
  '90': 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200/60 dark:border-red-500/30',
  '91+': 'bg-red-100 dark:bg-red-500/30 text-red-800 dark:text-red-300 border-red-300/60 dark:border-red-500/40',
};

function TransactionIcon({ type }: { type: ARTransaction['type'] }) {
  const iconStyles = {
    INVOICE: 'from-blue-100 to-blue-200/50 text-blue-600',
    PAYMENT: 'from-emerald-100 to-emerald-200/50 text-emerald-600',
    CREDIT: 'from-purple-100 to-purple-200/50 text-purple-600',
    ADJUSTMENT: 'from-muted to-muted/50 text-muted-foreground',
  };

  const icons = {
    INVOICE: FileText,
    PAYMENT: ArrowDownRight,
    CREDIT: ArrowDownRight,
    ADJUSTMENT: Minus,
  };

  const Icon = icons[type];

  return (
    <div className={cn(
      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner',
      iconStyles[type]
    )}>
      <Icon className="h-5 w-5" />
    </div>
  );
}

export function ARHistoryTab({ member, transactions }: ARHistoryTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Balance Summary */}
      <div className="relative overflow-hidden rounded-2xl border border/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

        {/* Accent line - color based on balance */}
        <div className={cn(
          'absolute left-0 top-0 h-1 w-full',
          member.balance > 0
            ? 'bg-gradient-to-r from-red-300 via-red-500 to-red-300'
            : 'bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-300'
        )} />

        <div className="relative p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Account Summary</h2>
          </div>

          {/* Balance Display */}
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="rounded-xl bg-gradient-to-br from-muted to-muted/50 p-4 shadow-inner">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Current Balance
              </p>
              <p
                className={cn(
                  'mt-1 text-3xl font-bold tracking-tight sm:text-4xl',
                  member.balance > 0 ? 'text-red-600' : 'text-emerald-600'
                )}
              >
                {formatCurrency(member.balance)}
              </p>
            </div>

            {member.agingBucket && (
              <div className="text-left sm:text-right">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Aging Status</p>
                <Badge className={cn('mt-1.5', agingBucketColors[member.agingBucket])}>
                  {agingBucketLabels[member.agingBucket]}
                </Badge>
              </div>
            )}
          </div>

          {/* Oldest Invoice Info */}
          {member.balance > 0 && member.oldestInvoiceDate && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-muted/80 p-3 backdrop-blur-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Oldest Unpaid Invoice</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatDate(member.oldestInvoiceDate)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="relative overflow-hidden rounded-2xl border border/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

        {/* Header */}
        <div className="relative flex items-center gap-3 border-b border-slate-100 p-4 sm:p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
            <Receipt className="h-5 w-5 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Transaction History</h2>
        </div>

        {/* Content */}
        <div className="relative p-4 sm:p-6">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border bg-muted/50 py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <FileText className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">No transactions recorded</p>
              <p className="mt-1 text-xs text-muted-foreground">Transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {transactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={cn(
                    'group flex flex-col gap-3 rounded-xl border border/60 bg-white/60 p-4 transition-all duration-300 hover:bg-card hover:shadow-sm sm:flex-row sm:items-center sm:gap-4',
                    index === 0 && 'ring-1 ring-slate-200/50'
                  )}
                >
                  <TransactionIcon type={transaction.type} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground sm:text-base">
                        {transaction.description}
                      </p>
                      {transaction.invoiceNumber && (
                        <Badge variant="outline" className="border text-[10px] font-medium text-muted-foreground">
                          {transaction.invoiceNumber}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDate(transaction.date)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-1">
                    <p
                      className={cn(
                        'text-base font-bold tracking-tight sm:text-lg',
                        transaction.type === 'INVOICE'
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      )}
                    >
                      {transaction.type === 'INVOICE' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <p className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:text-xs">
                      Bal: {formatCurrency(transaction.runningBalance)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

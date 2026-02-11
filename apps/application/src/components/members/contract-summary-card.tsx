'use client';

import { cn, Button } from '@clubvantage/ui';
import { StatusBadge } from './status-badge';
import { Calendar, Sparkles, TrendingUp } from 'lucide-react';
import type { ContractStatus } from './types';

export interface ContractSummaryCardProps {
  status: ContractStatus;
  membershipTypeName: string;
  startDate: string;
  endDate?: string;
  monthlyEstimate: number;
  onEndContract?: () => void;
  onResumeContract?: () => void;
  className?: string;
}

const contractStatusMap = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function ContractSummaryCard({
  status,
  membershipTypeName,
  startDate,
  endDate,
  monthlyEstimate,
  onEndContract,
  onResumeContract,
  className,
}: ContractSummaryCardProps) {
  const isSuspended = status === 'SUSPENDED';
  const isReadOnly = status === 'CANCELLED' || status === 'EXPIRED';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border/60 bg-white/80 dark:bg-stone-900/80 shadow-lg shadow-slate-200/30 dark:shadow-stone-900/30 backdrop-blur-sm',
        className
      )}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-transparent to-muted/30" />

      {/* Decorative accent */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-300" />

      <div className="relative p-4 sm:p-6">
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 shadow-inner">
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Contract Status</p>
              <StatusBadge status={contractStatusMap[status]} size="md" />
            </div>
          </div>

          {/* Monthly Estimate */}
          <div className="rounded-xl bg-gradient-to-br from-muted to-muted/50 p-3 shadow-inner sm:p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              Est. Monthly
            </div>
            <div className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {formatCurrency(monthlyEstimate)}
            </div>
          </div>
        </div>

        {/* Membership Type */}
        <div className="mt-4 sm:mt-6">
          <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {membershipTypeName}
          </h3>
        </div>

        {/* Dates & Action */}
        <div className="mt-4 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-muted-foreground">Started:</span>{' '}
                <span className="font-semibold text-foreground">{formatDate(startDate)}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-muted-foreground">Ends:</span>{' '}
                <span className={cn(
                  'font-semibold',
                  endDate ? 'text-foreground' : 'text-emerald-600 dark:text-emerald-400'
                )}>
                  {endDate ? formatDate(endDate) : 'Ongoing'}
                </span>
              </div>
            </div>
          </div>

          {!isReadOnly && (
            <div className="self-start sm:self-auto">
              {isSuspended ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResumeContract}
                  className="border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-sm backdrop-blur-sm transition-all hover:bg-emerald-100 dark:hover:bg-emerald-500/30 hover:shadow-md"
                >
                  Resume Contract
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEndContract}
                  className="border bg-white/80 dark:bg-stone-900/80 shadow-sm backdrop-blur-sm transition-all hover:bg-card hover:shadow-md"
                >
                  End Contract
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

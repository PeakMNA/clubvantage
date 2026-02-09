'use client';

import { use, useState, useMemo } from 'react';
import { cn, Badge, Button } from '@clubvantage/ui';
import { useARProfileByMember, useProfileStatements } from '@/hooks/use-ar-statements';
import type { ARStatement } from '@/hooks/use-ar-statements';
import { useClubBillingSettings, useMemberBillingProfile } from '@/hooks/use-billing-settings';
import {
  FileText,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Filter,
  Download,
} from 'lucide-react';
import Link from 'next/link';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} – ${endStr}`;
}

type StatusFilter = 'all' | 'paid' | 'unpaid';

function StatementListRow({ statement, memberId }: { statement: ARStatement; memberId: string }) {
  const isPaid = statement.closingBalance <= 0;
  const periodDays = Math.round(
    (statement.periodEnd.getTime() - statement.periodStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isPartial = periodDays < 20;

  return (
    <Link
      href={`/members/${memberId}/statements/${statement.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border/60 bg-white/60 dark:bg-stone-800/60 p-4 transition-all duration-300 hover:bg-card hover:shadow-sm"
    >
      {/* Icon */}
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner',
        isPaid
          ? 'from-emerald-100 to-emerald-200/50 dark:from-emerald-500/20 dark:to-emerald-500/10'
          : 'from-amber-100 to-amber-200/50 dark:from-amber-500/20 dark:to-amber-500/10'
      )}>
        <FileText className={cn(
          'h-5 w-5',
          isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
        )} />
      </div>

      {/* Period Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground sm:text-base">
            {statement.periodStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
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
          {isPartial && (
            <Badge className="bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200/60 dark:border-blue-500/30 text-[10px] font-medium">
              Partial
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDateRange(statement.periodStart, statement.periodEnd)}
          </span>
          <span>{statement.transactionCount} transactions</span>
          {statement.pdfUrl && (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Download className="h-3 w-3" />
              PDF
            </span>
          )}
        </div>
      </div>

      {/* Financial Summary — desktop */}
      <div className="hidden lg:flex items-center gap-6 text-right">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Opening</p>
          <p className="text-sm font-medium text-foreground">{formatCurrency(statement.openingBalance)}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Charges</p>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{formatCurrency(statement.totalDebits)}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Payments</p>
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">-{formatCurrency(statement.totalCredits)}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Closing</p>
          <p className={cn(
            'text-sm font-bold',
            statement.closingBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
          )}>
            {formatCurrency(statement.closingBalance)}
          </p>
        </div>
      </div>

      {/* Mobile/tablet: closing balance only */}
      <div className="lg:hidden text-right">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Closing</p>
        <p className={cn(
          'text-sm font-bold',
          statement.closingBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
        )}>
          {formatCurrency(statement.closingBalance)}
        </p>
      </div>

      {/* Chevron */}
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function MemberStatementsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: memberId } = use(params);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { profile, isLoading: profileLoading } = useARProfileByMember(memberId);
  const { statements, isLoading: statementsLoading } = useProfileStatements(
    profile?.id ?? '',
    true,
    !!profile?.id
  );
  const { settings: billingSettings } = useClubBillingSettings();
  const { profile: billingProfile } = useMemberBillingProfile(memberId);

  const isLoading = profileLoading || statementsLoading;
  const isMemberCycle = billingSettings?.billingCycleMode === 'MEMBER_CYCLE';

  // Extract available years from statements
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const s of statements) {
      years.add(s.periodStart.getFullYear());
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [statements]);

  // Filter and sort statements
  const filteredStatements = useMemo(() => {
    let filtered = [...statements];

    if (yearFilter) {
      filtered = filtered.filter((s) => s.periodStart.getFullYear() === yearFilter);
    }

    if (statusFilter === 'paid') {
      filtered = filtered.filter((s) => s.closingBalance <= 0);
    } else if (statusFilter === 'unpaid') {
      filtered = filtered.filter((s) => s.closingBalance > 0);
    }

    return filtered.sort((a, b) => b.periodStart.getTime() - a.periodStart.getTime());
  }, [statements, yearFilter, statusFilter]);

  // Compute summary stats for filtered set
  const summary = useMemo(() => {
    const totalStatements = filteredStatements.length;
    const paidCount = filteredStatements.filter((s) => s.closingBalance <= 0).length;
    const unpaidCount = totalStatements - paidCount;
    const totalUnpaid = filteredStatements
      .filter((s) => s.closingBalance > 0)
      .reduce((sum, s) => sum + s.closingBalance, 0);
    return { totalStatements, paidCount, unpaidCount, totalUnpaid };
  }, [filteredStatements]);

  const cycleInfo = useMemo(() => {
    if (!billingSettings) return null;
    if (isMemberCycle) {
      const day = billingProfile?.billingDay ?? billingSettings.defaultBillingDay;
      return `Member Cycle (day ${day})`;
    }
    return `Club Cycle (closing day ${billingSettings.clubCycleClosingDay})`;
  }, [billingSettings, billingProfile, isMemberCycle]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Back Navigation */}
      <Link
        href={`/members/${memberId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Member
      </Link>

      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 dark:bg-stone-900/80 shadow-lg shadow-slate-200/30 dark:shadow-stone-900/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300" />

        <div className="relative p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">Statement History</h1>
                {cycleInfo && (
                  <p className="text-xs text-muted-foreground">{cycleInfo}</p>
                )}
              </div>
            </div>

            {/* Summary Badges */}
            {!isLoading && statements.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge className="bg-stone-100 dark:bg-stone-500/20 text-stone-600 dark:text-stone-400 border-stone-200/60 text-xs font-medium">
                  {summary.totalStatements} statements
                </Badge>
                {summary.unpaidCount > 0 && (
                  <Badge className="bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/30 text-xs font-medium">
                    {summary.unpaidCount} unpaid &middot; {formatCurrency(summary.totalUnpaid)}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Filters */}
          {!isLoading && statements.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Filter:</span>
              </div>

              {/* Year Filter */}
              <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-0.5">
                <button
                  type="button"
                  onClick={() => setYearFilter(null)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                    yearFilter === null
                      ? 'bg-white dark:bg-stone-800 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  All Years
                </button>
                {availableYears.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setYearFilter(year)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                      yearFilter === year
                        ? 'bg-white dark:bg-stone-800 text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-0.5">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                    statusFilter === 'all'
                      ? 'bg-white dark:bg-stone-800 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('paid')}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                    statusFilter === 'paid'
                      ? 'bg-white dark:bg-stone-800 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Paid
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('unpaid')}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                    statusFilter === 'unpaid'
                      ? 'bg-white dark:bg-stone-800 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Unpaid
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statement List */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-white/80 dark:bg-stone-900/80 py-16">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            <span className="ml-2 text-muted-foreground">Loading statements...</span>
          </div>
        ) : !profile ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border bg-muted/50 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <AlertCircle className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">No AR profile</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This member does not have an AR profile yet
            </p>
          </div>
        ) : filteredStatements.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border bg-muted/50 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              {statements.length === 0 ? 'No statements generated' : 'No matching statements'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {statements.length === 0
                ? 'Statements will appear here after the billing cycle runs'
                : 'Try adjusting the filters above'}
            </p>
            {statements.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setYearFilter(null);
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStatements.map((statement) => (
              <StatementListRow
                key={statement.id}
                statement={statement}
                memberId={memberId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

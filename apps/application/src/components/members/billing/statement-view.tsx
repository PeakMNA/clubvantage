'use client';

import { useMemo } from 'react';
import { cn, Badge } from '@clubvantage/ui';
import { useARProfileByMember, useProfileStatements } from '@/hooks/use-ar-statements';
import type { ARStatement } from '@/hooks/use-ar-statements';
import { useClubBillingSettings } from '@/hooks/use-billing-settings';
import {
  FileText,
  ChevronRight,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface StatementViewProps {
  memberId: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatPeriodLabel(start: Date, end: Date): string {
  return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${startStr} – ${endStr}`;
}

function StatementRow({ statement, memberId, isPartial }: { statement: ARStatement; memberId: string; isPartial?: boolean }) {
  const isPaid = statement.closingBalance <= 0;

  return (
    <Link
      href={`/members/${memberId}/statements/${statement.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border/60 bg-white/60 dark:bg-stone-800/60 p-4 transition-all duration-300 hover:bg-card hover:shadow-sm"
    >
      {/* Period Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground sm:text-base">
            {formatPeriodLabel(statement.periodStart, statement.periodEnd)}
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
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDateRange(statement.periodStart, statement.periodEnd)}
        </p>
      </div>

      {/* Financial Summary */}
      <div className="hidden sm:flex items-center gap-6 text-right">
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

      {/* Mobile: Just show closing balance */}
      <div className="sm:hidden text-right">
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

export function StatementView({ memberId }: StatementViewProps) {
  const { profile, isLoading: profileLoading } = useARProfileByMember(memberId);
  const { statements, isLoading: statementsLoading } = useProfileStatements(
    profile?.id ?? '',
    true,
    !!profile?.id
  );
  const { settings: billingSettings } = useClubBillingSettings();

  const isLoading = profileLoading || statementsLoading;
  const isMemberCycle = billingSettings?.billingCycleMode === 'MEMBER_CYCLE';

  // Sort statements newest first
  const sortedStatements = [...statements].sort(
    (a, b) => b.periodStart.getTime() - a.periodStart.getTime()
  );

  // Detect partial statements — the oldest statement may have an irregular date range
  const partialStatementIds = useMemo(() => {
    if (sortedStatements.length < 2) return new Set<string>();
    const ids = new Set<string>();
    const oldest = sortedStatements[sortedStatements.length - 1];
    if (oldest) {
      // If the period is less than 20 days, consider it partial
      const days = (oldest.periodEnd.getTime() - oldest.periodStart.getTime()) / (1000 * 60 * 60 * 24);
      if (days < 20) {
        ids.add(oldest.id);
      }
    }
    return ids;
  }, [sortedStatements]);

  const cycleSubtitle = useMemo(() => {
    if (!billingSettings) return 'Monthly billing statements';
    if (isMemberCycle) {
      return 'Statements (Member Cycle)';
    }
    return 'Statements (Club Cycle)';
  }, [billingSettings, isMemberCycle]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 dark:bg-stone-900/80 shadow-lg shadow-slate-200/30 dark:shadow-stone-900/30 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

      {/* Header */}
      <div className="relative flex items-center gap-3 border-b border-slate-100 dark:border-stone-700 p-4 sm:p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Statements</h2>
          <p className="text-xs text-muted-foreground">{cycleSubtitle}</p>
        </div>
        <Link
          href={`/members/${memberId}/statements`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-white dark:bg-stone-800 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
        >
          View All
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Content */}
      <div className="relative p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            <span className="ml-2 text-muted-foreground">Loading statements...</span>
          </div>
        ) : !profile ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border bg-muted/50 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <AlertCircle className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">No AR profile</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This member does not have an AR profile yet
            </p>
          </div>
        ) : sortedStatements.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border bg-muted/50 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">No statements generated</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Statements will appear here after the billing cycle runs
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedStatements.map((statement) => (
              <StatementRow
                key={statement.id}
                statement={statement}
                memberId={memberId}
                isPartial={partialStatementIds.has(statement.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

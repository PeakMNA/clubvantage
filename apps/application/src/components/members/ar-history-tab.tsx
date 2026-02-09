'use client';

import { useState, useMemo } from 'react';
import { cn, Badge, Button } from '@clubvantage/ui';
import type { Member, ARTransaction, AgingBucket } from './types';
import {
  Calendar,
  Wallet,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  RotateCcw,
  Info,
  Receipt,
  FileText,
  Shield,
  AlertTriangle,
  PauseCircle,
} from 'lucide-react';
import {
  useGetMemberAutoPayHistoryQuery,
  useRetryAutoPayAttemptMutation,
  type AutoPayAttemptStatus,
  type GetMemberAutoPayHistoryQuery,
} from '@clubvantage/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { useToastErrors, ToastContainer } from './error-states';
import { TransactionView } from './billing/transaction-view';
import { StatementView } from './billing/statement-view';
import { UnbilledActivity } from './billing/unbilled-activity';
import { BillingHoldModal } from './billing-hold-modal';
import type { ARProfile } from '@/hooks/use-ar-statements';
import { useClubBillingSettings, useMemberBillingProfile } from '@/hooks/use-billing-settings';

// Type for auto-pay attempt from the query result
type AutoPayHistoryAttempt = GetMemberAutoPayHistoryQuery['memberAutoPayHistory'][number];

export interface ARHistoryTabProps {
  member: Member;
  transactions: ARTransaction[];
  arProfile?: ARProfile | null;
  onViewInvoice?: (invoiceNumber: string) => void;
  onViewStatement?: (statementId: string) => void;
}

type BillingView = 'transactions' | 'statements' | 'unbilled';

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

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const agingBucketLabels: Record<AgingBucket, string> = {
  CURRENT: 'Current',
  DAYS_30: '30 Days',
  DAYS_60: '60 Days',
  DAYS_90: '90 Days',
  DAYS_91_PLUS: '91+ Days',
};

const agingBucketColors: Record<AgingBucket, string> = {
  CURRENT: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/30',
  DAYS_30: 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/30',
  DAYS_60: 'bg-orange-50 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-200/60 dark:border-orange-500/30',
  DAYS_90: 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200/60 dark:border-red-500/30',
  DAYS_91_PLUS: 'bg-red-100 dark:bg-red-500/30 text-red-800 dark:text-red-300 border-red-300/60 dark:border-red-500/40',
};

// Auto-pay status configuration
const autoPayStatusConfig: Record<
  AutoPayAttemptStatus,
  { label: string; icon: React.ElementType; className: string; iconClassName: string }
> = {
  PENDING: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-stone-100 dark:bg-stone-500/20 text-stone-700 dark:text-stone-400 border-stone-200/60 dark:border-stone-500/30',
    iconClassName: 'text-stone-500',
  },
  PROCESSING: {
    label: 'Processing',
    icon: Loader2,
    className: 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200/60 dark:border-blue-500/30',
    iconClassName: 'text-blue-500 animate-spin',
  },
  SUCCEEDED: {
    label: 'Succeeded',
    icon: CheckCircle2,
    className: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/30',
    iconClassName: 'text-emerald-500',
  },
  FAILED: {
    label: 'Failed',
    icon: XCircle,
    className: 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200/60 dark:border-red-500/30',
    iconClassName: 'text-red-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-stone-100 dark:bg-stone-500/20 text-stone-600 dark:text-stone-400 border-stone-200/60 dark:border-stone-500/30',
    iconClassName: 'text-stone-400',
  },
};

// Auto-pay attempt card component
interface AutoPayAttemptCardProps {
  attempt: AutoPayHistoryAttempt;
  onRetry?: () => void;
  isRetrying?: boolean;
}

function AutoPayAttemptCard({ attempt, onRetry, isRetrying }: AutoPayAttemptCardProps) {
  const statusConfig = autoPayStatusConfig[attempt.status];
  const StatusIcon = statusConfig.icon;
  const canRetry = attempt.status === 'FAILED';

  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-white/60 p-4 transition-all duration-300 hover:bg-card hover:shadow-sm sm:flex-row sm:items-center sm:gap-4">
      {/* Status Icon */}
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner',
        attempt.status === 'SUCCEEDED'
          ? 'from-emerald-100 to-emerald-200/50'
          : attempt.status === 'FAILED'
            ? 'from-red-100 to-red-200/50'
            : attempt.status === 'PROCESSING'
              ? 'from-blue-100 to-blue-200/50'
              : 'from-muted to-muted/50'
      )}>
        <StatusIcon className={cn('h-5 w-5', statusConfig.iconClassName)} />
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground sm:text-base">
            Auto-Pay Attempt #{attempt.attemptNumber}
          </p>
          <Badge className={cn('text-[10px] font-medium', statusConfig.className)}>
            {statusConfig.label}
          </Badge>
          {attempt.isManualRetry && (
            <Badge variant="outline" className="border text-[10px] font-medium text-muted-foreground">
              Manual Retry
            </Badge>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {formatDateTime(attempt.createdAt)}
          </div>
          {attempt.paymentMethod && (
            <div className="flex items-center gap-1.5">
              <CreditCard className="h-3 w-3" />
              <span className="capitalize">{attempt.paymentMethod.brand}</span>
              <span>****{attempt.paymentMethod.last4}</span>
            </div>
          )}
        </div>

        {/* Failure message */}
        {attempt.status === 'FAILED' && attempt.failureMessage && (
          <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-50/80 dark:bg-red-500/10 px-3 py-2">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
            <div>
              <p className="text-xs font-medium text-red-700 dark:text-red-300">
                {attempt.failureMessage}
              </p>
              {attempt.failureCode && (
                <p className="mt-0.5 text-[10px] text-red-500">
                  Code: {attempt.failureCode}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Next retry info */}
        {attempt.status === 'FAILED' && attempt.nextRetryAt && (
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Next automatic retry: {formatDateTime(attempt.nextRetryAt)}
          </p>
        )}
      </div>

      {/* Amount and Actions */}
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-2">
        <p
          className={cn(
            'text-base font-bold tracking-tight sm:text-lg',
            attempt.status === 'SUCCEEDED' ? 'text-emerald-600' : 'text-foreground'
          )}
        >
          {formatCurrency(attempt.amount)}
        </p>

        {canRetry && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="h-8 text-xs hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
          >
            {isRetrying ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <RotateCcw className="mr-1.5 h-3 w-3" />
            )}
            Retry Payment
          </Button>
        )}
      </div>
    </div>
  );
}

// Auto-pay history section component
interface AutoPayHistorySectionProps {
  memberId: string;
}

function AutoPayHistorySection({ memberId }: AutoPayHistorySectionProps) {
  const queryClient = useQueryClient();
  const { addToast, toasts, removeToast } = useToastErrors();
  const [retryingAttemptId, setRetryingAttemptId] = useState<string | null>(null);

  const { data, isLoading, error } = useGetMemberAutoPayHistoryQuery(
    { input: { memberId, limit: 20 } },
    { enabled: !!memberId }
  );

  const retryMutation = useRetryAutoPayAttemptMutation();

  const attempts = data?.memberAutoPayHistory ?? [];

  const handleRetry = async (attemptId: string) => {
    setRetryingAttemptId(attemptId);
    try {
      await retryMutation.mutateAsync({ attemptId });
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['GetMemberAutoPayHistory'] });
      addToast('Payment retry initiated successfully');
    } catch (err) {
      console.error('Failed to retry auto-pay:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      addToast(`Failed to retry payment: ${errorMessage}`, { variant: 'solid' });
    } finally {
      setRetryingAttemptId(null);
    }
  };

  // Count successes and failures
  const successCount = attempts.filter((a) => a.status === 'SUCCEEDED').length;
  const failureCount = attempts.filter((a) => a.status === 'FAILED').length;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 dark:bg-stone-900/80 shadow-lg shadow-slate-200/30 dark:shadow-stone-900/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

        {/* Header */}
        <div className="relative flex flex-col gap-3 border-b border-slate-100 dark:border-stone-700 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Auto-Pay History</h2>
              <p className="text-xs text-muted-foreground">
                Automatic payment attempts for this member
              </p>
            </div>
          </div>

          {/* Summary badges */}
          {attempts.length > 0 && (
            <div className="flex items-center gap-2">
              {successCount > 0 && (
                <Badge className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/30 text-xs font-medium">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {successCount} Succeeded
                </Badge>
              )}
              {failureCount > 0 && (
                <Badge className="bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200/60 dark:border-red-500/30 text-xs font-medium">
                  <XCircle className="mr-1 h-3 w-3" />
                  {failureCount} Failed
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              <span className="ml-2 text-muted-foreground">Loading auto-pay history...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/10 py-8">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">Failed to load auto-pay history</p>
              <p className="mt-1 text-xs text-red-500">Please try again later</p>
            </div>
          ) : attempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border bg-muted/50 py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <RefreshCw className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">No auto-pay attempts</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Auto-pay attempts will appear here once enabled
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {attempts.map((attempt) => (
                <AutoPayAttemptCard
                  key={attempt.id}
                  attempt={attempt}
                  onRetry={() => handleRetry(attempt.id)}
                  isRetrying={retryingAttemptId === attempt.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast notifications for retry feedback */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  );
}

// AR Profile status configuration
const arProfileStatusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/30',
  },
  SUSPENDED: {
    label: 'Suspended',
    className: 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/30',
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-stone-100 dark:bg-stone-500/20 text-stone-600 dark:text-stone-400 border-stone-200/60 dark:border-stone-500/30',
  },
};

// Credit limit utilization bar component
function CreditLimitDisplay({ arProfile }: { arProfile: ARProfile }) {
  if (arProfile.creditLimit == null) return null;

  const used = arProfile.currentBalance;
  const limit = arProfile.creditLimit;
  const utilization = limit > 0 ? (used / limit) * 100 : 0;
  const available = Math.max(0, limit - used);
  const isOverLimit = used > limit;

  return (
    <div className="mt-4 rounded-xl bg-muted/80 p-3 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Credit Limit</p>
        <p className="text-xs font-medium text-muted-foreground">
          {Math.round(utilization)}% used
        </p>
      </div>
      <p className="mt-1 text-sm font-semibold text-foreground">{formatCurrency(limit)}</p>

      {/* Utilization bar */}
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isOverLimit
              ? 'bg-red-500'
              : utilization >= 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
          )}
          style={{ width: `${Math.min(100, utilization)}%` }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
        <span>Available: {formatCurrency(available)}</span>
        {isOverLimit && (
          <Badge className="bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200/60 text-[10px]">
            Over limit
          </Badge>
        )}
      </div>
    </div>
  );
}

export function ARHistoryTab({ member, transactions, arProfile, onViewInvoice }: ARHistoryTabProps) {
  const [activeView, setActiveView] = useState<BillingView>('transactions');
  const [showHoldModal, setShowHoldModal] = useState(false);
  const { settings: billingSettings } = useClubBillingSettings();
  const { profile: billingProfile, updateProfile, isUpdating } = useMemberBillingProfile(member.id);

  const isMemberCycle = billingSettings?.billingCycleMode === 'MEMBER_CYCLE';
  const cycleLabel = useMemo(() => {
    if (!billingSettings) return null;
    if (isMemberCycle) {
      const cycleDay = billingProfile?.billingDay ?? billingSettings.defaultBillingDay;
      return `Member Cycle (cycle date: ${cycleDay}${getOrdinalSuffix(cycleDay)})`;
    }
    const closingDay = billingSettings.clubCycleClosingDay;
    return `Club Cycle (closing day: ${closingDay}${getOrdinalSuffix(closingDay)})`;
  }, [billingSettings, billingProfile, isMemberCycle]);

  const profileStatus = arProfile ? arProfileStatusConfig[arProfile.status] : null;

  // Compute unbilled total for summary
  const unbilledTotal = useMemo(() => {
    if (!arProfile?.lastStatementDate) return 0;
    const lastDate = new Date(arProfile.lastStatementDate);
    let total = 0;
    for (const tx of transactions) {
      if (new Date(tx.date) > lastDate) {
        total += tx.type === 'INVOICE' || tx.type === 'ADJUSTMENT' ? Math.abs(tx.amount) : -Math.abs(tx.amount);
      }
    }
    return total;
  }, [transactions, arProfile?.lastStatementDate]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Billing Hold Banner */}
      {billingProfile?.billingHold && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200/60 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-500/10 p-4">
          <PauseCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Billing on hold</p>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
              {billingProfile.billingHoldReason || 'No reason specified'}
              {billingProfile.billingHoldUntil && (
                <> &mdash; Until {formatDate(billingProfile.billingHoldUntil)}</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Balance Summary */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 dark:bg-stone-900/80 shadow-lg shadow-slate-200/30 dark:shadow-stone-900/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

        {/* Accent line - color based on balance */}
        <div className={cn(
          'absolute left-0 top-0 h-1 w-full',
          member.balance > 0
            ? 'bg-gradient-to-r from-red-300 via-red-500 to-red-300'
            : 'bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-300'
        )} />

        <div className="relative p-4 sm:p-6">
          {/* Header with AR Profile Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
                <Wallet className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">Account Summary</h2>
                {cycleLabel && (
                  <p className="text-xs text-muted-foreground">{cycleLabel}</p>
                )}
              </div>
            </div>
            {profileStatus ? (
              <Badge className={cn('text-xs font-medium', profileStatus.className)}>
                <Shield className="mr-1 h-3 w-3" />
                {profileStatus.label}
                {arProfile?.status === 'SUSPENDED' && arProfile.suspendedReason && (
                  <span title={arProfile.suspendedReason}> *</span>
                )}
              </Badge>
            ) : (
              <Badge className="bg-stone-100 dark:bg-stone-500/20 text-stone-500 dark:text-stone-400 border-stone-200/60 text-xs">
                No AR Profile
              </Badge>
            )}
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
                  member.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
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

          {/* Credit Limit Display */}
          {arProfile && <CreditLimitDisplay arProfile={arProfile} />}

          {/* Unbilled Summary */}
          {arProfile?.lastStatementDate && unbilledTotal !== 0 && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-amber-50/80 dark:bg-amber-500/10 p-3 backdrop-blur-sm">
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Unbilled</p>
                <p className="text-xs text-muted-foreground">
                  Since {new Date(arProfile.lastStatementDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                {formatCurrency(unbilledTotal)}
              </p>
            </div>
          )}

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

          {/* Info */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>History includes previous membership types</span>
            </div>
            {billingProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHoldModal(true)}
                className={cn(
                  'h-7 text-xs',
                  billingProfile.billingHold
                    ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10'
                    : 'border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/10'
                )}
              >
                <PauseCircle className="mr-1 h-3 w-3" />
                {billingProfile.billingHold ? 'Remove Hold' : 'Place Hold'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Auto-Pay History Section */}
      {member.autoPay && (
        <AutoPayHistorySection memberId={member.id} />
      )}

      {/* View Toggle */}
      <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
        <button
          type="button"
          onClick={() => setActiveView('transactions')}
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
            activeView === 'transactions'
              ? 'bg-white dark:bg-stone-800 text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Receipt className="h-4 w-4" />
          Transactions
        </button>
        <button
          type="button"
          onClick={() => setActiveView('statements')}
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
            activeView === 'statements'
              ? 'bg-white dark:bg-stone-800 text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <FileText className="h-4 w-4" />
          Statements
        </button>
        <button
          type="button"
          onClick={() => setActiveView('unbilled')}
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
            activeView === 'unbilled'
              ? 'bg-white dark:bg-stone-800 text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <AlertTriangle className="h-4 w-4" />
          Unbilled
        </button>
      </div>

      {/* Active View */}
      {activeView === 'transactions' ? (
        <TransactionView
          transactions={transactions}
          memberId={member.id}
          onViewInvoice={onViewInvoice}
        />
      ) : activeView === 'unbilled' && arProfile ? (
        <UnbilledActivity
          memberId={member.id}
          arProfile={arProfile}
          transactions={transactions}
          onViewInvoice={onViewInvoice}
        />
      ) : (
        <StatementView memberId={member.id} />
      )}

      {/* Billing Hold Modal */}
      {billingProfile && (
        <BillingHoldModal
          open={showHoldModal}
          onOpenChange={setShowHoldModal}
          memberName={`${member.firstName} ${member.lastName}`}
          currentHold={
            billingProfile.billingHold
              ? {
                  reason: billingProfile.billingHoldReason ?? '',
                  holdUntil: billingProfile.billingHoldUntil ?? null,
                }
              : null
          }
          onPlaceHold={async (reason, holdUntil) => {
            await updateProfile({
              billingHold: true,
              billingHoldReason: reason,
              billingHoldUntil: holdUntil,
            });
          }}
          onRemoveHold={async () => {
            await updateProfile({
              billingHold: false,
              billingHoldReason: null,
              billingHoldUntil: null,
            });
          }}
          isSubmitting={isUpdating}
        />
      )}
    </div>
  );
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? 'th';
}

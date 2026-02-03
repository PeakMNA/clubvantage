'use client';

import { useState, useMemo } from 'react';
import { cn, Badge, Button } from '@clubvantage/ui';
import type { Member, ARTransaction, AgingBucket } from './types';
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileText,
  Receipt,
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
  ExternalLink,
  Info,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui';
import {
  useGetMemberAutoPayHistoryQuery,
  useRetryAutoPayAttemptMutation,
  type AutoPayAttemptStatus,
  type GetMemberAutoPayHistoryQuery,
} from '@clubvantage/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { useToastErrors, ToastContainer } from './error-states';

// Type for auto-pay attempt from the query result
type AutoPayHistoryAttempt = GetMemberAutoPayHistoryQuery['memberAutoPayHistory'][number];

export interface ARHistoryTabProps {
  member: Member;
  transactions: ARTransaction[];
  onViewInvoice?: (invoiceNumber: string) => void;
  onViewStatement?: (statementId: string) => void;
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
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

        {/* Header */}
        <div className="relative flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
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
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-red-200 bg-red-50/50 py-8">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <p className="mt-3 text-sm font-medium text-red-600">Failed to load auto-pay history</p>
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

export function ARHistoryTab({ member, transactions, onViewInvoice }: ARHistoryTabProps) {
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<string>('ALL');

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter((tx) => tx.type === typeFilter);
    }

    // Date range filter
    if (dateRange !== 'ALL') {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case '30':
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90':
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case '180':
          startDate = new Date(now.setDate(now.getDate() - 180));
          break;
        case '365':
          startDate = new Date(now.setDate(now.getDate() - 365));
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter((tx) => new Date(tx.date) >= startDate);
    }

    // Sort by date descending
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, typeFilter, dateRange]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Balance Summary */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm">
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

          {/* Info */}
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>History includes previous membership types</span>
          </div>
        </div>
      </div>

      {/* Auto-Pay History Section */}
      {member.autoPay && (
        <AutoPayHistorySection memberId={member.id} />
      )}

      {/* Transaction History */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

        {/* Header with Filters */}
        <div className="relative flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
              <Receipt className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Transaction History</h2>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-36 bg-white/80">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Time</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="180">Last 6 Months</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36 bg-white/80">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="INVOICE">Invoices</SelectItem>
                <SelectItem value="PAYMENT">Payments</SelectItem>
                <SelectItem value="CREDIT">Credits</SelectItem>
                <SelectItem value="ADJUSTMENT">Adjustments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-4 sm:p-6">
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border bg-muted/50 py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <FileText className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">No transactions recorded</p>
              <p className="mt-1 text-xs text-muted-foreground">Transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={cn(
                    'group flex flex-col gap-3 rounded-xl border border-border/60 bg-white/60 p-4 transition-all duration-300 hover:bg-card hover:shadow-sm sm:flex-row sm:items-center sm:gap-4',
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
                        <button
                          type="button"
                          onClick={() => onViewInvoice?.(transaction.invoiceNumber!)}
                          className="flex items-center gap-1 rounded-md border bg-white/80 px-2 py-0.5 text-[10px] font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                        >
                          {transaction.invoiceNumber}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </button>
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

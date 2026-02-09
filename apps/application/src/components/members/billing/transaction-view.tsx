'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn, Badge, Button } from '@clubvantage/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui';
import type { ARTransaction } from '../types';
import {
  ArrowDownRight,
  FileText,
  Minus,
  Calendar,
  Receipt,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useClubBillingSettings, useMemberBillingProfile } from '@/hooks/use-billing-settings';

/**
 * Get the current or previous cycle date range for a member.
 * In Club Cycle mode: uses the club's closing day to define month boundaries.
 * In Member Cycle mode: uses the member's billing day as anniversary date.
 */
function getCycleDates(
  billingDay: number,
  offset: number = 0
): { start: Date; end: Date } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Current cycle: starts on billingDay of this month (or last month if we haven't passed it yet)
  let cycleStartMonth = month;
  let cycleStartYear = year;
  if (now.getDate() < billingDay) {
    cycleStartMonth -= 1;
    if (cycleStartMonth < 0) {
      cycleStartMonth = 11;
      cycleStartYear -= 1;
    }
  }

  // Apply offset (0 = current, -1 = previous)
  cycleStartMonth += offset;
  if (cycleStartMonth < 0) {
    cycleStartMonth += 12;
    cycleStartYear -= 1;
  } else if (cycleStartMonth > 11) {
    cycleStartMonth -= 12;
    cycleStartYear += 1;
  }

  const start = new Date(cycleStartYear, cycleStartMonth, billingDay);

  // End is billingDay of next month
  let endMonth = cycleStartMonth + 1;
  let endYear = cycleStartYear;
  if (endMonth > 11) {
    endMonth = 0;
    endYear += 1;
  }
  const end = new Date(endYear, endMonth, billingDay);

  return { start, end };
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 300;

interface TransactionViewProps {
  transactions: ARTransaction[];
  memberId?: string;
  onViewInvoice?: (invoiceNumber: string) => void;
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

function TransactionIcon({ type }: { type: ARTransaction['type'] }) {
  const iconStyles = {
    INVOICE: 'from-blue-100 to-blue-200/50 dark:from-blue-500/30 dark:to-blue-500/10 text-blue-600 dark:text-blue-400',
    PAYMENT: 'from-emerald-100 to-emerald-200/50 dark:from-emerald-500/30 dark:to-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    CREDIT: 'from-purple-100 to-purple-200/50 dark:from-purple-500/30 dark:to-purple-500/10 text-purple-600 dark:text-purple-400',
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

export function TransactionView({ transactions, memberId, onViewInvoice }: TransactionViewProps) {
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { settings: billingSettings } = useClubBillingSettings();
  const { profile: billingProfile } = useMemberBillingProfile(memberId);
  const isMemberCycle = billingSettings?.billingCycleMode === 'MEMBER_CYCLE';

  // Compute cycle dates for cycle filter options
  const cycleDates = useMemo(() => {
    if (!billingSettings) return null;
    const day = isMemberCycle
      ? (billingProfile?.billingDay ?? billingSettings.defaultBillingDay)
      : billingSettings.clubCycleClosingDay;
    return {
      current: getCycleDates(day, 0),
      previous: getCycleDates(day, -1),
    };
  }, [billingSettings, billingProfile, isMemberCycle]);

  // Debounced search
  const searchTimeoutRef = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef[0]) clearTimeout(searchTimeoutRef[0]);
    searchTimeoutRef[0] = setTimeout(() => {
      setDebouncedSearch(value);
      setVisibleCount(PAGE_SIZE);
    }, SEARCH_DEBOUNCE_MS);
  }, [searchTimeoutRef]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.description.toLowerCase().includes(query) ||
          (tx.invoiceNumber && tx.invoiceNumber.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter((tx) => tx.type === typeFilter);
    }

    // Date range filter
    if (dateRange !== 'ALL') {
      if (dateRange === 'CURRENT_CYCLE' && cycleDates) {
        filtered = filtered.filter((tx) => {
          const txDate = new Date(tx.date);
          return txDate >= cycleDates.current.start && txDate < cycleDates.current.end;
        });
      } else if (dateRange === 'PREVIOUS_CYCLE' && cycleDates) {
        filtered = filtered.filter((tx) => {
          const txDate = new Date(tx.date);
          return txDate >= cycleDates.previous.start && txDate < cycleDates.previous.end;
        });
      } else {
        const now = new Date();
        let startDate: Date;

        switch (dateRange) {
          case '30':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case '180':
            startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
            break;
          case '365':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }

        filtered = filtered.filter((tx) => new Date(tx.date) >= startDate);
      }
    }

    // Sort by date descending
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, typeFilter, dateRange, debouncedSearch, cycleDates]);

  const visibleTransactions = filteredTransactions.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTransactions.length;

  // Reset pagination when filters change
  const handleTypeChange = useCallback((value: string) => {
    setTypeFilter(value);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handleDateRangeChange = useCallback((value: string) => {
    setDateRange(value);
    setVisibleCount(PAGE_SIZE);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 dark:bg-stone-800/80 dark:bg-stone-900/80 shadow-lg shadow-slate-200/30 dark:shadow-stone-900/30 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

      {/* Header with Search and Filters */}
      <div className="relative flex flex-col gap-4 border-b border-slate-100 dark:border-stone-700 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
            <Receipt className="h-5 w-5 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Transaction History</h2>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-border/60 bg-white/80 dark:bg-stone-800/80 dark:bg-stone-800/80 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-amber-300 dark:focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-200/50 dark:focus:ring-amber-500/20"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-40 bg-white/80 dark:bg-stone-800/80">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Time</SelectItem>
              {cycleDates && (
                <>
                  <SelectItem value="CURRENT_CYCLE">Current Cycle</SelectItem>
                  <SelectItem value="PREVIOUS_CYCLE">Previous Cycle</SelectItem>
                </>
              )}
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="180">Last 6 Months</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-36 bg-white/80 dark:bg-stone-800/80">
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

        {/* Cycle date range label */}
        {dateRange === 'CURRENT_CYCLE' && cycleDates && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50/80 dark:bg-blue-500/10 px-3 py-2 text-xs text-blue-700 dark:text-blue-400">
            <Calendar className="h-3.5 w-3.5" />
            Showing: {formatDateShort(cycleDates.current.start)} — {formatDateShort(cycleDates.current.end)} (Current Cycle)
          </div>
        )}
        {dateRange === 'PREVIOUS_CYCLE' && cycleDates && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50/80 dark:bg-blue-500/10 px-3 py-2 text-xs text-blue-700 dark:text-blue-400">
            <Calendar className="h-3.5 w-3.5" />
            Showing: {formatDateShort(cycleDates.previous.start)} — {formatDateShort(cycleDates.previous.end)} (Previous Cycle)
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative p-4 sm:p-6">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border bg-muted/50 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              {debouncedSearch ? 'No matching transactions' : 'No transactions recorded'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {debouncedSearch ? 'Try a different search term' : 'Transaction history will appear here'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4">
              {visibleTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={cn(
                    'group flex flex-col gap-3 rounded-xl border border-border/60 bg-white/60 dark:bg-stone-800/60 p-4 transition-all duration-300 hover:bg-card hover:shadow-sm sm:flex-row sm:items-center sm:gap-4',
                    index === 0 && 'ring-1 ring-slate-200/50 dark:ring-stone-700/50'
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
                          className="flex items-center gap-1 rounded-md border bg-white/80 dark:bg-stone-800/80 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:text-blue-700 dark:hover:text-blue-300"
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
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-emerald-600 dark:text-emerald-400'
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

            {/* Pagination Footer */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {visibleTransactions.length} of {filteredTransactions.length} transactions
              </p>
              {hasMore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="h-9 text-sm"
                >
                  Load More
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

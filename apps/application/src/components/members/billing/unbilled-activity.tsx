'use client';

import { useState, useMemo } from 'react';
import { cn, Badge } from '@clubvantage/ui';
import type { ARTransaction } from '../types';
import type { ARProfile } from '@/hooks/use-ar-statements';
import {
  ChevronDown,
  ChevronRight,
  Receipt,
  UtensilsCrossed,
  CircleDollarSign,
  Briefcase,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react';

interface UnbilledActivityProps {
  memberId: string;
  arProfile: ARProfile;
  transactions: ARTransaction[];
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
  });
}

// Categorize transactions based on description keywords
type Category = 'fnb' | 'golf' | 'dues' | 'other';

const categoryConfig: Record<Category, {
  label: string;
  icon: React.ElementType;
  className: string;
}> = {
  fnb: {
    label: 'F&B',
    icon: UtensilsCrossed,
    className: 'from-orange-100 to-orange-200/50 dark:from-orange-500/30 dark:to-orange-500/10 text-orange-600 dark:text-orange-400',
  },
  golf: {
    label: 'Golf',
    icon: CircleDollarSign,
    className: 'from-emerald-100 to-emerald-200/50 dark:from-emerald-500/30 dark:to-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  dues: {
    label: 'Dues',
    icon: Briefcase,
    className: 'from-blue-100 to-blue-200/50 dark:from-blue-500/30 dark:to-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  other: {
    label: 'Other',
    icon: MoreHorizontal,
    className: 'from-stone-100 to-stone-200/50 dark:from-stone-500/30 dark:to-stone-500/10 text-stone-600 dark:text-stone-400',
  },
};

function categorizeTransaction(description: string): Category {
  const lower = description.toLowerCase();
  if (lower.includes('restaurant') || lower.includes('bar') || lower.includes('dining') || lower.includes('f&b') || lower.includes('food') || lower.includes('beverage') || lower.includes('café') || lower.includes('cafe')) {
    return 'fnb';
  }
  if (lower.includes('golf') || lower.includes('green fee') || lower.includes('caddy') || lower.includes('cart') || lower.includes('driving range') || lower.includes('tee')) {
    return 'golf';
  }
  if (lower.includes('dues') || lower.includes('membership') || lower.includes('subscription') || lower.includes('monthly fee') || lower.includes('annual fee')) {
    return 'dues';
  }
  return 'other';
}

interface CategoryGroupProps {
  category: Category;
  items: ARTransaction[];
  onViewInvoice?: (invoiceNumber: string) => void;
}

function CategoryGroup({ category, items, onViewInvoice }: CategoryGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = categoryConfig[category];
  const CategoryIcon = config.icon;
  const total = items.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return (
    <div className="rounded-xl border border-border/60 bg-white/60 dark:bg-stone-800/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-inner',
          config.className
        )}>
          <CategoryIcon className="h-4 w-4" />
        </div>
        <span className="flex-1 text-sm font-medium text-foreground">{config.label}</span>
        <span className="text-sm font-semibold text-foreground">{formatCurrency(total)}</span>
      </button>

      {isExpanded && (
        <div className="border-t border-border/40 divide-y divide-border/30">
          {items.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 px-4 py-2.5 pl-12">
              <span className="flex-1 text-xs text-muted-foreground truncate">
                {tx.description} &mdash; {formatDate(tx.date)}
              </span>
              {tx.invoiceNumber && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewInvoice?.(tx.invoiceNumber!);
                  }}
                  className="flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                </button>
              )}
              <span className="text-xs font-medium text-foreground">{formatCurrency(Math.abs(tx.amount))}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function UnbilledActivity({ memberId, arProfile, transactions, onViewInvoice }: UnbilledActivityProps) {
  const lastStatementDate = arProfile.lastStatementDate
    ? new Date(arProfile.lastStatementDate)
    : null;

  // Filter for transactions after last statement date
  const unbilledTransactions = useMemo(() => {
    if (!lastStatementDate) return transactions;
    return transactions.filter((tx) => new Date(tx.date) > lastStatementDate);
  }, [transactions, lastStatementDate]);

  // Separate charges and payments
  const { charges, payments } = useMemo(() => {
    const ch: ARTransaction[] = [];
    const pay: ARTransaction[] = [];
    for (const tx of unbilledTransactions) {
      if (tx.type === 'PAYMENT' || tx.type === 'CREDIT') {
        pay.push(tx);
      } else {
        ch.push(tx);
      }
    }
    return { charges: ch, payments: pay };
  }, [unbilledTransactions]);

  // Group charges by category
  const groupedCharges = useMemo(() => {
    const groups: Record<Category, ARTransaction[]> = { fnb: [], golf: [], dues: [], other: [] };
    for (const tx of charges) {
      const cat = categorizeTransaction(tx.description);
      groups[cat].push(tx);
    }
    return groups;
  }, [charges]);

  const totalCharges = charges.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const totalPayments = payments.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const netUnbilled = totalCharges - totalPayments;

  const sinceLabel = lastStatementDate
    ? lastStatementDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'account opening';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 dark:bg-stone-900/80 shadow-lg shadow-slate-200/30 dark:shadow-stone-900/30 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

      {/* Header */}
      <div className="relative flex items-center gap-3 border-b border-slate-100 dark:border-stone-700 p-4 sm:p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-200/50 dark:from-amber-500/30 dark:to-amber-500/10 shadow-inner">
          <Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Unbilled Activity</h2>
          <p className="text-xs text-muted-foreground">Since last close: {sinceLabel}</p>
        </div>
      </div>

      {/* Content */}
      <div className="relative space-y-3 p-4 sm:p-6">
        {unbilledTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border bg-muted/50 py-8">
            <Receipt className="h-7 w-7 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">No unbilled activity</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No transactions since the last statement
            </p>
          </div>
        ) : (
          <>
            {/* Category groups */}
            {(Object.entries(groupedCharges) as [Category, ARTransaction[]][])
              .filter(([, items]) => items.length > 0)
              .map(([category, items]) => (
                <CategoryGroup
                  key={category}
                  category={category}
                  items={items}
                  onViewInvoice={onViewInvoice}
                />
              ))}

            {/* Payments received */}
            {payments.length > 0 && (
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-emerald-50/60 dark:bg-emerald-500/10 p-3">
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Payments Received</span>
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  -{formatCurrency(totalPayments)}
                </span>
              </div>
            )}

            {/* Net unbilled total */}
            <div className="border-t border-border/60 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Net Unbilled</span>
                <span className={cn(
                  'text-lg font-bold tracking-tight',
                  netUnbilled > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                )}>
                  {formatCurrency(netUnbilled)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

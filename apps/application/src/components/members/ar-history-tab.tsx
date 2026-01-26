'use client';

import { useState, useMemo } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { cn } from '@clubvantage/ui';
import { Badge } from '@clubvantage/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui';
import { ARHistoryEmpty } from './empty-states';
import type { Member, ARTransaction } from './types';

interface ARHistoryTabProps {
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
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getTransactionTypeBadge(type: ARTransaction['type']): { label: string; className: string } {
  switch (type) {
    case 'INVOICE':
      return { label: 'Invoice', className: 'bg-blue-100 text-blue-700' };
    case 'PAYMENT':
      return { label: 'Payment', className: 'bg-emerald-100 text-emerald-700' };
    case 'CREDIT':
      return { label: 'Credit', className: 'bg-purple-100 text-purple-700' };
    case 'ADJUSTMENT':
      return { label: 'Adjustment', className: 'bg-muted text-foreground' };
    default:
      return { label: type, className: 'bg-muted text-foreground' };
  }
}

function getBalanceColor(amount: number): string {
  if (amount > 0) return 'text-red-600';
  if (amount < 0) return 'text-emerald-600';
  return 'text-muted-foreground';
}

// Group transactions by month
function groupByMonth(transactions: ARTransaction[]): Map<string, ARTransaction[]> {
  const grouped = new Map<string, ARTransaction[]>();

  transactions.forEach((tx) => {
    const date = new Date(tx.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const existing = grouped.get(key) || [];
    grouped.set(key, [...existing, tx]);
  });

  return grouped;
}

function formatMonthYear(key: string): string {
  const parts = key.split('-');
  const year = parts[0] || '2024';
  const month = parts[1] || '1';
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function ARHistoryTab({
  member,
  transactions,
  onViewInvoice,
  onViewStatement,
}: ARHistoryTabProps) {
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

  const groupedTransactions = useMemo(
    () => groupByMonth(filteredTransactions),
    [filteredTransactions]
  );

  // Calculate aging buckets
  const agingBuckets = useMemo(() => {
    // This is a simplified version - in reality, this would come from the backend
    const current = member.balance > 0 ? member.balance * 0.3 : 0;
    const days30 = member.agingBucket === '30' ? member.balance * 0.7 : 0;
    const days60 = member.agingBucket === '60' ? member.balance * 0.7 : 0;
    const days90 = member.agingBucket === '90' ? member.balance * 0.7 : 0;
    const days91Plus = member.agingBucket === '91+' ? member.balance * 0.7 : 0;

    return { current, days30, days60, days90, days91Plus };
  }, [member.balance, member.agingBucket]);

  const totalBuckets = Object.values(agingBuckets).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Current Balance</label>
            <p className={cn('text-3xl font-bold', getBalanceColor(member.balance))}>
              {formatCurrency(member.balance)}
            </p>
          </div>
          {member.oldestInvoiceDate && member.balance > 0 && (
            <div className="text-right">
              <label className="text-sm font-medium text-muted-foreground">Oldest Invoice</label>
              <p className="text-sm text-foreground">{formatDate(member.oldestInvoiceDate)}</p>
            </div>
          )}
        </div>

        {/* Aging Bar */}
        {totalBuckets > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex h-4 overflow-hidden rounded-full">
              {agingBuckets.current > 0 && (
                <div
                  className="bg-stone-300"
                  style={{ width: `${(agingBuckets.current / totalBuckets) * 100}%` }}
                />
              )}
              {agingBuckets.days30 > 0 && (
                <div
                  className="bg-amber-200"
                  style={{ width: `${(agingBuckets.days30 / totalBuckets) * 100}%` }}
                />
              )}
              {agingBuckets.days60 > 0 && (
                <div
                  className="bg-amber-400"
                  style={{ width: `${(agingBuckets.days60 / totalBuckets) * 100}%` }}
                />
              )}
              {agingBuckets.days90 > 0 && (
                <div
                  className="bg-amber-600"
                  style={{ width: `${(agingBuckets.days90 / totalBuckets) * 100}%` }}
                />
              )}
              {agingBuckets.days91Plus > 0 && (
                <div
                  className="bg-red-500"
                  style={{ width: `${(agingBuckets.days91Plus / totalBuckets) * 100}%` }}
                />
              )}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Current: {formatCurrency(agingBuckets.current)}</span>
              <span>30d: {formatCurrency(agingBuckets.days30)}</span>
              <span>60d: {formatCurrency(agingBuckets.days60)}</span>
              <span>90d: {formatCurrency(agingBuckets.days90)}</span>
              <span className="text-red-600">91+: {formatCurrency(agingBuckets.days91Plus)}</span>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>History includes previous membership types</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="w-48">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
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
        </div>
        <div className="w-48">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Transaction type" />
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

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <ARHistoryEmpty />
      ) : (
        <div className="space-y-6">
          {Array.from(groupedTransactions.entries()).map(([monthKey, txs]) => (
            <div key={monthKey} className="rounded-lg border border-border bg-card">
              <div className="border-b border-border bg-muted/50 px-4 py-2">
                <h4 className="text-sm font-medium text-foreground">{formatMonthYear(monthKey)}</h4>
              </div>
              <div className="divide-y divide-stone-100">
                {txs.map((tx) => {
                  const typeBadge = getTransactionTypeBadge(tx.type);
                  return (
                    <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-4">
                        <span className="w-24 text-sm text-muted-foreground">{formatDate(tx.date)}</span>
                        <Badge className={cn('text-xs', typeBadge.className)}>
                          {typeBadge.label}
                        </Badge>
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">{tx.description}</span>
                          {tx.invoiceNumber && (
                            <button
                              type="button"
                              onClick={() => onViewInvoice?.(tx.invoiceNumber!)}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            >
                              {tx.invoiceNumber}
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span
                          className={cn(
                            'w-28 text-right text-sm font-medium',
                            tx.amount > 0 ? 'text-red-600' : 'text-emerald-600'
                          )}
                        >
                          {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                        </span>
                        {tx.runningBalance !== undefined && (
                          <span className="w-28 text-right text-sm text-muted-foreground">
                            Bal: {formatCurrency(tx.runningBalance)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

# AR Statement System Implementation Plan - Part 3

> Continuation of `2026-02-04-ar-statement-system-implementation-part2.md`

---

### Task 27: Create Statement Periods Tab Component

**Files:**
- Create: `apps/application/src/components/billing/statement-periods-tab.tsx`

**Step 1: Create the tab component**

```tsx
'use client';

import { useState } from 'react';
import { cn, Button } from '@clubvantage/ui';
import {
  Calendar,
  Plus,
  ChevronRight,
  FileText,
  Play,
  Lock,
} from 'lucide-react';
import { PeriodStatusBadge, type PeriodStatus } from './period-status-badge';
import { RunStatusBadge, type RunStatus } from './run-status-badge';

interface StatementPeriod {
  id: string;
  periodYear: number;
  periodNumber: number;
  periodLabel: string;
  periodStart: Date;
  periodEnd: Date;
  status: PeriodStatus;
  totalStatements?: number;
  totalClosingBalance?: number;
  latestRun?: {
    runType: 'PREVIEW' | 'FINAL';
    status: RunStatus;
    generatedCount: number;
  };
}

interface StatementPeriodsTabProps {
  periods: StatementPeriod[];
  isLoading?: boolean;
  onCreatePeriod: () => void;
  onSelectPeriod: (id: string) => void;
  onStartRun: (periodId: string, type: 'PREVIEW' | 'FINAL') => void;
  onClosePeriod: (periodId: string) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function StatementPeriodsTab({
  periods,
  isLoading,
  onCreatePeriod,
  onSelectPeriod,
  onStartRun,
  onClosePeriod,
}: StatementPeriodsTabProps) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const years = [...new Set(periods.map((p) => p.periodYear))].sort((a, b) => b - a);
  const filteredPeriods = periods.filter((p) => p.periodYear === selectedYear);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-stone-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-stone-900">Statement Periods</h2>
          <div className="flex gap-1">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                  year === selectedYear
                    ? 'bg-amber-500 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={onCreatePeriod} className="gap-2">
          <Plus className="h-4 w-4" />
          New Period
        </Button>
      </div>

      {/* Period Cards */}
      <div className="space-y-3">
        {filteredPeriods.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-200 py-12">
            <Calendar className="h-12 w-12 text-stone-300" />
            <p className="mt-4 text-sm text-stone-500">No periods for {selectedYear}</p>
            <Button variant="outline" className="mt-4" onClick={onCreatePeriod}>
              Create First Period
            </Button>
          </div>
        ) : (
          filteredPeriods.map((period) => (
            <div
              key={period.id}
              className="group rounded-lg border border-stone-200 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                {/* Left: Period Info */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-stone-100">
                    <Calendar className="h-6 w-6 text-stone-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-stone-900">{period.periodLabel}</h3>
                      <PeriodStatusBadge status={period.status} />
                    </div>
                    <p className="text-sm text-stone-500">
                      {formatDate(period.periodStart)} - {formatDate(period.periodEnd)}
                    </p>
                  </div>
                </div>

                {/* Center: Stats */}
                <div className="flex items-center gap-8">
                  {period.totalStatements !== undefined && (
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-stone-900">
                        {period.totalStatements}
                      </p>
                      <p className="text-xs text-stone-500">Statements</p>
                    </div>
                  )}
                  {period.totalClosingBalance !== undefined && (
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-stone-900">
                        {formatCurrency(period.totalClosingBalance)}
                      </p>
                      <p className="text-xs text-stone-500">Total Balance</p>
                    </div>
                  )}
                  {period.latestRun && (
                    <div className="flex items-center gap-2">
                      <RunStatusBadge status={period.latestRun.status} />
                      <span className="text-sm text-stone-500">
                        {period.latestRun.runType} ({period.latestRun.generatedCount})
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                  {period.status === 'OPEN' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStartRun(period.id, 'PREVIEW')}
                        className="gap-1"
                      >
                        <Play className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onClosePeriod(period.id)}
                        className="gap-1 bg-gradient-to-br from-amber-500 to-amber-600"
                      >
                        <Lock className="h-4 w-4" />
                        Close & Finalize
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectPeriod(period.id)}
                    className="gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    View
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/billing/statement-periods-tab.tsx
git commit -m "feat(app): add StatementPeriodsTab component"
```

---

### Task 28: Create Statement Run Progress Component

**Files:**
- Create: `apps/application/src/components/billing/statement-run-progress.tsx`

**Step 1: Create the progress component**

```tsx
'use client';

import { cn, Button } from '@clubvantage/ui';
import { Loader2, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import { RunStatusBadge, type RunStatus } from './run-status-badge';

interface StatementRunProgressProps {
  run: {
    id: string;
    runType: 'PREVIEW' | 'FINAL';
    runNumber: number;
    status: RunStatus;
    totalProfiles: number;
    processedCount: number;
    generatedCount: number;
    skippedCount: number;
    errorCount: number;
    totalClosingBalance: number;
  };
  onCancel?: () => void;
  onViewStatements?: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function StatementRunProgress({
  run,
  onCancel,
  onViewStatements,
}: StatementRunProgressProps) {
  const progress =
    run.totalProfiles > 0
      ? Math.round((run.processedCount / run.totalProfiles) * 100)
      : 0;

  const isRunning = run.status === 'IN_PROGRESS';
  const isComplete = run.status === 'COMPLETED';
  const isFailed = run.status === 'FAILED';

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              isRunning && 'bg-blue-100',
              isComplete && 'bg-emerald-100',
              isFailed && 'bg-red-100'
            )}
          >
            {isRunning && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
            {isComplete && <CheckCircle className="h-5 w-5 text-emerald-600" />}
            {isFailed && <XCircle className="h-5 w-5 text-red-600" />}
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">
              {run.runType} Run #{run.runNumber}
            </h3>
            <RunStatusBadge status={run.status} />
          </div>
        </div>
        {isRunning && onCancel && (
          <Button variant="outline" size="sm" onClick={onCancel} className="gap-1">
            <X className="h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-stone-500">
            <span>Processing profiles...</span>
            <span>
              {run.processedCount} / {run.totalProfiles} ({progress}%)
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-stone-50 p-3 text-center">
          <p className="text-2xl font-semibold text-stone-900">{run.generatedCount}</p>
          <p className="text-xs text-stone-500">Generated</p>
        </div>
        <div className="rounded-lg bg-stone-50 p-3 text-center">
          <p className="text-2xl font-semibold text-stone-900">{run.skippedCount}</p>
          <p className="text-xs text-stone-500">Skipped</p>
        </div>
        <div className="rounded-lg bg-stone-50 p-3 text-center">
          <p
            className={cn(
              'text-2xl font-semibold',
              run.errorCount > 0 ? 'text-red-600' : 'text-stone-900'
            )}
          >
            {run.errorCount}
          </p>
          <p className="text-xs text-stone-500">Errors</p>
        </div>
        <div className="rounded-lg bg-stone-50 p-3 text-center">
          <p className="text-2xl font-semibold text-stone-900">
            {formatCurrency(run.totalClosingBalance)}
          </p>
          <p className="text-xs text-stone-500">Total Balance</p>
        </div>
      </div>

      {/* Error Warning */}
      {run.errorCount > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-amber-800">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm">
            {run.errorCount} profile(s) failed to generate. Review errors before finalizing.
          </span>
        </div>
      )}

      {/* Actions */}
      {isComplete && onViewStatements && (
        <div className="mt-4 flex justify-end">
          <Button onClick={onViewStatements} className="bg-gradient-to-br from-amber-500 to-amber-600">
            View Statements
          </Button>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/billing/statement-run-progress.tsx
git commit -m "feat(app): add StatementRunProgress component"
```

---

### Task 29: Create AR Profile List Component

**Files:**
- Create: `apps/application/src/components/billing/ar-profile-list.tsx`

**Step 1: Create the list component**

```tsx
'use client';

import { useState } from 'react';
import { cn, Button, Input } from '@clubvantage/ui';
import { Search, Filter, Plus, MoreVertical, User, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@clubvantage/ui';
import { ARProfileBadge, type ARProfileType } from './ar-profile-badge';
import { AgingBadge } from './aging-badge';

interface ARProfile {
  id: string;
  accountNumber: string;
  profileType: ARProfileType;
  name: string;
  email?: string;
  currentBalance: number;
  creditLimit?: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  lastStatementDate?: Date;
  agingStatus?: 'current' | '30' | '60' | '90' | 'suspended';
}

interface ARProfileListProps {
  profiles: ARProfile[];
  isLoading?: boolean;
  onCreateProfile: () => void;
  onViewProfile: (id: string) => void;
  onSuspendProfile: (id: string) => void;
  onCloseProfile: (id: string) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ARProfileList({
  profiles,
  isLoading,
  onCreateProfile,
  onViewProfile,
  onSuspendProfile,
  onCloseProfile,
}: ARProfileListProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ARProfileType | 'ALL'>('ALL');

  const filtered = profiles.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.accountNumber.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || p.profileType === typeFilter;
    return matchesSearch && matchesType;
  });

  // Summary stats
  const totalBalance = filtered.reduce((sum, p) => sum + p.currentBalance, 0);
  const memberCount = filtered.filter((p) => p.profileType === 'MEMBER').length;
  const cityLedgerCount = filtered.filter((p) => p.profileType === 'CITY_LEDGER').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-500">Total Profiles</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">{filtered.length}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-500">Members</p>
          <p className="mt-1 text-2xl font-semibold text-blue-600">{memberCount}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-500">City Ledger</p>
          <p className="mt-1 text-2xl font-semibold text-purple-600">{cityLedgerCount}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-500">Total Balance</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">
            {formatCurrency(totalBalance)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              placeholder="Search by name or account..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-80 pl-9"
            />
          </div>
          <div className="flex gap-1">
            {(['ALL', 'MEMBER', 'CITY_LEDGER'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  type === typeFilter
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                {type === 'ALL' ? 'All' : type === 'MEMBER' ? 'Members' : 'City Ledger'}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={onCreateProfile} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Profile
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-stone-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                Account
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                Type
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">
                Balance
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">
                Credit Limit
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-stone-500">
                Aging
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-stone-500">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="px-4 py-4">
                    <div className="h-6 animate-pulse rounded bg-stone-100" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-stone-500">
                  No profiles found
                </td>
              </tr>
            ) : (
              filtered.map((profile) => (
                <tr
                  key={profile.id}
                  className="cursor-pointer hover:bg-stone-50"
                  onClick={() => onViewProfile(profile.id)}
                >
                  <td className="px-4 py-3 font-mono text-sm text-stone-900">
                    {profile.accountNumber}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full',
                          profile.profileType === 'MEMBER' ? 'bg-blue-100' : 'bg-purple-100'
                        )}
                      >
                        {profile.profileType === 'MEMBER' ? (
                          <User className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Building2 className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-stone-900">{profile.name}</p>
                        {profile.email && (
                          <p className="text-xs text-stone-500">{profile.email}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ARProfileBadge type={profile.profileType} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-stone-900">
                    {formatCurrency(profile.currentBalance)}
                  </td>
                  <td className="px-4 py-3 text-right text-stone-500">
                    {profile.creditLimit ? formatCurrency(profile.creditLimit) : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {profile.agingStatus && <AgingBadge status={profile.agingStatus} />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        profile.status === 'ACTIVE' && 'bg-emerald-100 text-emerald-700',
                        profile.status === 'SUSPENDED' && 'bg-amber-100 text-amber-700',
                        profile.status === 'CLOSED' && 'bg-stone-100 text-stone-500'
                      )}
                    >
                      {profile.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewProfile(profile.id)}>
                          View Details
                        </DropdownMenuItem>
                        {profile.status === 'ACTIVE' && (
                          <DropdownMenuItem onClick={() => onSuspendProfile(profile.id)}>
                            Suspend
                          </DropdownMenuItem>
                        )}
                        {profile.status !== 'CLOSED' && profile.currentBalance === 0 && (
                          <DropdownMenuItem onClick={() => onCloseProfile(profile.id)}>
                            Close Account
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/billing/ar-profile-list.tsx
git commit -m "feat(app): add ARProfileList component"
```

---

### Task 30: Create Create Period Modal

**Files:**
- Create: `apps/application/src/components/billing/create-period-modal.tsx`

**Step 1: Create the modal component**

```tsx
'use client';

import { useState } from 'react';
import { Button, Input, Label } from '@clubvantage/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui';
import { Calendar, Loader2 } from 'lucide-react';

interface CreatePeriodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    periodYear: number;
    periodNumber: number;
    periodLabel: string;
    periodStart: string;
    periodEnd: string;
    cutoffDate: string;
  }) => Promise<void>;
}

export function CreatePeriodModal({
  open,
  onOpenChange,
  onSubmit,
}: CreatePeriodModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const now = new Date();
  const [periodYear, setPeriodYear] = useState(now.getFullYear());
  const [periodNumber, setPeriodNumber] = useState(now.getMonth() + 1);
  const [periodLabel, setPeriodLabel] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [cutoffDate, setCutoffDate] = useState('');

  // Auto-generate label when year/number changes
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handleNumberChange = (num: number) => {
    setPeriodNumber(num);
    if (num >= 1 && num <= 12) {
      setPeriodLabel(`${monthNames[num - 1]} ${periodYear}`);

      // Auto-fill dates for monthly periods
      const start = new Date(periodYear, num - 1, 1);
      const end = new Date(periodYear, num, 0); // Last day of month
      const cutoff = new Date(end);
      cutoff.setDate(cutoff.getDate() - 2); // 2 days before end

      setPeriodStart(start.toISOString().split('T')[0]);
      setPeriodEnd(end.toISOString().split('T')[0]);
      setCutoffDate(cutoff.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        periodYear,
        periodNumber,
        periodLabel,
        periodStart,
        periodEnd,
        cutoffDate,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid =
    periodYear > 0 &&
    periodNumber > 0 &&
    periodLabel.trim() !== '' &&
    periodStart !== '' &&
    periodEnd !== '' &&
    cutoffDate !== '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            Create Statement Period
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Year and Number */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                value={periodYear}
                onChange={(e) => setPeriodYear(parseInt(e.target.value) || 0)}
                min={2020}
                max={2100}
              />
            </div>
            <div className="space-y-2">
              <Label>Period Number</Label>
              <Input
                type="number"
                value={periodNumber}
                onChange={(e) => handleNumberChange(parseInt(e.target.value) || 0)}
                min={1}
                max={52}
              />
            </div>
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label>Period Label</Label>
            <Input
              value={periodLabel}
              onChange={(e) => setPeriodLabel(e.target.value)}
              placeholder="e.g., January 2026"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Period Start</Label>
              <Input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Period End</Label>
              <Input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cutoff Date</Label>
            <Input
              type="date"
              value={cutoffDate}
              onChange={(e) => setCutoffDate(e.target.value)}
            />
            <p className="text-xs text-stone-500">
              Transactions after this date will not be included in statements
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="bg-gradient-to-br from-amber-500 to-amber-600"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Period
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/billing/create-period-modal.tsx
git commit -m "feat(app): add CreatePeriodModal component"
```

---

### Task 31: Export New Components from Index

**Files:**
- Modify: `apps/application/src/components/billing/index.ts`

**Step 1: Add exports for new components**

Add to the end of the file:

```typescript
// AR Statement Components
export { PeriodStatusBadge, type PeriodStatus } from './period-status-badge';
export { RunStatusBadge, type RunStatus } from './run-status-badge';
export { ARProfileBadge, type ARProfileType } from './ar-profile-badge';
export { StatementPeriodsTab } from './statement-periods-tab';
export { StatementRunProgress } from './statement-run-progress';
export { ARProfileList } from './ar-profile-list';
export { CreatePeriodModal } from './create-period-modal';
```

**Step 2: Commit**

```bash
git add apps/application/src/components/billing/index.ts
git commit -m "feat(app): export AR statement components from index"
```

---

### Task 32: Add Statements Tab to Billing Page

**Files:**
- Modify: `apps/application/src/app/(dashboard)/billing/page.tsx`

**Step 1: Add lazy import for StatementPeriodsTab**

Add with other dynamic imports:

```typescript
const DynamicStatementPeriodsTab = dynamic(
  () => import('@/components/billing/statement-periods-tab').then((mod) => mod.StatementPeriodsTab),
  { loading: () => <TabLoadingSkeleton />, ssr: false }
);
```

**Step 2: Add tab button**

In the tab navigation, add:

```tsx
<button
  onClick={() => setActiveTab('periods')}
  className={cn(
    'px-4 py-2 text-sm font-medium rounded-md transition-colors',
    activeTab === 'periods'
      ? 'bg-amber-500 text-white'
      : 'text-stone-600 hover:bg-stone-100'
  )}
>
  Statement Periods
</button>
```

**Step 3: Add tab content**

In the tab content switch:

```tsx
{activeTab === 'periods' && (
  <DynamicStatementPeriodsTab
    periods={[]} // Will be wired to hook
    isLoading={false}
    onCreatePeriod={() => setShowCreatePeriodModal(true)}
    onSelectPeriod={(id) => router.push(`/billing/periods/${id}`)}
    onStartRun={(periodId, type) => {/* TODO: Implement */}}
    onClosePeriod={(periodId) => {/* TODO: Implement */}}
  />
)}
```

**Step 4: Commit**

```bash
git add apps/application/src/app/\\(dashboard\\)/billing/page.tsx
git commit -m "feat(app): add Statement Periods tab to billing page"
```

---

## Phase 4: Integration & Testing

### Task 33: Wire Up GraphQL Queries in Hooks

**Files:**
- Modify: `apps/application/src/hooks/use-billing.ts`

**Step 1: Update hooks to use actual API client**

After running `pnpm --filter @clubvantage/api-client run codegen`, update the hooks to use the generated queries:

```typescript
import {
  useGetArProfilesQuery,
  useGetStatementPeriodsQuery,
  useGetStatementRunsQuery,
  useStartStatementRunMutation,
  // ... other generated hooks
} from '@clubvantage/api-client';
```

**Step 2: Commit**

```bash
git add apps/application/src/hooks/use-billing.ts
git commit -m "feat(app): wire AR statement hooks to GraphQL client"
```

---

### Task 34: Run API Codegen

**Step 1: Start API server briefly to generate schema**

Run: `cd apps/api && pnpm run dev`
Wait for "Nest application successfully started"
Stop with Ctrl+C

**Step 2: Run codegen**

Run: `pnpm --filter @clubvantage/api-client run codegen`

Expected: Success, new hooks generated

**Step 3: Commit generated files**

```bash
git add packages/api-client/
git commit -m "chore: regenerate API client with AR statement types"
```

---

### Task 35: Verify Build

**Step 1: Build API**

Run: `pnpm --filter @clubvantage/api run build`
Expected: Build succeeds

**Step 2: Build Application**

Run: `pnpm --filter @clubvantage/application run build`
Expected: Build succeeds

**Step 3: Run type check**

Run: `pnpm run typecheck`
Expected: No errors

**Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete AR Statement System Phase 1 implementation"
```

---

## Summary

This implementation plan covers:

| Phase | Tasks | Description |
|-------|-------|-------------|
| Phase 1 | 1-8 | Database schema (enums, models, migration) |
| Phase 2 | 9-22 | Backend services (types, inputs, services, resolver, module) |
| Phase 3 | 23-32 | Frontend components (hooks, badges, tabs, modals) |
| Phase 4 | 33-35 | Integration (codegen, build verification) |

**Total Tasks:** 35

**Not Included (Future Phases):**
- PDF generation service
- Email/SMS delivery integration
- Print batch management
- Portal publishing
- Advanced reporting dashboards
- Period reopen approval workflow UI

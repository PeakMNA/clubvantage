'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Calendar, Loader2, History, Info, Settings } from 'lucide-react';
import { Button } from '@clubvantage/ui';
import { Input } from '@clubvantage/ui';
import { Label } from '@clubvantage/ui';
import { Checkbox } from '@clubvantage/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@clubvantage/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui';
import {
  useARPeriodSettings,
  type ARCycleType,
} from '@/hooks/use-ar-statements';
import Link from 'next/link';

export interface CreatePeriodFormData {
  periodYear: number;
  periodNumber: number;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  cutoffDate: string;
  isCatchUp?: boolean;
}

interface CreatePeriodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePeriodFormData) => Promise<void>;
  isSubmitting?: boolean;
  /** Existing periods to prevent duplicates */
  existingPeriods?: Array<{ periodYear: number; periodNumber: number; isCatchUp?: boolean }>;
  /** Whether a catch-up period already exists */
  hasCatchUpPeriod?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Calculate period dates based on cycle type and settings
 */
function calculatePeriodDates(
  year: number,
  month: number,
  cycleType: ARCycleType,
  customStartDay: number,
  cutoffDays: number
): { periodStart: Date; periodEnd: Date; cutoffDate: Date; label: string } {
  let periodStart: Date;
  let periodEnd: Date;
  let label: string;

  switch (cycleType) {
    case 'CALENDAR_MONTH': {
      // Standard calendar month: 1st to last day
      periodStart = new Date(year, month - 1, 1);
      const lastDay = getLastDayOfMonth(year, month - 1);
      periodEnd = new Date(year, month - 1, lastDay);
      label = `${MONTHS[month - 1]} ${year}`;
      break;
    }
    case 'ROLLING_30': {
      // Rolling 30 days from the 1st
      periodStart = new Date(year, month - 1, 1);
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 29); // 30 days total
      label = `${SHORT_MONTHS[month - 1]} 1 - ${SHORT_MONTHS[periodEnd.getMonth()]} ${periodEnd.getDate()}, ${periodEnd.getFullYear()}`;
      break;
    }
    case 'CUSTOM': {
      // Custom cycle: starts on customStartDay of month, ends on customStartDay-1 of next month
      periodStart = new Date(year, month - 1, customStartDay);

      // End date is customStartDay - 1 of next month
      const nextMonth = month === 12 ? 0 : month;
      const nextYear = month === 12 ? year + 1 : year;

      if (customStartDay === 1) {
        // If start day is 1st, end is last day of same month
        periodEnd = new Date(year, month, 0);
      } else {
        periodEnd = new Date(nextYear, nextMonth, customStartDay - 1);
      }

      label = `${SHORT_MONTHS[periodStart.getMonth()]} ${periodStart.getDate()} - ${SHORT_MONTHS[periodEnd.getMonth()]} ${periodEnd.getDate()}, ${periodEnd.getFullYear()}`;
      break;
    }
    default: {
      // Default to calendar month
      periodStart = new Date(year, month - 1, 1);
      const lastDay = getLastDayOfMonth(year, month - 1);
      periodEnd = new Date(year, month - 1, lastDay);
      label = `${MONTHS[month - 1]} ${year}`;
    }
  }

  // Calculate cutoff date
  const cutoffDate = new Date(periodEnd);
  cutoffDate.setDate(cutoffDate.getDate() + cutoffDays);

  return { periodStart, periodEnd, cutoffDate, label };
}

const CYCLE_TYPE_LABELS: Record<ARCycleType, string> = {
  CALENDAR_MONTH: 'Calendar Month',
  ROLLING_30: 'Rolling 30 Days',
  CUSTOM: 'Custom Cycle',
};

export function CreatePeriodModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  existingPeriods = [],
  hasCatchUpPeriod = false,
}: CreatePeriodModalProps) {
  // Fetch AR period settings
  const { settings, isLoading: settingsLoading } = useARPeriodSettings();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-indexed

  // Form state
  const [periodYear, setPeriodYear] = useState(currentYear);
  const [periodMonth, setPeriodMonth] = useState(currentMonth);
  const [isCatchUp, setIsCatchUp] = useState(false);
  const [error, setError] = useState<string>();

  // Catch-up period state
  const [catchUpEndDate, setCatchUpEndDate] = useState('');
  const [catchUpCutoffDate, setCatchUpCutoffDate] = useState('');
  const [catchUpLabel, setCatchUpLabel] = useState('');

  // Check if catch-up already exists
  const catchUpExists = useMemo(() => {
    return hasCatchUpPeriod || existingPeriods.some(p => p.isCatchUp);
  }, [hasCatchUpPeriod, existingPeriods]);

  // Get settings with defaults
  const cycleType = settings?.arCycleType ?? 'CALENDAR_MONTH';
  const customStartDay = settings?.arCustomCycleStartDay ?? 1;
  const cutoffDays = settings?.arCutoffDays ?? 5;

  // Calculate period dates based on settings
  const periodDates = useMemo(() => {
    return calculatePeriodDates(periodYear, periodMonth, cycleType, customStartDay, cutoffDays);
  }, [periodYear, periodMonth, cycleType, customStartDay, cutoffDays]);

  // Check if period already exists
  const periodExists = useMemo(() => {
    if (isCatchUp) return false;
    return existingPeriods.some(
      (p) => p.periodYear === periodYear && p.periodNumber === periodMonth && !p.isCatchUp
    );
  }, [existingPeriods, periodYear, periodMonth, isCatchUp]);

  // Year options: current year +/- 1
  const yearOptions = useMemo(() => {
    return [currentYear - 1, currentYear, currentYear + 1];
  }, [currentYear]);

  // Update catch-up cutoff date when end date changes
  useEffect(() => {
    if (isCatchUp && catchUpEndDate) {
      const endDate = new Date(catchUpEndDate);
      endDate.setDate(endDate.getDate() + cutoffDays);
      setCatchUpCutoffDate(formatDateForInput(endDate));
    }
  }, [isCatchUp, catchUpEndDate, cutoffDays]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      // Find the next available period
      let year = currentYear;
      let month = currentMonth;

      // Check if current month exists, if so, try next month
      const periodExistsCheck = (y: number, m: number) =>
        existingPeriods.some((p) => p.periodYear === y && p.periodNumber === m && !p.isCatchUp);

      if (periodExistsCheck(year, month)) {
        // Try next month
        month++;
        if (month > 12) {
          month = 1;
          year++;
        }
      }

      setPeriodYear(year);
      setPeriodMonth(month);
      setIsCatchUp(false);
      setCatchUpEndDate('');
      setCatchUpCutoffDate('');
      setCatchUpLabel('');
      setError(undefined);
    }
  }, [open, existingPeriods, currentYear, currentMonth]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(undefined);

      if (!isCatchUp && periodExists) {
        setError(`A period for ${periodDates.label} already exists.`);
        return;
      }

      if (isCatchUp) {
        if (catchUpExists) {
          setError('A catch-up period already exists. Only one is allowed.');
          return;
        }
        if (!catchUpEndDate) {
          setError('Please enter the end date for historical data.');
          return;
        }
        if (!catchUpCutoffDate) {
          setError('Please enter a cutoff date.');
          return;
        }
      }

      try {
        if (isCatchUp) {
          // Submit catch-up period
          const endDate = new Date(catchUpEndDate);
          await onSubmit({
            periodYear: endDate.getFullYear(),
            periodNumber: 0, // Special number for catch-up
            periodLabel: catchUpLabel || `Opening Balance (through ${formatDisplayDate(catchUpEndDate)})`,
            periodStart: '2020-01-01', // Far back date for catch-up
            periodEnd: catchUpEndDate,
            cutoffDate: catchUpCutoffDate,
            isCatchUp: true,
          });
        } else {
          // Submit regular period using calculated dates from settings
          await onSubmit({
            periodYear,
            periodNumber: periodMonth,
            periodLabel: periodDates.label,
            periodStart: formatDateForInput(periodDates.periodStart),
            periodEnd: formatDateForInput(periodDates.periodEnd),
            cutoffDate: formatDateForInput(periodDates.cutoffDate),
            isCatchUp: false,
          });
        }
        onOpenChange(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create period');
      }
    },
    [
      isCatchUp,
      periodExists,
      periodDates,
      catchUpExists,
      catchUpEndDate,
      catchUpCutoffDate,
      catchUpLabel,
      periodYear,
      periodMonth,
      onSubmit,
      onOpenChange,
    ]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create Statement Period
          </DialogTitle>
          <DialogDescription>
            Create a new billing period for statement generation.
          </DialogDescription>
        </DialogHeader>

        {settingsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            <span className="ml-2 text-muted-foreground">Loading settings...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Settings Info Banner */}
            <div className="rounded-lg bg-stone-50 dark:bg-stone-800/50 p-3 border border-stone-200 dark:border-stone-700">
              <div className="flex items-start gap-2">
                <Settings className="h-4 w-4 text-stone-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-stone-700 dark:text-stone-300">
                    Using <strong>{CYCLE_TYPE_LABELS[cycleType]}</strong> cycle
                    {cycleType === 'CUSTOM' && ` (starts on day ${customStartDay})`}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Cutoff: {cutoffDays} days after period end •{' '}
                    <Link href="/settings#ar-period" className="text-amber-600 hover:underline">
                      Change in Settings
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Catch-up Toggle */}
            {!catchUpExists && (
              <label className="flex items-center gap-2 p-3 rounded-lg border border-stone-200 dark:border-stone-700 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                <Checkbox
                  checked={isCatchUp}
                  onCheckedChange={(checked) => setIsCatchUp(checked as boolean)}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <History className="h-4 w-4 text-purple-600" />
                    Create Catch-Up Period
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Consolidate all historical data before starting regular cycles
                  </p>
                </div>
              </label>
            )}

            {!isCatchUp ? (
              <>
                {/* Year & Month Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodYear">Year</Label>
                    <Select
                      value={periodYear.toString()}
                      onValueChange={(value) => setPeriodYear(parseInt(value, 10))}
                    >
                      <SelectTrigger id="periodYear">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="periodMonth">
                      {cycleType === 'CUSTOM' ? 'Starting Month' : 'Month'}
                    </Label>
                    <Select
                      value={periodMonth.toString()}
                      onValueChange={(value) => setPeriodMonth(parseInt(value, 10))}
                    >
                      <SelectTrigger id="periodMonth">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month, index) => (
                          <SelectItem key={index + 1} value={(index + 1).toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Period Preview */}
                <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 p-4 space-y-3 border border-amber-200 dark:border-amber-500/20">
                  <div className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    {periodDates.label}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-amber-700 dark:text-amber-300 text-xs">Start</div>
                      <div className="font-medium text-amber-900 dark:text-amber-100">
                        {periodDates.periodStart.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-amber-700 dark:text-amber-300 text-xs">End</div>
                      <div className="font-medium text-amber-900 dark:text-amber-100">
                        {periodDates.periodEnd.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-amber-700 dark:text-amber-300 text-xs">Cutoff</div>
                      <div className="font-medium text-amber-900 dark:text-amber-100">
                        {periodDates.cutoffDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Catch-up Info Banner */}
                <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4">
                  <div className="flex items-start gap-3">
                    <History className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        Catch-Up Period
                      </p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        This consolidates all historical billing data up to the specified end date.
                        Use this to start fresh without processing old periods one by one.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Catch-up Period Label */}
                <div className="space-y-2">
                  <Label htmlFor="catchUpLabel">Period Label (optional)</Label>
                  <Input
                    id="catchUpLabel"
                    type="text"
                    placeholder="e.g., Opening Balance 2024-2025"
                    value={catchUpLabel}
                    onChange={(e) => setCatchUpLabel(e.target.value)}
                  />
                </div>

                {/* Catch-up End Date */}
                <div className="space-y-2">
                  <Label htmlFor="catchUpEndDate">Include Transactions Through</Label>
                  <Input
                    id="catchUpEndDate"
                    type="date"
                    value={catchUpEndDate}
                    onChange={(e) => setCatchUpEndDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    All transactions up to this date will be included
                  </p>
                </div>

                {/* Catch-up Cutoff Date */}
                <div className="space-y-2">
                  <Label htmlFor="catchUpCutoffDate">Cutoff Date</Label>
                  <Input
                    id="catchUpCutoffDate"
                    type="date"
                    value={catchUpCutoffDate}
                    onChange={(e) => setCatchUpCutoffDate(e.target.value)}
                  />
                </div>

                {/* Preview */}
                {catchUpEndDate && (
                  <div className="rounded-lg bg-stone-50 dark:bg-stone-800/50 p-4 space-y-2 border">
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      {catchUpLabel || `Opening Balance (through ${formatDisplayDate(catchUpEndDate)})`}
                    </div>
                    <div className="text-sm text-stone-600 dark:text-stone-400">
                      All historical data → {formatDisplayDate(catchUpEndDate)}
                    </div>
                    {catchUpCutoffDate && (
                      <div className="text-xs text-stone-500 dark:text-stone-400">
                        Cutoff: {formatDisplayDate(catchUpCutoffDate)}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Period Exists Warning */}
            {periodExists && !error && (
              <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-lg">
                A period for {periodDates.label} already exists. Please select a different month.
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (!isCatchUp && periodExists) || (isCatchUp && catchUpExists)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : isCatchUp ? (
                  'Create Catch-Up Period'
                ) : (
                  'Create Period'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

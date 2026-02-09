'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { Button } from '@clubvantage/ui';
import { Input } from '@clubvantage/ui';
import { Label } from '@clubvantage/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@clubvantage/ui';
import type { StatementPeriod } from '@/hooks/use-ar-statements';

export interface UpdatePeriodFormData {
  periodLabel?: string;
  periodStart?: string;
  periodEnd?: string;
  cutoffDate?: string;
}

interface EditPeriodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdatePeriodFormData) => Promise<void>;
  period: StatementPeriod | null;
  isSubmitting?: boolean;
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0] || '';
}

function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function EditPeriodModal({
  open,
  onOpenChange,
  onSubmit,
  period,
  isSubmitting = false,
}: EditPeriodModalProps) {
  // Form state
  const [periodLabel, setPeriodLabel] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [cutoffDate, setCutoffDate] = useState('');
  const [error, setError] = useState<string>();

  // Initialize form when period changes
  useEffect(() => {
    if (open && period) {
      setPeriodLabel(period.periodLabel);
      setPeriodStart(formatDateForInput(new Date(period.periodStart)));
      setPeriodEnd(formatDateForInput(new Date(period.periodEnd)));
      setCutoffDate(formatDateForInput(new Date(period.cutoffDate)));
      setError(undefined);
    }
  }, [open, period]);

  // Validation
  const validationError = useMemo(() => {
    if (!periodStart || !periodEnd || !cutoffDate) return null;

    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    const cutoff = new Date(cutoffDate);

    if (start >= end) {
      return 'Period start must be before period end';
    }
    if (cutoff < end) {
      return 'Cutoff date must be on or after period end';
    }
    return null;
  }, [periodStart, periodEnd, cutoffDate]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(undefined);

      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        await onSubmit({
          periodLabel,
          periodStart,
          periodEnd,
          cutoffDate,
        });
        onOpenChange(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update period');
      }
    },
    [periodLabel, periodStart, periodEnd, cutoffDate, validationError, onSubmit, onOpenChange]
  );

  if (!period) return null;

  const canEdit = period.status === 'OPEN' || period.status === 'REOPENED';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Edit Statement Period
          </DialogTitle>
          <DialogDescription>
            {canEdit
              ? 'Update the period dates and cutoff date.'
              : 'This period is closed. Reopen it first to make changes.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Period Label */}
          <div className="space-y-2">
            <Label htmlFor="periodLabel">Period Label</Label>
            <Input
              id="periodLabel"
              value={periodLabel}
              onChange={(e) => setPeriodLabel(e.target.value)}
              disabled={!canEdit || isSubmitting}
              placeholder="e.g., February 2026"
            />
          </div>

          {/* Period Start */}
          <div className="space-y-2">
            <Label htmlFor="periodStart">Period Start</Label>
            <Input
              id="periodStart"
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              disabled={!canEdit || isSubmitting}
            />
          </div>

          {/* Period End */}
          <div className="space-y-2">
            <Label htmlFor="periodEnd">Period End</Label>
            <Input
              id="periodEnd"
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              disabled={!canEdit || isSubmitting}
            />
          </div>

          {/* Cutoff Date */}
          <div className="space-y-2">
            <Label htmlFor="cutoffDate">Cutoff Date</Label>
            <Input
              id="cutoffDate"
              type="date"
              value={cutoffDate}
              onChange={(e) => setCutoffDate(e.target.value)}
              disabled={!canEdit || isSubmitting}
            />
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Transactions after this date will be included in the next period.
            </p>
          </div>

          {/* Error */}
          {(error || validationError) && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg">
              {error || validationError}
            </div>
          )}

          {/* Closed Warning */}
          {!canEdit && (
            <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-lg">
              This period is closed. Use &quot;Reopen Period&quot; to enable editing.
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
              disabled={isSubmitting || !canEdit || !!validationError}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { Loader2, PauseCircle, PlayCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Label,
  cn,
} from '@clubvantage/ui';

export interface BillingHoldModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  currentHold?: {
    reason: string;
    holdUntil: string | null;
  } | null;
  onPlaceHold: (reason: string, holdUntil: string | null) => Promise<void>;
  onRemoveHold: () => Promise<void>;
  isSubmitting?: boolean;
}

export function BillingHoldModal({
  open,
  onOpenChange,
  memberName,
  currentHold,
  onPlaceHold,
  onRemoveHold,
  isSubmitting = false,
}: BillingHoldModalProps) {
  const isOnHold = !!currentHold;
  const [reason, setReason] = useState(currentHold?.reason ?? '');
  const [holdUntil, setHoldUntil] = useState(currentHold?.holdUntil ?? '');

  const handleSubmit = useCallback(async () => {
    if (isOnHold) {
      await onRemoveHold();
    } else {
      await onPlaceHold(reason, holdUntil || null);
    }
    onOpenChange(false);
  }, [isOnHold, reason, holdUntil, onPlaceHold, onRemoveHold, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isOnHold ? (
              <PlayCircle className="h-5 w-5 text-emerald-500" />
            ) : (
              <PauseCircle className="h-5 w-5 text-amber-500" />
            )}
            {isOnHold ? 'Remove Billing Hold' : 'Place Billing Hold'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-3">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {isOnHold ? (
                <>Remove billing hold for <span className="font-medium text-stone-900 dark:text-stone-100">{memberName}</span>. Invoices will resume being generated.</>
              ) : (
                <>Place a billing hold on <span className="font-medium text-stone-900 dark:text-stone-100">{memberName}</span>. New invoices will not be generated while the hold is active. Payments can still be received.</>
              )}
            </p>
          </div>

          {isOnHold && currentHold && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 p-3 text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-300">Current hold</p>
              <p className="mt-1 text-amber-700 dark:text-amber-400">{currentHold.reason}</p>
              {currentHold.holdUntil && (
                <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-500">
                  Until: {new Date(currentHold.holdUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          )}

          {!isOnHold && (
            <>
              <div className="space-y-2">
                <Label htmlFor="hold-reason">Reason *</Label>
                <textarea
                  id="hold-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why is billing being placed on hold?"
                  rows={3}
                  className="flex w-full rounded-md border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hold-until">Hold until (optional)</Label>
                <input
                  id="hold-until"
                  type="date"
                  value={holdUntil}
                  onChange={(e) => setHoldUntil(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for an indefinite hold
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (!isOnHold && !reason.trim())}
            className={cn(
              isOnHold
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-500 hover:bg-amber-600',
              'text-white'
            )}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isOnHold ? 'Remove Hold' : 'Place Hold'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

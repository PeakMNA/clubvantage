'use client';

import { useState, useCallback } from 'react';
import { cn, Button } from '@clubvantage/ui';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

export interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  itemName?: string;
  itemType?: string;
  warningMessage?: string;
  className?: string;
}

/**
 * DeleteConfirmDialog
 *
 * A confirmation dialog for delete operations.
 * Shows a warning and requires explicit confirmation.
 */
export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item?',
  itemName,
  itemType = 'item',
  warningMessage,
  className,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [onConfirm, onClose]);

  const handleClose = useCallback(() => {
    if (!isDeleting) {
      onClose();
    }
  }, [isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-xl',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {itemName && (
              <p className="mt-1 text-sm text-muted-foreground">
                You are about to delete{' '}
                <span className="font-medium text-foreground">{itemName}</span>.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Warning */}
        {warningMessage ? (
          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            {warningMessage}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            This action cannot be undone. The {itemType} will be permanently removed.
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </div>
      </div>
    </>
  );
}

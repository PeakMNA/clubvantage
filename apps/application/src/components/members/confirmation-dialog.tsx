'use client';

import { useState } from 'react';
import { Loader2, AlertTriangle, Trash2, Ban, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@clubvantage/ui';
import { Button } from '@clubvantage/ui';
import { Input } from '@clubvantage/ui';
import { Label } from '@clubvantage/ui';
import { cn } from '@clubvantage/ui';

export type ConfirmationVariant = 'danger' | 'warning' | 'success' | 'info';

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  variant?: ConfirmationVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  onReasonChange?: (reason: string) => void;
}

const variantConfig: Record<ConfirmationVariant, {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  buttonVariant: 'destructive' | 'default' | 'outline';
}> = {
  danger: {
    icon: Trash2,
    iconColor: 'text-red-500',
    buttonVariant: 'destructive',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    buttonVariant: 'default',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    buttonVariant: 'default',
  },
  info: {
    icon: Ban,
    iconColor: 'text-muted-foreground',
    buttonVariant: 'default',
  },
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = 'warning',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  isLoading = false,
  requireReason = false,
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Enter a reason...',
  onReasonChange,
}: ConfirmationDialogProps) {
  const [reason, setReason] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      return;
    }

    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
      setReason('');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReasonChange = (value: string) => {
    setReason(value);
    onReasonChange?.(value);
  };

  const handleClose = () => {
    if (!isConfirming && !isLoading) {
      onOpenChange(false);
      setReason('');
    }
  };

  const loading = isConfirming || isLoading;
  const canConfirm = !requireReason || reason.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn('mt-0.5 shrink-0', config.iconColor)}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg">{title}</DialogTitle>
              <DialogDescription className="mt-2 text-muted-foreground">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {requireReason && (
          <div className="mt-4 space-y-2">
            <Label htmlFor="reason">{reasonLabel} *</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => handleReasonChange(e.target.value)}
              placeholder={reasonPlaceholder}
              disabled={loading}
            />
          </div>
        )}

        <DialogFooter className="mt-6 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={loading || !canConfirm}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Specialized confirmation dialogs for common actions

export interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  currentStatus: string;
  newStatus: string;
  onConfirm: (reason?: string) => void | Promise<void>;
  isLoading?: boolean;
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  memberName,
  currentStatus,
  newStatus,
  onConfirm,
  isLoading,
}: StatusChangeDialogProps) {
  const [reason, setReason] = useState('');

  const isSuspending = newStatus === 'SUSPENDED';
  const isCancelling = newStatus === 'CANCELLED';
  const requiresReason = isSuspending || isCancelling;

  const getVariant = (): ConfirmationVariant => {
    if (isCancelling) return 'danger';
    if (isSuspending) return 'warning';
    if (newStatus === 'ACTIVE') return 'success';
    return 'info';
  };

  const getDescription = () => {
    if (isSuspending) {
      return `This will suspend ${memberName}'s membership. They will lose access to club facilities until reactivated.`;
    }
    if (isCancelling) {
      return `This will permanently cancel ${memberName}'s membership. This action cannot be undone.`;
    }
    if (newStatus === 'ACTIVE') {
      return `This will reactivate ${memberName}'s membership and restore their access to club facilities.`;
    }
    return `Are you sure you want to change ${memberName}'s status from ${currentStatus} to ${newStatus}?`;
  };

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${newStatus === 'ACTIVE' ? 'Reactivate' : newStatus === 'SUSPENDED' ? 'Suspend' : newStatus === 'CANCELLED' ? 'Cancel' : 'Change'} Member`}
      description={getDescription()}
      variant={getVariant()}
      confirmLabel={newStatus === 'ACTIVE' ? 'Reactivate' : newStatus === 'SUSPENDED' ? 'Suspend' : newStatus === 'CANCELLED' ? 'Cancel Membership' : 'Confirm'}
      onConfirm={() => onConfirm(requiresReason ? reason : undefined)}
      isLoading={isLoading}
      requireReason={requiresReason}
      reasonLabel={isSuspending ? 'Suspension Reason' : 'Cancellation Reason'}
      reasonPlaceholder={isSuspending ? 'e.g., Non-payment of dues' : 'e.g., Member requested cancellation'}
      onReasonChange={setReason}
    />
  );
}

export interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: string;
  itemName: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemType,
  itemName,
  onConfirm,
  isLoading,
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${itemType}`}
      description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      variant="danger"
      confirmLabel="Delete"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}

export interface BulkActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: string;
  count: number;
  itemType: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  variant?: ConfirmationVariant;
}

export function BulkActionDialog({
  open,
  onOpenChange,
  action,
  count,
  itemType,
  onConfirm,
  isLoading,
  variant = 'warning',
}: BulkActionDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${action} ${count} ${itemType}${count > 1 ? 's' : ''}`}
      description={`Are you sure you want to ${action.toLowerCase()} ${count} selected ${itemType}${count > 1 ? 's' : ''}?`}
      variant={variant}
      confirmLabel={action}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}

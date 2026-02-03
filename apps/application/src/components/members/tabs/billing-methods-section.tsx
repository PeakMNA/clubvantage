'use client';

import { useState } from 'react';
import { cn, Button, Badge, Switch } from '@clubvantage/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@clubvantage/ui';
import {
  CreditCard,
  Plus,
  Trash2,
  Star,
  AlertCircle,
  RefreshCw,
  Building2,
} from 'lucide-react';
import type {
  StoredPaymentMethod,
  StoredPaymentMethodStatus,
} from '@clubvantage/api-client';

export interface BillingMethodsSectionProps {
  paymentMethods: StoredPaymentMethod[];
  onAddCard?: () => void;
  onRemoveCard?: (cardId: string) => void;
  onSetDefault?: (cardId: string) => void;
  onToggleAutoPay?: (cardId: string, enabled: boolean) => void;
}

// Card brand icons/colors mapping
const brandConfig: Record<
  string,
  { icon: string; color: string; bgColor: string }
> = {
  visa: {
    icon: 'Visa',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 dark:bg-blue-500/20',
  },
  mastercard: {
    icon: 'Mastercard',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-500/20',
  },
  amex: {
    icon: 'Amex',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50 dark:bg-sky-500/20',
  },
  discover: {
    icon: 'Discover',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-500/20',
  },
  jcb: {
    icon: 'JCB',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-500/20',
  },
  unionpay: {
    icon: 'UnionPay',
    color: 'text-red-700',
    bgColor: 'bg-red-50 dark:bg-red-500/20',
  },
  default: {
    icon: 'Card',
    color: 'text-stone-600',
    bgColor: 'bg-stone-100 dark:bg-stone-500/20',
  },
};

const statusConfig: Record<
  StoredPaymentMethodStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: 'Active',
    className:
      'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/30',
  },
  EXPIRED: {
    label: 'Expired',
    className:
      'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200/60 dark:border-red-500/30',
  },
  FAILED: {
    label: 'Failed',
    className:
      'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/30',
  },
  REMOVED: {
    label: 'Removed',
    className:
      'bg-stone-100 dark:bg-stone-500/20 text-stone-600 dark:text-stone-400 border-stone-200/60 dark:border-stone-500/30',
  },
};

function formatExpiry(month?: number | null, year?: number | null): string {
  if (!month || !year) return 'N/A';
  return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
}

function getBrandConfig(brand: string): { icon: string; color: string; bgColor: string } {
  const normalizedBrand = brand.toLowerCase().replace(/[^a-z]/g, '');
  const config = brandConfig[normalizedBrand as keyof typeof brandConfig];
  return config ?? {
    icon: 'Card',
    color: 'text-stone-600',
    bgColor: 'bg-stone-100 dark:bg-stone-500/20',
  };
}

interface PaymentMethodCardProps {
  method: StoredPaymentMethod;
  onRemove?: () => void;
  onSetDefault?: () => void;
  onToggleAutoPay?: (enabled: boolean) => void;
}

function PaymentMethodCard({
  method,
  onRemove,
  onSetDefault,
  onToggleAutoPay,
}: PaymentMethodCardProps) {
  const brand = getBrandConfig(method.brand);
  const status = statusConfig[method.status];
  const isExpired = method.status === 'EXPIRED';
  const isFailed = method.status === 'FAILED';
  const isActive = method.status === 'ACTIVE';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md sm:p-5',
        method.isDefault
          ? 'border-amber-200/60 dark:border-amber-500/30 ring-1 ring-amber-200/40'
          : 'border-border/60'
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Default indicator accent */}
      {method.isDefault && (
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-amber-400 to-amber-600" />
      )}

      <div className="relative flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Card brand icon */}
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-inner',
                brand.bgColor
              )}
            >
              {method.type === 'BANK_ACCOUNT' ? (
                <Building2 className={cn('h-6 w-6', brand.color)} />
              ) : (
                <CreditCard className={cn('h-6 w-6', brand.color)} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold capitalize text-foreground sm:text-base">
                  {method.brand}
                </span>
                <span className="font-mono text-sm text-muted-foreground">
                  **** {method.last4}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {method.isDefault && (
                  <Badge className="bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/30 text-[10px] font-medium">
                    <Star className="mr-1 h-3 w-3" />
                    Default
                  </Badge>
                )}
                <Badge className={cn('text-[10px] font-medium', status.className)}>
                  {status.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Remove button */}
          {isActive && onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Details row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {/* Expiry date */}
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Expires:</span>
              <span
                className={cn(
                  'font-medium',
                  isExpired ? 'text-red-600' : 'text-foreground'
                )}
              >
                {formatExpiry(method.expiryMonth, method.expiryYear)}
              </span>
            </div>

            {/* Cardholder name */}
            {method.cardholderName && (
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-foreground">
                  {method.cardholderName}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Set as default button */}
            {isActive && !method.isDefault && onSetDefault && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={onSetDefault}
              >
                Set as Default
              </Button>
            )}
          </div>
        </div>

        {/* Auto-pay toggle row */}
        {isActive && onToggleAutoPay && (
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Auto-Pay</span>
              <span className="text-xs text-muted-foreground">
                {method.isAutoPayEnabled
                  ? 'Automatically pay invoices'
                  : 'Manual payments only'}
              </span>
            </div>
            <Switch
              checked={method.isAutoPayEnabled}
              onCheckedChange={onToggleAutoPay}
            />
          </div>
        )}

        {/* Failure warning */}
        {isFailed && method.lastFailureReason && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50/80 dark:bg-amber-500/10 px-3 py-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                Last payment failed
              </p>
              <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                {method.lastFailureReason}
              </p>
            </div>
          </div>
        )}

        {/* Expired warning */}
        {isExpired && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50/80 dark:bg-red-500/10 px-3 py-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-xs font-medium text-red-800 dark:text-red-300">
                Card has expired
              </p>
              <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
                Please add a new payment method to continue using auto-pay.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function BillingMethodsSection({
  paymentMethods,
  onAddCard,
  onRemoveCard,
  onSetDefault,
  onToggleAutoPay,
}: BillingMethodsSectionProps) {
  const [cardToRemove, setCardToRemove] = useState<StoredPaymentMethod | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const activeCards = paymentMethods.filter((m) => m.status === 'ACTIVE');
  const expiredCards = paymentMethods.filter((m) => m.status === 'EXPIRED');
  const hasCards = paymentMethods.length > 0;

  const handleRemove = async () => {
    if (!cardToRemove || !onRemoveCard) return;

    setIsRemoving(true);
    try {
      await onRemoveCard(cardToRemove.id);
    } finally {
      setIsRemoving(false);
      setCardToRemove(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

        <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Payment Methods
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {activeCards.length} active card{activeCards.length !== 1 ? 's' : ''} on
                file
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={onAddCard}
            className="w-fit shadow-md transition-all hover:shadow-lg"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Add Payment Method</span>
            <span className="sm:hidden">Add Card</span>
          </Button>
        </div>
      </div>

      {/* Payment Methods List */}
      {hasCards ? (
        <div className="space-y-4">
          {/* Active cards */}
          {activeCards.length > 0 && (
            <div className="space-y-3">
              {activeCards.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  onRemove={() => setCardToRemove(method)}
                  onSetDefault={() => onSetDefault?.(method.id)}
                  onToggleAutoPay={(enabled) => onToggleAutoPay?.(method.id, enabled)}
                />
              ))}
            </div>
          )}

          {/* Expired cards section */}
          {expiredCards.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Expired Cards
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              {expiredCards.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  onRemove={() => setCardToRemove(method)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Empty state
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border bg-muted/50 p-8 text-center sm:p-12">
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">
              No Payment Methods
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Add a credit or debit card to enable auto-pay and make payments easier.
            </p>
            <Button size="sm" className="mt-5 shadow-md" onClick={onAddCard}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add First Card
            </Button>
          </div>
        </div>
      )}

      {/* Remove confirmation dialog */}
      <Dialog open={!!cardToRemove} onOpenChange={() => setCardToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this payment method?
            </DialogDescription>
          </DialogHeader>

          {cardToRemove && (
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium capitalize">
                  {cardToRemove.brand} **** {cardToRemove.last4}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires {formatExpiry(cardToRemove.expiryMonth, cardToRemove.expiryYear)}
                </p>
              </div>
            </div>
          )}

          {cardToRemove?.isDefault && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50/80 dark:bg-amber-500/10 px-3 py-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                This is your default payment method. Another card will become the default
                after removal.
              </p>
            </div>
          )}

          {cardToRemove?.isAutoPayEnabled && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50/80 dark:bg-amber-500/10 px-3 py-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Auto-pay is enabled on this card. Removing it will disable automatic
                payments.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCardToRemove(null)}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? 'Removing...' : 'Remove Card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, MoreVertical, Calendar, Building2 } from 'lucide-react';
import { cn } from '@clubvantage/ui';
import { Badge } from '@clubvantage/ui';
import { Button } from '@clubvantage/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@clubvantage/ui';
import type { Charge, ChargeStatus, ChargeType, RecurringFrequency, UsageType } from './types';

interface ChargeCardProps {
  charge: Charge;
  onEdit?: (charge: Charge) => void;
  onSuspend?: (charge: Charge) => void;
  onResume?: (charge: Charge) => void;
  onRemove?: (charge: Charge) => void;
  className?: string;
}

const statusDotColors: Record<ChargeStatus, string> = {
  ACTIVE: 'bg-emerald-500 shadow-emerald-500/30',
  SUSPENDED: 'bg-amber-500 shadow-amber-500/30',
  ENDED: 'bg-slate-400 shadow-slate-400/30',
};

const chargeTypeBadgeColors: Record<ChargeType, string> = {
  RECURRING: 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200/60 dark:border-blue-500/30',
  USAGE_BASED: 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-200/60 dark:border-purple-500/30',
};

const chargeTypeLabels: Record<ChargeType, string> = {
  RECURRING: 'Recurring',
  USAGE_BASED: 'Usage-Based',
};

const frequencyLabels: Record<RecurringFrequency, string> = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  SEMI_ANNUAL: 'Semi-Annual',
  ANNUAL: 'Annual',
};

const usageTypeLabels: Record<UsageType, string> = {
  PER_VISIT: 'Per Visit',
  PER_BOOKING: 'Per Booking',
  PER_HOUR: 'Per Hour',
  PER_SESSION: 'Per Session',
};

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

export function ChargeCard({
  charge,
  onEdit,
  onSuspend,
  onResume,
  onRemove,
  className,
}: ChargeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isEnded = charge.status === 'ENDED';
  const isSuspended = charge.status === 'SUSPENDED';

  const frequencyOrUsage =
    charge.chargeType === 'RECURRING' && charge.frequency
      ? frequencyLabels[charge.frequency]
      : charge.usageType
        ? usageTypeLabels[charge.usageType]
        : '';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border/60 bg-white/80 dark:bg-stone-900/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md',
        isEnded && 'opacity-60',
        className
      )}
    >
      {/* Subtle gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Collapsed View */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
        className="relative flex cursor-pointer items-center gap-3 p-3 sm:gap-4 sm:p-4"
      >
        {/* Status Dot */}
        <div
          className={cn(
            'h-2.5 w-2.5 shrink-0 rounded-full shadow-lg',
            statusDotColors[charge.status]
          )}
        />

        {/* Name & Type */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
          <span className="truncate text-sm font-semibold text-foreground sm:text-base">
            {charge.name}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              className={cn('shrink-0 text-[10px] font-medium', chargeTypeBadgeColors[charge.chargeType])}
            >
              {chargeTypeLabels[charge.chargeType]}
            </Badge>
            {charge.revenueCenterName && (
              <Badge variant="outline" className="shrink-0 border text-[10px] font-medium text-muted-foreground">
                {charge.revenueCenterName}
              </Badge>
            )}
          </div>
        </div>

        {/* Amount & Frequency */}
        <div className="shrink-0 text-right">
          <div className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {formatCurrency(charge.amount)}
          </div>
          {frequencyOrUsage && (
            <div className="text-[10px] font-medium text-muted-foreground sm:text-xs">{frequencyOrUsage}</div>
          )}
        </div>

        {/* Expand/Collapse + Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {/* Three-dot menu */}
          {!isEnded && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-muted-foreground group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="backdrop-blur-sm">
                <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit?.(charge)}>
                  Edit
                </DropdownMenuItem>
                {isSuspended ? (
                  <DropdownMenuItem className="cursor-pointer" onClick={() => onResume?.(charge)}>
                    Resume
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="cursor-pointer" onClick={() => onSuspend?.(charge)}>
                    Suspend
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onRemove?.(charge)}
                  className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="relative border-t border-slate-100 dark:border-stone-700 bg-muted/30 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
          {/* Description */}
          {charge.description && (
            <p className="text-sm text-muted-foreground">{charge.description}</p>
          )}

          {/* Details Grid */}
          <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Start Date</p>
                <p className="text-sm font-medium text-foreground">{formatDate(charge.startDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">End Date</p>
                <p className={cn(
                  'text-sm font-medium',
                  charge.endDate ? 'text-foreground' : 'text-emerald-600 dark:text-emerald-400'
                )}>
                  {charge.endDate ? formatDate(charge.endDate) : 'Ongoing'}
                </p>
              </div>
            </div>
            {charge.outletName && (
              <div className="flex items-center gap-2.5 sm:col-span-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Outlet</p>
                  <p className="text-sm font-medium text-foreground">{charge.outletName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Suspended Reason */}
          {isSuspended && charge.suspendedReason && (
            <div className="mt-3 rounded-xl bg-amber-50/80 dark:bg-amber-500/20 p-3 backdrop-blur-sm sm:mt-4">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300 sm:text-sm">
                <span className="font-semibold">Suspended:</span> {charge.suspendedReason}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

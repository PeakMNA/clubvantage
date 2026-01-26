'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full border font-medium',
  {
    variants: {
      variant: {
        // Tenant/General Status
        active: 'border-emerald-200 bg-emerald-100 text-emerald-800',
        pending: 'border-amber-200 bg-amber-100 text-amber-800',
        suspended: 'border-red-200 bg-red-100 text-red-800',
        archived: 'border-stone-200 bg-stone-100 text-stone-800',
        converted: 'border-blue-200 bg-blue-100 text-blue-800',

        // Subscription/Billing Status
        trial: 'border-amber-200 bg-amber-100 text-amber-800',
        past_due: 'border-red-200 bg-red-100 text-red-800',
        cancelled: 'border-stone-200 bg-stone-100 text-stone-800',
        expired: 'border-stone-200 bg-stone-100 text-stone-800',

        // Feature/Roadmap Status
        considering: 'border-stone-200 bg-stone-100 text-stone-800',
        planned: 'border-blue-200 bg-blue-100 text-blue-800',
        in_progress: 'border-amber-200 bg-amber-100 text-amber-800',
        completed: 'border-emerald-200 bg-emerald-100 text-emerald-800',

        // Review Status
        approved: 'border-emerald-200 bg-emerald-100 text-emerald-800',
        rejected: 'border-red-200 bg-red-100 text-red-800',

        // Default
        default: 'border-slate-200 bg-slate-100 text-slate-800',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-[11px] uppercase tracking-wide',
        md: 'px-2 py-0.5 text-xs capitalize',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Human-readable labels for status values
const statusLabels: Record<string, string> = {
  active: 'Active',
  pending: 'Pending',
  suspended: 'Suspended',
  archived: 'Archived',
  converted: 'Converted',
  trial: 'Trial',
  past_due: 'Past Due',
  cancelled: 'Cancelled',
  expired: 'Expired',
  considering: 'Considering',
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  approved: 'Approved',
  rejected: 'Rejected',
  default: 'Unknown',
};

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: string;
  label?: string; // Override the default label
}

export function StatusBadge({
  status,
  label,
  size,
  className,
  ...props
}: StatusBadgeProps) {
  // Determine the variant based on status
  const variant = (status in statusLabels ? status : 'default') as any;

  // Get the display label
  const displayLabel = label || statusLabels[status] || status;

  return (
    <span
      className={cn(statusBadgeVariants({ variant, size, className }))}
      role="status"
      {...props}
    >
      <span className="sr-only">Status: </span>
      {displayLabel}
    </span>
  );
}

// Tier Badge for subscription tiers
const tierBadgeVariants = cva(
  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
  {
    variants: {
      tier: {
        starter: 'border-slate-200 bg-slate-100 text-slate-700',
        professional: 'border-blue-200 bg-blue-100 text-blue-700',
        enterprise: 'border-purple-200 bg-purple-100 text-purple-700',
      },
    },
    defaultVariants: {
      tier: 'starter',
    },
  }
);

export interface TierBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tierBadgeVariants> {}

export function TierBadge({ tier, className, ...props }: TierBadgeProps) {
  const label = tier === 'professional' ? 'Pro' : tier;

  return (
    <span
      className={cn(tierBadgeVariants({ tier, className }))}
      {...props}
    >
      {label}
    </span>
  );
}

// Region Badge for country codes
export function RegionBadge({
  region,
  className,
}: {
  region: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center h-5 w-8 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600',
        className
      )}
    >
      {region}
    </span>
  );
}

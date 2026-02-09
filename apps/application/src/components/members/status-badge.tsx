'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import {
  Check,
  Clock,
  Pause,
  Minus,
  X,
  ArrowUp,
  Eye,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@clubvantage/ui';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full font-semibold',
  {
    variants: {
      size: {
        sm: 'h-5 px-2 text-xs gap-1',
        md: 'h-6 px-3 text-sm gap-1.5',
      },
      status: {
        // Member/General statuses (canonical)
        active: 'bg-emerald-500 text-white',
        prospect: 'bg-amber-500 text-white',
        lead: 'bg-amber-500 text-white',
        applicant: 'bg-amber-500 text-white',
        suspended: 'bg-red-500 text-white',
        lapsed: 'bg-stone-100 text-stone-600',
        resigned: 'bg-stone-100 text-stone-500',
        terminated: 'bg-stone-100 text-stone-500',
        reactivated: 'bg-emerald-500 text-white',
        // Application-specific statuses
        submitted: 'bg-blue-500 text-white',
        under_review: 'bg-amber-500 text-white',
        pending_board: 'bg-purple-500 text-white',
        approved: 'bg-emerald-500 text-white',
        rejected: 'bg-red-500 text-white',
        withdrawn: 'bg-muted text-muted-foreground',
        // Contract statuses
        expired: 'bg-muted text-muted-foreground',
        // Charge statuses
        ended: 'bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      size: 'sm',
      status: 'active',
    },
  }
);

type StatusType = NonNullable<VariantProps<typeof statusBadgeVariants>['status']>;

export interface StatusBadgeProps
  extends Omit<VariantProps<typeof statusBadgeVariants>, 'status'> {
  status: StatusType;
  variant?: 'member' | 'application' | 'contract' | 'charge' | 'dependent';
  showIcon?: boolean;
  className?: string;
}

const statusLabels: Record<StatusType, string> = {
  active: 'Active',
  prospect: 'Prospect',
  lead: 'Lead',
  applicant: 'Applicant',
  suspended: 'Suspended',
  lapsed: 'Lapsed',
  resigned: 'Resigned',
  terminated: 'Terminated',
  reactivated: 'Reactivated',
  submitted: 'Submitted',
  under_review: 'Under Review',
  pending_board: 'Pending Board',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  expired: 'Expired',
  ended: 'Ended',
};

const statusIcons: Partial<Record<StatusType, React.ComponentType<{ className?: string }>>> = {
  active: Check,
  prospect: Clock,
  lead: Clock,
  applicant: Clock,
  suspended: Pause,
  lapsed: Minus,
  resigned: ArrowLeft,
  terminated: X,
  reactivated: Check,
  submitted: ArrowUp,
  under_review: Eye,
  pending_board: Users,
  approved: Check,
  rejected: X,
  withdrawn: ArrowLeft,
};

export function StatusBadge({
  status,
  variant = 'member',
  size = 'sm',
  showIcon = false,
  className,
}: StatusBadgeProps) {
  const Icon = showIcon ? statusIcons[status] : null;
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <span className={cn(statusBadgeVariants({ status, size }), className)}>
      {Icon && <Icon className={iconSize} />}
      {statusLabels[status]}
    </span>
  );
}

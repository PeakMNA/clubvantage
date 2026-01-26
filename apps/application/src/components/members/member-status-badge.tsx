'use client';

import { cn } from '@clubvantage/ui';
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
  AlertTriangle,
} from 'lucide-react';
import {
  MemberStatus,
  ApplicationStatus,
  ContractStatus,
  ChargeStatus,
  DocumentStatus,
} from './types';

const memberStatusBadgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-semibold',
  {
    variants: {
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
      },
      status: {
        // Member statuses
        ACTIVE: 'bg-emerald-500 text-white',
        PENDING: 'bg-amber-500 text-white',
        SUSPENDED: 'bg-red-500 text-white',
        INACTIVE: 'bg-muted text-muted-foreground',
        CANCELLED: 'bg-muted text-muted-foreground',

        // Application statuses
        SUBMITTED: 'bg-blue-500 text-white',
        UNDER_REVIEW: 'bg-amber-500 text-white',
        PENDING_BOARD: 'bg-purple-500 text-white',
        APPROVED: 'bg-emerald-500 text-white',
        REJECTED: 'bg-red-500 text-white',
        WITHDRAWN: 'bg-muted text-muted-foreground',

        // Contract statuses
        EXPIRED: 'bg-muted text-muted-foreground',

        // Charge statuses
        ENDED: 'bg-muted text-muted-foreground',

        // Document statuses
        VERIFIED: 'bg-emerald-500 text-white',
      },
    },
    defaultVariants: {
      size: 'sm',
      status: 'ACTIVE',
    },
  }
);

type AllStatuses =
  | MemberStatus
  | ApplicationStatus
  | ContractStatus
  | ChargeStatus
  | DocumentStatus;

export interface MemberStatusBadgeProps
  extends Omit<VariantProps<typeof memberStatusBadgeVariants>, 'status'> {
  status: AllStatuses;
  showIcon?: boolean;
  className?: string;
}

const statusLabels: Record<AllStatuses, string> = {
  // Member statuses
  ACTIVE: 'Active',
  PENDING: 'Pending',
  SUSPENDED: 'Suspended',
  INACTIVE: 'Inactive',
  CANCELLED: 'Cancelled',
  // Application statuses
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  PENDING_BOARD: 'Pending Board',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
  // Contract statuses
  EXPIRED: 'Expired',
  // Charge statuses
  ENDED: 'Ended',
  // Document statuses
  VERIFIED: 'Verified',
};

const statusIcons: Partial<Record<AllStatuses, React.ComponentType<{ className?: string }>>> = {
  ACTIVE: Check,
  PENDING: Clock,
  SUSPENDED: Pause,
  INACTIVE: Minus,
  CANCELLED: X,
  SUBMITTED: ArrowUp,
  UNDER_REVIEW: Eye,
  PENDING_BOARD: Users,
  APPROVED: Check,
  REJECTED: X,
  WITHDRAWN: ArrowLeft,
  VERIFIED: Check,
  EXPIRED: AlertTriangle,
  ENDED: Minus,
};

export function MemberStatusBadge({
  status,
  size = 'sm',
  showIcon = false,
  className,
}: MemberStatusBadgeProps) {
  const Icon = statusIcons[status];
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <span className={cn(memberStatusBadgeVariants({ status, size }), className)}>
      {showIcon && Icon && <Icon className={iconSize} />}
      {statusLabels[status]}
    </span>
  );
}

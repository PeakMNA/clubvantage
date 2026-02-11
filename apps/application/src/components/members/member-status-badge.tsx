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
import { useTranslations } from 'next-intl';
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
        // Member statuses (canonical)
        PROSPECT: 'bg-amber-500 text-white',
        LEAD: 'bg-amber-500 text-white',
        APPLICANT: 'bg-amber-500 text-white',
        ACTIVE: 'bg-emerald-500 text-white',
        SUSPENDED: 'bg-red-500 text-white',
        LAPSED: 'bg-stone-100 text-stone-600',
        RESIGNED: 'bg-stone-100 text-stone-500',
        TERMINATED: 'bg-stone-100 text-stone-500',
        REACTIVATED: 'bg-emerald-500 text-white',

        // Application statuses
        SUBMITTED: 'bg-blue-500 text-white',
        UNDER_REVIEW: 'bg-amber-500 text-white',
        PENDING_BOARD: 'bg-purple-500 text-white',
        APPROVED: 'bg-emerald-500 text-white',
        REJECTED: 'bg-red-500 text-white',
        WITHDRAWN: 'bg-muted text-muted-foreground',

        // Contract statuses
        EXPIRED: 'bg-muted text-muted-foreground',
        CANCELLED: 'bg-stone-100 text-stone-500',

        // Charge statuses
        ENDED: 'bg-muted text-muted-foreground',

        // Document statuses
        PENDING: 'bg-amber-500 text-white',
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
  // Member statuses (canonical)
  PROSPECT: 'Prospect',
  LEAD: 'Lead',
  APPLICANT: 'Applicant',
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  LAPSED: 'Lapsed',
  RESIGNED: 'Resigned',
  TERMINATED: 'Terminated',
  REACTIVATED: 'Reactivated',
  // Application statuses
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  PENDING_BOARD: 'Pending Board',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
  // Contract statuses
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  // Charge statuses
  ENDED: 'Ended',
  // Document statuses
  PENDING: 'Pending',
  VERIFIED: 'Verified',
};

const statusIcons: Partial<Record<AllStatuses, React.ComponentType<{ className?: string }>>> = {
  PROSPECT: Clock,
  LEAD: Clock,
  APPLICANT: Clock,
  ACTIVE: Check,
  SUSPENDED: Pause,
  LAPSED: Minus,
  RESIGNED: ArrowLeft,
  TERMINATED: X,
  REACTIVATED: Check,
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

/**
 * Checks if a status value is a MemberStatus (for i18n lookup).
 * MemberStatus values match the keys in the 'memberStatus' i18n namespace.
 */
function isMemberStatus(status: string): status is MemberStatus {
  return status in MemberStatus;
}

export function MemberStatusBadge({
  status,
  size = 'sm',
  showIcon = false,
  className,
}: MemberStatusBadgeProps) {
  const t = useTranslations('memberStatus');
  const Icon = statusIcons[status];
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  // Use i18n translation for MemberStatus values, fallback to hardcoded labels for others
  const label = isMemberStatus(status) ? t(status) : statusLabels[status];

  return (
    <span className={cn(memberStatusBadgeVariants({ status, size }), className)}>
      {showIcon && Icon && <Icon className={iconSize} />}
      {label}
    </span>
  );
}

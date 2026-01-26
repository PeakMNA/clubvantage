import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      status: {
        // Member statuses
        ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        SUSPENDED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        LAPSED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        PROSPECT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        LEAD: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        APPLICANT: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
        RESIGNED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        TERMINATED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        REACTIVATED: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',

        // Invoice statuses
        DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        SENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        PARTIALLY_PAID: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        VOID: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        CANCELLED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',

        // Booking statuses
        PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        CONFIRMED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        CHECKED_IN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        COMPLETED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        NO_SHOW: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',

        // Lead stages
        NEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        CONTACTED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        QUALIFIED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
        CONVERTED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        LOST: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
    },
    defaultVariants: {
      status: 'ACTIVE',
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  /** Display text (defaults to status value) */
  label?: string;
  /** Show dot indicator */
  showDot?: boolean;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, label, showDot = false, ...props }, ref) => {
    const displayLabel = label || (status ? status.replace(/_/g, ' ') : '');

    return (
      <span
        ref={ref}
        className={cn(statusBadgeVariants({ status }), className)}
        {...props}
      >
        {showDot && (
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
        )}
        {displayLabel}
      </span>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

export { StatusBadge, statusBadgeVariants };

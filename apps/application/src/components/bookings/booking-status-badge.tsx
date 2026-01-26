'use client';

import { cn } from '@clubvantage/ui';
import type { BookingStatus } from './types';
import { getBookingStatusStyles } from './booking-status-utils';

interface BookingStatusBadgeProps {
  status: BookingStatus;
  /** Show the status dot indicator */
  showDot?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
}

/**
 * BookingStatusBadge
 *
 * Displays a booking status with optional dot indicator.
 * Fully supports light and dark mode with semantic colors.
 */
export function BookingStatusBadge({
  status,
  showDot = true,
  size = 'md',
  className,
}: BookingStatusBadgeProps) {
  const styles = getBookingStatusStyles(status);

  const sizeClasses = {
    sm: 'h-5 px-2 text-xs gap-1',
    md: 'h-6 px-2.5 text-xs gap-1.5',
    lg: 'h-7 px-3 text-sm gap-2',
  };

  const dotSizeClasses = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        styles.container,
        className
      )}
    >
      {showDot && (
        <span
          className={cn('rounded-full shrink-0', dotSizeClasses[size], styles.dot)}
          aria-hidden="true"
        />
      )}
      <span className={cn('truncate', styles.text)}>{styles.label}</span>
    </span>
  );
}

/**
 * BookingStatusDot
 *
 * Standalone dot indicator for compact displays (calendars, grids).
 * Shows just the colored dot with optional tooltip.
 */
interface BookingStatusDotProps {
  status: BookingStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BookingStatusDot({
  status,
  size = 'md',
  className,
}: BookingStatusDotProps) {
  const styles = getBookingStatusStyles(status);

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  return (
    <span
      className={cn('rounded-full shrink-0', sizeClasses[size], styles.dot, className)}
      title={styles.label}
      aria-label={styles.label}
    />
  );
}

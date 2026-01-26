import type { BookingStatus, BookingStatusConfig } from './types';

/**
 * Booking Status Configuration
 *
 * Defines visual styling for each booking status with full light/dark mode support.
 * Uses CSS variables from the design system for semantic colors.
 */
export const bookingStatusConfig: Record<BookingStatus, BookingStatusConfig> = {
  available: {
    label: 'Available',
    bgColor: 'bg-card',
    borderColor: 'border-border',
    textColor: 'text-foreground',
    dotColor: 'bg-muted-foreground',
  },
  confirmed: {
    label: 'Confirmed',
    bgColor: 'bg-blue-100 dark:bg-blue-500/20',
    borderColor: 'border-blue-200 dark:border-blue-500/30',
    textColor: 'text-blue-700 dark:text-blue-400',
    dotColor: 'bg-blue-500 dark:bg-blue-400',
  },
  checked_in: {
    label: 'Checked In',
    bgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
    borderColor: 'border-emerald-200 dark:border-emerald-500/30',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    dotColor: 'bg-emerald-500 dark:bg-emerald-400',
  },
  in_progress: {
    label: 'In Progress',
    bgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
    borderColor: 'border-emerald-200 dark:border-emerald-500/30',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    dotColor: 'bg-emerald-500 dark:bg-emerald-400',
    pulse: true,
  },
  completed: {
    label: 'Completed',
    bgColor: 'bg-muted',
    borderColor: 'border-border',
    textColor: 'text-muted-foreground',
    dotColor: 'bg-muted-foreground',
  },
  no_show: {
    label: 'No Show',
    bgColor: 'bg-red-100 dark:bg-red-500/20',
    borderColor: 'border-red-200 dark:border-red-500/30',
    textColor: 'text-red-700 dark:text-red-400',
    dotColor: 'bg-red-500 dark:bg-red-400',
  },
  cancelled: {
    label: 'Cancelled',
    bgColor: 'bg-muted',
    borderColor: 'border-border',
    textColor: 'text-muted-foreground',
    dotColor: 'bg-muted-foreground',
    strikethrough: true,
  },
  maintenance: {
    label: 'Maintenance',
    bgColor: 'bg-amber-50 dark:bg-amber-500/10',
    borderColor: 'border-amber-200 dark:border-amber-500/30',
    textColor: 'text-amber-700 dark:text-amber-400',
    dotColor: 'bg-amber-500 dark:bg-amber-400',
    stripes: true,
  },
  outside_hours: {
    label: 'Outside Hours',
    bgColor: 'bg-muted/50',
    borderColor: '',
    textColor: 'text-muted-foreground',
    dotColor: 'bg-muted-foreground/50',
  },
};

/**
 * Get booking status styles as className strings
 *
 * @param status - The booking status
 * @returns Object with className strings for each style category
 */
export function getBookingStatusStyles(status: BookingStatus): {
  container: string;
  text: string;
  dot: string;
  label: string;
  config: BookingStatusConfig;
} {
  const config = bookingStatusConfig[status];

  const containerClasses = [
    config.bgColor,
    config.borderColor ? `border ${config.borderColor}` : '',
    config.stripes ? 'booking-status-stripes' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const textClasses = [
    config.textColor,
    config.strikethrough ? 'line-through' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const dotClasses = [config.dotColor, config.pulse ? 'animate-pulse' : '']
    .filter(Boolean)
    .join(' ');

  return {
    container: containerClasses,
    text: textClasses,
    dot: dotClasses,
    label: config.label,
    config,
  };
}

/**
 * Get just the label for a booking status
 */
export function getBookingStatusLabel(status: BookingStatus): string {
  return bookingStatusConfig[status].label;
}

/**
 * Check if a booking status indicates an active/ongoing booking
 */
export function isActiveBookingStatus(status: BookingStatus): boolean {
  return ['confirmed', 'checked_in', 'in_progress'].includes(status);
}

/**
 * Check if a booking status indicates a terminal state
 */
export function isTerminalBookingStatus(status: BookingStatus): boolean {
  return ['completed', 'no_show', 'cancelled'].includes(status);
}

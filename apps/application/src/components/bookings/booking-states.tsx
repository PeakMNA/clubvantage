'use client';

import { cn, Button } from '@clubvantage/ui';
import {
  Calendar,
  Search,
  Building2,
  Sparkles,
  Users,
  Package,
  Clock,
  AlertCircle,
  WifiOff,
  RefreshCw,
  CalendarX,
  UserX,
  ServerCrash,
  FileQuestion,
} from 'lucide-react';

// ============================================================================
// EMPTY STATES
// ============================================================================

type EmptyStateVariant =
  | 'no-bookings'
  | 'no-results'
  | 'no-facilities'
  | 'no-services'
  | 'no-staff'
  | 'no-equipment'
  | 'no-waitlist'
  | 'no-data';

interface EmptyStateConfig {
  icon: typeof Calendar;
  title: string;
  description: string;
}

const emptyStateConfig: Record<EmptyStateVariant, EmptyStateConfig> = {
  'no-bookings': {
    icon: CalendarX,
    title: 'No bookings today',
    description: 'There are no bookings scheduled for this date',
  },
  'no-results': {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filters',
  },
  'no-facilities': {
    icon: Building2,
    title: 'No facilities found',
    description: 'No facilities match your current filters',
  },
  'no-services': {
    icon: Sparkles,
    title: 'No services found',
    description: 'No services match your current filters',
  },
  'no-staff': {
    icon: UserX,
    title: 'No staff found',
    description: 'No staff members match your current filters',
  },
  'no-equipment': {
    icon: Package,
    title: 'No equipment found',
    description: 'No equipment matches your current filters',
  },
  'no-waitlist': {
    icon: Users,
    title: 'No waitlist entries',
    description: 'Members will appear here when they join a waitlist',
  },
  'no-data': {
    icon: FileQuestion,
    title: 'No data available',
    description: 'There is nothing to display at the moment',
  },
};

export interface BookingEmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: typeof Calendar;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * BookingEmptyState
 *
 * Displays a centered message when there's no content to show.
 */
export function BookingEmptyState({
  variant = 'no-data',
  title,
  description,
  icon,
  action,
  className,
}: BookingEmptyStateProps) {
  const config = emptyStateConfig[variant];
  const Icon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-base font-medium text-foreground">{displayTitle}</h3>
      <p className="mb-4 max-w-xs text-sm text-muted-foreground">{displayDescription}</p>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// LOADING STATES
// ============================================================================

export interface BookingLoadingSkeletonProps {
  className?: string;
}

/**
 * BookingCardSkeleton
 *
 * Loading placeholder for a single booking card.
 */
export function BookingCardSkeleton({ className }: BookingLoadingSkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg border border-border bg-card p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Time/Icon placeholder */}
        <div className="h-12 w-16 rounded-lg bg-muted" />
        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
          <div className="h-3 w-2/3 rounded bg-muted" />
        </div>
        {/* Action placeholder */}
        <div className="h-8 w-20 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

/**
 * BookingListSkeleton
 *
 * Loading placeholder for a list of booking cards.
 */
export function BookingListSkeleton({
  count = 5,
  className,
}: BookingLoadingSkeletonProps & { count?: number }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <BookingCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * BookingGridSkeleton
 *
 * Loading placeholder for a grid of cards (facilities, services, etc.).
 */
export function BookingGridSkeleton({
  count = 8,
  className,
}: BookingLoadingSkeletonProps & { count?: number }) {
  return (
    <div
      className={cn(
        'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-border bg-card p-4"
        >
          {/* Icon */}
          <div className="mb-3 h-12 w-12 rounded-lg bg-muted" />
          {/* Title */}
          <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
          {/* Subtitle */}
          <div className="mb-3 h-3 w-1/2 rounded bg-muted" />
          {/* Badges */}
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded-full bg-muted" />
            <div className="h-5 w-12 rounded-full bg-muted" />
          </div>
          {/* Details */}
          <div className="mt-3 space-y-1.5">
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * CalendarDaySkeleton
 *
 * Loading placeholder for the calendar day view.
 */
export function CalendarDaySkeleton({ className }: BookingLoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      {/* Header */}
      <div className="mb-4 flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-muted" />
        <div className="h-6 w-40 rounded bg-muted" />
        <div className="ml-auto flex gap-2">
          <div className="h-8 w-16 rounded-lg bg-muted" />
          <div className="h-8 w-20 rounded-lg bg-muted" />
        </div>
      </div>

      {/* Grid Header */}
      <div className="mb-2 flex border-b border-border pb-2">
        <div className="w-20 shrink-0">
          <div className="h-4 w-12 rounded bg-muted" />
        </div>
        <div className="flex flex-1 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1">
              <div className="h-4 w-full rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Time Rows */}
      <div className="space-y-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex h-11 border-b border-border">
            <div className="flex w-20 shrink-0 items-center">
              <div className="h-3 w-12 rounded bg-muted" />
            </div>
            <div className="flex flex-1 gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex-1 border-l border-border" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * BookingDetailSkeleton
 *
 * Loading placeholder for the booking detail panel.
 */
export function BookingDetailSkeleton({ className }: BookingLoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse p-4', className)}>
      {/* Header */}
      <div className="mb-6 flex items-start gap-3">
        <div className="h-12 w-12 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
        </div>
        <div className="h-6 w-20 rounded-full bg-muted" />
      </div>

      {/* Sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mb-6">
          <div className="mb-3 h-4 w-24 rounded bg-muted" />
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-muted" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="mt-6 flex gap-2">
        <div className="h-10 flex-1 rounded-lg bg-muted" />
        <div className="h-10 flex-1 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

/**
 * BookingPageSkeleton
 *
 * Full page loading placeholder.
 */
export function BookingPageSkeleton({ className }: BookingLoadingSkeletonProps) {
  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-7 w-32 rounded bg-muted" />
            <div className="h-9 w-28 rounded-lg bg-muted" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 w-20 rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4 sm:p-6">
        <BookingGridSkeleton count={8} />
      </div>
    </div>
  );
}

// ============================================================================
// ERROR STATES
// ============================================================================

type ErrorStateVariant = 'load-failed' | 'connection' | 'server' | 'not-found';

interface ErrorStateConfig {
  icon: typeof AlertCircle;
  title: string;
  description: string;
}

const errorStateConfig: Record<ErrorStateVariant, ErrorStateConfig> = {
  'load-failed': {
    icon: AlertCircle,
    title: 'Failed to load',
    description: 'Something went wrong while loading the data',
  },
  'connection': {
    icon: WifiOff,
    title: 'Connection error',
    description: 'Please check your internet connection and try again',
  },
  'server': {
    icon: ServerCrash,
    title: 'Server error',
    description: 'Our servers are experiencing issues. Please try again later',
  },
  'not-found': {
    icon: FileQuestion,
    title: 'Not found',
    description: 'The requested resource could not be found',
  },
};

export interface BookingErrorStateProps {
  variant?: ErrorStateVariant;
  title?: string;
  description?: string;
  error?: Error | string;
  onRetry?: () => void;
  className?: string;
}

/**
 * BookingErrorState
 *
 * Displays an error message with optional retry action.
 */
export function BookingErrorState({
  variant = 'load-failed',
  title,
  description,
  error,
  onRetry,
  className,
}: BookingErrorStateProps) {
  const config = errorStateConfig[variant];
  const Icon = config.icon;
  const displayTitle = title || config.title;
  const displayDescription =
    description || (typeof error === 'string' ? error : error?.message) || config.description;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
        <Icon className="h-7 w-7 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="mb-1 text-base font-medium text-foreground">{displayTitle}</h3>
      <p className="mb-4 max-w-xs text-sm text-muted-foreground">{displayDescription}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

/**
 * BookingInlineError
 *
 * Compact inline error message for smaller contexts.
 */
export function BookingInlineError({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/30 dark:bg-red-500/10',
        className
      )}
    >
      <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
      <p className="flex-1 text-sm text-red-700 dark:text-red-400">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 text-sm font-medium text-red-700 underline hover:no-underline dark:text-red-400"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ============================================================================
// COMBINED LOADING/ERROR WRAPPER
// ============================================================================

export interface BookingDataStateProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | string;
  isEmpty?: boolean;
  emptyVariant?: EmptyStateVariant;
  onRetry?: () => void;
  loadingSkeleton?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * BookingDataState
 *
 * Wrapper component that handles loading, error, and empty states.
 */
export function BookingDataState({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyVariant = 'no-data',
  onRetry,
  loadingSkeleton,
  children,
  className,
}: BookingDataStateProps) {
  if (isLoading) {
    return <>{loadingSkeleton || <BookingListSkeleton className={className} />}</>;
  }

  if (isError) {
    return <BookingErrorState error={error} onRetry={onRetry} className={className} />;
  }

  if (isEmpty) {
    return <BookingEmptyState variant={emptyVariant} className={className} />;
  }

  return <>{children}</>;
}

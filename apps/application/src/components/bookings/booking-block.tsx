'use client';

import { forwardRef } from 'react';
import { cn } from '@clubvantage/ui';
import type { BookingStatus } from './types';
import { getBookingStatusStyles } from './booking-status-utils';

export interface BookingBlockProps {
  id: string;
  serviceName: string;
  memberName: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  staffName?: string;
  facilityName?: string;
  onClick?: () => void;
  onDragStart?: () => void;
  isSelected?: boolean;
  isDragging?: boolean;
  showTimeRange?: boolean;
  /** Height in slots (each slot = 44px). Auto-calculated from duration if not provided. */
  slotHeight?: number;
  className?: string;
}

/**
 * Status-specific left border colors
 */
const statusBorderColors: Record<BookingStatus, string> = {
  available: 'border-l-border',
  confirmed: 'border-l-blue-500',
  checked_in: 'border-l-emerald-500',
  in_progress: 'border-l-emerald-500',
  completed: 'border-l-muted-foreground/50',
  no_show: 'border-l-red-500',
  cancelled: 'border-l-muted-foreground/30',
  maintenance: 'border-l-amber-500',
  outside_hours: 'border-l-muted-foreground/20',
};

/**
 * BookingBlock
 *
 * A visual block representing a booking on the calendar grid.
 * Displays service name, member name, and time with status-based styling.
 */
export const BookingBlock = forwardRef<HTMLDivElement, BookingBlockProps>(
  (
    {
      id,
      serviceName,
      memberName,
      startTime,
      endTime,
      status,
      staffName,
      facilityName,
      onClick,
      onDragStart,
      isSelected = false,
      isDragging = false,
      showTimeRange = true,
      slotHeight = 1,
      className,
    },
    ref
  ) => {
    const styles = getBookingStatusStyles(status);
    const isCancelled = status === 'cancelled';
    const isCompleted = status === 'completed';
    const isPulsing = status === 'in_progress';

    // Calculate minimum height based on slots (44px per 15-min slot)
    const minHeight = slotHeight * 44;
    const showTime = showTimeRange && slotHeight >= 2;
    const showStaff = staffName && slotHeight >= 3;

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-label={`${serviceName} booking for ${memberName}, ${startTime} to ${endTime}, status: ${styles.label}`}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        onMouseDown={onDragStart}
        style={{ minHeight: `${minHeight}px` }}
        className={cn(
          // Base styles
          'group relative w-full rounded-md border-l-[3px] p-2 text-left transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1',
          // Status background
          styles.container,
          // Left border color
          statusBorderColors[status],
          // Interactive states
          !isCompleted && !isCancelled && 'cursor-grab hover:shadow-md',
          isCompleted && 'cursor-default',
          isCancelled && 'cursor-not-allowed',
          // Selected state
          isSelected && 'ring-2 ring-amber-500 ring-offset-1',
          // Dragging state
          isDragging && 'cursor-grabbing opacity-75 shadow-lg',
          className
        )}
      >
        {/* First line: Status dot + Service/Facility name */}
        <div className="flex items-center gap-1.5">
          {/* Status indicator dot */}
          <span
            className={cn(
              'h-2 w-2 shrink-0 rounded-full',
              styles.dot,
              isPulsing && 'animate-pulse'
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              'truncate text-sm font-medium leading-tight',
              styles.text,
              isCancelled && 'line-through'
            )}
          >
            {facilityName || serviceName}
          </span>
        </div>

        {/* Second line: Member name */}
        <p
          className={cn(
            'mt-0.5 truncate text-xs leading-tight',
            isCompleted || isCancelled
              ? 'text-muted-foreground/70'
              : 'text-muted-foreground',
            isCancelled && 'line-through'
          )}
        >
          {memberName}
        </p>

        {/* Third line: Time range (only if tall enough) */}
        {showTime && (
          <p
            className={cn(
              'mt-1 truncate text-xs leading-tight',
              isCompleted || isCancelled
                ? 'text-muted-foreground/50'
                : 'text-muted-foreground/80'
            )}
          >
            {startTime} – {endTime}
          </p>
        )}

        {/* Fourth line: Staff name (only if very tall) */}
        {showStaff && (
          <p className="mt-0.5 truncate text-xs leading-tight text-muted-foreground/60">
            with {staffName}
          </p>
        )}

        {/* Hover indicator - subtle shine effect */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 rounded-md bg-gradient-to-br from-white/0 to-white/0 transition-all duration-200',
            !isCompleted &&
              !isCancelled &&
              'group-hover:from-white/10 group-hover:to-transparent'
          )}
          aria-hidden="true"
        />
      </div>
    );
  }
);

BookingBlock.displayName = 'BookingBlock';

/**
 * BookingBlockPlaceholder
 *
 * A dotted outline placeholder shown where a booking was
 * before being dragged to a new position.
 */
interface BookingBlockPlaceholderProps {
  slotHeight?: number;
  className?: string;
}

export function BookingBlockPlaceholder({
  slotHeight = 1,
  className,
}: BookingBlockPlaceholderProps) {
  const minHeight = slotHeight * 44;

  return (
    <div
      style={{ minHeight: `${minHeight}px` }}
      className={cn(
        'w-full rounded-md border-2 border-dashed border-amber-400/50 bg-amber-50/30 dark:border-amber-500/30 dark:bg-amber-500/5',
        className
      )}
      aria-hidden="true"
    />
  );
}

/**
 * BookingBlockSkeleton
 *
 * Loading skeleton for booking blocks.
 */
interface BookingBlockSkeletonProps {
  slotHeight?: number;
  className?: string;
}

export function BookingBlockSkeleton({
  slotHeight = 1,
  className,
}: BookingBlockSkeletonProps) {
  const minHeight = slotHeight * 44;

  return (
    <div
      style={{ minHeight: `${minHeight}px` }}
      className={cn(
        'w-full animate-pulse rounded-md border-l-[3px] border-l-muted bg-muted/50 p-2',
        className
      )}
      aria-hidden="true"
    >
      <div className="flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full bg-muted" />
        <div className="h-3.5 w-3/4 rounded bg-muted" />
      </div>
      <div className="mt-1 h-3 w-1/2 rounded bg-muted/70" />
    </div>
  );
}

'use client';

import { forwardRef } from 'react';
import { cn } from '@clubvantage/ui';
import { Clock, Users } from 'lucide-react';

export type TimeSlotStatus = 'available' | 'unavailable' | 'full' | 'selected';

export interface TimeSlotButtonProps {
  time: string;
  status: TimeSlotStatus;
  waitlistCount?: number;
  unavailableReason?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * TimeSlotButton
 *
 * A button representing a bookable time slot in the booking creation flow.
 * Users click to select their preferred time from a grid of available times.
 */
export const TimeSlotButton = forwardRef<HTMLButtonElement, TimeSlotButtonProps>(
  (
    {
      time,
      status,
      waitlistCount = 0,
      unavailableReason,
      onClick,
      disabled = false,
      className,
    },
    ref
  ) => {
    const isAvailable = status === 'available';
    const isUnavailable = status === 'unavailable';
    const isFull = status === 'full';
    const isSelected = status === 'selected';

    const isClickable = !isUnavailable && !disabled;

    const handleClick = () => {
      if (isClickable) {
        onClick?.();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && isClickable) {
        e.preventDefault();
        onClick?.();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled || isUnavailable}
        title={isUnavailable ? unavailableReason : undefined}
        aria-label={`${time}${isUnavailable ? `, unavailable: ${unavailableReason}` : ''}${isFull ? `, full with ${waitlistCount} on waitlist` : ''}${isSelected ? ', selected' : ''}`}
        aria-pressed={isSelected}
        className={cn(
          // Base styles
          'group relative flex min-h-[44px] w-20 flex-col items-center justify-center rounded-lg border px-2 py-1.5 text-center transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
          // Available state
          isAvailable && [
            'border-border bg-card text-foreground',
            'hover:border-border hover:bg-muted/50',
            'active:scale-[0.98]',
            'cursor-pointer',
          ],
          // Selected state
          isSelected && [
            'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-500',
            'dark:bg-amber-500/10 dark:text-amber-400',
            'cursor-pointer',
          ],
          // Full state (can click to join waitlist)
          isFull && [
            'border-border bg-card text-foreground',
            'hover:border-amber-300 hover:bg-amber-50/50',
            'dark:hover:border-amber-500/50 dark:hover:bg-amber-500/5',
            'cursor-pointer',
          ],
          // Unavailable state
          isUnavailable && [
            'time-slot-unavailable border-border/50 bg-muted/30 text-muted-foreground',
            'cursor-not-allowed',
          ],
          // Disabled state
          disabled && 'pointer-events-none opacity-50',
          className
        )}
      >
        {/* Time display */}
        <span
          className={cn(
            'text-sm font-semibold leading-tight',
            isSelected && 'text-amber-700 dark:text-amber-400',
            isUnavailable && 'text-muted-foreground'
          )}
        >
          {time}
        </span>

        {/* Secondary text */}
        <span
          className={cn(
            'mt-0.5 flex items-center gap-1 text-[10px] leading-tight',
            isAvailable && 'text-emerald-600 dark:text-emerald-400',
            isSelected && 'text-amber-600 dark:text-amber-400',
            isFull && 'text-muted-foreground',
            isUnavailable && 'text-muted-foreground/70'
          )}
        >
          {isAvailable && (
            <>
              <Clock className="h-2.5 w-2.5" />
              <span>Available</span>
            </>
          )}
          {isSelected && (
            <>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>Selected</span>
            </>
          )}
          {isFull && (
            <>
              <Users className="h-2.5 w-2.5" />
              <span>Full</span>
              {waitlistCount > 0 && (
                <span className="ml-0.5 rounded bg-muted px-1 text-[9px] font-medium">
                  +{waitlistCount}
                </span>
              )}
            </>
          )}
          {isUnavailable && <span>Blocked</span>}
        </span>

        {/* Hover shine effect for clickable states */}
        {isClickable && (
          <span
            className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-br from-white/0 to-white/0 transition-all duration-200 group-hover:from-white/5 group-hover:to-transparent"
            aria-hidden="true"
          />
        )}

        {/* Selected checkmark indicator */}
        {isSelected && (
          <span
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm"
            aria-hidden="true"
          >
            <svg
              className="h-2.5 w-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </span>
        )}
      </button>
    );
  }
);

TimeSlotButton.displayName = 'TimeSlotButton';

/**
 * TimeSlotButtonSkeleton
 *
 * Loading skeleton for time slot buttons.
 */
export function TimeSlotButtonSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-[44px] w-20 animate-pulse flex-col items-center justify-center rounded-lg border border-border bg-muted/30',
        className
      )}
      aria-hidden="true"
    >
      <div className="h-4 w-12 rounded bg-muted" />
      <div className="mt-1 h-2.5 w-10 rounded bg-muted/70" />
    </div>
  );
}

/**
 * TimeSlotGroup
 *
 * A labeled group of time slots (e.g., "Morning", "Afternoon").
 */
interface TimeSlotGroupProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function TimeSlotGroup({ label, children, className }: TimeSlotGroupProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </h4>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

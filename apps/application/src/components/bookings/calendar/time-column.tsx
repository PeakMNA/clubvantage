'use client';

import { useMemo } from 'react';
import { cn } from '@clubvantage/ui';

export interface TimeColumnProps {
  /** Starting hour (0-23, e.g., 6 for 6 AM) */
  startHour: number;
  /** Ending hour (0-23, e.g., 22 for 10 PM) */
  endHour: number;
  /** Height per 15-minute slot in pixels */
  slotHeight?: number;
  /** Width of the time column */
  width?: number;
  /** Show minutes (15, 30, 45) or just hours */
  showMinutes?: boolean;
  /** Use 24-hour format */
  use24Hour?: boolean;
  /** Additional class names */
  className?: string;
}

interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
  isHour: boolean;
}

/**
 * Format time for display
 */
function formatTime(
  hour: number,
  minute: number,
  use24Hour: boolean
): string {
  if (use24Hour) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  const h = hour % 12 || 12;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const m = minute.toString().padStart(2, '0');

  if (minute === 0) {
    return `${h} ${ampm}`;
  }
  return `${h}:${m}`;
}

/**
 * TimeColumn
 *
 * Fixed left column with time labels for the calendar grid.
 * Shows time labels at regular intervals (every hour by default,
 * with optional 15/30 minute marks).
 *
 * Design:
 * - Right-aligned labels
 * - Stone-500 text color
 * - Hour markers more prominent than minute markers
 */
export function TimeColumn({
  startHour,
  endHour,
  slotHeight = 44,
  width = 80,
  showMinutes = false,
  use24Hour = false,
  className,
}: TimeColumnProps) {
  // Generate time slots
  const timeSlots = useMemo((): TimeSlot[] => {
    const slots: TimeSlot[] = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === endHour && minute > 0) break;

        const isHour = minute === 0;
        const showLabel = isHour || showMinutes;

        slots.push({
          hour,
          minute,
          label: showLabel ? formatTime(hour, minute, use24Hour) : '',
          isHour,
        });
      }
    }

    return slots;
  }, [startHour, endHour, showMinutes, use24Hour]);

  return (
    <div
      className={cn(
        'sticky left-0 z-10 shrink-0 border-r border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900',
        className
      )}
      style={{ width }}
      role="presentation"
      aria-hidden="true"
    >
      {timeSlots.map((slot, index) => (
        <div
          key={`${slot.hour}-${slot.minute}`}
          className="relative flex items-start justify-end pr-3"
          style={{ height: slotHeight }}
        >
          {slot.label && (
            <span
              className={cn(
                'translate-y-[-0.5em] text-right leading-none',
                slot.isHour
                  ? 'text-xs font-medium text-stone-600 dark:text-stone-400'
                  : 'text-[10px] text-stone-400 dark:text-stone-500'
              )}
            >
              {slot.label}
            </span>
          )}

          {/* Tick mark for visual alignment */}
          <div
            className={cn(
              'absolute right-0 top-0 border-t',
              slot.isHour
                ? 'w-2 border-stone-300 dark:border-stone-600'
                : 'w-1 border-stone-200 dark:border-stone-700'
            )}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * TimeColumnCompact
 *
 * A more compact version showing only hour markers.
 * Suitable for mobile or tight layouts.
 */
export function TimeColumnCompact({
  startHour,
  endHour,
  slotHeight = 44,
  use24Hour = false,
  className,
}: Omit<TimeColumnProps, 'width' | 'showMinutes'>) {
  const hours = useMemo(() => {
    const h: { hour: number; label: string }[] = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      h.push({
        hour,
        label: formatTime(hour, 0, use24Hour),
      });
    }
    return h;
  }, [startHour, endHour, use24Hour]);

  return (
    <div
      className={cn(
        'sticky left-0 z-10 w-12 shrink-0 border-r border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900',
        className
      )}
      role="presentation"
      aria-hidden="true"
    >
      {hours.map((h) => (
        <div
          key={h.hour}
          className="flex items-start justify-end pr-2"
          style={{ height: slotHeight * 4 }} // 4 slots per hour
        >
          <span className="translate-y-[-0.4em] text-[10px] font-medium text-stone-500 dark:text-stone-400">
            {h.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * TimeColumnHeader
 *
 * Header cell for the time column (corner cell in grid).
 */
export function TimeColumnHeader({
  width = 80,
  className,
}: {
  width?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'sticky left-0 top-0 z-30 flex items-center justify-center border-b border-r border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800',
        className
      )}
      style={{ width }}
    >
      <span className="text-[10px] font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
        Time
      </span>
    </div>
  );
}

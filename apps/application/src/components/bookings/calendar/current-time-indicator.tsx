'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@clubvantage/ui';

export interface CurrentTimeIndicatorProps {
  /** Starting hour of the calendar (0-23) */
  startHour: number;
  /** Height per 15-minute slot in pixels */
  slotHeight?: number;
  /** Offset from left edge for the circle (time column width) */
  leftOffset?: number;
  /** Whether to show the time badge */
  showTimeBadge?: boolean;
  /** Update interval in milliseconds */
  updateInterval?: number;
  /** Date to show indicator for (must match to display) */
  date?: Date;
  /** Additional class names */
  className?: string;
}

/**
 * Format time for display (12-hour format)
 */
function formatTime(date: Date): string {
  const h = date.getHours() % 12 || 12;
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  return `${h}:${m} ${ampm}`;
}

/**
 * CurrentTimeIndicator
 *
 * A horizontal line showing the current time on the calendar.
 * Features:
 * - Red horizontal line spanning full width
 * - Small circle at the left edge
 * - Optional time badge showing current time
 * - Auto-updates position every minute
 */
export function CurrentTimeIndicator({
  startHour,
  slotHeight = 44,
  leftOffset = 80,
  showTimeBadge = true,
  updateInterval = 60000, // 1 minute
  date,
  className,
}: CurrentTimeIndicatorProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time at specified interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  // Calculate position based on current time
  const position = useMemo(() => {
    const now = currentTime;
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60;

    // Calculate offset from start of calendar
    const minutesFromStart = totalMinutes - startMinutes;
    const slotsFromStart = minutesFromStart / 15;
    const topOffset = slotsFromStart * slotHeight;

    return {
      top: topOffset,
      isVisible: minutesFromStart >= 0,
    };
  }, [currentTime, startHour, slotHeight]);

  // Check if the indicator should be visible for the given date
  const isToday = useMemo(() => {
    if (!date) return true; // If no date provided, assume today
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }, [date]);

  if (!position.isVisible || !isToday) {
    return null;
  }

  return (
    <div
      className={cn(
        'pointer-events-none absolute left-0 right-0 z-30 flex items-center',
        className
      )}
      style={{ top: position.top }}
      role="presentation"
      aria-label={`Current time: ${formatTime(currentTime)}`}
    >
      {/* Time badge (optional) */}
      {showTimeBadge && (
        <div
          className="sticky left-0 z-40 flex items-center justify-end pr-1"
          style={{ width: leftOffset }}
        >
          <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white shadow-sm">
            {formatTime(currentTime)}
          </span>
        </div>
      )}

      {/* Circle indicator at the left edge */}
      <div
        className="absolute z-40 h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm"
        style={{ left: leftOffset - 5 }}
        aria-hidden="true"
      />

      {/* Horizontal line */}
      <div
        className="h-0.5 flex-1 bg-red-500"
        style={{ marginLeft: showTimeBadge ? 0 : leftOffset }}
        aria-hidden="true"
      />

      {/* Subtle glow effect */}
      <div
        className="absolute inset-0 h-1 bg-red-500/20 blur-sm"
        style={{ marginLeft: leftOffset }}
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * CurrentTimeIndicatorMinimal
 *
 * A minimal version showing just the line without the badge.
 * Suitable for compact calendar views.
 */
export function CurrentTimeIndicatorMinimal({
  startHour,
  slotHeight = 44,
  date,
  className,
}: Omit<CurrentTimeIndicatorProps, 'leftOffset' | 'showTimeBadge'>) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const position = useMemo(() => {
    const now = currentTime;
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60;
    const minutesFromStart = totalMinutes - startMinutes;
    const slotsFromStart = minutesFromStart / 15;
    return {
      top: slotsFromStart * slotHeight,
      isVisible: minutesFromStart >= 0,
    };
  }, [currentTime, startHour, slotHeight]);

  const isToday = useMemo(() => {
    if (!date) return true;
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }, [date]);

  if (!position.isVisible || !isToday) {
    return null;
  }

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 z-20 flex items-center',
        className
      )}
      style={{ top: position.top }}
    >
      <div className="h-0.5 w-full bg-red-500" />
      <div className="absolute left-0 h-2 w-2 rounded-full bg-red-500" />
    </div>
  );
}

/**
 * useCurrentTimePosition
 *
 * Hook to get the current time position for custom implementations.
 */
export function useCurrentTimePosition(
  startHour: number,
  slotHeight: number = 44,
  updateInterval: number = 60000
) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);
    return () => clearInterval(interval);
  }, [updateInterval]);

  return useMemo(() => {
    const now = currentTime;
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60;
    const minutesFromStart = totalMinutes - startMinutes;
    const slotsFromStart = minutesFromStart / 15;

    return {
      time: now,
      formattedTime: formatTime(now),
      topOffset: slotsFromStart * slotHeight,
      isVisible: minutesFromStart >= 0,
      minutesFromStart,
    };
  }, [currentTime, startHour, slotHeight]);
}

'use client';

import { useMemo } from 'react';
import { cn } from '@clubvantage/ui';
import {
  Building2,
  Sparkles,
  Dumbbell,
  Waves,
  DoorOpen,
} from 'lucide-react';
import type { BookingStatus } from '../types';
import { getBookingStatusStyles } from '../booking-status-utils';

export interface WeekViewResource {
  id: string;
  name: string;
  type: 'court' | 'spa' | 'studio' | 'pool' | 'room';
}

export interface WeekViewBooking {
  id: string;
  resourceId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  status: BookingStatus;
  count?: number; // Number of bookings for that day
}

export interface WeekViewGridProps {
  /** Start date of the week (typically a Monday) */
  startDate: Date;
  /** Resources to display as rows */
  resources: WeekViewResource[];
  /** Booking summaries per resource per day */
  bookings: WeekViewBooking[];
  /** Callback when a day cell is clicked */
  onDayClick?: (resourceId: string, date: Date) => void;
  /** Currently selected date (highlighted) */
  selectedDate?: Date;
  /** Additional class names */
  className?: string;
}

const RESOURCE_COL_WIDTH = 150;
const DAY_COL_MIN_WIDTH = 100;

const resourceIcons: Record<WeekViewResource['type'], typeof Building2> = {
  court: Building2,
  spa: Sparkles,
  studio: Dumbbell,
  pool: Waves,
  room: DoorOpen,
};

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Generate array of 7 dates starting from startDate
 */
function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  return dates;
}

/**
 * Format date as YYYY-MM-DD for comparison
 */
function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0] ?? ''
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return formatDateKey(date1) === formatDateKey(date2);
}

/**
 * Check if date is today
 */
function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * WeekViewGrid
 *
 * A week overview grid showing booking density across resources.
 * Each cell represents one day for one resource, with colored bars
 * indicating booking status distribution.
 *
 * Click a cell to switch to day view for that date.
 */
export function WeekViewGrid({
  startDate,
  resources,
  bookings,
  onDayClick,
  selectedDate,
  className,
}: WeekViewGridProps) {
  const weekDates = useMemo(() => getWeekDates(startDate), [startDate]);

  // Group bookings by resource and date
  const bookingsByCell = useMemo(() => {
    const map = new Map<string, WeekViewBooking[]>();

    bookings.forEach((booking) => {
      const key = `${booking.resourceId}-${booking.date}`;
      const existing = map.get(key) || [];
      existing.push(booking);
      map.set(key, existing);
    });

    return map;
  }, [bookings]);

  const handleCellClick = (resourceId: string, date: Date) => {
    onDayClick?.(resourceId, date);
  };

  return (
    <div
      className={cn(
        'overflow-auto rounded-lg border border-border bg-card',
        className
      )}
    >
      <div
        className="min-w-max"
        style={{
          display: 'grid',
          gridTemplateColumns: `${RESOURCE_COL_WIDTH}px repeat(7, minmax(${DAY_COL_MIN_WIDTH}px, 1fr))`,
        }}
      >
        {/* Header Row */}
        <div
          className="sticky top-0 z-20 col-span-full grid border-b border-border bg-card"
          style={{
            gridTemplateColumns: `${RESOURCE_COL_WIDTH}px repeat(7, minmax(${DAY_COL_MIN_WIDTH}px, 1fr))`,
          }}
        >
          {/* Empty corner */}
          <div className="sticky left-0 z-30 border-r border-border bg-card" />

          {/* Day headers */}
          {weekDates.map((date, index) => {
            const today = isToday(date);
            const selected = selectedDate && isSameDay(date, selectedDate);

            return (
              <div
                key={date.toISOString()}
                className={cn(
                  'flex flex-col items-center justify-center border-r border-border py-2 last:border-r-0',
                  today && 'bg-amber-50/50 dark:bg-amber-500/5'
                )}
              >
                <span
                  className={cn(
                    'text-xs font-medium uppercase tracking-wider',
                    today
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground'
                  )}
                >
                  {dayNames[index]}
                </span>
                <span
                  className={cn(
                    'mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                    today && 'bg-amber-500 text-white',
                    selected && !today && 'ring-2 ring-amber-500',
                    !today && !selected && 'text-foreground'
                  )}
                >
                  {date.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Resource Rows */}
        {resources.map((resource) => {
          const Icon = resourceIcons[resource.type];

          return (
            <div
              key={resource.id}
              className="col-span-full grid"
              style={{
                gridTemplateColumns: `${RESOURCE_COL_WIDTH}px repeat(7, minmax(${DAY_COL_MIN_WIDTH}px, 1fr))`,
              }}
            >
              {/* Resource label */}
              <div className="sticky left-0 z-10 flex items-center gap-2 border-b border-r border-border bg-card px-3 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </span>
                <span className="truncate text-sm font-medium text-foreground">
                  {resource.name}
                </span>
              </div>

              {/* Day cells */}
              {weekDates.map((date) => {
                const dateKey = formatDateKey(date);
                const cellKey = `${resource.id}-${dateKey}`;
                const cellBookings = bookingsByCell.get(cellKey) || [];
                const today = isToday(date);

                return (
                  <button
                    key={cellKey}
                    type="button"
                    onClick={() => handleCellClick(resource.id, date)}
                    className={cn(
                      'relative flex min-h-[60px] flex-col items-center justify-center border-b border-r border-border p-2 transition-colors last:border-r-0',
                      'hover:bg-amber-50/50 dark:hover:bg-amber-500/5',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500',
                      today && 'bg-amber-50/30 dark:bg-amber-500/5'
                    )}
                    aria-label={`${resource.name} on ${date.toLocaleDateString()}, ${cellBookings.length} booking${cellBookings.length !== 1 ? 's' : ''}`}
                  >
                    {cellBookings.length > 0 ? (
                      <WeekViewCellContent bookings={cellBookings} />
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * WeekViewCellContent
 *
 * Content inside a week view cell showing booking bars.
 */
function WeekViewCellContent({
  bookings,
}: {
  bookings: WeekViewBooking[];
}) {
  // Group by status for summary bars
  const statusCounts = useMemo(() => {
    const counts: Partial<Record<BookingStatus, number>> = {};
    bookings.forEach((b) => {
      counts[b.status] = (counts[b.status] || 0) + (b.count || 1);
    });
    return counts;
  }, [bookings]);

  const totalCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex w-full flex-col items-center gap-1">
      {/* Status bars */}
      <div className="flex w-full gap-0.5">
        {Object.entries(statusCounts).map(([status, count]) => {
          const styles = getBookingStatusStyles(status as BookingStatus);
          const width = Math.max(8, (count / totalCount) * 100);

          return (
            <div
              key={status}
              className={cn('h-1.5 rounded-full', styles.config.dotColor)}
              style={{ width: `${width}%` }}
              title={`${count} ${styles.label.toLowerCase()}`}
            />
          );
        })}
      </div>

      {/* Count */}
      <span className="text-xs font-medium text-muted-foreground">
        {totalCount}
      </span>
    </div>
  );
}

/**
 * WeekViewGridSkeleton
 *
 * Loading skeleton for the week view grid.
 */
export function WeekViewGridSkeleton({
  resourceCount = 4,
  className,
}: {
  resourceCount?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card',
        className
      )}
    >
      {/* Header skeleton */}
      <div className="flex border-b border-border">
        <div className="w-[150px] shrink-0 border-r border-border" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex min-w-[100px] flex-1 flex-col items-center justify-center border-r border-border py-2 last:border-r-0"
          >
            <div className="h-3 w-8 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-7 w-7 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>

      {/* Rows skeleton */}
      {Array.from({ length: resourceCount }).map((_, i) => (
        <div key={i} className="flex border-b border-border last:border-b-0">
          <div className="flex w-[150px] shrink-0 items-center gap-2 border-r border-border px-3 py-3">
            <div className="h-7 w-7 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
          {Array.from({ length: 7 }).map((_, j) => (
            <div
              key={j}
              className="flex min-h-[60px] min-w-[100px] flex-1 items-center justify-center border-r border-border last:border-r-0"
            >
              <div className="h-3 w-12 animate-pulse rounded bg-muted/50" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

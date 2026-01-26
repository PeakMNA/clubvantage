'use client';

import { useMemo, useState } from 'react';
import { cn } from '@clubvantage/ui';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  MapPin,
} from 'lucide-react';
import { Button } from '@clubvantage/ui/primitives/button';
import type { BookingStatus } from '../types';
import { getBookingStatusStyles } from '../booking-status-utils';

export interface MobileAgendaBooking {
  id: string;
  memberName: string;
  memberAvatar?: string;
  serviceName: string;
  resourceName: string;
  startTime: string; // HH:MM format
  endTime: string;
  status: BookingStatus;
  notes?: string;
}

export interface MobileAgendaViewProps {
  /** Current date being displayed */
  date: Date;
  /** Bookings for the current date */
  bookings: MobileAgendaBooking[];
  /** Callback when date changes */
  onDateChange: (date: Date) => void;
  /** Callback when a booking is clicked */
  onBookingClick?: (bookingId: string) => void;
  /** Callback when "Add booking" is clicked */
  onAddBooking?: () => void;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time for display (12-hour format)
 */
function formatTime(time: string): string {
  const parts = time.split(':').map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const h = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Check if date is today
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Group bookings by time period
 */
function groupBookingsByPeriod(
  bookings: MobileAgendaBooking[]
): { Morning: MobileAgendaBooking[]; Afternoon: MobileAgendaBooking[]; Evening: MobileAgendaBooking[] } {
  const groups = {
    Morning: [] as MobileAgendaBooking[],
    Afternoon: [] as MobileAgendaBooking[],
    Evening: [] as MobileAgendaBooking[],
  };

  bookings.forEach((booking) => {
    const hourStr = booking.startTime.split(':')[0] ?? '0';
    const hour = parseInt(hourStr, 10);
    if (hour < 12) {
      groups.Morning.push(booking);
    } else if (hour < 17) {
      groups.Afternoon.push(booking);
    } else {
      groups.Evening.push(booking);
    }
  });

  return groups;
}

/**
 * MobileAgendaView
 *
 * A mobile-friendly agenda-style view of bookings.
 * Shows bookings as a scrollable list grouped by time period.
 * Optimized for touch interactions and narrow viewports.
 */
export function MobileAgendaView({
  date,
  bookings,
  onDateChange,
  onBookingClick,
  onAddBooking,
  isLoading = false,
  className,
}: MobileAgendaViewProps) {
  const groupedBookings = useMemo(
    () => groupBookingsByPeriod(bookings),
    [bookings]
  );

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className={cn('flex flex-col bg-background', className)}>
      {/* Date Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigateDay('prev')}
            className="rounded-lg p-2 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              {formatDate(date)}
            </h2>
            {!isToday(date) && (
              <button
                type="button"
                onClick={goToToday}
                className="mt-0.5 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
              >
                Go to Today
              </button>
            )}
            {isToday(date) && (
              <span className="mt-0.5 inline-block rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
                Today
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigateDay('next')}
            className="rounded-lg p-2 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Next day"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {isLoading ? (
          <MobileAgendaViewSkeleton />
        ) : bookings.length === 0 ? (
          <MobileAgendaEmptyState onAddBooking={onAddBooking} />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedBookings).map(
              ([period, periodBookings]) =>
                periodBookings.length > 0 && (
                  <div key={period}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {period}
                    </h3>
                    <div className="space-y-2">
                      {periodBookings.map((booking) => (
                        <MobileAgendaCard
                          key={booking.id}
                          booking={booking}
                          onClick={() => onBookingClick?.(booking.id)}
                        />
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        )}
      </div>

      {/* Fixed Add Button */}
      {onAddBooking && (
        <div className="sticky bottom-0 border-t border-border bg-card/80 px-4 py-3 backdrop-blur-sm">
          <Button
            onClick={onAddBooking}
            className="w-full bg-amber-500 text-white hover:bg-amber-600"
          >
            <Calendar className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * MobileAgendaCard
 *
 * Individual booking card in the mobile agenda view.
 */
function MobileAgendaCard({
  booking,
  onClick,
}: {
  booking: MobileAgendaBooking;
  onClick?: () => void;
}) {
  const styles = getBookingStatusStyles(booking.status);
  const config = styles.config;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border p-3 text-left transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
        'active:scale-[0.98]',
        config.bgColor,
        config.borderColor ? `border ${config.borderColor}` : 'border-transparent'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status Indicator */}
        <div
          className={cn(
            'mt-1 h-3 w-3 shrink-0 rounded-full',
            config.dotColor,
            config.pulse && 'animate-pulse'
          )}
        />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'truncate text-sm font-semibold',
                config.textColor,
                config.strikethrough && 'line-through'
              )}
            >
              {booking.memberName}
            </span>
          </div>

          <div
            className={cn(
              'mt-0.5 text-sm',
              config.strikethrough && 'line-through opacity-60'
            )}
          >
            {booking.serviceName}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {booking.resourceName}
            </span>
          </div>

          {booking.notes && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {booking.notes}
            </p>
          )}
        </div>

        {/* Avatar */}
        {booking.memberAvatar ? (
          <img
            src={booking.memberAvatar}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </button>
  );
}

/**
 * MobileAgendaEmptyState
 *
 * Empty state when no bookings exist for the day.
 */
function MobileAgendaEmptyState({
  onAddBooking,
}: {
  onAddBooking?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
        <Calendar className="h-8 w-8 text-amber-500" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        No Bookings
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        No bookings scheduled for this day
      </p>
      {onAddBooking && (
        <Button
          onClick={onAddBooking}
          variant="outline"
          className="mt-4 border-amber-500 text-amber-600 hover:bg-amber-50"
        >
          Create Booking
        </Button>
      )}
    </div>
  );
}

/**
 * MobileAgendaViewSkeleton
 *
 * Loading skeleton for the mobile agenda view.
 */
export function MobileAgendaViewSkeleton() {
  return (
    <div className="space-y-6">
      {['Morning', 'Afternoon'].map((period) => (
        <div key={period}>
          <div className="mb-2 h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="space-y-2">
            {Array.from({ length: period === 'Morning' ? 3 : 2 }).map(
              (_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-border bg-muted/30 p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-3 w-3 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded bg-muted" />
                      <div className="h-3 w-24 rounded bg-muted" />
                      <div className="flex gap-4">
                        <div className="h-3 w-20 rounded bg-muted" />
                        <div className="h-3 w-16 rounded bg-muted" />
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-muted" />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * MobileDatePicker
 *
 * A compact date picker for mobile agenda view header.
 */
export function MobileDatePicker({
  date,
  onDateChange,
  className,
}: {
  date: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Generate week dates centered on current date
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [date]);

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className={cn('px-4 py-2', className)}>
      <div className="flex justify-between gap-1">
        {weekDates.map((d, i) => {
          const isSelected =
            d.getDate() === date.getDate() &&
            d.getMonth() === date.getMonth();
          const today = isToday(d);

          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onDateChange(d)}
              className={cn(
                'flex flex-1 flex-col items-center rounded-lg py-2 transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
                isSelected
                  ? 'bg-amber-500 text-white'
                  : today
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <span className="text-[10px] font-medium uppercase">
                {dayNames[i]}
              </span>
              <span className="mt-0.5 text-sm font-semibold">{d.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

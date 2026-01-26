'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { cn } from '@clubvantage/ui';
import {
  Building2,
  Sparkles,
  Dumbbell,
  Waves,
  DoorOpen,
} from 'lucide-react';
import { BookingBlock } from './booking-block';
import type { BookingStatus } from './types';

export interface CalendarResource {
  id: string;
  name: string;
  type: 'court' | 'spa' | 'studio' | 'pool' | 'room';
}

export interface CalendarBooking {
  id: string;
  resourceId: string;
  serviceName: string;
  memberName: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  staffName?: string;
}

export interface CalendarDayViewProps {
  date: Date;
  resources: CalendarResource[];
  bookings: CalendarBooking[];
  operatingHours: { start: string; end: string };
  onSlotClick?: (resourceId: string, time: Date) => void;
  onBookingClick?: (bookingId: string) => void;
  className?: string;
}

const SLOT_HEIGHT = 44;
const TIME_COLUMN_WIDTH = 80;
const RESOURCE_MIN_WIDTH = 150;

const resourceIcons: Record<CalendarResource['type'], typeof Building2> = {
  court: Building2,
  spa: Sparkles,
  studio: Dumbbell,
  pool: Waves,
  room: DoorOpen,
};

/**
 * Generate time slots for the day (15-min increments)
 */
function generateTimeSlots(startHour: number, endHour: number): string[] {
  const slots: string[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === endHour && minute > 0) break;
      const h = hour % 12 || 12;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const m = minute.toString().padStart(2, '0');
      slots.push(`${h}:${m} ${ampm}`);
    }
  }
  return slots;
}

/**
 * Parse time string to minutes from midnight
 */
function parseTimeToMinutes(time: string): number {
  const date = new Date(time);
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Parse operating hours string "08:00" to hour number
 */
function parseOperatingHour(time: string): number {
  return parseInt(time.split(':')[0] || '0', 10);
}

/**
 * Format time for display
 */
function formatTimeDisplay(date: Date): string {
  const h = date.getHours() % 12 || 12;
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  return `${h}:${m} ${ampm}`;
}

/**
 * CalendarDayView
 *
 * Main calendar grid showing all bookings for a single day across multiple resources.
 */
export function CalendarDayView({
  date,
  resources,
  bookings,
  operatingHours,
  onSlotClick,
  onBookingClick,
  className,
}: CalendarDayViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const startHour = parseOperatingHour(operatingHours.start);
  const endHour = parseOperatingHour(operatingHours.end);
  const timeSlots = useMemo(
    () => generateTimeSlots(startHour, endHour),
    [startHour, endHour]
  );

  // Calculate current time position
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const operatingStartMinutes = startHour * 60;
  const operatingEndMinutes = endHour * 60;
  const isCurrentTimeVisible =
    currentMinutes >= operatingStartMinutes &&
    currentMinutes <= operatingEndMinutes &&
    date.toDateString() === currentTime.toDateString();
  const currentTimeOffset =
    ((currentMinutes - operatingStartMinutes) / 15) * SLOT_HEIGHT;

  // Group bookings by resource
  const bookingsByResource = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    resources.forEach((r) => map.set(r.id, []));
    bookings.forEach((b) => {
      const list = map.get(b.resourceId);
      if (list) list.push(b);
    });
    return map;
  }, [resources, bookings]);

  const handleSlotClick = (resourceId: string, slotIndex: number) => {
    if (!onSlotClick) return;
    const slotTime = new Date(date);
    const totalMinutes = operatingStartMinutes + slotIndex * 15;
    slotTime.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);
    onSlotClick(resourceId, slotTime);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-auto rounded-lg border border-border bg-card',
        className
      )}
    >
      {/* Grid Container */}
      <div
        className="relative min-w-max"
        style={{
          display: 'grid',
          gridTemplateColumns: `${TIME_COLUMN_WIDTH}px repeat(${resources.length}, minmax(${RESOURCE_MIN_WIDTH}px, 1fr))`,
        }}
      >
        {/* Header Row - Sticky */}
        <div
          className="sticky top-0 z-20 col-span-full grid border-b border-border bg-card"
          style={{
            gridTemplateColumns: `${TIME_COLUMN_WIDTH}px repeat(${resources.length}, minmax(${RESOURCE_MIN_WIDTH}px, 1fr))`,
          }}
        >
          {/* Empty corner cell */}
          <div className="sticky left-0 z-30 border-r border-border bg-card" />

          {/* Resource headers */}
          {resources.map((resource) => {
            const Icon = resourceIcons[resource.type];
            return (
              <div
                key={resource.id}
                className="flex items-center gap-2 border-r border-border px-3 py-3 last:border-r-0"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </span>
                <span className="truncate text-sm font-medium text-foreground">
                  {resource.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time slots grid */}
        {timeSlots.map((timeLabel, slotIndex) => (
          <div
            key={slotIndex}
            className="col-span-full grid"
            style={{
              gridTemplateColumns: `${TIME_COLUMN_WIDTH}px repeat(${resources.length}, minmax(${RESOURCE_MIN_WIDTH}px, 1fr))`,
              height: SLOT_HEIGHT,
            }}
          >
            {/* Time label - sticky left */}
            <div className="sticky left-0 z-10 flex items-start justify-end border-r border-border bg-card pr-2 pt-1">
              {slotIndex % 4 === 0 && (
                <span className="text-xs font-medium text-muted-foreground">
                  {timeLabel}
                </span>
              )}
            </div>

            {/* Resource cells */}
            {resources.map((resource) => (
              <button
                key={resource.id}
                type="button"
                onClick={() => handleSlotClick(resource.id, slotIndex)}
                className={cn(
                  'relative border-b border-r border-border last:border-r-0 transition-colors',
                  'hover:bg-amber-50/50 dark:hover:bg-amber-500/5',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500'
                )}
                aria-label={`Book ${resource.name} at ${timeLabel}`}
              />
            ))}
          </div>
        ))}

        {/* Booking blocks overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            top: 52, // Header height
            left: TIME_COLUMN_WIDTH,
          }}
        >
          {resources.map((resource, resourceIndex) => {
            const resourceBookings = bookingsByResource.get(resource.id) || [];
            return resourceBookings.map((booking) => {
              const startMinutes = parseTimeToMinutes(booking.startTime);
              const endMinutes = parseTimeToMinutes(booking.endTime);
              const duration = endMinutes - startMinutes;
              const slotCount = Math.ceil(duration / 15);
              const topOffset =
                ((startMinutes - operatingStartMinutes) / 15) * SLOT_HEIGHT;
              const leftOffset = resourceIndex * RESOURCE_MIN_WIDTH;

              return (
                <div
                  key={booking.id}
                  className="pointer-events-auto absolute px-1"
                  style={{
                    top: topOffset,
                    left: leftOffset,
                    width: RESOURCE_MIN_WIDTH,
                    height: slotCount * SLOT_HEIGHT,
                  }}
                >
                  <BookingBlock
                    id={booking.id}
                    serviceName={booking.serviceName}
                    memberName={booking.memberName}
                    startTime={formatTimeDisplay(new Date(booking.startTime))}
                    endTime={formatTimeDisplay(new Date(booking.endTime))}
                    status={booking.status}
                    staffName={booking.staffName}
                    slotHeight={slotCount}
                    onClick={() => onBookingClick?.(booking.id)}
                  />
                </div>
              );
            });
          })}
        </div>

        {/* Current time indicator */}
        {isCurrentTimeVisible && (
          <div
            className="pointer-events-none absolute left-0 right-0 z-30 flex items-center"
            style={{ top: 52 + currentTimeOffset }}
          >
            {/* Time label */}
            <div
              className="sticky left-0 z-40 flex items-center justify-end pr-1"
              style={{ width: TIME_COLUMN_WIDTH }}
            >
              <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {formatTimeDisplay(currentTime)}
              </span>
            </div>
            {/* Red line */}
            <div className="h-0.5 flex-1 bg-red-500" />
            {/* Dot */}
            <div className="absolute h-2.5 w-2.5 rounded-full bg-red-500" style={{ left: TIME_COLUMN_WIDTH - 5 }} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * CalendarDayViewSkeleton
 *
 * Loading skeleton for the calendar day view.
 */
export function CalendarDayViewSkeleton({
  resourceCount = 4,
  className,
}: {
  resourceCount?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-border bg-card',
        className
      )}
    >
      {/* Header skeleton */}
      <div className="flex border-b border-border">
        <div className="w-20 shrink-0 border-r border-border bg-muted/30" />
        {Array.from({ length: resourceCount }).map((_, i) => (
          <div
            key={i}
            className="flex min-w-[150px] flex-1 items-center gap-2 border-r border-border px-3 py-3 last:border-r-0"
          >
            <div className="h-7 w-7 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="space-y-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex" style={{ height: SLOT_HEIGHT }}>
            <div className="w-20 shrink-0 border-r border-border">
              {i % 4 === 0 && (
                <div className="mt-1 mr-2 ml-auto h-3 w-12 animate-pulse rounded bg-muted" />
              )}
            </div>
            {Array.from({ length: resourceCount }).map((_, j) => (
              <div
                key={j}
                className="min-w-[150px] flex-1 border-b border-r border-border last:border-r-0"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

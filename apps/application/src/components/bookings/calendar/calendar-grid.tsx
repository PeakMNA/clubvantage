'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { cn } from '@clubvantage/ui';
import type { BookingStatus } from '../types';
import { TimeColumn, TimeColumnHeader } from './time-column';
import { CurrentTimeIndicator } from './current-time-indicator';
import { EmptySlot } from './empty-slot';
import { BufferBlock } from './buffer-block';
import {
  ResourceHeader,
  ResourceHeaderGroup,
  StaffHeader,
  type ResourceType,
} from './resource-header';
import { useDragDrop, DragPreview, DragOverlay, type DragBooking, type DropTarget } from './drag-drop';
import { getBookingStatusStyles } from '../booking-status-utils';
import { useCalendarKeyboardNav } from './use-calendar-keyboard-nav';

// ============================================================================
// Types
// ============================================================================

export interface CalendarGridResource {
  id: string;
  name: string;
  type: ResourceType;
  subtitle?: string;
}

export interface CalendarGridBooking {
  id: string;
  resourceId: string;
  memberName: string;
  memberAvatar?: string;
  serviceName: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: BookingStatus;
  bufferBefore?: number; // minutes
  bufferAfter?: number; // minutes
  notes?: string;
}

export interface CalendarGridProps {
  /** Date being displayed */
  date: Date;
  /** Resources to show as columns */
  resources: CalendarGridResource[];
  /** Bookings to display */
  bookings: CalendarGridBooking[];
  /** Start hour of the calendar (0-23) */
  startHour?: number;
  /** End hour of the calendar (0-23) */
  endHour?: number;
  /** Height per 15-minute slot in pixels */
  slotHeight?: number;
  /** Width per resource column */
  columnWidth?: number;
  /** Width of time column */
  timeColumnWidth?: number;
  /** Callback when empty slot is clicked */
  onSlotClick?: (resourceId: string, startTime: string) => void;
  /** Callback when booking is clicked */
  onBookingClick?: (bookingId: string) => void;
  /** Callback when booking is rescheduled via drag */
  onBookingReschedule?: (bookingId: string, newResourceId: string, newStartTime: string) => void;
  /** Whether drag-and-drop is enabled */
  enableDragDrop?: boolean;
  /** Whether keyboard navigation is enabled */
  enableKeyboardNav?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Helpers
// ============================================================================

function timeToMinutes(time: string): number {
  const parts = time.split(':').map(Number);
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function getBookingPosition(
  startTime: string,
  endTime: string,
  calendarStartHour: number,
  slotHeight: number
): { top: number; height: number } {
  const calendarStartMinutes = calendarStartHour * 60;
  const bookingStart = timeToMinutes(startTime);
  const bookingEnd = timeToMinutes(endTime);

  const startOffset = (bookingStart - calendarStartMinutes) / 15;
  const duration = (bookingEnd - bookingStart) / 15;

  return {
    top: startOffset * slotHeight,
    height: duration * slotHeight,
  };
}

// ============================================================================
// BookingBlock (inline for calendar grid)
// ============================================================================

interface BookingBlockProps {
  booking: CalendarGridBooking;
  position: { top: number; height: number };
  onClick?: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  isDragging?: boolean;
  enableDrag?: boolean;
}

function BookingBlock({
  booking,
  position,
  onClick,
  onDragStart,
  isDragging = false,
  enableDrag = true,
}: BookingBlockProps) {
  const styles = getBookingStatusStyles(booking.status);
  const config = styles.config;

  return (
    <div
      className={cn(
        'absolute left-1 right-1 overflow-hidden rounded-lg border transition-all',
        'cursor-pointer select-none',
        isDragging && 'opacity-50 scale-[0.98]',
        config.bgColor,
        config.borderColor ? `border-l-4 ${config.borderColor}` : 'border-transparent border-l-4 border-l-blue-500'
      )}
      style={{
        top: position.top,
        height: Math.max(position.height - 2, 24),
      }}
      onClick={onClick}
      onMouseDown={enableDrag ? onDragStart : undefined}
    >
      {/* Status dot */}
      <div
        className={cn(
          'absolute left-2 top-2 h-2 w-2 rounded-full',
          config.dotColor,
          config.pulse && 'animate-pulse'
        )}
      />

      {/* Content */}
      <div className="p-2 pl-5">
        <div
          className={cn(
            'truncate text-xs font-semibold',
            config.textColor,
            config.strikethrough && 'line-through'
          )}
        >
          {booking.memberName}
        </div>
        {position.height > 40 && (
          <div
            className={cn(
              'truncate text-[10px] text-muted-foreground',
              config.strikethrough && 'line-through opacity-60'
            )}
          >
            {booking.serviceName}
          </div>
        )}
        {position.height > 60 && (
          <div className="mt-1 text-[10px] text-muted-foreground">
            {booking.startTime} - {booking.endTime}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CalendarGrid
// ============================================================================

/**
 * CalendarGrid
 *
 * Main calendar grid component showing bookings across resources and time.
 * Features:
 * - Fixed time column on the left
 * - Scrollable resource columns
 * - Current time indicator
 * - Drag-and-drop rescheduling
 * - Click to create new booking
 */
export function CalendarGrid({
  date,
  resources,
  bookings,
  startHour = 6,
  endHour = 22,
  slotHeight = 44,
  columnWidth = 180,
  timeColumnWidth = 70,
  onSlotClick,
  onBookingClick,
  onBookingReschedule,
  enableDragDrop = true,
  enableKeyboardNav = true,
  className,
}: CalendarGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [scrolledToNow, setScrolledToNow] = useState(false);

  // Generate time slots count
  const totalSlots = (endHour - startHour) * 4; // 15-minute slots

  // Keyboard navigation
  const keyboardNav = useCalendarKeyboardNav({
    resourceCount: resources.length,
    slotCount: totalSlots,
    enabled: enableKeyboardNav,
    onCellActivate: (resourceIndex, slotIndex) => {
      const resource = resources[resourceIndex];
      if (resource && onSlotClick) {
        const minutes = startHour * 60 + slotIndex * 15;
        onSlotClick(resource.id, minutesToTime(minutes));
      }
    },
    onFocusChange: (cell) => {
      // Scroll focused cell into view
      if (cell && scrollContainerRef.current) {
        const scrollTop = cell.slotIndex * slotHeight - 100;
        const maxScroll =
          scrollContainerRef.current.scrollHeight -
          scrollContainerRef.current.clientHeight;
        scrollContainerRef.current.scrollTop = Math.min(
          Math.max(0, scrollTop),
          maxScroll
        );
      }
    },
  });

  // Group bookings by resource
  const bookingsByResource = useMemo(() => {
    const map = new Map<string, CalendarGridBooking[]>();
    resources.forEach((r) => map.set(r.id, []));
    bookings.forEach((b) => {
      const existing = map.get(b.resourceId);
      if (existing) {
        existing.push(b);
      }
    });
    return map;
  }, [bookings, resources]);

  // Grid dimensions (totalSlots defined above for keyboard nav)
  const gridHeight = totalSlots * slotHeight;

  // Drag and drop
  const dragDrop = useDragDrop({
    onDrop: (booking, target) => {
      if (onBookingReschedule) {
        onBookingReschedule(booking.id, target.resourceId, target.startTime);
      }
    },
  });

  // Convert CalendarGridBooking to DragBooking
  const toDragBooking = (booking: CalendarGridBooking): DragBooking => ({
    id: booking.id,
    memberName: booking.memberName,
    serviceName: booking.serviceName,
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status,
    resourceId: booking.resourceId,
    durationMinutes: timeToMinutes(booking.endTime) - timeToMinutes(booking.startTime),
  });

  // Scroll to current time on mount
  useEffect(() => {
    if (scrolledToNow || !scrollContainerRef.current) return;

    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (isToday) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const calendarStartMinutes = startHour * 60;
      const minutesFromStart = currentMinutes - calendarStartMinutes;

      if (minutesFromStart > 0) {
        const scrollPosition = (minutesFromStart / 15) * slotHeight - 100;
        scrollContainerRef.current.scrollTop = Math.max(0, scrollPosition);
      }
    }

    setScrolledToNow(true);
  }, [date, startHour, slotHeight, scrolledToNow]);

  // Generate drop targets for each slot
  const getDropTarget = (resourceId: string, slotIndex: number): DropTarget => {
    const minutes = startHour * 60 + slotIndex * 15;
    const startTime = minutesToTime(minutes);
    const existingBookings = bookingsByResource.get(resourceId) ?? [];

    // Check for conflicts
    const hasConflict = existingBookings.some((b) => {
      if (b.id === dragDrop.draggedBooking?.id) return false;
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      const dragDuration = dragDrop.draggedBooking?.durationMinutes ?? 60;
      const newEnd = minutes + dragDuration;
      return minutes < bEnd && newEnd > bStart;
    });

    return {
      resourceId,
      startTime,
      isAvailable: !hasConflict,
      conflictReason: hasConflict ? 'Time conflict' : undefined,
    };
  };

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-lg border border-border bg-card',
        className
      )}
    >
      {/* Header Row */}
      <div className="flex shrink-0 border-b border-border">
        {/* Time column header */}
        <TimeColumnHeader width={timeColumnWidth} />

        {/* Resource headers */}
        <div className="flex overflow-hidden">
          {resources.map((resource) => (
            <ResourceHeader
              key={resource.id}
              id={resource.id}
              name={resource.name}
              type={resource.type}
              subtitle={resource.subtitle}
              width={columnWidth}
              showMenu={false}
            />
          ))}
        </div>
      </div>

      {/* Scrollable Grid Area */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 overflow-auto"
        tabIndex={enableKeyboardNav ? 0 : undefined}
        onKeyDown={keyboardNav.handleKeyDown}
        onFocus={keyboardNav.handleFocus}
        onBlur={keyboardNav.handleBlur}
        role="grid"
        aria-label="Calendar grid"
      >
        <div className="flex" style={{ height: gridHeight }}>
          {/* Time Column */}
          <TimeColumn
            startHour={startHour}
            endHour={endHour}
            slotHeight={slotHeight}
            width={timeColumnWidth}
            className="sticky left-0 z-10"
          />

          {/* Resource Columns */}
          <div className="relative flex" role="row">
            {resources.map((resource, resourceIndex) => {
              const resourceBookings = bookingsByResource.get(resource.id) ?? [];

              return (
                <div
                  key={resource.id}
                  className="relative border-r border-border last:border-r-0"
                  style={{ width: columnWidth, height: gridHeight }}
                >
                  {/* Grid lines */}
                  {Array.from({ length: totalSlots }).map((_, slotIndex) => {
                    const isHourBoundary = slotIndex % 4 === 0;
                    const target = getDropTarget(resource.id, slotIndex);

                    return (
                      <div
                        key={slotIndex}
                        className={cn(
                          'absolute inset-x-0 border-t',
                          isHourBoundary
                            ? 'border-border'
                            : 'border-border/30'
                        )}
                        style={{
                          top: slotIndex * slotHeight,
                          height: slotHeight,
                        }}
                      >
                        {/* Empty slot click area */}
                        {!resourceBookings.some((b) => {
                          const bStart = timeToMinutes(b.startTime);
                          const bEnd = timeToMinutes(b.endTime);
                          const slotStart = startHour * 60 + slotIndex * 15;
                          const slotEnd = slotStart + 15;
                          return slotStart < bEnd && slotEnd > bStart;
                        }) && (
                          <EmptySlot
                            startTime={target.startTime}
                            endTime={minutesToTime(
                              startHour * 60 + slotIndex * 15 + 15
                            )}
                            onClick={() =>
                              onSlotClick?.(resource.id, target.startTime)
                            }
                            isAvailable={true}
                            slotHeight={slotHeight}
                            showPlusIcon={false}
                            className={cn(
                              'absolute inset-0',
                              keyboardNav.isCellFocused(resourceIndex, slotIndex) &&
                                'ring-2 ring-inset ring-amber-500 bg-amber-50/50 dark:bg-amber-500/10'
                            )}
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* Bookings */}
                  {resourceBookings.map((booking) => {
                    const position = getBookingPosition(
                      booking.startTime,
                      booking.endTime,
                      startHour,
                      slotHeight
                    );

                    // Buffer before
                    const bufferBeforePosition = booking.bufferBefore
                      ? {
                          top:
                            position.top -
                            (booking.bufferBefore / 15) * slotHeight,
                          height: (booking.bufferBefore / 15) * slotHeight,
                        }
                      : null;

                    // Buffer after
                    const bufferAfterPosition = booking.bufferAfter
                      ? {
                          top: position.top + position.height,
                          height: (booking.bufferAfter / 15) * slotHeight,
                        }
                      : null;

                    return (
                      <div key={booking.id}>
                        {/* Buffer before */}
                        {bufferBeforePosition && (
                          <div
                            className="absolute left-1 right-1"
                            style={{
                              top: bufferBeforePosition.top,
                              height: bufferBeforePosition.height,
                            }}
                          >
                            <BufferBlock
                              durationMinutes={booking.bufferBefore!}
                              bufferType="setup"
                              slotHeight={slotHeight}
                            />
                          </div>
                        )}

                        {/* Booking */}
                        <BookingBlock
                          booking={booking}
                          position={position}
                          onClick={() => onBookingClick?.(booking.id)}
                          onDragStart={(e) =>
                            enableDragDrop &&
                            dragDrop.startDrag(toDragBooking(booking), e)
                          }
                          isDragging={
                            dragDrop.isDragging &&
                            dragDrop.draggedBooking?.id === booking.id
                          }
                          enableDrag={enableDragDrop}
                        />

                        {/* Buffer after */}
                        {bufferAfterPosition && (
                          <div
                            className="absolute left-1 right-1"
                            style={{
                              top: bufferAfterPosition.top,
                              height: bufferAfterPosition.height,
                            }}
                          >
                            <BufferBlock
                              durationMinutes={booking.bufferAfter!}
                              bufferType="cleanup"
                              slotHeight={slotHeight}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Current Time Indicator */}
            <CurrentTimeIndicator
              startHour={startHour}
              slotHeight={slotHeight}
              leftOffset={0}
              showTimeBadge={false}
              date={date}
              className="absolute inset-x-0"
            />
          </div>
        </div>
      </div>

      {/* Drag Preview Overlay */}
      {dragDrop.isDragging && dragDrop.draggedBooking && (
        <DragOverlay isActive={true}>
          <DragPreview
            booking={dragDrop.draggedBooking}
            position={dragDrop.dragPosition}
            isValidDrop={true}
          />
        </DragOverlay>
      )}
    </div>
  );
}

// ============================================================================
// CalendarGridSkeleton
// ============================================================================

export function CalendarGridSkeleton({
  resourceCount = 4,
  className,
}: {
  resourceCount?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card',
        className
      )}
    >
      {/* Header */}
      <div className="flex border-b border-border">
        <div className="w-[70px] shrink-0 border-r border-border" />
        {Array.from({ length: resourceCount }).map((_, i) => (
          <div
            key={i}
            className="flex w-[180px] flex-col items-center gap-1 border-r border-border py-3 last:border-r-0"
          >
            <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="h-[500px] overflow-hidden">
        <div className="flex">
          {/* Time column */}
          <div className="w-[70px] shrink-0 space-y-8 border-r border-border py-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-3 w-12 animate-pulse rounded bg-muted mx-auto"
              />
            ))}
          </div>

          {/* Resource columns */}
          {Array.from({ length: resourceCount }).map((_, i) => (
            <div
              key={i}
              className="w-[180px] border-r border-border last:border-r-0"
            >
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className="m-2 h-16 animate-pulse rounded-lg bg-muted/50"
                  style={{ marginTop: j * 80 + 20 }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

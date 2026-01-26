'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@clubvantage/ui';
import { GripVertical, Clock, AlertCircle } from 'lucide-react';
import type { BookingStatus } from '../types';
import { getBookingStatusStyles } from '../booking-status-utils';

// ============================================================================
// Types
// ============================================================================

export interface DragBooking {
  id: string;
  memberName: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  resourceId: string;
  durationMinutes: number;
}

export interface DropTarget {
  resourceId: string;
  startTime: string;
  isAvailable: boolean;
  conflictReason?: string;
}

export interface DragPreviewProps {
  /** Booking being dragged */
  booking: DragBooking;
  /** Current mouse position */
  position: { x: number; y: number };
  /** Whether drop is valid at current position */
  isValidDrop?: boolean;
  /** New time if dropped here */
  newTime?: string;
  /** Additional class names */
  className?: string;
}

export interface DropZoneProps {
  /** Target slot information */
  target: DropTarget;
  /** Whether currently being hovered during drag */
  isActive?: boolean;
  /** Height of the drop zone in pixels */
  height?: number;
  /** Callback when item is dropped */
  onDrop?: (bookingId: string) => void;
  /** Additional class names */
  className?: string;
}

export interface DragHandleProps {
  /** Whether dragging is enabled */
  isEnabled?: boolean;
  /** Callback when drag starts */
  onDragStart?: () => void;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// DragPreview
// ============================================================================

/**
 * DragPreview
 *
 * Visual preview that follows the cursor during drag operations.
 * Shows a semi-transparent card representing the booking being moved.
 */
export function DragPreview({
  booking,
  position,
  isValidDrop = true,
  newTime,
  className,
}: DragPreviewProps) {
  const styles = getBookingStatusStyles(booking.status);
  const config = styles.config;

  return (
    <div
      className={cn(
        'pointer-events-none fixed z-50 min-w-[200px] max-w-[280px]',
        'rounded-lg border-2 shadow-xl transition-transform',
        isValidDrop
          ? 'border-amber-500 bg-white dark:bg-stone-900'
          : 'border-red-500 bg-red-50 dark:bg-red-900/30',
        className
      )}
      style={{
        left: position.x + 12,
        top: position.y + 12,
        transform: 'rotate(2deg) scale(1.02)',
      }}
    >
      {/* Status bar */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
          config.dotColor
        )}
      />

      <div className="p-3 pl-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">
              {booking.memberName}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {booking.serviceName}
            </span>
          </div>
          <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>

        {/* Time info */}
        <div className="mt-2 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          {newTime ? (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground line-through">
                {booking.startTime}
              </span>
              <span className="text-amber-600 dark:text-amber-400">→</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {newTime}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              {booking.startTime} - {booking.endTime}
            </span>
          )}
        </div>

        {/* Invalid drop warning */}
        {!isValidDrop && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Cannot drop here</span>
          </div>
        )}
      </div>

      {/* Duration indicator */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-stone-700 px-2 py-0.5 text-[10px] font-medium text-white shadow">
        {booking.durationMinutes} min
      </div>
    </div>
  );
}

// ============================================================================
// DropZone
// ============================================================================

/**
 * DropZone
 *
 * Target area where bookings can be dropped.
 * Shows visual feedback for valid/invalid drop states.
 */
export function DropZone({
  target,
  isActive = false,
  height = 44,
  onDrop,
  className,
}: DropZoneProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (target.isAvailable) {
        e.dataTransfer.dropEffect = 'move';
        setIsHovered(true);
      } else {
        e.dataTransfer.dropEffect = 'none';
      }
    },
    [target.isAvailable]
  );

  const handleDragLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsHovered(false);

      if (!target.isAvailable) return;

      const bookingId = e.dataTransfer.getData('text/plain');
      if (bookingId && onDrop) {
        onDrop(bookingId);
      }
    },
    [target.isAvailable, onDrop]
  );

  const showActive = isActive || isHovered;

  return (
    <div
      className={cn(
        'relative transition-all duration-150',
        target.isAvailable
          ? showActive
            ? 'bg-amber-100 ring-2 ring-inset ring-amber-500 dark:bg-amber-500/20'
            : 'bg-transparent hover:bg-amber-50/50 dark:hover:bg-amber-500/5'
          : 'cursor-not-allowed bg-stone-100 dark:bg-stone-800',
        className
      )}
      style={{ height }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Available indicator */}
      {target.isAvailable && showActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
            Drop to move to {target.startTime}
          </span>
        </div>
      )}

      {/* Unavailable indicator */}
      {!target.isAvailable && showActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-1.5 rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
            <AlertCircle className="h-3 w-3" />
            {target.conflictReason || 'Unavailable'}
          </div>
        </div>
      )}

      {/* Dashed border when active */}
      {showActive && (
        <div
          className={cn(
            'absolute inset-1 rounded border-2 border-dashed',
            target.isAvailable ? 'border-amber-500' : 'border-red-400'
          )}
        />
      )}
    </div>
  );
}

// ============================================================================
// DragHandle
// ============================================================================

/**
 * DragHandle
 *
 * Grip icon that indicates an element is draggable.
 */
export function DragHandle({
  isEnabled = true,
  onDragStart,
  className,
}: DragHandleProps) {
  if (!isEnabled) return null;

  return (
    <div
      className={cn(
        'flex cursor-grab items-center justify-center',
        'text-muted-foreground transition-colors',
        'hover:text-foreground active:cursor-grabbing',
        className
      )}
      onMouseDown={() => onDragStart?.()}
    >
      <GripVertical className="h-4 w-4" />
    </div>
  );
}

// ============================================================================
// useDragDrop Hook
// ============================================================================

export interface DragDropState {
  isDragging: boolean;
  draggedBooking: DragBooking | null;
  dragPosition: { x: number; y: number };
  activeDropZone: string | null;
}

export interface UseDragDropOptions {
  onDragStart?: (booking: DragBooking) => void;
  onDragEnd?: () => void;
  onDrop?: (booking: DragBooking, target: DropTarget) => void;
}

/**
 * useDragDrop
 *
 * Hook to manage drag-and-drop state for calendar bookings.
 */
export function useDragDrop(options: UseDragDropOptions = {}) {
  const [state, setState] = useState<DragDropState>({
    isDragging: false,
    draggedBooking: null,
    dragPosition: { x: 0, y: 0 },
    activeDropZone: null,
  });

  const draggedBookingRef = useRef<DragBooking | null>(null);

  const startDrag = useCallback(
    (booking: DragBooking, e: React.MouseEvent | React.DragEvent) => {
      draggedBookingRef.current = booking;
      setState((prev) => ({
        ...prev,
        isDragging: true,
        draggedBooking: booking,
        dragPosition: { x: e.clientX, y: e.clientY },
      }));
      options.onDragStart?.(booking);
    },
    [options]
  );

  const updateDragPosition = useCallback((x: number, y: number) => {
    setState((prev) => ({
      ...prev,
      dragPosition: { x, y },
    }));
  }, []);

  const setActiveDropZone = useCallback((zoneId: string | null) => {
    setState((prev) => ({
      ...prev,
      activeDropZone: zoneId,
    }));
  }, []);

  const endDrag = useCallback(() => {
    setState({
      isDragging: false,
      draggedBooking: null,
      dragPosition: { x: 0, y: 0 },
      activeDropZone: null,
    });
    draggedBookingRef.current = null;
    options.onDragEnd?.();
  }, [options]);

  const handleDrop = useCallback(
    (target: DropTarget) => {
      if (draggedBookingRef.current && target.isAvailable) {
        options.onDrop?.(draggedBookingRef.current, target);
      }
      endDrag();
    },
    [options, endDrag]
  );

  // Track mouse position during drag
  useEffect(() => {
    if (!state.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateDragPosition(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      endDrag();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [state.isDragging, updateDragPosition, endDrag]);

  return {
    ...state,
    startDrag,
    endDrag,
    setActiveDropZone,
    handleDrop,
  };
}

// ============================================================================
// DragOverlay
// ============================================================================

/**
 * DragOverlay
 *
 * Portal-rendered overlay during drag operations.
 * Dims the background and shows drag preview.
 */
export function DragOverlay({
  children,
  isActive,
}: {
  children: React.ReactNode;
  isActive: boolean;
}) {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-40 bg-stone-900/10 backdrop-blur-[1px]">
      {children}
    </div>
  );
}

'use client';

import { forwardRef, useState, useCallback } from 'react';
import { cn } from '@clubvantage/ui';
import { EmptySlot, type EmptySlotProps } from './empty-slot';
import {
  QuickBookingPopover,
  type QuickBookingContext,
  type QuickBookingResult,
  type QuickBookingService,
  type QuickBookingMember,
} from './quick-booking-popover';

// ============================================================================
// TYPES
// ============================================================================

export interface EmptySlotWithQuickBookProps extends Omit<EmptySlotProps, 'onClick'> {
  /** Date of the slot */
  date: Date;
  /** Resource ID (staff or facility) */
  resourceId: string;
  /** Resource name for display */
  resourceName: string;
  /** Type of resource */
  resourceType: 'staff' | 'facility' | 'service';
  /** Available services for quick booking */
  services: QuickBookingService[];
  /** Callback when booking is submitted */
  onBookingSubmit: (result: QuickBookingResult) => Promise<void>;
  /** Callback to open full wizard */
  onOpenFullWizard?: (context: QuickBookingContext) => void;
  /** Member search function */
  onSearchMembers?: (query: string) => Promise<QuickBookingMember[]>;
  /** Whether quick booking is enabled (falls back to onClick if false) */
  enableQuickBook?: boolean;
  /** Fallback click handler when quick book is disabled */
  onClick?: () => void;
  /** Side of the popover */
  popoverSide?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment of the popover */
  popoverAlign?: 'start' | 'center' | 'end';
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * EmptySlotWithQuickBook
 *
 * An EmptySlot component with integrated QuickBookingPopover.
 * Click on empty slot to open inline quick booking form.
 *
 * @example
 * ```tsx
 * <EmptySlotWithQuickBook
 *   startTime="09:00"
 *   endTime="09:30"
 *   date={selectedDate}
 *   resourceId="staff-1"
 *   resourceName="John Smith"
 *   resourceType="staff"
 *   services={availableServices}
 *   onBookingSubmit={async (result) => {
 *     await createBooking(result);
 *   }}
 *   onOpenFullWizard={(context) => {
 *     openWizardWithContext(context);
 *   }}
 * />
 * ```
 */
export const EmptySlotWithQuickBook = forwardRef<HTMLButtonElement, EmptySlotWithQuickBookProps>(
  (
    {
      date,
      startTime,
      endTime,
      resourceId,
      resourceName,
      resourceType,
      services,
      onBookingSubmit,
      onOpenFullWizard,
      onSearchMembers,
      enableQuickBook = true,
      onClick,
      popoverSide = 'right',
      popoverAlign = 'start',
      isAvailable = true,
      ...emptySlotProps
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClick = useCallback(() => {
      if (!isAvailable) return;

      if (enableQuickBook && services.length > 0) {
        setIsOpen(true);
      } else if (onClick) {
        onClick();
      }
    }, [isAvailable, enableQuickBook, services.length, onClick]);

    const handleClose = useCallback(() => {
      setIsOpen(false);
    }, []);

    const handleSubmit = useCallback(
      async (result: QuickBookingResult) => {
        setIsSubmitting(true);
        try {
          await onBookingSubmit(result);
          setIsOpen(false);
        } finally {
          setIsSubmitting(false);
        }
      },
      [onBookingSubmit]
    );

    const handleOpenFullWizard = useCallback(() => {
      const context: QuickBookingContext = {
        date,
        time: startTime,
        staffId: resourceType === 'staff' ? resourceId : undefined,
        staffName: resourceType === 'staff' ? resourceName : undefined,
        facilityId: resourceType === 'facility' ? resourceId : undefined,
        facilityName: resourceType === 'facility' ? resourceName : undefined,
        resourceType,
      };

      onOpenFullWizard?.(context);
      setIsOpen(false);
    }, [date, startTime, resourceId, resourceName, resourceType, onOpenFullWizard]);

    const context: QuickBookingContext = {
      date,
      time: startTime,
      staffId: resourceType === 'staff' ? resourceId : undefined,
      staffName: resourceType === 'staff' ? resourceName : undefined,
      facilityId: resourceType === 'facility' ? resourceId : undefined,
      facilityName: resourceType === 'facility' ? resourceName : undefined,
      resourceType,
    };

    // If quick book is disabled or no services, render simple empty slot
    if (!enableQuickBook || services.length === 0) {
      return (
        <EmptySlot
          ref={ref}
          startTime={startTime}
          endTime={endTime}
          onClick={onClick || (() => {})}
          isAvailable={isAvailable}
          resourceName={resourceName}
          {...emptySlotProps}
        />
      );
    }

    return (
      <QuickBookingPopover
        open={isOpen}
        context={context}
        services={services}
        onSubmit={handleSubmit}
        onOpenFullWizard={handleOpenFullWizard}
        onClose={handleClose}
        onSearchMembers={onSearchMembers}
        isSubmitting={isSubmitting}
        side={popoverSide}
        align={popoverAlign}
      >
        <EmptySlot
          ref={ref}
          startTime={startTime}
          endTime={endTime}
          onClick={handleClick}
          isAvailable={isAvailable}
          resourceName={resourceName}
          {...emptySlotProps}
        />
      </QuickBookingPopover>
    );
  }
);

EmptySlotWithQuickBook.displayName = 'EmptySlotWithQuickBook';

// ============================================================================
// SKELETON
// ============================================================================

export function EmptySlotWithQuickBookSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        'h-11 w-full animate-pulse rounded bg-stone-100 dark:bg-stone-800',
        className
      )}
    />
  );
}

'use client';

import { useState, useCallback } from 'react';
import type {
  QuickBookingContext,
  QuickBookingResult,
  QuickBookingService,
  QuickBookingMember,
} from './quick-booking-popover';

// ============================================================================
// TYPES
// ============================================================================

export interface UseQuickBookingOptions {
  /** Default services available for quick booking */
  services: QuickBookingService[];
  /** Callback when booking is submitted */
  onBookingSubmit: (result: QuickBookingResult) => Promise<void>;
  /** Callback to open full wizard with context */
  onOpenFullWizard?: (context: QuickBookingContext) => void;
  /** Optional member search function */
  onSearchMembers?: (query: string) => Promise<QuickBookingMember[]>;
}

export interface UseQuickBookingReturn {
  /** Whether the popover is open */
  isOpen: boolean;
  /** Current booking context */
  context: QuickBookingContext | null;
  /** Whether a booking is being submitted */
  isSubmitting: boolean;
  /** Open the quick booking popover with context */
  openQuickBook: (context: QuickBookingContext) => void;
  /** Close the quick booking popover */
  closeQuickBook: () => void;
  /** Handle booking submission */
  handleSubmit: (result: QuickBookingResult) => Promise<void>;
  /** Handle opening full wizard */
  handleOpenFullWizard: () => void;
  /** Available services */
  services: QuickBookingService[];
  /** Member search function */
  searchMembers?: (query: string) => Promise<QuickBookingMember[]>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * useQuickBooking
 *
 * Hook for managing quick booking popover state and interactions.
 * Integrates with calendar slot clicks to enable rapid booking creation.
 *
 * @example
 * ```tsx
 * const quickBooking = useQuickBooking({
 *   services: myServices,
 *   onBookingSubmit: async (result) => {
 *     await createBooking(result);
 *     toast.success('Booking created!');
 *   },
 *   onOpenFullWizard: (context) => {
 *     setWizardContext(context);
 *     setShowWizard(true);
 *   },
 * });
 *
 * // In calendar slot click handler:
 * const handleSlotClick = (resourceId: string, time: string) => {
 *   quickBooking.openQuickBook({
 *     date: selectedDate,
 *     time,
 *     staffId: resource.type === 'staff' ? resourceId : undefined,
 *     staffName: resource.type === 'staff' ? resource.name : undefined,
 *     facilityId: resource.type === 'facility' ? resourceId : undefined,
 *     facilityName: resource.type === 'facility' ? resource.name : undefined,
 *     resourceType: resource.type,
 *   });
 * };
 * ```
 */
export function useQuickBooking({
  services,
  onBookingSubmit,
  onOpenFullWizard,
  onSearchMembers,
}: UseQuickBookingOptions): UseQuickBookingReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<QuickBookingContext | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openQuickBook = useCallback((newContext: QuickBookingContext) => {
    setContext(newContext);
    setIsOpen(true);
  }, []);

  const closeQuickBook = useCallback(() => {
    setIsOpen(false);
    // Reset context after animation completes
    setTimeout(() => setContext(null), 200);
  }, []);

  const handleSubmit = useCallback(
    async (result: QuickBookingResult) => {
      setIsSubmitting(true);
      try {
        await onBookingSubmit(result);
        closeQuickBook();
      } catch (error) {
        console.error('Quick booking failed:', error);
        // Keep popover open on error so user can retry
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onBookingSubmit, closeQuickBook]
  );

  const handleOpenFullWizard = useCallback(() => {
    if (context && onOpenFullWizard) {
      onOpenFullWizard(context);
    }
    closeQuickBook();
  }, [context, onOpenFullWizard, closeQuickBook]);

  return {
    isOpen,
    context,
    isSubmitting,
    openQuickBook,
    closeQuickBook,
    handleSubmit,
    handleOpenFullWizard,
    services,
    searchMembers: onSearchMembers,
  };
}

// ============================================================================
// CONTEXT BUILDER HELPERS
// ============================================================================

/**
 * Build QuickBookingContext from calendar slot click
 */
export function buildQuickBookingContext(params: {
  date: Date;
  time: string;
  resourceId: string;
  resourceName: string;
  resourceType: 'staff' | 'facility' | 'service';
}): QuickBookingContext {
  const { date, time, resourceId, resourceName, resourceType } = params;

  return {
    date,
    time,
    staffId: resourceType === 'staff' ? resourceId : undefined,
    staffName: resourceType === 'staff' ? resourceName : undefined,
    facilityId: resourceType === 'facility' ? resourceId : undefined,
    facilityName: resourceType === 'facility' ? resourceName : undefined,
    resourceType,
  };
}

/**
 * Build QuickBookingContext from staff calendar click
 */
export function buildStaffQuickBookingContext(params: {
  date: Date;
  time: string;
  staffId: string;
  staffName: string;
  facilityId?: string;
  facilityName?: string;
}): QuickBookingContext {
  return {
    date: params.date,
    time: params.time,
    staffId: params.staffId,
    staffName: params.staffName,
    facilityId: params.facilityId,
    facilityName: params.facilityName,
    resourceType: 'staff',
  };
}

/**
 * Build QuickBookingContext from facility calendar click
 */
export function buildFacilityQuickBookingContext(params: {
  date: Date;
  time: string;
  facilityId: string;
  facilityName: string;
}): QuickBookingContext {
  return {
    date: params.date,
    time: params.time,
    facilityId: params.facilityId,
    facilityName: params.facilityName,
    resourceType: 'facility',
  };
}

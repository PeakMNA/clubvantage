'use client';

import { useCallback, useMemo } from 'react';
import { useSubscription } from '@clubvantage/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type BookingEventType = 'CREATED' | 'UPDATED' | 'CANCELLED' | 'RESCHEDULED' | 'CHECKED_IN' | 'NO_SHOW';

export interface BookingMember {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
}

export interface BookingService {
  id: string;
  name: string;
}

export interface BookingStaff {
  id: string;
  firstName: string;
  lastName: string;
}

export interface BookingFacility {
  id: string;
  name: string;
}

export interface BookingUpdate {
  id: string;
  bookingType: 'FACILITY' | 'SERVICE' | 'STAFF';
  status: 'DRAFT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  startTime: string;
  endTime: string;
  durationMinutes: number;
  member?: BookingMember;
  service?: BookingService;
  staff?: BookingStaff;
  facility?: BookingFacility;
}

export interface BookingUpdatedPayload {
  bookingUpdated: {
    event: BookingEventType;
    booking: BookingUpdate;
  };
}

export interface UseBookingSubscriptionOptions {
  facilityId?: string;
  staffId?: string;
  date: Date;
  enabled?: boolean;
  onBookingCreated?: (booking: BookingUpdate) => void;
  onBookingUpdated?: (booking: BookingUpdate) => void;
  onBookingCancelled?: (booking: BookingUpdate) => void;
  onBookingRescheduled?: (booking: BookingUpdate) => void;
}

export interface UseBookingSubscriptionResult {
  latestEvent: { event: BookingEventType; booking: BookingUpdate } | null;
  error: Error | null;
  isConnected: boolean;
}

// ============================================================================
// SUBSCRIPTION QUERY
// ============================================================================

const BOOKING_UPDATED_SUBSCRIPTION = `
  subscription BookingUpdated($facilityId: ID, $staffId: ID, $date: Date!) {
    bookingUpdated(facilityId: $facilityId, staffId: $staffId, date: $date) {
      event
      booking {
        id
        bookingType
        status
        startTime
        endTime
        durationMinutes
        member {
          id
          firstName
          lastName
          photoUrl
        }
        service {
          id
          name
        }
        staff {
          id
          firstName
          lastName
        }
        facility {
          id
          name
        }
      }
    }
  }
`;

// ============================================================================
// HOOK
// ============================================================================

/**
 * useBookingSubscription
 *
 * Hook for real-time booking updates on the calendar.
 * Subscribes to booking events (created, updated, cancelled, etc.) for a specific
 * date and optionally filtered by facility or staff.
 *
 * @example
 * ```tsx
 * const { latestEvent, isConnected } = useBookingSubscription({
 *   date: selectedDate,
 *   facilityId: selectedFacility?.id,
 *   onBookingCreated: (booking) => {
 *     // Optimistically add to calendar
 *     setBookings(prev => [...prev, booking]);
 *   },
 *   onBookingCancelled: (booking) => {
 *     // Remove from calendar
 *     setBookings(prev => prev.filter(b => b.id !== booking.id));
 *   },
 * });
 * ```
 */
export function useBookingSubscription({
  facilityId,
  staffId,
  date,
  enabled = true,
  onBookingCreated,
  onBookingUpdated,
  onBookingCancelled,
  onBookingRescheduled,
}: UseBookingSubscriptionOptions): UseBookingSubscriptionResult {
  // Format date for GraphQL
  const dateString = useMemo(() => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }, [date]);

  // Variables for subscription
  const variables = useMemo(
    () => ({
      facilityId: facilityId || null,
      staffId: staffId || null,
      date: dateString,
    }),
    [facilityId, staffId, dateString]
  );

  // Handle incoming data
  const handleData = useCallback(
    (data: BookingUpdatedPayload) => {
      const { event, booking } = data.bookingUpdated;

      switch (event) {
        case 'CREATED':
          onBookingCreated?.(booking);
          break;
        case 'UPDATED':
        case 'CHECKED_IN':
          onBookingUpdated?.(booking);
          break;
        case 'CANCELLED':
        case 'NO_SHOW':
          onBookingCancelled?.(booking);
          break;
        case 'RESCHEDULED':
          onBookingRescheduled?.(booking);
          break;
      }
    },
    [onBookingCreated, onBookingUpdated, onBookingCancelled, onBookingRescheduled]
  );

  // Subscribe to booking updates
  const { data, error, isConnected } = useSubscription<BookingUpdatedPayload>(
    BOOKING_UPDATED_SUBSCRIPTION,
    variables,
    {
      enabled,
      onData: handleData,
    }
  );

  return {
    latestEvent: data?.bookingUpdated || null,
    error,
    isConnected,
  };
}

// ============================================================================
// MOCK HOOK FOR DEVELOPMENT
// ============================================================================

/**
 * useMockBookingSubscription
 *
 * Mock version of useBookingSubscription for development without a backend.
 * Simulates random booking events at intervals.
 */
export function useMockBookingSubscription(
  options: UseBookingSubscriptionOptions
): UseBookingSubscriptionResult {
  // In development, just return a connected state without actual events
  // Real events would come from the WebSocket
  return {
    latestEvent: null,
    error: null,
    isConnected: options.enabled !== false,
  };
}

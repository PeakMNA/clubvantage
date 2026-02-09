/**
 * Booking Status Types
 *
 * Foundation types for the booking module. All booking-related components
 * reference these status definitions for consistent state representation.
 */

import type { BookingStatus as CoreBookingStatus } from '@clubvantage/types';

// Calendar-specific display states that extend core booking status
// AVAILABLE = empty slot, MAINTENANCE = facility maintenance, OUTSIDE_HOURS = outside operating hours
export type CalendarSlotStatus = CoreBookingStatus | 'AVAILABLE' | 'MAINTENANCE' | 'OUTSIDE_HOURS';

// Backward-compatible alias — components importing BookingStatus get the extended type
export type BookingStatus = CalendarSlotStatus;

// Re-export the core type for code that wants strict booking-only statuses
export type { CoreBookingStatus };

export interface BookingStatusConfig {
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  dotColor: string;
  strikethrough?: boolean;
  pulse?: boolean;
  stripes?: boolean;
}

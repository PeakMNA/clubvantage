/**
 * Booking Status Types
 *
 * Foundation types for the booking module. All booking-related components
 * reference these status definitions for consistent state representation.
 */

export type BookingStatus =
  | 'available'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'no_show'
  | 'cancelled'
  | 'maintenance'
  | 'outside_hours';

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

/**
 * Services Index
 *
 * Export all booking-related services for the application.
 */

// Availability Service
export {
  availabilityService,
  AvailabilityService,
  timeToMinutes,
  minutesToTime,
  formatTime12Hour,
  rangesOverlap,
  type TimeSlot,
  type StaffAvailability,
  type FacilityAvailability,
  type DayAvailability,
  type AvailabilityQuery,
  type WorkingHours,
  type WeeklySchedule,
} from './availability.service';

// Pricing Service
export {
  pricingService,
  PricingService,
  type VariationPriceType,
  type ServiceVariation,
  type TierDiscount,
  type PriceBreakdown,
  type PricingInput,
  type PromotionValidation,
} from './pricing.service';

// Booking Service
export {
  bookingService,
  BookingService,
  type BookingType,
  type BookingStatus,
  type PaymentMethod,
  type PaymentStatus,
  type MemberStatus,
  type CreateBookingInput,
  type UpdateBookingInput,
  type CancelBookingInput,
  type BookingValidationResult,
  type BookingResult,
  type MemberContext,
  type ServiceContext,
  type StaffContext,
  type FacilityContext,
} from './booking.service';

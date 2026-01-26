/**
 * BookingService
 *
 * Main service for booking operations, including:
 * - Create, update, cancel bookings
 * - Validation of booking constraints
 * - Member status checks
 * - Integration with availability and pricing services
 */

import {
  availabilityService,
  type AvailabilityQuery,
  type WeeklySchedule,
  type WorkingHours,
} from './availability.service';
import {
  pricingService,
  type PriceBreakdown,
  type ServiceVariation,
} from './pricing.service';

// ============================================================================
// TYPES
// ============================================================================

export type BookingType = 'FACILITY' | 'SERVICE' | 'STAFF';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type PaymentMethod = 'ON_ACCOUNT' | 'CREDITS' | 'PREPAID' | 'PAY_AT_SERVICE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type MemberStatus = 'ACTIVE' | 'SUSPENDED' | 'LAPSED';

export interface CreateBookingInput {
  clubId: string;
  memberId: string;
  bookingType: BookingType;
  facilityId?: string;
  serviceId?: string;
  staffId?: string;
  startTime: Date;
  durationMinutes: number;
  selectedVariationIds?: string[];
  paymentMethod?: PaymentMethod;
  notes?: string;
  guestCount?: number;
  guestInfo?: Array<{ name: string; email?: string; phone?: string }>;
  createdBy?: string;
}

export interface UpdateBookingInput {
  notes?: string;
  internalNotes?: string;
  startTime?: Date;
  staffId?: string;
  facilityId?: string;
}

export interface CancelBookingInput {
  reason?: string;
  cancelledBy?: string;
  waiveFee?: boolean;
}

export interface BookingValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BookingResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: string[];
}

export interface MemberContext {
  id: string;
  status: MemberStatus;
  membershipType?: string;
  balance: number;
  credits: number;
  noShowCount: number;
}

export interface ServiceContext {
  id: string;
  name: string;
  basePrice: number;
  durationMinutes: number;
  bufferMinutes: number;
  requiredCapabilities?: string[];
  variations?: ServiceVariation[];
}

export interface StaffContext {
  id: string;
  firstName: string;
  lastName: string;
  capabilities?: string[];
  workingSchedule?: WeeklySchedule;
  defaultFacilityId?: string;
}

export interface FacilityContext {
  id: string;
  name: string;
  operatingHours?: WorkingHours;
  capacity?: number;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class BookingService {
  /**
   * Validate a booking before creation
   */
  async validateBooking(
    input: CreateBookingInput,
    member: MemberContext,
    service?: ServiceContext,
    staff?: StaffContext,
    facility?: FacilityContext,
    existingBookings: Array<{ startTime: Date; endTime: Date; staffId?: string; facilityId?: string }> = []
  ): Promise<BookingValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Check member status
    if (member.status === 'SUSPENDED') {
      errors.push('Member account is suspended. Manager override required.');
    } else if (member.status === 'LAPSED') {
      warnings.push('Member account is lapsed. Payment may be required.');
    }

    // 2. Check no-show history
    if (member.noShowCount >= 3) {
      warnings.push(`Member has ${member.noShowCount} no-shows. Consider requiring prepayment.`);
    }

    // 3. Check staff capabilities if service requires them
    if (service && staff && service.requiredCapabilities?.length) {
      const missingCapabilities = service.requiredCapabilities.filter(
        (cap) => !staff.capabilities?.includes(cap)
      );
      if (missingCapabilities.length > 0) {
        errors.push(`Staff is not qualified for this service. Missing: ${missingCapabilities.join(', ')}`);
      }
    }

    // 4. Check time slot availability
    const availabilityQuery: AvailabilityQuery = {
      clubId: input.clubId,
      date: input.startTime,
      serviceId: input.serviceId,
      staffId: input.staffId,
      facilityId: input.facilityId,
      durationMinutes: input.durationMinutes,
    };

    const requestedTime = `${input.startTime.getHours().toString().padStart(2, '0')}:${input.startTime.getMinutes().toString().padStart(2, '0')}`;

    const slotCheck = await availabilityService.isSlotAvailable(
      availabilityQuery,
      requestedTime,
      existingBookings,
      staff?.workingSchedule,
      facility?.operatingHours
    );

    if (!slotCheck.available) {
      errors.push(slotCheck.reason || 'Time slot is not available');
    }

    // 5. Check booking is in the future
    if (input.startTime <= new Date()) {
      errors.push('Booking time must be in the future');
    }

    // 6. Check guest count if applicable
    if (facility?.capacity && input.guestCount && input.guestCount > facility.capacity - 1) {
      errors.push(`Guest count exceeds facility capacity (max: ${facility.capacity - 1})`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Calculate price for a booking
   */
  calculateBookingPrice(
    service: ServiceContext,
    member: MemberContext,
    selectedVariationIds: string[] = []
  ): PriceBreakdown {
    const tierDiscounts = pricingService.getTierDiscounts();

    return pricingService.calculatePrice({
      basePrice: service.basePrice,
      selectedVariationIds,
      availableVariations: service.variations || [],
      memberTier: member.membershipType,
      tierDiscounts,
    });
  }

  /**
   * Check if member can pay with credits
   */
  canPayWithCredits(member: MemberContext, amount: number): boolean {
    return member.credits >= amount;
  }

  /**
   * Check if member can pay on account
   */
  canPayOnAccount(member: MemberContext, amount: number): { allowed: boolean; reason?: string } {
    if (member.status === 'SUSPENDED') {
      return { allowed: false, reason: 'Account suspended' };
    }

    // Check if member has reached credit limit (mock: $5000)
    const creditLimit = 5000;
    if (member.balance + amount > creditLimit) {
      return { allowed: false, reason: `Would exceed credit limit of ${creditLimit}` };
    }

    return { allowed: true };
  }

  /**
   * Generate a unique booking number
   */
  generateBookingNumber(clubPrefix: string = 'BK'): string {
    const year = new Date().getFullYear();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${clubPrefix}-${year}-${randomPart}`;
  }

  /**
   * Calculate end time based on start time and duration
   */
  calculateEndTime(startTime: Date, durationMinutes: number, bufferMinutes: number = 0): Date {
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes + bufferMinutes);
    return endTime;
  }

  /**
   * Check if a booking can be modified
   */
  canModifyBooking(
    currentStatus: BookingStatus,
    startTime: Date
  ): { allowed: boolean; reason?: string } {
    if (currentStatus === 'COMPLETED') {
      return { allowed: false, reason: 'Completed bookings cannot be modified' };
    }

    if (currentStatus === 'CANCELLED') {
      return { allowed: false, reason: 'Cancelled bookings cannot be modified' };
    }

    if (currentStatus === 'NO_SHOW') {
      return { allowed: false, reason: 'No-show bookings cannot be modified' };
    }

    if (currentStatus === 'CHECKED_IN') {
      return { allowed: false, reason: 'Cannot modify booking after check-in' };
    }

    // Cannot modify if less than 1 hour before start
    const hoursUntilStart = (startTime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilStart < 1) {
      return { allowed: false, reason: 'Cannot modify within 1 hour of start time' };
    }

    return { allowed: true };
  }

  /**
   * Check if a booking can be cancelled
   */
  canCancelBooking(
    currentStatus: BookingStatus,
    startTime: Date
  ): { allowed: boolean; refundInfo?: ReturnType<typeof pricingService.calculateRefund> } {
    if (currentStatus === 'COMPLETED') {
      return { allowed: false };
    }

    if (currentStatus === 'CANCELLED') {
      return { allowed: false };
    }

    if (currentStatus === 'NO_SHOW') {
      return { allowed: false };
    }

    if (currentStatus === 'CHECKED_IN') {
      return { allowed: false };
    }

    return { allowed: true };
  }

  /**
   * Calculate refund for cancellation
   */
  calculateCancellationRefund(
    originalAmount: number,
    startTime: Date,
    waiveFee: boolean = false
  ): ReturnType<typeof pricingService.calculateRefund> {
    if (waiveFee) {
      return {
        refundAmount: originalAmount,
        refundPercent: 100,
        policyApplied: 'Fee waived by staff',
      };
    }

    return pricingService.calculateRefund(originalAmount, startTime);
  }

  /**
   * Check if member requires prepayment
   */
  requiresPrepayment(member: MemberContext): boolean {
    // Require prepayment for suspended members (if override allowed)
    if (member.status === 'SUSPENDED') {
      return true;
    }

    // Require prepayment for members with 3+ no-shows
    if (member.noShowCount >= 3) {
      return true;
    }

    // Require prepayment for guests
    // (This would be checked elsewhere with guest context)

    return false;
  }

  /**
   * Get booking summary for display
   */
  getBookingSummary(
    service: ServiceContext,
    staff: StaffContext | undefined,
    facility: FacilityContext | undefined,
    startTime: Date,
    pricing: PriceBreakdown
  ): {
    serviceName: string;
    staffName?: string;
    facilityName?: string;
    date: string;
    time: string;
    duration: string;
    total: string;
  } {
    const endTime = this.calculateEndTime(startTime, service.durationMinutes);

    return {
      serviceName: service.name,
      staffName: staff ? `${staff.firstName} ${staff.lastName}` : undefined,
      facilityName: facility?.name,
      date: startTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: `${startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })} - ${endTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })}`,
      duration: `${service.durationMinutes} min`,
      total: pricingService.formatCurrency(pricing.total),
    };
  }
}

// Export singleton instance
export const bookingService = new BookingService();

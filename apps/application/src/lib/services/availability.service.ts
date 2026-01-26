/**
 * AvailabilityService
 *
 * Handles availability checking for bookings, including:
 * - Staff working hours and existing bookings
 * - Facility operating hours and existing bookings
 * - Service duration constraints
 * - Buffer time between bookings
 */

// ============================================================================
// TYPES
// ============================================================================

export interface TimeSlot {
  time: string; // "09:00", "09:30", etc.
  status: 'available' | 'unavailable' | 'limited';
  availableStaff?: StaffAvailability[];
  availableFacilities?: FacilityAvailability[];
  unavailableReason?: string;
}

export interface StaffAvailability {
  id: string;
  firstName: string;
  lastName: string;
  isAvailable: boolean;
  reason?: string;
}

export interface FacilityAvailability {
  id: string;
  name: string;
  isAvailable: boolean;
  reason?: string;
}

export interface DayAvailability {
  date: string;
  slots: TimeSlot[];
  staffSchedules?: Record<string, { start: string; end: string }>;
  facilityHours?: Record<string, { start: string; end: string }>;
}

export interface AvailabilityQuery {
  clubId: string;
  date: Date;
  serviceId?: string;
  staffId?: string;
  facilityId?: string;
  durationMinutes: number;
  slotIntervalMinutes?: number; // Default 30
}

export interface WorkingHours {
  start: string; // "09:00"
  end: string; // "18:00"
}

export interface WeeklySchedule {
  monday?: WorkingHours;
  tuesday?: WorkingHours;
  wednesday?: WorkingHours;
  thursday?: WorkingHours;
  friday?: WorkingHours;
  saturday?: WorkingHours;
  sunday?: WorkingHours;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert time string to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

/**
 * Convert minutes since midnight to time string
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Format time string to 12-hour format
 */
export function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const h = hours ?? 0;
  const m = minutes ?? 0;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12}:00 ${period}` : `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get day of week from date
 */
function getDayOfWeek(date: Date): keyof WeeklySchedule {
  const days: (keyof WeeklySchedule)[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return days[date.getDay()] ?? 'monday';
}

/**
 * Check if two time ranges overlap
 */
export function rangesOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && start2 < end1;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class AvailabilityService {
  private defaultOperatingHours: WorkingHours = { start: '08:00', end: '20:00' };
  private defaultSlotInterval = 30; // 30 minutes
  private defaultBufferMinutes = 15; // 15 minutes between bookings

  /**
   * Generate available time slots for a given date
   */
  async getAvailability(
    query: AvailabilityQuery,
    existingBookings: Array<{ startTime: Date; endTime: Date; staffId?: string; facilityId?: string }>,
    staffSchedule?: WeeklySchedule,
    facilityHours?: WorkingHours
  ): Promise<DayAvailability> {
    const { date, durationMinutes, slotIntervalMinutes = this.defaultSlotInterval } = query;

    // Determine operating window
    const dayOfWeek = getDayOfWeek(date);
    const staffWorkHours = staffSchedule?.[dayOfWeek];
    const effectiveHours = this.getEffectiveHours(staffWorkHours, facilityHours);

    if (!effectiveHours) {
      return {
        date: date.toISOString().split('T')[0] ?? '',
        slots: [],
      };
    }

    const startMinutes = timeToMinutes(effectiveHours.start);
    const endMinutes = timeToMinutes(effectiveHours.end);

    // Generate slots
    const slots: TimeSlot[] = [];
    const dateString = date.toISOString().split('T')[0] ?? '';

    for (let time = startMinutes; time + durationMinutes <= endMinutes; time += slotIntervalMinutes) {
      const slotStart = time;
      const slotEnd = time + durationMinutes;
      const timeString = minutesToTime(time);

      // Check for conflicts with existing bookings
      const conflict = this.findConflict(
        date,
        slotStart,
        slotEnd,
        existingBookings,
        query.staffId,
        query.facilityId
      );

      if (conflict) {
        slots.push({
          time: timeString,
          status: 'unavailable',
          unavailableReason: conflict,
        });
      } else {
        slots.push({
          time: timeString,
          status: 'available',
        });
      }
    }

    return {
      date: dateString,
      slots,
    };
  }

  /**
   * Check if a specific time slot is available
   */
  async isSlotAvailable(
    query: AvailabilityQuery,
    requestedTime: string,
    existingBookings: Array<{ startTime: Date; endTime: Date; staffId?: string; facilityId?: string }>,
    staffSchedule?: WeeklySchedule,
    facilityHours?: WorkingHours
  ): Promise<{ available: boolean; reason?: string }> {
    const { date, durationMinutes } = query;

    // Check if within operating hours
    const dayOfWeek = getDayOfWeek(date);
    const staffWorkHours = staffSchedule?.[dayOfWeek];
    const effectiveHours = this.getEffectiveHours(staffWorkHours, facilityHours);

    if (!effectiveHours) {
      return { available: false, reason: 'Closed on this day' };
    }

    const requestedStart = timeToMinutes(requestedTime);
    const requestedEnd = requestedStart + durationMinutes;
    const operatingStart = timeToMinutes(effectiveHours.start);
    const operatingEnd = timeToMinutes(effectiveHours.end);

    if (requestedStart < operatingStart || requestedEnd > operatingEnd) {
      return { available: false, reason: 'Outside operating hours' };
    }

    // Check for booking conflicts
    const conflict = this.findConflict(
      date,
      requestedStart,
      requestedEnd,
      existingBookings,
      query.staffId,
      query.facilityId
    );

    if (conflict) {
      return { available: false, reason: conflict };
    }

    return { available: true };
  }

  /**
   * Get the effective operating hours (intersection of staff and facility hours)
   */
  private getEffectiveHours(
    staffHours?: WorkingHours,
    facilityHours?: WorkingHours
  ): WorkingHours | null {
    const defaultHours = this.defaultOperatingHours;

    if (!staffHours && !facilityHours) {
      return defaultHours;
    }

    const staff = staffHours || defaultHours;
    const facility = facilityHours || defaultHours;

    // Find intersection
    const startMinutes = Math.max(timeToMinutes(staff.start), timeToMinutes(facility.start));
    const endMinutes = Math.min(timeToMinutes(staff.end), timeToMinutes(facility.end));

    if (startMinutes >= endMinutes) {
      return null; // No overlap
    }

    return {
      start: minutesToTime(startMinutes),
      end: minutesToTime(endMinutes),
    };
  }

  /**
   * Find conflicts with existing bookings
   */
  private findConflict(
    date: Date,
    slotStartMinutes: number,
    slotEndMinutes: number,
    existingBookings: Array<{ startTime: Date; endTime: Date; staffId?: string; facilityId?: string }>,
    staffId?: string,
    facilityId?: string
  ): string | null {
    const dateString = date.toISOString().split('T')[0];

    for (const booking of existingBookings) {
      const bookingDateString = booking.startTime.toISOString().split('T')[0];

      // Only check bookings on the same date
      if (bookingDateString !== dateString) {
        continue;
      }

      const bookingStart = booking.startTime.getHours() * 60 + booking.startTime.getMinutes();
      const bookingEnd = booking.endTime.getHours() * 60 + booking.endTime.getMinutes();

      // Add buffer time
      const bufferedStart = bookingStart - this.defaultBufferMinutes;
      const bufferedEnd = bookingEnd + this.defaultBufferMinutes;

      // Check for overlap
      if (rangesOverlap(slotStartMinutes, slotEndMinutes, bufferedStart, bufferedEnd)) {
        // Determine the type of conflict
        if (staffId && booking.staffId === staffId) {
          return 'Staff unavailable';
        }
        if (facilityId && booking.facilityId === facilityId) {
          return 'Facility booked';
        }
        if (!staffId && !facilityId) {
          return 'Time slot unavailable';
        }
      }
    }

    return null;
  }

  /**
   * Find the next available slot
   */
  async findNextAvailable(
    query: AvailabilityQuery,
    existingBookings: Array<{ startTime: Date; endTime: Date; staffId?: string; facilityId?: string }>,
    staffSchedule?: WeeklySchedule,
    facilityHours?: WorkingHours,
    maxDaysToCheck: number = 14
  ): Promise<{ date: Date; time: string } | null> {
    const currentDate = new Date(query.date);

    for (let i = 0; i < maxDaysToCheck; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() + i);

      const availability = await this.getAvailability(
        { ...query, date: checkDate },
        existingBookings,
        staffSchedule,
        facilityHours
      );

      const availableSlot = availability.slots.find((slot) => slot.status === 'available');
      if (availableSlot) {
        return { date: checkDate, time: availableSlot.time };
      }
    }

    return null;
  }
}

// Export singleton instance
export const availabilityService = new AvailabilityService();

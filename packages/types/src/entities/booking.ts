/**
 * Facility Booking entity types for ClubVantage
 * Based on PRD-01 data model
 */

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const BookingType = {
  RESOURCE: 'RESOURCE',
  SERVICE: 'SERVICE',
} as const;
export type BookingType = (typeof BookingType)[keyof typeof BookingType];

export const FacilityType = {
  TENNIS_COURT: 'TENNIS_COURT',
  SQUASH_COURT: 'SQUASH_COURT',
  BADMINTON_COURT: 'BADMINTON_COURT',
  SWIMMING_POOL: 'SWIMMING_POOL',
  GYM: 'GYM',
  FUNCTION_ROOM: 'FUNCTION_ROOM',
  MEETING_ROOM: 'MEETING_ROOM',
  SPA: 'SPA',
  RESTAURANT: 'RESTAURANT',
  OTHER: 'OTHER',
} as const;
export type FacilityType = (typeof FacilityType)[keyof typeof FacilityType];

export interface Facility {
  id: string;
  tenantId: string;
  clubId: string;
  locationId: string;
  name: string;
  code: string;
  type: FacilityType;
  description?: string;
  capacity?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;

  // Resources within this facility
  resources: FacilityResource[];
}

export interface FacilityResource {
  id: string;
  tenantId: string;
  facilityId: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  tenantId: string;
  clubId: string;
  name: string;
  code: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Operating hours
  operatingHours: OperatingHours[];
}

export interface OperatingHours {
  id: string;
  locationId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  openTime: string;  // HH:mm format
  closeTime: string; // HH:mm format
  isOpen: boolean;
}

export interface Booking {
  id: string;
  tenantId: string;
  clubId: string;

  // Booking Type
  bookingType: BookingType;
  bookingNumber: string;
  status: BookingStatus;

  // Who booked
  memberId: string;
  bookedById: string;

  // What was booked
  facilityId?: string;
  resourceId?: string;
  serviceId?: string;

  // When
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes

  // Guests
  guestCount: number;
  guests: BookingGuest[];

  // Charges
  chargeAmount: number;
  guestFeeAmount: number;
  totalAmount: number;
  invoiceId?: string;

  // Notes
  notes?: string;
  internalNotes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  cancelledById?: string;
  cancellationReason?: string;
}

export interface BookingGuest {
  id: string;
  bookingId: string;
  guestId?: string; // If registered guest
  name: string;
  email?: string;
  phone?: string;
  feeAmount: number;
  createAsLead: boolean;
  createdAt: Date;
}

export interface Guest {
  id: string;
  tenantId: string;
  clubId: string;
  sponsorMemberId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  visitCount: number;
  lastVisitDate?: Date;
  convertedToLeadId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Service Booking Types
export interface Service {
  id: string;
  tenantId: string;
  clubId: string;
  categoryId: string;
  name: string;
  code: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  isActive: boolean;
  requiresStaff: boolean;
  maxParticipants?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceCategory {
  id: string;
  tenantId: string;
  clubId: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Calendar View Types
export interface CalendarSlot {
  time: string;
  resources: ResourceSlot[];
}

export interface ResourceSlot {
  resourceId: string;
  resourceName: string;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'MAINTENANCE';
  booking?: Booking;
}

import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { PageInfo } from '../common/pagination';

// Enums
export enum BookingStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum BookingTypeEnum {
  FACILITY = 'FACILITY',
  SERVICE = 'SERVICE',
}

export enum ResourceTypeEnum {
  COURT = 'COURT',
  SPA = 'SPA',
  STUDIO = 'STUDIO',
  POOL = 'POOL',
  ROOM = 'ROOM',
}

registerEnumType(BookingStatusEnum, { name: 'BookingStatus' });
registerEnumType(BookingTypeEnum, { name: 'BookingTypeEnum' });
registerEnumType(ResourceTypeEnum, { name: 'ResourceTypeEnum' });

// Member reference for bookings
@ObjectType()
export class BookingMemberType {
  @Field(() => ID)
  id: string;

  @Field()
  memberId: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  photoUrl?: string;

  @Field()
  status: string;
}

// Guest reference for bookings
@ObjectType()
export class BookingGuestType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;
}

// Lightweight waitlist reference for bookings (avoids circular dependency)
@ObjectType()
export class BookingWaitlistType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  position: number;

  @Field(() => WaitlistStatusEnum)
  status: WaitlistStatusEnum;

  @Field({ nullable: true })
  offerExpiresAt?: Date;
}

// Facility type
@ObjectType()
export class FacilityType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => ResourceTypeEnum)
  type: ResourceTypeEnum;

  @Field({ nullable: true })
  location?: string;

  @Field(() => Int, { nullable: true })
  capacity?: number;

  @Field()
  isActive: boolean;
}

// Resource type
@ObjectType()
export class ResourceType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => ID)
  facilityId: string;

  @Field(() => FacilityType, { nullable: true })
  facility?: FacilityType;

  @Field()
  isActive: boolean;
}

// Service type
@ObjectType()
export class ServiceType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  category: string;

  @Field(() => Int)
  durationMinutes: number;

  @Field(() => Float)
  basePrice: number;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  requiredCapabilities?: string[];

  @Field(() => Boolean)
  enforceQualification: boolean;

  @Field()
  isActive: boolean;
}

// Staff type
@ObjectType()
export class StaffType {
  @Field(() => ID)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  photoUrl?: string;

  @Field({ nullable: true })
  role?: string;

  @Field(() => [String], { nullable: true })
  capabilities?: string[];

  @Field()
  isActive: boolean;
}

// Price modifier type
@ObjectType()
export class PriceModifierType {
  @Field()
  label: string;

  @Field(() => Float)
  amount: number;

  @Field()
  isPercentage: boolean;
}

// Booking pricing type
@ObjectType()
export class BookingPricingType {
  @Field(() => Float)
  basePrice: number;

  @Field(() => [PriceModifierType])
  modifiers: PriceModifierType[];

  @Field(() => Float)
  subtotal: number;

  @Field(() => Float, { nullable: true })
  tax?: number;

  @Field(() => Float)
  total: number;
}

// Main Booking type
@ObjectType()
export class BookingType {
  @Field(() => ID)
  id: string;

  @Field()
  bookingNumber: string;

  @Field(() => BookingTypeEnum)
  bookingType: BookingTypeEnum;

  @Field(() => BookingStatusEnum)
  status: BookingStatusEnum;

  @Field(() => BookingMemberType)
  member: BookingMemberType;

  @Field(() => FacilityType, { nullable: true })
  facility?: FacilityType;

  @Field(() => ResourceType, { nullable: true })
  resource?: ResourceType;

  @Field(() => ServiceType, { nullable: true })
  service?: ServiceType;

  @Field(() => StaffType, { nullable: true })
  staff?: StaffType;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;

  @Field(() => Int)
  durationMinutes: number;

  @Field(() => Int, { nullable: true })
  guestCount?: number;

  @Field(() => [BookingGuestType], { nullable: true })
  guests?: BookingGuestType[];

  @Field(() => BookingWaitlistType, { nullable: true })
  waitlistEntry?: BookingWaitlistType;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => BookingPricingType, { nullable: true })
  pricing?: BookingPricingType;

  @Field(() => Int, { nullable: true })
  bufferBefore?: number;

  @Field(() => Int, { nullable: true })
  bufferAfter?: number;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  checkedInAt?: Date;

  @Field({ nullable: true })
  cancelledAt?: Date;

  @Field({ nullable: true })
  cancelReason?: string;
}

// Calendar booking type (simplified for calendar display)
@ObjectType()
export class CalendarBookingType {
  @Field(() => ID)
  id: string;

  @Field()
  bookingNumber: string;

  @Field(() => ID)
  resourceId: string;

  @Field()
  memberName: string;

  @Field({ nullable: true })
  memberPhotoUrl?: string;

  @Field()
  serviceName: string;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;

  @Field(() => BookingStatusEnum)
  status: BookingStatusEnum;

  @Field(() => Int, { nullable: true })
  bufferBefore?: number;

  @Field(() => Int, { nullable: true })
  bufferAfter?: number;
}

// Calendar resource type
@ObjectType()
export class CalendarResourceType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => ResourceTypeEnum)
  type: ResourceTypeEnum;

  @Field({ nullable: true })
  subtitle?: string;
}

// Calendar day response
@ObjectType()
export class CalendarDayType {
  @Field()
  date: Date;

  @Field(() => [CalendarResourceType])
  resources: CalendarResourceType[];

  @Field(() => [CalendarBookingType])
  bookings: CalendarBookingType[];
}

// Booking connection for pagination
@ObjectType()
export class BookingEdge {
  @Field(() => BookingType)
  node: BookingType;

  @Field()
  cursor: string;
}

@ObjectType()
export class BookingConnection {
  @Field(() => [BookingEdge])
  edges: BookingEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => Int)
  totalCount: number;
}

// Booking stats type
@ObjectType()
export class BookingStatsType {
  @Field(() => Int)
  todayBookings: number;

  @Field(() => Int)
  confirmedBookings: number;

  @Field(() => Int)
  checkedInBookings: number;

  @Field(() => Int)
  completedBookings: number;

  @Field(() => Int)
  noShows: number;

  @Field(() => Float)
  utilizationRate: number;
}

// Create booking response
@ObjectType()
export class CreateBookingResponseType {
  @Field()
  success: boolean;

  @Field(() => BookingType, { nullable: true })
  booking?: BookingType;

  @Field({ nullable: true })
  error?: string;
}

// Cancel booking response
@ObjectType()
export class CancelBookingResponseType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  error?: string;
}

// Check-in response
@ObjectType()
export class CheckInResponseType {
  @Field()
  success: boolean;

  @Field(() => BookingType, { nullable: true })
  booking?: BookingType;

  @Field()
  checkedInAt: Date;

  @Field({ nullable: true })
  error?: string;
}

// ============================================================================
// Facility CRUD Response Types
// ============================================================================

@ObjectType()
export class FacilityResponseType {
  @Field()
  success: boolean;

  @Field(() => FacilityType, { nullable: true })
  facility?: FacilityType;

  @Field({ nullable: true })
  error?: string;
}

@ObjectType()
export class DeleteResponseType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  error?: string;
}

// ============================================================================
// Service CRUD Response Types
// ============================================================================

// Extended service type with variations
@ObjectType()
export class ServiceVariationType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Float)
  priceModifier: number;

  @Field()
  priceType: string; // 'add' | 'replace'
}

@ObjectType()
export class TierDiscountType {
  @Field()
  tierName: string;

  @Field(() => Float)
  discountPercent: number;
}

@ObjectType()
export class ExtendedServiceType extends ServiceType {
  @Field(() => [ServiceVariationType], { nullable: true })
  variations?: ServiceVariationType[];

  @Field(() => [TierDiscountType], { nullable: true })
  tierDiscounts?: TierDiscountType[];

  @Field(() => [String], { nullable: true })
  requiredCapabilities?: string[];

  @Field(() => Boolean)
  enforceQualification: boolean;

  @Field(() => [String], { nullable: true })
  requiredFacilityFeatures?: string[];

  @Field(() => Int, { nullable: true })
  bufferMinutes?: number;

  @Field(() => Int, { nullable: true })
  maxParticipants?: number;
}

@ObjectType()
export class ServiceResponseType {
  @Field()
  success: boolean;

  @Field(() => ExtendedServiceType, { nullable: true })
  service?: ExtendedServiceType;

  @Field({ nullable: true })
  error?: string;
}

// ============================================================================
// Staff CRUD Response Types
// ============================================================================

@ObjectType()
export class StaffCapabilityType {
  @Field()
  capability: string;

  @Field()
  level: string; // 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

@ObjectType()
export class StaffCertificationType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field()
  status: string; // 'VALID' | 'EXPIRING' | 'EXPIRED'
}

@ObjectType()
export class DayHoursType {
  @Field()
  dayOfWeek: string;

  @Field()
  isOpen: boolean;

  @Field({ nullable: true })
  openTime?: string;

  @Field({ nullable: true })
  closeTime?: string;
}

@ObjectType()
export class ExtendedStaffType extends StaffType {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => ID, { nullable: true })
  userId?: string;

  @Field(() => [StaffCapabilityType], { nullable: true })
  detailedCapabilities?: StaffCapabilityType[];

  @Field(() => [StaffCertificationType], { nullable: true })
  certifications?: StaffCertificationType[];

  @Field(() => [DayHoursType], { nullable: true })
  workingHours?: DayHoursType[];

  @Field(() => ID, { nullable: true })
  defaultFacilityId?: string;
}

@ObjectType()
export class StaffResponseType {
  @Field()
  success: boolean;

  @Field(() => ExtendedStaffType, { nullable: true })
  staff?: ExtendedStaffType;

  @Field({ nullable: true })
  error?: string;
}

// ============================================================================
// Waitlist Types
// ============================================================================

export enum WaitlistStatusEnum {
  WAITING = 'WAITING',
  OFFER_SENT = 'OFFER_SENT',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

registerEnumType(WaitlistStatusEnum, { name: 'WaitlistStatus' });

@ObjectType()
export class WaitlistEntryType {
  @Field(() => ID)
  id: string;

  @Field(() => BookingMemberType)
  member: BookingMemberType;

  @Field({ nullable: true })
  serviceName?: string;

  @Field({ nullable: true })
  facilityName?: string;

  @Field()
  requestedDate: Date;

  @Field()
  requestedTime: string;

  @Field(() => Int)
  position: number;

  @Field(() => WaitlistStatusEnum)
  status: WaitlistStatusEnum;

  @Field({ nullable: true })
  offerExpiresAt?: Date;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType()
export class WaitlistConnection {
  @Field(() => [WaitlistEdge])
  edges: WaitlistEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => Int)
  totalCount: number;
}

@ObjectType()
export class WaitlistEdge {
  @Field(() => WaitlistEntryType)
  node: WaitlistEntryType;

  @Field()
  cursor: string;
}

@ObjectType()
export class WaitlistResponseType {
  @Field()
  success: boolean;

  @Field(() => WaitlistEntryType, { nullable: true })
  entry?: WaitlistEntryType;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  error?: string;
}

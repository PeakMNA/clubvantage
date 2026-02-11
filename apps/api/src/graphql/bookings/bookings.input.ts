import { ArgsType, Field, ID, InputType, Int, Float } from '@nestjs/graphql';
import { IsOptional, IsUUID, IsDateString, IsInt, IsBoolean, Min, Max, IsEnum, IsString } from 'class-validator';
import { BookingStatusEnum, BookingTypeEnum, ResourceTypeEnum } from './bookings.types';

// Query args for calendar view
@ArgsType()
export class CalendarQueryArgs {
  @Field()
  @IsDateString()
  date: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  facilityId?: string;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  resourceIds?: string[];

  @Field(() => [BookingStatusEnum], { nullable: true })
  @IsOptional()
  statuses?: BookingStatusEnum[];
}

// Query args for booking list
@ArgsType()
export class BookingsQueryArgs {
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  first?: number;

  @Field({ nullable: true })
  @IsOptional()
  after?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field(() => [BookingStatusEnum], { nullable: true })
  @IsOptional()
  statuses?: BookingStatusEnum[];

  @Field(() => BookingTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(BookingTypeEnum)
  bookingType?: BookingTypeEnum;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  facilityId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  staffId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

// Input for creating a booking
@InputType()
export class CreateBookingInput {
  @Field(() => BookingTypeEnum)
  @IsEnum(BookingTypeEnum)
  bookingType: BookingTypeEnum;

  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  facilityId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  resourceId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  staffId?: string;

  @Field()
  @IsDateString()
  startTime: string;

  @Field()
  @IsDateString()
  endTime: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  guestCount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  addOnIds?: string[];
}

// Input for updating a booking
@InputType()
export class UpdateBookingInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  resourceId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  staffId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  guestCount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

// Input for cancelling a booking
@InputType()
export class CancelBookingInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field()
  @IsString()
  reason: string;
}

// Input for checking in
@InputType()
export class CheckInInput {
  @Field(() => ID)
  @IsUUID()
  bookingId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  outletId?: string;
}

// Input for rescheduling via drag-drop
@InputType()
export class RescheduleBookingInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field()
  @IsDateString()
  newStartTime: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  newResourceId?: string;
}

// Filter input for facilities
@InputType()
export class FacilityFilterInput {
  @Field(() => ResourceTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(ResourceTypeEnum)
  type?: ResourceTypeEnum;

  @Field({ nullable: true })
  @IsOptional()
  isActive?: boolean;
}

// Filter input for staff
@InputType()
export class StaffFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  capability?: string;

  @Field({ nullable: true })
  @IsOptional()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  availableOn?: string;
}

// Filter input for services
@InputType()
export class ServiceFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field({ nullable: true })
  @IsOptional()
  isActive?: boolean;
}

// ============================================================================
// Facility CRUD Inputs
// ============================================================================

// Operating hours for a single day
@InputType()
export class DayHoursInput {
  @Field()
  dayOfWeek: string; // 'monday' | 'tuesday' | etc.

  @Field()
  isOpen: boolean;

  @Field({ nullable: true })
  @IsOptional()
  openTime?: string; // HH:mm format

  @Field({ nullable: true })
  @IsOptional()
  closeTime?: string; // HH:mm format
}

// Input for creating a facility
@InputType()
export class CreateFacilityInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ResourceTypeEnum)
  @IsEnum(ResourceTypeEnum)
  type: ResourceTypeEnum;

  @Field()
  @IsString()
  location: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  capacity: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  features?: string[];

  @Field(() => [DayHoursInput], { nullable: true })
  @IsOptional()
  operatingHours?: DayHoursInput[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  revenueCenterId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  outletId?: string;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  isActive?: boolean;
}

// Input for updating a facility
@InputType()
export class UpdateFacilityInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ResourceTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(ResourceTypeEnum)
  type?: ResourceTypeEnum;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  features?: string[];

  @Field(() => [DayHoursInput], { nullable: true })
  @IsOptional()
  operatingHours?: DayHoursInput[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  revenueCenterId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  outletId?: string;

  @Field({ nullable: true })
  @IsOptional()
  isActive?: boolean;
}

// ============================================================================
// Service CRUD Inputs
// ============================================================================

// Tier discount input
@InputType()
export class TierDiscountInput {
  @Field()
  @IsString()
  tierName: string; // e.g., 'Gold', 'Platinum'

  @Field(() => Float)
  @Min(0)
  @Max(100)
  discountPercent: number;
}

// Service variation input
@InputType()
export class ServiceVariationInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  id?: string; // Optional ID for updates

  @Field()
  @IsString()
  name: string;

  @Field(() => Float)
  @Min(0)
  priceModifier: number;

  @Field({ defaultValue: 'add' })
  priceType: string; // 'add' | 'replace'
}

// Input for creating a service
@InputType()
export class CreateServiceInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsString()
  category: string;

  @Field(() => Int)
  @IsInt()
  @Min(15)
  durationMinutes: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  bufferMinutes?: number;

  @Field(() => Float)
  @Min(0)
  basePrice: number;

  @Field(() => [TierDiscountInput], { nullable: true })
  @IsOptional()
  tierDiscounts?: TierDiscountInput[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  requiredCapabilities?: string[];

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  enforceQualification?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  requiredFacilityFeatures?: string[];

  @Field(() => [ServiceVariationInput], { nullable: true })
  @IsOptional()
  variations?: ServiceVariationInput[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  revenueCenterId?: string;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  isActive?: boolean;
}

// Input for updating a service
@InputType()
export class UpdateServiceInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(15)
  durationMinutes?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  bufferMinutes?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  basePrice?: number;

  @Field(() => [TierDiscountInput], { nullable: true })
  @IsOptional()
  tierDiscounts?: TierDiscountInput[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  requiredCapabilities?: string[];

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  enforceQualification?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  requiredFacilityFeatures?: string[];

  @Field(() => [ServiceVariationInput], { nullable: true })
  @IsOptional()
  variations?: ServiceVariationInput[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  revenueCenterId?: string;

  @Field({ nullable: true })
  @IsOptional()
  isActive?: boolean;
}

// ============================================================================
// Staff CRUD Inputs
// ============================================================================

// Staff capability input
@InputType()
export class StaffCapabilityInput {
  @Field()
  @IsString()
  capability: string;

  @Field({ defaultValue: 'intermediate' })
  level: string; // 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

// Staff certification input
@InputType()
export class StaffCertificationInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  id?: string;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsDateString()
  expiresAt: string;
}

// Input for creating a staff member
@InputType()
export class CreateStaffMemberInput {
  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string; // Link to user account

  @Field(() => [StaffCapabilityInput], { nullable: true })
  @IsOptional()
  capabilities?: StaffCapabilityInput[];

  @Field(() => [StaffCertificationInput], { nullable: true })
  @IsOptional()
  certifications?: StaffCertificationInput[];

  @Field(() => [DayHoursInput], { nullable: true })
  @IsOptional()
  workingHours?: DayHoursInput[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  defaultFacilityId?: string;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  isActive?: boolean;
}

// Input for updating a staff member
@InputType()
export class UpdateStaffMemberInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field(() => [StaffCapabilityInput], { nullable: true })
  @IsOptional()
  capabilities?: StaffCapabilityInput[];

  @Field(() => [StaffCertificationInput], { nullable: true })
  @IsOptional()
  certifications?: StaffCertificationInput[];

  @Field(() => [DayHoursInput], { nullable: true })
  @IsOptional()
  workingHours?: DayHoursInput[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  defaultFacilityId?: string;

  @Field({ nullable: true })
  @IsOptional()
  isActive?: boolean;
}

// ============================================================================
// Waitlist Inputs
// ============================================================================

// Input for joining waitlist
@InputType()
export class JoinWaitlistInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  facilityId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @Field()
  @IsDateString()
  requestedDate: string;

  @Field()
  @IsString()
  requestedTime: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

// Input for sending offer
@InputType()
export class SendWaitlistOfferInput {
  @Field(() => ID)
  @IsUUID()
  entryId: string;

  @Field(() => Int, { nullable: true, defaultValue: 24 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(72)
  expiresInHours?: number;
}

// Input for waitlist action (accept/decline/remove)
@InputType()
export class WaitlistActionInput {
  @Field(() => ID)
  @IsUUID()
  entryId: string;
}

// Query args for waitlist
@ArgsType()
export class WaitlistQueryArgs {
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  first?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  facilityId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  date?: string;
}

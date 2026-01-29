'use client';
import { useQuery, useInfiniteQuery, useMutation, UseQueryOptions, UseInfiniteQueryOptions, InfiniteData, UseMutationOptions } from '@tanstack/react-query';
import { graphqlFetcher } from '../client';

export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
};

export type ActiveSeasonInfo = {
  __typename?: 'ActiveSeasonInfo';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type ActiveSpecialDayInfo = {
  __typename?: 'ActiveSpecialDayInfo';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type: SpecialDayType;
};

export type AddGroupPlayersInput = {
  players: Array<GroupPlayerInput>;
};

/** Days to which a configuration applies */
export type ApplicableDays =
  | 'ALL'
  | 'WEEKDAY'
  | 'WEEKEND';

export type ApplicationConnection = {
  __typename?: 'ApplicationConnection';
  edges: Array<ApplicationEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApplicationEdge = {
  __typename?: 'ApplicationEdge';
  cursor: Scalars['String']['output'];
  node: MembershipApplicationType;
};

export type ApplicationMembershipTypeType = {
  __typename?: 'ApplicationMembershipTypeType';
  code: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type ApplicationSponsorType = {
  __typename?: 'ApplicationSponsorType';
  email?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  memberId: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
};

export type ApplicationStatsType = {
  __typename?: 'ApplicationStatsType';
  approved: Scalars['Int']['output'];
  pendingBoard: Scalars['Int']['output'];
  rejected: Scalars['Int']['output'];
  submitted: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  underReview: Scalars['Int']['output'];
};

/** Membership application status options */
export type ApplicationStatus =
  | 'APPROVED'
  | 'PENDING_BOARD'
  | 'REJECTED'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'WITHDRAWN';

export type BillingStatsType = {
  __typename?: 'BillingStatsType';
  invoiceCount: Scalars['Float']['output'];
  outstandingBalance: Scalars['String']['output'];
  overdueAmount: Scalars['String']['output'];
  overdueCount: Scalars['Float']['output'];
  paidCount: Scalars['Float']['output'];
  totalRevenue: Scalars['String']['output'];
};

export type BlockMutationResponse = {
  __typename?: 'BlockMutationResponse';
  block?: Maybe<TeeTimeBlockType>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

/** Type of tee time block */
export type BlockType =
  | 'MAINTENANCE'
  | 'PRIVATE'
  | 'STARTER'
  | 'TOURNAMENT'
  | 'WEATHER';

export type BookingConnection = {
  __typename?: 'BookingConnection';
  edges: Array<BookingEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type BookingEdge = {
  __typename?: 'BookingEdge';
  cursor: Scalars['String']['output'];
  node: BookingType;
};

export type BookingGroupBookedByType = {
  __typename?: 'BookingGroupBookedByType';
  id: Scalars['ID']['output'];
  memberId?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type BookingGroupType = {
  __typename?: 'BookingGroupType';
  bookedBy: BookingGroupBookedByType;
  groupNumber: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  playerIds: Array<Scalars['String']['output']>;
};

export type BookingMemberType = {
  __typename?: 'BookingMemberType';
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  memberId: Scalars['String']['output'];
  photoUrl?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

/** Tee sheet display mode - EIGHTEEN (single column) or CROSS (dual columns) */
export type BookingMode =
  | 'CROSS'
  | 'EIGHTEEN';

export type BookingPricingType = {
  __typename?: 'BookingPricingType';
  basePrice: Scalars['Float']['output'];
  modifiers: Array<PriceModifierType>;
  subtotal: Scalars['Float']['output'];
  tax?: Maybe<Scalars['Float']['output']>;
  total: Scalars['Float']['output'];
};

export type BookingStatsType = {
  __typename?: 'BookingStatsType';
  checkedInBookings: Scalars['Int']['output'];
  completedBookings: Scalars['Int']['output'];
  confirmedBookings: Scalars['Int']['output'];
  noShows: Scalars['Int']['output'];
  todayBookings: Scalars['Int']['output'];
  utilizationRate: Scalars['Float']['output'];
};

export type BookingStatus =
  | 'CANCELLED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'NO_SHOW'
  | 'PENDING';

export type BookingType = {
  __typename?: 'BookingType';
  bookingNumber: Scalars['String']['output'];
  bookingType: BookingTypeEnum;
  bufferAfter?: Maybe<Scalars['Int']['output']>;
  bufferBefore?: Maybe<Scalars['Int']['output']>;
  cancelReason?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['DateTime']['output']>;
  checkedInAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  durationMinutes: Scalars['Int']['output'];
  endTime: Scalars['DateTime']['output'];
  facility?: Maybe<FacilityType>;
  guestCount?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  member: BookingMemberType;
  notes?: Maybe<Scalars['String']['output']>;
  pricing?: Maybe<BookingPricingType>;
  resource?: Maybe<ResourceType>;
  service?: Maybe<ServiceType>;
  staff?: Maybe<StaffType>;
  startTime: Scalars['DateTime']['output'];
  status: BookingStatus;
};

export type BookingTypeEnum =
  | 'FACILITY'
  | 'SERVICE';

export type CsvPlayerRow = {
  email?: InputMaybe<Scalars['String']['input']>;
  handicap?: InputMaybe<Scalars['Int']['input']>;
  memberId?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type CaddyType = {
  __typename?: 'CaddyType';
  caddyNumber: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
};

export type CalendarBookingType = {
  __typename?: 'CalendarBookingType';
  bookingNumber: Scalars['String']['output'];
  bufferAfter?: Maybe<Scalars['Int']['output']>;
  bufferBefore?: Maybe<Scalars['Int']['output']>;
  endTime: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  memberName: Scalars['String']['output'];
  memberPhotoUrl?: Maybe<Scalars['String']['output']>;
  resourceId: Scalars['ID']['output'];
  serviceName: Scalars['String']['output'];
  startTime: Scalars['DateTime']['output'];
  status: BookingStatus;
};

export type CalendarDayType = {
  __typename?: 'CalendarDayType';
  bookings: Array<CalendarBookingType>;
  date: Scalars['DateTime']['output'];
  resources: Array<CalendarResourceType>;
};

export type CalendarResourceType = {
  __typename?: 'CalendarResourceType';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  subtitle?: Maybe<Scalars['String']['output']>;
  type: ResourceTypeEnum;
};

export type CancelBookingInput = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};

export type CancelBookingResponseType = {
  __typename?: 'CancelBookingResponseType';
  error?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type CancelResponseType = {
  __typename?: 'CancelResponseType';
  message: Scalars['String']['output'];
};

/** Cart policy for golf bookings */
export type CartPolicy =
  | 'OPTIONAL'
  | 'REQUIRED';

/** Golf cart type */
export type CartType =
  | 'SHARED'
  | 'SINGLE'
  | 'WALKING';

export type ChangeApplicationStatusInput = {
  rejectionReason?: InputMaybe<Scalars['String']['input']>;
  reviewNotes?: InputMaybe<Scalars['String']['input']>;
  status: ApplicationStatus;
};

export type ChangeStatusInput = {
  reason?: InputMaybe<Scalars['String']['input']>;
  status: MemberStatus;
};

export type ChargeTypeType = {
  __typename?: 'ChargeTypeType';
  code: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type CheckInInput = {
  bookingId: Scalars['ID']['input'];
  outletId?: InputMaybe<Scalars['ID']['input']>;
};

export type CheckInResponseType = {
  __typename?: 'CheckInResponseType';
  booking?: Maybe<BookingType>;
  checkedInAt: Scalars['DateTime']['output'];
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type ClubGolfSettingsType = {
  __typename?: 'ClubGolfSettingsType';
  caddyDrivesCart: Scalars['Boolean']['output'];
  cartPolicy: CartPolicy;
  id: Scalars['ID']['output'];
  maxGuestsPerMember: Scalars['Int']['output'];
  rentalPolicy: RentalPolicy;
  requireGuestContact: Scalars['Boolean']['output'];
};

export type CourseIntervalInput = {
  dayType: DayType;
  intervalMin?: Scalars['Int']['input'];
  isPrimeTime?: Scalars['Boolean']['input'];
  timeEnd: Scalars['String']['input'];
  timeStart: Scalars['String']['input'];
};

export type CreateApplicationInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  membershipTypeId: Scalars['ID']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  reviewNotes?: InputMaybe<Scalars['String']['input']>;
  sponsorId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateBlockInput = {
  blockType: BlockType;
  courseId: Scalars['ID']['input'];
  endTime: Scalars['DateTime']['input'];
  isRecurring?: Scalars['Boolean']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  recurringPattern?: InputMaybe<Scalars['String']['input']>;
  startTime: Scalars['DateTime']['input'];
};

export type CreateBookingInput = {
  addOnIds?: InputMaybe<Array<Scalars['String']['input']>>;
  bookingType: BookingTypeEnum;
  endTime: Scalars['String']['input'];
  facilityId?: InputMaybe<Scalars['ID']['input']>;
  guestCount?: InputMaybe<Scalars['Int']['input']>;
  memberId: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  resourceId?: InputMaybe<Scalars['ID']['input']>;
  serviceId?: InputMaybe<Scalars['ID']['input']>;
  staffId?: InputMaybe<Scalars['ID']['input']>;
  startTime: Scalars['String']['input'];
};

export type CreateBookingResponseType = {
  __typename?: 'CreateBookingResponseType';
  booking?: Maybe<BookingType>;
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type CreateDependentInput = {
  dateOfBirth?: InputMaybe<Scalars['DateTime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  memberId: Scalars['ID']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  relationship: Scalars['String']['input'];
};

export type CreateFacilityInput = {
  capacity: Scalars['Int']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  features?: InputMaybe<Array<Scalars['String']['input']>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  location: Scalars['String']['input'];
  name: Scalars['String']['input'];
  operatingHours?: InputMaybe<Array<DayHoursInput>>;
  outletId?: InputMaybe<Scalars['ID']['input']>;
  revenueCenterId?: InputMaybe<Scalars['ID']['input']>;
  type: ResourceTypeEnum;
};

export type CreateGroupBookingInput = {
  courseId: Scalars['ID']['input'];
  eventDate: Scalars['DateTime']['input'];
  groupName: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  players?: InputMaybe<Array<GroupPlayerInput>>;
  startFormat?: StartFormat;
  startTime: Scalars['String']['input'];
};

export type CreateInvoiceInput = {
  billingPeriod?: InputMaybe<Scalars['String']['input']>;
  dueDate: Scalars['DateTime']['input'];
  internalNotes?: InputMaybe<Scalars['String']['input']>;
  invoiceDate: Scalars['DateTime']['input'];
  lineItems: Array<InvoiceLineItemInput>;
  memberId: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
};

export type CreateLotteryInput = {
  courseId: Scalars['ID']['input'];
  drawTime: Scalars['DateTime']['input'];
  lotteryDate: Scalars['DateTime']['input'];
  lotteryType?: LotteryType;
  maxRequestsPerMember?: Scalars['Int']['input'];
  requestWindowEnd: Scalars['DateTime']['input'];
  requestWindowStart: Scalars['DateTime']['input'];
  timeRangeEnd: Scalars['String']['input'];
  timeRangeStart: Scalars['String']['input'];
};

export type CreateLotteryRequestInput = {
  lotteryId: Scalars['ID']['input'];
  playerCount?: Scalars['Int']['input'];
  preference1: Scalars['String']['input'];
  preference2?: InputMaybe<Scalars['String']['input']>;
  preference3?: InputMaybe<Scalars['String']['input']>;
};

export type CreateMemberInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['DateTime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emergencyContact?: InputMaybe<Scalars['String']['input']>;
  emergencyPhone?: InputMaybe<Scalars['String']['input']>;
  expiryDate?: InputMaybe<Scalars['DateTime']['input']>;
  firstName: Scalars['String']['input'];
  gender?: InputMaybe<Scalars['String']['input']>;
  householdId?: InputMaybe<Scalars['ID']['input']>;
  idNumber?: InputMaybe<Scalars['String']['input']>;
  isPrimaryMember?: InputMaybe<Scalars['Boolean']['input']>;
  joinDate?: InputMaybe<Scalars['DateTime']['input']>;
  lastName: Scalars['String']['input'];
  membershipTierId?: InputMaybe<Scalars['ID']['input']>;
  membershipTypeId: Scalars['ID']['input'];
  nationality?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  referralSource?: InputMaybe<Scalars['String']['input']>;
  referredById?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<MemberStatus>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type CreatePaymentInput = {
  accountLast4?: InputMaybe<Scalars['String']['input']>;
  allocations?: InputMaybe<Array<PaymentAllocationInput>>;
  amount: Scalars['Float']['input'];
  bankName?: InputMaybe<Scalars['String']['input']>;
  memberId: Scalars['ID']['input'];
  method: PaymentMethod;
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentDate?: InputMaybe<Scalars['DateTime']['input']>;
  referenceNumber?: InputMaybe<Scalars['String']['input']>;
};

export type CreateScheduleInput = {
  courseId: Scalars['ID']['input'];
  endDate: Scalars['DateTime']['input'];
  firstTeeTime: Scalars['String']['input'];
  intervals?: InputMaybe<Array<CourseIntervalInput>>;
  lastTeeTime: Scalars['String']['input'];
  paceOfPlay?: InputMaybe<Scalars['Int']['input']>;
  playFormat?: PlayFormat;
  seasonName: Scalars['String']['input'];
  startDate: Scalars['DateTime']['input'];
};

export type CreateSeasonInput = {
  endDay: Scalars['Int']['input'];
  endMonth: Scalars['Int']['input'];
  isRecurring?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  overrideBookingWindow?: InputMaybe<Scalars['Int']['input']>;
  overrideFirstTee?: InputMaybe<Scalars['String']['input']>;
  overrideLastTee?: InputMaybe<Scalars['String']['input']>;
  overrideTimePeriods?: InputMaybe<Scalars['Boolean']['input']>;
  overrideTwilightTime?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  startDay: Scalars['Int']['input'];
  startMonth: Scalars['Int']['input'];
  weekdayBookingMode?: InputMaybe<BookingMode>;
  weekendBookingMode?: InputMaybe<BookingMode>;
};

export type CreateServiceInput = {
  basePrice: Scalars['Float']['input'];
  bufferMinutes?: InputMaybe<Scalars['Int']['input']>;
  category: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  durationMinutes: Scalars['Int']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxParticipants?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  requiredCapabilities?: InputMaybe<Array<Scalars['String']['input']>>;
  requiredFacilityFeatures?: InputMaybe<Array<Scalars['String']['input']>>;
  revenueCenterId?: InputMaybe<Scalars['ID']['input']>;
  tierDiscounts?: InputMaybe<Array<TierDiscountInput>>;
  variations?: InputMaybe<Array<ServiceVariationInput>>;
};

export type CreateSpecialDayInput = {
  bookingMode?: InputMaybe<BookingMode>;
  customFirstTee?: InputMaybe<Scalars['String']['input']>;
  customLastTee?: InputMaybe<Scalars['String']['input']>;
  customTimePeriods?: InputMaybe<Scalars['Boolean']['input']>;
  endDate: Scalars['String']['input'];
  isRecurring?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['String']['input'];
  type: SpecialDayType;
};

export type CreateStaffMemberInput = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  capabilities?: InputMaybe<Array<StaffCapabilityInput>>;
  certifications?: InputMaybe<Array<StaffCertificationInput>>;
  defaultFacilityId?: InputMaybe<Scalars['ID']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  lastName: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
  workingHours?: InputMaybe<Array<DayHoursInput>>;
};

export type CreateTeeTimeInput = {
  courseId: Scalars['ID']['input'];
  holes?: InputMaybe<Scalars['Int']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  players: Array<TeeTimePlayerInput>;
  startingHole?: InputMaybe<Scalars['Int']['input']>;
  teeDate: Scalars['DateTime']['input'];
  teeTime: Scalars['String']['input'];
};

export type CreateTimePeriodInput = {
  applicableDays: ApplicableDays;
  endTime?: InputMaybe<Scalars['String']['input']>;
  intervalMinutes: Scalars['Int']['input'];
  isPrimeTime: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  startTime: Scalars['String']['input'];
};

export type CreateWaitlistEntryInput = {
  courseId: Scalars['ID']['input'];
  playerCount?: Scalars['Int']['input'];
  requestedDate: Scalars['DateTime']['input'];
  requesterEmail?: InputMaybe<Scalars['String']['input']>;
  requesterName: Scalars['String']['input'];
  requesterPhone: Scalars['String']['input'];
  timeRangeEnd: Scalars['String']['input'];
  timeRangeStart: Scalars['String']['input'];
};

export type DayHoursInput = {
  closeTime?: InputMaybe<Scalars['String']['input']>;
  dayOfWeek: Scalars['String']['input'];
  isOpen: Scalars['Boolean']['input'];
  openTime?: InputMaybe<Scalars['String']['input']>;
};

export type DayHoursType = {
  __typename?: 'DayHoursType';
  closeTime?: Maybe<Scalars['String']['output']>;
  dayOfWeek: Scalars['String']['output'];
  isOpen: Scalars['Boolean']['output'];
  openTime?: Maybe<Scalars['String']['output']>;
};

/** Day type for scheduling */
export type DayType =
  | 'HOLIDAY'
  | 'WEEKDAY'
  | 'WEEKEND';

export type DeleteDependentResponseType = {
  __typename?: 'DeleteDependentResponseType';
  message: Scalars['String']['output'];
};

export type DeleteMemberResponseType = {
  __typename?: 'DeleteMemberResponseType';
  message: Scalars['String']['output'];
};

export type DeleteMutationResponse = {
  __typename?: 'DeleteMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type DeleteResponseType = {
  __typename?: 'DeleteResponseType';
  error?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type DependentType = {
  __typename?: 'DependentType';
  dateOfBirth?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  relationship: Scalars['String']['output'];
};

export type EffectiveScheduleType = {
  __typename?: 'EffectiveScheduleType';
  activeSeason?: Maybe<ActiveSeasonInfo>;
  activeSpecialDay?: Maybe<ActiveSpecialDayInfo>;
  bookingMode: BookingMode;
  bookingWindowDays: Scalars['Int']['output'];
  courseId: Scalars['ID']['output'];
  date: Scalars['String']['output'];
  firstTee: Scalars['String']['output'];
  isClosed: Scalars['Boolean']['output'];
  lastTee: Scalars['String']['output'];
  timePeriods: Array<GolfTimePeriodType>;
  twilightMode: TwilightMode;
  twilightTime: Scalars['String']['output'];
};

export type ExtendedServiceType = {
  __typename?: 'ExtendedServiceType';
  basePrice: Scalars['Float']['output'];
  bufferMinutes?: Maybe<Scalars['Int']['output']>;
  category: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  durationMinutes: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  maxParticipants?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  requiredCapabilities?: Maybe<Array<Scalars['String']['output']>>;
  requiredFacilityFeatures?: Maybe<Array<Scalars['String']['output']>>;
  tierDiscounts?: Maybe<Array<TierDiscountType>>;
  variations?: Maybe<Array<ServiceVariationType>>;
};

export type ExtendedStaffType = {
  __typename?: 'ExtendedStaffType';
  capabilities?: Maybe<Array<Scalars['String']['output']>>;
  certifications?: Maybe<Array<StaffCertificationType>>;
  defaultFacilityId?: Maybe<Scalars['ID']['output']>;
  detailedCapabilities?: Maybe<Array<StaffCapabilityType>>;
  email?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  photoUrl?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['ID']['output']>;
  workingHours?: Maybe<Array<DayHoursType>>;
};

export type FacilityFilterInput = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<ResourceTypeEnum>;
};

export type FacilityResponseType = {
  __typename?: 'FacilityResponseType';
  error?: Maybe<Scalars['String']['output']>;
  facility?: Maybe<FacilityType>;
  success: Scalars['Boolean']['output'];
};

export type FacilityType = {
  __typename?: 'FacilityType';
  capacity?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  location?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: ResourceTypeEnum;
};

export type FlightAssignment = {
  __typename?: 'FlightAssignment';
  flightNumber: Scalars['Int']['output'];
  players: Array<GolfGroupPlayerType>;
  teeTime: Scalars['String']['output'];
};

export type FlightCheckInResponseType = {
  __typename?: 'FlightCheckInResponseType';
  checkedInAt: Scalars['DateTime']['output'];
  success: Scalars['Boolean']['output'];
  teeTime: TeeTimeType;
};

export type GolfCourseIntervalType = {
  __typename?: 'GolfCourseIntervalType';
  dayType: DayType;
  id: Scalars['ID']['output'];
  intervalMin: Scalars['Int']['output'];
  isPrimeTime: Scalars['Boolean']['output'];
  timeEnd: Scalars['String']['output'];
  timeStart: Scalars['String']['output'];
};

export type GolfCourseScheduleType = {
  __typename?: 'GolfCourseScheduleType';
  courseId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  endDate: Scalars['DateTime']['output'];
  firstTeeTime: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  intervals?: Maybe<Array<GolfCourseIntervalType>>;
  isActive: Scalars['Boolean']['output'];
  lastTeeTime: Scalars['String']['output'];
  paceOfPlay?: Maybe<Scalars['Int']['output']>;
  playFormat: PlayFormat;
  seasonName: Scalars['String']['output'];
  startDate: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type GolfCourseType = {
  __typename?: 'GolfCourseType';
  code: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  firstTeeTime: Scalars['String']['output'];
  holes: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastTeeTime: Scalars['String']['output'];
  name: Scalars['String']['output'];
  par: Scalars['Int']['output'];
  rating?: Maybe<Scalars['Float']['output']>;
  slope?: Maybe<Scalars['Float']['output']>;
  teeInterval: Scalars['Int']['output'];
};

export type GolfGroupBookingType = {
  __typename?: 'GolfGroupBookingType';
  course?: Maybe<GolfCourseType>;
  courseId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  eventDate: Scalars['DateTime']['output'];
  groupName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  players: Array<GolfGroupPlayerType>;
  startFormat: StartFormat;
  startTime: Scalars['String']['output'];
  status: GroupBookingStatus;
  totalPlayers: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type GolfGroupPlayerType = {
  __typename?: 'GolfGroupPlayerType';
  assignedFlight?: Maybe<Scalars['Int']['output']>;
  assignedPosition?: Maybe<Scalars['Int']['output']>;
  guestEmail?: Maybe<Scalars['String']['output']>;
  guestName?: Maybe<Scalars['String']['output']>;
  guestPhone?: Maybe<Scalars['String']['output']>;
  handicap?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  memberId?: Maybe<Scalars['ID']['output']>;
  playerType: PlayerType;
};

export type GolfLotteryRequestType = {
  __typename?: 'GolfLotteryRequestType';
  assignedTime?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  drawOrder?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  lotteryId: Scalars['ID']['output'];
  member?: Maybe<PlayerMemberType>;
  memberId: Scalars['ID']['output'];
  playerCount: Scalars['Int']['output'];
  preference1: Scalars['String']['output'];
  preference2?: Maybe<Scalars['String']['output']>;
  preference3?: Maybe<Scalars['String']['output']>;
  status: LotteryRequestStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type GolfLotteryType = {
  __typename?: 'GolfLotteryType';
  course?: Maybe<GolfCourseType>;
  courseId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  drawTime: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  lotteryDate: Scalars['DateTime']['output'];
  lotteryType: LotteryType;
  maxRequestsPerMember: Scalars['Int']['output'];
  requestWindowEnd: Scalars['DateTime']['output'];
  requestWindowStart: Scalars['DateTime']['output'];
  requests?: Maybe<Array<GolfLotteryRequestType>>;
  status: LotteryStatus;
  timeRangeEnd: Scalars['String']['output'];
  timeRangeStart: Scalars['String']['output'];
  totalRequests?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type GolfScheduleConfigType = {
  __typename?: 'GolfScheduleConfigType';
  clubLatitude?: Maybe<Scalars['Float']['output']>;
  clubLongitude?: Maybe<Scalars['Float']['output']>;
  courseId: Scalars['ID']['output'];
  defaultBookingWindowDays: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  seasons: Array<GolfSeasonType>;
  specialDays: Array<GolfSpecialDayType>;
  timePeriods: Array<GolfTimePeriodType>;
  twilightFixedDefault: Scalars['String']['output'];
  twilightMinutesBeforeSunset: Scalars['Int']['output'];
  twilightMode: TwilightMode;
  weekdayBookingMode: BookingMode;
  weekdayFirstTee: Scalars['String']['output'];
  weekdayLastTee: Scalars['String']['output'];
  weekendBookingMode: BookingMode;
  weekendFirstTee: Scalars['String']['output'];
  weekendLastTee: Scalars['String']['output'];
};

export type GolfSeasonType = {
  __typename?: 'GolfSeasonType';
  endDay: Scalars['Int']['output'];
  endMonth: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isRecurring: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  overrideBookingWindow?: Maybe<Scalars['Int']['output']>;
  overrideFirstTee?: Maybe<Scalars['String']['output']>;
  overrideLastTee?: Maybe<Scalars['String']['output']>;
  overrideTimePeriods: Scalars['Boolean']['output'];
  overrideTwilightTime?: Maybe<Scalars['String']['output']>;
  priority: Scalars['Int']['output'];
  startDay: Scalars['Int']['output'];
  startMonth: Scalars['Int']['output'];
  timePeriods: Array<GolfTimePeriodType>;
  weekdayBookingMode?: Maybe<BookingMode>;
  weekendBookingMode?: Maybe<BookingMode>;
};

export type GolfSpecialDayType = {
  __typename?: 'GolfSpecialDayType';
  bookingMode?: Maybe<BookingMode>;
  customFirstTee?: Maybe<Scalars['String']['output']>;
  customLastTee?: Maybe<Scalars['String']['output']>;
  customTimePeriods: Scalars['Boolean']['output'];
  endDate: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isRecurring: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  startDate: Scalars['String']['output'];
  timePeriods: Array<GolfTimePeriodType>;
  type: SpecialDayType;
};

export type GolfTimePeriodType = {
  __typename?: 'GolfTimePeriodType';
  applicableDays: ApplicableDays;
  endTime?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  intervalMinutes: Scalars['Int']['output'];
  isPrimeTime: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  sortOrder: Scalars['Int']['output'];
  startTime: Scalars['String']['output'];
};

/** Golf waitlist entry status */
export type GolfWaitlistStatus =
  | 'BOOKED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'NOTIFIED'
  | 'PENDING';

export type GolfWaitlistType = {
  __typename?: 'GolfWaitlistType';
  bookedTeeTimeId?: Maybe<Scalars['ID']['output']>;
  course?: Maybe<GolfCourseType>;
  courseId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  member?: Maybe<PlayerMemberType>;
  memberId?: Maybe<Scalars['ID']['output']>;
  notifiedAt?: Maybe<Scalars['DateTime']['output']>;
  playerCount: Scalars['Int']['output'];
  priority: Scalars['Int']['output'];
  requestedDate: Scalars['DateTime']['output'];
  requesterEmail?: Maybe<Scalars['String']['output']>;
  requesterName: Scalars['String']['output'];
  requesterPhone: Scalars['String']['output'];
  status: GolfWaitlistStatus;
  timeRangeEnd: Scalars['String']['output'];
  timeRangeStart: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type GroupBookingFlightsResponse = {
  __typename?: 'GroupBookingFlightsResponse';
  flights: Array<FlightAssignment>;
  success: Scalars['Boolean']['output'];
  totalFlights: Scalars['Int']['output'];
};

export type GroupBookingMutationResponse = {
  __typename?: 'GroupBookingMutationResponse';
  groupBooking?: Maybe<GolfGroupBookingType>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  warnings?: Maybe<Array<Scalars['String']['output']>>;
};

/** Group booking status */
export type GroupBookingStatus =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'DRAFT';

export type GroupPlayerInput = {
  guestEmail?: InputMaybe<Scalars['String']['input']>;
  guestName?: InputMaybe<Scalars['String']['input']>;
  guestPhone?: InputMaybe<Scalars['String']['input']>;
  handicap?: InputMaybe<Scalars['Int']['input']>;
  memberId?: InputMaybe<Scalars['ID']['input']>;
  playerType: PlayerType;
};

export type HouseholdType = {
  __typename?: 'HouseholdType';
  address?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
};

export type ImportPlayersFromCsvInput = {
  rows: Array<CsvPlayerRow>;
};

export type InvoiceConnection = {
  __typename?: 'InvoiceConnection';
  edges: Array<InvoiceTypeEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type InvoiceLineItemInput = {
  chargeTypeId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  discountPct?: InputMaybe<Scalars['Float']['input']>;
  quantity: Scalars['Float']['input'];
  taxRate?: InputMaybe<Scalars['Float']['input']>;
  taxType?: InputMaybe<Scalars['String']['input']>;
  unitPrice: Scalars['Float']['input'];
};

export type InvoiceLineItemType = {
  __typename?: 'InvoiceLineItemType';
  chargeType?: Maybe<ChargeTypeType>;
  description?: Maybe<Scalars['String']['output']>;
  discountPct: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lineTotal: Scalars['String']['output'];
  quantity: Scalars['Float']['output'];
  taxRate: Scalars['String']['output'];
  taxType?: Maybe<Scalars['String']['output']>;
  unitPrice: Scalars['String']['output'];
};

/** Invoice status options */
export type InvoiceStatus =
  | 'CANCELLED'
  | 'DRAFT'
  | 'OVERDUE'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'SENT'
  | 'VOID';

export type InvoiceType = {
  __typename?: 'InvoiceType';
  balanceDue: Scalars['String']['output'];
  billingPeriod?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  discountAmount: Scalars['String']['output'];
  dueDate: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  internalNotes?: Maybe<Scalars['String']['output']>;
  invoiceDate: Scalars['DateTime']['output'];
  invoiceNumber: Scalars['String']['output'];
  lineItems: Array<InvoiceLineItemType>;
  member?: Maybe<MemberSummaryBillingType>;
  notes?: Maybe<Scalars['String']['output']>;
  paidAmount: Scalars['String']['output'];
  paidDate?: Maybe<Scalars['DateTime']['output']>;
  payments?: Maybe<Array<PaymentAllocationSummaryType>>;
  sentAt?: Maybe<Scalars['DateTime']['output']>;
  status: InvoiceStatus;
  subtotal: Scalars['String']['output'];
  taxAmount: Scalars['String']['output'];
  totalAmount: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  viewedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type InvoiceTypeEdge = {
  __typename?: 'InvoiceTypeEdge';
  cursor: Scalars['String']['output'];
  node: InvoiceType;
};

export type JoinWaitlistInput = {
  facilityId?: InputMaybe<Scalars['ID']['input']>;
  memberId: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  requestedDate: Scalars['String']['input'];
  requestedTime: Scalars['String']['input'];
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

export type LotteryDrawResult = {
  __typename?: 'LotteryDrawResult';
  assignedCount: Scalars['Int']['output'];
  lottery?: Maybe<GolfLotteryType>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  totalRequests: Scalars['Int']['output'];
  waitlistedCount: Scalars['Int']['output'];
};

export type LotteryMutationResponse = {
  __typename?: 'LotteryMutationResponse';
  lottery?: Maybe<GolfLotteryType>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type LotteryRequestMutationResponse = {
  __typename?: 'LotteryRequestMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  request?: Maybe<GolfLotteryRequestType>;
  success: Scalars['Boolean']['output'];
};

/** Lottery request status */
export type LotteryRequestStatus =
  | 'ASSIGNED'
  | 'CANCELLED'
  | 'PENDING'
  | 'WAITLISTED';

/** Lottery status */
export type LotteryStatus =
  | 'CLOSED'
  | 'DRAFT'
  | 'DRAWN'
  | 'OPEN'
  | 'PUBLISHED';

/** Type of lottery */
export type LotteryType =
  | 'PRIME_TIME'
  | 'SPECIAL_EVENT';

export type MemberConnection = {
  __typename?: 'MemberConnection';
  edges: Array<MemberTypeEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type MemberStatsType = {
  __typename?: 'MemberStatsType';
  active: Scalars['Float']['output'];
  inactive: Scalars['Float']['output'];
  suspended: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
};

/** Member status options */
export type MemberStatus =
  | 'ACTIVE'
  | 'APPLICANT'
  | 'LAPSED'
  | 'LEAD'
  | 'PROSPECT'
  | 'REACTIVATED'
  | 'RESIGNED'
  | 'SUSPENDED'
  | 'TERMINATED';

export type MemberSummaryBillingType = {
  __typename?: 'MemberSummaryBillingType';
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  memberId: Scalars['String']['output'];
};

export type MemberSummaryType = {
  __typename?: 'MemberSummaryType';
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isPrimaryMember?: Maybe<Scalars['Boolean']['output']>;
  lastName: Scalars['String']['output'];
  memberId: Scalars['String']['output'];
};

export type MemberTransactionType = {
  __typename?: 'MemberTransactionType';
  amount: Scalars['String']['output'];
  date: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  invoiceNumber?: Maybe<Scalars['String']['output']>;
  runningBalance: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type MemberTransactionsType = {
  __typename?: 'MemberTransactionsType';
  currentBalance: Scalars['String']['output'];
  transactions: Array<MemberTransactionType>;
};

export type MemberType = {
  __typename?: 'MemberType';
  address?: Maybe<Scalars['String']['output']>;
  avatarUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  creditBalance: Scalars['String']['output'];
  dateOfBirth?: Maybe<Scalars['DateTime']['output']>;
  dependents?: Maybe<Array<DependentType>>;
  email?: Maybe<Scalars['String']['output']>;
  emergencyContact?: Maybe<Scalars['String']['output']>;
  emergencyPhone?: Maybe<Scalars['String']['output']>;
  expiryDate?: Maybe<Scalars['DateTime']['output']>;
  firstName: Scalars['String']['output'];
  gender?: Maybe<Scalars['String']['output']>;
  household?: Maybe<HouseholdType>;
  id: Scalars['ID']['output'];
  idNumber?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  isPrimaryMember: Scalars['Boolean']['output'];
  joinDate: Scalars['DateTime']['output'];
  lastName: Scalars['String']['output'];
  memberId: Scalars['String']['output'];
  membershipTier?: Maybe<MembershipTierType>;
  membershipType?: Maybe<MembershipTypeType>;
  nationality?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  outstandingBalance: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  referredBy?: Maybe<MemberSummaryType>;
  renewalDate?: Maybe<Scalars['DateTime']['output']>;
  status: MemberStatus;
  tags: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type MemberTypeEdge = {
  __typename?: 'MemberTypeEdge';
  cursor: Scalars['String']['output'];
  node: MemberType;
};

export type MembershipApplicationType = {
  __typename?: 'MembershipApplicationType';
  applicationNumber: Scalars['String']['output'];
  approvedAt?: Maybe<Scalars['DateTime']['output']>;
  approvedBy?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  membershipType: ApplicationMembershipTypeType;
  phone?: Maybe<Scalars['String']['output']>;
  rejectedAt?: Maybe<Scalars['DateTime']['output']>;
  rejectedBy?: Maybe<Scalars['String']['output']>;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  reviewNotes?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedBy?: Maybe<Scalars['String']['output']>;
  sponsor?: Maybe<ApplicationSponsorType>;
  status: ApplicationStatus;
  submittedAt: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
  withdrawnAt?: Maybe<Scalars['DateTime']['output']>;
};

export type MembershipApplicationTypeEdge = {
  __typename?: 'MembershipApplicationTypeEdge';
  cursor: Scalars['String']['output'];
  node: MembershipApplicationType;
};

export type MembershipTierType = {
  __typename?: 'MembershipTierType';
  code: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type MembershipTypeType = {
  __typename?: 'MembershipTypeType';
  allowFamilyMembers: Scalars['Boolean']['output'];
  allowGuests: Scalars['Boolean']['output'];
  annualFee?: Maybe<Scalars['Float']['output']>;
  bookingAdvanceDays: Scalars['Float']['output'];
  code: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  joiningFee?: Maybe<Scalars['Float']['output']>;
  maxFamilyMembers: Scalars['Float']['output'];
  maxGuestsPerBooking: Scalars['Float']['output'];
  monthlyFee?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  priorityBooking: Scalars['Boolean']['output'];
};

export type MoveTeeTimeInput = {
  newCourseId?: InputMaybe<Scalars['ID']['input']>;
  newTeeDate: Scalars['DateTime']['input'];
  newTeeTime: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Accept a waitlist offer */
  acceptWaitlistOffer: WaitlistResponseType;
  /** Add players to a group booking */
  addGroupPlayers: GroupBookingMutationResponse;
  /** Auto-assign players to flights */
  assignFlights: GroupBookingFlightsResponse;
  /** Cancel a booking */
  cancelBooking: CancelBookingResponseType;
  /** Cancel a group booking */
  cancelGroupBooking: GroupBookingMutationResponse;
  /** Cancel a lottery request */
  cancelLotteryRequest: LotteryRequestMutationResponse;
  /** Cancel a tee time */
  cancelTeeTime: CancelResponseType;
  /** Cancel a waitlist entry */
  cancelWaitlistEntry: WaitlistMutationResponse;
  /** Change the status of a membership application */
  changeApplicationStatus: MembershipApplicationType;
  /** Change member status */
  changeMemberStatus: MemberType;
  /** Check in a booking */
  checkIn: CheckInResponseType;
  /** Close a lottery to new requests */
  closeLottery: LotteryMutationResponse;
  /** Confirm group booking and create tee times */
  confirmGroupBooking: GroupBookingMutationResponse;
  /** Convert a waitlist entry to a booking */
  convertWaitlistToBooking: WaitlistMutationResponse;
  /** Create a new membership application */
  createApplication: MembershipApplicationType;
  /** Create a new booking */
  createBooking: CreateBookingResponseType;
  /** Create a course schedule */
  createCourseSchedule: ScheduleMutationResponse;
  /** Create default schedule configuration for a course */
  createDefaultScheduleConfig: ScheduleConfigMutationResponse;
  /** Add a dependent to a member */
  createDependent: DependentType;
  /** Create a new facility */
  createFacility: FacilityResponseType;
  /** Create a group booking */
  createGroupBooking: GroupBookingMutationResponse;
  /** Create a new invoice */
  createInvoice: InvoiceType;
  /** Create a lottery */
  createLottery: LotteryMutationResponse;
  /** Create a new member */
  createMember: MemberType;
  /** Create a season */
  createSeason: SeasonMutationResponse;
  /** Create a new service */
  createService: ServiceResponseType;
  /** Create a special day */
  createSpecialDay: SpecialDayMutationResponse;
  /** Create a new staff member */
  createStaffMember: StaffResponseType;
  /** Create a new tee time booking */
  createTeeTime: TeeTimeType;
  /** Create a tee time block */
  createTeeTimeBlock: BlockMutationResponse;
  /** Create a time period */
  createTimePeriod: TimePeriodMutationResponse;
  /** Add to waitlist */
  createWaitlistEntry: WaitlistMutationResponse;
  /** Decline a waitlist offer */
  declineWaitlistOffer: WaitlistResponseType;
  /** Delete a course schedule */
  deleteCourseSchedule: ScheduleMutationResponse;
  /** Delete a dependent */
  deleteDependent: DeleteDependentResponseType;
  /** Delete a facility */
  deleteFacility: DeleteResponseType;
  /** Delete a draft group booking */
  deleteGroupBooking: GroupBookingMutationResponse;
  /** Delete a draft lottery */
  deleteLottery: LotteryMutationResponse;
  /** Soft delete a member */
  deleteMember: DeleteMemberResponseType;
  /** Delete a season */
  deleteSeason: DeleteMutationResponse;
  /** Delete a service */
  deleteService: DeleteResponseType;
  /** Delete a special day */
  deleteSpecialDay: DeleteMutationResponse;
  /** Delete a staff member */
  deleteStaffMember: DeleteResponseType;
  /** Delete a tee time block */
  deleteTeeTimeBlock: BlockMutationResponse;
  /** Delete a time period */
  deleteTimePeriod: DeleteMutationResponse;
  /** Delete a waitlist entry */
  deleteWaitlistEntry: WaitlistMutationResponse;
  /** Execute the lottery draw */
  executeLotteryDraw: LotteryDrawResult;
  /** Mark expired waitlist entries */
  expireOldWaitlistEntries: WaitlistMutationResponse;
  /** Import players from CSV data */
  importPlayersFromCSV: GroupBookingMutationResponse;
  /** Join a waitlist */
  joinWaitlist: WaitlistResponseType;
  /** Move a tee time to a different slot */
  moveTeeTime: TeeTimeType;
  /** Notify waitlist when a tee time is cancelled */
  notifyWaitlistForCancellation: WaitlistNotificationResult;
  /** Open a lottery for requests */
  openLottery: LotteryMutationResponse;
  /** Publish lottery results and create tee times */
  publishLotteryResults: LotteryMutationResponse;
  /** Record a payment */
  recordPayment: PaymentType;
  /** Remove entry from waitlist */
  removeFromWaitlist: WaitlistResponseType;
  /** Remove a player from a group booking */
  removeGroupPlayer: GroupBookingMutationResponse;
  /** Reschedule a booking */
  rescheduleBooking: CreateBookingResponseType;
  /** Send an invoice */
  sendInvoice: InvoiceType;
  /** Send offer to waitlist entry */
  sendWaitlistOffer: WaitlistResponseType;
  /** Submit a lottery request (member) */
  submitLotteryRequest: LotteryRequestMutationResponse;
  /** Update an existing membership application */
  updateApplication: MembershipApplicationType;
  /** Update a course schedule */
  updateCourseSchedule: ScheduleMutationResponse;
  /** Update a dependent */
  updateDependent: DependentType;
  /** Update an existing facility */
  updateFacility: FacilityResponseType;
  /** Update a group booking */
  updateGroupBooking: GroupBookingMutationResponse;
  /** Update a lottery */
  updateLottery: LotteryMutationResponse;
  /** Update an existing member */
  updateMember: MemberType;
  /** Update a single player rental status (cart/caddy) */
  updatePlayerRentalStatus: TeeTimePlayerType;
  /** Update schedule configuration */
  updateScheduleConfig: ScheduleConfigMutationResponse;
  /** Update a season */
  updateSeason: SeasonMutationResponse;
  /** Update an existing service */
  updateService: ServiceResponseType;
  /** Update a special day */
  updateSpecialDay: SpecialDayMutationResponse;
  /** Update a staff member */
  updateStaffMember: StaffResponseType;
  /** Update an existing tee time */
  updateTeeTime: TeeTimeType;
  /** Update a tee time block */
  updateTeeTimeBlock: BlockMutationResponse;
  /** Update players for an existing tee time (with proper capacity check) */
  updateTeeTimePlayers: TeeTimeType;
  /** Update a time period */
  updateTimePeriod: TimePeriodMutationResponse;
  /** Update a waitlist entry */
  updateWaitlistEntry: WaitlistMutationResponse;
  /** Void an invoice */
  voidInvoice: InvoiceType;
};


export type MutationAcceptWaitlistOfferArgs = {
  input: WaitlistActionInput;
};


export type MutationAddGroupPlayersArgs = {
  id: Scalars['ID']['input'];
  input: AddGroupPlayersInput;
};


export type MutationAssignFlightsArgs = {
  id: Scalars['ID']['input'];
  interval?: Scalars['Float']['input'];
};


export type MutationCancelBookingArgs = {
  input: CancelBookingInput;
};


export type MutationCancelGroupBookingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCancelLotteryRequestArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCancelTeeTimeArgs = {
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCancelWaitlistEntryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationChangeApplicationStatusArgs = {
  id: Scalars['ID']['input'];
  input: ChangeApplicationStatusInput;
};


export type MutationChangeMemberStatusArgs = {
  id: Scalars['ID']['input'];
  input: ChangeStatusInput;
};


export type MutationCheckInArgs = {
  input: CheckInInput;
};


export type MutationCloseLotteryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationConfirmGroupBookingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationConvertWaitlistToBookingArgs = {
  id: Scalars['ID']['input'];
  teeTimeId: Scalars['ID']['input'];
};


export type MutationCreateApplicationArgs = {
  input: CreateApplicationInput;
};


export type MutationCreateBookingArgs = {
  input: CreateBookingInput;
};


export type MutationCreateCourseScheduleArgs = {
  input: CreateScheduleInput;
};


export type MutationCreateDefaultScheduleConfigArgs = {
  courseId: Scalars['ID']['input'];
};


export type MutationCreateDependentArgs = {
  input: CreateDependentInput;
};


export type MutationCreateFacilityArgs = {
  input: CreateFacilityInput;
};


export type MutationCreateGroupBookingArgs = {
  input: CreateGroupBookingInput;
};


export type MutationCreateInvoiceArgs = {
  input: CreateInvoiceInput;
};


export type MutationCreateLotteryArgs = {
  input: CreateLotteryInput;
};


export type MutationCreateMemberArgs = {
  input: CreateMemberInput;
};


export type MutationCreateSeasonArgs = {
  input: CreateSeasonInput;
  scheduleId: Scalars['ID']['input'];
};


export type MutationCreateServiceArgs = {
  input: CreateServiceInput;
};


export type MutationCreateSpecialDayArgs = {
  input: CreateSpecialDayInput;
  scheduleId: Scalars['ID']['input'];
};


export type MutationCreateStaffMemberArgs = {
  input: CreateStaffMemberInput;
};


export type MutationCreateTeeTimeArgs = {
  input: CreateTeeTimeInput;
};


export type MutationCreateTeeTimeBlockArgs = {
  input: CreateBlockInput;
};


export type MutationCreateTimePeriodArgs = {
  input: CreateTimePeriodInput;
  scheduleId: Scalars['ID']['input'];
};


export type MutationCreateWaitlistEntryArgs = {
  input: CreateWaitlistEntryInput;
};


export type MutationDeclineWaitlistOfferArgs = {
  input: WaitlistActionInput;
};


export type MutationDeleteCourseScheduleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteDependentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteFacilityArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteGroupBookingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteLotteryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteMemberArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSeasonArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteServiceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSpecialDayArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteStaffMemberArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTeeTimeBlockArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTimePeriodArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWaitlistEntryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationExecuteLotteryDrawArgs = {
  id: Scalars['ID']['input'];
};


export type MutationImportPlayersFromCsvArgs = {
  id: Scalars['ID']['input'];
  input: ImportPlayersFromCsvInput;
};


export type MutationJoinWaitlistArgs = {
  input: JoinWaitlistInput;
};


export type MutationMoveTeeTimeArgs = {
  id: Scalars['ID']['input'];
  input: MoveTeeTimeInput;
};


export type MutationNotifyWaitlistForCancellationArgs = {
  availableSpots?: Scalars['Float']['input'];
  courseId: Scalars['ID']['input'];
  date: Scalars['DateTime']['input'];
  time: Scalars['String']['input'];
};


export type MutationOpenLotteryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPublishLotteryResultsArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRecordPaymentArgs = {
  input: CreatePaymentInput;
};


export type MutationRemoveFromWaitlistArgs = {
  input: WaitlistActionInput;
};


export type MutationRemoveGroupPlayerArgs = {
  groupBookingId: Scalars['ID']['input'];
  playerId: Scalars['ID']['input'];
};


export type MutationRescheduleBookingArgs = {
  input: RescheduleBookingInput;
};


export type MutationSendInvoiceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSendWaitlistOfferArgs = {
  input: SendWaitlistOfferInput;
};


export type MutationSubmitLotteryRequestArgs = {
  input: CreateLotteryRequestInput;
};


export type MutationUpdateApplicationArgs = {
  id: Scalars['ID']['input'];
  input: UpdateApplicationInput;
};


export type MutationUpdateCourseScheduleArgs = {
  id: Scalars['ID']['input'];
  input: UpdateScheduleInput;
};


export type MutationUpdateDependentArgs = {
  id: Scalars['ID']['input'];
  input: UpdateDependentInput;
};


export type MutationUpdateFacilityArgs = {
  input: UpdateFacilityInput;
};


export type MutationUpdateGroupBookingArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGroupBookingInput;
};


export type MutationUpdateLotteryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateLotteryInput;
};


export type MutationUpdateMemberArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMemberInput;
};


export type MutationUpdatePlayerRentalStatusArgs = {
  input: UpdatePlayerRentalStatusInput;
  playerId: Scalars['ID']['input'];
};


export type MutationUpdateScheduleConfigArgs = {
  id: Scalars['ID']['input'];
  input: UpdateScheduleConfigInput;
};


export type MutationUpdateSeasonArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSeasonInput;
};


export type MutationUpdateServiceArgs = {
  input: UpdateServiceInput;
};


export type MutationUpdateSpecialDayArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSpecialDayInput;
};


export type MutationUpdateStaffMemberArgs = {
  input: UpdateStaffMemberInput;
};


export type MutationUpdateTeeTimeArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTeeTimeInput;
};


export type MutationUpdateTeeTimeBlockArgs = {
  id: Scalars['ID']['input'];
  input: UpdateBlockInput;
};


export type MutationUpdateTeeTimePlayersArgs = {
  id: Scalars['ID']['input'];
  players: Array<TeeTimePlayerInput>;
};


export type MutationUpdateTimePeriodArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTimePeriodInput;
};


export type MutationUpdateWaitlistEntryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateWaitlistEntryInput;
};


export type MutationVoidInvoiceArgs = {
  id: Scalars['ID']['input'];
  input: VoidInvoiceInput;
};

/** Which nine holes (front or back) for crossover mode */
export type NineType =
  | 'BACK'
  | 'FRONT';

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PaymentAllocationInput = {
  amount: Scalars['Float']['input'];
  invoiceId: Scalars['ID']['input'];
};

export type PaymentAllocationSummaryType = {
  __typename?: 'PaymentAllocationSummaryType';
  amount: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  payment: PaymentSummaryType;
};

/** Payment method options */
export type PaymentMethod =
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'CHECK'
  | 'CREDIT_CARD'
  | 'DIRECT_DEBIT'
  | 'MOBILE_PAYMENT'
  | 'OTHER';

export type PaymentSummaryType = {
  __typename?: 'PaymentSummaryType';
  amount: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  method: PaymentMethod;
  paymentDate: Scalars['DateTime']['output'];
  receiptNumber: Scalars['String']['output'];
};

export type PaymentType = {
  __typename?: 'PaymentType';
  accountLast4?: Maybe<Scalars['String']['output']>;
  amount: Scalars['String']['output'];
  bankName?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  member?: Maybe<MemberSummaryBillingType>;
  method: PaymentMethod;
  notes?: Maybe<Scalars['String']['output']>;
  paymentDate: Scalars['DateTime']['output'];
  receiptNumber: Scalars['String']['output'];
  referenceNumber?: Maybe<Scalars['String']['output']>;
};

export type PaymentTypeEdge = {
  __typename?: 'PaymentTypeEdge';
  cursor: Scalars['String']['output'];
  node: PaymentType;
};

/** Golf play format (18 holes or cross-tee) */
export type PlayFormat =
  | 'CROSS_TEE'
  | 'EIGHTEEN_HOLE';

export type PlayerDependentType = {
  __typename?: 'PlayerDependentType';
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  /** Parent member UUID */
  memberId?: Maybe<Scalars['ID']['output']>;
  relationship: Scalars['String']['output'];
};

export type PlayerMemberType = {
  __typename?: 'PlayerMemberType';
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  memberId: Scalars['String']['output'];
};

/** Type of player in a tee time */
export type PlayerType =
  | 'DEPENDENT'
  | 'GUEST'
  | 'MEMBER'
  | 'WALK_UP';

/** Status of a player position in a tee time slot */
export type PositionStatus =
  | 'AVAILABLE'
  | 'BLOCKED'
  | 'BOOKED';

export type PriceModifierType = {
  __typename?: 'PriceModifierType';
  amount: Scalars['Float']['output'];
  isPercentage: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** Get active schedule for a course and date */
  activeSchedule?: Maybe<GolfCourseScheduleType>;
  /** Get a single membership application by ID */
  application: MembershipApplicationType;
  /** Get application statistics */
  applicationStats: ApplicationStatsType;
  /** Get paginated list of membership applications */
  applications: ApplicationConnection;
  /** Get billing statistics for the current month */
  billingStats: BillingStatsType;
  /** Get a single booking by ID */
  booking: BookingType;
  /** Get list of staff for booking */
  bookingStaff: Array<StaffType>;
  /** Get booking statistics for today */
  bookingStats: BookingStatsType;
  /** Get paginated list of bookings */
  bookings: BookingConnection;
  /** Get calendar data for a specific day */
  calendarDay: CalendarDayType;
  /** Get club golf settings including cart, rental, and caddy policies */
  clubGolfSettings?: Maybe<ClubGolfSettingsType>;
  /** Get schedules for a course */
  courseSchedules: Array<GolfCourseScheduleType>;
  /** Get all golf courses */
  courses: Array<GolfCourseType>;
  /** Get list of facilities */
  facilities: Array<FacilityType>;
  /** Generate a tee ticket for a tee time */
  generateTeeTicket?: Maybe<TeeTicketType>;
  /** Get the effective schedule for a specific date (with season/special day overrides applied) */
  getEffectiveScheduleForDate: EffectiveScheduleType;
  /** Get schedule configuration for a course. Creates default config if autoCreate is true. */
  getScheduleConfig?: Maybe<GolfScheduleConfigType>;
  /** Get a single group booking */
  groupBooking: GolfGroupBookingType;
  /** Get group bookings */
  groupBookings: Array<GolfGroupBookingType>;
  /** Get a single invoice by ID */
  invoice: InvoiceType;
  /** Get paginated list of invoices */
  invoices: InvoiceConnection;
  /** Get lotteries */
  lotteries: Array<GolfLotteryType>;
  /** Get a single lottery */
  lottery: GolfLotteryType;
  /** Get a single member by ID */
  member: MemberType;
  /** Get member dependents */
  memberDependents: Array<DependentType>;
  /** Get member statistics */
  memberStats: MemberStatsType;
  /** Get transaction history for a member */
  memberTransactions: MemberTransactionsType;
  /** Get paginated list of members */
  members: MemberConnection;
  /** Get all membership types */
  membershipTypes: Array<MembershipTypeType>;
  /** Get current member's invoices */
  myInvoices: InvoiceConnection;
  /** Get current user lottery requests */
  myLotteryRequests: Array<GolfLotteryRequestType>;
  /** Get the current user's member profile */
  myMember?: Maybe<MemberType>;
  /** Get current user waitlist entries */
  myWaitlistEntries: Array<GolfWaitlistType>;
  /** Get open lotteries for member portal */
  openLotteries: Array<GolfLotteryType>;
  /** Search for caddies by name or caddy number */
  searchCaddies: Array<CaddyType>;
  /** Get list of services */
  services: Array<ServiceType>;
  /** Get tee sheet for a course and date */
  teeSheet: Array<TeeSheetSlotType>;
  /** Get a single tee time by ID */
  teeTime: TeeTimeType;
  /** Get tee time blocks for a course */
  teeTimeBlocks: Array<TeeTimeBlockType>;
  /** Get paginated list of tee times */
  teeTimes: TeeTimeConnection;
  /** Validate a tee ticket by barcode */
  validateTeeTicket: TeeTicketValidationResult;
  /** Get waitlist entries */
  waitlist: WaitlistConnection;
  /** Get waitlist entries */
  waitlistEntries: Array<GolfWaitlistType>;
  /** Get a single waitlist entry */
  waitlistEntry: GolfWaitlistType;
  /** Get waitlist entries for a specific date/course */
  waitlistForDate: Array<GolfWaitlistType>;
  /** Get week view occupancy data showing player positions for each time slot */
  weekViewOccupancy: WeekViewOccupancyResponse;
};


export type QueryActiveScheduleArgs = {
  courseId: Scalars['ID']['input'];
  date: Scalars['DateTime']['input'];
};


export type QueryApplicationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryApplicationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<ApplicationStatus>;
};


export type QueryBookingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBookingStaffArgs = {
  filter?: InputMaybe<StaffFilterInput>;
};


export type QueryBookingsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  bookingType?: InputMaybe<BookingTypeEnum>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  facilityId?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  memberId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  staffId?: InputMaybe<Scalars['ID']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  statuses?: InputMaybe<Array<BookingStatus>>;
};


export type QueryCalendarDayArgs = {
  date: Scalars['String']['input'];
  facilityId?: InputMaybe<Scalars['ID']['input']>;
  resourceIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  statuses?: InputMaybe<Array<BookingStatus>>;
};


export type QueryCourseSchedulesArgs = {
  courseId: Scalars['ID']['input'];
};


export type QueryFacilitiesArgs = {
  filter?: InputMaybe<FacilityFilterInput>;
};


export type QueryGenerateTeeTicketArgs = {
  teeTimeId: Scalars['ID']['input'];
};


export type QueryGetEffectiveScheduleForDateArgs = {
  courseId: Scalars['ID']['input'];
  date: Scalars['DateTime']['input'];
};


export type QueryGetScheduleConfigArgs = {
  autoCreate?: InputMaybe<Scalars['Boolean']['input']>;
  courseId: Scalars['ID']['input'];
};


export type QueryGroupBookingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGroupBookingsArgs = {
  courseId?: InputMaybe<Scalars['ID']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<GroupBookingStatus>;
};


export type QueryInvoiceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInvoicesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  memberId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<InvoiceStatus>;
};


export type QueryLotteriesArgs = {
  courseId?: InputMaybe<Scalars['ID']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<LotteryStatus>;
};


export type QueryLotteryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMemberArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMemberDependentsArgs = {
  memberId: Scalars['ID']['input'];
};


export type QueryMemberTransactionsArgs = {
  memberId: Scalars['ID']['input'];
};


export type QueryMembersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  householdId?: InputMaybe<Scalars['ID']['input']>;
  membershipTypeId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<MemberStatus>;
};


export type QueryMyInvoicesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  memberId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<InvoiceStatus>;
};


export type QuerySearchCaddiesArgs = {
  courseId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryServicesArgs = {
  filter?: InputMaybe<ServiceFilterInput>;
};


export type QueryTeeSheetArgs = {
  courseId: Scalars['ID']['input'];
  date: Scalars['DateTime']['input'];
};


export type QueryTeeTimeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTeeTimeBlocksArgs = {
  blockType?: InputMaybe<BlockType>;
  courseId: Scalars['ID']['input'];
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryTeeTimesArgs = {
  courseId?: InputMaybe<Scalars['ID']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  memberId?: InputMaybe<Scalars['ID']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<TeeTimeStatus>;
};


export type QueryValidateTeeTicketArgs = {
  barcode: Scalars['String']['input'];
};


export type QueryWaitlistArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
  facilityId?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  serviceId?: InputMaybe<Scalars['ID']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryWaitlistEntriesArgs = {
  courseId?: InputMaybe<Scalars['ID']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<GolfWaitlistStatus>;
};


export type QueryWaitlistEntryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWaitlistForDateArgs = {
  courseId: Scalars['ID']['input'];
  date: Scalars['DateTime']['input'];
};


export type QueryWeekViewOccupancyArgs = {
  input: WeekViewOccupancyInput;
};

/** Rental club policy for golf bookings */
export type RentalPolicy =
  | 'OPTIONAL'
  | 'REQUIRED';

/** Status of rental item (cart/caddy) for a player */
export type RentalStatus =
  | 'ASSIGNED'
  | 'NONE'
  | 'PAID'
  | 'REQUESTED'
  | 'RETURNED';

export type RescheduleBookingInput = {
  id: Scalars['ID']['input'];
  newResourceId?: InputMaybe<Scalars['ID']['input']>;
  newStartTime: Scalars['String']['input'];
};

export type ResourceType = {
  __typename?: 'ResourceType';
  facility?: Maybe<FacilityType>;
  facilityId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type ResourceTypeEnum =
  | 'COURT'
  | 'POOL'
  | 'ROOM'
  | 'SPA'
  | 'STUDIO';

export type ScheduleConfigMutationResponse = {
  __typename?: 'ScheduleConfigMutationResponse';
  config?: Maybe<GolfScheduleConfigType>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type ScheduleMutationResponse = {
  __typename?: 'ScheduleMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  schedule?: Maybe<GolfCourseScheduleType>;
  success: Scalars['Boolean']['output'];
};

export type SeasonMutationResponse = {
  __typename?: 'SeasonMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  season?: Maybe<GolfSeasonType>;
  success: Scalars['Boolean']['output'];
};

export type SendWaitlistOfferInput = {
  entryId: Scalars['ID']['input'];
  expiresInHours?: InputMaybe<Scalars['Int']['input']>;
};

export type ServiceFilterInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ServiceResponseType = {
  __typename?: 'ServiceResponseType';
  error?: Maybe<Scalars['String']['output']>;
  service?: Maybe<ExtendedServiceType>;
  success: Scalars['Boolean']['output'];
};

export type ServiceType = {
  __typename?: 'ServiceType';
  basePrice: Scalars['Float']['output'];
  category: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  durationMinutes: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type ServiceVariationInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  priceModifier: Scalars['Float']['input'];
  priceType?: Scalars['String']['input'];
};

export type ServiceVariationType = {
  __typename?: 'ServiceVariationType';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  priceModifier: Scalars['Float']['output'];
  priceType: Scalars['String']['output'];
};

export type SpecialDayMutationResponse = {
  __typename?: 'SpecialDayMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  specialDay?: Maybe<GolfSpecialDayType>;
  success: Scalars['Boolean']['output'];
};

/** Type of special day */
export type SpecialDayType =
  | 'CLOSED'
  | 'CUSTOM'
  | 'HOLIDAY'
  | 'WEEKEND';

export type StaffCapabilityInput = {
  capability: Scalars['String']['input'];
  level?: Scalars['String']['input'];
};

export type StaffCapabilityType = {
  __typename?: 'StaffCapabilityType';
  capability: Scalars['String']['output'];
  level: Scalars['String']['output'];
};

export type StaffCertificationInput = {
  expiresAt: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type StaffCertificationType = {
  __typename?: 'StaffCertificationType';
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type StaffFilterInput = {
  availableOn?: InputMaybe<Scalars['String']['input']>;
  capability?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type StaffResponseType = {
  __typename?: 'StaffResponseType';
  error?: Maybe<Scalars['String']['output']>;
  staff?: Maybe<ExtendedStaffType>;
  success: Scalars['Boolean']['output'];
};

export type StaffType = {
  __typename?: 'StaffType';
  capabilities?: Maybe<Array<Scalars['String']['output']>>;
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  photoUrl?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
};

/** Tournament start format */
export type StartFormat =
  | 'SEQUENTIAL'
  | 'SHOTGUN';

export type Subscription = {
  __typename?: 'Subscription';
  /** Subscribe to tee time cancellations */
  teeTimeCancelled: TeeTimeType;
  /** Subscribe to tee time check-ins */
  teeTimeCheckedIn: TeeTimeType;
  /** Subscribe to new tee time creations */
  teeTimeCreated: TeeTimeType;
  /** Subscribe to tee time updates for a specific course and date */
  teeTimeUpdated: TeeTimeType;
};


export type SubscriptionTeeTimeCreatedArgs = {
  courseId?: InputMaybe<Scalars['ID']['input']>;
};


export type SubscriptionTeeTimeUpdatedArgs = {
  courseId?: InputMaybe<Scalars['ID']['input']>;
  date?: InputMaybe<Scalars['DateTime']['input']>;
};

export type TeeSheetBlockInfoType = {
  __typename?: 'TeeSheetBlockInfoType';
  blockType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  reason?: Maybe<Scalars['String']['output']>;
};

export type TeeSheetSlotType = {
  __typename?: 'TeeSheetSlotType';
  available: Scalars['Boolean']['output'];
  blockInfo?: Maybe<TeeSheetBlockInfoType>;
  blocked: Scalars['Boolean']['output'];
  booking?: Maybe<TeeTimeType>;
  courseId: Scalars['ID']['output'];
  date: Scalars['String']['output'];
  isPrimeTime: Scalars['Boolean']['output'];
  time: Scalars['String']['output'];
};

export type TeeTicketPlayerType = {
  __typename?: 'TeeTicketPlayerType';
  caddyName?: Maybe<Scalars['String']['output']>;
  cartType: Scalars['String']['output'];
  handicap?: Maybe<Scalars['Int']['output']>;
  memberId?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  position: Scalars['Int']['output'];
  type: Scalars['String']['output'];
};

export type TeeTicketType = {
  __typename?: 'TeeTicketType';
  barcode?: Maybe<Scalars['String']['output']>;
  caddyAssignment?: Maybe<Scalars['String']['output']>;
  cartAssignment?: Maybe<Scalars['String']['output']>;
  checkedInAt: Scalars['DateTime']['output'];
  checkedInBy: Scalars['String']['output'];
  clubLogo?: Maybe<Scalars['String']['output']>;
  clubName: Scalars['String']['output'];
  courseName: Scalars['String']['output'];
  holes: Scalars['Int']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  players: Array<TeeTicketPlayerType>;
  qrCode?: Maybe<Scalars['String']['output']>;
  teeDate: Scalars['DateTime']['output'];
  teeTime: Scalars['String']['output'];
  ticketNumber: Scalars['String']['output'];
};

export type TeeTicketValidationResult = {
  __typename?: 'TeeTicketValidationResult';
  message?: Maybe<Scalars['String']['output']>;
  teeTimeId?: Maybe<Scalars['ID']['output']>;
  valid: Scalars['Boolean']['output'];
};

export type TeeTimeBlockType = {
  __typename?: 'TeeTimeBlockType';
  blockType: BlockType;
  course?: Maybe<GolfCourseType>;
  courseId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  endTime: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isRecurring: Scalars['Boolean']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  recurringPattern?: Maybe<Scalars['String']['output']>;
  startTime: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type TeeTimeConnection = {
  __typename?: 'TeeTimeConnection';
  edges: Array<TeeTimeTypeEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type TeeTimePlayerInput = {
  caddyId?: InputMaybe<Scalars['ID']['input']>;
  caddyRequest?: InputMaybe<Scalars['String']['input']>;
  caddyStatus?: InputMaybe<RentalStatus>;
  /** Assigned cart ID */
  cartId?: InputMaybe<Scalars['ID']['input']>;
  cartRequest?: InputMaybe<Scalars['String']['input']>;
  cartStatus?: InputMaybe<RentalStatus>;
  cartType?: InputMaybe<CartType>;
  /** Dependent UUID (for DEPENDENT player type) */
  dependentId?: InputMaybe<Scalars['ID']['input']>;
  guestEmail?: InputMaybe<Scalars['String']['input']>;
  guestName?: InputMaybe<Scalars['String']['input']>;
  guestPhone?: InputMaybe<Scalars['String']['input']>;
  /** Member UUID (for MEMBER player type) */
  memberId?: InputMaybe<Scalars['ID']['input']>;
  playerType: PlayerType;
  position: Scalars['Int']['input'];
  rentalRequest?: InputMaybe<Scalars['String']['input']>;
  sharedWithPosition?: InputMaybe<Scalars['Int']['input']>;
};

export type TeeTimePlayerType = {
  __typename?: 'TeeTimePlayerType';
  caddy?: Maybe<CaddyType>;
  caddyRequest?: Maybe<Scalars['String']['output']>;
  caddyStatus?: Maybe<RentalStatus>;
  cartRequest?: Maybe<Scalars['String']['output']>;
  cartStatus?: Maybe<RentalStatus>;
  cartType: CartType;
  checkedInAt?: Maybe<Scalars['DateTime']['output']>;
  dependent?: Maybe<PlayerDependentType>;
  guestEmail?: Maybe<Scalars['String']['output']>;
  guestName?: Maybe<Scalars['String']['output']>;
  guestPhone?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  member?: Maybe<PlayerMemberType>;
  playerType: PlayerType;
  position: Scalars['Int']['output'];
  rentalRequest?: Maybe<Scalars['String']['output']>;
  sharedWithPosition?: Maybe<Scalars['Int']['output']>;
};

/** Tee time booking status */
export type TeeTimeStatus =
  | 'CANCELLED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'NO_SHOW'
  | 'PENDING';

export type TeeTimeType = {
  __typename?: 'TeeTimeType';
  bookingGroups?: Maybe<Array<BookingGroupType>>;
  course?: Maybe<GolfCourseType>;
  createdAt: Scalars['DateTime']['output'];
  holes: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  players: Array<TeeTimePlayerType>;
  startingHole: Scalars['Int']['output'];
  status: TeeTimeStatus;
  teeDate: Scalars['DateTime']['output'];
  teeTime: Scalars['String']['output'];
  teeTimeNumber: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type TeeTimeTypeEdge = {
  __typename?: 'TeeTimeTypeEdge';
  cursor: Scalars['String']['output'];
  node: TeeTimeType;
};

export type TierDiscountInput = {
  discountPercent: Scalars['Float']['input'];
  tierName: Scalars['String']['input'];
};

export type TierDiscountType = {
  __typename?: 'TierDiscountType';
  discountPercent: Scalars['Float']['output'];
  tierName: Scalars['String']['output'];
};

export type TimePeriodMutationResponse = {
  __typename?: 'TimePeriodMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  timePeriod?: Maybe<GolfTimePeriodType>;
};

/** Twilight calculation mode */
export type TwilightMode =
  | 'FIXED'
  | 'SUNSET';

export type UpdateApplicationInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  membershipTypeId?: InputMaybe<Scalars['ID']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  reviewNotes?: InputMaybe<Scalars['String']['input']>;
  sponsorId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateBlockInput = {
  blockType?: InputMaybe<BlockType>;
  endTime?: InputMaybe<Scalars['DateTime']['input']>;
  isRecurring?: InputMaybe<Scalars['Boolean']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  recurringPattern?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateDependentInput = {
  dateOfBirth?: InputMaybe<Scalars['DateTime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  relationship?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateFacilityInput = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  features?: InputMaybe<Array<Scalars['String']['input']>>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  operatingHours?: InputMaybe<Array<DayHoursInput>>;
  outletId?: InputMaybe<Scalars['ID']['input']>;
  revenueCenterId?: InputMaybe<Scalars['ID']['input']>;
  type?: InputMaybe<ResourceTypeEnum>;
};

export type UpdateGroupBookingInput = {
  eventDate?: InputMaybe<Scalars['DateTime']['input']>;
  groupName?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  startFormat?: InputMaybe<StartFormat>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<GroupBookingStatus>;
};

export type UpdateLotteryInput = {
  drawTime?: InputMaybe<Scalars['DateTime']['input']>;
  lotteryDate?: InputMaybe<Scalars['DateTime']['input']>;
  lotteryType?: InputMaybe<LotteryType>;
  maxRequestsPerMember?: InputMaybe<Scalars['Int']['input']>;
  requestWindowEnd?: InputMaybe<Scalars['DateTime']['input']>;
  requestWindowStart?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<LotteryStatus>;
  timeRangeEnd?: InputMaybe<Scalars['String']['input']>;
  timeRangeStart?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMemberInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['DateTime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emergencyContact?: InputMaybe<Scalars['String']['input']>;
  emergencyPhone?: InputMaybe<Scalars['String']['input']>;
  expiryDate?: InputMaybe<Scalars['DateTime']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  householdId?: InputMaybe<Scalars['ID']['input']>;
  idNumber?: InputMaybe<Scalars['String']['input']>;
  isPrimaryMember?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  membershipTierId?: InputMaybe<Scalars['ID']['input']>;
  membershipTypeId?: InputMaybe<Scalars['ID']['input']>;
  nationality?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdatePlayerRentalStatusInput = {
  caddyId?: InputMaybe<Scalars['ID']['input']>;
  caddyStatus?: InputMaybe<RentalStatus>;
  cartStatus?: InputMaybe<RentalStatus>;
};

export type UpdateScheduleConfigInput = {
  clubLatitude?: InputMaybe<Scalars['Float']['input']>;
  clubLongitude?: InputMaybe<Scalars['Float']['input']>;
  defaultBookingWindowDays?: InputMaybe<Scalars['Int']['input']>;
  twilightFixedDefault?: InputMaybe<Scalars['String']['input']>;
  twilightMinutesBeforeSunset?: InputMaybe<Scalars['Int']['input']>;
  twilightMode?: InputMaybe<TwilightMode>;
  weekdayBookingMode?: InputMaybe<BookingMode>;
  weekdayFirstTee?: InputMaybe<Scalars['String']['input']>;
  weekdayLastTee?: InputMaybe<Scalars['String']['input']>;
  weekendBookingMode?: InputMaybe<BookingMode>;
  weekendFirstTee?: InputMaybe<Scalars['String']['input']>;
  weekendLastTee?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateScheduleInput = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  firstTeeTime?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  lastTeeTime?: InputMaybe<Scalars['String']['input']>;
  paceOfPlay?: InputMaybe<Scalars['Int']['input']>;
  playFormat?: InputMaybe<PlayFormat>;
  seasonName?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateSeasonInput = {
  endDay?: InputMaybe<Scalars['Int']['input']>;
  endMonth?: InputMaybe<Scalars['Int']['input']>;
  isRecurring?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  overrideBookingWindow?: InputMaybe<Scalars['Int']['input']>;
  overrideFirstTee?: InputMaybe<Scalars['String']['input']>;
  overrideLastTee?: InputMaybe<Scalars['String']['input']>;
  overrideTimePeriods?: InputMaybe<Scalars['Boolean']['input']>;
  overrideTwilightTime?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  startDay?: InputMaybe<Scalars['Int']['input']>;
  startMonth?: InputMaybe<Scalars['Int']['input']>;
  weekdayBookingMode?: InputMaybe<BookingMode>;
  weekendBookingMode?: InputMaybe<BookingMode>;
};

export type UpdateServiceInput = {
  basePrice?: InputMaybe<Scalars['Float']['input']>;
  bufferMinutes?: InputMaybe<Scalars['Int']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxParticipants?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  requiredCapabilities?: InputMaybe<Array<Scalars['String']['input']>>;
  requiredFacilityFeatures?: InputMaybe<Array<Scalars['String']['input']>>;
  revenueCenterId?: InputMaybe<Scalars['ID']['input']>;
  tierDiscounts?: InputMaybe<Array<TierDiscountInput>>;
  variations?: InputMaybe<Array<ServiceVariationInput>>;
};

export type UpdateSpecialDayInput = {
  bookingMode?: InputMaybe<BookingMode>;
  customFirstTee?: InputMaybe<Scalars['String']['input']>;
  customLastTee?: InputMaybe<Scalars['String']['input']>;
  customTimePeriods?: InputMaybe<Scalars['Boolean']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  isRecurring?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<SpecialDayType>;
};

export type UpdateStaffMemberInput = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  capabilities?: InputMaybe<Array<StaffCapabilityInput>>;
  certifications?: InputMaybe<Array<StaffCertificationInput>>;
  defaultFacilityId?: InputMaybe<Scalars['ID']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
  workingHours?: InputMaybe<Array<DayHoursInput>>;
};

export type UpdateTeeTimeInput = {
  holes?: InputMaybe<Scalars['Int']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  players?: InputMaybe<Array<TeeTimePlayerInput>>;
  status?: InputMaybe<TeeTimeStatus>;
};

export type UpdateTimePeriodInput = {
  applicableDays?: InputMaybe<ApplicableDays>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  intervalMinutes?: InputMaybe<Scalars['Int']['input']>;
  isPrimeTime?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWaitlistEntryInput = {
  playerCount?: InputMaybe<Scalars['Int']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  requesterEmail?: InputMaybe<Scalars['String']['input']>;
  requesterName?: InputMaybe<Scalars['String']['input']>;
  requesterPhone?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<GolfWaitlistStatus>;
  timeRangeEnd?: InputMaybe<Scalars['String']['input']>;
  timeRangeStart?: InputMaybe<Scalars['String']['input']>;
};

export type VoidInvoiceInput = {
  reason: Scalars['String']['input'];
};

export type WaitlistActionInput = {
  entryId: Scalars['ID']['input'];
};

export type WaitlistConnection = {
  __typename?: 'WaitlistConnection';
  edges: Array<WaitlistEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type WaitlistEdge = {
  __typename?: 'WaitlistEdge';
  cursor: Scalars['String']['output'];
  node: WaitlistEntryType;
};

export type WaitlistEntryType = {
  __typename?: 'WaitlistEntryType';
  createdAt: Scalars['DateTime']['output'];
  facilityName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  member: BookingMemberType;
  notes?: Maybe<Scalars['String']['output']>;
  offerExpiresAt?: Maybe<Scalars['DateTime']['output']>;
  position: Scalars['Int']['output'];
  requestedDate: Scalars['DateTime']['output'];
  requestedTime: Scalars['String']['output'];
  serviceName?: Maybe<Scalars['String']['output']>;
  status: WaitlistStatus;
};

export type WaitlistMutationResponse = {
  __typename?: 'WaitlistMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  waitlistEntry?: Maybe<GolfWaitlistType>;
};

export type WaitlistNotificationResult = {
  __typename?: 'WaitlistNotificationResult';
  message?: Maybe<Scalars['String']['output']>;
  notifiedCount: Scalars['Int']['output'];
  notifiedEntries: Array<GolfWaitlistType>;
  success: Scalars['Boolean']['output'];
};

export type WaitlistResponseType = {
  __typename?: 'WaitlistResponseType';
  entry?: Maybe<WaitlistEntryType>;
  error?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type WaitlistStatus =
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'OFFER_SENT'
  | 'WAITING';

export type WeekViewOccupancyInput = {
  courseId: Scalars['ID']['input'];
  endDate: Scalars['String']['input'];
  /** Optional end time filter (HH:MM format, e.g., "12:00") */
  endTime?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['String']['input'];
  /** Optional start time filter (HH:MM format, e.g., "06:00") */
  startTime?: InputMaybe<Scalars['String']['input']>;
};

export type WeekViewOccupancyResponse = {
  __typename?: 'WeekViewOccupancyResponse';
  slots: Array<WeekViewSlotType>;
};

export type WeekViewPlayerType = {
  __typename?: 'WeekViewPlayerType';
  id: Scalars['ID']['output'];
  memberId?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: PlayerType;
};

export type WeekViewPositionType = {
  __typename?: 'WeekViewPositionType';
  player?: Maybe<WeekViewPlayerType>;
  position: Scalars['Int']['output'];
  status: PositionStatus;
};

export type WeekViewSlotType = {
  __typename?: 'WeekViewSlotType';
  date: Scalars['String']['output'];
  isBlocked: Scalars['Boolean']['output'];
  nine: NineType;
  positions: Array<WeekViewPositionType>;
  time: Scalars['String']['output'];
};

export type GetApplicationsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<ApplicationStatus>;
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetApplicationsQuery = { __typename?: 'Query', applications: { __typename?: 'ApplicationConnection', totalCount: number, edges: Array<{ __typename?: 'ApplicationEdge', cursor: string, node: { __typename?: 'MembershipApplicationType', id: string, applicationNumber: string, firstName: string, lastName: string, email: string, phone?: string | null | undefined, status: ApplicationStatus, submittedAt: string, reviewedAt?: string | null | undefined, reviewedBy?: string | null | undefined, approvedAt?: string | null | undefined, approvedBy?: string | null | undefined, rejectedAt?: string | null | undefined, rejectedBy?: string | null | undefined, withdrawnAt?: string | null | undefined, reviewNotes?: string | null | undefined, rejectionReason?: string | null | undefined, createdAt: string, updatedAt: string, membershipType: { __typename?: 'ApplicationMembershipTypeType', id: string, name: string, code: string, description?: string | null | undefined }, sponsor?: { __typename?: 'ApplicationSponsorType', id: string, memberId: string, firstName: string, lastName: string } | null | undefined } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null | undefined, endCursor?: string | null | undefined } } };

export type GetApplicationQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetApplicationQuery = { __typename?: 'Query', application: { __typename?: 'MembershipApplicationType', id: string, applicationNumber: string, firstName: string, lastName: string, email: string, phone?: string | null | undefined, status: ApplicationStatus, submittedAt: string, reviewedAt?: string | null | undefined, reviewedBy?: string | null | undefined, approvedAt?: string | null | undefined, approvedBy?: string | null | undefined, rejectedAt?: string | null | undefined, rejectedBy?: string | null | undefined, withdrawnAt?: string | null | undefined, reviewNotes?: string | null | undefined, rejectionReason?: string | null | undefined, createdAt: string, updatedAt: string, membershipType: { __typename?: 'ApplicationMembershipTypeType', id: string, name: string, code: string, description?: string | null | undefined }, sponsor?: { __typename?: 'ApplicationSponsorType', id: string, memberId: string, firstName: string, lastName: string, email?: string | null | undefined, phone?: string | null | undefined } | null | undefined } };

export type GetApplicationStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetApplicationStatsQuery = { __typename?: 'Query', applicationStats: { __typename?: 'ApplicationStatsType', submitted: number, underReview: number, pendingBoard: number, approved: number, rejected: number, total: number } };

export type CreateApplicationMutationVariables = Exact<{
  input: CreateApplicationInput;
}>;


export type CreateApplicationMutation = { __typename?: 'Mutation', createApplication: { __typename?: 'MembershipApplicationType', id: string, applicationNumber: string, firstName: string, lastName: string, email: string, phone?: string | null | undefined, status: ApplicationStatus, submittedAt: string, createdAt: string, membershipType: { __typename?: 'ApplicationMembershipTypeType', id: string, name: string, code: string }, sponsor?: { __typename?: 'ApplicationSponsorType', id: string, memberId: string, firstName: string, lastName: string } | null | undefined } };

export type UpdateApplicationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateApplicationInput;
}>;


export type UpdateApplicationMutation = { __typename?: 'Mutation', updateApplication: { __typename?: 'MembershipApplicationType', id: string, applicationNumber: string, firstName: string, lastName: string, email: string, phone?: string | null | undefined, status: ApplicationStatus, reviewNotes?: string | null | undefined, updatedAt: string, membershipType: { __typename?: 'ApplicationMembershipTypeType', id: string, name: string, code: string }, sponsor?: { __typename?: 'ApplicationSponsorType', id: string, memberId: string, firstName: string, lastName: string } | null | undefined } };

export type ChangeApplicationStatusMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: ChangeApplicationStatusInput;
}>;


export type ChangeApplicationStatusMutation = { __typename?: 'Mutation', changeApplicationStatus: { __typename?: 'MembershipApplicationType', id: string, applicationNumber: string, status: ApplicationStatus, reviewedAt?: string | null | undefined, reviewedBy?: string | null | undefined, approvedAt?: string | null | undefined, approvedBy?: string | null | undefined, rejectedAt?: string | null | undefined, rejectedBy?: string | null | undefined, withdrawnAt?: string | null | undefined, reviewNotes?: string | null | undefined, rejectionReason?: string | null | undefined, updatedAt: string } };

export type GetBillingStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBillingStatsQuery = { __typename?: 'Query', billingStats: { __typename?: 'BillingStatsType', totalRevenue: string, outstandingBalance: string, overdueAmount: string, invoiceCount: number, paidCount: number, overdueCount: number } };

export type GetMyInvoicesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<InvoiceStatus>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type GetMyInvoicesQuery = { __typename?: 'Query', myInvoices: { __typename?: 'InvoiceConnection', totalCount: number, edges: Array<{ __typename?: 'InvoiceTypeEdge', cursor: string, node: { __typename?: 'InvoiceType', id: string, invoiceNumber: string, invoiceDate: string, dueDate: string, billingPeriod?: string | null | undefined, subtotal: string, taxAmount: string, totalAmount: string, paidAmount: string, balanceDue: string, status: InvoiceStatus, sentAt?: string | null | undefined, paidDate?: string | null | undefined, lineItems: Array<{ __typename?: 'InvoiceLineItemType', id: string, description?: string | null | undefined, quantity: number, unitPrice: string, lineTotal: string, chargeType?: { __typename?: 'ChargeTypeType', id: string, name: string, code: string } | null | undefined }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null | undefined, endCursor?: string | null | undefined } } };

export type GetInvoicesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  memberId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<InvoiceStatus>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type GetInvoicesQuery = { __typename?: 'Query', invoices: { __typename?: 'InvoiceConnection', totalCount: number, edges: Array<{ __typename?: 'InvoiceTypeEdge', cursor: string, node: { __typename?: 'InvoiceType', id: string, invoiceNumber: string, invoiceDate: string, dueDate: string, billingPeriod?: string | null | undefined, subtotal: string, taxAmount: string, discountAmount: string, totalAmount: string, paidAmount: string, balanceDue: string, status: InvoiceStatus, sentAt?: string | null | undefined, paidDate?: string | null | undefined, member?: { __typename?: 'MemberSummaryBillingType', id: string, memberId: string, firstName: string, lastName: string } | null | undefined } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null | undefined, endCursor?: string | null | undefined } } };

export type GetInvoiceQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetInvoiceQuery = { __typename?: 'Query', invoice: { __typename?: 'InvoiceType', id: string, invoiceNumber: string, invoiceDate: string, dueDate: string, billingPeriod?: string | null | undefined, subtotal: string, taxAmount: string, discountAmount: string, totalAmount: string, paidAmount: string, balanceDue: string, status: InvoiceStatus, notes?: string | null | undefined, internalNotes?: string | null | undefined, sentAt?: string | null | undefined, viewedAt?: string | null | undefined, paidDate?: string | null | undefined, createdAt: string, updatedAt: string, member?: { __typename?: 'MemberSummaryBillingType', id: string, memberId: string, firstName: string, lastName: string } | null | undefined, lineItems: Array<{ __typename?: 'InvoiceLineItemType', id: string, description?: string | null | undefined, quantity: number, unitPrice: string, discountPct: string, taxType?: string | null | undefined, taxRate: string, lineTotal: string, chargeType?: { __typename?: 'ChargeTypeType', id: string, name: string, code: string, description?: string | null | undefined } | null | undefined }>, payments?: Array<{ __typename?: 'PaymentAllocationSummaryType', id: string, amount: string, payment: { __typename?: 'PaymentSummaryType', id: string, receiptNumber: string, amount: string, method: PaymentMethod, paymentDate: string } }> | null | undefined } };

export type GetMemberTransactionsQueryVariables = Exact<{
  memberId: Scalars['ID']['input'];
}>;


export type GetMemberTransactionsQuery = { __typename?: 'Query', memberTransactions: { __typename?: 'MemberTransactionsType', currentBalance: string, transactions: Array<{ __typename?: 'MemberTransactionType', id: string, date: string, type: string, description: string, invoiceNumber?: string | null | undefined, amount: string, runningBalance: string }> } };

export type CreateInvoiceMutationVariables = Exact<{
  input: CreateInvoiceInput;
}>;


export type CreateInvoiceMutation = { __typename?: 'Mutation', createInvoice: { __typename?: 'InvoiceType', id: string, invoiceNumber: string, totalAmount: string, status: InvoiceStatus } };

export type SendInvoiceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SendInvoiceMutation = { __typename?: 'Mutation', sendInvoice: { __typename?: 'InvoiceType', id: string, invoiceNumber: string, sentAt?: string | null | undefined, status: InvoiceStatus } };

export type VoidInvoiceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: VoidInvoiceInput;
}>;


export type VoidInvoiceMutation = { __typename?: 'Mutation', voidInvoice: { __typename?: 'InvoiceType', id: string, invoiceNumber: string, status: InvoiceStatus } };

export type RecordPaymentMutationVariables = Exact<{
  input: CreatePaymentInput;
}>;


export type RecordPaymentMutation = { __typename?: 'Mutation', recordPayment: { __typename?: 'PaymentType', id: string, receiptNumber: string, amount: string, method: PaymentMethod, paymentDate: string, member?: { __typename?: 'MemberSummaryBillingType', id: string, memberId: string, firstName: string, lastName: string } | null | undefined } };

export type GetBookingsQueryVariables = Exact<{
  facilityId?: InputMaybe<Scalars['ID']['input']>;
  staffId?: InputMaybe<Scalars['ID']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  statuses?: InputMaybe<Array<BookingStatus> | BookingStatus>;
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetBookingsQuery = { __typename?: 'Query', bookings: { __typename?: 'BookingConnection', totalCount: number, edges: Array<{ __typename?: 'BookingEdge', cursor: string, node: { __typename?: 'BookingType', id: string, bookingNumber: string, bookingType: BookingTypeEnum, status: BookingStatus, startTime: string, endTime: string, durationMinutes: number, guestCount?: number | null | undefined, notes?: string | null | undefined, createdAt: string, member: { __typename?: 'BookingMemberType', id: string, firstName: string, lastName: string, memberId: string, photoUrl?: string | null | undefined, status: string }, service?: { __typename?: 'ServiceType', id: string, name: string, category: string, durationMinutes: number, basePrice: number } | null | undefined, staff?: { __typename?: 'StaffType', id: string, firstName: string, lastName: string, photoUrl?: string | null | undefined, role?: string | null | undefined, isActive: boolean } | null | undefined, facility?: { __typename?: 'FacilityType', id: string, name: string, type: ResourceTypeEnum, location?: string | null | undefined, capacity?: number | null | undefined, isActive: boolean } | null | undefined, pricing?: { __typename?: 'BookingPricingType', basePrice: number, subtotal: number, tax?: number | null | undefined, total: number, modifiers: Array<{ __typename?: 'PriceModifierType', label: string, amount: number, isPercentage: boolean }> } | null | undefined } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null | undefined, endCursor?: string | null | undefined } } };

export type GetBookingQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetBookingQuery = { __typename?: 'Query', booking: { __typename?: 'BookingType', id: string, bookingNumber: string, bookingType: BookingTypeEnum, status: BookingStatus, startTime: string, endTime: string, durationMinutes: number, guestCount?: number | null | undefined, notes?: string | null | undefined, createdAt: string, member: { __typename?: 'BookingMemberType', id: string, firstName: string, lastName: string, memberId: string, photoUrl?: string | null | undefined, status: string }, service?: { __typename?: 'ServiceType', id: string, name: string, description?: string | null | undefined, category: string, durationMinutes: number, basePrice: number } | null | undefined, staff?: { __typename?: 'StaffType', id: string, firstName: string, lastName: string, photoUrl?: string | null | undefined, role?: string | null | undefined, isActive: boolean } | null | undefined, facility?: { __typename?: 'FacilityType', id: string, name: string, type: ResourceTypeEnum, location?: string | null | undefined, capacity?: number | null | undefined, isActive: boolean } | null | undefined, resource?: { __typename?: 'ResourceType', id: string, name: string, facilityId: string, isActive: boolean } | null | undefined, pricing?: { __typename?: 'BookingPricingType', basePrice: number, subtotal: number, tax?: number | null | undefined, total: number, modifiers: Array<{ __typename?: 'PriceModifierType', label: string, amount: number, isPercentage: boolean }> } | null | undefined } };

export type GetBookingStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBookingStatsQuery = { __typename?: 'Query', bookingStats: { __typename?: 'BookingStatsType', todayBookings: number, confirmedBookings: number, checkedInBookings: number, completedBookings: number, noShows: number, utilizationRate: number } };

export type GetCalendarDayQueryVariables = Exact<{
  date: Scalars['String']['input'];
  facilityId?: InputMaybe<Scalars['ID']['input']>;
  resourceIds?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
  statuses?: InputMaybe<Array<BookingStatus> | BookingStatus>;
}>;


export type GetCalendarDayQuery = { __typename?: 'Query', calendarDay: { __typename?: 'CalendarDayType', date: string, resources: Array<{ __typename?: 'CalendarResourceType', id: string, name: string, subtitle?: string | null | undefined, type: ResourceTypeEnum }>, bookings: Array<{ __typename?: 'CalendarBookingType', id: string, resourceId: string, bookingNumber: string, status: BookingStatus, startTime: string, endTime: string, bufferBefore?: number | null | undefined, bufferAfter?: number | null | undefined, memberName: string, memberPhotoUrl?: string | null | undefined, serviceName: string }> } };

export type CreateBookingMutationVariables = Exact<{
  input: CreateBookingInput;
}>;


export type CreateBookingMutation = { __typename?: 'Mutation', createBooking: { __typename?: 'CreateBookingResponseType', success: boolean, error?: string | null | undefined, booking?: { __typename?: 'BookingType', id: string, bookingNumber: string, status: BookingStatus, startTime: string, endTime: string, durationMinutes: number, member: { __typename?: 'BookingMemberType', id: string, firstName: string, lastName: string }, service?: { __typename?: 'ServiceType', id: string, name: string } | null | undefined, staff?: { __typename?: 'StaffType', id: string, firstName: string, lastName: string } | null | undefined, facility?: { __typename?: 'FacilityType', id: string, name: string } | null | undefined } | null | undefined } };

export type CancelBookingMutationVariables = Exact<{
  input: CancelBookingInput;
}>;


export type CancelBookingMutation = { __typename?: 'Mutation', cancelBooking: { __typename?: 'CancelBookingResponseType', success: boolean, message?: string | null | undefined, error?: string | null | undefined } };

export type RescheduleBookingMutationVariables = Exact<{
  input: RescheduleBookingInput;
}>;


export type RescheduleBookingMutation = { __typename?: 'Mutation', rescheduleBooking: { __typename?: 'CreateBookingResponseType', success: boolean, error?: string | null | undefined, booking?: { __typename?: 'BookingType', id: string, status: BookingStatus, startTime: string, endTime: string } | null | undefined } };

export type CheckInBookingMutationVariables = Exact<{
  input: CheckInInput;
}>;


export type CheckInBookingMutation = { __typename?: 'Mutation', checkIn: { __typename?: 'CheckInResponseType', success: boolean, error?: string | null | undefined, booking?: { __typename?: 'BookingType', id: string, status: BookingStatus } | null | undefined } };

export type GetFacilitiesQueryVariables = Exact<{
  filter?: InputMaybe<FacilityFilterInput>;
}>;


export type GetFacilitiesQuery = { __typename?: 'Query', facilities: Array<{ __typename?: 'FacilityType', id: string, name: string, type: ResourceTypeEnum, location?: string | null | undefined, capacity?: number | null | undefined, isActive: boolean }> };

export type CreateFacilityMutationVariables = Exact<{
  input: CreateFacilityInput;
}>;


export type CreateFacilityMutation = { __typename?: 'Mutation', createFacility: { __typename?: 'FacilityResponseType', success: boolean, error?: string | null | undefined, facility?: { __typename?: 'FacilityType', id: string, name: string, type: ResourceTypeEnum, location?: string | null | undefined, capacity?: number | null | undefined, isActive: boolean } | null | undefined } };

export type UpdateFacilityMutationVariables = Exact<{
  input: UpdateFacilityInput;
}>;


export type UpdateFacilityMutation = { __typename?: 'Mutation', updateFacility: { __typename?: 'FacilityResponseType', success: boolean, error?: string | null | undefined, facility?: { __typename?: 'FacilityType', id: string, name: string, type: ResourceTypeEnum, location?: string | null | undefined, capacity?: number | null | undefined, isActive: boolean } | null | undefined } };

export type DeleteFacilityMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteFacilityMutation = { __typename?: 'Mutation', deleteFacility: { __typename?: 'DeleteResponseType', success: boolean, message?: string | null | undefined, error?: string | null | undefined } };

export type GetServicesQueryVariables = Exact<{
  filter?: InputMaybe<ServiceFilterInput>;
}>;


export type GetServicesQuery = { __typename?: 'Query', services: Array<{ __typename?: 'ServiceType', id: string, name: string, category: string, description?: string | null | undefined, durationMinutes: number, basePrice: number, isActive: boolean }> };

export type CreateServiceMutationVariables = Exact<{
  input: CreateServiceInput;
}>;


export type CreateServiceMutation = { __typename?: 'Mutation', createService: { __typename?: 'ServiceResponseType', success: boolean, error?: string | null | undefined, service?: { __typename?: 'ExtendedServiceType', id: string, name: string, category: string, description?: string | null | undefined, durationMinutes: number, bufferMinutes?: number | null | undefined, basePrice: number, isActive: boolean, requiredCapabilities?: Array<string> | null | undefined, requiredFacilityFeatures?: Array<string> | null | undefined, tierDiscounts?: Array<{ __typename?: 'TierDiscountType', tierName: string, discountPercent: number }> | null | undefined, variations?: Array<{ __typename?: 'ServiceVariationType', id: string, name: string, priceModifier: number, priceType: string }> | null | undefined } | null | undefined } };

export type UpdateServiceMutationVariables = Exact<{
  input: UpdateServiceInput;
}>;


export type UpdateServiceMutation = { __typename?: 'Mutation', updateService: { __typename?: 'ServiceResponseType', success: boolean, error?: string | null | undefined, service?: { __typename?: 'ExtendedServiceType', id: string, name: string, category: string, description?: string | null | undefined, durationMinutes: number, bufferMinutes?: number | null | undefined, basePrice: number, isActive: boolean, requiredCapabilities?: Array<string> | null | undefined, requiredFacilityFeatures?: Array<string> | null | undefined, tierDiscounts?: Array<{ __typename?: 'TierDiscountType', tierName: string, discountPercent: number }> | null | undefined, variations?: Array<{ __typename?: 'ServiceVariationType', id: string, name: string, priceModifier: number, priceType: string }> | null | undefined } | null | undefined } };

export type DeleteServiceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteServiceMutation = { __typename?: 'Mutation', deleteService: { __typename?: 'DeleteResponseType', success: boolean, message?: string | null | undefined, error?: string | null | undefined } };

export type GetBookingStaffQueryVariables = Exact<{
  filter?: InputMaybe<StaffFilterInput>;
}>;


export type GetBookingStaffQuery = { __typename?: 'Query', bookingStaff: Array<{ __typename?: 'StaffType', id: string, firstName: string, lastName: string, photoUrl?: string | null | undefined, role?: string | null | undefined, capabilities?: Array<string> | null | undefined, isActive: boolean }> };

export type CreateStaffMemberMutationVariables = Exact<{
  input: CreateStaffMemberInput;
}>;


export type CreateStaffMemberMutation = { __typename?: 'Mutation', createStaffMember: { __typename?: 'StaffResponseType', success: boolean, error?: string | null | undefined, staff?: { __typename?: 'ExtendedStaffType', id: string, firstName: string, lastName: string, photoUrl?: string | null | undefined, email?: string | null | undefined, phone?: string | null | undefined, isActive: boolean, capabilities?: Array<string> | null | undefined, defaultFacilityId?: string | null | undefined, detailedCapabilities?: Array<{ __typename?: 'StaffCapabilityType', capability: string, level: string }> | null | undefined, certifications?: Array<{ __typename?: 'StaffCertificationType', id: string, name: string, expiresAt?: string | null | undefined, status: string }> | null | undefined, workingHours?: Array<{ __typename?: 'DayHoursType', dayOfWeek: string, isOpen: boolean, openTime?: string | null | undefined, closeTime?: string | null | undefined }> | null | undefined } | null | undefined } };

export type UpdateStaffMemberMutationVariables = Exact<{
  input: UpdateStaffMemberInput;
}>;


export type UpdateStaffMemberMutation = { __typename?: 'Mutation', updateStaffMember: { __typename?: 'StaffResponseType', success: boolean, error?: string | null | undefined, staff?: { __typename?: 'ExtendedStaffType', id: string, firstName: string, lastName: string, photoUrl?: string | null | undefined, email?: string | null | undefined, phone?: string | null | undefined, isActive: boolean, capabilities?: Array<string> | null | undefined, defaultFacilityId?: string | null | undefined, detailedCapabilities?: Array<{ __typename?: 'StaffCapabilityType', capability: string, level: string }> | null | undefined, certifications?: Array<{ __typename?: 'StaffCertificationType', id: string, name: string, expiresAt?: string | null | undefined, status: string }> | null | undefined, workingHours?: Array<{ __typename?: 'DayHoursType', dayOfWeek: string, isOpen: boolean, openTime?: string | null | undefined, closeTime?: string | null | undefined }> | null | undefined } | null | undefined } };

export type DeleteStaffMemberMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteStaffMemberMutation = { __typename?: 'Mutation', deleteStaffMember: { __typename?: 'DeleteResponseType', success: boolean, message?: string | null | undefined, error?: string | null | undefined } };

export type GetWaitlistQueryVariables = Exact<{
  facilityId?: InputMaybe<Scalars['ID']['input']>;
  serviceId?: InputMaybe<Scalars['ID']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetWaitlistQuery = { __typename?: 'Query', waitlist: { __typename?: 'WaitlistConnection', totalCount: number, edges: Array<{ __typename?: 'WaitlistEdge', cursor: string, node: { __typename?: 'WaitlistEntryType', id: string, requestedDate: string, requestedTime: string, status: WaitlistStatus, offerExpiresAt?: string | null | undefined, position: number, notes?: string | null | undefined, serviceName?: string | null | undefined, facilityName?: string | null | undefined, createdAt: string, member: { __typename?: 'BookingMemberType', id: string, firstName: string, lastName: string, memberId: string, photoUrl?: string | null | undefined } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type JoinWaitlistMutationVariables = Exact<{
  input: JoinWaitlistInput;
}>;


export type JoinWaitlistMutation = { __typename?: 'Mutation', joinWaitlist: { __typename?: 'WaitlistResponseType', success: boolean, error?: string | null | undefined, entry?: { __typename?: 'WaitlistEntryType', id: string, status: WaitlistStatus, requestedDate: string, requestedTime: string } | null | undefined } };

export type RemoveFromWaitlistMutationVariables = Exact<{
  input: WaitlistActionInput;
}>;


export type RemoveFromWaitlistMutation = { __typename?: 'Mutation', removeFromWaitlist: { __typename?: 'WaitlistResponseType', success: boolean, error?: string | null | undefined, entry?: { __typename?: 'WaitlistEntryType', id: string, status: WaitlistStatus } | null | undefined } };

export type SendWaitlistOfferMutationVariables = Exact<{
  input: SendWaitlistOfferInput;
}>;


export type SendWaitlistOfferMutation = { __typename?: 'Mutation', sendWaitlistOffer: { __typename?: 'WaitlistResponseType', success: boolean, error?: string | null | undefined, entry?: { __typename?: 'WaitlistEntryType', id: string, status: WaitlistStatus, offerExpiresAt?: string | null | undefined } | null | undefined } };

export type AcceptWaitlistOfferMutationVariables = Exact<{
  input: WaitlistActionInput;
}>;


export type AcceptWaitlistOfferMutation = { __typename?: 'Mutation', acceptWaitlistOffer: { __typename?: 'WaitlistResponseType', success: boolean, message?: string | null | undefined, error?: string | null | undefined, entry?: { __typename?: 'WaitlistEntryType', id: string, status: WaitlistStatus } | null | undefined } };

export type DeclineWaitlistOfferMutationVariables = Exact<{
  input: WaitlistActionInput;
}>;


export type DeclineWaitlistOfferMutation = { __typename?: 'Mutation', declineWaitlistOffer: { __typename?: 'WaitlistResponseType', success: boolean, message?: string | null | undefined, error?: string | null | undefined, entry?: { __typename?: 'WaitlistEntryType', id: string, status: WaitlistStatus } | null | undefined } };

export type GetTeeSheetQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
  date: Scalars['DateTime']['input'];
}>;


export type GetTeeSheetQuery = { __typename?: 'Query', teeSheet: Array<{ __typename?: 'TeeSheetSlotType', time: string, courseId: string, date: string, available: boolean, booking?: { __typename?: 'TeeTimeType', id: string, teeTimeNumber: string, teeDate: string, teeTime: string, holes: number, status: TeeTimeStatus, notes?: string | null | undefined, players: Array<{ __typename?: 'TeeTimePlayerType', id: string, position: number, playerType: PlayerType, guestName?: string | null | undefined, guestEmail?: string | null | undefined, guestPhone?: string | null | undefined, cartType: CartType, caddyRequest?: string | null | undefined, cartRequest?: string | null | undefined, rentalRequest?: string | null | undefined, cartStatus?: RentalStatus | null | undefined, caddyStatus?: RentalStatus | null | undefined, sharedWithPosition?: number | null | undefined, checkedInAt?: string | null | undefined, member?: { __typename?: 'PlayerMemberType', id: string, memberId: string, firstName: string, lastName: string } | null | undefined, caddy?: { __typename?: 'CaddyType', id: string, caddyNumber: string, firstName: string, lastName: string } | null | undefined }>, bookingGroups?: Array<{ __typename?: 'BookingGroupType', id: string, groupNumber: number, playerIds: Array<string>, bookedBy: { __typename?: 'BookingGroupBookedByType', id: string, name: string, memberId?: string | null | undefined } }> | null | undefined } | null | undefined }> };

export type GetCoursesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCoursesQuery = { __typename?: 'Query', courses: Array<{ __typename?: 'GolfCourseType', id: string, name: string, code: string, description?: string | null | undefined, holes: number, par: number, slope?: number | null | undefined, rating?: number | null | undefined, firstTeeTime: string, lastTeeTime: string, teeInterval: number, isActive: boolean }> };

export type GetTeeTimeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetTeeTimeQuery = { __typename?: 'Query', teeTime: { __typename?: 'TeeTimeType', id: string, teeTimeNumber: string, teeDate: string, teeTime: string, holes: number, status: TeeTimeStatus, notes?: string | null | undefined, createdAt: string, updatedAt: string, course?: { __typename?: 'GolfCourseType', id: string, name: string, code: string, holes: number, par: number } | null | undefined, players: Array<{ __typename?: 'TeeTimePlayerType', id: string, position: number, playerType: PlayerType, guestName?: string | null | undefined, guestEmail?: string | null | undefined, guestPhone?: string | null | undefined, cartType: CartType, caddyRequest?: string | null | undefined, cartRequest?: string | null | undefined, rentalRequest?: string | null | undefined, cartStatus?: RentalStatus | null | undefined, caddyStatus?: RentalStatus | null | undefined, sharedWithPosition?: number | null | undefined, checkedInAt?: string | null | undefined, member?: { __typename?: 'PlayerMemberType', id: string, memberId: string, firstName: string, lastName: string } | null | undefined, caddy?: { __typename?: 'CaddyType', id: string, caddyNumber: string, firstName: string, lastName: string, phone?: string | null | undefined, isActive: boolean } | null | undefined }> } };

export type GetTeeTimesQueryVariables = Exact<{
  courseId?: InputMaybe<Scalars['ID']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<TeeTimeStatus>;
  memberId?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetTeeTimesQuery = { __typename?: 'Query', teeTimes: { __typename?: 'TeeTimeConnection', totalCount: number, edges: Array<{ __typename?: 'TeeTimeTypeEdge', cursor: string, node: { __typename?: 'TeeTimeType', id: string, teeTimeNumber: string, teeDate: string, teeTime: string, holes: number, status: TeeTimeStatus, course?: { __typename?: 'GolfCourseType', id: string, name: string, code: string } | null | undefined, players: Array<{ __typename?: 'TeeTimePlayerType', id: string, position: number, playerType: PlayerType, guestName?: string | null | undefined, member?: { __typename?: 'PlayerMemberType', id: string, memberId: string, firstName: string, lastName: string } | null | undefined }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null | undefined, endCursor?: string | null | undefined } } };

export type CreateTeeTimeMutationVariables = Exact<{
  input: CreateTeeTimeInput;
}>;


export type CreateTeeTimeMutation = { __typename?: 'Mutation', createTeeTime: { __typename?: 'TeeTimeType', id: string, teeTimeNumber: string, teeDate: string, teeTime: string, holes: number, status: TeeTimeStatus, course?: { __typename?: 'GolfCourseType', id: string, name: string } | null | undefined, players: Array<{ __typename?: 'TeeTimePlayerType', id: string, position: number, playerType: PlayerType, guestName?: string | null | undefined, member?: { __typename?: 'PlayerMemberType', id: string, firstName: string, lastName: string } | null | undefined }> } };

export type UpdateTeeTimeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateTeeTimeInput;
}>;


export type UpdateTeeTimeMutation = { __typename?: 'Mutation', updateTeeTime: { __typename?: 'TeeTimeType', id: string, teeTimeNumber: string, status: TeeTimeStatus, updatedAt: string } };

export type UpdateTeeTimePlayersMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  players: Array<TeeTimePlayerInput> | TeeTimePlayerInput;
}>;


export type UpdateTeeTimePlayersMutation = { __typename?: 'Mutation', updateTeeTimePlayers: { __typename?: 'TeeTimeType', id: string, teeTimeNumber: string, teeDate: string, teeTime: string, holes: number, status: TeeTimeStatus, course?: { __typename?: 'GolfCourseType', id: string, name: string } | null | undefined, players: Array<{ __typename?: 'TeeTimePlayerType', id: string, position: number, playerType: PlayerType, guestName?: string | null | undefined, guestEmail?: string | null | undefined, guestPhone?: string | null | undefined, cartType: CartType, caddyRequest?: string | null | undefined, cartRequest?: string | null | undefined, rentalRequest?: string | null | undefined, cartStatus?: RentalStatus | null | undefined, caddyStatus?: RentalStatus | null | undefined, member?: { __typename?: 'PlayerMemberType', id: string, firstName: string, lastName: string } | null | undefined }> } };

export type CheckInTeeTimeMutationVariables = Exact<{
  input: CheckInInput;
}>;


export type CheckInTeeTimeMutation = { __typename?: 'Mutation', checkIn: { __typename?: 'CheckInResponseType', success: boolean, error?: string | null | undefined, booking?: { __typename?: 'BookingType', id: string, status: BookingStatus } | null | undefined } };

export type CancelTeeTimeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type CancelTeeTimeMutation = { __typename?: 'Mutation', cancelTeeTime: { __typename?: 'CancelResponseType', message: string } };

export type MoveTeeTimeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: MoveTeeTimeInput;
}>;


export type MoveTeeTimeMutation = { __typename?: 'Mutation', moveTeeTime: { __typename?: 'TeeTimeType', id: string, teeDate: string, teeTime: string, status: TeeTimeStatus, course?: { __typename?: 'GolfCourseType', id: string, name: string } | null | undefined } };

export type UpdatePlayerRentalStatusMutationVariables = Exact<{
  playerId: Scalars['ID']['input'];
  input: UpdatePlayerRentalStatusInput;
}>;


export type UpdatePlayerRentalStatusMutation = { __typename?: 'Mutation', updatePlayerRentalStatus: { __typename?: 'TeeTimePlayerType', id: string, position: number, playerType: PlayerType, cartStatus?: RentalStatus | null | undefined, caddyStatus?: RentalStatus | null | undefined, caddy?: { __typename?: 'CaddyType', id: string, caddyNumber: string, firstName: string, lastName: string } | null | undefined } };

export type GetWeekViewOccupancyQueryVariables = Exact<{
  input: WeekViewOccupancyInput;
}>;


export type GetWeekViewOccupancyQuery = { __typename?: 'Query', weekViewOccupancy: { __typename?: 'WeekViewOccupancyResponse', slots: Array<{ __typename?: 'WeekViewSlotType', date: string, time: string, nine: NineType, isBlocked: boolean, positions: Array<{ __typename?: 'WeekViewPositionType', position: number, status: PositionStatus, player?: { __typename?: 'WeekViewPlayerType', id: string, name: string, type: PlayerType, memberId?: string | null | undefined } | null | undefined }> }> } };

export type SearchCaddiesQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  courseId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type SearchCaddiesQuery = { __typename?: 'Query', searchCaddies: Array<{ __typename?: 'CaddyType', id: string, caddyNumber: string, firstName: string, lastName: string, phone?: string | null | undefined, isActive: boolean }> };

export type GetMyMemberQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyMemberQuery = { __typename?: 'Query', myMember?: { __typename?: 'MemberType', id: string, memberId: string, firstName: string, lastName: string, email?: string | null | undefined, phone?: string | null | undefined, dateOfBirth?: string | null | undefined, gender?: string | null | undefined, avatarUrl?: string | null | undefined, address?: string | null | undefined, nationality?: string | null | undefined, status: MemberStatus, joinDate: string, expiryDate?: string | null | undefined, renewalDate?: string | null | undefined, isPrimaryMember: boolean, creditBalance: string, outstandingBalance: string, notes?: string | null | undefined, isActive: boolean, membershipType?: { __typename?: 'MembershipTypeType', id: string, name: string, code: string, description?: string | null | undefined } | null | undefined, membershipTier?: { __typename?: 'MembershipTierType', id: string, name: string, code: string } | null | undefined, dependents?: Array<{ __typename?: 'DependentType', id: string, firstName: string, lastName: string, relationship: string, dateOfBirth?: string | null | undefined, email?: string | null | undefined, phone?: string | null | undefined, isActive: boolean }> | null | undefined } | null | undefined };

export type GetMembersQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<MemberStatus>;
  membershipTypeId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetMembersQuery = { __typename?: 'Query', members: { __typename?: 'MemberConnection', totalCount: number, edges: Array<{ __typename?: 'MemberTypeEdge', cursor: string, node: { __typename?: 'MemberType', id: string, memberId: string, firstName: string, lastName: string, email?: string | null | undefined, phone?: string | null | undefined, status: MemberStatus, joinDate: string, expiryDate?: string | null | undefined, isPrimaryMember: boolean, creditBalance: string, outstandingBalance: string, isActive: boolean, avatarUrl?: string | null | undefined, membershipType?: { __typename?: 'MembershipTypeType', id: string, name: string, code: string } | null | undefined, membershipTier?: { __typename?: 'MembershipTierType', id: string, name: string, code: string } | null | undefined } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null | undefined, endCursor?: string | null | undefined } } };

export type GetMemberQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetMemberQuery = { __typename?: 'Query', member: { __typename?: 'MemberType', id: string, memberId: string, firstName: string, lastName: string, email?: string | null | undefined, phone?: string | null | undefined, dateOfBirth?: string | null | undefined, gender?: string | null | undefined, avatarUrl?: string | null | undefined, address?: string | null | undefined, nationality?: string | null | undefined, idNumber?: string | null | undefined, emergencyContact?: string | null | undefined, emergencyPhone?: string | null | undefined, status: MemberStatus, joinDate: string, expiryDate?: string | null | undefined, renewalDate?: string | null | undefined, isPrimaryMember: boolean, creditBalance: string, outstandingBalance: string, notes?: string | null | undefined, tags: Array<string>, isActive: boolean, createdAt: string, updatedAt: string, membershipType?: { __typename?: 'MembershipTypeType', id: string, name: string, code: string, description?: string | null | undefined } | null | undefined, membershipTier?: { __typename?: 'MembershipTierType', id: string, name: string, code: string, description?: string | null | undefined } | null | undefined, household?: { __typename?: 'HouseholdType', id: string, name: string, address?: string | null | undefined, phone?: string | null | undefined, email?: string | null | undefined } | null | undefined, referredBy?: { __typename?: 'MemberSummaryType', id: string, memberId: string, firstName: string, lastName: string } | null | undefined, dependents?: Array<{ __typename?: 'DependentType', id: string, firstName: string, lastName: string, relationship: string, dateOfBirth?: string | null | undefined, email?: string | null | undefined, phone?: string | null | undefined, isActive: boolean }> | null | undefined } };

export type GetMemberStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMemberStatsQuery = { __typename?: 'Query', memberStats: { __typename?: 'MemberStatsType', total: number, active: number, suspended: number, inactive: number } };

export type CreateMemberMutationVariables = Exact<{
  input: CreateMemberInput;
}>;


export type CreateMemberMutation = { __typename?: 'Mutation', createMember: { __typename?: 'MemberType', id: string, memberId: string, firstName: string, lastName: string, email?: string | null | undefined, status: MemberStatus } };

export type UpdateMemberMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateMemberInput;
}>;


export type UpdateMemberMutation = { __typename?: 'Mutation', updateMember: { __typename?: 'MemberType', id: string, memberId: string, firstName: string, lastName: string, email?: string | null | undefined, status: MemberStatus, updatedAt: string } };

export type DeleteMemberMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteMemberMutation = { __typename?: 'Mutation', deleteMember: { __typename?: 'DeleteMemberResponseType', message: string } };

export type ChangeMemberStatusMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: ChangeStatusInput;
}>;


export type ChangeMemberStatusMutation = { __typename?: 'Mutation', changeMemberStatus: { __typename?: 'MemberType', id: string, memberId: string, status: MemberStatus, updatedAt: string } };

export type CreateDependentMutationVariables = Exact<{
  input: CreateDependentInput;
}>;


export type CreateDependentMutation = { __typename?: 'Mutation', createDependent: { __typename?: 'DependentType', id: string, firstName: string, lastName: string, relationship: string, dateOfBirth?: string | null | undefined, email?: string | null | undefined, phone?: string | null | undefined, isActive: boolean } };

export type UpdateDependentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateDependentInput;
}>;


export type UpdateDependentMutation = { __typename?: 'Mutation', updateDependent: { __typename?: 'DependentType', id: string, firstName: string, lastName: string, relationship: string, dateOfBirth?: string | null | undefined, email?: string | null | undefined, phone?: string | null | undefined, isActive: boolean } };

export type DeleteDependentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteDependentMutation = { __typename?: 'Mutation', deleteDependent: { __typename?: 'DeleteDependentResponseType', message: string } };



export const GetApplicationsDocument = `
    query GetApplications($first: Int, $skip: Int, $status: ApplicationStatus, $search: String) {
  applications(first: $first, skip: $skip, status: $status, search: $search) {
    edges {
      node {
        id
        applicationNumber
        firstName
        lastName
        email
        phone
        status
        submittedAt
        reviewedAt
        reviewedBy
        approvedAt
        approvedBy
        rejectedAt
        rejectedBy
        withdrawnAt
        reviewNotes
        rejectionReason
        membershipType {
          id
          name
          code
          description
        }
        sponsor {
          id
          memberId
          firstName
          lastName
        }
        createdAt
        updatedAt
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
    `;

export const useGetApplicationsQuery = <
      TData = GetApplicationsQuery,
      TError = unknown
    >(
      variables?: GetApplicationsQueryVariables,
      options?: Omit<UseQueryOptions<GetApplicationsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetApplicationsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetApplicationsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetApplications'] : ['GetApplications', variables],
    queryFn: graphqlFetcher<GetApplicationsQuery, GetApplicationsQueryVariables>(GetApplicationsDocument, variables),
    ...options
  }
    )};

useGetApplicationsQuery.getKey = (variables?: GetApplicationsQueryVariables) => variables === undefined ? ['GetApplications'] : ['GetApplications', variables];

export const useInfiniteGetApplicationsQuery = <
      TData = InfiniteData<GetApplicationsQuery>,
      TError = unknown
    >(
      variables: GetApplicationsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetApplicationsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetApplicationsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetApplicationsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetApplications.infinite'] : ['GetApplications.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetApplicationsQuery, GetApplicationsQueryVariables>(GetApplicationsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetApplicationsQuery.getKey = (variables?: GetApplicationsQueryVariables) => variables === undefined ? ['GetApplications.infinite'] : ['GetApplications.infinite', variables];


useGetApplicationsQuery.fetcher = (variables?: GetApplicationsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetApplicationsQuery, GetApplicationsQueryVariables>(GetApplicationsDocument, variables, options);

export const GetApplicationDocument = `
    query GetApplication($id: ID!) {
  application(id: $id) {
    id
    applicationNumber
    firstName
    lastName
    email
    phone
    status
    submittedAt
    reviewedAt
    reviewedBy
    approvedAt
    approvedBy
    rejectedAt
    rejectedBy
    withdrawnAt
    reviewNotes
    rejectionReason
    membershipType {
      id
      name
      code
      description
    }
    sponsor {
      id
      memberId
      firstName
      lastName
      email
      phone
    }
    createdAt
    updatedAt
  }
}
    `;

export const useGetApplicationQuery = <
      TData = GetApplicationQuery,
      TError = unknown
    >(
      variables: GetApplicationQueryVariables,
      options?: Omit<UseQueryOptions<GetApplicationQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetApplicationQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetApplicationQuery, TError, TData>(
      {
    queryKey: ['GetApplication', variables],
    queryFn: graphqlFetcher<GetApplicationQuery, GetApplicationQueryVariables>(GetApplicationDocument, variables),
    ...options
  }
    )};

useGetApplicationQuery.getKey = (variables: GetApplicationQueryVariables) => ['GetApplication', variables];

export const useInfiniteGetApplicationQuery = <
      TData = InfiniteData<GetApplicationQuery>,
      TError = unknown
    >(
      variables: GetApplicationQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetApplicationQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetApplicationQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetApplicationQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetApplication.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetApplicationQuery, GetApplicationQueryVariables>(GetApplicationDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetApplicationQuery.getKey = (variables: GetApplicationQueryVariables) => ['GetApplication.infinite', variables];


useGetApplicationQuery.fetcher = (variables: GetApplicationQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetApplicationQuery, GetApplicationQueryVariables>(GetApplicationDocument, variables, options);

export const GetApplicationStatsDocument = `
    query GetApplicationStats {
  applicationStats {
    submitted
    underReview
    pendingBoard
    approved
    rejected
    total
  }
}
    `;

export const useGetApplicationStatsQuery = <
      TData = GetApplicationStatsQuery,
      TError = unknown
    >(
      variables?: GetApplicationStatsQueryVariables,
      options?: Omit<UseQueryOptions<GetApplicationStatsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetApplicationStatsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetApplicationStatsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetApplicationStats'] : ['GetApplicationStats', variables],
    queryFn: graphqlFetcher<GetApplicationStatsQuery, GetApplicationStatsQueryVariables>(GetApplicationStatsDocument, variables),
    ...options
  }
    )};

useGetApplicationStatsQuery.getKey = (variables?: GetApplicationStatsQueryVariables) => variables === undefined ? ['GetApplicationStats'] : ['GetApplicationStats', variables];

export const useInfiniteGetApplicationStatsQuery = <
      TData = InfiniteData<GetApplicationStatsQuery>,
      TError = unknown
    >(
      variables: GetApplicationStatsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetApplicationStatsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetApplicationStatsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetApplicationStatsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetApplicationStats.infinite'] : ['GetApplicationStats.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetApplicationStatsQuery, GetApplicationStatsQueryVariables>(GetApplicationStatsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetApplicationStatsQuery.getKey = (variables?: GetApplicationStatsQueryVariables) => variables === undefined ? ['GetApplicationStats.infinite'] : ['GetApplicationStats.infinite', variables];


useGetApplicationStatsQuery.fetcher = (variables?: GetApplicationStatsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetApplicationStatsQuery, GetApplicationStatsQueryVariables>(GetApplicationStatsDocument, variables, options);

export const CreateApplicationDocument = `
    mutation CreateApplication($input: CreateApplicationInput!) {
  createApplication(input: $input) {
    id
    applicationNumber
    firstName
    lastName
    email
    phone
    status
    submittedAt
    membershipType {
      id
      name
      code
    }
    sponsor {
      id
      memberId
      firstName
      lastName
    }
    createdAt
  }
}
    `;

export const useCreateApplicationMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateApplicationMutation, TError, CreateApplicationMutationVariables, TContext>) => {
    
    return useMutation<CreateApplicationMutation, TError, CreateApplicationMutationVariables, TContext>(
      {
    mutationKey: ['CreateApplication'],
    mutationFn: (variables?: CreateApplicationMutationVariables) => graphqlFetcher<CreateApplicationMutation, CreateApplicationMutationVariables>(CreateApplicationDocument, variables)(),
    ...options
  }
    )};


useCreateApplicationMutation.fetcher = (variables: CreateApplicationMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateApplicationMutation, CreateApplicationMutationVariables>(CreateApplicationDocument, variables, options);

export const UpdateApplicationDocument = `
    mutation UpdateApplication($id: ID!, $input: UpdateApplicationInput!) {
  updateApplication(id: $id, input: $input) {
    id
    applicationNumber
    firstName
    lastName
    email
    phone
    status
    reviewNotes
    membershipType {
      id
      name
      code
    }
    sponsor {
      id
      memberId
      firstName
      lastName
    }
    updatedAt
  }
}
    `;

export const useUpdateApplicationMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateApplicationMutation, TError, UpdateApplicationMutationVariables, TContext>) => {
    
    return useMutation<UpdateApplicationMutation, TError, UpdateApplicationMutationVariables, TContext>(
      {
    mutationKey: ['UpdateApplication'],
    mutationFn: (variables?: UpdateApplicationMutationVariables) => graphqlFetcher<UpdateApplicationMutation, UpdateApplicationMutationVariables>(UpdateApplicationDocument, variables)(),
    ...options
  }
    )};


useUpdateApplicationMutation.fetcher = (variables: UpdateApplicationMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateApplicationMutation, UpdateApplicationMutationVariables>(UpdateApplicationDocument, variables, options);

export const ChangeApplicationStatusDocument = `
    mutation ChangeApplicationStatus($id: ID!, $input: ChangeApplicationStatusInput!) {
  changeApplicationStatus(id: $id, input: $input) {
    id
    applicationNumber
    status
    reviewedAt
    reviewedBy
    approvedAt
    approvedBy
    rejectedAt
    rejectedBy
    withdrawnAt
    reviewNotes
    rejectionReason
    updatedAt
  }
}
    `;

export const useChangeApplicationStatusMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ChangeApplicationStatusMutation, TError, ChangeApplicationStatusMutationVariables, TContext>) => {
    
    return useMutation<ChangeApplicationStatusMutation, TError, ChangeApplicationStatusMutationVariables, TContext>(
      {
    mutationKey: ['ChangeApplicationStatus'],
    mutationFn: (variables?: ChangeApplicationStatusMutationVariables) => graphqlFetcher<ChangeApplicationStatusMutation, ChangeApplicationStatusMutationVariables>(ChangeApplicationStatusDocument, variables)(),
    ...options
  }
    )};


useChangeApplicationStatusMutation.fetcher = (variables: ChangeApplicationStatusMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ChangeApplicationStatusMutation, ChangeApplicationStatusMutationVariables>(ChangeApplicationStatusDocument, variables, options);

export const GetBillingStatsDocument = `
    query GetBillingStats {
  billingStats {
    totalRevenue
    outstandingBalance
    overdueAmount
    invoiceCount
    paidCount
    overdueCount
  }
}
    `;

export const useGetBillingStatsQuery = <
      TData = GetBillingStatsQuery,
      TError = unknown
    >(
      variables?: GetBillingStatsQueryVariables,
      options?: Omit<UseQueryOptions<GetBillingStatsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetBillingStatsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetBillingStatsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetBillingStats'] : ['GetBillingStats', variables],
    queryFn: graphqlFetcher<GetBillingStatsQuery, GetBillingStatsQueryVariables>(GetBillingStatsDocument, variables),
    ...options
  }
    )};

useGetBillingStatsQuery.getKey = (variables?: GetBillingStatsQueryVariables) => variables === undefined ? ['GetBillingStats'] : ['GetBillingStats', variables];

export const useInfiniteGetBillingStatsQuery = <
      TData = InfiniteData<GetBillingStatsQuery>,
      TError = unknown
    >(
      variables: GetBillingStatsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetBillingStatsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetBillingStatsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetBillingStatsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetBillingStats.infinite'] : ['GetBillingStats.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetBillingStatsQuery, GetBillingStatsQueryVariables>(GetBillingStatsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetBillingStatsQuery.getKey = (variables?: GetBillingStatsQueryVariables) => variables === undefined ? ['GetBillingStats.infinite'] : ['GetBillingStats.infinite', variables];


useGetBillingStatsQuery.fetcher = (variables?: GetBillingStatsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetBillingStatsQuery, GetBillingStatsQueryVariables>(GetBillingStatsDocument, variables, options);

export const GetMyInvoicesDocument = `
    query GetMyInvoices($first: Int, $skip: Int, $status: InvoiceStatus, $startDate: DateTime, $endDate: DateTime) {
  myInvoices(
    first: $first
    skip: $skip
    status: $status
    startDate: $startDate
    endDate: $endDate
  ) {
    edges {
      node {
        id
        invoiceNumber
        invoiceDate
        dueDate
        billingPeriod
        subtotal
        taxAmount
        totalAmount
        paidAmount
        balanceDue
        status
        sentAt
        paidDate
        lineItems {
          id
          description
          quantity
          unitPrice
          lineTotal
          chargeType {
            id
            name
            code
          }
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
    `;

export const useGetMyInvoicesQuery = <
      TData = GetMyInvoicesQuery,
      TError = unknown
    >(
      variables?: GetMyInvoicesQueryVariables,
      options?: Omit<UseQueryOptions<GetMyInvoicesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMyInvoicesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMyInvoicesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetMyInvoices'] : ['GetMyInvoices', variables],
    queryFn: graphqlFetcher<GetMyInvoicesQuery, GetMyInvoicesQueryVariables>(GetMyInvoicesDocument, variables),
    ...options
  }
    )};

useGetMyInvoicesQuery.getKey = (variables?: GetMyInvoicesQueryVariables) => variables === undefined ? ['GetMyInvoices'] : ['GetMyInvoices', variables];

export const useInfiniteGetMyInvoicesQuery = <
      TData = InfiniteData<GetMyInvoicesQuery>,
      TError = unknown
    >(
      variables: GetMyInvoicesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMyInvoicesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMyInvoicesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMyInvoicesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetMyInvoices.infinite'] : ['GetMyInvoices.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMyInvoicesQuery, GetMyInvoicesQueryVariables>(GetMyInvoicesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMyInvoicesQuery.getKey = (variables?: GetMyInvoicesQueryVariables) => variables === undefined ? ['GetMyInvoices.infinite'] : ['GetMyInvoices.infinite', variables];


useGetMyInvoicesQuery.fetcher = (variables?: GetMyInvoicesQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMyInvoicesQuery, GetMyInvoicesQueryVariables>(GetMyInvoicesDocument, variables, options);

export const GetInvoicesDocument = `
    query GetInvoices($first: Int, $skip: Int, $memberId: ID, $status: InvoiceStatus, $startDate: DateTime, $endDate: DateTime) {
  invoices(
    first: $first
    skip: $skip
    memberId: $memberId
    status: $status
    startDate: $startDate
    endDate: $endDate
  ) {
    edges {
      node {
        id
        invoiceNumber
        invoiceDate
        dueDate
        billingPeriod
        subtotal
        taxAmount
        discountAmount
        totalAmount
        paidAmount
        balanceDue
        status
        sentAt
        paidDate
        member {
          id
          memberId
          firstName
          lastName
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
    `;

export const useGetInvoicesQuery = <
      TData = GetInvoicesQuery,
      TError = unknown
    >(
      variables?: GetInvoicesQueryVariables,
      options?: Omit<UseQueryOptions<GetInvoicesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetInvoicesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetInvoicesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetInvoices'] : ['GetInvoices', variables],
    queryFn: graphqlFetcher<GetInvoicesQuery, GetInvoicesQueryVariables>(GetInvoicesDocument, variables),
    ...options
  }
    )};

useGetInvoicesQuery.getKey = (variables?: GetInvoicesQueryVariables) => variables === undefined ? ['GetInvoices'] : ['GetInvoices', variables];

export const useInfiniteGetInvoicesQuery = <
      TData = InfiniteData<GetInvoicesQuery>,
      TError = unknown
    >(
      variables: GetInvoicesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetInvoicesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetInvoicesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetInvoicesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetInvoices.infinite'] : ['GetInvoices.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetInvoicesQuery, GetInvoicesQueryVariables>(GetInvoicesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetInvoicesQuery.getKey = (variables?: GetInvoicesQueryVariables) => variables === undefined ? ['GetInvoices.infinite'] : ['GetInvoices.infinite', variables];


useGetInvoicesQuery.fetcher = (variables?: GetInvoicesQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetInvoicesQuery, GetInvoicesQueryVariables>(GetInvoicesDocument, variables, options);

export const GetInvoiceDocument = `
    query GetInvoice($id: ID!) {
  invoice(id: $id) {
    id
    invoiceNumber
    invoiceDate
    dueDate
    billingPeriod
    subtotal
    taxAmount
    discountAmount
    totalAmount
    paidAmount
    balanceDue
    status
    notes
    internalNotes
    sentAt
    viewedAt
    paidDate
    createdAt
    updatedAt
    member {
      id
      memberId
      firstName
      lastName
    }
    lineItems {
      id
      description
      quantity
      unitPrice
      discountPct
      taxType
      taxRate
      lineTotal
      chargeType {
        id
        name
        code
        description
      }
    }
    payments {
      id
      amount
      payment {
        id
        receiptNumber
        amount
        method
        paymentDate
      }
    }
  }
}
    `;

export const useGetInvoiceQuery = <
      TData = GetInvoiceQuery,
      TError = unknown
    >(
      variables: GetInvoiceQueryVariables,
      options?: Omit<UseQueryOptions<GetInvoiceQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetInvoiceQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetInvoiceQuery, TError, TData>(
      {
    queryKey: ['GetInvoice', variables],
    queryFn: graphqlFetcher<GetInvoiceQuery, GetInvoiceQueryVariables>(GetInvoiceDocument, variables),
    ...options
  }
    )};

useGetInvoiceQuery.getKey = (variables: GetInvoiceQueryVariables) => ['GetInvoice', variables];

export const useInfiniteGetInvoiceQuery = <
      TData = InfiniteData<GetInvoiceQuery>,
      TError = unknown
    >(
      variables: GetInvoiceQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetInvoiceQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetInvoiceQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetInvoiceQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetInvoice.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetInvoiceQuery, GetInvoiceQueryVariables>(GetInvoiceDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetInvoiceQuery.getKey = (variables: GetInvoiceQueryVariables) => ['GetInvoice.infinite', variables];


useGetInvoiceQuery.fetcher = (variables: GetInvoiceQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetInvoiceQuery, GetInvoiceQueryVariables>(GetInvoiceDocument, variables, options);

export const GetMemberTransactionsDocument = `
    query GetMemberTransactions($memberId: ID!) {
  memberTransactions(memberId: $memberId) {
    transactions {
      id
      date
      type
      description
      invoiceNumber
      amount
      runningBalance
    }
    currentBalance
  }
}
    `;

export const useGetMemberTransactionsQuery = <
      TData = GetMemberTransactionsQuery,
      TError = unknown
    >(
      variables: GetMemberTransactionsQueryVariables,
      options?: Omit<UseQueryOptions<GetMemberTransactionsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMemberTransactionsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMemberTransactionsQuery, TError, TData>(
      {
    queryKey: ['GetMemberTransactions', variables],
    queryFn: graphqlFetcher<GetMemberTransactionsQuery, GetMemberTransactionsQueryVariables>(GetMemberTransactionsDocument, variables),
    ...options
  }
    )};

useGetMemberTransactionsQuery.getKey = (variables: GetMemberTransactionsQueryVariables) => ['GetMemberTransactions', variables];

export const useInfiniteGetMemberTransactionsQuery = <
      TData = InfiniteData<GetMemberTransactionsQuery>,
      TError = unknown
    >(
      variables: GetMemberTransactionsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMemberTransactionsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMemberTransactionsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMemberTransactionsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetMemberTransactions.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMemberTransactionsQuery, GetMemberTransactionsQueryVariables>(GetMemberTransactionsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMemberTransactionsQuery.getKey = (variables: GetMemberTransactionsQueryVariables) => ['GetMemberTransactions.infinite', variables];


useGetMemberTransactionsQuery.fetcher = (variables: GetMemberTransactionsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMemberTransactionsQuery, GetMemberTransactionsQueryVariables>(GetMemberTransactionsDocument, variables, options);

export const CreateInvoiceDocument = `
    mutation CreateInvoice($input: CreateInvoiceInput!) {
  createInvoice(input: $input) {
    id
    invoiceNumber
    totalAmount
    status
  }
}
    `;

export const useCreateInvoiceMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateInvoiceMutation, TError, CreateInvoiceMutationVariables, TContext>) => {
    
    return useMutation<CreateInvoiceMutation, TError, CreateInvoiceMutationVariables, TContext>(
      {
    mutationKey: ['CreateInvoice'],
    mutationFn: (variables?: CreateInvoiceMutationVariables) => graphqlFetcher<CreateInvoiceMutation, CreateInvoiceMutationVariables>(CreateInvoiceDocument, variables)(),
    ...options
  }
    )};


useCreateInvoiceMutation.fetcher = (variables: CreateInvoiceMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateInvoiceMutation, CreateInvoiceMutationVariables>(CreateInvoiceDocument, variables, options);

export const SendInvoiceDocument = `
    mutation SendInvoice($id: ID!) {
  sendInvoice(id: $id) {
    id
    invoiceNumber
    sentAt
    status
  }
}
    `;

export const useSendInvoiceMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<SendInvoiceMutation, TError, SendInvoiceMutationVariables, TContext>) => {
    
    return useMutation<SendInvoiceMutation, TError, SendInvoiceMutationVariables, TContext>(
      {
    mutationKey: ['SendInvoice'],
    mutationFn: (variables?: SendInvoiceMutationVariables) => graphqlFetcher<SendInvoiceMutation, SendInvoiceMutationVariables>(SendInvoiceDocument, variables)(),
    ...options
  }
    )};


useSendInvoiceMutation.fetcher = (variables: SendInvoiceMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<SendInvoiceMutation, SendInvoiceMutationVariables>(SendInvoiceDocument, variables, options);

export const VoidInvoiceDocument = `
    mutation VoidInvoice($id: ID!, $input: VoidInvoiceInput!) {
  voidInvoice(id: $id, input: $input) {
    id
    invoiceNumber
    status
  }
}
    `;

export const useVoidInvoiceMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<VoidInvoiceMutation, TError, VoidInvoiceMutationVariables, TContext>) => {
    
    return useMutation<VoidInvoiceMutation, TError, VoidInvoiceMutationVariables, TContext>(
      {
    mutationKey: ['VoidInvoice'],
    mutationFn: (variables?: VoidInvoiceMutationVariables) => graphqlFetcher<VoidInvoiceMutation, VoidInvoiceMutationVariables>(VoidInvoiceDocument, variables)(),
    ...options
  }
    )};


useVoidInvoiceMutation.fetcher = (variables: VoidInvoiceMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<VoidInvoiceMutation, VoidInvoiceMutationVariables>(VoidInvoiceDocument, variables, options);

export const RecordPaymentDocument = `
    mutation RecordPayment($input: CreatePaymentInput!) {
  recordPayment(input: $input) {
    id
    receiptNumber
    amount
    method
    paymentDate
    member {
      id
      memberId
      firstName
      lastName
    }
  }
}
    `;

export const useRecordPaymentMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RecordPaymentMutation, TError, RecordPaymentMutationVariables, TContext>) => {
    
    return useMutation<RecordPaymentMutation, TError, RecordPaymentMutationVariables, TContext>(
      {
    mutationKey: ['RecordPayment'],
    mutationFn: (variables?: RecordPaymentMutationVariables) => graphqlFetcher<RecordPaymentMutation, RecordPaymentMutationVariables>(RecordPaymentDocument, variables)(),
    ...options
  }
    )};


useRecordPaymentMutation.fetcher = (variables: RecordPaymentMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<RecordPaymentMutation, RecordPaymentMutationVariables>(RecordPaymentDocument, variables, options);

export const GetBookingsDocument = `
    query GetBookings($facilityId: ID, $staffId: ID, $startDate: String, $endDate: String, $statuses: [BookingStatus!], $first: Int = 20, $skip: Int) {
  bookings(
    facilityId: $facilityId
    staffId: $staffId
    startDate: $startDate
    endDate: $endDate
    statuses: $statuses
    first: $first
    skip: $skip
  ) {
    edges {
      cursor
      node {
        id
        bookingNumber
        bookingType
        status
        startTime
        endTime
        durationMinutes
        guestCount
        notes
        member {
          id
          firstName
          lastName
          memberId
          photoUrl
          status
        }
        service {
          id
          name
          category
          durationMinutes
          basePrice
        }
        staff {
          id
          firstName
          lastName
          photoUrl
          role
          isActive
        }
        facility {
          id
          name
          type
          location
          capacity
          isActive
        }
        pricing {
          basePrice
          subtotal
          tax
          total
          modifiers {
            label
            amount
            isPercentage
          }
        }
        createdAt
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
    `;

export const useGetBookingsQuery = <
      TData = GetBookingsQuery,
      TError = unknown
    >(
      variables?: GetBookingsQueryVariables,
      options?: Omit<UseQueryOptions<GetBookingsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetBookingsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetBookingsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetBookings'] : ['GetBookings', variables],
    queryFn: graphqlFetcher<GetBookingsQuery, GetBookingsQueryVariables>(GetBookingsDocument, variables),
    ...options
  }
    )};

useGetBookingsQuery.getKey = (variables?: GetBookingsQueryVariables) => variables === undefined ? ['GetBookings'] : ['GetBookings', variables];

export const useInfiniteGetBookingsQuery = <
      TData = InfiniteData<GetBookingsQuery>,
      TError = unknown
    >(
      variables: GetBookingsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetBookingsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetBookingsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetBookingsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetBookings.infinite'] : ['GetBookings.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetBookingsQuery, GetBookingsQueryVariables>(GetBookingsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetBookingsQuery.getKey = (variables?: GetBookingsQueryVariables) => variables === undefined ? ['GetBookings.infinite'] : ['GetBookings.infinite', variables];


useGetBookingsQuery.fetcher = (variables?: GetBookingsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetBookingsQuery, GetBookingsQueryVariables>(GetBookingsDocument, variables, options);

export const GetBookingDocument = `
    query GetBooking($id: ID!) {
  booking(id: $id) {
    id
    bookingNumber
    bookingType
    status
    startTime
    endTime
    durationMinutes
    guestCount
    notes
    createdAt
    member {
      id
      firstName
      lastName
      memberId
      photoUrl
      status
    }
    service {
      id
      name
      description
      category
      durationMinutes
      basePrice
    }
    staff {
      id
      firstName
      lastName
      photoUrl
      role
      isActive
    }
    facility {
      id
      name
      type
      location
      capacity
      isActive
    }
    resource {
      id
      name
      facilityId
      isActive
    }
    pricing {
      basePrice
      subtotal
      tax
      total
      modifiers {
        label
        amount
        isPercentage
      }
    }
  }
}
    `;

export const useGetBookingQuery = <
      TData = GetBookingQuery,
      TError = unknown
    >(
      variables: GetBookingQueryVariables,
      options?: Omit<UseQueryOptions<GetBookingQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetBookingQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetBookingQuery, TError, TData>(
      {
    queryKey: ['GetBooking', variables],
    queryFn: graphqlFetcher<GetBookingQuery, GetBookingQueryVariables>(GetBookingDocument, variables),
    ...options
  }
    )};

useGetBookingQuery.getKey = (variables: GetBookingQueryVariables) => ['GetBooking', variables];

export const useInfiniteGetBookingQuery = <
      TData = InfiniteData<GetBookingQuery>,
      TError = unknown
    >(
      variables: GetBookingQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetBookingQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetBookingQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetBookingQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetBooking.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetBookingQuery, GetBookingQueryVariables>(GetBookingDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetBookingQuery.getKey = (variables: GetBookingQueryVariables) => ['GetBooking.infinite', variables];


useGetBookingQuery.fetcher = (variables: GetBookingQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetBookingQuery, GetBookingQueryVariables>(GetBookingDocument, variables, options);

export const GetBookingStatsDocument = `
    query GetBookingStats {
  bookingStats {
    todayBookings
    confirmedBookings
    checkedInBookings
    completedBookings
    noShows
    utilizationRate
  }
}
    `;

export const useGetBookingStatsQuery = <
      TData = GetBookingStatsQuery,
      TError = unknown
    >(
      variables?: GetBookingStatsQueryVariables,
      options?: Omit<UseQueryOptions<GetBookingStatsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetBookingStatsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetBookingStatsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetBookingStats'] : ['GetBookingStats', variables],
    queryFn: graphqlFetcher<GetBookingStatsQuery, GetBookingStatsQueryVariables>(GetBookingStatsDocument, variables),
    ...options
  }
    )};

useGetBookingStatsQuery.getKey = (variables?: GetBookingStatsQueryVariables) => variables === undefined ? ['GetBookingStats'] : ['GetBookingStats', variables];

export const useInfiniteGetBookingStatsQuery = <
      TData = InfiniteData<GetBookingStatsQuery>,
      TError = unknown
    >(
      variables: GetBookingStatsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetBookingStatsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetBookingStatsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetBookingStatsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetBookingStats.infinite'] : ['GetBookingStats.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetBookingStatsQuery, GetBookingStatsQueryVariables>(GetBookingStatsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetBookingStatsQuery.getKey = (variables?: GetBookingStatsQueryVariables) => variables === undefined ? ['GetBookingStats.infinite'] : ['GetBookingStats.infinite', variables];


useGetBookingStatsQuery.fetcher = (variables?: GetBookingStatsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetBookingStatsQuery, GetBookingStatsQueryVariables>(GetBookingStatsDocument, variables, options);

export const GetCalendarDayDocument = `
    query GetCalendarDay($date: String!, $facilityId: ID, $resourceIds: [ID!], $statuses: [BookingStatus!]) {
  calendarDay(
    date: $date
    facilityId: $facilityId
    resourceIds: $resourceIds
    statuses: $statuses
  ) {
    date
    resources {
      id
      name
      subtitle
      type
    }
    bookings {
      id
      resourceId
      bookingNumber
      status
      startTime
      endTime
      bufferBefore
      bufferAfter
      memberName
      memberPhotoUrl
      serviceName
    }
  }
}
    `;

export const useGetCalendarDayQuery = <
      TData = GetCalendarDayQuery,
      TError = unknown
    >(
      variables: GetCalendarDayQueryVariables,
      options?: Omit<UseQueryOptions<GetCalendarDayQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetCalendarDayQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetCalendarDayQuery, TError, TData>(
      {
    queryKey: ['GetCalendarDay', variables],
    queryFn: graphqlFetcher<GetCalendarDayQuery, GetCalendarDayQueryVariables>(GetCalendarDayDocument, variables),
    ...options
  }
    )};

useGetCalendarDayQuery.getKey = (variables: GetCalendarDayQueryVariables) => ['GetCalendarDay', variables];

export const useInfiniteGetCalendarDayQuery = <
      TData = InfiniteData<GetCalendarDayQuery>,
      TError = unknown
    >(
      variables: GetCalendarDayQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetCalendarDayQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetCalendarDayQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetCalendarDayQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetCalendarDay.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetCalendarDayQuery, GetCalendarDayQueryVariables>(GetCalendarDayDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetCalendarDayQuery.getKey = (variables: GetCalendarDayQueryVariables) => ['GetCalendarDay.infinite', variables];


useGetCalendarDayQuery.fetcher = (variables: GetCalendarDayQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetCalendarDayQuery, GetCalendarDayQueryVariables>(GetCalendarDayDocument, variables, options);

export const CreateBookingDocument = `
    mutation CreateBooking($input: CreateBookingInput!) {
  createBooking(input: $input) {
    success
    booking {
      id
      bookingNumber
      status
      startTime
      endTime
      durationMinutes
      member {
        id
        firstName
        lastName
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
    error
  }
}
    `;

export const useCreateBookingMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateBookingMutation, TError, CreateBookingMutationVariables, TContext>) => {
    
    return useMutation<CreateBookingMutation, TError, CreateBookingMutationVariables, TContext>(
      {
    mutationKey: ['CreateBooking'],
    mutationFn: (variables?: CreateBookingMutationVariables) => graphqlFetcher<CreateBookingMutation, CreateBookingMutationVariables>(CreateBookingDocument, variables)(),
    ...options
  }
    )};


useCreateBookingMutation.fetcher = (variables: CreateBookingMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateBookingMutation, CreateBookingMutationVariables>(CreateBookingDocument, variables, options);

export const CancelBookingDocument = `
    mutation CancelBooking($input: CancelBookingInput!) {
  cancelBooking(input: $input) {
    success
    message
    error
  }
}
    `;

export const useCancelBookingMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CancelBookingMutation, TError, CancelBookingMutationVariables, TContext>) => {
    
    return useMutation<CancelBookingMutation, TError, CancelBookingMutationVariables, TContext>(
      {
    mutationKey: ['CancelBooking'],
    mutationFn: (variables?: CancelBookingMutationVariables) => graphqlFetcher<CancelBookingMutation, CancelBookingMutationVariables>(CancelBookingDocument, variables)(),
    ...options
  }
    )};


useCancelBookingMutation.fetcher = (variables: CancelBookingMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CancelBookingMutation, CancelBookingMutationVariables>(CancelBookingDocument, variables, options);

export const RescheduleBookingDocument = `
    mutation RescheduleBooking($input: RescheduleBookingInput!) {
  rescheduleBooking(input: $input) {
    success
    booking {
      id
      status
      startTime
      endTime
    }
    error
  }
}
    `;

export const useRescheduleBookingMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RescheduleBookingMutation, TError, RescheduleBookingMutationVariables, TContext>) => {
    
    return useMutation<RescheduleBookingMutation, TError, RescheduleBookingMutationVariables, TContext>(
      {
    mutationKey: ['RescheduleBooking'],
    mutationFn: (variables?: RescheduleBookingMutationVariables) => graphqlFetcher<RescheduleBookingMutation, RescheduleBookingMutationVariables>(RescheduleBookingDocument, variables)(),
    ...options
  }
    )};


useRescheduleBookingMutation.fetcher = (variables: RescheduleBookingMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<RescheduleBookingMutation, RescheduleBookingMutationVariables>(RescheduleBookingDocument, variables, options);

export const CheckInBookingDocument = `
    mutation CheckInBooking($input: CheckInInput!) {
  checkIn(input: $input) {
    success
    booking {
      id
      status
    }
    error
  }
}
    `;

export const useCheckInBookingMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CheckInBookingMutation, TError, CheckInBookingMutationVariables, TContext>) => {
    
    return useMutation<CheckInBookingMutation, TError, CheckInBookingMutationVariables, TContext>(
      {
    mutationKey: ['CheckInBooking'],
    mutationFn: (variables?: CheckInBookingMutationVariables) => graphqlFetcher<CheckInBookingMutation, CheckInBookingMutationVariables>(CheckInBookingDocument, variables)(),
    ...options
  }
    )};


useCheckInBookingMutation.fetcher = (variables: CheckInBookingMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CheckInBookingMutation, CheckInBookingMutationVariables>(CheckInBookingDocument, variables, options);

export const GetFacilitiesDocument = `
    query GetFacilities($filter: FacilityFilterInput) {
  facilities(filter: $filter) {
    id
    name
    type
    location
    capacity
    isActive
  }
}
    `;

export const useGetFacilitiesQuery = <
      TData = GetFacilitiesQuery,
      TError = unknown
    >(
      variables?: GetFacilitiesQueryVariables,
      options?: Omit<UseQueryOptions<GetFacilitiesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetFacilitiesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetFacilitiesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetFacilities'] : ['GetFacilities', variables],
    queryFn: graphqlFetcher<GetFacilitiesQuery, GetFacilitiesQueryVariables>(GetFacilitiesDocument, variables),
    ...options
  }
    )};

useGetFacilitiesQuery.getKey = (variables?: GetFacilitiesQueryVariables) => variables === undefined ? ['GetFacilities'] : ['GetFacilities', variables];

export const useInfiniteGetFacilitiesQuery = <
      TData = InfiniteData<GetFacilitiesQuery>,
      TError = unknown
    >(
      variables: GetFacilitiesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetFacilitiesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetFacilitiesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetFacilitiesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetFacilities.infinite'] : ['GetFacilities.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetFacilitiesQuery, GetFacilitiesQueryVariables>(GetFacilitiesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetFacilitiesQuery.getKey = (variables?: GetFacilitiesQueryVariables) => variables === undefined ? ['GetFacilities.infinite'] : ['GetFacilities.infinite', variables];


useGetFacilitiesQuery.fetcher = (variables?: GetFacilitiesQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetFacilitiesQuery, GetFacilitiesQueryVariables>(GetFacilitiesDocument, variables, options);

export const CreateFacilityDocument = `
    mutation CreateFacility($input: CreateFacilityInput!) {
  createFacility(input: $input) {
    success
    facility {
      id
      name
      type
      location
      capacity
      isActive
    }
    error
  }
}
    `;

export const useCreateFacilityMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateFacilityMutation, TError, CreateFacilityMutationVariables, TContext>) => {
    
    return useMutation<CreateFacilityMutation, TError, CreateFacilityMutationVariables, TContext>(
      {
    mutationKey: ['CreateFacility'],
    mutationFn: (variables?: CreateFacilityMutationVariables) => graphqlFetcher<CreateFacilityMutation, CreateFacilityMutationVariables>(CreateFacilityDocument, variables)(),
    ...options
  }
    )};


useCreateFacilityMutation.fetcher = (variables: CreateFacilityMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateFacilityMutation, CreateFacilityMutationVariables>(CreateFacilityDocument, variables, options);

export const UpdateFacilityDocument = `
    mutation UpdateFacility($input: UpdateFacilityInput!) {
  updateFacility(input: $input) {
    success
    facility {
      id
      name
      type
      location
      capacity
      isActive
    }
    error
  }
}
    `;

export const useUpdateFacilityMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateFacilityMutation, TError, UpdateFacilityMutationVariables, TContext>) => {
    
    return useMutation<UpdateFacilityMutation, TError, UpdateFacilityMutationVariables, TContext>(
      {
    mutationKey: ['UpdateFacility'],
    mutationFn: (variables?: UpdateFacilityMutationVariables) => graphqlFetcher<UpdateFacilityMutation, UpdateFacilityMutationVariables>(UpdateFacilityDocument, variables)(),
    ...options
  }
    )};


useUpdateFacilityMutation.fetcher = (variables: UpdateFacilityMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateFacilityMutation, UpdateFacilityMutationVariables>(UpdateFacilityDocument, variables, options);

export const DeleteFacilityDocument = `
    mutation DeleteFacility($id: ID!) {
  deleteFacility(id: $id) {
    success
    message
    error
  }
}
    `;

export const useDeleteFacilityMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteFacilityMutation, TError, DeleteFacilityMutationVariables, TContext>) => {
    
    return useMutation<DeleteFacilityMutation, TError, DeleteFacilityMutationVariables, TContext>(
      {
    mutationKey: ['DeleteFacility'],
    mutationFn: (variables?: DeleteFacilityMutationVariables) => graphqlFetcher<DeleteFacilityMutation, DeleteFacilityMutationVariables>(DeleteFacilityDocument, variables)(),
    ...options
  }
    )};


useDeleteFacilityMutation.fetcher = (variables: DeleteFacilityMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeleteFacilityMutation, DeleteFacilityMutationVariables>(DeleteFacilityDocument, variables, options);

export const GetServicesDocument = `
    query GetServices($filter: ServiceFilterInput) {
  services(filter: $filter) {
    id
    name
    category
    description
    durationMinutes
    basePrice
    isActive
  }
}
    `;

export const useGetServicesQuery = <
      TData = GetServicesQuery,
      TError = unknown
    >(
      variables?: GetServicesQueryVariables,
      options?: Omit<UseQueryOptions<GetServicesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetServicesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetServicesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetServices'] : ['GetServices', variables],
    queryFn: graphqlFetcher<GetServicesQuery, GetServicesQueryVariables>(GetServicesDocument, variables),
    ...options
  }
    )};

useGetServicesQuery.getKey = (variables?: GetServicesQueryVariables) => variables === undefined ? ['GetServices'] : ['GetServices', variables];

export const useInfiniteGetServicesQuery = <
      TData = InfiniteData<GetServicesQuery>,
      TError = unknown
    >(
      variables: GetServicesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetServicesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetServicesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetServicesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetServices.infinite'] : ['GetServices.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetServicesQuery, GetServicesQueryVariables>(GetServicesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetServicesQuery.getKey = (variables?: GetServicesQueryVariables) => variables === undefined ? ['GetServices.infinite'] : ['GetServices.infinite', variables];


useGetServicesQuery.fetcher = (variables?: GetServicesQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetServicesQuery, GetServicesQueryVariables>(GetServicesDocument, variables, options);

export const CreateServiceDocument = `
    mutation CreateService($input: CreateServiceInput!) {
  createService(input: $input) {
    success
    service {
      id
      name
      category
      description
      durationMinutes
      bufferMinutes
      basePrice
      isActive
      requiredCapabilities
      requiredFacilityFeatures
      tierDiscounts {
        tierName
        discountPercent
      }
      variations {
        id
        name
        priceModifier
        priceType
      }
    }
    error
  }
}
    `;

export const useCreateServiceMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateServiceMutation, TError, CreateServiceMutationVariables, TContext>) => {
    
    return useMutation<CreateServiceMutation, TError, CreateServiceMutationVariables, TContext>(
      {
    mutationKey: ['CreateService'],
    mutationFn: (variables?: CreateServiceMutationVariables) => graphqlFetcher<CreateServiceMutation, CreateServiceMutationVariables>(CreateServiceDocument, variables)(),
    ...options
  }
    )};


useCreateServiceMutation.fetcher = (variables: CreateServiceMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateServiceMutation, CreateServiceMutationVariables>(CreateServiceDocument, variables, options);

export const UpdateServiceDocument = `
    mutation UpdateService($input: UpdateServiceInput!) {
  updateService(input: $input) {
    success
    service {
      id
      name
      category
      description
      durationMinutes
      bufferMinutes
      basePrice
      isActive
      requiredCapabilities
      requiredFacilityFeatures
      tierDiscounts {
        tierName
        discountPercent
      }
      variations {
        id
        name
        priceModifier
        priceType
      }
    }
    error
  }
}
    `;

export const useUpdateServiceMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateServiceMutation, TError, UpdateServiceMutationVariables, TContext>) => {
    
    return useMutation<UpdateServiceMutation, TError, UpdateServiceMutationVariables, TContext>(
      {
    mutationKey: ['UpdateService'],
    mutationFn: (variables?: UpdateServiceMutationVariables) => graphqlFetcher<UpdateServiceMutation, UpdateServiceMutationVariables>(UpdateServiceDocument, variables)(),
    ...options
  }
    )};


useUpdateServiceMutation.fetcher = (variables: UpdateServiceMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateServiceMutation, UpdateServiceMutationVariables>(UpdateServiceDocument, variables, options);

export const DeleteServiceDocument = `
    mutation DeleteService($id: ID!) {
  deleteService(id: $id) {
    success
    message
    error
  }
}
    `;

export const useDeleteServiceMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteServiceMutation, TError, DeleteServiceMutationVariables, TContext>) => {
    
    return useMutation<DeleteServiceMutation, TError, DeleteServiceMutationVariables, TContext>(
      {
    mutationKey: ['DeleteService'],
    mutationFn: (variables?: DeleteServiceMutationVariables) => graphqlFetcher<DeleteServiceMutation, DeleteServiceMutationVariables>(DeleteServiceDocument, variables)(),
    ...options
  }
    )};


useDeleteServiceMutation.fetcher = (variables: DeleteServiceMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeleteServiceMutation, DeleteServiceMutationVariables>(DeleteServiceDocument, variables, options);

export const GetBookingStaffDocument = `
    query GetBookingStaff($filter: StaffFilterInput) {
  bookingStaff(filter: $filter) {
    id
    firstName
    lastName
    photoUrl
    role
    capabilities
    isActive
  }
}
    `;

export const useGetBookingStaffQuery = <
      TData = GetBookingStaffQuery,
      TError = unknown
    >(
      variables?: GetBookingStaffQueryVariables,
      options?: Omit<UseQueryOptions<GetBookingStaffQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetBookingStaffQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetBookingStaffQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetBookingStaff'] : ['GetBookingStaff', variables],
    queryFn: graphqlFetcher<GetBookingStaffQuery, GetBookingStaffQueryVariables>(GetBookingStaffDocument, variables),
    ...options
  }
    )};

useGetBookingStaffQuery.getKey = (variables?: GetBookingStaffQueryVariables) => variables === undefined ? ['GetBookingStaff'] : ['GetBookingStaff', variables];

export const useInfiniteGetBookingStaffQuery = <
      TData = InfiniteData<GetBookingStaffQuery>,
      TError = unknown
    >(
      variables: GetBookingStaffQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetBookingStaffQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetBookingStaffQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetBookingStaffQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetBookingStaff.infinite'] : ['GetBookingStaff.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetBookingStaffQuery, GetBookingStaffQueryVariables>(GetBookingStaffDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetBookingStaffQuery.getKey = (variables?: GetBookingStaffQueryVariables) => variables === undefined ? ['GetBookingStaff.infinite'] : ['GetBookingStaff.infinite', variables];


useGetBookingStaffQuery.fetcher = (variables?: GetBookingStaffQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetBookingStaffQuery, GetBookingStaffQueryVariables>(GetBookingStaffDocument, variables, options);

export const CreateStaffMemberDocument = `
    mutation CreateStaffMember($input: CreateStaffMemberInput!) {
  createStaffMember(input: $input) {
    success
    staff {
      id
      firstName
      lastName
      photoUrl
      email
      phone
      isActive
      capabilities
      detailedCapabilities {
        capability
        level
      }
      certifications {
        id
        name
        expiresAt
        status
      }
      workingHours {
        dayOfWeek
        isOpen
        openTime
        closeTime
      }
      defaultFacilityId
    }
    error
  }
}
    `;

export const useCreateStaffMemberMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateStaffMemberMutation, TError, CreateStaffMemberMutationVariables, TContext>) => {
    
    return useMutation<CreateStaffMemberMutation, TError, CreateStaffMemberMutationVariables, TContext>(
      {
    mutationKey: ['CreateStaffMember'],
    mutationFn: (variables?: CreateStaffMemberMutationVariables) => graphqlFetcher<CreateStaffMemberMutation, CreateStaffMemberMutationVariables>(CreateStaffMemberDocument, variables)(),
    ...options
  }
    )};


useCreateStaffMemberMutation.fetcher = (variables: CreateStaffMemberMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateStaffMemberMutation, CreateStaffMemberMutationVariables>(CreateStaffMemberDocument, variables, options);

export const UpdateStaffMemberDocument = `
    mutation UpdateStaffMember($input: UpdateStaffMemberInput!) {
  updateStaffMember(input: $input) {
    success
    staff {
      id
      firstName
      lastName
      photoUrl
      email
      phone
      isActive
      capabilities
      detailedCapabilities {
        capability
        level
      }
      certifications {
        id
        name
        expiresAt
        status
      }
      workingHours {
        dayOfWeek
        isOpen
        openTime
        closeTime
      }
      defaultFacilityId
    }
    error
  }
}
    `;

export const useUpdateStaffMemberMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateStaffMemberMutation, TError, UpdateStaffMemberMutationVariables, TContext>) => {
    
    return useMutation<UpdateStaffMemberMutation, TError, UpdateStaffMemberMutationVariables, TContext>(
      {
    mutationKey: ['UpdateStaffMember'],
    mutationFn: (variables?: UpdateStaffMemberMutationVariables) => graphqlFetcher<UpdateStaffMemberMutation, UpdateStaffMemberMutationVariables>(UpdateStaffMemberDocument, variables)(),
    ...options
  }
    )};


useUpdateStaffMemberMutation.fetcher = (variables: UpdateStaffMemberMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateStaffMemberMutation, UpdateStaffMemberMutationVariables>(UpdateStaffMemberDocument, variables, options);

export const DeleteStaffMemberDocument = `
    mutation DeleteStaffMember($id: ID!) {
  deleteStaffMember(id: $id) {
    success
    message
    error
  }
}
    `;

export const useDeleteStaffMemberMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteStaffMemberMutation, TError, DeleteStaffMemberMutationVariables, TContext>) => {
    
    return useMutation<DeleteStaffMemberMutation, TError, DeleteStaffMemberMutationVariables, TContext>(
      {
    mutationKey: ['DeleteStaffMember'],
    mutationFn: (variables?: DeleteStaffMemberMutationVariables) => graphqlFetcher<DeleteStaffMemberMutation, DeleteStaffMemberMutationVariables>(DeleteStaffMemberDocument, variables)(),
    ...options
  }
    )};


useDeleteStaffMemberMutation.fetcher = (variables: DeleteStaffMemberMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeleteStaffMemberMutation, DeleteStaffMemberMutationVariables>(DeleteStaffMemberDocument, variables, options);

export const GetWaitlistDocument = `
    query GetWaitlist($facilityId: ID, $serviceId: ID, $date: String, $first: Int = 20, $skip: Int) {
  waitlist(
    facilityId: $facilityId
    serviceId: $serviceId
    date: $date
    first: $first
    skip: $skip
  ) {
    edges {
      cursor
      node {
        id
        requestedDate
        requestedTime
        status
        offerExpiresAt
        position
        notes
        member {
          id
          firstName
          lastName
          memberId
          photoUrl
        }
        serviceName
        facilityName
        createdAt
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    totalCount
  }
}
    `;

export const useGetWaitlistQuery = <
      TData = GetWaitlistQuery,
      TError = unknown
    >(
      variables?: GetWaitlistQueryVariables,
      options?: Omit<UseQueryOptions<GetWaitlistQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetWaitlistQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetWaitlistQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetWaitlist'] : ['GetWaitlist', variables],
    queryFn: graphqlFetcher<GetWaitlistQuery, GetWaitlistQueryVariables>(GetWaitlistDocument, variables),
    ...options
  }
    )};

useGetWaitlistQuery.getKey = (variables?: GetWaitlistQueryVariables) => variables === undefined ? ['GetWaitlist'] : ['GetWaitlist', variables];

export const useInfiniteGetWaitlistQuery = <
      TData = InfiniteData<GetWaitlistQuery>,
      TError = unknown
    >(
      variables: GetWaitlistQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetWaitlistQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetWaitlistQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetWaitlistQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetWaitlist.infinite'] : ['GetWaitlist.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetWaitlistQuery, GetWaitlistQueryVariables>(GetWaitlistDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetWaitlistQuery.getKey = (variables?: GetWaitlistQueryVariables) => variables === undefined ? ['GetWaitlist.infinite'] : ['GetWaitlist.infinite', variables];


useGetWaitlistQuery.fetcher = (variables?: GetWaitlistQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetWaitlistQuery, GetWaitlistQueryVariables>(GetWaitlistDocument, variables, options);

export const JoinWaitlistDocument = `
    mutation JoinWaitlist($input: JoinWaitlistInput!) {
  joinWaitlist(input: $input) {
    success
    entry {
      id
      status
      requestedDate
      requestedTime
    }
    error
  }
}
    `;

export const useJoinWaitlistMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<JoinWaitlistMutation, TError, JoinWaitlistMutationVariables, TContext>) => {
    
    return useMutation<JoinWaitlistMutation, TError, JoinWaitlistMutationVariables, TContext>(
      {
    mutationKey: ['JoinWaitlist'],
    mutationFn: (variables?: JoinWaitlistMutationVariables) => graphqlFetcher<JoinWaitlistMutation, JoinWaitlistMutationVariables>(JoinWaitlistDocument, variables)(),
    ...options
  }
    )};


useJoinWaitlistMutation.fetcher = (variables: JoinWaitlistMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<JoinWaitlistMutation, JoinWaitlistMutationVariables>(JoinWaitlistDocument, variables, options);

export const RemoveFromWaitlistDocument = `
    mutation RemoveFromWaitlist($input: WaitlistActionInput!) {
  removeFromWaitlist(input: $input) {
    success
    entry {
      id
      status
    }
    error
  }
}
    `;

export const useRemoveFromWaitlistMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RemoveFromWaitlistMutation, TError, RemoveFromWaitlistMutationVariables, TContext>) => {
    
    return useMutation<RemoveFromWaitlistMutation, TError, RemoveFromWaitlistMutationVariables, TContext>(
      {
    mutationKey: ['RemoveFromWaitlist'],
    mutationFn: (variables?: RemoveFromWaitlistMutationVariables) => graphqlFetcher<RemoveFromWaitlistMutation, RemoveFromWaitlistMutationVariables>(RemoveFromWaitlistDocument, variables)(),
    ...options
  }
    )};


useRemoveFromWaitlistMutation.fetcher = (variables: RemoveFromWaitlistMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<RemoveFromWaitlistMutation, RemoveFromWaitlistMutationVariables>(RemoveFromWaitlistDocument, variables, options);

export const SendWaitlistOfferDocument = `
    mutation SendWaitlistOffer($input: SendWaitlistOfferInput!) {
  sendWaitlistOffer(input: $input) {
    success
    entry {
      id
      status
      offerExpiresAt
    }
    error
  }
}
    `;

export const useSendWaitlistOfferMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<SendWaitlistOfferMutation, TError, SendWaitlistOfferMutationVariables, TContext>) => {
    
    return useMutation<SendWaitlistOfferMutation, TError, SendWaitlistOfferMutationVariables, TContext>(
      {
    mutationKey: ['SendWaitlistOffer'],
    mutationFn: (variables?: SendWaitlistOfferMutationVariables) => graphqlFetcher<SendWaitlistOfferMutation, SendWaitlistOfferMutationVariables>(SendWaitlistOfferDocument, variables)(),
    ...options
  }
    )};


useSendWaitlistOfferMutation.fetcher = (variables: SendWaitlistOfferMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<SendWaitlistOfferMutation, SendWaitlistOfferMutationVariables>(SendWaitlistOfferDocument, variables, options);

export const AcceptWaitlistOfferDocument = `
    mutation AcceptWaitlistOffer($input: WaitlistActionInput!) {
  acceptWaitlistOffer(input: $input) {
    success
    entry {
      id
      status
    }
    message
    error
  }
}
    `;

export const useAcceptWaitlistOfferMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AcceptWaitlistOfferMutation, TError, AcceptWaitlistOfferMutationVariables, TContext>) => {
    
    return useMutation<AcceptWaitlistOfferMutation, TError, AcceptWaitlistOfferMutationVariables, TContext>(
      {
    mutationKey: ['AcceptWaitlistOffer'],
    mutationFn: (variables?: AcceptWaitlistOfferMutationVariables) => graphqlFetcher<AcceptWaitlistOfferMutation, AcceptWaitlistOfferMutationVariables>(AcceptWaitlistOfferDocument, variables)(),
    ...options
  }
    )};


useAcceptWaitlistOfferMutation.fetcher = (variables: AcceptWaitlistOfferMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<AcceptWaitlistOfferMutation, AcceptWaitlistOfferMutationVariables>(AcceptWaitlistOfferDocument, variables, options);

export const DeclineWaitlistOfferDocument = `
    mutation DeclineWaitlistOffer($input: WaitlistActionInput!) {
  declineWaitlistOffer(input: $input) {
    success
    entry {
      id
      status
    }
    message
    error
  }
}
    `;

export const useDeclineWaitlistOfferMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeclineWaitlistOfferMutation, TError, DeclineWaitlistOfferMutationVariables, TContext>) => {
    
    return useMutation<DeclineWaitlistOfferMutation, TError, DeclineWaitlistOfferMutationVariables, TContext>(
      {
    mutationKey: ['DeclineWaitlistOffer'],
    mutationFn: (variables?: DeclineWaitlistOfferMutationVariables) => graphqlFetcher<DeclineWaitlistOfferMutation, DeclineWaitlistOfferMutationVariables>(DeclineWaitlistOfferDocument, variables)(),
    ...options
  }
    )};


useDeclineWaitlistOfferMutation.fetcher = (variables: DeclineWaitlistOfferMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeclineWaitlistOfferMutation, DeclineWaitlistOfferMutationVariables>(DeclineWaitlistOfferDocument, variables, options);

export const GetTeeSheetDocument = `
    query GetTeeSheet($courseId: ID!, $date: DateTime!) {
  teeSheet(courseId: $courseId, date: $date) {
    time
    courseId
    date
    available
    booking {
      id
      teeTimeNumber
      teeDate
      teeTime
      holes
      status
      notes
      players {
        id
        position
        playerType
        member {
          id
          memberId
          firstName
          lastName
        }
        guestName
        guestEmail
        guestPhone
        cartType
        caddyRequest
        cartRequest
        rentalRequest
        cartStatus
        caddyStatus
        sharedWithPosition
        caddy {
          id
          caddyNumber
          firstName
          lastName
        }
        checkedInAt
      }
      bookingGroups {
        id
        groupNumber
        bookedBy {
          id
          name
          memberId
        }
        playerIds
      }
    }
  }
}
    `;

export const useGetTeeSheetQuery = <
      TData = GetTeeSheetQuery,
      TError = unknown
    >(
      variables: GetTeeSheetQueryVariables,
      options?: Omit<UseQueryOptions<GetTeeSheetQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetTeeSheetQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetTeeSheetQuery, TError, TData>(
      {
    queryKey: ['GetTeeSheet', variables],
    queryFn: graphqlFetcher<GetTeeSheetQuery, GetTeeSheetQueryVariables>(GetTeeSheetDocument, variables),
    ...options
  }
    )};

useGetTeeSheetQuery.getKey = (variables: GetTeeSheetQueryVariables) => ['GetTeeSheet', variables];

export const useInfiniteGetTeeSheetQuery = <
      TData = InfiniteData<GetTeeSheetQuery>,
      TError = unknown
    >(
      variables: GetTeeSheetQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetTeeSheetQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetTeeSheetQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetTeeSheetQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetTeeSheet.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetTeeSheetQuery, GetTeeSheetQueryVariables>(GetTeeSheetDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetTeeSheetQuery.getKey = (variables: GetTeeSheetQueryVariables) => ['GetTeeSheet.infinite', variables];


useGetTeeSheetQuery.fetcher = (variables: GetTeeSheetQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetTeeSheetQuery, GetTeeSheetQueryVariables>(GetTeeSheetDocument, variables, options);

export const GetCoursesDocument = `
    query GetCourses {
  courses {
    id
    name
    code
    description
    holes
    par
    slope
    rating
    firstTeeTime
    lastTeeTime
    teeInterval
    isActive
  }
}
    `;

export const useGetCoursesQuery = <
      TData = GetCoursesQuery,
      TError = unknown
    >(
      variables?: GetCoursesQueryVariables,
      options?: Omit<UseQueryOptions<GetCoursesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetCoursesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetCoursesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetCourses'] : ['GetCourses', variables],
    queryFn: graphqlFetcher<GetCoursesQuery, GetCoursesQueryVariables>(GetCoursesDocument, variables),
    ...options
  }
    )};

useGetCoursesQuery.getKey = (variables?: GetCoursesQueryVariables) => variables === undefined ? ['GetCourses'] : ['GetCourses', variables];

export const useInfiniteGetCoursesQuery = <
      TData = InfiniteData<GetCoursesQuery>,
      TError = unknown
    >(
      variables: GetCoursesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetCoursesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetCoursesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetCoursesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetCourses.infinite'] : ['GetCourses.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetCoursesQuery, GetCoursesQueryVariables>(GetCoursesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetCoursesQuery.getKey = (variables?: GetCoursesQueryVariables) => variables === undefined ? ['GetCourses.infinite'] : ['GetCourses.infinite', variables];


useGetCoursesQuery.fetcher = (variables?: GetCoursesQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetCoursesQuery, GetCoursesQueryVariables>(GetCoursesDocument, variables, options);

export const GetTeeTimeDocument = `
    query GetTeeTime($id: ID!) {
  teeTime(id: $id) {
    id
    teeTimeNumber
    teeDate
    teeTime
    holes
    status
    notes
    createdAt
    updatedAt
    course {
      id
      name
      code
      holes
      par
    }
    players {
      id
      position
      playerType
      member {
        id
        memberId
        firstName
        lastName
      }
      guestName
      guestEmail
      guestPhone
      cartType
      caddyRequest
      cartRequest
      rentalRequest
      cartStatus
      caddyStatus
      sharedWithPosition
      caddy {
        id
        caddyNumber
        firstName
        lastName
        phone
        isActive
      }
      checkedInAt
    }
  }
}
    `;

export const useGetTeeTimeQuery = <
      TData = GetTeeTimeQuery,
      TError = unknown
    >(
      variables: GetTeeTimeQueryVariables,
      options?: Omit<UseQueryOptions<GetTeeTimeQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetTeeTimeQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetTeeTimeQuery, TError, TData>(
      {
    queryKey: ['GetTeeTime', variables],
    queryFn: graphqlFetcher<GetTeeTimeQuery, GetTeeTimeQueryVariables>(GetTeeTimeDocument, variables),
    ...options
  }
    )};

useGetTeeTimeQuery.getKey = (variables: GetTeeTimeQueryVariables) => ['GetTeeTime', variables];

export const useInfiniteGetTeeTimeQuery = <
      TData = InfiniteData<GetTeeTimeQuery>,
      TError = unknown
    >(
      variables: GetTeeTimeQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetTeeTimeQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetTeeTimeQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetTeeTimeQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetTeeTime.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetTeeTimeQuery, GetTeeTimeQueryVariables>(GetTeeTimeDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetTeeTimeQuery.getKey = (variables: GetTeeTimeQueryVariables) => ['GetTeeTime.infinite', variables];


useGetTeeTimeQuery.fetcher = (variables: GetTeeTimeQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetTeeTimeQuery, GetTeeTimeQueryVariables>(GetTeeTimeDocument, variables, options);

export const GetTeeTimesDocument = `
    query GetTeeTimes($courseId: ID, $startDate: DateTime, $endDate: DateTime, $status: TeeTimeStatus, $memberId: ID, $first: Int, $skip: Int) {
  teeTimes(
    courseId: $courseId
    startDate: $startDate
    endDate: $endDate
    status: $status
    memberId: $memberId
    first: $first
    skip: $skip
  ) {
    edges {
      node {
        id
        teeTimeNumber
        teeDate
        teeTime
        holes
        status
        course {
          id
          name
          code
        }
        players {
          id
          position
          playerType
          member {
            id
            memberId
            firstName
            lastName
          }
          guestName
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
    `;

export const useGetTeeTimesQuery = <
      TData = GetTeeTimesQuery,
      TError = unknown
    >(
      variables?: GetTeeTimesQueryVariables,
      options?: Omit<UseQueryOptions<GetTeeTimesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetTeeTimesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetTeeTimesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetTeeTimes'] : ['GetTeeTimes', variables],
    queryFn: graphqlFetcher<GetTeeTimesQuery, GetTeeTimesQueryVariables>(GetTeeTimesDocument, variables),
    ...options
  }
    )};

useGetTeeTimesQuery.getKey = (variables?: GetTeeTimesQueryVariables) => variables === undefined ? ['GetTeeTimes'] : ['GetTeeTimes', variables];

export const useInfiniteGetTeeTimesQuery = <
      TData = InfiniteData<GetTeeTimesQuery>,
      TError = unknown
    >(
      variables: GetTeeTimesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetTeeTimesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetTeeTimesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetTeeTimesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetTeeTimes.infinite'] : ['GetTeeTimes.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetTeeTimesQuery, GetTeeTimesQueryVariables>(GetTeeTimesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetTeeTimesQuery.getKey = (variables?: GetTeeTimesQueryVariables) => variables === undefined ? ['GetTeeTimes.infinite'] : ['GetTeeTimes.infinite', variables];


useGetTeeTimesQuery.fetcher = (variables?: GetTeeTimesQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetTeeTimesQuery, GetTeeTimesQueryVariables>(GetTeeTimesDocument, variables, options);

export const CreateTeeTimeDocument = `
    mutation CreateTeeTime($input: CreateTeeTimeInput!) {
  createTeeTime(input: $input) {
    id
    teeTimeNumber
    teeDate
    teeTime
    holes
    status
    course {
      id
      name
    }
    players {
      id
      position
      playerType
      member {
        id
        firstName
        lastName
      }
      guestName
    }
  }
}
    `;

export const useCreateTeeTimeMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateTeeTimeMutation, TError, CreateTeeTimeMutationVariables, TContext>) => {
    
    return useMutation<CreateTeeTimeMutation, TError, CreateTeeTimeMutationVariables, TContext>(
      {
    mutationKey: ['CreateTeeTime'],
    mutationFn: (variables?: CreateTeeTimeMutationVariables) => graphqlFetcher<CreateTeeTimeMutation, CreateTeeTimeMutationVariables>(CreateTeeTimeDocument, variables)(),
    ...options
  }
    )};


useCreateTeeTimeMutation.fetcher = (variables: CreateTeeTimeMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateTeeTimeMutation, CreateTeeTimeMutationVariables>(CreateTeeTimeDocument, variables, options);

export const UpdateTeeTimeDocument = `
    mutation UpdateTeeTime($id: ID!, $input: UpdateTeeTimeInput!) {
  updateTeeTime(id: $id, input: $input) {
    id
    teeTimeNumber
    status
    updatedAt
  }
}
    `;

export const useUpdateTeeTimeMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateTeeTimeMutation, TError, UpdateTeeTimeMutationVariables, TContext>) => {
    
    return useMutation<UpdateTeeTimeMutation, TError, UpdateTeeTimeMutationVariables, TContext>(
      {
    mutationKey: ['UpdateTeeTime'],
    mutationFn: (variables?: UpdateTeeTimeMutationVariables) => graphqlFetcher<UpdateTeeTimeMutation, UpdateTeeTimeMutationVariables>(UpdateTeeTimeDocument, variables)(),
    ...options
  }
    )};


useUpdateTeeTimeMutation.fetcher = (variables: UpdateTeeTimeMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateTeeTimeMutation, UpdateTeeTimeMutationVariables>(UpdateTeeTimeDocument, variables, options);

export const UpdateTeeTimePlayersDocument = `
    mutation UpdateTeeTimePlayers($id: ID!, $players: [TeeTimePlayerInput!]!) {
  updateTeeTimePlayers(id: $id, players: $players) {
    id
    teeTimeNumber
    teeDate
    teeTime
    holes
    status
    course {
      id
      name
    }
    players {
      id
      position
      playerType
      member {
        id
        firstName
        lastName
      }
      guestName
      guestEmail
      guestPhone
      cartType
      caddyRequest
      cartRequest
      rentalRequest
      cartStatus
      caddyStatus
    }
  }
}
    `;

export const useUpdateTeeTimePlayersMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateTeeTimePlayersMutation, TError, UpdateTeeTimePlayersMutationVariables, TContext>) => {
    
    return useMutation<UpdateTeeTimePlayersMutation, TError, UpdateTeeTimePlayersMutationVariables, TContext>(
      {
    mutationKey: ['UpdateTeeTimePlayers'],
    mutationFn: (variables?: UpdateTeeTimePlayersMutationVariables) => graphqlFetcher<UpdateTeeTimePlayersMutation, UpdateTeeTimePlayersMutationVariables>(UpdateTeeTimePlayersDocument, variables)(),
    ...options
  }
    )};


useUpdateTeeTimePlayersMutation.fetcher = (variables: UpdateTeeTimePlayersMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateTeeTimePlayersMutation, UpdateTeeTimePlayersMutationVariables>(UpdateTeeTimePlayersDocument, variables, options);

export const CheckInTeeTimeDocument = `
    mutation CheckInTeeTime($input: CheckInInput!) {
  checkIn(input: $input) {
    success
    booking {
      id
      status
    }
    error
  }
}
    `;

export const useCheckInTeeTimeMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CheckInTeeTimeMutation, TError, CheckInTeeTimeMutationVariables, TContext>) => {
    
    return useMutation<CheckInTeeTimeMutation, TError, CheckInTeeTimeMutationVariables, TContext>(
      {
    mutationKey: ['CheckInTeeTime'],
    mutationFn: (variables?: CheckInTeeTimeMutationVariables) => graphqlFetcher<CheckInTeeTimeMutation, CheckInTeeTimeMutationVariables>(CheckInTeeTimeDocument, variables)(),
    ...options
  }
    )};


useCheckInTeeTimeMutation.fetcher = (variables: CheckInTeeTimeMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CheckInTeeTimeMutation, CheckInTeeTimeMutationVariables>(CheckInTeeTimeDocument, variables, options);

export const CancelTeeTimeDocument = `
    mutation CancelTeeTime($id: ID!, $reason: String) {
  cancelTeeTime(id: $id, reason: $reason) {
    message
  }
}
    `;

export const useCancelTeeTimeMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CancelTeeTimeMutation, TError, CancelTeeTimeMutationVariables, TContext>) => {
    
    return useMutation<CancelTeeTimeMutation, TError, CancelTeeTimeMutationVariables, TContext>(
      {
    mutationKey: ['CancelTeeTime'],
    mutationFn: (variables?: CancelTeeTimeMutationVariables) => graphqlFetcher<CancelTeeTimeMutation, CancelTeeTimeMutationVariables>(CancelTeeTimeDocument, variables)(),
    ...options
  }
    )};


useCancelTeeTimeMutation.fetcher = (variables: CancelTeeTimeMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CancelTeeTimeMutation, CancelTeeTimeMutationVariables>(CancelTeeTimeDocument, variables, options);

export const MoveTeeTimeDocument = `
    mutation MoveTeeTime($id: ID!, $input: MoveTeeTimeInput!) {
  moveTeeTime(id: $id, input: $input) {
    id
    teeDate
    teeTime
    status
    course {
      id
      name
    }
  }
}
    `;

export const useMoveTeeTimeMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<MoveTeeTimeMutation, TError, MoveTeeTimeMutationVariables, TContext>) => {
    
    return useMutation<MoveTeeTimeMutation, TError, MoveTeeTimeMutationVariables, TContext>(
      {
    mutationKey: ['MoveTeeTime'],
    mutationFn: (variables?: MoveTeeTimeMutationVariables) => graphqlFetcher<MoveTeeTimeMutation, MoveTeeTimeMutationVariables>(MoveTeeTimeDocument, variables)(),
    ...options
  }
    )};


useMoveTeeTimeMutation.fetcher = (variables: MoveTeeTimeMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<MoveTeeTimeMutation, MoveTeeTimeMutationVariables>(MoveTeeTimeDocument, variables, options);

export const UpdatePlayerRentalStatusDocument = `
    mutation UpdatePlayerRentalStatus($playerId: ID!, $input: UpdatePlayerRentalStatusInput!) {
  updatePlayerRentalStatus(playerId: $playerId, input: $input) {
    id
    position
    playerType
    cartStatus
    caddyStatus
    caddy {
      id
      caddyNumber
      firstName
      lastName
    }
  }
}
    `;

export const useUpdatePlayerRentalStatusMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdatePlayerRentalStatusMutation, TError, UpdatePlayerRentalStatusMutationVariables, TContext>) => {
    
    return useMutation<UpdatePlayerRentalStatusMutation, TError, UpdatePlayerRentalStatusMutationVariables, TContext>(
      {
    mutationKey: ['UpdatePlayerRentalStatus'],
    mutationFn: (variables?: UpdatePlayerRentalStatusMutationVariables) => graphqlFetcher<UpdatePlayerRentalStatusMutation, UpdatePlayerRentalStatusMutationVariables>(UpdatePlayerRentalStatusDocument, variables)(),
    ...options
  }
    )};


useUpdatePlayerRentalStatusMutation.fetcher = (variables: UpdatePlayerRentalStatusMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdatePlayerRentalStatusMutation, UpdatePlayerRentalStatusMutationVariables>(UpdatePlayerRentalStatusDocument, variables, options);

export const GetWeekViewOccupancyDocument = `
    query GetWeekViewOccupancy($input: WeekViewOccupancyInput!) {
  weekViewOccupancy(input: $input) {
    slots {
      date
      time
      nine
      isBlocked
      positions {
        position
        status
        player {
          id
          name
          type
          memberId
        }
      }
    }
  }
}
    `;

export const useGetWeekViewOccupancyQuery = <
      TData = GetWeekViewOccupancyQuery,
      TError = unknown
    >(
      variables: GetWeekViewOccupancyQueryVariables,
      options?: Omit<UseQueryOptions<GetWeekViewOccupancyQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetWeekViewOccupancyQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetWeekViewOccupancyQuery, TError, TData>(
      {
    queryKey: ['GetWeekViewOccupancy', variables],
    queryFn: graphqlFetcher<GetWeekViewOccupancyQuery, GetWeekViewOccupancyQueryVariables>(GetWeekViewOccupancyDocument, variables),
    ...options
  }
    )};

useGetWeekViewOccupancyQuery.getKey = (variables: GetWeekViewOccupancyQueryVariables) => ['GetWeekViewOccupancy', variables];

export const useInfiniteGetWeekViewOccupancyQuery = <
      TData = InfiniteData<GetWeekViewOccupancyQuery>,
      TError = unknown
    >(
      variables: GetWeekViewOccupancyQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetWeekViewOccupancyQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetWeekViewOccupancyQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetWeekViewOccupancyQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetWeekViewOccupancy.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetWeekViewOccupancyQuery, GetWeekViewOccupancyQueryVariables>(GetWeekViewOccupancyDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetWeekViewOccupancyQuery.getKey = (variables: GetWeekViewOccupancyQueryVariables) => ['GetWeekViewOccupancy.infinite', variables];


useGetWeekViewOccupancyQuery.fetcher = (variables: GetWeekViewOccupancyQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetWeekViewOccupancyQuery, GetWeekViewOccupancyQueryVariables>(GetWeekViewOccupancyDocument, variables, options);

export const SearchCaddiesDocument = `
    query SearchCaddies($search: String, $courseId: ID) {
  searchCaddies(search: $search, courseId: $courseId) {
    id
    caddyNumber
    firstName
    lastName
    phone
    isActive
  }
}
    `;

export const useSearchCaddiesQuery = <
      TData = SearchCaddiesQuery,
      TError = unknown
    >(
      variables?: SearchCaddiesQueryVariables,
      options?: Omit<UseQueryOptions<SearchCaddiesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<SearchCaddiesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<SearchCaddiesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['SearchCaddies'] : ['SearchCaddies', variables],
    queryFn: graphqlFetcher<SearchCaddiesQuery, SearchCaddiesQueryVariables>(SearchCaddiesDocument, variables),
    ...options
  }
    )};

useSearchCaddiesQuery.getKey = (variables?: SearchCaddiesQueryVariables) => variables === undefined ? ['SearchCaddies'] : ['SearchCaddies', variables];

export const useInfiniteSearchCaddiesQuery = <
      TData = InfiniteData<SearchCaddiesQuery>,
      TError = unknown
    >(
      variables: SearchCaddiesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<SearchCaddiesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<SearchCaddiesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<SearchCaddiesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['SearchCaddies.infinite'] : ['SearchCaddies.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<SearchCaddiesQuery, SearchCaddiesQueryVariables>(SearchCaddiesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteSearchCaddiesQuery.getKey = (variables?: SearchCaddiesQueryVariables) => variables === undefined ? ['SearchCaddies.infinite'] : ['SearchCaddies.infinite', variables];


useSearchCaddiesQuery.fetcher = (variables?: SearchCaddiesQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<SearchCaddiesQuery, SearchCaddiesQueryVariables>(SearchCaddiesDocument, variables, options);

export const GetMyMemberDocument = `
    query GetMyMember {
  myMember {
    id
    memberId
    firstName
    lastName
    email
    phone
    dateOfBirth
    gender
    avatarUrl
    address
    nationality
    status
    joinDate
    expiryDate
    renewalDate
    isPrimaryMember
    creditBalance
    outstandingBalance
    notes
    isActive
    membershipType {
      id
      name
      code
      description
    }
    membershipTier {
      id
      name
      code
    }
    dependents {
      id
      firstName
      lastName
      relationship
      dateOfBirth
      email
      phone
      isActive
    }
  }
}
    `;

export const useGetMyMemberQuery = <
      TData = GetMyMemberQuery,
      TError = unknown
    >(
      variables?: GetMyMemberQueryVariables,
      options?: Omit<UseQueryOptions<GetMyMemberQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMyMemberQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMyMemberQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetMyMember'] : ['GetMyMember', variables],
    queryFn: graphqlFetcher<GetMyMemberQuery, GetMyMemberQueryVariables>(GetMyMemberDocument, variables),
    ...options
  }
    )};

useGetMyMemberQuery.getKey = (variables?: GetMyMemberQueryVariables) => variables === undefined ? ['GetMyMember'] : ['GetMyMember', variables];

export const useInfiniteGetMyMemberQuery = <
      TData = InfiniteData<GetMyMemberQuery>,
      TError = unknown
    >(
      variables: GetMyMemberQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMyMemberQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMyMemberQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMyMemberQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetMyMember.infinite'] : ['GetMyMember.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMyMemberQuery, GetMyMemberQueryVariables>(GetMyMemberDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMyMemberQuery.getKey = (variables?: GetMyMemberQueryVariables) => variables === undefined ? ['GetMyMember.infinite'] : ['GetMyMember.infinite', variables];


useGetMyMemberQuery.fetcher = (variables?: GetMyMemberQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMyMemberQuery, GetMyMemberQueryVariables>(GetMyMemberDocument, variables, options);

export const GetMembersDocument = `
    query GetMembers($first: Int, $skip: Int, $search: String, $status: MemberStatus, $membershipTypeId: ID) {
  members(
    first: $first
    skip: $skip
    search: $search
    status: $status
    membershipTypeId: $membershipTypeId
  ) {
    edges {
      node {
        id
        memberId
        firstName
        lastName
        email
        phone
        status
        joinDate
        expiryDate
        isPrimaryMember
        creditBalance
        outstandingBalance
        isActive
        avatarUrl
        membershipType {
          id
          name
          code
        }
        membershipTier {
          id
          name
          code
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
    `;

export const useGetMembersQuery = <
      TData = GetMembersQuery,
      TError = unknown
    >(
      variables?: GetMembersQueryVariables,
      options?: Omit<UseQueryOptions<GetMembersQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMembersQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMembersQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetMembers'] : ['GetMembers', variables],
    queryFn: graphqlFetcher<GetMembersQuery, GetMembersQueryVariables>(GetMembersDocument, variables),
    ...options
  }
    )};

useGetMembersQuery.getKey = (variables?: GetMembersQueryVariables) => variables === undefined ? ['GetMembers'] : ['GetMembers', variables];

export const useInfiniteGetMembersQuery = <
      TData = InfiniteData<GetMembersQuery>,
      TError = unknown
    >(
      variables: GetMembersQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMembersQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMembersQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMembersQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetMembers.infinite'] : ['GetMembers.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMembersQuery, GetMembersQueryVariables>(GetMembersDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMembersQuery.getKey = (variables?: GetMembersQueryVariables) => variables === undefined ? ['GetMembers.infinite'] : ['GetMembers.infinite', variables];


useGetMembersQuery.fetcher = (variables?: GetMembersQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMembersQuery, GetMembersQueryVariables>(GetMembersDocument, variables, options);

export const GetMemberDocument = `
    query GetMember($id: ID!) {
  member(id: $id) {
    id
    memberId
    firstName
    lastName
    email
    phone
    dateOfBirth
    gender
    avatarUrl
    address
    nationality
    idNumber
    emergencyContact
    emergencyPhone
    status
    joinDate
    expiryDate
    renewalDate
    isPrimaryMember
    creditBalance
    outstandingBalance
    notes
    tags
    isActive
    createdAt
    updatedAt
    membershipType {
      id
      name
      code
      description
    }
    membershipTier {
      id
      name
      code
      description
    }
    household {
      id
      name
      address
      phone
      email
    }
    referredBy {
      id
      memberId
      firstName
      lastName
    }
    dependents {
      id
      firstName
      lastName
      relationship
      dateOfBirth
      email
      phone
      isActive
    }
  }
}
    `;

export const useGetMemberQuery = <
      TData = GetMemberQuery,
      TError = unknown
    >(
      variables: GetMemberQueryVariables,
      options?: Omit<UseQueryOptions<GetMemberQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMemberQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMemberQuery, TError, TData>(
      {
    queryKey: ['GetMember', variables],
    queryFn: graphqlFetcher<GetMemberQuery, GetMemberQueryVariables>(GetMemberDocument, variables),
    ...options
  }
    )};

useGetMemberQuery.getKey = (variables: GetMemberQueryVariables) => ['GetMember', variables];

export const useInfiniteGetMemberQuery = <
      TData = InfiniteData<GetMemberQuery>,
      TError = unknown
    >(
      variables: GetMemberQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMemberQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMemberQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMemberQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetMember.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMemberQuery, GetMemberQueryVariables>(GetMemberDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMemberQuery.getKey = (variables: GetMemberQueryVariables) => ['GetMember.infinite', variables];


useGetMemberQuery.fetcher = (variables: GetMemberQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMemberQuery, GetMemberQueryVariables>(GetMemberDocument, variables, options);

export const GetMemberStatsDocument = `
    query GetMemberStats {
  memberStats {
    total
    active
    suspended
    inactive
  }
}
    `;

export const useGetMemberStatsQuery = <
      TData = GetMemberStatsQuery,
      TError = unknown
    >(
      variables?: GetMemberStatsQueryVariables,
      options?: Omit<UseQueryOptions<GetMemberStatsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMemberStatsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMemberStatsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetMemberStats'] : ['GetMemberStats', variables],
    queryFn: graphqlFetcher<GetMemberStatsQuery, GetMemberStatsQueryVariables>(GetMemberStatsDocument, variables),
    ...options
  }
    )};

useGetMemberStatsQuery.getKey = (variables?: GetMemberStatsQueryVariables) => variables === undefined ? ['GetMemberStats'] : ['GetMemberStats', variables];

export const useInfiniteGetMemberStatsQuery = <
      TData = InfiniteData<GetMemberStatsQuery>,
      TError = unknown
    >(
      variables: GetMemberStatsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMemberStatsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMemberStatsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMemberStatsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetMemberStats.infinite'] : ['GetMemberStats.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMemberStatsQuery, GetMemberStatsQueryVariables>(GetMemberStatsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMemberStatsQuery.getKey = (variables?: GetMemberStatsQueryVariables) => variables === undefined ? ['GetMemberStats.infinite'] : ['GetMemberStats.infinite', variables];


useGetMemberStatsQuery.fetcher = (variables?: GetMemberStatsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMemberStatsQuery, GetMemberStatsQueryVariables>(GetMemberStatsDocument, variables, options);

export const CreateMemberDocument = `
    mutation CreateMember($input: CreateMemberInput!) {
  createMember(input: $input) {
    id
    memberId
    firstName
    lastName
    email
    status
  }
}
    `;

export const useCreateMemberMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateMemberMutation, TError, CreateMemberMutationVariables, TContext>) => {
    
    return useMutation<CreateMemberMutation, TError, CreateMemberMutationVariables, TContext>(
      {
    mutationKey: ['CreateMember'],
    mutationFn: (variables?: CreateMemberMutationVariables) => graphqlFetcher<CreateMemberMutation, CreateMemberMutationVariables>(CreateMemberDocument, variables)(),
    ...options
  }
    )};


useCreateMemberMutation.fetcher = (variables: CreateMemberMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateMemberMutation, CreateMemberMutationVariables>(CreateMemberDocument, variables, options);

export const UpdateMemberDocument = `
    mutation UpdateMember($id: ID!, $input: UpdateMemberInput!) {
  updateMember(id: $id, input: $input) {
    id
    memberId
    firstName
    lastName
    email
    status
    updatedAt
  }
}
    `;

export const useUpdateMemberMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateMemberMutation, TError, UpdateMemberMutationVariables, TContext>) => {
    
    return useMutation<UpdateMemberMutation, TError, UpdateMemberMutationVariables, TContext>(
      {
    mutationKey: ['UpdateMember'],
    mutationFn: (variables?: UpdateMemberMutationVariables) => graphqlFetcher<UpdateMemberMutation, UpdateMemberMutationVariables>(UpdateMemberDocument, variables)(),
    ...options
  }
    )};


useUpdateMemberMutation.fetcher = (variables: UpdateMemberMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateMemberMutation, UpdateMemberMutationVariables>(UpdateMemberDocument, variables, options);

export const DeleteMemberDocument = `
    mutation DeleteMember($id: ID!) {
  deleteMember(id: $id) {
    message
  }
}
    `;

export const useDeleteMemberMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteMemberMutation, TError, DeleteMemberMutationVariables, TContext>) => {
    
    return useMutation<DeleteMemberMutation, TError, DeleteMemberMutationVariables, TContext>(
      {
    mutationKey: ['DeleteMember'],
    mutationFn: (variables?: DeleteMemberMutationVariables) => graphqlFetcher<DeleteMemberMutation, DeleteMemberMutationVariables>(DeleteMemberDocument, variables)(),
    ...options
  }
    )};


useDeleteMemberMutation.fetcher = (variables: DeleteMemberMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeleteMemberMutation, DeleteMemberMutationVariables>(DeleteMemberDocument, variables, options);

export const ChangeMemberStatusDocument = `
    mutation ChangeMemberStatus($id: ID!, $input: ChangeStatusInput!) {
  changeMemberStatus(id: $id, input: $input) {
    id
    memberId
    status
    updatedAt
  }
}
    `;

export const useChangeMemberStatusMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ChangeMemberStatusMutation, TError, ChangeMemberStatusMutationVariables, TContext>) => {
    
    return useMutation<ChangeMemberStatusMutation, TError, ChangeMemberStatusMutationVariables, TContext>(
      {
    mutationKey: ['ChangeMemberStatus'],
    mutationFn: (variables?: ChangeMemberStatusMutationVariables) => graphqlFetcher<ChangeMemberStatusMutation, ChangeMemberStatusMutationVariables>(ChangeMemberStatusDocument, variables)(),
    ...options
  }
    )};


useChangeMemberStatusMutation.fetcher = (variables: ChangeMemberStatusMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ChangeMemberStatusMutation, ChangeMemberStatusMutationVariables>(ChangeMemberStatusDocument, variables, options);

export const CreateDependentDocument = `
    mutation CreateDependent($input: CreateDependentInput!) {
  createDependent(input: $input) {
    id
    firstName
    lastName
    relationship
    dateOfBirth
    email
    phone
    isActive
  }
}
    `;

export const useCreateDependentMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateDependentMutation, TError, CreateDependentMutationVariables, TContext>) => {
    
    return useMutation<CreateDependentMutation, TError, CreateDependentMutationVariables, TContext>(
      {
    mutationKey: ['CreateDependent'],
    mutationFn: (variables?: CreateDependentMutationVariables) => graphqlFetcher<CreateDependentMutation, CreateDependentMutationVariables>(CreateDependentDocument, variables)(),
    ...options
  }
    )};


useCreateDependentMutation.fetcher = (variables: CreateDependentMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateDependentMutation, CreateDependentMutationVariables>(CreateDependentDocument, variables, options);

export const UpdateDependentDocument = `
    mutation UpdateDependent($id: ID!, $input: UpdateDependentInput!) {
  updateDependent(id: $id, input: $input) {
    id
    firstName
    lastName
    relationship
    dateOfBirth
    email
    phone
    isActive
  }
}
    `;

export const useUpdateDependentMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateDependentMutation, TError, UpdateDependentMutationVariables, TContext>) => {
    
    return useMutation<UpdateDependentMutation, TError, UpdateDependentMutationVariables, TContext>(
      {
    mutationKey: ['UpdateDependent'],
    mutationFn: (variables?: UpdateDependentMutationVariables) => graphqlFetcher<UpdateDependentMutation, UpdateDependentMutationVariables>(UpdateDependentDocument, variables)(),
    ...options
  }
    )};


useUpdateDependentMutation.fetcher = (variables: UpdateDependentMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateDependentMutation, UpdateDependentMutationVariables>(UpdateDependentDocument, variables, options);

export const DeleteDependentDocument = `
    mutation DeleteDependent($id: ID!) {
  deleteDependent(id: $id) {
    message
  }
}
    `;

export const useDeleteDependentMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteDependentMutation, TError, DeleteDependentMutationVariables, TContext>) => {
    
    return useMutation<DeleteDependentMutation, TError, DeleteDependentMutationVariables, TContext>(
      {
    mutationKey: ['DeleteDependent'],
    mutationFn: (variables?: DeleteDependentMutationVariables) => graphqlFetcher<DeleteDependentMutation, DeleteDependentMutationVariables>(DeleteDependentDocument, variables)(),
    ...options
  }
    )};


useDeleteDependentMutation.fetcher = (variables: DeleteDependentMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeleteDependentMutation, DeleteDependentMutationVariables>(DeleteDependentDocument, variables, options);

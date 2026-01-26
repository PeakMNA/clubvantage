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

export type BookingMemberType = {
  __typename?: 'BookingMemberType';
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  memberId: Scalars['String']['output'];
  photoUrl?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

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

export type CreateApplicationInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  membershipTypeId: Scalars['ID']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  reviewNotes?: InputMaybe<Scalars['String']['input']>;
  sponsorId?: InputMaybe<Scalars['ID']['input']>;
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

export type CreateInvoiceInput = {
  billingPeriod?: InputMaybe<Scalars['String']['input']>;
  dueDate: Scalars['DateTime']['input'];
  internalNotes?: InputMaybe<Scalars['String']['input']>;
  invoiceDate: Scalars['DateTime']['input'];
  lineItems: Array<InvoiceLineItemInput>;
  memberId: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
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
  teeDate: Scalars['DateTime']['input'];
  teeTime: Scalars['String']['input'];
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

export type DeleteDependentResponseType = {
  __typename?: 'DeleteDependentResponseType';
  message: Scalars['String']['output'];
};

export type DeleteMemberResponseType = {
  __typename?: 'DeleteMemberResponseType';
  message: Scalars['String']['output'];
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

export type FlightCheckInResponseType = {
  __typename?: 'FlightCheckInResponseType';
  checkedInAt: Scalars['DateTime']['output'];
  success: Scalars['Boolean']['output'];
  teeTime: TeeTimeType;
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

export type HouseholdType = {
  __typename?: 'HouseholdType';
  address?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
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
  /** Cancel a booking */
  cancelBooking: CancelBookingResponseType;
  /** Cancel a tee time */
  cancelTeeTime: CancelResponseType;
  /** Change the status of a membership application */
  changeApplicationStatus: MembershipApplicationType;
  /** Change member status */
  changeMemberStatus: MemberType;
  /** Check in a booking */
  checkIn: CheckInResponseType;
  /** Create a new membership application */
  createApplication: MembershipApplicationType;
  /** Create a new booking */
  createBooking: CreateBookingResponseType;
  /** Add a dependent to a member */
  createDependent: DependentType;
  /** Create a new facility */
  createFacility: FacilityResponseType;
  /** Create a new invoice */
  createInvoice: InvoiceType;
  /** Create a new member */
  createMember: MemberType;
  /** Create a new service */
  createService: ServiceResponseType;
  /** Create a new staff member */
  createStaffMember: StaffResponseType;
  /** Create a new tee time booking */
  createTeeTime: TeeTimeType;
  /** Decline a waitlist offer */
  declineWaitlistOffer: WaitlistResponseType;
  /** Delete a dependent */
  deleteDependent: DeleteDependentResponseType;
  /** Delete a facility */
  deleteFacility: DeleteResponseType;
  /** Soft delete a member */
  deleteMember: DeleteMemberResponseType;
  /** Delete a service */
  deleteService: DeleteResponseType;
  /** Delete a staff member */
  deleteStaffMember: DeleteResponseType;
  /** Join a waitlist */
  joinWaitlist: WaitlistResponseType;
  /** Move a tee time to a different slot */
  moveTeeTime: TeeTimeType;
  /** Record a payment */
  recordPayment: PaymentType;
  /** Remove entry from waitlist */
  removeFromWaitlist: WaitlistResponseType;
  /** Reschedule a booking */
  rescheduleBooking: CreateBookingResponseType;
  /** Send an invoice */
  sendInvoice: InvoiceType;
  /** Send offer to waitlist entry */
  sendWaitlistOffer: WaitlistResponseType;
  /** Update an existing membership application */
  updateApplication: MembershipApplicationType;
  /** Update a dependent */
  updateDependent: DependentType;
  /** Update an existing facility */
  updateFacility: FacilityResponseType;
  /** Update an existing member */
  updateMember: MemberType;
  /** Update an existing service */
  updateService: ServiceResponseType;
  /** Update a staff member */
  updateStaffMember: StaffResponseType;
  /** Update an existing tee time */
  updateTeeTime: TeeTimeType;
  /** Void an invoice */
  voidInvoice: InvoiceType;
};


export type MutationAcceptWaitlistOfferArgs = {
  input: WaitlistActionInput;
};


export type MutationCancelBookingArgs = {
  input: CancelBookingInput;
};


export type MutationCancelTeeTimeArgs = {
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
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


export type MutationCreateApplicationArgs = {
  input: CreateApplicationInput;
};


export type MutationCreateBookingArgs = {
  input: CreateBookingInput;
};


export type MutationCreateDependentArgs = {
  input: CreateDependentInput;
};


export type MutationCreateFacilityArgs = {
  input: CreateFacilityInput;
};


export type MutationCreateInvoiceArgs = {
  input: CreateInvoiceInput;
};


export type MutationCreateMemberArgs = {
  input: CreateMemberInput;
};


export type MutationCreateServiceArgs = {
  input: CreateServiceInput;
};


export type MutationCreateStaffMemberArgs = {
  input: CreateStaffMemberInput;
};


export type MutationCreateTeeTimeArgs = {
  input: CreateTeeTimeInput;
};


export type MutationDeclineWaitlistOfferArgs = {
  input: WaitlistActionInput;
};


export type MutationDeleteDependentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteFacilityArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteMemberArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteServiceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteStaffMemberArgs = {
  id: Scalars['ID']['input'];
};


export type MutationJoinWaitlistArgs = {
  input: JoinWaitlistInput;
};


export type MutationMoveTeeTimeArgs = {
  id: Scalars['ID']['input'];
  input: MoveTeeTimeInput;
};


export type MutationRecordPaymentArgs = {
  input: CreatePaymentInput;
};


export type MutationRemoveFromWaitlistArgs = {
  input: WaitlistActionInput;
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


export type MutationUpdateApplicationArgs = {
  id: Scalars['ID']['input'];
  input: UpdateApplicationInput;
};


export type MutationUpdateDependentArgs = {
  id: Scalars['ID']['input'];
  input: UpdateDependentInput;
};


export type MutationUpdateFacilityArgs = {
  input: UpdateFacilityInput;
};


export type MutationUpdateMemberArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMemberInput;
};


export type MutationUpdateServiceArgs = {
  input: UpdateServiceInput;
};


export type MutationUpdateStaffMemberArgs = {
  input: UpdateStaffMemberInput;
};


export type MutationUpdateTeeTimeArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTeeTimeInput;
};


export type MutationVoidInvoiceArgs = {
  id: Scalars['ID']['input'];
  input: VoidInvoiceInput;
};

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

export type PriceModifierType = {
  __typename?: 'PriceModifierType';
  amount: Scalars['Float']['output'];
  isPercentage: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
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
  /** Get all golf courses */
  courses: Array<GolfCourseType>;
  /** Get list of facilities */
  facilities: Array<FacilityType>;
  /** Get a single invoice by ID */
  invoice: InvoiceType;
  /** Get paginated list of invoices */
  invoices: InvoiceConnection;
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
  /** Get the current user's member profile */
  myMember?: Maybe<MemberType>;
  /** Get list of services */
  services: Array<ServiceType>;
  /** Get tee sheet for a course and date */
  teeSheet: Array<TeeSheetSlotType>;
  /** Get a single tee time by ID */
  teeTime: TeeTimeType;
  /** Get paginated list of tee times */
  teeTimes: TeeTimeConnection;
  /** Get waitlist entries */
  waitlist: WaitlistConnection;
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


export type QueryFacilitiesArgs = {
  filter?: InputMaybe<FacilityFilterInput>;
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


export type QueryTeeTimesArgs = {
  courseId?: InputMaybe<Scalars['ID']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  memberId?: InputMaybe<Scalars['ID']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<TeeTimeStatus>;
};


export type QueryWaitlistArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
  facilityId?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  serviceId?: InputMaybe<Scalars['ID']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

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

export type TeeSheetSlotType = {
  __typename?: 'TeeSheetSlotType';
  available: Scalars['Boolean']['output'];
  booking?: Maybe<TeeTimeType>;
  courseId: Scalars['ID']['output'];
  date: Scalars['String']['output'];
  time: Scalars['String']['output'];
};

export type TeeTimeConnection = {
  __typename?: 'TeeTimeConnection';
  edges: Array<TeeTimeTypeEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type TeeTimePlayerInput = {
  caddyId?: InputMaybe<Scalars['ID']['input']>;
  cartType?: InputMaybe<CartType>;
  guestEmail?: InputMaybe<Scalars['String']['input']>;
  guestName?: InputMaybe<Scalars['String']['input']>;
  guestPhone?: InputMaybe<Scalars['String']['input']>;
  memberId?: InputMaybe<Scalars['ID']['input']>;
  playerType: PlayerType;
  position: Scalars['Int']['input'];
  sharedWithPosition?: InputMaybe<Scalars['Int']['input']>;
};

export type TeeTimePlayerType = {
  __typename?: 'TeeTimePlayerType';
  caddy?: Maybe<CaddyType>;
  cartType: CartType;
  checkedInAt?: Maybe<Scalars['DateTime']['output']>;
  guestEmail?: Maybe<Scalars['String']['output']>;
  guestName?: Maybe<Scalars['String']['output']>;
  guestPhone?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  member?: Maybe<PlayerMemberType>;
  playerType: PlayerType;
  position: Scalars['Int']['output'];
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
  course?: Maybe<GolfCourseType>;
  createdAt: Scalars['DateTime']['output'];
  holes: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  players: Array<TeeTimePlayerType>;
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

export type UpdateApplicationInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  membershipTypeId?: InputMaybe<Scalars['ID']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  reviewNotes?: InputMaybe<Scalars['String']['input']>;
  sponsorId?: InputMaybe<Scalars['ID']['input']>;
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
  notes?: InputMaybe<Scalars['String']['input']>;
  players?: InputMaybe<Array<TeeTimePlayerInput>>;
  status?: InputMaybe<TeeTimeStatus>;
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


export type GetTeeSheetQuery = { __typename?: 'Query', teeSheet: Array<{ __typename?: 'TeeSheetSlotType', time: string, courseId: string, date: string, available: boolean, booking?: { __typename?: 'TeeTimeType', id: string, teeTimeNumber: string, teeDate: string, teeTime: string, holes: number, status: TeeTimeStatus, notes?: string | null | undefined, players: Array<{ __typename?: 'TeeTimePlayerType', id: string, position: number, playerType: PlayerType, guestName?: string | null | undefined, guestEmail?: string | null | undefined, guestPhone?: string | null | undefined, cartType: CartType, sharedWithPosition?: number | null | undefined, checkedInAt?: string | null | undefined, member?: { __typename?: 'PlayerMemberType', id: string, memberId: string, firstName: string, lastName: string } | null | undefined, caddy?: { __typename?: 'CaddyType', id: string, caddyNumber: string, firstName: string, lastName: string } | null | undefined }> } | null | undefined }> };

export type GetCoursesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCoursesQuery = { __typename?: 'Query', courses: Array<{ __typename?: 'GolfCourseType', id: string, name: string, code: string, description?: string | null | undefined, holes: number, par: number, slope?: number | null | undefined, rating?: number | null | undefined, firstTeeTime: string, lastTeeTime: string, teeInterval: number, isActive: boolean }> };

export type GetTeeTimeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetTeeTimeQuery = { __typename?: 'Query', teeTime: { __typename?: 'TeeTimeType', id: string, teeTimeNumber: string, teeDate: string, teeTime: string, holes: number, status: TeeTimeStatus, notes?: string | null | undefined, createdAt: string, updatedAt: string, course?: { __typename?: 'GolfCourseType', id: string, name: string, code: string, holes: number, par: number } | null | undefined, players: Array<{ __typename?: 'TeeTimePlayerType', id: string, position: number, playerType: PlayerType, guestName?: string | null | undefined, guestEmail?: string | null | undefined, guestPhone?: string | null | undefined, cartType: CartType, sharedWithPosition?: number | null | undefined, checkedInAt?: string | null | undefined, member?: { __typename?: 'PlayerMemberType', id: string, memberId: string, firstName: string, lastName: string } | null | undefined, caddy?: { __typename?: 'CaddyType', id: string, caddyNumber: string, firstName: string, lastName: string, phone?: string | null | undefined, isActive: boolean } | null | undefined }> } };

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

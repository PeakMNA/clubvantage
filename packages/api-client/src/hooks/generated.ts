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
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
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

export type AddLineItemInput = {
  baseAmount: Scalars['Float']['input'];
  description: Scalars['String']['input'];
  playerId: Scalars['ID']['input'];
  productId?: InputMaybe<Scalars['ID']['input']>;
  taxRate?: InputMaybe<Scalars['Float']['input']>;
  taxType?: InputMaybe<TaxType>;
  type: LineItemType;
  variantId?: InputMaybe<Scalars['ID']['input']>;
};

export type AddStoredPaymentInput = {
  brand: Scalars['String']['input'];
  cardholderName?: InputMaybe<Scalars['String']['input']>;
  expiryMonth?: InputMaybe<Scalars['Int']['input']>;
  expiryYear?: InputMaybe<Scalars['Int']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  last4: Scalars['String']['input'];
  memberId: Scalars['String']['input'];
  stripeCustomerId?: InputMaybe<Scalars['String']['input']>;
  stripePaymentMethodId: Scalars['String']['input'];
};

export type AgingBucketType = {
  __typename?: 'AgingBucketType';
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  memberCount: Scalars['Float']['output'];
  percentage: Scalars['Float']['output'];
  totalAmount: Scalars['String']['output'];
};

export type AgingMemberType = {
  __typename?: 'AgingMemberType';
  balance: Scalars['String']['output'];
  daysOutstanding: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  memberNumber: Scalars['String']['output'];
  membershipType: Scalars['String']['output'];
  name: Scalars['String']['output'];
  oldestInvoiceDate: Scalars['DateTime']['output'];
  photoUrl?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
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

export type AppliedDiscountType = {
  __typename?: 'AppliedDiscountType';
  appliedBy: Scalars['String']['output'];
  approvalNote?: Maybe<Scalars['String']['output']>;
  approvedBy?: Maybe<Scalars['String']['output']>;
  calculatedAmount: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  discount?: Maybe<DiscountGraphQlType>;
  discountId: Scalars['String']['output'];
  discountType: DiscountType;
  discountValue: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lineItemId?: Maybe<Scalars['String']['output']>;
  transactionId?: Maybe<Scalars['String']['output']>;
};

export type ApplyCreditNoteInput = {
  amount: Scalars['Float']['input'];
  invoiceId: Scalars['ID']['input'];
};

export type ApplyDiscountByCodeInput = {
  code: Scalars['String']['input'];
  lineItemId?: InputMaybe<Scalars['ID']['input']>;
  membershipTypeId?: InputMaybe<Scalars['ID']['input']>;
  originalAmount: Scalars['Float']['input'];
  playerType?: InputMaybe<Scalars['String']['input']>;
  transactionId?: InputMaybe<Scalars['ID']['input']>;
};

export type ApplyDiscountInput = {
  discountId: Scalars['ID']['input'];
  lineItemId?: InputMaybe<Scalars['ID']['input']>;
  originalAmount: Scalars['Float']['input'];
  transactionId?: InputMaybe<Scalars['ID']['input']>;
};

export type ApplyDiscountResultType = {
  __typename?: 'ApplyDiscountResultType';
  appliedDiscount?: Maybe<AppliedDiscountType>;
  discountedAmount?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  originalAmount?: Maybe<Scalars['String']['output']>;
  requiresApproval?: Maybe<Scalars['Boolean']['output']>;
  savings?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type ApproveDiscountInput = {
  appliedDiscountId: Scalars['ID']['input'];
  approvalNote?: InputMaybe<Scalars['String']['input']>;
};

export type ArAccountSearchResult = {
  __typename?: 'ArAccountSearchResult';
  accountName: Scalars['String']['output'];
  accountNumber: Scalars['String']['output'];
  accountType: ArAccountType;
  agingStatus?: Maybe<Scalars['String']['output']>;
  creditBalance: Scalars['String']['output'];
  dependentCount?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  invoiceCount: Scalars['Float']['output'];
  outstandingBalance: Scalars['String']['output'];
  photoUrl?: Maybe<Scalars['String']['output']>;
  subType?: Maybe<Scalars['String']['output']>;
};

/** AR account type discriminator */
export type ArAccountType =
  | 'CITY_LEDGER'
  | 'MEMBER';

export type ArAgingReportType = {
  __typename?: 'ArAgingReportType';
  buckets: Array<AgingBucketType>;
  members: Array<AgingMemberType>;
  reinstatedMembers: Array<ReinstatedMemberType>;
  totalCount: Scalars['Float']['output'];
};

export type AssignEquipmentInput = {
  bookingId?: InputMaybe<Scalars['ID']['input']>;
  conditionAtCheckout?: InputMaybe<EquipmentCondition>;
  equipmentId: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  rentalFee?: InputMaybe<Scalars['Float']['input']>;
  teeTimePlayerId?: InputMaybe<Scalars['ID']['input']>;
};

export type AssignTemplateInput = {
  outletId: Scalars['ID']['input'];
  templateId: Scalars['ID']['input'];
};

export type AssignTemplateMutationResponse = {
  __typename?: 'AssignTemplateMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  outlet?: Maybe<PosOutletGraphQlType>;
  success: Scalars['Boolean']['output'];
};

export type AutoPayAttempt = {
  __typename?: 'AutoPayAttempt';
  amount: Scalars['Float']['output'];
  attemptNumber: Scalars['Int']['output'];
  clubId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  failedAt?: Maybe<Scalars['DateTime']['output']>;
  failureCode?: Maybe<Scalars['String']['output']>;
  failureMessage?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  invoiceId?: Maybe<Scalars['String']['output']>;
  isManualRetry: Scalars['Boolean']['output'];
  memberId: Scalars['String']['output'];
  nextRetryAt?: Maybe<Scalars['DateTime']['output']>;
  paymentMethod?: Maybe<StoredPaymentMethod>;
  paymentMethodId: Scalars['String']['output'];
  paymentTransactionId?: Maybe<Scalars['String']['output']>;
  processedAt?: Maybe<Scalars['DateTime']['output']>;
  status: AutoPayAttemptStatus;
  stripeChargeId?: Maybe<Scalars['String']['output']>;
  stripePaymentIntentId?: Maybe<Scalars['String']['output']>;
  succeededAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

/** Status of auto-pay attempt */
export type AutoPayAttemptStatus =
  | 'CANCELLED'
  | 'FAILED'
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED';

export type AutoPayResult = {
  __typename?: 'AutoPayResult';
  attemptId?: Maybe<Scalars['String']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  stripePaymentIntentId?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

/** Auto-pay schedule type */
export type AutoPaySchedule =
  | 'INVOICE_DUE'
  | 'MONTHLY_FIXED'
  | 'STATEMENT_DATE';

export type AutoPaySetting = {
  __typename?: 'AutoPaySetting';
  clubId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  excludeCategories: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isEnabled: Scalars['Boolean']['output'];
  maxPaymentAmount?: Maybe<Scalars['Float']['output']>;
  maxRetryAttempts: Scalars['Int']['output'];
  memberId: Scalars['String']['output'];
  monthlyMaxAmount?: Maybe<Scalars['Float']['output']>;
  notifyBeforePayment: Scalars['Boolean']['output'];
  notifyDaysBefore: Scalars['Int']['output'];
  notifyOnFailure: Scalars['Boolean']['output'];
  notifyOnSuccess: Scalars['Boolean']['output'];
  payDuesOnly: Scalars['Boolean']['output'];
  paymentDayOfMonth?: Maybe<Scalars['Int']['output']>;
  paymentMethod?: Maybe<StoredPaymentMethod>;
  paymentMethodId: Scalars['String']['output'];
  requireApprovalAbove?: Maybe<Scalars['Float']['output']>;
  retryIntervalDays: Scalars['Int']['output'];
  schedule: AutoPaySchedule;
  updatedAt: Scalars['DateTime']['output'];
};

export type AutoPaySettingInput = {
  excludeCategories?: InputMaybe<Array<Scalars['String']['input']>>;
  isEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  maxPaymentAmount?: InputMaybe<Scalars['Float']['input']>;
  maxRetryAttempts?: InputMaybe<Scalars['Int']['input']>;
  memberId: Scalars['String']['input'];
  monthlyMaxAmount?: InputMaybe<Scalars['Float']['input']>;
  notifyBeforePayment?: InputMaybe<Scalars['Boolean']['input']>;
  notifyDaysBefore?: InputMaybe<Scalars['Int']['input']>;
  notifyOnFailure?: InputMaybe<Scalars['Boolean']['input']>;
  notifyOnSuccess?: InputMaybe<Scalars['Boolean']['input']>;
  payDuesOnly?: InputMaybe<Scalars['Boolean']['input']>;
  paymentDayOfMonth?: InputMaybe<Scalars['Int']['input']>;
  paymentMethodId: Scalars['ID']['input'];
  requireApprovalAbove?: InputMaybe<Scalars['Float']['input']>;
  retryIntervalDays?: InputMaybe<Scalars['Int']['input']>;
  schedule?: InputMaybe<AutoPaySchedule>;
};

export type BatchPaymentInput = {
  /** For member account charges */
  chargeToMemberId?: InputMaybe<Scalars['ID']['input']>;
  lineItemIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  paymentMethodId: Scalars['ID']['input'];
  playerIds: Array<Scalars['ID']['input']>;
  reference?: InputMaybe<Scalars['String']['input']>;
  teeTimeId: Scalars['ID']['input'];
};

export type BatchPaymentResultType = {
  __typename?: 'BatchPaymentResultType';
  error?: Maybe<Scalars['String']['output']>;
  processedSlots?: Maybe<Array<SlotPaymentResultType>>;
  success: Scalars['Boolean']['output'];
  transactionId?: Maybe<Scalars['String']['output']>;
};

export type BatchSettlementAllocation = {
  __typename?: 'BatchSettlementAllocation';
  amount: Scalars['String']['output'];
  invoiceId: Scalars['ID']['output'];
  invoiceNumber: Scalars['String']['output'];
  newBalance: Scalars['String']['output'];
  previousBalance: Scalars['String']['output'];
};

export type BatchSettlementInput = {
  accountId: Scalars['ID']['input'];
  accountType: ArAccountType;
  method: PaymentMethod;
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentAmount: Scalars['Float']['input'];
  paymentDate?: InputMaybe<Scalars['DateTime']['input']>;
  referenceNumber?: InputMaybe<Scalars['String']['input']>;
  useFifo?: InputMaybe<Scalars['Boolean']['input']>;
};

export type BatchSettlementResult = {
  __typename?: 'BatchSettlementResult';
  allocations: Array<BatchSettlementAllocation>;
  creditAdded: Scalars['String']['output'];
  newCreditBalance: Scalars['String']['output'];
  newOutstandingBalance: Scalars['String']['output'];
  paymentId: Scalars['ID']['output'];
  receiptNumber: Scalars['String']['output'];
  totalAllocated: Scalars['String']['output'];
};

export type BatchTotalType = {
  __typename?: 'BatchTotalType';
  balanceDue: Scalars['Float']['output'];
  grandTotal: Scalars['Float']['output'];
  lineItemCount: Scalars['Int']['output'];
  paidAmount: Scalars['Float']['output'];
  playerIds: Array<Scalars['ID']['output']>;
  subtotal: Scalars['Float']['output'];
  taxTotal: Scalars['Float']['output'];
};

/** Billing frequency options */
export type BillingFrequency =
  | 'ANNUAL'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMI_ANNUAL';

/** Preview of an upcoming billing period */
export type BillingPeriodPreview = {
  __typename?: 'BillingPeriodPreview';
  /** Date when the invoice will be generated/billed */
  billingDate: Scalars['DateTime']['output'];
  /** Human-readable description of the period */
  description: Scalars['String']['output'];
  /** Due date for payment */
  dueDate: Scalars['DateTime']['output'];
  /** End date of the billing period */
  periodEnd: Scalars['DateTime']['output'];
  /** Start date of the billing period */
  periodStart: Scalars['DateTime']['output'];
};

export type BillingStatsType = {
  __typename?: 'BillingStatsType';
  invoiceCount: Scalars['Float']['output'];
  outstandingBalance: Scalars['String']['output'];
  overdueAmount: Scalars['String']['output'];
  overdueCount: Scalars['Float']['output'];
  paidCount: Scalars['Float']['output'];
  totalRevenue: Scalars['String']['output'];
};

/** Billing timing options (advance or arrears) */
export type BillingTiming =
  | 'ADVANCE'
  | 'ARREARS';

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

export type BookingLineItemType = {
  __typename?: 'BookingLineItemType';
  baseAmount: Scalars['Float']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isPaid: Scalars['Boolean']['output'];
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  paymentMethod?: Maybe<Scalars['String']['output']>;
  productId?: Maybe<Scalars['ID']['output']>;
  reference?: Maybe<Scalars['String']['output']>;
  taxAmount: Scalars['Float']['output'];
  taxRate: Scalars['Float']['output'];
  taxType: TaxType;
  totalAmount: Scalars['Float']['output'];
  type: LineItemType;
  variantId?: Maybe<Scalars['ID']['output']>;
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

export type BulkOutletProductConfigInput = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  isQuickKey?: InputMaybe<Scalars['Boolean']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  productIds: Array<Scalars['ID']['input']>;
};

export type BulkRemoveLineItemsInput = {
  lineItemIds: Array<Scalars['ID']['input']>;
};

export type BulkRemoveResultType = {
  __typename?: 'BulkRemoveResultType';
  error?: Maybe<Scalars['String']['output']>;
  removedCount: Scalars['Int']['output'];
  removedItems: Array<SlotLineItemType>;
  success: Scalars['Boolean']['output'];
};

export type BulkTransferLineItemsInput = {
  lineItemIds: Array<Scalars['ID']['input']>;
  toPlayerId: Scalars['ID']['input'];
};

export type BulkTransferResultType = {
  __typename?: 'BulkTransferResultType';
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  transferredCount: Scalars['Int']['output'];
};

export type BulkUpdateProShopProductInput = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isQuickAdd?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CsvPlayerRow = {
  email?: InputMaybe<Scalars['String']['input']>;
  handicap?: InputMaybe<Scalars['Int']['input']>;
  memberId?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type CaddyRateMutationResponse = {
  __typename?: 'CaddyRateMutationResponse';
  caddyRate?: Maybe<CaddyRateType>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type CaddyRateType = {
  __typename?: 'CaddyRateType';
  amount: Scalars['Float']['output'];
  caddyType: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  taxRate: Scalars['Float']['output'];
  taxType: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
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

export type CartDraftType = {
  __typename?: 'CartDraftType';
  createdBy: Scalars['String']['output'];
  /** JSON stringified draft data */
  draftData: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  teeTimeId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Cart policy for golf bookings */
export type CartPolicy =
  | 'OPTIONAL'
  | 'REQUIRED';

export type CartRateMutationResponse = {
  __typename?: 'CartRateMutationResponse';
  cartRate?: Maybe<CartRateType>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type CartRateType = {
  __typename?: 'CartRateType';
  amount: Scalars['Float']['output'];
  cartType: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  taxRate: Scalars['Float']['output'];
  taxType: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Golf cart type */
export type CartType =
  | 'SHARED'
  | 'SINGLE'
  | 'WALKING';

export type CashDrawerGraphQlType = {
  __typename?: 'CashDrawerGraphQLType';
  clubId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  currentShift?: Maybe<CashDrawerShiftGraphQlType>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  location?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CashDrawerShiftGraphQlType = {
  __typename?: 'CashDrawerShiftGraphQLType';
  actualCash?: Maybe<Scalars['Float']['output']>;
  cashDrawerId: Scalars['ID']['output'];
  closedAt?: Maybe<Scalars['DateTime']['output']>;
  closedBy?: Maybe<Scalars['ID']['output']>;
  closingCount?: Maybe<Scalars['Float']['output']>;
  /** JSON string of denomination counts */
  closingDenominations?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  expectedCash?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  movements?: Maybe<Array<CashMovementGraphQlType>>;
  openedAt: Scalars['DateTime']['output'];
  openedBy: Scalars['ID']['output'];
  /** JSON string of denomination counts */
  openingDenominations?: Maybe<Scalars['String']['output']>;
  openingFloat: Scalars['Float']['output'];
  status: CashDrawerStatus;
  totalDrops: Scalars['Float']['output'];
  totalPaidIn: Scalars['Float']['output'];
  totalPaidOut: Scalars['Float']['output'];
  totalRefunds: Scalars['Float']['output'];
  totalSales: Scalars['Float']['output'];
  variance?: Maybe<Scalars['Float']['output']>;
  varianceNote?: Maybe<Scalars['String']['output']>;
};

/** Status of a cash drawer shift */
export type CashDrawerStatus =
  | 'CLOSED'
  | 'OPEN'
  | 'SUSPENDED';

export type CashMovementGraphQlType = {
  __typename?: 'CashMovementGraphQLType';
  amount: Scalars['Float']['output'];
  approvedBy?: Maybe<Scalars['ID']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  performedAt: Scalars['DateTime']['output'];
  performedBy: Scalars['ID']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  reference?: Maybe<Scalars['String']['output']>;
  shiftId: Scalars['ID']['output'];
  transactionId?: Maybe<Scalars['ID']['output']>;
  type: CashMovementType;
};

/** Type of cash movement */
export type CashMovementType =
  | 'ADJUSTMENT'
  | 'CASH_REFUND'
  | 'CASH_SALE'
  | 'CLOSING_COUNT'
  | 'DROP'
  | 'OPENING_FLOAT'
  | 'PAID_IN'
  | 'PAID_OUT';

export type CategoryDisplayStyle =
  | 'DROPDOWN'
  | 'SIDEBAR'
  | 'TABS';

export type ChangeApplicationStatusInput = {
  rejectionReason?: InputMaybe<Scalars['String']['input']>;
  reviewNotes?: InputMaybe<Scalars['String']['input']>;
  status: ApplicationStatus;
};

export type ChangePinInput = {
  newPin: Scalars['String']['input'];
  subAccountId: Scalars['String']['input'];
};

export type ChangeStatusInput = {
  reason?: InputMaybe<Scalars['String']['input']>;
  status: MemberStatus;
};

export type ChangeSubAccountStatusInput = {
  status: SubAccountStatus;
  subAccountId: Scalars['String']['input'];
};

export type ChargeTypeType = {
  __typename?: 'ChargeTypeType';
  category?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  defaultPrice?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  taxable: Scalars['Boolean']['output'];
};

export type CheckCreditInput = {
  chargeAmount: Scalars['Float']['input'];
  memberId: Scalars['ID']['input'];
};

export type CheckInAllPlayersInput = {
  cartNumber?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  skipPaymentValidation?: InputMaybe<Scalars['Boolean']['input']>;
  teeTimeId: Scalars['ID']['input'];
};

export type CheckInAuditEntryType = {
  __typename?: 'CheckInAuditEntryType';
  action: Scalars['String']['output'];
  amount?: Maybe<Scalars['Float']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  performedAt: Scalars['DateTime']['output'];
  performedBy: Scalars['String']['output'];
  playerId?: Maybe<Scalars['ID']['output']>;
  playerName?: Maybe<Scalars['String']['output']>;
  teeTimeId: Scalars['ID']['output'];
};

export type CheckInFlightInput = {
  cartNumber?: InputMaybe<Scalars['String']['input']>;
  generateTicket?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  players: Array<CheckInPlayerInput>;
  teeTimeId: Scalars['ID']['input'];
};

export type CheckInHistoryFilterInput = {
  action?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  playerId?: InputMaybe<Scalars['ID']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  teeTimeId?: InputMaybe<Scalars['ID']['input']>;
};

export type CheckInInput = {
  bookingId: Scalars['ID']['input'];
  outletId?: InputMaybe<Scalars['ID']['input']>;
};

export type CheckInPaymentMethodType = {
  __typename?: 'CheckInPaymentMethodType';
  icon: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isEnabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  opensPOS: Scalars['Boolean']['output'];
  requiresRef: Scalars['Boolean']['output'];
  sortOrder: Scalars['Int']['output'];
  type: PaymentMethodTypeEnum;
};

export type CheckInPlayerInfoType = {
  __typename?: 'CheckInPlayerInfoType';
  balanceDue: Scalars['Float']['output'];
  checkedInAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isCheckedIn: Scalars['Boolean']['output'];
  isSuspended: Scalars['Boolean']['output'];
  lineItems: Array<BookingLineItemType>;
  memberNumber?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  paymentStatus: PaymentStatus;
  suspensionReason?: Maybe<Scalars['String']['output']>;
  totalDue: Scalars['Float']['output'];
  totalPaid: Scalars['Float']['output'];
  type: CheckInPlayerType;
};

export type CheckInPlayerInput = {
  playerId: Scalars['ID']['input'];
  skipPaymentValidation?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Player type for check-in (more granular than PlayerType) */
export type CheckInPlayerType =
  | 'DEPENDENT'
  | 'GUEST'
  | 'MEMBER'
  | 'WALKUP';

export type CheckInPolicyInput = {
  allowPartialPayment?: InputMaybe<Scalars['Boolean']['input']>;
  blockSuspendedMembers?: InputMaybe<Scalars['Boolean']['input']>;
  requireAllItemsPaid?: InputMaybe<Scalars['Boolean']['input']>;
  showSuspensionReason?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CheckInPolicyType = {
  __typename?: 'CheckInPolicyType';
  allowPartialPayment: Scalars['Boolean']['output'];
  blockSuspendedMembers: Scalars['Boolean']['output'];
  requireAllItemsPaid: Scalars['Boolean']['output'];
  showSuspensionReason: Scalars['Boolean']['output'];
};

export type CheckInResponseType = {
  __typename?: 'CheckInResponseType';
  booking?: Maybe<BookingType>;
  checkedInAt: Scalars['DateTime']['output'];
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type CheckInResultType = {
  __typename?: 'CheckInResultType';
  checkedInAt: Scalars['DateTime']['output'];
  checkedInBy: Scalars['String']['output'];
  players: Array<PlayerCheckInResultType>;
  success: Scalars['Boolean']['output'];
  ticketId?: Maybe<Scalars['ID']['output']>;
  ticketNumber?: Maybe<Scalars['String']['output']>;
};

export type CheckInSettingsType = {
  __typename?: 'CheckInSettingsType';
  paymentMethods: Array<CheckInPaymentMethodType>;
  policy: CheckInPolicyType;
  pos: PosConfigType;
  proShop: ProShopConfigType;
  starterTicket: StarterTicketConfigType;
  tax: TaxConfigType;
};

export type CheckInSlotsInput = {
  notes?: InputMaybe<Scalars['String']['input']>;
  playerIds: Array<Scalars['ID']['input']>;
  teeTimeId: Scalars['ID']['input'];
};

export type CheckInSlotsResultType = {
  __typename?: 'CheckInSlotsResultType';
  checkedInSlots?: Maybe<Array<SlotCheckInResultType>>;
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  ticketId?: Maybe<Scalars['ID']['output']>;
  ticketNumber?: Maybe<Scalars['String']['output']>;
};

export type CheckLimitInput = {
  amount: Scalars['Float']['input'];
  category: SubAccountPermission;
  subAccountId: Scalars['String']['input'];
};

/** City ledger account type */
export type CityLedgerAccountType =
  | 'CORPORATE'
  | 'HOUSE_ACCOUNT'
  | 'OTHER'
  | 'VENDOR';

/** City ledger account status */
export type CityLedgerStatus =
  | 'ACTIVE'
  | 'CLOSED'
  | 'INACTIVE'
  | 'SUSPENDED';

export type CityLedgerType = {
  __typename?: 'CityLedgerType';
  accountName: Scalars['String']['output'];
  accountNumber: Scalars['String']['output'];
  accountType: CityLedgerAccountType;
  billingAddress?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactName?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  creditBalance: Scalars['String']['output'];
  creditLimit?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  outstandingBalance: Scalars['String']['output'];
  paymentTerms: Scalars['Float']['output'];
  status: CityLedgerStatus;
  taxId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type CityLedgerTypeEdge = {
  __typename?: 'CityLedgerTypeEdge';
  cursor: Scalars['String']['output'];
  node: CityLedgerType;
};

export type CloneTemplateMutationResponse = {
  __typename?: 'CloneTemplateMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  template?: Maybe<PosTemplateGraphQlType>;
};

export type ClosePeriodInput = {
  periodEnd: Scalars['DateTime']['input'];
};

export type CloseSettlementInput = {
  notes?: InputMaybe<Scalars['String']['input']>;
  settlementId: Scalars['ID']['input'];
};

export type CloseShiftInput = {
  closingCount: Scalars['Float']['input'];
  /** JSON string of denomination counts */
  denominations?: InputMaybe<Scalars['String']['input']>;
  shiftId: Scalars['ID']['input'];
  varianceNote?: InputMaybe<Scalars['String']['input']>;
};

/** Club billing configuration settings */
export type ClubBillingSettingsType = {
  __typename?: 'ClubBillingSettingsType';
  /** Whether to automatically apply late fees when due */
  autoApplyLateFee: Scalars['Boolean']['output'];
  clubId: Scalars['ID']['output'];
  /** When the settings were created */
  createdAt: Scalars['DateTime']['output'];
  /** Billing cycle alignment (calendar or anniversary) */
  defaultAlignment: CycleAlignment;
  /** Default day of month for billing (1-28) */
  defaultBillingDay: Scalars['Int']['output'];
  /** Default billing frequency for new members */
  defaultFrequency: BillingFrequency;
  /** Whether to bill in advance or arrears */
  defaultTiming: BillingTiming;
  /** Grace period days after due date before late fees */
  gracePeriodDays: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  /** Days after invoice date when payment is due */
  invoiceDueDays: Scalars['Int']['output'];
  /** Days before billing cycle to generate invoices */
  invoiceGenerationLead: Scalars['Int']['output'];
  /** Fixed late fee amount (in cents) */
  lateFeeAmount: Scalars['Float']['output'];
  /** Late fee percentage (0-100) */
  lateFeePercentage: Scalars['Float']['output'];
  /** Type of late fee to apply */
  lateFeeType: LateFeeType;
  /** Maximum late fee cap amount (in cents) */
  maxLateFee?: Maybe<Scalars['Float']['output']>;
  /** Whether to prorate charges for membership changes mid-cycle */
  prorateChanges: Scalars['Boolean']['output'];
  /** Whether to prorate charges for new members mid-cycle */
  prorateNewMembers: Scalars['Boolean']['output'];
  /** Method used for calculating prorated amounts */
  prorationMethod: ProrationMethod;
  /** When the settings were last updated */
  updatedAt: Scalars['DateTime']['output'];
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

export type CreateCaddyRateInput = {
  amount: Scalars['Float']['input'];
  caddyType: Scalars['String']['input'];
  rateConfigId: Scalars['ID']['input'];
  taxRate?: Scalars['Float']['input'];
  taxType?: Scalars['String']['input'];
};

export type CreateCartRateInput = {
  amount: Scalars['Float']['input'];
  cartType: Scalars['String']['input'];
  rateConfigId: Scalars['ID']['input'];
  taxRate?: Scalars['Float']['input'];
  taxType?: Scalars['String']['input'];
};

export type CreateCashDrawerInput = {
  location?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateCreditNoteInput = {
  internalNotes?: InputMaybe<Scalars['String']['input']>;
  lineItems: Array<CreditNoteLineItemInput>;
  memberId: Scalars['ID']['input'];
  memberVisibleNotes?: InputMaybe<Scalars['String']['input']>;
  reason: CreditNoteReason;
  reasonDetail?: InputMaybe<Scalars['String']['input']>;
  sourceInvoiceId?: InputMaybe<Scalars['ID']['input']>;
  type: CreditNoteType;
};

export type CreateCreditOverrideInput = {
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  memberId: Scalars['ID']['input'];
  newLimit: Scalars['Float']['input'];
  reason: Scalars['String']['input'];
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

export type CreateDiscountInput = {
  approval?: InputMaybe<DiscountApprovalInput>;
  code?: InputMaybe<Scalars['String']['input']>;
  conditions?: InputMaybe<DiscountConditionsInput>;
  isActive?: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  scope: DiscountScope;
  type: DiscountType;
  validity?: InputMaybe<DiscountValidityInput>;
  value: Scalars['Float']['input'];
};

export type CreateEquipmentCategoryInput = {
  attachmentType?: InputMaybe<EquipmentAttachmentType>;
  code: Scalars['String']['input'];
  color?: InputMaybe<Scalars['String']['input']>;
  defaultRentalRate?: InputMaybe<Scalars['Float']['input']>;
  depositAmount?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  operationType?: InputMaybe<OperationType>;
  requiresDeposit?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreateEquipmentInput = {
  assetNumber: Scalars['String']['input'];
  categoryId: Scalars['ID']['input'];
  condition?: InputMaybe<EquipmentCondition>;
  location?: InputMaybe<Scalars['String']['input']>;
  manufacturer?: InputMaybe<Scalars['String']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  purchaseDate?: InputMaybe<Scalars['DateTime']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  warrantyExpiry?: InputMaybe<Scalars['DateTime']['input']>;
};

export type CreateExceptionInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  description: Scalars['String']['input'];
  lineItemId?: InputMaybe<Scalars['ID']['input']>;
  settlementId: Scalars['ID']['input'];
  severity?: InputMaybe<ExceptionSeverity>;
  shiftId?: InputMaybe<Scalars['ID']['input']>;
  transactionId?: InputMaybe<Scalars['ID']['input']>;
  type: ExceptionType;
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

export type CreateGreenFeeRateInput = {
  amount: Scalars['Float']['input'];
  holes: Scalars['Int']['input'];
  playerType: Scalars['String']['input'];
  rateConfigId: Scalars['ID']['input'];
  taxRate?: Scalars['Float']['input'];
  taxType?: Scalars['String']['input'];
  timeCategory?: Scalars['String']['input'];
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

/** Input for creating an interest category */
export type CreateInterestCategoryInput = {
  code: Scalars['String']['input'];
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateInvoiceInput = {
  billingPeriod?: InputMaybe<Scalars['String']['input']>;
  dueDate: Scalars['DateTime']['input'];
  internalNotes?: InputMaybe<Scalars['String']['input']>;
  invoiceDate: Scalars['DateTime']['input'];
  lineItems: Array<InvoiceLineItemInput>;
  memberId: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  sendEmail?: InputMaybe<Scalars['Boolean']['input']>;
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

export type CreateMemberBillingProfileInput = {
  billingAlignment?: InputMaybe<CycleAlignment>;
  billingFrequency?: InputMaybe<BillingFrequency>;
  billingTiming?: InputMaybe<BillingTiming>;
  /** Custom billing day (1-28) */
  customBillingDay?: InputMaybe<Scalars['Int']['input']>;
  /** Custom grace period in days */
  customGracePeriod?: InputMaybe<Scalars['Int']['input']>;
  /** Exempt from late fees */
  customLateFeeExempt?: InputMaybe<Scalars['Boolean']['input']>;
  memberId: Scalars['ID']['input'];
  /** Next scheduled billing date */
  nextBillingDate?: InputMaybe<Scalars['DateTime']['input']>;
  prorationOverride?: InputMaybe<ProrationMethod>;
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

export type CreateModifierGroupInput = {
  maxSelections?: InputMaybe<Scalars['Int']['input']>;
  minSelections?: InputMaybe<Scalars['Int']['input']>;
  modifiers?: InputMaybe<Array<CreateModifierInput>>;
  name: Scalars['String']['input'];
  selectionType?: InputMaybe<ModifierSelectionType>;
};

export type CreateModifierInput = {
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  priceAdjustment?: InputMaybe<Scalars['Float']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
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

export type CreatePaymentMethodInput = {
  icon: Scalars['String']['input'];
  name: Scalars['String']['input'];
  opensPOS?: InputMaybe<Scalars['Boolean']['input']>;
  requiresRef?: InputMaybe<Scalars['Boolean']['input']>;
  type: PaymentMethodTypeEnum;
};

export type CreateProShopCategoryInput = {
  defaultTaxRate: Scalars['Float']['input'];
  defaultTaxType: TaxType;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};

export type CreateProShopProductInput = {
  categoryId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isQuickAdd?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  sku?: InputMaybe<Scalars['String']['input']>;
  taxRate?: InputMaybe<Scalars['Float']['input']>;
  taxType?: InputMaybe<TaxType>;
  useCategoryDefaults?: InputMaybe<Scalars['Boolean']['input']>;
  variants?: InputMaybe<Array<CreateProShopVariantInput>>;
};

export type CreateProShopVariantInput = {
  name: Scalars['String']['input'];
  priceAdjustment?: InputMaybe<Scalars['Float']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
};

export type CreateProductCategoryInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  iconName?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['ID']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateProductInput = {
  basePrice: Scalars['Float']['input'];
  bufferMinutes?: InputMaybe<Scalars['Int']['input']>;
  categoryId: Scalars['ID']['input'];
  costPrice?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  lowStockThreshold?: InputMaybe<Scalars['Int']['input']>;
  modifierGroupIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  name: Scalars['String']['input'];
  productType?: InputMaybe<ProductType>;
  requiredCapabilities?: InputMaybe<Array<Scalars['String']['input']>>;
  sku?: InputMaybe<Scalars['String']['input']>;
  sortPriority?: InputMaybe<Scalars['Int']['input']>;
  stockQuantity?: InputMaybe<Scalars['Int']['input']>;
  taxRate?: InputMaybe<Scalars['Float']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  trackInventory?: InputMaybe<Scalars['Boolean']['input']>;
  variants?: InputMaybe<Array<CreateProductVariantInput>>;
};

export type CreateProductVariantInput = {
  attributes?: InputMaybe<Scalars['JSON']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  priceAdjustment?: InputMaybe<Scalars['Float']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  stockQuantity?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateRateConfigInput = {
  courseId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  effectiveFrom: Scalars['DateTime']['input'];
  effectiveTo?: InputMaybe<Scalars['DateTime']['input']>;
  name: Scalars['String']['input'];
};

export type CreateRequirementInput = {
  allowPartialCredit?: InputMaybe<Scalars['Boolean']['input']>;
  defaultShortfallAction?: InputMaybe<ShortfallAction>;
  description?: InputMaybe<Scalars['String']['input']>;
  effectiveFrom?: InputMaybe<Scalars['DateTime']['input']>;
  effectiveTo?: InputMaybe<Scalars['DateTime']['input']>;
  excludedCategories?: InputMaybe<Array<Scalars['String']['input']>>;
  gracePeriodDays?: InputMaybe<Scalars['Int']['input']>;
  includeEvents?: InputMaybe<Scalars['Boolean']['input']>;
  includeFoodBeverage?: InputMaybe<Scalars['Boolean']['input']>;
  includeGolf?: InputMaybe<Scalars['Boolean']['input']>;
  includeRetail?: InputMaybe<Scalars['Boolean']['input']>;
  includeSpa?: InputMaybe<Scalars['Boolean']['input']>;
  includedCategories?: InputMaybe<Array<Scalars['String']['input']>>;
  membershipTypes: Array<Scalars['String']['input']>;
  minimumAmount: Scalars['Float']['input'];
  name: Scalars['String']['input'];
  notifyAtPercent?: InputMaybe<Array<Scalars['Int']['input']>>;
  notifyDaysBeforeEnd?: InputMaybe<Array<Scalars['Int']['input']>>;
  period: MinimumSpendPeriod;
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

export type CreateSubAccountInput = {
  dailyLimit?: InputMaybe<Scalars['Float']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  memberId: Scalars['String']['input'];
  monthlyLimit?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  notifyOnLimitReached?: InputMaybe<Scalars['Boolean']['input']>;
  notifyPrimaryOnUse?: InputMaybe<Scalars['Boolean']['input']>;
  perTransactionLimit?: InputMaybe<Scalars['Float']['input']>;
  permissions?: InputMaybe<Array<SubAccountPermission>>;
  phone?: InputMaybe<Scalars['String']['input']>;
  pin: Scalars['String']['input'];
  relationship: Scalars['String']['input'];
  validFrom?: InputMaybe<Scalars['DateTime']['input']>;
  validUntil?: InputMaybe<Scalars['DateTime']['input']>;
  weeklyLimit?: InputMaybe<Scalars['Float']['input']>;
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

export type CreditCheckResultType = {
  __typename?: 'CreditCheckResultType';
  allowed: Scalars['Boolean']['output'];
  availableCredit: Scalars['Float']['output'];
  chargeAmount: Scalars['Float']['output'];
  creditLimit: Scalars['Float']['output'];
  currentBalance: Scalars['Float']['output'];
  newBalance: Scalars['Float']['output'];
  shortfall?: Maybe<Scalars['Float']['output']>;
  usagePercent: Scalars['Float']['output'];
  warning?: Maybe<CreditWarningLevel>;
};

export type CreditLimitOverrideType = {
  __typename?: 'CreditLimitOverrideType';
  approvedAt: Scalars['DateTime']['output'];
  approvedBy: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  memberId: Scalars['ID']['output'];
  newLimit: Scalars['Float']['output'];
  previousLimit: Scalars['Float']['output'];
  reason: Scalars['String']['output'];
};

export type CreditNoteApplicationType = {
  __typename?: 'CreditNoteApplicationType';
  amountApplied: Scalars['String']['output'];
  appliedAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  invoice?: Maybe<InvoiceType>;
};

export type CreditNoteConnection = {
  __typename?: 'CreditNoteConnection';
  edges: Array<CreditNoteGraphQlTypeEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CreditNoteGraphQlType = {
  __typename?: 'CreditNoteGraphQLType';
  applications?: Maybe<Array<CreditNoteApplicationType>>;
  appliedToBalance: Scalars['String']['output'];
  approvedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  creditNoteNumber: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  internalNotes?: Maybe<Scalars['String']['output']>;
  issueDate: Scalars['DateTime']['output'];
  lineItems: Array<CreditNoteLineItemType>;
  member?: Maybe<MemberSummaryBillingType>;
  memberVisibleNotes?: Maybe<Scalars['String']['output']>;
  reason: CreditNoteReason;
  reasonDetail?: Maybe<Scalars['String']['output']>;
  refundedAmount: Scalars['String']['output'];
  status: CreditNoteStatus;
  subtotal: Scalars['String']['output'];
  taxAmount: Scalars['String']['output'];
  totalAmount: Scalars['String']['output'];
  type: CreditNoteType;
  updatedAt: Scalars['DateTime']['output'];
  voidedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type CreditNoteGraphQlTypeEdge = {
  __typename?: 'CreditNoteGraphQLTypeEdge';
  cursor: Scalars['String']['output'];
  node: CreditNoteGraphQlType;
};

export type CreditNoteLineItemInput = {
  chargeTypeId?: InputMaybe<Scalars['ID']['input']>;
  description: Scalars['String']['input'];
  quantity?: Scalars['Float']['input'];
  taxRate?: InputMaybe<Scalars['Float']['input']>;
  taxable?: InputMaybe<Scalars['Boolean']['input']>;
  unitPrice: Scalars['Float']['input'];
};

export type CreditNoteLineItemType = {
  __typename?: 'CreditNoteLineItemType';
  chargeType?: Maybe<ChargeTypeType>;
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lineTotal: Scalars['String']['output'];
  quantity: Scalars['Float']['output'];
  taxAmount: Scalars['String']['output'];
  taxRate: Scalars['String']['output'];
  taxable: Scalars['Boolean']['output'];
  unitPrice: Scalars['String']['output'];
};

/** Credit note reason options */
export type CreditNoteReason =
  | 'BILLING_ERROR'
  | 'CUSTOMER_SATISFACTION'
  | 'DUPLICATE_CHARGE'
  | 'EVENT_CANCELLATION'
  | 'MEMBERSHIP_CANCELLATION'
  | 'OTHER'
  | 'OVERPAYMENT'
  | 'PRICE_ADJUSTMENT'
  | 'PRODUCT_RETURN'
  | 'RAIN_CHECK'
  | 'SERVICE_NOT_RENDERED';

/** Credit note status options */
export type CreditNoteStatus =
  | 'APPLIED'
  | 'APPROVED'
  | 'DRAFT'
  | 'PARTIALLY_APPLIED'
  | 'PENDING_APPROVAL'
  | 'REFUNDED'
  | 'VOIDED';

/** Credit note type options */
export type CreditNoteType =
  | 'ADJUSTMENT'
  | 'CANCELLATION'
  | 'COURTESY'
  | 'PROMO'
  | 'REFUND'
  | 'RETURN'
  | 'WRITE_OFF';

export type CreditSettingsType = {
  __typename?: 'CreditSettingsType';
  creditAlertThreshold: Scalars['Float']['output'];
  creditBlockEnabled: Scalars['Boolean']['output'];
  creditLimit?: Maybe<Scalars['Float']['output']>;
  creditLimitEnabled: Scalars['Boolean']['output'];
  creditOverrideAllowed: Scalars['Boolean']['output'];
};

export type CreditStatusType = {
  __typename?: 'CreditStatusType';
  alertThreshold: Scalars['Float']['output'];
  availableCredit: Scalars['Float']['output'];
  creditLimit: Scalars['Float']['output'];
  currentBalance: Scalars['Float']['output'];
  isBlocked: Scalars['Boolean']['output'];
  overrideAllowed: Scalars['Boolean']['output'];
  usagePercent: Scalars['Float']['output'];
};

/** Warning level for credit limit status */
export type CreditWarningLevel =
  | 'APPROACHING_LIMIT'
  | 'EXCEEDED';

/** Billing cycle alignment (calendar or anniversary) */
export type CycleAlignment =
  | 'ANNIVERSARY'
  | 'CALENDAR';

export type DailyCheckInReportType = {
  __typename?: 'DailyCheckInReportType';
  checkedInPlayers: Scalars['Int']['output'];
  course: Scalars['String']['output'];
  date: Scalars['DateTime']['output'];
  flights: Array<FlightPaymentSummaryType>;
  noShowPlayers: Scalars['Int']['output'];
  totalAccount: Scalars['Float']['output'];
  totalCard: Scalars['Float']['output'];
  totalCash: Scalars['Float']['output'];
  totalFlights: Scalars['Int']['output'];
  totalPlayers: Scalars['Int']['output'];
  totalRevenue: Scalars['Float']['output'];
  totalTransfer: Scalars['Float']['output'];
};

export type DailyReportInput = {
  courseId: Scalars['ID']['input'];
  date: Scalars['DateTime']['input'];
};

export type DailySettlementGraphQlType = {
  __typename?: 'DailySettlementGraphQLType';
  actualCash?: Maybe<Scalars['Float']['output']>;
  businessDate: Scalars['DateTime']['output'];
  cashVariance?: Maybe<Scalars['Float']['output']>;
  closedAt?: Maybe<Scalars['DateTime']['output']>;
  closedBy?: Maybe<Scalars['ID']['output']>;
  clubId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  exceptions?: Maybe<Array<SettlementExceptionGraphQlType>>;
  expectedCash: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  openedAt?: Maybe<Scalars['DateTime']['output']>;
  openedBy?: Maybe<Scalars['ID']['output']>;
  refundCount: Scalars['Int']['output'];
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedBy?: Maybe<Scalars['ID']['output']>;
  status: SettlementStatus;
  totalCard: Scalars['Float']['output'];
  totalCash: Scalars['Float']['output'];
  totalDiscounts: Scalars['Float']['output'];
  totalGrossSales: Scalars['Float']['output'];
  totalMemberAccount: Scalars['Float']['output'];
  totalNetSales: Scalars['Float']['output'];
  totalOther: Scalars['Float']['output'];
  totalRefunds: Scalars['Float']['output'];
  totalServiceCharge: Scalars['Float']['output'];
  totalTax: Scalars['Float']['output'];
  totalVoids: Scalars['Float']['output'];
  transactionCount: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  voidCount: Scalars['Int']['output'];
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

export type DeleteRateMutationResponse = {
  __typename?: 'DeleteRateMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type DeleteResponseType = {
  __typename?: 'DeleteResponseType';
  error?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type DeleteTemplateMutationResponse = {
  __typename?: 'DeleteTemplateMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

/** Single interest entry for a dependent */
export type DependentInterestInput = {
  categoryId: Scalars['ID']['input'];
  interestLevel: Scalars['Int']['input'];
};

/** Dependent interest in an activity category */
export type DependentInterestType = {
  __typename?: 'DependentInterestType';
  category?: Maybe<InterestCategoryType>;
  categoryId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  dependentId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  /** Interest level 0-100 */
  interestLevel: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
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

export type DiscountApprovalInput = {
  approvalThreshold?: InputMaybe<Scalars['Float']['input']>;
  requiresApproval?: Scalars['Boolean']['input'];
};

export type DiscountApprovalType = {
  __typename?: 'DiscountApprovalType';
  approvalThreshold?: Maybe<Scalars['String']['output']>;
  requiresApproval: Scalars['Boolean']['output'];
};

export type DiscountConditionsInput = {
  maximumDiscount?: InputMaybe<Scalars['Float']['input']>;
  membershipTypeIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  minimumAmount?: InputMaybe<Scalars['Float']['input']>;
  playerTypes?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type DiscountConditionsType = {
  __typename?: 'DiscountConditionsType';
  maximumDiscount?: Maybe<Scalars['String']['output']>;
  membershipTypeIds?: Maybe<Array<Scalars['String']['output']>>;
  minimumAmount?: Maybe<Scalars['String']['output']>;
  playerTypes?: Maybe<Array<Scalars['String']['output']>>;
};

export type DiscountConnection = {
  __typename?: 'DiscountConnection';
  edges: Array<DiscountGraphQlTypeEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type DiscountGraphQlType = {
  __typename?: 'DiscountGraphQLType';
  approval: DiscountApprovalType;
  clubId: Scalars['String']['output'];
  code?: Maybe<Scalars['String']['output']>;
  conditions: DiscountConditionsType;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  scope: DiscountScope;
  type: DiscountType;
  updatedAt: Scalars['DateTime']['output'];
  validity: DiscountValidityType;
  value: Scalars['String']['output'];
};

export type DiscountGraphQlTypeEdge = {
  __typename?: 'DiscountGraphQLTypeEdge';
  cursor: Scalars['String']['output'];
  node: DiscountGraphQlType;
};

/** Scope of discount application */
export type DiscountScope =
  | 'LINE_ITEM'
  | 'ORDER';

/** Type of discount calculation */
export type DiscountType =
  | 'FIXED_AMOUNT'
  | 'PERCENTAGE';

export type DiscountValidationResultType = {
  __typename?: 'DiscountValidationResultType';
  calculatedAmount?: Maybe<Scalars['String']['output']>;
  isValid: Scalars['Boolean']['output'];
  message?: Maybe<Scalars['String']['output']>;
  requiresApproval?: Maybe<Scalars['Boolean']['output']>;
};

export type DiscountValidityInput = {
  usageLimit?: InputMaybe<Scalars['Float']['input']>;
  validFrom?: InputMaybe<Scalars['DateTime']['input']>;
  validTo?: InputMaybe<Scalars['DateTime']['input']>;
};

export type DiscountValidityType = {
  __typename?: 'DiscountValidityType';
  usageCount: Scalars['Float']['output'];
  usageLimit?: Maybe<Scalars['Float']['output']>;
  validFrom?: Maybe<Scalars['DateTime']['output']>;
  validTo?: Maybe<Scalars['DateTime']['output']>;
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

/** Response for engagement delete operations */
export type EngagementDeleteResponse = {
  __typename?: 'EngagementDeleteResponse';
  message: Scalars['String']['output'];
};

/** Individual equipment item */
export type Equipment = {
  __typename?: 'Equipment';
  assetNumber: Scalars['String']['output'];
  category: EquipmentCategory;
  condition: EquipmentCondition;
  currentAssignment?: Maybe<EquipmentAssignment>;
  id: Scalars['ID']['output'];
  lastMaintenanceAt?: Maybe<Scalars['DateTime']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  manufacturer?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nextMaintenanceAt?: Maybe<Scalars['DateTime']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  purchaseDate?: Maybe<Scalars['DateTime']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  status: EquipmentStatus;
  warrantyExpiry?: Maybe<Scalars['DateTime']['output']>;
};

/** Equipment assignment to a booking or tee time player */
export type EquipmentAssignment = {
  __typename?: 'EquipmentAssignment';
  assignedAt: Scalars['DateTime']['output'];
  bookingNumber?: Maybe<Scalars['String']['output']>;
  conditionAtCheckout?: Maybe<EquipmentCondition>;
  conditionAtReturn?: Maybe<EquipmentCondition>;
  id: Scalars['ID']['output'];
  member?: Maybe<EquipmentAssignmentMember>;
  notes?: Maybe<Scalars['String']['output']>;
  rentalFee?: Maybe<Scalars['Float']['output']>;
  returnedAt?: Maybe<Scalars['DateTime']['output']>;
};

/** Member info for equipment assignment */
export type EquipmentAssignmentMember = {
  __typename?: 'EquipmentAssignmentMember';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  memberId: Scalars['String']['output'];
};

export type EquipmentAssignmentResponse = {
  __typename?: 'EquipmentAssignmentResponse';
  assignment?: Maybe<EquipmentAssignment>;
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

/** Type of equipment attachment to bookings */
export type EquipmentAttachmentType =
  | 'OPTIONAL_ADDON'
  | 'REQUIRED_RESOURCE';

export type EquipmentAvailabilityInput = {
  categoryId: Scalars['ID']['input'];
  endTime: Scalars['DateTime']['input'];
  startTime: Scalars['DateTime']['input'];
};

/** Equipment category for grouping similar equipment types */
export type EquipmentCategory = {
  __typename?: 'EquipmentCategory';
  attachmentType: EquipmentAttachmentType;
  availableCount: Scalars['Int']['output'];
  code: Scalars['String']['output'];
  color?: Maybe<Scalars['String']['output']>;
  defaultRentalRate?: Maybe<Scalars['Float']['output']>;
  depositAmount?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  equipmentCount: Scalars['Int']['output'];
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  operationType: OperationType;
  requiresDeposit: Scalars['Boolean']['output'];
  sortOrder: Scalars['Int']['output'];
};

export type EquipmentCategoryFilterInput = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  operationType?: InputMaybe<OperationType>;
};

export type EquipmentCategoryResponse = {
  __typename?: 'EquipmentCategoryResponse';
  category?: Maybe<EquipmentCategory>;
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

/** Physical condition of equipment */
export type EquipmentCondition =
  | 'EXCELLENT'
  | 'FAIR'
  | 'GOOD'
  | 'NEEDS_REPAIR'
  | 'OUT_OF_SERVICE';

export type EquipmentDeleteResponse = {
  __typename?: 'EquipmentDeleteResponse';
  error?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type EquipmentFilterInput = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  condition?: InputMaybe<EquipmentCondition>;
  /** Filter by category operation type */
  operationType?: InputMaybe<OperationType>;
  status?: InputMaybe<EquipmentStatus>;
};

export type EquipmentReleaseResponse = {
  __typename?: 'EquipmentReleaseResponse';
  error?: Maybe<Scalars['String']['output']>;
  releasedCount: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type EquipmentResponse = {
  __typename?: 'EquipmentResponse';
  equipment?: Maybe<Equipment>;
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

/** Availability status of equipment */
export type EquipmentStatus =
  | 'AVAILABLE'
  | 'IN_USE'
  | 'MAINTENANCE'
  | 'RESERVED'
  | 'RETIRED';

/** Resolution status of an exception */
export type ExceptionResolution =
  | 'ACKNOWLEDGED'
  | 'ADJUSTED'
  | 'ESCALATED'
  | 'PENDING'
  | 'RESOLVED'
  | 'WRITTEN_OFF';

/** Severity level of an exception */
export type ExceptionSeverity =
  | 'CRITICAL'
  | 'HIGH'
  | 'LOW'
  | 'MEDIUM';

/** Type of settlement exception */
export type ExceptionType =
  | 'CARD_VARIANCE'
  | 'CASH_VARIANCE'
  | 'DISCOUNT_WITHOUT_APPROVAL'
  | 'DUPLICATE_TRANSACTION'
  | 'MISSING_RECEIPT'
  | 'OTHER'
  | 'REFUND_WITHOUT_APPROVAL'
  | 'SYSTEM_ERROR'
  | 'VOID_WITHOUT_APPROVAL';

export type ExemptMemberInput = {
  memberSpendId: Scalars['String']['input'];
  reason: Scalars['String']['input'];
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

export type FifoAllocationItem = {
  __typename?: 'FifoAllocationItem';
  allocatedAmount: Scalars['String']['output'];
  balance: Scalars['String']['output'];
  dueDate: Scalars['DateTime']['output'];
  invoiceId: Scalars['ID']['output'];
  invoiceNumber: Scalars['String']['output'];
};

export type FifoAllocationPreview = {
  __typename?: 'FifoAllocationPreview';
  allocations: Array<FifoAllocationItem>;
  creditToAdd: Scalars['String']['output'];
  remainingPayment: Scalars['String']['output'];
  totalAllocated: Scalars['String']['output'];
};

export type FlightAssignment = {
  __typename?: 'FlightAssignment';
  flightNumber: Scalars['Int']['output'];
  players: Array<GolfGroupPlayerType>;
  teeTime: Scalars['String']['output'];
};

export type FlightCheckInInfoType = {
  __typename?: 'FlightCheckInInfoType';
  caddyAssignment?: Maybe<Scalars['String']['output']>;
  cartNumber?: Maybe<Scalars['String']['output']>;
  course: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  players: Array<CheckInPlayerInfoType>;
  startingHole: Scalars['Int']['output'];
  teeTime: Scalars['DateTime']['output'];
};

export type FlightCheckInResponseType = {
  __typename?: 'FlightCheckInResponseType';
  checkedInAt: Scalars['DateTime']['output'];
  success: Scalars['Boolean']['output'];
  teeTime: TeeTimeType;
};

export type FlightPaymentSummaryType = {
  __typename?: 'FlightPaymentSummaryType';
  checkedInCount: Scalars['Int']['output'];
  course: Scalars['String']['output'];
  isFullyCheckedIn: Scalars['Boolean']['output'];
  isFullySettled: Scalars['Boolean']['output'];
  settledCount: Scalars['Int']['output'];
  teeTime: Scalars['DateTime']['output'];
  teeTimeId: Scalars['ID']['output'];
  totalBalance: Scalars['Float']['output'];
  totalDue: Scalars['Float']['output'];
  totalPaid: Scalars['Float']['output'];
  totalPlayers: Scalars['Int']['output'];
};

export type GenerateTicketInput = {
  forceRegenerate?: InputMaybe<Scalars['Boolean']['input']>;
  teeTimeId: Scalars['ID']['input'];
};

export type GetAutoPayHistoryInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  memberId: Scalars['String']['input'];
};

export type GetMemberSpendsInput = {
  memberId?: InputMaybe<Scalars['String']['input']>;
  periodEnd?: InputMaybe<Scalars['DateTime']['input']>;
  periodStart?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<MemberSpendStatus>;
};

export type GetSettlementsInput = {
  endDate: Scalars['DateTime']['input'];
  startDate: Scalars['DateTime']['input'];
};

export type GetTransactionsInput = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  subAccountId?: InputMaybe<Scalars['String']['input']>;
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

export type GreenFeeRateMutationResponse = {
  __typename?: 'GreenFeeRateMutationResponse';
  greenFeeRate?: Maybe<GreenFeeRateType>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type GreenFeeRateType = {
  __typename?: 'GreenFeeRateType';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  holes: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  playerType: Scalars['String']['output'];
  taxRate: Scalars['Float']['output'];
  taxType: Scalars['String']['output'];
  timeCategory: Scalars['String']['output'];
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

/** Interest category for member engagement */
export type InterestCategoryType = {
  __typename?: 'InterestCategoryType';
  code: Scalars['String']['output'];
  color?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  sortOrder: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Source of the interest data */
export type InterestSource =
  | 'BOOKING'
  | 'EXPLICIT'
  | 'INFERRED';

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

/** Preview of late fee calculation */
export type LateFeePreview = {
  __typename?: 'LateFeePreview';
  /** Date when late fee would be applied */
  appliedDate: Scalars['DateTime']['output'];
  /** Number of days overdue */
  daysOverdue: Scalars['Int']['output'];
  /** Human-readable description of the late fee */
  description: Scalars['String']['output'];
  /** Late fee amount in cents */
  feeAmount: Scalars['Float']['output'];
  /** Whether the invoice is still within grace period */
  isWithinGracePeriod: Scalars['Boolean']['output'];
};

export type LateFeePreviewInput = {
  /** Date to calculate late fee as of (defaults to today) */
  calculationDate?: InputMaybe<Scalars['DateTime']['input']>;
  invoiceId: Scalars['ID']['input'];
};

/** Late fee type options */
export type LateFeeType =
  | 'FIXED'
  | 'PERCENTAGE'
  | 'TIERED';

export type LineItemPaymentType = {
  __typename?: 'LineItemPaymentType';
  amount: Scalars['Float']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lineItemId: Scalars['ID']['output'];
};

/** Type of booking line item */
export type LineItemType =
  | 'CADDY'
  | 'CART'
  | 'GREEN_FEE'
  | 'PROSHOP'
  | 'RENTAL';

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

export type MemberAtRiskType = {
  __typename?: 'MemberAtRiskType';
  creditLimit: Scalars['Float']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isAtRisk: Scalars['Boolean']['output'];
  isExceeded: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  memberId: Scalars['String']['output'];
  outstandingBalance: Scalars['Float']['output'];
  usagePercent: Scalars['Float']['output'];
};

/** Member-specific billing profile with optional overrides */
export type MemberBillingProfileType = {
  __typename?: 'MemberBillingProfileType';
  /** Override cycle alignment for this member */
  billingAlignment?: Maybe<CycleAlignment>;
  /** Override billing frequency for this member */
  billingFrequency?: Maybe<BillingFrequency>;
  /** Whether billing is on hold for this member */
  billingHold: Scalars['Boolean']['output'];
  /** Reason for placing billing on hold */
  billingHoldReason?: Maybe<Scalars['String']['output']>;
  /** Date until which billing is on hold */
  billingHoldUntil?: Maybe<Scalars['DateTime']['output']>;
  /** Override billing timing for this member */
  billingTiming?: Maybe<BillingTiming>;
  /** When the profile was created */
  createdAt: Scalars['DateTime']['output'];
  /** Current billing period end date */
  currentPeriodEnd?: Maybe<Scalars['DateTime']['output']>;
  /** Current billing period start date */
  currentPeriodStart?: Maybe<Scalars['DateTime']['output']>;
  /** Custom billing day of month (1-28) */
  customBillingDay?: Maybe<Scalars['Int']['output']>;
  /** Custom grace period in days */
  customGracePeriod?: Maybe<Scalars['Int']['output']>;
  /** Whether this member is exempt from late fees */
  customLateFeeExempt: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  /** Last billing date processed */
  lastBillingDate?: Maybe<Scalars['DateTime']['output']>;
  /** Associated member information */
  member?: Maybe<MemberBillingSummary>;
  memberId: Scalars['ID']['output'];
  /** Next scheduled billing date */
  nextBillingDate?: Maybe<Scalars['DateTime']['output']>;
  /** Internal notes about this billing profile */
  notes?: Maybe<Scalars['String']['output']>;
  /** Override proration method for this member */
  prorationOverride?: Maybe<ProrationMethod>;
  /** When the profile was last updated */
  updatedAt: Scalars['DateTime']['output'];
};

/** Minimal member summary for billing contexts */
export type MemberBillingSummary = {
  __typename?: 'MemberBillingSummary';
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  /** Member ID number */
  memberId: Scalars['String']['output'];
};

/** Member communication preferences */
export type MemberCommunicationPrefsType = {
  __typename?: 'MemberCommunicationPrefsType';
  createdAt: Scalars['DateTime']['output'];
  emailPromotions: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  memberId: Scalars['ID']['output'];
  pushNotifications: Scalars['Boolean']['output'];
  smsPromotions: Scalars['Boolean']['output'];
  unsubscribedCategories: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type MemberConnection = {
  __typename?: 'MemberConnection';
  edges: Array<MemberTypeEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Single interest entry for a member */
export type MemberInterestInput = {
  categoryId: Scalars['ID']['input'];
  interestLevel: Scalars['Int']['input'];
  source?: InputMaybe<InterestSource>;
};

/** Member interest in an activity category */
export type MemberInterestType = {
  __typename?: 'MemberInterestType';
  activityCount: Scalars['Int']['output'];
  category?: Maybe<InterestCategoryType>;
  categoryId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** Interest level 0-100 */
  interestLevel: Scalars['Int']['output'];
  lastActivityAt?: Maybe<Scalars['DateTime']['output']>;
  memberId: Scalars['ID']['output'];
  source: InterestSource;
  updatedAt: Scalars['DateTime']['output'];
};

export type MemberMinimumSpend = {
  __typename?: 'MemberMinimumSpend';
  carryForwardAmount: Scalars['Float']['output'];
  clubId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  currentSpend: Scalars['Float']['output'];
  exemptAt?: Maybe<Scalars['DateTime']['output']>;
  exemptBy?: Maybe<Scalars['String']['output']>;
  exemptReason?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isExempt: Scalars['Boolean']['output'];
  lastCalculatedAt: Scalars['DateTime']['output'];
  memberId: Scalars['String']['output'];
  periodEnd: Scalars['DateTime']['output'];
  periodLabel: Scalars['String']['output'];
  periodStart: Scalars['DateTime']['output'];
  projectedSpend?: Maybe<Scalars['Float']['output']>;
  requiredAmount: Scalars['Float']['output'];
  requirement?: Maybe<MinimumSpendRequirement>;
  requirementId: Scalars['String']['output'];
  shortfallAction?: Maybe<ShortfallAction>;
  shortfallAmount?: Maybe<Scalars['Float']['output']>;
  shortfallInvoiceId?: Maybe<Scalars['String']['output']>;
  shortfallNote?: Maybe<Scalars['String']['output']>;
  shortfallResolvedAt?: Maybe<Scalars['DateTime']['output']>;
  shortfallResolvedBy?: Maybe<Scalars['String']['output']>;
  status: MemberSpendStatus;
  updatedAt: Scalars['DateTime']['output'];
};

/** Status of member spending against requirement */
export type MemberSpendStatus =
  | 'AT_RISK'
  | 'EXEMPT'
  | 'MET'
  | 'ON_TRACK'
  | 'PENDING_ACTION'
  | 'RESOLVED'
  | 'SHORTFALL';

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

/** Period for minimum spend requirements */
export type MinimumSpendPeriod =
  | 'ANNUALLY'
  | 'MONTHLY'
  | 'QUARTERLY';

export type MinimumSpendRequirement = {
  __typename?: 'MinimumSpendRequirement';
  allowPartialCredit: Scalars['Boolean']['output'];
  clubId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  defaultShortfallAction: ShortfallAction;
  description?: Maybe<Scalars['String']['output']>;
  effectiveFrom: Scalars['DateTime']['output'];
  effectiveTo?: Maybe<Scalars['DateTime']['output']>;
  excludedCategories: Array<Scalars['String']['output']>;
  gracePeriodDays: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  includeEvents: Scalars['Boolean']['output'];
  includeFoodBeverage: Scalars['Boolean']['output'];
  includeGolf: Scalars['Boolean']['output'];
  includeRetail: Scalars['Boolean']['output'];
  includeSpa: Scalars['Boolean']['output'];
  includedCategories: Array<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  membershipTypes: Array<Scalars['String']['output']>;
  minimumAmount: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  notifyAtPercent: Array<Scalars['Int']['output']>;
  notifyDaysBeforeEnd: Array<Scalars['Int']['output']>;
  period: MinimumSpendPeriod;
  updatedAt: Scalars['DateTime']['output'];
};

export type Modifier = {
  __typename?: 'Modifier';
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDefault: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  priceAdjustment: Scalars['Float']['output'];
  sortOrder: Scalars['Int']['output'];
};

export type ModifierGroup = {
  __typename?: 'ModifierGroup';
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  maxSelections?: Maybe<Scalars['Int']['output']>;
  minSelections: Scalars['Int']['output'];
  modifiers: Array<Modifier>;
  name: Scalars['String']['output'];
  selectionType: ModifierSelectionType;
  sortOrder: Scalars['Int']['output'];
};

export type ModifierSelectionType =
  | 'MULTIPLE'
  | 'SINGLE';

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
  /** Add a line item to a player */
  addLineItem: BookingLineItemType;
  /** Add a new stored payment method */
  addPaymentMethod: StoredPaymentMethod;
  /** Apply credit note to member balance */
  applyCreditNoteToBalance: CreditNoteGraphQlType;
  /** Apply credit note to a specific invoice */
  applyCreditNoteToInvoice: CreditNoteGraphQlType;
  /** Apply a discount to a line item or transaction */
  applyDiscount: ApplyDiscountResultType;
  /** Apply a discount using a promo code */
  applyDiscountByCode: ApplyDiscountResultType;
  /** Approve a credit note */
  approveCreditNote: CreditNoteGraphQlType;
  /** Approve a pending discount that requires manager approval */
  approveDiscount: AppliedDiscountType;
  assignEquipment: EquipmentAssignmentResponse;
  /** Auto-assign players to flights */
  assignFlights: GroupBookingFlightsResponse;
  /** Assign a template to an outlet */
  assignPOSTemplate: AssignTemplateMutationResponse;
  /** Batch settle invoices using FIFO allocation */
  batchSettleInvoices: BatchSettlementResult;
  /** Remove multiple line items */
  bulkRemoveLineItems: BulkRemoveResultType;
  /** Transfer multiple line items to another player */
  bulkTransferLineItems: BulkTransferResultType;
  bulkUpdateOutletProductConfigs: Array<OutletProductConfig>;
  /** Bulk update multiple pro shop products */
  bulkUpdateProShopProducts: Array<ProShopProductType>;
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
  /** Change a sub-account PIN */
  changeSubAccountPin: SubAccount;
  /** Change a sub-account status */
  changeSubAccountStatus: SubAccount;
  /** Check in a booking */
  checkIn: CheckInResponseType;
  /** Check in all players in a flight at once */
  checkInAllPlayers: CheckInResultType;
  /** Check in multiple players for a flight */
  checkInFlight: CheckInResultType;
  /** Check in multiple players at once */
  checkInSlots: CheckInSlotsResultType;
  /** Clear cart draft for a tee time */
  clearCartDraft: Scalars['Boolean']['output'];
  /** Clone a POS template with a new name */
  clonePOSTemplate: CloneTemplateMutationResponse;
  /** Close a lottery to new requests */
  closeLottery: LotteryMutationResponse;
  /** Close a minimum spend period and process shortfalls */
  closeMinimumSpendPeriod: Array<MemberMinimumSpend>;
  /** Close a settlement */
  closeSettlement: DailySettlementGraphQlType;
  /** Close a shift */
  closeShift: CashDrawerShiftGraphQlType;
  /** Confirm group booking and create tee times */
  confirmGroupBooking: GroupBookingMutationResponse;
  /** Convert a waitlist entry to a booking */
  convertWaitlistToBooking: WaitlistMutationResponse;
  /** Create a new membership application */
  createApplication: MembershipApplicationType;
  /** Create a new booking */
  createBooking: CreateBookingResponseType;
  /** Create a caddy rate */
  createCaddyRate: CaddyRateMutationResponse;
  /** Create a cart rate */
  createCartRate: CartRateMutationResponse;
  /** Create a new cash drawer */
  createCashDrawer: CashDrawerGraphQlType;
  /** Create a new payment method for check-in */
  createCheckInPaymentMethod: CheckInPaymentMethodType;
  /** Create a course schedule */
  createCourseSchedule: ScheduleMutationResponse;
  /** Create a new credit note */
  createCreditNote: CreditNoteGraphQlType;
  /** Create a credit limit override (temporary or permanent increase) */
  createCreditOverride: CreditLimitOverrideType;
  /** Create default schedule configuration for a course */
  createDefaultScheduleConfig: ScheduleConfigMutationResponse;
  /** Add a dependent to a member */
  createDependent: DependentType;
  /** Create a new discount */
  createDiscount: DiscountGraphQlType;
  createEquipment: EquipmentResponse;
  createEquipmentCategory: EquipmentCategoryResponse;
  /** Create a new facility */
  createFacility: FacilityResponseType;
  /** Create a green fee rate */
  createGreenFeeRate: GreenFeeRateMutationResponse;
  /** Create a group booking */
  createGroupBooking: GroupBookingMutationResponse;
  /** Create a new interest category */
  createInterestCategory: InterestCategoryType;
  /** Create a new invoice */
  createInvoice: InvoiceType;
  /** Create a lottery */
  createLottery: LotteryMutationResponse;
  /** Create a new member */
  createMember: MemberType;
  /** Create a billing profile for a member with custom settings */
  createMemberBillingProfile: MemberBillingProfileType;
  /** Create a new minimum spend requirement */
  createMinimumSpendRequirement: MinimumSpendRequirement;
  createModifierGroup: ModifierGroup;
  /** Create a new pro shop category */
  createProShopCategory: ProShopCategoryType;
  /** Create a new pro shop product */
  createProShopProduct: ProShopProductType;
  createProduct: Product;
  createProductCategory: ProductCategory;
  /** Create a rate configuration */
  createRateConfig: RateConfigMutationResponse;
  /** Create a season */
  createSeason: SeasonMutationResponse;
  /** Create a new service */
  createService: ServiceResponseType;
  /** Create a settlement exception */
  createSettlementException: SettlementExceptionGraphQlType;
  /** Create a special day */
  createSpecialDay: SpecialDayMutationResponse;
  /** Create a new staff member */
  createStaffMember: StaffResponseType;
  /** Create a new sub-account */
  createSubAccount: SubAccount;
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
  /** Delete a caddy rate */
  deleteCaddyRate: DeleteRateMutationResponse;
  /** Delete a cart rate */
  deleteCartRate: DeleteRateMutationResponse;
  /** Delete a payment method */
  deleteCheckInPaymentMethod: Scalars['Boolean']['output'];
  /** Delete a course schedule */
  deleteCourseSchedule: ScheduleMutationResponse;
  /** Delete a dependent */
  deleteDependent: DeleteDependentResponseType;
  /** Delete a discount (soft delete) */
  deleteDiscount: Scalars['Boolean']['output'];
  deleteEquipment: EquipmentDeleteResponse;
  deleteEquipmentCategory: EquipmentDeleteResponse;
  /** Delete a facility */
  deleteFacility: DeleteResponseType;
  /** Delete a green fee rate */
  deleteGreenFeeRate: DeleteRateMutationResponse;
  /** Delete a draft group booking */
  deleteGroupBooking: GroupBookingMutationResponse;
  /** Delete an interest category */
  deleteInterestCategory: EngagementDeleteResponse;
  /** Delete a draft lottery */
  deleteLottery: LotteryMutationResponse;
  /** Soft delete a member */
  deleteMember: DeleteMemberResponseType;
  /** Delete (deactivate) a minimum spend requirement */
  deleteMinimumSpendRequirement: MinimumSpendRequirement;
  /** Delete a POS template */
  deletePOSTemplate: DeleteTemplateMutationResponse;
  /** Delete a pro shop category. If category has products, provide moveProductsTo. */
  deleteProShopCategory: Scalars['Boolean']['output'];
  /** Delete a pro shop product */
  deleteProShopProduct: Scalars['Boolean']['output'];
  deleteProduct: Scalars['Boolean']['output'];
  deleteProductCategory: Scalars['Boolean']['output'];
  /** Delete a rate configuration */
  deleteRateConfig: DeleteRateMutationResponse;
  /** Delete a season */
  deleteSeason: DeleteMutationResponse;
  /** Delete a service */
  deleteService: DeleteResponseType;
  /** Delete a special day */
  deleteSpecialDay: DeleteMutationResponse;
  /** Delete a staff member */
  deleteStaffMember: DeleteResponseType;
  /** Delete (revoke) a sub-account */
  deleteSubAccount: SubAccount;
  /** Delete a tee time block */
  deleteTeeTimeBlock: BlockMutationResponse;
  /** Delete a time period */
  deleteTimePeriod: DeleteMutationResponse;
  /** Delete a waitlist entry */
  deleteWaitlistEntry: WaitlistMutationResponse;
  /** Disable auto-pay for a member */
  disableAutoPay: RemovePaymentMethodResult;
  /** Execute the lottery draw */
  executeLotteryDraw: LotteryDrawResult;
  /** Exempt a member from a minimum spend requirement */
  exemptMemberFromMinimumSpend: MemberMinimumSpend;
  /** Mark expired waitlist entries */
  expireOldWaitlistEntries: WaitlistMutationResponse;
  /** Generate or regenerate a starter ticket for a tee time */
  generateStarterTicket: StarterTicketResponseType;
  /** Import players from CSV data */
  importPlayersFromCSV: GroupBookingMutationResponse;
  /** Join a waitlist */
  joinWaitlist: WaitlistResponseType;
  /** Move a tee time to a different slot */
  moveTeeTime: TeeTimeType;
  /** Notify waitlist when a tee time is cancelled */
  notifyWaitlistForCancellation: WaitlistNotificationResult;
  /** Open a new business day */
  openDay: DailySettlementGraphQlType;
  /** Open a lottery for requests */
  openLottery: LotteryMutationResponse;
  /** Open a new shift on a cash drawer */
  openShift: CashDrawerShiftGraphQlType;
  /** Pay specific line items */
  payLineItems: PayLineItemsResultType;
  /** Mark a starter ticket as printed */
  printStarterTicket: StarterTicketResponseType;
  /** Manually process an auto-pay for an invoice */
  processAutoPay: AutoPayResult;
  /** Process payment for multiple players at once */
  processBatchPayment: BatchPaymentResultType;
  /** Process payment settlement for players */
  processSettlement: SettlementResultType;
  /** Publish lottery results and create tee times */
  publishLotteryResults: LotteryMutationResponse;
  /** Recalculate member spend from transactions */
  recalculateMemberSpend: MemberMinimumSpend;
  /** Recalculate settlement totals from transactions */
  recalculateSettlementTotals: DailySettlementGraphQlType;
  /** Record actual cash count */
  recordCashCount: DailySettlementGraphQlType;
  /** Record a cash movement */
  recordCashMovement: CashMovementGraphQlType;
  /** Record spending against a member minimum spend requirement */
  recordMinimumSpend: MemberMinimumSpend;
  /** Record a payment */
  recordPayment: PaymentType;
  /** Record a transaction for a sub-account */
  recordSubAccountTransaction: SubAccountTransaction;
  /** Manually regenerate line items for a tee time */
  regenerateLineItems: Scalars['Boolean']['output'];
  releaseEquipmentForBooking: EquipmentReleaseResponse;
  /** Remove an applied discount */
  removeAppliedDiscount: Scalars['Boolean']['output'];
  /** Remove a specific interest from a dependent */
  removeDependentInterest: EngagementDeleteResponse;
  /** Remove entry from waitlist */
  removeFromWaitlist: WaitlistResponseType;
  /** Remove a player from a group booking */
  removeGroupPlayer: GroupBookingMutationResponse;
  /** Remove a line item from cart */
  removeLineItem: RemoveLineItemResultType;
  /** Remove a specific interest from a member */
  removeMemberInterest: EngagementDeleteResponse;
  /** Remove minimum spend exemption from a member */
  removeMinimumSpendExemption: MemberMinimumSpend;
  /** Remove a stored payment method */
  removePaymentMethod: RemovePaymentMethodResult;
  /** Reopen a closed settlement */
  reopenSettlement: DailySettlementGraphQlType;
  /** Reorder payment methods by providing ordered IDs */
  reorderCheckInPaymentMethods: Array<CheckInPaymentMethodType>;
  /** Reorder pro shop categories by providing ordered IDs */
  reorderProShopCategories: Array<ProShopCategoryType>;
  /** Reschedule a booking */
  rescheduleBooking: CreateBookingResponseType;
  /** Reset all check-in settings to defaults */
  resetCheckInSettings: CheckInSettingsType;
  /** Reset all spending counters for a sub-account */
  resetSubAccountSpending: SubAccount;
  /** Resolve a minimum spend shortfall */
  resolveMinimumSpendShortfall: MemberMinimumSpend;
  /** Resolve a settlement exception */
  resolveSettlementException: SettlementExceptionGraphQlType;
  /** Resume a suspended shift */
  resumeShift: CashDrawerShiftGraphQlType;
  /** Retry a failed auto-pay attempt */
  retryAutoPayAttempt: AutoPayResult;
  returnEquipment: EquipmentAssignmentResponse;
  /** Revert a credit limit override */
  revertCreditOverride: Scalars['Boolean']['output'];
  /** Save cart draft for a tee time */
  saveCartDraft: CartDraftType;
  /** Send an invoice */
  sendInvoice: InvoiceType;
  /** Send offer to waitlist entry */
  sendWaitlistOffer: WaitlistResponseType;
  /** Set a payment method as default */
  setDefaultPaymentMethod: StoredPaymentMethod;
  /** Set interests for a dependent (upserts) */
  setDependentInterests: Array<DependentInterestType>;
  /** Set interests for a member (upserts) */
  setMemberInterests: Array<MemberInterestType>;
  /** Set role-specific button overrides for an outlet */
  setPOSRoleOverrides: SetRoleOverridesMutationResponse;
  /** Settle all players in a flight at once */
  settleAllPlayers: SettlementResultType;
  /** Submit a lottery request (member) */
  submitLotteryRequest: LotteryRequestMutationResponse;
  /** Submit settlement for review */
  submitSettlementForReview: DailySettlementGraphQlType;
  /** Suspend a shift temporarily */
  suspendShift: CashDrawerShiftGraphQlType;
  /** Enable or disable a payment method */
  toggleCheckInPaymentMethod: CheckInPaymentMethodType;
  /** Toggle quick add status for a product */
  toggleProductQuickAdd: ProShopProductType;
  /** Transfer a line item from one player to another */
  transferLineItem: TransferResultType;
  /** Undo a player check-in */
  undoCheckIn: Scalars['Boolean']['output'];
  /** Undo a line item transfer */
  undoTransfer: TransferResultType;
  /** Unlock a locked sub-account PIN */
  unlockSubAccountPin: SubAccount;
  /** Update an existing membership application */
  updateApplication: MembershipApplicationType;
  /** Update a caddy rate */
  updateCaddyRate: CaddyRateMutationResponse;
  /** Update a cart rate */
  updateCartRate: CartRateMutationResponse;
  /** Update a cash drawer */
  updateCashDrawer: CashDrawerGraphQlType;
  /** Update an existing payment method */
  updateCheckInPaymentMethod: CheckInPaymentMethodType;
  /** Update check-in policy settings */
  updateCheckInPolicy: CheckInSettingsType;
  /** Update club-wide billing configuration settings */
  updateClubBillingSettings: ClubBillingSettingsType;
  /** Update a course schedule */
  updateCourseSchedule: ScheduleMutationResponse;
  /** Update a dependent */
  updateDependent: DependentType;
  /** Update an existing discount */
  updateDiscount: DiscountGraphQlType;
  updateEquipment: EquipmentResponse;
  updateEquipmentCategory: EquipmentCategoryResponse;
  updateEquipmentStatus: EquipmentResponse;
  /** Update an existing facility */
  updateFacility: FacilityResponseType;
  /** Update a green fee rate */
  updateGreenFeeRate: GreenFeeRateMutationResponse;
  /** Update a group booking */
  updateGroupBooking: GroupBookingMutationResponse;
  /** Update an existing interest category */
  updateInterestCategory: InterestCategoryType;
  /** Update line item quantity */
  updateLineItemQuantity: UpdateQuantityResultType;
  /** Update a lottery */
  updateLottery: LotteryMutationResponse;
  /** Update an existing member */
  updateMember: MemberType;
  /** Update billing profile for a member */
  updateMemberBillingProfile: MemberBillingProfileType;
  /** Update communication preferences for a member */
  updateMemberCommunicationPrefs: MemberCommunicationPrefsType;
  /** Update credit limit settings for a member */
  updateMemberCreditSettings: Scalars['Boolean']['output'];
  /** Update a minimum spend requirement */
  updateMinimumSpendRequirement: MinimumSpendRequirement;
  updateModifierGroup: ModifierGroup;
  updateOutletGridConfig: OutletGridConfig;
  updateOutletProductConfig: OutletProductConfig;
  /** Update the button registry for the club */
  updatePOSButtonRegistry: UpdateButtonRegistryMutationResponse;
  /** Update POS integration settings */
  updatePOSConfig: CheckInSettingsType;
  /** Update a stored payment method */
  updatePaymentMethod: StoredPaymentMethod;
  /** Update a single player rental status (cart/caddy) */
  updatePlayerRentalStatus: TeeTimePlayerType;
  /** Update an existing pro shop category */
  updateProShopCategory: ProShopCategoryType;
  /** Update pro shop integration settings */
  updateProShopConfig: CheckInSettingsType;
  /** Update an existing pro shop product */
  updateProShopProduct: ProShopProductType;
  updateProduct: Product;
  updateProductCategory: ProductCategory;
  /** Update a rate configuration */
  updateRateConfig: RateConfigMutationResponse;
  /** Update schedule configuration */
  updateScheduleConfig: ScheduleConfigMutationResponse;
  /** Update a season */
  updateSeason: SeasonMutationResponse;
  /** Update an existing service */
  updateService: ServiceResponseType;
  /** Update settlement totals */
  updateSettlementTotals: DailySettlementGraphQlType;
  updateSmartSuggestionConfig: SmartSuggestionConfig;
  /** Update a special day */
  updateSpecialDay: SpecialDayMutationResponse;
  /** Update a staff member */
  updateStaffMember: StaffResponseType;
  /** Update starter ticket configuration */
  updateStarterTicketConfig: CheckInSettingsType;
  /** Update a sub-account */
  updateSubAccount: SubAccount;
  /** Update tax configuration including overrides */
  updateTaxConfig: CheckInSettingsType;
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
  /** Create or update auto-pay settings */
  upsertAutoPaySetting: AutoPaySetting;
  /** Create or update a POS template */
  upsertPOSTemplate: UpsertTemplateMutationResponse;
  /** Verify a sub-account PIN */
  verifySubAccountPin: PinVerificationResult;
  /** Void a credit note */
  voidCreditNote: CreditNoteGraphQlType;
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


export type MutationAddLineItemArgs = {
  input: AddLineItemInput;
};


export type MutationAddPaymentMethodArgs = {
  input: AddStoredPaymentInput;
};


export type MutationApplyCreditNoteToBalanceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationApplyCreditNoteToInvoiceArgs = {
  id: Scalars['ID']['input'];
  input: ApplyCreditNoteInput;
};


export type MutationApplyDiscountArgs = {
  input: ApplyDiscountInput;
};


export type MutationApplyDiscountByCodeArgs = {
  input: ApplyDiscountByCodeInput;
};


export type MutationApproveCreditNoteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationApproveDiscountArgs = {
  input: ApproveDiscountInput;
};


export type MutationAssignEquipmentArgs = {
  input: AssignEquipmentInput;
};


export type MutationAssignFlightsArgs = {
  id: Scalars['ID']['input'];
  interval?: Scalars['Float']['input'];
};


export type MutationAssignPosTemplateArgs = {
  input: AssignTemplateInput;
};


export type MutationBatchSettleInvoicesArgs = {
  input: BatchSettlementInput;
};


export type MutationBulkRemoveLineItemsArgs = {
  input: BulkRemoveLineItemsInput;
};


export type MutationBulkTransferLineItemsArgs = {
  input: BulkTransferLineItemsInput;
};


export type MutationBulkUpdateOutletProductConfigsArgs = {
  input: BulkOutletProductConfigInput;
  outletId: Scalars['ID']['input'];
};


export type MutationBulkUpdateProShopProductsArgs = {
  ids: Array<Scalars['ID']['input']>;
  input: BulkUpdateProShopProductInput;
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


export type MutationChangeSubAccountPinArgs = {
  input: ChangePinInput;
};


export type MutationChangeSubAccountStatusArgs = {
  input: ChangeSubAccountStatusInput;
};


export type MutationCheckInArgs = {
  input: CheckInInput;
};


export type MutationCheckInAllPlayersArgs = {
  input: CheckInAllPlayersInput;
};


export type MutationCheckInFlightArgs = {
  input: CheckInFlightInput;
};


export type MutationCheckInSlotsArgs = {
  input: CheckInSlotsInput;
};


export type MutationClearCartDraftArgs = {
  teeTimeId: Scalars['ID']['input'];
};


export type MutationClonePosTemplateArgs = {
  id: Scalars['ID']['input'];
  newName: Scalars['String']['input'];
};


export type MutationCloseLotteryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCloseMinimumSpendPeriodArgs = {
  input: ClosePeriodInput;
};


export type MutationCloseSettlementArgs = {
  input: CloseSettlementInput;
};


export type MutationCloseShiftArgs = {
  input: CloseShiftInput;
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


export type MutationCreateCaddyRateArgs = {
  input: CreateCaddyRateInput;
};


export type MutationCreateCartRateArgs = {
  input: CreateCartRateInput;
};


export type MutationCreateCashDrawerArgs = {
  input: CreateCashDrawerInput;
};


export type MutationCreateCheckInPaymentMethodArgs = {
  input: CreatePaymentMethodInput;
};


export type MutationCreateCourseScheduleArgs = {
  input: CreateScheduleInput;
};


export type MutationCreateCreditNoteArgs = {
  input: CreateCreditNoteInput;
};


export type MutationCreateCreditOverrideArgs = {
  input: CreateCreditOverrideInput;
};


export type MutationCreateDefaultScheduleConfigArgs = {
  courseId: Scalars['ID']['input'];
};


export type MutationCreateDependentArgs = {
  input: CreateDependentInput;
};


export type MutationCreateDiscountArgs = {
  input: CreateDiscountInput;
};


export type MutationCreateEquipmentArgs = {
  input: CreateEquipmentInput;
};


export type MutationCreateEquipmentCategoryArgs = {
  input: CreateEquipmentCategoryInput;
};


export type MutationCreateFacilityArgs = {
  input: CreateFacilityInput;
};


export type MutationCreateGreenFeeRateArgs = {
  input: CreateGreenFeeRateInput;
};


export type MutationCreateGroupBookingArgs = {
  input: CreateGroupBookingInput;
};


export type MutationCreateInterestCategoryArgs = {
  input: CreateInterestCategoryInput;
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


export type MutationCreateMemberBillingProfileArgs = {
  input: CreateMemberBillingProfileInput;
};


export type MutationCreateMinimumSpendRequirementArgs = {
  input: CreateRequirementInput;
};


export type MutationCreateModifierGroupArgs = {
  input: CreateModifierGroupInput;
};


export type MutationCreateProShopCategoryArgs = {
  input: CreateProShopCategoryInput;
};


export type MutationCreateProShopProductArgs = {
  input: CreateProShopProductInput;
};


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


export type MutationCreateProductCategoryArgs = {
  input: CreateProductCategoryInput;
};


export type MutationCreateRateConfigArgs = {
  input: CreateRateConfigInput;
};


export type MutationCreateSeasonArgs = {
  input: CreateSeasonInput;
  scheduleId: Scalars['ID']['input'];
};


export type MutationCreateServiceArgs = {
  input: CreateServiceInput;
};


export type MutationCreateSettlementExceptionArgs = {
  input: CreateExceptionInput;
};


export type MutationCreateSpecialDayArgs = {
  input: CreateSpecialDayInput;
  scheduleId: Scalars['ID']['input'];
};


export type MutationCreateStaffMemberArgs = {
  input: CreateStaffMemberInput;
};


export type MutationCreateSubAccountArgs = {
  input: CreateSubAccountInput;
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


export type MutationDeleteCaddyRateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCartRateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCheckInPaymentMethodArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCourseScheduleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteDependentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteDiscountArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteEquipmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteEquipmentCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteFacilityArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteGreenFeeRateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteGroupBookingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteInterestCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteLotteryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteMemberArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteMinimumSpendRequirementArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePosTemplateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProShopCategoryArgs = {
  id: Scalars['ID']['input'];
  moveProductsTo?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationDeleteProShopProductArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProductArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProductCategoryArgs = {
  id: Scalars['ID']['input'];
  moveProductsTo?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationDeleteRateConfigArgs = {
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


export type MutationDeleteSubAccountArgs = {
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


export type MutationDisableAutoPayArgs = {
  memberId: Scalars['ID']['input'];
};


export type MutationExecuteLotteryDrawArgs = {
  id: Scalars['ID']['input'];
};


export type MutationExemptMemberFromMinimumSpendArgs = {
  input: ExemptMemberInput;
};


export type MutationGenerateStarterTicketArgs = {
  input: GenerateTicketInput;
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


export type MutationOpenDayArgs = {
  input: OpenDayInput;
};


export type MutationOpenLotteryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationOpenShiftArgs = {
  input: OpenShiftInput;
};


export type MutationPayLineItemsArgs = {
  input: PayLineItemsInput;
};


export type MutationPrintStarterTicketArgs = {
  input: PrintTicketInput;
};


export type MutationProcessAutoPayArgs = {
  input: ProcessAutoPayInput;
};


export type MutationProcessBatchPaymentArgs = {
  input: BatchPaymentInput;
};


export type MutationProcessSettlementArgs = {
  input: ProcessSettlementInput;
};


export type MutationPublishLotteryResultsArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRecalculateMemberSpendArgs = {
  memberSpendId: Scalars['ID']['input'];
};


export type MutationRecalculateSettlementTotalsArgs = {
  settlementId: Scalars['ID']['input'];
};


export type MutationRecordCashCountArgs = {
  input: RecordCashCountInput;
};


export type MutationRecordCashMovementArgs = {
  approvedBy?: InputMaybe<Scalars['ID']['input']>;
  input: RecordMovementInput;
};


export type MutationRecordMinimumSpendArgs = {
  input: RecordSpendInput;
};


export type MutationRecordPaymentArgs = {
  input: CreatePaymentInput;
};


export type MutationRecordSubAccountTransactionArgs = {
  input: RecordTransactionInput;
};


export type MutationRegenerateLineItemsArgs = {
  teeTimeId: Scalars['ID']['input'];
};


export type MutationReleaseEquipmentForBookingArgs = {
  bookingId: Scalars['ID']['input'];
};


export type MutationRemoveAppliedDiscountArgs = {
  appliedDiscountId: Scalars['ID']['input'];
};


export type MutationRemoveDependentInterestArgs = {
  categoryId: Scalars['ID']['input'];
  dependentId: Scalars['ID']['input'];
};


export type MutationRemoveFromWaitlistArgs = {
  input: WaitlistActionInput;
};


export type MutationRemoveGroupPlayerArgs = {
  groupBookingId: Scalars['ID']['input'];
  playerId: Scalars['ID']['input'];
};


export type MutationRemoveLineItemArgs = {
  input: RemoveLineItemInput;
};


export type MutationRemoveMemberInterestArgs = {
  categoryId: Scalars['ID']['input'];
  memberId: Scalars['ID']['input'];
};


export type MutationRemoveMinimumSpendExemptionArgs = {
  memberSpendId: Scalars['ID']['input'];
};


export type MutationRemovePaymentMethodArgs = {
  id: Scalars['ID']['input'];
};


export type MutationReopenSettlementArgs = {
  input: ReopenSettlementInput;
};


export type MutationReorderCheckInPaymentMethodsArgs = {
  orderedIds: Array<Scalars['ID']['input']>;
};


export type MutationReorderProShopCategoriesArgs = {
  orderedIds: Array<Scalars['ID']['input']>;
};


export type MutationRescheduleBookingArgs = {
  input: RescheduleBookingInput;
};


export type MutationResetSubAccountSpendingArgs = {
  subAccountId: Scalars['ID']['input'];
};


export type MutationResolveMinimumSpendShortfallArgs = {
  input: ResolveShortfallInput;
};


export type MutationResolveSettlementExceptionArgs = {
  input: ResolveExceptionInput;
};


export type MutationResumeShiftArgs = {
  shiftId: Scalars['ID']['input'];
};


export type MutationRetryAutoPayAttemptArgs = {
  attemptId: Scalars['ID']['input'];
};


export type MutationReturnEquipmentArgs = {
  input: ReturnEquipmentInput;
};


export type MutationRevertCreditOverrideArgs = {
  overrideId: Scalars['ID']['input'];
};


export type MutationSaveCartDraftArgs = {
  input: SaveCartDraftInput;
};


export type MutationSendInvoiceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSendWaitlistOfferArgs = {
  input: SendWaitlistOfferInput;
};


export type MutationSetDefaultPaymentMethodArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSetDependentInterestsArgs = {
  input: SetDependentInterestsInput;
};


export type MutationSetMemberInterestsArgs = {
  input: SetMemberInterestsInput;
};


export type MutationSetPosRoleOverridesArgs = {
  input: PosRoleOverridesInput;
  outletId: Scalars['ID']['input'];
};


export type MutationSettleAllPlayersArgs = {
  input: SettleAllPlayersInput;
};


export type MutationSubmitLotteryRequestArgs = {
  input: CreateLotteryRequestInput;
};


export type MutationSubmitSettlementForReviewArgs = {
  settlementId: Scalars['ID']['input'];
};


export type MutationSuspendShiftArgs = {
  shiftId: Scalars['ID']['input'];
};


export type MutationToggleCheckInPaymentMethodArgs = {
  id: Scalars['ID']['input'];
  isEnabled: Scalars['Boolean']['input'];
};


export type MutationToggleProductQuickAddArgs = {
  id: Scalars['ID']['input'];
  isQuickAdd: Scalars['Boolean']['input'];
};


export type MutationTransferLineItemArgs = {
  input: TransferLineItemInput;
};


export type MutationUndoCheckInArgs = {
  input: UndoCheckInInput;
};


export type MutationUndoTransferArgs = {
  input: UndoTransferInput;
};


export type MutationUnlockSubAccountPinArgs = {
  subAccountId: Scalars['ID']['input'];
};


export type MutationUpdateApplicationArgs = {
  id: Scalars['ID']['input'];
  input: UpdateApplicationInput;
};


export type MutationUpdateCaddyRateArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCaddyRateInput;
};


export type MutationUpdateCartRateArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCartRateInput;
};


export type MutationUpdateCashDrawerArgs = {
  input: UpdateCashDrawerInput;
};


export type MutationUpdateCheckInPaymentMethodArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePaymentMethodInput;
};


export type MutationUpdateCheckInPolicyArgs = {
  input: CheckInPolicyInput;
};


export type MutationUpdateClubBillingSettingsArgs = {
  input: UpdateClubBillingSettingsInput;
};


export type MutationUpdateCourseScheduleArgs = {
  id: Scalars['ID']['input'];
  input: UpdateScheduleInput;
};


export type MutationUpdateDependentArgs = {
  id: Scalars['ID']['input'];
  input: UpdateDependentInput;
};


export type MutationUpdateDiscountArgs = {
  id: Scalars['ID']['input'];
  input: UpdateDiscountInput;
};


export type MutationUpdateEquipmentArgs = {
  input: UpdateEquipmentInput;
};


export type MutationUpdateEquipmentCategoryArgs = {
  input: UpdateEquipmentCategoryInput;
};


export type MutationUpdateEquipmentStatusArgs = {
  input: UpdateEquipmentStatusInput;
};


export type MutationUpdateFacilityArgs = {
  input: UpdateFacilityInput;
};


export type MutationUpdateGreenFeeRateArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGreenFeeRateInput;
};


export type MutationUpdateGroupBookingArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGroupBookingInput;
};


export type MutationUpdateInterestCategoryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateInterestCategoryInput;
};


export type MutationUpdateLineItemQuantityArgs = {
  input: UpdateLineItemQuantityInput;
};


export type MutationUpdateLotteryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateLotteryInput;
};


export type MutationUpdateMemberArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMemberInput;
};


export type MutationUpdateMemberBillingProfileArgs = {
  input: UpdateMemberBillingProfileInput;
  memberId: Scalars['ID']['input'];
};


export type MutationUpdateMemberCommunicationPrefsArgs = {
  input: UpdateCommunicationPrefsInput;
};


export type MutationUpdateMemberCreditSettingsArgs = {
  input: UpdateCreditSettingsInput;
};


export type MutationUpdateMinimumSpendRequirementArgs = {
  input: UpdateRequirementInput;
};


export type MutationUpdateModifierGroupArgs = {
  id: Scalars['ID']['input'];
  input: UpdateModifierGroupInput;
};


export type MutationUpdateOutletGridConfigArgs = {
  input: UpdateOutletGridConfigInput;
  outletId: Scalars['ID']['input'];
};


export type MutationUpdateOutletProductConfigArgs = {
  input: UpdateOutletProductConfigInput;
  outletId: Scalars['ID']['input'];
  productId: Scalars['ID']['input'];
};


export type MutationUpdatePosButtonRegistryArgs = {
  input: UpdateButtonRegistryInput;
};


export type MutationUpdatePosConfigArgs = {
  input: PosConfigInput;
};


export type MutationUpdatePaymentMethodArgs = {
  input: UpdateStoredPaymentInput;
};


export type MutationUpdatePlayerRentalStatusArgs = {
  input: UpdatePlayerRentalStatusInput;
  playerId: Scalars['ID']['input'];
};


export type MutationUpdateProShopCategoryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProShopCategoryInput;
};


export type MutationUpdateProShopConfigArgs = {
  input: ProShopConfigInput;
};


export type MutationUpdateProShopProductArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProShopProductInput;
};


export type MutationUpdateProductArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProductInput;
};


export type MutationUpdateProductCategoryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProductCategoryInput;
};


export type MutationUpdateRateConfigArgs = {
  id: Scalars['ID']['input'];
  input: UpdateRateConfigInput;
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


export type MutationUpdateSettlementTotalsArgs = {
  input: UpdateSettlementTotalsInput;
};


export type MutationUpdateSmartSuggestionConfigArgs = {
  input: UpdateSmartSuggestionConfigInput;
  outletId: Scalars['ID']['input'];
};


export type MutationUpdateSpecialDayArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSpecialDayInput;
};


export type MutationUpdateStaffMemberArgs = {
  input: UpdateStaffMemberInput;
};


export type MutationUpdateStarterTicketConfigArgs = {
  input: StarterTicketConfigInput;
};


export type MutationUpdateSubAccountArgs = {
  input: UpdateSubAccountInput;
};


export type MutationUpdateTaxConfigArgs = {
  input: TaxConfigInput;
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


export type MutationUpsertAutoPaySettingArgs = {
  input: AutoPaySettingInput;
};


export type MutationUpsertPosTemplateArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  input: PosTemplateInput;
};


export type MutationVerifySubAccountPinArgs = {
  input: VerifyPinInput;
};


export type MutationVoidCreditNoteArgs = {
  id: Scalars['ID']['input'];
  input: VoidCreditNoteInput;
};


export type MutationVoidInvoiceArgs = {
  id: Scalars['ID']['input'];
  input: VoidInvoiceInput;
};

/** Which nine holes (front or back) for crossover mode */
export type NineType =
  | 'BACK'
  | 'FRONT';

export type OpenDayInput = {
  businessDate: Scalars['DateTime']['input'];
};

export type OpenShiftInput = {
  cashDrawerId: Scalars['ID']['input'];
  /** JSON string of denomination counts */
  denominations?: InputMaybe<Scalars['String']['input']>;
  openingFloat: Scalars['Float']['input'];
};

/** Type of operation this equipment category belongs to (Golf, Facility, Spa, Event) */
export type OperationType =
  | 'EVENT'
  | 'FACILITY'
  | 'GOLF'
  | 'SPA';

export type OutletGridConfig = {
  __typename?: 'OutletGridConfig';
  categoryStyle: CategoryDisplayStyle;
  gridColumns: Scalars['Int']['output'];
  gridRows: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  outletId: Scalars['ID']['output'];
  quickKeysCount: Scalars['Int']['output'];
  quickKeysEnabled: Scalars['Boolean']['output'];
  quickKeysPosition: QuickKeysPosition;
  showAllCategory: Scalars['Boolean']['output'];
  showImages: Scalars['Boolean']['output'];
  showPrices: Scalars['Boolean']['output'];
  tileSize: TileSize;
};

export type OutletProductConfig = {
  __typename?: 'OutletProductConfig';
  buttonColor?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  gridPosition?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  isQuickKey: Scalars['Boolean']['output'];
  isVisible: Scalars['Boolean']['output'];
  outletId: Scalars['ID']['output'];
  product?: Maybe<Product>;
  productId: Scalars['ID']['output'];
  quickKeyPosition?: Maybe<Scalars['Int']['output']>;
  sortPriority?: Maybe<Scalars['Int']['output']>;
  visibilityRules: Scalars['JSON']['output'];
};

export type OutletProductPanel = {
  __typename?: 'OutletProductPanel';
  gridConfig: OutletGridConfig;
  quickKeys: Array<Product>;
  suggestionConfig?: Maybe<SmartSuggestionConfig>;
  suggestions: Array<Product>;
};

export type PosButtonRegistryGraphQlType = {
  __typename?: 'POSButtonRegistryGraphQLType';
  clubId: Scalars['String']['output'];
  registry: Scalars['JSON']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type PosButtonStateGraphQlType = {
  __typename?: 'POSButtonStateGraphQLType';
  buttonId: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
  requiresApproval: Scalars['Boolean']['output'];
  visible: Scalars['Boolean']['output'];
};

export type PosConfigInput = {
  isConnected?: InputMaybe<Scalars['Boolean']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  terminalId?: InputMaybe<Scalars['String']['input']>;
};

export type PosConfigType = {
  __typename?: 'POSConfigType';
  isConnected: Scalars['Boolean']['output'];
  provider?: Maybe<Scalars['String']['output']>;
  terminalId?: Maybe<Scalars['String']['output']>;
};

export type PosOutletGraphQlType = {
  __typename?: 'POSOutletGraphQLType';
  clubId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  customConfig: Scalars['JSON']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  outletType: Scalars['String']['output'];
  roleConfigs?: Maybe<Array<PosOutletRoleConfigGraphQlType>>;
  template?: Maybe<PosTemplateGraphQlType>;
  templateId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type PosOutletRoleConfigGraphQlType = {
  __typename?: 'POSOutletRoleConfigGraphQLType';
  buttonOverrides: Scalars['JSON']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  outletId: Scalars['String']['output'];
  role: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type PosResolvedConfigGraphQlType = {
  __typename?: 'POSResolvedConfigGraphQLType';
  actionBarConfig: Scalars['JSON']['output'];
  buttonStates: Array<PosButtonStateGraphQlType>;
  outlet: PosOutletGraphQlType;
  template?: Maybe<PosTemplateGraphQlType>;
  toolbarConfig: Scalars['JSON']['output'];
};

export type PosRoleOverridesInput = {
  disabled?: InputMaybe<Array<Scalars['String']['input']>>;
  hidden?: InputMaybe<Array<Scalars['String']['input']>>;
  requireApproval?: InputMaybe<Array<Scalars['String']['input']>>;
  role: Scalars['String']['input'];
};

export type PosTemplateGraphQlType = {
  __typename?: 'POSTemplateGraphQLType';
  actionBarConfig: Scalars['JSON']['output'];
  clubId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isDefault: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  outletType: Scalars['String']['output'];
  outlets?: Maybe<Array<PosOutletGraphQlType>>;
  toolbarConfig: Scalars['JSON']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type PosTemplateInput = {
  actionBarConfig: Scalars['JSON']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  isDefault?: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  outletType: Scalars['String']['input'];
  toolbarConfig: Scalars['JSON']['input'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PayLineItemsInput = {
  lineItemIds: Array<Scalars['ID']['input']>;
  paymentMethodId: Scalars['ID']['input'];
  reference?: InputMaybe<Scalars['String']['input']>;
};

export type PayLineItemsResultType = {
  __typename?: 'PayLineItemsResultType';
  error?: Maybe<Scalars['String']['output']>;
  paidCount: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  totalPaid: Scalars['Float']['output'];
  transactionId?: Maybe<Scalars['String']['output']>;
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

/** Type of payment method */
export type PaymentMethodTypeEnum =
  | 'ACCOUNT'
  | 'CARD'
  | 'CASH'
  | 'CUSTOM'
  | 'TRANSFER';

/** Payment status for player check-in */
export type PaymentStatus =
  | 'NO_CHARGES'
  | 'PARTIAL'
  | 'PREPAID'
  | 'UNPAID';

export type PaymentSummaryType = {
  __typename?: 'PaymentSummaryType';
  amount: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  method: PaymentMethod;
  paymentDate: Scalars['DateTime']['output'];
  receiptNumber: Scalars['String']['output'];
};

export type PaymentTransactionType = {
  __typename?: 'PaymentTransactionType';
  allocatedAt?: Maybe<Scalars['DateTime']['output']>;
  allocatedToRevenue: Scalars['Boolean']['output'];
  amount: Scalars['Float']['output'];
  clubId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  lineItemPayments?: Maybe<Array<LineItemPaymentType>>;
  paidAt: Scalars['DateTime']['output'];
  paidBy: Scalars['String']['output'];
  paymentMethodId: Scalars['ID']['output'];
  paymentMethodName?: Maybe<Scalars['String']['output']>;
  reference?: Maybe<Scalars['String']['output']>;
  refundAmount?: Maybe<Scalars['Float']['output']>;
  refundReason?: Maybe<Scalars['String']['output']>;
  refundedAt?: Maybe<Scalars['DateTime']['output']>;
  refundedBy?: Maybe<Scalars['String']['output']>;
  status: TransactionStatus;
  teeTimeId?: Maybe<Scalars['ID']['output']>;
  transactionNumber: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  voidReason?: Maybe<Scalars['String']['output']>;
  voidedAt?: Maybe<Scalars['DateTime']['output']>;
  voidedBy?: Maybe<Scalars['String']['output']>;
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

export type PinVerificationResult = {
  __typename?: 'PinVerificationResult';
  message?: Maybe<Scalars['String']['output']>;
  remainingAttempts?: Maybe<Scalars['Float']['output']>;
  success: Scalars['Boolean']['output'];
};

/** Golf play format (18 holes or cross-tee) */
export type PlayFormat =
  | 'CROSS_TEE'
  | 'EIGHTEEN_HOLE';

export type PlayerCheckInResultType = {
  __typename?: 'PlayerCheckInResultType';
  checkedIn: Scalars['Boolean']['output'];
  error?: Maybe<Scalars['String']['output']>;
  playerId: Scalars['ID']['output'];
};

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

export type PlayerPaymentInfoType = {
  __typename?: 'PlayerPaymentInfoType';
  balanceDue: Scalars['Float']['output'];
  grandTotal: Scalars['Float']['output'];
  isSettled: Scalars['Boolean']['output'];
  lineItems: Array<BookingLineItemType>;
  memberNumber?: Maybe<Scalars['String']['output']>;
  paidOnline: Scalars['Float']['output'];
  playerId: Scalars['ID']['output'];
  playerName: Scalars['String']['output'];
  playerType: CheckInPlayerType;
  settledAt?: Maybe<Scalars['DateTime']['output']>;
  settledBy?: Maybe<Scalars['String']['output']>;
  settledVia?: Maybe<Scalars['String']['output']>;
  subtotal: Scalars['Float']['output'];
  totalTax: Scalars['Float']['output'];
};

export type PlayerPaymentInput = {
  amount: Scalars['Float']['input'];
  /** Specific line item IDs to mark as paid */
  lineItemIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  playerId: Scalars['ID']['input'];
};

export type PlayerSettlementResultType = {
  __typename?: 'PlayerSettlementResultType';
  amountPaid: Scalars['Float']['output'];
  error?: Maybe<Scalars['String']['output']>;
  playerId: Scalars['ID']['output'];
  success: Scalars['Boolean']['output'];
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

/** Print output options for starter ticket */
export type PrintOption =
  | 'COMBINED'
  | 'NONE'
  | 'RECEIPT'
  | 'TICKET';

export type PrintTicketInput = {
  copies?: InputMaybe<Scalars['Float']['input']>;
  ticketId: Scalars['ID']['input'];
};

export type ProShopCategoryType = {
  __typename?: 'ProShopCategoryType';
  defaultTaxRate: Scalars['Float']['output'];
  defaultTaxType: TaxType;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  productCount?: Maybe<Scalars['Int']['output']>;
  sortOrder: Scalars['Int']['output'];
};

export type ProShopConfigInput = {
  allowAddAtCheckIn?: InputMaybe<Scalars['Boolean']['input']>;
  quickAddProductIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  showQuickAddItems?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ProShopConfigType = {
  __typename?: 'ProShopConfigType';
  allowAddAtCheckIn: Scalars['Boolean']['output'];
  quickAddProductIds: Array<Scalars['ID']['output']>;
  showQuickAddItems: Scalars['Boolean']['output'];
};

export type ProShopProductConnectionType = {
  __typename?: 'ProShopProductConnectionType';
  hasMore: Scalars['Boolean']['output'];
  items: Array<ProShopProductType>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type ProShopProductFilterInput = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isQuickAdd?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type ProShopProductType = {
  __typename?: 'ProShopProductType';
  category?: Maybe<ProShopCategoryType>;
  categoryId: Scalars['ID']['output'];
  description?: Maybe<Scalars['String']['output']>;
  effectiveTaxRate: Scalars['Float']['output'];
  effectiveTaxType: TaxType;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isQuickAdd: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  sku?: Maybe<Scalars['String']['output']>;
  taxRate: Scalars['Float']['output'];
  taxType: TaxType;
  useCategoryDefaults: Scalars['Boolean']['output'];
  variants: Array<ProShopVariantType>;
};

export type ProShopVariantType = {
  __typename?: 'ProShopVariantType';
  finalPrice: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  priceAdjustment: Scalars['Float']['output'];
  sku?: Maybe<Scalars['String']['output']>;
};

export type ProcessAutoPayInput = {
  amount: Scalars['Float']['input'];
  invoiceId: Scalars['String']['input'];
  paymentMethodId: Scalars['ID']['input'];
};

export type ProcessSettlementInput = {
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentMethodId: Scalars['ID']['input'];
  payments: Array<PlayerPaymentInput>;
  reference?: InputMaybe<Scalars['String']['input']>;
  teeTimeId: Scalars['ID']['input'];
};

export type Product = {
  __typename?: 'Product';
  basePrice: Scalars['Float']['output'];
  bufferMinutes?: Maybe<Scalars['Int']['output']>;
  category: ProductCategory;
  costPrice?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  durationMinutes?: Maybe<Scalars['Int']['output']>;
  hasModifiers: Scalars['Boolean']['output'];
  hasVariants: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  isInStock: Scalars['Boolean']['output'];
  lowStockThreshold?: Maybe<Scalars['Int']['output']>;
  modifierGroups: Array<ModifierGroup>;
  name: Scalars['String']['output'];
  productType: ProductType;
  sku?: Maybe<Scalars['String']['output']>;
  sortPriority: Scalars['Int']['output'];
  stockQuantity?: Maybe<Scalars['Int']['output']>;
  taxRate: Scalars['Float']['output'];
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  trackInventory: Scalars['Boolean']['output'];
  variants: Array<ProductVariant>;
};

export type ProductCategory = {
  __typename?: 'ProductCategory';
  children?: Maybe<Array<ProductCategory>>;
  color?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  iconName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  parentId?: Maybe<Scalars['ID']['output']>;
  productCount?: Maybe<Scalars['Int']['output']>;
  sortOrder: Scalars['Int']['output'];
};

export type ProductConnection = {
  __typename?: 'ProductConnection';
  edges: Array<ProductEdge>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  totalCount: Scalars['Int']['output'];
};

export type ProductEdge = {
  __typename?: 'ProductEdge';
  cursor: Scalars['String']['output'];
  node: Product;
};

export type ProductFilterInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  productType?: InputMaybe<ProductType>;
  search?: InputMaybe<Scalars['String']['input']>;
  trackInventory?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ProductType =
  | 'COMPOSITE'
  | 'SERVICE'
  | 'SIMPLE'
  | 'VARIABLE';

export type ProductVariant = {
  __typename?: 'ProductVariant';
  attributes?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  priceAdjustment: Scalars['Float']['output'];
  sku?: Maybe<Scalars['String']['output']>;
  sortOrder: Scalars['Int']['output'];
  stockQuantity?: Maybe<Scalars['Int']['output']>;
};

/** Proration calculation method */
export type ProrationMethod =
  | 'DAILY'
  | 'MONTHLY'
  | 'NONE';

/** Preview of proration calculation */
export type ProrationPreview = {
  __typename?: 'ProrationPreview';
  /** Total days in the billing period */
  daysInPeriod: Scalars['Int']['output'];
  /** Number of days being prorated */
  daysProrated: Scalars['Int']['output'];
  /** Human-readable description of the proration */
  description: Scalars['String']['output'];
  /** Prorated amount in cents */
  proratedAmount: Scalars['Float']['output'];
  /** Proration factor (0-1) */
  prorationFactor: Scalars['Float']['output'];
};

export type ProrationPreviewInput = {
  /** Effective date for the prorated period */
  effectiveDate: Scalars['DateTime']['input'];
  /** Full period amount before proration */
  fullPeriodAmount: Scalars['Float']['input'];
  memberId: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  /** Get all active discounts for POS use */
  activeDiscounts: Array<DiscountGraphQlType>;
  /** Get active schedule for a course and date */
  activeSchedule?: Maybe<GolfCourseScheduleType>;
  /** Get a single membership application by ID */
  application: MembershipApplicationType;
  /** Get application statistics */
  applicationStats: ApplicationStatsType;
  /** Get paginated list of membership applications */
  applications: ApplicationConnection;
  /** Get AR aging report with buckets and member details */
  arAgingReport: ArAgingReportType;
  /** Calculate totals for multiple players (for batch payment) */
  batchTotal: BatchTotalType;
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
  /** Get cart draft for a tee time */
  cartDraft?: Maybe<CartDraftType>;
  /** Get a single cash drawer by ID */
  cashDrawer?: Maybe<CashDrawerGraphQlType>;
  /** Get a shift by ID */
  cashDrawerShift?: Maybe<CashDrawerShiftGraphQlType>;
  /** Get all cash drawers for the current club */
  cashDrawers: Array<CashDrawerGraphQlType>;
  /** Get available charge types */
  chargeTypes: Array<ChargeTypeType>;
  /** Get check-in audit history */
  checkInHistory: Array<CheckInAuditEntryType>;
  /** Get a single payment method by ID */
  checkInPaymentMethod?: Maybe<CheckInPaymentMethodType>;
  /** Get all payment methods for check-in */
  checkInPaymentMethods: Array<CheckInPaymentMethodType>;
  /** Check if a charge is allowed for a member based on their credit limit */
  checkMemberCredit: CreditCheckResultType;
  /** Check if a sub-account can make a transaction */
  checkSubAccountLimit: SubAccountLimitCheck;
  /** Get club-wide billing configuration settings */
  clubBillingSettings: ClubBillingSettingsType;
  /** Get club golf settings including cart, rental, and caddy policies */
  clubGolfSettings?: Maybe<ClubGolfSettingsType>;
  /** Get schedules for a course */
  courseSchedules: Array<GolfCourseScheduleType>;
  /** Get all golf courses */
  courses: Array<GolfCourseType>;
  /** Get a single credit note by ID */
  creditNote: CreditNoteGraphQlType;
  /** Get paginated list of credit notes */
  creditNotes: CreditNoteConnection;
  /** Get or create current period spend for a member and requirement */
  currentMemberSpend: MemberMinimumSpend;
  /** Get the current open shift for a drawer */
  currentShift?: Maybe<CashDrawerShiftGraphQlType>;
  /** Get daily check-in report for a course */
  dailyCheckInReport: DailyCheckInReportType;
  /** Get all interests for a dependent */
  dependentInterests: Array<DependentInterestType>;
  /** Get a single discount by ID */
  discount?: Maybe<DiscountGraphQlType>;
  /** Find a discount by its code */
  discountByCode?: Maybe<DiscountGraphQlType>;
  /** Get all discounts for the current club with filtering and pagination */
  discounts: DiscountConnection;
  equipment: Array<Equipment>;
  equipmentAvailability: Array<Equipment>;
  equipmentCategories: Array<EquipmentCategory>;
  equipmentCategory?: Maybe<EquipmentCategory>;
  equipmentItem?: Maybe<Equipment>;
  /** Get list of facilities */
  facilities: Array<FacilityType>;
  /** Get check-in info for all players in a tee time */
  flightCheckInInfo: FlightCheckInInfoType;
  /** Get payment summary for a flight */
  flightPaymentSummary: FlightPaymentSummaryType;
  /** Generate a tee ticket for a tee time */
  generateTeeTicket?: Maybe<TeeTicketType>;
  /** Get the effective schedule for a specific date (with season/special day overrides applied) */
  getEffectiveScheduleForDate: EffectiveScheduleType;
  /** Get schedule configuration for a course. Creates default config if autoCreate is true. */
  getScheduleConfig?: Maybe<GolfScheduleConfigType>;
  /** Get complete golf check-in settings for the current club */
  golfCheckInSettings: CheckInSettingsType;
  /** Get rate configurations for a course */
  golfRates: Array<RateConfigType>;
  /** Get a single group booking */
  groupBooking: GolfGroupBookingType;
  /** Get group bookings */
  groupBookings: Array<GolfGroupBookingType>;
  /** Check if a tee time has a cart draft */
  hasDraft: Scalars['Boolean']['output'];
  /** Get all interest categories for the club */
  interestCategories: Array<InterestCategoryType>;
  /** Get a single interest category by ID */
  interestCategory: InterestCategoryType;
  /** Get a single invoice by ID */
  invoice: InvoiceType;
  /** Get auto-pay attempts for an invoice */
  invoiceAutoPayAttempts: Array<AutoPayAttempt>;
  /** Get paginated list of invoices */
  invoices: InvoiceConnection;
  /** Check if all players in a tee time are settled */
  isTeeTimeFullySettled: Scalars['Boolean']['output'];
  /** Get discounts applied to a line item */
  lineItemDiscounts: Array<AppliedDiscountType>;
  /** Get lotteries */
  lotteries: Array<GolfLotteryType>;
  /** Get a single lottery */
  lottery: GolfLotteryType;
  /** Get a single member by ID */
  member: MemberType;
  /** Get auto-pay attempt history for a member */
  memberAutoPayHistory: Array<AutoPayAttempt>;
  /** Get auto-pay settings for a member */
  memberAutoPaySetting?: Maybe<AutoPaySetting>;
  /** Get billing profile for a specific member */
  memberBillingProfile?: Maybe<MemberBillingProfileType>;
  /** Get communication preferences for a member */
  memberCommunicationPrefs: MemberCommunicationPrefsType;
  /** Get credit limit override history for a member */
  memberCreditOverrideHistory: Array<CreditLimitOverrideType>;
  /** Get active credit limit overrides for a member */
  memberCreditOverrides: Array<CreditLimitOverrideType>;
  /** Get credit settings for a member */
  memberCreditSettings?: Maybe<CreditSettingsType>;
  /** Get credit status for a member (for display in UI) */
  memberCreditStatus?: Maybe<CreditStatusType>;
  /** Get member dependents */
  memberDependents: Array<DependentType>;
  /** Get all interests for a member */
  memberInterests: Array<MemberInterestType>;
  /** Get a member minimum spend record by ID */
  memberMinimumSpend?: Maybe<MemberMinimumSpend>;
  /** Get member minimum spend records */
  memberMinimumSpends: Array<MemberMinimumSpend>;
  /** Get all stored payment methods for a member */
  memberPaymentMethods: Array<StoredPaymentMethod>;
  /** Get member statistics */
  memberStats: MemberStatsType;
  /** Get sub-accounts for a member */
  memberSubAccounts: Array<SubAccount>;
  /** Get transaction history for a member */
  memberTransactions: MemberTransactionsType;
  /** Get paginated list of members */
  members: MemberConnection;
  /** Get members approaching or exceeding their credit limits */
  membersAtCreditRisk: Array<MemberAtRiskType>;
  /** Get all membership types */
  membershipTypes: Array<MembershipTypeType>;
  /** Get a minimum spend requirement by ID */
  minimumSpendRequirement?: Maybe<MinimumSpendRequirement>;
  /** Get all minimum spend requirements for the club */
  minimumSpendRequirements: Array<MinimumSpendRequirement>;
  modifierGroups: Array<ModifierGroup>;
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
  outletGridConfig?: Maybe<OutletGridConfig>;
  outletProductConfigs: Array<OutletProductConfig>;
  outletProductPanel: OutletProductPanel;
  /** Get a single stored payment method */
  paymentMethod?: Maybe<StoredPaymentMethod>;
  /** Get detailed payment info for a single player */
  playerPaymentInfo: PlayerPaymentInfoType;
  /** Get the button registry for the current club */
  posButtonRegistry: PosButtonRegistryGraphQlType;
  /** Get resolved POS configuration for an outlet and user role */
  posConfig: PosResolvedConfigGraphQlType;
  /** Get a single POS outlet by ID */
  posOutlet?: Maybe<PosOutletGraphQlType>;
  /** Get all POS outlets for the current club */
  posOutlets: Array<PosOutletGraphQlType>;
  /** Get a single POS template by ID */
  posTemplate?: Maybe<PosTemplateGraphQlType>;
  /** Get all POS templates for the current club */
  posTemplates: Array<PosTemplateGraphQlType>;
  /** Preview FIFO allocation for a payment amount */
  previewFifoAllocation: FifoAllocationPreview;
  /** Preview late fee calculation for an overdue invoice */
  previewLateFee: LateFeePreview;
  /** Preview the next billing period dates for a member based on their configuration */
  previewNextBillingPeriod: BillingPeriodPreview;
  /** Preview prorated amount for a member joining mid-cycle */
  previewProration: ProrationPreview;
  /** Get all pro shop categories for the current club */
  proShopCategories: Array<ProShopCategoryType>;
  /** Get a single pro shop category by ID */
  proShopCategory?: Maybe<ProShopCategoryType>;
  /** Get a single pro shop product by ID */
  proShopProduct?: Maybe<ProShopProductType>;
  /** Get pro shop products with filtering and pagination */
  proShopProducts: ProShopProductConnectionType;
  product?: Maybe<Product>;
  /** Get all product categories */
  productCategories: Array<ProductCategory>;
  productCategory?: Maybe<ProductCategory>;
  /** Get products with filtering and pagination */
  products: ProductConnection;
  /** Get products marked as quick add for check-in */
  quickAddProducts: Array<ProShopProductType>;
  quickKeyProducts: Array<Product>;
  /** Get a single rate configuration by ID */
  rateConfig: RateConfigType;
  /** Get HTML template for a receipt */
  receiptHTML: Scalars['String']['output'];
  /** Search AR accounts (Members + City Ledger) */
  searchArAccounts: Array<ArAccountSearchResult>;
  /** Search for caddies by name or caddy number */
  searchCaddies: Array<CaddyType>;
  /** Get list of services */
  services: Array<ServiceType>;
  /** Get a settlement by ID */
  settlement?: Maybe<DailySettlementGraphQlType>;
  /** Get or create a settlement for a specific date */
  settlementByDate: DailySettlementGraphQlType;
  /** Get exceptions for a settlement */
  settlementExceptions: Array<SettlementExceptionGraphQlType>;
  /** Get settlement summary */
  settlementSummary: SettlementSummaryGraphQlType;
  /** Get settlements for a date range */
  settlements: Array<DailySettlementGraphQlType>;
  /** Get shift history for a drawer */
  shiftHistory: Array<CashDrawerShiftGraphQlType>;
  /** Get movements for a shift */
  shiftMovements: Array<CashMovementGraphQlType>;
  /** Get summary for a shift */
  shiftSummary: ShiftSummaryGraphQlType;
  /** Get cart for a specific player/slot */
  slotCart?: Maybe<SlotCartType>;
  smartSuggestionConfig?: Maybe<SmartSuggestionConfig>;
  smartSuggestions: Array<Product>;
  /** Get starter ticket by ID */
  starterTicket?: Maybe<StarterTicketResponseType>;
  /** Get starter ticket for a tee time */
  starterTicketByTeeTime?: Maybe<StarterTicketResponseType>;
  /** Get a sub-account by ID */
  subAccount?: Maybe<SubAccount>;
  /** Get transactions for sub-accounts */
  subAccountTransactions: Array<SubAccountTransaction>;
  /** Get all sub-accounts for the club */
  subAccounts: Array<SubAccount>;
  /** Get tee sheet for a course and date */
  teeSheet: Array<TeeSheetSlotType>;
  /** Get a single tee time by ID */
  teeTime: TeeTimeType;
  /** Get tee time blocks for a course */
  teeTimeBlocks: Array<TeeTimeBlockType>;
  /** Get all carts for a tee time with context info */
  teeTimeCarts: TeeTimeCartsType;
  /** Get paginated list of tee times */
  teeTimes: TeeTimeConnection;
  /** Get all tee time IDs with drafts for a specific date */
  teeTimesWithDrafts: Array<Scalars['ID']['output']>;
  /** Get HTML template for a starter ticket */
  ticketHTML: Scalars['String']['output'];
  /** Get today's settlement for the current club */
  todaySettlement?: Maybe<DailySettlementGraphQlType>;
  /** Get discounts applied to a transaction */
  transactionDiscounts: Array<AppliedDiscountType>;
  /** Get payment transaction history for a tee time */
  transactionHistory: Array<PaymentTransactionType>;
  /** Validate if a discount can be applied */
  validateDiscount: DiscountValidationResultType;
  /** Validate a tee ticket by barcode */
  validateTeeTicket: TeeTicketValidationResult;
  /** Validate a ticket by QR code data */
  validateTicket: TicketValidationResultType;
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


export type QueryArAgingReportArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  page?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryBatchTotalArgs = {
  playerIds: Array<Scalars['ID']['input']>;
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


export type QueryCartDraftArgs = {
  teeTimeId: Scalars['ID']['input'];
};


export type QueryCashDrawerArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCashDrawerShiftArgs = {
  shiftId: Scalars['ID']['input'];
};


export type QueryCashDrawersArgs = {
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryCheckInHistoryArgs = {
  filter?: InputMaybe<CheckInHistoryFilterInput>;
};


export type QueryCheckInPaymentMethodArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCheckMemberCreditArgs = {
  input: CheckCreditInput;
};


export type QueryCheckSubAccountLimitArgs = {
  input: CheckLimitInput;
};


export type QueryCourseSchedulesArgs = {
  courseId: Scalars['ID']['input'];
};


export type QueryCreditNoteArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCreditNotesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  memberId?: InputMaybe<Scalars['ID']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<CreditNoteStatus>;
};


export type QueryCurrentMemberSpendArgs = {
  memberId: Scalars['ID']['input'];
  requirementId: Scalars['ID']['input'];
};


export type QueryCurrentShiftArgs = {
  cashDrawerId: Scalars['ID']['input'];
};


export type QueryDailyCheckInReportArgs = {
  input: DailyReportInput;
};


export type QueryDependentInterestsArgs = {
  dependentId: Scalars['ID']['input'];
};


export type QueryDiscountArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDiscountByCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryDiscountsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  scope?: InputMaybe<DiscountScope>;
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<DiscountType>;
};


export type QueryEquipmentArgs = {
  filter?: InputMaybe<EquipmentFilterInput>;
};


export type QueryEquipmentAvailabilityArgs = {
  input: EquipmentAvailabilityInput;
};


export type QueryEquipmentCategoriesArgs = {
  filter?: InputMaybe<EquipmentCategoryFilterInput>;
};


export type QueryEquipmentCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEquipmentItemArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFacilitiesArgs = {
  filter?: InputMaybe<FacilityFilterInput>;
};


export type QueryFlightCheckInInfoArgs = {
  teeTimeId: Scalars['ID']['input'];
};


export type QueryFlightPaymentSummaryArgs = {
  teeTimeId: Scalars['ID']['input'];
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


export type QueryGolfRatesArgs = {
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
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


export type QueryHasDraftArgs = {
  teeTimeId: Scalars['ID']['input'];
};


export type QueryInterestCategoriesArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryInterestCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInvoiceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInvoiceAutoPayAttemptsArgs = {
  invoiceId: Scalars['ID']['input'];
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


export type QueryIsTeeTimeFullySettledArgs = {
  teeTimeId: Scalars['ID']['input'];
};


export type QueryLineItemDiscountsArgs = {
  lineItemId: Scalars['ID']['input'];
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


export type QueryMemberAutoPayHistoryArgs = {
  input: GetAutoPayHistoryInput;
};


export type QueryMemberAutoPaySettingArgs = {
  memberId: Scalars['ID']['input'];
};


export type QueryMemberBillingProfileArgs = {
  memberId: Scalars['ID']['input'];
};


export type QueryMemberCommunicationPrefsArgs = {
  memberId: Scalars['ID']['input'];
};


export type QueryMemberCreditOverrideHistoryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  memberId: Scalars['ID']['input'];
};


export type QueryMemberCreditOverridesArgs = {
  memberId: Scalars['ID']['input'];
};


export type QueryMemberCreditSettingsArgs = {
  memberId: Scalars['ID']['input'];
};


export type QueryMemberCreditStatusArgs = {
  memberId: Scalars['ID']['input'];
};


export type QueryMemberDependentsArgs = {
  memberId: Scalars['ID']['input'];
};


export type QueryMemberInterestsArgs = {
  memberId: Scalars['ID']['input'];
};


export type QueryMemberMinimumSpendArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMemberMinimumSpendsArgs = {
  input: GetMemberSpendsInput;
};


export type QueryMemberPaymentMethodsArgs = {
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
  memberId: Scalars['ID']['input'];
};


export type QueryMemberSubAccountsArgs = {
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
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


export type QueryMinimumSpendRequirementArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMinimumSpendRequirementsArgs = {
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
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


export type QueryOutletGridConfigArgs = {
  outletId: Scalars['ID']['input'];
};


export type QueryOutletProductConfigsArgs = {
  outletId: Scalars['ID']['input'];
};


export type QueryOutletProductPanelArgs = {
  outletId: Scalars['ID']['input'];
};


export type QueryPaymentMethodArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPlayerPaymentInfoArgs = {
  playerId: Scalars['ID']['input'];
};


export type QueryPosConfigArgs = {
  outletId: Scalars['ID']['input'];
  userPermissions?: InputMaybe<Array<Scalars['String']['input']>>;
  userRole: Scalars['String']['input'];
};


export type QueryPosOutletArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPosTemplateArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPreviewFifoAllocationArgs = {
  accountId: Scalars['ID']['input'];
  accountType: Scalars['String']['input'];
  paymentAmount: Scalars['Float']['input'];
};


export type QueryPreviewLateFeeArgs = {
  input: LateFeePreviewInput;
};


export type QueryPreviewNextBillingPeriodArgs = {
  memberId: Scalars['ID']['input'];
};


export type QueryPreviewProrationArgs = {
  input: ProrationPreviewInput;
};


export type QueryProShopCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProShopProductArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProShopProductsArgs = {
  filter?: InputMaybe<ProShopProductFilterInput>;
};


export type QueryProductArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductCategoriesArgs = {
  includeInactive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryProductCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductsArgs = {
  filter?: InputMaybe<ProductFilterInput>;
};


export type QueryQuickKeyProductsArgs = {
  outletId: Scalars['ID']['input'];
};


export type QueryRateConfigArgs = {
  id: Scalars['ID']['input'];
};


export type QueryReceiptHtmlArgs = {
  playerId: Scalars['ID']['input'];
  teeTimeId: Scalars['ID']['input'];
};


export type QuerySearchArAccountsArgs = {
  accountTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  search: Scalars['String']['input'];
};


export type QuerySearchCaddiesArgs = {
  courseId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryServicesArgs = {
  filter?: InputMaybe<ServiceFilterInput>;
};


export type QuerySettlementArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySettlementByDateArgs = {
  date: Scalars['DateTime']['input'];
};


export type QuerySettlementExceptionsArgs = {
  pendingOnly?: InputMaybe<Scalars['Boolean']['input']>;
  settlementId: Scalars['ID']['input'];
};


export type QuerySettlementSummaryArgs = {
  settlementId: Scalars['ID']['input'];
};


export type QuerySettlementsArgs = {
  input: GetSettlementsInput;
};


export type QueryShiftHistoryArgs = {
  cashDrawerId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryShiftMovementsArgs = {
  shiftId: Scalars['ID']['input'];
  type?: InputMaybe<CashMovementType>;
};


export type QueryShiftSummaryArgs = {
  shiftId: Scalars['ID']['input'];
};


export type QuerySlotCartArgs = {
  playerId: Scalars['ID']['input'];
};


export type QuerySmartSuggestionConfigArgs = {
  outletId: Scalars['ID']['input'];
};


export type QuerySmartSuggestionsArgs = {
  outletId: Scalars['ID']['input'];
};


export type QueryStarterTicketArgs = {
  ticketId: Scalars['ID']['input'];
};


export type QueryStarterTicketByTeeTimeArgs = {
  teeTimeId: Scalars['ID']['input'];
};


export type QuerySubAccountArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySubAccountTransactionsArgs = {
  input: GetTransactionsInput;
};


export type QuerySubAccountsArgs = {
  status?: InputMaybe<SubAccountStatus>;
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


export type QueryTeeTimeCartsArgs = {
  teeTimeId: Scalars['ID']['input'];
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


export type QueryTeeTimesWithDraftsArgs = {
  date: Scalars['DateTime']['input'];
};


export type QueryTicketHtmlArgs = {
  teeTimeId: Scalars['ID']['input'];
};


export type QueryTransactionDiscountsArgs = {
  transactionId: Scalars['ID']['input'];
};


export type QueryTransactionHistoryArgs = {
  teeTimeId: Scalars['ID']['input'];
};


export type QueryValidateDiscountArgs = {
  input: ValidateDiscountInput;
};


export type QueryValidateTeeTicketArgs = {
  barcode: Scalars['String']['input'];
};


export type QueryValidateTicketArgs = {
  qrCodeData: Scalars['String']['input'];
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

export type QuickKeysPosition =
  | 'LEFT'
  | 'TOP';

export type RateConfigMutationResponse = {
  __typename?: 'RateConfigMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  rateConfig?: Maybe<RateConfigType>;
  success: Scalars['Boolean']['output'];
};

export type RateConfigType = {
  __typename?: 'RateConfigType';
  caddyRates: Array<CaddyRateType>;
  cartRates: Array<CartRateType>;
  courseId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  effectiveFrom: Scalars['DateTime']['output'];
  effectiveTo?: Maybe<Scalars['DateTime']['output']>;
  greenFeeRates: Array<GreenFeeRateType>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type RecordCashCountInput = {
  actualCash: Scalars['Float']['input'];
  settlementId: Scalars['ID']['input'];
};

export type RecordMovementInput = {
  amount: Scalars['Float']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  reference?: InputMaybe<Scalars['String']['input']>;
  shiftId: Scalars['ID']['input'];
  transactionId?: InputMaybe<Scalars['ID']['input']>;
  type: CashMovementType;
};

export type RecordSpendInput = {
  amount: Scalars['Float']['input'];
  category?: InputMaybe<Scalars['String']['input']>;
  memberId: Scalars['String']['input'];
  requirementId: Scalars['String']['input'];
};

export type RecordTransactionInput = {
  amount: Scalars['Float']['input'];
  category: SubAccountPermission;
  description: Scalars['String']['input'];
  lineItemId?: InputMaybe<Scalars['String']['input']>;
  locationName?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentTransactionId?: InputMaybe<Scalars['String']['input']>;
  subAccountId: Scalars['String']['input'];
  teeTimeId?: InputMaybe<Scalars['String']['input']>;
};

export type ReinstatedMemberType = {
  __typename?: 'ReinstatedMemberType';
  clearedDate: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  previousBalance: Scalars['String']['output'];
  receiptId: Scalars['ID']['output'];
  receiptNumber: Scalars['String']['output'];
};

export type RemoveLineItemInput = {
  lineItemId: Scalars['ID']['input'];
};

export type RemoveLineItemResultType = {
  __typename?: 'RemoveLineItemResultType';
  error?: Maybe<Scalars['String']['output']>;
  removedItem?: Maybe<SlotLineItemType>;
  success: Scalars['Boolean']['output'];
};

export type RemovePaymentMethodResult = {
  __typename?: 'RemovePaymentMethodResult';
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
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

export type ReopenSettlementInput = {
  reason: Scalars['String']['input'];
  settlementId: Scalars['ID']['input'];
};

export type RescheduleBookingInput = {
  id: Scalars['ID']['input'];
  newResourceId?: InputMaybe<Scalars['ID']['input']>;
  newStartTime: Scalars['String']['input'];
};

export type ResolveExceptionInput = {
  exceptionId: Scalars['ID']['input'];
  resolution: ExceptionResolution;
  resolutionNote?: InputMaybe<Scalars['String']['input']>;
};

export type ResolveShortfallInput = {
  action: ShortfallAction;
  memberSpendId: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
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

export type ReturnEquipmentInput = {
  assignmentId: Scalars['ID']['input'];
  conditionAtReturn?: InputMaybe<EquipmentCondition>;
  notes?: InputMaybe<Scalars['String']['input']>;
};

export type RoleRulesInput = {
  allowedRoles?: InputMaybe<Array<Scalars['String']['input']>>;
  deniedRoles?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type SaveCartDraftInput = {
  /** JSON stringified draft data */
  draftData: Scalars['String']['input'];
  teeTimeId: Scalars['ID']['input'];
};

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

/** Input for setting dependent interests */
export type SetDependentInterestsInput = {
  dependentId: Scalars['ID']['input'];
  interests: Array<DependentInterestInput>;
};

/** Input for setting member interests */
export type SetMemberInterestsInput = {
  interests: Array<MemberInterestInput>;
  memberId: Scalars['ID']['input'];
};

export type SetRoleOverridesMutationResponse = {
  __typename?: 'SetRoleOverridesMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  roleConfig?: Maybe<PosOutletRoleConfigGraphQlType>;
  success: Scalars['Boolean']['output'];
};

export type SettleAllPlayersInput = {
  paymentMethodId: Scalars['ID']['input'];
  reference?: InputMaybe<Scalars['String']['input']>;
  teeTimeId: Scalars['ID']['input'];
};

export type SettlementExceptionGraphQlType = {
  __typename?: 'SettlementExceptionGraphQLType';
  amount?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lineItemId?: Maybe<Scalars['ID']['output']>;
  resolution: ExceptionResolution;
  resolutionNote?: Maybe<Scalars['String']['output']>;
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  resolvedBy?: Maybe<Scalars['ID']['output']>;
  settlementId: Scalars['ID']['output'];
  severity: ExceptionSeverity;
  shiftId?: Maybe<Scalars['ID']['output']>;
  transactionId?: Maybe<Scalars['ID']['output']>;
  type: ExceptionType;
  updatedAt: Scalars['DateTime']['output'];
};

export type SettlementResultType = {
  __typename?: 'SettlementResultType';
  error?: Maybe<Scalars['String']['output']>;
  players: Array<PlayerSettlementResultType>;
  settledAt: Scalars['DateTime']['output'];
  settledBy: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  transactionId?: Maybe<Scalars['String']['output']>;
};

/** Status of a daily settlement */
export type SettlementStatus =
  | 'CLOSED'
  | 'IN_REVIEW'
  | 'OPEN'
  | 'REOPENED';

export type SettlementSummaryGraphQlType = {
  __typename?: 'SettlementSummaryGraphQLType';
  actualCash?: Maybe<Scalars['Float']['output']>;
  businessDate: Scalars['DateTime']['output'];
  cashVariance?: Maybe<Scalars['Float']['output']>;
  exceptionCount: Scalars['Int']['output'];
  expectedCash: Scalars['Float']['output'];
  settlementId: Scalars['ID']['output'];
  status: SettlementStatus;
  totalCard: Scalars['Float']['output'];
  totalCash: Scalars['Float']['output'];
  totalGrossSales: Scalars['Float']['output'];
  totalMemberAccount: Scalars['Float']['output'];
  totalNetSales: Scalars['Float']['output'];
  unresolvedExceptionCount: Scalars['Int']['output'];
};

export type ShiftSummaryGraphQlType = {
  __typename?: 'ShiftSummaryGraphQLType';
  actualCash?: Maybe<Scalars['Float']['output']>;
  closedAt?: Maybe<Scalars['DateTime']['output']>;
  closedBy?: Maybe<Scalars['ID']['output']>;
  closingCount?: Maybe<Scalars['Float']['output']>;
  expectedCash: Scalars['Float']['output'];
  movementCount: Scalars['Float']['output'];
  openedAt: Scalars['DateTime']['output'];
  openedBy: Scalars['ID']['output'];
  openingFloat: Scalars['Float']['output'];
  shiftId: Scalars['ID']['output'];
  status: CashDrawerStatus;
  totalDrops: Scalars['Float']['output'];
  totalPaidIn: Scalars['Float']['output'];
  totalPaidOut: Scalars['Float']['output'];
  totalRefunds: Scalars['Float']['output'];
  totalSales: Scalars['Float']['output'];
  variance?: Maybe<Scalars['Float']['output']>;
};

/** Action to take when member has a shortfall */
export type ShortfallAction =
  | 'CARRY_FORWARD'
  | 'CHARGE_DIFFERENCE'
  | 'CREDIT_BALANCE'
  | 'WAIVE';

export type SlotCartType = {
  __typename?: 'SlotCartType';
  balanceDue: Scalars['Float']['output'];
  checkedInAt?: Maybe<Scalars['DateTime']['output']>;
  grandTotal: Scalars['Float']['output'];
  isCheckedIn: Scalars['Boolean']['output'];
  isSettled: Scalars['Boolean']['output'];
  lineItems: Array<SlotLineItemType>;
  memberId?: Maybe<Scalars['ID']['output']>;
  memberNumber?: Maybe<Scalars['String']['output']>;
  paidAmount: Scalars['Float']['output'];
  playerId: Scalars['ID']['output'];
  playerName: Scalars['String']['output'];
  playerType: Scalars['String']['output'];
  subtotal: Scalars['Float']['output'];
  taxTotal: Scalars['Float']['output'];
  transferredInItems: Array<TransferredItemType>;
  transferredOutItems: Array<TransferredItemType>;
};

export type SlotCheckInResultType = {
  __typename?: 'SlotCheckInResultType';
  checkedInAt?: Maybe<Scalars['DateTime']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  playerId: Scalars['ID']['output'];
};

export type SlotLineItemType = {
  __typename?: 'SlotLineItemType';
  baseAmount: Scalars['Float']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isPaid: Scalars['Boolean']['output'];
  isTransferred: Scalars['Boolean']['output'];
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  paymentMethod?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['Int']['output'];
  taxAmount: Scalars['Float']['output'];
  taxRate: Scalars['Float']['output'];
  taxType: Scalars['String']['output'];
  totalAmount: Scalars['Float']['output'];
  transferredFromPlayerName?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type SlotPaymentResultType = {
  __typename?: 'SlotPaymentResultType';
  amountPaid: Scalars['Float']['output'];
  isSettled: Scalars['Boolean']['output'];
  newBalance: Scalars['Float']['output'];
  playerId: Scalars['ID']['output'];
};

export type SmartSuggestionConfig = {
  __typename?: 'SmartSuggestionConfig';
  enabled: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  outletId: Scalars['ID']['output'];
  position: SuggestionPosition;
  refreshIntervalMinutes: Scalars['Int']['output'];
  salesVelocityWeight: Scalars['Int']['output'];
  staffHistoryWeight: Scalars['Int']['output'];
  suggestionCount: Scalars['Int']['output'];
  timeOfDayWeight: Scalars['Int']['output'];
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

export type StarterTicketConfigInput = {
  autoGenerate?: InputMaybe<Scalars['Boolean']['input']>;
  content?: InputMaybe<TicketContentInput>;
  defaultPrintOption?: InputMaybe<PrintOption>;
  generateOn?: InputMaybe<TicketGenerateOn>;
};

export type StarterTicketConfigType = {
  __typename?: 'StarterTicketConfigType';
  autoGenerate: Scalars['Boolean']['output'];
  content: TicketContentConfigType;
  defaultPrintOption: PrintOption;
  generateOn: TicketGenerateOn;
};

export type StarterTicketPlayerType = {
  __typename?: 'StarterTicketPlayerType';
  memberNumber?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: CheckInPlayerType;
};

export type StarterTicketResponseType = {
  __typename?: 'StarterTicketResponseType';
  caddyName?: Maybe<Scalars['String']['output']>;
  cartNumber?: Maybe<Scalars['String']['output']>;
  course: Scalars['String']['output'];
  generatedAt: Scalars['DateTime']['output'];
  generatedBy: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  players: Array<StarterTicketPlayerType>;
  printedAt?: Maybe<Scalars['DateTime']['output']>;
  qrCodeData?: Maybe<Scalars['String']['output']>;
  rentalItems: Array<Scalars['String']['output']>;
  reprintCount: Scalars['Int']['output'];
  specialRequests?: Maybe<Scalars['String']['output']>;
  startingHole: Scalars['Int']['output'];
  teeTime: Scalars['DateTime']['output'];
  ticketNumber: Scalars['String']['output'];
};

export type StoredPaymentMethod = {
  __typename?: 'StoredPaymentMethod';
  brand: Scalars['String']['output'];
  cardholderName?: Maybe<Scalars['String']['output']>;
  clubId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  expiryMonth?: Maybe<Scalars['Int']['output']>;
  expiryYear?: Maybe<Scalars['Int']['output']>;
  failureCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isAutoPayEnabled: Scalars['Boolean']['output'];
  isDefault: Scalars['Boolean']['output'];
  last4: Scalars['String']['output'];
  lastFailureReason?: Maybe<Scalars['String']['output']>;
  lastUsedAt?: Maybe<Scalars['DateTime']['output']>;
  memberId: Scalars['String']['output'];
  status: StoredPaymentMethodStatus;
  stripeCustomerId?: Maybe<Scalars['String']['output']>;
  stripePaymentMethodId: Scalars['String']['output'];
  type: StoredPaymentMethodType;
  updatedAt: Scalars['DateTime']['output'];
  verifiedAt?: Maybe<Scalars['DateTime']['output']>;
};

/** Status of stored payment method */
export type StoredPaymentMethodStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'FAILED'
  | 'REMOVED';

/** Type of stored payment method */
export type StoredPaymentMethodType =
  | 'BANK_ACCOUNT'
  | 'CARD';

export type SubAccount = {
  __typename?: 'SubAccount';
  clubId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  dailyLimit?: Maybe<Scalars['Float']['output']>;
  dailySpend: Scalars['Float']['output'];
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastResetDaily: Scalars['DateTime']['output'];
  lastResetMonthly: Scalars['DateTime']['output'];
  lastResetWeekly: Scalars['DateTime']['output'];
  memberId: Scalars['String']['output'];
  monthlyLimit?: Maybe<Scalars['Float']['output']>;
  monthlySpend: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  notifyOnLimitReached: Scalars['Boolean']['output'];
  notifyPrimaryOnUse: Scalars['Boolean']['output'];
  perTransactionLimit?: Maybe<Scalars['Float']['output']>;
  permissions: Array<SubAccountPermission>;
  phone?: Maybe<Scalars['String']['output']>;
  pinAttempts: Scalars['Int']['output'];
  pinLockedUntil?: Maybe<Scalars['DateTime']['output']>;
  relationship: Scalars['String']['output'];
  status: SubAccountStatus;
  updatedAt: Scalars['DateTime']['output'];
  validFrom: Scalars['DateTime']['output'];
  validUntil?: Maybe<Scalars['DateTime']['output']>;
  weeklyLimit?: Maybe<Scalars['Float']['output']>;
  weeklySpend: Scalars['Float']['output'];
};

export type SubAccountLimitCheck = {
  __typename?: 'SubAccountLimitCheck';
  allowed: Scalars['Boolean']['output'];
  currentDaily: Scalars['Float']['output'];
  currentMonthly: Scalars['Float']['output'];
  currentWeekly: Scalars['Float']['output'];
  dailyLimit?: Maybe<Scalars['Float']['output']>;
  monthlyLimit?: Maybe<Scalars['Float']['output']>;
  perTransactionLimit?: Maybe<Scalars['Float']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  weeklyLimit?: Maybe<Scalars['Float']['output']>;
};

/** Permission categories for sub-accounts */
export type SubAccountPermission =
  | 'ALL'
  | 'EVENTS'
  | 'FOOD_BEVERAGE'
  | 'GOLF'
  | 'RETAIL'
  | 'SPA';

/** Status of a sub-account */
export type SubAccountStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'REVOKED'
  | 'SUSPENDED';

export type SubAccountTransaction = {
  __typename?: 'SubAccountTransaction';
  amount: Scalars['Float']['output'];
  category: SubAccountPermission;
  clubId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lineItemId?: Maybe<Scalars['String']['output']>;
  locationName?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  paymentTransactionId?: Maybe<Scalars['String']['output']>;
  subAccount?: Maybe<SubAccount>;
  subAccountId: Scalars['String']['output'];
  teeTimeId?: Maybe<Scalars['String']['output']>;
  verifiedAt: Scalars['DateTime']['output'];
  verifiedBy?: Maybe<Scalars['String']['output']>;
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

export type SuggestionPosition =
  | 'FLOATING'
  | 'SIDEBAR'
  | 'TOP_ROW';

export type TaxConfigInput = {
  defaultRate?: InputMaybe<Scalars['Float']['input']>;
  defaultType?: InputMaybe<TaxType>;
  overrides?: InputMaybe<Array<TaxOverrideInput>>;
  showBreakdown?: InputMaybe<Scalars['Boolean']['input']>;
  showTypeIndicator?: InputMaybe<Scalars['Boolean']['input']>;
  taxLabel?: InputMaybe<Scalars['String']['input']>;
};

export type TaxConfigType = {
  __typename?: 'TaxConfigType';
  defaultRate: Scalars['Float']['output'];
  defaultType: TaxType;
  overrides: Array<TaxOverrideType>;
  showBreakdown: Scalars['Boolean']['output'];
  showTypeIndicator: Scalars['Boolean']['output'];
  taxLabel: Scalars['String']['output'];
};

export type TaxOverrideInput = {
  itemType: LineItemType;
  rate: Scalars['Float']['input'];
  taxType: TaxType;
};

export type TaxOverrideType = {
  __typename?: 'TaxOverrideType';
  itemType: LineItemType;
  rate: Scalars['Float']['output'];
  taxType: TaxType;
};

/** Tax calculation type: ADD (on top), INCLUDE (in price), NONE */
export type TaxType =
  | 'ADD'
  | 'INCLUDE'
  | 'NONE';

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

export type TeeTimeCartsType = {
  __typename?: 'TeeTimeCartsType';
  courseId: Scalars['ID']['output'];
  courseName: Scalars['String']['output'];
  date: Scalars['DateTime']['output'];
  isFullyCheckedIn: Scalars['Boolean']['output'];
  isFullySettled: Scalars['Boolean']['output'];
  slots: Array<SlotCartType>;
  teeTime: Scalars['String']['output'];
  teeTimeId: Scalars['ID']['output'];
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

export type TicketContentConfigType = {
  __typename?: 'TicketContentConfigType';
  showCaddyName: Scalars['Boolean']['output'];
  showCartNumber: Scalars['Boolean']['output'];
  showCourse: Scalars['Boolean']['output'];
  showMemberNumbers: Scalars['Boolean']['output'];
  showPlayerNames: Scalars['Boolean']['output'];
  showQRCode: Scalars['Boolean']['output'];
  showRentalItems: Scalars['Boolean']['output'];
  showSpecialRequests: Scalars['Boolean']['output'];
  showStartingHole: Scalars['Boolean']['output'];
  showTeeTime: Scalars['Boolean']['output'];
};

export type TicketContentInput = {
  showCaddyName?: InputMaybe<Scalars['Boolean']['input']>;
  showCartNumber?: InputMaybe<Scalars['Boolean']['input']>;
  showCourse?: InputMaybe<Scalars['Boolean']['input']>;
  showMemberNumbers?: InputMaybe<Scalars['Boolean']['input']>;
  showPlayerNames?: InputMaybe<Scalars['Boolean']['input']>;
  showQRCode?: InputMaybe<Scalars['Boolean']['input']>;
  showRentalItems?: InputMaybe<Scalars['Boolean']['input']>;
  showSpecialRequests?: InputMaybe<Scalars['Boolean']['input']>;
  showStartingHole?: InputMaybe<Scalars['Boolean']['input']>;
  showTeeTime?: InputMaybe<Scalars['Boolean']['input']>;
};

/** When to generate starter ticket */
export type TicketGenerateOn =
  | 'CHECK_IN'
  | 'MANUAL'
  | 'SETTLEMENT';

export type TicketValidationResultType = {
  __typename?: 'TicketValidationResultType';
  message?: Maybe<Scalars['String']['output']>;
  teeTimeId?: Maybe<Scalars['ID']['output']>;
  ticketId?: Maybe<Scalars['ID']['output']>;
  valid: Scalars['Boolean']['output'];
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

export type TileSize =
  | 'LARGE'
  | 'MEDIUM'
  | 'SMALL';

export type TimePeriodMutationResponse = {
  __typename?: 'TimePeriodMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  timePeriod?: Maybe<GolfTimePeriodType>;
};

export type TimeRuleInput = {
  daysOfWeek: Array<Scalars['Int']['input']>;
  endTime: Scalars['String']['input'];
  startTime: Scalars['String']['input'];
};

/** Payment transaction status */
export type TransactionStatus =
  | 'COMPLETED'
  | 'PENDING'
  | 'REFUNDED'
  | 'VOIDED';

export type TransferLineItemInput = {
  fromPlayerId: Scalars['ID']['input'];
  lineItemId: Scalars['ID']['input'];
  toPlayerId: Scalars['ID']['input'];
};

export type TransferResultType = {
  __typename?: 'TransferResultType';
  error?: Maybe<Scalars['String']['output']>;
  isTransferred?: Maybe<Scalars['Boolean']['output']>;
  lineItemId?: Maybe<Scalars['ID']['output']>;
  success: Scalars['Boolean']['output'];
  transferredToPlayerId?: Maybe<Scalars['ID']['output']>;
};

export type TransferredItemType = {
  __typename?: 'TransferredItemType';
  amount: Scalars['Float']['output'];
  description: Scalars['String']['output'];
  fromPlayerId: Scalars['ID']['output'];
  fromPlayerName: Scalars['String']['output'];
  lineItemId: Scalars['ID']['output'];
  toPlayerId?: Maybe<Scalars['ID']['output']>;
  toPlayerName?: Maybe<Scalars['String']['output']>;
};

/** Twilight calculation mode */
export type TwilightMode =
  | 'FIXED'
  | 'SUNSET';

export type UndoCheckInInput = {
  playerId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};

export type UndoTransferInput = {
  lineItemId: Scalars['ID']['input'];
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

export type UpdateBlockInput = {
  blockType?: InputMaybe<BlockType>;
  endTime?: InputMaybe<Scalars['DateTime']['input']>;
  isRecurring?: InputMaybe<Scalars['Boolean']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  recurringPattern?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateButtonRegistryInput = {
  registry: Scalars['JSON']['input'];
};

export type UpdateButtonRegistryMutationResponse = {
  __typename?: 'UpdateButtonRegistryMutationResponse';
  buttonRegistry?: Maybe<PosButtonRegistryGraphQlType>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type UpdateCaddyRateInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  caddyType?: InputMaybe<Scalars['String']['input']>;
  taxRate?: InputMaybe<Scalars['Float']['input']>;
  taxType?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCartRateInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  taxRate?: InputMaybe<Scalars['Float']['input']>;
  taxType?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCashDrawerInput = {
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateClubBillingSettingsInput = {
  /** Automatically apply late fees when due */
  autoApplyLateFee?: InputMaybe<Scalars['Boolean']['input']>;
  defaultAlignment?: InputMaybe<CycleAlignment>;
  /** Default billing day (1-28) */
  defaultBillingDay?: InputMaybe<Scalars['Int']['input']>;
  defaultFrequency?: InputMaybe<BillingFrequency>;
  defaultTiming?: InputMaybe<BillingTiming>;
  /** Grace period days after due date (0-60) */
  gracePeriodDays?: InputMaybe<Scalars['Int']['input']>;
  /** Days after invoice for payment due (1-60) */
  invoiceDueDays?: InputMaybe<Scalars['Int']['input']>;
  /** Days before billing to generate invoices (0-30) */
  invoiceGenerationLead?: InputMaybe<Scalars['Int']['input']>;
  /** Fixed late fee amount */
  lateFeeAmount?: InputMaybe<Scalars['Float']['input']>;
  /** Late fee percentage (0-100) */
  lateFeePercentage?: InputMaybe<Scalars['Float']['input']>;
  lateFeeType?: InputMaybe<LateFeeType>;
  /** Maximum late fee cap */
  maxLateFee?: InputMaybe<Scalars['Float']['input']>;
  /** Prorate charges for membership changes mid-cycle */
  prorateChanges?: InputMaybe<Scalars['Boolean']['input']>;
  /** Prorate charges for new members mid-cycle */
  prorateNewMembers?: InputMaybe<Scalars['Boolean']['input']>;
  prorationMethod?: InputMaybe<ProrationMethod>;
};

/** Input for updating communication preferences */
export type UpdateCommunicationPrefsInput = {
  emailPromotions?: InputMaybe<Scalars['Boolean']['input']>;
  memberId: Scalars['ID']['input'];
  pushNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  smsPromotions?: InputMaybe<Scalars['Boolean']['input']>;
  unsubscribedCategories?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateCreditSettingsInput = {
  creditAlertThreshold?: InputMaybe<Scalars['Float']['input']>;
  creditBlockEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  creditLimit?: InputMaybe<Scalars['Float']['input']>;
  creditLimitEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  creditOverrideAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  memberId: Scalars['ID']['input'];
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

export type UpdateDiscountInput = {
  approval?: InputMaybe<DiscountApprovalInput>;
  code?: InputMaybe<Scalars['String']['input']>;
  conditions?: InputMaybe<DiscountConditionsInput>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  scope?: InputMaybe<DiscountScope>;
  type?: InputMaybe<DiscountType>;
  validity?: InputMaybe<DiscountValidityInput>;
  value?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateEquipmentCategoryInput = {
  attachmentType?: InputMaybe<EquipmentAttachmentType>;
  color?: InputMaybe<Scalars['String']['input']>;
  defaultRentalRate?: InputMaybe<Scalars['Float']['input']>;
  depositAmount?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  operationType?: InputMaybe<OperationType>;
  requiresDeposit?: InputMaybe<Scalars['Boolean']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateEquipmentInput = {
  condition?: InputMaybe<EquipmentCondition>;
  id: Scalars['ID']['input'];
  lastMaintenanceAt?: InputMaybe<Scalars['DateTime']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  manufacturer?: InputMaybe<Scalars['String']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  nextMaintenanceAt?: InputMaybe<Scalars['DateTime']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  purchaseDate?: InputMaybe<Scalars['DateTime']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  warrantyExpiry?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateEquipmentStatusInput = {
  id: Scalars['ID']['input'];
  status: EquipmentStatus;
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

export type UpdateGreenFeeRateInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  holes?: InputMaybe<Scalars['Int']['input']>;
  playerType?: InputMaybe<Scalars['String']['input']>;
  taxRate?: InputMaybe<Scalars['Float']['input']>;
  taxType?: InputMaybe<Scalars['String']['input']>;
  timeCategory?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateGroupBookingInput = {
  eventDate?: InputMaybe<Scalars['DateTime']['input']>;
  groupName?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  startFormat?: InputMaybe<StartFormat>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<GroupBookingStatus>;
};

/** Input for updating an interest category */
export type UpdateInterestCategoryInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateLineItemQuantityInput = {
  lineItemId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
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

export type UpdateMemberBillingProfileInput = {
  billingAlignment?: InputMaybe<CycleAlignment>;
  billingFrequency?: InputMaybe<BillingFrequency>;
  /** Put billing on hold */
  billingHold?: InputMaybe<Scalars['Boolean']['input']>;
  /** Reason for billing hold */
  billingHoldReason?: InputMaybe<Scalars['String']['input']>;
  /** Date until billing hold expires */
  billingHoldUntil?: InputMaybe<Scalars['DateTime']['input']>;
  billingTiming?: InputMaybe<BillingTiming>;
  /** Custom billing day (1-28) */
  customBillingDay?: InputMaybe<Scalars['Int']['input']>;
  /** Custom grace period in days */
  customGracePeriod?: InputMaybe<Scalars['Int']['input']>;
  /** Exempt from late fees */
  customLateFeeExempt?: InputMaybe<Scalars['Boolean']['input']>;
  /** Next scheduled billing date */
  nextBillingDate?: InputMaybe<Scalars['DateTime']['input']>;
  /** Internal notes about billing profile */
  notes?: InputMaybe<Scalars['String']['input']>;
  prorationOverride?: InputMaybe<ProrationMethod>;
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

export type UpdateModifierGroupInput = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxSelections?: InputMaybe<Scalars['Int']['input']>;
  minSelections?: InputMaybe<Scalars['Int']['input']>;
  modifiers?: InputMaybe<Array<CreateModifierInput>>;
  name?: InputMaybe<Scalars['String']['input']>;
  selectionType?: InputMaybe<ModifierSelectionType>;
};

export type UpdateOutletGridConfigInput = {
  categoryStyle?: InputMaybe<CategoryDisplayStyle>;
  gridColumns?: InputMaybe<Scalars['Int']['input']>;
  gridRows?: InputMaybe<Scalars['Int']['input']>;
  quickKeysCount?: InputMaybe<Scalars['Int']['input']>;
  quickKeysEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  quickKeysPosition?: InputMaybe<QuickKeysPosition>;
  showAllCategory?: InputMaybe<Scalars['Boolean']['input']>;
  showImages?: InputMaybe<Scalars['Boolean']['input']>;
  showPrices?: InputMaybe<Scalars['Boolean']['input']>;
  tileSize?: InputMaybe<TileSize>;
};

export type UpdateOutletProductConfigInput = {
  buttonColor?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  gridPosition?: InputMaybe<Scalars['JSON']['input']>;
  isQuickKey?: InputMaybe<Scalars['Boolean']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  quickKeyPosition?: InputMaybe<Scalars['Int']['input']>;
  sortPriority?: InputMaybe<Scalars['Int']['input']>;
  visibilityRules?: InputMaybe<VisibilityRulesInput>;
};

export type UpdatePaymentMethodInput = {
  icon?: InputMaybe<Scalars['String']['input']>;
  isEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  opensPOS?: InputMaybe<Scalars['Boolean']['input']>;
  requiresRef?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<PaymentMethodTypeEnum>;
};

export type UpdatePlayerRentalStatusInput = {
  caddyId?: InputMaybe<Scalars['ID']['input']>;
  caddyStatus?: InputMaybe<RentalStatus>;
  cartStatus?: InputMaybe<RentalStatus>;
};

export type UpdateProShopCategoryInput = {
  defaultTaxRate?: InputMaybe<Scalars['Float']['input']>;
  defaultTaxType?: InputMaybe<TaxType>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProShopProductInput = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isQuickAdd?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  taxRate?: InputMaybe<Scalars['Float']['input']>;
  taxType?: InputMaybe<TaxType>;
  useCategoryDefaults?: InputMaybe<Scalars['Boolean']['input']>;
  variants?: InputMaybe<Array<UpdateProShopVariantInput>>;
};

export type UpdateProShopVariantInput = {
  /** Set to true to delete this variant */
  _delete?: InputMaybe<Scalars['Boolean']['input']>;
  /** ID for existing variant, omit for new variant */
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  priceAdjustment?: InputMaybe<Scalars['Float']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProductCategoryInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  iconName?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateProductInput = {
  basePrice?: InputMaybe<Scalars['Float']['input']>;
  bufferMinutes?: InputMaybe<Scalars['Int']['input']>;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  costPrice?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  lowStockThreshold?: InputMaybe<Scalars['Int']['input']>;
  modifierGroupIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  productType?: InputMaybe<ProductType>;
  requiredCapabilities?: InputMaybe<Array<Scalars['String']['input']>>;
  sku?: InputMaybe<Scalars['String']['input']>;
  sortPriority?: InputMaybe<Scalars['Int']['input']>;
  stockQuantity?: InputMaybe<Scalars['Int']['input']>;
  taxRate?: InputMaybe<Scalars['Float']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  trackInventory?: InputMaybe<Scalars['Boolean']['input']>;
  variants?: InputMaybe<Array<CreateProductVariantInput>>;
};

export type UpdateQuantityResultType = {
  __typename?: 'UpdateQuantityResultType';
  error?: Maybe<Scalars['String']['output']>;
  lineItem?: Maybe<SlotLineItemType>;
  success: Scalars['Boolean']['output'];
};

export type UpdateRateConfigInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  effectiveFrom?: InputMaybe<Scalars['DateTime']['input']>;
  effectiveTo?: InputMaybe<Scalars['DateTime']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRequirementInput = {
  allowPartialCredit?: InputMaybe<Scalars['Boolean']['input']>;
  defaultShortfallAction?: InputMaybe<ShortfallAction>;
  description?: InputMaybe<Scalars['String']['input']>;
  effectiveTo?: InputMaybe<Scalars['DateTime']['input']>;
  excludedCategories?: InputMaybe<Array<Scalars['String']['input']>>;
  gracePeriodDays?: InputMaybe<Scalars['Int']['input']>;
  includeEvents?: InputMaybe<Scalars['Boolean']['input']>;
  includeFoodBeverage?: InputMaybe<Scalars['Boolean']['input']>;
  includeGolf?: InputMaybe<Scalars['Boolean']['input']>;
  includeRetail?: InputMaybe<Scalars['Boolean']['input']>;
  includeSpa?: InputMaybe<Scalars['Boolean']['input']>;
  includedCategories?: InputMaybe<Array<Scalars['String']['input']>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  membershipTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  minimumAmount?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  notifyAtPercent?: InputMaybe<Array<Scalars['Int']['input']>>;
  notifyDaysBeforeEnd?: InputMaybe<Array<Scalars['Int']['input']>>;
  period?: InputMaybe<MinimumSpendPeriod>;
  requirementId: Scalars['String']['input'];
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

export type UpdateSettlementTotalsInput = {
  refundCount?: InputMaybe<Scalars['Int']['input']>;
  settlementId: Scalars['ID']['input'];
  totalCard?: InputMaybe<Scalars['Float']['input']>;
  totalCash?: InputMaybe<Scalars['Float']['input']>;
  totalDiscounts?: InputMaybe<Scalars['Float']['input']>;
  totalGrossSales?: InputMaybe<Scalars['Float']['input']>;
  totalMemberAccount?: InputMaybe<Scalars['Float']['input']>;
  totalNetSales?: InputMaybe<Scalars['Float']['input']>;
  totalOther?: InputMaybe<Scalars['Float']['input']>;
  totalRefunds?: InputMaybe<Scalars['Float']['input']>;
  totalServiceCharge?: InputMaybe<Scalars['Float']['input']>;
  totalTax?: InputMaybe<Scalars['Float']['input']>;
  totalVoids?: InputMaybe<Scalars['Float']['input']>;
  transactionCount?: InputMaybe<Scalars['Int']['input']>;
  voidCount?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateSmartSuggestionConfigInput = {
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  position?: InputMaybe<SuggestionPosition>;
  refreshIntervalMinutes?: InputMaybe<Scalars['Int']['input']>;
  salesVelocityWeight?: InputMaybe<Scalars['Int']['input']>;
  staffHistoryWeight?: InputMaybe<Scalars['Int']['input']>;
  suggestionCount?: InputMaybe<Scalars['Int']['input']>;
  timeOfDayWeight?: InputMaybe<Scalars['Int']['input']>;
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

export type UpdateStoredPaymentInput = {
  id: Scalars['ID']['input'];
  isAutoPayEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateSubAccountInput = {
  dailyLimit?: InputMaybe<Scalars['Float']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  monthlyLimit?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  notifyOnLimitReached?: InputMaybe<Scalars['Boolean']['input']>;
  notifyPrimaryOnUse?: InputMaybe<Scalars['Boolean']['input']>;
  perTransactionLimit?: InputMaybe<Scalars['Float']['input']>;
  permissions?: InputMaybe<Array<SubAccountPermission>>;
  phone?: InputMaybe<Scalars['String']['input']>;
  relationship?: InputMaybe<Scalars['String']['input']>;
  subAccountId: Scalars['String']['input'];
  validUntil?: InputMaybe<Scalars['DateTime']['input']>;
  weeklyLimit?: InputMaybe<Scalars['Float']['input']>;
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

export type UpsertTemplateMutationResponse = {
  __typename?: 'UpsertTemplateMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  template?: Maybe<PosTemplateGraphQlType>;
};

export type ValidateDiscountInput = {
  amount: Scalars['Float']['input'];
  code?: InputMaybe<Scalars['String']['input']>;
  discountId?: InputMaybe<Scalars['ID']['input']>;
  membershipTypeId?: InputMaybe<Scalars['ID']['input']>;
  playerType?: InputMaybe<Scalars['String']['input']>;
};

export type VerifyPinInput = {
  pin: Scalars['String']['input'];
  subAccountId: Scalars['String']['input'];
};

export type VisibilityRulesInput = {
  inventoryRule?: InputMaybe<Scalars['String']['input']>;
  memberOnly?: InputMaybe<Scalars['Boolean']['input']>;
  roleRules?: InputMaybe<RoleRulesInput>;
  timeRules?: InputMaybe<Array<TimeRuleInput>>;
};

export type VoidCreditNoteInput = {
  reason: Scalars['String']['input'];
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

export type GetChargeTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetChargeTypesQuery = { __typename?: 'Query', chargeTypes: Array<{ __typename?: 'ChargeTypeType', id: string, name: string, code: string, description?: string | null | undefined, defaultPrice?: string | null | undefined, taxable: boolean, category?: string | null | undefined }> };

export type GetArAgingReportQueryVariables = Exact<{
  filter?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Float']['input']>;
  limit?: InputMaybe<Scalars['Float']['input']>;
}>;


export type GetArAgingReportQuery = { __typename?: 'Query', arAgingReport: { __typename?: 'ArAgingReportType', totalCount: number, buckets: Array<{ __typename?: 'AgingBucketType', id: string, label: string, memberCount: number, totalAmount: string, percentage: number }>, members: Array<{ __typename?: 'AgingMemberType', id: string, name: string, photoUrl?: string | null | undefined, memberNumber: string, membershipType: string, oldestInvoiceDate: string, balance: string, daysOutstanding: number, status: string }>, reinstatedMembers: Array<{ __typename?: 'ReinstatedMemberType', id: string, name: string, clearedDate: string, previousBalance: string, receiptId: string, receiptNumber: string }> } };

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

export type GetCreditNotesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  memberId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<CreditNoteStatus>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type GetCreditNotesQuery = { __typename?: 'Query', creditNotes: { __typename?: 'CreditNoteConnection', totalCount: number, edges: Array<{ __typename?: 'CreditNoteGraphQLTypeEdge', cursor: string, node: { __typename?: 'CreditNoteGraphQLType', id: string, creditNoteNumber: string, issueDate: string, type: CreditNoteType, reason: CreditNoteReason, reasonDetail?: string | null | undefined, subtotal: string, taxAmount: string, totalAmount: string, appliedToBalance: string, refundedAmount: string, status: CreditNoteStatus, createdAt: string, member?: { __typename?: 'MemberSummaryBillingType', id: string, memberId: string, firstName: string, lastName: string } | null | undefined } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null | undefined, endCursor?: string | null | undefined } } };

export type GetCreditNoteQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetCreditNoteQuery = { __typename?: 'Query', creditNote: { __typename?: 'CreditNoteGraphQLType', id: string, creditNoteNumber: string, issueDate: string, type: CreditNoteType, reason: CreditNoteReason, reasonDetail?: string | null | undefined, subtotal: string, taxAmount: string, totalAmount: string, appliedToBalance: string, refundedAmount: string, status: CreditNoteStatus, internalNotes?: string | null | undefined, memberVisibleNotes?: string | null | undefined, approvedAt?: string | null | undefined, voidedAt?: string | null | undefined, createdAt: string, updatedAt: string, member?: { __typename?: 'MemberSummaryBillingType', id: string, memberId: string, firstName: string, lastName: string } | null | undefined, lineItems: Array<{ __typename?: 'CreditNoteLineItemType', id: string, description: string, quantity: number, unitPrice: string, lineTotal: string, taxable: boolean, taxRate: string, taxAmount: string, chargeType?: { __typename?: 'ChargeTypeType', id: string, name: string, code: string } | null | undefined }>, applications?: Array<{ __typename?: 'CreditNoteApplicationType', id: string, amountApplied: string, appliedAt: string, invoice?: { __typename?: 'InvoiceType', id: string, invoiceNumber: string, totalAmount: string, balanceDue: string } | null | undefined }> | null | undefined } };

export type CreateCreditNoteMutationVariables = Exact<{
  input: CreateCreditNoteInput;
}>;


export type CreateCreditNoteMutation = { __typename?: 'Mutation', createCreditNote: { __typename?: 'CreditNoteGraphQLType', id: string, creditNoteNumber: string, totalAmount: string, status: CreditNoteStatus } };

export type ApproveCreditNoteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ApproveCreditNoteMutation = { __typename?: 'Mutation', approveCreditNote: { __typename?: 'CreditNoteGraphQLType', id: string, creditNoteNumber: string, status: CreditNoteStatus, approvedAt?: string | null | undefined } };

export type ApplyCreditNoteToBalanceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ApplyCreditNoteToBalanceMutation = { __typename?: 'Mutation', applyCreditNoteToBalance: { __typename?: 'CreditNoteGraphQLType', id: string, creditNoteNumber: string, status: CreditNoteStatus, appliedToBalance: string } };

export type ApplyCreditNoteToInvoiceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: ApplyCreditNoteInput;
}>;


export type ApplyCreditNoteToInvoiceMutation = { __typename?: 'Mutation', applyCreditNoteToInvoice: { __typename?: 'CreditNoteGraphQLType', id: string, creditNoteNumber: string, status: CreditNoteStatus, appliedToBalance: string, applications?: Array<{ __typename?: 'CreditNoteApplicationType', id: string, amountApplied: string, appliedAt: string }> | null | undefined } };

export type VoidCreditNoteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: VoidCreditNoteInput;
}>;


export type VoidCreditNoteMutation = { __typename?: 'Mutation', voidCreditNote: { __typename?: 'CreditNoteGraphQLType', id: string, creditNoteNumber: string, status: CreditNoteStatus, voidedAt?: string | null | undefined } };

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

export type GetCashDrawersQueryVariables = Exact<{
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetCashDrawersQuery = { __typename?: 'Query', cashDrawers: Array<{ __typename?: 'CashDrawerGraphQLType', id: string, clubId: string, name: string, location?: string | null | undefined, isActive: boolean, createdAt: string, updatedAt: string, currentShift?: { __typename?: 'CashDrawerShiftGraphQLType', id: string, status: CashDrawerStatus, openedAt: string, openedBy: string, openingFloat: number } | null | undefined }> };

export type GetCashDrawerQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetCashDrawerQuery = { __typename?: 'Query', cashDrawer?: { __typename?: 'CashDrawerGraphQLType', id: string, clubId: string, name: string, location?: string | null | undefined, isActive: boolean, createdAt: string, updatedAt: string, currentShift?: { __typename?: 'CashDrawerShiftGraphQLType', id: string, status: CashDrawerStatus, openedAt: string, openedBy: string, openingFloat: number, totalSales: number, totalRefunds: number, totalPaidIn: number, totalPaidOut: number, totalDrops: number } | null | undefined } | null | undefined };

export type GetCurrentShiftQueryVariables = Exact<{
  cashDrawerId: Scalars['ID']['input'];
}>;


export type GetCurrentShiftQuery = { __typename?: 'Query', currentShift?: { __typename?: 'CashDrawerShiftGraphQLType', id: string, cashDrawerId: string, status: CashDrawerStatus, openedBy: string, openedAt: string, openingFloat: number, openingDenominations?: string | null | undefined, totalSales: number, totalRefunds: number, totalPaidIn: number, totalPaidOut: number, totalDrops: number, createdAt: string } | null | undefined };

export type GetCashDrawerShiftQueryVariables = Exact<{
  shiftId: Scalars['ID']['input'];
}>;


export type GetCashDrawerShiftQuery = { __typename?: 'Query', cashDrawerShift?: { __typename?: 'CashDrawerShiftGraphQLType', id: string, cashDrawerId: string, status: CashDrawerStatus, openedBy: string, openedAt: string, openingFloat: number, openingDenominations?: string | null | undefined, closedBy?: string | null | undefined, closedAt?: string | null | undefined, closingCount?: number | null | undefined, closingDenominations?: string | null | undefined, expectedCash?: number | null | undefined, actualCash?: number | null | undefined, variance?: number | null | undefined, varianceNote?: string | null | undefined, totalSales: number, totalRefunds: number, totalPaidIn: number, totalPaidOut: number, totalDrops: number, createdAt: string, movements?: Array<{ __typename?: 'CashMovementGraphQLType', id: string, type: CashMovementType, amount: number, description?: string | null | undefined, performedAt: string }> | null | undefined } | null | undefined };

export type GetShiftSummaryQueryVariables = Exact<{
  shiftId: Scalars['ID']['input'];
}>;


export type GetShiftSummaryQuery = { __typename?: 'Query', shiftSummary: { __typename?: 'ShiftSummaryGraphQLType', shiftId: string, status: CashDrawerStatus, openedAt: string, openedBy: string, closedAt?: string | null | undefined, closedBy?: string | null | undefined, openingFloat: number, closingCount?: number | null | undefined, expectedCash: number, actualCash?: number | null | undefined, variance?: number | null | undefined, totalSales: number, totalRefunds: number, totalPaidIn: number, totalPaidOut: number, totalDrops: number, movementCount: number } };

export type GetShiftHistoryQueryVariables = Exact<{
  cashDrawerId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetShiftHistoryQuery = { __typename?: 'Query', shiftHistory: Array<{ __typename?: 'CashDrawerShiftGraphQLType', id: string, status: CashDrawerStatus, openedAt: string, openedBy: string, closedAt?: string | null | undefined, closedBy?: string | null | undefined, openingFloat: number, closingCount?: number | null | undefined, expectedCash?: number | null | undefined, actualCash?: number | null | undefined, variance?: number | null | undefined, totalSales: number, totalRefunds: number }> };

export type GetShiftMovementsQueryVariables = Exact<{
  shiftId: Scalars['ID']['input'];
  type?: InputMaybe<CashMovementType>;
}>;


export type GetShiftMovementsQuery = { __typename?: 'Query', shiftMovements: Array<{ __typename?: 'CashMovementGraphQLType', id: string, shiftId: string, type: CashMovementType, amount: number, description?: string | null | undefined, reference?: string | null | undefined, reason?: string | null | undefined, approvedBy?: string | null | undefined, transactionId?: string | null | undefined, performedBy: string, performedAt: string }> };

export type CreateCashDrawerMutationVariables = Exact<{
  input: CreateCashDrawerInput;
}>;


export type CreateCashDrawerMutation = { __typename?: 'Mutation', createCashDrawer: { __typename?: 'CashDrawerGraphQLType', id: string, clubId: string, name: string, location?: string | null | undefined, isActive: boolean, createdAt: string } };

export type UpdateCashDrawerMutationVariables = Exact<{
  input: UpdateCashDrawerInput;
}>;


export type UpdateCashDrawerMutation = { __typename?: 'Mutation', updateCashDrawer: { __typename?: 'CashDrawerGraphQLType', id: string, name: string, location?: string | null | undefined, isActive: boolean, updatedAt: string } };

export type OpenShiftMutationVariables = Exact<{
  input: OpenShiftInput;
}>;


export type OpenShiftMutation = { __typename?: 'Mutation', openShift: { __typename?: 'CashDrawerShiftGraphQLType', id: string, cashDrawerId: string, status: CashDrawerStatus, openedBy: string, openedAt: string, openingFloat: number, openingDenominations?: string | null | undefined } };

export type CloseShiftMutationVariables = Exact<{
  input: CloseShiftInput;
}>;


export type CloseShiftMutation = { __typename?: 'Mutation', closeShift: { __typename?: 'CashDrawerShiftGraphQLType', id: string, status: CashDrawerStatus, closedBy?: string | null | undefined, closedAt?: string | null | undefined, closingCount?: number | null | undefined, closingDenominations?: string | null | undefined, expectedCash?: number | null | undefined, actualCash?: number | null | undefined, variance?: number | null | undefined, varianceNote?: string | null | undefined } };

export type SuspendShiftMutationVariables = Exact<{
  shiftId: Scalars['ID']['input'];
}>;


export type SuspendShiftMutation = { __typename?: 'Mutation', suspendShift: { __typename?: 'CashDrawerShiftGraphQLType', id: string, status: CashDrawerStatus } };

export type ResumeShiftMutationVariables = Exact<{
  shiftId: Scalars['ID']['input'];
}>;


export type ResumeShiftMutation = { __typename?: 'Mutation', resumeShift: { __typename?: 'CashDrawerShiftGraphQLType', id: string, status: CashDrawerStatus } };

export type RecordCashMovementMutationVariables = Exact<{
  input: RecordMovementInput;
  approvedBy?: InputMaybe<Scalars['ID']['input']>;
}>;


export type RecordCashMovementMutation = { __typename?: 'Mutation', recordCashMovement: { __typename?: 'CashMovementGraphQLType', id: string, shiftId: string, type: CashMovementType, amount: number, description?: string | null | undefined, reference?: string | null | undefined, reason?: string | null | undefined, approvedBy?: string | null | undefined, transactionId?: string | null | undefined, performedBy: string, performedAt: string } };

export type CheckMemberCreditQueryVariables = Exact<{
  input: CheckCreditInput;
}>;


export type CheckMemberCreditQuery = { __typename?: 'Query', checkMemberCredit: { __typename?: 'CreditCheckResultType', allowed: boolean, currentBalance: number, creditLimit: number, availableCredit: number, chargeAmount: number, newBalance: number, usagePercent: number, warning?: CreditWarningLevel | null | undefined, shortfall?: number | null | undefined } };

export type GetMemberCreditStatusQueryVariables = Exact<{
  memberId: Scalars['ID']['input'];
}>;


export type GetMemberCreditStatusQuery = { __typename?: 'Query', memberCreditStatus?: { __typename?: 'CreditStatusType', creditLimit: number, currentBalance: number, availableCredit: number, usagePercent: number, alertThreshold: number, isBlocked: boolean, overrideAllowed: boolean } | null | undefined };

export type GetMemberCreditSettingsQueryVariables = Exact<{
  memberId: Scalars['ID']['input'];
}>;


export type GetMemberCreditSettingsQuery = { __typename?: 'Query', memberCreditSettings?: { __typename?: 'CreditSettingsType', creditLimit?: number | null | undefined, creditLimitEnabled: boolean, creditAlertThreshold: number, creditBlockEnabled: boolean, creditOverrideAllowed: boolean } | null | undefined };

export type GetMemberCreditOverridesQueryVariables = Exact<{
  memberId: Scalars['ID']['input'];
}>;


export type GetMemberCreditOverridesQuery = { __typename?: 'Query', memberCreditOverrides: Array<{ __typename?: 'CreditLimitOverrideType', id: string, memberId: string, previousLimit: number, newLimit: number, reason: string, approvedBy: string, approvedAt: string, expiresAt?: string | null | undefined, isActive: boolean, createdAt: string }> };

export type GetMemberCreditOverrideHistoryQueryVariables = Exact<{
  memberId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetMemberCreditOverrideHistoryQuery = { __typename?: 'Query', memberCreditOverrideHistory: Array<{ __typename?: 'CreditLimitOverrideType', id: string, memberId: string, previousLimit: number, newLimit: number, reason: string, approvedBy: string, approvedAt: string, expiresAt?: string | null | undefined, isActive: boolean, createdAt: string }> };

export type GetMembersAtCreditRiskQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMembersAtCreditRiskQuery = { __typename?: 'Query', membersAtCreditRisk: Array<{ __typename?: 'MemberAtRiskType', id: string, memberId: string, firstName: string, lastName: string, creditLimit: number, outstandingBalance: number, usagePercent: number, isAtRisk: boolean, isExceeded: boolean }> };

export type CreateCreditOverrideMutationVariables = Exact<{
  input: CreateCreditOverrideInput;
}>;


export type CreateCreditOverrideMutation = { __typename?: 'Mutation', createCreditOverride: { __typename?: 'CreditLimitOverrideType', id: string, memberId: string, previousLimit: number, newLimit: number, reason: string, approvedBy: string, approvedAt: string, expiresAt?: string | null | undefined, isActive: boolean, createdAt: string } };

export type RevertCreditOverrideMutationVariables = Exact<{
  overrideId: Scalars['ID']['input'];
}>;


export type RevertCreditOverrideMutation = { __typename?: 'Mutation', revertCreditOverride: boolean };

export type UpdateMemberCreditSettingsMutationVariables = Exact<{
  input: UpdateCreditSettingsInput;
}>;


export type UpdateMemberCreditSettingsMutation = { __typename?: 'Mutation', updateMemberCreditSettings: boolean };

export type GetDiscountsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<DiscountType>;
  scope?: InputMaybe<DiscountScope>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetDiscountsQuery = { __typename?: 'Query', discounts: { __typename?: 'DiscountConnection', totalCount: number, edges: Array<{ __typename?: 'DiscountGraphQLTypeEdge', cursor: string, node: { __typename?: 'DiscountGraphQLType', id: string, clubId: string, name: string, code?: string | null | undefined, type: DiscountType, value: string, scope: DiscountScope, isActive: boolean, createdAt: string, updatedAt: string, conditions: { __typename?: 'DiscountConditionsType', minimumAmount?: string | null | undefined, maximumDiscount?: string | null | undefined, membershipTypeIds?: Array<string> | null | undefined, playerTypes?: Array<string> | null | undefined }, validity: { __typename?: 'DiscountValidityType', validFrom?: string | null | undefined, validTo?: string | null | undefined, usageLimit?: number | null | undefined, usageCount: number }, approval: { __typename?: 'DiscountApprovalType', requiresApproval: boolean, approvalThreshold?: string | null | undefined } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null | undefined, endCursor?: string | null | undefined } } };

export type GetActiveDiscountsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveDiscountsQuery = { __typename?: 'Query', activeDiscounts: Array<{ __typename?: 'DiscountGraphQLType', id: string, name: string, code?: string | null | undefined, type: DiscountType, value: string, scope: DiscountScope, isActive: boolean, conditions: { __typename?: 'DiscountConditionsType', minimumAmount?: string | null | undefined, maximumDiscount?: string | null | undefined, membershipTypeIds?: Array<string> | null | undefined, playerTypes?: Array<string> | null | undefined }, validity: { __typename?: 'DiscountValidityType', validFrom?: string | null | undefined, validTo?: string | null | undefined, usageLimit?: number | null | undefined, usageCount: number }, approval: { __typename?: 'DiscountApprovalType', requiresApproval: boolean, approvalThreshold?: string | null | undefined } }> };

export type GetDiscountQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetDiscountQuery = { __typename?: 'Query', discount?: { __typename?: 'DiscountGraphQLType', id: string, clubId: string, name: string, code?: string | null | undefined, type: DiscountType, value: string, scope: DiscountScope, isActive: boolean, createdAt: string, updatedAt: string, conditions: { __typename?: 'DiscountConditionsType', minimumAmount?: string | null | undefined, maximumDiscount?: string | null | undefined, membershipTypeIds?: Array<string> | null | undefined, playerTypes?: Array<string> | null | undefined }, validity: { __typename?: 'DiscountValidityType', validFrom?: string | null | undefined, validTo?: string | null | undefined, usageLimit?: number | null | undefined, usageCount: number }, approval: { __typename?: 'DiscountApprovalType', requiresApproval: boolean, approvalThreshold?: string | null | undefined } } | null | undefined };

export type GetDiscountByCodeQueryVariables = Exact<{
  code: Scalars['String']['input'];
}>;


export type GetDiscountByCodeQuery = { __typename?: 'Query', discountByCode?: { __typename?: 'DiscountGraphQLType', id: string, name: string, code?: string | null | undefined, type: DiscountType, value: string, scope: DiscountScope, isActive: boolean, conditions: { __typename?: 'DiscountConditionsType', minimumAmount?: string | null | undefined, maximumDiscount?: string | null | undefined, membershipTypeIds?: Array<string> | null | undefined, playerTypes?: Array<string> | null | undefined }, validity: { __typename?: 'DiscountValidityType', validFrom?: string | null | undefined, validTo?: string | null | undefined, usageLimit?: number | null | undefined, usageCount: number }, approval: { __typename?: 'DiscountApprovalType', requiresApproval: boolean, approvalThreshold?: string | null | undefined } } | null | undefined };

export type ValidateDiscountQueryVariables = Exact<{
  input: ValidateDiscountInput;
}>;


export type ValidateDiscountQuery = { __typename?: 'Query', validateDiscount: { __typename?: 'DiscountValidationResultType', isValid: boolean, message?: string | null | undefined, calculatedAmount?: string | null | undefined, requiresApproval?: boolean | null | undefined } };

export type GetLineItemDiscountsQueryVariables = Exact<{
  lineItemId: Scalars['ID']['input'];
}>;


export type GetLineItemDiscountsQuery = { __typename?: 'Query', lineItemDiscounts: Array<{ __typename?: 'AppliedDiscountType', id: string, discountId: string, lineItemId?: string | null | undefined, discountType: DiscountType, discountValue: string, calculatedAmount: string, appliedBy: string, approvedBy?: string | null | undefined, approvalNote?: string | null | undefined, createdAt: string, discount?: { __typename?: 'DiscountGraphQLType', id: string, name: string, code?: string | null | undefined, type: DiscountType, value: string } | null | undefined }> };

export type GetTransactionDiscountsQueryVariables = Exact<{
  transactionId: Scalars['ID']['input'];
}>;


export type GetTransactionDiscountsQuery = { __typename?: 'Query', transactionDiscounts: Array<{ __typename?: 'AppliedDiscountType', id: string, discountId: string, transactionId?: string | null | undefined, discountType: DiscountType, discountValue: string, calculatedAmount: string, appliedBy: string, approvedBy?: string | null | undefined, approvalNote?: string | null | undefined, createdAt: string, discount?: { __typename?: 'DiscountGraphQLType', id: string, name: string, code?: string | null | undefined, type: DiscountType, value: string } | null | undefined }> };

export type CreateDiscountMutationVariables = Exact<{
  input: CreateDiscountInput;
}>;


export type CreateDiscountMutation = { __typename?: 'Mutation', createDiscount: { __typename?: 'DiscountGraphQLType', id: string, clubId: string, name: string, code?: string | null | undefined, type: DiscountType, value: string, scope: DiscountScope, isActive: boolean, createdAt: string, updatedAt: string, conditions: { __typename?: 'DiscountConditionsType', minimumAmount?: string | null | undefined, maximumDiscount?: string | null | undefined, membershipTypeIds?: Array<string> | null | undefined, playerTypes?: Array<string> | null | undefined }, validity: { __typename?: 'DiscountValidityType', validFrom?: string | null | undefined, validTo?: string | null | undefined, usageLimit?: number | null | undefined, usageCount: number }, approval: { __typename?: 'DiscountApprovalType', requiresApproval: boolean, approvalThreshold?: string | null | undefined } } };

export type UpdateDiscountMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateDiscountInput;
}>;


export type UpdateDiscountMutation = { __typename?: 'Mutation', updateDiscount: { __typename?: 'DiscountGraphQLType', id: string, clubId: string, name: string, code?: string | null | undefined, type: DiscountType, value: string, scope: DiscountScope, isActive: boolean, createdAt: string, updatedAt: string, conditions: { __typename?: 'DiscountConditionsType', minimumAmount?: string | null | undefined, maximumDiscount?: string | null | undefined, membershipTypeIds?: Array<string> | null | undefined, playerTypes?: Array<string> | null | undefined }, validity: { __typename?: 'DiscountValidityType', validFrom?: string | null | undefined, validTo?: string | null | undefined, usageLimit?: number | null | undefined, usageCount: number }, approval: { __typename?: 'DiscountApprovalType', requiresApproval: boolean, approvalThreshold?: string | null | undefined } } };

export type DeleteDiscountMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteDiscountMutation = { __typename?: 'Mutation', deleteDiscount: boolean };

export type ApplyDiscountMutationVariables = Exact<{
  input: ApplyDiscountInput;
}>;


export type ApplyDiscountMutation = { __typename?: 'Mutation', applyDiscount: { __typename?: 'ApplyDiscountResultType', success: boolean, message?: string | null | undefined, requiresApproval?: boolean | null | undefined, originalAmount?: string | null | undefined, discountedAmount?: string | null | undefined, savings?: string | null | undefined } };

export type ApplyDiscountByCodeMutationVariables = Exact<{
  input: ApplyDiscountByCodeInput;
}>;


export type ApplyDiscountByCodeMutation = { __typename?: 'Mutation', applyDiscountByCode: { __typename?: 'ApplyDiscountResultType', success: boolean, message?: string | null | undefined, requiresApproval?: boolean | null | undefined, originalAmount?: string | null | undefined, discountedAmount?: string | null | undefined, savings?: string | null | undefined } };

export type ApproveDiscountMutationVariables = Exact<{
  input: ApproveDiscountInput;
}>;


export type ApproveDiscountMutation = { __typename?: 'Mutation', approveDiscount: { __typename?: 'AppliedDiscountType', id: string, discountId: string, discountType: DiscountType, discountValue: string, calculatedAmount: string, appliedBy: string, approvedBy?: string | null | undefined, approvalNote?: string | null | undefined, createdAt: string } };

export type RemoveAppliedDiscountMutationVariables = Exact<{
  appliedDiscountId: Scalars['ID']['input'];
}>;


export type RemoveAppliedDiscountMutation = { __typename?: 'Mutation', removeAppliedDiscount: boolean };

export type GetTodaySettlementQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTodaySettlementQuery = { __typename?: 'Query', todaySettlement?: { __typename?: 'DailySettlementGraphQLType', id: string, clubId: string, businessDate: string, status: SettlementStatus, totalGrossSales: number, totalDiscounts: number, totalNetSales: number, totalTax: number, totalServiceCharge: number, totalCash: number, totalCard: number, totalMemberAccount: number, totalOther: number, totalRefunds: number, totalVoids: number, expectedCash: number, actualCash?: number | null | undefined, cashVariance?: number | null | undefined, transactionCount: number, refundCount: number, voidCount: number, openedBy?: string | null | undefined, openedAt?: string | null | undefined, reviewedBy?: string | null | undefined, reviewedAt?: string | null | undefined, closedBy?: string | null | undefined, closedAt?: string | null | undefined, notes?: string | null | undefined, createdAt: string, updatedAt: string, exceptions?: Array<{ __typename?: 'SettlementExceptionGraphQLType', id: string, type: ExceptionType, severity: ExceptionSeverity, resolution: ExceptionResolution, description: string, amount?: number | null | undefined, createdAt: string }> | null | undefined } | null | undefined };

export type GetSettlementQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSettlementQuery = { __typename?: 'Query', settlement?: { __typename?: 'DailySettlementGraphQLType', id: string, clubId: string, businessDate: string, status: SettlementStatus, totalGrossSales: number, totalDiscounts: number, totalNetSales: number, totalTax: number, totalServiceCharge: number, totalCash: number, totalCard: number, totalMemberAccount: number, totalOther: number, totalRefunds: number, totalVoids: number, expectedCash: number, actualCash?: number | null | undefined, cashVariance?: number | null | undefined, transactionCount: number, refundCount: number, voidCount: number, openedBy?: string | null | undefined, openedAt?: string | null | undefined, reviewedBy?: string | null | undefined, reviewedAt?: string | null | undefined, closedBy?: string | null | undefined, closedAt?: string | null | undefined, notes?: string | null | undefined, createdAt: string, updatedAt: string, exceptions?: Array<{ __typename?: 'SettlementExceptionGraphQLType', id: string, type: ExceptionType, severity: ExceptionSeverity, resolution: ExceptionResolution, description: string, amount?: number | null | undefined, resolvedBy?: string | null | undefined, resolvedAt?: string | null | undefined, resolutionNote?: string | null | undefined, createdAt: string }> | null | undefined } | null | undefined };

export type GetSettlementByDateQueryVariables = Exact<{
  date: Scalars['DateTime']['input'];
}>;


export type GetSettlementByDateQuery = { __typename?: 'Query', settlementByDate: { __typename?: 'DailySettlementGraphQLType', id: string, clubId: string, businessDate: string, status: SettlementStatus, totalGrossSales: number, totalNetSales: number, totalCash: number, totalCard: number, totalMemberAccount: number, expectedCash: number, actualCash?: number | null | undefined, cashVariance?: number | null | undefined, transactionCount: number, createdAt: string, exceptions?: Array<{ __typename?: 'SettlementExceptionGraphQLType', id: string, type: ExceptionType, severity: ExceptionSeverity, resolution: ExceptionResolution }> | null | undefined } };

export type GetSettlementsQueryVariables = Exact<{
  input: GetSettlementsInput;
}>;


export type GetSettlementsQuery = { __typename?: 'Query', settlements: Array<{ __typename?: 'DailySettlementGraphQLType', id: string, businessDate: string, status: SettlementStatus, totalGrossSales: number, totalNetSales: number, totalCash: number, totalCard: number, totalMemberAccount: number, expectedCash: number, actualCash?: number | null | undefined, cashVariance?: number | null | undefined, transactionCount: number, closedAt?: string | null | undefined, exceptions?: Array<{ __typename?: 'SettlementExceptionGraphQLType', id: string, type: ExceptionType, severity: ExceptionSeverity, resolution: ExceptionResolution }> | null | undefined }> };

export type GetSettlementSummaryQueryVariables = Exact<{
  settlementId: Scalars['ID']['input'];
}>;


export type GetSettlementSummaryQuery = { __typename?: 'Query', settlementSummary: { __typename?: 'SettlementSummaryGraphQLType', settlementId: string, businessDate: string, status: SettlementStatus, totalGrossSales: number, totalNetSales: number, totalCash: number, totalCard: number, totalMemberAccount: number, expectedCash: number, actualCash?: number | null | undefined, cashVariance?: number | null | undefined, exceptionCount: number, unresolvedExceptionCount: number } };

export type GetSettlementExceptionsQueryVariables = Exact<{
  settlementId: Scalars['ID']['input'];
  pendingOnly?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetSettlementExceptionsQuery = { __typename?: 'Query', settlementExceptions: Array<{ __typename?: 'SettlementExceptionGraphQLType', id: string, settlementId: string, type: ExceptionType, severity: ExceptionSeverity, resolution: ExceptionResolution, description: string, amount?: number | null | undefined, transactionId?: string | null | undefined, shiftId?: string | null | undefined, lineItemId?: string | null | undefined, resolvedBy?: string | null | undefined, resolvedAt?: string | null | undefined, resolutionNote?: string | null | undefined, createdAt: string, updatedAt: string }> };

export type OpenDayMutationVariables = Exact<{
  input: OpenDayInput;
}>;


export type OpenDayMutation = { __typename?: 'Mutation', openDay: { __typename?: 'DailySettlementGraphQLType', id: string, clubId: string, businessDate: string, status: SettlementStatus, openedBy?: string | null | undefined, openedAt?: string | null | undefined } };

export type SubmitSettlementForReviewMutationVariables = Exact<{
  settlementId: Scalars['ID']['input'];
}>;


export type SubmitSettlementForReviewMutation = { __typename?: 'Mutation', submitSettlementForReview: { __typename?: 'DailySettlementGraphQLType', id: string, status: SettlementStatus, reviewedBy?: string | null | undefined, reviewedAt?: string | null | undefined } };

export type CloseSettlementMutationVariables = Exact<{
  input: CloseSettlementInput;
}>;


export type CloseSettlementMutation = { __typename?: 'Mutation', closeSettlement: { __typename?: 'DailySettlementGraphQLType', id: string, status: SettlementStatus, closedBy?: string | null | undefined, closedAt?: string | null | undefined, notes?: string | null | undefined } };

export type ReopenSettlementMutationVariables = Exact<{
  input: ReopenSettlementInput;
}>;


export type ReopenSettlementMutation = { __typename?: 'Mutation', reopenSettlement: { __typename?: 'DailySettlementGraphQLType', id: string, status: SettlementStatus } };

export type UpdateSettlementTotalsMutationVariables = Exact<{
  input: UpdateSettlementTotalsInput;
}>;


export type UpdateSettlementTotalsMutation = { __typename?: 'Mutation', updateSettlementTotals: { __typename?: 'DailySettlementGraphQLType', id: string, totalGrossSales: number, totalDiscounts: number, totalNetSales: number, totalTax: number, totalServiceCharge: number, totalCash: number, totalCard: number, totalMemberAccount: number, totalOther: number, totalRefunds: number, totalVoids: number, expectedCash: number, transactionCount: number, refundCount: number, voidCount: number } };

export type RecordCashCountMutationVariables = Exact<{
  input: RecordCashCountInput;
}>;


export type RecordCashCountMutation = { __typename?: 'Mutation', recordCashCount: { __typename?: 'DailySettlementGraphQLType', id: string, actualCash?: number | null | undefined, cashVariance?: number | null | undefined, exceptions?: Array<{ __typename?: 'SettlementExceptionGraphQLType', id: string, type: ExceptionType, severity: ExceptionSeverity, description: string, amount?: number | null | undefined }> | null | undefined } };

export type RecalculateSettlementTotalsMutationVariables = Exact<{
  settlementId: Scalars['ID']['input'];
}>;


export type RecalculateSettlementTotalsMutation = { __typename?: 'Mutation', recalculateSettlementTotals: { __typename?: 'DailySettlementGraphQLType', id: string, totalGrossSales: number, totalNetSales: number, totalCash: number, totalCard: number, totalMemberAccount: number, totalOther: number, totalRefunds: number, totalVoids: number, expectedCash: number, transactionCount: number, refundCount: number, voidCount: number } };

export type CreateSettlementExceptionMutationVariables = Exact<{
  input: CreateExceptionInput;
}>;


export type CreateSettlementExceptionMutation = { __typename?: 'Mutation', createSettlementException: { __typename?: 'SettlementExceptionGraphQLType', id: string, settlementId: string, type: ExceptionType, severity: ExceptionSeverity, resolution: ExceptionResolution, description: string, amount?: number | null | undefined, createdAt: string } };

export type ResolveSettlementExceptionMutationVariables = Exact<{
  input: ResolveExceptionInput;
}>;


export type ResolveSettlementExceptionMutation = { __typename?: 'Mutation', resolveSettlementException: { __typename?: 'SettlementExceptionGraphQLType', id: string, resolution: ExceptionResolution, resolvedBy?: string | null | undefined, resolvedAt?: string | null | undefined, resolutionNote?: string | null | undefined } };

export type GetEquipmentCategoriesQueryVariables = Exact<{
  filter?: InputMaybe<EquipmentCategoryFilterInput>;
}>;


export type GetEquipmentCategoriesQuery = { __typename?: 'Query', equipmentCategories: Array<{ __typename?: 'EquipmentCategory', id: string, code: string, name: string, description?: string | null | undefined, icon?: string | null | undefined, color?: string | null | undefined, attachmentType: EquipmentAttachmentType, operationType: OperationType, defaultRentalRate?: number | null | undefined, requiresDeposit: boolean, depositAmount?: number | null | undefined, sortOrder: number, isActive: boolean, equipmentCount: number, availableCount: number }> };

export type GetEquipmentCategoryQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetEquipmentCategoryQuery = { __typename?: 'Query', equipmentCategory?: { __typename?: 'EquipmentCategory', id: string, code: string, name: string, description?: string | null | undefined, icon?: string | null | undefined, color?: string | null | undefined, attachmentType: EquipmentAttachmentType, operationType: OperationType, defaultRentalRate?: number | null | undefined, requiresDeposit: boolean, depositAmount?: number | null | undefined, sortOrder: number, isActive: boolean, equipmentCount: number, availableCount: number } | null | undefined };

export type GetEquipmentQueryVariables = Exact<{
  filter?: InputMaybe<EquipmentFilterInput>;
}>;


export type GetEquipmentQuery = { __typename?: 'Query', equipment: Array<{ __typename?: 'Equipment', id: string, assetNumber: string, name: string, serialNumber?: string | null | undefined, manufacturer?: string | null | undefined, model?: string | null | undefined, condition: EquipmentCondition, status: EquipmentStatus, location?: string | null | undefined, notes?: string | null | undefined, purchaseDate?: string | null | undefined, warrantyExpiry?: string | null | undefined, lastMaintenanceAt?: string | null | undefined, nextMaintenanceAt?: string | null | undefined, category: { __typename?: 'EquipmentCategory', id: string, code: string, name: string, icon?: string | null | undefined, color?: string | null | undefined, attachmentType: EquipmentAttachmentType }, currentAssignment?: { __typename?: 'EquipmentAssignment', id: string, assignedAt: string, bookingNumber?: string | null | undefined, member?: { __typename?: 'EquipmentAssignmentMember', id: string, memberId: string, firstName: string, lastName: string, avatarUrl?: string | null | undefined } | null | undefined } | null | undefined }> };

export type GetEquipmentItemQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetEquipmentItemQuery = { __typename?: 'Query', equipmentItem?: { __typename?: 'Equipment', id: string, assetNumber: string, name: string, serialNumber?: string | null | undefined, manufacturer?: string | null | undefined, model?: string | null | undefined, condition: EquipmentCondition, status: EquipmentStatus, location?: string | null | undefined, notes?: string | null | undefined, purchaseDate?: string | null | undefined, warrantyExpiry?: string | null | undefined, lastMaintenanceAt?: string | null | undefined, nextMaintenanceAt?: string | null | undefined, category: { __typename?: 'EquipmentCategory', id: string, code: string, name: string, icon?: string | null | undefined, color?: string | null | undefined, attachmentType: EquipmentAttachmentType, defaultRentalRate?: number | null | undefined, requiresDeposit: boolean, depositAmount?: number | null | undefined }, currentAssignment?: { __typename?: 'EquipmentAssignment', id: string, assignedAt: string, returnedAt?: string | null | undefined, rentalFee?: number | null | undefined, conditionAtCheckout?: EquipmentCondition | null | undefined, notes?: string | null | undefined, bookingNumber?: string | null | undefined, member?: { __typename?: 'EquipmentAssignmentMember', id: string, memberId: string, firstName: string, lastName: string, avatarUrl?: string | null | undefined } | null | undefined } | null | undefined } | null | undefined };

export type GetEquipmentAvailabilityQueryVariables = Exact<{
  input: EquipmentAvailabilityInput;
}>;


export type GetEquipmentAvailabilityQuery = { __typename?: 'Query', equipmentAvailability: Array<{ __typename?: 'Equipment', id: string, assetNumber: string, name: string, condition: EquipmentCondition, status: EquipmentStatus, category: { __typename?: 'EquipmentCategory', id: string, name: string, icon?: string | null | undefined, color?: string | null | undefined, defaultRentalRate?: number | null | undefined } }> };

export type CreateEquipmentCategoryMutationVariables = Exact<{
  input: CreateEquipmentCategoryInput;
}>;


export type CreateEquipmentCategoryMutation = { __typename?: 'Mutation', createEquipmentCategory: { __typename?: 'EquipmentCategoryResponse', success: boolean, error?: string | null | undefined, category?: { __typename?: 'EquipmentCategory', id: string, code: string, name: string, description?: string | null | undefined, icon?: string | null | undefined, color?: string | null | undefined, attachmentType: EquipmentAttachmentType, defaultRentalRate?: number | null | undefined, requiresDeposit: boolean, depositAmount?: number | null | undefined, sortOrder: number, isActive: boolean } | null | undefined } };

export type UpdateEquipmentCategoryMutationVariables = Exact<{
  input: UpdateEquipmentCategoryInput;
}>;


export type UpdateEquipmentCategoryMutation = { __typename?: 'Mutation', updateEquipmentCategory: { __typename?: 'EquipmentCategoryResponse', success: boolean, error?: string | null | undefined, category?: { __typename?: 'EquipmentCategory', id: string, code: string, name: string, description?: string | null | undefined, icon?: string | null | undefined, color?: string | null | undefined, attachmentType: EquipmentAttachmentType, defaultRentalRate?: number | null | undefined, requiresDeposit: boolean, depositAmount?: number | null | undefined, sortOrder: number, isActive: boolean } | null | undefined } };

export type DeleteEquipmentCategoryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteEquipmentCategoryMutation = { __typename?: 'Mutation', deleteEquipmentCategory: { __typename?: 'EquipmentDeleteResponse', success: boolean, error?: string | null | undefined, message?: string | null | undefined } };

export type CreateEquipmentMutationVariables = Exact<{
  input: CreateEquipmentInput;
}>;


export type CreateEquipmentMutation = { __typename?: 'Mutation', createEquipment: { __typename?: 'EquipmentResponse', success: boolean, error?: string | null | undefined, equipment?: { __typename?: 'Equipment', id: string, assetNumber: string, name: string, serialNumber?: string | null | undefined, manufacturer?: string | null | undefined, model?: string | null | undefined, condition: EquipmentCondition, status: EquipmentStatus, location?: string | null | undefined, notes?: string | null | undefined, category: { __typename?: 'EquipmentCategory', id: string, name: string } } | null | undefined } };

export type UpdateEquipmentMutationVariables = Exact<{
  input: UpdateEquipmentInput;
}>;


export type UpdateEquipmentMutation = { __typename?: 'Mutation', updateEquipment: { __typename?: 'EquipmentResponse', success: boolean, error?: string | null | undefined, equipment?: { __typename?: 'Equipment', id: string, assetNumber: string, name: string, serialNumber?: string | null | undefined, manufacturer?: string | null | undefined, model?: string | null | undefined, condition: EquipmentCondition, status: EquipmentStatus, location?: string | null | undefined, notes?: string | null | undefined, category: { __typename?: 'EquipmentCategory', id: string, name: string } } | null | undefined } };

export type UpdateEquipmentStatusMutationVariables = Exact<{
  input: UpdateEquipmentStatusInput;
}>;


export type UpdateEquipmentStatusMutation = { __typename?: 'Mutation', updateEquipmentStatus: { __typename?: 'EquipmentResponse', success: boolean, error?: string | null | undefined, equipment?: { __typename?: 'Equipment', id: string, status: EquipmentStatus } | null | undefined } };

export type DeleteEquipmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteEquipmentMutation = { __typename?: 'Mutation', deleteEquipment: { __typename?: 'EquipmentDeleteResponse', success: boolean, error?: string | null | undefined, message?: string | null | undefined } };

export type AssignEquipmentMutationVariables = Exact<{
  input: AssignEquipmentInput;
}>;


export type AssignEquipmentMutation = { __typename?: 'Mutation', assignEquipment: { __typename?: 'EquipmentAssignmentResponse', success: boolean, error?: string | null | undefined, assignment?: { __typename?: 'EquipmentAssignment', id: string, assignedAt: string, rentalFee?: number | null | undefined, conditionAtCheckout?: EquipmentCondition | null | undefined, notes?: string | null | undefined, bookingNumber?: string | null | undefined, member?: { __typename?: 'EquipmentAssignmentMember', id: string, memberId: string, firstName: string, lastName: string } | null | undefined } | null | undefined } };

export type ReturnEquipmentMutationVariables = Exact<{
  input: ReturnEquipmentInput;
}>;


export type ReturnEquipmentMutation = { __typename?: 'Mutation', returnEquipment: { __typename?: 'EquipmentAssignmentResponse', success: boolean, error?: string | null | undefined, assignment?: { __typename?: 'EquipmentAssignment', id: string, returnedAt?: string | null | undefined, conditionAtReturn?: EquipmentCondition | null | undefined, notes?: string | null | undefined } | null | undefined } };

export type ReleaseEquipmentForBookingMutationVariables = Exact<{
  bookingId: Scalars['ID']['input'];
}>;


export type ReleaseEquipmentForBookingMutation = { __typename?: 'Mutation', releaseEquipmentForBooking: { __typename?: 'EquipmentReleaseResponse', success: boolean, error?: string | null | undefined, releasedCount: number } };

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

export type RegenerateLineItemsMutationVariables = Exact<{
  teeTimeId: Scalars['ID']['input'];
}>;


export type RegenerateLineItemsMutation = { __typename?: 'Mutation', regenerateLineItems: boolean };

export type GetWeekViewOccupancyQueryVariables = Exact<{
  input: WeekViewOccupancyInput;
}>;


export type GetWeekViewOccupancyQuery = { __typename?: 'Query', weekViewOccupancy: { __typename?: 'WeekViewOccupancyResponse', slots: Array<{ __typename?: 'WeekViewSlotType', date: string, time: string, nine: NineType, isBlocked: boolean, positions: Array<{ __typename?: 'WeekViewPositionType', position: number, status: PositionStatus, player?: { __typename?: 'WeekViewPlayerType', id: string, name: string, type: PlayerType, memberId?: string | null | undefined } | null | undefined }> }> } };

export type SearchCaddiesQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  courseId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type SearchCaddiesQuery = { __typename?: 'Query', searchCaddies: Array<{ __typename?: 'CaddyType', id: string, caddyNumber: string, firstName: string, lastName: string, phone?: string | null | undefined, isActive: boolean }> };

export type GetFlightCheckInInfoQueryVariables = Exact<{
  teeTimeId: Scalars['ID']['input'];
}>;


export type GetFlightCheckInInfoQuery = { __typename?: 'Query', flightCheckInInfo: { __typename?: 'FlightCheckInInfoType', id: string, teeTime: string, course: string, startingHole: number, cartNumber?: string | null | undefined, caddyAssignment?: string | null | undefined, players: Array<{ __typename?: 'CheckInPlayerInfoType', id: string, name: string, type: CheckInPlayerType, memberNumber?: string | null | undefined, paymentStatus: PaymentStatus, isCheckedIn: boolean, checkedInAt?: string | null | undefined, isSuspended: boolean, suspensionReason?: string | null | undefined, totalDue: number, totalPaid: number, balanceDue: number, lineItems: Array<{ __typename?: 'BookingLineItemType', id: string, type: LineItemType, description: string, baseAmount: number, taxType: TaxType, taxRate: number, taxAmount: number, totalAmount: number, isPaid: boolean, paidAt?: string | null | undefined, paymentMethod?: string | null | undefined }> }> } };

export type GetPlayerPaymentInfoQueryVariables = Exact<{
  playerId: Scalars['ID']['input'];
}>;


export type GetPlayerPaymentInfoQuery = { __typename?: 'Query', playerPaymentInfo: { __typename?: 'PlayerPaymentInfoType', playerId: string, playerName: string, playerType: CheckInPlayerType, memberNumber?: string | null | undefined, subtotal: number, totalTax: number, grandTotal: number, paidOnline: number, balanceDue: number, isSettled: boolean, settledAt?: string | null | undefined, settledVia?: string | null | undefined, settledBy?: string | null | undefined, lineItems: Array<{ __typename?: 'BookingLineItemType', id: string, type: LineItemType, description: string, baseAmount: number, taxType: TaxType, taxRate: number, taxAmount: number, totalAmount: number, isPaid: boolean, paidAt?: string | null | undefined, paymentMethod?: string | null | undefined }> } };

export type GetFlightPaymentSummaryQueryVariables = Exact<{
  teeTimeId: Scalars['ID']['input'];
}>;


export type GetFlightPaymentSummaryQuery = { __typename?: 'Query', flightPaymentSummary: { __typename?: 'FlightPaymentSummaryType', teeTimeId: string, teeTime: string, course: string, totalPlayers: number, checkedInCount: number, settledCount: number, totalDue: number, totalPaid: number, totalBalance: number, isFullyCheckedIn: boolean, isFullySettled: boolean } };

export type GetStarterTicketQueryVariables = Exact<{
  ticketId: Scalars['ID']['input'];
}>;


export type GetStarterTicketQuery = { __typename?: 'Query', starterTicket?: { __typename?: 'StarterTicketResponseType', id: string, ticketNumber: string, teeTime: string, course: string, startingHole: number, cartNumber?: string | null | undefined, caddyName?: string | null | undefined, rentalItems: Array<string>, specialRequests?: string | null | undefined, qrCodeData?: string | null | undefined, generatedAt: string, generatedBy: string, printedAt?: string | null | undefined, reprintCount: number, players: Array<{ __typename?: 'StarterTicketPlayerType', name: string, memberNumber?: string | null | undefined, type: CheckInPlayerType }> } | null | undefined };

export type GetStarterTicketByTeeTimeQueryVariables = Exact<{
  teeTimeId: Scalars['ID']['input'];
}>;


export type GetStarterTicketByTeeTimeQuery = { __typename?: 'Query', starterTicketByTeeTime?: { __typename?: 'StarterTicketResponseType', id: string, ticketNumber: string, teeTime: string, course: string, startingHole: number, cartNumber?: string | null | undefined, caddyName?: string | null | undefined, rentalItems: Array<string>, specialRequests?: string | null | undefined, qrCodeData?: string | null | undefined, generatedAt: string, generatedBy: string, printedAt?: string | null | undefined, reprintCount: number, players: Array<{ __typename?: 'StarterTicketPlayerType', name: string, memberNumber?: string | null | undefined, type: CheckInPlayerType }> } | null | undefined };

export type GetTicketHtmlQueryVariables = Exact<{
  teeTimeId: Scalars['ID']['input'];
}>;


export type GetTicketHtmlQuery = { __typename?: 'Query', ticketHTML: string };

export type GetReceiptHtmlQueryVariables = Exact<{
  teeTimeId: Scalars['ID']['input'];
  playerId: Scalars['ID']['input'];
}>;


export type GetReceiptHtmlQuery = { __typename?: 'Query', receiptHTML: string };

export type ValidateTicketQueryVariables = Exact<{
  qrCodeData: Scalars['String']['input'];
}>;


export type ValidateTicketQuery = { __typename?: 'Query', validateTicket: { __typename?: 'TicketValidationResultType', valid: boolean, ticketId?: string | null | undefined, teeTimeId?: string | null | undefined, message?: string | null | undefined } };

export type GetCheckInHistoryQueryVariables = Exact<{
  filter?: InputMaybe<CheckInHistoryFilterInput>;
}>;


export type GetCheckInHistoryQuery = { __typename?: 'Query', checkInHistory: Array<{ __typename?: 'CheckInAuditEntryType', id: string, teeTimeId: string, playerId?: string | null | undefined, playerName?: string | null | undefined, action: string, amount?: number | null | undefined, details?: string | null | undefined, performedBy: string, performedAt: string }> };

export type GetDailyCheckInReportQueryVariables = Exact<{
  input: DailyReportInput;
}>;


export type GetDailyCheckInReportQuery = { __typename?: 'Query', dailyCheckInReport: { __typename?: 'DailyCheckInReportType', date: string, course: string, totalFlights: number, totalPlayers: number, checkedInPlayers: number, noShowPlayers: number, totalRevenue: number, totalCash: number, totalCard: number, totalTransfer: number, totalAccount: number, flights: Array<{ __typename?: 'FlightPaymentSummaryType', teeTimeId: string, teeTime: string, course: string, totalPlayers: number, checkedInCount: number, settledCount: number, totalDue: number, totalPaid: number, totalBalance: number, isFullyCheckedIn: boolean, isFullySettled: boolean }> } };

export type GetCheckInPaymentMethodsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCheckInPaymentMethodsQuery = { __typename?: 'Query', checkInPaymentMethods: Array<{ __typename?: 'CheckInPaymentMethodType', id: string, name: string, type: PaymentMethodTypeEnum, icon: string, isEnabled: boolean, requiresRef: boolean, opensPOS: boolean, sortOrder: number }> };

export type GetGolfCheckInSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetGolfCheckInSettingsQuery = { __typename?: 'Query', golfCheckInSettings: { __typename?: 'CheckInSettingsType', policy: { __typename?: 'CheckInPolicyType', allowPartialPayment: boolean, blockSuspendedMembers: boolean, showSuspensionReason: boolean, requireAllItemsPaid: boolean }, tax: { __typename?: 'TaxConfigType', defaultRate: number, defaultType: TaxType, taxLabel: string, showBreakdown: boolean, showTypeIndicator: boolean }, starterTicket: { __typename?: 'StarterTicketConfigType', generateOn: TicketGenerateOn, autoGenerate: boolean, defaultPrintOption: PrintOption, content: { __typename?: 'TicketContentConfigType', showTeeTime: boolean, showCourse: boolean, showStartingHole: boolean, showPlayerNames: boolean, showMemberNumbers: boolean, showCartNumber: boolean, showCaddyName: boolean, showRentalItems: boolean, showSpecialRequests: boolean, showQRCode: boolean } }, proShop: { __typename?: 'ProShopConfigType', allowAddAtCheckIn: boolean, showQuickAddItems: boolean, quickAddProductIds: Array<string> }, pos: { __typename?: 'POSConfigType', isConnected: boolean, provider?: string | null | undefined, terminalId?: string | null | undefined }, paymentMethods: Array<{ __typename?: 'CheckInPaymentMethodType', id: string, name: string, type: PaymentMethodTypeEnum, icon: string, isEnabled: boolean, requiresRef: boolean, opensPOS: boolean, sortOrder: number }> } };

export type GetProShopCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProShopCategoriesQuery = { __typename?: 'Query', proShopCategories: Array<{ __typename?: 'ProShopCategoryType', id: string, name: string, description?: string | null | undefined, defaultTaxRate: number, defaultTaxType: TaxType, sortOrder: number, isActive: boolean, productCount?: number | null | undefined }> };

export type GetProShopProductsQueryVariables = Exact<{
  filter?: InputMaybe<ProShopProductFilterInput>;
}>;


export type GetProShopProductsQuery = { __typename?: 'Query', proShopProducts: { __typename?: 'ProShopProductConnectionType', total: number, page: number, limit: number, hasMore: boolean, items: Array<{ __typename?: 'ProShopProductType', id: string, name: string, sku?: string | null | undefined, description?: string | null | undefined, categoryId: string, price: number, taxRate: number, taxType: TaxType, useCategoryDefaults: boolean, effectiveTaxRate: number, effectiveTaxType: TaxType, isActive: boolean, isQuickAdd: boolean, category?: { __typename?: 'ProShopCategoryType', id: string, name: string } | null | undefined, variants: Array<{ __typename?: 'ProShopVariantType', id: string, name: string, sku?: string | null | undefined, priceAdjustment: number, finalPrice: number }> }> } };

export type AddLineItemMutationVariables = Exact<{
  input: AddLineItemInput;
}>;


export type AddLineItemMutation = { __typename?: 'Mutation', addLineItem: { __typename?: 'BookingLineItemType', id: string, type: LineItemType, description: string, baseAmount: number, taxType: TaxType, taxRate: number, taxAmount: number, totalAmount: number, isPaid: boolean, paidAt?: string | null | undefined, paymentMethod?: string | null | undefined, reference?: string | null | undefined, productId?: string | null | undefined, variantId?: string | null | undefined } };

export type RemoveLineItemMutationVariables = Exact<{
  input: RemoveLineItemInput;
}>;


export type RemoveLineItemMutation = { __typename?: 'Mutation', removeLineItem: { __typename?: 'RemoveLineItemResultType', success: boolean, error?: string | null | undefined, removedItem?: { __typename?: 'SlotLineItemType', id: string, type: string, description: string, baseAmount: number, totalAmount: number, quantity: number } | null | undefined } };

export type ProcessSettlementMutationVariables = Exact<{
  input: ProcessSettlementInput;
}>;


export type ProcessSettlementMutation = { __typename?: 'Mutation', processSettlement: { __typename?: 'SettlementResultType', success: boolean, transactionId?: string | null | undefined, settledAt: string, settledBy: string, error?: string | null | undefined, players: Array<{ __typename?: 'PlayerSettlementResultType', playerId: string, amountPaid: number, success: boolean, error?: string | null | undefined }> } };

export type CheckInFlightMutationVariables = Exact<{
  input: CheckInFlightInput;
}>;


export type CheckInFlightMutation = { __typename?: 'Mutation', checkInFlight: { __typename?: 'CheckInResultType', success: boolean, checkedInAt: string, checkedInBy: string, ticketId?: string | null | undefined, ticketNumber?: string | null | undefined, players: Array<{ __typename?: 'PlayerCheckInResultType', playerId: string, checkedIn: boolean, error?: string | null | undefined }> } };

export type CheckInAllPlayersMutationVariables = Exact<{
  input: CheckInAllPlayersInput;
}>;


export type CheckInAllPlayersMutation = { __typename?: 'Mutation', checkInAllPlayers: { __typename?: 'CheckInResultType', success: boolean, checkedInAt: string, checkedInBy: string, ticketId?: string | null | undefined, ticketNumber?: string | null | undefined, players: Array<{ __typename?: 'PlayerCheckInResultType', playerId: string, checkedIn: boolean, error?: string | null | undefined }> } };

export type SettleAllPlayersMutationVariables = Exact<{
  input: SettleAllPlayersInput;
}>;


export type SettleAllPlayersMutation = { __typename?: 'Mutation', settleAllPlayers: { __typename?: 'SettlementResultType', success: boolean, transactionId?: string | null | undefined, settledAt: string, settledBy: string, error?: string | null | undefined, players: Array<{ __typename?: 'PlayerSettlementResultType', playerId: string, amountPaid: number, success: boolean, error?: string | null | undefined }> } };

export type UndoCheckInMutationVariables = Exact<{
  input: UndoCheckInInput;
}>;


export type UndoCheckInMutation = { __typename?: 'Mutation', undoCheckIn: boolean };

export type GenerateStarterTicketMutationVariables = Exact<{
  input: GenerateTicketInput;
}>;


export type GenerateStarterTicketMutation = { __typename?: 'Mutation', generateStarterTicket: { __typename?: 'StarterTicketResponseType', id: string, ticketNumber: string, teeTime: string, course: string, startingHole: number, cartNumber?: string | null | undefined, caddyName?: string | null | undefined, qrCodeData?: string | null | undefined, generatedAt: string, generatedBy: string, players: Array<{ __typename?: 'StarterTicketPlayerType', name: string, memberNumber?: string | null | undefined, type: CheckInPlayerType }> } };

export type PrintStarterTicketMutationVariables = Exact<{
  input: PrintTicketInput;
}>;


export type PrintStarterTicketMutation = { __typename?: 'Mutation', printStarterTicket: { __typename?: 'StarterTicketResponseType', id: string, ticketNumber: string, teeTime: string, course: string, startingHole: number, cartNumber?: string | null | undefined, caddyName?: string | null | undefined, rentalItems: Array<string>, specialRequests?: string | null | undefined, qrCodeData?: string | null | undefined, generatedAt: string, generatedBy: string, printedAt?: string | null | undefined, reprintCount: number, players: Array<{ __typename?: 'StarterTicketPlayerType', name: string, memberNumber?: string | null | undefined, type: CheckInPlayerType }> } };

export type CreateProShopCategoryMutationVariables = Exact<{
  input: CreateProShopCategoryInput;
}>;


export type CreateProShopCategoryMutation = { __typename?: 'Mutation', createProShopCategory: { __typename?: 'ProShopCategoryType', id: string, name: string, description?: string | null | undefined, defaultTaxRate: number, defaultTaxType: TaxType, sortOrder: number, isActive: boolean } };

export type UpdateProShopCategoryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateProShopCategoryInput;
}>;


export type UpdateProShopCategoryMutation = { __typename?: 'Mutation', updateProShopCategory: { __typename?: 'ProShopCategoryType', id: string, name: string, description?: string | null | undefined, defaultTaxRate: number, defaultTaxType: TaxType, sortOrder: number, isActive: boolean } };

export type DeleteProShopCategoryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteProShopCategoryMutation = { __typename?: 'Mutation', deleteProShopCategory: boolean };

export type CreateProShopProductMutationVariables = Exact<{
  input: CreateProShopProductInput;
}>;


export type CreateProShopProductMutation = { __typename?: 'Mutation', createProShopProduct: { __typename?: 'ProShopProductType', id: string, name: string, sku?: string | null | undefined, description?: string | null | undefined, categoryId: string, price: number, taxRate: number, taxType: TaxType, isActive: boolean, isQuickAdd: boolean, variants: Array<{ __typename?: 'ProShopVariantType', id: string, name: string, sku?: string | null | undefined, priceAdjustment: number }> } };

export type UpdateProShopProductMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateProShopProductInput;
}>;


export type UpdateProShopProductMutation = { __typename?: 'Mutation', updateProShopProduct: { __typename?: 'ProShopProductType', id: string, name: string, sku?: string | null | undefined, description?: string | null | undefined, categoryId: string, price: number, taxRate: number, taxType: TaxType, isActive: boolean, isQuickAdd: boolean, variants: Array<{ __typename?: 'ProShopVariantType', id: string, name: string, sku?: string | null | undefined, priceAdjustment: number }> } };

export type DeleteProShopProductMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteProShopProductMutation = { __typename?: 'Mutation', deleteProShopProduct: boolean };

export type GetGolfRatesQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetGolfRatesQuery = { __typename?: 'Query', golfRates: Array<{ __typename?: 'RateConfigType', id: string, courseId: string, name: string, description?: string | null | undefined, isActive: boolean, effectiveFrom: string, effectiveTo?: string | null | undefined, createdAt: string, updatedAt: string, greenFeeRates: Array<{ __typename?: 'GreenFeeRateType', id: string, playerType: string, holes: number, timeCategory: string, amount: number, taxType: string, taxRate: number, createdAt: string, updatedAt: string }>, cartRates: Array<{ __typename?: 'CartRateType', id: string, cartType: string, amount: number, taxType: string, taxRate: number, createdAt: string, updatedAt: string }>, caddyRates: Array<{ __typename?: 'CaddyRateType', id: string, caddyType: string, amount: number, taxType: string, taxRate: number, createdAt: string, updatedAt: string }> }> };

export type GetRateConfigQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetRateConfigQuery = { __typename?: 'Query', rateConfig: { __typename?: 'RateConfigType', id: string, courseId: string, name: string, description?: string | null | undefined, isActive: boolean, effectiveFrom: string, effectiveTo?: string | null | undefined, createdAt: string, updatedAt: string, greenFeeRates: Array<{ __typename?: 'GreenFeeRateType', id: string, playerType: string, holes: number, timeCategory: string, amount: number, taxType: string, taxRate: number, createdAt: string, updatedAt: string }>, cartRates: Array<{ __typename?: 'CartRateType', id: string, cartType: string, amount: number, taxType: string, taxRate: number, createdAt: string, updatedAt: string }>, caddyRates: Array<{ __typename?: 'CaddyRateType', id: string, caddyType: string, amount: number, taxType: string, taxRate: number, createdAt: string, updatedAt: string }> } };

export type CreateRateConfigMutationVariables = Exact<{
  input: CreateRateConfigInput;
}>;


export type CreateRateConfigMutation = { __typename?: 'Mutation', createRateConfig: { __typename?: 'RateConfigMutationResponse', success: boolean, message?: string | null | undefined, rateConfig?: { __typename?: 'RateConfigType', id: string, courseId: string, name: string, description?: string | null | undefined, isActive: boolean, effectiveFrom: string, effectiveTo?: string | null | undefined, createdAt: string, updatedAt: string } | null | undefined } };

export type UpdateRateConfigMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateRateConfigInput;
}>;


export type UpdateRateConfigMutation = { __typename?: 'Mutation', updateRateConfig: { __typename?: 'RateConfigMutationResponse', success: boolean, message?: string | null | undefined, rateConfig?: { __typename?: 'RateConfigType', id: string, courseId: string, name: string, description?: string | null | undefined, isActive: boolean, effectiveFrom: string, effectiveTo?: string | null | undefined, createdAt: string, updatedAt: string } | null | undefined } };

export type DeleteRateConfigMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteRateConfigMutation = { __typename?: 'Mutation', deleteRateConfig: { __typename?: 'DeleteRateMutationResponse', success: boolean, message?: string | null | undefined } };

export type CreateGreenFeeRateMutationVariables = Exact<{
  input: CreateGreenFeeRateInput;
}>;


export type CreateGreenFeeRateMutation = { __typename?: 'Mutation', createGreenFeeRate: { __typename?: 'GreenFeeRateMutationResponse', success: boolean, message?: string | null | undefined, greenFeeRate?: { __typename?: 'GreenFeeRateType', id: string, playerType: string, holes: number, timeCategory: string, amount: number, taxType: string, taxRate: number, createdAt: string, updatedAt: string } | null | undefined } };

export type UpdateGreenFeeRateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateGreenFeeRateInput;
}>;


export type UpdateGreenFeeRateMutation = { __typename?: 'Mutation', updateGreenFeeRate: { __typename?: 'GreenFeeRateMutationResponse', success: boolean, message?: string | null | undefined, greenFeeRate?: { __typename?: 'GreenFeeRateType', id: string, playerType: string, holes: number, timeCategory: string, amount: number, taxType: string, taxRate: number, createdAt: string, updatedAt: string } | null | undefined } };

export type DeleteGreenFeeRateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteGreenFeeRateMutation = { __typename?: 'Mutation', deleteGreenFeeRate: { __typename?: 'DeleteRateMutationResponse', success: boolean, message?: string | null | undefined } };

export type CreateCartRateMutationVariables = Exact<{
  input: CreateCartRateInput;
}>;


export type CreateCartRateMutation = { __typename?: 'Mutation', createCartRate: { __typename?: 'CartRateMutationResponse', success: boolean, message?: string | null | undefined, cartRate?: { __typename?: 'CartRateType', id: string, cartType: string, amount: number, taxType: string, taxRate: number, createdAt: string, updatedAt: string } | null | undefined } };

export type UpdateCartRateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateCartRateInput;
}>;


export type UpdateCartRateMutation = { __typename?: 'Mutation', updateCartRate: { __typename?: 'CartRateMutationResponse', success: boolean, message?: string | null | undefined, cartRate?: { __typename?: 'CartRateType', id: string, cartType: string, amount: number, taxType: string, taxRate: number, createdAt: string, updatedAt: string } | null | undefined } };

export type DeleteCartRateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteCartRateMutation = { __typename?: 'Mutation', deleteCartRate: { __typename?: 'DeleteRateMutationResponse', success: boolean, message?: string | null | undefined } };

export type CreateCaddyRateMutationVariables = Exact<{
  input: CreateCaddyRateInput;
}>;


export type CreateCaddyRateMutation = { __typename?: 'Mutation', createCaddyRate: { __typename?: 'CaddyRateMutationResponse', success: boolean, message?: string | null | undefined, caddyRate?: { __typename?: 'CaddyRateType', id: string, caddyType: string, amount: number, taxType: string, taxRate: number, createdAt: string, updatedAt: string } | null | undefined } };

export type UpdateCaddyRateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateCaddyRateInput;
}>;


export type UpdateCaddyRateMutation = { __typename?: 'Mutation', updateCaddyRate: { __typename?: 'CaddyRateMutationResponse', success: boolean, message?: string | null | undefined, caddyRate?: { __typename?: 'CaddyRateType', id: string, caddyType: string, amount: number, taxType: string, taxRate: number, createdAt: string, updatedAt: string } | null | undefined } };

export type DeleteCaddyRateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteCaddyRateMutation = { __typename?: 'Mutation', deleteCaddyRate: { __typename?: 'DeleteRateMutationResponse', success: boolean, message?: string | null | undefined } };

export type SlotLineItemFieldsFragment = { __typename?: 'SlotLineItemType', id: string, type: string, description: string, baseAmount: number, taxType: string, taxRate: number, taxAmount: number, totalAmount: number, quantity: number, isPaid: boolean, paidAt?: string | null | undefined, paymentMethod?: string | null | undefined, isTransferred: boolean, transferredFromPlayerName?: string | null | undefined };

export type TransferredItemFieldsFragment = { __typename?: 'TransferredItemType', lineItemId: string, description: string, amount: number, fromPlayerId: string, fromPlayerName: string, toPlayerId?: string | null | undefined, toPlayerName?: string | null | undefined };

export type SlotCartFieldsFragment = { __typename?: 'SlotCartType', playerId: string, playerName: string, playerType: string, memberId?: string | null | undefined, memberNumber?: string | null | undefined, subtotal: number, taxTotal: number, grandTotal: number, paidAmount: number, balanceDue: number, isCheckedIn: boolean, checkedInAt?: string | null | undefined, isSettled: boolean, lineItems: Array<{ __typename?: 'SlotLineItemType', id: string, type: string, description: string, baseAmount: number, taxType: string, taxRate: number, taxAmount: number, totalAmount: number, quantity: number, isPaid: boolean, paidAt?: string | null | undefined, paymentMethod?: string | null | undefined, isTransferred: boolean, transferredFromPlayerName?: string | null | undefined }>, transferredInItems: Array<{ __typename?: 'TransferredItemType', lineItemId: string, description: string, amount: number, fromPlayerId: string, fromPlayerName: string, toPlayerId?: string | null | undefined, toPlayerName?: string | null | undefined }>, transferredOutItems: Array<{ __typename?: 'TransferredItemType', lineItemId: string, description: string, amount: number, fromPlayerId: string, fromPlayerName: string, toPlayerId?: string | null | undefined, toPlayerName?: string | null | undefined }> };

export type GetTeeTimeCartsQueryVariables = Exact<{
  teeTimeId: Scalars['ID']['input'];
}>;


export type GetTeeTimeCartsQuery = { __typename?: 'Query', teeTimeCarts: { __typename?: 'TeeTimeCartsType', teeTimeId: string, teeTime: string, courseName: string, courseId: string, date: string, isFullySettled: boolean, isFullyCheckedIn: boolean, slots: Array<{ __typename?: 'SlotCartType', playerId: string, playerName: string, playerType: string, memberId?: string | null | undefined, memberNumber?: string | null | undefined, subtotal: number, taxTotal: number, grandTotal: number, paidAmount: number, balanceDue: number, isCheckedIn: boolean, checkedInAt?: string | null | undefined, isSettled: boolean, lineItems: Array<{ __typename?: 'SlotLineItemType', id: string, type: string, description: string, baseAmount: number, taxType: string, taxRate: number, taxAmount: number, totalAmount: number, quantity: number, isPaid: boolean, paidAt?: string | null | undefined, paymentMethod?: string | null | undefined, isTransferred: boolean, transferredFromPlayerName?: string | null | undefined }>, transferredInItems: Array<{ __typename?: 'TransferredItemType', lineItemId: string, description: string, amount: number, fromPlayerId: string, fromPlayerName: string, toPlayerId?: string | null | undefined, toPlayerName?: string | null | undefined }>, transferredOutItems: Array<{ __typename?: 'TransferredItemType', lineItemId: string, description: string, amount: number, fromPlayerId: string, fromPlayerName: string, toPlayerId?: string | null | undefined, toPlayerName?: string | null | undefined }> }> } };

export type GetSlotCartQueryVariables = Exact<{
  playerId: Scalars['ID']['input'];
}>;


export type GetSlotCartQuery = { __typename?: 'Query', slotCart?: { __typename?: 'SlotCartType', playerId: string, playerName: string, playerType: string, memberId?: string | null | undefined, memberNumber?: string | null | undefined, subtotal: number, taxTotal: number, grandTotal: number, paidAmount: number, balanceDue: number, isCheckedIn: boolean, checkedInAt?: string | null | undefined, isSettled: boolean, lineItems: Array<{ __typename?: 'SlotLineItemType', id: string, type: string, description: string, baseAmount: number, taxType: string, taxRate: number, taxAmount: number, totalAmount: number, quantity: number, isPaid: boolean, paidAt?: string | null | undefined, paymentMethod?: string | null | undefined, isTransferred: boolean, transferredFromPlayerName?: string | null | undefined }>, transferredInItems: Array<{ __typename?: 'TransferredItemType', lineItemId: string, description: string, amount: number, fromPlayerId: string, fromPlayerName: string, toPlayerId?: string | null | undefined, toPlayerName?: string | null | undefined }>, transferredOutItems: Array<{ __typename?: 'TransferredItemType', lineItemId: string, description: string, amount: number, fromPlayerId: string, fromPlayerName: string, toPlayerId?: string | null | undefined, toPlayerName?: string | null | undefined }> } | null | undefined };

export type GetBatchTotalQueryVariables = Exact<{
  playerIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type GetBatchTotalQuery = { __typename?: 'Query', batchTotal: { __typename?: 'BatchTotalType', playerIds: Array<string>, subtotal: number, taxTotal: number, grandTotal: number, paidAmount: number, balanceDue: number, lineItemCount: number } };

export type IsTeeTimeFullySettledQueryVariables = Exact<{
  teeTimeId: Scalars['ID']['input'];
}>;


export type IsTeeTimeFullySettledQuery = { __typename?: 'Query', isTeeTimeFullySettled: boolean };

export type GetCartDraftQueryVariables = Exact<{
  teeTimeId: Scalars['ID']['input'];
}>;


export type GetCartDraftQuery = { __typename?: 'Query', cartDraft?: { __typename?: 'CartDraftType', id: string, teeTimeId: string, draftData: string, updatedAt: string, createdBy: string } | null | undefined };

export type HasDraftQueryVariables = Exact<{
  teeTimeId: Scalars['ID']['input'];
}>;


export type HasDraftQuery = { __typename?: 'Query', hasDraft: boolean };

export type TransferLineItemMutationVariables = Exact<{
  input: TransferLineItemInput;
}>;


export type TransferLineItemMutation = { __typename?: 'Mutation', transferLineItem: { __typename?: 'TransferResultType', success: boolean, error?: string | null | undefined, lineItemId?: string | null | undefined, isTransferred?: boolean | null | undefined, transferredToPlayerId?: string | null | undefined } };

export type UndoTransferMutationVariables = Exact<{
  input: UndoTransferInput;
}>;


export type UndoTransferMutation = { __typename?: 'Mutation', undoTransfer: { __typename?: 'TransferResultType', success: boolean, error?: string | null | undefined } };

export type ProcessBatchPaymentMutationVariables = Exact<{
  input: BatchPaymentInput;
}>;


export type ProcessBatchPaymentMutation = { __typename?: 'Mutation', processBatchPayment: { __typename?: 'BatchPaymentResultType', success: boolean, error?: string | null | undefined, transactionId?: string | null | undefined, processedSlots?: Array<{ __typename?: 'SlotPaymentResultType', playerId: string, amountPaid: number, newBalance: number, isSettled: boolean }> | null | undefined } };

export type CheckInSlotsMutationVariables = Exact<{
  input: CheckInSlotsInput;
}>;


export type CheckInSlotsMutation = { __typename?: 'Mutation', checkInSlots: { __typename?: 'CheckInSlotsResultType', success: boolean, error?: string | null | undefined, ticketId?: string | null | undefined, ticketNumber?: string | null | undefined, checkedInSlots?: Array<{ __typename?: 'SlotCheckInResultType', playerId: string, checkedInAt?: string | null | undefined, error?: string | null | undefined }> | null | undefined } };

export type SaveCartDraftMutationVariables = Exact<{
  input: SaveCartDraftInput;
}>;


export type SaveCartDraftMutation = { __typename?: 'Mutation', saveCartDraft: { __typename?: 'CartDraftType', id: string, teeTimeId: string, draftData: string, updatedAt: string, createdBy: string } };

export type ClearCartDraftMutationVariables = Exact<{
  teeTimeId: Scalars['ID']['input'];
}>;


export type ClearCartDraftMutation = { __typename?: 'Mutation', clearCartDraft: boolean };

export type UpdateLineItemQuantityMutationVariables = Exact<{
  input: UpdateLineItemQuantityInput;
}>;


export type UpdateLineItemQuantityMutation = { __typename?: 'Mutation', updateLineItemQuantity: { __typename?: 'UpdateQuantityResultType', success: boolean, error?: string | null | undefined, lineItem?: { __typename?: 'SlotLineItemType', id: string, type: string, description: string, baseAmount: number, taxType: string, taxRate: number, taxAmount: number, totalAmount: number, quantity: number, isPaid: boolean, isTransferred: boolean } | null | undefined } };

export type BulkRemoveLineItemsMutationVariables = Exact<{
  input: BulkRemoveLineItemsInput;
}>;


export type BulkRemoveLineItemsMutation = { __typename?: 'Mutation', bulkRemoveLineItems: { __typename?: 'BulkRemoveResultType', success: boolean, error?: string | null | undefined, removedCount: number, removedItems: Array<{ __typename?: 'SlotLineItemType', id: string, description: string, totalAmount: number, quantity: number }> } };

export type BulkTransferLineItemsMutationVariables = Exact<{
  input: BulkTransferLineItemsInput;
}>;


export type BulkTransferLineItemsMutation = { __typename?: 'Mutation', bulkTransferLineItems: { __typename?: 'BulkTransferResultType', success: boolean, error?: string | null | undefined, transferredCount: number } };

export type PayLineItemsMutationVariables = Exact<{
  input: PayLineItemsInput;
}>;


export type PayLineItemsMutation = { __typename?: 'Mutation', payLineItems: { __typename?: 'PayLineItemsResultType', success: boolean, error?: string | null | undefined, transactionId?: string | null | undefined, paidCount: number, totalPaid: number } };

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

export type GetMinimumSpendRequirementsQueryVariables = Exact<{
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetMinimumSpendRequirementsQuery = { __typename?: 'Query', minimumSpendRequirements: Array<{ __typename?: 'MinimumSpendRequirement', id: string, clubId: string, name: string, description?: string | null | undefined, membershipTypes: Array<string>, minimumAmount: number, period: MinimumSpendPeriod, includeFoodBeverage: boolean, includeGolf: boolean, includeSpa: boolean, includeRetail: boolean, includeEvents: boolean, includedCategories: Array<string>, excludedCategories: Array<string>, defaultShortfallAction: ShortfallAction, gracePeriodDays: number, allowPartialCredit: boolean, notifyAtPercent: Array<number>, notifyDaysBeforeEnd: Array<number>, isActive: boolean, effectiveFrom: string, effectiveTo?: string | null | undefined, createdAt: string, updatedAt: string }> };

export type GetMinimumSpendRequirementQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetMinimumSpendRequirementQuery = { __typename?: 'Query', minimumSpendRequirement?: { __typename?: 'MinimumSpendRequirement', id: string, clubId: string, name: string, description?: string | null | undefined, membershipTypes: Array<string>, minimumAmount: number, period: MinimumSpendPeriod, includeFoodBeverage: boolean, includeGolf: boolean, includeSpa: boolean, includeRetail: boolean, includeEvents: boolean, includedCategories: Array<string>, excludedCategories: Array<string>, defaultShortfallAction: ShortfallAction, gracePeriodDays: number, allowPartialCredit: boolean, notifyAtPercent: Array<number>, notifyDaysBeforeEnd: Array<number>, isActive: boolean, effectiveFrom: string, effectiveTo?: string | null | undefined, createdAt: string, updatedAt: string } | null | undefined };

export type GetMemberMinimumSpendsQueryVariables = Exact<{
  input: GetMemberSpendsInput;
}>;


export type GetMemberMinimumSpendsQuery = { __typename?: 'Query', memberMinimumSpends: Array<{ __typename?: 'MemberMinimumSpend', id: string, clubId: string, memberId: string, requirementId: string, periodStart: string, periodEnd: string, periodLabel: string, requiredAmount: number, currentSpend: number, projectedSpend?: number | null | undefined, shortfallAmount?: number | null | undefined, carryForwardAmount: number, status: MemberSpendStatus, isExempt: boolean, exemptReason?: string | null | undefined, exemptBy?: string | null | undefined, exemptAt?: string | null | undefined, shortfallAction?: ShortfallAction | null | undefined, shortfallResolvedBy?: string | null | undefined, shortfallResolvedAt?: string | null | undefined, shortfallNote?: string | null | undefined, shortfallInvoiceId?: string | null | undefined, lastCalculatedAt: string, createdAt: string, updatedAt: string, requirement?: { __typename?: 'MinimumSpendRequirement', id: string, name: string, minimumAmount: number, period: MinimumSpendPeriod } | null | undefined }> };

export type GetMemberMinimumSpendQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetMemberMinimumSpendQuery = { __typename?: 'Query', memberMinimumSpend?: { __typename?: 'MemberMinimumSpend', id: string, clubId: string, memberId: string, requirementId: string, periodStart: string, periodEnd: string, periodLabel: string, requiredAmount: number, currentSpend: number, projectedSpend?: number | null | undefined, shortfallAmount?: number | null | undefined, carryForwardAmount: number, status: MemberSpendStatus, isExempt: boolean, exemptReason?: string | null | undefined, exemptBy?: string | null | undefined, exemptAt?: string | null | undefined, shortfallAction?: ShortfallAction | null | undefined, shortfallResolvedBy?: string | null | undefined, shortfallResolvedAt?: string | null | undefined, shortfallNote?: string | null | undefined, shortfallInvoiceId?: string | null | undefined, lastCalculatedAt: string, createdAt: string, updatedAt: string, requirement?: { __typename?: 'MinimumSpendRequirement', id: string, name: string, minimumAmount: number, period: MinimumSpendPeriod, defaultShortfallAction: ShortfallAction } | null | undefined } | null | undefined };

export type GetCurrentMemberSpendQueryVariables = Exact<{
  memberId: Scalars['ID']['input'];
  requirementId: Scalars['ID']['input'];
}>;


export type GetCurrentMemberSpendQuery = { __typename?: 'Query', currentMemberSpend: { __typename?: 'MemberMinimumSpend', id: string, clubId: string, memberId: string, requirementId: string, periodStart: string, periodEnd: string, periodLabel: string, requiredAmount: number, currentSpend: number, projectedSpend?: number | null | undefined, shortfallAmount?: number | null | undefined, carryForwardAmount: number, status: MemberSpendStatus, isExempt: boolean, lastCalculatedAt: string, requirement?: { __typename?: 'MinimumSpendRequirement', id: string, name: string, minimumAmount: number, period: MinimumSpendPeriod } | null | undefined } };

export type CreateMinimumSpendRequirementMutationVariables = Exact<{
  input: CreateRequirementInput;
}>;


export type CreateMinimumSpendRequirementMutation = { __typename?: 'Mutation', createMinimumSpendRequirement: { __typename?: 'MinimumSpendRequirement', id: string, name: string, description?: string | null | undefined, membershipTypes: Array<string>, minimumAmount: number, period: MinimumSpendPeriod, isActive: boolean, createdAt: string } };

export type UpdateMinimumSpendRequirementMutationVariables = Exact<{
  input: UpdateRequirementInput;
}>;


export type UpdateMinimumSpendRequirementMutation = { __typename?: 'Mutation', updateMinimumSpendRequirement: { __typename?: 'MinimumSpendRequirement', id: string, name: string, description?: string | null | undefined, membershipTypes: Array<string>, minimumAmount: number, period: MinimumSpendPeriod, isActive: boolean, updatedAt: string } };

export type DeleteMinimumSpendRequirementMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteMinimumSpendRequirementMutation = { __typename?: 'Mutation', deleteMinimumSpendRequirement: { __typename?: 'MinimumSpendRequirement', id: string, isActive: boolean } };

export type RecordMinimumSpendMutationVariables = Exact<{
  input: RecordSpendInput;
}>;


export type RecordMinimumSpendMutation = { __typename?: 'Mutation', recordMinimumSpend: { __typename?: 'MemberMinimumSpend', id: string, currentSpend: number, status: MemberSpendStatus, lastCalculatedAt: string, requirement?: { __typename?: 'MinimumSpendRequirement', id: string, name: string, minimumAmount: number } | null | undefined } };

export type ResolveMinimumSpendShortfallMutationVariables = Exact<{
  input: ResolveShortfallInput;
}>;


export type ResolveMinimumSpendShortfallMutation = { __typename?: 'Mutation', resolveMinimumSpendShortfall: { __typename?: 'MemberMinimumSpend', id: string, status: MemberSpendStatus, shortfallAction?: ShortfallAction | null | undefined, shortfallResolvedBy?: string | null | undefined, shortfallResolvedAt?: string | null | undefined, shortfallNote?: string | null | undefined } };

export type ExemptMemberFromMinimumSpendMutationVariables = Exact<{
  input: ExemptMemberInput;
}>;


export type ExemptMemberFromMinimumSpendMutation = { __typename?: 'Mutation', exemptMemberFromMinimumSpend: { __typename?: 'MemberMinimumSpend', id: string, status: MemberSpendStatus, isExempt: boolean, exemptReason?: string | null | undefined, exemptBy?: string | null | undefined, exemptAt?: string | null | undefined } };

export type RemoveMinimumSpendExemptionMutationVariables = Exact<{
  memberSpendId: Scalars['ID']['input'];
}>;


export type RemoveMinimumSpendExemptionMutation = { __typename?: 'Mutation', removeMinimumSpendExemption: { __typename?: 'MemberMinimumSpend', id: string, status: MemberSpendStatus, isExempt: boolean } };

export type CloseMinimumSpendPeriodMutationVariables = Exact<{
  input: ClosePeriodInput;
}>;


export type CloseMinimumSpendPeriodMutation = { __typename?: 'Mutation', closeMinimumSpendPeriod: Array<{ __typename?: 'MemberMinimumSpend', id: string, status: MemberSpendStatus, shortfallAmount?: number | null | undefined, shortfallAction?: ShortfallAction | null | undefined }> };

export type RecalculateMemberSpendMutationVariables = Exact<{
  memberSpendId: Scalars['ID']['input'];
}>;


export type RecalculateMemberSpendMutation = { __typename?: 'Mutation', recalculateMemberSpend: { __typename?: 'MemberMinimumSpend', id: string, currentSpend: number, status: MemberSpendStatus, lastCalculatedAt: string } };

export type GetPosConfigQueryVariables = Exact<{
  outletId: Scalars['ID']['input'];
  userRole: Scalars['String']['input'];
  userPermissions?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type GetPosConfigQuery = { __typename?: 'Query', posConfig: { __typename?: 'POSResolvedConfigGraphQLType', toolbarConfig: any, actionBarConfig: any, outlet: { __typename?: 'POSOutletGraphQLType', id: string, clubId: string, name: string, outletType: string, isActive: boolean }, template?: { __typename?: 'POSTemplateGraphQLType', id: string, name: string, outletType: string } | null | undefined, buttonStates: Array<{ __typename?: 'POSButtonStateGraphQLType', buttonId: string, visible: boolean, enabled: boolean, requiresApproval: boolean }> } };

export type GetPosTemplatesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPosTemplatesQuery = { __typename?: 'Query', posTemplates: Array<{ __typename?: 'POSTemplateGraphQLType', id: string, clubId: string, name: string, description?: string | null | undefined, outletType: string, toolbarConfig: any, actionBarConfig: any, isDefault: boolean, createdAt: string, updatedAt: string }> };

export type GetPosTemplateQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetPosTemplateQuery = { __typename?: 'Query', posTemplate?: { __typename?: 'POSTemplateGraphQLType', id: string, clubId: string, name: string, description?: string | null | undefined, outletType: string, toolbarConfig: any, actionBarConfig: any, isDefault: boolean, createdAt: string, updatedAt: string, outlets?: Array<{ __typename?: 'POSOutletGraphQLType', id: string, name: string }> | null | undefined } | null | undefined };

export type GetPosOutletsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPosOutletsQuery = { __typename?: 'Query', posOutlets: Array<{ __typename?: 'POSOutletGraphQLType', id: string, clubId: string, name: string, outletType: string, templateId?: string | null | undefined, customConfig: any, isActive: boolean, createdAt: string, updatedAt: string, template?: { __typename?: 'POSTemplateGraphQLType', id: string, name: string } | null | undefined }> };

export type GetPosOutletQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetPosOutletQuery = { __typename?: 'Query', posOutlet?: { __typename?: 'POSOutletGraphQLType', id: string, clubId: string, name: string, outletType: string, templateId?: string | null | undefined, customConfig: any, isActive: boolean, createdAt: string, updatedAt: string, template?: { __typename?: 'POSTemplateGraphQLType', id: string, name: string } | null | undefined, roleConfigs?: Array<{ __typename?: 'POSOutletRoleConfigGraphQLType', id: string, role: string, buttonOverrides: any }> | null | undefined } | null | undefined };

export type GetPosButtonRegistryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPosButtonRegistryQuery = { __typename?: 'Query', posButtonRegistry: { __typename?: 'POSButtonRegistryGraphQLType', clubId: string, registry: any } };

export type UpsertPosTemplateMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  input: PosTemplateInput;
}>;


export type UpsertPosTemplateMutation = { __typename?: 'Mutation', upsertPOSTemplate: { __typename?: 'UpsertTemplateMutationResponse', success: boolean, message?: string | null | undefined, template?: { __typename?: 'POSTemplateGraphQLType', id: string, name: string } | null | undefined } };

export type ClonePosTemplateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  newName: Scalars['String']['input'];
}>;


export type ClonePosTemplateMutation = { __typename?: 'Mutation', clonePOSTemplate: { __typename?: 'CloneTemplateMutationResponse', success: boolean, message?: string | null | undefined, template?: { __typename?: 'POSTemplateGraphQLType', id: string, name: string } | null | undefined } };

export type DeletePosTemplateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeletePosTemplateMutation = { __typename?: 'Mutation', deletePOSTemplate: { __typename?: 'DeleteTemplateMutationResponse', success: boolean, message?: string | null | undefined } };

export type AssignPosTemplateMutationVariables = Exact<{
  input: AssignTemplateInput;
}>;


export type AssignPosTemplateMutation = { __typename?: 'Mutation', assignPOSTemplate: { __typename?: 'AssignTemplateMutationResponse', success: boolean, message?: string | null | undefined, outlet?: { __typename?: 'POSOutletGraphQLType', id: string, name: string, templateId?: string | null | undefined } | null | undefined } };

export type SetPosRoleOverridesMutationVariables = Exact<{
  outletId: Scalars['ID']['input'];
  input: PosRoleOverridesInput;
}>;


export type SetPosRoleOverridesMutation = { __typename?: 'Mutation', setPOSRoleOverrides: { __typename?: 'SetRoleOverridesMutationResponse', success: boolean, message?: string | null | undefined, roleConfig?: { __typename?: 'POSOutletRoleConfigGraphQLType', id: string, role: string, buttonOverrides: any } | null | undefined } };

export type UpdatePosButtonRegistryMutationVariables = Exact<{
  input: UpdateButtonRegistryInput;
}>;


export type UpdatePosButtonRegistryMutation = { __typename?: 'Mutation', updatePOSButtonRegistry: { __typename?: 'UpdateButtonRegistryMutationResponse', success: boolean, message?: string | null | undefined } };

export type GetOutletProductPanelQueryVariables = Exact<{
  outletId: Scalars['ID']['input'];
}>;


export type GetOutletProductPanelQuery = { __typename?: 'Query', outletProductPanel: { __typename?: 'OutletProductPanel', gridConfig: { __typename?: 'OutletGridConfig', id: string, gridColumns: number, gridRows: number, tileSize: TileSize, showImages: boolean, showPrices: boolean, categoryStyle: CategoryDisplayStyle, showAllCategory: boolean, quickKeysEnabled: boolean, quickKeysCount: number, quickKeysPosition: QuickKeysPosition }, quickKeys: Array<{ __typename?: 'Product', id: string, name: string, basePrice: number, imageUrl?: string | null | undefined, productType: ProductType, category: { __typename?: 'ProductCategory', id: string, color?: string | null | undefined } }>, suggestions: Array<{ __typename?: 'Product', id: string, name: string, basePrice: number, imageUrl?: string | null | undefined, productType: ProductType, category: { __typename?: 'ProductCategory', id: string, color?: string | null | undefined } }> }, productCategories: Array<{ __typename?: 'ProductCategory', id: string, name: string, color?: string | null | undefined, iconName?: string | null | undefined, sortOrder: number, parentId?: string | null | undefined }> };

export type SmartSuggestionsQueryVariables = Exact<{
  outletId: Scalars['ID']['input'];
}>;


export type SmartSuggestionsQuery = { __typename?: 'Query', smartSuggestions: Array<{ __typename?: 'Product', id: string, name: string, basePrice: number, imageUrl?: string | null | undefined, productType: ProductType, category: { __typename?: 'ProductCategory', id: string, color?: string | null | undefined } }> };

export type OutletProductConfigsQueryVariables = Exact<{
  outletId: Scalars['ID']['input'];
}>;


export type OutletProductConfigsQuery = { __typename?: 'Query', outletProductConfigs: Array<{ __typename?: 'OutletProductConfig', id: string, productId: string, displayName?: string | null | undefined, buttonColor?: string | null | undefined, sortPriority?: number | null | undefined, gridPosition?: any | null | undefined, isVisible: boolean, visibilityRules: any, isQuickKey: boolean, quickKeyPosition?: number | null | undefined, product?: { __typename?: 'Product', id: string, name: string, sku?: string | null | undefined, productType: ProductType, basePrice: number, imageUrl?: string | null | undefined, category: { __typename?: 'ProductCategory', id: string, name: string, color?: string | null | undefined } } | null | undefined }> };

export type UpdateOutletProductConfigMutationVariables = Exact<{
  outletId: Scalars['ID']['input'];
  productId: Scalars['ID']['input'];
  input: UpdateOutletProductConfigInput;
}>;


export type UpdateOutletProductConfigMutation = { __typename?: 'Mutation', updateOutletProductConfig: { __typename?: 'OutletProductConfig', id: string, displayName?: string | null | undefined, buttonColor?: string | null | undefined, sortPriority?: number | null | undefined, isVisible: boolean, isQuickKey: boolean, quickKeyPosition?: number | null | undefined } };

export type BulkUpdateOutletProductConfigsMutationVariables = Exact<{
  outletId: Scalars['ID']['input'];
  input: BulkOutletProductConfigInput;
}>;


export type BulkUpdateOutletProductConfigsMutation = { __typename?: 'Mutation', bulkUpdateOutletProductConfigs: Array<{ __typename?: 'OutletProductConfig', id: string, isVisible: boolean, isQuickKey: boolean }> };

export type UpdateOutletGridConfigMutationVariables = Exact<{
  outletId: Scalars['ID']['input'];
  input: UpdateOutletGridConfigInput;
}>;


export type UpdateOutletGridConfigMutation = { __typename?: 'Mutation', updateOutletGridConfig: { __typename?: 'OutletGridConfig', id: string, gridColumns: number, gridRows: number, tileSize: TileSize, showImages: boolean, showPrices: boolean, categoryStyle: CategoryDisplayStyle, quickKeysEnabled: boolean, quickKeysCount: number, quickKeysPosition: QuickKeysPosition } };

export type UpdateSmartSuggestionConfigMutationVariables = Exact<{
  outletId: Scalars['ID']['input'];
  input: UpdateSmartSuggestionConfigInput;
}>;


export type UpdateSmartSuggestionConfigMutation = { __typename?: 'Mutation', updateSmartSuggestionConfig: { __typename?: 'SmartSuggestionConfig', id: string, enabled: boolean, suggestionCount: number, position: SuggestionPosition, timeOfDayWeight: number, salesVelocityWeight: number, staffHistoryWeight: number } };

export type GetMemberPaymentMethodsQueryVariables = Exact<{
  memberId: Scalars['ID']['input'];
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetMemberPaymentMethodsQuery = { __typename?: 'Query', memberPaymentMethods: Array<{ __typename?: 'StoredPaymentMethod', id: string, clubId: string, memberId: string, stripeCustomerId?: string | null | undefined, stripePaymentMethodId: string, type: StoredPaymentMethodType, brand: string, last4: string, expiryMonth?: number | null | undefined, expiryYear?: number | null | undefined, cardholderName?: string | null | undefined, status: StoredPaymentMethodStatus, isDefault: boolean, isAutoPayEnabled: boolean, verifiedAt?: string | null | undefined, lastUsedAt?: string | null | undefined, failureCount: number, lastFailureReason?: string | null | undefined, createdAt: string, updatedAt: string }> };

export type GetPaymentMethodQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetPaymentMethodQuery = { __typename?: 'Query', paymentMethod?: { __typename?: 'StoredPaymentMethod', id: string, clubId: string, memberId: string, stripeCustomerId?: string | null | undefined, stripePaymentMethodId: string, type: StoredPaymentMethodType, brand: string, last4: string, expiryMonth?: number | null | undefined, expiryYear?: number | null | undefined, cardholderName?: string | null | undefined, status: StoredPaymentMethodStatus, isDefault: boolean, isAutoPayEnabled: boolean, verifiedAt?: string | null | undefined, lastUsedAt?: string | null | undefined, failureCount: number, lastFailureReason?: string | null | undefined, createdAt: string, updatedAt: string } | null | undefined };

export type GetMemberAutoPaySettingQueryVariables = Exact<{
  memberId: Scalars['ID']['input'];
}>;


export type GetMemberAutoPaySettingQuery = { __typename?: 'Query', memberAutoPaySetting?: { __typename?: 'AutoPaySetting', id: string, clubId: string, memberId: string, paymentMethodId: string, isEnabled: boolean, schedule: AutoPaySchedule, paymentDayOfMonth?: number | null | undefined, maxPaymentAmount?: number | null | undefined, monthlyMaxAmount?: number | null | undefined, requireApprovalAbove?: number | null | undefined, payDuesOnly: boolean, excludeCategories: Array<string>, notifyBeforePayment: boolean, notifyDaysBefore: number, notifyOnSuccess: boolean, notifyOnFailure: boolean, maxRetryAttempts: number, retryIntervalDays: number, createdAt: string, updatedAt: string, paymentMethod?: { __typename?: 'StoredPaymentMethod', id: string, brand: string, last4: string, isDefault: boolean } | null | undefined } | null | undefined };

export type GetMemberAutoPayHistoryQueryVariables = Exact<{
  input: GetAutoPayHistoryInput;
}>;


export type GetMemberAutoPayHistoryQuery = { __typename?: 'Query', memberAutoPayHistory: Array<{ __typename?: 'AutoPayAttempt', id: string, clubId: string, memberId: string, paymentMethodId: string, invoiceId?: string | null | undefined, amount: number, attemptNumber: number, status: AutoPayAttemptStatus, stripePaymentIntentId?: string | null | undefined, stripeChargeId?: string | null | undefined, processedAt?: string | null | undefined, succeededAt?: string | null | undefined, failedAt?: string | null | undefined, failureCode?: string | null | undefined, failureMessage?: string | null | undefined, nextRetryAt?: string | null | undefined, isManualRetry: boolean, paymentTransactionId?: string | null | undefined, createdAt: string, updatedAt: string, paymentMethod?: { __typename?: 'StoredPaymentMethod', id: string, brand: string, last4: string } | null | undefined }> };

export type GetInvoiceAutoPayAttemptsQueryVariables = Exact<{
  invoiceId: Scalars['ID']['input'];
}>;


export type GetInvoiceAutoPayAttemptsQuery = { __typename?: 'Query', invoiceAutoPayAttempts: Array<{ __typename?: 'AutoPayAttempt', id: string, memberId: string, paymentMethodId: string, amount: number, attemptNumber: number, status: AutoPayAttemptStatus, processedAt?: string | null | undefined, succeededAt?: string | null | undefined, failedAt?: string | null | undefined, failureCode?: string | null | undefined, failureMessage?: string | null | undefined, createdAt: string, paymentMethod?: { __typename?: 'StoredPaymentMethod', id: string, brand: string, last4: string } | null | undefined }> };

export type AddPaymentMethodMutationVariables = Exact<{
  input: AddStoredPaymentInput;
}>;


export type AddPaymentMethodMutation = { __typename?: 'Mutation', addPaymentMethod: { __typename?: 'StoredPaymentMethod', id: string, memberId: string, brand: string, last4: string, expiryMonth?: number | null | undefined, expiryYear?: number | null | undefined, cardholderName?: string | null | undefined, status: StoredPaymentMethodStatus, isDefault: boolean, isAutoPayEnabled: boolean, createdAt: string } };

export type UpdatePaymentMethodMutationVariables = Exact<{
  input: UpdateStoredPaymentInput;
}>;


export type UpdatePaymentMethodMutation = { __typename?: 'Mutation', updatePaymentMethod: { __typename?: 'StoredPaymentMethod', id: string, isDefault: boolean, isAutoPayEnabled: boolean, updatedAt: string } };

export type RemovePaymentMethodMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RemovePaymentMethodMutation = { __typename?: 'Mutation', removePaymentMethod: { __typename?: 'RemovePaymentMethodResult', success: boolean, error?: string | null | undefined } };

export type SetDefaultPaymentMethodMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SetDefaultPaymentMethodMutation = { __typename?: 'Mutation', setDefaultPaymentMethod: { __typename?: 'StoredPaymentMethod', id: string, isDefault: boolean, updatedAt: string } };

export type UpsertAutoPaySettingMutationVariables = Exact<{
  input: AutoPaySettingInput;
}>;


export type UpsertAutoPaySettingMutation = { __typename?: 'Mutation', upsertAutoPaySetting: { __typename?: 'AutoPaySetting', id: string, memberId: string, paymentMethodId: string, isEnabled: boolean, schedule: AutoPaySchedule, paymentDayOfMonth?: number | null | undefined, maxPaymentAmount?: number | null | undefined, monthlyMaxAmount?: number | null | undefined, requireApprovalAbove?: number | null | undefined, payDuesOnly: boolean, excludeCategories: Array<string>, notifyBeforePayment: boolean, notifyDaysBefore: number, notifyOnSuccess: boolean, notifyOnFailure: boolean, maxRetryAttempts: number, retryIntervalDays: number, createdAt: string, updatedAt: string, paymentMethod?: { __typename?: 'StoredPaymentMethod', id: string, brand: string, last4: string } | null | undefined } };

export type DisableAutoPayMutationVariables = Exact<{
  memberId: Scalars['ID']['input'];
}>;


export type DisableAutoPayMutation = { __typename?: 'Mutation', disableAutoPay: { __typename?: 'RemovePaymentMethodResult', success: boolean, error?: string | null | undefined } };

export type ProcessAutoPayMutationVariables = Exact<{
  input: ProcessAutoPayInput;
}>;


export type ProcessAutoPayMutation = { __typename?: 'Mutation', processAutoPay: { __typename?: 'AutoPayResult', success: boolean, attemptId?: string | null | undefined, message?: string | null | undefined, stripePaymentIntentId?: string | null | undefined, error?: string | null | undefined } };

export type RetryAutoPayAttemptMutationVariables = Exact<{
  attemptId: Scalars['ID']['input'];
}>;


export type RetryAutoPayAttemptMutation = { __typename?: 'Mutation', retryAutoPayAttempt: { __typename?: 'AutoPayResult', success: boolean, attemptId?: string | null | undefined, message?: string | null | undefined, stripePaymentIntentId?: string | null | undefined, error?: string | null | undefined } };

export type GetSubAccountsQueryVariables = Exact<{
  status?: InputMaybe<SubAccountStatus>;
}>;


export type GetSubAccountsQuery = { __typename?: 'Query', subAccounts: Array<{ __typename?: 'SubAccount', id: string, clubId: string, memberId: string, name: string, relationship: string, email?: string | null | undefined, phone?: string | null | undefined, status: SubAccountStatus, validFrom: string, validUntil?: string | null | undefined, permissions: Array<SubAccountPermission>, dailyLimit?: number | null | undefined, weeklyLimit?: number | null | undefined, monthlyLimit?: number | null | undefined, perTransactionLimit?: number | null | undefined, dailySpend: number, weeklySpend: number, monthlySpend: number, notifyPrimaryOnUse: boolean, notifyOnLimitReached: boolean, pinAttempts: number, pinLockedUntil?: string | null | undefined, createdAt: string, updatedAt: string }> };

export type GetSubAccountQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSubAccountQuery = { __typename?: 'Query', subAccount?: { __typename?: 'SubAccount', id: string, clubId: string, memberId: string, name: string, relationship: string, email?: string | null | undefined, phone?: string | null | undefined, status: SubAccountStatus, validFrom: string, validUntil?: string | null | undefined, permissions: Array<SubAccountPermission>, dailyLimit?: number | null | undefined, weeklyLimit?: number | null | undefined, monthlyLimit?: number | null | undefined, perTransactionLimit?: number | null | undefined, dailySpend: number, weeklySpend: number, monthlySpend: number, lastResetDaily: string, lastResetWeekly: string, lastResetMonthly: string, notifyPrimaryOnUse: boolean, notifyOnLimitReached: boolean, pinAttempts: number, pinLockedUntil?: string | null | undefined, createdAt: string, updatedAt: string } | null | undefined };

export type GetMemberSubAccountsQueryVariables = Exact<{
  memberId: Scalars['ID']['input'];
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetMemberSubAccountsQuery = { __typename?: 'Query', memberSubAccounts: Array<{ __typename?: 'SubAccount', id: string, name: string, relationship: string, status: SubAccountStatus, permissions: Array<SubAccountPermission>, dailyLimit?: number | null | undefined, weeklyLimit?: number | null | undefined, monthlyLimit?: number | null | undefined, perTransactionLimit?: number | null | undefined, dailySpend: number, weeklySpend: number, monthlySpend: number, validUntil?: string | null | undefined, pinLockedUntil?: string | null | undefined }> };

export type CheckSubAccountLimitQueryVariables = Exact<{
  input: CheckLimitInput;
}>;


export type CheckSubAccountLimitQuery = { __typename?: 'Query', checkSubAccountLimit: { __typename?: 'SubAccountLimitCheck', allowed: boolean, reason?: string | null | undefined, currentDaily: number, currentWeekly: number, currentMonthly: number, dailyLimit?: number | null | undefined, weeklyLimit?: number | null | undefined, monthlyLimit?: number | null | undefined, perTransactionLimit?: number | null | undefined } };

export type GetSubAccountTransactionsQueryVariables = Exact<{
  input: GetTransactionsInput;
}>;


export type GetSubAccountTransactionsQuery = { __typename?: 'Query', subAccountTransactions: Array<{ __typename?: 'SubAccountTransaction', id: string, clubId: string, subAccountId: string, amount: number, description: string, category: SubAccountPermission, paymentTransactionId?: string | null | undefined, lineItemId?: string | null | undefined, teeTimeId?: string | null | undefined, verifiedAt: string, verifiedBy?: string | null | undefined, locationName?: string | null | undefined, notes?: string | null | undefined, createdAt: string, subAccount?: { __typename?: 'SubAccount', id: string, name: string, memberId: string } | null | undefined }> };

export type CreateSubAccountMutationVariables = Exact<{
  input: CreateSubAccountInput;
}>;


export type CreateSubAccountMutation = { __typename?: 'Mutation', createSubAccount: { __typename?: 'SubAccount', id: string, name: string, relationship: string, status: SubAccountStatus, permissions: Array<SubAccountPermission>, createdAt: string } };

export type UpdateSubAccountMutationVariables = Exact<{
  input: UpdateSubAccountInput;
}>;


export type UpdateSubAccountMutation = { __typename?: 'Mutation', updateSubAccount: { __typename?: 'SubAccount', id: string, name: string, relationship: string, email?: string | null | undefined, phone?: string | null | undefined, permissions: Array<SubAccountPermission>, dailyLimit?: number | null | undefined, weeklyLimit?: number | null | undefined, monthlyLimit?: number | null | undefined, perTransactionLimit?: number | null | undefined, validUntil?: string | null | undefined, notifyPrimaryOnUse: boolean, notifyOnLimitReached: boolean, updatedAt: string } };

export type VerifySubAccountPinMutationVariables = Exact<{
  input: VerifyPinInput;
}>;


export type VerifySubAccountPinMutation = { __typename?: 'Mutation', verifySubAccountPin: { __typename?: 'PinVerificationResult', success: boolean, message?: string | null | undefined, remainingAttempts?: number | null | undefined } };

export type ChangeSubAccountPinMutationVariables = Exact<{
  input: ChangePinInput;
}>;


export type ChangeSubAccountPinMutation = { __typename?: 'Mutation', changeSubAccountPin: { __typename?: 'SubAccount', id: string, pinAttempts: number, pinLockedUntil?: string | null | undefined } };

export type ChangeSubAccountStatusMutationVariables = Exact<{
  input: ChangeSubAccountStatusInput;
}>;


export type ChangeSubAccountStatusMutation = { __typename?: 'Mutation', changeSubAccountStatus: { __typename?: 'SubAccount', id: string, status: SubAccountStatus, updatedAt: string } };

export type UnlockSubAccountPinMutationVariables = Exact<{
  subAccountId: Scalars['ID']['input'];
}>;


export type UnlockSubAccountPinMutation = { __typename?: 'Mutation', unlockSubAccountPin: { __typename?: 'SubAccount', id: string, pinAttempts: number, pinLockedUntil?: string | null | undefined } };

export type DeleteSubAccountMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteSubAccountMutation = { __typename?: 'Mutation', deleteSubAccount: { __typename?: 'SubAccount', id: string, status: SubAccountStatus } };

export type RecordSubAccountTransactionMutationVariables = Exact<{
  input: RecordTransactionInput;
}>;


export type RecordSubAccountTransactionMutation = { __typename?: 'Mutation', recordSubAccountTransaction: { __typename?: 'SubAccountTransaction', id: string, amount: number, description: string, category: SubAccountPermission, verifiedAt: string, createdAt: string } };

export type ResetSubAccountSpendingMutationVariables = Exact<{
  subAccountId: Scalars['ID']['input'];
}>;


export type ResetSubAccountSpendingMutation = { __typename?: 'Mutation', resetSubAccountSpending: { __typename?: 'SubAccount', id: string, dailySpend: number, weeklySpend: number, monthlySpend: number, lastResetDaily: string, lastResetWeekly: string, lastResetMonthly: string } };


export const SlotLineItemFieldsFragmentDoc = `
    fragment SlotLineItemFields on SlotLineItemType {
  id
  type
  description
  baseAmount
  taxType
  taxRate
  taxAmount
  totalAmount
  quantity
  isPaid
  paidAt
  paymentMethod
  isTransferred
  transferredFromPlayerName
}
    `;
export const TransferredItemFieldsFragmentDoc = `
    fragment TransferredItemFields on TransferredItemType {
  lineItemId
  description
  amount
  fromPlayerId
  fromPlayerName
  toPlayerId
  toPlayerName
}
    `;
export const SlotCartFieldsFragmentDoc = `
    fragment SlotCartFields on SlotCartType {
  playerId
  playerName
  playerType
  memberId
  memberNumber
  lineItems {
    ...SlotLineItemFields
  }
  transferredInItems {
    ...TransferredItemFields
  }
  transferredOutItems {
    ...TransferredItemFields
  }
  subtotal
  taxTotal
  grandTotal
  paidAmount
  balanceDue
  isCheckedIn
  checkedInAt
  isSettled
}
    ${SlotLineItemFieldsFragmentDoc}
${TransferredItemFieldsFragmentDoc}`;
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

export const GetChargeTypesDocument = `
    query GetChargeTypes {
  chargeTypes {
    id
    name
    code
    description
    defaultPrice
    taxable
    category
  }
}
    `;

export const useGetChargeTypesQuery = <
      TData = GetChargeTypesQuery,
      TError = unknown
    >(
      variables?: GetChargeTypesQueryVariables,
      options?: Omit<UseQueryOptions<GetChargeTypesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetChargeTypesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetChargeTypesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetChargeTypes'] : ['GetChargeTypes', variables],
    queryFn: graphqlFetcher<GetChargeTypesQuery, GetChargeTypesQueryVariables>(GetChargeTypesDocument, variables),
    ...options
  }
    )};

useGetChargeTypesQuery.getKey = (variables?: GetChargeTypesQueryVariables) => variables === undefined ? ['GetChargeTypes'] : ['GetChargeTypes', variables];

export const useInfiniteGetChargeTypesQuery = <
      TData = InfiniteData<GetChargeTypesQuery>,
      TError = unknown
    >(
      variables: GetChargeTypesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetChargeTypesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetChargeTypesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetChargeTypesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetChargeTypes.infinite'] : ['GetChargeTypes.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetChargeTypesQuery, GetChargeTypesQueryVariables>(GetChargeTypesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetChargeTypesQuery.getKey = (variables?: GetChargeTypesQueryVariables) => variables === undefined ? ['GetChargeTypes.infinite'] : ['GetChargeTypes.infinite', variables];


useGetChargeTypesQuery.fetcher = (variables?: GetChargeTypesQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetChargeTypesQuery, GetChargeTypesQueryVariables>(GetChargeTypesDocument, variables, options);

export const GetArAgingReportDocument = `
    query GetArAgingReport($filter: String, $page: Float, $limit: Float) {
  arAgingReport(filter: $filter, page: $page, limit: $limit) {
    buckets {
      id
      label
      memberCount
      totalAmount
      percentage
    }
    members {
      id
      name
      photoUrl
      memberNumber
      membershipType
      oldestInvoiceDate
      balance
      daysOutstanding
      status
    }
    reinstatedMembers {
      id
      name
      clearedDate
      previousBalance
      receiptId
      receiptNumber
    }
    totalCount
  }
}
    `;

export const useGetArAgingReportQuery = <
      TData = GetArAgingReportQuery,
      TError = unknown
    >(
      variables?: GetArAgingReportQueryVariables,
      options?: Omit<UseQueryOptions<GetArAgingReportQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetArAgingReportQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetArAgingReportQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetArAgingReport'] : ['GetArAgingReport', variables],
    queryFn: graphqlFetcher<GetArAgingReportQuery, GetArAgingReportQueryVariables>(GetArAgingReportDocument, variables),
    ...options
  }
    )};

useGetArAgingReportQuery.getKey = (variables?: GetArAgingReportQueryVariables) => variables === undefined ? ['GetArAgingReport'] : ['GetArAgingReport', variables];

export const useInfiniteGetArAgingReportQuery = <
      TData = InfiniteData<GetArAgingReportQuery>,
      TError = unknown
    >(
      variables: GetArAgingReportQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetArAgingReportQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetArAgingReportQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetArAgingReportQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetArAgingReport.infinite'] : ['GetArAgingReport.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetArAgingReportQuery, GetArAgingReportQueryVariables>(GetArAgingReportDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetArAgingReportQuery.getKey = (variables?: GetArAgingReportQueryVariables) => variables === undefined ? ['GetArAgingReport.infinite'] : ['GetArAgingReport.infinite', variables];


useGetArAgingReportQuery.fetcher = (variables?: GetArAgingReportQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetArAgingReportQuery, GetArAgingReportQueryVariables>(GetArAgingReportDocument, variables, options);

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

export const GetCreditNotesDocument = `
    query GetCreditNotes($first: Int, $skip: Int, $memberId: ID, $status: CreditNoteStatus, $startDate: DateTime, $endDate: DateTime) {
  creditNotes(
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
        creditNoteNumber
        issueDate
        type
        reason
        reasonDetail
        subtotal
        taxAmount
        totalAmount
        appliedToBalance
        refundedAmount
        status
        createdAt
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

export const useGetCreditNotesQuery = <
      TData = GetCreditNotesQuery,
      TError = unknown
    >(
      variables?: GetCreditNotesQueryVariables,
      options?: Omit<UseQueryOptions<GetCreditNotesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetCreditNotesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetCreditNotesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetCreditNotes'] : ['GetCreditNotes', variables],
    queryFn: graphqlFetcher<GetCreditNotesQuery, GetCreditNotesQueryVariables>(GetCreditNotesDocument, variables),
    ...options
  }
    )};

useGetCreditNotesQuery.getKey = (variables?: GetCreditNotesQueryVariables) => variables === undefined ? ['GetCreditNotes'] : ['GetCreditNotes', variables];

export const useInfiniteGetCreditNotesQuery = <
      TData = InfiniteData<GetCreditNotesQuery>,
      TError = unknown
    >(
      variables: GetCreditNotesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetCreditNotesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetCreditNotesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetCreditNotesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetCreditNotes.infinite'] : ['GetCreditNotes.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetCreditNotesQuery, GetCreditNotesQueryVariables>(GetCreditNotesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetCreditNotesQuery.getKey = (variables?: GetCreditNotesQueryVariables) => variables === undefined ? ['GetCreditNotes.infinite'] : ['GetCreditNotes.infinite', variables];


useGetCreditNotesQuery.fetcher = (variables?: GetCreditNotesQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetCreditNotesQuery, GetCreditNotesQueryVariables>(GetCreditNotesDocument, variables, options);

export const GetCreditNoteDocument = `
    query GetCreditNote($id: ID!) {
  creditNote(id: $id) {
    id
    creditNoteNumber
    issueDate
    type
    reason
    reasonDetail
    subtotal
    taxAmount
    totalAmount
    appliedToBalance
    refundedAmount
    status
    internalNotes
    memberVisibleNotes
    approvedAt
    voidedAt
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
      lineTotal
      taxable
      taxRate
      taxAmount
      chargeType {
        id
        name
        code
      }
    }
    applications {
      id
      amountApplied
      appliedAt
      invoice {
        id
        invoiceNumber
        totalAmount
        balanceDue
      }
    }
  }
}
    `;

export const useGetCreditNoteQuery = <
      TData = GetCreditNoteQuery,
      TError = unknown
    >(
      variables: GetCreditNoteQueryVariables,
      options?: Omit<UseQueryOptions<GetCreditNoteQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetCreditNoteQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetCreditNoteQuery, TError, TData>(
      {
    queryKey: ['GetCreditNote', variables],
    queryFn: graphqlFetcher<GetCreditNoteQuery, GetCreditNoteQueryVariables>(GetCreditNoteDocument, variables),
    ...options
  }
    )};

useGetCreditNoteQuery.getKey = (variables: GetCreditNoteQueryVariables) => ['GetCreditNote', variables];

export const useInfiniteGetCreditNoteQuery = <
      TData = InfiniteData<GetCreditNoteQuery>,
      TError = unknown
    >(
      variables: GetCreditNoteQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetCreditNoteQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetCreditNoteQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetCreditNoteQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetCreditNote.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetCreditNoteQuery, GetCreditNoteQueryVariables>(GetCreditNoteDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetCreditNoteQuery.getKey = (variables: GetCreditNoteQueryVariables) => ['GetCreditNote.infinite', variables];


useGetCreditNoteQuery.fetcher = (variables: GetCreditNoteQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetCreditNoteQuery, GetCreditNoteQueryVariables>(GetCreditNoteDocument, variables, options);

export const CreateCreditNoteDocument = `
    mutation CreateCreditNote($input: CreateCreditNoteInput!) {
  createCreditNote(input: $input) {
    id
    creditNoteNumber
    totalAmount
    status
  }
}
    `;

export const useCreateCreditNoteMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateCreditNoteMutation, TError, CreateCreditNoteMutationVariables, TContext>) => {
    
    return useMutation<CreateCreditNoteMutation, TError, CreateCreditNoteMutationVariables, TContext>(
      {
    mutationKey: ['CreateCreditNote'],
    mutationFn: (variables?: CreateCreditNoteMutationVariables) => graphqlFetcher<CreateCreditNoteMutation, CreateCreditNoteMutationVariables>(CreateCreditNoteDocument, variables)(),
    ...options
  }
    )};


useCreateCreditNoteMutation.fetcher = (variables: CreateCreditNoteMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateCreditNoteMutation, CreateCreditNoteMutationVariables>(CreateCreditNoteDocument, variables, options);

export const ApproveCreditNoteDocument = `
    mutation ApproveCreditNote($id: ID!) {
  approveCreditNote(id: $id) {
    id
    creditNoteNumber
    status
    approvedAt
  }
}
    `;

export const useApproveCreditNoteMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ApproveCreditNoteMutation, TError, ApproveCreditNoteMutationVariables, TContext>) => {
    
    return useMutation<ApproveCreditNoteMutation, TError, ApproveCreditNoteMutationVariables, TContext>(
      {
    mutationKey: ['ApproveCreditNote'],
    mutationFn: (variables?: ApproveCreditNoteMutationVariables) => graphqlFetcher<ApproveCreditNoteMutation, ApproveCreditNoteMutationVariables>(ApproveCreditNoteDocument, variables)(),
    ...options
  }
    )};


useApproveCreditNoteMutation.fetcher = (variables: ApproveCreditNoteMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ApproveCreditNoteMutation, ApproveCreditNoteMutationVariables>(ApproveCreditNoteDocument, variables, options);

export const ApplyCreditNoteToBalanceDocument = `
    mutation ApplyCreditNoteToBalance($id: ID!) {
  applyCreditNoteToBalance(id: $id) {
    id
    creditNoteNumber
    status
    appliedToBalance
  }
}
    `;

export const useApplyCreditNoteToBalanceMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ApplyCreditNoteToBalanceMutation, TError, ApplyCreditNoteToBalanceMutationVariables, TContext>) => {
    
    return useMutation<ApplyCreditNoteToBalanceMutation, TError, ApplyCreditNoteToBalanceMutationVariables, TContext>(
      {
    mutationKey: ['ApplyCreditNoteToBalance'],
    mutationFn: (variables?: ApplyCreditNoteToBalanceMutationVariables) => graphqlFetcher<ApplyCreditNoteToBalanceMutation, ApplyCreditNoteToBalanceMutationVariables>(ApplyCreditNoteToBalanceDocument, variables)(),
    ...options
  }
    )};


useApplyCreditNoteToBalanceMutation.fetcher = (variables: ApplyCreditNoteToBalanceMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ApplyCreditNoteToBalanceMutation, ApplyCreditNoteToBalanceMutationVariables>(ApplyCreditNoteToBalanceDocument, variables, options);

export const ApplyCreditNoteToInvoiceDocument = `
    mutation ApplyCreditNoteToInvoice($id: ID!, $input: ApplyCreditNoteInput!) {
  applyCreditNoteToInvoice(id: $id, input: $input) {
    id
    creditNoteNumber
    status
    appliedToBalance
    applications {
      id
      amountApplied
      appliedAt
    }
  }
}
    `;

export const useApplyCreditNoteToInvoiceMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ApplyCreditNoteToInvoiceMutation, TError, ApplyCreditNoteToInvoiceMutationVariables, TContext>) => {
    
    return useMutation<ApplyCreditNoteToInvoiceMutation, TError, ApplyCreditNoteToInvoiceMutationVariables, TContext>(
      {
    mutationKey: ['ApplyCreditNoteToInvoice'],
    mutationFn: (variables?: ApplyCreditNoteToInvoiceMutationVariables) => graphqlFetcher<ApplyCreditNoteToInvoiceMutation, ApplyCreditNoteToInvoiceMutationVariables>(ApplyCreditNoteToInvoiceDocument, variables)(),
    ...options
  }
    )};


useApplyCreditNoteToInvoiceMutation.fetcher = (variables: ApplyCreditNoteToInvoiceMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ApplyCreditNoteToInvoiceMutation, ApplyCreditNoteToInvoiceMutationVariables>(ApplyCreditNoteToInvoiceDocument, variables, options);

export const VoidCreditNoteDocument = `
    mutation VoidCreditNote($id: ID!, $input: VoidCreditNoteInput!) {
  voidCreditNote(id: $id, input: $input) {
    id
    creditNoteNumber
    status
    voidedAt
  }
}
    `;

export const useVoidCreditNoteMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<VoidCreditNoteMutation, TError, VoidCreditNoteMutationVariables, TContext>) => {
    
    return useMutation<VoidCreditNoteMutation, TError, VoidCreditNoteMutationVariables, TContext>(
      {
    mutationKey: ['VoidCreditNote'],
    mutationFn: (variables?: VoidCreditNoteMutationVariables) => graphqlFetcher<VoidCreditNoteMutation, VoidCreditNoteMutationVariables>(VoidCreditNoteDocument, variables)(),
    ...options
  }
    )};


useVoidCreditNoteMutation.fetcher = (variables: VoidCreditNoteMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<VoidCreditNoteMutation, VoidCreditNoteMutationVariables>(VoidCreditNoteDocument, variables, options);

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

export const GetCashDrawersDocument = `
    query GetCashDrawers($activeOnly: Boolean) {
  cashDrawers(activeOnly: $activeOnly) {
    id
    clubId
    name
    location
    isActive
    createdAt
    updatedAt
    currentShift {
      id
      status
      openedAt
      openedBy
      openingFloat
    }
  }
}
    `;

export const useGetCashDrawersQuery = <
      TData = GetCashDrawersQuery,
      TError = unknown
    >(
      variables?: GetCashDrawersQueryVariables,
      options?: Omit<UseQueryOptions<GetCashDrawersQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetCashDrawersQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetCashDrawersQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetCashDrawers'] : ['GetCashDrawers', variables],
    queryFn: graphqlFetcher<GetCashDrawersQuery, GetCashDrawersQueryVariables>(GetCashDrawersDocument, variables),
    ...options
  }
    )};

useGetCashDrawersQuery.getKey = (variables?: GetCashDrawersQueryVariables) => variables === undefined ? ['GetCashDrawers'] : ['GetCashDrawers', variables];

export const useInfiniteGetCashDrawersQuery = <
      TData = InfiniteData<GetCashDrawersQuery>,
      TError = unknown
    >(
      variables: GetCashDrawersQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetCashDrawersQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetCashDrawersQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetCashDrawersQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetCashDrawers.infinite'] : ['GetCashDrawers.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetCashDrawersQuery, GetCashDrawersQueryVariables>(GetCashDrawersDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetCashDrawersQuery.getKey = (variables?: GetCashDrawersQueryVariables) => variables === undefined ? ['GetCashDrawers.infinite'] : ['GetCashDrawers.infinite', variables];


useGetCashDrawersQuery.fetcher = (variables?: GetCashDrawersQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetCashDrawersQuery, GetCashDrawersQueryVariables>(GetCashDrawersDocument, variables, options);

export const GetCashDrawerDocument = `
    query GetCashDrawer($id: ID!) {
  cashDrawer(id: $id) {
    id
    clubId
    name
    location
    isActive
    createdAt
    updatedAt
    currentShift {
      id
      status
      openedAt
      openedBy
      openingFloat
      totalSales
      totalRefunds
      totalPaidIn
      totalPaidOut
      totalDrops
    }
  }
}
    `;

export const useGetCashDrawerQuery = <
      TData = GetCashDrawerQuery,
      TError = unknown
    >(
      variables: GetCashDrawerQueryVariables,
      options?: Omit<UseQueryOptions<GetCashDrawerQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetCashDrawerQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetCashDrawerQuery, TError, TData>(
      {
    queryKey: ['GetCashDrawer', variables],
    queryFn: graphqlFetcher<GetCashDrawerQuery, GetCashDrawerQueryVariables>(GetCashDrawerDocument, variables),
    ...options
  }
    )};

useGetCashDrawerQuery.getKey = (variables: GetCashDrawerQueryVariables) => ['GetCashDrawer', variables];

export const useInfiniteGetCashDrawerQuery = <
      TData = InfiniteData<GetCashDrawerQuery>,
      TError = unknown
    >(
      variables: GetCashDrawerQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetCashDrawerQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetCashDrawerQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetCashDrawerQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetCashDrawer.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetCashDrawerQuery, GetCashDrawerQueryVariables>(GetCashDrawerDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetCashDrawerQuery.getKey = (variables: GetCashDrawerQueryVariables) => ['GetCashDrawer.infinite', variables];


useGetCashDrawerQuery.fetcher = (variables: GetCashDrawerQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetCashDrawerQuery, GetCashDrawerQueryVariables>(GetCashDrawerDocument, variables, options);

export const GetCurrentShiftDocument = `
    query GetCurrentShift($cashDrawerId: ID!) {
  currentShift(cashDrawerId: $cashDrawerId) {
    id
    cashDrawerId
    status
    openedBy
    openedAt
    openingFloat
    openingDenominations
    totalSales
    totalRefunds
    totalPaidIn
    totalPaidOut
    totalDrops
    createdAt
  }
}
    `;

export const useGetCurrentShiftQuery = <
      TData = GetCurrentShiftQuery,
      TError = unknown
    >(
      variables: GetCurrentShiftQueryVariables,
      options?: Omit<UseQueryOptions<GetCurrentShiftQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetCurrentShiftQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetCurrentShiftQuery, TError, TData>(
      {
    queryKey: ['GetCurrentShift', variables],
    queryFn: graphqlFetcher<GetCurrentShiftQuery, GetCurrentShiftQueryVariables>(GetCurrentShiftDocument, variables),
    ...options
  }
    )};

useGetCurrentShiftQuery.getKey = (variables: GetCurrentShiftQueryVariables) => ['GetCurrentShift', variables];

export const useInfiniteGetCurrentShiftQuery = <
      TData = InfiniteData<GetCurrentShiftQuery>,
      TError = unknown
    >(
      variables: GetCurrentShiftQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetCurrentShiftQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetCurrentShiftQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetCurrentShiftQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetCurrentShift.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetCurrentShiftQuery, GetCurrentShiftQueryVariables>(GetCurrentShiftDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetCurrentShiftQuery.getKey = (variables: GetCurrentShiftQueryVariables) => ['GetCurrentShift.infinite', variables];


useGetCurrentShiftQuery.fetcher = (variables: GetCurrentShiftQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetCurrentShiftQuery, GetCurrentShiftQueryVariables>(GetCurrentShiftDocument, variables, options);

export const GetCashDrawerShiftDocument = `
    query GetCashDrawerShift($shiftId: ID!) {
  cashDrawerShift(shiftId: $shiftId) {
    id
    cashDrawerId
    status
    openedBy
    openedAt
    openingFloat
    openingDenominations
    closedBy
    closedAt
    closingCount
    closingDenominations
    expectedCash
    actualCash
    variance
    varianceNote
    totalSales
    totalRefunds
    totalPaidIn
    totalPaidOut
    totalDrops
    createdAt
    movements {
      id
      type
      amount
      description
      performedAt
    }
  }
}
    `;

export const useGetCashDrawerShiftQuery = <
      TData = GetCashDrawerShiftQuery,
      TError = unknown
    >(
      variables: GetCashDrawerShiftQueryVariables,
      options?: Omit<UseQueryOptions<GetCashDrawerShiftQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetCashDrawerShiftQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetCashDrawerShiftQuery, TError, TData>(
      {
    queryKey: ['GetCashDrawerShift', variables],
    queryFn: graphqlFetcher<GetCashDrawerShiftQuery, GetCashDrawerShiftQueryVariables>(GetCashDrawerShiftDocument, variables),
    ...options
  }
    )};

useGetCashDrawerShiftQuery.getKey = (variables: GetCashDrawerShiftQueryVariables) => ['GetCashDrawerShift', variables];

export const useInfiniteGetCashDrawerShiftQuery = <
      TData = InfiniteData<GetCashDrawerShiftQuery>,
      TError = unknown
    >(
      variables: GetCashDrawerShiftQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetCashDrawerShiftQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetCashDrawerShiftQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetCashDrawerShiftQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetCashDrawerShift.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetCashDrawerShiftQuery, GetCashDrawerShiftQueryVariables>(GetCashDrawerShiftDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetCashDrawerShiftQuery.getKey = (variables: GetCashDrawerShiftQueryVariables) => ['GetCashDrawerShift.infinite', variables];


useGetCashDrawerShiftQuery.fetcher = (variables: GetCashDrawerShiftQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetCashDrawerShiftQuery, GetCashDrawerShiftQueryVariables>(GetCashDrawerShiftDocument, variables, options);

export const GetShiftSummaryDocument = `
    query GetShiftSummary($shiftId: ID!) {
  shiftSummary(shiftId: $shiftId) {
    shiftId
    status
    openedAt
    openedBy
    closedAt
    closedBy
    openingFloat
    closingCount
    expectedCash
    actualCash
    variance
    totalSales
    totalRefunds
    totalPaidIn
    totalPaidOut
    totalDrops
    movementCount
  }
}
    `;

export const useGetShiftSummaryQuery = <
      TData = GetShiftSummaryQuery,
      TError = unknown
    >(
      variables: GetShiftSummaryQueryVariables,
      options?: Omit<UseQueryOptions<GetShiftSummaryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetShiftSummaryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetShiftSummaryQuery, TError, TData>(
      {
    queryKey: ['GetShiftSummary', variables],
    queryFn: graphqlFetcher<GetShiftSummaryQuery, GetShiftSummaryQueryVariables>(GetShiftSummaryDocument, variables),
    ...options
  }
    )};

useGetShiftSummaryQuery.getKey = (variables: GetShiftSummaryQueryVariables) => ['GetShiftSummary', variables];

export const useInfiniteGetShiftSummaryQuery = <
      TData = InfiniteData<GetShiftSummaryQuery>,
      TError = unknown
    >(
      variables: GetShiftSummaryQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetShiftSummaryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetShiftSummaryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetShiftSummaryQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetShiftSummary.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetShiftSummaryQuery, GetShiftSummaryQueryVariables>(GetShiftSummaryDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetShiftSummaryQuery.getKey = (variables: GetShiftSummaryQueryVariables) => ['GetShiftSummary.infinite', variables];


useGetShiftSummaryQuery.fetcher = (variables: GetShiftSummaryQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetShiftSummaryQuery, GetShiftSummaryQueryVariables>(GetShiftSummaryDocument, variables, options);

export const GetShiftHistoryDocument = `
    query GetShiftHistory($cashDrawerId: ID!, $limit: Int) {
  shiftHistory(cashDrawerId: $cashDrawerId, limit: $limit) {
    id
    status
    openedAt
    openedBy
    closedAt
    closedBy
    openingFloat
    closingCount
    expectedCash
    actualCash
    variance
    totalSales
    totalRefunds
  }
}
    `;

export const useGetShiftHistoryQuery = <
      TData = GetShiftHistoryQuery,
      TError = unknown
    >(
      variables: GetShiftHistoryQueryVariables,
      options?: Omit<UseQueryOptions<GetShiftHistoryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetShiftHistoryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetShiftHistoryQuery, TError, TData>(
      {
    queryKey: ['GetShiftHistory', variables],
    queryFn: graphqlFetcher<GetShiftHistoryQuery, GetShiftHistoryQueryVariables>(GetShiftHistoryDocument, variables),
    ...options
  }
    )};

useGetShiftHistoryQuery.getKey = (variables: GetShiftHistoryQueryVariables) => ['GetShiftHistory', variables];

export const useInfiniteGetShiftHistoryQuery = <
      TData = InfiniteData<GetShiftHistoryQuery>,
      TError = unknown
    >(
      variables: GetShiftHistoryQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetShiftHistoryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetShiftHistoryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetShiftHistoryQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetShiftHistory.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetShiftHistoryQuery, GetShiftHistoryQueryVariables>(GetShiftHistoryDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetShiftHistoryQuery.getKey = (variables: GetShiftHistoryQueryVariables) => ['GetShiftHistory.infinite', variables];


useGetShiftHistoryQuery.fetcher = (variables: GetShiftHistoryQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetShiftHistoryQuery, GetShiftHistoryQueryVariables>(GetShiftHistoryDocument, variables, options);

export const GetShiftMovementsDocument = `
    query GetShiftMovements($shiftId: ID!, $type: CashMovementType) {
  shiftMovements(shiftId: $shiftId, type: $type) {
    id
    shiftId
    type
    amount
    description
    reference
    reason
    approvedBy
    transactionId
    performedBy
    performedAt
  }
}
    `;

export const useGetShiftMovementsQuery = <
      TData = GetShiftMovementsQuery,
      TError = unknown
    >(
      variables: GetShiftMovementsQueryVariables,
      options?: Omit<UseQueryOptions<GetShiftMovementsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetShiftMovementsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetShiftMovementsQuery, TError, TData>(
      {
    queryKey: ['GetShiftMovements', variables],
    queryFn: graphqlFetcher<GetShiftMovementsQuery, GetShiftMovementsQueryVariables>(GetShiftMovementsDocument, variables),
    ...options
  }
    )};

useGetShiftMovementsQuery.getKey = (variables: GetShiftMovementsQueryVariables) => ['GetShiftMovements', variables];

export const useInfiniteGetShiftMovementsQuery = <
      TData = InfiniteData<GetShiftMovementsQuery>,
      TError = unknown
    >(
      variables: GetShiftMovementsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetShiftMovementsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetShiftMovementsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetShiftMovementsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetShiftMovements.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetShiftMovementsQuery, GetShiftMovementsQueryVariables>(GetShiftMovementsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetShiftMovementsQuery.getKey = (variables: GetShiftMovementsQueryVariables) => ['GetShiftMovements.infinite', variables];


useGetShiftMovementsQuery.fetcher = (variables: GetShiftMovementsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetShiftMovementsQuery, GetShiftMovementsQueryVariables>(GetShiftMovementsDocument, variables, options);

export const CreateCashDrawerDocument = `
    mutation CreateCashDrawer($input: CreateCashDrawerInput!) {
  createCashDrawer(input: $input) {
    id
    clubId
    name
    location
    isActive
    createdAt
  }
}
    `;

export const useCreateCashDrawerMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateCashDrawerMutation, TError, CreateCashDrawerMutationVariables, TContext>) => {
    
    return useMutation<CreateCashDrawerMutation, TError, CreateCashDrawerMutationVariables, TContext>(
      {
    mutationKey: ['CreateCashDrawer'],
    mutationFn: (variables?: CreateCashDrawerMutationVariables) => graphqlFetcher<CreateCashDrawerMutation, CreateCashDrawerMutationVariables>(CreateCashDrawerDocument, variables)(),
    ...options
  }
    )};


useCreateCashDrawerMutation.fetcher = (variables: CreateCashDrawerMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateCashDrawerMutation, CreateCashDrawerMutationVariables>(CreateCashDrawerDocument, variables, options);

export const UpdateCashDrawerDocument = `
    mutation UpdateCashDrawer($input: UpdateCashDrawerInput!) {
  updateCashDrawer(input: $input) {
    id
    name
    location
    isActive
    updatedAt
  }
}
    `;

export const useUpdateCashDrawerMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateCashDrawerMutation, TError, UpdateCashDrawerMutationVariables, TContext>) => {
    
    return useMutation<UpdateCashDrawerMutation, TError, UpdateCashDrawerMutationVariables, TContext>(
      {
    mutationKey: ['UpdateCashDrawer'],
    mutationFn: (variables?: UpdateCashDrawerMutationVariables) => graphqlFetcher<UpdateCashDrawerMutation, UpdateCashDrawerMutationVariables>(UpdateCashDrawerDocument, variables)(),
    ...options
  }
    )};


useUpdateCashDrawerMutation.fetcher = (variables: UpdateCashDrawerMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateCashDrawerMutation, UpdateCashDrawerMutationVariables>(UpdateCashDrawerDocument, variables, options);

export const OpenShiftDocument = `
    mutation OpenShift($input: OpenShiftInput!) {
  openShift(input: $input) {
    id
    cashDrawerId
    status
    openedBy
    openedAt
    openingFloat
    openingDenominations
  }
}
    `;

export const useOpenShiftMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<OpenShiftMutation, TError, OpenShiftMutationVariables, TContext>) => {
    
    return useMutation<OpenShiftMutation, TError, OpenShiftMutationVariables, TContext>(
      {
    mutationKey: ['OpenShift'],
    mutationFn: (variables?: OpenShiftMutationVariables) => graphqlFetcher<OpenShiftMutation, OpenShiftMutationVariables>(OpenShiftDocument, variables)(),
    ...options
  }
    )};


useOpenShiftMutation.fetcher = (variables: OpenShiftMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<OpenShiftMutation, OpenShiftMutationVariables>(OpenShiftDocument, variables, options);

export const CloseShiftDocument = `
    mutation CloseShift($input: CloseShiftInput!) {
  closeShift(input: $input) {
    id
    status
    closedBy
    closedAt
    closingCount
    closingDenominations
    expectedCash
    actualCash
    variance
    varianceNote
  }
}
    `;

export const useCloseShiftMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CloseShiftMutation, TError, CloseShiftMutationVariables, TContext>) => {
    
    return useMutation<CloseShiftMutation, TError, CloseShiftMutationVariables, TContext>(
      {
    mutationKey: ['CloseShift'],
    mutationFn: (variables?: CloseShiftMutationVariables) => graphqlFetcher<CloseShiftMutation, CloseShiftMutationVariables>(CloseShiftDocument, variables)(),
    ...options
  }
    )};


useCloseShiftMutation.fetcher = (variables: CloseShiftMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CloseShiftMutation, CloseShiftMutationVariables>(CloseShiftDocument, variables, options);

export const SuspendShiftDocument = `
    mutation SuspendShift($shiftId: ID!) {
  suspendShift(shiftId: $shiftId) {
    id
    status
  }
}
    `;

export const useSuspendShiftMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<SuspendShiftMutation, TError, SuspendShiftMutationVariables, TContext>) => {
    
    return useMutation<SuspendShiftMutation, TError, SuspendShiftMutationVariables, TContext>(
      {
    mutationKey: ['SuspendShift'],
    mutationFn: (variables?: SuspendShiftMutationVariables) => graphqlFetcher<SuspendShiftMutation, SuspendShiftMutationVariables>(SuspendShiftDocument, variables)(),
    ...options
  }
    )};


useSuspendShiftMutation.fetcher = (variables: SuspendShiftMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<SuspendShiftMutation, SuspendShiftMutationVariables>(SuspendShiftDocument, variables, options);

export const ResumeShiftDocument = `
    mutation ResumeShift($shiftId: ID!) {
  resumeShift(shiftId: $shiftId) {
    id
    status
  }
}
    `;

export const useResumeShiftMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ResumeShiftMutation, TError, ResumeShiftMutationVariables, TContext>) => {
    
    return useMutation<ResumeShiftMutation, TError, ResumeShiftMutationVariables, TContext>(
      {
    mutationKey: ['ResumeShift'],
    mutationFn: (variables?: ResumeShiftMutationVariables) => graphqlFetcher<ResumeShiftMutation, ResumeShiftMutationVariables>(ResumeShiftDocument, variables)(),
    ...options
  }
    )};


useResumeShiftMutation.fetcher = (variables: ResumeShiftMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ResumeShiftMutation, ResumeShiftMutationVariables>(ResumeShiftDocument, variables, options);

export const RecordCashMovementDocument = `
    mutation RecordCashMovement($input: RecordMovementInput!, $approvedBy: ID) {
  recordCashMovement(input: $input, approvedBy: $approvedBy) {
    id
    shiftId
    type
    amount
    description
    reference
    reason
    approvedBy
    transactionId
    performedBy
    performedAt
  }
}
    `;

export const useRecordCashMovementMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RecordCashMovementMutation, TError, RecordCashMovementMutationVariables, TContext>) => {
    
    return useMutation<RecordCashMovementMutation, TError, RecordCashMovementMutationVariables, TContext>(
      {
    mutationKey: ['RecordCashMovement'],
    mutationFn: (variables?: RecordCashMovementMutationVariables) => graphqlFetcher<RecordCashMovementMutation, RecordCashMovementMutationVariables>(RecordCashMovementDocument, variables)(),
    ...options
  }
    )};


useRecordCashMovementMutation.fetcher = (variables: RecordCashMovementMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<RecordCashMovementMutation, RecordCashMovementMutationVariables>(RecordCashMovementDocument, variables, options);

export const CheckMemberCreditDocument = `
    query CheckMemberCredit($input: CheckCreditInput!) {
  checkMemberCredit(input: $input) {
    allowed
    currentBalance
    creditLimit
    availableCredit
    chargeAmount
    newBalance
    usagePercent
    warning
    shortfall
  }
}
    `;

export const useCheckMemberCreditQuery = <
      TData = CheckMemberCreditQuery,
      TError = unknown
    >(
      variables: CheckMemberCreditQueryVariables,
      options?: Omit<UseQueryOptions<CheckMemberCreditQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<CheckMemberCreditQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<CheckMemberCreditQuery, TError, TData>(
      {
    queryKey: ['CheckMemberCredit', variables],
    queryFn: graphqlFetcher<CheckMemberCreditQuery, CheckMemberCreditQueryVariables>(CheckMemberCreditDocument, variables),
    ...options
  }
    )};

useCheckMemberCreditQuery.getKey = (variables: CheckMemberCreditQueryVariables) => ['CheckMemberCredit', variables];

export const useInfiniteCheckMemberCreditQuery = <
      TData = InfiniteData<CheckMemberCreditQuery>,
      TError = unknown
    >(
      variables: CheckMemberCreditQueryVariables,
      options: Omit<UseInfiniteQueryOptions<CheckMemberCreditQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<CheckMemberCreditQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<CheckMemberCreditQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['CheckMemberCredit.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<CheckMemberCreditQuery, CheckMemberCreditQueryVariables>(CheckMemberCreditDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteCheckMemberCreditQuery.getKey = (variables: CheckMemberCreditQueryVariables) => ['CheckMemberCredit.infinite', variables];


useCheckMemberCreditQuery.fetcher = (variables: CheckMemberCreditQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<CheckMemberCreditQuery, CheckMemberCreditQueryVariables>(CheckMemberCreditDocument, variables, options);

export const GetMemberCreditStatusDocument = `
    query GetMemberCreditStatus($memberId: ID!) {
  memberCreditStatus(memberId: $memberId) {
    creditLimit
    currentBalance
    availableCredit
    usagePercent
    alertThreshold
    isBlocked
    overrideAllowed
  }
}
    `;

export const useGetMemberCreditStatusQuery = <
      TData = GetMemberCreditStatusQuery,
      TError = unknown
    >(
      variables: GetMemberCreditStatusQueryVariables,
      options?: Omit<UseQueryOptions<GetMemberCreditStatusQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMemberCreditStatusQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMemberCreditStatusQuery, TError, TData>(
      {
    queryKey: ['GetMemberCreditStatus', variables],
    queryFn: graphqlFetcher<GetMemberCreditStatusQuery, GetMemberCreditStatusQueryVariables>(GetMemberCreditStatusDocument, variables),
    ...options
  }
    )};

useGetMemberCreditStatusQuery.getKey = (variables: GetMemberCreditStatusQueryVariables) => ['GetMemberCreditStatus', variables];

export const useInfiniteGetMemberCreditStatusQuery = <
      TData = InfiniteData<GetMemberCreditStatusQuery>,
      TError = unknown
    >(
      variables: GetMemberCreditStatusQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMemberCreditStatusQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMemberCreditStatusQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMemberCreditStatusQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetMemberCreditStatus.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMemberCreditStatusQuery, GetMemberCreditStatusQueryVariables>(GetMemberCreditStatusDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMemberCreditStatusQuery.getKey = (variables: GetMemberCreditStatusQueryVariables) => ['GetMemberCreditStatus.infinite', variables];


useGetMemberCreditStatusQuery.fetcher = (variables: GetMemberCreditStatusQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMemberCreditStatusQuery, GetMemberCreditStatusQueryVariables>(GetMemberCreditStatusDocument, variables, options);

export const GetMemberCreditSettingsDocument = `
    query GetMemberCreditSettings($memberId: ID!) {
  memberCreditSettings(memberId: $memberId) {
    creditLimit
    creditLimitEnabled
    creditAlertThreshold
    creditBlockEnabled
    creditOverrideAllowed
  }
}
    `;

export const useGetMemberCreditSettingsQuery = <
      TData = GetMemberCreditSettingsQuery,
      TError = unknown
    >(
      variables: GetMemberCreditSettingsQueryVariables,
      options?: Omit<UseQueryOptions<GetMemberCreditSettingsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMemberCreditSettingsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMemberCreditSettingsQuery, TError, TData>(
      {
    queryKey: ['GetMemberCreditSettings', variables],
    queryFn: graphqlFetcher<GetMemberCreditSettingsQuery, GetMemberCreditSettingsQueryVariables>(GetMemberCreditSettingsDocument, variables),
    ...options
  }
    )};

useGetMemberCreditSettingsQuery.getKey = (variables: GetMemberCreditSettingsQueryVariables) => ['GetMemberCreditSettings', variables];

export const useInfiniteGetMemberCreditSettingsQuery = <
      TData = InfiniteData<GetMemberCreditSettingsQuery>,
      TError = unknown
    >(
      variables: GetMemberCreditSettingsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMemberCreditSettingsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMemberCreditSettingsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMemberCreditSettingsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetMemberCreditSettings.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMemberCreditSettingsQuery, GetMemberCreditSettingsQueryVariables>(GetMemberCreditSettingsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMemberCreditSettingsQuery.getKey = (variables: GetMemberCreditSettingsQueryVariables) => ['GetMemberCreditSettings.infinite', variables];


useGetMemberCreditSettingsQuery.fetcher = (variables: GetMemberCreditSettingsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMemberCreditSettingsQuery, GetMemberCreditSettingsQueryVariables>(GetMemberCreditSettingsDocument, variables, options);

export const GetMemberCreditOverridesDocument = `
    query GetMemberCreditOverrides($memberId: ID!) {
  memberCreditOverrides(memberId: $memberId) {
    id
    memberId
    previousLimit
    newLimit
    reason
    approvedBy
    approvedAt
    expiresAt
    isActive
    createdAt
  }
}
    `;

export const useGetMemberCreditOverridesQuery = <
      TData = GetMemberCreditOverridesQuery,
      TError = unknown
    >(
      variables: GetMemberCreditOverridesQueryVariables,
      options?: Omit<UseQueryOptions<GetMemberCreditOverridesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMemberCreditOverridesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMemberCreditOverridesQuery, TError, TData>(
      {
    queryKey: ['GetMemberCreditOverrides', variables],
    queryFn: graphqlFetcher<GetMemberCreditOverridesQuery, GetMemberCreditOverridesQueryVariables>(GetMemberCreditOverridesDocument, variables),
    ...options
  }
    )};

useGetMemberCreditOverridesQuery.getKey = (variables: GetMemberCreditOverridesQueryVariables) => ['GetMemberCreditOverrides', variables];

export const useInfiniteGetMemberCreditOverridesQuery = <
      TData = InfiniteData<GetMemberCreditOverridesQuery>,
      TError = unknown
    >(
      variables: GetMemberCreditOverridesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMemberCreditOverridesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMemberCreditOverridesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMemberCreditOverridesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetMemberCreditOverrides.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMemberCreditOverridesQuery, GetMemberCreditOverridesQueryVariables>(GetMemberCreditOverridesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMemberCreditOverridesQuery.getKey = (variables: GetMemberCreditOverridesQueryVariables) => ['GetMemberCreditOverrides.infinite', variables];


useGetMemberCreditOverridesQuery.fetcher = (variables: GetMemberCreditOverridesQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMemberCreditOverridesQuery, GetMemberCreditOverridesQueryVariables>(GetMemberCreditOverridesDocument, variables, options);

export const GetMemberCreditOverrideHistoryDocument = `
    query GetMemberCreditOverrideHistory($memberId: ID!, $limit: Int) {
  memberCreditOverrideHistory(memberId: $memberId, limit: $limit) {
    id
    memberId
    previousLimit
    newLimit
    reason
    approvedBy
    approvedAt
    expiresAt
    isActive
    createdAt
  }
}
    `;

export const useGetMemberCreditOverrideHistoryQuery = <
      TData = GetMemberCreditOverrideHistoryQuery,
      TError = unknown
    >(
      variables: GetMemberCreditOverrideHistoryQueryVariables,
      options?: Omit<UseQueryOptions<GetMemberCreditOverrideHistoryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMemberCreditOverrideHistoryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMemberCreditOverrideHistoryQuery, TError, TData>(
      {
    queryKey: ['GetMemberCreditOverrideHistory', variables],
    queryFn: graphqlFetcher<GetMemberCreditOverrideHistoryQuery, GetMemberCreditOverrideHistoryQueryVariables>(GetMemberCreditOverrideHistoryDocument, variables),
    ...options
  }
    )};

useGetMemberCreditOverrideHistoryQuery.getKey = (variables: GetMemberCreditOverrideHistoryQueryVariables) => ['GetMemberCreditOverrideHistory', variables];

export const useInfiniteGetMemberCreditOverrideHistoryQuery = <
      TData = InfiniteData<GetMemberCreditOverrideHistoryQuery>,
      TError = unknown
    >(
      variables: GetMemberCreditOverrideHistoryQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMemberCreditOverrideHistoryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMemberCreditOverrideHistoryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMemberCreditOverrideHistoryQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetMemberCreditOverrideHistory.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMemberCreditOverrideHistoryQuery, GetMemberCreditOverrideHistoryQueryVariables>(GetMemberCreditOverrideHistoryDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMemberCreditOverrideHistoryQuery.getKey = (variables: GetMemberCreditOverrideHistoryQueryVariables) => ['GetMemberCreditOverrideHistory.infinite', variables];


useGetMemberCreditOverrideHistoryQuery.fetcher = (variables: GetMemberCreditOverrideHistoryQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMemberCreditOverrideHistoryQuery, GetMemberCreditOverrideHistoryQueryVariables>(GetMemberCreditOverrideHistoryDocument, variables, options);

export const GetMembersAtCreditRiskDocument = `
    query GetMembersAtCreditRisk {
  membersAtCreditRisk {
    id
    memberId
    firstName
    lastName
    creditLimit
    outstandingBalance
    usagePercent
    isAtRisk
    isExceeded
  }
}
    `;

export const useGetMembersAtCreditRiskQuery = <
      TData = GetMembersAtCreditRiskQuery,
      TError = unknown
    >(
      variables?: GetMembersAtCreditRiskQueryVariables,
      options?: Omit<UseQueryOptions<GetMembersAtCreditRiskQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMembersAtCreditRiskQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMembersAtCreditRiskQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetMembersAtCreditRisk'] : ['GetMembersAtCreditRisk', variables],
    queryFn: graphqlFetcher<GetMembersAtCreditRiskQuery, GetMembersAtCreditRiskQueryVariables>(GetMembersAtCreditRiskDocument, variables),
    ...options
  }
    )};

useGetMembersAtCreditRiskQuery.getKey = (variables?: GetMembersAtCreditRiskQueryVariables) => variables === undefined ? ['GetMembersAtCreditRisk'] : ['GetMembersAtCreditRisk', variables];

export const useInfiniteGetMembersAtCreditRiskQuery = <
      TData = InfiniteData<GetMembersAtCreditRiskQuery>,
      TError = unknown
    >(
      variables: GetMembersAtCreditRiskQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMembersAtCreditRiskQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMembersAtCreditRiskQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMembersAtCreditRiskQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetMembersAtCreditRisk.infinite'] : ['GetMembersAtCreditRisk.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMembersAtCreditRiskQuery, GetMembersAtCreditRiskQueryVariables>(GetMembersAtCreditRiskDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMembersAtCreditRiskQuery.getKey = (variables?: GetMembersAtCreditRiskQueryVariables) => variables === undefined ? ['GetMembersAtCreditRisk.infinite'] : ['GetMembersAtCreditRisk.infinite', variables];


useGetMembersAtCreditRiskQuery.fetcher = (variables?: GetMembersAtCreditRiskQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMembersAtCreditRiskQuery, GetMembersAtCreditRiskQueryVariables>(GetMembersAtCreditRiskDocument, variables, options);

export const CreateCreditOverrideDocument = `
    mutation CreateCreditOverride($input: CreateCreditOverrideInput!) {
  createCreditOverride(input: $input) {
    id
    memberId
    previousLimit
    newLimit
    reason
    approvedBy
    approvedAt
    expiresAt
    isActive
    createdAt
  }
}
    `;

export const useCreateCreditOverrideMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateCreditOverrideMutation, TError, CreateCreditOverrideMutationVariables, TContext>) => {
    
    return useMutation<CreateCreditOverrideMutation, TError, CreateCreditOverrideMutationVariables, TContext>(
      {
    mutationKey: ['CreateCreditOverride'],
    mutationFn: (variables?: CreateCreditOverrideMutationVariables) => graphqlFetcher<CreateCreditOverrideMutation, CreateCreditOverrideMutationVariables>(CreateCreditOverrideDocument, variables)(),
    ...options
  }
    )};


useCreateCreditOverrideMutation.fetcher = (variables: CreateCreditOverrideMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateCreditOverrideMutation, CreateCreditOverrideMutationVariables>(CreateCreditOverrideDocument, variables, options);

export const RevertCreditOverrideDocument = `
    mutation RevertCreditOverride($overrideId: ID!) {
  revertCreditOverride(overrideId: $overrideId)
}
    `;

export const useRevertCreditOverrideMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RevertCreditOverrideMutation, TError, RevertCreditOverrideMutationVariables, TContext>) => {
    
    return useMutation<RevertCreditOverrideMutation, TError, RevertCreditOverrideMutationVariables, TContext>(
      {
    mutationKey: ['RevertCreditOverride'],
    mutationFn: (variables?: RevertCreditOverrideMutationVariables) => graphqlFetcher<RevertCreditOverrideMutation, RevertCreditOverrideMutationVariables>(RevertCreditOverrideDocument, variables)(),
    ...options
  }
    )};


useRevertCreditOverrideMutation.fetcher = (variables: RevertCreditOverrideMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<RevertCreditOverrideMutation, RevertCreditOverrideMutationVariables>(RevertCreditOverrideDocument, variables, options);

export const UpdateMemberCreditSettingsDocument = `
    mutation UpdateMemberCreditSettings($input: UpdateCreditSettingsInput!) {
  updateMemberCreditSettings(input: $input)
}
    `;

export const useUpdateMemberCreditSettingsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateMemberCreditSettingsMutation, TError, UpdateMemberCreditSettingsMutationVariables, TContext>) => {
    
    return useMutation<UpdateMemberCreditSettingsMutation, TError, UpdateMemberCreditSettingsMutationVariables, TContext>(
      {
    mutationKey: ['UpdateMemberCreditSettings'],
    mutationFn: (variables?: UpdateMemberCreditSettingsMutationVariables) => graphqlFetcher<UpdateMemberCreditSettingsMutation, UpdateMemberCreditSettingsMutationVariables>(UpdateMemberCreditSettingsDocument, variables)(),
    ...options
  }
    )};


useUpdateMemberCreditSettingsMutation.fetcher = (variables: UpdateMemberCreditSettingsMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateMemberCreditSettingsMutation, UpdateMemberCreditSettingsMutationVariables>(UpdateMemberCreditSettingsDocument, variables, options);

export const GetDiscountsDocument = `
    query GetDiscounts($first: Int, $skip: Int, $search: String, $type: DiscountType, $scope: DiscountScope, $isActive: Boolean, $sortBy: String, $sortOrder: String) {
  discounts(
    first: $first
    skip: $skip
    search: $search
    type: $type
    scope: $scope
    isActive: $isActive
    sortBy: $sortBy
    sortOrder: $sortOrder
  ) {
    edges {
      node {
        id
        clubId
        name
        code
        type
        value
        scope
        conditions {
          minimumAmount
          maximumDiscount
          membershipTypeIds
          playerTypes
        }
        validity {
          validFrom
          validTo
          usageLimit
          usageCount
        }
        approval {
          requiresApproval
          approvalThreshold
        }
        isActive
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

export const useGetDiscountsQuery = <
      TData = GetDiscountsQuery,
      TError = unknown
    >(
      variables?: GetDiscountsQueryVariables,
      options?: Omit<UseQueryOptions<GetDiscountsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetDiscountsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetDiscountsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetDiscounts'] : ['GetDiscounts', variables],
    queryFn: graphqlFetcher<GetDiscountsQuery, GetDiscountsQueryVariables>(GetDiscountsDocument, variables),
    ...options
  }
    )};

useGetDiscountsQuery.getKey = (variables?: GetDiscountsQueryVariables) => variables === undefined ? ['GetDiscounts'] : ['GetDiscounts', variables];

export const useInfiniteGetDiscountsQuery = <
      TData = InfiniteData<GetDiscountsQuery>,
      TError = unknown
    >(
      variables: GetDiscountsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetDiscountsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetDiscountsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetDiscountsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetDiscounts.infinite'] : ['GetDiscounts.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetDiscountsQuery, GetDiscountsQueryVariables>(GetDiscountsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetDiscountsQuery.getKey = (variables?: GetDiscountsQueryVariables) => variables === undefined ? ['GetDiscounts.infinite'] : ['GetDiscounts.infinite', variables];


useGetDiscountsQuery.fetcher = (variables?: GetDiscountsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetDiscountsQuery, GetDiscountsQueryVariables>(GetDiscountsDocument, variables, options);

export const GetActiveDiscountsDocument = `
    query GetActiveDiscounts {
  activeDiscounts {
    id
    name
    code
    type
    value
    scope
    conditions {
      minimumAmount
      maximumDiscount
      membershipTypeIds
      playerTypes
    }
    validity {
      validFrom
      validTo
      usageLimit
      usageCount
    }
    approval {
      requiresApproval
      approvalThreshold
    }
    isActive
  }
}
    `;

export const useGetActiveDiscountsQuery = <
      TData = GetActiveDiscountsQuery,
      TError = unknown
    >(
      variables?: GetActiveDiscountsQueryVariables,
      options?: Omit<UseQueryOptions<GetActiveDiscountsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetActiveDiscountsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetActiveDiscountsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetActiveDiscounts'] : ['GetActiveDiscounts', variables],
    queryFn: graphqlFetcher<GetActiveDiscountsQuery, GetActiveDiscountsQueryVariables>(GetActiveDiscountsDocument, variables),
    ...options
  }
    )};

useGetActiveDiscountsQuery.getKey = (variables?: GetActiveDiscountsQueryVariables) => variables === undefined ? ['GetActiveDiscounts'] : ['GetActiveDiscounts', variables];

export const useInfiniteGetActiveDiscountsQuery = <
      TData = InfiniteData<GetActiveDiscountsQuery>,
      TError = unknown
    >(
      variables: GetActiveDiscountsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetActiveDiscountsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetActiveDiscountsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetActiveDiscountsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetActiveDiscounts.infinite'] : ['GetActiveDiscounts.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetActiveDiscountsQuery, GetActiveDiscountsQueryVariables>(GetActiveDiscountsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetActiveDiscountsQuery.getKey = (variables?: GetActiveDiscountsQueryVariables) => variables === undefined ? ['GetActiveDiscounts.infinite'] : ['GetActiveDiscounts.infinite', variables];


useGetActiveDiscountsQuery.fetcher = (variables?: GetActiveDiscountsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetActiveDiscountsQuery, GetActiveDiscountsQueryVariables>(GetActiveDiscountsDocument, variables, options);

export const GetDiscountDocument = `
    query GetDiscount($id: ID!) {
  discount(id: $id) {
    id
    clubId
    name
    code
    type
    value
    scope
    conditions {
      minimumAmount
      maximumDiscount
      membershipTypeIds
      playerTypes
    }
    validity {
      validFrom
      validTo
      usageLimit
      usageCount
    }
    approval {
      requiresApproval
      approvalThreshold
    }
    isActive
    createdAt
    updatedAt
  }
}
    `;

export const useGetDiscountQuery = <
      TData = GetDiscountQuery,
      TError = unknown
    >(
      variables: GetDiscountQueryVariables,
      options?: Omit<UseQueryOptions<GetDiscountQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetDiscountQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetDiscountQuery, TError, TData>(
      {
    queryKey: ['GetDiscount', variables],
    queryFn: graphqlFetcher<GetDiscountQuery, GetDiscountQueryVariables>(GetDiscountDocument, variables),
    ...options
  }
    )};

useGetDiscountQuery.getKey = (variables: GetDiscountQueryVariables) => ['GetDiscount', variables];

export const useInfiniteGetDiscountQuery = <
      TData = InfiniteData<GetDiscountQuery>,
      TError = unknown
    >(
      variables: GetDiscountQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetDiscountQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetDiscountQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetDiscountQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetDiscount.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetDiscountQuery, GetDiscountQueryVariables>(GetDiscountDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetDiscountQuery.getKey = (variables: GetDiscountQueryVariables) => ['GetDiscount.infinite', variables];


useGetDiscountQuery.fetcher = (variables: GetDiscountQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetDiscountQuery, GetDiscountQueryVariables>(GetDiscountDocument, variables, options);

export const GetDiscountByCodeDocument = `
    query GetDiscountByCode($code: String!) {
  discountByCode(code: $code) {
    id
    name
    code
    type
    value
    scope
    conditions {
      minimumAmount
      maximumDiscount
      membershipTypeIds
      playerTypes
    }
    validity {
      validFrom
      validTo
      usageLimit
      usageCount
    }
    approval {
      requiresApproval
      approvalThreshold
    }
    isActive
  }
}
    `;

export const useGetDiscountByCodeQuery = <
      TData = GetDiscountByCodeQuery,
      TError = unknown
    >(
      variables: GetDiscountByCodeQueryVariables,
      options?: Omit<UseQueryOptions<GetDiscountByCodeQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetDiscountByCodeQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetDiscountByCodeQuery, TError, TData>(
      {
    queryKey: ['GetDiscountByCode', variables],
    queryFn: graphqlFetcher<GetDiscountByCodeQuery, GetDiscountByCodeQueryVariables>(GetDiscountByCodeDocument, variables),
    ...options
  }
    )};

useGetDiscountByCodeQuery.getKey = (variables: GetDiscountByCodeQueryVariables) => ['GetDiscountByCode', variables];

export const useInfiniteGetDiscountByCodeQuery = <
      TData = InfiniteData<GetDiscountByCodeQuery>,
      TError = unknown
    >(
      variables: GetDiscountByCodeQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetDiscountByCodeQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetDiscountByCodeQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetDiscountByCodeQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetDiscountByCode.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetDiscountByCodeQuery, GetDiscountByCodeQueryVariables>(GetDiscountByCodeDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetDiscountByCodeQuery.getKey = (variables: GetDiscountByCodeQueryVariables) => ['GetDiscountByCode.infinite', variables];


useGetDiscountByCodeQuery.fetcher = (variables: GetDiscountByCodeQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetDiscountByCodeQuery, GetDiscountByCodeQueryVariables>(GetDiscountByCodeDocument, variables, options);

export const ValidateDiscountDocument = `
    query ValidateDiscount($input: ValidateDiscountInput!) {
  validateDiscount(input: $input) {
    isValid
    message
    calculatedAmount
    requiresApproval
  }
}
    `;

export const useValidateDiscountQuery = <
      TData = ValidateDiscountQuery,
      TError = unknown
    >(
      variables: ValidateDiscountQueryVariables,
      options?: Omit<UseQueryOptions<ValidateDiscountQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<ValidateDiscountQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<ValidateDiscountQuery, TError, TData>(
      {
    queryKey: ['ValidateDiscount', variables],
    queryFn: graphqlFetcher<ValidateDiscountQuery, ValidateDiscountQueryVariables>(ValidateDiscountDocument, variables),
    ...options
  }
    )};

useValidateDiscountQuery.getKey = (variables: ValidateDiscountQueryVariables) => ['ValidateDiscount', variables];

export const useInfiniteValidateDiscountQuery = <
      TData = InfiniteData<ValidateDiscountQuery>,
      TError = unknown
    >(
      variables: ValidateDiscountQueryVariables,
      options: Omit<UseInfiniteQueryOptions<ValidateDiscountQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<ValidateDiscountQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<ValidateDiscountQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['ValidateDiscount.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<ValidateDiscountQuery, ValidateDiscountQueryVariables>(ValidateDiscountDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteValidateDiscountQuery.getKey = (variables: ValidateDiscountQueryVariables) => ['ValidateDiscount.infinite', variables];


useValidateDiscountQuery.fetcher = (variables: ValidateDiscountQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<ValidateDiscountQuery, ValidateDiscountQueryVariables>(ValidateDiscountDocument, variables, options);

export const GetLineItemDiscountsDocument = `
    query GetLineItemDiscounts($lineItemId: ID!) {
  lineItemDiscounts(lineItemId: $lineItemId) {
    id
    discountId
    lineItemId
    discountType
    discountValue
    calculatedAmount
    appliedBy
    approvedBy
    approvalNote
    createdAt
    discount {
      id
      name
      code
      type
      value
    }
  }
}
    `;

export const useGetLineItemDiscountsQuery = <
      TData = GetLineItemDiscountsQuery,
      TError = unknown
    >(
      variables: GetLineItemDiscountsQueryVariables,
      options?: Omit<UseQueryOptions<GetLineItemDiscountsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetLineItemDiscountsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetLineItemDiscountsQuery, TError, TData>(
      {
    queryKey: ['GetLineItemDiscounts', variables],
    queryFn: graphqlFetcher<GetLineItemDiscountsQuery, GetLineItemDiscountsQueryVariables>(GetLineItemDiscountsDocument, variables),
    ...options
  }
    )};

useGetLineItemDiscountsQuery.getKey = (variables: GetLineItemDiscountsQueryVariables) => ['GetLineItemDiscounts', variables];

export const useInfiniteGetLineItemDiscountsQuery = <
      TData = InfiniteData<GetLineItemDiscountsQuery>,
      TError = unknown
    >(
      variables: GetLineItemDiscountsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetLineItemDiscountsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetLineItemDiscountsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetLineItemDiscountsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetLineItemDiscounts.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetLineItemDiscountsQuery, GetLineItemDiscountsQueryVariables>(GetLineItemDiscountsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetLineItemDiscountsQuery.getKey = (variables: GetLineItemDiscountsQueryVariables) => ['GetLineItemDiscounts.infinite', variables];


useGetLineItemDiscountsQuery.fetcher = (variables: GetLineItemDiscountsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetLineItemDiscountsQuery, GetLineItemDiscountsQueryVariables>(GetLineItemDiscountsDocument, variables, options);

export const GetTransactionDiscountsDocument = `
    query GetTransactionDiscounts($transactionId: ID!) {
  transactionDiscounts(transactionId: $transactionId) {
    id
    discountId
    transactionId
    discountType
    discountValue
    calculatedAmount
    appliedBy
    approvedBy
    approvalNote
    createdAt
    discount {
      id
      name
      code
      type
      value
    }
  }
}
    `;

export const useGetTransactionDiscountsQuery = <
      TData = GetTransactionDiscountsQuery,
      TError = unknown
    >(
      variables: GetTransactionDiscountsQueryVariables,
      options?: Omit<UseQueryOptions<GetTransactionDiscountsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetTransactionDiscountsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetTransactionDiscountsQuery, TError, TData>(
      {
    queryKey: ['GetTransactionDiscounts', variables],
    queryFn: graphqlFetcher<GetTransactionDiscountsQuery, GetTransactionDiscountsQueryVariables>(GetTransactionDiscountsDocument, variables),
    ...options
  }
    )};

useGetTransactionDiscountsQuery.getKey = (variables: GetTransactionDiscountsQueryVariables) => ['GetTransactionDiscounts', variables];

export const useInfiniteGetTransactionDiscountsQuery = <
      TData = InfiniteData<GetTransactionDiscountsQuery>,
      TError = unknown
    >(
      variables: GetTransactionDiscountsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetTransactionDiscountsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetTransactionDiscountsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetTransactionDiscountsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetTransactionDiscounts.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetTransactionDiscountsQuery, GetTransactionDiscountsQueryVariables>(GetTransactionDiscountsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetTransactionDiscountsQuery.getKey = (variables: GetTransactionDiscountsQueryVariables) => ['GetTransactionDiscounts.infinite', variables];


useGetTransactionDiscountsQuery.fetcher = (variables: GetTransactionDiscountsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetTransactionDiscountsQuery, GetTransactionDiscountsQueryVariables>(GetTransactionDiscountsDocument, variables, options);

export const CreateDiscountDocument = `
    mutation CreateDiscount($input: CreateDiscountInput!) {
  createDiscount(input: $input) {
    id
    clubId
    name
    code
    type
    value
    scope
    conditions {
      minimumAmount
      maximumDiscount
      membershipTypeIds
      playerTypes
    }
    validity {
      validFrom
      validTo
      usageLimit
      usageCount
    }
    approval {
      requiresApproval
      approvalThreshold
    }
    isActive
    createdAt
    updatedAt
  }
}
    `;

export const useCreateDiscountMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateDiscountMutation, TError, CreateDiscountMutationVariables, TContext>) => {
    
    return useMutation<CreateDiscountMutation, TError, CreateDiscountMutationVariables, TContext>(
      {
    mutationKey: ['CreateDiscount'],
    mutationFn: (variables?: CreateDiscountMutationVariables) => graphqlFetcher<CreateDiscountMutation, CreateDiscountMutationVariables>(CreateDiscountDocument, variables)(),
    ...options
  }
    )};


useCreateDiscountMutation.fetcher = (variables: CreateDiscountMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateDiscountMutation, CreateDiscountMutationVariables>(CreateDiscountDocument, variables, options);

export const UpdateDiscountDocument = `
    mutation UpdateDiscount($id: ID!, $input: UpdateDiscountInput!) {
  updateDiscount(id: $id, input: $input) {
    id
    clubId
    name
    code
    type
    value
    scope
    conditions {
      minimumAmount
      maximumDiscount
      membershipTypeIds
      playerTypes
    }
    validity {
      validFrom
      validTo
      usageLimit
      usageCount
    }
    approval {
      requiresApproval
      approvalThreshold
    }
    isActive
    createdAt
    updatedAt
  }
}
    `;

export const useUpdateDiscountMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateDiscountMutation, TError, UpdateDiscountMutationVariables, TContext>) => {
    
    return useMutation<UpdateDiscountMutation, TError, UpdateDiscountMutationVariables, TContext>(
      {
    mutationKey: ['UpdateDiscount'],
    mutationFn: (variables?: UpdateDiscountMutationVariables) => graphqlFetcher<UpdateDiscountMutation, UpdateDiscountMutationVariables>(UpdateDiscountDocument, variables)(),
    ...options
  }
    )};


useUpdateDiscountMutation.fetcher = (variables: UpdateDiscountMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateDiscountMutation, UpdateDiscountMutationVariables>(UpdateDiscountDocument, variables, options);

export const DeleteDiscountDocument = `
    mutation DeleteDiscount($id: ID!) {
  deleteDiscount(id: $id)
}
    `;

export const useDeleteDiscountMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteDiscountMutation, TError, DeleteDiscountMutationVariables, TContext>) => {
    
    return useMutation<DeleteDiscountMutation, TError, DeleteDiscountMutationVariables, TContext>(
      {
    mutationKey: ['DeleteDiscount'],
    mutationFn: (variables?: DeleteDiscountMutationVariables) => graphqlFetcher<DeleteDiscountMutation, DeleteDiscountMutationVariables>(DeleteDiscountDocument, variables)(),
    ...options
  }
    )};


useDeleteDiscountMutation.fetcher = (variables: DeleteDiscountMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeleteDiscountMutation, DeleteDiscountMutationVariables>(DeleteDiscountDocument, variables, options);

export const ApplyDiscountDocument = `
    mutation ApplyDiscount($input: ApplyDiscountInput!) {
  applyDiscount(input: $input) {
    success
    message
    requiresApproval
    originalAmount
    discountedAmount
    savings
  }
}
    `;

export const useApplyDiscountMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ApplyDiscountMutation, TError, ApplyDiscountMutationVariables, TContext>) => {
    
    return useMutation<ApplyDiscountMutation, TError, ApplyDiscountMutationVariables, TContext>(
      {
    mutationKey: ['ApplyDiscount'],
    mutationFn: (variables?: ApplyDiscountMutationVariables) => graphqlFetcher<ApplyDiscountMutation, ApplyDiscountMutationVariables>(ApplyDiscountDocument, variables)(),
    ...options
  }
    )};


useApplyDiscountMutation.fetcher = (variables: ApplyDiscountMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ApplyDiscountMutation, ApplyDiscountMutationVariables>(ApplyDiscountDocument, variables, options);

export const ApplyDiscountByCodeDocument = `
    mutation ApplyDiscountByCode($input: ApplyDiscountByCodeInput!) {
  applyDiscountByCode(input: $input) {
    success
    message
    requiresApproval
    originalAmount
    discountedAmount
    savings
  }
}
    `;

export const useApplyDiscountByCodeMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ApplyDiscountByCodeMutation, TError, ApplyDiscountByCodeMutationVariables, TContext>) => {
    
    return useMutation<ApplyDiscountByCodeMutation, TError, ApplyDiscountByCodeMutationVariables, TContext>(
      {
    mutationKey: ['ApplyDiscountByCode'],
    mutationFn: (variables?: ApplyDiscountByCodeMutationVariables) => graphqlFetcher<ApplyDiscountByCodeMutation, ApplyDiscountByCodeMutationVariables>(ApplyDiscountByCodeDocument, variables)(),
    ...options
  }
    )};


useApplyDiscountByCodeMutation.fetcher = (variables: ApplyDiscountByCodeMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ApplyDiscountByCodeMutation, ApplyDiscountByCodeMutationVariables>(ApplyDiscountByCodeDocument, variables, options);

export const ApproveDiscountDocument = `
    mutation ApproveDiscount($input: ApproveDiscountInput!) {
  approveDiscount(input: $input) {
    id
    discountId
    discountType
    discountValue
    calculatedAmount
    appliedBy
    approvedBy
    approvalNote
    createdAt
  }
}
    `;

export const useApproveDiscountMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ApproveDiscountMutation, TError, ApproveDiscountMutationVariables, TContext>) => {
    
    return useMutation<ApproveDiscountMutation, TError, ApproveDiscountMutationVariables, TContext>(
      {
    mutationKey: ['ApproveDiscount'],
    mutationFn: (variables?: ApproveDiscountMutationVariables) => graphqlFetcher<ApproveDiscountMutation, ApproveDiscountMutationVariables>(ApproveDiscountDocument, variables)(),
    ...options
  }
    )};


useApproveDiscountMutation.fetcher = (variables: ApproveDiscountMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ApproveDiscountMutation, ApproveDiscountMutationVariables>(ApproveDiscountDocument, variables, options);

export const RemoveAppliedDiscountDocument = `
    mutation RemoveAppliedDiscount($appliedDiscountId: ID!) {
  removeAppliedDiscount(appliedDiscountId: $appliedDiscountId)
}
    `;

export const useRemoveAppliedDiscountMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RemoveAppliedDiscountMutation, TError, RemoveAppliedDiscountMutationVariables, TContext>) => {
    
    return useMutation<RemoveAppliedDiscountMutation, TError, RemoveAppliedDiscountMutationVariables, TContext>(
      {
    mutationKey: ['RemoveAppliedDiscount'],
    mutationFn: (variables?: RemoveAppliedDiscountMutationVariables) => graphqlFetcher<RemoveAppliedDiscountMutation, RemoveAppliedDiscountMutationVariables>(RemoveAppliedDiscountDocument, variables)(),
    ...options
  }
    )};


useRemoveAppliedDiscountMutation.fetcher = (variables: RemoveAppliedDiscountMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<RemoveAppliedDiscountMutation, RemoveAppliedDiscountMutationVariables>(RemoveAppliedDiscountDocument, variables, options);

export const GetTodaySettlementDocument = `
    query GetTodaySettlement {
  todaySettlement {
    id
    clubId
    businessDate
    status
    totalGrossSales
    totalDiscounts
    totalNetSales
    totalTax
    totalServiceCharge
    totalCash
    totalCard
    totalMemberAccount
    totalOther
    totalRefunds
    totalVoids
    expectedCash
    actualCash
    cashVariance
    transactionCount
    refundCount
    voidCount
    openedBy
    openedAt
    reviewedBy
    reviewedAt
    closedBy
    closedAt
    notes
    createdAt
    updatedAt
    exceptions {
      id
      type
      severity
      resolution
      description
      amount
      createdAt
    }
  }
}
    `;

export const useGetTodaySettlementQuery = <
      TData = GetTodaySettlementQuery,
      TError = unknown
    >(
      variables?: GetTodaySettlementQueryVariables,
      options?: Omit<UseQueryOptions<GetTodaySettlementQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetTodaySettlementQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetTodaySettlementQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetTodaySettlement'] : ['GetTodaySettlement', variables],
    queryFn: graphqlFetcher<GetTodaySettlementQuery, GetTodaySettlementQueryVariables>(GetTodaySettlementDocument, variables),
    ...options
  }
    )};

useGetTodaySettlementQuery.getKey = (variables?: GetTodaySettlementQueryVariables) => variables === undefined ? ['GetTodaySettlement'] : ['GetTodaySettlement', variables];

export const useInfiniteGetTodaySettlementQuery = <
      TData = InfiniteData<GetTodaySettlementQuery>,
      TError = unknown
    >(
      variables: GetTodaySettlementQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetTodaySettlementQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetTodaySettlementQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetTodaySettlementQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetTodaySettlement.infinite'] : ['GetTodaySettlement.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetTodaySettlementQuery, GetTodaySettlementQueryVariables>(GetTodaySettlementDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetTodaySettlementQuery.getKey = (variables?: GetTodaySettlementQueryVariables) => variables === undefined ? ['GetTodaySettlement.infinite'] : ['GetTodaySettlement.infinite', variables];


useGetTodaySettlementQuery.fetcher = (variables?: GetTodaySettlementQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetTodaySettlementQuery, GetTodaySettlementQueryVariables>(GetTodaySettlementDocument, variables, options);

export const GetSettlementDocument = `
    query GetSettlement($id: ID!) {
  settlement(id: $id) {
    id
    clubId
    businessDate
    status
    totalGrossSales
    totalDiscounts
    totalNetSales
    totalTax
    totalServiceCharge
    totalCash
    totalCard
    totalMemberAccount
    totalOther
    totalRefunds
    totalVoids
    expectedCash
    actualCash
    cashVariance
    transactionCount
    refundCount
    voidCount
    openedBy
    openedAt
    reviewedBy
    reviewedAt
    closedBy
    closedAt
    notes
    createdAt
    updatedAt
    exceptions {
      id
      type
      severity
      resolution
      description
      amount
      resolvedBy
      resolvedAt
      resolutionNote
      createdAt
    }
  }
}
    `;

export const useGetSettlementQuery = <
      TData = GetSettlementQuery,
      TError = unknown
    >(
      variables: GetSettlementQueryVariables,
      options?: Omit<UseQueryOptions<GetSettlementQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetSettlementQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetSettlementQuery, TError, TData>(
      {
    queryKey: ['GetSettlement', variables],
    queryFn: graphqlFetcher<GetSettlementQuery, GetSettlementQueryVariables>(GetSettlementDocument, variables),
    ...options
  }
    )};

useGetSettlementQuery.getKey = (variables: GetSettlementQueryVariables) => ['GetSettlement', variables];

export const useInfiniteGetSettlementQuery = <
      TData = InfiniteData<GetSettlementQuery>,
      TError = unknown
    >(
      variables: GetSettlementQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetSettlementQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetSettlementQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetSettlementQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetSettlement.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetSettlementQuery, GetSettlementQueryVariables>(GetSettlementDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetSettlementQuery.getKey = (variables: GetSettlementQueryVariables) => ['GetSettlement.infinite', variables];


useGetSettlementQuery.fetcher = (variables: GetSettlementQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetSettlementQuery, GetSettlementQueryVariables>(GetSettlementDocument, variables, options);

export const GetSettlementByDateDocument = `
    query GetSettlementByDate($date: DateTime!) {
  settlementByDate(date: $date) {
    id
    clubId
    businessDate
    status
    totalGrossSales
    totalNetSales
    totalCash
    totalCard
    totalMemberAccount
    expectedCash
    actualCash
    cashVariance
    transactionCount
    createdAt
    exceptions {
      id
      type
      severity
      resolution
    }
  }
}
    `;

export const useGetSettlementByDateQuery = <
      TData = GetSettlementByDateQuery,
      TError = unknown
    >(
      variables: GetSettlementByDateQueryVariables,
      options?: Omit<UseQueryOptions<GetSettlementByDateQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetSettlementByDateQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetSettlementByDateQuery, TError, TData>(
      {
    queryKey: ['GetSettlementByDate', variables],
    queryFn: graphqlFetcher<GetSettlementByDateQuery, GetSettlementByDateQueryVariables>(GetSettlementByDateDocument, variables),
    ...options
  }
    )};

useGetSettlementByDateQuery.getKey = (variables: GetSettlementByDateQueryVariables) => ['GetSettlementByDate', variables];

export const useInfiniteGetSettlementByDateQuery = <
      TData = InfiniteData<GetSettlementByDateQuery>,
      TError = unknown
    >(
      variables: GetSettlementByDateQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetSettlementByDateQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetSettlementByDateQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetSettlementByDateQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetSettlementByDate.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetSettlementByDateQuery, GetSettlementByDateQueryVariables>(GetSettlementByDateDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetSettlementByDateQuery.getKey = (variables: GetSettlementByDateQueryVariables) => ['GetSettlementByDate.infinite', variables];


useGetSettlementByDateQuery.fetcher = (variables: GetSettlementByDateQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetSettlementByDateQuery, GetSettlementByDateQueryVariables>(GetSettlementByDateDocument, variables, options);

export const GetSettlementsDocument = `
    query GetSettlements($input: GetSettlementsInput!) {
  settlements(input: $input) {
    id
    businessDate
    status
    totalGrossSales
    totalNetSales
    totalCash
    totalCard
    totalMemberAccount
    expectedCash
    actualCash
    cashVariance
    transactionCount
    closedAt
    exceptions {
      id
      type
      severity
      resolution
    }
  }
}
    `;

export const useGetSettlementsQuery = <
      TData = GetSettlementsQuery,
      TError = unknown
    >(
      variables: GetSettlementsQueryVariables,
      options?: Omit<UseQueryOptions<GetSettlementsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetSettlementsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetSettlementsQuery, TError, TData>(
      {
    queryKey: ['GetSettlements', variables],
    queryFn: graphqlFetcher<GetSettlementsQuery, GetSettlementsQueryVariables>(GetSettlementsDocument, variables),
    ...options
  }
    )};

useGetSettlementsQuery.getKey = (variables: GetSettlementsQueryVariables) => ['GetSettlements', variables];

export const useInfiniteGetSettlementsQuery = <
      TData = InfiniteData<GetSettlementsQuery>,
      TError = unknown
    >(
      variables: GetSettlementsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetSettlementsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetSettlementsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetSettlementsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetSettlements.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetSettlementsQuery, GetSettlementsQueryVariables>(GetSettlementsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetSettlementsQuery.getKey = (variables: GetSettlementsQueryVariables) => ['GetSettlements.infinite', variables];


useGetSettlementsQuery.fetcher = (variables: GetSettlementsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetSettlementsQuery, GetSettlementsQueryVariables>(GetSettlementsDocument, variables, options);

export const GetSettlementSummaryDocument = `
    query GetSettlementSummary($settlementId: ID!) {
  settlementSummary(settlementId: $settlementId) {
    settlementId
    businessDate
    status
    totalGrossSales
    totalNetSales
    totalCash
    totalCard
    totalMemberAccount
    expectedCash
    actualCash
    cashVariance
    exceptionCount
    unresolvedExceptionCount
  }
}
    `;

export const useGetSettlementSummaryQuery = <
      TData = GetSettlementSummaryQuery,
      TError = unknown
    >(
      variables: GetSettlementSummaryQueryVariables,
      options?: Omit<UseQueryOptions<GetSettlementSummaryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetSettlementSummaryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetSettlementSummaryQuery, TError, TData>(
      {
    queryKey: ['GetSettlementSummary', variables],
    queryFn: graphqlFetcher<GetSettlementSummaryQuery, GetSettlementSummaryQueryVariables>(GetSettlementSummaryDocument, variables),
    ...options
  }
    )};

useGetSettlementSummaryQuery.getKey = (variables: GetSettlementSummaryQueryVariables) => ['GetSettlementSummary', variables];

export const useInfiniteGetSettlementSummaryQuery = <
      TData = InfiniteData<GetSettlementSummaryQuery>,
      TError = unknown
    >(
      variables: GetSettlementSummaryQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetSettlementSummaryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetSettlementSummaryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetSettlementSummaryQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetSettlementSummary.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetSettlementSummaryQuery, GetSettlementSummaryQueryVariables>(GetSettlementSummaryDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetSettlementSummaryQuery.getKey = (variables: GetSettlementSummaryQueryVariables) => ['GetSettlementSummary.infinite', variables];


useGetSettlementSummaryQuery.fetcher = (variables: GetSettlementSummaryQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetSettlementSummaryQuery, GetSettlementSummaryQueryVariables>(GetSettlementSummaryDocument, variables, options);

export const GetSettlementExceptionsDocument = `
    query GetSettlementExceptions($settlementId: ID!, $pendingOnly: Boolean) {
  settlementExceptions(settlementId: $settlementId, pendingOnly: $pendingOnly) {
    id
    settlementId
    type
    severity
    resolution
    description
    amount
    transactionId
    shiftId
    lineItemId
    resolvedBy
    resolvedAt
    resolutionNote
    createdAt
    updatedAt
  }
}
    `;

export const useGetSettlementExceptionsQuery = <
      TData = GetSettlementExceptionsQuery,
      TError = unknown
    >(
      variables: GetSettlementExceptionsQueryVariables,
      options?: Omit<UseQueryOptions<GetSettlementExceptionsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetSettlementExceptionsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetSettlementExceptionsQuery, TError, TData>(
      {
    queryKey: ['GetSettlementExceptions', variables],
    queryFn: graphqlFetcher<GetSettlementExceptionsQuery, GetSettlementExceptionsQueryVariables>(GetSettlementExceptionsDocument, variables),
    ...options
  }
    )};

useGetSettlementExceptionsQuery.getKey = (variables: GetSettlementExceptionsQueryVariables) => ['GetSettlementExceptions', variables];

export const useInfiniteGetSettlementExceptionsQuery = <
      TData = InfiniteData<GetSettlementExceptionsQuery>,
      TError = unknown
    >(
      variables: GetSettlementExceptionsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetSettlementExceptionsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetSettlementExceptionsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetSettlementExceptionsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetSettlementExceptions.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetSettlementExceptionsQuery, GetSettlementExceptionsQueryVariables>(GetSettlementExceptionsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetSettlementExceptionsQuery.getKey = (variables: GetSettlementExceptionsQueryVariables) => ['GetSettlementExceptions.infinite', variables];


useGetSettlementExceptionsQuery.fetcher = (variables: GetSettlementExceptionsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetSettlementExceptionsQuery, GetSettlementExceptionsQueryVariables>(GetSettlementExceptionsDocument, variables, options);

export const OpenDayDocument = `
    mutation OpenDay($input: OpenDayInput!) {
  openDay(input: $input) {
    id
    clubId
    businessDate
    status
    openedBy
    openedAt
  }
}
    `;

export const useOpenDayMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<OpenDayMutation, TError, OpenDayMutationVariables, TContext>) => {
    
    return useMutation<OpenDayMutation, TError, OpenDayMutationVariables, TContext>(
      {
    mutationKey: ['OpenDay'],
    mutationFn: (variables?: OpenDayMutationVariables) => graphqlFetcher<OpenDayMutation, OpenDayMutationVariables>(OpenDayDocument, variables)(),
    ...options
  }
    )};


useOpenDayMutation.fetcher = (variables: OpenDayMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<OpenDayMutation, OpenDayMutationVariables>(OpenDayDocument, variables, options);

export const SubmitSettlementForReviewDocument = `
    mutation SubmitSettlementForReview($settlementId: ID!) {
  submitSettlementForReview(settlementId: $settlementId) {
    id
    status
    reviewedBy
    reviewedAt
  }
}
    `;

export const useSubmitSettlementForReviewMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<SubmitSettlementForReviewMutation, TError, SubmitSettlementForReviewMutationVariables, TContext>) => {
    
    return useMutation<SubmitSettlementForReviewMutation, TError, SubmitSettlementForReviewMutationVariables, TContext>(
      {
    mutationKey: ['SubmitSettlementForReview'],
    mutationFn: (variables?: SubmitSettlementForReviewMutationVariables) => graphqlFetcher<SubmitSettlementForReviewMutation, SubmitSettlementForReviewMutationVariables>(SubmitSettlementForReviewDocument, variables)(),
    ...options
  }
    )};


useSubmitSettlementForReviewMutation.fetcher = (variables: SubmitSettlementForReviewMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<SubmitSettlementForReviewMutation, SubmitSettlementForReviewMutationVariables>(SubmitSettlementForReviewDocument, variables, options);

export const CloseSettlementDocument = `
    mutation CloseSettlement($input: CloseSettlementInput!) {
  closeSettlement(input: $input) {
    id
    status
    closedBy
    closedAt
    notes
  }
}
    `;

export const useCloseSettlementMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CloseSettlementMutation, TError, CloseSettlementMutationVariables, TContext>) => {
    
    return useMutation<CloseSettlementMutation, TError, CloseSettlementMutationVariables, TContext>(
      {
    mutationKey: ['CloseSettlement'],
    mutationFn: (variables?: CloseSettlementMutationVariables) => graphqlFetcher<CloseSettlementMutation, CloseSettlementMutationVariables>(CloseSettlementDocument, variables)(),
    ...options
  }
    )};


useCloseSettlementMutation.fetcher = (variables: CloseSettlementMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CloseSettlementMutation, CloseSettlementMutationVariables>(CloseSettlementDocument, variables, options);

export const ReopenSettlementDocument = `
    mutation ReopenSettlement($input: ReopenSettlementInput!) {
  reopenSettlement(input: $input) {
    id
    status
  }
}
    `;

export const useReopenSettlementMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ReopenSettlementMutation, TError, ReopenSettlementMutationVariables, TContext>) => {
    
    return useMutation<ReopenSettlementMutation, TError, ReopenSettlementMutationVariables, TContext>(
      {
    mutationKey: ['ReopenSettlement'],
    mutationFn: (variables?: ReopenSettlementMutationVariables) => graphqlFetcher<ReopenSettlementMutation, ReopenSettlementMutationVariables>(ReopenSettlementDocument, variables)(),
    ...options
  }
    )};


useReopenSettlementMutation.fetcher = (variables: ReopenSettlementMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ReopenSettlementMutation, ReopenSettlementMutationVariables>(ReopenSettlementDocument, variables, options);

export const UpdateSettlementTotalsDocument = `
    mutation UpdateSettlementTotals($input: UpdateSettlementTotalsInput!) {
  updateSettlementTotals(input: $input) {
    id
    totalGrossSales
    totalDiscounts
    totalNetSales
    totalTax
    totalServiceCharge
    totalCash
    totalCard
    totalMemberAccount
    totalOther
    totalRefunds
    totalVoids
    expectedCash
    transactionCount
    refundCount
    voidCount
  }
}
    `;

export const useUpdateSettlementTotalsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateSettlementTotalsMutation, TError, UpdateSettlementTotalsMutationVariables, TContext>) => {
    
    return useMutation<UpdateSettlementTotalsMutation, TError, UpdateSettlementTotalsMutationVariables, TContext>(
      {
    mutationKey: ['UpdateSettlementTotals'],
    mutationFn: (variables?: UpdateSettlementTotalsMutationVariables) => graphqlFetcher<UpdateSettlementTotalsMutation, UpdateSettlementTotalsMutationVariables>(UpdateSettlementTotalsDocument, variables)(),
    ...options
  }
    )};


useUpdateSettlementTotalsMutation.fetcher = (variables: UpdateSettlementTotalsMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateSettlementTotalsMutation, UpdateSettlementTotalsMutationVariables>(UpdateSettlementTotalsDocument, variables, options);

export const RecordCashCountDocument = `
    mutation RecordCashCount($input: RecordCashCountInput!) {
  recordCashCount(input: $input) {
    id
    actualCash
    cashVariance
    exceptions {
      id
      type
      severity
      description
      amount
    }
  }
}
    `;

export const useRecordCashCountMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RecordCashCountMutation, TError, RecordCashCountMutationVariables, TContext>) => {
    
    return useMutation<RecordCashCountMutation, TError, RecordCashCountMutationVariables, TContext>(
      {
    mutationKey: ['RecordCashCount'],
    mutationFn: (variables?: RecordCashCountMutationVariables) => graphqlFetcher<RecordCashCountMutation, RecordCashCountMutationVariables>(RecordCashCountDocument, variables)(),
    ...options
  }
    )};


useRecordCashCountMutation.fetcher = (variables: RecordCashCountMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<RecordCashCountMutation, RecordCashCountMutationVariables>(RecordCashCountDocument, variables, options);

export const RecalculateSettlementTotalsDocument = `
    mutation RecalculateSettlementTotals($settlementId: ID!) {
  recalculateSettlementTotals(settlementId: $settlementId) {
    id
    totalGrossSales
    totalNetSales
    totalCash
    totalCard
    totalMemberAccount
    totalOther
    totalRefunds
    totalVoids
    expectedCash
    transactionCount
    refundCount
    voidCount
  }
}
    `;

export const useRecalculateSettlementTotalsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RecalculateSettlementTotalsMutation, TError, RecalculateSettlementTotalsMutationVariables, TContext>) => {
    
    return useMutation<RecalculateSettlementTotalsMutation, TError, RecalculateSettlementTotalsMutationVariables, TContext>(
      {
    mutationKey: ['RecalculateSettlementTotals'],
    mutationFn: (variables?: RecalculateSettlementTotalsMutationVariables) => graphqlFetcher<RecalculateSettlementTotalsMutation, RecalculateSettlementTotalsMutationVariables>(RecalculateSettlementTotalsDocument, variables)(),
    ...options
  }
    )};


useRecalculateSettlementTotalsMutation.fetcher = (variables: RecalculateSettlementTotalsMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<RecalculateSettlementTotalsMutation, RecalculateSettlementTotalsMutationVariables>(RecalculateSettlementTotalsDocument, variables, options);

export const CreateSettlementExceptionDocument = `
    mutation CreateSettlementException($input: CreateExceptionInput!) {
  createSettlementException(input: $input) {
    id
    settlementId
    type
    severity
    resolution
    description
    amount
    createdAt
  }
}
    `;

export const useCreateSettlementExceptionMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateSettlementExceptionMutation, TError, CreateSettlementExceptionMutationVariables, TContext>) => {
    
    return useMutation<CreateSettlementExceptionMutation, TError, CreateSettlementExceptionMutationVariables, TContext>(
      {
    mutationKey: ['CreateSettlementException'],
    mutationFn: (variables?: CreateSettlementExceptionMutationVariables) => graphqlFetcher<CreateSettlementExceptionMutation, CreateSettlementExceptionMutationVariables>(CreateSettlementExceptionDocument, variables)(),
    ...options
  }
    )};


useCreateSettlementExceptionMutation.fetcher = (variables: CreateSettlementExceptionMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateSettlementExceptionMutation, CreateSettlementExceptionMutationVariables>(CreateSettlementExceptionDocument, variables, options);

export const ResolveSettlementExceptionDocument = `
    mutation ResolveSettlementException($input: ResolveExceptionInput!) {
  resolveSettlementException(input: $input) {
    id
    resolution
    resolvedBy
    resolvedAt
    resolutionNote
  }
}
    `;

export const useResolveSettlementExceptionMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ResolveSettlementExceptionMutation, TError, ResolveSettlementExceptionMutationVariables, TContext>) => {
    
    return useMutation<ResolveSettlementExceptionMutation, TError, ResolveSettlementExceptionMutationVariables, TContext>(
      {
    mutationKey: ['ResolveSettlementException'],
    mutationFn: (variables?: ResolveSettlementExceptionMutationVariables) => graphqlFetcher<ResolveSettlementExceptionMutation, ResolveSettlementExceptionMutationVariables>(ResolveSettlementExceptionDocument, variables)(),
    ...options
  }
    )};


useResolveSettlementExceptionMutation.fetcher = (variables: ResolveSettlementExceptionMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ResolveSettlementExceptionMutation, ResolveSettlementExceptionMutationVariables>(ResolveSettlementExceptionDocument, variables, options);

export const GetEquipmentCategoriesDocument = `
    query GetEquipmentCategories($filter: EquipmentCategoryFilterInput) {
  equipmentCategories(filter: $filter) {
    id
    code
    name
    description
    icon
    color
    attachmentType
    operationType
    defaultRentalRate
    requiresDeposit
    depositAmount
    sortOrder
    isActive
    equipmentCount
    availableCount
  }
}
    `;

export const useGetEquipmentCategoriesQuery = <
      TData = GetEquipmentCategoriesQuery,
      TError = unknown
    >(
      variables?: GetEquipmentCategoriesQueryVariables,
      options?: Omit<UseQueryOptions<GetEquipmentCategoriesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetEquipmentCategoriesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetEquipmentCategoriesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetEquipmentCategories'] : ['GetEquipmentCategories', variables],
    queryFn: graphqlFetcher<GetEquipmentCategoriesQuery, GetEquipmentCategoriesQueryVariables>(GetEquipmentCategoriesDocument, variables),
    ...options
  }
    )};

useGetEquipmentCategoriesQuery.getKey = (variables?: GetEquipmentCategoriesQueryVariables) => variables === undefined ? ['GetEquipmentCategories'] : ['GetEquipmentCategories', variables];

export const useInfiniteGetEquipmentCategoriesQuery = <
      TData = InfiniteData<GetEquipmentCategoriesQuery>,
      TError = unknown
    >(
      variables: GetEquipmentCategoriesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetEquipmentCategoriesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetEquipmentCategoriesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetEquipmentCategoriesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetEquipmentCategories.infinite'] : ['GetEquipmentCategories.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetEquipmentCategoriesQuery, GetEquipmentCategoriesQueryVariables>(GetEquipmentCategoriesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetEquipmentCategoriesQuery.getKey = (variables?: GetEquipmentCategoriesQueryVariables) => variables === undefined ? ['GetEquipmentCategories.infinite'] : ['GetEquipmentCategories.infinite', variables];


useGetEquipmentCategoriesQuery.fetcher = (variables?: GetEquipmentCategoriesQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetEquipmentCategoriesQuery, GetEquipmentCategoriesQueryVariables>(GetEquipmentCategoriesDocument, variables, options);

export const GetEquipmentCategoryDocument = `
    query GetEquipmentCategory($id: ID!) {
  equipmentCategory(id: $id) {
    id
    code
    name
    description
    icon
    color
    attachmentType
    operationType
    defaultRentalRate
    requiresDeposit
    depositAmount
    sortOrder
    isActive
    equipmentCount
    availableCount
  }
}
    `;

export const useGetEquipmentCategoryQuery = <
      TData = GetEquipmentCategoryQuery,
      TError = unknown
    >(
      variables: GetEquipmentCategoryQueryVariables,
      options?: Omit<UseQueryOptions<GetEquipmentCategoryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetEquipmentCategoryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetEquipmentCategoryQuery, TError, TData>(
      {
    queryKey: ['GetEquipmentCategory', variables],
    queryFn: graphqlFetcher<GetEquipmentCategoryQuery, GetEquipmentCategoryQueryVariables>(GetEquipmentCategoryDocument, variables),
    ...options
  }
    )};

useGetEquipmentCategoryQuery.getKey = (variables: GetEquipmentCategoryQueryVariables) => ['GetEquipmentCategory', variables];

export const useInfiniteGetEquipmentCategoryQuery = <
      TData = InfiniteData<GetEquipmentCategoryQuery>,
      TError = unknown
    >(
      variables: GetEquipmentCategoryQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetEquipmentCategoryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetEquipmentCategoryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetEquipmentCategoryQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetEquipmentCategory.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetEquipmentCategoryQuery, GetEquipmentCategoryQueryVariables>(GetEquipmentCategoryDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetEquipmentCategoryQuery.getKey = (variables: GetEquipmentCategoryQueryVariables) => ['GetEquipmentCategory.infinite', variables];


useGetEquipmentCategoryQuery.fetcher = (variables: GetEquipmentCategoryQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetEquipmentCategoryQuery, GetEquipmentCategoryQueryVariables>(GetEquipmentCategoryDocument, variables, options);

export const GetEquipmentDocument = `
    query GetEquipment($filter: EquipmentFilterInput) {
  equipment(filter: $filter) {
    id
    assetNumber
    name
    serialNumber
    manufacturer
    model
    condition
    status
    location
    notes
    purchaseDate
    warrantyExpiry
    lastMaintenanceAt
    nextMaintenanceAt
    category {
      id
      code
      name
      icon
      color
      attachmentType
    }
    currentAssignment {
      id
      assignedAt
      member {
        id
        memberId
        firstName
        lastName
        avatarUrl
      }
      bookingNumber
    }
  }
}
    `;

export const useGetEquipmentQuery = <
      TData = GetEquipmentQuery,
      TError = unknown
    >(
      variables?: GetEquipmentQueryVariables,
      options?: Omit<UseQueryOptions<GetEquipmentQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetEquipmentQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetEquipmentQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetEquipment'] : ['GetEquipment', variables],
    queryFn: graphqlFetcher<GetEquipmentQuery, GetEquipmentQueryVariables>(GetEquipmentDocument, variables),
    ...options
  }
    )};

useGetEquipmentQuery.getKey = (variables?: GetEquipmentQueryVariables) => variables === undefined ? ['GetEquipment'] : ['GetEquipment', variables];

export const useInfiniteGetEquipmentQuery = <
      TData = InfiniteData<GetEquipmentQuery>,
      TError = unknown
    >(
      variables: GetEquipmentQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetEquipmentQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetEquipmentQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetEquipmentQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetEquipment.infinite'] : ['GetEquipment.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetEquipmentQuery, GetEquipmentQueryVariables>(GetEquipmentDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetEquipmentQuery.getKey = (variables?: GetEquipmentQueryVariables) => variables === undefined ? ['GetEquipment.infinite'] : ['GetEquipment.infinite', variables];


useGetEquipmentQuery.fetcher = (variables?: GetEquipmentQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetEquipmentQuery, GetEquipmentQueryVariables>(GetEquipmentDocument, variables, options);

export const GetEquipmentItemDocument = `
    query GetEquipmentItem($id: ID!) {
  equipmentItem(id: $id) {
    id
    assetNumber
    name
    serialNumber
    manufacturer
    model
    condition
    status
    location
    notes
    purchaseDate
    warrantyExpiry
    lastMaintenanceAt
    nextMaintenanceAt
    category {
      id
      code
      name
      icon
      color
      attachmentType
      defaultRentalRate
      requiresDeposit
      depositAmount
    }
    currentAssignment {
      id
      assignedAt
      returnedAt
      rentalFee
      conditionAtCheckout
      notes
      member {
        id
        memberId
        firstName
        lastName
        avatarUrl
      }
      bookingNumber
    }
  }
}
    `;

export const useGetEquipmentItemQuery = <
      TData = GetEquipmentItemQuery,
      TError = unknown
    >(
      variables: GetEquipmentItemQueryVariables,
      options?: Omit<UseQueryOptions<GetEquipmentItemQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetEquipmentItemQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetEquipmentItemQuery, TError, TData>(
      {
    queryKey: ['GetEquipmentItem', variables],
    queryFn: graphqlFetcher<GetEquipmentItemQuery, GetEquipmentItemQueryVariables>(GetEquipmentItemDocument, variables),
    ...options
  }
    )};

useGetEquipmentItemQuery.getKey = (variables: GetEquipmentItemQueryVariables) => ['GetEquipmentItem', variables];

export const useInfiniteGetEquipmentItemQuery = <
      TData = InfiniteData<GetEquipmentItemQuery>,
      TError = unknown
    >(
      variables: GetEquipmentItemQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetEquipmentItemQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetEquipmentItemQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetEquipmentItemQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetEquipmentItem.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetEquipmentItemQuery, GetEquipmentItemQueryVariables>(GetEquipmentItemDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetEquipmentItemQuery.getKey = (variables: GetEquipmentItemQueryVariables) => ['GetEquipmentItem.infinite', variables];


useGetEquipmentItemQuery.fetcher = (variables: GetEquipmentItemQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetEquipmentItemQuery, GetEquipmentItemQueryVariables>(GetEquipmentItemDocument, variables, options);

export const GetEquipmentAvailabilityDocument = `
    query GetEquipmentAvailability($input: EquipmentAvailabilityInput!) {
  equipmentAvailability(input: $input) {
    id
    assetNumber
    name
    condition
    status
    category {
      id
      name
      icon
      color
      defaultRentalRate
    }
  }
}
    `;

export const useGetEquipmentAvailabilityQuery = <
      TData = GetEquipmentAvailabilityQuery,
      TError = unknown
    >(
      variables: GetEquipmentAvailabilityQueryVariables,
      options?: Omit<UseQueryOptions<GetEquipmentAvailabilityQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetEquipmentAvailabilityQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetEquipmentAvailabilityQuery, TError, TData>(
      {
    queryKey: ['GetEquipmentAvailability', variables],
    queryFn: graphqlFetcher<GetEquipmentAvailabilityQuery, GetEquipmentAvailabilityQueryVariables>(GetEquipmentAvailabilityDocument, variables),
    ...options
  }
    )};

useGetEquipmentAvailabilityQuery.getKey = (variables: GetEquipmentAvailabilityQueryVariables) => ['GetEquipmentAvailability', variables];

export const useInfiniteGetEquipmentAvailabilityQuery = <
      TData = InfiniteData<GetEquipmentAvailabilityQuery>,
      TError = unknown
    >(
      variables: GetEquipmentAvailabilityQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetEquipmentAvailabilityQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetEquipmentAvailabilityQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetEquipmentAvailabilityQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetEquipmentAvailability.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetEquipmentAvailabilityQuery, GetEquipmentAvailabilityQueryVariables>(GetEquipmentAvailabilityDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetEquipmentAvailabilityQuery.getKey = (variables: GetEquipmentAvailabilityQueryVariables) => ['GetEquipmentAvailability.infinite', variables];


useGetEquipmentAvailabilityQuery.fetcher = (variables: GetEquipmentAvailabilityQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetEquipmentAvailabilityQuery, GetEquipmentAvailabilityQueryVariables>(GetEquipmentAvailabilityDocument, variables, options);

export const CreateEquipmentCategoryDocument = `
    mutation CreateEquipmentCategory($input: CreateEquipmentCategoryInput!) {
  createEquipmentCategory(input: $input) {
    success
    error
    category {
      id
      code
      name
      description
      icon
      color
      attachmentType
      defaultRentalRate
      requiresDeposit
      depositAmount
      sortOrder
      isActive
    }
  }
}
    `;

export const useCreateEquipmentCategoryMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateEquipmentCategoryMutation, TError, CreateEquipmentCategoryMutationVariables, TContext>) => {
    
    return useMutation<CreateEquipmentCategoryMutation, TError, CreateEquipmentCategoryMutationVariables, TContext>(
      {
    mutationKey: ['CreateEquipmentCategory'],
    mutationFn: (variables?: CreateEquipmentCategoryMutationVariables) => graphqlFetcher<CreateEquipmentCategoryMutation, CreateEquipmentCategoryMutationVariables>(CreateEquipmentCategoryDocument, variables)(),
    ...options
  }
    )};


useCreateEquipmentCategoryMutation.fetcher = (variables: CreateEquipmentCategoryMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateEquipmentCategoryMutation, CreateEquipmentCategoryMutationVariables>(CreateEquipmentCategoryDocument, variables, options);

export const UpdateEquipmentCategoryDocument = `
    mutation UpdateEquipmentCategory($input: UpdateEquipmentCategoryInput!) {
  updateEquipmentCategory(input: $input) {
    success
    error
    category {
      id
      code
      name
      description
      icon
      color
      attachmentType
      defaultRentalRate
      requiresDeposit
      depositAmount
      sortOrder
      isActive
    }
  }
}
    `;

export const useUpdateEquipmentCategoryMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateEquipmentCategoryMutation, TError, UpdateEquipmentCategoryMutationVariables, TContext>) => {
    
    return useMutation<UpdateEquipmentCategoryMutation, TError, UpdateEquipmentCategoryMutationVariables, TContext>(
      {
    mutationKey: ['UpdateEquipmentCategory'],
    mutationFn: (variables?: UpdateEquipmentCategoryMutationVariables) => graphqlFetcher<UpdateEquipmentCategoryMutation, UpdateEquipmentCategoryMutationVariables>(UpdateEquipmentCategoryDocument, variables)(),
    ...options
  }
    )};


useUpdateEquipmentCategoryMutation.fetcher = (variables: UpdateEquipmentCategoryMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateEquipmentCategoryMutation, UpdateEquipmentCategoryMutationVariables>(UpdateEquipmentCategoryDocument, variables, options);

export const DeleteEquipmentCategoryDocument = `
    mutation DeleteEquipmentCategory($id: ID!) {
  deleteEquipmentCategory(id: $id) {
    success
    error
    message
  }
}
    `;

export const useDeleteEquipmentCategoryMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteEquipmentCategoryMutation, TError, DeleteEquipmentCategoryMutationVariables, TContext>) => {
    
    return useMutation<DeleteEquipmentCategoryMutation, TError, DeleteEquipmentCategoryMutationVariables, TContext>(
      {
    mutationKey: ['DeleteEquipmentCategory'],
    mutationFn: (variables?: DeleteEquipmentCategoryMutationVariables) => graphqlFetcher<DeleteEquipmentCategoryMutation, DeleteEquipmentCategoryMutationVariables>(DeleteEquipmentCategoryDocument, variables)(),
    ...options
  }
    )};


useDeleteEquipmentCategoryMutation.fetcher = (variables: DeleteEquipmentCategoryMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeleteEquipmentCategoryMutation, DeleteEquipmentCategoryMutationVariables>(DeleteEquipmentCategoryDocument, variables, options);

export const CreateEquipmentDocument = `
    mutation CreateEquipment($input: CreateEquipmentInput!) {
  createEquipment(input: $input) {
    success
    error
    equipment {
      id
      assetNumber
      name
      serialNumber
      manufacturer
      model
      condition
      status
      location
      notes
      category {
        id
        name
      }
    }
  }
}
    `;

export const useCreateEquipmentMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateEquipmentMutation, TError, CreateEquipmentMutationVariables, TContext>) => {
    
    return useMutation<CreateEquipmentMutation, TError, CreateEquipmentMutationVariables, TContext>(
      {
    mutationKey: ['CreateEquipment'],
    mutationFn: (variables?: CreateEquipmentMutationVariables) => graphqlFetcher<CreateEquipmentMutation, CreateEquipmentMutationVariables>(CreateEquipmentDocument, variables)(),
    ...options
  }
    )};


useCreateEquipmentMutation.fetcher = (variables: CreateEquipmentMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateEquipmentMutation, CreateEquipmentMutationVariables>(CreateEquipmentDocument, variables, options);

export const UpdateEquipmentDocument = `
    mutation UpdateEquipment($input: UpdateEquipmentInput!) {
  updateEquipment(input: $input) {
    success
    error
    equipment {
      id
      assetNumber
      name
      serialNumber
      manufacturer
      model
      condition
      status
      location
      notes
      category {
        id
        name
      }
    }
  }
}
    `;

export const useUpdateEquipmentMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateEquipmentMutation, TError, UpdateEquipmentMutationVariables, TContext>) => {
    
    return useMutation<UpdateEquipmentMutation, TError, UpdateEquipmentMutationVariables, TContext>(
      {
    mutationKey: ['UpdateEquipment'],
    mutationFn: (variables?: UpdateEquipmentMutationVariables) => graphqlFetcher<UpdateEquipmentMutation, UpdateEquipmentMutationVariables>(UpdateEquipmentDocument, variables)(),
    ...options
  }
    )};


useUpdateEquipmentMutation.fetcher = (variables: UpdateEquipmentMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateEquipmentMutation, UpdateEquipmentMutationVariables>(UpdateEquipmentDocument, variables, options);

export const UpdateEquipmentStatusDocument = `
    mutation UpdateEquipmentStatus($input: UpdateEquipmentStatusInput!) {
  updateEquipmentStatus(input: $input) {
    success
    error
    equipment {
      id
      status
    }
  }
}
    `;

export const useUpdateEquipmentStatusMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateEquipmentStatusMutation, TError, UpdateEquipmentStatusMutationVariables, TContext>) => {
    
    return useMutation<UpdateEquipmentStatusMutation, TError, UpdateEquipmentStatusMutationVariables, TContext>(
      {
    mutationKey: ['UpdateEquipmentStatus'],
    mutationFn: (variables?: UpdateEquipmentStatusMutationVariables) => graphqlFetcher<UpdateEquipmentStatusMutation, UpdateEquipmentStatusMutationVariables>(UpdateEquipmentStatusDocument, variables)(),
    ...options
  }
    )};


useUpdateEquipmentStatusMutation.fetcher = (variables: UpdateEquipmentStatusMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateEquipmentStatusMutation, UpdateEquipmentStatusMutationVariables>(UpdateEquipmentStatusDocument, variables, options);

export const DeleteEquipmentDocument = `
    mutation DeleteEquipment($id: ID!) {
  deleteEquipment(id: $id) {
    success
    error
    message
  }
}
    `;

export const useDeleteEquipmentMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteEquipmentMutation, TError, DeleteEquipmentMutationVariables, TContext>) => {
    
    return useMutation<DeleteEquipmentMutation, TError, DeleteEquipmentMutationVariables, TContext>(
      {
    mutationKey: ['DeleteEquipment'],
    mutationFn: (variables?: DeleteEquipmentMutationVariables) => graphqlFetcher<DeleteEquipmentMutation, DeleteEquipmentMutationVariables>(DeleteEquipmentDocument, variables)(),
    ...options
  }
    )};


useDeleteEquipmentMutation.fetcher = (variables: DeleteEquipmentMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeleteEquipmentMutation, DeleteEquipmentMutationVariables>(DeleteEquipmentDocument, variables, options);

export const AssignEquipmentDocument = `
    mutation AssignEquipment($input: AssignEquipmentInput!) {
  assignEquipment(input: $input) {
    success
    error
    assignment {
      id
      assignedAt
      rentalFee
      conditionAtCheckout
      notes
      member {
        id
        memberId
        firstName
        lastName
      }
      bookingNumber
    }
  }
}
    `;

export const useAssignEquipmentMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AssignEquipmentMutation, TError, AssignEquipmentMutationVariables, TContext>) => {
    
    return useMutation<AssignEquipmentMutation, TError, AssignEquipmentMutationVariables, TContext>(
      {
    mutationKey: ['AssignEquipment'],
    mutationFn: (variables?: AssignEquipmentMutationVariables) => graphqlFetcher<AssignEquipmentMutation, AssignEquipmentMutationVariables>(AssignEquipmentDocument, variables)(),
    ...options
  }
    )};


useAssignEquipmentMutation.fetcher = (variables: AssignEquipmentMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<AssignEquipmentMutation, AssignEquipmentMutationVariables>(AssignEquipmentDocument, variables, options);

export const ReturnEquipmentDocument = `
    mutation ReturnEquipment($input: ReturnEquipmentInput!) {
  returnEquipment(input: $input) {
    success
    error
    assignment {
      id
      returnedAt
      conditionAtReturn
      notes
    }
  }
}
    `;

export const useReturnEquipmentMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ReturnEquipmentMutation, TError, ReturnEquipmentMutationVariables, TContext>) => {
    
    return useMutation<ReturnEquipmentMutation, TError, ReturnEquipmentMutationVariables, TContext>(
      {
    mutationKey: ['ReturnEquipment'],
    mutationFn: (variables?: ReturnEquipmentMutationVariables) => graphqlFetcher<ReturnEquipmentMutation, ReturnEquipmentMutationVariables>(ReturnEquipmentDocument, variables)(),
    ...options
  }
    )};


useReturnEquipmentMutation.fetcher = (variables: ReturnEquipmentMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ReturnEquipmentMutation, ReturnEquipmentMutationVariables>(ReturnEquipmentDocument, variables, options);

export const ReleaseEquipmentForBookingDocument = `
    mutation ReleaseEquipmentForBooking($bookingId: ID!) {
  releaseEquipmentForBooking(bookingId: $bookingId) {
    success
    error
    releasedCount
  }
}
    `;

export const useReleaseEquipmentForBookingMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ReleaseEquipmentForBookingMutation, TError, ReleaseEquipmentForBookingMutationVariables, TContext>) => {
    
    return useMutation<ReleaseEquipmentForBookingMutation, TError, ReleaseEquipmentForBookingMutationVariables, TContext>(
      {
    mutationKey: ['ReleaseEquipmentForBooking'],
    mutationFn: (variables?: ReleaseEquipmentForBookingMutationVariables) => graphqlFetcher<ReleaseEquipmentForBookingMutation, ReleaseEquipmentForBookingMutationVariables>(ReleaseEquipmentForBookingDocument, variables)(),
    ...options
  }
    )};


useReleaseEquipmentForBookingMutation.fetcher = (variables: ReleaseEquipmentForBookingMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ReleaseEquipmentForBookingMutation, ReleaseEquipmentForBookingMutationVariables>(ReleaseEquipmentForBookingDocument, variables, options);

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

export const RegenerateLineItemsDocument = `
    mutation RegenerateLineItems($teeTimeId: ID!) {
  regenerateLineItems(teeTimeId: $teeTimeId)
}
    `;

export const useRegenerateLineItemsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RegenerateLineItemsMutation, TError, RegenerateLineItemsMutationVariables, TContext>) => {
    
    return useMutation<RegenerateLineItemsMutation, TError, RegenerateLineItemsMutationVariables, TContext>(
      {
    mutationKey: ['RegenerateLineItems'],
    mutationFn: (variables?: RegenerateLineItemsMutationVariables) => graphqlFetcher<RegenerateLineItemsMutation, RegenerateLineItemsMutationVariables>(RegenerateLineItemsDocument, variables)(),
    ...options
  }
    )};


useRegenerateLineItemsMutation.fetcher = (variables: RegenerateLineItemsMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<RegenerateLineItemsMutation, RegenerateLineItemsMutationVariables>(RegenerateLineItemsDocument, variables, options);

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

export const GetFlightCheckInInfoDocument = `
    query GetFlightCheckInInfo($teeTimeId: ID!) {
  flightCheckInInfo(teeTimeId: $teeTimeId) {
    id
    teeTime
    course
    startingHole
    cartNumber
    caddyAssignment
    players {
      id
      name
      type
      memberNumber
      paymentStatus
      isCheckedIn
      checkedInAt
      isSuspended
      suspensionReason
      totalDue
      totalPaid
      balanceDue
      lineItems {
        id
        type
        description
        baseAmount
        taxType
        taxRate
        taxAmount
        totalAmount
        isPaid
        paidAt
        paymentMethod
      }
    }
  }
}
    `;

export const useGetFlightCheckInInfoQuery = <
      TData = GetFlightCheckInInfoQuery,
      TError = unknown
    >(
      variables: GetFlightCheckInInfoQueryVariables,
      options?: Omit<UseQueryOptions<GetFlightCheckInInfoQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetFlightCheckInInfoQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetFlightCheckInInfoQuery, TError, TData>(
      {
    queryKey: ['GetFlightCheckInInfo', variables],
    queryFn: graphqlFetcher<GetFlightCheckInInfoQuery, GetFlightCheckInInfoQueryVariables>(GetFlightCheckInInfoDocument, variables),
    ...options
  }
    )};

useGetFlightCheckInInfoQuery.getKey = (variables: GetFlightCheckInInfoQueryVariables) => ['GetFlightCheckInInfo', variables];

export const useInfiniteGetFlightCheckInInfoQuery = <
      TData = InfiniteData<GetFlightCheckInInfoQuery>,
      TError = unknown
    >(
      variables: GetFlightCheckInInfoQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetFlightCheckInInfoQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetFlightCheckInInfoQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetFlightCheckInInfoQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetFlightCheckInInfo.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetFlightCheckInInfoQuery, GetFlightCheckInInfoQueryVariables>(GetFlightCheckInInfoDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetFlightCheckInInfoQuery.getKey = (variables: GetFlightCheckInInfoQueryVariables) => ['GetFlightCheckInInfo.infinite', variables];


useGetFlightCheckInInfoQuery.fetcher = (variables: GetFlightCheckInInfoQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetFlightCheckInInfoQuery, GetFlightCheckInInfoQueryVariables>(GetFlightCheckInInfoDocument, variables, options);

export const GetPlayerPaymentInfoDocument = `
    query GetPlayerPaymentInfo($playerId: ID!) {
  playerPaymentInfo(playerId: $playerId) {
    playerId
    playerName
    playerType
    memberNumber
    lineItems {
      id
      type
      description
      baseAmount
      taxType
      taxRate
      taxAmount
      totalAmount
      isPaid
      paidAt
      paymentMethod
    }
    subtotal
    totalTax
    grandTotal
    paidOnline
    balanceDue
    isSettled
    settledAt
    settledVia
    settledBy
  }
}
    `;

export const useGetPlayerPaymentInfoQuery = <
      TData = GetPlayerPaymentInfoQuery,
      TError = unknown
    >(
      variables: GetPlayerPaymentInfoQueryVariables,
      options?: Omit<UseQueryOptions<GetPlayerPaymentInfoQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetPlayerPaymentInfoQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetPlayerPaymentInfoQuery, TError, TData>(
      {
    queryKey: ['GetPlayerPaymentInfo', variables],
    queryFn: graphqlFetcher<GetPlayerPaymentInfoQuery, GetPlayerPaymentInfoQueryVariables>(GetPlayerPaymentInfoDocument, variables),
    ...options
  }
    )};

useGetPlayerPaymentInfoQuery.getKey = (variables: GetPlayerPaymentInfoQueryVariables) => ['GetPlayerPaymentInfo', variables];

export const useInfiniteGetPlayerPaymentInfoQuery = <
      TData = InfiniteData<GetPlayerPaymentInfoQuery>,
      TError = unknown
    >(
      variables: GetPlayerPaymentInfoQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetPlayerPaymentInfoQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetPlayerPaymentInfoQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetPlayerPaymentInfoQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetPlayerPaymentInfo.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetPlayerPaymentInfoQuery, GetPlayerPaymentInfoQueryVariables>(GetPlayerPaymentInfoDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetPlayerPaymentInfoQuery.getKey = (variables: GetPlayerPaymentInfoQueryVariables) => ['GetPlayerPaymentInfo.infinite', variables];


useGetPlayerPaymentInfoQuery.fetcher = (variables: GetPlayerPaymentInfoQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetPlayerPaymentInfoQuery, GetPlayerPaymentInfoQueryVariables>(GetPlayerPaymentInfoDocument, variables, options);

export const GetFlightPaymentSummaryDocument = `
    query GetFlightPaymentSummary($teeTimeId: ID!) {
  flightPaymentSummary(teeTimeId: $teeTimeId) {
    teeTimeId
    teeTime
    course
    totalPlayers
    checkedInCount
    settledCount
    totalDue
    totalPaid
    totalBalance
    isFullyCheckedIn
    isFullySettled
  }
}
    `;

export const useGetFlightPaymentSummaryQuery = <
      TData = GetFlightPaymentSummaryQuery,
      TError = unknown
    >(
      variables: GetFlightPaymentSummaryQueryVariables,
      options?: Omit<UseQueryOptions<GetFlightPaymentSummaryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetFlightPaymentSummaryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetFlightPaymentSummaryQuery, TError, TData>(
      {
    queryKey: ['GetFlightPaymentSummary', variables],
    queryFn: graphqlFetcher<GetFlightPaymentSummaryQuery, GetFlightPaymentSummaryQueryVariables>(GetFlightPaymentSummaryDocument, variables),
    ...options
  }
    )};

useGetFlightPaymentSummaryQuery.getKey = (variables: GetFlightPaymentSummaryQueryVariables) => ['GetFlightPaymentSummary', variables];

export const useInfiniteGetFlightPaymentSummaryQuery = <
      TData = InfiniteData<GetFlightPaymentSummaryQuery>,
      TError = unknown
    >(
      variables: GetFlightPaymentSummaryQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetFlightPaymentSummaryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetFlightPaymentSummaryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetFlightPaymentSummaryQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetFlightPaymentSummary.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetFlightPaymentSummaryQuery, GetFlightPaymentSummaryQueryVariables>(GetFlightPaymentSummaryDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetFlightPaymentSummaryQuery.getKey = (variables: GetFlightPaymentSummaryQueryVariables) => ['GetFlightPaymentSummary.infinite', variables];


useGetFlightPaymentSummaryQuery.fetcher = (variables: GetFlightPaymentSummaryQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetFlightPaymentSummaryQuery, GetFlightPaymentSummaryQueryVariables>(GetFlightPaymentSummaryDocument, variables, options);

export const GetStarterTicketDocument = `
    query GetStarterTicket($ticketId: ID!) {
  starterTicket(ticketId: $ticketId) {
    id
    ticketNumber
    teeTime
    course
    startingHole
    players {
      name
      memberNumber
      type
    }
    cartNumber
    caddyName
    rentalItems
    specialRequests
    qrCodeData
    generatedAt
    generatedBy
    printedAt
    reprintCount
  }
}
    `;

export const useGetStarterTicketQuery = <
      TData = GetStarterTicketQuery,
      TError = unknown
    >(
      variables: GetStarterTicketQueryVariables,
      options?: Omit<UseQueryOptions<GetStarterTicketQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetStarterTicketQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetStarterTicketQuery, TError, TData>(
      {
    queryKey: ['GetStarterTicket', variables],
    queryFn: graphqlFetcher<GetStarterTicketQuery, GetStarterTicketQueryVariables>(GetStarterTicketDocument, variables),
    ...options
  }
    )};

useGetStarterTicketQuery.getKey = (variables: GetStarterTicketQueryVariables) => ['GetStarterTicket', variables];

export const useInfiniteGetStarterTicketQuery = <
      TData = InfiniteData<GetStarterTicketQuery>,
      TError = unknown
    >(
      variables: GetStarterTicketQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetStarterTicketQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetStarterTicketQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetStarterTicketQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetStarterTicket.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetStarterTicketQuery, GetStarterTicketQueryVariables>(GetStarterTicketDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetStarterTicketQuery.getKey = (variables: GetStarterTicketQueryVariables) => ['GetStarterTicket.infinite', variables];


useGetStarterTicketQuery.fetcher = (variables: GetStarterTicketQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetStarterTicketQuery, GetStarterTicketQueryVariables>(GetStarterTicketDocument, variables, options);

export const GetStarterTicketByTeeTimeDocument = `
    query GetStarterTicketByTeeTime($teeTimeId: ID!) {
  starterTicketByTeeTime(teeTimeId: $teeTimeId) {
    id
    ticketNumber
    teeTime
    course
    startingHole
    players {
      name
      memberNumber
      type
    }
    cartNumber
    caddyName
    rentalItems
    specialRequests
    qrCodeData
    generatedAt
    generatedBy
    printedAt
    reprintCount
  }
}
    `;

export const useGetStarterTicketByTeeTimeQuery = <
      TData = GetStarterTicketByTeeTimeQuery,
      TError = unknown
    >(
      variables: GetStarterTicketByTeeTimeQueryVariables,
      options?: Omit<UseQueryOptions<GetStarterTicketByTeeTimeQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetStarterTicketByTeeTimeQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetStarterTicketByTeeTimeQuery, TError, TData>(
      {
    queryKey: ['GetStarterTicketByTeeTime', variables],
    queryFn: graphqlFetcher<GetStarterTicketByTeeTimeQuery, GetStarterTicketByTeeTimeQueryVariables>(GetStarterTicketByTeeTimeDocument, variables),
    ...options
  }
    )};

useGetStarterTicketByTeeTimeQuery.getKey = (variables: GetStarterTicketByTeeTimeQueryVariables) => ['GetStarterTicketByTeeTime', variables];

export const useInfiniteGetStarterTicketByTeeTimeQuery = <
      TData = InfiniteData<GetStarterTicketByTeeTimeQuery>,
      TError = unknown
    >(
      variables: GetStarterTicketByTeeTimeQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetStarterTicketByTeeTimeQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetStarterTicketByTeeTimeQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetStarterTicketByTeeTimeQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetStarterTicketByTeeTime.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetStarterTicketByTeeTimeQuery, GetStarterTicketByTeeTimeQueryVariables>(GetStarterTicketByTeeTimeDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetStarterTicketByTeeTimeQuery.getKey = (variables: GetStarterTicketByTeeTimeQueryVariables) => ['GetStarterTicketByTeeTime.infinite', variables];


useGetStarterTicketByTeeTimeQuery.fetcher = (variables: GetStarterTicketByTeeTimeQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetStarterTicketByTeeTimeQuery, GetStarterTicketByTeeTimeQueryVariables>(GetStarterTicketByTeeTimeDocument, variables, options);

export const GetTicketHtmlDocument = `
    query GetTicketHTML($teeTimeId: ID!) {
  ticketHTML(teeTimeId: $teeTimeId)
}
    `;

export const useGetTicketHtmlQuery = <
      TData = GetTicketHtmlQuery,
      TError = unknown
    >(
      variables: GetTicketHtmlQueryVariables,
      options?: Omit<UseQueryOptions<GetTicketHtmlQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetTicketHtmlQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetTicketHtmlQuery, TError, TData>(
      {
    queryKey: ['GetTicketHTML', variables],
    queryFn: graphqlFetcher<GetTicketHtmlQuery, GetTicketHtmlQueryVariables>(GetTicketHtmlDocument, variables),
    ...options
  }
    )};

useGetTicketHtmlQuery.getKey = (variables: GetTicketHtmlQueryVariables) => ['GetTicketHTML', variables];

export const useInfiniteGetTicketHtmlQuery = <
      TData = InfiniteData<GetTicketHtmlQuery>,
      TError = unknown
    >(
      variables: GetTicketHtmlQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetTicketHtmlQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetTicketHtmlQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetTicketHtmlQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetTicketHTML.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetTicketHtmlQuery, GetTicketHtmlQueryVariables>(GetTicketHtmlDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetTicketHtmlQuery.getKey = (variables: GetTicketHtmlQueryVariables) => ['GetTicketHTML.infinite', variables];


useGetTicketHtmlQuery.fetcher = (variables: GetTicketHtmlQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetTicketHtmlQuery, GetTicketHtmlQueryVariables>(GetTicketHtmlDocument, variables, options);

export const GetReceiptHtmlDocument = `
    query GetReceiptHTML($teeTimeId: ID!, $playerId: ID!) {
  receiptHTML(teeTimeId: $teeTimeId, playerId: $playerId)
}
    `;

export const useGetReceiptHtmlQuery = <
      TData = GetReceiptHtmlQuery,
      TError = unknown
    >(
      variables: GetReceiptHtmlQueryVariables,
      options?: Omit<UseQueryOptions<GetReceiptHtmlQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetReceiptHtmlQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetReceiptHtmlQuery, TError, TData>(
      {
    queryKey: ['GetReceiptHTML', variables],
    queryFn: graphqlFetcher<GetReceiptHtmlQuery, GetReceiptHtmlQueryVariables>(GetReceiptHtmlDocument, variables),
    ...options
  }
    )};

useGetReceiptHtmlQuery.getKey = (variables: GetReceiptHtmlQueryVariables) => ['GetReceiptHTML', variables];

export const useInfiniteGetReceiptHtmlQuery = <
      TData = InfiniteData<GetReceiptHtmlQuery>,
      TError = unknown
    >(
      variables: GetReceiptHtmlQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetReceiptHtmlQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetReceiptHtmlQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetReceiptHtmlQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetReceiptHTML.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetReceiptHtmlQuery, GetReceiptHtmlQueryVariables>(GetReceiptHtmlDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetReceiptHtmlQuery.getKey = (variables: GetReceiptHtmlQueryVariables) => ['GetReceiptHTML.infinite', variables];


useGetReceiptHtmlQuery.fetcher = (variables: GetReceiptHtmlQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetReceiptHtmlQuery, GetReceiptHtmlQueryVariables>(GetReceiptHtmlDocument, variables, options);

export const ValidateTicketDocument = `
    query ValidateTicket($qrCodeData: String!) {
  validateTicket(qrCodeData: $qrCodeData) {
    valid
    ticketId
    teeTimeId
    message
  }
}
    `;

export const useValidateTicketQuery = <
      TData = ValidateTicketQuery,
      TError = unknown
    >(
      variables: ValidateTicketQueryVariables,
      options?: Omit<UseQueryOptions<ValidateTicketQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<ValidateTicketQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<ValidateTicketQuery, TError, TData>(
      {
    queryKey: ['ValidateTicket', variables],
    queryFn: graphqlFetcher<ValidateTicketQuery, ValidateTicketQueryVariables>(ValidateTicketDocument, variables),
    ...options
  }
    )};

useValidateTicketQuery.getKey = (variables: ValidateTicketQueryVariables) => ['ValidateTicket', variables];

export const useInfiniteValidateTicketQuery = <
      TData = InfiniteData<ValidateTicketQuery>,
      TError = unknown
    >(
      variables: ValidateTicketQueryVariables,
      options: Omit<UseInfiniteQueryOptions<ValidateTicketQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<ValidateTicketQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<ValidateTicketQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['ValidateTicket.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<ValidateTicketQuery, ValidateTicketQueryVariables>(ValidateTicketDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteValidateTicketQuery.getKey = (variables: ValidateTicketQueryVariables) => ['ValidateTicket.infinite', variables];


useValidateTicketQuery.fetcher = (variables: ValidateTicketQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<ValidateTicketQuery, ValidateTicketQueryVariables>(ValidateTicketDocument, variables, options);

export const GetCheckInHistoryDocument = `
    query GetCheckInHistory($filter: CheckInHistoryFilterInput) {
  checkInHistory(filter: $filter) {
    id
    teeTimeId
    playerId
    playerName
    action
    amount
    details
    performedBy
    performedAt
  }
}
    `;

export const useGetCheckInHistoryQuery = <
      TData = GetCheckInHistoryQuery,
      TError = unknown
    >(
      variables?: GetCheckInHistoryQueryVariables,
      options?: Omit<UseQueryOptions<GetCheckInHistoryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetCheckInHistoryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetCheckInHistoryQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetCheckInHistory'] : ['GetCheckInHistory', variables],
    queryFn: graphqlFetcher<GetCheckInHistoryQuery, GetCheckInHistoryQueryVariables>(GetCheckInHistoryDocument, variables),
    ...options
  }
    )};

useGetCheckInHistoryQuery.getKey = (variables?: GetCheckInHistoryQueryVariables) => variables === undefined ? ['GetCheckInHistory'] : ['GetCheckInHistory', variables];

export const useInfiniteGetCheckInHistoryQuery = <
      TData = InfiniteData<GetCheckInHistoryQuery>,
      TError = unknown
    >(
      variables: GetCheckInHistoryQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetCheckInHistoryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetCheckInHistoryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetCheckInHistoryQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetCheckInHistory.infinite'] : ['GetCheckInHistory.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetCheckInHistoryQuery, GetCheckInHistoryQueryVariables>(GetCheckInHistoryDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetCheckInHistoryQuery.getKey = (variables?: GetCheckInHistoryQueryVariables) => variables === undefined ? ['GetCheckInHistory.infinite'] : ['GetCheckInHistory.infinite', variables];


useGetCheckInHistoryQuery.fetcher = (variables?: GetCheckInHistoryQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetCheckInHistoryQuery, GetCheckInHistoryQueryVariables>(GetCheckInHistoryDocument, variables, options);

export const GetDailyCheckInReportDocument = `
    query GetDailyCheckInReport($input: DailyReportInput!) {
  dailyCheckInReport(input: $input) {
    date
    course
    totalFlights
    totalPlayers
    checkedInPlayers
    noShowPlayers
    totalRevenue
    totalCash
    totalCard
    totalTransfer
    totalAccount
    flights {
      teeTimeId
      teeTime
      course
      totalPlayers
      checkedInCount
      settledCount
      totalDue
      totalPaid
      totalBalance
      isFullyCheckedIn
      isFullySettled
    }
  }
}
    `;

export const useGetDailyCheckInReportQuery = <
      TData = GetDailyCheckInReportQuery,
      TError = unknown
    >(
      variables: GetDailyCheckInReportQueryVariables,
      options?: Omit<UseQueryOptions<GetDailyCheckInReportQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetDailyCheckInReportQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetDailyCheckInReportQuery, TError, TData>(
      {
    queryKey: ['GetDailyCheckInReport', variables],
    queryFn: graphqlFetcher<GetDailyCheckInReportQuery, GetDailyCheckInReportQueryVariables>(GetDailyCheckInReportDocument, variables),
    ...options
  }
    )};

useGetDailyCheckInReportQuery.getKey = (variables: GetDailyCheckInReportQueryVariables) => ['GetDailyCheckInReport', variables];

export const useInfiniteGetDailyCheckInReportQuery = <
      TData = InfiniteData<GetDailyCheckInReportQuery>,
      TError = unknown
    >(
      variables: GetDailyCheckInReportQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetDailyCheckInReportQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetDailyCheckInReportQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetDailyCheckInReportQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetDailyCheckInReport.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetDailyCheckInReportQuery, GetDailyCheckInReportQueryVariables>(GetDailyCheckInReportDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetDailyCheckInReportQuery.getKey = (variables: GetDailyCheckInReportQueryVariables) => ['GetDailyCheckInReport.infinite', variables];


useGetDailyCheckInReportQuery.fetcher = (variables: GetDailyCheckInReportQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetDailyCheckInReportQuery, GetDailyCheckInReportQueryVariables>(GetDailyCheckInReportDocument, variables, options);

export const GetCheckInPaymentMethodsDocument = `
    query GetCheckInPaymentMethods {
  checkInPaymentMethods {
    id
    name
    type
    icon
    isEnabled
    requiresRef
    opensPOS
    sortOrder
  }
}
    `;

export const useGetCheckInPaymentMethodsQuery = <
      TData = GetCheckInPaymentMethodsQuery,
      TError = unknown
    >(
      variables?: GetCheckInPaymentMethodsQueryVariables,
      options?: Omit<UseQueryOptions<GetCheckInPaymentMethodsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetCheckInPaymentMethodsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetCheckInPaymentMethodsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetCheckInPaymentMethods'] : ['GetCheckInPaymentMethods', variables],
    queryFn: graphqlFetcher<GetCheckInPaymentMethodsQuery, GetCheckInPaymentMethodsQueryVariables>(GetCheckInPaymentMethodsDocument, variables),
    ...options
  }
    )};

useGetCheckInPaymentMethodsQuery.getKey = (variables?: GetCheckInPaymentMethodsQueryVariables) => variables === undefined ? ['GetCheckInPaymentMethods'] : ['GetCheckInPaymentMethods', variables];

export const useInfiniteGetCheckInPaymentMethodsQuery = <
      TData = InfiniteData<GetCheckInPaymentMethodsQuery>,
      TError = unknown
    >(
      variables: GetCheckInPaymentMethodsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetCheckInPaymentMethodsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetCheckInPaymentMethodsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetCheckInPaymentMethodsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetCheckInPaymentMethods.infinite'] : ['GetCheckInPaymentMethods.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetCheckInPaymentMethodsQuery, GetCheckInPaymentMethodsQueryVariables>(GetCheckInPaymentMethodsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetCheckInPaymentMethodsQuery.getKey = (variables?: GetCheckInPaymentMethodsQueryVariables) => variables === undefined ? ['GetCheckInPaymentMethods.infinite'] : ['GetCheckInPaymentMethods.infinite', variables];


useGetCheckInPaymentMethodsQuery.fetcher = (variables?: GetCheckInPaymentMethodsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetCheckInPaymentMethodsQuery, GetCheckInPaymentMethodsQueryVariables>(GetCheckInPaymentMethodsDocument, variables, options);

export const GetGolfCheckInSettingsDocument = `
    query GetGolfCheckInSettings {
  golfCheckInSettings {
    policy {
      allowPartialPayment
      blockSuspendedMembers
      showSuspensionReason
      requireAllItemsPaid
    }
    tax {
      defaultRate
      defaultType
      taxLabel
      showBreakdown
      showTypeIndicator
    }
    starterTicket {
      generateOn
      autoGenerate
      defaultPrintOption
      content {
        showTeeTime
        showCourse
        showStartingHole
        showPlayerNames
        showMemberNumbers
        showCartNumber
        showCaddyName
        showRentalItems
        showSpecialRequests
        showQRCode
      }
    }
    proShop {
      allowAddAtCheckIn
      showQuickAddItems
      quickAddProductIds
    }
    pos {
      isConnected
      provider
      terminalId
    }
    paymentMethods {
      id
      name
      type
      icon
      isEnabled
      requiresRef
      opensPOS
      sortOrder
    }
  }
}
    `;

export const useGetGolfCheckInSettingsQuery = <
      TData = GetGolfCheckInSettingsQuery,
      TError = unknown
    >(
      variables?: GetGolfCheckInSettingsQueryVariables,
      options?: Omit<UseQueryOptions<GetGolfCheckInSettingsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetGolfCheckInSettingsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetGolfCheckInSettingsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetGolfCheckInSettings'] : ['GetGolfCheckInSettings', variables],
    queryFn: graphqlFetcher<GetGolfCheckInSettingsQuery, GetGolfCheckInSettingsQueryVariables>(GetGolfCheckInSettingsDocument, variables),
    ...options
  }
    )};

useGetGolfCheckInSettingsQuery.getKey = (variables?: GetGolfCheckInSettingsQueryVariables) => variables === undefined ? ['GetGolfCheckInSettings'] : ['GetGolfCheckInSettings', variables];

export const useInfiniteGetGolfCheckInSettingsQuery = <
      TData = InfiniteData<GetGolfCheckInSettingsQuery>,
      TError = unknown
    >(
      variables: GetGolfCheckInSettingsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetGolfCheckInSettingsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetGolfCheckInSettingsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetGolfCheckInSettingsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetGolfCheckInSettings.infinite'] : ['GetGolfCheckInSettings.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetGolfCheckInSettingsQuery, GetGolfCheckInSettingsQueryVariables>(GetGolfCheckInSettingsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetGolfCheckInSettingsQuery.getKey = (variables?: GetGolfCheckInSettingsQueryVariables) => variables === undefined ? ['GetGolfCheckInSettings.infinite'] : ['GetGolfCheckInSettings.infinite', variables];


useGetGolfCheckInSettingsQuery.fetcher = (variables?: GetGolfCheckInSettingsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetGolfCheckInSettingsQuery, GetGolfCheckInSettingsQueryVariables>(GetGolfCheckInSettingsDocument, variables, options);

export const GetProShopCategoriesDocument = `
    query GetProShopCategories {
  proShopCategories {
    id
    name
    description
    defaultTaxRate
    defaultTaxType
    sortOrder
    isActive
    productCount
  }
}
    `;

export const useGetProShopCategoriesQuery = <
      TData = GetProShopCategoriesQuery,
      TError = unknown
    >(
      variables?: GetProShopCategoriesQueryVariables,
      options?: Omit<UseQueryOptions<GetProShopCategoriesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetProShopCategoriesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetProShopCategoriesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetProShopCategories'] : ['GetProShopCategories', variables],
    queryFn: graphqlFetcher<GetProShopCategoriesQuery, GetProShopCategoriesQueryVariables>(GetProShopCategoriesDocument, variables),
    ...options
  }
    )};

useGetProShopCategoriesQuery.getKey = (variables?: GetProShopCategoriesQueryVariables) => variables === undefined ? ['GetProShopCategories'] : ['GetProShopCategories', variables];

export const useInfiniteGetProShopCategoriesQuery = <
      TData = InfiniteData<GetProShopCategoriesQuery>,
      TError = unknown
    >(
      variables: GetProShopCategoriesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetProShopCategoriesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetProShopCategoriesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetProShopCategoriesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetProShopCategories.infinite'] : ['GetProShopCategories.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetProShopCategoriesQuery, GetProShopCategoriesQueryVariables>(GetProShopCategoriesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetProShopCategoriesQuery.getKey = (variables?: GetProShopCategoriesQueryVariables) => variables === undefined ? ['GetProShopCategories.infinite'] : ['GetProShopCategories.infinite', variables];


useGetProShopCategoriesQuery.fetcher = (variables?: GetProShopCategoriesQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetProShopCategoriesQuery, GetProShopCategoriesQueryVariables>(GetProShopCategoriesDocument, variables, options);

export const GetProShopProductsDocument = `
    query GetProShopProducts($filter: ProShopProductFilterInput) {
  proShopProducts(filter: $filter) {
    items {
      id
      name
      sku
      description
      categoryId
      category {
        id
        name
      }
      price
      taxRate
      taxType
      useCategoryDefaults
      effectiveTaxRate
      effectiveTaxType
      isActive
      isQuickAdd
      variants {
        id
        name
        sku
        priceAdjustment
        finalPrice
      }
    }
    total
    page
    limit
    hasMore
  }
}
    `;

export const useGetProShopProductsQuery = <
      TData = GetProShopProductsQuery,
      TError = unknown
    >(
      variables?: GetProShopProductsQueryVariables,
      options?: Omit<UseQueryOptions<GetProShopProductsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetProShopProductsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetProShopProductsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetProShopProducts'] : ['GetProShopProducts', variables],
    queryFn: graphqlFetcher<GetProShopProductsQuery, GetProShopProductsQueryVariables>(GetProShopProductsDocument, variables),
    ...options
  }
    )};

useGetProShopProductsQuery.getKey = (variables?: GetProShopProductsQueryVariables) => variables === undefined ? ['GetProShopProducts'] : ['GetProShopProducts', variables];

export const useInfiniteGetProShopProductsQuery = <
      TData = InfiniteData<GetProShopProductsQuery>,
      TError = unknown
    >(
      variables: GetProShopProductsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetProShopProductsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetProShopProductsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetProShopProductsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetProShopProducts.infinite'] : ['GetProShopProducts.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetProShopProductsQuery, GetProShopProductsQueryVariables>(GetProShopProductsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetProShopProductsQuery.getKey = (variables?: GetProShopProductsQueryVariables) => variables === undefined ? ['GetProShopProducts.infinite'] : ['GetProShopProducts.infinite', variables];


useGetProShopProductsQuery.fetcher = (variables?: GetProShopProductsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetProShopProductsQuery, GetProShopProductsQueryVariables>(GetProShopProductsDocument, variables, options);

export const AddLineItemDocument = `
    mutation AddLineItem($input: AddLineItemInput!) {
  addLineItem(input: $input) {
    id
    type
    description
    baseAmount
    taxType
    taxRate
    taxAmount
    totalAmount
    isPaid
    paidAt
    paymentMethod
    reference
    productId
    variantId
  }
}
    `;

export const useAddLineItemMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AddLineItemMutation, TError, AddLineItemMutationVariables, TContext>) => {
    
    return useMutation<AddLineItemMutation, TError, AddLineItemMutationVariables, TContext>(
      {
    mutationKey: ['AddLineItem'],
    mutationFn: (variables?: AddLineItemMutationVariables) => graphqlFetcher<AddLineItemMutation, AddLineItemMutationVariables>(AddLineItemDocument, variables)(),
    ...options
  }
    )};


useAddLineItemMutation.fetcher = (variables: AddLineItemMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<AddLineItemMutation, AddLineItemMutationVariables>(AddLineItemDocument, variables, options);

export const RemoveLineItemDocument = `
    mutation RemoveLineItem($input: RemoveLineItemInput!) {
  removeLineItem(input: $input) {
    success
    error
    removedItem {
      id
      type
      description
      baseAmount
      totalAmount
      quantity
    }
  }
}
    `;

export const useRemoveLineItemMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RemoveLineItemMutation, TError, RemoveLineItemMutationVariables, TContext>) => {
    
    return useMutation<RemoveLineItemMutation, TError, RemoveLineItemMutationVariables, TContext>(
      {
    mutationKey: ['RemoveLineItem'],
    mutationFn: (variables?: RemoveLineItemMutationVariables) => graphqlFetcher<RemoveLineItemMutation, RemoveLineItemMutationVariables>(RemoveLineItemDocument, variables)(),
    ...options
  }
    )};


useRemoveLineItemMutation.fetcher = (variables: RemoveLineItemMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<RemoveLineItemMutation, RemoveLineItemMutationVariables>(RemoveLineItemDocument, variables, options);

export const ProcessSettlementDocument = `
    mutation ProcessSettlement($input: ProcessSettlementInput!) {
  processSettlement(input: $input) {
    success
    transactionId
    settledAt
    settledBy
    error
    players {
      playerId
      amountPaid
      success
      error
    }
  }
}
    `;

export const useProcessSettlementMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ProcessSettlementMutation, TError, ProcessSettlementMutationVariables, TContext>) => {
    
    return useMutation<ProcessSettlementMutation, TError, ProcessSettlementMutationVariables, TContext>(
      {
    mutationKey: ['ProcessSettlement'],
    mutationFn: (variables?: ProcessSettlementMutationVariables) => graphqlFetcher<ProcessSettlementMutation, ProcessSettlementMutationVariables>(ProcessSettlementDocument, variables)(),
    ...options
  }
    )};


useProcessSettlementMutation.fetcher = (variables: ProcessSettlementMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ProcessSettlementMutation, ProcessSettlementMutationVariables>(ProcessSettlementDocument, variables, options);

export const CheckInFlightDocument = `
    mutation CheckInFlight($input: CheckInFlightInput!) {
  checkInFlight(input: $input) {
    success
    checkedInAt
    checkedInBy
    ticketId
    ticketNumber
    players {
      playerId
      checkedIn
      error
    }
  }
}
    `;

export const useCheckInFlightMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CheckInFlightMutation, TError, CheckInFlightMutationVariables, TContext>) => {
    
    return useMutation<CheckInFlightMutation, TError, CheckInFlightMutationVariables, TContext>(
      {
    mutationKey: ['CheckInFlight'],
    mutationFn: (variables?: CheckInFlightMutationVariables) => graphqlFetcher<CheckInFlightMutation, CheckInFlightMutationVariables>(CheckInFlightDocument, variables)(),
    ...options
  }
    )};


useCheckInFlightMutation.fetcher = (variables: CheckInFlightMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CheckInFlightMutation, CheckInFlightMutationVariables>(CheckInFlightDocument, variables, options);

export const CheckInAllPlayersDocument = `
    mutation CheckInAllPlayers($input: CheckInAllPlayersInput!) {
  checkInAllPlayers(input: $input) {
    success
    checkedInAt
    checkedInBy
    ticketId
    ticketNumber
    players {
      playerId
      checkedIn
      error
    }
  }
}
    `;

export const useCheckInAllPlayersMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CheckInAllPlayersMutation, TError, CheckInAllPlayersMutationVariables, TContext>) => {
    
    return useMutation<CheckInAllPlayersMutation, TError, CheckInAllPlayersMutationVariables, TContext>(
      {
    mutationKey: ['CheckInAllPlayers'],
    mutationFn: (variables?: CheckInAllPlayersMutationVariables) => graphqlFetcher<CheckInAllPlayersMutation, CheckInAllPlayersMutationVariables>(CheckInAllPlayersDocument, variables)(),
    ...options
  }
    )};


useCheckInAllPlayersMutation.fetcher = (variables: CheckInAllPlayersMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CheckInAllPlayersMutation, CheckInAllPlayersMutationVariables>(CheckInAllPlayersDocument, variables, options);

export const SettleAllPlayersDocument = `
    mutation SettleAllPlayers($input: SettleAllPlayersInput!) {
  settleAllPlayers(input: $input) {
    success
    transactionId
    settledAt
    settledBy
    error
    players {
      playerId
      amountPaid
      success
      error
    }
  }
}
    `;

export const useSettleAllPlayersMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<SettleAllPlayersMutation, TError, SettleAllPlayersMutationVariables, TContext>) => {
    
    return useMutation<SettleAllPlayersMutation, TError, SettleAllPlayersMutationVariables, TContext>(
      {
    mutationKey: ['SettleAllPlayers'],
    mutationFn: (variables?: SettleAllPlayersMutationVariables) => graphqlFetcher<SettleAllPlayersMutation, SettleAllPlayersMutationVariables>(SettleAllPlayersDocument, variables)(),
    ...options
  }
    )};


useSettleAllPlayersMutation.fetcher = (variables: SettleAllPlayersMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<SettleAllPlayersMutation, SettleAllPlayersMutationVariables>(SettleAllPlayersDocument, variables, options);

export const UndoCheckInDocument = `
    mutation UndoCheckIn($input: UndoCheckInInput!) {
  undoCheckIn(input: $input)
}
    `;

export const useUndoCheckInMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UndoCheckInMutation, TError, UndoCheckInMutationVariables, TContext>) => {
    
    return useMutation<UndoCheckInMutation, TError, UndoCheckInMutationVariables, TContext>(
      {
    mutationKey: ['UndoCheckIn'],
    mutationFn: (variables?: UndoCheckInMutationVariables) => graphqlFetcher<UndoCheckInMutation, UndoCheckInMutationVariables>(UndoCheckInDocument, variables)(),
    ...options
  }
    )};


useUndoCheckInMutation.fetcher = (variables: UndoCheckInMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UndoCheckInMutation, UndoCheckInMutationVariables>(UndoCheckInDocument, variables, options);

export const GenerateStarterTicketDocument = `
    mutation GenerateStarterTicket($input: GenerateTicketInput!) {
  generateStarterTicket(input: $input) {
    id
    ticketNumber
    teeTime
    course
    startingHole
    players {
      name
      memberNumber
      type
    }
    cartNumber
    caddyName
    qrCodeData
    generatedAt
    generatedBy
  }
}
    `;

export const useGenerateStarterTicketMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GenerateStarterTicketMutation, TError, GenerateStarterTicketMutationVariables, TContext>) => {
    
    return useMutation<GenerateStarterTicketMutation, TError, GenerateStarterTicketMutationVariables, TContext>(
      {
    mutationKey: ['GenerateStarterTicket'],
    mutationFn: (variables?: GenerateStarterTicketMutationVariables) => graphqlFetcher<GenerateStarterTicketMutation, GenerateStarterTicketMutationVariables>(GenerateStarterTicketDocument, variables)(),
    ...options
  }
    )};


useGenerateStarterTicketMutation.fetcher = (variables: GenerateStarterTicketMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<GenerateStarterTicketMutation, GenerateStarterTicketMutationVariables>(GenerateStarterTicketDocument, variables, options);

export const PrintStarterTicketDocument = `
    mutation PrintStarterTicket($input: PrintTicketInput!) {
  printStarterTicket(input: $input) {
    id
    ticketNumber
    teeTime
    course
    startingHole
    players {
      name
      memberNumber
      type
    }
    cartNumber
    caddyName
    rentalItems
    specialRequests
    qrCodeData
    generatedAt
    generatedBy
    printedAt
    reprintCount
  }
}
    `;

export const usePrintStarterTicketMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<PrintStarterTicketMutation, TError, PrintStarterTicketMutationVariables, TContext>) => {
    
    return useMutation<PrintStarterTicketMutation, TError, PrintStarterTicketMutationVariables, TContext>(
      {
    mutationKey: ['PrintStarterTicket'],
    mutationFn: (variables?: PrintStarterTicketMutationVariables) => graphqlFetcher<PrintStarterTicketMutation, PrintStarterTicketMutationVariables>(PrintStarterTicketDocument, variables)(),
    ...options
  }
    )};


usePrintStarterTicketMutation.fetcher = (variables: PrintStarterTicketMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<PrintStarterTicketMutation, PrintStarterTicketMutationVariables>(PrintStarterTicketDocument, variables, options);

export const CreateProShopCategoryDocument = `
    mutation CreateProShopCategory($input: CreateProShopCategoryInput!) {
  createProShopCategory(input: $input) {
    id
    name
    description
    defaultTaxRate
    defaultTaxType
    sortOrder
    isActive
  }
}
    `;

export const useCreateProShopCategoryMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateProShopCategoryMutation, TError, CreateProShopCategoryMutationVariables, TContext>) => {
    
    return useMutation<CreateProShopCategoryMutation, TError, CreateProShopCategoryMutationVariables, TContext>(
      {
    mutationKey: ['CreateProShopCategory'],
    mutationFn: (variables?: CreateProShopCategoryMutationVariables) => graphqlFetcher<CreateProShopCategoryMutation, CreateProShopCategoryMutationVariables>(CreateProShopCategoryDocument, variables)(),
    ...options
  }
    )};


useCreateProShopCategoryMutation.fetcher = (variables: CreateProShopCategoryMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateProShopCategoryMutation, CreateProShopCategoryMutationVariables>(CreateProShopCategoryDocument, variables, options);

export const UpdateProShopCategoryDocument = `
    mutation UpdateProShopCategory($id: ID!, $input: UpdateProShopCategoryInput!) {
  updateProShopCategory(id: $id, input: $input) {
    id
    name
    description
    defaultTaxRate
    defaultTaxType
    sortOrder
    isActive
  }
}
    `;

export const useUpdateProShopCategoryMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateProShopCategoryMutation, TError, UpdateProShopCategoryMutationVariables, TContext>) => {
    
    return useMutation<UpdateProShopCategoryMutation, TError, UpdateProShopCategoryMutationVariables, TContext>(
      {
    mutationKey: ['UpdateProShopCategory'],
    mutationFn: (variables?: UpdateProShopCategoryMutationVariables) => graphqlFetcher<UpdateProShopCategoryMutation, UpdateProShopCategoryMutationVariables>(UpdateProShopCategoryDocument, variables)(),
    ...options
  }
    )};


useUpdateProShopCategoryMutation.fetcher = (variables: UpdateProShopCategoryMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateProShopCategoryMutation, UpdateProShopCategoryMutationVariables>(UpdateProShopCategoryDocument, variables, options);

export const DeleteProShopCategoryDocument = `
    mutation DeleteProShopCategory($id: ID!) {
  deleteProShopCategory(id: $id)
}
    `;

export const useDeleteProShopCategoryMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteProShopCategoryMutation, TError, DeleteProShopCategoryMutationVariables, TContext>) => {
    
    return useMutation<DeleteProShopCategoryMutation, TError, DeleteProShopCategoryMutationVariables, TContext>(
      {
    mutationKey: ['DeleteProShopCategory'],
    mutationFn: (variables?: DeleteProShopCategoryMutationVariables) => graphqlFetcher<DeleteProShopCategoryMutation, DeleteProShopCategoryMutationVariables>(DeleteProShopCategoryDocument, variables)(),
    ...options
  }
    )};


useDeleteProShopCategoryMutation.fetcher = (variables: DeleteProShopCategoryMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeleteProShopCategoryMutation, DeleteProShopCategoryMutationVariables>(DeleteProShopCategoryDocument, variables, options);

export const CreateProShopProductDocument = `
    mutation CreateProShopProduct($input: CreateProShopProductInput!) {
  createProShopProduct(input: $input) {
    id
    name
    sku
    description
    categoryId
    price
    taxRate
    taxType
    isActive
    isQuickAdd
    variants {
      id
      name
      sku
      priceAdjustment
    }
  }
}
    `;

export const useCreateProShopProductMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateProShopProductMutation, TError, CreateProShopProductMutationVariables, TContext>) => {
    
    return useMutation<CreateProShopProductMutation, TError, CreateProShopProductMutationVariables, TContext>(
      {
    mutationKey: ['CreateProShopProduct'],
    mutationFn: (variables?: CreateProShopProductMutationVariables) => graphqlFetcher<CreateProShopProductMutation, CreateProShopProductMutationVariables>(CreateProShopProductDocument, variables)(),
    ...options
  }
    )};


useCreateProShopProductMutation.fetcher = (variables: CreateProShopProductMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateProShopProductMutation, CreateProShopProductMutationVariables>(CreateProShopProductDocument, variables, options);

export const UpdateProShopProductDocument = `
    mutation UpdateProShopProduct($id: ID!, $input: UpdateProShopProductInput!) {
  updateProShopProduct(id: $id, input: $input) {
    id
    name
    sku
    description
    categoryId
    price
    taxRate
    taxType
    isActive
    isQuickAdd
    variants {
      id
      name
      sku
      priceAdjustment
    }
  }
}
    `;

export const useUpdateProShopProductMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateProShopProductMutation, TError, UpdateProShopProductMutationVariables, TContext>) => {
    
    return useMutation<UpdateProShopProductMutation, TError, UpdateProShopProductMutationVariables, TContext>(
      {
    mutationKey: ['UpdateProShopProduct'],
    mutationFn: (variables?: UpdateProShopProductMutationVariables) => graphqlFetcher<UpdateProShopProductMutation, UpdateProShopProductMutationVariables>(UpdateProShopProductDocument, variables)(),
    ...options
  }
    )};


useUpdateProShopProductMutation.fetcher = (variables: UpdateProShopProductMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateProShopProductMutation, UpdateProShopProductMutationVariables>(UpdateProShopProductDocument, variables, options);

export const DeleteProShopProductDocument = `
    mutation DeleteProShopProduct($id: ID!) {
  deleteProShopProduct(id: $id)
}
    `;

export const useDeleteProShopProductMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteProShopProductMutation, TError, DeleteProShopProductMutationVariables, TContext>) => {
    
    return useMutation<DeleteProShopProductMutation, TError, DeleteProShopProductMutationVariables, TContext>(
      {
    mutationKey: ['DeleteProShopProduct'],
    mutationFn: (variables?: DeleteProShopProductMutationVariables) => graphqlFetcher<DeleteProShopProductMutation, DeleteProShopProductMutationVariables>(DeleteProShopProductDocument, variables)(),
    ...options
  }
    )};


useDeleteProShopProductMutation.fetcher = (variables: DeleteProShopProductMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeleteProShopProductMutation, DeleteProShopProductMutationVariables>(DeleteProShopProductDocument, variables, options);

export const GetGolfRatesDocument = `
    query GetGolfRates($courseId: ID!, $activeOnly: Boolean) {
  golfRates(courseId: $courseId, activeOnly: $activeOnly) {
    id
    courseId
    name
    description
    isActive
    effectiveFrom
    effectiveTo
    createdAt
    updatedAt
    greenFeeRates {
      id
      playerType
      holes
      timeCategory
      amount
      taxType
      taxRate
      createdAt
      updatedAt
    }
    cartRates {
      id
      cartType
      amount
      taxType
      taxRate
      createdAt
      updatedAt
    }
    caddyRates {
      id
      caddyType
      amount
      taxType
      taxRate
      createdAt
      updatedAt
    }
  }
}
    `;

export const useGetGolfRatesQuery = <
      TData = GetGolfRatesQuery,
      TError = unknown
    >(
      variables: GetGolfRatesQueryVariables,
      options?: Omit<UseQueryOptions<GetGolfRatesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetGolfRatesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetGolfRatesQuery, TError, TData>(
      {
    queryKey: ['GetGolfRates', variables],
    queryFn: graphqlFetcher<GetGolfRatesQuery, GetGolfRatesQueryVariables>(GetGolfRatesDocument, variables),
    ...options
  }
    )};

useGetGolfRatesQuery.getKey = (variables: GetGolfRatesQueryVariables) => ['GetGolfRates', variables];

export const useInfiniteGetGolfRatesQuery = <
      TData = InfiniteData<GetGolfRatesQuery>,
      TError = unknown
    >(
      variables: GetGolfRatesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetGolfRatesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetGolfRatesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetGolfRatesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetGolfRates.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetGolfRatesQuery, GetGolfRatesQueryVariables>(GetGolfRatesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetGolfRatesQuery.getKey = (variables: GetGolfRatesQueryVariables) => ['GetGolfRates.infinite', variables];


useGetGolfRatesQuery.fetcher = (variables: GetGolfRatesQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetGolfRatesQuery, GetGolfRatesQueryVariables>(GetGolfRatesDocument, variables, options);

export const GetRateConfigDocument = `
    query GetRateConfig($id: ID!) {
  rateConfig(id: $id) {
    id
    courseId
    name
    description
    isActive
    effectiveFrom
    effectiveTo
    createdAt
    updatedAt
    greenFeeRates {
      id
      playerType
      holes
      timeCategory
      amount
      taxType
      taxRate
      createdAt
      updatedAt
    }
    cartRates {
      id
      cartType
      amount
      taxType
      taxRate
      createdAt
      updatedAt
    }
    caddyRates {
      id
      caddyType
      amount
      taxType
      taxRate
      createdAt
      updatedAt
    }
  }
}
    `;

export const useGetRateConfigQuery = <
      TData = GetRateConfigQuery,
      TError = unknown
    >(
      variables: GetRateConfigQueryVariables,
      options?: Omit<UseQueryOptions<GetRateConfigQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetRateConfigQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetRateConfigQuery, TError, TData>(
      {
    queryKey: ['GetRateConfig', variables],
    queryFn: graphqlFetcher<GetRateConfigQuery, GetRateConfigQueryVariables>(GetRateConfigDocument, variables),
    ...options
  }
    )};

useGetRateConfigQuery.getKey = (variables: GetRateConfigQueryVariables) => ['GetRateConfig', variables];

export const useInfiniteGetRateConfigQuery = <
      TData = InfiniteData<GetRateConfigQuery>,
      TError = unknown
    >(
      variables: GetRateConfigQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetRateConfigQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetRateConfigQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetRateConfigQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetRateConfig.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetRateConfigQuery, GetRateConfigQueryVariables>(GetRateConfigDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetRateConfigQuery.getKey = (variables: GetRateConfigQueryVariables) => ['GetRateConfig.infinite', variables];


useGetRateConfigQuery.fetcher = (variables: GetRateConfigQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetRateConfigQuery, GetRateConfigQueryVariables>(GetRateConfigDocument, variables, options);

export const CreateRateConfigDocument = `
    mutation CreateRateConfig($input: CreateRateConfigInput!) {
  createRateConfig(input: $input) {
    success
    message
    rateConfig {
      id
      courseId
      name
      description
      isActive
      effectiveFrom
      effectiveTo
      createdAt
      updatedAt
    }
  }
}
    `;

export const useCreateRateConfigMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateRateConfigMutation, TError, CreateRateConfigMutationVariables, TContext>) => {
    
    return useMutation<CreateRateConfigMutation, TError, CreateRateConfigMutationVariables, TContext>(
      {
    mutationKey: ['CreateRateConfig'],
    mutationFn: (variables?: CreateRateConfigMutationVariables) => graphqlFetcher<CreateRateConfigMutation, CreateRateConfigMutationVariables>(CreateRateConfigDocument, variables)(),
    ...options
  }
    )};


useCreateRateConfigMutation.fetcher = (variables: CreateRateConfigMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateRateConfigMutation, CreateRateConfigMutationVariables>(CreateRateConfigDocument, variables, options);

export const UpdateRateConfigDocument = `
    mutation UpdateRateConfig($id: ID!, $input: UpdateRateConfigInput!) {
  updateRateConfig(id: $id, input: $input) {
    success
    message
    rateConfig {
      id
      courseId
      name
      description
      isActive
      effectiveFrom
      effectiveTo
      createdAt
      updatedAt
    }
  }
}
    `;

export const useUpdateRateConfigMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateRateConfigMutation, TError, UpdateRateConfigMutationVariables, TContext>) => {
    
    return useMutation<UpdateRateConfigMutation, TError, UpdateRateConfigMutationVariables, TContext>(
      {
    mutationKey: ['UpdateRateConfig'],
    mutationFn: (variables?: UpdateRateConfigMutationVariables) => graphqlFetcher<UpdateRateConfigMutation, UpdateRateConfigMutationVariables>(UpdateRateConfigDocument, variables)(),
    ...options
  }
    )};


useUpdateRateConfigMutation.fetcher = (variables: UpdateRateConfigMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateRateConfigMutation, UpdateRateConfigMutationVariables>(UpdateRateConfigDocument, variables, options);

export const DeleteRateConfigDocument = `
    mutation DeleteRateConfig($id: ID!) {
  deleteRateConfig(id: $id) {
    success
    message
  }
}
    `;

export const useDeleteRateConfigMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteRateConfigMutation, TError, DeleteRateConfigMutationVariables, TContext>) => {
    
    return useMutation<DeleteRateConfigMutation, TError, DeleteRateConfigMutationVariables, TContext>(
      {
    mutationKey: ['DeleteRateConfig'],
    mutationFn: (variables?: DeleteRateConfigMutationVariables) => graphqlFetcher<DeleteRateConfigMutation, DeleteRateConfigMutationVariables>(DeleteRateConfigDocument, variables)(),
    ...options
  }
    )};


useDeleteRateConfigMutation.fetcher = (variables: DeleteRateConfigMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeleteRateConfigMutation, DeleteRateConfigMutationVariables>(DeleteRateConfigDocument, variables, options);

export const CreateGreenFeeRateDocument = `
    mutation CreateGreenFeeRate($input: CreateGreenFeeRateInput!) {
  createGreenFeeRate(input: $input) {
    success
    message
    greenFeeRate {
      id
      playerType
      holes
      timeCategory
      amount
      taxType
      taxRate
      createdAt
      updatedAt
    }
  }
}
    `;

export const useCreateGreenFeeRateMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateGreenFeeRateMutation, TError, CreateGreenFeeRateMutationVariables, TContext>) => {
    
    return useMutation<CreateGreenFeeRateMutation, TError, CreateGreenFeeRateMutationVariables, TContext>(
      {
    mutationKey: ['CreateGreenFeeRate'],
    mutationFn: (variables?: CreateGreenFeeRateMutationVariables) => graphqlFetcher<CreateGreenFeeRateMutation, CreateGreenFeeRateMutationVariables>(CreateGreenFeeRateDocument, variables)(),
    ...options
  }
    )};


useCreateGreenFeeRateMutation.fetcher = (variables: CreateGreenFeeRateMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateGreenFeeRateMutation, CreateGreenFeeRateMutationVariables>(CreateGreenFeeRateDocument, variables, options);

export const UpdateGreenFeeRateDocument = `
    mutation UpdateGreenFeeRate($id: ID!, $input: UpdateGreenFeeRateInput!) {
  updateGreenFeeRate(id: $id, input: $input) {
    success
    message
    greenFeeRate {
      id
      playerType
      holes
      timeCategory
      amount
      taxType
      taxRate
      createdAt
      updatedAt
    }
  }
}
    `;

export const useUpdateGreenFeeRateMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateGreenFeeRateMutation, TError, UpdateGreenFeeRateMutationVariables, TContext>) => {
    
    return useMutation<UpdateGreenFeeRateMutation, TError, UpdateGreenFeeRateMutationVariables, TContext>(
      {
    mutationKey: ['UpdateGreenFeeRate'],
    mutationFn: (variables?: UpdateGreenFeeRateMutationVariables) => graphqlFetcher<UpdateGreenFeeRateMutation, UpdateGreenFeeRateMutationVariables>(UpdateGreenFeeRateDocument, variables)(),
    ...options
  }
    )};


useUpdateGreenFeeRateMutation.fetcher = (variables: UpdateGreenFeeRateMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateGreenFeeRateMutation, UpdateGreenFeeRateMutationVariables>(UpdateGreenFeeRateDocument, variables, options);

export const DeleteGreenFeeRateDocument = `
    mutation DeleteGreenFeeRate($id: ID!) {
  deleteGreenFeeRate(id: $id) {
    success
    message
  }
}
    `;

export const useDeleteGreenFeeRateMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteGreenFeeRateMutation, TError, DeleteGreenFeeRateMutationVariables, TContext>) => {
    
    return useMutation<DeleteGreenFeeRateMutation, TError, DeleteGreenFeeRateMutationVariables, TContext>(
      {
    mutationKey: ['DeleteGreenFeeRate'],
    mutationFn: (variables?: DeleteGreenFeeRateMutationVariables) => graphqlFetcher<DeleteGreenFeeRateMutation, DeleteGreenFeeRateMutationVariables>(DeleteGreenFeeRateDocument, variables)(),
    ...options
  }
    )};


useDeleteGreenFeeRateMutation.fetcher = (variables: DeleteGreenFeeRateMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeleteGreenFeeRateMutation, DeleteGreenFeeRateMutationVariables>(DeleteGreenFeeRateDocument, variables, options);

export const CreateCartRateDocument = `
    mutation CreateCartRate($input: CreateCartRateInput!) {
  createCartRate(input: $input) {
    success
    message
    cartRate {
      id
      cartType
      amount
      taxType
      taxRate
      createdAt
      updatedAt
    }
  }
}
    `;

export const useCreateCartRateMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateCartRateMutation, TError, CreateCartRateMutationVariables, TContext>) => {
    
    return useMutation<CreateCartRateMutation, TError, CreateCartRateMutationVariables, TContext>(
      {
    mutationKey: ['CreateCartRate'],
    mutationFn: (variables?: CreateCartRateMutationVariables) => graphqlFetcher<CreateCartRateMutation, CreateCartRateMutationVariables>(CreateCartRateDocument, variables)(),
    ...options
  }
    )};


useCreateCartRateMutation.fetcher = (variables: CreateCartRateMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateCartRateMutation, CreateCartRateMutationVariables>(CreateCartRateDocument, variables, options);

export const UpdateCartRateDocument = `
    mutation UpdateCartRate($id: ID!, $input: UpdateCartRateInput!) {
  updateCartRate(id: $id, input: $input) {
    success
    message
    cartRate {
      id
      cartType
      amount
      taxType
      taxRate
      createdAt
      updatedAt
    }
  }
}
    `;

export const useUpdateCartRateMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateCartRateMutation, TError, UpdateCartRateMutationVariables, TContext>) => {
    
    return useMutation<UpdateCartRateMutation, TError, UpdateCartRateMutationVariables, TContext>(
      {
    mutationKey: ['UpdateCartRate'],
    mutationFn: (variables?: UpdateCartRateMutationVariables) => graphqlFetcher<UpdateCartRateMutation, UpdateCartRateMutationVariables>(UpdateCartRateDocument, variables)(),
    ...options
  }
    )};


useUpdateCartRateMutation.fetcher = (variables: UpdateCartRateMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateCartRateMutation, UpdateCartRateMutationVariables>(UpdateCartRateDocument, variables, options);

export const DeleteCartRateDocument = `
    mutation DeleteCartRate($id: ID!) {
  deleteCartRate(id: $id) {
    success
    message
  }
}
    `;

export const useDeleteCartRateMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteCartRateMutation, TError, DeleteCartRateMutationVariables, TContext>) => {
    
    return useMutation<DeleteCartRateMutation, TError, DeleteCartRateMutationVariables, TContext>(
      {
    mutationKey: ['DeleteCartRate'],
    mutationFn: (variables?: DeleteCartRateMutationVariables) => graphqlFetcher<DeleteCartRateMutation, DeleteCartRateMutationVariables>(DeleteCartRateDocument, variables)(),
    ...options
  }
    )};


useDeleteCartRateMutation.fetcher = (variables: DeleteCartRateMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeleteCartRateMutation, DeleteCartRateMutationVariables>(DeleteCartRateDocument, variables, options);

export const CreateCaddyRateDocument = `
    mutation CreateCaddyRate($input: CreateCaddyRateInput!) {
  createCaddyRate(input: $input) {
    success
    message
    caddyRate {
      id
      caddyType
      amount
      taxType
      taxRate
      createdAt
      updatedAt
    }
  }
}
    `;

export const useCreateCaddyRateMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateCaddyRateMutation, TError, CreateCaddyRateMutationVariables, TContext>) => {
    
    return useMutation<CreateCaddyRateMutation, TError, CreateCaddyRateMutationVariables, TContext>(
      {
    mutationKey: ['CreateCaddyRate'],
    mutationFn: (variables?: CreateCaddyRateMutationVariables) => graphqlFetcher<CreateCaddyRateMutation, CreateCaddyRateMutationVariables>(CreateCaddyRateDocument, variables)(),
    ...options
  }
    )};


useCreateCaddyRateMutation.fetcher = (variables: CreateCaddyRateMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateCaddyRateMutation, CreateCaddyRateMutationVariables>(CreateCaddyRateDocument, variables, options);

export const UpdateCaddyRateDocument = `
    mutation UpdateCaddyRate($id: ID!, $input: UpdateCaddyRateInput!) {
  updateCaddyRate(id: $id, input: $input) {
    success
    message
    caddyRate {
      id
      caddyType
      amount
      taxType
      taxRate
      createdAt
      updatedAt
    }
  }
}
    `;

export const useUpdateCaddyRateMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateCaddyRateMutation, TError, UpdateCaddyRateMutationVariables, TContext>) => {
    
    return useMutation<UpdateCaddyRateMutation, TError, UpdateCaddyRateMutationVariables, TContext>(
      {
    mutationKey: ['UpdateCaddyRate'],
    mutationFn: (variables?: UpdateCaddyRateMutationVariables) => graphqlFetcher<UpdateCaddyRateMutation, UpdateCaddyRateMutationVariables>(UpdateCaddyRateDocument, variables)(),
    ...options
  }
    )};


useUpdateCaddyRateMutation.fetcher = (variables: UpdateCaddyRateMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateCaddyRateMutation, UpdateCaddyRateMutationVariables>(UpdateCaddyRateDocument, variables, options);

export const DeleteCaddyRateDocument = `
    mutation DeleteCaddyRate($id: ID!) {
  deleteCaddyRate(id: $id) {
    success
    message
  }
}
    `;

export const useDeleteCaddyRateMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteCaddyRateMutation, TError, DeleteCaddyRateMutationVariables, TContext>) => {
    
    return useMutation<DeleteCaddyRateMutation, TError, DeleteCaddyRateMutationVariables, TContext>(
      {
    mutationKey: ['DeleteCaddyRate'],
    mutationFn: (variables?: DeleteCaddyRateMutationVariables) => graphqlFetcher<DeleteCaddyRateMutation, DeleteCaddyRateMutationVariables>(DeleteCaddyRateDocument, variables)(),
    ...options
  }
    )};


useDeleteCaddyRateMutation.fetcher = (variables: DeleteCaddyRateMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeleteCaddyRateMutation, DeleteCaddyRateMutationVariables>(DeleteCaddyRateDocument, variables, options);

export const GetTeeTimeCartsDocument = `
    query GetTeeTimeCarts($teeTimeId: ID!) {
  teeTimeCarts(teeTimeId: $teeTimeId) {
    teeTimeId
    teeTime
    courseName
    courseId
    date
    isFullySettled
    isFullyCheckedIn
    slots {
      ...SlotCartFields
    }
  }
}
    ${SlotCartFieldsFragmentDoc}`;

export const useGetTeeTimeCartsQuery = <
      TData = GetTeeTimeCartsQuery,
      TError = unknown
    >(
      variables: GetTeeTimeCartsQueryVariables,
      options?: Omit<UseQueryOptions<GetTeeTimeCartsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetTeeTimeCartsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetTeeTimeCartsQuery, TError, TData>(
      {
    queryKey: ['GetTeeTimeCarts', variables],
    queryFn: graphqlFetcher<GetTeeTimeCartsQuery, GetTeeTimeCartsQueryVariables>(GetTeeTimeCartsDocument, variables),
    ...options
  }
    )};

useGetTeeTimeCartsQuery.getKey = (variables: GetTeeTimeCartsQueryVariables) => ['GetTeeTimeCarts', variables];

export const useInfiniteGetTeeTimeCartsQuery = <
      TData = InfiniteData<GetTeeTimeCartsQuery>,
      TError = unknown
    >(
      variables: GetTeeTimeCartsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetTeeTimeCartsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetTeeTimeCartsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetTeeTimeCartsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetTeeTimeCarts.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetTeeTimeCartsQuery, GetTeeTimeCartsQueryVariables>(GetTeeTimeCartsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetTeeTimeCartsQuery.getKey = (variables: GetTeeTimeCartsQueryVariables) => ['GetTeeTimeCarts.infinite', variables];


useGetTeeTimeCartsQuery.fetcher = (variables: GetTeeTimeCartsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetTeeTimeCartsQuery, GetTeeTimeCartsQueryVariables>(GetTeeTimeCartsDocument, variables, options);

export const GetSlotCartDocument = `
    query GetSlotCart($playerId: ID!) {
  slotCart(playerId: $playerId) {
    ...SlotCartFields
  }
}
    ${SlotCartFieldsFragmentDoc}`;

export const useGetSlotCartQuery = <
      TData = GetSlotCartQuery,
      TError = unknown
    >(
      variables: GetSlotCartQueryVariables,
      options?: Omit<UseQueryOptions<GetSlotCartQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetSlotCartQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetSlotCartQuery, TError, TData>(
      {
    queryKey: ['GetSlotCart', variables],
    queryFn: graphqlFetcher<GetSlotCartQuery, GetSlotCartQueryVariables>(GetSlotCartDocument, variables),
    ...options
  }
    )};

useGetSlotCartQuery.getKey = (variables: GetSlotCartQueryVariables) => ['GetSlotCart', variables];

export const useInfiniteGetSlotCartQuery = <
      TData = InfiniteData<GetSlotCartQuery>,
      TError = unknown
    >(
      variables: GetSlotCartQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetSlotCartQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetSlotCartQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetSlotCartQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetSlotCart.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetSlotCartQuery, GetSlotCartQueryVariables>(GetSlotCartDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetSlotCartQuery.getKey = (variables: GetSlotCartQueryVariables) => ['GetSlotCart.infinite', variables];


useGetSlotCartQuery.fetcher = (variables: GetSlotCartQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetSlotCartQuery, GetSlotCartQueryVariables>(GetSlotCartDocument, variables, options);

export const GetBatchTotalDocument = `
    query GetBatchTotal($playerIds: [ID!]!) {
  batchTotal(playerIds: $playerIds) {
    playerIds
    subtotal
    taxTotal
    grandTotal
    paidAmount
    balanceDue
    lineItemCount
  }
}
    `;

export const useGetBatchTotalQuery = <
      TData = GetBatchTotalQuery,
      TError = unknown
    >(
      variables: GetBatchTotalQueryVariables,
      options?: Omit<UseQueryOptions<GetBatchTotalQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetBatchTotalQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetBatchTotalQuery, TError, TData>(
      {
    queryKey: ['GetBatchTotal', variables],
    queryFn: graphqlFetcher<GetBatchTotalQuery, GetBatchTotalQueryVariables>(GetBatchTotalDocument, variables),
    ...options
  }
    )};

useGetBatchTotalQuery.getKey = (variables: GetBatchTotalQueryVariables) => ['GetBatchTotal', variables];

export const useInfiniteGetBatchTotalQuery = <
      TData = InfiniteData<GetBatchTotalQuery>,
      TError = unknown
    >(
      variables: GetBatchTotalQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetBatchTotalQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetBatchTotalQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetBatchTotalQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetBatchTotal.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetBatchTotalQuery, GetBatchTotalQueryVariables>(GetBatchTotalDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetBatchTotalQuery.getKey = (variables: GetBatchTotalQueryVariables) => ['GetBatchTotal.infinite', variables];


useGetBatchTotalQuery.fetcher = (variables: GetBatchTotalQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetBatchTotalQuery, GetBatchTotalQueryVariables>(GetBatchTotalDocument, variables, options);

export const IsTeeTimeFullySettledDocument = `
    query IsTeeTimeFullySettled($teeTimeId: ID!) {
  isTeeTimeFullySettled(teeTimeId: $teeTimeId)
}
    `;

export const useIsTeeTimeFullySettledQuery = <
      TData = IsTeeTimeFullySettledQuery,
      TError = unknown
    >(
      variables: IsTeeTimeFullySettledQueryVariables,
      options?: Omit<UseQueryOptions<IsTeeTimeFullySettledQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<IsTeeTimeFullySettledQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<IsTeeTimeFullySettledQuery, TError, TData>(
      {
    queryKey: ['IsTeeTimeFullySettled', variables],
    queryFn: graphqlFetcher<IsTeeTimeFullySettledQuery, IsTeeTimeFullySettledQueryVariables>(IsTeeTimeFullySettledDocument, variables),
    ...options
  }
    )};

useIsTeeTimeFullySettledQuery.getKey = (variables: IsTeeTimeFullySettledQueryVariables) => ['IsTeeTimeFullySettled', variables];

export const useInfiniteIsTeeTimeFullySettledQuery = <
      TData = InfiniteData<IsTeeTimeFullySettledQuery>,
      TError = unknown
    >(
      variables: IsTeeTimeFullySettledQueryVariables,
      options: Omit<UseInfiniteQueryOptions<IsTeeTimeFullySettledQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<IsTeeTimeFullySettledQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<IsTeeTimeFullySettledQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['IsTeeTimeFullySettled.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<IsTeeTimeFullySettledQuery, IsTeeTimeFullySettledQueryVariables>(IsTeeTimeFullySettledDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteIsTeeTimeFullySettledQuery.getKey = (variables: IsTeeTimeFullySettledQueryVariables) => ['IsTeeTimeFullySettled.infinite', variables];


useIsTeeTimeFullySettledQuery.fetcher = (variables: IsTeeTimeFullySettledQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<IsTeeTimeFullySettledQuery, IsTeeTimeFullySettledQueryVariables>(IsTeeTimeFullySettledDocument, variables, options);

export const GetCartDraftDocument = `
    query GetCartDraft($teeTimeId: ID!) {
  cartDraft(teeTimeId: $teeTimeId) {
    id
    teeTimeId
    draftData
    updatedAt
    createdBy
  }
}
    `;

export const useGetCartDraftQuery = <
      TData = GetCartDraftQuery,
      TError = unknown
    >(
      variables: GetCartDraftQueryVariables,
      options?: Omit<UseQueryOptions<GetCartDraftQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetCartDraftQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetCartDraftQuery, TError, TData>(
      {
    queryKey: ['GetCartDraft', variables],
    queryFn: graphqlFetcher<GetCartDraftQuery, GetCartDraftQueryVariables>(GetCartDraftDocument, variables),
    ...options
  }
    )};

useGetCartDraftQuery.getKey = (variables: GetCartDraftQueryVariables) => ['GetCartDraft', variables];

export const useInfiniteGetCartDraftQuery = <
      TData = InfiniteData<GetCartDraftQuery>,
      TError = unknown
    >(
      variables: GetCartDraftQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetCartDraftQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetCartDraftQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetCartDraftQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetCartDraft.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetCartDraftQuery, GetCartDraftQueryVariables>(GetCartDraftDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetCartDraftQuery.getKey = (variables: GetCartDraftQueryVariables) => ['GetCartDraft.infinite', variables];


useGetCartDraftQuery.fetcher = (variables: GetCartDraftQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetCartDraftQuery, GetCartDraftQueryVariables>(GetCartDraftDocument, variables, options);

export const HasDraftDocument = `
    query HasDraft($teeTimeId: ID!) {
  hasDraft(teeTimeId: $teeTimeId)
}
    `;

export const useHasDraftQuery = <
      TData = HasDraftQuery,
      TError = unknown
    >(
      variables: HasDraftQueryVariables,
      options?: Omit<UseQueryOptions<HasDraftQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<HasDraftQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<HasDraftQuery, TError, TData>(
      {
    queryKey: ['HasDraft', variables],
    queryFn: graphqlFetcher<HasDraftQuery, HasDraftQueryVariables>(HasDraftDocument, variables),
    ...options
  }
    )};

useHasDraftQuery.getKey = (variables: HasDraftQueryVariables) => ['HasDraft', variables];

export const useInfiniteHasDraftQuery = <
      TData = InfiniteData<HasDraftQuery>,
      TError = unknown
    >(
      variables: HasDraftQueryVariables,
      options: Omit<UseInfiniteQueryOptions<HasDraftQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<HasDraftQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<HasDraftQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['HasDraft.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<HasDraftQuery, HasDraftQueryVariables>(HasDraftDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteHasDraftQuery.getKey = (variables: HasDraftQueryVariables) => ['HasDraft.infinite', variables];


useHasDraftQuery.fetcher = (variables: HasDraftQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<HasDraftQuery, HasDraftQueryVariables>(HasDraftDocument, variables, options);

export const TransferLineItemDocument = `
    mutation TransferLineItem($input: TransferLineItemInput!) {
  transferLineItem(input: $input) {
    success
    error
    lineItemId
    isTransferred
    transferredToPlayerId
  }
}
    `;

export const useTransferLineItemMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<TransferLineItemMutation, TError, TransferLineItemMutationVariables, TContext>) => {
    
    return useMutation<TransferLineItemMutation, TError, TransferLineItemMutationVariables, TContext>(
      {
    mutationKey: ['TransferLineItem'],
    mutationFn: (variables?: TransferLineItemMutationVariables) => graphqlFetcher<TransferLineItemMutation, TransferLineItemMutationVariables>(TransferLineItemDocument, variables)(),
    ...options
  }
    )};


useTransferLineItemMutation.fetcher = (variables: TransferLineItemMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<TransferLineItemMutation, TransferLineItemMutationVariables>(TransferLineItemDocument, variables, options);

export const UndoTransferDocument = `
    mutation UndoTransfer($input: UndoTransferInput!) {
  undoTransfer(input: $input) {
    success
    error
  }
}
    `;

export const useUndoTransferMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UndoTransferMutation, TError, UndoTransferMutationVariables, TContext>) => {
    
    return useMutation<UndoTransferMutation, TError, UndoTransferMutationVariables, TContext>(
      {
    mutationKey: ['UndoTransfer'],
    mutationFn: (variables?: UndoTransferMutationVariables) => graphqlFetcher<UndoTransferMutation, UndoTransferMutationVariables>(UndoTransferDocument, variables)(),
    ...options
  }
    )};


useUndoTransferMutation.fetcher = (variables: UndoTransferMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UndoTransferMutation, UndoTransferMutationVariables>(UndoTransferDocument, variables, options);

export const ProcessBatchPaymentDocument = `
    mutation ProcessBatchPayment($input: BatchPaymentInput!) {
  processBatchPayment(input: $input) {
    success
    error
    transactionId
    processedSlots {
      playerId
      amountPaid
      newBalance
      isSettled
    }
  }
}
    `;

export const useProcessBatchPaymentMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ProcessBatchPaymentMutation, TError, ProcessBatchPaymentMutationVariables, TContext>) => {
    
    return useMutation<ProcessBatchPaymentMutation, TError, ProcessBatchPaymentMutationVariables, TContext>(
      {
    mutationKey: ['ProcessBatchPayment'],
    mutationFn: (variables?: ProcessBatchPaymentMutationVariables) => graphqlFetcher<ProcessBatchPaymentMutation, ProcessBatchPaymentMutationVariables>(ProcessBatchPaymentDocument, variables)(),
    ...options
  }
    )};


useProcessBatchPaymentMutation.fetcher = (variables: ProcessBatchPaymentMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ProcessBatchPaymentMutation, ProcessBatchPaymentMutationVariables>(ProcessBatchPaymentDocument, variables, options);

export const CheckInSlotsDocument = `
    mutation CheckInSlots($input: CheckInSlotsInput!) {
  checkInSlots(input: $input) {
    success
    error
    checkedInSlots {
      playerId
      checkedInAt
      error
    }
    ticketId
    ticketNumber
  }
}
    `;

export const useCheckInSlotsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CheckInSlotsMutation, TError, CheckInSlotsMutationVariables, TContext>) => {
    
    return useMutation<CheckInSlotsMutation, TError, CheckInSlotsMutationVariables, TContext>(
      {
    mutationKey: ['CheckInSlots'],
    mutationFn: (variables?: CheckInSlotsMutationVariables) => graphqlFetcher<CheckInSlotsMutation, CheckInSlotsMutationVariables>(CheckInSlotsDocument, variables)(),
    ...options
  }
    )};


useCheckInSlotsMutation.fetcher = (variables: CheckInSlotsMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CheckInSlotsMutation, CheckInSlotsMutationVariables>(CheckInSlotsDocument, variables, options);

export const SaveCartDraftDocument = `
    mutation SaveCartDraft($input: SaveCartDraftInput!) {
  saveCartDraft(input: $input) {
    id
    teeTimeId
    draftData
    updatedAt
    createdBy
  }
}
    `;

export const useSaveCartDraftMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<SaveCartDraftMutation, TError, SaveCartDraftMutationVariables, TContext>) => {
    
    return useMutation<SaveCartDraftMutation, TError, SaveCartDraftMutationVariables, TContext>(
      {
    mutationKey: ['SaveCartDraft'],
    mutationFn: (variables?: SaveCartDraftMutationVariables) => graphqlFetcher<SaveCartDraftMutation, SaveCartDraftMutationVariables>(SaveCartDraftDocument, variables)(),
    ...options
  }
    )};


useSaveCartDraftMutation.fetcher = (variables: SaveCartDraftMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<SaveCartDraftMutation, SaveCartDraftMutationVariables>(SaveCartDraftDocument, variables, options);

export const ClearCartDraftDocument = `
    mutation ClearCartDraft($teeTimeId: ID!) {
  clearCartDraft(teeTimeId: $teeTimeId)
}
    `;

export const useClearCartDraftMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ClearCartDraftMutation, TError, ClearCartDraftMutationVariables, TContext>) => {
    
    return useMutation<ClearCartDraftMutation, TError, ClearCartDraftMutationVariables, TContext>(
      {
    mutationKey: ['ClearCartDraft'],
    mutationFn: (variables?: ClearCartDraftMutationVariables) => graphqlFetcher<ClearCartDraftMutation, ClearCartDraftMutationVariables>(ClearCartDraftDocument, variables)(),
    ...options
  }
    )};


useClearCartDraftMutation.fetcher = (variables: ClearCartDraftMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ClearCartDraftMutation, ClearCartDraftMutationVariables>(ClearCartDraftDocument, variables, options);

export const UpdateLineItemQuantityDocument = `
    mutation UpdateLineItemQuantity($input: UpdateLineItemQuantityInput!) {
  updateLineItemQuantity(input: $input) {
    success
    error
    lineItem {
      id
      type
      description
      baseAmount
      taxType
      taxRate
      taxAmount
      totalAmount
      quantity
      isPaid
      isTransferred
    }
  }
}
    `;

export const useUpdateLineItemQuantityMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateLineItemQuantityMutation, TError, UpdateLineItemQuantityMutationVariables, TContext>) => {
    
    return useMutation<UpdateLineItemQuantityMutation, TError, UpdateLineItemQuantityMutationVariables, TContext>(
      {
    mutationKey: ['UpdateLineItemQuantity'],
    mutationFn: (variables?: UpdateLineItemQuantityMutationVariables) => graphqlFetcher<UpdateLineItemQuantityMutation, UpdateLineItemQuantityMutationVariables>(UpdateLineItemQuantityDocument, variables)(),
    ...options
  }
    )};


useUpdateLineItemQuantityMutation.fetcher = (variables: UpdateLineItemQuantityMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateLineItemQuantityMutation, UpdateLineItemQuantityMutationVariables>(UpdateLineItemQuantityDocument, variables, options);

export const BulkRemoveLineItemsDocument = `
    mutation BulkRemoveLineItems($input: BulkRemoveLineItemsInput!) {
  bulkRemoveLineItems(input: $input) {
    success
    error
    removedCount
    removedItems {
      id
      description
      totalAmount
      quantity
    }
  }
}
    `;

export const useBulkRemoveLineItemsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<BulkRemoveLineItemsMutation, TError, BulkRemoveLineItemsMutationVariables, TContext>) => {
    
    return useMutation<BulkRemoveLineItemsMutation, TError, BulkRemoveLineItemsMutationVariables, TContext>(
      {
    mutationKey: ['BulkRemoveLineItems'],
    mutationFn: (variables?: BulkRemoveLineItemsMutationVariables) => graphqlFetcher<BulkRemoveLineItemsMutation, BulkRemoveLineItemsMutationVariables>(BulkRemoveLineItemsDocument, variables)(),
    ...options
  }
    )};


useBulkRemoveLineItemsMutation.fetcher = (variables: BulkRemoveLineItemsMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<BulkRemoveLineItemsMutation, BulkRemoveLineItemsMutationVariables>(BulkRemoveLineItemsDocument, variables, options);

export const BulkTransferLineItemsDocument = `
    mutation BulkTransferLineItems($input: BulkTransferLineItemsInput!) {
  bulkTransferLineItems(input: $input) {
    success
    error
    transferredCount
  }
}
    `;

export const useBulkTransferLineItemsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<BulkTransferLineItemsMutation, TError, BulkTransferLineItemsMutationVariables, TContext>) => {
    
    return useMutation<BulkTransferLineItemsMutation, TError, BulkTransferLineItemsMutationVariables, TContext>(
      {
    mutationKey: ['BulkTransferLineItems'],
    mutationFn: (variables?: BulkTransferLineItemsMutationVariables) => graphqlFetcher<BulkTransferLineItemsMutation, BulkTransferLineItemsMutationVariables>(BulkTransferLineItemsDocument, variables)(),
    ...options
  }
    )};


useBulkTransferLineItemsMutation.fetcher = (variables: BulkTransferLineItemsMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<BulkTransferLineItemsMutation, BulkTransferLineItemsMutationVariables>(BulkTransferLineItemsDocument, variables, options);

export const PayLineItemsDocument = `
    mutation PayLineItems($input: PayLineItemsInput!) {
  payLineItems(input: $input) {
    success
    error
    transactionId
    paidCount
    totalPaid
  }
}
    `;

export const usePayLineItemsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<PayLineItemsMutation, TError, PayLineItemsMutationVariables, TContext>) => {
    
    return useMutation<PayLineItemsMutation, TError, PayLineItemsMutationVariables, TContext>(
      {
    mutationKey: ['PayLineItems'],
    mutationFn: (variables?: PayLineItemsMutationVariables) => graphqlFetcher<PayLineItemsMutation, PayLineItemsMutationVariables>(PayLineItemsDocument, variables)(),
    ...options
  }
    )};


usePayLineItemsMutation.fetcher = (variables: PayLineItemsMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<PayLineItemsMutation, PayLineItemsMutationVariables>(PayLineItemsDocument, variables, options);

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

export const GetMinimumSpendRequirementsDocument = `
    query GetMinimumSpendRequirements($activeOnly: Boolean) {
  minimumSpendRequirements(activeOnly: $activeOnly) {
    id
    clubId
    name
    description
    membershipTypes
    minimumAmount
    period
    includeFoodBeverage
    includeGolf
    includeSpa
    includeRetail
    includeEvents
    includedCategories
    excludedCategories
    defaultShortfallAction
    gracePeriodDays
    allowPartialCredit
    notifyAtPercent
    notifyDaysBeforeEnd
    isActive
    effectiveFrom
    effectiveTo
    createdAt
    updatedAt
  }
}
    `;

export const useGetMinimumSpendRequirementsQuery = <
      TData = GetMinimumSpendRequirementsQuery,
      TError = unknown
    >(
      variables?: GetMinimumSpendRequirementsQueryVariables,
      options?: Omit<UseQueryOptions<GetMinimumSpendRequirementsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMinimumSpendRequirementsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMinimumSpendRequirementsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetMinimumSpendRequirements'] : ['GetMinimumSpendRequirements', variables],
    queryFn: graphqlFetcher<GetMinimumSpendRequirementsQuery, GetMinimumSpendRequirementsQueryVariables>(GetMinimumSpendRequirementsDocument, variables),
    ...options
  }
    )};

useGetMinimumSpendRequirementsQuery.getKey = (variables?: GetMinimumSpendRequirementsQueryVariables) => variables === undefined ? ['GetMinimumSpendRequirements'] : ['GetMinimumSpendRequirements', variables];

export const useInfiniteGetMinimumSpendRequirementsQuery = <
      TData = InfiniteData<GetMinimumSpendRequirementsQuery>,
      TError = unknown
    >(
      variables: GetMinimumSpendRequirementsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMinimumSpendRequirementsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMinimumSpendRequirementsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMinimumSpendRequirementsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetMinimumSpendRequirements.infinite'] : ['GetMinimumSpendRequirements.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMinimumSpendRequirementsQuery, GetMinimumSpendRequirementsQueryVariables>(GetMinimumSpendRequirementsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMinimumSpendRequirementsQuery.getKey = (variables?: GetMinimumSpendRequirementsQueryVariables) => variables === undefined ? ['GetMinimumSpendRequirements.infinite'] : ['GetMinimumSpendRequirements.infinite', variables];


useGetMinimumSpendRequirementsQuery.fetcher = (variables?: GetMinimumSpendRequirementsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMinimumSpendRequirementsQuery, GetMinimumSpendRequirementsQueryVariables>(GetMinimumSpendRequirementsDocument, variables, options);

export const GetMinimumSpendRequirementDocument = `
    query GetMinimumSpendRequirement($id: ID!) {
  minimumSpendRequirement(id: $id) {
    id
    clubId
    name
    description
    membershipTypes
    minimumAmount
    period
    includeFoodBeverage
    includeGolf
    includeSpa
    includeRetail
    includeEvents
    includedCategories
    excludedCategories
    defaultShortfallAction
    gracePeriodDays
    allowPartialCredit
    notifyAtPercent
    notifyDaysBeforeEnd
    isActive
    effectiveFrom
    effectiveTo
    createdAt
    updatedAt
  }
}
    `;

export const useGetMinimumSpendRequirementQuery = <
      TData = GetMinimumSpendRequirementQuery,
      TError = unknown
    >(
      variables: GetMinimumSpendRequirementQueryVariables,
      options?: Omit<UseQueryOptions<GetMinimumSpendRequirementQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMinimumSpendRequirementQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMinimumSpendRequirementQuery, TError, TData>(
      {
    queryKey: ['GetMinimumSpendRequirement', variables],
    queryFn: graphqlFetcher<GetMinimumSpendRequirementQuery, GetMinimumSpendRequirementQueryVariables>(GetMinimumSpendRequirementDocument, variables),
    ...options
  }
    )};

useGetMinimumSpendRequirementQuery.getKey = (variables: GetMinimumSpendRequirementQueryVariables) => ['GetMinimumSpendRequirement', variables];

export const useInfiniteGetMinimumSpendRequirementQuery = <
      TData = InfiniteData<GetMinimumSpendRequirementQuery>,
      TError = unknown
    >(
      variables: GetMinimumSpendRequirementQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMinimumSpendRequirementQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMinimumSpendRequirementQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMinimumSpendRequirementQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetMinimumSpendRequirement.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMinimumSpendRequirementQuery, GetMinimumSpendRequirementQueryVariables>(GetMinimumSpendRequirementDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMinimumSpendRequirementQuery.getKey = (variables: GetMinimumSpendRequirementQueryVariables) => ['GetMinimumSpendRequirement.infinite', variables];


useGetMinimumSpendRequirementQuery.fetcher = (variables: GetMinimumSpendRequirementQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMinimumSpendRequirementQuery, GetMinimumSpendRequirementQueryVariables>(GetMinimumSpendRequirementDocument, variables, options);

export const GetMemberMinimumSpendsDocument = `
    query GetMemberMinimumSpends($input: GetMemberSpendsInput!) {
  memberMinimumSpends(input: $input) {
    id
    clubId
    memberId
    requirementId
    periodStart
    periodEnd
    periodLabel
    requiredAmount
    currentSpend
    projectedSpend
    shortfallAmount
    carryForwardAmount
    status
    isExempt
    exemptReason
    exemptBy
    exemptAt
    shortfallAction
    shortfallResolvedBy
    shortfallResolvedAt
    shortfallNote
    shortfallInvoiceId
    lastCalculatedAt
    createdAt
    updatedAt
    requirement {
      id
      name
      minimumAmount
      period
    }
  }
}
    `;

export const useGetMemberMinimumSpendsQuery = <
      TData = GetMemberMinimumSpendsQuery,
      TError = unknown
    >(
      variables: GetMemberMinimumSpendsQueryVariables,
      options?: Omit<UseQueryOptions<GetMemberMinimumSpendsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMemberMinimumSpendsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMemberMinimumSpendsQuery, TError, TData>(
      {
    queryKey: ['GetMemberMinimumSpends', variables],
    queryFn: graphqlFetcher<GetMemberMinimumSpendsQuery, GetMemberMinimumSpendsQueryVariables>(GetMemberMinimumSpendsDocument, variables),
    ...options
  }
    )};

useGetMemberMinimumSpendsQuery.getKey = (variables: GetMemberMinimumSpendsQueryVariables) => ['GetMemberMinimumSpends', variables];

export const useInfiniteGetMemberMinimumSpendsQuery = <
      TData = InfiniteData<GetMemberMinimumSpendsQuery>,
      TError = unknown
    >(
      variables: GetMemberMinimumSpendsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMemberMinimumSpendsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMemberMinimumSpendsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMemberMinimumSpendsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetMemberMinimumSpends.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMemberMinimumSpendsQuery, GetMemberMinimumSpendsQueryVariables>(GetMemberMinimumSpendsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMemberMinimumSpendsQuery.getKey = (variables: GetMemberMinimumSpendsQueryVariables) => ['GetMemberMinimumSpends.infinite', variables];


useGetMemberMinimumSpendsQuery.fetcher = (variables: GetMemberMinimumSpendsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMemberMinimumSpendsQuery, GetMemberMinimumSpendsQueryVariables>(GetMemberMinimumSpendsDocument, variables, options);

export const GetMemberMinimumSpendDocument = `
    query GetMemberMinimumSpend($id: ID!) {
  memberMinimumSpend(id: $id) {
    id
    clubId
    memberId
    requirementId
    periodStart
    periodEnd
    periodLabel
    requiredAmount
    currentSpend
    projectedSpend
    shortfallAmount
    carryForwardAmount
    status
    isExempt
    exemptReason
    exemptBy
    exemptAt
    shortfallAction
    shortfallResolvedBy
    shortfallResolvedAt
    shortfallNote
    shortfallInvoiceId
    lastCalculatedAt
    createdAt
    updatedAt
    requirement {
      id
      name
      minimumAmount
      period
      defaultShortfallAction
    }
  }
}
    `;

export const useGetMemberMinimumSpendQuery = <
      TData = GetMemberMinimumSpendQuery,
      TError = unknown
    >(
      variables: GetMemberMinimumSpendQueryVariables,
      options?: Omit<UseQueryOptions<GetMemberMinimumSpendQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMemberMinimumSpendQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMemberMinimumSpendQuery, TError, TData>(
      {
    queryKey: ['GetMemberMinimumSpend', variables],
    queryFn: graphqlFetcher<GetMemberMinimumSpendQuery, GetMemberMinimumSpendQueryVariables>(GetMemberMinimumSpendDocument, variables),
    ...options
  }
    )};

useGetMemberMinimumSpendQuery.getKey = (variables: GetMemberMinimumSpendQueryVariables) => ['GetMemberMinimumSpend', variables];

export const useInfiniteGetMemberMinimumSpendQuery = <
      TData = InfiniteData<GetMemberMinimumSpendQuery>,
      TError = unknown
    >(
      variables: GetMemberMinimumSpendQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMemberMinimumSpendQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMemberMinimumSpendQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMemberMinimumSpendQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetMemberMinimumSpend.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMemberMinimumSpendQuery, GetMemberMinimumSpendQueryVariables>(GetMemberMinimumSpendDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMemberMinimumSpendQuery.getKey = (variables: GetMemberMinimumSpendQueryVariables) => ['GetMemberMinimumSpend.infinite', variables];


useGetMemberMinimumSpendQuery.fetcher = (variables: GetMemberMinimumSpendQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMemberMinimumSpendQuery, GetMemberMinimumSpendQueryVariables>(GetMemberMinimumSpendDocument, variables, options);

export const GetCurrentMemberSpendDocument = `
    query GetCurrentMemberSpend($memberId: ID!, $requirementId: ID!) {
  currentMemberSpend(memberId: $memberId, requirementId: $requirementId) {
    id
    clubId
    memberId
    requirementId
    periodStart
    periodEnd
    periodLabel
    requiredAmount
    currentSpend
    projectedSpend
    shortfallAmount
    carryForwardAmount
    status
    isExempt
    lastCalculatedAt
    requirement {
      id
      name
      minimumAmount
      period
    }
  }
}
    `;

export const useGetCurrentMemberSpendQuery = <
      TData = GetCurrentMemberSpendQuery,
      TError = unknown
    >(
      variables: GetCurrentMemberSpendQueryVariables,
      options?: Omit<UseQueryOptions<GetCurrentMemberSpendQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetCurrentMemberSpendQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetCurrentMemberSpendQuery, TError, TData>(
      {
    queryKey: ['GetCurrentMemberSpend', variables],
    queryFn: graphqlFetcher<GetCurrentMemberSpendQuery, GetCurrentMemberSpendQueryVariables>(GetCurrentMemberSpendDocument, variables),
    ...options
  }
    )};

useGetCurrentMemberSpendQuery.getKey = (variables: GetCurrentMemberSpendQueryVariables) => ['GetCurrentMemberSpend', variables];

export const useInfiniteGetCurrentMemberSpendQuery = <
      TData = InfiniteData<GetCurrentMemberSpendQuery>,
      TError = unknown
    >(
      variables: GetCurrentMemberSpendQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetCurrentMemberSpendQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetCurrentMemberSpendQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetCurrentMemberSpendQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetCurrentMemberSpend.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetCurrentMemberSpendQuery, GetCurrentMemberSpendQueryVariables>(GetCurrentMemberSpendDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetCurrentMemberSpendQuery.getKey = (variables: GetCurrentMemberSpendQueryVariables) => ['GetCurrentMemberSpend.infinite', variables];


useGetCurrentMemberSpendQuery.fetcher = (variables: GetCurrentMemberSpendQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetCurrentMemberSpendQuery, GetCurrentMemberSpendQueryVariables>(GetCurrentMemberSpendDocument, variables, options);

export const CreateMinimumSpendRequirementDocument = `
    mutation CreateMinimumSpendRequirement($input: CreateRequirementInput!) {
  createMinimumSpendRequirement(input: $input) {
    id
    name
    description
    membershipTypes
    minimumAmount
    period
    isActive
    createdAt
  }
}
    `;

export const useCreateMinimumSpendRequirementMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateMinimumSpendRequirementMutation, TError, CreateMinimumSpendRequirementMutationVariables, TContext>) => {
    
    return useMutation<CreateMinimumSpendRequirementMutation, TError, CreateMinimumSpendRequirementMutationVariables, TContext>(
      {
    mutationKey: ['CreateMinimumSpendRequirement'],
    mutationFn: (variables?: CreateMinimumSpendRequirementMutationVariables) => graphqlFetcher<CreateMinimumSpendRequirementMutation, CreateMinimumSpendRequirementMutationVariables>(CreateMinimumSpendRequirementDocument, variables)(),
    ...options
  }
    )};


useCreateMinimumSpendRequirementMutation.fetcher = (variables: CreateMinimumSpendRequirementMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateMinimumSpendRequirementMutation, CreateMinimumSpendRequirementMutationVariables>(CreateMinimumSpendRequirementDocument, variables, options);

export const UpdateMinimumSpendRequirementDocument = `
    mutation UpdateMinimumSpendRequirement($input: UpdateRequirementInput!) {
  updateMinimumSpendRequirement(input: $input) {
    id
    name
    description
    membershipTypes
    minimumAmount
    period
    isActive
    updatedAt
  }
}
    `;

export const useUpdateMinimumSpendRequirementMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateMinimumSpendRequirementMutation, TError, UpdateMinimumSpendRequirementMutationVariables, TContext>) => {
    
    return useMutation<UpdateMinimumSpendRequirementMutation, TError, UpdateMinimumSpendRequirementMutationVariables, TContext>(
      {
    mutationKey: ['UpdateMinimumSpendRequirement'],
    mutationFn: (variables?: UpdateMinimumSpendRequirementMutationVariables) => graphqlFetcher<UpdateMinimumSpendRequirementMutation, UpdateMinimumSpendRequirementMutationVariables>(UpdateMinimumSpendRequirementDocument, variables)(),
    ...options
  }
    )};


useUpdateMinimumSpendRequirementMutation.fetcher = (variables: UpdateMinimumSpendRequirementMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateMinimumSpendRequirementMutation, UpdateMinimumSpendRequirementMutationVariables>(UpdateMinimumSpendRequirementDocument, variables, options);

export const DeleteMinimumSpendRequirementDocument = `
    mutation DeleteMinimumSpendRequirement($id: ID!) {
  deleteMinimumSpendRequirement(id: $id) {
    id
    isActive
  }
}
    `;

export const useDeleteMinimumSpendRequirementMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteMinimumSpendRequirementMutation, TError, DeleteMinimumSpendRequirementMutationVariables, TContext>) => {
    
    return useMutation<DeleteMinimumSpendRequirementMutation, TError, DeleteMinimumSpendRequirementMutationVariables, TContext>(
      {
    mutationKey: ['DeleteMinimumSpendRequirement'],
    mutationFn: (variables?: DeleteMinimumSpendRequirementMutationVariables) => graphqlFetcher<DeleteMinimumSpendRequirementMutation, DeleteMinimumSpendRequirementMutationVariables>(DeleteMinimumSpendRequirementDocument, variables)(),
    ...options
  }
    )};


useDeleteMinimumSpendRequirementMutation.fetcher = (variables: DeleteMinimumSpendRequirementMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeleteMinimumSpendRequirementMutation, DeleteMinimumSpendRequirementMutationVariables>(DeleteMinimumSpendRequirementDocument, variables, options);

export const RecordMinimumSpendDocument = `
    mutation RecordMinimumSpend($input: RecordSpendInput!) {
  recordMinimumSpend(input: $input) {
    id
    currentSpend
    status
    lastCalculatedAt
    requirement {
      id
      name
      minimumAmount
    }
  }
}
    `;

export const useRecordMinimumSpendMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RecordMinimumSpendMutation, TError, RecordMinimumSpendMutationVariables, TContext>) => {
    
    return useMutation<RecordMinimumSpendMutation, TError, RecordMinimumSpendMutationVariables, TContext>(
      {
    mutationKey: ['RecordMinimumSpend'],
    mutationFn: (variables?: RecordMinimumSpendMutationVariables) => graphqlFetcher<RecordMinimumSpendMutation, RecordMinimumSpendMutationVariables>(RecordMinimumSpendDocument, variables)(),
    ...options
  }
    )};


useRecordMinimumSpendMutation.fetcher = (variables: RecordMinimumSpendMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<RecordMinimumSpendMutation, RecordMinimumSpendMutationVariables>(RecordMinimumSpendDocument, variables, options);

export const ResolveMinimumSpendShortfallDocument = `
    mutation ResolveMinimumSpendShortfall($input: ResolveShortfallInput!) {
  resolveMinimumSpendShortfall(input: $input) {
    id
    status
    shortfallAction
    shortfallResolvedBy
    shortfallResolvedAt
    shortfallNote
  }
}
    `;

export const useResolveMinimumSpendShortfallMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ResolveMinimumSpendShortfallMutation, TError, ResolveMinimumSpendShortfallMutationVariables, TContext>) => {
    
    return useMutation<ResolveMinimumSpendShortfallMutation, TError, ResolveMinimumSpendShortfallMutationVariables, TContext>(
      {
    mutationKey: ['ResolveMinimumSpendShortfall'],
    mutationFn: (variables?: ResolveMinimumSpendShortfallMutationVariables) => graphqlFetcher<ResolveMinimumSpendShortfallMutation, ResolveMinimumSpendShortfallMutationVariables>(ResolveMinimumSpendShortfallDocument, variables)(),
    ...options
  }
    )};


useResolveMinimumSpendShortfallMutation.fetcher = (variables: ResolveMinimumSpendShortfallMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ResolveMinimumSpendShortfallMutation, ResolveMinimumSpendShortfallMutationVariables>(ResolveMinimumSpendShortfallDocument, variables, options);

export const ExemptMemberFromMinimumSpendDocument = `
    mutation ExemptMemberFromMinimumSpend($input: ExemptMemberInput!) {
  exemptMemberFromMinimumSpend(input: $input) {
    id
    status
    isExempt
    exemptReason
    exemptBy
    exemptAt
  }
}
    `;

export const useExemptMemberFromMinimumSpendMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ExemptMemberFromMinimumSpendMutation, TError, ExemptMemberFromMinimumSpendMutationVariables, TContext>) => {
    
    return useMutation<ExemptMemberFromMinimumSpendMutation, TError, ExemptMemberFromMinimumSpendMutationVariables, TContext>(
      {
    mutationKey: ['ExemptMemberFromMinimumSpend'],
    mutationFn: (variables?: ExemptMemberFromMinimumSpendMutationVariables) => graphqlFetcher<ExemptMemberFromMinimumSpendMutation, ExemptMemberFromMinimumSpendMutationVariables>(ExemptMemberFromMinimumSpendDocument, variables)(),
    ...options
  }
    )};


useExemptMemberFromMinimumSpendMutation.fetcher = (variables: ExemptMemberFromMinimumSpendMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ExemptMemberFromMinimumSpendMutation, ExemptMemberFromMinimumSpendMutationVariables>(ExemptMemberFromMinimumSpendDocument, variables, options);

export const RemoveMinimumSpendExemptionDocument = `
    mutation RemoveMinimumSpendExemption($memberSpendId: ID!) {
  removeMinimumSpendExemption(memberSpendId: $memberSpendId) {
    id
    status
    isExempt
  }
}
    `;

export const useRemoveMinimumSpendExemptionMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RemoveMinimumSpendExemptionMutation, TError, RemoveMinimumSpendExemptionMutationVariables, TContext>) => {
    
    return useMutation<RemoveMinimumSpendExemptionMutation, TError, RemoveMinimumSpendExemptionMutationVariables, TContext>(
      {
    mutationKey: ['RemoveMinimumSpendExemption'],
    mutationFn: (variables?: RemoveMinimumSpendExemptionMutationVariables) => graphqlFetcher<RemoveMinimumSpendExemptionMutation, RemoveMinimumSpendExemptionMutationVariables>(RemoveMinimumSpendExemptionDocument, variables)(),
    ...options
  }
    )};


useRemoveMinimumSpendExemptionMutation.fetcher = (variables: RemoveMinimumSpendExemptionMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<RemoveMinimumSpendExemptionMutation, RemoveMinimumSpendExemptionMutationVariables>(RemoveMinimumSpendExemptionDocument, variables, options);

export const CloseMinimumSpendPeriodDocument = `
    mutation CloseMinimumSpendPeriod($input: ClosePeriodInput!) {
  closeMinimumSpendPeriod(input: $input) {
    id
    status
    shortfallAmount
    shortfallAction
  }
}
    `;

export const useCloseMinimumSpendPeriodMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CloseMinimumSpendPeriodMutation, TError, CloseMinimumSpendPeriodMutationVariables, TContext>) => {
    
    return useMutation<CloseMinimumSpendPeriodMutation, TError, CloseMinimumSpendPeriodMutationVariables, TContext>(
      {
    mutationKey: ['CloseMinimumSpendPeriod'],
    mutationFn: (variables?: CloseMinimumSpendPeriodMutationVariables) => graphqlFetcher<CloseMinimumSpendPeriodMutation, CloseMinimumSpendPeriodMutationVariables>(CloseMinimumSpendPeriodDocument, variables)(),
    ...options
  }
    )};


useCloseMinimumSpendPeriodMutation.fetcher = (variables: CloseMinimumSpendPeriodMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CloseMinimumSpendPeriodMutation, CloseMinimumSpendPeriodMutationVariables>(CloseMinimumSpendPeriodDocument, variables, options);

export const RecalculateMemberSpendDocument = `
    mutation RecalculateMemberSpend($memberSpendId: ID!) {
  recalculateMemberSpend(memberSpendId: $memberSpendId) {
    id
    currentSpend
    status
    lastCalculatedAt
  }
}
    `;

export const useRecalculateMemberSpendMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RecalculateMemberSpendMutation, TError, RecalculateMemberSpendMutationVariables, TContext>) => {
    
    return useMutation<RecalculateMemberSpendMutation, TError, RecalculateMemberSpendMutationVariables, TContext>(
      {
    mutationKey: ['RecalculateMemberSpend'],
    mutationFn: (variables?: RecalculateMemberSpendMutationVariables) => graphqlFetcher<RecalculateMemberSpendMutation, RecalculateMemberSpendMutationVariables>(RecalculateMemberSpendDocument, variables)(),
    ...options
  }
    )};


useRecalculateMemberSpendMutation.fetcher = (variables: RecalculateMemberSpendMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<RecalculateMemberSpendMutation, RecalculateMemberSpendMutationVariables>(RecalculateMemberSpendDocument, variables, options);

export const GetPosConfigDocument = `
    query GetPOSConfig($outletId: ID!, $userRole: String!, $userPermissions: [String!]) {
  posConfig(
    outletId: $outletId
    userRole: $userRole
    userPermissions: $userPermissions
  ) {
    outlet {
      id
      clubId
      name
      outletType
      isActive
    }
    template {
      id
      name
      outletType
    }
    toolbarConfig
    actionBarConfig
    buttonStates {
      buttonId
      visible
      enabled
      requiresApproval
    }
  }
}
    `;

export const useGetPosConfigQuery = <
      TData = GetPosConfigQuery,
      TError = unknown
    >(
      variables: GetPosConfigQueryVariables,
      options?: Omit<UseQueryOptions<GetPosConfigQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetPosConfigQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetPosConfigQuery, TError, TData>(
      {
    queryKey: ['GetPOSConfig', variables],
    queryFn: graphqlFetcher<GetPosConfigQuery, GetPosConfigQueryVariables>(GetPosConfigDocument, variables),
    ...options
  }
    )};

useGetPosConfigQuery.getKey = (variables: GetPosConfigQueryVariables) => ['GetPOSConfig', variables];

export const useInfiniteGetPosConfigQuery = <
      TData = InfiniteData<GetPosConfigQuery>,
      TError = unknown
    >(
      variables: GetPosConfigQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetPosConfigQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetPosConfigQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetPosConfigQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetPOSConfig.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetPosConfigQuery, GetPosConfigQueryVariables>(GetPosConfigDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetPosConfigQuery.getKey = (variables: GetPosConfigQueryVariables) => ['GetPOSConfig.infinite', variables];


useGetPosConfigQuery.fetcher = (variables: GetPosConfigQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetPosConfigQuery, GetPosConfigQueryVariables>(GetPosConfigDocument, variables, options);

export const GetPosTemplatesDocument = `
    query GetPOSTemplates {
  posTemplates {
    id
    clubId
    name
    description
    outletType
    toolbarConfig
    actionBarConfig
    isDefault
    createdAt
    updatedAt
  }
}
    `;

export const useGetPosTemplatesQuery = <
      TData = GetPosTemplatesQuery,
      TError = unknown
    >(
      variables?: GetPosTemplatesQueryVariables,
      options?: Omit<UseQueryOptions<GetPosTemplatesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetPosTemplatesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetPosTemplatesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetPOSTemplates'] : ['GetPOSTemplates', variables],
    queryFn: graphqlFetcher<GetPosTemplatesQuery, GetPosTemplatesQueryVariables>(GetPosTemplatesDocument, variables),
    ...options
  }
    )};

useGetPosTemplatesQuery.getKey = (variables?: GetPosTemplatesQueryVariables) => variables === undefined ? ['GetPOSTemplates'] : ['GetPOSTemplates', variables];

export const useInfiniteGetPosTemplatesQuery = <
      TData = InfiniteData<GetPosTemplatesQuery>,
      TError = unknown
    >(
      variables: GetPosTemplatesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetPosTemplatesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetPosTemplatesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetPosTemplatesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetPOSTemplates.infinite'] : ['GetPOSTemplates.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetPosTemplatesQuery, GetPosTemplatesQueryVariables>(GetPosTemplatesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetPosTemplatesQuery.getKey = (variables?: GetPosTemplatesQueryVariables) => variables === undefined ? ['GetPOSTemplates.infinite'] : ['GetPOSTemplates.infinite', variables];


useGetPosTemplatesQuery.fetcher = (variables?: GetPosTemplatesQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetPosTemplatesQuery, GetPosTemplatesQueryVariables>(GetPosTemplatesDocument, variables, options);

export const GetPosTemplateDocument = `
    query GetPOSTemplate($id: ID!) {
  posTemplate(id: $id) {
    id
    clubId
    name
    description
    outletType
    toolbarConfig
    actionBarConfig
    isDefault
    createdAt
    updatedAt
    outlets {
      id
      name
    }
  }
}
    `;

export const useGetPosTemplateQuery = <
      TData = GetPosTemplateQuery,
      TError = unknown
    >(
      variables: GetPosTemplateQueryVariables,
      options?: Omit<UseQueryOptions<GetPosTemplateQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetPosTemplateQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetPosTemplateQuery, TError, TData>(
      {
    queryKey: ['GetPOSTemplate', variables],
    queryFn: graphqlFetcher<GetPosTemplateQuery, GetPosTemplateQueryVariables>(GetPosTemplateDocument, variables),
    ...options
  }
    )};

useGetPosTemplateQuery.getKey = (variables: GetPosTemplateQueryVariables) => ['GetPOSTemplate', variables];

export const useInfiniteGetPosTemplateQuery = <
      TData = InfiniteData<GetPosTemplateQuery>,
      TError = unknown
    >(
      variables: GetPosTemplateQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetPosTemplateQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetPosTemplateQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetPosTemplateQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetPOSTemplate.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetPosTemplateQuery, GetPosTemplateQueryVariables>(GetPosTemplateDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetPosTemplateQuery.getKey = (variables: GetPosTemplateQueryVariables) => ['GetPOSTemplate.infinite', variables];


useGetPosTemplateQuery.fetcher = (variables: GetPosTemplateQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetPosTemplateQuery, GetPosTemplateQueryVariables>(GetPosTemplateDocument, variables, options);

export const GetPosOutletsDocument = `
    query GetPOSOutlets {
  posOutlets {
    id
    clubId
    name
    outletType
    templateId
    customConfig
    isActive
    createdAt
    updatedAt
    template {
      id
      name
    }
  }
}
    `;

export const useGetPosOutletsQuery = <
      TData = GetPosOutletsQuery,
      TError = unknown
    >(
      variables?: GetPosOutletsQueryVariables,
      options?: Omit<UseQueryOptions<GetPosOutletsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetPosOutletsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetPosOutletsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetPOSOutlets'] : ['GetPOSOutlets', variables],
    queryFn: graphqlFetcher<GetPosOutletsQuery, GetPosOutletsQueryVariables>(GetPosOutletsDocument, variables),
    ...options
  }
    )};

useGetPosOutletsQuery.getKey = (variables?: GetPosOutletsQueryVariables) => variables === undefined ? ['GetPOSOutlets'] : ['GetPOSOutlets', variables];

export const useInfiniteGetPosOutletsQuery = <
      TData = InfiniteData<GetPosOutletsQuery>,
      TError = unknown
    >(
      variables: GetPosOutletsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetPosOutletsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetPosOutletsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetPosOutletsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetPOSOutlets.infinite'] : ['GetPOSOutlets.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetPosOutletsQuery, GetPosOutletsQueryVariables>(GetPosOutletsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetPosOutletsQuery.getKey = (variables?: GetPosOutletsQueryVariables) => variables === undefined ? ['GetPOSOutlets.infinite'] : ['GetPOSOutlets.infinite', variables];


useGetPosOutletsQuery.fetcher = (variables?: GetPosOutletsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetPosOutletsQuery, GetPosOutletsQueryVariables>(GetPosOutletsDocument, variables, options);

export const GetPosOutletDocument = `
    query GetPOSOutlet($id: ID!) {
  posOutlet(id: $id) {
    id
    clubId
    name
    outletType
    templateId
    customConfig
    isActive
    createdAt
    updatedAt
    template {
      id
      name
    }
    roleConfigs {
      id
      role
      buttonOverrides
    }
  }
}
    `;

export const useGetPosOutletQuery = <
      TData = GetPosOutletQuery,
      TError = unknown
    >(
      variables: GetPosOutletQueryVariables,
      options?: Omit<UseQueryOptions<GetPosOutletQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetPosOutletQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetPosOutletQuery, TError, TData>(
      {
    queryKey: ['GetPOSOutlet', variables],
    queryFn: graphqlFetcher<GetPosOutletQuery, GetPosOutletQueryVariables>(GetPosOutletDocument, variables),
    ...options
  }
    )};

useGetPosOutletQuery.getKey = (variables: GetPosOutletQueryVariables) => ['GetPOSOutlet', variables];

export const useInfiniteGetPosOutletQuery = <
      TData = InfiniteData<GetPosOutletQuery>,
      TError = unknown
    >(
      variables: GetPosOutletQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetPosOutletQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetPosOutletQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetPosOutletQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetPOSOutlet.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetPosOutletQuery, GetPosOutletQueryVariables>(GetPosOutletDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetPosOutletQuery.getKey = (variables: GetPosOutletQueryVariables) => ['GetPOSOutlet.infinite', variables];


useGetPosOutletQuery.fetcher = (variables: GetPosOutletQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetPosOutletQuery, GetPosOutletQueryVariables>(GetPosOutletDocument, variables, options);

export const GetPosButtonRegistryDocument = `
    query GetPOSButtonRegistry {
  posButtonRegistry {
    clubId
    registry
  }
}
    `;

export const useGetPosButtonRegistryQuery = <
      TData = GetPosButtonRegistryQuery,
      TError = unknown
    >(
      variables?: GetPosButtonRegistryQueryVariables,
      options?: Omit<UseQueryOptions<GetPosButtonRegistryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetPosButtonRegistryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetPosButtonRegistryQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetPOSButtonRegistry'] : ['GetPOSButtonRegistry', variables],
    queryFn: graphqlFetcher<GetPosButtonRegistryQuery, GetPosButtonRegistryQueryVariables>(GetPosButtonRegistryDocument, variables),
    ...options
  }
    )};

useGetPosButtonRegistryQuery.getKey = (variables?: GetPosButtonRegistryQueryVariables) => variables === undefined ? ['GetPOSButtonRegistry'] : ['GetPOSButtonRegistry', variables];

export const useInfiniteGetPosButtonRegistryQuery = <
      TData = InfiniteData<GetPosButtonRegistryQuery>,
      TError = unknown
    >(
      variables: GetPosButtonRegistryQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetPosButtonRegistryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetPosButtonRegistryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetPosButtonRegistryQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetPOSButtonRegistry.infinite'] : ['GetPOSButtonRegistry.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetPosButtonRegistryQuery, GetPosButtonRegistryQueryVariables>(GetPosButtonRegistryDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetPosButtonRegistryQuery.getKey = (variables?: GetPosButtonRegistryQueryVariables) => variables === undefined ? ['GetPOSButtonRegistry.infinite'] : ['GetPOSButtonRegistry.infinite', variables];


useGetPosButtonRegistryQuery.fetcher = (variables?: GetPosButtonRegistryQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetPosButtonRegistryQuery, GetPosButtonRegistryQueryVariables>(GetPosButtonRegistryDocument, variables, options);

export const UpsertPosTemplateDocument = `
    mutation UpsertPOSTemplate($id: ID, $input: POSTemplateInput!) {
  upsertPOSTemplate(id: $id, input: $input) {
    success
    message
    template {
      id
      name
    }
  }
}
    `;

export const useUpsertPosTemplateMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpsertPosTemplateMutation, TError, UpsertPosTemplateMutationVariables, TContext>) => {
    
    return useMutation<UpsertPosTemplateMutation, TError, UpsertPosTemplateMutationVariables, TContext>(
      {
    mutationKey: ['UpsertPOSTemplate'],
    mutationFn: (variables?: UpsertPosTemplateMutationVariables) => graphqlFetcher<UpsertPosTemplateMutation, UpsertPosTemplateMutationVariables>(UpsertPosTemplateDocument, variables)(),
    ...options
  }
    )};


useUpsertPosTemplateMutation.fetcher = (variables: UpsertPosTemplateMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpsertPosTemplateMutation, UpsertPosTemplateMutationVariables>(UpsertPosTemplateDocument, variables, options);

export const ClonePosTemplateDocument = `
    mutation ClonePOSTemplate($id: ID!, $newName: String!) {
  clonePOSTemplate(id: $id, newName: $newName) {
    success
    message
    template {
      id
      name
    }
  }
}
    `;

export const useClonePosTemplateMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ClonePosTemplateMutation, TError, ClonePosTemplateMutationVariables, TContext>) => {
    
    return useMutation<ClonePosTemplateMutation, TError, ClonePosTemplateMutationVariables, TContext>(
      {
    mutationKey: ['ClonePOSTemplate'],
    mutationFn: (variables?: ClonePosTemplateMutationVariables) => graphqlFetcher<ClonePosTemplateMutation, ClonePosTemplateMutationVariables>(ClonePosTemplateDocument, variables)(),
    ...options
  }
    )};


useClonePosTemplateMutation.fetcher = (variables: ClonePosTemplateMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ClonePosTemplateMutation, ClonePosTemplateMutationVariables>(ClonePosTemplateDocument, variables, options);

export const DeletePosTemplateDocument = `
    mutation DeletePOSTemplate($id: ID!) {
  deletePOSTemplate(id: $id) {
    success
    message
  }
}
    `;

export const useDeletePosTemplateMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeletePosTemplateMutation, TError, DeletePosTemplateMutationVariables, TContext>) => {
    
    return useMutation<DeletePosTemplateMutation, TError, DeletePosTemplateMutationVariables, TContext>(
      {
    mutationKey: ['DeletePOSTemplate'],
    mutationFn: (variables?: DeletePosTemplateMutationVariables) => graphqlFetcher<DeletePosTemplateMutation, DeletePosTemplateMutationVariables>(DeletePosTemplateDocument, variables)(),
    ...options
  }
    )};


useDeletePosTemplateMutation.fetcher = (variables: DeletePosTemplateMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeletePosTemplateMutation, DeletePosTemplateMutationVariables>(DeletePosTemplateDocument, variables, options);

export const AssignPosTemplateDocument = `
    mutation AssignPOSTemplate($input: AssignTemplateInput!) {
  assignPOSTemplate(input: $input) {
    success
    message
    outlet {
      id
      name
      templateId
    }
  }
}
    `;

export const useAssignPosTemplateMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AssignPosTemplateMutation, TError, AssignPosTemplateMutationVariables, TContext>) => {
    
    return useMutation<AssignPosTemplateMutation, TError, AssignPosTemplateMutationVariables, TContext>(
      {
    mutationKey: ['AssignPOSTemplate'],
    mutationFn: (variables?: AssignPosTemplateMutationVariables) => graphqlFetcher<AssignPosTemplateMutation, AssignPosTemplateMutationVariables>(AssignPosTemplateDocument, variables)(),
    ...options
  }
    )};


useAssignPosTemplateMutation.fetcher = (variables: AssignPosTemplateMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<AssignPosTemplateMutation, AssignPosTemplateMutationVariables>(AssignPosTemplateDocument, variables, options);

export const SetPosRoleOverridesDocument = `
    mutation SetPOSRoleOverrides($outletId: ID!, $input: POSRoleOverridesInput!) {
  setPOSRoleOverrides(outletId: $outletId, input: $input) {
    success
    message
    roleConfig {
      id
      role
      buttonOverrides
    }
  }
}
    `;

export const useSetPosRoleOverridesMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<SetPosRoleOverridesMutation, TError, SetPosRoleOverridesMutationVariables, TContext>) => {
    
    return useMutation<SetPosRoleOverridesMutation, TError, SetPosRoleOverridesMutationVariables, TContext>(
      {
    mutationKey: ['SetPOSRoleOverrides'],
    mutationFn: (variables?: SetPosRoleOverridesMutationVariables) => graphqlFetcher<SetPosRoleOverridesMutation, SetPosRoleOverridesMutationVariables>(SetPosRoleOverridesDocument, variables)(),
    ...options
  }
    )};


useSetPosRoleOverridesMutation.fetcher = (variables: SetPosRoleOverridesMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<SetPosRoleOverridesMutation, SetPosRoleOverridesMutationVariables>(SetPosRoleOverridesDocument, variables, options);

export const UpdatePosButtonRegistryDocument = `
    mutation UpdatePOSButtonRegistry($input: UpdateButtonRegistryInput!) {
  updatePOSButtonRegistry(input: $input) {
    success
    message
  }
}
    `;

export const useUpdatePosButtonRegistryMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdatePosButtonRegistryMutation, TError, UpdatePosButtonRegistryMutationVariables, TContext>) => {
    
    return useMutation<UpdatePosButtonRegistryMutation, TError, UpdatePosButtonRegistryMutationVariables, TContext>(
      {
    mutationKey: ['UpdatePOSButtonRegistry'],
    mutationFn: (variables?: UpdatePosButtonRegistryMutationVariables) => graphqlFetcher<UpdatePosButtonRegistryMutation, UpdatePosButtonRegistryMutationVariables>(UpdatePosButtonRegistryDocument, variables)(),
    ...options
  }
    )};


useUpdatePosButtonRegistryMutation.fetcher = (variables: UpdatePosButtonRegistryMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdatePosButtonRegistryMutation, UpdatePosButtonRegistryMutationVariables>(UpdatePosButtonRegistryDocument, variables, options);

export const GetOutletProductPanelDocument = `
    query GetOutletProductPanel($outletId: ID!) {
  outletProductPanel(outletId: $outletId) {
    gridConfig {
      id
      gridColumns
      gridRows
      tileSize
      showImages
      showPrices
      categoryStyle
      showAllCategory
      quickKeysEnabled
      quickKeysCount
      quickKeysPosition
    }
    quickKeys {
      id
      name
      basePrice
      imageUrl
      productType
      category {
        id
        color
      }
    }
    suggestions {
      id
      name
      basePrice
      imageUrl
      productType
      category {
        id
        color
      }
    }
  }
  productCategories {
    id
    name
    color
    iconName
    sortOrder
    parentId
  }
}
    `;

export const useGetOutletProductPanelQuery = <
      TData = GetOutletProductPanelQuery,
      TError = unknown
    >(
      variables: GetOutletProductPanelQueryVariables,
      options?: Omit<UseQueryOptions<GetOutletProductPanelQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetOutletProductPanelQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetOutletProductPanelQuery, TError, TData>(
      {
    queryKey: ['GetOutletProductPanel', variables],
    queryFn: graphqlFetcher<GetOutletProductPanelQuery, GetOutletProductPanelQueryVariables>(GetOutletProductPanelDocument, variables),
    ...options
  }
    )};

useGetOutletProductPanelQuery.getKey = (variables: GetOutletProductPanelQueryVariables) => ['GetOutletProductPanel', variables];

export const useInfiniteGetOutletProductPanelQuery = <
      TData = InfiniteData<GetOutletProductPanelQuery>,
      TError = unknown
    >(
      variables: GetOutletProductPanelQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetOutletProductPanelQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetOutletProductPanelQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetOutletProductPanelQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetOutletProductPanel.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetOutletProductPanelQuery, GetOutletProductPanelQueryVariables>(GetOutletProductPanelDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetOutletProductPanelQuery.getKey = (variables: GetOutletProductPanelQueryVariables) => ['GetOutletProductPanel.infinite', variables];


useGetOutletProductPanelQuery.fetcher = (variables: GetOutletProductPanelQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetOutletProductPanelQuery, GetOutletProductPanelQueryVariables>(GetOutletProductPanelDocument, variables, options);

export const SmartSuggestionsDocument = `
    query SmartSuggestions($outletId: ID!) {
  smartSuggestions(outletId: $outletId) {
    id
    name
    basePrice
    imageUrl
    productType
    category {
      id
      color
    }
  }
}
    `;

export const useSmartSuggestionsQuery = <
      TData = SmartSuggestionsQuery,
      TError = unknown
    >(
      variables: SmartSuggestionsQueryVariables,
      options?: Omit<UseQueryOptions<SmartSuggestionsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<SmartSuggestionsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<SmartSuggestionsQuery, TError, TData>(
      {
    queryKey: ['SmartSuggestions', variables],
    queryFn: graphqlFetcher<SmartSuggestionsQuery, SmartSuggestionsQueryVariables>(SmartSuggestionsDocument, variables),
    ...options
  }
    )};

useSmartSuggestionsQuery.getKey = (variables: SmartSuggestionsQueryVariables) => ['SmartSuggestions', variables];

export const useInfiniteSmartSuggestionsQuery = <
      TData = InfiniteData<SmartSuggestionsQuery>,
      TError = unknown
    >(
      variables: SmartSuggestionsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<SmartSuggestionsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<SmartSuggestionsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<SmartSuggestionsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['SmartSuggestions.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<SmartSuggestionsQuery, SmartSuggestionsQueryVariables>(SmartSuggestionsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteSmartSuggestionsQuery.getKey = (variables: SmartSuggestionsQueryVariables) => ['SmartSuggestions.infinite', variables];


useSmartSuggestionsQuery.fetcher = (variables: SmartSuggestionsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<SmartSuggestionsQuery, SmartSuggestionsQueryVariables>(SmartSuggestionsDocument, variables, options);

export const OutletProductConfigsDocument = `
    query OutletProductConfigs($outletId: ID!) {
  outletProductConfigs(outletId: $outletId) {
    id
    productId
    displayName
    buttonColor
    sortPriority
    gridPosition
    isVisible
    visibilityRules
    isQuickKey
    quickKeyPosition
    product {
      id
      name
      sku
      productType
      basePrice
      imageUrl
      category {
        id
        name
        color
      }
    }
  }
}
    `;

export const useOutletProductConfigsQuery = <
      TData = OutletProductConfigsQuery,
      TError = unknown
    >(
      variables: OutletProductConfigsQueryVariables,
      options?: Omit<UseQueryOptions<OutletProductConfigsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<OutletProductConfigsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<OutletProductConfigsQuery, TError, TData>(
      {
    queryKey: ['OutletProductConfigs', variables],
    queryFn: graphqlFetcher<OutletProductConfigsQuery, OutletProductConfigsQueryVariables>(OutletProductConfigsDocument, variables),
    ...options
  }
    )};

useOutletProductConfigsQuery.getKey = (variables: OutletProductConfigsQueryVariables) => ['OutletProductConfigs', variables];

export const useInfiniteOutletProductConfigsQuery = <
      TData = InfiniteData<OutletProductConfigsQuery>,
      TError = unknown
    >(
      variables: OutletProductConfigsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<OutletProductConfigsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<OutletProductConfigsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<OutletProductConfigsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['OutletProductConfigs.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<OutletProductConfigsQuery, OutletProductConfigsQueryVariables>(OutletProductConfigsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteOutletProductConfigsQuery.getKey = (variables: OutletProductConfigsQueryVariables) => ['OutletProductConfigs.infinite', variables];


useOutletProductConfigsQuery.fetcher = (variables: OutletProductConfigsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<OutletProductConfigsQuery, OutletProductConfigsQueryVariables>(OutletProductConfigsDocument, variables, options);

export const UpdateOutletProductConfigDocument = `
    mutation UpdateOutletProductConfig($outletId: ID!, $productId: ID!, $input: UpdateOutletProductConfigInput!) {
  updateOutletProductConfig(
    outletId: $outletId
    productId: $productId
    input: $input
  ) {
    id
    displayName
    buttonColor
    sortPriority
    isVisible
    isQuickKey
    quickKeyPosition
  }
}
    `;

export const useUpdateOutletProductConfigMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateOutletProductConfigMutation, TError, UpdateOutletProductConfigMutationVariables, TContext>) => {
    
    return useMutation<UpdateOutletProductConfigMutation, TError, UpdateOutletProductConfigMutationVariables, TContext>(
      {
    mutationKey: ['UpdateOutletProductConfig'],
    mutationFn: (variables?: UpdateOutletProductConfigMutationVariables) => graphqlFetcher<UpdateOutletProductConfigMutation, UpdateOutletProductConfigMutationVariables>(UpdateOutletProductConfigDocument, variables)(),
    ...options
  }
    )};


useUpdateOutletProductConfigMutation.fetcher = (variables: UpdateOutletProductConfigMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateOutletProductConfigMutation, UpdateOutletProductConfigMutationVariables>(UpdateOutletProductConfigDocument, variables, options);

export const BulkUpdateOutletProductConfigsDocument = `
    mutation BulkUpdateOutletProductConfigs($outletId: ID!, $input: BulkOutletProductConfigInput!) {
  bulkUpdateOutletProductConfigs(outletId: $outletId, input: $input) {
    id
    isVisible
    isQuickKey
  }
}
    `;

export const useBulkUpdateOutletProductConfigsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<BulkUpdateOutletProductConfigsMutation, TError, BulkUpdateOutletProductConfigsMutationVariables, TContext>) => {
    
    return useMutation<BulkUpdateOutletProductConfigsMutation, TError, BulkUpdateOutletProductConfigsMutationVariables, TContext>(
      {
    mutationKey: ['BulkUpdateOutletProductConfigs'],
    mutationFn: (variables?: BulkUpdateOutletProductConfigsMutationVariables) => graphqlFetcher<BulkUpdateOutletProductConfigsMutation, BulkUpdateOutletProductConfigsMutationVariables>(BulkUpdateOutletProductConfigsDocument, variables)(),
    ...options
  }
    )};


useBulkUpdateOutletProductConfigsMutation.fetcher = (variables: BulkUpdateOutletProductConfigsMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<BulkUpdateOutletProductConfigsMutation, BulkUpdateOutletProductConfigsMutationVariables>(BulkUpdateOutletProductConfigsDocument, variables, options);

export const UpdateOutletGridConfigDocument = `
    mutation UpdateOutletGridConfig($outletId: ID!, $input: UpdateOutletGridConfigInput!) {
  updateOutletGridConfig(outletId: $outletId, input: $input) {
    id
    gridColumns
    gridRows
    tileSize
    showImages
    showPrices
    categoryStyle
    quickKeysEnabled
    quickKeysCount
    quickKeysPosition
  }
}
    `;

export const useUpdateOutletGridConfigMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateOutletGridConfigMutation, TError, UpdateOutletGridConfigMutationVariables, TContext>) => {
    
    return useMutation<UpdateOutletGridConfigMutation, TError, UpdateOutletGridConfigMutationVariables, TContext>(
      {
    mutationKey: ['UpdateOutletGridConfig'],
    mutationFn: (variables?: UpdateOutletGridConfigMutationVariables) => graphqlFetcher<UpdateOutletGridConfigMutation, UpdateOutletGridConfigMutationVariables>(UpdateOutletGridConfigDocument, variables)(),
    ...options
  }
    )};


useUpdateOutletGridConfigMutation.fetcher = (variables: UpdateOutletGridConfigMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateOutletGridConfigMutation, UpdateOutletGridConfigMutationVariables>(UpdateOutletGridConfigDocument, variables, options);

export const UpdateSmartSuggestionConfigDocument = `
    mutation UpdateSmartSuggestionConfig($outletId: ID!, $input: UpdateSmartSuggestionConfigInput!) {
  updateSmartSuggestionConfig(outletId: $outletId, input: $input) {
    id
    enabled
    suggestionCount
    position
    timeOfDayWeight
    salesVelocityWeight
    staffHistoryWeight
  }
}
    `;

export const useUpdateSmartSuggestionConfigMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateSmartSuggestionConfigMutation, TError, UpdateSmartSuggestionConfigMutationVariables, TContext>) => {
    
    return useMutation<UpdateSmartSuggestionConfigMutation, TError, UpdateSmartSuggestionConfigMutationVariables, TContext>(
      {
    mutationKey: ['UpdateSmartSuggestionConfig'],
    mutationFn: (variables?: UpdateSmartSuggestionConfigMutationVariables) => graphqlFetcher<UpdateSmartSuggestionConfigMutation, UpdateSmartSuggestionConfigMutationVariables>(UpdateSmartSuggestionConfigDocument, variables)(),
    ...options
  }
    )};


useUpdateSmartSuggestionConfigMutation.fetcher = (variables: UpdateSmartSuggestionConfigMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateSmartSuggestionConfigMutation, UpdateSmartSuggestionConfigMutationVariables>(UpdateSmartSuggestionConfigDocument, variables, options);

export const GetMemberPaymentMethodsDocument = `
    query GetMemberPaymentMethods($memberId: ID!, $activeOnly: Boolean) {
  memberPaymentMethods(memberId: $memberId, activeOnly: $activeOnly) {
    id
    clubId
    memberId
    stripeCustomerId
    stripePaymentMethodId
    type
    brand
    last4
    expiryMonth
    expiryYear
    cardholderName
    status
    isDefault
    isAutoPayEnabled
    verifiedAt
    lastUsedAt
    failureCount
    lastFailureReason
    createdAt
    updatedAt
  }
}
    `;

export const useGetMemberPaymentMethodsQuery = <
      TData = GetMemberPaymentMethodsQuery,
      TError = unknown
    >(
      variables: GetMemberPaymentMethodsQueryVariables,
      options?: Omit<UseQueryOptions<GetMemberPaymentMethodsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMemberPaymentMethodsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMemberPaymentMethodsQuery, TError, TData>(
      {
    queryKey: ['GetMemberPaymentMethods', variables],
    queryFn: graphqlFetcher<GetMemberPaymentMethodsQuery, GetMemberPaymentMethodsQueryVariables>(GetMemberPaymentMethodsDocument, variables),
    ...options
  }
    )};

useGetMemberPaymentMethodsQuery.getKey = (variables: GetMemberPaymentMethodsQueryVariables) => ['GetMemberPaymentMethods', variables];

export const useInfiniteGetMemberPaymentMethodsQuery = <
      TData = InfiniteData<GetMemberPaymentMethodsQuery>,
      TError = unknown
    >(
      variables: GetMemberPaymentMethodsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMemberPaymentMethodsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMemberPaymentMethodsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMemberPaymentMethodsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetMemberPaymentMethods.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMemberPaymentMethodsQuery, GetMemberPaymentMethodsQueryVariables>(GetMemberPaymentMethodsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMemberPaymentMethodsQuery.getKey = (variables: GetMemberPaymentMethodsQueryVariables) => ['GetMemberPaymentMethods.infinite', variables];


useGetMemberPaymentMethodsQuery.fetcher = (variables: GetMemberPaymentMethodsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMemberPaymentMethodsQuery, GetMemberPaymentMethodsQueryVariables>(GetMemberPaymentMethodsDocument, variables, options);

export const GetPaymentMethodDocument = `
    query GetPaymentMethod($id: ID!) {
  paymentMethod(id: $id) {
    id
    clubId
    memberId
    stripeCustomerId
    stripePaymentMethodId
    type
    brand
    last4
    expiryMonth
    expiryYear
    cardholderName
    status
    isDefault
    isAutoPayEnabled
    verifiedAt
    lastUsedAt
    failureCount
    lastFailureReason
    createdAt
    updatedAt
  }
}
    `;

export const useGetPaymentMethodQuery = <
      TData = GetPaymentMethodQuery,
      TError = unknown
    >(
      variables: GetPaymentMethodQueryVariables,
      options?: Omit<UseQueryOptions<GetPaymentMethodQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetPaymentMethodQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetPaymentMethodQuery, TError, TData>(
      {
    queryKey: ['GetPaymentMethod', variables],
    queryFn: graphqlFetcher<GetPaymentMethodQuery, GetPaymentMethodQueryVariables>(GetPaymentMethodDocument, variables),
    ...options
  }
    )};

useGetPaymentMethodQuery.getKey = (variables: GetPaymentMethodQueryVariables) => ['GetPaymentMethod', variables];

export const useInfiniteGetPaymentMethodQuery = <
      TData = InfiniteData<GetPaymentMethodQuery>,
      TError = unknown
    >(
      variables: GetPaymentMethodQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetPaymentMethodQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetPaymentMethodQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetPaymentMethodQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetPaymentMethod.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetPaymentMethodQuery, GetPaymentMethodQueryVariables>(GetPaymentMethodDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetPaymentMethodQuery.getKey = (variables: GetPaymentMethodQueryVariables) => ['GetPaymentMethod.infinite', variables];


useGetPaymentMethodQuery.fetcher = (variables: GetPaymentMethodQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetPaymentMethodQuery, GetPaymentMethodQueryVariables>(GetPaymentMethodDocument, variables, options);

export const GetMemberAutoPaySettingDocument = `
    query GetMemberAutoPaySetting($memberId: ID!) {
  memberAutoPaySetting(memberId: $memberId) {
    id
    clubId
    memberId
    paymentMethodId
    isEnabled
    schedule
    paymentDayOfMonth
    maxPaymentAmount
    monthlyMaxAmount
    requireApprovalAbove
    payDuesOnly
    excludeCategories
    notifyBeforePayment
    notifyDaysBefore
    notifyOnSuccess
    notifyOnFailure
    maxRetryAttempts
    retryIntervalDays
    createdAt
    updatedAt
    paymentMethod {
      id
      brand
      last4
      isDefault
    }
  }
}
    `;

export const useGetMemberAutoPaySettingQuery = <
      TData = GetMemberAutoPaySettingQuery,
      TError = unknown
    >(
      variables: GetMemberAutoPaySettingQueryVariables,
      options?: Omit<UseQueryOptions<GetMemberAutoPaySettingQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMemberAutoPaySettingQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMemberAutoPaySettingQuery, TError, TData>(
      {
    queryKey: ['GetMemberAutoPaySetting', variables],
    queryFn: graphqlFetcher<GetMemberAutoPaySettingQuery, GetMemberAutoPaySettingQueryVariables>(GetMemberAutoPaySettingDocument, variables),
    ...options
  }
    )};

useGetMemberAutoPaySettingQuery.getKey = (variables: GetMemberAutoPaySettingQueryVariables) => ['GetMemberAutoPaySetting', variables];

export const useInfiniteGetMemberAutoPaySettingQuery = <
      TData = InfiniteData<GetMemberAutoPaySettingQuery>,
      TError = unknown
    >(
      variables: GetMemberAutoPaySettingQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMemberAutoPaySettingQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMemberAutoPaySettingQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMemberAutoPaySettingQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetMemberAutoPaySetting.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMemberAutoPaySettingQuery, GetMemberAutoPaySettingQueryVariables>(GetMemberAutoPaySettingDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMemberAutoPaySettingQuery.getKey = (variables: GetMemberAutoPaySettingQueryVariables) => ['GetMemberAutoPaySetting.infinite', variables];


useGetMemberAutoPaySettingQuery.fetcher = (variables: GetMemberAutoPaySettingQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMemberAutoPaySettingQuery, GetMemberAutoPaySettingQueryVariables>(GetMemberAutoPaySettingDocument, variables, options);

export const GetMemberAutoPayHistoryDocument = `
    query GetMemberAutoPayHistory($input: GetAutoPayHistoryInput!) {
  memberAutoPayHistory(input: $input) {
    id
    clubId
    memberId
    paymentMethodId
    invoiceId
    amount
    attemptNumber
    status
    stripePaymentIntentId
    stripeChargeId
    processedAt
    succeededAt
    failedAt
    failureCode
    failureMessage
    nextRetryAt
    isManualRetry
    paymentTransactionId
    createdAt
    updatedAt
    paymentMethod {
      id
      brand
      last4
    }
  }
}
    `;

export const useGetMemberAutoPayHistoryQuery = <
      TData = GetMemberAutoPayHistoryQuery,
      TError = unknown
    >(
      variables: GetMemberAutoPayHistoryQueryVariables,
      options?: Omit<UseQueryOptions<GetMemberAutoPayHistoryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMemberAutoPayHistoryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMemberAutoPayHistoryQuery, TError, TData>(
      {
    queryKey: ['GetMemberAutoPayHistory', variables],
    queryFn: graphqlFetcher<GetMemberAutoPayHistoryQuery, GetMemberAutoPayHistoryQueryVariables>(GetMemberAutoPayHistoryDocument, variables),
    ...options
  }
    )};

useGetMemberAutoPayHistoryQuery.getKey = (variables: GetMemberAutoPayHistoryQueryVariables) => ['GetMemberAutoPayHistory', variables];

export const useInfiniteGetMemberAutoPayHistoryQuery = <
      TData = InfiniteData<GetMemberAutoPayHistoryQuery>,
      TError = unknown
    >(
      variables: GetMemberAutoPayHistoryQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMemberAutoPayHistoryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMemberAutoPayHistoryQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMemberAutoPayHistoryQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetMemberAutoPayHistory.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMemberAutoPayHistoryQuery, GetMemberAutoPayHistoryQueryVariables>(GetMemberAutoPayHistoryDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMemberAutoPayHistoryQuery.getKey = (variables: GetMemberAutoPayHistoryQueryVariables) => ['GetMemberAutoPayHistory.infinite', variables];


useGetMemberAutoPayHistoryQuery.fetcher = (variables: GetMemberAutoPayHistoryQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMemberAutoPayHistoryQuery, GetMemberAutoPayHistoryQueryVariables>(GetMemberAutoPayHistoryDocument, variables, options);

export const GetInvoiceAutoPayAttemptsDocument = `
    query GetInvoiceAutoPayAttempts($invoiceId: ID!) {
  invoiceAutoPayAttempts(invoiceId: $invoiceId) {
    id
    memberId
    paymentMethodId
    amount
    attemptNumber
    status
    processedAt
    succeededAt
    failedAt
    failureCode
    failureMessage
    createdAt
    paymentMethod {
      id
      brand
      last4
    }
  }
}
    `;

export const useGetInvoiceAutoPayAttemptsQuery = <
      TData = GetInvoiceAutoPayAttemptsQuery,
      TError = unknown
    >(
      variables: GetInvoiceAutoPayAttemptsQueryVariables,
      options?: Omit<UseQueryOptions<GetInvoiceAutoPayAttemptsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetInvoiceAutoPayAttemptsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetInvoiceAutoPayAttemptsQuery, TError, TData>(
      {
    queryKey: ['GetInvoiceAutoPayAttempts', variables],
    queryFn: graphqlFetcher<GetInvoiceAutoPayAttemptsQuery, GetInvoiceAutoPayAttemptsQueryVariables>(GetInvoiceAutoPayAttemptsDocument, variables),
    ...options
  }
    )};

useGetInvoiceAutoPayAttemptsQuery.getKey = (variables: GetInvoiceAutoPayAttemptsQueryVariables) => ['GetInvoiceAutoPayAttempts', variables];

export const useInfiniteGetInvoiceAutoPayAttemptsQuery = <
      TData = InfiniteData<GetInvoiceAutoPayAttemptsQuery>,
      TError = unknown
    >(
      variables: GetInvoiceAutoPayAttemptsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetInvoiceAutoPayAttemptsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetInvoiceAutoPayAttemptsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetInvoiceAutoPayAttemptsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetInvoiceAutoPayAttempts.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetInvoiceAutoPayAttemptsQuery, GetInvoiceAutoPayAttemptsQueryVariables>(GetInvoiceAutoPayAttemptsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetInvoiceAutoPayAttemptsQuery.getKey = (variables: GetInvoiceAutoPayAttemptsQueryVariables) => ['GetInvoiceAutoPayAttempts.infinite', variables];


useGetInvoiceAutoPayAttemptsQuery.fetcher = (variables: GetInvoiceAutoPayAttemptsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetInvoiceAutoPayAttemptsQuery, GetInvoiceAutoPayAttemptsQueryVariables>(GetInvoiceAutoPayAttemptsDocument, variables, options);

export const AddPaymentMethodDocument = `
    mutation AddPaymentMethod($input: AddStoredPaymentInput!) {
  addPaymentMethod(input: $input) {
    id
    memberId
    brand
    last4
    expiryMonth
    expiryYear
    cardholderName
    status
    isDefault
    isAutoPayEnabled
    createdAt
  }
}
    `;

export const useAddPaymentMethodMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AddPaymentMethodMutation, TError, AddPaymentMethodMutationVariables, TContext>) => {
    
    return useMutation<AddPaymentMethodMutation, TError, AddPaymentMethodMutationVariables, TContext>(
      {
    mutationKey: ['AddPaymentMethod'],
    mutationFn: (variables?: AddPaymentMethodMutationVariables) => graphqlFetcher<AddPaymentMethodMutation, AddPaymentMethodMutationVariables>(AddPaymentMethodDocument, variables)(),
    ...options
  }
    )};


useAddPaymentMethodMutation.fetcher = (variables: AddPaymentMethodMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<AddPaymentMethodMutation, AddPaymentMethodMutationVariables>(AddPaymentMethodDocument, variables, options);

export const UpdatePaymentMethodDocument = `
    mutation UpdatePaymentMethod($input: UpdateStoredPaymentInput!) {
  updatePaymentMethod(input: $input) {
    id
    isDefault
    isAutoPayEnabled
    updatedAt
  }
}
    `;

export const useUpdatePaymentMethodMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdatePaymentMethodMutation, TError, UpdatePaymentMethodMutationVariables, TContext>) => {
    
    return useMutation<UpdatePaymentMethodMutation, TError, UpdatePaymentMethodMutationVariables, TContext>(
      {
    mutationKey: ['UpdatePaymentMethod'],
    mutationFn: (variables?: UpdatePaymentMethodMutationVariables) => graphqlFetcher<UpdatePaymentMethodMutation, UpdatePaymentMethodMutationVariables>(UpdatePaymentMethodDocument, variables)(),
    ...options
  }
    )};


useUpdatePaymentMethodMutation.fetcher = (variables: UpdatePaymentMethodMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdatePaymentMethodMutation, UpdatePaymentMethodMutationVariables>(UpdatePaymentMethodDocument, variables, options);

export const RemovePaymentMethodDocument = `
    mutation RemovePaymentMethod($id: ID!) {
  removePaymentMethod(id: $id) {
    success
    error
  }
}
    `;

export const useRemovePaymentMethodMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RemovePaymentMethodMutation, TError, RemovePaymentMethodMutationVariables, TContext>) => {
    
    return useMutation<RemovePaymentMethodMutation, TError, RemovePaymentMethodMutationVariables, TContext>(
      {
    mutationKey: ['RemovePaymentMethod'],
    mutationFn: (variables?: RemovePaymentMethodMutationVariables) => graphqlFetcher<RemovePaymentMethodMutation, RemovePaymentMethodMutationVariables>(RemovePaymentMethodDocument, variables)(),
    ...options
  }
    )};


useRemovePaymentMethodMutation.fetcher = (variables: RemovePaymentMethodMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<RemovePaymentMethodMutation, RemovePaymentMethodMutationVariables>(RemovePaymentMethodDocument, variables, options);

export const SetDefaultPaymentMethodDocument = `
    mutation SetDefaultPaymentMethod($id: ID!) {
  setDefaultPaymentMethod(id: $id) {
    id
    isDefault
    updatedAt
  }
}
    `;

export const useSetDefaultPaymentMethodMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<SetDefaultPaymentMethodMutation, TError, SetDefaultPaymentMethodMutationVariables, TContext>) => {
    
    return useMutation<SetDefaultPaymentMethodMutation, TError, SetDefaultPaymentMethodMutationVariables, TContext>(
      {
    mutationKey: ['SetDefaultPaymentMethod'],
    mutationFn: (variables?: SetDefaultPaymentMethodMutationVariables) => graphqlFetcher<SetDefaultPaymentMethodMutation, SetDefaultPaymentMethodMutationVariables>(SetDefaultPaymentMethodDocument, variables)(),
    ...options
  }
    )};


useSetDefaultPaymentMethodMutation.fetcher = (variables: SetDefaultPaymentMethodMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<SetDefaultPaymentMethodMutation, SetDefaultPaymentMethodMutationVariables>(SetDefaultPaymentMethodDocument, variables, options);

export const UpsertAutoPaySettingDocument = `
    mutation UpsertAutoPaySetting($input: AutoPaySettingInput!) {
  upsertAutoPaySetting(input: $input) {
    id
    memberId
    paymentMethodId
    isEnabled
    schedule
    paymentDayOfMonth
    maxPaymentAmount
    monthlyMaxAmount
    requireApprovalAbove
    payDuesOnly
    excludeCategories
    notifyBeforePayment
    notifyDaysBefore
    notifyOnSuccess
    notifyOnFailure
    maxRetryAttempts
    retryIntervalDays
    createdAt
    updatedAt
    paymentMethod {
      id
      brand
      last4
    }
  }
}
    `;

export const useUpsertAutoPaySettingMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpsertAutoPaySettingMutation, TError, UpsertAutoPaySettingMutationVariables, TContext>) => {
    
    return useMutation<UpsertAutoPaySettingMutation, TError, UpsertAutoPaySettingMutationVariables, TContext>(
      {
    mutationKey: ['UpsertAutoPaySetting'],
    mutationFn: (variables?: UpsertAutoPaySettingMutationVariables) => graphqlFetcher<UpsertAutoPaySettingMutation, UpsertAutoPaySettingMutationVariables>(UpsertAutoPaySettingDocument, variables)(),
    ...options
  }
    )};


useUpsertAutoPaySettingMutation.fetcher = (variables: UpsertAutoPaySettingMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpsertAutoPaySettingMutation, UpsertAutoPaySettingMutationVariables>(UpsertAutoPaySettingDocument, variables, options);

export const DisableAutoPayDocument = `
    mutation DisableAutoPay($memberId: ID!) {
  disableAutoPay(memberId: $memberId) {
    success
    error
  }
}
    `;

export const useDisableAutoPayMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DisableAutoPayMutation, TError, DisableAutoPayMutationVariables, TContext>) => {
    
    return useMutation<DisableAutoPayMutation, TError, DisableAutoPayMutationVariables, TContext>(
      {
    mutationKey: ['DisableAutoPay'],
    mutationFn: (variables?: DisableAutoPayMutationVariables) => graphqlFetcher<DisableAutoPayMutation, DisableAutoPayMutationVariables>(DisableAutoPayDocument, variables)(),
    ...options
  }
    )};


useDisableAutoPayMutation.fetcher = (variables: DisableAutoPayMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DisableAutoPayMutation, DisableAutoPayMutationVariables>(DisableAutoPayDocument, variables, options);

export const ProcessAutoPayDocument = `
    mutation ProcessAutoPay($input: ProcessAutoPayInput!) {
  processAutoPay(input: $input) {
    success
    attemptId
    message
    stripePaymentIntentId
    error
  }
}
    `;

export const useProcessAutoPayMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ProcessAutoPayMutation, TError, ProcessAutoPayMutationVariables, TContext>) => {
    
    return useMutation<ProcessAutoPayMutation, TError, ProcessAutoPayMutationVariables, TContext>(
      {
    mutationKey: ['ProcessAutoPay'],
    mutationFn: (variables?: ProcessAutoPayMutationVariables) => graphqlFetcher<ProcessAutoPayMutation, ProcessAutoPayMutationVariables>(ProcessAutoPayDocument, variables)(),
    ...options
  }
    )};


useProcessAutoPayMutation.fetcher = (variables: ProcessAutoPayMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ProcessAutoPayMutation, ProcessAutoPayMutationVariables>(ProcessAutoPayDocument, variables, options);

export const RetryAutoPayAttemptDocument = `
    mutation RetryAutoPayAttempt($attemptId: ID!) {
  retryAutoPayAttempt(attemptId: $attemptId) {
    success
    attemptId
    message
    stripePaymentIntentId
    error
  }
}
    `;

export const useRetryAutoPayAttemptMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RetryAutoPayAttemptMutation, TError, RetryAutoPayAttemptMutationVariables, TContext>) => {
    
    return useMutation<RetryAutoPayAttemptMutation, TError, RetryAutoPayAttemptMutationVariables, TContext>(
      {
    mutationKey: ['RetryAutoPayAttempt'],
    mutationFn: (variables?: RetryAutoPayAttemptMutationVariables) => graphqlFetcher<RetryAutoPayAttemptMutation, RetryAutoPayAttemptMutationVariables>(RetryAutoPayAttemptDocument, variables)(),
    ...options
  }
    )};


useRetryAutoPayAttemptMutation.fetcher = (variables: RetryAutoPayAttemptMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<RetryAutoPayAttemptMutation, RetryAutoPayAttemptMutationVariables>(RetryAutoPayAttemptDocument, variables, options);

export const GetSubAccountsDocument = `
    query GetSubAccounts($status: SubAccountStatus) {
  subAccounts(status: $status) {
    id
    clubId
    memberId
    name
    relationship
    email
    phone
    status
    validFrom
    validUntil
    permissions
    dailyLimit
    weeklyLimit
    monthlyLimit
    perTransactionLimit
    dailySpend
    weeklySpend
    monthlySpend
    notifyPrimaryOnUse
    notifyOnLimitReached
    pinAttempts
    pinLockedUntil
    createdAt
    updatedAt
  }
}
    `;

export const useGetSubAccountsQuery = <
      TData = GetSubAccountsQuery,
      TError = unknown
    >(
      variables?: GetSubAccountsQueryVariables,
      options?: Omit<UseQueryOptions<GetSubAccountsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetSubAccountsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetSubAccountsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetSubAccounts'] : ['GetSubAccounts', variables],
    queryFn: graphqlFetcher<GetSubAccountsQuery, GetSubAccountsQueryVariables>(GetSubAccountsDocument, variables),
    ...options
  }
    )};

useGetSubAccountsQuery.getKey = (variables?: GetSubAccountsQueryVariables) => variables === undefined ? ['GetSubAccounts'] : ['GetSubAccounts', variables];

export const useInfiniteGetSubAccountsQuery = <
      TData = InfiniteData<GetSubAccountsQuery>,
      TError = unknown
    >(
      variables: GetSubAccountsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetSubAccountsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetSubAccountsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetSubAccountsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetSubAccounts.infinite'] : ['GetSubAccounts.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetSubAccountsQuery, GetSubAccountsQueryVariables>(GetSubAccountsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetSubAccountsQuery.getKey = (variables?: GetSubAccountsQueryVariables) => variables === undefined ? ['GetSubAccounts.infinite'] : ['GetSubAccounts.infinite', variables];


useGetSubAccountsQuery.fetcher = (variables?: GetSubAccountsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetSubAccountsQuery, GetSubAccountsQueryVariables>(GetSubAccountsDocument, variables, options);

export const GetSubAccountDocument = `
    query GetSubAccount($id: ID!) {
  subAccount(id: $id) {
    id
    clubId
    memberId
    name
    relationship
    email
    phone
    status
    validFrom
    validUntil
    permissions
    dailyLimit
    weeklyLimit
    monthlyLimit
    perTransactionLimit
    dailySpend
    weeklySpend
    monthlySpend
    lastResetDaily
    lastResetWeekly
    lastResetMonthly
    notifyPrimaryOnUse
    notifyOnLimitReached
    pinAttempts
    pinLockedUntil
    createdAt
    updatedAt
  }
}
    `;

export const useGetSubAccountQuery = <
      TData = GetSubAccountQuery,
      TError = unknown
    >(
      variables: GetSubAccountQueryVariables,
      options?: Omit<UseQueryOptions<GetSubAccountQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetSubAccountQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetSubAccountQuery, TError, TData>(
      {
    queryKey: ['GetSubAccount', variables],
    queryFn: graphqlFetcher<GetSubAccountQuery, GetSubAccountQueryVariables>(GetSubAccountDocument, variables),
    ...options
  }
    )};

useGetSubAccountQuery.getKey = (variables: GetSubAccountQueryVariables) => ['GetSubAccount', variables];

export const useInfiniteGetSubAccountQuery = <
      TData = InfiniteData<GetSubAccountQuery>,
      TError = unknown
    >(
      variables: GetSubAccountQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetSubAccountQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetSubAccountQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetSubAccountQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetSubAccount.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetSubAccountQuery, GetSubAccountQueryVariables>(GetSubAccountDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetSubAccountQuery.getKey = (variables: GetSubAccountQueryVariables) => ['GetSubAccount.infinite', variables];


useGetSubAccountQuery.fetcher = (variables: GetSubAccountQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetSubAccountQuery, GetSubAccountQueryVariables>(GetSubAccountDocument, variables, options);

export const GetMemberSubAccountsDocument = `
    query GetMemberSubAccounts($memberId: ID!, $activeOnly: Boolean) {
  memberSubAccounts(memberId: $memberId, activeOnly: $activeOnly) {
    id
    name
    relationship
    status
    permissions
    dailyLimit
    weeklyLimit
    monthlyLimit
    perTransactionLimit
    dailySpend
    weeklySpend
    monthlySpend
    validUntil
    pinLockedUntil
  }
}
    `;

export const useGetMemberSubAccountsQuery = <
      TData = GetMemberSubAccountsQuery,
      TError = unknown
    >(
      variables: GetMemberSubAccountsQueryVariables,
      options?: Omit<UseQueryOptions<GetMemberSubAccountsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMemberSubAccountsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMemberSubAccountsQuery, TError, TData>(
      {
    queryKey: ['GetMemberSubAccounts', variables],
    queryFn: graphqlFetcher<GetMemberSubAccountsQuery, GetMemberSubAccountsQueryVariables>(GetMemberSubAccountsDocument, variables),
    ...options
  }
    )};

useGetMemberSubAccountsQuery.getKey = (variables: GetMemberSubAccountsQueryVariables) => ['GetMemberSubAccounts', variables];

export const useInfiniteGetMemberSubAccountsQuery = <
      TData = InfiniteData<GetMemberSubAccountsQuery>,
      TError = unknown
    >(
      variables: GetMemberSubAccountsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetMemberSubAccountsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetMemberSubAccountsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetMemberSubAccountsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetMemberSubAccounts.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetMemberSubAccountsQuery, GetMemberSubAccountsQueryVariables>(GetMemberSubAccountsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMemberSubAccountsQuery.getKey = (variables: GetMemberSubAccountsQueryVariables) => ['GetMemberSubAccounts.infinite', variables];


useGetMemberSubAccountsQuery.fetcher = (variables: GetMemberSubAccountsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetMemberSubAccountsQuery, GetMemberSubAccountsQueryVariables>(GetMemberSubAccountsDocument, variables, options);

export const CheckSubAccountLimitDocument = `
    query CheckSubAccountLimit($input: CheckLimitInput!) {
  checkSubAccountLimit(input: $input) {
    allowed
    reason
    currentDaily
    currentWeekly
    currentMonthly
    dailyLimit
    weeklyLimit
    monthlyLimit
    perTransactionLimit
  }
}
    `;

export const useCheckSubAccountLimitQuery = <
      TData = CheckSubAccountLimitQuery,
      TError = unknown
    >(
      variables: CheckSubAccountLimitQueryVariables,
      options?: Omit<UseQueryOptions<CheckSubAccountLimitQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<CheckSubAccountLimitQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<CheckSubAccountLimitQuery, TError, TData>(
      {
    queryKey: ['CheckSubAccountLimit', variables],
    queryFn: graphqlFetcher<CheckSubAccountLimitQuery, CheckSubAccountLimitQueryVariables>(CheckSubAccountLimitDocument, variables),
    ...options
  }
    )};

useCheckSubAccountLimitQuery.getKey = (variables: CheckSubAccountLimitQueryVariables) => ['CheckSubAccountLimit', variables];

export const useInfiniteCheckSubAccountLimitQuery = <
      TData = InfiniteData<CheckSubAccountLimitQuery>,
      TError = unknown
    >(
      variables: CheckSubAccountLimitQueryVariables,
      options: Omit<UseInfiniteQueryOptions<CheckSubAccountLimitQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<CheckSubAccountLimitQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<CheckSubAccountLimitQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['CheckSubAccountLimit.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<CheckSubAccountLimitQuery, CheckSubAccountLimitQueryVariables>(CheckSubAccountLimitDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteCheckSubAccountLimitQuery.getKey = (variables: CheckSubAccountLimitQueryVariables) => ['CheckSubAccountLimit.infinite', variables];


useCheckSubAccountLimitQuery.fetcher = (variables: CheckSubAccountLimitQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<CheckSubAccountLimitQuery, CheckSubAccountLimitQueryVariables>(CheckSubAccountLimitDocument, variables, options);

export const GetSubAccountTransactionsDocument = `
    query GetSubAccountTransactions($input: GetTransactionsInput!) {
  subAccountTransactions(input: $input) {
    id
    clubId
    subAccountId
    amount
    description
    category
    paymentTransactionId
    lineItemId
    teeTimeId
    verifiedAt
    verifiedBy
    locationName
    notes
    createdAt
    subAccount {
      id
      name
      memberId
    }
  }
}
    `;

export const useGetSubAccountTransactionsQuery = <
      TData = GetSubAccountTransactionsQuery,
      TError = unknown
    >(
      variables: GetSubAccountTransactionsQueryVariables,
      options?: Omit<UseQueryOptions<GetSubAccountTransactionsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetSubAccountTransactionsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetSubAccountTransactionsQuery, TError, TData>(
      {
    queryKey: ['GetSubAccountTransactions', variables],
    queryFn: graphqlFetcher<GetSubAccountTransactionsQuery, GetSubAccountTransactionsQueryVariables>(GetSubAccountTransactionsDocument, variables),
    ...options
  }
    )};

useGetSubAccountTransactionsQuery.getKey = (variables: GetSubAccountTransactionsQueryVariables) => ['GetSubAccountTransactions', variables];

export const useInfiniteGetSubAccountTransactionsQuery = <
      TData = InfiniteData<GetSubAccountTransactionsQuery>,
      TError = unknown
    >(
      variables: GetSubAccountTransactionsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetSubAccountTransactionsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetSubAccountTransactionsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetSubAccountTransactionsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetSubAccountTransactions.infinite', variables],
      queryFn: (metaData) => graphqlFetcher<GetSubAccountTransactionsQuery, GetSubAccountTransactionsQueryVariables>(GetSubAccountTransactionsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetSubAccountTransactionsQuery.getKey = (variables: GetSubAccountTransactionsQueryVariables) => ['GetSubAccountTransactions.infinite', variables];


useGetSubAccountTransactionsQuery.fetcher = (variables: GetSubAccountTransactionsQueryVariables, options?: RequestInit['headers']) => graphqlFetcher<GetSubAccountTransactionsQuery, GetSubAccountTransactionsQueryVariables>(GetSubAccountTransactionsDocument, variables, options);

export const CreateSubAccountDocument = `
    mutation CreateSubAccount($input: CreateSubAccountInput!) {
  createSubAccount(input: $input) {
    id
    name
    relationship
    status
    permissions
    createdAt
  }
}
    `;

export const useCreateSubAccountMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateSubAccountMutation, TError, CreateSubAccountMutationVariables, TContext>) => {
    
    return useMutation<CreateSubAccountMutation, TError, CreateSubAccountMutationVariables, TContext>(
      {
    mutationKey: ['CreateSubAccount'],
    mutationFn: (variables?: CreateSubAccountMutationVariables) => graphqlFetcher<CreateSubAccountMutation, CreateSubAccountMutationVariables>(CreateSubAccountDocument, variables)(),
    ...options
  }
    )};


useCreateSubAccountMutation.fetcher = (variables: CreateSubAccountMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<CreateSubAccountMutation, CreateSubAccountMutationVariables>(CreateSubAccountDocument, variables, options);

export const UpdateSubAccountDocument = `
    mutation UpdateSubAccount($input: UpdateSubAccountInput!) {
  updateSubAccount(input: $input) {
    id
    name
    relationship
    email
    phone
    permissions
    dailyLimit
    weeklyLimit
    monthlyLimit
    perTransactionLimit
    validUntil
    notifyPrimaryOnUse
    notifyOnLimitReached
    updatedAt
  }
}
    `;

export const useUpdateSubAccountMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateSubAccountMutation, TError, UpdateSubAccountMutationVariables, TContext>) => {
    
    return useMutation<UpdateSubAccountMutation, TError, UpdateSubAccountMutationVariables, TContext>(
      {
    mutationKey: ['UpdateSubAccount'],
    mutationFn: (variables?: UpdateSubAccountMutationVariables) => graphqlFetcher<UpdateSubAccountMutation, UpdateSubAccountMutationVariables>(UpdateSubAccountDocument, variables)(),
    ...options
  }
    )};


useUpdateSubAccountMutation.fetcher = (variables: UpdateSubAccountMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UpdateSubAccountMutation, UpdateSubAccountMutationVariables>(UpdateSubAccountDocument, variables, options);

export const VerifySubAccountPinDocument = `
    mutation VerifySubAccountPin($input: VerifyPinInput!) {
  verifySubAccountPin(input: $input) {
    success
    message
    remainingAttempts
  }
}
    `;

export const useVerifySubAccountPinMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<VerifySubAccountPinMutation, TError, VerifySubAccountPinMutationVariables, TContext>) => {
    
    return useMutation<VerifySubAccountPinMutation, TError, VerifySubAccountPinMutationVariables, TContext>(
      {
    mutationKey: ['VerifySubAccountPin'],
    mutationFn: (variables?: VerifySubAccountPinMutationVariables) => graphqlFetcher<VerifySubAccountPinMutation, VerifySubAccountPinMutationVariables>(VerifySubAccountPinDocument, variables)(),
    ...options
  }
    )};


useVerifySubAccountPinMutation.fetcher = (variables: VerifySubAccountPinMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<VerifySubAccountPinMutation, VerifySubAccountPinMutationVariables>(VerifySubAccountPinDocument, variables, options);

export const ChangeSubAccountPinDocument = `
    mutation ChangeSubAccountPin($input: ChangePinInput!) {
  changeSubAccountPin(input: $input) {
    id
    pinAttempts
    pinLockedUntil
  }
}
    `;

export const useChangeSubAccountPinMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ChangeSubAccountPinMutation, TError, ChangeSubAccountPinMutationVariables, TContext>) => {
    
    return useMutation<ChangeSubAccountPinMutation, TError, ChangeSubAccountPinMutationVariables, TContext>(
      {
    mutationKey: ['ChangeSubAccountPin'],
    mutationFn: (variables?: ChangeSubAccountPinMutationVariables) => graphqlFetcher<ChangeSubAccountPinMutation, ChangeSubAccountPinMutationVariables>(ChangeSubAccountPinDocument, variables)(),
    ...options
  }
    )};


useChangeSubAccountPinMutation.fetcher = (variables: ChangeSubAccountPinMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ChangeSubAccountPinMutation, ChangeSubAccountPinMutationVariables>(ChangeSubAccountPinDocument, variables, options);

export const ChangeSubAccountStatusDocument = `
    mutation ChangeSubAccountStatus($input: ChangeSubAccountStatusInput!) {
  changeSubAccountStatus(input: $input) {
    id
    status
    updatedAt
  }
}
    `;

export const useChangeSubAccountStatusMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ChangeSubAccountStatusMutation, TError, ChangeSubAccountStatusMutationVariables, TContext>) => {
    
    return useMutation<ChangeSubAccountStatusMutation, TError, ChangeSubAccountStatusMutationVariables, TContext>(
      {
    mutationKey: ['ChangeSubAccountStatus'],
    mutationFn: (variables?: ChangeSubAccountStatusMutationVariables) => graphqlFetcher<ChangeSubAccountStatusMutation, ChangeSubAccountStatusMutationVariables>(ChangeSubAccountStatusDocument, variables)(),
    ...options
  }
    )};


useChangeSubAccountStatusMutation.fetcher = (variables: ChangeSubAccountStatusMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ChangeSubAccountStatusMutation, ChangeSubAccountStatusMutationVariables>(ChangeSubAccountStatusDocument, variables, options);

export const UnlockSubAccountPinDocument = `
    mutation UnlockSubAccountPin($subAccountId: ID!) {
  unlockSubAccountPin(subAccountId: $subAccountId) {
    id
    pinAttempts
    pinLockedUntil
  }
}
    `;

export const useUnlockSubAccountPinMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UnlockSubAccountPinMutation, TError, UnlockSubAccountPinMutationVariables, TContext>) => {
    
    return useMutation<UnlockSubAccountPinMutation, TError, UnlockSubAccountPinMutationVariables, TContext>(
      {
    mutationKey: ['UnlockSubAccountPin'],
    mutationFn: (variables?: UnlockSubAccountPinMutationVariables) => graphqlFetcher<UnlockSubAccountPinMutation, UnlockSubAccountPinMutationVariables>(UnlockSubAccountPinDocument, variables)(),
    ...options
  }
    )};


useUnlockSubAccountPinMutation.fetcher = (variables: UnlockSubAccountPinMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<UnlockSubAccountPinMutation, UnlockSubAccountPinMutationVariables>(UnlockSubAccountPinDocument, variables, options);

export const DeleteSubAccountDocument = `
    mutation DeleteSubAccount($id: ID!) {
  deleteSubAccount(id: $id) {
    id
    status
  }
}
    `;

export const useDeleteSubAccountMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteSubAccountMutation, TError, DeleteSubAccountMutationVariables, TContext>) => {
    
    return useMutation<DeleteSubAccountMutation, TError, DeleteSubAccountMutationVariables, TContext>(
      {
    mutationKey: ['DeleteSubAccount'],
    mutationFn: (variables?: DeleteSubAccountMutationVariables) => graphqlFetcher<DeleteSubAccountMutation, DeleteSubAccountMutationVariables>(DeleteSubAccountDocument, variables)(),
    ...options
  }
    )};


useDeleteSubAccountMutation.fetcher = (variables: DeleteSubAccountMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<DeleteSubAccountMutation, DeleteSubAccountMutationVariables>(DeleteSubAccountDocument, variables, options);

export const RecordSubAccountTransactionDocument = `
    mutation RecordSubAccountTransaction($input: RecordTransactionInput!) {
  recordSubAccountTransaction(input: $input) {
    id
    amount
    description
    category
    verifiedAt
    createdAt
  }
}
    `;

export const useRecordSubAccountTransactionMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RecordSubAccountTransactionMutation, TError, RecordSubAccountTransactionMutationVariables, TContext>) => {
    
    return useMutation<RecordSubAccountTransactionMutation, TError, RecordSubAccountTransactionMutationVariables, TContext>(
      {
    mutationKey: ['RecordSubAccountTransaction'],
    mutationFn: (variables?: RecordSubAccountTransactionMutationVariables) => graphqlFetcher<RecordSubAccountTransactionMutation, RecordSubAccountTransactionMutationVariables>(RecordSubAccountTransactionDocument, variables)(),
    ...options
  }
    )};


useRecordSubAccountTransactionMutation.fetcher = (variables: RecordSubAccountTransactionMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<RecordSubAccountTransactionMutation, RecordSubAccountTransactionMutationVariables>(RecordSubAccountTransactionDocument, variables, options);

export const ResetSubAccountSpendingDocument = `
    mutation ResetSubAccountSpending($subAccountId: ID!) {
  resetSubAccountSpending(subAccountId: $subAccountId) {
    id
    dailySpend
    weeklySpend
    monthlySpend
    lastResetDaily
    lastResetWeekly
    lastResetMonthly
  }
}
    `;

export const useResetSubAccountSpendingMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ResetSubAccountSpendingMutation, TError, ResetSubAccountSpendingMutationVariables, TContext>) => {
    
    return useMutation<ResetSubAccountSpendingMutation, TError, ResetSubAccountSpendingMutationVariables, TContext>(
      {
    mutationKey: ['ResetSubAccountSpending'],
    mutationFn: (variables?: ResetSubAccountSpendingMutationVariables) => graphqlFetcher<ResetSubAccountSpendingMutation, ResetSubAccountSpendingMutationVariables>(ResetSubAccountSpendingDocument, variables)(),
    ...options
  }
    )};


useResetSubAccountSpendingMutation.fetcher = (variables: ResetSubAccountSpendingMutationVariables, options?: RequestInit['headers']) => graphqlFetcher<ResetSubAccountSpendingMutation, ResetSubAccountSpendingMutationVariables>(ResetSubAccountSpendingDocument, variables, options);

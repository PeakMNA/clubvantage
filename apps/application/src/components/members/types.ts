/**
 * Members Section Types
 * Based on PRD spec for comprehensive membership management
 */

// =============================================================================
// Status Types
// =============================================================================

export type MemberStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'CANCELLED';

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PENDING_BOARD'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type DocumentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type DependentRelationship = 'SPOUSE' | 'CHILD' | 'PARENT' | 'SIBLING';

export type PersonType = 'MEMBER' | 'DEPENDENT' | 'GUEST';

export type ChargeType = 'RECURRING' | 'USAGE_BASED';

export type ChargeStatus = 'ACTIVE' | 'SUSPENDED' | 'ENDED';

export type ContractStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';

export type RecurringFrequency = 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';

export type UsageType = 'PER_VISIT' | 'PER_BOOKING' | 'PER_HOUR' | 'PER_SESSION';

export type TaxMethod = 'ADD_ON' | 'INCLUDED' | 'EXEMPT';

export type AgingBucket = 'CURRENT' | '30' | '60' | '90' | '91+';

// =============================================================================
// Core Entity Types
// =============================================================================

export interface Address {
  id: string;
  type: 'BILLING' | 'MAILING' | 'BOTH';
  isPrimary: boolean;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface Dependent {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  relationship: DependentRelationship;
  dateOfBirth: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface MembershipType {
  id: string;
  name: string;
  description: string;
  billingCycle: RecurringFrequency;
  monthlyFee: number;
  entryFee: number;
  maxDependents?: number;
  requiresBoardApproval?: boolean;
}

export interface Charge {
  id: string;
  contractId: string;
  templateChargeId?: string;
  name: string;
  description: string;
  chargeType: ChargeType;
  frequency?: RecurringFrequency;
  usageType?: UsageType;
  amount: number;
  taxMethod: TaxMethod;
  taxRate: number;
  startDate: string;
  endDate?: string;
  status: ChargeStatus;
  suspendedAt?: string;
  suspendedReason?: string;
  revenueCenterId?: string;
  revenueCenterName?: string;
  outletId?: string;
  outletName?: string;
}

export interface Contract {
  id: string;
  memberId: string;
  membershipTypeId: string;
  templateId?: string;
  startDate: string;
  endDate?: string;
  charges: Charge[];
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photoUrl?: string;
  dateOfBirth: string;
  nationality: string;
  membershipTypeId: string;
  membershipTypeName: string;
  status: MemberStatus;
  inactiveReason?: string;
  suspensionReason?: string;
  joinDate: string;
  balance: number;
  agingBucket?: AgingBucket;
  oldestInvoiceDate?: string;
  autoPay: boolean;
  addresses: Address[];
  dependents: Dependent[];
  contract?: Contract;
}

// =============================================================================
// Application Types
// =============================================================================

export interface ApplicationDocument {
  id: string;
  type: string;
  fileName: string;
  uploadedDate: string;
  status: DocumentStatus;
}

export interface MembershipApplication {
  id: string;
  applicantFirstName: string;
  applicantLastName: string;
  email: string;
  phone: string;
  requestedMembershipTypeId: string;
  requestedMembershipTypeName: string;
  sponsorId?: string;
  sponsorName?: string;
  submittedDate: string;
  status: ApplicationStatus;
  documents: ApplicationDocument[];
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  approvedDate?: string;
  approvedBy?: string;
  rejectedDate?: string;
  rejectedReason?: string;
}

// =============================================================================
// Search Types
// =============================================================================

export interface PersonSearchResult {
  id: string;
  personType: PersonType;
  memberNumber?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  // For dependents
  parentMemberId?: string;
  parentMemberNumber?: string;
  parentMemberName?: string;
  relationship?: DependentRelationship;
  // For guests
  sponsorMemberId?: string;
  sponsorMemberNumber?: string;
  sponsorMemberName?: string;
  // For members
  membershipTypeName?: string;
}

// =============================================================================
// Filter Types
// =============================================================================

export interface MemberFilters {
  search?: string;
  statuses?: MemberStatus[];
  membershipTypes?: string[];
  joinDateFrom?: string;
  joinDateTo?: string;
  balanceMin?: number;
  balanceMax?: number;
  agingBuckets?: string[];
  revenueCenterIds?: string[];
  outletIds?: string[];
  phone?: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: MemberFilters;
  isDefault?: boolean;
}

// =============================================================================
// A/R History Types
// =============================================================================

export type TransactionType = 'INVOICE' | 'PAYMENT' | 'CREDIT' | 'ADJUSTMENT';

export interface ARTransaction {
  id: string;
  memberId: string;
  date: string;
  type: TransactionType;
  description: string;
  invoiceNumber?: string;
  amount: number;
  runningBalance: number;
}

// =============================================================================
// Component Props Types
// =============================================================================

export interface QuickFilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface LookupItem {
  id: string;
  name: string;
  code?: string;
}

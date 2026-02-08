/**
 * Member entity types for ClubVantage
 * Based on PRD-01 data model
 */

export const MemberStatus = {
  PROSPECT: 'PROSPECT',
  LEAD: 'LEAD',
  APPLICANT: 'APPLICANT',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  LAPSED: 'LAPSED',
  RESIGNED: 'RESIGNED',
  TERMINATED: 'TERMINATED',
  REACTIVATED: 'REACTIVATED',
} as const;
export type MemberStatus = (typeof MemberStatus)[keyof typeof MemberStatus];

export const MembershipCategory = {
  REGULAR: 'REGULAR',
  PREMIUM: 'PREMIUM',
  CORPORATE: 'CORPORATE',
  SENIOR: 'SENIOR',
  JUNIOR: 'JUNIOR',
  FAMILY: 'FAMILY',
} as const;
export type MembershipCategory = (typeof MembershipCategory)[keyof typeof MembershipCategory];

export interface Member {
  id: string;
  tenantId: string;
  clubId: string;

  // Identity
  memberId: string; // Display ID (e.g., M-0001)
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  photoUrl?: string;

  // Membership
  membershipTypeId: string;
  membershipTierId?: string;
  status: MemberStatus;
  joinDate?: Date;
  renewalDate?: Date;

  // Household
  householdId?: string;
  isPrimaryMember: boolean;

  // Referral
  referredById?: string;
  referralSource?: ReferralSource;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipType {
  id: string;
  tenantId: string;
  clubId: string;
  name: string;
  code: string;
  category: MembershipCategory;
  description?: string;
  monthlyDues: number;
  joiningFee: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipTier {
  id: string;
  tenantId: string;
  clubId: string;
  membershipTypeId: string;
  name: string;
  level: number;
  benefits?: string;
  upgradeThreshold?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Household {
  id: string;
  tenantId: string;
  clubId: string;
  name: string;
  primaryMemberId: string;
  billingPreference: 'CONSOLIDATED' | 'INDIVIDUAL';
  createdAt: Date;
  updatedAt: Date;
}

export interface Dependent {
  id: string;
  tenantId: string;
  memberId: string;
  firstName: string;
  lastName: string;
  relationship: DependentRelationship;
  dateOfBirth?: Date;
  email?: string;
  phone?: string;
  photoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export const DependentRelationship = {
  SPOUSE: 'SPOUSE',
  CHILD: 'CHILD',
  PARENT: 'PARENT',
  SIBLING: 'SIBLING',
  OTHER: 'OTHER',
} as const;
export type DependentRelationship = (typeof DependentRelationship)[keyof typeof DependentRelationship];

export const ReferralSource = {
  WEBSITE: 'WEBSITE',
  MEMBER_REFERRAL: 'MEMBER_REFERRAL',
  WALK_IN: 'WALK_IN',
  GUEST_CONVERSION: 'GUEST_CONVERSION',
  CORPORATE: 'CORPORATE',
  EVENT: 'EVENT',
  ADVERTISEMENT: 'ADVERTISEMENT',
  OTHER: 'OTHER',
} as const;
export type ReferralSource = (typeof ReferralSource)[keyof typeof ReferralSource];

export interface Address {
  id: string;
  memberId: string;
  type: 'HOME' | 'WORK' | 'MAILING';
  line1: string;
  line2?: string;
  city: string;
  stateProvince?: string;
  postalCode?: string;
  country: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Lead Management
export interface Lead {
  id: string;
  tenantId: string;
  clubId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  source: ReferralSource;
  stage: LeadStage;
  score: number; // 0-100
  assignedToId?: string;
  notes?: string;
  convertedMemberId?: string;
  convertedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const LeadStage = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  CONVERTED: 'CONVERTED',
  LOST: 'LOST',
} as const;
export type LeadStage = (typeof LeadStage)[keyof typeof LeadStage];

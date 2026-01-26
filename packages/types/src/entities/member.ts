/**
 * Member entity types for ClubVantage
 * Based on PRD-01 data model
 */

export type MemberStatus =
  | 'PROSPECT'
  | 'LEAD'
  | 'APPLICANT'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'LAPSED'
  | 'RESIGNED'
  | 'TERMINATED'
  | 'REACTIVATED';

export type MembershipCategory = 'REGULAR' | 'PREMIUM' | 'CORPORATE' | 'SENIOR' | 'JUNIOR' | 'FAMILY';

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

export type DependentRelationship = 'SPOUSE' | 'CHILD' | 'PARENT' | 'SIBLING' | 'OTHER';

export type ReferralSource =
  | 'WEBSITE'
  | 'MEMBER_REFERRAL'
  | 'WALK_IN'
  | 'GUEST_CONVERSION'
  | 'CORPORATE'
  | 'EVENT'
  | 'ADVERTISEMENT'
  | 'OTHER';

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

export type LeadStage = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';

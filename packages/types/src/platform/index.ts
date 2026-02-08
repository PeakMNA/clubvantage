/**
 * Platform (B2B SaaS) types for ClubVantage
 * Based on PRD-03
 */

export const TenantStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type TenantStatus = (typeof TenantStatus)[keyof typeof TenantStatus];

export const SubscriptionTier = {
  STARTER: 'STARTER',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE',
} as const;
export type SubscriptionTier = (typeof SubscriptionTier)[keyof typeof SubscriptionTier];

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  CANCELLED: 'CANCELLED',
  TRIAL: 'TRIAL',
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const BillingCycle = {
  MONTHLY: 'MONTHLY',
  ANNUAL: 'ANNUAL',
} as const;
export type BillingCycle = (typeof BillingCycle)[keyof typeof BillingCycle];

export const PlatformUserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CSM: 'CSM',
  SUPPORT: 'SUPPORT',
  FINANCE: 'FINANCE',
} as const;
export type PlatformUserRole = (typeof PlatformUserRole)[keyof typeof PlatformUserRole];

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  region: 'TH' | 'SG' | 'MY';
  status: TenantStatus;

  // Branding
  logoUrl?: string;
  primaryColor: string;
  secondaryColor?: string;

  // Configuration
  timezone: string;
  currency: string;
  taxRate: number;

  // Subscription
  subscriptionId?: string;
  subscription?: Subscription;

  // Health
  healthScore?: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;

  startDate: Date;
  endDate?: Date;
  trialEnds?: Date;

  // Billing
  monthlyPrice: number;
  currency: string;
  billingCycle: BillingCycle;

  // Limits
  memberLimit?: number;
  userLimit?: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: PlatformUserRole;
  isActive: boolean;
  assignedTenantIds?: string[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImpersonationSession {
  id: string;
  impersonatorId: string;
  targetUserId: string;
  reason: string;
  ticketNumber?: string;
  expiresAt: Date;
  createdAt: Date;
  endedAt?: Date;
}

// Subscription Tier Limits
export const TIER_LIMITS: Record<SubscriptionTier, {
  memberLimit: number | null;
  userLimit: number | null;
  features: string[];
  price: { monthly: number; annual: number };
}> = {
  STARTER: {
    memberLimit: 500,
    userLimit: 5,
    features: ['membership', 'billing', 'facility_booking'],
    price: { monthly: 300, annual: 3000 },
  },
  PROFESSIONAL: {
    memberLimit: 2000,
    userLimit: 20,
    features: ['membership', 'billing', 'facility_booking', 'golf', 'member_portal', 'aura_ai', 'white_label', 'api_access'],
    price: { monthly: 800, annual: 8000 },
  },
  ENTERPRISE: {
    memberLimit: null, // Unlimited
    userLimit: null,   // Unlimited
    features: ['membership', 'billing', 'facility_booking', 'golf', 'member_portal', 'aura_ai', 'white_label', 'api_access', 'custom_domain', 'dedicated_support', 'custom_integrations'],
    price: { monthly: 2500, annual: 25000 },
  },
};

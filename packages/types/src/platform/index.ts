/**
 * Platform (B2B SaaS) types for ClubVantage
 * Based on PRD-03
 */

export type TenantStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export type SubscriptionTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIAL';

export type BillingCycle = 'MONTHLY' | 'ANNUAL';

export type PlatformUserRole = 'SUPER_ADMIN' | 'CSM' | 'SUPPORT' | 'FINANCE';

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

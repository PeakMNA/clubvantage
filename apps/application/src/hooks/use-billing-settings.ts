/**
 * Billing settings hooks for club billing configuration
 * and member billing profiles
 */

import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '@clubvantage/api-client';

// =============================================================================
// TypeScript Interfaces
// =============================================================================

export type BillingFrequency = 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
export type BillingTiming = 'ADVANCE' | 'ARREARS';
export type BillingAlignment = 'CALENDAR' | 'ANNIVERSARY' | 'CUSTOM';
export type LateFeeType = 'FIXED' | 'PERCENTAGE' | 'TIERED';
export type ProrationMethod = 'DAILY' | 'HALF_MONTH' | 'FULL_MONTH' | 'NONE';
export type TaxMethod = 'ADDON' | 'INCLUDED' | 'EXEMPT';
export type BillingCycleMode = 'CLUB_CYCLE' | 'MEMBER_CYCLE';
export type FinancialPeriodType = 'CALENDAR_MONTH' | 'CUSTOM';
export type StatementDelivery = 'EMAIL' | 'PRINT' | 'PORTAL' | 'SMS' | 'EMAIL_AND_PRINT' | 'ALL';

export interface ClubBillingSettings {
  id: string;
  clubId: string;
  defaultFrequency: BillingFrequency;
  defaultTiming: BillingTiming;
  defaultAlignment: BillingAlignment;
  defaultBillingDay: number;
  invoiceGenerationLead: number;
  invoiceDueDays: number;
  gracePeriodDays: number;
  lateFeeType: LateFeeType;
  lateFeeAmount: number | null;
  lateFeePercentage: number | null;
  maxLateFee: number | null;
  autoApplyLateFee: boolean;
  prorateNewMembers: boolean;
  prorateChanges: boolean;
  prorationMethod: ProrationMethod;
  // Billing Defaults
  defaultPaymentTermsDays: number;
  invoicePrefix: string;
  invoiceStartNumber: number;
  invoiceAutoGenerationDay: number;
  defaultVatRate: number;
  taxMethod: TaxMethod;
  whtEnabled: boolean;
  whtRates: number[];
  autoSuspendEnabled: boolean;
  autoSuspendDays: number;
  // Credit Limit Management
  defaultCreditLimit: number | null;
  creditLimitByMembershipType: Record<string, number>;
  creditAlertThreshold: number;
  creditBlockThreshold: number;
  sendCreditAlertToMember: boolean;
  sendCreditAlertToStaff: boolean;
  allowManagerCreditOverride: boolean;
  creditOverrideMaxAmount: number | null;
  autoSuspendOnCreditExceeded: boolean;
  // Statement Configuration
  defaultStatementDelivery: StatementDelivery;
  accountNumberPrefix: string;
  accountNumberFormat: string;
  autoCreateProfileOnActivation: boolean;
  requireZeroBalanceForClosure: boolean;
  statementNumberPrefix: string;
  // Billing Cycle Mode
  billingCycleMode: BillingCycleMode;
  clubCycleClosingDay: number;
  financialPeriodType: FinancialPeriodType;
  // Close Checklist
  closeChecklistTemplate: any[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateClubBillingSettingsInput {
  defaultFrequency?: BillingFrequency;
  defaultTiming?: BillingTiming;
  defaultAlignment?: BillingAlignment;
  defaultBillingDay?: number;
  invoiceGenerationLead?: number;
  invoiceDueDays?: number;
  gracePeriodDays?: number;
  lateFeeType?: LateFeeType;
  lateFeeAmount?: number | null;
  lateFeePercentage?: number | null;
  maxLateFee?: number | null;
  autoApplyLateFee?: boolean;
  prorateNewMembers?: boolean;
  prorateChanges?: boolean;
  prorationMethod?: ProrationMethod;
  // Billing Defaults
  defaultPaymentTermsDays?: number;
  invoicePrefix?: string;
  invoiceStartNumber?: number;
  invoiceAutoGenerationDay?: number;
  defaultVatRate?: number;
  taxMethod?: TaxMethod;
  whtEnabled?: boolean;
  whtRates?: number[];
  autoSuspendEnabled?: boolean;
  autoSuspendDays?: number;
  // Credit Limit Management
  defaultCreditLimit?: number | null;
  creditLimitByMembershipType?: Record<string, number>;
  creditAlertThreshold?: number;
  creditBlockThreshold?: number;
  sendCreditAlertToMember?: boolean;
  sendCreditAlertToStaff?: boolean;
  allowManagerCreditOverride?: boolean;
  creditOverrideMaxAmount?: number | null;
  autoSuspendOnCreditExceeded?: boolean;
  // Statement Configuration
  defaultStatementDelivery?: StatementDelivery;
  accountNumberPrefix?: string;
  accountNumberFormat?: string;
  autoCreateProfileOnActivation?: boolean;
  requireZeroBalanceForClosure?: boolean;
  statementNumberPrefix?: string;
  // Billing Cycle Mode
  billingCycleMode?: BillingCycleMode;
  clubCycleClosingDay?: number;
  financialPeriodType?: FinancialPeriodType;
  // Close Checklist
  closeChecklistTemplate?: any[];
}

export interface MemberBillingProfile {
  id: string;
  memberId: string;
  billingFrequency: BillingFrequency;
  billingTiming: BillingTiming;
  billingAlignment: BillingAlignment;
  billingDay: number;
  nextBillingDate: string;
  lastBillingDate: string | null;
  customDueDays: number | null;
  customGracePeriod: number | null;
  lateFeeExempt: boolean;
  autoPayEnabled: boolean;
  paymentMethodId: string | null;
  billingHold: boolean;
  billingHoldReason: string | null;
  billingHoldUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BillingPeriodPreview {
  periodStart: string;
  periodEnd: string;
  billingDate: string;
  dueDate: string;
  baseAmount: number;
  proratedAmount: number | null;
  prorationDetails: string | null;
  lineItems: BillingLineItem[];
}

export interface BillingLineItem {
  description: string;
  amount: number;
  quantity: number;
  total: number;
}

export interface UpdateMemberBillingProfileInput {
  billingFrequency?: BillingFrequency;
  billingTiming?: BillingTiming;
  billingAlignment?: BillingAlignment;
  billingDay?: number;
  customDueDays?: number | null;
  customGracePeriod?: number | null;
  lateFeeExempt?: boolean;
  autoPayEnabled?: boolean;
  paymentMethodId?: string | null;
  billingHold?: boolean;
  billingHoldReason?: string | null;
  billingHoldUntil?: string | null;
}

// =============================================================================
// GraphQL Documents
// =============================================================================

const GET_CLUB_BILLING_SETTINGS = `
  query GetClubBillingSettings {
    clubBillingSettings {
      id
      clubId
      defaultFrequency
      defaultTiming
      defaultAlignment
      defaultBillingDay
      invoiceGenerationLead
      invoiceDueDays
      gracePeriodDays
      lateFeeType
      lateFeeAmount
      lateFeePercentage
      maxLateFee
      autoApplyLateFee
      prorateNewMembers
      prorateChanges
      prorationMethod
      defaultPaymentTermsDays
      invoicePrefix
      invoiceStartNumber
      invoiceAutoGenerationDay
      defaultVatRate
      taxMethod
      whtEnabled
      whtRates
      autoSuspendEnabled
      autoSuspendDays
      defaultCreditLimit
      creditLimitByMembershipType
      creditAlertThreshold
      creditBlockThreshold
      sendCreditAlertToMember
      sendCreditAlertToStaff
      allowManagerCreditOverride
      creditOverrideMaxAmount
      autoSuspendOnCreditExceeded
      defaultStatementDelivery
      accountNumberPrefix
      accountNumberFormat
      autoCreateProfileOnActivation
      requireZeroBalanceForClosure
      statementNumberPrefix
      billingCycleMode
      clubCycleClosingDay
      financialPeriodType
      closeChecklistTemplate
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_CLUB_BILLING_SETTINGS = `
  mutation UpdateClubBillingSettings($input: UpdateClubBillingSettingsInput!) {
    updateClubBillingSettings(input: $input) {
      id
      clubId
      defaultFrequency
      defaultTiming
      defaultAlignment
      defaultBillingDay
      invoiceGenerationLead
      invoiceDueDays
      gracePeriodDays
      lateFeeType
      lateFeeAmount
      lateFeePercentage
      maxLateFee
      autoApplyLateFee
      prorateNewMembers
      prorateChanges
      prorationMethod
      defaultPaymentTermsDays
      invoicePrefix
      invoiceStartNumber
      invoiceAutoGenerationDay
      defaultVatRate
      taxMethod
      whtEnabled
      whtRates
      autoSuspendEnabled
      autoSuspendDays
      defaultCreditLimit
      creditLimitByMembershipType
      creditAlertThreshold
      creditBlockThreshold
      sendCreditAlertToMember
      sendCreditAlertToStaff
      allowManagerCreditOverride
      creditOverrideMaxAmount
      autoSuspendOnCreditExceeded
      defaultStatementDelivery
      accountNumberPrefix
      accountNumberFormat
      autoCreateProfileOnActivation
      requireZeroBalanceForClosure
      statementNumberPrefix
      billingCycleMode
      clubCycleClosingDay
      financialPeriodType
      closeChecklistTemplate
      createdAt
      updatedAt
    }
  }
`;

const GET_MEMBER_BILLING_PROFILE = `
  query GetMemberBillingProfile($memberId: ID!) {
    memberBillingProfile(memberId: $memberId) {
      id
      memberId
      billingFrequency
      billingTiming
      billingAlignment
      billingDay
      nextBillingDate
      lastBillingDate
      customDueDays
      customGracePeriod
      lateFeeExempt
      autoPayEnabled
      paymentMethodId
      billingHold
      billingHoldReason
      billingHoldUntil
      createdAt
      updatedAt
    }
  }
`;

const PREVIEW_NEXT_BILLING_PERIOD = `
  query PreviewNextBillingPeriod($memberId: ID!) {
    previewNextBillingPeriod(memberId: $memberId) {
      periodStart
      periodEnd
      billingDate
      dueDate
      baseAmount
      proratedAmount
      prorationDetails
      lineItems {
        description
        amount
        quantity
        total
      }
    }
  }
`;

const UPDATE_MEMBER_BILLING_PROFILE = `
  mutation UpdateMemberBillingProfile($memberId: ID!, $input: UpdateMemberBillingProfileInput!) {
    updateMemberBillingProfile(memberId: $memberId, input: $input) {
      id
      memberId
      billingFrequency
      billingTiming
      billingAlignment
      billingDay
      nextBillingDate
      lastBillingDate
      customDueDays
      customGracePeriod
      lateFeeExempt
      autoPayEnabled
      paymentMethodId
      createdAt
      updatedAt
    }
  }
`;

// =============================================================================
// Query Keys
// =============================================================================

export const billingSettingsKeys = {
  all: ['billingSettings'] as const,
  clubSettings: () => [...billingSettingsKeys.all, 'club'] as const,
  memberProfile: (memberId: string) =>
    [...billingSettingsKeys.all, 'memberProfile', memberId] as const,
  billingPreview: (memberId: string) =>
    [...billingSettingsKeys.all, 'billingPreview', memberId] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Hook for fetching and updating club-level billing settings
 */
export function useClubBillingSettings() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: billingSettingsKeys.clubSettings(),
    queryFn: async () => {
      try {
        const result = await request<{ clubBillingSettings: ClubBillingSettings }>(
          GET_CLUB_BILLING_SETTINGS
        );
        return result.clubBillingSettings;
      } catch (e) {
        console.warn('Failed to fetch club billing settings:', e);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: async (input: UpdateClubBillingSettingsInput) => {
      const result = await request<{
        updateClubBillingSettings: ClubBillingSettings;
      }>(UPDATE_CLUB_BILLING_SETTINGS, { input });
      return result.updateClubBillingSettings;
    },
    onSuccess: (updatedSettings) => {
      // Update the cache with new settings
      queryClient.setQueryData(
        billingSettingsKeys.clubSettings(),
        updatedSettings
      );
    },
  });

  const updateSettings = useCallback(
    async (input: UpdateClubBillingSettingsInput) => {
      return updateMutation.mutateAsync(input);
    },
    [updateMutation]
  );

  const settings = useMemo(() => {
    return data ?? undefined;
  }, [data]);

  return {
    settings,
    isLoading,
    error: error as Error | null,
    updateSettings,
    isUpdating: updateMutation.isPending,
  };
}

/**
 * Hook for fetching and updating a member's billing profile
 */
export function useMemberBillingProfile(memberId?: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: billingSettingsKeys.memberProfile(memberId ?? ''),
    queryFn: async () => {
      if (!memberId) return null;
      try {
        const result = await request<{
          memberBillingProfile: MemberBillingProfile | null;
        }>(GET_MEMBER_BILLING_PROFILE, { memberId });
        return result.memberBillingProfile;
      } catch (e) {
        console.warn('Failed to fetch member billing profile:', e);
        return null;
      }
    },
    enabled: !!memberId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: async (input: UpdateMemberBillingProfileInput) => {
      if (!memberId) throw new Error('Member ID is required');
      const result = await request<{
        updateMemberBillingProfile: MemberBillingProfile;
      }>(UPDATE_MEMBER_BILLING_PROFILE, { memberId, input });
      return result.updateMemberBillingProfile;
    },
    onSuccess: (updatedProfile) => {
      // Update the cache with new profile
      queryClient.setQueryData(
        billingSettingsKeys.memberProfile(memberId ?? ''),
        updatedProfile
      );
      // Invalidate billing preview as it may have changed
      queryClient.invalidateQueries({
        queryKey: billingSettingsKeys.billingPreview(memberId ?? ''),
      });
    },
  });

  const updateProfile = useCallback(
    async (input: UpdateMemberBillingProfileInput) => {
      return updateMutation.mutateAsync(input);
    },
    [updateMutation]
  );

  const profile = useMemo(() => {
    return data ?? undefined;
  }, [data]);

  return {
    profile,
    isLoading,
    error: error as Error | null,
    updateProfile,
    isUpdating: updateMutation.isPending,
  };
}

/**
 * Hook for previewing a member's next billing period
 */
export function useBillingPeriodPreview(memberId?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: billingSettingsKeys.billingPreview(memberId ?? ''),
    queryFn: async () => {
      if (!memberId) return null;
      try {
        const result = await request<{
          previewNextBillingPeriod: BillingPeriodPreview | null;
        }>(PREVIEW_NEXT_BILLING_PERIOD, { memberId });
        return result.previewNextBillingPeriod;
      } catch (e) {
        console.warn('Failed to fetch billing period preview:', e);
        return null;
      }
    },
    enabled: !!memberId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1,
  });

  const preview = useMemo(() => {
    return data ?? undefined;
  }, [data]);

  return {
    preview,
    isLoading,
    error: error as Error | null,
  };
}

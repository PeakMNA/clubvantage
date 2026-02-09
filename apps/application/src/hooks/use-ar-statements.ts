/**
 * AR Statement System hooks
 * Wraps generated API client hooks with data transformation
 */

import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '@clubvantage/api-client';
// Use direct import path to avoid barrel optimization issues
import {
  // AR Profile hooks
  useGetArProfilesQuery,
  useGetArProfileQuery,
  useGetArProfileByMemberQuery,
  useCreateArProfileMutation,
  useUpdateArProfileMutation,
  useSuspendArProfileMutation,
  useReactivateArProfileMutation,
  useCloseArProfileMutation,
  // AR Profile Sync hooks
  useGetMembersWithoutArProfilesCountQuery,
  useGetMembersWithoutArProfilesQuery,
  useSyncMembersToArProfilesMutation,
  useSyncCityLedgersToArProfilesMutation,
  // Statement Period hooks
  useGetStatementPeriodsQuery,
  useGetStatementPeriodQuery,
  useGetCurrentStatementPeriodQuery,
  useCreateStatementPeriodMutation,
  useUpdateStatementPeriodMutation,
  useCloseStatementPeriodMutation,
  useReopenStatementPeriodMutation,
  useDeleteStatementPeriodMutation,
  // Statement Run hooks
  useGetStatementRunsByPeriodQuery,
  useGetStatementRunQuery,
  useStartStatementRunMutation,
  useCancelStatementRunMutation,
  // Statement hooks
  useGetStatementsByRunQuery,
  useGetStatementQuery,
  useGetProfileStatementsQuery,
  useUpdateStatementDeliveryStatusMutation,
  useMarkStatementPortalViewedMutation,
  // AR Period Settings hooks
  useGetArPeriodSettingsQuery,
  useUpdateArSettingsMutation,
} from '@clubvantage/api-client/hooks';
// Types from main entry
import {
  type ArProfileType,
  type ArProfileStatus,
  type StatementDelivery,
  type PeriodStatus,
  type StatementRunType,
  type StatementRunStatus,
  type DeliveryStatus,
  type ArCycleType,
  type ArCloseBehavior,
} from '@clubvantage/api-client';

// ==================== Types (re-export for convenience) ====================

export type ARProfileType = ArProfileType;
export type ARProfileStatus = ArProfileStatus;
export type { StatementDelivery, PeriodStatus, StatementRunType, StatementRunStatus, DeliveryStatus };

export interface ARProfile {
  id: string;
  accountNumber: string;
  profileType: ARProfileType;
  memberId?: string | null;
  cityLedgerId?: string | null;
  // Standalone account info (for CITY_LEDGER without linked entity)
  accountName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  billingAddress?: string | null;
  statementDelivery: StatementDelivery;
  paymentTermsDays: number;
  creditLimit?: number | null;
  currentBalance: number;
  lastStatementDate?: Date | null;
  lastStatementBalance?: number | null;
  lastPaymentDate?: Date | null;
  lastPaymentAmount?: number | null;
  status: ARProfileStatus;
  suspendedAt?: Date | null;
  suspendedReason?: string | null;
  closedAt?: Date | null;
  closedReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StatementPeriod {
  id: string;
  periodYear: number;
  periodNumber: number;
  periodLabel: string;
  periodStart: Date;
  periodEnd: Date;
  cutoffDate: Date;
  isCatchUp: boolean;
  status: PeriodStatus;
  closedAt?: Date | null;
  closedBy?: string | null;
  reopenedAt?: Date | null;
  reopenedBy?: string | null;
  reopenReason?: string | null;
  reopenApprovedBy?: string | null;
  totalProfiles?: number | null;
  totalStatements?: number | null;
  totalOpeningBalance?: number | null;
  totalDebits?: number | null;
  totalCredits?: number | null;
  totalClosingBalance?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StatementRun {
  id: string;
  statementPeriodId: string;
  runType: StatementRunType;
  runNumber: number;
  status: StatementRunStatus;
  startedAt?: Date | null;
  completedAt?: Date | null;
  totalProfiles: number;
  processedCount: number;
  generatedCount: number;
  skippedCount: number;
  errorCount: number;
  totalOpeningBalance: number;
  totalDebits: number;
  totalCredits: number;
  totalClosingBalance: number;
  errorLog?: unknown;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ARStatementTransaction {
  id: string;
  date: string;
  type: 'INVOICE' | 'PAYMENT';
  description: string;
  amount: number;
  balance?: number;
  runningBalance: number;
  invoiceNumber?: string;
  referenceNumber?: string;
  dueDate?: string;
}

export interface ARStatement {
  id: string;
  arProfileId: string;
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date;
  openingBalance: number;
  totalDebits: number;
  totalCredits: number;
  closingBalance: number;
  agingCurrent: number;
  aging1to30: number;
  aging31to60: number;
  aging61to90: number;
  aging90Plus: number;
  profileSnapshot: unknown;
  transactionCount: number;
  transactions: ARStatementTransaction[];
  pdfUrl?: string | null;
  pdfGeneratedAt?: Date | null;
  deliveryMethod: StatementDelivery;
  emailStatus: DeliveryStatus;
  emailSentAt?: Date | null;
  emailDeliveredAt?: Date | null;
  emailError?: string | null;
  printStatus: DeliveryStatus;
  printedAt?: Date | null;
  printBatchId?: string | null;
  portalStatus: DeliveryStatus;
  portalPublishedAt?: Date | null;
  portalViewedAt?: Date | null;
  smsStatus: DeliveryStatus;
  smsSentAt?: Date | null;
  smsDeliveredAt?: Date | null;
  smsError?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Query Keys ====================

export const arStatementKeys = {
  all: ['ar-statements'] as const,
  profiles: {
    all: ['ar-statements', 'profiles'] as const,
    list: (filter?: ARProfileFilterInput) => ['ar-statements', 'profiles', 'list', filter] as const,
    detail: (id: string) => ['ar-statements', 'profiles', 'detail', id] as const,
    byMember: (memberId: string) => ['ar-statements', 'profiles', 'member', memberId] as const,
    byCityLedger: (cityLedgerId: string) => ['ar-statements', 'profiles', 'cityLedger', cityLedgerId] as const,
  },
  periods: {
    all: ['ar-statements', 'periods'] as const,
    list: (filter?: StatementPeriodFilterInput) => ['ar-statements', 'periods', 'list', filter] as const,
    detail: (id: string) => ['ar-statements', 'periods', 'detail', id] as const,
    current: ['ar-statements', 'periods', 'current'] as const,
  },
  runs: {
    all: ['ar-statements', 'runs'] as const,
    list: (filter?: StatementRunFilterInput) => ['ar-statements', 'runs', 'list', filter] as const,
    byPeriod: (periodId: string) => ['ar-statements', 'runs', 'period', periodId] as const,
    detail: (id: string) => ['ar-statements', 'runs', 'detail', id] as const,
  },
  statements: {
    all: ['ar-statements', 'statements'] as const,
    byRun: (runId: string) => ['ar-statements', 'statements', 'run', runId] as const,
    byProfile: (profileId: string) => ['ar-statements', 'statements', 'profile', profileId] as const,
    detail: (id: string) => ['ar-statements', 'statements', 'detail', id] as const,
  },
};

// ==================== Filter Inputs ====================

export interface ARProfileFilterInput {
  profileType?: ARProfileType;
  status?: ARProfileStatus;
  search?: string;
  minBalance?: number;
  maxBalance?: number;
}

export interface StatementPeriodFilterInput {
  periodYear?: number;
  status?: PeriodStatus;
}

export interface StatementRunFilterInput {
  statementPeriodId?: string;
  runType?: StatementRunType;
  status?: StatementRunStatus;
}

// ==================== Transform Helpers ====================

function transformDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  return new Date(dateStr);
}

function transformARProfile(profile: any): ARProfile {
  return {
    id: profile.id,
    accountNumber: profile.accountNumber,
    profileType: profile.profileType as ARProfileType,
    memberId: profile.memberId,
    cityLedgerId: profile.cityLedgerId,
    accountName: profile.accountName,
    contactEmail: profile.contactEmail,
    contactPhone: profile.contactPhone,
    billingAddress: profile.billingAddress,
    statementDelivery: profile.statementDelivery,
    paymentTermsDays: profile.paymentTermsDays,
    creditLimit: profile.creditLimit,
    currentBalance: profile.currentBalance,
    lastStatementDate: transformDate(profile.lastStatementDate),
    lastStatementBalance: profile.lastStatementBalance,
    lastPaymentDate: transformDate(profile.lastPaymentDate),
    lastPaymentAmount: profile.lastPaymentAmount,
    status: profile.status as ARProfileStatus,
    suspendedAt: transformDate(profile.suspendedAt),
    suspendedReason: profile.suspendedReason,
    closedAt: transformDate(profile.closedAt),
    closedReason: profile.closedReason,
    createdAt: new Date(profile.createdAt),
    updatedAt: new Date(profile.updatedAt),
  };
}

function transformStatementPeriod(period: any): StatementPeriod {
  return {
    id: period.id,
    periodYear: period.periodYear,
    periodNumber: period.periodNumber,
    periodLabel: period.periodLabel,
    periodStart: new Date(period.periodStart),
    periodEnd: new Date(period.periodEnd),
    cutoffDate: new Date(period.cutoffDate),
    isCatchUp: period.isCatchUp ?? false,
    status: period.status as PeriodStatus,
    closedAt: transformDate(period.closedAt),
    closedBy: period.closedBy,
    reopenedAt: transformDate(period.reopenedAt),
    reopenedBy: period.reopenedBy,
    reopenReason: period.reopenReason,
    reopenApprovedBy: period.reopenApprovedBy,
    totalProfiles: period.totalProfiles,
    totalStatements: period.totalStatements,
    totalOpeningBalance: period.totalOpeningBalance,
    totalDebits: period.totalDebits,
    totalCredits: period.totalCredits,
    totalClosingBalance: period.totalClosingBalance,
    createdAt: new Date(period.createdAt),
    updatedAt: new Date(period.updatedAt),
  };
}

function transformStatementRun(run: any): StatementRun {
  return {
    id: run.id,
    statementPeriodId: run.statementPeriodId,
    runType: run.runType as StatementRunType,
    runNumber: run.runNumber,
    status: run.status as StatementRunStatus,
    startedAt: transformDate(run.startedAt),
    completedAt: transformDate(run.completedAt),
    totalProfiles: run.totalProfiles,
    processedCount: run.processedCount,
    generatedCount: run.generatedCount,
    skippedCount: run.skippedCount,
    errorCount: run.errorCount,
    totalOpeningBalance: run.totalOpeningBalance,
    totalDebits: run.totalDebits,
    totalCredits: run.totalCredits,
    totalClosingBalance: run.totalClosingBalance,
    errorLog: run.errorLog,
    createdBy: run.createdBy,
    createdAt: new Date(run.createdAt),
    updatedAt: new Date(run.updatedAt),
  };
}

function transformARStatement(statement: any): ARStatement {
  return {
    id: statement.id,
    arProfileId: statement.arProfileId,
    periodStart: new Date(statement.periodStart),
    periodEnd: new Date(statement.periodEnd),
    dueDate: new Date(statement.dueDate),
    openingBalance: statement.openingBalance,
    totalDebits: statement.totalDebits ?? 0,
    totalCredits: statement.totalCredits ?? 0,
    closingBalance: statement.closingBalance,
    agingCurrent: statement.agingCurrent,
    aging1to30: statement.aging1to30,
    aging31to60: statement.aging31to60,
    aging61to90: statement.aging61to90,
    aging90Plus: statement.aging90Plus,
    profileSnapshot: statement.profileSnapshot,
    transactionCount: statement.transactionCount ?? 0,
    transactions: (statement.transactions as ARStatementTransaction[]) ?? [],
    pdfUrl: statement.pdfUrl,
    pdfGeneratedAt: transformDate(statement.pdfGeneratedAt),
    deliveryMethod: statement.deliveryMethod,
    emailStatus: statement.emailStatus,
    emailSentAt: transformDate(statement.emailSentAt),
    emailDeliveredAt: transformDate(statement.emailDeliveredAt),
    emailError: statement.emailError,
    printStatus: statement.printStatus,
    printedAt: transformDate(statement.printedAt),
    printBatchId: statement.printBatchId,
    portalStatus: statement.portalStatus,
    portalPublishedAt: transformDate(statement.portalPublishedAt),
    portalViewedAt: transformDate(statement.portalViewedAt),
    smsStatus: statement.smsStatus,
    smsSentAt: transformDate(statement.smsSentAt),
    smsDeliveredAt: transformDate(statement.smsDeliveredAt),
    smsError: statement.smsError,
    createdAt: new Date(statement.createdAt),
    updatedAt: new Date(statement.updatedAt),
  };
}

// ==================== AR Profile Hooks ====================

export function useARProfiles(filter?: ARProfileFilterInput) {
  const { data, isLoading, error, refetch } = useGetArProfilesQuery({
    filter: filter ? {
      profileType: filter.profileType,
      status: filter.status,
      search: filter.search,
      minBalance: filter.minBalance,
      maxBalance: filter.maxBalance,
    } : undefined,
  });

  const profiles = useMemo(() => {
    if (!data?.arProfiles) return [];
    return data.arProfiles.map(transformARProfile);
  }, [data]);

  return {
    profiles,
    isLoading,
    error,
    refetch,
  };
}

export function useARProfile(id: string, enabled = true) {
  const { data, isLoading, error, refetch } = useGetArProfileQuery(
    { id },
    { enabled: enabled && !!id }
  );

  const profile = useMemo(() => {
    if (!data?.arProfile) return null;
    return transformARProfile(data.arProfile);
  }, [data]);

  return {
    profile,
    isLoading,
    error,
    refetch,
  };
}

export function useARProfileByMember(memberId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useGetArProfileByMemberQuery(
    { memberId },
    { enabled: enabled && !!memberId }
  );

  const profile = useMemo(() => {
    if (!data?.arProfileByMember) return null;
    return transformARProfile(data.arProfileByMember);
  }, [data]);

  return {
    profile,
    isLoading,
    error,
    refetch,
  };
}

// ==================== Statement Period Hooks ====================

export function useStatementPeriods(filter?: StatementPeriodFilterInput) {
  const { data, isLoading, error, refetch } = useGetStatementPeriodsQuery({
    filter: filter ? {
      periodYear: filter.periodYear,
      status: filter.status,
    } : undefined,
  });

  const periods = useMemo(() => {
    if (!data?.statementPeriods) return [];
    return data.statementPeriods.map(transformStatementPeriod);
  }, [data]);

  return {
    periods,
    isLoading,
    error,
    refetch,
  };
}

export function useStatementPeriod(id: string, enabled = true) {
  const { data, isLoading, error, refetch } = useGetStatementPeriodQuery(
    { id },
    { enabled: enabled && !!id }
  );

  const period = useMemo(() => {
    if (!data?.statementPeriod) return null;
    return transformStatementPeriod(data.statementPeriod);
  }, [data]);

  return {
    period,
    isLoading,
    error,
    refetch,
  };
}

export function useCurrentStatementPeriod() {
  const { data, isLoading, error, refetch } = useGetCurrentStatementPeriodQuery();

  const period = useMemo(() => {
    if (!data?.currentStatementPeriod) return null;
    return transformStatementPeriod(data.currentStatementPeriod);
  }, [data]);

  return {
    period,
    isLoading,
    error,
    refetch,
  };
}

// ==================== Statement Run Hooks ====================

export function useStatementRunsByPeriod(periodId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useGetStatementRunsByPeriodQuery(
    { periodId },
    { enabled: enabled && !!periodId }
  );

  const runs = useMemo(() => {
    if (!data?.statementRunsByPeriod) return [];
    return data.statementRunsByPeriod.map(transformStatementRun);
  }, [data]);

  return {
    runs,
    isLoading,
    error,
    refetch,
  };
}

export function useStatementRun(id: string, enabled = true) {
  const { data, isLoading, error, refetch } = useGetStatementRunQuery(
    { id },
    { enabled: enabled && !!id }
  );

  const run = useMemo(() => {
    if (!data?.statementRun) return null;
    return transformStatementRun(data.statementRun);
  }, [data]);

  return {
    run,
    isLoading,
    error,
    refetch,
  };
}

// ==================== Statement Hooks ====================

export function useStatementsByRun(runId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useGetStatementsByRunQuery(
    { runId },
    { enabled: enabled && !!runId }
  );

  const statements = useMemo(() => {
    if (!data?.statements) return [];
    return data.statements.map(transformARStatement);
  }, [data]);

  return {
    statements,
    isLoading,
    error,
    refetch,
  };
}

export function useProfileStatements(arProfileId: string, onlyFinal = true, enabled = true) {
  const { data, isLoading, error, refetch } = useGetProfileStatementsQuery(
    { arProfileId, onlyFinal },
    { enabled: enabled && !!arProfileId }
  );

  const statements = useMemo(() => {
    if (!data?.profileStatements) return [];
    return data.profileStatements.map(transformARStatement);
  }, [data]);

  return {
    statements,
    isLoading,
    error,
    refetch,
  };
}

export function useStatement(id: string, enabled = true) {
  const { data, isLoading, error, refetch } = useGetStatementQuery(
    { id },
    { enabled: enabled && !!id }
  );

  const statement = useMemo(() => {
    if (!data?.statement) return null;
    return transformARStatement(data.statement);
  }, [data]);

  return {
    statement,
    isLoading,
    error,
    refetch,
  };
}

// ==================== Mutations ====================

export function useARStatementMutations() {
  const queryClient = useQueryClient();

  // AR Profile mutations
  const createProfileMutation = useCreateArProfileMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arStatementKeys.profiles.all });
    },
  });

  const updateProfileMutation = useUpdateArProfileMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arStatementKeys.profiles.all });
    },
  });

  const suspendProfileMutation = useSuspendArProfileMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arStatementKeys.profiles.all });
    },
  });

  const reactivateProfileMutation = useReactivateArProfileMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arStatementKeys.profiles.all });
    },
  });

  const closeProfileMutation = useCloseArProfileMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arStatementKeys.profiles.all });
    },
  });

  // Statement Period mutations
  const createPeriodMutation = useCreateStatementPeriodMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arStatementKeys.periods.all });
    },
  });

  const updatePeriodMutation = useUpdateStatementPeriodMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arStatementKeys.periods.all });
    },
  });

  const closePeriodMutation = useCloseStatementPeriodMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arStatementKeys.periods.all });
    },
  });

  const reopenPeriodMutation = useReopenStatementPeriodMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arStatementKeys.periods.all });
    },
  });

  const deletePeriodMutation = useDeleteStatementPeriodMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arStatementKeys.periods.all });
    },
  });

  // Statement Run mutations
  const startRunMutation = useStartStatementRunMutation({
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: arStatementKeys.runs.all });
      queryClient.invalidateQueries({
        queryKey: arStatementKeys.runs.byPeriod(variables.input.statementPeriodId),
      });
    },
  });

  const cancelRunMutation = useCancelStatementRunMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arStatementKeys.runs.all });
    },
  });

  // Statement mutations
  const updateDeliveryStatusMutation = useUpdateStatementDeliveryStatusMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arStatementKeys.statements.all });
    },
  });

  const markPortalViewedMutation = useMarkStatementPortalViewedMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arStatementKeys.statements.all });
    },
  });

  // Wrapped mutation functions
  const createARProfile = useCallback(
    async (input: {
      profileType: ARProfileType;
      memberId?: string;
      cityLedgerId?: string;
      // Standalone account info (for CITY_LEDGER without linked entity)
      accountName?: string;
      contactEmail?: string;
      contactPhone?: string;
      billingAddress?: string;
      statementDelivery?: StatementDelivery;
      paymentTermsDays?: number;
      creditLimit?: number;
    }) => {
      return createProfileMutation.mutateAsync({ input: input as any });
    },
    [createProfileMutation]
  );

  const updateARProfile = useCallback(
    async (id: string, input: {
      statementDelivery?: StatementDelivery;
      paymentTermsDays?: number;
      creditLimit?: number;
      accountName?: string;
      contactEmail?: string;
      contactPhone?: string;
      billingAddress?: string;
    }) => {
      return updateProfileMutation.mutateAsync({ id, input: input as any });
    },
    [updateProfileMutation]
  );

  const suspendARProfile = useCallback(
    async (id: string, reason: string) => {
      return suspendProfileMutation.mutateAsync({ id, input: { reason } });
    },
    [suspendProfileMutation]
  );

  const reactivateARProfile = useCallback(
    async (id: string) => {
      return reactivateProfileMutation.mutateAsync({ id });
    },
    [reactivateProfileMutation]
  );

  const closeARProfile = useCallback(
    async (id: string, reason: string) => {
      return closeProfileMutation.mutateAsync({ id, input: { reason } });
    },
    [closeProfileMutation]
  );

  const createStatementPeriod = useCallback(
    async (input: {
      periodYear: number;
      periodNumber: number;
      periodLabel: string;
      periodStart: string;
      periodEnd: string;
      cutoffDate: string;
      isCatchUp?: boolean;
    }) => {
      return createPeriodMutation.mutateAsync({ input });
    },
    [createPeriodMutation]
  );

  const updateStatementPeriod = useCallback(
    async (id: string, input: {
      periodLabel?: string;
      periodStart?: string;
      periodEnd?: string;
      cutoffDate?: string;
    }) => {
      return updatePeriodMutation.mutateAsync({ id, input });
    },
    [updatePeriodMutation]
  );

  const closeStatementPeriod = useCallback(
    async (id: string) => {
      return closePeriodMutation.mutateAsync({ id });
    },
    [closePeriodMutation]
  );

  const reopenStatementPeriod = useCallback(
    async (id: string, reason: string) => {
      return reopenPeriodMutation.mutateAsync({
        id,
        input: { reason },
      });
    },
    [reopenPeriodMutation]
  );

  const deleteStatementPeriod = useCallback(
    async (id: string) => {
      return deletePeriodMutation.mutateAsync({ id });
    },
    [deletePeriodMutation]
  );

  const startStatementRun = useCallback(
    async (input: {
      statementPeriodId: string;
      runType: StatementRunType;
      profileIds?: string[];
    }) => {
      return startRunMutation.mutateAsync({ input: input as any });
    },
    [startRunMutation]
  );

  const cancelStatementRun = useCallback(
    async (id: string) => {
      return cancelRunMutation.mutateAsync({ id });
    },
    [cancelRunMutation]
  );

  const updateStatementDeliveryStatus = useCallback(
    async (id: string, channel: string, status: string, error?: string) => {
      return updateDeliveryStatusMutation.mutateAsync({ id, channel, status, error });
    },
    [updateDeliveryStatusMutation]
  );

  const markStatementPortalViewed = useCallback(
    async (id: string) => {
      return markPortalViewedMutation.mutateAsync({ id });
    },
    [markPortalViewedMutation]
  );

  return {
    // AR Profile
    createARProfile,
    updateARProfile,
    suspendARProfile,
    reactivateARProfile,
    closeARProfile,
    isCreatingProfile: createProfileMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isSuspendingProfile: suspendProfileMutation.isPending,
    // Statement Period
    createStatementPeriod,
    updateStatementPeriod,
    closeStatementPeriod,
    reopenStatementPeriod,
    deleteStatementPeriod,
    isCreatingPeriod: createPeriodMutation.isPending,
    isUpdatingPeriod: updatePeriodMutation.isPending,
    isClosingPeriod: closePeriodMutation.isPending,
    isReopeningPeriod: reopenPeriodMutation.isPending,
    // Statement Run
    startStatementRun,
    cancelStatementRun,
    isStartingRun: startRunMutation.isPending,
    isCancellingRun: cancelRunMutation.isPending,
    // Statement
    updateStatementDeliveryStatus,
    markStatementPortalViewed,
    isUpdatingDelivery: updateDeliveryStatusMutation.isPending,
  };
}

// ==================== AR Profile Sync Hooks ====================

export interface MemberWithoutARProfile {
  id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  membershipTypeName?: string | null;
}

export interface ARProfileSyncResult {
  created: number;
  skipped: number;
  errors: string[];
}

/**
 * Get count of members without AR profiles
 */
export function useMembersWithoutARProfilesCount() {
  const { data, isLoading, error, refetch } = useGetMembersWithoutArProfilesCountQuery();

  return {
    count: data?.membersWithoutARProfilesCount ?? 0,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Get list of members without AR profiles
 */
export function useMembersWithoutARProfiles() {
  const { data, isLoading, error, refetch } = useGetMembersWithoutArProfilesQuery();

  const members = useMemo(() => {
    if (!data?.membersWithoutARProfiles) return [];
    return data.membersWithoutARProfiles as MemberWithoutARProfile[];
  }, [data]);

  return {
    members,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for syncing members and city ledgers to AR profiles
 */
export function useARProfileSync() {
  const queryClient = useQueryClient();

  const syncMembersMutation = useSyncMembersToArProfilesMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arStatementKeys.profiles.all });
    },
  });

  const syncCityLedgersMutation = useSyncCityLedgersToArProfilesMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arStatementKeys.profiles.all });
    },
  });

  const syncMembers = useCallback(
    async (options?: { statementDelivery?: StatementDelivery; paymentTermsDays?: number }) => {
      const result = await syncMembersMutation.mutateAsync({
        input: options as any,
      });
      return result.syncMembersToARProfiles as ARProfileSyncResult;
    },
    [syncMembersMutation]
  );

  const syncCityLedgers = useCallback(
    async (options?: { statementDelivery?: StatementDelivery; paymentTermsDays?: number }) => {
      const result = await syncCityLedgersMutation.mutateAsync({
        input: options as any,
      });
      return result.syncCityLedgersToARProfiles as ARProfileSyncResult;
    },
    [syncCityLedgersMutation]
  );

  return {
    syncMembers,
    syncCityLedgers,
    isSyncingMembers: syncMembersMutation.isPending,
    isSyncingCityLedgers: syncCityLedgersMutation.isPending,
  };
}

// ==================== Utility Hooks ====================

/**
 * Calculate run progress percentage
 */
export function useRunProgress(run: StatementRun | null) {
  return useMemo(() => {
    if (!run || run.totalProfiles === 0) return 0;
    return Math.round((run.processedCount / run.totalProfiles) * 100);
  }, [run]);
}

/**
 * Format period label from year and number
 */
export function formatPeriodLabel(periodYear: number, periodNumber: number): string {
  const month = new Date(periodYear, periodNumber - 1, 1).toLocaleDateString('en-US', { month: 'long' });
  return `${month} ${periodYear}`;
}

/**
 * Get primary delivery status from statement
 */
export function getPrimaryDeliveryStatus(statement: ARStatement): DeliveryStatus {
  switch (statement.deliveryMethod) {
    case 'EMAIL':
    case 'EMAIL_AND_PRINT':
      return statement.emailStatus;
    case 'PRINT':
      return statement.printStatus;
    case 'PORTAL':
      return statement.portalStatus;
    case 'SMS':
      return statement.smsStatus;
    case 'ALL':
      // For ALL, return the worst status
      const statuses = [
        statement.emailStatus,
        statement.printStatus,
        statement.portalStatus,
        statement.smsStatus,
      ];
      if (statuses.includes('FAILED')) return 'FAILED';
      if (statuses.includes('PENDING')) return 'PENDING';
      if (statuses.includes('SENT')) return 'SENT';
      return 'DELIVERED';
    default:
      return 'PENDING';
  }
}

// ==================== AR Period Settings ====================

export type ARCycleType = ArCycleType;
export type ARCloseBehavior = ArCloseBehavior;

export interface ARPeriodSettings {
  arCycleType: ARCycleType;
  arCustomCycleStartDay: number;
  arCutoffDays: number;
  arCloseBehavior: ARCloseBehavior;
  arAutoGenerateNext: boolean;
}

export interface UpdateARPeriodSettingsInput {
  arCycleType?: ARCycleType;
  arCustomCycleStartDay?: number;
  arCutoffDays?: number;
  arCloseBehavior?: ARCloseBehavior;
  arAutoGenerateNext?: boolean;
}

/**
 * Hook to fetch AR period settings
 */
export function useARPeriodSettings() {
  const { data, isLoading, error, refetch } = useGetArPeriodSettingsQuery();

  const settings = useMemo((): ARPeriodSettings | null => {
    if (!data?.arPeriodSettings) return null;
    return {
      arCycleType: data.arPeriodSettings.arCycleType,
      arCustomCycleStartDay: data.arPeriodSettings.arCustomCycleStartDay,
      arCutoffDays: data.arPeriodSettings.arCutoffDays,
      arCloseBehavior: data.arPeriodSettings.arCloseBehavior,
      arAutoGenerateNext: data.arPeriodSettings.arAutoGenerateNext,
    };
  }, [data]);

  return {
    settings,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to update AR period settings
 */
export function useUpdateARPeriodSettings() {
  const queryClient = useQueryClient();
  const mutation = useUpdateArSettingsMutation();

  const updateSettings = useCallback(
    async (input: UpdateARPeriodSettingsInput) => {
      const result = await mutation.mutateAsync({ input });
      // Invalidate the settings query
      queryClient.invalidateQueries({ queryKey: useGetArPeriodSettingsQuery.getKey() });
      return result;
    },
    [mutation, queryClient]
  );

  return {
    updateSettings,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

// ==================== Close Checklist ====================

export type CloseChecklistStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type CloseChecklistPhase = 'PRE_CLOSE' | 'CUT_OFF' | 'RECEIVABLES' | 'TAX' | 'RECONCILIATION' | 'REPORTING' | 'CLOSE' | 'STATEMENTS';
export type StepEnforcement = 'REQUIRED' | 'OPTIONAL';
export type StepVerification = 'AUTO' | 'MANUAL' | 'SYSTEM_ACTION';
export type StepStatus = 'PENDING' | 'PASSED' | 'FAILED' | 'SKIPPED' | 'SIGNED_OFF';

export interface CloseChecklistStep {
  id: string;
  stepKey: string;
  phase: CloseChecklistPhase;
  label: string;
  description?: string;
  enforcement: StepEnforcement;
  verification: StepVerification;
  status: StepStatus;
  autoCheckResult?: Record<string, unknown>;
  signedOffById?: string;
  signedOffAt?: Date;
  notes?: string;
  sortOrder: number;
}

export interface CloseChecklist {
  id: string;
  periodId: string;
  status: CloseChecklistStatus;
  startedAt?: Date;
  completedAt?: Date;
  completedById?: string;
  steps: CloseChecklistStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CanClosePeriodResult {
  canClose: boolean;
  blockingSteps: string[];
  completedRequired: number;
  totalRequired: number;
}

const GET_CLOSE_CHECKLIST = `
  query GetCloseChecklist($periodId: ID!) {
    closeChecklist(periodId: $periodId) {
      id
      periodId
      status
      startedAt
      completedAt
      completedById
      steps {
        id
        stepKey
        phase
        label
        description
        enforcement
        verification
        status
        autoCheckResult
        signedOffById
        signedOffAt
        notes
        sortOrder
      }
      createdAt
      updatedAt
    }
  }
`;

const CAN_CLOSE_PERIOD = `
  query CanClosePeriod($checklistId: ID!) {
    canClosePeriod(checklistId: $checklistId) {
      canClose
      blockingSteps
      completedRequired
      totalRequired
    }
  }
`;

const CREATE_CLOSE_CHECKLIST = `
  mutation CreateCloseChecklist($periodId: ID!) {
    createCloseChecklist(periodId: $periodId) {
      id
      periodId
      status
      steps {
        id
        stepKey
        phase
        label
        description
        enforcement
        verification
        status
        sortOrder
      }
      createdAt
      updatedAt
    }
  }
`;

const SIGN_OFF_STEP = `
  mutation SignOffChecklistStep($input: SignOffStepInput!) {
    signOffChecklistStep(input: $input) {
      id
      status
      signedOffById
      signedOffAt
      notes
    }
  }
`;

const RUN_AUTO_VERIFICATION = `
  mutation RunAutoVerification($stepId: ID!) {
    runAutoVerification(stepId: $stepId) {
      id
      status
      autoCheckResult
    }
  }
`;

const SKIP_STEP = `
  mutation SkipChecklistStep($input: SkipStepInput!) {
    skipChecklistStep(input: $input) {
      id
      status
      notes
    }
  }
`;

const RUN_ALL_AUTO_CHECKS = `
  mutation RunAllAutoChecks($checklistId: ID!) {
    runAllAutoChecks(checklistId: $checklistId) {
      id
      status
      steps {
        id
        stepKey
        status
        autoCheckResult
      }
    }
  }
`;

/**
 * Hook to get close checklist for a period
 */
export function useCloseChecklist(periodId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['close-checklist', periodId],
    queryFn: () => request<{ closeChecklist: CloseChecklist | null }>(GET_CLOSE_CHECKLIST, { periodId }),
    enabled: enabled && !!periodId,
  });

  return {
    checklist: data?.closeChecklist ?? null,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to check if a period can be closed
 */
export function useCanClosePeriod(checklistId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['can-close-period', checklistId],
    queryFn: () => request<{ canClosePeriod: CanClosePeriodResult }>(CAN_CLOSE_PERIOD, { checklistId }),
    enabled: enabled && !!checklistId,
  });

  return {
    result: data?.canClosePeriod ?? null,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for close checklist mutations
 */
export function useCloseChecklistMutations() {
  const queryClient = useQueryClient();

  const invalidateChecklist = (periodId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['close-checklist'] });
    queryClient.invalidateQueries({ queryKey: ['can-close-period'] });
    if (periodId) {
      queryClient.invalidateQueries({ queryKey: ['close-checklist', periodId] });
    }
  };

  const createChecklistMutation = useMutation({
    mutationFn: (periodId: string) =>
      request<{ createCloseChecklist: CloseChecklist }>(CREATE_CLOSE_CHECKLIST, { periodId }),
    onSuccess: (data) => invalidateChecklist(data.createCloseChecklist.periodId),
  });

  const signOffStepMutation = useMutation({
    mutationFn: (input: { stepId: string; notes?: string }) =>
      request<{ signOffChecklistStep: CloseChecklistStep }>(SIGN_OFF_STEP, { input }),
    onSuccess: () => invalidateChecklist(),
  });

  const runAutoVerificationMutation = useMutation({
    mutationFn: (stepId: string) =>
      request<{ runAutoVerification: CloseChecklistStep }>(RUN_AUTO_VERIFICATION, { stepId }),
    onSuccess: () => invalidateChecklist(),
  });

  const skipStepMutation = useMutation({
    mutationFn: (input: { stepId: string; notes?: string }) =>
      request<{ skipChecklistStep: CloseChecklistStep }>(SKIP_STEP, { input }),
    onSuccess: () => invalidateChecklist(),
  });

  const runAllAutoChecksMutation = useMutation({
    mutationFn: (checklistId: string) =>
      request<{ runAllAutoChecks: CloseChecklist }>(RUN_ALL_AUTO_CHECKS, { checklistId }),
    onSuccess: () => invalidateChecklist(),
  });

  return {
    createChecklist: useCallback(
      (periodId: string) => createChecklistMutation.mutateAsync(periodId),
      [createChecklistMutation],
    ),
    signOffStep: useCallback(
      (stepId: string, notes?: string) => signOffStepMutation.mutateAsync({ stepId, notes }),
      [signOffStepMutation],
    ),
    runAutoVerification: useCallback(
      (stepId: string) => runAutoVerificationMutation.mutateAsync(stepId),
      [runAutoVerificationMutation],
    ),
    skipStep: useCallback(
      (stepId: string, notes?: string) => skipStepMutation.mutateAsync({ stepId, notes }),
      [skipStepMutation],
    ),
    runAllAutoChecks: useCallback(
      (checklistId: string) => runAllAutoChecksMutation.mutateAsync(checklistId),
      [runAllAutoChecksMutation],
    ),
    isCreating: createChecklistMutation.isPending,
    isSigningOff: signOffStepMutation.isPending,
    isVerifying: runAutoVerificationMutation.isPending,
    isSkipping: skipStepMutation.isPending,
    isRunningAllChecks: runAllAutoChecksMutation.isPending,
  };
}

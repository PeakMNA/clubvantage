/**
 * AR Statement System hooks
 * These hooks will be updated to use generated API client after codegen
 */

import { useMemo, useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ==================== Types ====================

export type ARProfileType = 'MEMBER' | 'CITY_LEDGER';
export type ARProfileStatus = 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
export type StatementDelivery = 'EMAIL' | 'PRINT' | 'PORTAL' | 'SMS' | 'EMAIL_AND_PRINT' | 'ALL';
export type PeriodStatus = 'OPEN' | 'CLOSED' | 'REOPENED';
export type StatementRunType = 'PREVIEW' | 'FINAL';
export type StatementRunStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type DeliveryStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'NOT_APPLICABLE';

export interface ARProfile {
  id: string;
  accountNumber: string;
  profileType: ARProfileType;
  memberId?: string;
  cityLedgerId?: string;
  statementDelivery: StatementDelivery;
  paymentTermsDays: number;
  creditLimit?: number;
  currentBalance: number;
  lastStatementDate?: Date;
  lastStatementBalance?: number;
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
  status: ARProfileStatus;
  suspendedAt?: Date;
  suspendedReason?: string;
  closedAt?: Date;
  closedReason?: string;
  createdAt: Date;
  updatedAt: Date;
  // Joined data
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    memberId: string;
    email?: string;
  };
  cityLedger?: {
    id: string;
    accountName: string;
    accountType: string;
    contactEmail?: string;
  };
}

export interface StatementPeriod {
  id: string;
  periodYear: number;
  periodNumber: number;
  periodLabel: string;
  periodStart: Date;
  periodEnd: Date;
  cutoffDate: Date;
  status: PeriodStatus;
  closedAt?: Date;
  closedBy?: string;
  reopenedAt?: Date;
  reopenedBy?: string;
  reopenReason?: string;
  totalProfiles?: number;
  totalStatements?: number;
  totalOpeningBalance?: number;
  totalDebits?: number;
  totalCredits?: number;
  totalClosingBalance?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StatementRun {
  id: string;
  statementPeriodId: string;
  runType: StatementRunType;
  runNumber: number;
  status: StatementRunStatus;
  startedAt?: Date;
  completedAt?: Date;
  totalProfiles: number;
  processedCount: number;
  generatedCount: number;
  skippedCount: number;
  errorCount: number;
  totalOpeningBalance: number;
  totalDebits: number;
  totalCredits: number;
  totalClosingBalance: number;
  errorLog?: Array<{ profileId: string; error: string }>;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  // Joined data
  statementPeriod?: {
    periodYear: number;
    periodNumber: number;
    periodLabel: string;
  };
}

export interface ARStatement {
  id: string;
  statementRunId: string;
  arProfileId: string;
  statementNumber?: string;
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
  profileSnapshot: Record<string, unknown>;
  transactionCount: number;
  transactions?: Array<{
    id: string;
    date: string;
    type: string;
    description: string;
    amount: number;
    runningBalance: number;
  }>;
  pdfUrl?: string;
  pdfGeneratedAt?: Date;
  deliveryMethod: StatementDelivery;
  emailStatus: DeliveryStatus;
  emailSentAt?: Date;
  printStatus: DeliveryStatus;
  printedAt?: Date;
  portalStatus: DeliveryStatus;
  portalPublishedAt?: Date;
  portalViewedAt?: Date;
  smsStatus: DeliveryStatus;
  smsSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Joined data
  arProfile?: ARProfile;
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
    byMember: (memberId: string) => ['ar-statements', 'statements', 'member', memberId] as const,
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

// ==================== AR Profile Hooks ====================

export function useARProfiles(filter?: ARProfileFilterInput) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: arStatementKeys.profiles.list(filter),
    queryFn: async () => {
      // TODO: Replace with generated API client after codegen
      // return apiClient.arProfiles(filter);
      return [] as ARProfile[];
    },
  });

  return {
    profiles: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function useARProfile(id: string, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: arStatementKeys.profiles.detail(id),
    queryFn: async () => {
      // TODO: Replace with generated API client after codegen
      return null as ARProfile | null;
    },
    enabled: enabled && !!id,
  });

  return {
    profile: data,
    isLoading,
    error,
    refetch,
  };
}

export function useARProfileByMember(memberId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: arStatementKeys.profiles.byMember(memberId),
    queryFn: async () => {
      // TODO: Replace with generated API client after codegen
      return null as ARProfile | null;
    },
    enabled: enabled && !!memberId,
  });

  return {
    profile: data,
    isLoading,
    error,
    refetch,
  };
}

// ==================== Statement Period Hooks ====================

export function useStatementPeriods(filter?: StatementPeriodFilterInput) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: arStatementKeys.periods.list(filter),
    queryFn: async () => {
      // TODO: Replace with generated API client after codegen
      return [] as StatementPeriod[];
    },
  });

  return {
    periods: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function useStatementPeriod(id: string, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: arStatementKeys.periods.detail(id),
    queryFn: async () => {
      // TODO: Replace with generated API client after codegen
      return null as StatementPeriod | null;
    },
    enabled: enabled && !!id,
  });

  return {
    period: data,
    isLoading,
    error,
    refetch,
  };
}

export function useCurrentStatementPeriod() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: arStatementKeys.periods.current,
    queryFn: async () => {
      // TODO: Replace with generated API client after codegen
      return null as StatementPeriod | null;
    },
  });

  return {
    period: data,
    isLoading,
    error,
    refetch,
  };
}

// ==================== Statement Run Hooks ====================

export function useStatementRuns(filter?: StatementRunFilterInput) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: arStatementKeys.runs.list(filter),
    queryFn: async () => {
      // TODO: Replace with generated API client after codegen
      return [] as StatementRun[];
    },
  });

  return {
    runs: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function useStatementRunsByPeriod(periodId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: arStatementKeys.runs.byPeriod(periodId),
    queryFn: async () => {
      // TODO: Replace with generated API client after codegen
      return [] as StatementRun[];
    },
    enabled: enabled && !!periodId,
  });

  return {
    runs: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function useStatementRun(id: string, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: arStatementKeys.runs.detail(id),
    queryFn: async () => {
      // TODO: Replace with generated API client after codegen
      return null as StatementRun | null;
    },
    enabled: enabled && !!id,
  });

  return {
    run: data,
    isLoading,
    error,
    refetch,
  };
}

// ==================== Statement Hooks ====================

export function useStatementsByRun(runId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: arStatementKeys.statements.byRun(runId),
    queryFn: async () => {
      // TODO: Replace with generated API client after codegen
      return [] as ARStatement[];
    },
    enabled: enabled && !!runId,
  });

  return {
    statements: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function useMemberStatements(memberId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: arStatementKeys.statements.byMember(memberId),
    queryFn: async () => {
      // TODO: Replace with generated API client after codegen
      return [] as ARStatement[];
    },
    enabled: enabled && !!memberId,
  });

  return {
    statements: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function useStatement(id: string, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: arStatementKeys.statements.detail(id),
    queryFn: async () => {
      // TODO: Replace with generated API client after codegen
      return null as ARStatement | null;
    },
    enabled: enabled && !!id,
  });

  return {
    statement: data,
    isLoading,
    error,
    refetch,
  };
}

// ==================== Mutations ====================

export function useARStatementMutations() {
  const queryClient = useQueryClient();

  // AR Profile mutations
  const createARProfile = useCallback(async (input: {
    profileType: ARProfileType;
    memberId?: string;
    cityLedgerId?: string;
    statementDelivery?: StatementDelivery;
    paymentTermsDays?: number;
    creditLimit?: number;
  }) => {
    // TODO: Replace with generated API client after codegen
    console.log('createARProfile', input);
    queryClient.invalidateQueries({ queryKey: arStatementKeys.profiles.all });
  }, [queryClient]);

  const suspendARProfile = useCallback(async (id: string, reason: string) => {
    // TODO: Replace with generated API client after codegen
    console.log('suspendARProfile', id, reason);
    queryClient.invalidateQueries({ queryKey: arStatementKeys.profiles.all });
  }, [queryClient]);

  const reactivateARProfile = useCallback(async (id: string) => {
    // TODO: Replace with generated API client after codegen
    console.log('reactivateARProfile', id);
    queryClient.invalidateQueries({ queryKey: arStatementKeys.profiles.all });
  }, [queryClient]);

  // Statement Period mutations
  const createStatementPeriod = useCallback(async (input: {
    periodYear: number;
    periodNumber: number;
    periodLabel: string;
    periodStart: string;
    periodEnd: string;
    cutoffDate: string;
  }) => {
    // TODO: Replace with generated API client after codegen
    console.log('createStatementPeriod', input);
    queryClient.invalidateQueries({ queryKey: arStatementKeys.periods.all });
  }, [queryClient]);

  const closeStatementPeriod = useCallback(async (id: string) => {
    // TODO: Replace with generated API client after codegen
    console.log('closeStatementPeriod', id);
    queryClient.invalidateQueries({ queryKey: arStatementKeys.periods.all });
  }, [queryClient]);

  const reopenStatementPeriod = useCallback(async (id: string, reason: string) => {
    // TODO: Replace with generated API client after codegen
    console.log('reopenStatementPeriod', id, reason);
    queryClient.invalidateQueries({ queryKey: arStatementKeys.periods.all });
  }, [queryClient]);

  // Statement Run mutations
  const startStatementRun = useCallback(async (input: {
    statementPeriodId: string;
    runType: StatementRunType;
    profileIds?: string[];
  }) => {
    // TODO: Replace with generated API client after codegen
    console.log('startStatementRun', input);
    queryClient.invalidateQueries({ queryKey: arStatementKeys.runs.all });
  }, [queryClient]);

  const cancelStatementRun = useCallback(async (id: string) => {
    // TODO: Replace with generated API client after codegen
    console.log('cancelStatementRun', id);
    queryClient.invalidateQueries({ queryKey: arStatementKeys.runs.all });
  }, [queryClient]);

  return {
    // AR Profile
    createARProfile,
    suspendARProfile,
    reactivateARProfile,
    // Statement Period
    createStatementPeriod,
    closeStatementPeriod,
    reopenStatementPeriod,
    // Statement Run
    startStatementRun,
    cancelStatementRun,
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

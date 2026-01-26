/**
 * Members hooks that wrap the API client and transform data
 * for use in the frontend components
 */

import { useMemo, useCallback } from 'react';
import {
  useGetMembersQuery,
  useGetMemberQuery,
  useGetMemberStatsQuery,
  useCreateMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
  queryKeys,
  request,
} from '@clubvantage/api-client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import type { Member, MemberStatus, MemberFilters } from '@/components/members/types';

// Inline GraphQL document for testing
const GetMembersInlineDocument = `
  query GetMembers($first: Int, $skip: Int, $search: String, $status: MemberStatus, $membershipTypeId: ID) {
    members(first: $first, skip: $skip, search: $search, status: $status, membershipTypeId: $membershipTypeId) {
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
          membershipType { id name code }
          membershipTier { id name code }
        }
        cursor
      }
      pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
      totalCount
    }
  }
`;

// Transform API member to frontend Member type
function transformMember(apiMember: any): Member {
  return {
    id: apiMember.id,
    memberNumber: apiMember.memberId || '',
    firstName: apiMember.firstName,
    lastName: apiMember.lastName,
    email: apiMember.email || '',
    phone: apiMember.phone || '',
    photoUrl: apiMember.avatarUrl,
    dateOfBirth: apiMember.dateOfBirth || '',
    nationality: apiMember.nationality || '',
    membershipTypeId: apiMember.membershipType?.id || '',
    membershipTypeName: apiMember.membershipType?.name || '',
    status: mapApiStatus(apiMember.status),
    joinDate: apiMember.joinDate || '',
    balance: parseFloat(apiMember.outstandingBalance || '0'),
    autoPay: false, // Not in API yet
    addresses: [], // Not in list query
    dependents: apiMember.dependents?.map((d: any) => ({
      id: d.id,
      memberNumber: '',
      firstName: d.firstName,
      lastName: d.lastName,
      relationship: d.relationship,
      dateOfBirth: d.dateOfBirth || '',
      status: d.isActive ? 'ACTIVE' : 'INACTIVE',
    })) || [],
  };
}

// Map API status to frontend status
function mapApiStatus(apiStatus: string): MemberStatus {
  const statusMap: Record<string, MemberStatus> = {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    LAPSED: 'INACTIVE',
    RESIGNED: 'CANCELLED',
    TERMINATED: 'CANCELLED',
    PROSPECT: 'PENDING',
    LEAD: 'PENDING',
    APPLICANT: 'PENDING',
    REACTIVATED: 'ACTIVE',
  };
  return statusMap[apiStatus] || 'ACTIVE';
}

// Map frontend status to API status
function mapFrontendStatus(frontendStatus: MemberStatus): string {
  const statusMap: Record<MemberStatus, string> = {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    INACTIVE: 'LAPSED',
    CANCELLED: 'RESIGNED',
    PENDING: 'APPLICANT',
  };
  return statusMap[frontendStatus] || 'ACTIVE';
}

export interface UseMembersOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: MemberStatus;
  membershipTypeId?: string;
  enabled?: boolean;
}

export function useMembers(options: UseMembersOptions = {}) {
  const { page = 1, pageSize = 20, search, status, membershipTypeId, enabled = true } = options;

  // Use inline query with direct request call
  const variables = {
    first: pageSize,
    skip: (page - 1) * pageSize,
    search: search || undefined,
    status: status ? mapFrontendStatus(status) as any : undefined,
    membershipTypeId: membershipTypeId || undefined,
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['GetMembersInline', variables],
    queryFn: () => request<any>(GetMembersInlineDocument, variables),
    enabled,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const members = useMemo(() => {
    if (!data?.members?.edges) return [];
    return data.members.edges.map((edge: any) => transformMember(edge.node));
  }, [data]);

  const totalCount = data?.members?.totalCount || 0;
  const hasNextPage = data?.members?.pageInfo?.hasNextPage || false;
  const hasPreviousPage = data?.members?.pageInfo?.hasPreviousPage || false;

  return {
    members,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    error,
    refetch,
  };
}

export function useMember(id: string, enabled = true) {
  const { data, isLoading, error, refetch } = useGetMemberQuery(
    { id },
    { enabled: enabled && !!id }
  );

  const member = useMemo(() => {
    if (!data?.member) return null;
    return transformMember(data.member);
  }, [data]);

  return {
    member,
    isLoading,
    error,
    refetch,
  };
}

export function useMemberStats() {
  const { data, isLoading, error } = useGetMemberStatsQuery();

  const stats = useMemo(() => {
    if (!data?.memberStats) {
      return { total: 0, active: 0, suspended: 0, inactive: 0 };
    }
    return data.memberStats;
  }, [data]);

  return {
    stats,
    isLoading,
    error,
  };
}

export function useMemberMutations() {
  const queryClient = useQueryClient();

  const createMutation = useCreateMemberMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.stats });
    },
  });

  const updateMutation = useUpdateMemberMutation({
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.detail(variables.id) });
    },
  });

  const deleteMutation = useDeleteMemberMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.stats });
    },
  });

  const createMember = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      membershipTypeId: string;
    }) => {
      return createMutation.mutateAsync({ input: data });
    },
    [createMutation]
  );

  const updateMember = useCallback(
    async (id: string, data: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      status: MemberStatus;
    }>) => {
      const input: any = { ...data };
      if (data.status) {
        input.status = mapFrontendStatus(data.status);
        delete input.status; // Status change should use dedicated mutation
      }
      return updateMutation.mutateAsync({ id, input });
    },
    [updateMutation]
  );

  const deleteMember = useCallback(
    async (id: string) => {
      return deleteMutation.mutateAsync({ id });
    },
    [deleteMutation]
  );

  return {
    createMember,
    updateMember,
    deleteMember,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Filter members locally (for client-side filtering when data is already loaded)
export function filterMembersLocal(
  members: Member[],
  filters: MemberFilters
): Member[] {
  return members.filter((member) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        member.firstName.toLowerCase().includes(searchLower) ||
        member.lastName.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower) ||
        member.memberNumber.toLowerCase().includes(searchLower) ||
        member.phone.includes(filters.search);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.statuses && filters.statuses.length > 0) {
      if (!filters.statuses.includes(member.status)) return false;
    }

    // Membership type filter
    if (filters.membershipTypes && filters.membershipTypes.length > 0) {
      if (!filters.membershipTypes.includes(member.membershipTypeId)) return false;
    }

    // Balance range filter
    if (filters.balanceMin !== undefined) {
      if (member.balance < filters.balanceMin) return false;
    }
    if (filters.balanceMax !== undefined) {
      if (member.balance > filters.balanceMax) return false;
    }

    return true;
  });
}

/**
 * Engagement hooks for interest capture and communication preferences
 * Wraps the API client and transforms data for use in frontend components
 */

import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '@clubvantage/api-client';
import type {
  InterestCategory,
  MemberInterest,
  DependentInterest,
  CommunicationPrefs,
  SetMemberInterestsInput,
  SetDependentInterestsInput,
  UpdateCommunicationPrefsInput,
} from '@/components/members/engagement/types';

// =============================================================================
// GraphQL Documents
// =============================================================================

const GetInterestCategoriesDocument = `
  query GetInterestCategories($isActive: Boolean) {
    interestCategories(isActive: $isActive) {
      id
      code
      name
      description
      icon
      color
      sortOrder
      isActive
    }
  }
`;

const GetMemberInterestsDocument = `
  query GetMemberInterests($memberId: ID!) {
    memberInterests(memberId: $memberId) {
      id
      memberId
      categoryId
      interestLevel
      source
      lastActivityAt
      activityCount
      category {
        id
        code
        name
        icon
        color
      }
    }
  }
`;

const GetDependentInterestsDocument = `
  query GetDependentInterests($dependentId: ID!) {
    dependentInterests(dependentId: $dependentId) {
      id
      dependentId
      categoryId
      interestLevel
      category {
        id
        code
        name
        icon
        color
      }
    }
  }
`;

const GetCommunicationPrefsDocument = `
  query GetMemberCommunicationPrefs($memberId: ID!) {
    memberCommunicationPrefs(memberId: $memberId) {
      id
      memberId
      emailPromotions
      smsPromotions
      pushNotifications
      unsubscribedCategories
    }
  }
`;

const SetMemberInterestsDocument = `
  mutation SetMemberInterests($input: SetMemberInterestsInput!) {
    setMemberInterests(input: $input) {
      id
      memberId
      categoryId
      interestLevel
      source
      category {
        id
        code
        name
        icon
        color
      }
    }
  }
`;

const SetDependentInterestsDocument = `
  mutation SetDependentInterests($input: SetDependentInterestsInput!) {
    setDependentInterests(input: $input) {
      id
      dependentId
      categoryId
      interestLevel
      category {
        id
        code
        name
        icon
        color
      }
    }
  }
`;

const RemoveMemberInterestDocument = `
  mutation RemoveMemberInterest($memberId: ID!, $categoryId: ID!) {
    removeMemberInterest(memberId: $memberId, categoryId: $categoryId) {
      message
    }
  }
`;

const RemoveDependentInterestDocument = `
  mutation RemoveDependentInterest($dependentId: ID!, $categoryId: ID!) {
    removeDependentInterest(dependentId: $dependentId, categoryId: $categoryId) {
      message
    }
  }
`;

const UpdateCommunicationPrefsDocument = `
  mutation UpdateMemberCommunicationPrefs($input: UpdateCommunicationPrefsInput!) {
    updateMemberCommunicationPrefs(input: $input) {
      id
      memberId
      emailPromotions
      smsPromotions
      pushNotifications
      unsubscribedCategories
    }
  }
`;

// =============================================================================
// Query Keys
// =============================================================================

export const engagementQueryKeys = {
  all: ['engagement'] as const,
  categories: () => [...engagementQueryKeys.all, 'categories'] as const,
  memberInterests: (memberId: string) => [...engagementQueryKeys.all, 'member-interests', memberId] as const,
  dependentInterests: (dependentId: string) => [...engagementQueryKeys.all, 'dependent-interests', dependentId] as const,
  communicationPrefs: (memberId: string) => [...engagementQueryKeys.all, 'communication-prefs', memberId] as const,
};

// =============================================================================
// Transform Functions
// =============================================================================

function transformCategory(data: any): InterestCategory {
  return {
    id: data.id,
    code: data.code,
    name: data.name,
    description: data.description ?? undefined,
    icon: data.icon ?? undefined,
    color: data.color ?? undefined,
    sortOrder: data.sortOrder,
    isActive: data.isActive,
  };
}

function transformMemberInterest(data: any): MemberInterest {
  return {
    id: data.id,
    memberId: data.memberId,
    categoryId: data.categoryId,
    interestLevel: data.interestLevel,
    source: data.source,
    lastActivityAt: data.lastActivityAt ?? undefined,
    activityCount: data.activityCount ?? 0,
    category: data.category ? transformCategory(data.category) : undefined,
  };
}

function transformDependentInterest(data: any): DependentInterest {
  return {
    id: data.id,
    dependentId: data.dependentId,
    categoryId: data.categoryId,
    interestLevel: data.interestLevel,
    category: data.category ? transformCategory(data.category) : undefined,
  };
}

function transformCommunicationPrefs(data: any): CommunicationPrefs {
  return {
    id: data.id,
    memberId: data.memberId,
    emailPromotions: data.emailPromotions,
    smsPromotions: data.smsPromotions,
    pushNotifications: data.pushNotifications,
    unsubscribedCategories: data.unsubscribedCategories ?? [],
  };
}

// =============================================================================
// Hooks
// =============================================================================

export interface UseInterestCategoriesOptions {
  isActive?: boolean;
  enabled?: boolean;
}

export function useInterestCategories(options: UseInterestCategoriesOptions = {}) {
  const { isActive = true, enabled = true } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: engagementQueryKeys.categories(),
    queryFn: () => request<any>(GetInterestCategoriesDocument, { isActive }),
    enabled,
    staleTime: 60000, // 1 minute - categories don't change often
  });

  const categories = useMemo(() => {
    if (!data?.interestCategories) return [];
    return data.interestCategories.map(transformCategory);
  }, [data]);

  return {
    categories,
    isLoading,
    error,
    refetch,
  };
}

export function useMemberInterests(memberId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: engagementQueryKeys.memberInterests(memberId),
    queryFn: () => request<any>(GetMemberInterestsDocument, { memberId }),
    enabled: enabled && !!memberId,
    staleTime: 30000, // 30 seconds
  });

  const interests = useMemo(() => {
    if (!data?.memberInterests) return [];
    return data.memberInterests.map(transformMemberInterest);
  }, [data]);

  // Create a map for quick lookup
  const interestMap = useMemo(() => {
    const map = new Map<string, number>();
    interests.forEach((interest: MemberInterest) => map.set(interest.categoryId, interest.interestLevel));
    return map;
  }, [interests]);

  return {
    interests,
    interestMap,
    isLoading,
    error,
    refetch,
  };
}

export function useDependentInterests(dependentId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: engagementQueryKeys.dependentInterests(dependentId),
    queryFn: () => request<any>(GetDependentInterestsDocument, { dependentId }),
    enabled: enabled && !!dependentId,
    staleTime: 30000,
  });

  const interests = useMemo(() => {
    if (!data?.dependentInterests) return [];
    return data.dependentInterests.map(transformDependentInterest);
  }, [data]);

  const interestMap = useMemo(() => {
    const map = new Map<string, number>();
    interests.forEach((interest: DependentInterest) => map.set(interest.categoryId, interest.interestLevel));
    return map;
  }, [interests]);

  return {
    interests,
    interestMap,
    isLoading,
    error,
    refetch,
  };
}

export function useCommunicationPrefs(memberId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: engagementQueryKeys.communicationPrefs(memberId),
    queryFn: () => request<any>(GetCommunicationPrefsDocument, { memberId }),
    enabled: enabled && !!memberId,
    staleTime: 30000,
  });

  const prefs = useMemo(() => {
    if (!data?.memberCommunicationPrefs) return null;
    return transformCommunicationPrefs(data.memberCommunicationPrefs);
  }, [data]);

  return {
    prefs,
    isLoading,
    error,
    refetch,
  };
}

// =============================================================================
// Mutation Hooks
// =============================================================================

export function useEngagementMutations() {
  const queryClient = useQueryClient();

  // Set member interests
  const setMemberInterestsMutation = useMutation({
    mutationFn: (input: SetMemberInterestsInput) =>
      request<any>(SetMemberInterestsDocument, { input }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: engagementQueryKeys.memberInterests(variables.memberId),
      });
    },
  });

  // Set dependent interests
  const setDependentInterestsMutation = useMutation({
    mutationFn: (input: SetDependentInterestsInput) =>
      request<any>(SetDependentInterestsDocument, { input }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: engagementQueryKeys.dependentInterests(variables.dependentId),
      });
    },
  });

  // Remove member interest
  const removeMemberInterestMutation = useMutation({
    mutationFn: ({ memberId, categoryId }: { memberId: string; categoryId: string }) =>
      request<any>(RemoveMemberInterestDocument, { memberId, categoryId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: engagementQueryKeys.memberInterests(variables.memberId),
      });
    },
  });

  // Remove dependent interest
  const removeDependentInterestMutation = useMutation({
    mutationFn: ({ dependentId, categoryId }: { dependentId: string; categoryId: string }) =>
      request<any>(RemoveDependentInterestDocument, { dependentId, categoryId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: engagementQueryKeys.dependentInterests(variables.dependentId),
      });
    },
  });

  // Update communication prefs
  const updateCommunicationPrefsMutation = useMutation({
    mutationFn: (input: UpdateCommunicationPrefsInput) =>
      request<any>(UpdateCommunicationPrefsDocument, { input }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: engagementQueryKeys.communicationPrefs(variables.memberId),
      });
    },
  });

  // Convenience functions
  const setMemberInterests = useCallback(
    async (input: SetMemberInterestsInput) => {
      return setMemberInterestsMutation.mutateAsync(input);
    },
    [setMemberInterestsMutation],
  );

  const setDependentInterests = useCallback(
    async (input: SetDependentInterestsInput) => {
      return setDependentInterestsMutation.mutateAsync(input);
    },
    [setDependentInterestsMutation],
  );

  const removeMemberInterest = useCallback(
    async (memberId: string, categoryId: string) => {
      return removeMemberInterestMutation.mutateAsync({ memberId, categoryId });
    },
    [removeMemberInterestMutation],
  );

  const removeDependentInterest = useCallback(
    async (dependentId: string, categoryId: string) => {
      return removeDependentInterestMutation.mutateAsync({ dependentId, categoryId });
    },
    [removeDependentInterestMutation],
  );

  const updateCommunicationPrefs = useCallback(
    async (input: UpdateCommunicationPrefsInput) => {
      return updateCommunicationPrefsMutation.mutateAsync(input);
    },
    [updateCommunicationPrefsMutation],
  );

  return {
    setMemberInterests,
    setDependentInterests,
    removeMemberInterest,
    removeDependentInterest,
    updateCommunicationPrefs,
    isSettingMemberInterests: setMemberInterestsMutation.isPending,
    isSettingDependentInterests: setDependentInterestsMutation.isPending,
    isRemovingMemberInterest: removeMemberInterestMutation.isPending,
    isRemovingDependentInterest: removeDependentInterestMutation.isPending,
    isUpdatingCommunicationPrefs: updateCommunicationPrefsMutation.isPending,
  };
}

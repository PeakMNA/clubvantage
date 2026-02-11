/**
 * Discount hooks that wrap the API client and transform data
 * for use in the frontend components
 */

import { useMemo, useCallback } from 'react';
import {
  useGetDiscountsQuery,
  useGetActiveDiscountsQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
} from '@clubvantage/api-client/hooks';
import { queryKeys } from '@clubvantage/api-client';
import { useQueryClient } from '@tanstack/react-query';

export interface DiscountListItem {
  id: string;
  name: string;
  code: string | null;
  type: string; // 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number;
  scope: string;
  usageCount: number;
  usageLimit: number | null;
  validFrom: Date | null;
  validTo: Date | null;
  isActive: boolean;
  requiresApproval: boolean;
  createdAt: Date;
}

function transformDiscount(apiDiscount: any): DiscountListItem {
  return {
    id: apiDiscount.id,
    name: apiDiscount.name,
    code: apiDiscount.code || null,
    type: apiDiscount.type,
    value: parseFloat(apiDiscount.value || '0'),
    scope: apiDiscount.scope,
    usageCount: apiDiscount.validity?.usageCount || 0,
    usageLimit: apiDiscount.validity?.usageLimit || null,
    validFrom: apiDiscount.validity?.validFrom ? new Date(apiDiscount.validity.validFrom) : null,
    validTo: apiDiscount.validity?.validTo ? new Date(apiDiscount.validity.validTo) : null,
    isActive: apiDiscount.isActive,
    requiresApproval: apiDiscount.approval?.requiresApproval || false,
    createdAt: new Date(apiDiscount.createdAt),
  };
}

export interface UseDiscountsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  scope?: string;
  isActive?: boolean;
  enabled?: boolean;
}

export function useDiscounts(options: UseDiscountsOptions = {}) {
  const {
    page = 1,
    pageSize = 20,
    search,
    type,
    scope,
    isActive,
    enabled = true,
  } = options;

  const { data, isLoading, error, refetch } = useGetDiscountsQuery(
    {
      first: pageSize,
      skip: (page - 1) * pageSize,
      search: search || undefined,
      type: type as any,
      scope: scope as any,
      isActive: isActive,
    },
    { enabled }
  );

  const discounts = useMemo(() => {
    if (!data?.discounts?.edges) return [];
    return data.discounts.edges.map((edge: any) => transformDiscount(edge.node));
  }, [data]);

  const totalCount = data?.discounts?.totalCount || 0;

  return {
    discounts,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    isLoading,
    error,
    refetch,
  };
}

export function useActiveDiscounts(enabled = true) {
  const { data, isLoading, error } = useGetActiveDiscountsQuery(
    {},
    { enabled }
  );

  const discounts = useMemo(() => {
    if (!data?.activeDiscounts) return [];
    return data.activeDiscounts.map(transformDiscount);
  }, [data]);

  return { discounts, isLoading, error };
}

export function useDiscountMutations() {
  const queryClient = useQueryClient();

  const invalidateDiscounts = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.discounts.all });
  };

  const createMutation = useCreateDiscountMutation({
    onSuccess: invalidateDiscounts,
  });

  const updateMutation = useUpdateDiscountMutation({
    onSuccess: invalidateDiscounts,
  });

  const deleteMutation = useDeleteDiscountMutation({
    onSuccess: invalidateDiscounts,
  });

  const createDiscount = useCallback(
    async (data: {
      name: string;
      code?: string;
      type: string;
      value: number;
      scope: string;
      validFrom?: Date;
      validTo?: Date;
      usageLimit?: number;
      requiresApproval?: boolean;
      approvalThreshold?: number;
      minimumAmount?: number;
      maximumDiscount?: number;
    }) => {
      return createMutation.mutateAsync({
        input: {
          name: data.name,
          code: data.code,
          type: data.type,
          value: data.value,
          scope: data.scope,
          validFrom: data.validFrom?.toISOString(),
          validTo: data.validTo?.toISOString(),
          usageLimit: data.usageLimit,
          requiresApproval: data.requiresApproval,
          approvalThreshold: data.approvalThreshold,
          minimumAmount: data.minimumAmount,
          maximumDiscount: data.maximumDiscount,
        } as any,
      });
    },
    [createMutation]
  );

  const updateDiscount = useCallback(
    async (id: string, data: Record<string, any>) => {
      return updateMutation.mutateAsync({ id, input: data as any });
    },
    [updateMutation]
  );

  const deleteDiscount = useCallback(
    async (id: string) => {
      return deleteMutation.mutateAsync({ id });
    },
    [deleteMutation]
  );

  return {
    createDiscount,
    updateDiscount,
    deleteDiscount,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

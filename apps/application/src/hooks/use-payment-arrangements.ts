/**
 * Payment arrangement hooks that wrap generated API hooks
 */

import { useMemo, useCallback } from 'react';
import {
  useGetPaymentArrangementsQuery,
  useCreatePaymentArrangementMutation,
  useActivatePaymentArrangementMutation,
  useRecordInstallmentPaymentMutation,
  useCancelPaymentArrangementMutation,
} from '@clubvantage/api-client/hooks';
import { queryKeys } from '@clubvantage/api-client';
import { useQueryClient } from '@tanstack/react-query';

export interface ArrangementListItem {
  id: string;
  arrangementNumber: string;
  memberId: string;
  memberName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  installmentCount: number;
  frequency: string;
  startDate: Date;
  endDate: Date;
  status: string;
  installments: Array<{
    id: string;
    installmentNo: number;
    dueDate: Date;
    amount: number;
    paidAmount: number;
    status: string;
  }>;
}

export interface UsePaymentArrangementsOptions {
  page?: number;
  pageSize?: number;
  memberId?: string;
  status?: string;
  enabled?: boolean;
}

function transformArrangement(api: any): ArrangementListItem {
  return {
    id: api.id,
    arrangementNumber: api.arrangementNumber,
    memberId: api.member?.id ?? '',
    memberName: api.member
      ? `${api.member.firstName} ${api.member.lastName}`
      : 'Unknown',
    totalAmount: parseFloat(api.totalAmount || '0'),
    paidAmount: parseFloat(api.paidAmount || '0'),
    remainingAmount: parseFloat(api.remainingAmount || '0'),
    installmentCount: api.installmentCount,
    frequency: api.frequency,
    startDate: new Date(api.startDate),
    endDate: new Date(api.endDate),
    status: api.status,
    installments: (api.installments ?? []).map((inst: any) => ({
      id: inst.id,
      installmentNo: inst.installmentNo,
      dueDate: new Date(inst.dueDate),
      amount: parseFloat(inst.amount || '0'),
      paidAmount: parseFloat(inst.paidAmount || '0'),
      status: inst.status,
    })),
  };
}

export function usePaymentArrangements(options: UsePaymentArrangementsOptions = {}) {
  const { page = 1, pageSize = 20, memberId, status, enabled = true } = options;

  const { data, isLoading, error, refetch } = useGetPaymentArrangementsQuery(
    {
      first: pageSize,
      skip: (page - 1) * pageSize,
      memberId: memberId ?? undefined,
      status: status as any ?? undefined,
    },
    { enabled },
  );

  const arrangements = useMemo((): ArrangementListItem[] => {
    const edges = data?.paymentArrangements?.edges ?? [];
    return edges.map((edge: any) => transformArrangement(edge.node));
  }, [data]);

  const totalCount = data?.paymentArrangements?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    arrangements,
    totalCount,
    totalPages,
    isLoading,
    error,
    refetch,
  };
}

export function usePaymentArrangementMutations() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.paymentArrangements.all });
  }, [queryClient]);

  const createMutation = useCreatePaymentArrangementMutation({
    onSuccess: () => invalidate(),
  });
  const activateMutation = useActivatePaymentArrangementMutation({
    onSuccess: () => invalidate(),
  });
  const recordMutation = useRecordInstallmentPaymentMutation({
    onSuccess: () => invalidate(),
  });
  const cancelMutation = useCancelPaymentArrangementMutation({
    onSuccess: () => invalidate(),
  });

  return {
    createArrangement: async (data: {
      memberId: string;
      invoiceIds: string[];
      installmentCount: number;
      frequency: string;
      startDate: string;
      notes?: string;
    }) => {
      await createMutation.mutateAsync({
        input: {
          memberId: data.memberId,
          invoiceIds: data.invoiceIds,
          installmentCount: data.installmentCount,
          frequency: data.frequency as any,
          startDate: data.startDate,
          notes: data.notes,
        },
      });
    },
    activateArrangement: async (id: string) => {
      await activateMutation.mutateAsync({ id });
    },
    recordInstallmentPayment: async (data: {
      arrangementId: string;
      installmentId: string;
      paymentId: string;
      amount: number;
    }) => {
      await recordMutation.mutateAsync({ input: data });
    },
    cancelArrangement: async (id: string) => {
      await cancelMutation.mutateAsync({ id });
    },
    isCreating: createMutation.isPending,
    isActivating: activateMutation.isPending,
    isRecording: recordMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}

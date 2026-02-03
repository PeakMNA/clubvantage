/**
 * Billing hooks that wrap the API client and transform data
 * for use in the frontend components
 */

import { useMemo, useCallback } from 'react';
import {
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useGetMemberTransactionsQuery,
  useCreateInvoiceMutation,
  useSendInvoiceMutation,
  useVoidInvoiceMutation,
  useRecordPaymentMutation,
  queryKeys,
} from '@clubvantage/api-client';
import { useQueryClient } from '@tanstack/react-query';
// Direct imports to optimize bundle size (avoid barrel imports)
import type {
  InvoiceRegisterItem,
  InvoiceRegisterSummary,
} from '@/components/billing/invoice-register';

// Map API invoice status to frontend status
function mapInvoiceStatus(apiStatus: string): InvoiceRegisterItem['status'] {
  const statusMap: Record<string, InvoiceRegisterItem['status']> = {
    DRAFT: 'draft',
    SENT: 'sent',
    PAID: 'paid',
    PARTIALLY_PAID: 'partial',
    OVERDUE: 'overdue',
    VOID: 'cancelled',
    CANCELLED: 'cancelled',
  };
  return statusMap[apiStatus] || 'sent';
}

// Calculate aging status based on due date
function calculateAgingStatus(dueDate: Date, balance: number): InvoiceRegisterItem['agingStatus'] {
  if (balance === 0) return 'current';

  const now = new Date();
  const daysDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDue <= 0) return 'current';
  if (daysDue <= 30) return '30';
  if (daysDue <= 60) return '60';
  if (daysDue <= 90) return '90';
  return 'suspended';
}

// Transform API invoice to frontend InvoiceRegisterItem type
function transformInvoice(apiInvoice: any): InvoiceRegisterItem {
  const dueDate = new Date(apiInvoice.dueDate);
  const balance = parseFloat(apiInvoice.balanceDue || '0');

  return {
    id: apiInvoice.id,
    invoiceNumber: apiInvoice.invoiceNumber || '',
    memberId: apiInvoice.member?.id || '',
    memberName: apiInvoice.member
      ? `${apiInvoice.member.firstName} ${apiInvoice.member.lastName}`
      : '',
    date: new Date(apiInvoice.invoiceDate),
    dueDate,
    amount: parseFloat(apiInvoice.totalAmount || '0'),
    balance,
    status: mapInvoiceStatus(apiInvoice.status),
    agingStatus: calculateAgingStatus(dueDate, balance),
  };
}

export interface UseInvoicesOptions {
  page?: number;
  pageSize?: number;
  memberId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  enabled?: boolean;
}

export function useInvoices(options: UseInvoicesOptions = {}) {
  const {
    page = 1,
    pageSize = 20,
    memberId,
    status,
    startDate,
    endDate,
    enabled = true,
  } = options;

  const { data, isLoading, error, refetch } = useGetInvoicesQuery(
    {
      first: pageSize,
      skip: (page - 1) * pageSize,
      memberId: memberId || undefined,
      status: status as any,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    },
    {
      enabled,
    }
  );

  const invoices = useMemo(() => {
    if (!data?.invoices?.edges) return [];
    return data.invoices.edges.map((edge: any) => transformInvoice(edge.node));
  }, [data]);

  const totalCount = data?.invoices?.totalCount || 0;
  const hasNextPage = data?.invoices?.pageInfo?.hasNextPage || false;
  const hasPreviousPage = data?.invoices?.pageInfo?.hasPreviousPage || false;

  // Calculate summary from invoices
  const summary = useMemo((): InvoiceRegisterSummary => {
    const totals = {
      totalInvoiced: 0,
      outstanding: 0,
      current: 0,
      days30to60: 0,
      days61to90: 0,
      days91Plus: 0,
    };

    invoices.forEach((inv) => {
      totals.totalInvoiced += inv.amount;
      totals.outstanding += inv.balance;

      switch (inv.agingStatus) {
        case 'current':
          totals.current += inv.balance;
          break;
        case '30':
          totals.days30to60 += inv.balance;
          break;
        case '60':
        case '90':
          totals.days61to90 += inv.balance;
          break;
        case 'suspended':
          totals.days91Plus += inv.balance;
          break;
      }
    });

    return totals;
  }, [invoices]);

  return {
    invoices,
    summary,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    hasNextPage,
    hasPreviousPage,
    isLoading,
    error,
    refetch,
  };
}

export function useInvoice(id: string, enabled = true) {
  const { data, isLoading, error, refetch } = useGetInvoiceQuery(
    { id },
    { enabled: enabled && !!id }
  );

  const invoice = useMemo(() => {
    if (!data?.invoice) return null;
    return {
      ...transformInvoice(data.invoice),
      lineItems: data.invoice.lineItems || [],
      payments: data.invoice.payments || [],
      notes: data.invoice.notes,
    };
  }, [data]);

  return {
    invoice,
    isLoading,
    error,
    refetch,
  };
}

export function useBillingMutations() {
  const queryClient = useQueryClient();

  const createMutation = useCreateInvoiceMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });

  const sendMutation = useSendInvoiceMutation({
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(variables.id) });
    },
  });

  const voidMutation = useVoidInvoiceMutation({
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(variables.id) });
    },
  });

  const paymentMutation = useRecordPaymentMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });

  const createInvoice = useCallback(
    async (data: {
      memberId: string;
      invoiceDate: string;
      dueDate: string;
      lineItems: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        chargeTypeId?: string;
      }>;
    }) => {
      return createMutation.mutateAsync({ input: data as any });
    },
    [createMutation]
  );

  const sendInvoice = useCallback(
    async (id: string) => {
      return sendMutation.mutateAsync({ id });
    },
    [sendMutation]
  );

  const voidInvoice = useCallback(
    async (id: string, reason: string) => {
      return voidMutation.mutateAsync({ id, input: { reason } });
    },
    [voidMutation]
  );

  const recordPayment = useCallback(
    async (data: {
      memberId: string;
      amount: number;
      method: string;
      invoiceAllocations?: Array<{
        invoiceId: string;
        amount: number;
      }>;
    }) => {
      // Convert amount to string as expected by API
      const input = {
        ...data,
        amount: data.amount.toString(),
        invoiceAllocations: data.invoiceAllocations?.map(a => ({
          ...a,
          amount: a.amount.toString(),
        })),
      };
      return paymentMutation.mutateAsync({ input: input as any });
    },
    [paymentMutation]
  );

  return {
    createInvoice,
    sendInvoice,
    voidInvoice,
    recordPayment,
    isCreating: createMutation.isPending,
    isSending: sendMutation.isPending,
    isVoiding: voidMutation.isPending,
    isRecordingPayment: paymentMutation.isPending,
  };
}

// Transaction type for AR history
export type TransactionType = 'INVOICE' | 'PAYMENT' | 'CREDIT' | 'ADJUSTMENT';

export interface MemberTransaction {
  id: string;
  memberId: string;
  date: string;
  type: TransactionType;
  description: string;
  invoiceNumber?: string;
  amount: number;
  runningBalance: number;
}

/**
 * Hook to fetch member AR transactions with transformed data
 * Wraps useGetMemberTransactionsQuery with data transformation
 */
export function useMemberTransactions(memberId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useGetMemberTransactionsQuery(
    { memberId },
    { enabled: enabled && !!memberId, staleTime: 30000 }
  );

  const transactions = useMemo((): MemberTransaction[] => {
    if (!data?.memberTransactions?.transactions) return [];
    return data.memberTransactions.transactions.map((tx) => ({
      id: tx.id,
      memberId,
      date: tx.date,
      type: tx.type as TransactionType,
      description: tx.description,
      invoiceNumber: tx.invoiceNumber ?? undefined,
      amount: parseFloat(tx.amount),
      runningBalance: parseFloat(tx.runningBalance),
    }));
  }, [data, memberId]);

  const currentBalance = useMemo(() => {
    return parseFloat(data?.memberTransactions?.currentBalance ?? '0');
  }, [data]);

  return { transactions, currentBalance, isLoading, error, refetch };
}

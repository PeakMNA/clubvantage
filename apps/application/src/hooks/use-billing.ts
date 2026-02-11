/**
 * Billing hooks that wrap the API client and transform data
 * for use in the frontend components
 */

import { useMemo, useCallback, useState } from 'react';
import {
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useGetMemberTransactionsQuery,
  useCreateInvoiceMutation,
  useSendInvoiceMutation,
  useVoidInvoiceMutation,
  useRecordPaymentMutation,
  useGenerateStatementQuery,
  queryKeys,
} from '@clubvantage/api-client';
import { useGetPaymentsQuery } from '@clubvantage/api-client/hooks';
import { useQueryClient } from '@tanstack/react-query';
// Direct imports to optimize bundle size (avoid barrel imports)
import type {
  InvoiceRegisterItem,
  InvoiceRegisterSummary,
} from '@/components/billing/invoice-register';
import type {
  ReceiptRegisterItem,
  ReceiptRegisterSummary,
} from '@/components/billing/receipt-register';

// Map API invoice status to frontend status
function mapInvoiceStatus(apiStatus: string): InvoiceRegisterItem['status'] {
  const statusMap: Record<string, InvoiceRegisterItem['status']> = {
    DRAFT: 'DRAFT',
    SENT: 'SENT',
    PAID: 'PAID',
    PARTIALLY_PAID: 'PARTIALLY_PAID',
    OVERDUE: 'OVERDUE',
    VOID: 'VOID',
    CANCELLED: 'CANCELLED',
  };
  return statusMap[apiStatus] || 'SENT';
}

// Calculate aging status based on due date
function calculateAgingStatus(dueDate: Date, balance: number): InvoiceRegisterItem['agingStatus'] {
  if (balance === 0) return 'CURRENT';

  const now = new Date();
  const daysDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDue <= 0) return 'CURRENT';
  if (daysDue <= 30) return 'DAYS_30';
  if (daysDue <= 60) return 'DAYS_60';
  if (daysDue <= 90) return 'DAYS_90';
  return 'SUSPENDED';
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
        case 'CURRENT':
          totals.current += inv.balance;
          break;
        case 'DAYS_30':
          totals.days30to60 += inv.balance;
          break;
        case 'DAYS_60':
        case 'DAYS_90':
          totals.days61to90 += inv.balance;
          break;
        case 'SUSPENDED':
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

// ==================== Payments / Receipts ====================

function mapPaymentMethod(apiMethod: string): ReceiptRegisterItem['method'] {
  const methodMap: Record<string, ReceiptRegisterItem['method']> = {
    CASH: 'cash',
    CREDIT_CARD: 'card',
    BANK_TRANSFER: 'transfer',
    CHECK: 'check',
    QR_PROMPTPAY: 'transfer',
    DIRECT_DEBIT: 'transfer',
  };
  return methodMap[apiMethod] || 'cash';
}

function transformPaymentToReceipt(apiPayment: any): ReceiptRegisterItem {
  return {
    id: apiPayment.id,
    receiptNumber: apiPayment.receiptNumber || '',
    memberId: apiPayment.member?.memberId || '',
    memberName: apiPayment.member
      ? `${apiPayment.member.firstName} ${apiPayment.member.lastName}`
      : '',
    date: new Date(apiPayment.paymentDate),
    amount: parseFloat(apiPayment.amount || '0'),
    method: mapPaymentMethod(apiPayment.method),
    outlet: 'Main Office',
    status: (apiPayment.status || 'completed') as ReceiptRegisterItem['status'],
    allocations: (apiPayment.allocations || []).map((a: any) => ({
      invoiceId: a.invoiceId,
      invoiceNumber: a.invoiceNumber,
      amountAllocated: parseFloat(a.amount || '0'),
      balanceAfter: parseFloat(a.balanceAfter || '0'),
    })),
  };
}

export interface UsePaymentsOptions {
  page?: number;
  pageSize?: number;
  memberId?: string;
  method?: string;
  startDate?: Date;
  endDate?: Date;
  enabled?: boolean;
}

export function usePayments(options: UsePaymentsOptions = {}) {
  const { page = 1, pageSize = 20, memberId, method, startDate, endDate, enabled = true } = options;

  const { data, isLoading, error, refetch } = useGetPaymentsQuery(
    {
      first: pageSize,
      skip: (page - 1) * pageSize,
      memberId: memberId || undefined,
      method: method as any,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    },
    { enabled }
  );

  const receipts = useMemo(() => {
    if (!data?.payments?.edges) return [];
    return data.payments.edges.map((edge: any) => transformPaymentToReceipt(edge.node));
  }, [data]);

  const totalCount = data?.payments?.totalCount || 0;

  const summary = useMemo((): ReceiptRegisterSummary => {
    const totals = { totalReceipts: totalCount, cashReceived: 0, whtReceived: 0, invoicesSettled: 0, depositsToCredit: 0 };
    receipts.forEach((r) => { totals.cashReceived += r.amount; });
    return totals;
  }, [receipts, totalCount]);

  return {
    receipts,
    summary,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    isLoading,
    error,
    refetch,
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

// Statement generation types
export interface StatementMember {
  id: string;
  name: string;
  memberNumber: string;
  membershipType: string;
  email?: string | null;
  address?: string | null;
}

export interface StatementTransaction {
  id: string;
  date: Date;
  type: string;
  description: string;
  invoiceNumber?: string | null;
  debit?: number;
  credit?: number;
  runningBalance: number;
}

export interface Statement {
  member: StatementMember;
  periodStart: Date;
  periodEnd: Date;
  openingBalance: number;
  closingBalance: number;
  transactions: StatementTransaction[];
}

/**
 * Hook to generate a member statement on demand
 * Uses the fetcher directly for lazy/on-demand execution
 */
export function useGenerateStatement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateStatement = useCallback(
    async (memberId: string, startDate: Date, endDate: Date): Promise<Statement | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await useGenerateStatementQuery.fetcher({
          input: {
            memberId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        })();

        if (!data?.generateStatement) return null;

        const stmt = data.generateStatement;
        return {
          member: stmt.member,
          periodStart: new Date(stmt.periodStart),
          periodEnd: new Date(stmt.periodEnd),
          openingBalance: parseFloat(stmt.openingBalance),
          closingBalance: parseFloat(stmt.closingBalance),
          transactions: stmt.transactions.map((tx) => ({
            id: tx.id,
            date: new Date(tx.date),
            type: tx.type,
            description: tx.description,
            invoiceNumber: tx.invoiceNumber,
            // Debit/Credit classification: INVOICE transactions are debits (increase balance),
            // all other transaction types (PAYMENT, CREDIT, ADJUSTMENT) are treated as credits
            // (decrease balance). This assumes the API returns positive amounts for all types.
            debit: tx.type === 'INVOICE' ? parseFloat(tx.amount) : undefined,
            credit: tx.type !== 'INVOICE' ? parseFloat(tx.amount) : undefined,
            runningBalance: parseFloat(tx.runningBalance),
          })),
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to generate statement');
        setError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { generateStatement, isLoading, error };
}

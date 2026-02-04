import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { EventStoreService } from '@/shared/events/event-store.service';
import { Prisma } from '@prisma/client';

export interface AllocationItem {
  invoiceId: string;
  allocatedAmount: number;
}

export interface FifoAllocationResult {
  allocations: AllocationItem[];
  totalAllocated: number;
  remainingPayment: number;
  creditToAdd: number;
}

export interface ApplyAllocationResult {
  paymentId: string;
  receiptNumber: string;
  allocations: {
    invoiceId: string;
    invoiceNumber: string;
    amount: number;
    previousBalance: number;
    newBalance: number;
  }[];
  totalAllocated: number;
  creditAdded: number;
  accountOutstandingBalance: number;
  accountCreditBalance: number;
}

@Injectable()
export class AllocationService {
  private readonly logger = new Logger(AllocationService.name);

  constructor(
    private prisma: PrismaService,
    private eventStore: EventStoreService,
  ) {}

  /**
   * Calculate FIFO allocation for a given payment amount
   * Invoices should be sorted by dueDate ASC (oldest first)
   */
  calculateFifoAllocation(
    invoices: Array<{ id: string; balanceDue: number | Prisma.Decimal }>,
    paymentAmount: number,
  ): FifoAllocationResult {
    const allocations: AllocationItem[] = [];
    let remainingPayment = paymentAmount;

    for (const invoice of invoices) {
      if (remainingPayment <= 0) break;

      const balance = typeof invoice.balanceDue === 'number'
        ? invoice.balanceDue
        : invoice.balanceDue.toNumber();

      if (balance <= 0) continue;

      const allocatedAmount = Math.min(remainingPayment, balance);

      allocations.push({
        invoiceId: invoice.id,
        allocatedAmount,
      });

      remainingPayment -= allocatedAmount;
    }

    const totalAllocated = paymentAmount - Math.max(0, remainingPayment);
    const creditToAdd = Math.max(0, remainingPayment);

    return {
      allocations,
      totalAllocated,
      remainingPayment,
      creditToAdd,
    };
  }

  /**
   * Apply allocations to invoices and update account balances
   * Handles both Member and CityLedger accounts
   */
  async applyAllocations(
    tenantId: string,
    accountId: string,
    accountType: 'MEMBER' | 'CITY_LEDGER',
    paymentAmount: number,
    paymentMethod: string,
    allocations: AllocationItem[],
    options: {
      referenceNumber?: string;
      paymentDate?: Date;
      notes?: string;
      userId: string;
      userEmail: string;
    },
  ): Promise<ApplyAllocationResult> {
    const { referenceNumber, paymentDate, notes, userId, userEmail } = options;

    // Generate receipt number
    const year = new Date().getFullYear();
    const lastPayment = await this.prisma.payment.findFirst({
      where: {
        clubId: tenantId,
        receiptNumber: { startsWith: `RCP-${year}` },
      },
      orderBy: { receiptNumber: 'desc' },
    });

    const nextNumber = lastPayment
      ? parseInt(lastPayment.receiptNumber.split('-')[2], 10) + 1
      : 1;
    const receiptNumber = `RCP-${year}-${nextNumber.toString().padStart(5, '0')}`;

    // Execute in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create payment
      const paymentData: any = {
        clubId: tenantId,
        receiptNumber,
        amount: paymentAmount,
        method: paymentMethod as any,
        paymentDate: paymentDate || new Date(),
        referenceNumber,
        notes,
      };

      if (accountType === 'MEMBER') {
        paymentData.memberId = accountId;
      } else {
        paymentData.cityLedgerId = accountId;
      }

      const payment = await tx.payment.create({
        data: paymentData,
      });

      // Apply allocations
      const allocationResults: ApplyAllocationResult['allocations'] = [];
      let totalAllocated = 0;

      for (const allocation of allocations) {
        const invoice = await tx.invoice.findUnique({
          where: { id: allocation.invoiceId },
          select: {
            id: true,
            invoiceNumber: true,
            balanceDue: true,
            paidAmount: true,
            totalAmount: true,
          },
        });

        if (!invoice) {
          throw new BadRequestException(`Invoice ${allocation.invoiceId} not found`);
        }

        const previousBalance = invoice.balanceDue.toNumber();

        if (allocation.allocatedAmount > previousBalance) {
          throw new BadRequestException(
            `Allocation amount ${allocation.allocatedAmount} exceeds balance ${previousBalance} for invoice ${invoice.invoiceNumber}`,
          );
        }

        // Create allocation record
        await tx.paymentAllocation.create({
          data: {
            paymentId: payment.id,
            invoiceId: allocation.invoiceId,
            amount: allocation.allocatedAmount,
          },
        });

        // Update invoice using atomic operations
        const updatedInvoice = await tx.invoice.update({
          where: { id: allocation.invoiceId },
          data: {
            paidAmount: { increment: allocation.allocatedAmount },
            balanceDue: { decrement: allocation.allocatedAmount },
          },
        });

        // Determine new status
        const newBalance = updatedInvoice.balanceDue.toNumber();
        const newPaidAmount = updatedInvoice.paidAmount.toNumber();
        const newStatus = newBalance <= 0
          ? 'PAID'
          : newPaidAmount > 0
          ? 'PARTIALLY_PAID'
          : updatedInvoice.status;

        await tx.invoice.update({
          where: { id: allocation.invoiceId },
          data: {
            status: newStatus,
            paidDate: newBalance <= 0 ? new Date() : null,
          },
        });

        allocationResults.push({
          invoiceId: allocation.invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          amount: allocation.allocatedAmount,
          previousBalance,
          newBalance,
        });

        totalAllocated += allocation.allocatedAmount;
      }

      // Calculate credit to add (payment amount exceeds allocated)
      const creditToAdd = paymentAmount - totalAllocated;

      // Update account balances
      let accountOutstandingBalance = 0;
      let accountCreditBalance = 0;

      if (accountType === 'MEMBER') {
        // Update member balances
        const member = await tx.member.update({
          where: { id: accountId },
          data: {
            outstandingBalance: { decrement: totalAllocated },
            creditBalance: creditToAdd > 0 ? { increment: creditToAdd } : undefined,
          },
        });
        accountOutstandingBalance = member.outstandingBalance.toNumber();
        accountCreditBalance = member.creditBalance.toNumber();
      } else {
        // Update city ledger balances
        const cityLedger = await tx.cityLedger.update({
          where: { id: accountId },
          data: {
            outstandingBalance: { decrement: totalAllocated },
            creditBalance: creditToAdd > 0 ? { increment: creditToAdd } : undefined,
          },
        });
        accountOutstandingBalance = cityLedger.outstandingBalance.toNumber();
        accountCreditBalance = cityLedger.creditBalance.toNumber();
      }

      return {
        paymentId: payment.id,
        receiptNumber,
        allocations: allocationResults,
        totalAllocated,
        creditAdded: creditToAdd,
        accountOutstandingBalance,
        accountCreditBalance,
      };
    });

    // Log event
    await this.eventStore.append({
      tenantId,
      aggregateType: 'Payment',
      aggregateId: result.paymentId,
      type: 'BATCH_SETTLEMENT',
      data: {
        receiptNumber: result.receiptNumber,
        accountType,
        accountId,
        amount: paymentAmount,
        allocations: result.allocations.length,
        creditAdded: result.creditAdded,
      },
      userId,
      userEmail,
    });

    return result;
  }

  /**
   * Get outstanding invoices for an account, sorted by due date (FIFO)
   */
  async getOutstandingInvoices(
    tenantId: string,
    accountId: string,
    accountType: 'MEMBER' | 'CITY_LEDGER',
  ) {
    const whereClause: any = {
      clubId: tenantId,
      deletedAt: null,
      status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
      balanceDue: { gt: 0 },
    };

    if (accountType === 'MEMBER') {
      whereClause.memberId = accountId;
    } else {
      whereClause.cityLedgerId = accountId;
    }

    return this.prisma.invoice.findMany({
      where: whereClause,
      orderBy: { dueDate: 'asc' },
      include: {
        lineItems: true,
      },
    });
  }
}

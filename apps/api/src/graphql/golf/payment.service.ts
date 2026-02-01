import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface ProcessPaymentInput {
  clubId: string;
  teeTimeId?: string;
  playerId?: string;
  lineItemIds: string[];
  amount: number;
  paymentMethodId: string;
  reference?: string;
  paidBy: string; // userId or "ONLINE"
}

export interface VoidTransactionInput {
  transactionId: string;
  reason: string;
  voidedBy: string;
}

export interface RefundTransactionInput {
  transactionId: string;
  amount: number;
  reason: string;
  refundedBy: string;
}

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  // Generate transaction number like "TXN-2026-00001"
  private async generateTransactionNumber(clubId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `TXN-${year}-`;

    const lastTransaction = await this.prisma.paymentTransaction.findFirst({
      where: {
        clubId,
        transactionNumber: { startsWith: prefix },
      },
      orderBy: { transactionNumber: 'desc' },
    });

    const nextNumber = lastTransaction
      ? parseInt(lastTransaction.transactionNumber.split('-')[2], 10) + 1
      : 1;

    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  }

  // Process a payment and mark line items as paid
  async processPayment(input: ProcessPaymentInput) {
    const { clubId, teeTimeId, lineItemIds, amount, paymentMethodId, reference, paidBy } = input;

    // Validate payment method
    const paymentMethod = await this.prisma.checkInPaymentMethod.findUnique({
      where: { id: paymentMethodId },
    });
    if (!paymentMethod || !paymentMethod.isEnabled) {
      throw new BadRequestException('Invalid or disabled payment method');
    }

    // Validate line items exist and are unpaid
    const lineItems = await this.prisma.bookingLineItem.findMany({
      where: { id: { in: lineItemIds } },
    });

    if (lineItems.length !== lineItemIds.length) {
      throw new NotFoundException('One or more line items not found');
    }

    const alreadyPaid = lineItems.filter(item => item.isPaid);
    if (alreadyPaid.length > 0) {
      throw new BadRequestException('Some line items are already paid');
    }

    // Calculate expected total
    const expectedTotal = lineItems.reduce((sum, item) => sum + Number(item.totalAmount), 0);
    if (Math.abs(amount - expectedTotal) > 0.01) {
      throw new BadRequestException(`Payment amount ${amount} does not match line items total ${expectedTotal}`);
    }

    const transactionNumber = await this.generateTransactionNumber(clubId);
    const paidAt = new Date();

    // Create transaction with line item payments in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create payment transaction
      const transaction = await tx.paymentTransaction.create({
        data: {
          clubId,
          transactionNumber,
          teeTimeId,
          amount,
          paymentMethodId,
          status: 'COMPLETED',
          reference,
          paidAt,
          paidBy,
          lineItemPayments: {
            create: lineItems.map(item => ({
              lineItemId: item.id,
              amount: Number(item.totalAmount),
            })),
          },
        },
        include: {
          lineItemPayments: true,
          paymentMethod: true,
        },
      });

      // Mark line items as paid
      await tx.bookingLineItem.updateMany({
        where: { id: { in: lineItemIds } },
        data: {
          isPaid: true,
          paidAt,
          paymentMethodId,
          reference,
        },
      });

      return transaction;
    });

    return {
      success: true,
      transactionId: result.id,
      transactionNumber: result.transactionNumber,
      settledAt: result.paidAt,
      settledBy: result.paidBy,
      amount: Number(result.amount),
    };
  }

  // Process online payment (pre-paid)
  async processOnlinePayment(input: Omit<ProcessPaymentInput, 'paidBy'>) {
    return this.processPayment({ ...input, paidBy: 'ONLINE' });
  }

  // Void a transaction (within time window)
  async voidTransaction(input: VoidTransactionInput) {
    const { transactionId, reason, voidedBy } = input;

    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { lineItemPayments: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === 'VOIDED') {
      throw new BadRequestException('Transaction already voided');
    }

    if (transaction.status === 'REFUNDED') {
      throw new BadRequestException('Cannot void a refunded transaction');
    }

    // Check time window (2 hours)
    const hoursSincePaid = (Date.now() - transaction.paidAt.getTime()) / (1000 * 60 * 60);
    if (hoursSincePaid > 2) {
      throw new BadRequestException('Cannot void transaction after 2 hours. Use refund instead.');
    }

    const lineItemIds = transaction.lineItemPayments.map(p => p.lineItemId);

    await this.prisma.$transaction(async (tx) => {
      // Void transaction
      await tx.paymentTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'VOIDED',
          voidedAt: new Date(),
          voidedBy,
          voidReason: reason,
        },
      });

      // Reverse line item paid status
      await tx.bookingLineItem.updateMany({
        where: { id: { in: lineItemIds } },
        data: {
          isPaid: false,
          paidAt: null,
          paymentMethodId: null,
          reference: null,
        },
      });
    });

    return { success: true, transactionId };
  }

  // Refund a transaction
  async refundTransaction(input: RefundTransactionInput) {
    const { transactionId, amount, reason, refundedBy } = input;

    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== 'COMPLETED') {
      throw new BadRequestException('Can only refund completed transactions');
    }

    if (amount > Number(transaction.amount)) {
      throw new BadRequestException('Refund amount exceeds transaction amount');
    }

    const isFullRefund = Math.abs(amount - Number(transaction.amount)) < 0.01;

    await this.prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status: isFullRefund ? 'REFUNDED' : 'COMPLETED', // Keep COMPLETED for partial
        refundedAt: new Date(),
        refundedBy,
        refundAmount: amount,
        refundReason: reason,
      },
    });

    return { success: true, transactionId, refundAmount: amount };
  }

  // Get transaction history
  async getTransactionHistory(filter: {
    clubId: string;
    teeTimeId?: string;
    playerId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }) {
    const { clubId, teeTimeId, startDate, endDate, status } = filter;

    const transactions = await this.prisma.paymentTransaction.findMany({
      where: {
        clubId,
        ...(teeTimeId && { teeTimeId }),
        ...(status && { status }),
        ...(startDate && endDate && {
          paidAt: { gte: startDate, lte: endDate },
        }),
      },
      include: {
        paymentMethod: true,
        lineItemPayments: {
          include: { lineItem: true },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    // Map to include payment method name
    return transactions.map(tx => ({
      ...tx,
      amount: Number(tx.amount),
      refundAmount: tx.refundAmount ? Number(tx.refundAmount) : undefined,
      paymentMethodName: tx.paymentMethod?.name,
      lineItemPayments: tx.lineItemPayments.map(lp => ({
        ...lp,
        amount: Number(lp.amount),
        description: lp.lineItem?.description,
      })),
    }));
  }

  // Allocate transaction to revenue
  async allocateToRevenue(transactionId: string) {
    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.allocatedToRevenue) {
      throw new BadRequestException('Transaction already allocated to revenue');
    }

    await this.prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        allocatedToRevenue: true,
        allocatedAt: new Date(),
      },
    });

    return { success: true, transactionId };
  }
}

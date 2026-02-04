import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  StoredPaymentMethodStatus,
  AutoPaySchedule,
  AutoPayAttemptStatus,
  Prisma,
} from '@prisma/client';

export interface CreateStoredPaymentInput {
  memberId: string;
  stripeCustomerId?: string;
  stripePaymentMethodId: string;
  brand: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;
  isDefault?: boolean;
}

export interface UpdateStoredPaymentInput {
  id: string;
  isDefault?: boolean;
  isAutoPayEnabled?: boolean;
}

export interface AutoPaySettingInput {
  memberId: string;
  paymentMethodId: string;
  isEnabled?: boolean;
  schedule?: AutoPaySchedule;
  paymentDayOfMonth?: number;
  maxPaymentAmount?: number;
  monthlyMaxAmount?: number;
  requireApprovalAbove?: number;
  payDuesOnly?: boolean;
  excludeCategories?: string[];
  notifyBeforePayment?: boolean;
  notifyDaysBefore?: number;
  notifyOnSuccess?: boolean;
  notifyOnFailure?: boolean;
  maxRetryAttempts?: number;
  retryIntervalDays?: number;
}

export interface ProcessAutoPayInput {
  invoiceId: string;
  paymentMethodId: string;
  amount: number;
}

export interface AutoPayResult {
  success: boolean;
  attemptId?: string;
  message?: string;
  stripePaymentIntentId?: string;
  error?: string;
}

@Injectable()
export class StoredPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // STORED PAYMENT METHODS
  // ============================================================================

  /**
   * Get all stored payment methods for a member
   */
  async getMemberPaymentMethods(memberId: string, activeOnly = true) {
    const where: Prisma.StoredPaymentMethodWhereInput = { memberId };
    if (activeOnly) {
      where.status = StoredPaymentMethodStatus.ACTIVE;
    }

    return this.prisma.storedPaymentMethod.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Get a single stored payment method
   */
  async getPaymentMethod(id: string) {
    const method = await this.prisma.storedPaymentMethod.findUnique({
      where: { id },
    });

    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    return method;
  }

  /**
   * Add a new stored payment method
   */
  async addPaymentMethod(clubId: string, input: CreateStoredPaymentInput) {
    // Check if this payment method already exists
    const existing = await this.prisma.storedPaymentMethod.findUnique({
      where: {
        memberId_stripePaymentMethodId: {
          memberId: input.memberId,
          stripePaymentMethodId: input.stripePaymentMethodId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('This payment method is already saved');
    }

    // If this is the first payment method or set as default, make it default
    const existingMethods = await this.prisma.storedPaymentMethod.count({
      where: { memberId: input.memberId, status: StoredPaymentMethodStatus.ACTIVE },
    });

    const isDefault = input.isDefault || existingMethods === 0;

    // If setting as default, remove default from other methods
    if (isDefault) {
      await this.prisma.storedPaymentMethod.updateMany({
        where: { memberId: input.memberId },
        data: { isDefault: false },
      });
    }

    return this.prisma.storedPaymentMethod.create({
      data: {
        clubId,
        memberId: input.memberId,
        stripeCustomerId: input.stripeCustomerId,
        stripePaymentMethodId: input.stripePaymentMethodId,
        brand: input.brand,
        last4: input.last4,
        expiryMonth: input.expiryMonth,
        expiryYear: input.expiryYear,
        cardholderName: input.cardholderName,
        isDefault,
        verifiedAt: new Date(),
      },
    });
  }

  /**
   * Update a stored payment method
   */
  async updatePaymentMethod(input: UpdateStoredPaymentInput) {
    const method = await this.getPaymentMethod(input.id);

    // If setting as default, remove default from other methods
    if (input.isDefault) {
      await this.prisma.storedPaymentMethod.updateMany({
        where: { memberId: method.memberId, id: { not: input.id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.storedPaymentMethod.update({
      where: { id: input.id },
      data: {
        isDefault: input.isDefault,
        isAutoPayEnabled: input.isAutoPayEnabled,
      },
    });
  }

  /**
   * Remove a stored payment method
   */
  async removePaymentMethod(id: string) {
    const method = await this.getPaymentMethod(id);

    // Soft delete by setting status to REMOVED
    await this.prisma.storedPaymentMethod.update({
      where: { id },
      data: { status: StoredPaymentMethodStatus.REMOVED },
    });

    // If this was the default, make another one default
    if (method.isDefault) {
      const nextDefault = await this.prisma.storedPaymentMethod.findFirst({
        where: {
          memberId: method.memberId,
          status: StoredPaymentMethodStatus.ACTIVE,
          id: { not: id },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (nextDefault) {
        await this.prisma.storedPaymentMethod.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true };
  }

  /**
   * Set a payment method as default
   */
  async setDefaultPaymentMethod(id: string) {
    const method = await this.getPaymentMethod(id);

    // Remove default from all other methods
    await this.prisma.storedPaymentMethod.updateMany({
      where: { memberId: method.memberId },
      data: { isDefault: false },
    });

    // Set this one as default
    return this.prisma.storedPaymentMethod.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  /**
   * Check if a card is expired
   */
  isCardExpired(expiryMonth?: number | null, expiryYear?: number | null): boolean {
    if (!expiryMonth || !expiryYear) return false;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (expiryYear < currentYear) return true;
    if (expiryYear === currentYear && expiryMonth < currentMonth) return true;

    return false;
  }

  /**
   * Update expired cards
   */
  async updateExpiredCards() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Find and update expired cards
    await this.prisma.storedPaymentMethod.updateMany({
      where: {
        status: StoredPaymentMethodStatus.ACTIVE,
        OR: [
          { expiryYear: { lt: currentYear } },
          {
            expiryYear: currentYear,
            expiryMonth: { lt: currentMonth },
          },
        ],
      },
      data: { status: StoredPaymentMethodStatus.EXPIRED },
    });
  }

  // ============================================================================
  // AUTO-PAY SETTINGS
  // ============================================================================

  /**
   * Get auto-pay settings for a member
   */
  async getAutoPaySetting(memberId: string) {
    return this.prisma.autoPaySetting.findUnique({
      where: { memberId },
      include: { paymentMethod: true },
    });
  }

  /**
   * Create or update auto-pay settings
   */
  async upsertAutoPaySetting(clubId: string, input: AutoPaySettingInput) {
    // Verify the payment method exists and belongs to the member
    const paymentMethod = await this.prisma.storedPaymentMethod.findFirst({
      where: {
        id: input.paymentMethodId,
        memberId: input.memberId,
        status: StoredPaymentMethodStatus.ACTIVE,
      },
    });

    if (!paymentMethod) {
      throw new BadRequestException('Invalid payment method');
    }

    const data = {
      clubId,
      paymentMethodId: input.paymentMethodId,
      isEnabled: input.isEnabled ?? true,
      schedule: input.schedule ?? AutoPaySchedule.INVOICE_DUE,
      paymentDayOfMonth: input.paymentDayOfMonth,
      maxPaymentAmount: input.maxPaymentAmount,
      monthlyMaxAmount: input.monthlyMaxAmount,
      requireApprovalAbove: input.requireApprovalAbove,
      payDuesOnly: input.payDuesOnly ?? false,
      excludeCategories: input.excludeCategories ?? [],
      notifyBeforePayment: input.notifyBeforePayment ?? true,
      notifyDaysBefore: input.notifyDaysBefore ?? 3,
      notifyOnSuccess: input.notifyOnSuccess ?? true,
      notifyOnFailure: input.notifyOnFailure ?? true,
      maxRetryAttempts: input.maxRetryAttempts ?? 3,
      retryIntervalDays: input.retryIntervalDays ?? 3,
    };

    return this.prisma.autoPaySetting.upsert({
      where: { memberId: input.memberId },
      create: {
        ...data,
        memberId: input.memberId,
      },
      update: data,
      include: { paymentMethod: true },
    });
  }

  /**
   * Disable auto-pay for a member
   */
  async disableAutoPay(memberId: string) {
    await this.prisma.autoPaySetting.updateMany({
      where: { memberId },
      data: { isEnabled: false },
    });

    return { success: true };
  }

  // ============================================================================
  // AUTO-PAY PROCESSING
  // ============================================================================

  /**
   * Create an auto-pay attempt
   */
  async createAutoPayAttempt(
    clubId: string,
    memberId: string,
    paymentMethodId: string,
    invoiceId: string,
    amount: number,
  ) {
    return this.prisma.autoPayAttempt.create({
      data: {
        clubId,
        memberId,
        paymentMethodId,
        invoiceId,
        amount,
        status: AutoPayAttemptStatus.PENDING,
      },
    });
  }

  /**
   * Process an auto-pay attempt (mock Stripe integration)
   * In production, this would integrate with Stripe Payment Intents API
   */
  async processAutoPayAttempt(attemptId: string): Promise<AutoPayResult> {
    const attempt = await this.prisma.autoPayAttempt.findUnique({
      where: { id: attemptId },
      include: { paymentMethod: true },
    });

    if (!attempt) {
      return { success: false, error: 'Attempt not found' };
    }

    // Update to processing
    await this.prisma.autoPayAttempt.update({
      where: { id: attemptId },
      data: {
        status: AutoPayAttemptStatus.PROCESSING,
        processedAt: new Date(),
      },
    });

    // Mock Stripe processing - in production this would call Stripe API
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(Number(attempt.amount) * 100),
    //   currency: 'thb',
    //   customer: attempt.paymentMethod.stripeCustomerId,
    //   payment_method: attempt.paymentMethod.stripePaymentMethodId,
    //   confirm: true,
    //   off_session: true,
    // });

    // Mock success for development
    const mockSuccess = true;
    const mockPaymentIntentId = `pi_mock_${Date.now()}`;
    const mockChargeId = `ch_mock_${Date.now()}`;

    if (mockSuccess) {
      await this.prisma.autoPayAttempt.update({
        where: { id: attemptId },
        data: {
          status: AutoPayAttemptStatus.SUCCEEDED,
          succeededAt: new Date(),
          stripePaymentIntentId: mockPaymentIntentId,
          stripeChargeId: mockChargeId,
        },
      });

      // Update last used on payment method
      await this.prisma.storedPaymentMethod.update({
        where: { id: attempt.paymentMethodId },
        data: { lastUsedAt: new Date(), failureCount: 0 },
      });

      return {
        success: true,
        attemptId,
        stripePaymentIntentId: mockPaymentIntentId,
        message: 'Payment processed successfully',
      };
    } else {
      // Handle failure
      const failureReason = 'card_declined';
      await this.prisma.autoPayAttempt.update({
        where: { id: attemptId },
        data: {
          status: AutoPayAttemptStatus.FAILED,
          failedAt: new Date(),
          failureCode: failureReason,
          failureMessage: 'Your card was declined',
          nextRetryAt: this.calculateNextRetry(attempt.attemptNumber),
        },
      });

      // Update failure count on payment method
      await this.prisma.storedPaymentMethod.update({
        where: { id: attempt.paymentMethodId },
        data: {
          failureCount: { increment: 1 },
          lastFailureReason: failureReason,
        },
      });

      return {
        success: false,
        attemptId,
        error: 'Your card was declined',
      };
    }
  }

  /**
   * Calculate next retry date based on attempt number
   */
  private calculateNextRetry(attemptNumber: number): Date {
    const retryIntervalDays = 3;
    const nextRetry = new Date();
    nextRetry.setDate(nextRetry.getDate() + retryIntervalDays * attemptNumber);
    return nextRetry;
  }

  /**
   * Get pending auto-pay attempts for retry
   */
  async getPendingRetries(clubId: string) {
    return this.prisma.autoPayAttempt.findMany({
      where: {
        clubId,
        status: AutoPayAttemptStatus.FAILED,
        nextRetryAt: { lte: new Date() },
      },
      include: {
        paymentMethod: true,
        invoice: true,
      },
      orderBy: { nextRetryAt: 'asc' },
    });
  }

  /**
   * Create retry attempt
   */
  async retryAutoPayAttempt(originalAttemptId: string, isManual = false) {
    const original = await this.prisma.autoPayAttempt.findUnique({
      where: { id: originalAttemptId },
    });

    if (!original) {
      throw new NotFoundException('Original attempt not found');
    }

    // Create new attempt with incremented attempt number
    const newAttempt = await this.prisma.autoPayAttempt.create({
      data: {
        clubId: original.clubId,
        memberId: original.memberId,
        paymentMethodId: original.paymentMethodId,
        invoiceId: original.invoiceId,
        amount: original.amount,
        attemptNumber: original.attemptNumber + 1,
        status: AutoPayAttemptStatus.PENDING,
        isManualRetry: isManual,
      },
    });

    // Clear next retry on original
    await this.prisma.autoPayAttempt.update({
      where: { id: originalAttemptId },
      data: { nextRetryAt: null },
    });

    // Process the retry
    return this.processAutoPayAttempt(newAttempt.id);
  }

  /**
   * Get auto-pay attempt history for a member
   */
  async getMemberAutoPayHistory(memberId: string, limit = 20) {
    return this.prisma.autoPayAttempt.findMany({
      where: { memberId },
      include: {
        paymentMethod: true,
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get auto-pay attempts for an invoice
   */
  async getInvoiceAutoPayAttempts(invoiceId: string) {
    return this.prisma.autoPayAttempt.findMany({
      where: { invoiceId },
      include: { paymentMethod: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================================================
  // INVOICE AUTO-PAY PROCESSING
  // ============================================================================

  /**
   * Process auto-pay for invoices due today
   */
  async processInvoicesDueToday(clubId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find invoices due today with auto-pay enabled
    const invoices = await this.prisma.invoice.findMany({
      where: {
        clubId,
        status: 'SENT',
        dueDate: {
          gte: today,
          lt: tomorrow,
        },
        member: {
          storedPaymentMethods: {
            some: {
              isAutoPayEnabled: true,
              status: StoredPaymentMethodStatus.ACTIVE,
            },
          },
        },
      },
      include: {
        member: {
          include: {
            storedPaymentMethods: {
              where: {
                isAutoPayEnabled: true,
                status: StoredPaymentMethodStatus.ACTIVE,
              },
              orderBy: { isDefault: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    const results: AutoPayResult[] = [];

    for (const invoice of invoices) {
      if (!invoice.member || !invoice.memberId) continue;
      const paymentMethod = invoice.member.storedPaymentMethods[0];
      if (!paymentMethod) continue;

      // Create and process attempt
      const attempt = await this.createAutoPayAttempt(
        clubId,
        invoice.memberId,
        paymentMethod.id,
        invoice.id,
        Number(invoice.balanceDue),
      );

      const result = await this.processAutoPayAttempt(attempt.id);
      results.push(result);
    }

    return results;
  }
}

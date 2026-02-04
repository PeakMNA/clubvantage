import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import {
  SettlementStatus,
  ExceptionType,
  ExceptionSeverity,
  ExceptionResolution,
  Prisma,
} from '@prisma/client';

export interface CreateSettlementInput {
  businessDate: Date;
}

export interface UpdateSettlementTotalsInput {
  settlementId: string;
  totalGrossSales?: number;
  totalDiscounts?: number;
  totalNetSales?: number;
  totalTax?: number;
  totalServiceCharge?: number;
  totalCash?: number;
  totalCard?: number;
  totalMemberAccount?: number;
  totalOther?: number;
  totalRefunds?: number;
  totalVoids?: number;
  transactionCount?: number;
  refundCount?: number;
  voidCount?: number;
}

export interface RecordCashCountInput {
  settlementId: string;
  actualCash: number;
}

export interface CreateExceptionInput {
  settlementId: string;
  type: ExceptionType;
  severity?: ExceptionSeverity;
  description: string;
  amount?: number;
  transactionId?: string;
  shiftId?: string;
  lineItemId?: string;
}

export interface ResolveExceptionInput {
  exceptionId: string;
  resolution: ExceptionResolution;
  resolutionNote?: string;
}

export interface SettlementSummary {
  settlementId: string;
  businessDate: Date;
  status: SettlementStatus;
  totalGrossSales: number;
  totalNetSales: number;
  totalCash: number;
  totalCard: number;
  totalMemberAccount: number;
  expectedCash: number;
  actualCash: number | null;
  cashVariance: number | null;
  exceptionCount: number;
  unresolvedExceptionCount: number;
}

@Injectable()
export class EODSettlementService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // SETTLEMENT CRUD
  // ============================================================================

  /**
   * Get or create a settlement for a business date
   */
  async getOrCreateSettlement(tenantId: string, businessDate: Date) {
    // Normalize date to start of day
    const normalizedDate = new Date(businessDate);
    normalizedDate.setHours(0, 0, 0, 0);

    let settlement = await this.prisma.dailySettlement.findUnique({
      where: {
        clubId_businessDate: {
          clubId: tenantId,
          businessDate: normalizedDate,
        },
      },
      include: {
        exceptions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!settlement) {
      settlement = await this.prisma.dailySettlement.create({
        data: {
          clubId: tenantId,
          businessDate: normalizedDate,
          status: SettlementStatus.OPEN,
        },
        include: {
          exceptions: true,
        },
      });
    }

    return settlement;
  }

  /**
   * Get settlement by ID
   */
  async getSettlement(settlementId: string) {
    const settlement = await this.prisma.dailySettlement.findUnique({
      where: { id: settlementId },
      include: {
        exceptions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!settlement) {
      throw new NotFoundException('Settlement not found');
    }

    return settlement;
  }

  /**
   * Get settlements for a date range
   */
  async getSettlements(tenantId: string, startDate: Date, endDate: Date) {
    return this.prisma.dailySettlement.findMany({
      where: {
        clubId: tenantId,
        businessDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        exceptions: {
          where: {
            resolution: ExceptionResolution.PENDING,
          },
        },
      },
      orderBy: { businessDate: 'desc' },
    });
  }

  /**
   * Get today's settlement
   */
  async getTodaySettlement(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.getOrCreateSettlement(tenantId, today);
  }

  // ============================================================================
  // SETTLEMENT WORKFLOW
  // ============================================================================

  /**
   * Start the day - opens a new settlement
   */
  async openDay(tenantId: string, businessDate: Date, openedBy: string) {
    const settlement = await this.getOrCreateSettlement(tenantId, businessDate);

    if (settlement.status !== SettlementStatus.OPEN) {
      throw new BadRequestException('Settlement is not in OPEN status');
    }

    return this.prisma.dailySettlement.update({
      where: { id: settlement.id },
      data: {
        openedBy,
        openedAt: new Date(),
      },
      include: {
        exceptions: true,
      },
    });
  }

  /**
   * Submit settlement for review
   */
  async submitForReview(settlementId: string, reviewedBy: string) {
    const settlement = await this.getSettlement(settlementId);

    if (settlement.status !== SettlementStatus.OPEN) {
      throw new BadRequestException('Settlement must be OPEN to submit for review');
    }

    return this.prisma.dailySettlement.update({
      where: { id: settlementId },
      data: {
        status: SettlementStatus.IN_REVIEW,
        reviewedBy,
        reviewedAt: new Date(),
      },
      include: {
        exceptions: true,
      },
    });
  }

  /**
   * Close the day
   */
  async closeDay(settlementId: string, closedBy: string, notes?: string) {
    const settlement = await this.getSettlement(settlementId);

    if (settlement.status !== SettlementStatus.IN_REVIEW) {
      throw new BadRequestException('Settlement must be IN_REVIEW to close');
    }

    // Check for unresolved critical exceptions
    const unresolvedCritical = await this.prisma.settlementException.count({
      where: {
        settlementId,
        severity: ExceptionSeverity.CRITICAL,
        resolution: ExceptionResolution.PENDING,
      },
    });

    if (unresolvedCritical > 0) {
      throw new BadRequestException('Cannot close with unresolved critical exceptions');
    }

    return this.prisma.dailySettlement.update({
      where: { id: settlementId },
      data: {
        status: SettlementStatus.CLOSED,
        closedBy,
        closedAt: new Date(),
        notes: notes || settlement.notes,
      },
      include: {
        exceptions: true,
      },
    });
  }

  /**
   * Reopen a closed settlement (for corrections)
   */
  async reopenSettlement(settlementId: string, reopenedBy: string, reason: string) {
    const settlement = await this.getSettlement(settlementId);

    if (settlement.status !== SettlementStatus.CLOSED) {
      throw new BadRequestException('Settlement must be CLOSED to reopen');
    }

    // Create an exception to track the reopening
    await this.createException({
      settlementId,
      type: ExceptionType.OTHER,
      severity: ExceptionSeverity.HIGH,
      description: `Settlement reopened: ${reason}`,
    });

    return this.prisma.dailySettlement.update({
      where: { id: settlementId },
      data: {
        status: SettlementStatus.REOPENED,
        closedAt: null,
        closedBy: null,
      },
      include: {
        exceptions: true,
      },
    });
  }

  // ============================================================================
  // TOTALS MANAGEMENT
  // ============================================================================

  /**
   * Update settlement totals
   */
  async updateTotals(input: UpdateSettlementTotalsInput, updatedBy: string) {
    const settlement = await this.getSettlement(input.settlementId);

    if (settlement.status === SettlementStatus.CLOSED) {
      throw new BadRequestException('Cannot update totals on a closed settlement');
    }

    const updateData: Prisma.DailySettlementUpdateInput = {};

    if (input.totalGrossSales !== undefined) updateData.totalGrossSales = input.totalGrossSales;
    if (input.totalDiscounts !== undefined) updateData.totalDiscounts = input.totalDiscounts;
    if (input.totalNetSales !== undefined) updateData.totalNetSales = input.totalNetSales;
    if (input.totalTax !== undefined) updateData.totalTax = input.totalTax;
    if (input.totalServiceCharge !== undefined) updateData.totalServiceCharge = input.totalServiceCharge;
    if (input.totalCash !== undefined) updateData.totalCash = input.totalCash;
    if (input.totalCard !== undefined) updateData.totalCard = input.totalCard;
    if (input.totalMemberAccount !== undefined) updateData.totalMemberAccount = input.totalMemberAccount;
    if (input.totalOther !== undefined) updateData.totalOther = input.totalOther;
    if (input.totalRefunds !== undefined) updateData.totalRefunds = input.totalRefunds;
    if (input.totalVoids !== undefined) updateData.totalVoids = input.totalVoids;
    if (input.transactionCount !== undefined) updateData.transactionCount = input.transactionCount;
    if (input.refundCount !== undefined) updateData.refundCount = input.refundCount;
    if (input.voidCount !== undefined) updateData.voidCount = input.voidCount;

    // Calculate expected cash if cash total is updated
    if (input.totalCash !== undefined) {
      const newExpectedCash = input.totalCash - (input.totalRefunds ?? Number(settlement.totalRefunds));
      updateData.expectedCash = newExpectedCash;
    }

    return this.prisma.dailySettlement.update({
      where: { id: input.settlementId },
      data: updateData,
      include: {
        exceptions: true,
      },
    });
  }

  /**
   * Record actual cash count and calculate variance
   */
  async recordCashCount(input: RecordCashCountInput, countedBy: string) {
    const settlement = await this.getSettlement(input.settlementId);

    if (settlement.status === SettlementStatus.CLOSED) {
      throw new BadRequestException('Cannot record cash count on a closed settlement');
    }

    const variance = input.actualCash - Number(settlement.expectedCash);

    // Create an exception if there's a significant variance
    if (Math.abs(variance) > 0.01) {
      const severity =
        Math.abs(variance) > 1000
          ? ExceptionSeverity.CRITICAL
          : Math.abs(variance) > 100
            ? ExceptionSeverity.HIGH
            : Math.abs(variance) > 10
              ? ExceptionSeverity.MEDIUM
              : ExceptionSeverity.LOW;

      await this.createException({
        settlementId: input.settlementId,
        type: ExceptionType.CASH_VARIANCE,
        severity,
        description: `Cash variance of ${variance.toFixed(2)} detected`,
        amount: variance,
      });
    }

    return this.prisma.dailySettlement.update({
      where: { id: input.settlementId },
      data: {
        actualCash: input.actualCash,
        cashVariance: variance,
      },
      include: {
        exceptions: true,
      },
    });
  }

  /**
   * Calculate and refresh totals from transactions
   */
  async recalculateTotals(settlementId: string, tenantId: string) {
    const settlement = await this.getSettlement(settlementId);

    if (settlement.status === SettlementStatus.CLOSED) {
      throw new BadRequestException('Cannot recalculate totals on a closed settlement');
    }

    // Get all transactions for the business date with payment method details
    const transactions = await this.prisma.paymentTransaction.findMany({
      where: {
        clubId: tenantId,
        paidAt: {
          gte: settlement.businessDate,
          lt: new Date(settlement.businessDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        paymentMethod: true,
      },
    });

    // Calculate totals
    let totalGrossSales = 0;
    let totalCash = 0;
    let totalCard = 0;
    let totalMemberAccount = 0;
    let totalOther = 0;
    let totalRefunds = 0;
    let totalVoids = 0;
    let transactionCount = 0;
    let refundCount = 0;
    let voidCount = 0;

    for (const tx of transactions) {
      const txAmount = Number(tx.amount);

      if (tx.status === 'VOIDED') {
        voidCount++;
        totalVoids += txAmount;
        continue;
      }

      if (tx.refundedAt) {
        refundCount++;
        totalRefunds += Number(tx.refundAmount || 0);
      }

      transactionCount++;
      totalGrossSales += txAmount;

      // Categorize by payment method
      const methodName = tx.paymentMethod?.name?.toLowerCase() || '';
      if (methodName.includes('cash')) {
        totalCash += txAmount;
      } else if (methodName.includes('card') || methodName.includes('credit')) {
        totalCard += txAmount;
      } else if (methodName.includes('member') || methodName.includes('account')) {
        totalMemberAccount += txAmount;
      } else {
        totalOther += txAmount;
      }
    }

    const totalNetSales = totalGrossSales;
    const expectedCash = totalCash - totalRefunds;

    return this.prisma.dailySettlement.update({
      where: { id: settlementId },
      data: {
        totalGrossSales,
        totalNetSales,
        totalCash,
        totalCard,
        totalMemberAccount,
        totalOther,
        totalRefunds,
        totalVoids,
        expectedCash,
        transactionCount,
        refundCount,
        voidCount,
      },
      include: {
        exceptions: true,
      },
    });
  }

  // ============================================================================
  // EXCEPTIONS
  // ============================================================================

  /**
   * Create an exception
   */
  async createException(input: CreateExceptionInput) {
    return this.prisma.settlementException.create({
      data: {
        settlementId: input.settlementId,
        type: input.type,
        severity: input.severity || ExceptionSeverity.MEDIUM,
        description: input.description,
        amount: input.amount,
        transactionId: input.transactionId,
        shiftId: input.shiftId,
        lineItemId: input.lineItemId,
      },
    });
  }

  /**
   * Get exceptions for a settlement
   */
  async getExceptions(settlementId: string, pendingOnly = false) {
    const where: Prisma.SettlementExceptionWhereInput = { settlementId };
    if (pendingOnly) {
      where.resolution = ExceptionResolution.PENDING;
    }

    return this.prisma.settlementException.findMany({
      where,
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Resolve an exception
   */
  async resolveException(input: ResolveExceptionInput, resolvedBy: string) {
    const exception = await this.prisma.settlementException.findUnique({
      where: { id: input.exceptionId },
    });

    if (!exception) {
      throw new NotFoundException('Exception not found');
    }

    if (exception.resolution !== ExceptionResolution.PENDING) {
      throw new BadRequestException('Exception is already resolved');
    }

    return this.prisma.settlementException.update({
      where: { id: input.exceptionId },
      data: {
        resolution: input.resolution,
        resolutionNote: input.resolutionNote,
        resolvedBy,
        resolvedAt: new Date(),
      },
    });
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================

  /**
   * Get settlement summary
   */
  async getSettlementSummary(settlementId: string): Promise<SettlementSummary> {
    const settlement = await this.prisma.dailySettlement.findUnique({
      where: { id: settlementId },
      include: {
        exceptions: true,
      },
    });

    if (!settlement) {
      throw new NotFoundException('Settlement not found');
    }

    const unresolvedExceptionCount = settlement.exceptions.filter(
      (e) => e.resolution === ExceptionResolution.PENDING,
    ).length;

    return {
      settlementId: settlement.id,
      businessDate: settlement.businessDate,
      status: settlement.status,
      totalGrossSales: Number(settlement.totalGrossSales),
      totalNetSales: Number(settlement.totalNetSales),
      totalCash: Number(settlement.totalCash),
      totalCard: Number(settlement.totalCard),
      totalMemberAccount: Number(settlement.totalMemberAccount),
      expectedCash: Number(settlement.expectedCash),
      actualCash: settlement.actualCash ? Number(settlement.actualCash) : null,
      cashVariance: settlement.cashVariance ? Number(settlement.cashVariance) : null,
      exceptionCount: settlement.exceptions.length,
      unresolvedExceptionCount,
    };
  }
}

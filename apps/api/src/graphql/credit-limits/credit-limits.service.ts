import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface CreditCheckResult {
  allowed: boolean;
  currentBalance: number;
  creditLimit: number;
  availableCredit: number;
  chargeAmount: number;
  newBalance: number;
  usagePercent: number;
  warning?: 'APPROACHING_LIMIT' | 'EXCEEDED';
  shortfall?: number;
}

export interface CreditStatusResult {
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  usagePercent: number;
  alertThreshold: number;
  isBlocked: boolean;
  overrideAllowed: boolean;
}

@Injectable()
export class CreditLimitService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // CREDIT CHECK OPERATIONS
  // ============================================================================

  /**
   * Check if a charge is allowed for a member based on their credit limit
   */
  async checkCredit(memberId: string, chargeAmount: number): Promise<CreditCheckResult> {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: {
        creditLimit: true,
        creditLimitEnabled: true,
        creditAlertThreshold: true,
        creditBlockEnabled: true,
        outstandingBalance: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // If credit limits are not enabled, allow all charges
    if (!member.creditLimitEnabled) {
      return {
        allowed: true,
        currentBalance: Number(member.outstandingBalance || 0),
        creditLimit: 0,
        availableCredit: Infinity,
        chargeAmount,
        newBalance: Number(member.outstandingBalance || 0) + chargeAmount,
        usagePercent: 0,
      };
    }

    const currentBalance = Number(member.outstandingBalance || 0);
    const creditLimit = Number(member.creditLimit || 0);
    const availableCredit = Math.max(0, creditLimit - currentBalance);
    const newBalance = currentBalance + chargeAmount;
    const usagePercent = creditLimit > 0 ? Math.round((newBalance / creditLimit) * 100) : 0;

    const result: CreditCheckResult = {
      allowed: true,
      currentBalance,
      creditLimit,
      availableCredit,
      chargeAmount,
      newBalance,
      usagePercent,
    };

    // Check if approaching limit
    const alertThreshold = member.creditAlertThreshold || 80;
    if (usagePercent >= alertThreshold && usagePercent < 100) {
      result.warning = 'APPROACHING_LIMIT';
    }

    // Check if exceeded
    if (newBalance > creditLimit) {
      result.warning = 'EXCEEDED';
      result.shortfall = newBalance - creditLimit;

      if (member.creditBlockEnabled) {
        result.allowed = false;
      }
    }

    return result;
  }

  /**
   * Get credit status for a member (for display in UI)
   */
  async getCreditStatus(memberId: string): Promise<CreditStatusResult | null> {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: {
        creditLimit: true,
        creditLimitEnabled: true,
        creditAlertThreshold: true,
        creditBlockEnabled: true,
        creditOverrideAllowed: true,
        outstandingBalance: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Return null if credit limits are not enabled
    if (!member.creditLimitEnabled) {
      return null;
    }

    const currentBalance = Number(member.outstandingBalance || 0);
    const creditLimit = Number(member.creditLimit || 0);
    const availableCredit = Math.max(0, creditLimit - currentBalance);
    const usagePercent = creditLimit > 0 ? Math.round((currentBalance / creditLimit) * 100) : 0;

    return {
      creditLimit,
      currentBalance,
      availableCredit,
      usagePercent,
      alertThreshold: member.creditAlertThreshold || 80,
      isBlocked: currentBalance >= creditLimit && member.creditBlockEnabled,
      overrideAllowed: member.creditOverrideAllowed,
    };
  }

  // ============================================================================
  // CREDIT LIMIT OVERRIDE OPERATIONS
  // ============================================================================

  /**
   * Create a credit limit override (temporary or permanent increase)
   */
  async createOverride(
    memberId: string,
    newLimit: number,
    reason: string,
    approvedBy: string,
    expiresAt?: Date,
  ) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: { creditLimit: true, creditOverrideAllowed: true },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (!member.creditOverrideAllowed) {
      throw new BadRequestException('Credit limit override is not allowed for this member');
    }

    const previousLimit = Number(member.creditLimit || 0);

    // Create the override record
    const override = await this.prisma.creditLimitOverride.create({
      data: {
        memberId,
        previousLimit,
        newLimit,
        reason,
        approvedBy,
        expiresAt,
        isActive: true,
      },
    });

    // Update member's credit limit
    await this.prisma.member.update({
      where: { id: memberId },
      data: { creditLimit: newLimit },
    });

    return override;
  }

  /**
   * Get active credit limit overrides for a member
   */
  async getActiveOverrides(memberId: string) {
    return this.prisma.creditLimitOverride.findMany({
      where: {
        memberId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get override history for a member
   */
  async getOverrideHistory(memberId: string, limit = 10) {
    return this.prisma.creditLimitOverride.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Revert a credit limit override
   */
  async revertOverride(overrideId: string, revertedBy: string) {
    const override = await this.prisma.creditLimitOverride.findUnique({
      where: { id: overrideId },
    });

    if (!override) {
      throw new NotFoundException('Override not found');
    }

    if (!override.isActive) {
      throw new BadRequestException('Override is already inactive');
    }

    // Mark override as inactive
    await this.prisma.creditLimitOverride.update({
      where: { id: overrideId },
      data: { isActive: false },
    });

    // Revert member's credit limit to previous value
    await this.prisma.member.update({
      where: { id: override.memberId },
      data: { creditLimit: override.previousLimit },
    });

    return true;
  }

  // ============================================================================
  // CREDIT SETTINGS OPERATIONS
  // ============================================================================

  /**
   * Update member credit settings
   */
  async updateCreditSettings(
    memberId: string,
    settings: {
      creditLimit?: number;
      creditLimitEnabled?: boolean;
      creditAlertThreshold?: number;
      creditBlockEnabled?: boolean;
      creditOverrideAllowed?: boolean;
    },
  ) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return this.prisma.member.update({
      where: { id: memberId },
      data: settings,
    });
  }

  /**
   * Get members approaching or exceeding their credit limits
   */
  async getMembersAtRisk(tenantId: string) {
    const members = await this.prisma.member.findMany({
      where: {
        clubId: tenantId,
        creditLimitEnabled: true,
        isActive: true,
      },
      select: {
        id: true,
        memberId: true,
        firstName: true,
        lastName: true,
        creditLimit: true,
        creditAlertThreshold: true,
        outstandingBalance: true,
      },
    });

    return members
      .map((member) => {
        const creditLimit = Number(member.creditLimit || 0);
        const balance = Number(member.outstandingBalance || 0);
        const usagePercent = creditLimit > 0 ? (balance / creditLimit) * 100 : 0;
        const alertThreshold = member.creditAlertThreshold || 80;

        return {
          ...member,
          usagePercent: Math.round(usagePercent),
          isAtRisk: usagePercent >= alertThreshold,
          isExceeded: balance >= creditLimit,
        };
      })
      .filter((m) => m.isAtRisk);
  }

  /**
   * Process expired overrides (to be called by a scheduled job)
   */
  async processExpiredOverrides() {
    const expiredOverrides = await this.prisma.creditLimitOverride.findMany({
      where: {
        isActive: true,
        expiresAt: { lte: new Date() },
      },
    });

    for (const override of expiredOverrides) {
      // Mark as inactive
      await this.prisma.creditLimitOverride.update({
        where: { id: override.id },
        data: { isActive: false },
      });

      // Revert to previous limit
      await this.prisma.member.update({
        where: { id: override.memberId },
        data: { creditLimit: override.previousLimit },
      });
    }

    return expiredOverrides.length;
  }
}

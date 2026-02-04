import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import {
  MinimumSpendPeriod,
  ShortfallAction,
  MemberSpendStatus,
  Prisma,
} from '@prisma/client';

export interface CreateRequirementInput {
  name: string;
  description?: string;
  membershipTypes: string[];
  minimumAmount: number;
  period: MinimumSpendPeriod;
  includeFoodBeverage?: boolean;
  includeGolf?: boolean;
  includeSpa?: boolean;
  includeRetail?: boolean;
  includeEvents?: boolean;
  includedCategories?: string[];
  excludedCategories?: string[];
  defaultShortfallAction?: ShortfallAction;
  gracePeriodDays?: number;
  allowPartialCredit?: boolean;
  notifyAtPercent?: number[];
  notifyDaysBeforeEnd?: number[];
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

export interface UpdateRequirementInput {
  requirementId: string;
  name?: string;
  description?: string;
  membershipTypes?: string[];
  minimumAmount?: number;
  period?: MinimumSpendPeriod;
  includeFoodBeverage?: boolean;
  includeGolf?: boolean;
  includeSpa?: boolean;
  includeRetail?: boolean;
  includeEvents?: boolean;
  includedCategories?: string[];
  excludedCategories?: string[];
  defaultShortfallAction?: ShortfallAction;
  gracePeriodDays?: number;
  allowPartialCredit?: boolean;
  notifyAtPercent?: number[];
  notifyDaysBeforeEnd?: number[];
  effectiveTo?: Date;
  isActive?: boolean;
}

export interface ResolveShortfallInput {
  memberSpendId: string;
  action: ShortfallAction;
  note?: string;
}

export interface ExemptMemberInput {
  memberSpendId: string;
  reason: string;
}

export interface RecordSpendInput {
  memberId: string;
  requirementId: string;
  amount: number;
  category?: string;
}

@Injectable()
export class MinimumSpendService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // REQUIREMENTS MANAGEMENT
  // ============================================================================

  /**
   * Create a minimum spend requirement
   */
  async createRequirement(tenantId: string, input: CreateRequirementInput) {
    return this.prisma.minimumSpendRequirement.create({
      data: {
        clubId: tenantId,
        name: input.name,
        description: input.description,
        membershipTypes: input.membershipTypes,
        minimumAmount: input.minimumAmount,
        period: input.period,
        includeFoodBeverage: input.includeFoodBeverage ?? true,
        includeGolf: input.includeGolf ?? true,
        includeSpa: input.includeSpa ?? false,
        includeRetail: input.includeRetail ?? false,
        includeEvents: input.includeEvents ?? false,
        includedCategories: input.includedCategories ?? [],
        excludedCategories: input.excludedCategories ?? [],
        defaultShortfallAction: input.defaultShortfallAction ?? ShortfallAction.CHARGE_DIFFERENCE,
        gracePeriodDays: input.gracePeriodDays ?? 0,
        allowPartialCredit: input.allowPartialCredit ?? false,
        notifyAtPercent: input.notifyAtPercent ?? [50, 75, 90],
        notifyDaysBeforeEnd: input.notifyDaysBeforeEnd ?? [30, 14, 7],
        effectiveFrom: input.effectiveFrom ?? new Date(),
        effectiveTo: input.effectiveTo,
      },
    });
  }

  /**
   * Get a requirement by ID
   */
  async getRequirement(requirementId: string) {
    const requirement = await this.prisma.minimumSpendRequirement.findUnique({
      where: { id: requirementId },
      include: {
        memberSpends: {
          take: 10,
          orderBy: { periodStart: 'desc' },
        },
      },
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    return requirement;
  }

  /**
   * Get all requirements for a club
   */
  async getRequirements(tenantId: string, activeOnly = true) {
    return this.prisma.minimumSpendRequirement.findMany({
      where: {
        clubId: tenantId,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Update a requirement
   */
  async updateRequirement(input: UpdateRequirementInput) {
    const requirement = await this.getRequirement(input.requirementId);

    const updateData: Prisma.MinimumSpendRequirementUpdateInput = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.membershipTypes !== undefined) updateData.membershipTypes = input.membershipTypes;
    if (input.minimumAmount !== undefined) updateData.minimumAmount = input.minimumAmount;
    if (input.period !== undefined) updateData.period = input.period;
    if (input.includeFoodBeverage !== undefined) updateData.includeFoodBeverage = input.includeFoodBeverage;
    if (input.includeGolf !== undefined) updateData.includeGolf = input.includeGolf;
    if (input.includeSpa !== undefined) updateData.includeSpa = input.includeSpa;
    if (input.includeRetail !== undefined) updateData.includeRetail = input.includeRetail;
    if (input.includeEvents !== undefined) updateData.includeEvents = input.includeEvents;
    if (input.includedCategories !== undefined) updateData.includedCategories = input.includedCategories;
    if (input.excludedCategories !== undefined) updateData.excludedCategories = input.excludedCategories;
    if (input.defaultShortfallAction !== undefined) updateData.defaultShortfallAction = input.defaultShortfallAction;
    if (input.gracePeriodDays !== undefined) updateData.gracePeriodDays = input.gracePeriodDays;
    if (input.allowPartialCredit !== undefined) updateData.allowPartialCredit = input.allowPartialCredit;
    if (input.notifyAtPercent !== undefined) updateData.notifyAtPercent = input.notifyAtPercent;
    if (input.notifyDaysBeforeEnd !== undefined) updateData.notifyDaysBeforeEnd = input.notifyDaysBeforeEnd;
    if (input.effectiveTo !== undefined) updateData.effectiveTo = input.effectiveTo;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    return this.prisma.minimumSpendRequirement.update({
      where: { id: input.requirementId },
      data: updateData,
    });
  }

  /**
   * Delete a requirement (soft delete by deactivating)
   */
  async deleteRequirement(requirementId: string) {
    await this.getRequirement(requirementId);

    return this.prisma.minimumSpendRequirement.update({
      where: { id: requirementId },
      data: { isActive: false },
    });
  }

  // ============================================================================
  // MEMBER SPEND TRACKING
  // ============================================================================

  /**
   * Get or create a member spend record for the current period
   */
  async getOrCreateMemberSpend(
    tenantId: string,
    memberId: string,
    requirementId: string,
  ) {
    const requirement = await this.getRequirement(requirementId);
    const { periodStart, periodEnd, periodLabel } = this.getCurrentPeriod(requirement.period);

    let memberSpend = await this.prisma.memberMinimumSpend.findUnique({
      where: {
        memberId_requirementId_periodStart: {
          memberId,
          requirementId,
          periodStart,
        },
      },
      include: {
        requirement: true,
        member: true,
      },
    });

    if (!memberSpend) {
      memberSpend = await this.prisma.memberMinimumSpend.create({
        data: {
          clubId: tenantId,
          memberId,
          requirementId,
          periodStart,
          periodEnd,
          periodLabel,
          requiredAmount: requirement.minimumAmount,
          currentSpend: 0,
          status: MemberSpendStatus.ON_TRACK,
        },
        include: {
          requirement: true,
          member: true,
        },
      });
    }

    return memberSpend;
  }

  /**
   * Get member spend records for a member
   */
  async getMemberSpends(memberId: string, limit = 12) {
    return this.prisma.memberMinimumSpend.findMany({
      where: { memberId },
      include: {
        requirement: true,
      },
      orderBy: { periodStart: 'desc' },
      take: limit,
    });
  }

  /**
   * Get member spend record by ID
   */
  async getMemberSpend(memberSpendId: string) {
    const memberSpend = await this.prisma.memberMinimumSpend.findUnique({
      where: { id: memberSpendId },
      include: {
        requirement: true,
        member: true,
      },
    });

    if (!memberSpend) {
      throw new NotFoundException('Member spend record not found');
    }

    return memberSpend;
  }

  /**
   * Get all member spends for a club/period with status filtering
   */
  async getMemberSpendsByStatus(
    tenantId: string,
    status?: MemberSpendStatus,
    periodStart?: Date,
    periodEnd?: Date,
  ) {
    const where: Prisma.MemberMinimumSpendWhereInput = {
      clubId: tenantId,
    };

    if (status) {
      where.status = status;
    }

    if (periodStart && periodEnd) {
      where.periodStart = { gte: periodStart };
      where.periodEnd = { lte: periodEnd };
    }

    return this.prisma.memberMinimumSpend.findMany({
      where,
      include: {
        requirement: true,
        member: true,
      },
      orderBy: [{ status: 'asc' }, { currentSpend: 'asc' }],
    });
  }

  /**
   * Record spending against a member's minimum spend requirement
   */
  async recordSpend(tenantId: string, input: RecordSpendInput, recordedBy: string) {
    const memberSpend = await this.getOrCreateMemberSpend(
      tenantId,
      input.memberId,
      input.requirementId,
    );

    if (memberSpend.status === MemberSpendStatus.EXEMPT) {
      throw new BadRequestException('Member is exempt from this requirement');
    }

    // Update spend by category if provided
    let spendByCategory = (memberSpend.spendByCategory as Record<string, number>) || {};
    if (input.category) {
      spendByCategory[input.category] = (spendByCategory[input.category] || 0) + input.amount;
    }

    const newCurrentSpend = Number(memberSpend.currentSpend) + input.amount;
    const requiredAmount = Number(memberSpend.requiredAmount);

    // Calculate new status
    let newStatus = memberSpend.status;
    if (newCurrentSpend >= requiredAmount) {
      newStatus = MemberSpendStatus.MET;
    } else {
      // Calculate pace
      const progress = this.calculateProgress(
        memberSpend.periodStart,
        memberSpend.periodEnd,
        newCurrentSpend,
        requiredAmount,
      );
      newStatus = progress.isOnTrack ? MemberSpendStatus.ON_TRACK : MemberSpendStatus.AT_RISK;
    }

    return this.prisma.memberMinimumSpend.update({
      where: { id: memberSpend.id },
      data: {
        currentSpend: newCurrentSpend,
        spendByCategory,
        status: newStatus,
        lastCalculatedAt: new Date(),
      },
      include: {
        requirement: true,
        member: true,
      },
    });
  }

  /**
   * Recalculate member spend from transactions
   */
  async recalculateMemberSpend(memberSpendId: string, tenantId: string) {
    const memberSpend = await this.getMemberSpend(memberSpendId);
    const requirement = memberSpend.requirement;

    // Get all transactions for this member in the period
    const transactions = await this.prisma.paymentTransaction.findMany({
      where: {
        clubId: tenantId,
        paidAt: {
          gte: memberSpend.periodStart,
          lte: memberSpend.periodEnd,
        },
        // Filter by member - would need to join through lineItems or tee time
      },
    });

    // For now, just update the lastCalculatedAt
    // Full implementation would sum relevant transactions
    return this.prisma.memberMinimumSpend.update({
      where: { id: memberSpendId },
      data: {
        lastCalculatedAt: new Date(),
      },
      include: {
        requirement: true,
        member: true,
      },
    });
  }

  // ============================================================================
  // SHORTFALL MANAGEMENT
  // ============================================================================

  /**
   * Close a period and process shortfalls
   */
  async closePeriod(tenantId: string, periodEnd: Date, closedBy: string) {
    // Find all member spends that ended on this date
    const memberSpends = await this.prisma.memberMinimumSpend.findMany({
      where: {
        clubId: tenantId,
        periodEnd,
        status: {
          notIn: [MemberSpendStatus.MET, MemberSpendStatus.EXEMPT, MemberSpendStatus.RESOLVED],
        },
      },
      include: {
        requirement: true,
        member: true,
      },
    });

    const results = [];

    for (const spend of memberSpends) {
      const shortfallAmount = Number(spend.requiredAmount) - Number(spend.currentSpend);

      if (shortfallAmount > 0) {
        const updated = await this.prisma.memberMinimumSpend.update({
          where: { id: spend.id },
          data: {
            status: MemberSpendStatus.SHORTFALL,
            shortfallAmount,
            shortfallAction: spend.requirement.defaultShortfallAction,
          },
          include: {
            requirement: true,
            member: true,
          },
        });
        results.push(updated);
      } else {
        // Member met the requirement
        const updated = await this.prisma.memberMinimumSpend.update({
          where: { id: spend.id },
          data: {
            status: MemberSpendStatus.MET,
          },
          include: {
            requirement: true,
            member: true,
          },
        });
        results.push(updated);
      }
    }

    return results;
  }

  /**
   * Resolve a shortfall
   */
  async resolveShortfall(input: ResolveShortfallInput, resolvedBy: string) {
    const memberSpend = await this.getMemberSpend(input.memberSpendId);

    if (
      memberSpend.status !== MemberSpendStatus.SHORTFALL &&
      memberSpend.status !== MemberSpendStatus.PENDING_ACTION
    ) {
      throw new BadRequestException('Member spend is not in shortfall status');
    }

    return this.prisma.memberMinimumSpend.update({
      where: { id: input.memberSpendId },
      data: {
        status: MemberSpendStatus.RESOLVED,
        shortfallAction: input.action,
        shortfallResolvedBy: resolvedBy,
        shortfallResolvedAt: new Date(),
        shortfallNote: input.note,
      },
      include: {
        requirement: true,
        member: true,
      },
    });
  }

  /**
   * Exempt a member from minimum spend requirement
   */
  async exemptMember(input: ExemptMemberInput, exemptBy: string) {
    const memberSpend = await this.getMemberSpend(input.memberSpendId);

    return this.prisma.memberMinimumSpend.update({
      where: { id: input.memberSpendId },
      data: {
        status: MemberSpendStatus.EXEMPT,
        isExempt: true,
        exemptReason: input.reason,
        exemptBy,
        exemptAt: new Date(),
      },
      include: {
        requirement: true,
        member: true,
      },
    });
  }

  /**
   * Remove exemption from a member
   */
  async removeExemption(memberSpendId: string) {
    const memberSpend = await this.getMemberSpend(memberSpendId);

    if (!memberSpend.isExempt) {
      throw new BadRequestException('Member is not exempt');
    }

    // Recalculate status
    const currentSpend = Number(memberSpend.currentSpend);
    const requiredAmount = Number(memberSpend.requiredAmount);
    const progress = this.calculateProgress(
      memberSpend.periodStart,
      memberSpend.periodEnd,
      currentSpend,
      requiredAmount,
    );

    let newStatus: MemberSpendStatus = MemberSpendStatus.ON_TRACK;
    if (currentSpend >= requiredAmount) {
      newStatus = MemberSpendStatus.MET;
    } else if (!progress.isOnTrack) {
      newStatus = MemberSpendStatus.AT_RISK;
    }

    return this.prisma.memberMinimumSpend.update({
      where: { id: memberSpendId },
      data: {
        status: newStatus,
        isExempt: false,
        exemptReason: null,
        exemptBy: null,
        exemptAt: null,
      },
      include: {
        requirement: true,
        member: true,
      },
    });
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Get current period dates based on period type
   */
  private getCurrentPeriod(period: MinimumSpendPeriod): {
    periodStart: Date;
    periodEnd: Date;
    periodLabel: string;
  } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    switch (period) {
      case MinimumSpendPeriod.MONTHLY: {
        const periodStart = new Date(year, month, 1);
        const periodEnd = new Date(year, month + 1, 0);
        const periodLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return { periodStart, periodEnd, periodLabel };
      }

      case MinimumSpendPeriod.QUARTERLY: {
        const quarter = Math.floor(month / 3);
        const periodStart = new Date(year, quarter * 3, 1);
        const periodEnd = new Date(year, (quarter + 1) * 3, 0);
        const periodLabel = `Q${quarter + 1} ${year}`;
        return { periodStart, periodEnd, periodLabel };
      }

      case MinimumSpendPeriod.ANNUALLY: {
        const periodStart = new Date(year, 0, 1);
        const periodEnd = new Date(year, 11, 31);
        const periodLabel = `${year}`;
        return { periodStart, periodEnd, periodLabel };
      }
    }
  }

  /**
   * Calculate spending progress and projection
   */
  private calculateProgress(
    periodStart: Date,
    periodEnd: Date,
    currentSpend: number,
    requiredAmount: number,
  ): {
    percentComplete: number;
    percentOfPeriodElapsed: number;
    projectedSpend: number;
    isOnTrack: boolean;
  } {
    const now = new Date();
    const totalDays = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = Math.max(
      0,
      (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24),
    );

    const percentOfPeriodElapsed = Math.min(100, (elapsedDays / totalDays) * 100);
    const percentComplete = requiredAmount > 0 ? (currentSpend / requiredAmount) * 100 : 100;

    // Project spend based on current pace
    const dailyRate = elapsedDays > 0 ? currentSpend / elapsedDays : 0;
    const projectedSpend = dailyRate * totalDays;

    // On track if current progress % is >= period elapsed %
    const isOnTrack = percentComplete >= percentOfPeriodElapsed * 0.9; // 90% of expected pace

    return {
      percentComplete,
      percentOfPeriodElapsed,
      projectedSpend,
      isOnTrack,
    };
  }
}

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { BillingCycleSettingsService } from '@/modules/billing/billing-cycle-settings.service';
import { PeriodStatus, Prisma, ARCycleType, BillingCycleMode } from '@prisma/client';

@Injectable()
export class StatementPeriodService {
  private readonly logger = new Logger(StatementPeriodService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => BillingCycleSettingsService))
    private billingSettingsService: BillingCycleSettingsService,
  ) {}

  /**
   * Create a new statement period
   */
  async create(
    clubId: string,
    data: {
      periodYear: number;
      periodNumber: number;
      periodLabel: string;
      periodStart: Date;
      periodEnd: Date;
      cutoffDate: Date;
      isCatchUp?: boolean;
    },
  ) {
    // Validate dates
    if (data.periodStart >= data.periodEnd) {
      throw new BadRequestException('Period start must be before period end');
    }
    if (data.cutoffDate < data.periodEnd) {
      throw new BadRequestException('Cutoff date must be on or after period end');
    }

    // Check for duplicate period (skip for catch-up periods as they use special numbering)
    if (!data.isCatchUp) {
      const existing = await this.prisma.statementPeriod.findFirst({
        where: {
          clubId,
          periodYear: data.periodYear,
          periodNumber: data.periodNumber,
        },
      });
      if (existing) {
        throw new ConflictException(
          `Statement period ${data.periodYear}-${data.periodNumber} already exists`,
        );
      }
    }

    // Check for overlapping periods
    const overlapping = await this.prisma.statementPeriod.findFirst({
      where: {
        clubId,
        OR: [
          {
            // New period starts within existing period
            periodStart: { lte: data.periodStart },
            periodEnd: { gt: data.periodStart },
          },
          {
            // New period ends within existing period
            periodStart: { lt: data.periodEnd },
            periodEnd: { gte: data.periodEnd },
          },
          {
            // New period contains existing period
            periodStart: { gte: data.periodStart },
            periodEnd: { lte: data.periodEnd },
          },
        ],
      },
    });
    if (overlapping) {
      throw new ConflictException(
        `Period overlaps with existing period: ${overlapping.periodLabel}`,
      );
    }

    // Check for unclosed periods that end before this new period starts
    // Users cannot skip closing a period - they must close earlier periods first
    // EXCEPTION: Catch-up periods bypass this check as they consolidate historical data
    if (!data.isCatchUp) {
      const unclosedEarlierPeriod = await this.prisma.statementPeriod.findFirst({
        where: {
          clubId,
          status: { in: ['OPEN', 'REOPENED'] },
          periodEnd: { lt: data.periodStart },
        },
        orderBy: { periodEnd: 'asc' },
      });
      if (unclosedEarlierPeriod) {
        throw new BadRequestException(
          `Cannot create a new period while earlier period "${unclosedEarlierPeriod.periodLabel}" is still open. Please close it first.`,
        );
      }
    }

    // For catch-up periods, check that no catch-up period already exists
    if (data.isCatchUp) {
      const existingCatchUp = await this.prisma.statementPeriod.findFirst({
        where: {
          clubId,
          isCatchUp: true,
        },
      });
      if (existingCatchUp) {
        throw new ConflictException(
          'A catch-up period already exists. Only one catch-up period is allowed per club.',
        );
      }
    }

    return this.prisma.statementPeriod.create({
      data: {
        clubId,
        periodYear: data.periodYear,
        periodNumber: data.periodNumber,
        periodLabel: data.periodLabel,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        cutoffDate: data.cutoffDate,
        isCatchUp: data.isCatchUp ?? false,
        status: 'OPEN',
      },
    });
  }

  /**
   * Find all statement periods for a club
   */
  async findAll(
    clubId: string,
    filter?: {
      periodYear?: number;
      status?: PeriodStatus;
    },
  ) {
    const where: Prisma.StatementPeriodWhereInput = { clubId };

    if (filter?.periodYear) {
      where.periodYear = filter.periodYear;
    }
    if (filter?.status) {
      where.status = filter.status;
    }

    return this.prisma.statementPeriod.findMany({
      where,
      include: {
        _count: {
          select: { statementRuns: true },
        },
      },
      orderBy: [{ periodYear: 'desc' }, { periodNumber: 'desc' }],
    });
  }

  /**
   * Find statement period by ID
   */
  async findById(id: string) {
    const period = await this.prisma.statementPeriod.findUnique({
      where: { id },
      include: {
        statementRuns: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!period) {
      throw new NotFoundException('Statement period not found');
    }

    return period;
  }

  /**
   * Get current open period for a club
   */
  async getCurrentOpenPeriod(clubId: string) {
    return this.prisma.statementPeriod.findFirst({
      where: {
        clubId,
        status: 'OPEN',
      },
      orderBy: [{ periodYear: 'desc' }, { periodNumber: 'desc' }],
    });
  }

  /**
   * Get period by year and number
   */
  async findByYearAndNumber(clubId: string, periodYear: number, periodNumber: number) {
    return this.prisma.statementPeriod.findFirst({
      where: {
        clubId,
        periodYear,
        periodNumber,
      },
    });
  }

  /**
   * Close a statement period (AR Close)
   */
  async close(id: string, userId?: string) {
    const period = await this.findById(id);

    if (period.status === 'CLOSED') {
      throw new BadRequestException('Period is already closed');
    }

    // Check if there's a finalized statement run
    const finalRun = await this.prisma.statementRun.findFirst({
      where: {
        statementPeriodId: id,
        runType: 'FINAL',
        status: 'COMPLETED',
      },
    });

    if (!finalRun) {
      throw new BadRequestException(
        'Cannot close period without a completed final statement run',
      );
    }

    // Update the period status to CLOSED
    const closedPeriod = await this.prisma.statementPeriod.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: userId,
      },
    });

    // Check if auto-generate next period is enabled
    try {
      const settings = await this.billingSettingsService.getClubBillingSettings(period.clubId);
      if (settings.arAutoGenerateNext) {
        await this.autoGenerateNextPeriod(period.clubId, closedPeriod, settings);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to auto-generate next period after closing ${period.periodLabel}: ${error.message}`,
      );
      // Don't throw - the close operation succeeded
    }

    return closedPeriod;
  }

  /**
   * Auto-generate the next statement period based on cycle settings
   */
  private async autoGenerateNextPeriod(
    clubId: string,
    closedPeriod: any,
    settings: {
      arCycleType: ARCycleType;
      arCustomCycleStartDay: number;
      arCutoffDays: number;
    },
  ) {
    const nextPeriodDates = this.calculateNextPeriodDates(
      closedPeriod.periodEnd,
      settings.arCycleType,
      settings.arCustomCycleStartDay,
      settings.arCutoffDays,
    );

    // Calculate next period number and year
    let nextPeriodNumber = closedPeriod.periodNumber + 1;
    let nextPeriodYear = closedPeriod.periodYear;
    if (nextPeriodNumber > 12) {
      nextPeriodNumber = 1;
      nextPeriodYear++;
    }

    const nextPeriodLabel = this.formatPeriodLabel(
      nextPeriodDates.periodStart,
      nextPeriodDates.periodEnd,
    );

    this.logger.log(
      `Auto-generating next period: ${nextPeriodLabel} (${nextPeriodYear}-${nextPeriodNumber})`,
    );

    try {
      await this.create(clubId, {
        periodYear: nextPeriodYear,
        periodNumber: nextPeriodNumber,
        periodLabel: nextPeriodLabel,
        periodStart: nextPeriodDates.periodStart,
        periodEnd: nextPeriodDates.periodEnd,
        cutoffDate: nextPeriodDates.cutoffDate,
      });
      this.logger.log(`Successfully created next period: ${nextPeriodLabel}`);
    } catch (error) {
      if (error instanceof ConflictException) {
        this.logger.log(`Next period already exists: ${nextPeriodLabel}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Calculate next period dates based on cycle type
   */
  private calculateNextPeriodDates(
    previousPeriodEnd: Date,
    cycleType: ARCycleType,
    customStartDay: number,
    cutoffDays: number,
  ): { periodStart: Date; periodEnd: Date; cutoffDate: Date } {
    const prevEnd = new Date(previousPeriodEnd);

    let periodStart: Date;
    let periodEnd: Date;

    switch (cycleType) {
      case 'CALENDAR_MONTH': {
        // Next period starts on 1st of next month
        periodStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth() + 1, 1);
        // Period ends on last day of that month
        periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);
        break;
      }
      case 'ROLLING_30': {
        // Next period starts day after previous period ended
        periodStart = new Date(prevEnd);
        periodStart.setDate(periodStart.getDate() + 1);
        // Period is 30 days
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 29);
        break;
      }
      case 'CUSTOM': {
        // Custom cycle based on start day
        // If previous period ended on the (customStartDay-1) of month X,
        // next period starts on customStartDay of month X and ends on (customStartDay-1) of month X+1
        const dayAfterPrevEnd = new Date(prevEnd);
        dayAfterPrevEnd.setDate(dayAfterPrevEnd.getDate() + 1);

        periodStart = new Date(
          dayAfterPrevEnd.getFullYear(),
          dayAfterPrevEnd.getMonth(),
          customStartDay,
        );
        // If we're past the custom day this month, start next month
        if (dayAfterPrevEnd.getDate() > customStartDay) {
          periodStart.setMonth(periodStart.getMonth() + 1);
        }

        // Period ends on day before start day of next month
        periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, customStartDay - 1);
        if (customStartDay === 1) {
          // If start day is 1st, end is last day of same month
          periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);
        }
        break;
      }
      default:
        // Default to calendar month
        periodStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth() + 1, 1);
        periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);
    }

    // Cutoff date is period end + cutoff days
    const cutoffDate = new Date(periodEnd);
    cutoffDate.setDate(cutoffDate.getDate() + cutoffDays);

    return { periodStart, periodEnd, cutoffDate };
  }

  /**
   * Format period label (e.g., "January 2026" or "Jan 25 - Feb 24, 2026")
   */
  private formatPeriodLabel(periodStart: Date, periodEnd: Date): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    // If it's a calendar month (starts on 1st), just show "Month Year"
    if (periodStart.getDate() === 1) {
      const lastDayOfMonth = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);
      if (periodEnd.getDate() === lastDayOfMonth.getDate() &&
          periodStart.getMonth() === periodEnd.getMonth()) {
        return `${months[periodStart.getMonth()]} ${periodStart.getFullYear()}`;
      }
    }

    // Otherwise show range
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${shortMonths[periodStart.getMonth()]} ${periodStart.getDate()} - ${shortMonths[periodEnd.getMonth()]} ${periodEnd.getDate()}, ${periodEnd.getFullYear()}`;
  }

  /**
   * Reopen a closed statement period
   */
  async reopen(id: string, reason: string, userId?: string) {
    const period = await this.findById(id);

    if (period.status !== 'CLOSED') {
      throw new BadRequestException('Only closed periods can be reopened');
    }

    this.logger.warn(
      `Reopening closed statement period ${period.periodLabel} (${id}). Reason: ${reason}. User: ${userId}`,
    );

    return this.prisma.statementPeriod.update({
      where: { id },
      data: {
        status: 'REOPENED',
        reopenedAt: new Date(),
        reopenedBy: userId,
        reopenReason: reason,
      },
    });
  }

  /**
   * Update period (only if OPEN or REOPENED)
   */
  async update(
    id: string,
    data: {
      periodLabel?: string;
      periodStart?: Date;
      periodEnd?: Date;
      cutoffDate?: Date;
    },
  ) {
    const period = await this.findById(id);

    if (period.status === 'CLOSED') {
      throw new BadRequestException('Cannot update closed periods. Reopen the period first.');
    }

    // Merge with existing dates for validation
    const periodStart = data.periodStart ?? period.periodStart;
    const periodEnd = data.periodEnd ?? period.periodEnd;
    const cutoffDate = data.cutoffDate ?? period.cutoffDate;

    if (periodStart >= periodEnd) {
      throw new BadRequestException('Period start must be before period end');
    }
    if (cutoffDate < periodEnd) {
      throw new BadRequestException('Cutoff date must be on or after period end');
    }

    // Build update data - only include fields that were provided
    const updateData: Prisma.StatementPeriodUpdateInput = {};
    if (data.periodLabel !== undefined) updateData.periodLabel = data.periodLabel;
    if (data.periodStart !== undefined) updateData.periodStart = data.periodStart;
    if (data.periodEnd !== undefined) updateData.periodEnd = data.periodEnd;
    if (data.cutoffDate !== undefined) updateData.cutoffDate = data.cutoffDate;

    return this.prisma.statementPeriod.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Get periods that need statements generated
   */
  async getPeriodsNeedingStatements(clubId: string) {
    const now = new Date();

    return this.prisma.statementPeriod.findMany({
      where: {
        clubId,
        status: { in: ['OPEN', 'REOPENED'] },
        cutoffDate: { lte: now },
      },
      orderBy: [{ periodYear: 'asc' }, { periodNumber: 'asc' }],
    });
  }

  /**
   * Get summary statistics for periods
   */
  async getPeriodStats(clubId: string, periodYear?: number) {
    const where: Prisma.StatementPeriodWhereInput = { clubId };
    if (periodYear) {
      where.periodYear = periodYear;
    }

    const periods = await this.prisma.statementPeriod.findMany({
      where,
      select: {
        status: true,
      },
    });

    const stats = { open: 0, closed: 0, reopened: 0, total: 0 };
    for (const period of periods) {
      const key = period.status.toLowerCase() as keyof typeof stats;
      if (key in stats && key !== 'total') {
        stats[key]++;
      }
      stats.total++;
    }
    return stats;
  }

  /**
   * Delete a statement period (only if OPEN with no runs)
   */
  async delete(id: string) {
    const period = await this.findById(id);

    if (period.status !== 'OPEN') {
      throw new BadRequestException('Can only delete open periods');
    }

    const runCount = await this.prisma.statementRun.count({
      where: { statementPeriodId: id },
    });

    if (runCount > 0) {
      throw new BadRequestException(
        'Cannot delete period with existing statement runs',
      );
    }

    return this.prisma.statementPeriod.delete({
      where: { id },
    });
  }

  /**
   * Create a period based on the club's billing cycle mode setting.
   * - CLUB_CYCLE: Computes dates from clubCycleClosingDay (e.g., closing day 24 → period 25th to 24th next month)
   * - MEMBER_CYCLE: Creates a financial period umbrella (calendar month or custom)
   */
  async createPeriodForCycleMode(clubId: string) {
    const settings = await this.billingSettingsService.getClubBillingSettings(clubId);
    const cycleMode: BillingCycleMode = settings.billingCycleMode ?? 'CLUB_CYCLE';

    // Find the most recent period to determine the next one
    const latestPeriod = await this.prisma.statementPeriod.findFirst({
      where: { clubId },
      orderBy: [{ periodYear: 'desc' }, { periodNumber: 'desc' }],
    });

    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;
    let periodYear: number;
    let periodNumber: number;

    if (cycleMode === 'CLUB_CYCLE') {
      const closingDay = settings.clubCycleClosingDay ?? 28;

      if (latestPeriod) {
        // Start the day after the last period ended
        const prevEnd = new Date(latestPeriod.periodEnd);
        periodStart = new Date(prevEnd);
        periodStart.setDate(periodStart.getDate() + 1);
      } else {
        // First period: start from the closing day of last month + 1
        const month = now.getMonth();
        const year = now.getFullYear();
        periodStart = new Date(year, month - 1, closingDay + 1);
        if (periodStart > now) {
          periodStart = new Date(year, month - 2, closingDay + 1);
        }
      }

      // Period ends on the closing day of the next month
      periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, closingDay);
      // Clamp to valid day (e.g., Feb 28 if closingDay is 28+)
      const lastDayOfEndMonth = new Date(periodEnd.getFullYear(), periodEnd.getMonth() + 1, 0).getDate();
      if (closingDay > lastDayOfEndMonth) {
        periodEnd = new Date(periodEnd.getFullYear(), periodEnd.getMonth() + 1, 0);
      }
    } else {
      // MEMBER_CYCLE: Financial period umbrella (calendar month)
      if (latestPeriod) {
        const prevEnd = new Date(latestPeriod.periodEnd);
        periodStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth() + 1, 1);
      } else {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);
    }

    // Determine period year/number
    periodYear = periodEnd.getFullYear();
    periodNumber = latestPeriod ? latestPeriod.periodNumber + 1 : 1;
    if (latestPeriod && periodNumber > 12) {
      periodNumber = 1;
      periodYear = latestPeriod.periodYear + 1;
    }

    const periodLabel = this.formatPeriodLabel(periodStart, periodEnd);
    const cutoffDays = settings.arCutoffDays ?? 3;
    const cutoffDate = new Date(periodEnd);
    cutoffDate.setDate(cutoffDate.getDate() + cutoffDays);

    return this.create(clubId, {
      periodYear,
      periodNumber,
      periodLabel,
      periodStart,
      periodEnd,
      cutoffDate,
    });
  }

  /**
   * Compute per-member statement dates based on cycle mode.
   * - CLUB_CYCLE: Uses period dates (first statement may use member joinDate as start)
   * - MEMBER_CYCLE: Computes from member's join date anniversary
   */
  computeMemberStatementDates(
    cycleMode: BillingCycleMode,
    period: { periodStart: Date; periodEnd: Date },
    memberJoinDate: Date,
    isFirstStatement: boolean,
  ): { statementStart: Date; statementEnd: Date } {
    if (cycleMode === 'CLUB_CYCLE') {
      return {
        statementStart: isFirstStatement ? new Date(memberJoinDate) : new Date(period.periodStart),
        statementEnd: new Date(period.periodEnd),
      };
    }

    // MEMBER_CYCLE: anniversary-based dates
    const joinDay = new Date(memberJoinDate).getDate();
    const periodMonth = new Date(period.periodStart).getMonth();
    const periodYear = new Date(period.periodStart).getFullYear();

    // Statement runs from joinDay of one month to (joinDay - 1) of the next
    const statementStart = new Date(periodYear, periodMonth, joinDay);
    // If the start is after the period end, go back a month
    if (statementStart > new Date(period.periodEnd)) {
      statementStart.setMonth(statementStart.getMonth() - 1);
    }

    const statementEnd = new Date(statementStart.getFullYear(), statementStart.getMonth() + 1, joinDay - 1);
    // If joinDay is 1, end is last day of same month
    if (joinDay === 1) {
      const lastDay = new Date(statementStart.getFullYear(), statementStart.getMonth() + 1, 0);
      return { statementStart, statementEnd: lastDay };
    }

    return { statementStart, statementEnd };
  }
}

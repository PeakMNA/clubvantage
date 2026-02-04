import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PeriodStatus, Prisma } from '@prisma/client';

@Injectable()
export class StatementPeriodService {
  private readonly logger = new Logger(StatementPeriodService.name);

  constructor(private prisma: PrismaService) {}

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
    },
  ) {
    // Validate dates
    if (data.periodStart >= data.periodEnd) {
      throw new BadRequestException('Period start must be before period end');
    }
    if (data.cutoffDate < data.periodEnd) {
      throw new BadRequestException('Cutoff date must be on or after period end');
    }

    // Check for duplicate period
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

    return this.prisma.statementPeriod.create({
      data: {
        clubId,
        periodYear: data.periodYear,
        periodNumber: data.periodNumber,
        periodLabel: data.periodLabel,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        cutoffDate: data.cutoffDate,
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

    return this.prisma.statementPeriod.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: userId,
      },
    });
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
   * Update period dates (only if OPEN)
   */
  async updateDates(
    id: string,
    data: {
      periodStart?: Date;
      periodEnd?: Date;
      cutoffDate?: Date;
    },
  ) {
    const period = await this.findById(id);

    if (period.status !== 'OPEN') {
      throw new BadRequestException('Can only update dates for open periods');
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

    return this.prisma.statementPeriod.update({
      where: { id },
      data: {
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        cutoffDate: data.cutoffDate,
      },
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
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { DeliveryStatus, Prisma } from '@prisma/client';

@Injectable()
export class StatementService {
  private readonly logger = new Logger(StatementService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Find statement by ID
   */
  async findById(id: string) {
    const statement = await this.prisma.statement.findUnique({
      where: { id },
      include: {
        arProfile: {
          include: {
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                memberId: true,
                email: true,
              },
            },
            cityLedger: {
              select: {
                id: true,
                accountName: true,
                accountType: true,
                contactEmail: true,
              },
            },
          },
        },
        statementRun: {
          include: {
            statementPeriod: true,
          },
        },
      },
    });

    if (!statement) {
      throw new NotFoundException('Statement not found');
    }

    return statement;
  }

  /**
   * Find statements for a run
   */
  async findByRun(
    runId: string,
    filter?: {
      minBalance?: number;
      maxBalance?: number;
    },
  ) {
    const where: Prisma.StatementWhereInput = { statementRunId: runId };

    if (filter?.minBalance !== undefined) {
      where.closingBalance = { gte: filter.minBalance };
    }
    if (filter?.maxBalance !== undefined) {
      where.closingBalance = {
        ...(where.closingBalance as Prisma.DecimalFilter || {}),
        lte: filter.maxBalance,
      };
    }

    return this.prisma.statement.findMany({
      where,
      include: {
        arProfile: {
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true,
                memberId: true,
              },
            },
            cityLedger: {
              select: {
                accountName: true,
                accountType: true,
              },
            },
          },
        },
      },
      orderBy: { closingBalance: 'desc' },
    });
  }

  /**
   * Find statements for a member
   */
  async findByMember(memberId: string) {
    return this.prisma.statement.findMany({
      where: {
        arProfile: { memberId },
        statementNumber: { not: null }, // Only finalized statements
      },
      include: {
        statementRun: {
          select: {
            runType: true,
            statementPeriod: {
              select: {
                periodLabel: true,
              },
            },
          },
        },
      },
      orderBy: { periodEnd: 'desc' },
    });
  }

  /**
   * Find statements for a city ledger
   */
  async findByCityLedger(cityLedgerId: string) {
    return this.prisma.statement.findMany({
      where: {
        arProfile: { cityLedgerId },
        statementNumber: { not: null }, // Only finalized statements
      },
      include: {
        statementRun: {
          select: {
            runType: true,
            statementPeriod: {
              select: {
                periodLabel: true,
              },
            },
          },
        },
      },
      orderBy: { periodEnd: 'desc' },
    });
  }

  /**
   * Find statements for an AR profile
   */
  async findByProfile(arProfileId: string, onlyFinal = true) {
    const where: Prisma.StatementWhereInput = { arProfileId };

    if (onlyFinal) {
      where.statementNumber = { not: null };
    }

    return this.prisma.statement.findMany({
      where,
      include: {
        statementRun: {
          select: {
            runType: true,
            runNumber: true,
            statementPeriod: {
              select: {
                periodLabel: true,
                periodYear: true,
                periodNumber: true,
              },
            },
          },
        },
      },
      orderBy: { periodEnd: 'desc' },
    });
  }

  /**
   * Update delivery status
   */
  async updateDeliveryStatus(
    id: string,
    channel: 'email' | 'print' | 'portal' | 'sms',
    status: DeliveryStatus,
    error?: string,
  ) {
    const data: Prisma.StatementUpdateInput = {};

    switch (channel) {
      case 'email':
        data.emailStatus = status;
        if (status === 'SENT') data.emailSentAt = new Date();
        if (status === 'DELIVERED') data.emailDeliveredAt = new Date();
        if (error) data.emailError = error;
        break;
      case 'print':
        data.printStatus = status;
        if (status === 'SENT') data.printedAt = new Date();
        break;
      case 'portal':
        data.portalStatus = status;
        if (status === 'SENT') data.portalPublishedAt = new Date();
        break;
      case 'sms':
        data.smsStatus = status;
        if (status === 'SENT') data.smsSentAt = new Date();
        if (status === 'DELIVERED') data.smsDeliveredAt = new Date();
        if (error) data.smsError = error;
        break;
    }

    return this.prisma.statement.update({
      where: { id },
      data,
    });
  }

  /**
   * Mark statement as viewed in portal
   */
  async markPortalViewed(id: string) {
    return this.prisma.statement.update({
      where: { id },
      data: {
        portalViewedAt: new Date(),
      },
    });
  }

  /**
   * Update PDF info
   */
  async updatePdf(id: string, pdfUrl: string) {
    return this.prisma.statement.update({
      where: { id },
      data: {
        pdfUrl,
        pdfGeneratedAt: new Date(),
      },
    });
  }

  /**
   * Get statements pending delivery for a specific channel
   */
  async getPendingDelivery(
    clubId: string,
    channel: 'email' | 'print' | 'portal' | 'sms',
    runId?: string,
  ) {
    const where: Prisma.StatementWhereInput = {
      clubId,
      statementNumber: { not: null }, // Only finalized statements
    };

    if (runId) {
      where.statementRunId = runId;
    }

    // Filter by delivery method preference and pending status
    switch (channel) {
      case 'email':
        where.deliveryMethod = { in: ['EMAIL', 'EMAIL_AND_PRINT', 'ALL'] };
        where.emailStatus = 'PENDING';
        break;
      case 'print':
        where.deliveryMethod = { in: ['PRINT', 'EMAIL_AND_PRINT', 'ALL'] };
        where.printStatus = 'PENDING';
        break;
      case 'portal':
        where.deliveryMethod = { in: ['PORTAL', 'ALL'] };
        where.portalStatus = 'PENDING';
        break;
      case 'sms':
        where.deliveryMethod = { in: ['SMS', 'ALL'] };
        where.smsStatus = 'PENDING';
        break;
    }

    return this.prisma.statement.findMany({
      where,
      include: {
        arProfile: {
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            cityLedger: {
              select: {
                accountName: true,
                contactEmail: true,
                contactPhone: true,
              },
            },
          },
        },
      },
      orderBy: { closingBalance: 'desc' },
    });
  }

  /**
   * Get delivery summary for a run
   */
  async getDeliverySummary(runId: string) {
    const statements = await this.prisma.statement.findMany({
      where: { statementRunId: runId },
      select: {
        deliveryMethod: true,
        emailStatus: true,
        printStatus: true,
        portalStatus: true,
        smsStatus: true,
      },
    });

    const summary = {
      total: statements.length,
      email: { pending: 0, sent: 0, delivered: 0, failed: 0 },
      print: { pending: 0, sent: 0, delivered: 0, failed: 0 },
      portal: { pending: 0, sent: 0, delivered: 0, failed: 0 },
      sms: { pending: 0, sent: 0, delivered: 0, failed: 0 },
    };

    for (const stmt of statements) {
      // Email
      if (['EMAIL', 'EMAIL_AND_PRINT', 'ALL'].includes(stmt.deliveryMethod)) {
        summary.email[stmt.emailStatus.toLowerCase() as keyof typeof summary.email]++;
      }
      // Print
      if (['PRINT', 'EMAIL_AND_PRINT', 'ALL'].includes(stmt.deliveryMethod)) {
        summary.print[stmt.printStatus.toLowerCase() as keyof typeof summary.print]++;
      }
      // Portal
      if (['PORTAL', 'ALL'].includes(stmt.deliveryMethod)) {
        summary.portal[stmt.portalStatus.toLowerCase() as keyof typeof summary.portal]++;
      }
      // SMS
      if (['SMS', 'ALL'].includes(stmt.deliveryMethod)) {
        summary.sms[stmt.smsStatus.toLowerCase() as keyof typeof summary.sms]++;
      }
    }

    return summary;
  }

  /**
   * Get statement totals for a run (for AR close)
   */
  async getRunTotals(runId: string) {
    const result = await this.prisma.statement.aggregate({
      where: { statementRunId: runId },
      _count: true,
      _sum: {
        openingBalance: true,
        totalDebits: true,
        totalCredits: true,
        closingBalance: true,
      },
    });

    return {
      totalStatements: result._count,
      totalOpeningBalance: Number(result._sum.openingBalance || 0),
      totalDebits: Number(result._sum.totalDebits || 0),
      totalCredits: Number(result._sum.totalCredits || 0),
      totalClosingBalance: Number(result._sum.closingBalance || 0),
    };
  }
}

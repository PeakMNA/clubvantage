import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { StatementRunType, StatementRunStatus, Prisma } from '@prisma/client';
import { ARProfileService } from './ar-profile.service';

@Injectable()
export class StatementRunService {
  private readonly logger = new Logger(StatementRunService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ARProfileService))
    private arProfileService: ARProfileService,
  ) {}

  /**
   * Get next run number for a period
   */
  private async getNextRunNumber(statementPeriodId: string): Promise<number> {
    const lastRun = await this.prisma.statementRun.findFirst({
      where: { statementPeriodId },
      orderBy: { runNumber: 'desc' },
      select: { runNumber: true },
    });

    return (lastRun?.runNumber ?? 0) + 1;
  }

  /**
   * Start a new statement run
   */
  async start(
    clubId: string,
    statementPeriodId: string,
    runType: StatementRunType,
    profileIds: string[] | undefined,
    userId: string,
  ) {
    // Verify period exists and is not closed (unless reopened)
    const period = await this.prisma.statementPeriod.findUnique({
      where: { id: statementPeriodId },
    });

    if (!period) {
      throw new NotFoundException('Statement period not found');
    }

    if (period.clubId !== clubId) {
      throw new BadRequestException('Statement period does not belong to this club');
    }

    if (period.status === 'CLOSED') {
      throw new BadRequestException('Cannot run statements on a closed period');
    }

    // For FINAL runs, check if there's already a completed FINAL run
    if (runType === 'FINAL') {
      const existingFinal = await this.prisma.statementRun.findFirst({
        where: {
          statementPeriodId,
          runType: 'FINAL',
          status: 'COMPLETED',
        },
      });

      if (existingFinal) {
        throw new BadRequestException(
          'A FINAL run has already been completed for this period. Reopen the period to run again.',
        );
      }
    }

    const runNumber = await this.getNextRunNumber(statementPeriodId);

    // Get profiles to process
    let profilesToProcess;
    if (profileIds && profileIds.length > 0) {
      profilesToProcess = await this.prisma.aRProfile.findMany({
        where: {
          id: { in: profileIds },
          clubId,
          status: 'ACTIVE',
        },
        include: {
          member: true,
          cityLedger: true,
        },
      });
    } else {
      profilesToProcess = await this.arProfileService.getActiveProfiles(clubId);
    }

    // Create the run record
    const run = await this.prisma.statementRun.create({
      data: {
        clubId,
        statementPeriodId,
        runType,
        runNumber,
        status: 'PENDING',
        totalProfiles: profilesToProcess.length,
        processedCount: 0,
        generatedCount: 0,
        skippedCount: 0,
        errorCount: 0,
        totalOpeningBalance: 0,
        totalDebits: 0,
        totalCredits: 0,
        totalClosingBalance: 0,
        createdBy: userId,
      },
    });

    // Start processing asynchronously
    this.processRun(run.id, period, profilesToProcess, runType === 'FINAL').catch(
      (err) => {
        this.logger.error(`Error processing run ${run.id}: ${err.message}`, err.stack);
      },
    );

    return run;
  }

  /**
   * Process the statement run
   */
  private async processRun(
    runId: string,
    period: any,
    profiles: any[],
    isFinal: boolean,
  ) {
    // Update status to IN_PROGRESS
    await this.prisma.statementRun.update({
      where: { id: runId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    const totals = {
      processedCount: 0,
      generatedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      totalOpeningBalance: 0,
      totalDebits: 0,
      totalCredits: 0,
      totalClosingBalance: 0,
    };

    const errors: Array<{ profileId: string; error: string }> = [];

    for (const profile of profiles) {
      try {
        const statement = await this.generateStatementForProfile(
          runId,
          profile,
          period,
          isFinal,
        );

        totals.processedCount++;

        if (statement) {
          totals.generatedCount++;
          totals.totalOpeningBalance += Number(statement.openingBalance);
          totals.totalDebits += Number(statement.totalDebits);
          totals.totalCredits += Number(statement.totalCredits);
          totals.totalClosingBalance += Number(statement.closingBalance);
        } else {
          totals.skippedCount++;
        }

        // Update progress every 10 profiles
        if (totals.processedCount % 10 === 0) {
          await this.prisma.statementRun.update({
            where: { id: runId },
            data: {
              processedCount: totals.processedCount,
              generatedCount: totals.generatedCount,
              skippedCount: totals.skippedCount,
            },
          });
        }
      } catch (err: any) {
        totals.processedCount++;
        totals.errorCount++;
        errors.push({ profileId: profile.id, error: err.message });
        this.logger.error(
          `Error generating statement for profile ${profile.id}: ${err.message}`,
        );
      }
    }

    // Final update
    await this.prisma.statementRun.update({
      where: { id: runId },
      data: {
        status:
          totals.errorCount > 0 && totals.generatedCount === 0
            ? 'FAILED'
            : 'COMPLETED',
        completedAt: new Date(),
        ...totals,
        errorLog: errors.length > 0 ? errors : Prisma.JsonNull,
      },
    });

    this.logger.log(
      `Run ${runId} completed: ${totals.generatedCount} generated, ${totals.skippedCount} skipped, ${totals.errorCount} errors`,
    );
  }

  /**
   * Generate statement for a single profile
   * Returns null if no activity and zero balance (skip)
   */
  private async generateStatementForProfile(
    runId: string,
    profile: any,
    period: any,
    isFinal: boolean,
  ) {
    const clubId = profile.clubId;

    // Get transactions for this profile in the period
    const invoices = await this.prisma.invoice.findMany({
      where: {
        clubId,
        ...(profile.memberId
          ? { memberId: profile.memberId }
          : { cityLedgerId: profile.cityLedgerId }),
        invoiceDate: {
          gte: period.periodStart,
          lte: period.cutoffDate,
        },
      },
      orderBy: { invoiceDate: 'asc' },
    });

    const payments = profile.memberId
      ? await this.prisma.payment.findMany({
          where: {
            clubId,
            memberId: profile.memberId,
            paymentDate: {
              gte: period.periodStart,
              lte: period.cutoffDate,
            },
          },
          orderBy: { paymentDate: 'asc' },
        })
      : [];

    // Calculate opening balance (balance as of period start)
    const priorInvoices = await this.prisma.invoice.aggregate({
      where: {
        clubId,
        ...(profile.memberId
          ? { memberId: profile.memberId }
          : { cityLedgerId: profile.cityLedgerId }),
        invoiceDate: { lt: period.periodStart },
      },
      _sum: { balanceDue: true },
    });

    const openingBalance = Number(priorInvoices._sum.balanceDue || 0);

    // Build transaction list
    const transactions: any[] = [];
    let runningBalance = openingBalance;

    // Add invoices
    for (const inv of invoices) {
      runningBalance += Number(inv.totalAmount);
      transactions.push({
        id: inv.id,
        date: inv.invoiceDate,
        type: 'INVOICE',
        description: `Invoice ${inv.invoiceNumber}`,
        invoiceNumber: inv.invoiceNumber,
        amount: Number(inv.totalAmount),
        balance: Number(inv.balanceDue),
        dueDate: inv.dueDate,
        runningBalance,
      });
    }

    // Add payments
    for (const pmt of payments) {
      runningBalance -= Number(pmt.amount);
      transactions.push({
        id: pmt.id,
        date: pmt.paymentDate,
        type: 'PAYMENT',
        description: `Payment - ${pmt.method}`,
        referenceNumber: pmt.referenceNumber,
        amount: Number(pmt.amount),
        runningBalance,
      });
    }

    // Sort by date
    transactions.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Calculate totals
    const totalDebits = invoices.reduce(
      (sum, inv) => sum + Number(inv.totalAmount),
      0,
    );
    const totalCredits = payments.reduce(
      (sum, pmt) => sum + Number(pmt.amount),
      0,
    );
    const closingBalance = openingBalance + totalDebits - totalCredits;

    // Skip if no activity and zero balance
    if (transactions.length === 0 && closingBalance === 0) {
      return null;
    }

    // Calculate aging
    const aging = this.calculateAging(transactions, period.periodEnd);

    // Build profile snapshot
    const profileSnapshot = this.buildProfileSnapshot(profile);

    // Calculate due date
    const dueDate = new Date(period.periodEnd);
    dueDate.setDate(dueDate.getDate() + profile.paymentTermsDays);

    // Generate statement number only for FINAL runs
    let statementNumber: string | undefined;
    if (isFinal) {
      statementNumber = await this.generateStatementNumber(
        clubId,
        period.periodYear,
        period.periodNumber,
      );
    }

    // Create statement
    return this.prisma.statement.create({
      data: {
        clubId,
        statementRunId: runId,
        arProfileId: profile.id,
        statementNumber,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
        dueDate,
        openingBalance,
        totalDebits,
        totalCredits,
        closingBalance,
        ...aging,
        profileSnapshot,
        transactionCount: transactions.length,
        transactions,
        deliveryMethod: profile.statementDelivery,
      },
    });
  }

  /**
   * Generate next statement number for a period
   */
  private async generateStatementNumber(
    clubId: string,
    periodYear: number,
    periodNumber: number,
  ): Promise<string> {
    const prefix = `STMT-${(periodYear % 100).toString().padStart(2, '0')}-${periodNumber.toString().padStart(2, '0')}`;

    const lastStatement = await this.prisma.statement.findFirst({
      where: {
        clubId,
        statementNumber: { startsWith: prefix },
      },
      orderBy: { statementNumber: 'desc' },
      select: { statementNumber: true },
    });

    let nextNum = 1;
    if (lastStatement?.statementNumber) {
      const match = lastStatement.statementNumber.match(/(\d+)$/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }

    return `${prefix}-${nextNum.toString().padStart(6, '0')}`;
  }

  /**
   * Build profile snapshot for historical record
   */
  private buildProfileSnapshot(profile: any) {
    const snapshot: any = {
      accountNumber: profile.accountNumber,
      profileType: profile.profileType,
      paymentTermsDays: profile.paymentTermsDays,
      creditLimit: profile.creditLimit ? Number(profile.creditLimit) : undefined,
    };

    if (profile.profileType === 'MEMBER' && profile.member) {
      const member = profile.member;
      snapshot.name = `${member.firstName} ${member.lastName}`;
      snapshot.memberNumber = member.memberId;
      snapshot.email = member.email;
      snapshot.phone = member.phone;
    } else if (profile.profileType === 'CITY_LEDGER' && profile.cityLedger) {
      const cl = profile.cityLedger;
      snapshot.name = cl.accountName;
      snapshot.companyName = cl.accountName;
      snapshot.cityLedgerType = cl.accountType;
      snapshot.email = cl.contactEmail;
      snapshot.phone = cl.contactPhone;
    }

    return snapshot;
  }

  /**
   * Calculate aging breakdown
   */
  private calculateAging(
    transactions: any[],
    periodEnd: Date,
  ): {
    agingCurrent: number;
    aging1to30: number;
    aging31to60: number;
    aging61to90: number;
    aging90Plus: number;
  } {
    const aging = {
      agingCurrent: 0,
      aging1to30: 0,
      aging31to60: 0,
      aging61to90: 0,
      aging90Plus: 0,
    };

    // Calculate based on invoice due dates
    for (const tx of transactions) {
      if (tx.type === 'INVOICE' && tx.balance > 0) {
        const dueDate = new Date(tx.dueDate);
        const daysOverdue = Math.floor(
          (periodEnd.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysOverdue <= 0) {
          aging.agingCurrent += tx.balance;
        } else if (daysOverdue <= 30) {
          aging.aging1to30 += tx.balance;
        } else if (daysOverdue <= 60) {
          aging.aging31to60 += tx.balance;
        } else if (daysOverdue <= 90) {
          aging.aging61to90 += tx.balance;
        } else {
          aging.aging90Plus += tx.balance;
        }
      }
    }

    return aging;
  }

  /**
   * Find run by ID
   */
  async findById(id: string) {
    const run = await this.prisma.statementRun.findUnique({
      where: { id },
      include: {
        statementPeriod: true,
        _count: {
          select: { statements: true },
        },
      },
    });

    if (!run) {
      throw new NotFoundException('Statement run not found');
    }

    return run;
  }

  /**
   * Find runs for a period
   */
  async findByPeriod(statementPeriodId: string) {
    return this.prisma.statementRun.findMany({
      where: { statementPeriodId },
      orderBy: { runNumber: 'desc' },
    });
  }

  /**
   * Find all runs for a club
   */
  async findAll(
    clubId: string,
    filter?: {
      statementPeriodId?: string;
      runType?: StatementRunType;
      status?: StatementRunStatus;
    },
  ) {
    const where: Prisma.StatementRunWhereInput = { clubId };

    if (filter?.statementPeriodId) {
      where.statementPeriodId = filter.statementPeriodId;
    }
    if (filter?.runType) {
      where.runType = filter.runType;
    }
    if (filter?.status) {
      where.status = filter.status;
    }

    return this.prisma.statementRun.findMany({
      where,
      include: {
        statementPeriod: {
          select: {
            periodYear: true,
            periodNumber: true,
            periodLabel: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Cancel a pending or in-progress run
   */
  async cancel(id: string) {
    const run = await this.findById(id);

    if (!['PENDING', 'IN_PROGRESS'].includes(run.status)) {
      throw new BadRequestException('Can only cancel pending or in-progress runs');
    }

    return this.prisma.statementRun.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    });
  }
}

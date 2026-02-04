# AR Statement System Implementation Plan - Part 2

> Continuation of `2026-02-04-ar-statement-system-implementation.md`

---

### Task 17: Create Statement Period Service

**Files:**
- Create: `apps/api/src/graphql/ar-statements/statement-period.service.ts`

**Step 1: Create the service file**

```typescript
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PeriodStatus } from '@prisma/client';

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
    // Check for duplicate period
    const existing = await this.prisma.statementPeriod.findFirst({
      where: {
        clubId,
        periodYear: data.periodYear,
        periodNumber: data.periodNumber,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Period ${data.periodYear}-${data.periodNumber} already exists`,
      );
    }

    return this.prisma.statementPeriod.create({
      data: {
        clubId,
        ...data,
        status: 'OPEN',
      },
    });
  }

  /**
   * Find all periods for a club
   */
  async findAll(clubId: string, year?: number) {
    const where: any = { clubId };
    if (year) {
      where.periodYear = year;
    }

    return this.prisma.statementPeriod.findMany({
      where,
      orderBy: [{ periodYear: 'desc' }, { periodNumber: 'desc' }],
    });
  }

  /**
   * Find period by ID
   */
  async findById(id: string) {
    const period = await this.prisma.statementPeriod.findUnique({
      where: { id },
      include: {
        statementRuns: {
          orderBy: { runNumber: 'desc' },
          take: 5,
        },
      },
    });

    if (!period) {
      throw new NotFoundException('Statement period not found');
    }

    return period;
  }

  /**
   * Get the current open period for a club
   */
  async getCurrentOpen(clubId: string) {
    return this.prisma.statementPeriod.findFirst({
      where: {
        clubId,
        status: 'OPEN',
      },
      orderBy: [{ periodYear: 'desc' }, { periodNumber: 'desc' }],
    });
  }

  /**
   * Close a statement period
   */
  async close(
    id: string,
    totals: {
      totalProfiles: number;
      totalStatements: number;
      totalOpeningBalance: number;
      totalDebits: number;
      totalCredits: number;
      totalClosingBalance: number;
    },
    userId: string,
  ) {
    const period = await this.findById(id);

    if (period.status === 'CLOSED') {
      throw new BadRequestException('Period is already closed');
    }

    // Verify there's at least one FINAL run
    const finalRun = await this.prisma.statementRun.findFirst({
      where: {
        statementPeriodId: id,
        runType: 'FINAL',
        status: 'COMPLETED',
      },
    });

    if (!finalRun) {
      throw new BadRequestException('Cannot close period without a completed FINAL run');
    }

    return this.prisma.statementPeriod.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: userId,
        ...totals,
      },
    });
  }

  /**
   * Reopen a closed period (requires approval)
   */
  async reopen(id: string, reason: string, userId: string, approvedBy: string) {
    const period = await this.findById(id);

    if (period.status !== 'CLOSED') {
      throw new BadRequestException('Only closed periods can be reopened');
    }

    this.logger.warn(
      `Period ${period.periodLabel} being reopened by ${userId} with approval from ${approvedBy}. Reason: ${reason}`,
    );

    return this.prisma.statementPeriod.update({
      where: { id },
      data: {
        status: 'REOPENED',
        reopenedAt: new Date(),
        reopenedBy: userId,
        reopenReason: reason,
        reopenApprovedBy: approvedBy,
      },
    });
  }

  /**
   * Check if period can accept transactions
   */
  async canAcceptTransactions(id: string): Promise<boolean> {
    const period = await this.findById(id);
    return period.status !== 'CLOSED';
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/ar-statements/statement-period.service.ts
git commit -m "feat(api): add StatementPeriodService with open/close/reopen"
```

---

### Task 18: Create Statement Run Service

**Files:**
- Create: `apps/api/src/graphql/ar-statements/statement-run.service.ts`

**Step 1: Create the service file**

```typescript
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { StatementRunType, StatementRunStatus } from '@prisma/client';
import { ARProfileService } from './ar-profile.service';
import { StatementService } from './statement.service';

@Injectable()
export class StatementRunService {
  private readonly logger = new Logger(StatementRunService.name);

  constructor(
    private prisma: PrismaService,
    private arProfileService: ARProfileService,
    private statementService: StatementService,
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
    userId: string,
  ) {
    // Verify period exists and is not closed (unless reopened)
    const period = await this.prisma.statementPeriod.findUnique({
      where: { id: statementPeriodId },
    });

    if (!period) {
      throw new NotFoundException('Statement period not found');
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

    // Get count of active profiles
    const activeProfiles = await this.arProfileService.getActiveProfiles(clubId);

    // Create the run record
    const run = await this.prisma.statementRun.create({
      data: {
        clubId,
        statementPeriodId,
        runType,
        runNumber,
        status: 'PENDING',
        totalProfiles: activeProfiles.length,
        createdBy: userId,
      },
    });

    // Start processing asynchronously
    this.processRun(run.id, period, activeProfiles, runType === 'FINAL').catch((err) => {
      this.logger.error(`Error processing run ${run.id}: ${err.message}`, err.stack);
    });

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
        const statement = await this.statementService.generateForProfile(
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
      } catch (err) {
        totals.processedCount++;
        totals.errorCount++;
        errors.push({ profileId: profile.id, error: err.message });
        this.logger.error(`Error generating statement for profile ${profile.id}: ${err.message}`);
      }
    }

    // Final update
    await this.prisma.statementRun.update({
      where: { id: runId },
      data: {
        status: totals.errorCount > 0 && totals.generatedCount === 0 ? 'FAILED' : 'COMPLETED',
        completedAt: new Date(),
        ...totals,
        errorLog: errors.length > 0 ? errors : undefined,
      },
    });

    this.logger.log(
      `Run ${runId} completed: ${totals.generatedCount} generated, ${totals.skippedCount} skipped, ${totals.errorCount} errors`,
    );
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
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/ar-statements/statement-run.service.ts
git commit -m "feat(api): add StatementRunService with batch processing"
```

---

### Task 19: Create Statement Service

**Files:**
- Create: `apps/api/src/graphql/ar-statements/statement.service.ts`

**Step 1: Create the service file**

```typescript
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

interface ProfileSnapshot {
  name: string;
  accountNumber: string;
  profileType: 'MEMBER' | 'CITY_LEDGER';
  memberNumber?: string;
  membershipType?: string;
  companyName?: string;
  cityLedgerType?: string;
  email?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentTermsDays: number;
  creditLimit?: number;
}

@Injectable()
export class StatementService {
  private readonly logger = new Logger(StatementService.name);

  constructor(private prisma: PrismaService) {}

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
  private buildProfileSnapshot(profile: any): ProfileSnapshot {
    const snapshot: ProfileSnapshot = {
      name: '',
      accountNumber: profile.accountNumber,
      profileType: profile.profileType,
      paymentTermsDays: profile.paymentTermsDays,
      creditLimit: profile.creditLimit ? Number(profile.creditLimit) : undefined,
    };

    if (profile.profileType === 'MEMBER' && profile.member) {
      const member = profile.member;
      snapshot.name = `${member.firstName} ${member.lastName}`;
      snapshot.memberNumber = member.memberNumber;
      snapshot.membershipType = member.membershipType?.name;
      snapshot.email = member.email;
      snapshot.phone = member.phone;

      if (member.addresses?.[0]) {
        const addr = member.addresses[0];
        snapshot.address = {
          line1: addr.line1,
          line2: addr.line2,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country,
        };
      }
    } else if (profile.profileType === 'CITY_LEDGER' && profile.cityLedger) {
      const cl = profile.cityLedger;
      snapshot.name = cl.name;
      snapshot.companyName = cl.name;
      snapshot.cityLedgerType = cl.type;
      snapshot.email = cl.contactEmail;
      snapshot.phone = cl.contactPhone;

      if (cl.billingAddress) {
        snapshot.address = {
          line1: cl.billingAddress.line1 || '',
          line2: cl.billingAddress.line2,
          city: cl.billingAddress.city || '',
          state: cl.billingAddress.state || '',
          postalCode: cl.billingAddress.postalCode || '',
          country: cl.billingAddress.country || '',
        };
      }
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
   * Generate statement for a profile
   * Returns null if no activity and zero balance (skip)
   */
  async generateForProfile(
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
        OR: [
          { memberId: profile.memberId },
          { cityLedgerId: profile.cityLedgerId },
        ],
        invoiceDate: {
          gte: period.periodStart,
          lte: period.cutoffDate,
        },
      },
      orderBy: { invoiceDate: 'asc' },
    });

    const payments = await this.prisma.payment.findMany({
      where: {
        clubId,
        memberId: profile.memberId,
        paymentDate: {
          gte: period.periodStart,
          lte: period.cutoffDate,
        },
      },
      orderBy: { paymentDate: 'asc' },
    });

    // Calculate opening balance (balance as of period start)
    const priorInvoices = await this.prisma.invoice.aggregate({
      where: {
        clubId,
        OR: [
          { memberId: profile.memberId },
          { cityLedgerId: profile.cityLedgerId },
        ],
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
    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate totals
    const totalDebits = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const totalCredits = payments.reduce((sum, pmt) => sum + Number(pmt.amount), 0);
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
   * Find statement by ID
   */
  async findById(id: string) {
    const statement = await this.prisma.statement.findUnique({
      where: { id },
      include: {
        arProfile: {
          include: {
            member: true,
            cityLedger: true,
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
  async findByRun(runId: string, filter?: { minBalance?: number }) {
    const where: any = { statementRunId: runId };

    if (filter?.minBalance !== undefined) {
      where.closingBalance = { gte: filter.minBalance };
    }

    return this.prisma.statement.findMany({
      where,
      include: {
        arProfile: {
          include: {
            member: {
              select: { firstName: true, lastName: true, memberNumber: true },
            },
            cityLedger: {
              select: { name: true, type: true },
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
      orderBy: { periodEnd: 'desc' },
    });
  }

  /**
   * Update delivery status
   */
  async updateDeliveryStatus(
    id: string,
    channel: 'email' | 'print' | 'portal' | 'sms',
    status: 'SENT' | 'DELIVERED' | 'FAILED',
    error?: string,
  ) {
    const data: any = {};

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
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/ar-statements/statement.service.ts
git commit -m "feat(api): add StatementService with generation and delivery tracking"
```

---

### Task 20: Create AR Statements Resolver

**Files:**
- Create: `apps/api/src/graphql/ar-statements/ar-statements.resolver.ts`

**Step 1: Create the resolver file**

```typescript
import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

import { ARProfileService } from './ar-profile.service';
import { StatementPeriodService } from './statement-period.service';
import { StatementRunService } from './statement-run.service';
import { StatementService } from './statement.service';

import { ARProfileType_ } from './ar-profile.types';
import { StatementPeriodType } from './statement-period.types';
import { StatementRunType_ } from './statement-run.types';
import { StatementType } from './statement.types';

import {
  CreateARProfileInput,
  UpdateARProfileInput,
  ARProfileFilterInput,
} from './ar-profile.input';
import { CreateStatementPeriodInput, ReopenStatementPeriodInput } from './statement-period.input';
import { StartStatementRunInput } from './statement-run.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class ARStatementsResolver {
  constructor(
    private arProfileService: ARProfileService,
    private statementPeriodService: StatementPeriodService,
    private statementRunService: StatementRunService,
    private statementService: StatementService,
  ) {}

  // ==================== AR PROFILES ====================

  @Query(() => [ARProfileType_], { name: 'arProfiles' })
  async getARProfiles(
    @GqlCurrentUser() user: JwtPayload,
    @Args('filter', { nullable: true }) filter?: ARProfileFilterInput,
  ) {
    return this.arProfileService.findAll(user.tenantId, filter);
  }

  @Query(() => ARProfileType_, { name: 'arProfile' })
  async getARProfile(@Args('id', { type: () => ID }) id: string) {
    return this.arProfileService.findById(id);
  }

  @Mutation(() => ARProfileType_)
  async createARProfile(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateARProfileInput,
  ) {
    if (input.profileType === 'MEMBER' && input.memberId) {
      return this.arProfileService.createForMember(
        user.tenantId,
        input.memberId,
        {
          statementDelivery: input.statementDelivery,
          paymentTermsDays: input.paymentTermsDays,
          creditLimit: input.creditLimit,
        },
        user.sub,
      );
    } else if (input.profileType === 'CITY_LEDGER' && input.cityLedgerId) {
      return this.arProfileService.createForCityLedger(
        user.tenantId,
        input.cityLedgerId,
        {
          statementDelivery: input.statementDelivery,
          paymentTermsDays: input.paymentTermsDays,
          creditLimit: input.creditLimit,
        },
        user.sub,
      );
    }
    throw new Error('Invalid profile type or missing required ID');
  }

  @Mutation(() => ARProfileType_)
  async updateARProfile(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateARProfileInput,
  ) {
    return this.arProfileService.update(id, input, user.sub);
  }

  @Mutation(() => ARProfileType_)
  async suspendARProfile(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('reason') reason: string,
  ) {
    return this.arProfileService.suspend(id, reason, user.sub);
  }

  @Mutation(() => ARProfileType_)
  async closeARProfile(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('reason') reason: string,
  ) {
    return this.arProfileService.close(id, reason, user.sub);
  }

  // ==================== STATEMENT PERIODS ====================

  @Query(() => [StatementPeriodType], { name: 'statementPeriods' })
  async getStatementPeriods(
    @GqlCurrentUser() user: JwtPayload,
    @Args('year', { type: () => Int, nullable: true }) year?: number,
  ) {
    return this.statementPeriodService.findAll(user.tenantId, year);
  }

  @Query(() => StatementPeriodType, { name: 'statementPeriod' })
  async getStatementPeriod(@Args('id', { type: () => ID }) id: string) {
    return this.statementPeriodService.findById(id);
  }

  @Query(() => StatementPeriodType, { name: 'currentStatementPeriod', nullable: true })
  async getCurrentStatementPeriod(@GqlCurrentUser() user: JwtPayload) {
    return this.statementPeriodService.getCurrentOpen(user.tenantId);
  }

  @Mutation(() => StatementPeriodType)
  async createStatementPeriod(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateStatementPeriodInput,
  ) {
    return this.statementPeriodService.create(user.tenantId, {
      ...input,
      periodStart: new Date(input.periodStart),
      periodEnd: new Date(input.periodEnd),
      cutoffDate: new Date(input.cutoffDate),
    });
  }

  @Mutation(() => StatementPeriodType)
  async reopenStatementPeriod(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: ReopenStatementPeriodInput,
    @Args('approvedBy', { type: () => ID }) approvedBy: string,
  ) {
    return this.statementPeriodService.reopen(id, input.reason, user.sub, approvedBy);
  }

  // ==================== STATEMENT RUNS ====================

  @Query(() => [StatementRunType_], { name: 'statementRuns' })
  async getStatementRuns(
    @Args('periodId', { type: () => ID }) periodId: string,
  ) {
    return this.statementRunService.findByPeriod(periodId);
  }

  @Query(() => StatementRunType_, { name: 'statementRun' })
  async getStatementRun(@Args('id', { type: () => ID }) id: string) {
    return this.statementRunService.findById(id);
  }

  @Mutation(() => StatementRunType_)
  async startStatementRun(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: StartStatementRunInput,
  ) {
    return this.statementRunService.start(
      user.tenantId,
      input.statementPeriodId,
      input.runType as any,
      user.sub,
    );
  }

  @Mutation(() => StatementRunType_)
  async cancelStatementRun(@Args('id', { type: () => ID }) id: string) {
    return this.statementRunService.cancel(id);
  }

  // ==================== STATEMENTS ====================

  @Query(() => [StatementType], { name: 'statements' })
  async getStatements(
    @Args('runId', { type: () => ID }) runId: string,
    @Args('minBalance', { type: () => Int, nullable: true }) minBalance?: number,
  ) {
    return this.statementService.findByRun(runId, { minBalance });
  }

  @Query(() => StatementType, { name: 'statement' })
  async getStatement(@Args('id', { type: () => ID }) id: string) {
    return this.statementService.findById(id);
  }

  @Query(() => [StatementType], { name: 'memberStatements' })
  async getMemberStatements(
    @Args('memberId', { type: () => ID }) memberId: string,
  ) {
    return this.statementService.findByMember(memberId);
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/ar-statements/ar-statements.resolver.ts
git commit -m "feat(api): add ARStatementsResolver with all queries and mutations"
```

---

### Task 21: Create AR Statements Module

**Files:**
- Create: `apps/api/src/graphql/ar-statements/ar-statements.module.ts`
- Create: `apps/api/src/graphql/ar-statements/index.ts`

**Step 1: Create the module file**

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';

import { ARStatementsResolver } from './ar-statements.resolver';
import { ARProfileService } from './ar-profile.service';
import { StatementPeriodService } from './statement-period.service';
import { StatementRunService } from './statement-run.service';
import { StatementService } from './statement.service';

@Module({
  imports: [PrismaModule],
  providers: [
    ARStatementsResolver,
    ARProfileService,
    StatementPeriodService,
    StatementRunService,
    StatementService,
  ],
  exports: [
    ARProfileService,
    StatementPeriodService,
    StatementRunService,
    StatementService,
  ],
})
export class ARStatementsModule {}
```

**Step 2: Create the index file**

```typescript
export * from './ar-statements.module';
export * from './ar-profile.service';
export * from './statement-period.service';
export * from './statement-run.service';
export * from './statement.service';
export * from './ar-profile.types';
export * from './statement-period.types';
export * from './statement-run.types';
export * from './statement.types';
```

**Step 3: Commit**

```bash
git add apps/api/src/graphql/ar-statements/
git commit -m "feat(api): add ARStatementsModule with exports"
```

---

### Task 22: Register Module in App

**Files:**
- Modify: `apps/api/src/app.module.ts`

**Step 1: Import and add ARStatementsModule**

Add import at top:
```typescript
import { ARStatementsModule } from './graphql/ar-statements';
```

Add to imports array:
```typescript
@Module({
  imports: [
    // ... existing imports
    ARStatementsModule,
  ],
})
```

**Step 2: Verify API starts**

Run: `cd apps/api && pnpm run dev`
Expected: Server starts without errors

**Step 3: Generate GraphQL schema**

Stop server after schema generates, then run:
```bash
pnpm --filter @clubvantage/api-client run codegen
```

**Step 4: Commit**

```bash
git add apps/api/src/app.module.ts
git commit -m "feat(api): register ARStatementsModule in app"
```

---

## Phase 3: Frontend Components

> **For Claude:** Use frontend-design skill for all Phase 3 tasks. Follow existing billing component patterns.

### Task 23: Create AR Statement Hooks

**Files:**
- Modify: `apps/application/src/hooks/use-billing.ts`

**Step 1: Add new hooks for AR statements**

Add after existing exports:

```typescript
// ==================== AR PROFILES ====================

export interface ARProfile {
  id: string;
  accountNumber: string;
  profileType: 'MEMBER' | 'CITY_LEDGER';
  memberId?: string;
  cityLedgerId?: string;
  statementDelivery: string;
  paymentTermsDays: number;
  creditLimit?: number;
  currentBalance: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  member?: {
    firstName: string;
    lastName: string;
    memberNumber: string;
  };
  cityLedger?: {
    name: string;
    type: string;
  };
}

export function useARProfiles(filter?: { profileType?: string; status?: string; search?: string }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['arProfiles', filter],
    queryFn: async () => {
      // Will be replaced with actual API call after codegen
      return [] as ARProfile[];
    },
  });

  return { profiles: data ?? [], isLoading, error, refetch };
}

// ==================== STATEMENT PERIODS ====================

export interface StatementPeriod {
  id: string;
  periodYear: number;
  periodNumber: number;
  periodLabel: string;
  periodStart: Date;
  periodEnd: Date;
  cutoffDate: Date;
  status: 'OPEN' | 'CLOSED' | 'REOPENED';
  closedAt?: Date;
  totalProfiles?: number;
  totalStatements?: number;
  totalClosingBalance?: number;
}

export function useStatementPeriods(year?: number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['statementPeriods', year],
    queryFn: async () => {
      return [] as StatementPeriod[];
    },
  });

  return { periods: data ?? [], isLoading, error, refetch };
}

// ==================== STATEMENT RUNS ====================

export interface StatementRun {
  id: string;
  runType: 'PREVIEW' | 'FINAL';
  runNumber: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  totalProfiles: number;
  processedCount: number;
  generatedCount: number;
  skippedCount: number;
  errorCount: number;
  totalClosingBalance: number;
  createdAt: Date;
  completedAt?: Date;
}

export function useStatementRuns(periodId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['statementRuns', periodId],
    queryFn: async () => {
      return [] as StatementRun[];
    },
    enabled: !!periodId,
  });

  return { runs: data ?? [], isLoading, error, refetch };
}
```

**Step 2: Commit**

```bash
git add apps/application/src/hooks/use-billing.ts
git commit -m "feat(app): add AR statement hooks scaffolding"
```

---

### Task 24: Create Statement Period Status Badge

**Files:**
- Create: `apps/application/src/components/billing/period-status-badge.tsx`

**Step 1: Create the badge component**

```tsx
'use client';

import { cn } from '@clubvantage/ui';
import { Lock, Unlock, RotateCcw } from 'lucide-react';

export type PeriodStatus = 'OPEN' | 'CLOSED' | 'REOPENED';

interface PeriodStatusBadgeProps {
  status: PeriodStatus;
  className?: string;
}

const statusConfig: Record<PeriodStatus, { label: string; bg: string; text: string; Icon: any }> = {
  OPEN: {
    label: 'Open',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    Icon: Unlock,
  },
  CLOSED: {
    label: 'Closed',
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    Icon: Lock,
  },
  REOPENED: {
    label: 'Reopened',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    Icon: RotateCcw,
  },
};

export function PeriodStatusBadge({ status, className }: PeriodStatusBadgeProps) {
  const config = statusConfig[status];
  const { Icon } = config;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/billing/period-status-badge.tsx
git commit -m "feat(app): add PeriodStatusBadge component"
```

---

### Task 25: Create Statement Run Status Badge

**Files:**
- Create: `apps/application/src/components/billing/run-status-badge.tsx`

**Step 1: Create the badge component**

```tsx
'use client';

import { cn } from '@clubvantage/ui';
import { Clock, Loader2, CheckCircle, XCircle, Ban } from 'lucide-react';

export type RunStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

interface RunStatusBadgeProps {
  status: RunStatus;
  className?: string;
}

const statusConfig: Record<RunStatus, { label: string; bg: string; text: string; Icon: any; animate?: boolean }> = {
  PENDING: {
    label: 'Pending',
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    Icon: Clock,
  },
  IN_PROGRESS: {
    label: 'Running',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    Icon: Loader2,
    animate: true,
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    Icon: CheckCircle,
  },
  FAILED: {
    label: 'Failed',
    bg: 'bg-red-100',
    text: 'text-red-700',
    Icon: XCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-stone-100',
    text: 'text-stone-500',
    Icon: Ban,
  },
};

export function RunStatusBadge({ status, className }: RunStatusBadgeProps) {
  const config = statusConfig[status];
  const { Icon } = config;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      <Icon className={cn('h-3 w-3', config.animate && 'animate-spin')} />
      {config.label}
    </span>
  );
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/billing/run-status-badge.tsx
git commit -m "feat(app): add RunStatusBadge component"
```

---

### Task 26: Create AR Profile Type Badge

**Files:**
- Create: `apps/application/src/components/billing/ar-profile-badge.tsx`

**Step 1: Create the badge component**

```tsx
'use client';

import { cn } from '@clubvantage/ui';
import { User, Building2 } from 'lucide-react';

export type ARProfileType = 'MEMBER' | 'CITY_LEDGER';

interface ARProfileBadgeProps {
  type: ARProfileType;
  className?: string;
}

const typeConfig: Record<ARProfileType, { label: string; bg: string; text: string; Icon: any }> = {
  MEMBER: {
    label: 'Member',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    Icon: User,
  },
  CITY_LEDGER: {
    label: 'City Ledger',
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    Icon: Building2,
  },
};

export function ARProfileBadge({ type, className }: ARProfileBadgeProps) {
  const config = typeConfig[type];
  const { Icon } = config;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/billing/ar-profile-badge.tsx
git commit -m "feat(app): add ARProfileBadge component"
```

---

_Continued in Part 3..._

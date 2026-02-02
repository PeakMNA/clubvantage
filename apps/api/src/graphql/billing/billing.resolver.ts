import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BillingService } from '@/modules/billing/billing.service';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
  InvoiceType,
  InvoiceConnection,
  PaymentType,
  BillingStatsType,
  MemberTransactionsType,
  MemberTransactionType,
  ChargeTypeType,
  ArAgingReportType,
  AgingBucketType,
  AgingMemberType,
  ReinstatedMemberType,
  CreditNoteGraphQLType,
  CreditNoteConnection,
  CreditNoteLineItemType,
  CreditNoteApplicationType,
  CreditNoteStatus,
} from './billing.types';
import {
  CreateInvoiceInput,
  CreatePaymentInput,
  InvoicesQueryArgs,
  VoidInvoiceInput,
  CreateCreditNoteInput,
  CreditNotesQueryArgs,
  ApplyCreditNoteInput,
  VoidCreditNoteInput,
} from './billing.input';
import { encodeCursor } from '../common/pagination';

@Resolver(() => InvoiceType)
@UseGuards(GqlAuthGuard)
export class BillingResolver {
  constructor(
    private readonly billingService: BillingService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => InvoiceConnection, { name: 'myInvoices', description: 'Get current member\'s invoices' })
  async getMyInvoices(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: InvoicesQueryArgs,
  ): Promise<InvoiceConnection> {
    // Find the current user's member ID
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { memberId: true },
    });

    if (!dbUser?.memberId) {
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };
    }

    const { first, after, skip, startDate, endDate, ...queryParams } = args;
    const page = skip ? Math.floor(skip / (first || 20)) + 1 : 1;
    const limit = first || 20;

    const result = await this.billingService.findAllInvoices(user.tenantId, {
      ...queryParams,
      memberId: dbUser.memberId,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      page,
      limit,
    });

    const edges = result.data.map((invoice: any) => ({
      node: this.transformInvoice(invoice),
      cursor: encodeCursor(invoice.id),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: page < result.meta.totalPages,
        hasPreviousPage: page > 1,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
      totalCount: result.meta.total,
    };
  }

  @Query(() => InvoiceConnection, { name: 'invoices', description: 'Get paginated list of invoices' })
  async getInvoices(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: InvoicesQueryArgs,
  ): Promise<InvoiceConnection> {
    const { first, after, skip, startDate, endDate, ...queryParams } = args;

    const page = skip ? Math.floor(skip / (first || 20)) + 1 : 1;
    const limit = first || 20;

    const result = await this.billingService.findAllInvoices(user.tenantId, {
      ...queryParams,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      page,
      limit,
    });

    const edges = result.data.map((invoice: any) => ({
      node: this.transformInvoice(invoice),
      cursor: encodeCursor(invoice.id),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: page < result.meta.totalPages,
        hasPreviousPage: page > 1,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
      totalCount: result.meta.total,
    };
  }

  @Query(() => InvoiceType, { name: 'invoice', description: 'Get a single invoice by ID' })
  async getInvoice(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<InvoiceType> {
    const invoice = await this.billingService.findInvoice(user.tenantId, id);
    return this.transformInvoice(invoice);
  }

  @Query(() => BillingStatsType, { name: 'billingStats', description: 'Get billing statistics for the current month' })
  async getBillingStats(@GqlCurrentUser() user: JwtPayload): Promise<BillingStatsType> {
    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Aggregate payments for current month (revenue)
    const paymentsAggregate = await this.prisma.payment.aggregate({
      where: {
        clubId: user.tenantId,
        paymentDate: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    // Get outstanding balance (all unpaid invoices)
    const outstandingInvoices = await this.prisma.invoice.aggregate({
      where: {
        clubId: user.tenantId,
        status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
      },
      _sum: { balanceDue: true },
      _count: true,
    });

    // Get overdue invoices
    const overdueInvoices = await this.prisma.invoice.aggregate({
      where: {
        clubId: user.tenantId,
        status: 'OVERDUE',
      },
      _sum: { balanceDue: true },
      _count: true,
    });

    // Get invoice counts for the month
    const [invoiceCount, paidCount] = await Promise.all([
      this.prisma.invoice.count({
        where: {
          clubId: user.tenantId,
          invoiceDate: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      this.prisma.invoice.count({
        where: {
          clubId: user.tenantId,
          status: 'PAID',
          paidDate: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
    ]);

    return {
      totalRevenue: (paymentsAggregate._sum.amount?.toNumber() || 0).toString(),
      outstandingBalance: (outstandingInvoices._sum.balanceDue?.toNumber() || 0).toString(),
      overdueAmount: (overdueInvoices._sum.balanceDue?.toNumber() || 0).toString(),
      invoiceCount,
      paidCount,
      overdueCount: overdueInvoices._count || 0,
    };
  }

  @Query(() => [ChargeTypeType], { name: 'chargeTypes', description: 'Get available charge types' })
  async getChargeTypes(@GqlCurrentUser() user: JwtPayload): Promise<ChargeTypeType[]> {
    const chargeTypes = await this.prisma.chargeType.findMany({
      where: { clubId: user.tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });

    return chargeTypes.map((ct) => ({
      id: ct.id,
      name: ct.name,
      code: ct.code,
      description: ct.description ?? undefined,
      defaultPrice: ct.defaultPrice?.toString() ?? undefined,
      taxable: ct.taxable,
      category: ct.category ?? undefined,
    }));
  }

  @Query(() => ArAgingReportType, { name: 'arAgingReport', description: 'Get AR aging report with buckets and member details' })
  async getArAgingReport(
    @GqlCurrentUser() user: JwtPayload,
    @Args('filter', { nullable: true }) filter?: string,
    @Args('page', { nullable: true, defaultValue: 1 }) page?: number,
    @Args('limit', { nullable: true, defaultValue: 20 }) limit?: number,
  ): Promise<ArAgingReportType> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Get all outstanding invoices with member data
    const outstandingInvoices = await this.prisma.invoice.findMany({
      where: {
        clubId: user.tenantId,
        balanceDue: { gt: 0 },
        deletedAt: null,
      },
      include: {
        member: {
          include: {
            membershipType: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    // Calculate aging bucket for each invoice
    const getAgingStatus = (dueDate: Date): string => {
      const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays < 0) return 'current';
      if (diffDays < 30) return 'current';
      if (diffDays < 60) return '30';
      if (diffDays < 90) return '60';
      return '90';
    };

    // Group by member and calculate totals
    const memberAging = new Map<string, {
      member: any;
      balance: number;
      oldestDueDate: Date;
      worstStatus: string;
    }>();

    for (const invoice of outstandingInvoices) {
      const existing = memberAging.get(invoice.memberId);
      const balance = invoice.balanceDue.toNumber();
      const agingStatus = getAgingStatus(invoice.dueDate);

      if (existing) {
        existing.balance += balance;
        if (invoice.dueDate < existing.oldestDueDate) {
          existing.oldestDueDate = invoice.dueDate;
        }
        // Determine worst status
        const statusOrder = ['current', '30', '60', '90', 'suspended'];
        const memberStatus = invoice.member.status === 'SUSPENDED' ? 'suspended' : agingStatus;
        if (statusOrder.indexOf(memberStatus) > statusOrder.indexOf(existing.worstStatus)) {
          existing.worstStatus = memberStatus;
        }
      } else {
        const memberStatus = invoice.member.status === 'SUSPENDED' ? 'suspended' : agingStatus;
        memberAging.set(invoice.memberId, {
          member: invoice.member,
          balance,
          oldestDueDate: invoice.dueDate,
          worstStatus: memberStatus,
        });
      }
    }

    // Calculate buckets
    const bucketTotals = {
      current: { amount: 0, count: 0 },
      '30': { amount: 0, count: 0 },
      '60': { amount: 0, count: 0 },
      '90': { amount: 0, count: 0 },
      suspended: { amount: 0, count: 0 },
    };

    const membersArray = Array.from(memberAging.values());
    let totalAmount = 0;

    for (const memberData of membersArray) {
      const status = memberData.worstStatus as keyof typeof bucketTotals;
      if (bucketTotals[status]) {
        bucketTotals[status].amount += memberData.balance;
        bucketTotals[status].count += 1;
      }
      totalAmount += memberData.balance;
    }

    // Build bucket response
    const buckets: AgingBucketType[] = [
      {
        id: 'current',
        label: 'Current',
        memberCount: bucketTotals.current.count,
        totalAmount: bucketTotals.current.amount.toString(),
        percentage: totalAmount > 0 ? (bucketTotals.current.amount / totalAmount) * 100 : 0,
      },
      {
        id: '30',
        label: '1-30 Days',
        memberCount: bucketTotals['30'].count,
        totalAmount: bucketTotals['30'].amount.toString(),
        percentage: totalAmount > 0 ? (bucketTotals['30'].amount / totalAmount) * 100 : 0,
      },
      {
        id: '60',
        label: '31-60 Days',
        memberCount: bucketTotals['60'].count,
        totalAmount: bucketTotals['60'].amount.toString(),
        percentage: totalAmount > 0 ? (bucketTotals['60'].amount / totalAmount) * 100 : 0,
      },
      {
        id: '90',
        label: '61-90 Days',
        memberCount: bucketTotals['90'].count,
        totalAmount: bucketTotals['90'].amount.toString(),
        percentage: totalAmount > 0 ? (bucketTotals['90'].amount / totalAmount) * 100 : 0,
      },
      {
        id: 'suspended',
        label: 'Suspended',
        memberCount: bucketTotals.suspended.count,
        totalAmount: bucketTotals.suspended.amount.toString(),
        percentage: totalAmount > 0 ? (bucketTotals.suspended.amount / totalAmount) * 100 : 0,
      },
    ];

    // Filter members based on filter parameter
    let filteredMembers = membersArray;
    if (filter && filter !== 'all') {
      if (filter === '30+') {
        filteredMembers = membersArray.filter((m) => ['30', '60', '90', 'suspended'].includes(m.worstStatus));
      } else if (filter === '60+') {
        filteredMembers = membersArray.filter((m) => ['60', '90', 'suspended'].includes(m.worstStatus));
      } else if (filter === '90+') {
        filteredMembers = membersArray.filter((m) => ['90', 'suspended'].includes(m.worstStatus));
      } else if (filter === 'suspended') {
        filteredMembers = membersArray.filter((m) => m.worstStatus === 'suspended');
      }
    }

    // Sort by balance (highest first)
    filteredMembers.sort((a, b) => b.balance - a.balance);

    // Paginate
    const totalCount = filteredMembers.length;
    const skip = ((page || 1) - 1) * (limit || 20);
    const paginatedMembers = filteredMembers.slice(skip, skip + (limit || 20));

    // Build member response
    const members: AgingMemberType[] = paginatedMembers.map((m) => ({
      id: m.member.id,
      name: `${m.member.firstName} ${m.member.lastName}`,
      photoUrl: m.member.photoUrl ?? undefined,
      memberNumber: m.member.memberId,
      membershipType: m.member.membershipType?.name || 'Unknown',
      oldestInvoiceDate: m.oldestDueDate,
      balance: m.balance.toString(),
      daysOutstanding: Math.max(0, Math.floor((now.getTime() - m.oldestDueDate.getTime()) / (24 * 60 * 60 * 1000))),
      status: m.worstStatus,
    }));

    // Get recently reinstated members (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    // For now, return empty array - would need to track reinstatement events
    const reinstatedMembers: ReinstatedMemberType[] = [];

    return {
      buckets,
      members,
      reinstatedMembers,
      totalCount,
    };
  }

  @Query(() => MemberTransactionsType, { name: 'memberTransactions', description: 'Get transaction history for a member' })
  async getMemberTransactions(
    @GqlCurrentUser() user: JwtPayload,
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<MemberTransactionsType> {
    // Verify member belongs to this tenant
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, clubId: user.tenantId },
    });
    if (!member) {
      throw new Error('Member not found');
    }

    // Get all invoices for this member
    const invoices = await this.prisma.invoice.findMany({
      where: { memberId, deletedAt: null },
      orderBy: { invoiceDate: 'asc' },
    });

    // Get all payments for this member
    const payments = await this.prisma.payment.findMany({
      where: { memberId },
      orderBy: { paymentDate: 'asc' },
    });

    // Combine and sort by date
    const transactions: MemberTransactionType[] = [];

    // Add invoices as transactions
    for (const invoice of invoices) {
      transactions.push({
        id: invoice.id,
        date: invoice.invoiceDate,
        type: 'INVOICE',
        description: invoice.billingPeriod || `Invoice ${invoice.invoiceNumber}`,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.totalAmount.toNumber().toString(),
        runningBalance: '0', // Will calculate below
      });
    }

    // Add payments as transactions (negative amounts)
    for (const payment of payments) {
      transactions.push({
        id: payment.id,
        date: payment.paymentDate,
        type: 'PAYMENT',
        description: `Payment - ${payment.receiptNumber}`,
        invoiceNumber: undefined,
        amount: (-payment.amount.toNumber()).toString(),
        runningBalance: '0', // Will calculate below
      });
    }

    // Sort all transactions by date
    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let runningBalance = 0;
    for (const tx of transactions) {
      runningBalance += parseFloat(tx.amount);
      tx.runningBalance = runningBalance.toFixed(2);
    }

    return {
      transactions,
      currentBalance: runningBalance.toFixed(2),
    };
  }

  @Mutation(() => InvoiceType, { name: 'createInvoice', description: 'Create a new invoice' })
  async createInvoice(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateInvoiceInput,
  ): Promise<InvoiceType> {
    const invoice = await this.billingService.createInvoice(
      user.tenantId,
      {
        ...input,
        invoiceDate: input.invoiceDate.toISOString(),
        dueDate: input.dueDate.toISOString(),
        lineItems: input.lineItems.map((li) => ({
          ...li,
          description: li.description || '',
        })),
      },
      user.sub,
      user.email,
    );
    return this.transformInvoice(invoice);
  }

  @Mutation(() => InvoiceType, { name: 'sendInvoice', description: 'Send an invoice' })
  async sendInvoice(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<InvoiceType> {
    const invoice = await this.billingService.sendInvoice(
      user.tenantId,
      id,
      user.sub,
      user.email,
    );
    return this.transformInvoice(invoice);
  }

  @Mutation(() => InvoiceType, { name: 'voidInvoice', description: 'Void an invoice' })
  async voidInvoice(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: VoidInvoiceInput,
  ): Promise<InvoiceType> {
    const invoice = await this.billingService.voidInvoice(
      user.tenantId,
      id,
      input.reason,
      user.sub,
      user.email,
    );
    return this.transformInvoice(invoice);
  }

  @Mutation(() => PaymentType, { name: 'recordPayment', description: 'Record a payment' })
  async recordPayment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreatePaymentInput,
  ): Promise<PaymentType> {
    const payment = await this.billingService.createPayment(
      user.tenantId,
      {
        ...input,
        paymentDate: input.paymentDate?.toISOString(),
      },
      user.sub,
      user.email,
    );
    return this.transformPayment(payment);
  }

  private transformInvoice(invoice: any): InvoiceType {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      billingPeriod: invoice.billingPeriod,
      subtotal: invoice.subtotal?.toString() || '0',
      taxAmount: invoice.taxAmount?.toString() || '0',
      discountAmount: invoice.discountAmount?.toString() || '0',
      totalAmount: invoice.totalAmount?.toString() || '0',
      paidAmount: invoice.paidAmount?.toString() || '0',
      balanceDue: invoice.balanceDue?.toString() || '0',
      status: invoice.status,
      notes: invoice.notes,
      internalNotes: invoice.internalNotes,
      sentAt: invoice.sentAt,
      viewedAt: invoice.viewedAt,
      paidDate: invoice.paidDate,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      member: invoice.member ? {
        id: invoice.member.id,
        memberId: invoice.member.memberId,
        firstName: invoice.member.firstName,
        lastName: invoice.member.lastName,
      } : undefined,
      lineItems: invoice.lineItems?.map((li: any) => ({
        id: li.id,
        description: li.description,
        quantity: li.quantity,
        unitPrice: li.unitPrice?.toString() || '0',
        discountPct: li.discountPct?.toString() || '0',
        taxType: li.taxType,
        taxRate: li.taxRate?.toString() || '0',
        lineTotal: li.lineTotal?.toString() || '0',
        chargeType: li.chargeType,
      })) || [],
      payments: invoice.payments?.map((pa: any) => ({
        id: pa.id,
        amount: pa.amount?.toString() || '0',
        payment: {
          id: pa.payment.id,
          receiptNumber: pa.payment.receiptNumber,
          amount: pa.payment.amount?.toString() || '0',
          method: pa.payment.method,
          paymentDate: pa.payment.paymentDate,
        },
      })) || [],
    };
  }

  private transformPayment(payment: any): PaymentType {
    return {
      id: payment.id,
      receiptNumber: payment.receiptNumber,
      amount: payment.amount?.toString() || '0',
      method: payment.method,
      paymentDate: payment.paymentDate,
      referenceNumber: payment.referenceNumber,
      bankName: payment.bankName,
      accountLast4: payment.accountLast4,
      notes: payment.notes,
      createdAt: payment.createdAt,
      member: payment.member ? {
        id: payment.member.id,
        memberId: payment.member.memberId,
        firstName: payment.member.firstName,
        lastName: payment.member.lastName,
      } : undefined,
    };
  }

  // Credit Note Queries
  @Query(() => CreditNoteConnection, { name: 'creditNotes', description: 'Get paginated list of credit notes' })
  async getCreditNotes(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: CreditNotesQueryArgs,
  ): Promise<CreditNoteConnection> {
    const { first, skip, memberId, status, startDate, endDate } = args;
    const page = skip ? Math.floor(skip / (first || 20)) + 1 : 1;
    const limit = first || 20;

    const where: any = {
      clubId: user.tenantId,
    };

    if (memberId) {
      where.memberId = memberId;
    }
    if (status) {
      where.status = status;
    }
    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) where.issueDate.gte = startDate;
      if (endDate) where.issueDate.lte = endDate;
    }

    const [creditNotes, totalCount] = await Promise.all([
      this.prisma.creditNote.findMany({
        where,
        include: {
          member: true,
          lineItems: {
            include: { chargeType: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.creditNote.count({ where }),
    ]);

    const edges = creditNotes.map((cn) => ({
      node: this.transformCreditNote(cn),
      cursor: encodeCursor(cn.id),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return {
      edges,
      pageInfo: {
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
      totalCount,
    };
  }

  @Query(() => CreditNoteGraphQLType, { name: 'creditNote', description: 'Get a single credit note by ID' })
  async getCreditNote(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CreditNoteGraphQLType> {
    const creditNote = await this.prisma.creditNote.findFirst({
      where: { id, clubId: user.tenantId },
      include: {
        member: true,
        lineItems: {
          include: { chargeType: true },
        },
        applications: {
          include: {
            invoice: true,
          },
        },
      },
    });

    if (!creditNote) {
      throw new Error('Credit note not found');
    }

    return this.transformCreditNote(creditNote);
  }

  // Credit Note Mutations
  @Mutation(() => CreditNoteGraphQLType, { name: 'createCreditNote', description: 'Create a new credit note' })
  async createCreditNote(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateCreditNoteInput,
  ): Promise<CreditNoteGraphQLType> {
    // Generate credit note number
    const year = new Date().getFullYear();
    const prefix = `CN-${year}-`;

    const lastCreditNote = await this.prisma.creditNote.findFirst({
      where: {
        clubId: user.tenantId,
        creditNoteNumber: { startsWith: prefix },
      },
      orderBy: { creditNoteNumber: 'desc' },
    });

    let nextNumber = 1;
    if (lastCreditNote) {
      const lastNumber = parseInt(lastCreditNote.creditNoteNumber.split('-').pop() || '0', 10);
      nextNumber = lastNumber + 1;
    }
    const creditNoteNumber = `${prefix}${nextNumber.toString().padStart(6, '0')}`;

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;
    const lineItemsData = input.lineItems.map((item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const lineTax = item.taxable ? lineTotal * ((item.taxRate || 0) / 100) : 0;
      subtotal += lineTotal;
      taxAmount += lineTax;

      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal,
        taxable: item.taxable || false,
        taxRate: item.taxRate || 0,
        taxAmount: lineTax,
        chargeTypeId: item.chargeTypeId,
      };
    });

    const totalAmount = subtotal + taxAmount;

    const creditNote = await this.prisma.creditNote.create({
      data: {
        clubId: user.tenantId,
        memberId: input.memberId,
        creditNoteNumber,
        type: input.type,
        reason: input.reason,
        reasonDetail: input.reasonDetail,
        sourceInvoiceId: input.sourceInvoiceId,
        subtotal,
        taxAmount,
        totalAmount,
        status: 'PENDING_APPROVAL',
        internalNotes: input.internalNotes,
        memberVisibleNotes: input.memberVisibleNotes,
        createdBy: user.sub,
        lineItems: {
          create: lineItemsData,
        },
      },
      include: {
        member: true,
        lineItems: {
          include: { chargeType: true },
        },
      },
    });

    return this.transformCreditNote(creditNote);
  }

  @Mutation(() => CreditNoteGraphQLType, { name: 'approveCreditNote', description: 'Approve a credit note' })
  async approveCreditNote(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CreditNoteGraphQLType> {
    const creditNote = await this.prisma.creditNote.findFirst({
      where: { id, clubId: user.tenantId },
    });

    if (!creditNote) {
      throw new Error('Credit note not found');
    }

    if (creditNote.status !== 'PENDING_APPROVAL') {
      throw new Error('Credit note is not pending approval');
    }

    const updated = await this.prisma.creditNote.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: user.sub,
        approvedAt: new Date(),
      },
      include: {
        member: true,
        lineItems: {
          include: { chargeType: true },
        },
      },
    });

    return this.transformCreditNote(updated);
  }

  @Mutation(() => CreditNoteGraphQLType, { name: 'applyCreditNoteToBalance', description: 'Apply credit note to member balance' })
  async applyCreditNoteToBalance(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CreditNoteGraphQLType> {
    const creditNote = await this.prisma.creditNote.findFirst({
      where: { id, clubId: user.tenantId },
    });

    if (!creditNote) {
      throw new Error('Credit note not found');
    }

    if (creditNote.status !== 'APPROVED') {
      throw new Error('Credit note must be approved before applying');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // Update member credit balance
      await tx.member.update({
        where: { id: creditNote.memberId },
        data: {
          creditBalance: {
            increment: creditNote.totalAmount,
          },
        },
      });

      // Update credit note status
      return tx.creditNote.update({
        where: { id },
        data: {
          status: 'APPLIED',
          appliedToBalance: creditNote.totalAmount,
        },
        include: {
          member: true,
          lineItems: {
            include: { chargeType: true },
          },
        },
      });
    });

    return this.transformCreditNote(updated);
  }

  @Mutation(() => CreditNoteGraphQLType, { name: 'applyCreditNoteToInvoice', description: 'Apply credit note to a specific invoice' })
  async applyCreditNoteToInvoice(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: ApplyCreditNoteInput,
  ): Promise<CreditNoteGraphQLType> {
    const creditNote = await this.prisma.creditNote.findFirst({
      where: { id, clubId: user.tenantId },
    });

    if (!creditNote) {
      throw new Error('Credit note not found');
    }

    if (creditNote.status !== 'APPROVED') {
      throw new Error('Credit note must be approved before applying');
    }

    const remainingAmount = creditNote.totalAmount.toNumber() - creditNote.appliedToBalance.toNumber() - creditNote.refundedAmount.toNumber();
    if (input.amount > remainingAmount) {
      throw new Error('Application amount exceeds remaining credit');
    }

    const invoice = await this.prisma.invoice.findFirst({
      where: { id: input.invoiceId, clubId: user.tenantId },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.balanceDue.toNumber() < input.amount) {
      throw new Error('Application amount exceeds invoice balance');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // Create application record
      await tx.creditNoteApplication.create({
        data: {
          creditNoteId: id,
          invoiceId: input.invoiceId,
          amountApplied: input.amount,
          appliedBy: user.sub,
        },
      });

      // Update invoice balance
      const newInvoiceBalance = invoice.balanceDue.toNumber() - input.amount;
      const newInvoicePaid = (invoice.paidAmount?.toNumber() || 0) + input.amount;

      await tx.invoice.update({
        where: { id: input.invoiceId },
        data: {
          balanceDue: newInvoiceBalance,
          paidAmount: newInvoicePaid,
          status: newInvoiceBalance <= 0 ? 'PAID' : newInvoicePaid > 0 ? 'PARTIALLY_PAID' : invoice.status,
          paidDate: newInvoiceBalance <= 0 ? new Date() : undefined,
        },
      });

      // Update credit note applied amount
      const newApplied = creditNote.appliedToBalance.toNumber() + input.amount;
      const newStatus = newApplied >= creditNote.totalAmount.toNumber() ? 'APPLIED' : 'PARTIALLY_APPLIED';

      return tx.creditNote.update({
        where: { id },
        data: {
          appliedToBalance: newApplied,
          status: newStatus,
        },
        include: {
          member: true,
          lineItems: {
            include: { chargeType: true },
          },
          applications: {
            include: { invoice: true },
          },
        },
      });
    });

    return this.transformCreditNote(updated);
  }

  @Mutation(() => CreditNoteGraphQLType, { name: 'voidCreditNote', description: 'Void a credit note' })
  async voidCreditNote(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: VoidCreditNoteInput,
  ): Promise<CreditNoteGraphQLType> {
    const creditNote = await this.prisma.creditNote.findFirst({
      where: { id, clubId: user.tenantId },
    });

    if (!creditNote) {
      throw new Error('Credit note not found');
    }

    if (creditNote.status === 'APPLIED' || creditNote.status === 'PARTIALLY_APPLIED' || creditNote.status === 'REFUNDED') {
      throw new Error('Cannot void a credit note that has been applied or refunded');
    }

    const updated = await this.prisma.creditNote.update({
      where: { id },
      data: {
        status: 'VOIDED',
        voidedAt: new Date(),
        voidedBy: user.sub,
        internalNotes: creditNote.internalNotes
          ? `${creditNote.internalNotes}\n\nVoided: ${input.reason}`
          : `Voided: ${input.reason}`,
      },
      include: {
        member: true,
        lineItems: {
          include: { chargeType: true },
        },
      },
    });

    return this.transformCreditNote(updated);
  }

  private transformCreditNote(creditNote: any): CreditNoteGraphQLType {
    return {
      id: creditNote.id,
      creditNoteNumber: creditNote.creditNoteNumber,
      issueDate: creditNote.issueDate,
      type: creditNote.type,
      reason: creditNote.reason,
      reasonDetail: creditNote.reasonDetail,
      subtotal: creditNote.subtotal?.toString() || '0',
      taxAmount: creditNote.taxAmount?.toString() || '0',
      totalAmount: creditNote.totalAmount?.toString() || '0',
      appliedToBalance: creditNote.appliedToBalance?.toString() || '0',
      refundedAmount: creditNote.refundedAmount?.toString() || '0',
      status: creditNote.status,
      internalNotes: creditNote.internalNotes,
      memberVisibleNotes: creditNote.memberVisibleNotes,
      approvedAt: creditNote.approvedAt,
      voidedAt: creditNote.voidedAt,
      createdAt: creditNote.createdAt,
      updatedAt: creditNote.updatedAt,
      member: creditNote.member ? {
        id: creditNote.member.id,
        memberId: creditNote.member.memberId,
        firstName: creditNote.member.firstName,
        lastName: creditNote.member.lastName,
      } : undefined,
      lineItems: creditNote.lineItems?.map((li: any) => ({
        id: li.id,
        description: li.description,
        quantity: li.quantity?.toNumber?.() || li.quantity || 0,
        unitPrice: li.unitPrice?.toString() || '0',
        lineTotal: li.lineTotal?.toString() || '0',
        taxable: li.taxable,
        taxRate: li.taxRate?.toString() || '0',
        taxAmount: li.taxAmount?.toString() || '0',
        chargeType: li.chargeType,
      })) || [],
      applications: creditNote.applications?.map((app: any) => ({
        id: app.id,
        amountApplied: app.amountApplied?.toString() || '0',
        appliedAt: app.appliedAt,
        invoice: app.invoice ? this.transformInvoice(app.invoice) : undefined,
      })) || [],
    };
  }
}

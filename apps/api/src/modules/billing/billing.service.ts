import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { EventStoreService } from '@/shared/events/event-store.service';
import {
  CreateInvoiceDto,
  CreatePaymentDto,
  InvoiceQueryDto,
} from './dto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private prisma: PrismaService,
    private eventStore: EventStoreService,
  ) {}

  // ==================== INVOICES ====================

  async createInvoice(
    tenantId: string,
    dto: CreateInvoiceDto,
    userId: string,
    userEmail: string,
  ) {
    // Generate invoice number
    const year = new Date().getFullYear();
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: {
        clubId: tenantId,
        invoiceNumber: { startsWith: `INV-${year}` },
      },
      orderBy: { invoiceNumber: 'desc' },
    });

    const nextNumber = lastInvoice
      ? parseInt(lastInvoice.invoiceNumber.split('-')[2], 10) + 1
      : 1;
    const invoiceNumber = `INV-${year}-${nextNumber.toString().padStart(5, '0')}`;

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    const lineItemsData = dto.lineItems.map((item, index) => {
      const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPct || 0) / 100);
      const lineTax = lineTotal * ((item.taxRate || 0) / 100);
      subtotal += lineTotal;
      taxAmount += lineTax;

      return {
        chargeTypeId: item.chargeTypeId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPct: item.discountPct || 0,
        taxType: item.taxType,
        taxRate: item.taxRate || 0,
        lineTotal,
        sortOrder: index,
      };
    });

    const totalAmount = subtotal + taxAmount;

    // Apply discount if provided
    let discountAmount = 0;
    let discountRecord: any = null;
    if ((dto as any).discountId) {
      discountRecord = await this.prisma.discount.findFirst({
        where: {
          id: (dto as any).discountId,
          clubId: tenantId,
          isActive: true,
        },
      });
      if (discountRecord) {
        if (discountRecord.type === 'PERCENTAGE') {
          discountAmount = totalAmount * (discountRecord.value.toNumber() / 100);
        } else {
          discountAmount = Math.min(discountRecord.value.toNumber(), totalAmount);
        }
      }
    }

    const finalTotal = totalAmount - discountAmount;

    const invoice = await this.prisma.invoice.create({
      data: {
        clubId: tenantId,
        invoiceNumber,
        memberId: dto.memberId,
        invoiceDate: new Date(dto.invoiceDate),
        dueDate: new Date(dto.dueDate),
        billingPeriod: dto.billingPeriod,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount: finalTotal,
        balanceDue: finalTotal,
        status: 'DRAFT',
        notes: dto.notes,
        internalNotes: dto.internalNotes,
        lineItems: {
          create: lineItemsData,
        },
      },
      include: {
        lineItems: true,
        member: {
          select: { id: true, memberId: true, firstName: true, lastName: true },
        },
      },
    });

    // Create applied discount record and increment usage count
    if (discountRecord && discountAmount > 0) {
      await this.prisma.discount.update({
        where: { id: discountRecord.id },
        data: { usageCount: { increment: 1 } },
      });
    }

    // Log event
    await this.eventStore.append({
      tenantId,
      aggregateType: 'Invoice',
      aggregateId: invoice.id,
      type: 'CREATED',
      data: { invoiceNumber, totalAmount: finalTotal, discountAmount },
      userId,
      userEmail,
    });

    return invoice;
  }

  async findAllInvoices(tenantId: string, query: InvoiceQueryDto) {
    const { search, status, memberId, startDate, endDate, page, limit, sortBy, sortOrder } =
      query;

    const where: any = {
      clubId: tenantId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { member: { firstName: { contains: search, mode: 'insensitive' } } },
        { member: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (memberId) {
      where.memberId = memberId;
    }

    if (startDate) {
      where.invoiceDate = { gte: new Date(startDate) };
    }

    if (endDate) {
      where.invoiceDate = {
        ...where.invoiceDate,
        lte: new Date(endDate),
      };
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'desc';
    }

    const skip = ((page || 1) - 1) * (limit || 20);
    const take = limit || 20;

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          member: {
            select: { id: true, memberId: true, firstName: true, lastName: true },
          },
          lineItems: true,
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      meta: {
        total,
        page: page || 1,
        limit: limit || 20,
        totalPages: Math.ceil(total / (limit || 20)),
      },
    };
  }

  async findInvoice(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id,
        clubId: tenantId,
        deletedAt: null,
      },
      include: {
        member: true,
        lineItems: {
          include: { chargeType: true },
          orderBy: { sortOrder: 'asc' },
        },
        payments: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async sendInvoice(
    tenantId: string,
    id: string,
    userId: string,
    userEmail: string,
  ) {
    const invoice = await this.findInvoice(tenantId, id);

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException('Only draft invoices can be sent');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    // TODO: Actually send email via Resend

    await this.eventStore.append({
      tenantId,
      aggregateType: 'Invoice',
      aggregateId: id,
      type: 'SENT',
      data: { invoiceNumber: invoice.invoiceNumber },
      userId,
      userEmail,
    });

    return updated;
  }

  async voidInvoice(
    tenantId: string,
    id: string,
    reason: string,
    userId: string,
    userEmail: string,
  ) {
    const invoice = await this.findInvoice(tenantId, id);

    if (invoice.paidAmount.toNumber() > 0) {
      throw new BadRequestException('Cannot void an invoice with payments');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'VOID',
        internalNotes: `${invoice.internalNotes || ''}\n[VOIDED] ${reason}`,
      },
    });

    await this.eventStore.append({
      tenantId,
      aggregateType: 'Invoice',
      aggregateId: id,
      type: 'VOIDED',
      data: { reason },
      userId,
      userEmail,
    });

    return updated;
  }

  // ==================== PAYMENTS ====================

  async createPayment(
    tenantId: string,
    dto: CreatePaymentDto,
    userId: string,
    userEmail: string,
  ) {
    // Generate receipt number
    const year = new Date().getFullYear();
    const lastPayment = await this.prisma.payment.findFirst({
      where: {
        clubId: tenantId,
        receiptNumber: { startsWith: `RCP-${year}` },
      },
      orderBy: { receiptNumber: 'desc' },
    });

    const nextNumber = lastPayment
      ? parseInt(lastPayment.receiptNumber.split('-')[2], 10) + 1
      : 1;
    const receiptNumber = `RCP-${year}-${nextNumber.toString().padStart(5, '0')}`;

    // Create payment with allocations in transaction
    const payment = await this.prisma.$transaction(async (tx: any) => {
      const newPayment = await tx.payment.create({
        data: {
          clubId: tenantId,
          receiptNumber,
          memberId: dto.memberId,
          amount: dto.amount,
          method: dto.method,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
          referenceNumber: dto.referenceNumber,
          bankName: dto.bankName,
          accountLast4: dto.accountLast4,
          notes: dto.notes,
        },
      });

      // Process allocations using atomic operations to prevent race conditions
      if (dto.allocations && dto.allocations.length > 0) {
        let totalAllocated = 0;

        for (const allocation of dto.allocations) {
          // First verify the invoice exists and check balance
          const invoice = await tx.invoice.findFirst({
            where: {
              id: allocation.invoiceId,
              clubId: tenantId,
              deletedAt: null,
            },
          });

          if (!invoice) {
            throw new BadRequestException(
              `Invoice ${allocation.invoiceId} not found`,
            );
          }

          if (allocation.amount > invoice.balanceDue.toNumber()) {
            throw new BadRequestException(
              `Allocation amount exceeds balance due for invoice ${invoice.invoiceNumber}`,
            );
          }

          await tx.paymentAllocation.create({
            data: {
              paymentId: newPayment.id,
              invoiceId: allocation.invoiceId,
              amount: allocation.amount,
            },
          });

          // Use atomic increment/decrement to prevent race conditions
          // This ensures concurrent payments to the same invoice calculate correctly
          const updatedInvoice = await tx.invoice.update({
            where: { id: allocation.invoiceId },
            data: {
              paidAmount: { increment: allocation.amount },
              balanceDue: { decrement: allocation.amount },
            },
          });

          // Determine status based on updated values
          const newBalanceDue = updatedInvoice.balanceDue.toNumber();
          const newPaidAmount = updatedInvoice.paidAmount.toNumber();
          const newStatus =
            newBalanceDue <= 0
              ? 'PAID'
              : newPaidAmount > 0
              ? 'PARTIALLY_PAID'
              : updatedInvoice.status;

          // Update status in a separate call (status logic requires the updated values)
          await tx.invoice.update({
            where: { id: allocation.invoiceId },
            data: {
              status: newStatus,
              paidDate: newBalanceDue <= 0 ? new Date() : null,
            },
          });

          totalAllocated += allocation.amount;
        }

        if (totalAllocated > dto.amount) {
          throw new BadRequestException(
            'Total allocations exceed payment amount',
          );
        }
      }

      // Update member balance
      await tx.member.update({
        where: { id: dto.memberId },
        data: {
          creditBalance: { increment: dto.amount - (dto.allocations?.reduce((sum, a) => sum + a.amount, 0) || 0) },
        },
      });

      return newPayment;
    });

    // Log event
    await this.eventStore.append({
      tenantId,
      aggregateType: 'Payment',
      aggregateId: payment.id,
      type: 'CREATED',
      data: { receiptNumber, amount: dto.amount },
      userId,
      userEmail,
    });

    return this.prisma.payment.findUnique({
      where: { id: payment.id },
      include: {
        member: {
          select: { id: true, memberId: true, firstName: true, lastName: true },
        },
        allocations: {
          include: { invoice: true },
        },
      },
    });
  }

  async findAllPayments(
    tenantId: string,
    options?: {
      memberId?: string;
      method?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const { memberId, method, startDate, endDate, page = 1, limit = 20 } = options || {};

    const where: any = { clubId: tenantId };
    if (memberId) where.memberId = memberId;
    if (method) where.method = method;
    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) where.paymentDate.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { paymentDate: 'desc' },
        skip,
        take: limit,
        include: {
          member: {
            select: { id: true, memberId: true, firstName: true, lastName: true },
          },
          allocations: {
            include: { invoice: { select: { id: true, invoiceNumber: true } } },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPayment(tenantId: string, id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, clubId: tenantId },
      include: {
        member: true,
        allocations: {
          include: { invoice: true },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  // ==================== STATEMENTS ====================

  /**
   * Generate a member statement for a date range
   * Returns transaction history with opening/closing balances
   */
  async generateStatement(
    tenantId: string,
    memberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    member: {
      id: string;
      name: string;
      memberNumber: string;
      membershipType: string;
      email?: string;
      address?: string;
    };
    periodStart: Date;
    periodEnd: Date;
    openingBalance: string;
    closingBalance: string;
    transactions: {
      id: string;
      date: Date;
      type: string;
      description: string;
      invoiceNumber?: string;
      amount: string;
      runningBalance: string;
    }[];
  }> {
    // 1. Fetch member info with membershipType
    const member = await this.prisma.member.findFirst({
      where: {
        id: memberId,
        clubId: tenantId,
      },
      include: {
        membershipType: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // 2. Calculate opening balance (sum of all transactions before startDate)
    const openingBalance = await this.calculateBalanceAsOf(tenantId, memberId, startDate);

    // 3. Fetch transactions within the date range
    const transactions = await this.getTransactionsInRange(
      tenantId,
      memberId,
      startDate,
      endDate,
    );

    // 4. Calculate running balance for each transaction
    let runningBalance = openingBalance;
    const transactionsWithRunningBalance = transactions.map((tx) => {
      runningBalance += parseFloat(tx.amount);
      return {
        ...tx,
        runningBalance: runningBalance.toFixed(2),
      };
    });

    // 5. Return StatementType object
    return {
      member: {
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        memberNumber: member.memberId,
        membershipType: member.membershipType?.name || 'Unknown',
        email: member.email || undefined,
        address: member.address || undefined,
      },
      periodStart: startDate,
      periodEnd: endDate,
      openingBalance: openingBalance.toFixed(2),
      closingBalance: runningBalance.toFixed(2),
      transactions: transactionsWithRunningBalance,
    };
  }

  /**
   * Calculate the balance for a member as of a specific date
   * This sums all invoices and subtracts all payments before the given date
   */
  private async calculateBalanceAsOf(
    tenantId: string,
    memberId: string,
    asOfDate: Date,
  ): Promise<number> {
    // Get sum of all invoice totals before the date
    const invoiceSum = await this.prisma.invoice.aggregate({
      where: {
        clubId: tenantId,
        memberId,
        invoiceDate: { lt: asOfDate },
        deletedAt: null,
        status: { not: 'VOID' },
      },
      _sum: { totalAmount: true },
    });

    // Get sum of all payments before the date
    const paymentSum = await this.prisma.payment.aggregate({
      where: {
        clubId: tenantId,
        memberId,
        paymentDate: { lt: asOfDate },
      },
      _sum: { amount: true },
    });

    const totalInvoices = invoiceSum._sum.totalAmount?.toNumber() || 0;
    const totalPayments = paymentSum._sum.amount?.toNumber() || 0;

    return totalInvoices - totalPayments;
  }

  /**
   * Get all transactions (invoices and payments) for a member within a date range
   * Returns them sorted by date in ascending order
   */
  private async getTransactionsInRange(
    tenantId: string,
    memberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<
    {
      id: string;
      date: Date;
      type: string;
      description: string;
      invoiceNumber?: string;
      amount: string;
    }[]
  > {
    // Get invoices in date range
    const invoices = await this.prisma.invoice.findMany({
      where: {
        clubId: tenantId,
        memberId,
        invoiceDate: {
          gte: startDate,
          lte: endDate,
        },
        deletedAt: null,
        status: { not: 'VOID' },
      },
      orderBy: { invoiceDate: 'asc' },
    });

    // Get payments in date range
    const payments = await this.prisma.payment.findMany({
      where: {
        clubId: tenantId,
        memberId,
        paymentDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { paymentDate: 'asc' },
    });

    // Combine transactions
    const transactions: {
      id: string;
      date: Date;
      type: string;
      description: string;
      invoiceNumber?: string;
      amount: string;
    }[] = [];

    // Add invoices (positive amounts - charges)
    for (const invoice of invoices) {
      transactions.push({
        id: invoice.id,
        date: invoice.invoiceDate,
        type: 'INVOICE',
        description: invoice.billingPeriod || `Invoice ${invoice.invoiceNumber}`,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.totalAmount.toNumber().toString(),
      });
    }

    // Add payments (negative amounts - credits)
    for (const payment of payments) {
      transactions.push({
        id: payment.id,
        date: payment.paymentDate,
        type: 'PAYMENT',
        description: `Payment - ${payment.receiptNumber}`,
        invoiceNumber: undefined,
        amount: (-payment.amount.toNumber()).toString(),
      });
    }

    // Sort all transactions by date
    transactions.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return transactions;
  }

  // ==================== STATISTICS ====================

  async getBillingStats(tenantId: string) {
    const [
      totalOutstanding,
      overdueCount,
      thisMonthRevenue,
      pendingPayments,
    ] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: {
          clubId: tenantId,
          status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
          deletedAt: null,
        },
        _sum: { balanceDue: true },
      }),
      this.prisma.invoice.count({
        where: {
          clubId: tenantId,
          status: 'OVERDUE',
          deletedAt: null,
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          clubId: tenantId,
          paymentDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
      this.prisma.invoice.count({
        where: {
          clubId: tenantId,
          status: { in: ['SENT', 'PARTIALLY_PAID'] },
          deletedAt: null,
        },
      }),
    ]);

    return {
      totalOutstanding: totalOutstanding._sum.balanceDue?.toNumber() || 0,
      overdueCount,
      thisMonthRevenue: thisMonthRevenue._sum.amount?.toNumber() || 0,
      pendingPayments,
    };
  }

  // ==================== BATCH INVOICES ====================

  async createBatchInvoices(
    tenantId: string,
    dto: {
      memberIds: string[];
      invoiceDate: string;
      dueDate: string;
      billingPeriod?: string;
      lineItems: Array<{
        chargeTypeId: string;
        description?: string;
        quantity: number;
        unitPrice: number;
        discountPct?: number;
        taxType?: string;
        taxRate?: number;
      }>;
      notes?: string;
      sendEmail?: boolean;
    },
    userId: string,
    userEmail: string,
  ) {
    const results = await Promise.allSettled(
      dto.memberIds.map(async (memberId) => {
        const invoice = await this.createInvoice(
          tenantId,
          {
            memberId,
            invoiceDate: dto.invoiceDate,
            dueDate: dto.dueDate,
            billingPeriod: dto.billingPeriod,
            lineItems: dto.lineItems,
            notes: dto.notes,
            sendEmail: dto.sendEmail,
          } as CreateInvoiceDto,
          userId,
          userEmail,
        );
        return invoice;
      }),
    );

    const created: any[] = [];
    const failed: Array<{ memberId: string; error: string }> = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        created.push(result.value);
      } else {
        failed.push({
          memberId: dto.memberIds[index],
          error: result.reason?.message || 'Unknown error',
        });
      }
    });

    this.logger.log(
      `Batch invoice creation: ${created.length} created, ${failed.length} failed`,
    );

    return { created, failed };
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { EventStoreService } from '@/shared/events/event-store.service';
import {
  CreateCityLedgerDto,
  UpdateCityLedgerDto,
  CityLedgerQueryDto,
} from './dto/city-ledger.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CityLedgerService {
  private readonly logger = new Logger(CityLedgerService.name);

  constructor(
    private prisma: PrismaService,
    private eventStore: EventStoreService,
  ) {}

  /**
   * Create a new city ledger account
   */
  async create(
    tenantId: string,
    dto: CreateCityLedgerDto,
    userId: string,
    userEmail: string,
  ) {
    // Check for duplicate account number
    const existing = await this.prisma.cityLedger.findFirst({
      where: {
        clubId: tenantId,
        accountNumber: dto.accountNumber,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Account number ${dto.accountNumber} already exists`,
      );
    }

    const cityLedger = await this.prisma.cityLedger.create({
      data: {
        clubId: tenantId,
        accountNumber: dto.accountNumber,
        accountName: dto.accountName,
        accountType: dto.accountType || 'CORPORATE',
        contactName: dto.contactName,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        billingAddress: dto.billingAddress,
        taxId: dto.taxId,
        creditLimit: dto.creditLimit,
        paymentTerms: dto.paymentTerms || 30,
        notes: dto.notes,
      },
    });

    // Log event
    await this.eventStore.append({
      tenantId,
      aggregateType: 'CityLedger',
      aggregateId: cityLedger.id,
      type: 'CREATED',
      data: { accountNumber: dto.accountNumber, accountName: dto.accountName },
      userId,
      userEmail,
    });

    return cityLedger;
  }

  /**
   * Find all city ledger accounts with filtering and pagination
   */
  async findAll(tenantId: string, query: CityLedgerQueryDto) {
    const { search, accountType, status, page = 1, limit = 20 } = query;

    const where: Prisma.CityLedgerWhereInput = {
      clubId: tenantId,
    };

    if (search) {
      where.OR = [
        { accountNumber: { contains: search, mode: 'insensitive' } },
        { accountName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (accountType) {
      where.accountType = accountType;
    }

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [cityLedgers, total] = await Promise.all([
      this.prisma.cityLedger.findMany({
        where,
        orderBy: { accountName: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.cityLedger.count({ where }),
    ]);

    return {
      data: cityLedgers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a single city ledger account by ID
   */
  async findById(tenantId: string, id: string) {
    const cityLedger = await this.prisma.cityLedger.findFirst({
      where: {
        id,
        clubId: tenantId,
      },
    });

    if (!cityLedger) {
      throw new NotFoundException('City Ledger account not found');
    }

    return cityLedger;
  }

  /**
   * Update a city ledger account
   */
  async update(
    tenantId: string,
    id: string,
    dto: UpdateCityLedgerDto,
    userId: string,
    userEmail: string,
  ) {
    // Verify exists
    await this.findById(tenantId, id);

    const updated = await this.prisma.cityLedger.update({
      where: { id },
      data: {
        ...(dto.accountName && { accountName: dto.accountName }),
        ...(dto.accountType && { accountType: dto.accountType }),
        ...(dto.contactName !== undefined && { contactName: dto.contactName }),
        ...(dto.contactEmail !== undefined && { contactEmail: dto.contactEmail }),
        ...(dto.contactPhone !== undefined && { contactPhone: dto.contactPhone }),
        ...(dto.billingAddress !== undefined && { billingAddress: dto.billingAddress }),
        ...(dto.taxId !== undefined && { taxId: dto.taxId }),
        ...(dto.creditLimit !== undefined && { creditLimit: dto.creditLimit }),
        ...(dto.paymentTerms !== undefined && { paymentTerms: dto.paymentTerms }),
        ...(dto.status && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });

    await this.eventStore.append({
      tenantId,
      aggregateType: 'CityLedger',
      aggregateId: id,
      type: 'UPDATED',
      data: dto,
      userId,
      userEmail,
    });

    return updated;
  }

  /**
   * Get outstanding invoices for a city ledger account, sorted by due date (FIFO)
   */
  async getOutstandingInvoices(tenantId: string, cityLedgerId: string) {
    // Verify the account exists
    await this.findById(tenantId, cityLedgerId);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        clubId: tenantId,
        cityLedgerId,
        deletedAt: null,
        status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
        balanceDue: { gt: 0 },
      },
      orderBy: { dueDate: 'asc' }, // FIFO: oldest due date first
      include: {
        lineItems: true,
      },
    });

    return invoices;
  }

  /**
   * Recalculate and update balances for a city ledger account
   */
  async updateBalances(tenantId: string, cityLedgerId: string) {
    // Verify the account exists
    const account = await this.findById(tenantId, cityLedgerId);

    // Calculate outstanding balance from unpaid invoices
    const outstandingResult = await this.prisma.invoice.aggregate({
      where: {
        clubId: tenantId,
        cityLedgerId,
        deletedAt: null,
        status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
      },
      _sum: { balanceDue: true },
    });

    const outstandingBalance = outstandingResult._sum.balanceDue?.toNumber() || 0;

    // Update the account
    const updated = await this.prisma.cityLedger.update({
      where: { id: cityLedgerId },
      data: { outstandingBalance },
    });

    return updated;
  }

  /**
   * Get city ledger statistics for a tenant
   */
  async getStats(tenantId: string) {
    const [
      totalAccounts,
      activeAccounts,
      totalOutstanding,
      accountsByType,
    ] = await Promise.all([
      this.prisma.cityLedger.count({
        where: { clubId: tenantId },
      }),
      this.prisma.cityLedger.count({
        where: { clubId: tenantId, status: 'ACTIVE' },
      }),
      this.prisma.cityLedger.aggregate({
        where: { clubId: tenantId, status: 'ACTIVE' },
        _sum: { outstandingBalance: true },
      }),
      this.prisma.cityLedger.groupBy({
        by: ['accountType'],
        where: { clubId: tenantId },
        _count: true,
      }),
    ]);

    return {
      totalAccounts,
      activeAccounts,
      totalOutstanding: totalOutstanding._sum.outstandingBalance?.toNumber() || 0,
      accountsByType: accountsByType.reduce(
        (acc, item) => ({ ...acc, [item.accountType]: item._count }),
        {},
      ),
    };
  }

  /**
   * Search city ledger accounts (for AR account search)
   */
  async search(tenantId: string, searchTerm: string, limit = 10) {
    return this.prisma.cityLedger.findMany({
      where: {
        clubId: tenantId,
        status: 'ACTIVE',
        OR: [
          { accountNumber: { contains: searchTerm, mode: 'insensitive' } },
          { accountName: { contains: searchTerm, mode: 'insensitive' } },
          { contactName: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { accountName: 'asc' },
    });
  }
}

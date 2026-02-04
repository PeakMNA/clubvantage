import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ARProfileType, ARProfileStatus, StatementDelivery, Prisma } from '@prisma/client';

@Injectable()
export class ARProfileService {
  private readonly logger = new Logger(ARProfileService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate next account number for club
   */
  private async generateAccountNumber(
    clubId: string,
    profileType: ARProfileType,
  ): Promise<string> {
    const prefix = profileType === 'MEMBER' ? 'M' : 'C';

    const lastProfile = await this.prisma.aRProfile.findFirst({
      where: { clubId, profileType },
      orderBy: { accountNumber: 'desc' },
      select: { accountNumber: true },
    });

    let nextNum = 1;
    if (lastProfile?.accountNumber) {
      const match = lastProfile.accountNumber.match(/\d+$/);
      if (match) {
        nextNum = parseInt(match[0], 10) + 1;
      }
    }

    return `${prefix}${nextNum.toString().padStart(6, '0')}`;
  }

  /**
   * Create AR profile for a member
   */
  async createForMember(
    clubId: string,
    memberId: string,
    options?: {
      statementDelivery?: StatementDelivery;
      paymentTermsDays?: number;
      creditLimit?: number;
    },
    userId?: string,
  ) {
    // Verify member exists and belongs to club
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, clubId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Check if profile already exists
    const existing = await this.prisma.aRProfile.findFirst({
      where: { clubId, profileType: 'MEMBER', memberId },
    });
    if (existing) {
      throw new BadRequestException('AR profile already exists for this member');
    }

    const accountNumber = await this.generateAccountNumber(clubId, 'MEMBER');

    return this.prisma.aRProfile.create({
      data: {
        clubId,
        accountNumber,
        profileType: 'MEMBER',
        memberId,
        statementDelivery: options?.statementDelivery ?? 'EMAIL',
        paymentTermsDays: options?.paymentTermsDays ?? 15,
        creditLimit: options?.creditLimit,
        createdBy: userId,
      },
    });
  }

  /**
   * Create AR profile for a city ledger
   */
  async createForCityLedger(
    clubId: string,
    cityLedgerId: string,
    options?: {
      statementDelivery?: StatementDelivery;
      paymentTermsDays?: number;
      creditLimit?: number;
    },
    userId?: string,
  ) {
    // Verify city ledger exists and belongs to club
    const cityLedger = await this.prisma.cityLedger.findFirst({
      where: { id: cityLedgerId, clubId },
    });
    if (!cityLedger) {
      throw new NotFoundException('City ledger not found');
    }

    // Check if profile already exists
    const existing = await this.prisma.aRProfile.findFirst({
      where: { clubId, profileType: 'CITY_LEDGER', cityLedgerId },
    });
    if (existing) {
      throw new BadRequestException('AR profile already exists for this city ledger');
    }

    const accountNumber = await this.generateAccountNumber(clubId, 'CITY_LEDGER');

    return this.prisma.aRProfile.create({
      data: {
        clubId,
        accountNumber,
        profileType: 'CITY_LEDGER',
        cityLedgerId,
        statementDelivery: options?.statementDelivery ?? 'EMAIL',
        paymentTermsDays: options?.paymentTermsDays ?? 30,
        creditLimit: options?.creditLimit,
        createdBy: userId,
      },
    });
  }

  /**
   * Find all AR profiles for a club
   */
  async findAll(
    clubId: string,
    filter?: {
      profileType?: ARProfileType;
      status?: ARProfileStatus;
      search?: string;
      minBalance?: number;
      maxBalance?: number;
    },
  ) {
    const where: Prisma.ARProfileWhereInput = { clubId };

    if (filter?.profileType) {
      where.profileType = filter.profileType;
    }
    if (filter?.status) {
      where.status = filter.status;
    }
    if (filter?.minBalance !== undefined) {
      where.currentBalance = { gte: filter.minBalance };
    }
    if (filter?.maxBalance !== undefined) {
      where.currentBalance = {
        ...(where.currentBalance as Prisma.DecimalFilter || {}),
        lte: filter.maxBalance,
      };
    }
    if (filter?.search) {
      where.OR = [
        { accountNumber: { contains: filter.search, mode: 'insensitive' } },
        {
          member: {
            OR: [
              { firstName: { contains: filter.search, mode: 'insensitive' } },
              { lastName: { contains: filter.search, mode: 'insensitive' } },
              { memberId: { contains: filter.search, mode: 'insensitive' } },
            ],
          },
        },
        {
          cityLedger: {
            accountName: { contains: filter.search, mode: 'insensitive' },
          },
        },
      ];
    }

    return this.prisma.aRProfile.findMany({
      where,
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
      orderBy: { accountNumber: 'asc' },
    });
  }

  /**
   * Find AR profile by ID
   */
  async findById(id: string) {
    const profile = await this.prisma.aRProfile.findUnique({
      where: { id },
      include: {
        member: true,
        cityLedger: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('AR profile not found');
    }

    return profile;
  }

  /**
   * Find AR profile by member ID
   */
  async findByMemberId(clubId: string, memberId: string) {
    return this.prisma.aRProfile.findFirst({
      where: { clubId, profileType: 'MEMBER', memberId },
      include: {
        member: true,
      },
    });
  }

  /**
   * Find AR profile by city ledger ID
   */
  async findByCityLedgerId(clubId: string, cityLedgerId: string) {
    return this.prisma.aRProfile.findFirst({
      where: { clubId, profileType: 'CITY_LEDGER', cityLedgerId },
      include: {
        cityLedger: true,
      },
    });
  }

  /**
   * Update AR profile
   */
  async update(
    id: string,
    data: {
      statementDelivery?: StatementDelivery;
      paymentTermsDays?: number;
      creditLimit?: number;
    },
    userId?: string,
  ) {
    return this.prisma.aRProfile.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
      },
    });
  }

  /**
   * Suspend AR profile
   */
  async suspend(id: string, reason: string, userId?: string) {
    return this.prisma.aRProfile.update({
      where: { id },
      data: {
        status: 'SUSPENDED',
        suspendedAt: new Date(),
        suspendedReason: reason,
        updatedBy: userId,
      },
    });
  }

  /**
   * Reactivate AR profile
   */
  async reactivate(id: string, userId?: string) {
    return this.prisma.aRProfile.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        suspendedAt: null,
        suspendedReason: null,
        updatedBy: userId,
      },
    });
  }

  /**
   * Close AR profile
   */
  async close(id: string, reason: string, userId?: string) {
    const profile = await this.findById(id);

    // Check if balance is zero (comparing Decimal)
    if (profile.currentBalance.toNumber() !== 0) {
      throw new BadRequestException('Cannot close profile with non-zero balance');
    }

    return this.prisma.aRProfile.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedReason: reason,
        updatedBy: userId,
      },
    });
  }

  /**
   * Update balance after transactions
   */
  async updateBalance(id: string, newBalance: number) {
    return this.prisma.aRProfile.update({
      where: { id },
      data: { currentBalance: newBalance },
    });
  }

  /**
   * Update last statement info
   */
  async updateLastStatement(id: string, statementDate: Date, balance: number) {
    return this.prisma.aRProfile.update({
      where: { id },
      data: {
        lastStatementDate: statementDate,
        lastStatementBalance: balance,
      },
    });
  }

  /**
   * Update last payment info
   */
  async updateLastPayment(id: string, paymentDate: Date, amount: number) {
    return this.prisma.aRProfile.update({
      where: { id },
      data: {
        lastPaymentDate: paymentDate,
        lastPaymentAmount: amount,
      },
    });
  }

  /**
   * Get all active profiles for statement generation
   */
  async getActiveProfiles(clubId: string) {
    return this.prisma.aRProfile.findMany({
      where: {
        clubId,
        status: 'ACTIVE',
      },
      include: {
        member: true,
        cityLedger: true,
      },
    });
  }

  /**
   * Get profile count by status for a club
   */
  async getCountByStatus(clubId: string) {
    const counts = await this.prisma.aRProfile.groupBy({
      by: ['status'],
      where: { clubId },
      _count: true,
    });

    return counts.reduce(
      (acc, item) => {
        acc[item.status.toLowerCase()] = item._count;
        return acc;
      },
      { active: 0, suspended: 0, closed: 0 } as Record<string, number>,
    );
  }
}

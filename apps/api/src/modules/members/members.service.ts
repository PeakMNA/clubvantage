import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { EventStoreService } from '@/shared/events/event-store.service';
import {
  CreateMemberDto,
  UpdateMemberDto,
  MemberQueryDto,
  ChangeStatusDto,
} from './dto';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    private prisma: PrismaService,
    private eventStore: EventStoreService,
  ) {}

  async create(
    tenantId: string,
    dto: CreateMemberDto,
    userId: string,
    userEmail: string,
  ) {
    // Generate member ID
    const lastMember = await this.prisma.member.findFirst({
      where: { clubId: tenantId },
      orderBy: { createdAt: 'desc' },
      select: { memberId: true },
    });

    const nextNumber = lastMember
      ? parseInt(lastMember.memberId.replace('M-', ''), 10) + 1
      : 1;
    const memberId = `M-${nextNumber.toString().padStart(4, '0')}`;

    // Check for duplicate email if provided
    if (dto.email) {
      const existingMember = await this.prisma.member.findFirst({
        where: {
          clubId: tenantId,
          email: dto.email.toLowerCase(),
          deletedAt: null,
        },
      });

      if (existingMember) {
        throw new ConflictException('A member with this email already exists');
      }
    }

    const member = await this.prisma.member.create({
      data: {
        clubId: tenantId,
        memberId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        gender: dto.gender,
        address: dto.address,
        nationality: dto.nationality,
        idNumber: dto.idNumber,
        membershipTypeId: dto.membershipTypeId,
        membershipTierId: dto.membershipTierId,
        status: dto.status || 'ACTIVE',
        joinDate: dto.joinDate ? new Date(dto.joinDate) : new Date(),
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        householdId: dto.householdId,
        isPrimaryMember: dto.isPrimaryMember || false,
        referredById: dto.referredById,
        referralSource: dto.referralSource,
        emergencyContact: dto.emergencyContact,
        emergencyPhone: dto.emergencyPhone,
        notes: dto.notes,
        tags: dto.tags || [],
        customFields: dto.customFields || {},
      },
      include: {
        membershipType: true,
        membershipTier: true,
        household: true,
      },
    });

    // Log event
    await this.eventStore.append({
      tenantId,
      aggregateType: 'Member',
      aggregateId: member.id,
      type: 'CREATED',
      data: { ...dto, memberId },
      userId,
      userEmail,
    });

    return member;
  }

  async findAll(tenantId: string, query: MemberQueryDto) {
    const { search, status, membershipTypeId, householdId, page, limit, sortBy, sortOrder } =
      query;

    const where: any = {
      clubId: tenantId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { memberId: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (membershipTypeId) {
      where.membershipTypeId = membershipTypeId;
    }

    if (householdId) {
      where.householdId = householdId;
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'desc';
    }

    const skip = ((page || 1) - 1) * (limit || 20);
    const take = limit || 20;

    const [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          membershipType: {
            select: { id: true, name: true, code: true },
          },
          membershipTier: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      this.prisma.member.count({ where }),
    ]);

    return {
      data: members,
      meta: {
        total,
        page: page || 1,
        limit: limit || 20,
        totalPages: Math.ceil(total / (limit || 20)),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const member = await this.prisma.member.findFirst({
      where: {
        id,
        clubId: tenantId,
        deletedAt: null,
      },
      include: {
        membershipType: true,
        membershipTier: true,
        household: {
          include: {
            members: {
              where: { deletedAt: null },
              select: {
                id: true,
                memberId: true,
                firstName: true,
                lastName: true,
                isPrimaryMember: true,
              },
            },
          },
        },
        referredBy: {
          select: {
            id: true,
            memberId: true,
            firstName: true,
            lastName: true,
          },
        },
        dependents: {
          where: { isActive: true },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateMemberDto,
    userId: string,
    userEmail: string,
  ) {
    const existing = await this.findOne(tenantId, id);

    // Check for duplicate email if changed
    if (dto.email && dto.email.toLowerCase() !== existing.email) {
      const duplicate = await this.prisma.member.findFirst({
        where: {
          clubId: tenantId,
          email: dto.email.toLowerCase(),
          id: { not: id },
          deletedAt: null,
        },
      });

      if (duplicate) {
        throw new ConflictException('A member with this email already exists');
      }
    }

    const member = await this.prisma.member.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
        address: dto.address,
        nationality: dto.nationality,
        idNumber: dto.idNumber,
        membershipTypeId: dto.membershipTypeId,
        membershipTierId: dto.membershipTierId,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        householdId: dto.householdId,
        isPrimaryMember: dto.isPrimaryMember,
        emergencyContact: dto.emergencyContact,
        emergencyPhone: dto.emergencyPhone,
        notes: dto.notes,
        tags: dto.tags,
        customFields: dto.customFields,
      },
      include: {
        membershipType: true,
        membershipTier: true,
      },
    });

    // Log event
    await this.eventStore.append({
      tenantId,
      aggregateType: 'Member',
      aggregateId: id,
      type: 'UPDATED',
      data: { before: existing, after: dto },
      userId,
      userEmail,
    });

    return member;
  }

  async changeStatus(
    tenantId: string,
    id: string,
    dto: ChangeStatusDto,
    userId: string,
    userEmail: string,
  ) {
    const existing = await this.findOne(tenantId, id);
    const oldStatus = existing.status;

    const member = await this.prisma.member.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.reason
          ? `${existing.notes || ''}\n[${new Date().toISOString()}] Status changed from ${oldStatus} to ${dto.status}: ${dto.reason}`
          : existing.notes,
      },
      include: {
        membershipType: true,
        membershipTier: true,
      },
    });

    // Log event
    await this.eventStore.append({
      tenantId,
      aggregateType: 'Member',
      aggregateId: id,
      type: 'STATUS_CHANGED',
      data: {
        oldStatus,
        newStatus: dto.status,
        reason: dto.reason,
      },
      userId,
      userEmail,
    });

    return member;
  }

  async softDelete(
    tenantId: string,
    id: string,
    userId: string,
    userEmail: string,
  ) {
    const member = await this.findOne(tenantId, id);

    await this.prisma.member.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Log event
    await this.eventStore.append({
      tenantId,
      aggregateType: 'Member',
      aggregateId: id,
      type: 'DELETED',
      data: { memberId: member.memberId },
      userId,
      userEmail,
    });

    return { message: 'Member deleted successfully' };
  }

  async getDependents(tenantId: string, memberId: string) {
    await this.findOne(tenantId, memberId);

    return this.prisma.dependent.findMany({
      where: {
        memberId,
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getInvoices(tenantId: string, memberId: string, limit = 10) {
    await this.findOne(tenantId, memberId);

    return this.prisma.invoice.findMany({
      where: {
        memberId,
        clubId: tenantId,
        deletedAt: null,
      },
      orderBy: { invoiceDate: 'desc' },
      take: limit,
      include: {
        lineItems: true,
      },
    });
  }

  async getActivity(tenantId: string, memberId: string, limit = 20) {
    await this.findOne(tenantId, memberId);

    return this.eventStore.getHistory('Member', memberId);
  }

  async getStats(tenantId: string) {
    const [total, active, suspended, byType] = await Promise.all([
      this.prisma.member.count({
        where: { clubId: tenantId, deletedAt: null },
      }),
      this.prisma.member.count({
        where: { clubId: tenantId, status: 'ACTIVE', deletedAt: null },
      }),
      this.prisma.member.count({
        where: { clubId: tenantId, status: 'SUSPENDED', deletedAt: null },
      }),
      this.prisma.member.groupBy({
        by: ['membershipTypeId'],
        where: { clubId: tenantId, deletedAt: null },
        _count: { id: true },
      }),
    ]);

    return {
      total,
      active,
      suspended,
      inactive: total - active - suspended,
      byType,
    };
  }
}

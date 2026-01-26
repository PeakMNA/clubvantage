import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { EventStoreService } from '@/shared/events/event-store.service';
import { ApplicationStatus } from '@prisma/client';

export interface ApplicationQueryDto {
  status?: ApplicationStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateApplicationDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  membershipTypeId: string;
  sponsorId?: string;
  reviewNotes?: string;
}

export interface UpdateApplicationDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  membershipTypeId?: string;
  sponsorId?: string;
  reviewNotes?: string;
}

export interface ChangeApplicationStatusDto {
  status: ApplicationStatus;
  reviewNotes?: string;
  rejectionReason?: string;
}

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private prisma: PrismaService,
    private eventStore: EventStoreService,
  ) {}

  async findAll(tenantId: string, query: ApplicationQueryDto) {
    const { status, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { clubId: tenantId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { applicationNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.membershipApplication.findMany({
        where,
        include: {
          membershipType: true,
          sponsor: {
            select: {
              id: true,
              memberId: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.membershipApplication.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const application = await this.prisma.membershipApplication.findFirst({
      where: { id, clubId: tenantId },
      include: {
        membershipType: true,
        sponsor: {
          select: {
            id: true,
            memberId: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async create(
    tenantId: string,
    dto: CreateApplicationDto,
    userId: string,
    userEmail: string,
  ) {
    // Generate application number
    const lastApp = await this.prisma.membershipApplication.findFirst({
      where: { clubId: tenantId },
      orderBy: { createdAt: 'desc' },
      select: { applicationNumber: true },
    });

    const year = new Date().getFullYear();
    const nextNumber = lastApp
      ? parseInt(lastApp.applicationNumber.split('-')[2], 10) + 1
      : 1;
    const applicationNumber = `APP-${year}-${nextNumber.toString().padStart(4, '0')}`;

    // Check for duplicate email
    const existingApp = await this.prisma.membershipApplication.findFirst({
      where: {
        clubId: tenantId,
        email: dto.email.toLowerCase(),
        status: { notIn: ['REJECTED', 'WITHDRAWN'] },
      },
    });

    if (existingApp) {
      throw new ConflictException('An active application with this email already exists');
    }

    // Verify membership type exists
    const membershipType = await this.prisma.membershipType.findFirst({
      where: { id: dto.membershipTypeId, clubId: tenantId, isActive: true },
    });

    if (!membershipType) {
      throw new BadRequestException('Invalid membership type');
    }

    // Verify sponsor if provided
    if (dto.sponsorId) {
      const sponsor = await this.prisma.member.findFirst({
        where: { id: dto.sponsorId, clubId: tenantId, status: 'ACTIVE' },
      });

      if (!sponsor) {
        throw new BadRequestException('Invalid sponsor');
      }
    }

    const application = await this.prisma.membershipApplication.create({
      data: {
        clubId: tenantId,
        applicationNumber,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        membershipTypeId: dto.membershipTypeId,
        sponsorId: dto.sponsorId,
        reviewNotes: dto.reviewNotes,
        status: 'SUBMITTED',
      },
      include: {
        membershipType: true,
        sponsor: {
          select: {
            id: true,
            memberId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log event
    await this.eventStore.append({
      tenantId,
      aggregateType: 'MembershipApplication',
      aggregateId: application.id,
      type: 'CREATED',
      data: { ...dto, applicationNumber },
      userId,
      userEmail,
    });

    return application;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateApplicationDto,
    userId: string,
    userEmail: string,
  ) {
    const application = await this.findOne(tenantId, id);

    // Don't allow updates to approved/rejected/withdrawn applications
    if (['APPROVED', 'REJECTED', 'WITHDRAWN'].includes(application.status)) {
      throw new BadRequestException('Cannot update a closed application');
    }

    // Check email uniqueness if changing
    if (dto.email && dto.email.toLowerCase() !== application.email.toLowerCase()) {
      const existingApp = await this.prisma.membershipApplication.findFirst({
        where: {
          clubId: tenantId,
          email: dto.email.toLowerCase(),
          id: { not: id },
          status: { notIn: ['REJECTED', 'WITHDRAWN'] },
        },
      });

      if (existingApp) {
        throw new ConflictException('An active application with this email already exists');
      }
    }

    const updated = await this.prisma.membershipApplication.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        membershipTypeId: dto.membershipTypeId,
        sponsorId: dto.sponsorId,
        reviewNotes: dto.reviewNotes,
      },
      include: {
        membershipType: true,
        sponsor: {
          select: {
            id: true,
            memberId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log event
    await this.eventStore.append({
      tenantId,
      aggregateType: 'MembershipApplication',
      aggregateId: id,
      type: 'UPDATED',
      data: dto,
      userId,
      userEmail,
    });

    return updated;
  }

  async changeStatus(
    tenantId: string,
    id: string,
    dto: ChangeApplicationStatusDto,
    userId: string,
    userEmail: string,
  ) {
    const application = await this.findOne(tenantId, id);

    // Validate status transitions
    const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
      SUBMITTED: ['UNDER_REVIEW', 'WITHDRAWN'],
      UNDER_REVIEW: ['PENDING_BOARD', 'REJECTED', 'WITHDRAWN'],
      PENDING_BOARD: ['APPROVED', 'REJECTED', 'WITHDRAWN'],
      APPROVED: [], // No transitions from approved
      REJECTED: [], // No transitions from rejected
      WITHDRAWN: [], // No transitions from withdrawn
    };

    if (!validTransitions[application.status].includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${application.status} to ${dto.status}`,
      );
    }

    const updateData: any = {
      status: dto.status,
      reviewNotes: dto.reviewNotes || application.reviewNotes,
    };

    // Set timestamps based on new status
    const now = new Date();
    switch (dto.status) {
      case 'UNDER_REVIEW':
        updateData.reviewedAt = now;
        updateData.reviewedBy = userEmail;
        break;
      case 'APPROVED':
        updateData.approvedAt = now;
        updateData.approvedBy = userEmail;
        break;
      case 'REJECTED':
        updateData.rejectedAt = now;
        updateData.rejectedBy = userEmail;
        updateData.rejectionReason = dto.rejectionReason;
        break;
      case 'WITHDRAWN':
        updateData.withdrawnAt = now;
        break;
    }

    const updated = await this.prisma.membershipApplication.update({
      where: { id },
      data: updateData,
      include: {
        membershipType: true,
        sponsor: {
          select: {
            id: true,
            memberId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log event
    await this.eventStore.append({
      tenantId,
      aggregateType: 'MembershipApplication',
      aggregateId: id,
      type: 'STATUS_CHANGED',
      data: { from: application.status, to: dto.status, ...dto },
      userId,
      userEmail,
    });

    return updated;
  }

  async getStats(tenantId: string) {
    const [submitted, underReview, pendingBoard, approved, rejected] =
      await Promise.all([
        this.prisma.membershipApplication.count({
          where: { clubId: tenantId, status: 'SUBMITTED' },
        }),
        this.prisma.membershipApplication.count({
          where: { clubId: tenantId, status: 'UNDER_REVIEW' },
        }),
        this.prisma.membershipApplication.count({
          where: { clubId: tenantId, status: 'PENDING_BOARD' },
        }),
        this.prisma.membershipApplication.count({
          where: { clubId: tenantId, status: 'APPROVED' },
        }),
        this.prisma.membershipApplication.count({
          where: { clubId: tenantId, status: 'REJECTED' },
        }),
      ]);

    return {
      submitted,
      underReview,
      pendingBoard,
      approved,
      rejected,
      total: submitted + underReview + pendingBoard + approved + rejected,
    };
  }
}

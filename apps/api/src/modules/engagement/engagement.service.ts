import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { InterestSource } from '@prisma/client';
import {
  CreateInterestCategoryDto,
  UpdateInterestCategoryDto,
  SetMemberInterestsDto,
  SetDependentInterestsDto,
  UpdateCommunicationPrefsDto,
} from './dto';

@Injectable()
export class EngagementService {
  private readonly logger = new Logger(EngagementService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // INTEREST CATEGORIES
  // ============================================================================

  async getInterestCategories(tenantId: string, isActive?: boolean) {
    const where: any = { clubId: tenantId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.prisma.interestCategory.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getInterestCategory(tenantId: string, id: string) {
    const category = await this.prisma.interestCategory.findFirst({
      where: { id, clubId: tenantId },
    });

    if (!category) {
      throw new NotFoundException('Interest category not found');
    }

    return category;
  }

  async createInterestCategory(tenantId: string, dto: CreateInterestCategoryDto) {
    // Check for duplicate code
    const existing = await this.prisma.interestCategory.findUnique({
      where: {
        clubId_code: { clubId: tenantId, code: dto.code },
      },
    });

    if (existing) {
      throw new ConflictException(`Category with code '${dto.code}' already exists`);
    }

    return this.prisma.interestCategory.create({
      data: {
        clubId: tenantId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        color: dto.color,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateInterestCategory(
    tenantId: string,
    id: string,
    dto: UpdateInterestCategoryDto,
  ) {
    const category = await this.prisma.interestCategory.findFirst({
      where: { id, clubId: tenantId },
    });

    if (!category) {
      throw new NotFoundException('Interest category not found');
    }

    return this.prisma.interestCategory.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        color: dto.color,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
      },
    });
  }

  async deleteInterestCategory(tenantId: string, id: string) {
    const category = await this.prisma.interestCategory.findFirst({
      where: { id, clubId: tenantId },
    });

    if (!category) {
      throw new NotFoundException('Interest category not found');
    }

    // Delete associated member and dependent interests first
    await this.prisma.memberInterest.deleteMany({
      where: { categoryId: id },
    });
    await this.prisma.dependentInterest.deleteMany({
      where: { categoryId: id },
    });

    await this.prisma.interestCategory.delete({
      where: { id },
    });

    return { message: 'Interest category deleted successfully' };
  }

  // ============================================================================
  // MEMBER INTERESTS
  // ============================================================================

  async getMemberInterests(tenantId: string, memberId: string) {
    // Verify member belongs to tenant
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, clubId: tenantId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return this.prisma.memberInterest.findMany({
      where: { memberId },
      include: {
        category: true,
      },
      orderBy: { category: { sortOrder: 'asc' } },
    });
  }

  async setMemberInterests(tenantId: string, dto: SetMemberInterestsDto) {
    // Verify member belongs to tenant
    const member = await this.prisma.member.findFirst({
      where: { id: dto.memberId, clubId: tenantId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Verify all categories belong to tenant
    const categoryIds = dto.interests.map((i) => i.categoryId);
    const categories = await this.prisma.interestCategory.findMany({
      where: { id: { in: categoryIds }, clubId: tenantId },
    });

    if (categories.length !== categoryIds.length) {
      throw new NotFoundException('One or more interest categories not found');
    }

    // Upsert each interest
    const results = await Promise.all(
      dto.interests.map((interest) =>
        this.prisma.memberInterest.upsert({
          where: {
            memberId_categoryId: {
              memberId: dto.memberId,
              categoryId: interest.categoryId,
            },
          },
          create: {
            memberId: dto.memberId,
            categoryId: interest.categoryId,
            interestLevel: interest.interestLevel,
            source: interest.source ?? InterestSource.EXPLICIT,
          },
          update: {
            interestLevel: interest.interestLevel,
            source: interest.source ?? InterestSource.EXPLICIT,
          },
          include: {
            category: true,
          },
        }),
      ),
    );

    return results;
  }

  async removeMemberInterest(tenantId: string, memberId: string, categoryId: string) {
    // Verify member belongs to tenant
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, clubId: tenantId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const interest = await this.prisma.memberInterest.findUnique({
      where: {
        memberId_categoryId: { memberId, categoryId },
      },
    });

    if (!interest) {
      throw new NotFoundException('Interest not found');
    }

    await this.prisma.memberInterest.delete({
      where: {
        memberId_categoryId: { memberId, categoryId },
      },
    });

    return { message: 'Interest removed successfully' };
  }

  // ============================================================================
  // DEPENDENT INTERESTS
  // ============================================================================

  async getDependentInterests(tenantId: string, dependentId: string) {
    // Verify dependent belongs to tenant via member
    const dependent = await this.prisma.dependent.findFirst({
      where: { id: dependentId },
      include: { member: true },
    });

    if (!dependent || dependent.member.clubId !== tenantId) {
      throw new NotFoundException('Dependent not found');
    }

    return this.prisma.dependentInterest.findMany({
      where: { dependentId },
      include: {
        category: true,
      },
      orderBy: { category: { sortOrder: 'asc' } },
    });
  }

  async setDependentInterests(tenantId: string, dto: SetDependentInterestsDto) {
    // Verify dependent belongs to tenant via member
    const dependent = await this.prisma.dependent.findFirst({
      where: { id: dto.dependentId },
      include: { member: true },
    });

    if (!dependent || dependent.member.clubId !== tenantId) {
      throw new NotFoundException('Dependent not found');
    }

    // Verify all categories belong to tenant
    const categoryIds = dto.interests.map((i) => i.categoryId);
    const categories = await this.prisma.interestCategory.findMany({
      where: { id: { in: categoryIds }, clubId: tenantId },
    });

    if (categories.length !== categoryIds.length) {
      throw new NotFoundException('One or more interest categories not found');
    }

    // Upsert each interest
    const results = await Promise.all(
      dto.interests.map((interest) =>
        this.prisma.dependentInterest.upsert({
          where: {
            dependentId_categoryId: {
              dependentId: dto.dependentId,
              categoryId: interest.categoryId,
            },
          },
          create: {
            dependentId: dto.dependentId,
            categoryId: interest.categoryId,
            interestLevel: interest.interestLevel,
          },
          update: {
            interestLevel: interest.interestLevel,
          },
          include: {
            category: true,
          },
        }),
      ),
    );

    return results;
  }

  async removeDependentInterest(tenantId: string, dependentId: string, categoryId: string) {
    // Verify dependent belongs to tenant via member
    const dependent = await this.prisma.dependent.findFirst({
      where: { id: dependentId },
      include: { member: true },
    });

    if (!dependent || dependent.member.clubId !== tenantId) {
      throw new NotFoundException('Dependent not found');
    }

    const interest = await this.prisma.dependentInterest.findUnique({
      where: {
        dependentId_categoryId: { dependentId, categoryId },
      },
    });

    if (!interest) {
      throw new NotFoundException('Interest not found');
    }

    await this.prisma.dependentInterest.delete({
      where: {
        dependentId_categoryId: { dependentId, categoryId },
      },
    });

    return { message: 'Interest removed successfully' };
  }

  // ============================================================================
  // COMMUNICATION PREFERENCES
  // ============================================================================

  async getCommunicationPrefs(tenantId: string, memberId: string) {
    // Verify member belongs to tenant
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, clubId: tenantId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Get or create default prefs
    let prefs = await this.prisma.memberCommunicationPrefs.findUnique({
      where: { memberId },
    });

    if (!prefs) {
      prefs = await this.prisma.memberCommunicationPrefs.create({
        data: {
          memberId,
          emailPromotions: true,
          smsPromotions: false,
          pushNotifications: true,
          unsubscribedCategories: [],
        },
      });
    }

    return prefs;
  }

  async updateCommunicationPrefs(tenantId: string, dto: UpdateCommunicationPrefsDto) {
    // Verify member belongs to tenant
    const member = await this.prisma.member.findFirst({
      where: { id: dto.memberId, clubId: tenantId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return this.prisma.memberCommunicationPrefs.upsert({
      where: { memberId: dto.memberId },
      create: {
        memberId: dto.memberId,
        emailPromotions: dto.emailPromotions ?? true,
        smsPromotions: dto.smsPromotions ?? false,
        pushNotifications: dto.pushNotifications ?? true,
        unsubscribedCategories: dto.unsubscribedCategories ?? [],
      },
      update: {
        emailPromotions: dto.emailPromotions,
        smsPromotions: dto.smsPromotions,
        pushNotifications: dto.pushNotifications,
        unsubscribedCategories: dto.unsubscribedCategories,
      },
    });
  }
}

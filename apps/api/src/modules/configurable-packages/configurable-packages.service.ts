import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { FeatureCategory, PackageTier } from '@prisma/client';

@Injectable()
export class ConfigurablePackagesService {
  private readonly logger = new Logger(ConfigurablePackagesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // FEATURE DEFINITIONS
  // ============================================================================

  async getFeatureDefinitions(category?: FeatureCategory) {
    return this.prisma.featureDefinition.findMany({
      where: {
        ...(category ? { category } : {}),
        isActive: true,
      },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async getFeatureDefinition(id: string) {
    const fd = await this.prisma.featureDefinition.findUnique({ where: { id } });
    if (!fd) throw new NotFoundException(`FeatureDefinition ${id} not found`);
    return fd;
  }

  async createFeatureDefinition(input: {
    key: string;
    name: string;
    description?: string;
    category: FeatureCategory;
    addonPrice?: number;
    sortOrder?: number;
  }) {
    return this.prisma.featureDefinition.create({
      data: {
        key: input.key,
        name: input.name,
        description: input.description,
        category: input.category,
        addonPrice: input.addonPrice,
        sortOrder: input.sortOrder ?? 0,
        isActive: true,
      },
    });
  }

  async updateFeatureDefinition(
    id: string,
    input: {
      name?: string;
      description?: string;
      addonPrice?: number;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.prisma.featureDefinition.update({
      where: { id },
      data: input,
    });
  }

  // ============================================================================
  // VERTICALS
  // ============================================================================

  async getVerticals() {
    return this.prisma.vertical.findMany({
      where: { isActive: true },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getVertical(id: string) {
    const v = await this.prisma.vertical.findUnique({
      where: { id },
      include: {
        packages: {
          where: { isActive: true },
          include: {
            features: { include: { featureDefinition: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!v) throw new NotFoundException(`Vertical ${id} not found`);
    return v;
  }

  async createVertical(input: {
    name: string;
    slug: string;
    description?: string;
    iconUrl?: string;
    sortOrder?: number;
  }) {
    return this.prisma.vertical.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        iconUrl: input.iconUrl,
        sortOrder: input.sortOrder ?? 0,
        isActive: true,
      },
    });
  }

  async updateVertical(
    id: string,
    input: {
      name?: string;
      description?: string;
      iconUrl?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.prisma.vertical.update({
      where: { id },
      data: input,
    });
  }

  // ============================================================================
  // PACKAGES
  // ============================================================================

  async getPackages(verticalId?: string) {
    return this.prisma.package.findMany({
      where: {
        isActive: true,
        ...(verticalId ? { verticalId } : {}),
      },
      include: {
        vertical: true,
        features: {
          include: { featureDefinition: true },
        },
      },
      orderBy: [{ verticalId: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async getPackage(id: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id },
      include: {
        vertical: true,
        features: {
          include: { featureDefinition: true },
        },
        clubPackages: {
          include: { club: { select: { id: true, name: true } } },
        },
      },
    });
    if (!pkg) throw new NotFoundException(`Package ${id} not found`);
    return pkg;
  }

  async createPackage(input: {
    verticalId?: string;
    name: string;
    slug: string;
    tier: PackageTier;
    basePrice: number;
    annualPrice?: number;
    defaultMemberLimit?: number;
    defaultUserLimit?: number;
    sortOrder?: number;
  }) {
    return this.prisma.package.create({
      data: {
        verticalId: input.verticalId,
        name: input.name,
        slug: input.slug,
        tier: input.tier,
        basePrice: input.basePrice,
        annualPrice: input.annualPrice,
        defaultMemberLimit: input.defaultMemberLimit,
        defaultUserLimit: input.defaultUserLimit,
        sortOrder: input.sortOrder ?? 0,
        isActive: true,
      },
      include: {
        vertical: true,
        features: { include: { featureDefinition: true } },
      },
    });
  }

  async updatePackage(
    id: string,
    input: {
      name?: string;
      basePrice?: number;
      annualPrice?: number;
      defaultMemberLimit?: number;
      defaultUserLimit?: number;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.prisma.package.update({
      where: { id },
      data: input,
      include: {
        vertical: true,
        features: { include: { featureDefinition: true } },
      },
    });
  }

  async setPackageFeature(packageId: string, featureDefinitionId: string, enabled: boolean) {
    return this.prisma.packageFeature.upsert({
      where: {
        packageId_featureDefinitionId: { packageId, featureDefinitionId },
      },
      update: { enabled },
      create: { packageId, featureDefinitionId, enabled },
      include: { featureDefinition: true },
    });
  }

  async setPackageFeatures(packageId: string, features: Array<{ featureDefinitionId: string; enabled: boolean }>) {
    const results = await Promise.all(
      features.map((f) => this.setPackageFeature(packageId, f.featureDefinitionId, f.enabled)),
    );
    return results;
  }

  // ============================================================================
  // CLUB PACKAGE ASSIGNMENT
  // ============================================================================

  async getClubPackage(clubId: string) {
    return this.prisma.clubPackage.findUnique({
      where: { clubId },
      include: {
        package: {
          include: {
            vertical: true,
            features: { include: { featureDefinition: true } },
          },
        },
        club: { select: { id: true, name: true } },
      },
    });
  }

  async assignClubPackage(input: {
    clubId: string;
    packageId: string;
    memberLimitOverride?: number;
    userLimitOverride?: number;
    customPriceOverride?: number;
  }) {
    return this.prisma.clubPackage.upsert({
      where: { clubId: input.clubId },
      update: {
        packageId: input.packageId,
        memberLimitOverride: input.memberLimitOverride,
        userLimitOverride: input.userLimitOverride,
        customPriceOverride: input.customPriceOverride,
      },
      create: {
        clubId: input.clubId,
        packageId: input.packageId,
        memberLimitOverride: input.memberLimitOverride,
        userLimitOverride: input.userLimitOverride,
        customPriceOverride: input.customPriceOverride,
        startDate: new Date(),
      },
      include: {
        package: {
          include: {
            vertical: true,
            features: { include: { featureDefinition: true } },
          },
        },
        club: { select: { id: true, name: true } },
      },
    });
  }

  // ============================================================================
  // CLUB ADD-ONS
  // ============================================================================

  async getClubAddons(clubId: string) {
    return this.prisma.clubAddon.findMany({
      where: {
        clubId,
        OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
      },
      include: { featureDefinition: true },
    });
  }

  async addClubAddon(input: {
    clubId: string;
    featureDefinitionId: string;
    priceOverride?: number;
  }) {
    // Check if already active
    const existing = await this.prisma.clubAddon.findUnique({
      where: {
        clubId_featureDefinitionId: {
          clubId: input.clubId,
          featureDefinitionId: input.featureDefinitionId,
        },
      },
    });

    if (existing && (!existing.endDate || existing.endDate > new Date())) {
      throw new ConflictException('Add-on is already active for this club');
    }

    return this.prisma.clubAddon.upsert({
      where: {
        clubId_featureDefinitionId: {
          clubId: input.clubId,
          featureDefinitionId: input.featureDefinitionId,
        },
      },
      update: {
        priceOverride: input.priceOverride,
        startDate: new Date(),
        endDate: null,
      },
      create: {
        clubId: input.clubId,
        featureDefinitionId: input.featureDefinitionId,
        priceOverride: input.priceOverride,
        startDate: new Date(),
      },
      include: { featureDefinition: true },
    });
  }

  async removeClubAddon(clubId: string, featureDefinitionId: string) {
    return this.prisma.clubAddon.update({
      where: {
        clubId_featureDefinitionId: { clubId, featureDefinitionId },
      },
      data: { endDate: new Date() },
      include: { featureDefinition: true },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { EventStoreService } from '@/shared/events/event-store.service';

export interface UpdateClubProfileDto {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  primaryColor?: string;
  timezone?: string;
}

export interface UpdateBillingSettingsDto {
  taxRate?: number;
  taxType?: string;
  currency?: string;
  invoicePrefix?: string;
  paymentTermDays?: number;
}

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private eventStore: EventStoreService,
  ) {}

  async getClubProfile(tenantId: string) {
    const club = await this.prisma.club.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        logoUrl: true,
        primaryColor: true,
        timezone: true,
        region: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        maxMembers: true,
        maxUsers: true,
        features: true,
      },
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    return club;
  }

  async updateClubProfile(
    tenantId: string,
    dto: UpdateClubProfileDto,
    userId: string,
    userEmail: string,
  ) {
    const club = await this.prisma.club.update({
      where: { id: tenantId },
      data: {
        name: dto.name,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        website: dto.website,
        logoUrl: dto.logoUrl,
        primaryColor: dto.primaryColor,
        timezone: dto.timezone,
      },
    });

    await this.eventStore.append({
      tenantId,
      aggregateType: 'Settings',
      aggregateId: tenantId,
      type: 'CLUB_PROFILE_UPDATED',
      data: dto,
      userId,
      userEmail,
    });

    return club;
  }

  async getBillingSettings(tenantId: string) {
    const club = await this.prisma.club.findUnique({
      where: { id: tenantId },
      select: {
        taxRate: true,
        taxType: true,
        currency: true,
        settings: true,
      },
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    const settings = club.settings as Record<string, any> || {};

    return {
      taxRate: club.taxRate,
      taxType: club.taxType,
      currency: club.currency,
      invoicePrefix: settings.invoicePrefix || 'INV',
      paymentTermDays: settings.paymentTermDays || 30,
    };
  }

  async updateBillingSettings(
    tenantId: string,
    dto: UpdateBillingSettingsDto,
    userId: string,
    userEmail: string,
  ) {
    const existingClub = await this.prisma.club.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    const existingSettings = (existingClub?.settings as Record<string, any>) || {};

    const club = await this.prisma.club.update({
      where: { id: tenantId },
      data: {
        taxRate: dto.taxRate,
        taxType: dto.taxType,
        currency: dto.currency,
        settings: {
          ...existingSettings,
          invoicePrefix: dto.invoicePrefix,
          paymentTermDays: dto.paymentTermDays,
        },
      },
    });

    await this.eventStore.append({
      tenantId,
      aggregateType: 'Settings',
      aggregateId: tenantId,
      type: 'BILLING_SETTINGS_UPDATED',
      data: dto,
      userId,
      userEmail,
    });

    return this.getBillingSettings(tenantId);
  }

  async getMembershipTypes(tenantId: string) {
    return this.prisma.membershipType.findMany({
      where: { clubId: tenantId },
      include: {
        tiers: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getChargeTypes(tenantId: string) {
    return this.prisma.chargeType.findMany({
      where: { clubId: tenantId },
      orderBy: { category: 'asc' },
    });
  }

  async getFacilities(tenantId: string) {
    return this.prisma.facility.findMany({
      where: { clubId: tenantId },
      include: {
        resources: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getGolfCourses(tenantId: string) {
    return this.prisma.golfCourse.findMany({
      where: { clubId: tenantId },
      include: {
        greenFeeRates: {
          where: { isActive: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { EventStoreService } from '@/shared/events/event-store.service';
import {
  UpdateClubBillingSettingsDto,
  BillingFrequency,
  BillingTiming,
  CycleAlignment,
  ProrationMethod,
  LateFeeType,
} from './dto/club-billing-settings.dto';
import {
  CreateMemberBillingProfileDto,
  UpdateMemberBillingProfileDto,
} from './dto/member-billing-profile.dto';

@Injectable()
export class BillingCycleSettingsService {
  private readonly logger = new Logger(BillingCycleSettingsService.name);

  constructor(
    private prisma: PrismaService,
    private eventStore: EventStoreService,
  ) {}

  // ==================== CLUB SETTINGS ====================

  /**
   * Get club billing settings, creating default settings if none exist
   */
  async getClubBillingSettings(clubId: string) {
    let settings = await this.prisma.clubBillingSettings.findUnique({
      where: { clubId },
      include: { club: true },
    });

    // Create default settings if none exist
    if (!settings) {
      this.logger.log(`Creating default billing settings for club ${clubId}`);
      settings = await this.prisma.clubBillingSettings.create({
        data: {
          clubId,
          defaultFrequency: BillingFrequency.MONTHLY,
          defaultTiming: BillingTiming.ADVANCE,
          defaultAlignment: CycleAlignment.CALENDAR,
          defaultBillingDay: 1,
          invoiceGenerationLead: 5,
          invoiceDueDays: 15,
          gracePeriodDays: 15,
          lateFeeType: LateFeeType.PERCENTAGE,
          lateFeeAmount: 0,
          lateFeePercentage: 1.5,
          maxLateFee: null,
          autoApplyLateFee: false,
          prorateNewMembers: true,
          prorateChanges: true,
          prorationMethod: ProrationMethod.DAILY,
        },
        include: { club: true },
      });
    }

    // Transform Decimal fields to numbers for API response
    return {
      ...settings,
      lateFeeAmount: settings.lateFeeAmount.toNumber(),
      lateFeePercentage: settings.lateFeePercentage.toNumber(),
      maxLateFee: settings.maxLateFee?.toNumber() ?? null,
    };
  }

  /**
   * Update club billing settings
   */
  async updateClubBillingSettings(
    clubId: string,
    dto: UpdateClubBillingSettingsDto,
    userId: string,
    userEmail: string,
  ) {
    // Build update data object with only provided fields
    const updateData: any = {};

    if (dto.defaultFrequency !== undefined) {
      updateData.defaultFrequency = dto.defaultFrequency;
    }
    if (dto.defaultTiming !== undefined) {
      updateData.defaultTiming = dto.defaultTiming;
    }
    if (dto.defaultAlignment !== undefined) {
      updateData.defaultAlignment = dto.defaultAlignment;
    }
    if (dto.defaultBillingDay !== undefined) {
      updateData.defaultBillingDay = dto.defaultBillingDay;
    }
    if (dto.invoiceGenerationLead !== undefined) {
      updateData.invoiceGenerationLead = dto.invoiceGenerationLead;
    }
    if (dto.invoiceDueDays !== undefined) {
      updateData.invoiceDueDays = dto.invoiceDueDays;
    }
    if (dto.gracePeriodDays !== undefined) {
      updateData.gracePeriodDays = dto.gracePeriodDays;
    }
    if (dto.lateFeeType !== undefined) {
      updateData.lateFeeType = dto.lateFeeType;
    }
    if (dto.lateFeeAmount !== undefined) {
      updateData.lateFeeAmount = dto.lateFeeAmount;
    }
    if (dto.lateFeePercentage !== undefined) {
      updateData.lateFeePercentage = dto.lateFeePercentage;
    }
    if (dto.maxLateFee !== undefined) {
      updateData.maxLateFee = dto.maxLateFee;
    }
    if (dto.autoApplyLateFee !== undefined) {
      updateData.autoApplyLateFee = dto.autoApplyLateFee;
    }
    if (dto.prorateNewMembers !== undefined) {
      updateData.prorateNewMembers = dto.prorateNewMembers;
    }
    if (dto.prorateChanges !== undefined) {
      updateData.prorateChanges = dto.prorateChanges;
    }
    if (dto.prorationMethod !== undefined) {
      updateData.prorationMethod = dto.prorationMethod;
    }

    // Upsert settings (create if not exists, update if exists)
    const settings = await this.prisma.clubBillingSettings.upsert({
      where: { clubId },
      create: {
        clubId,
        defaultFrequency: dto.defaultFrequency ?? BillingFrequency.MONTHLY,
        defaultTiming: dto.defaultTiming ?? BillingTiming.ADVANCE,
        defaultAlignment: dto.defaultAlignment ?? CycleAlignment.CALENDAR,
        defaultBillingDay: dto.defaultBillingDay ?? 1,
        invoiceGenerationLead: dto.invoiceGenerationLead ?? 5,
        invoiceDueDays: dto.invoiceDueDays ?? 15,
        gracePeriodDays: dto.gracePeriodDays ?? 15,
        lateFeeType: dto.lateFeeType ?? LateFeeType.PERCENTAGE,
        lateFeeAmount: dto.lateFeeAmount ?? 0,
        lateFeePercentage: dto.lateFeePercentage ?? 1.5,
        maxLateFee: dto.maxLateFee ?? null,
        autoApplyLateFee: dto.autoApplyLateFee ?? false,
        prorateNewMembers: dto.prorateNewMembers ?? true,
        prorateChanges: dto.prorateChanges ?? true,
        prorationMethod: dto.prorationMethod ?? ProrationMethod.DAILY,
      },
      update: updateData,
      include: { club: true },
    });

    // Log to event store
    await this.eventStore.append({
      tenantId: clubId,
      aggregateType: 'ClubBillingSettings',
      aggregateId: settings.id,
      type: 'UPDATED',
      data: dto,
      userId,
      userEmail,
    });

    this.logger.log(`Updated billing settings for club ${clubId}`);

    // Return transformed settings
    return {
      ...settings,
      lateFeeAmount: settings.lateFeeAmount.toNumber(),
      lateFeePercentage: settings.lateFeePercentage.toNumber(),
      maxLateFee: settings.maxLateFee?.toNumber() ?? null,
    };
  }

  // ==================== MEMBER PROFILES ====================

  /**
   * Get member billing profile with member information
   */
  async getMemberBillingProfile(memberId: string) {
    const profile = await this.prisma.memberBillingProfile.findUnique({
      where: { memberId },
      include: {
        member: {
          select: {
            id: true,
            memberId: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
          },
        },
      },
    });

    // Return null if not found (profile may not exist yet)
    return profile;
  }

  /**
   * Create a new member billing profile
   */
  async createMemberBillingProfile(
    dto: CreateMemberBillingProfileDto,
    userId: string,
    userEmail: string,
  ) {
    // Verify member exists
    const member = await this.prisma.member.findUnique({
      where: { id: dto.memberId },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${dto.memberId} not found`);
    }

    // Check if profile already exists
    const existing = await this.prisma.memberBillingProfile.findUnique({
      where: { memberId: dto.memberId },
    });

    if (existing) {
      throw new BadRequestException(
        `Billing profile already exists for member ${dto.memberId}`,
      );
    }

    // Parse nextBillingDate if provided
    const nextBillingDate = dto.nextBillingDate
      ? new Date(dto.nextBillingDate)
      : null;

    // Create profile
    const profile = await this.prisma.memberBillingProfile.create({
      data: {
        memberId: dto.memberId,
        billingFrequency: dto.billingFrequency ?? null,
        billingTiming: dto.billingTiming ?? null,
        billingAlignment: dto.billingAlignment ?? null,
        customBillingDay: dto.customBillingDay ?? null,
        nextBillingDate,
        prorationOverride: dto.prorationOverride ?? null,
        customGracePeriod: dto.customGracePeriod ?? null,
        customLateFeeExempt: dto.customLateFeeExempt ?? false,
      },
      include: {
        member: {
          select: {
            id: true,
            memberId: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
          },
        },
      },
    });

    // Log to event store
    await this.eventStore.append({
      tenantId: member.clubId,
      aggregateType: 'MemberBillingProfile',
      aggregateId: profile.id,
      type: 'CREATED',
      data: {
        memberId: dto.memberId,
        billingFrequency: dto.billingFrequency,
        billingTiming: dto.billingTiming,
      },
      userId,
      userEmail,
    });

    this.logger.log(
      `Created billing profile for member ${dto.memberId} (${member.firstName} ${member.lastName})`,
    );

    return profile;
  }

  /**
   * Update an existing member billing profile
   */
  async updateMemberBillingProfile(
    memberId: string,
    dto: UpdateMemberBillingProfileDto,
    userId: string,
    userEmail: string,
  ) {
    // Verify profile exists
    const existing = await this.prisma.memberBillingProfile.findUnique({
      where: { memberId },
      include: {
        member: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Billing profile not found for member ${memberId}`,
      );
    }

    // Build update data object with only provided fields
    const updateData: any = {};

    if (dto.billingFrequency !== undefined) {
      updateData.billingFrequency = dto.billingFrequency;
    }
    if (dto.billingTiming !== undefined) {
      updateData.billingTiming = dto.billingTiming;
    }
    if (dto.billingAlignment !== undefined) {
      updateData.billingAlignment = dto.billingAlignment;
    }
    if (dto.customBillingDay !== undefined) {
      updateData.customBillingDay = dto.customBillingDay;
    }
    if (dto.nextBillingDate !== undefined) {
      updateData.nextBillingDate = dto.nextBillingDate
        ? new Date(dto.nextBillingDate)
        : null;
    }
    if (dto.prorationOverride !== undefined) {
      updateData.prorationOverride = dto.prorationOverride;
    }
    if (dto.customGracePeriod !== undefined) {
      updateData.customGracePeriod = dto.customGracePeriod;
    }
    if (dto.customLateFeeExempt !== undefined) {
      updateData.customLateFeeExempt = dto.customLateFeeExempt;
    }
    if (dto.billingHold !== undefined) {
      updateData.billingHold = dto.billingHold;
    }
    if (dto.billingHoldReason !== undefined) {
      updateData.billingHoldReason = dto.billingHoldReason;
    }
    if (dto.billingHoldUntil !== undefined) {
      updateData.billingHoldUntil = dto.billingHoldUntil
        ? new Date(dto.billingHoldUntil)
        : null;
    }
    if (dto.notes !== undefined) {
      updateData.notes = dto.notes;
    }

    // Update profile
    const profile = await this.prisma.memberBillingProfile.update({
      where: { memberId },
      data: updateData,
      include: {
        member: {
          select: {
            id: true,
            memberId: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
          },
        },
      },
    });

    // Log to event store
    await this.eventStore.append({
      tenantId: existing.member.clubId,
      aggregateType: 'MemberBillingProfile',
      aggregateId: profile.id,
      type: 'UPDATED',
      data: dto,
      userId,
      userEmail,
    });

    this.logger.log(
      `Updated billing profile for member ${memberId} (${existing.member.firstName} ${existing.member.lastName})`,
    );

    return profile;
  }
}

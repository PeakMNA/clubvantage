import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, NotFoundException } from '@nestjs/common';
import { BillingCycleSettingsService } from '@/modules/billing/billing-cycle-settings.service';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
  ClubBillingSettingsType,
  MemberBillingProfileType,
  BillingPeriodPreview,
  ProrationPreview,
  LateFeePreview,
} from './billing-cycle.types';
import {
  UpdateClubBillingSettingsInput,
  CreateMemberBillingProfileInput,
  UpdateMemberBillingProfileInput,
  ProrationPreviewInput,
  LateFeePreviewInput,
} from './billing-cycle.input';
import {
  calculateNextBillingPeriod,
  BillingCycleConfig,
} from '@/modules/billing/utils/billing-cycle.util';
import {
  calculateProration,
  ProrationConfig,
} from '@/modules/billing/utils/proration.util';
import {
  calculateLateFee,
  LateFeeConfig,
} from '@/modules/billing/utils/late-fee.util';

@Resolver()
@UseGuards(GqlAuthGuard)
export class BillingCycleResolver {
  constructor(
    private readonly billingCycleService: BillingCycleSettingsService,
    private readonly prisma: PrismaService,
  ) {}

  // ==================== CLUB SETTINGS ====================

  @Query(() => ClubBillingSettingsType, {
    name: 'clubBillingSettings',
    description: 'Get club-wide billing configuration settings',
  })
  async getClubBillingSettings(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<ClubBillingSettingsType> {
    const settings = await this.billingCycleService.getClubBillingSettings(
      user.tenantId,
    );
    return settings as ClubBillingSettingsType;
  }

  @Mutation(() => ClubBillingSettingsType, {
    name: 'updateClubBillingSettings',
    description: 'Update club-wide billing configuration settings',
  })
  async updateClubBillingSettings(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UpdateClubBillingSettingsInput,
  ): Promise<ClubBillingSettingsType> {
    const settings = await this.billingCycleService.updateClubBillingSettings(
      user.tenantId,
      input,
      user.sub,
      user.email,
    );
    return settings as ClubBillingSettingsType;
  }

  // ==================== MEMBER PROFILES ====================

  @Query(() => MemberBillingProfileType, {
    nullable: true,
    name: 'memberBillingProfile',
    description: 'Get billing profile for a specific member',
  })
  async getMemberBillingProfile(
    @GqlCurrentUser() user: JwtPayload,
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<MemberBillingProfileType | null> {
    // Verify member belongs to tenant
    const member = await this.prisma.member.findFirst({
      where: {
        id: memberId,
        clubId: user.tenantId,
      },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    // Get the billing profile (may not exist)
    const profile = await this.billingCycleService.getMemberBillingProfile(
      memberId,
    );

    return profile as MemberBillingProfileType | null;
  }

  @Mutation(() => MemberBillingProfileType, {
    name: 'createMemberBillingProfile',
    description: 'Create a billing profile for a member with custom settings',
  })
  async createMemberBillingProfile(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateMemberBillingProfileInput,
  ): Promise<MemberBillingProfileType> {
    // Verify member belongs to tenant
    const member = await this.prisma.member.findFirst({
      where: {
        id: input.memberId,
        clubId: user.tenantId,
      },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${input.memberId} not found`);
    }

    // Convert GraphQL input to DTO format
    const dto = {
      ...input,
      nextBillingDate: input.nextBillingDate?.toISOString(),
    };

    // Create profile
    const profile = await this.billingCycleService.createMemberBillingProfile(
      dto,
      user.sub,
      user.email,
    );

    return profile as MemberBillingProfileType;
  }

  @Mutation(() => MemberBillingProfileType, {
    name: 'updateMemberBillingProfile',
    description: 'Update billing profile for a member',
  })
  async updateMemberBillingProfile(
    @GqlCurrentUser() user: JwtPayload,
    @Args('memberId', { type: () => ID }) memberId: string,
    @Args('input') input: UpdateMemberBillingProfileInput,
  ): Promise<MemberBillingProfileType> {
    // Verify member belongs to tenant
    const member = await this.prisma.member.findFirst({
      where: {
        id: memberId,
        clubId: user.tenantId,
      },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    // Convert GraphQL input to DTO format
    const dto = {
      ...input,
      nextBillingDate: input.nextBillingDate?.toISOString(),
      billingHoldUntil: input.billingHoldUntil?.toISOString(),
    };

    // Update profile
    const profile = await this.billingCycleService.updateMemberBillingProfile(
      memberId,
      dto,
      user.sub,
      user.email,
    );

    return profile as MemberBillingProfileType;
  }

  // ==================== PREVIEW UTILITIES ====================

  @Query(() => BillingPeriodPreview, {
    name: 'previewNextBillingPeriod',
    description:
      'Preview the next billing period dates for a member based on their configuration',
  })
  async previewNextBillingPeriod(
    @GqlCurrentUser() user: JwtPayload,
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<BillingPeriodPreview> {
    // Get member with billing profile
    const member = await this.prisma.member.findFirst({
      where: {
        id: memberId,
        clubId: user.tenantId,
      },
      include: {
        billingProfile: true,
      },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    // Get club settings as fallback
    const clubSettings = await this.billingCycleService.getClubBillingSettings(
      user.tenantId,
    );

    // Build billing cycle configuration (member profile overrides club defaults)
    const config: BillingCycleConfig = {
      frequency:
        (member.billingProfile?.billingFrequency as any) ?? clubSettings.defaultFrequency,
      timing:
        (member.billingProfile?.billingTiming as any) ?? clubSettings.defaultTiming,
      alignment:
        (member.billingProfile?.billingAlignment as any) ?? clubSettings.defaultAlignment,
      billingDay:
        member.billingProfile?.customBillingDay ??
        clubSettings.defaultBillingDay,
      joinDate: member.joinDate ?? undefined,
    };

    // Use calculateNextBillingPeriod utility
    const period = calculateNextBillingPeriod(
      config,
      new Date(),
      clubSettings.invoiceDueDays,
    );

    return {
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      billingDate: period.billingDate,
      dueDate: period.dueDate,
      description: period.description,
    };
  }

  @Query(() => ProrationPreview, {
    name: 'previewProration',
    description: 'Preview prorated amount for a member joining mid-cycle',
  })
  async previewProration(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: ProrationPreviewInput,
  ): Promise<ProrationPreview> {
    // Get member with billing profile
    const member = await this.prisma.member.findFirst({
      where: {
        id: input.memberId,
        clubId: user.tenantId,
      },
      include: {
        billingProfile: true,
      },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${input.memberId} not found`);
    }

    // Get club settings
    const clubSettings = await this.billingCycleService.getClubBillingSettings(
      user.tenantId,
    );

    // Build billing cycle configuration
    const cycleConfig: BillingCycleConfig = {
      frequency:
        (member.billingProfile?.billingFrequency as any) ?? clubSettings.defaultFrequency,
      timing:
        (member.billingProfile?.billingTiming as any) ?? clubSettings.defaultTiming,
      alignment:
        (member.billingProfile?.billingAlignment as any) ?? clubSettings.defaultAlignment,
      billingDay:
        member.billingProfile?.customBillingDay ??
        clubSettings.defaultBillingDay,
      joinDate: member.joinDate ?? undefined,
    };

    // Calculate the current billing period to get period start/end
    const period = calculateNextBillingPeriod(
      cycleConfig,
      input.effectiveDate,
      clubSettings.invoiceDueDays,
    );

    // Build proration configuration
    const prorationConfig: ProrationConfig = {
      method:
        (member.billingProfile?.prorationOverride as any) ??
        clubSettings.prorationMethod,
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      effectiveDate: input.effectiveDate,
      fullPeriodAmount: input.fullPeriodAmount,
    };

    // Use calculateProration utility
    const result = calculateProration(prorationConfig);

    return {
      proratedAmount: result.proratedAmount,
      daysInPeriod: result.daysInPeriod,
      daysProrated: result.daysProrated,
      prorationFactor: result.prorationFactor,
      description: result.description,
    };
  }

  @Query(() => LateFeePreview, {
    name: 'previewLateFee',
    description: 'Preview late fee calculation for an overdue invoice',
  })
  async previewLateFee(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: LateFeePreviewInput,
  ): Promise<LateFeePreview> {
    // Get invoice
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: input.invoiceId,
        clubId: user.tenantId,
      },
      include: {
        member: {
          include: {
            billingProfile: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${input.invoiceId} not found`);
    }

    // Get club settings
    const clubSettings = await this.billingCycleService.getClubBillingSettings(
      user.tenantId,
    );

    // Check if member is exempt from late fees
    const isExempt =
      invoice.member?.billingProfile?.customLateFeeExempt ?? false;

    if (isExempt) {
      return {
        feeAmount: 0,
        daysOverdue: 0,
        appliedDate: input.calculationDate ?? new Date(),
        description: 'Member is exempt from late fees',
        isWithinGracePeriod: true,
      };
    }

    // Build late fee configuration
    const lateFeeConfig: LateFeeConfig = {
      type: clubSettings.lateFeeType as any,
      amount: clubSettings.lateFeeAmount,
      percentage: clubSettings.lateFeePercentage,
      maxFee: clubSettings.maxLateFee ?? undefined,
      gracePeriodDays:
        invoice.member?.billingProfile?.customGracePeriod ??
        clubSettings.gracePeriodDays,
    };

    // Use calculateLateFee utility
    const result = calculateLateFee(
      invoice.balanceDue.toNumber(),
      invoice.dueDate,
      lateFeeConfig,
      input.calculationDate,
    );

    return {
      feeAmount: result.feeAmount,
      daysOverdue: result.daysOverdue,
      appliedDate: result.appliedDate,
      description: result.description,
      isWithinGracePeriod: result.isWithinGracePeriod,
    };
  }
}

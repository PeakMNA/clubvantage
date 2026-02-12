import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';

/**
 * Default feature flags per subscription tier.
 * These define which modules and features are available at each tier level.
 */
const TIER_DEFAULTS: Record<string, ClubFeatureFlags> = {
  STARTER: {
    modules: {
      golf: true,
      bookings: true,
      billing: true,
      marketing: true,
      pos: true,
      reports: true,
    },
    features: {
      golfLottery: false,
      memberWindows: false,
      aiDynamicPricing: false,
      automatedFlows: false,
      memberPricing: false,
      houseAccounts: false,
      whiteLabelApp: false,
      customDomain: false,
    },
    operational: {
      maintenanceMode: false,
      newMemberRegistration: true,
      onlineBooking: true,
      emailCampaigns: true,
    },
  },
  PROFESSIONAL: {
    modules: {
      golf: true,
      bookings: true,
      billing: true,
      marketing: true,
      pos: true,
      reports: true,
    },
    features: {
      golfLottery: true,
      memberWindows: true,
      aiDynamicPricing: false,
      automatedFlows: true,
      memberPricing: true,
      houseAccounts: true,
      whiteLabelApp: false,
      customDomain: false,
    },
    operational: {
      maintenanceMode: false,
      newMemberRegistration: true,
      onlineBooking: true,
      emailCampaigns: true,
    },
  },
  ENTERPRISE: {
    modules: {
      golf: true,
      bookings: true,
      billing: true,
      marketing: true,
      pos: true,
      reports: true,
    },
    features: {
      golfLottery: true,
      memberWindows: true,
      aiDynamicPricing: true,
      automatedFlows: true,
      memberPricing: true,
      houseAccounts: true,
      whiteLabelApp: true,
      customDomain: true,
    },
    operational: {
      maintenanceMode: false,
      newMemberRegistration: true,
      onlineBooking: true,
      emailCampaigns: true,
    },
  },
};

export interface ClubFeatureFlags {
  modules: {
    golf: boolean;
    bookings: boolean;
    billing: boolean;
    marketing: boolean;
    pos: boolean;
    reports: boolean;
  };
  features: {
    golfLottery: boolean;
    memberWindows: boolean;
    aiDynamicPricing: boolean;
    automatedFlows: boolean;
    memberPricing: boolean;
    houseAccounts: boolean;
    whiteLabelApp: boolean;
    customDomain: boolean;
  };
  operational: {
    maintenanceMode: boolean;
    newMemberRegistration: boolean;
    onlineBooking: boolean;
    emailCampaigns: boolean;
  };
}

@Injectable()
export class FeatureFlagsService {
  private readonly logger = new Logger(FeatureFlagsService.name);
  private static readonly CACHE_TTL = 300; // 5 minutes
  private static readonly CACHE_PREFIX = 'feature-flags:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Get resolved feature flags for a club.
   * Merges tier defaults with club-specific overrides from Club.features JSON.
   * Cached in Redis for 5 minutes.
   */
  async getFeatureFlags(clubId: string): Promise<ClubFeatureFlags> {
    const cacheKey = `${FeatureFlagsService.CACHE_PREFIX}${clubId}`;

    return this.redis.cacheAside<ClubFeatureFlags>(
      cacheKey,
      FeatureFlagsService.CACHE_TTL,
      async () => {
        const club = await this.prisma.club.findUnique({
          where: { id: clubId },
          select: {
            subscriptionTier: true,
            features: true,
          },
        });

        if (!club) {
          this.logger.warn(`Club not found: ${clubId}, returning STARTER defaults`);
          return TIER_DEFAULTS.STARTER;
        }

        const tierDefaults = TIER_DEFAULTS[club.subscriptionTier] || TIER_DEFAULTS.STARTER;
        const overrides = (club.features as Record<string, any>) || {};

        return this.mergeFlags(tierDefaults, overrides);
      },
    );
  }

  /**
   * Check if a specific feature is enabled for a club.
   * Accepts dot-notation keys like "features.golfLottery" or "modules.golf".
   */
  async isFeatureEnabled(clubId: string, featureKey: string): Promise<boolean> {
    const flags = await this.getFeatureFlags(clubId);
    const parts = featureKey.split('.');

    let current: any = flags;
    for (const part of parts) {
      if (current === undefined || current === null) return false;
      current = current[part];
    }

    return current === true;
  }

  /**
   * Get default feature flags for a subscription tier.
   */
  getDefaultFlagsForTier(tier: string): ClubFeatureFlags {
    return TIER_DEFAULTS[tier] || TIER_DEFAULTS.STARTER;
  }

  /**
   * Get tier defaults for all subscription tiers.
   * Returns array of tier names with their default feature flags.
   */
  getTierDefaults(): Array<{ tier: string; flags: ClubFeatureFlags }> {
    return Object.entries(TIER_DEFAULTS).map(([tier, flags]) => ({
      tier,
      flags,
    }));
  }

  /**
   * Get all clubs with their resolved feature flags.
   * Used by platform admins to view feature flags across all clubs.
   * Leverages Redis cache for individual club flags.
   */
  async getAllClubsWithFlags(): Promise<
    Array<{
      clubId: string;
      clubName: string;
      subscriptionTier: string;
      flags: ClubFeatureFlags;
      hasOperationalOverrides: boolean;
    }>
  > {
    const clubs = await this.prisma.club.findMany({
      select: {
        id: true,
        name: true,
        subscriptionTier: true,
        features: true,
      },
      orderBy: { name: 'asc' },
    });

    return Promise.all(
      clubs.map(async (club) => {
        const flags = await this.getFeatureFlags(club.id);
        const hasOperationalOverrides =
          club.features !== null &&
          typeof club.features === 'object' &&
          'operational' in club.features &&
          Object.keys((club.features as any).operational || {}).length > 0;

        return {
          clubId: club.id,
          clubName: club.name,
          subscriptionTier: club.subscriptionTier,
          flags,
          hasOperationalOverrides,
        };
      }),
    );
  }

  /**
   * Update an operational flag for a club.
   * Only operational flags can be toggled by staff. Module and feature flags
   * are controlled by the subscription tier.
   */
  async updateOperationalFlag(
    clubId: string,
    key: string,
    value: boolean,
  ): Promise<ClubFeatureFlags> {
    // Validate key is an operational flag
    const validKeys = ['maintenanceMode', 'newMemberRegistration', 'onlineBooking', 'emailCampaigns'];
    if (!validKeys.includes(key)) {
      throw new Error(`Invalid operational flag key: ${key}. Valid keys: ${validKeys.join(', ')}`);
    }

    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      select: { features: true },
    });

    const currentFeatures = (club?.features as Record<string, any>) || {};
    const operational = currentFeatures.operational || {};

    await this.prisma.club.update({
      where: { id: clubId },
      data: {
        features: {
          ...currentFeatures,
          operational: {
            ...operational,
            [key]: value,
          },
        },
      },
    });

    // Invalidate cache
    await this.redis.del(`${FeatureFlagsService.CACHE_PREFIX}${clubId}`);

    return this.getFeatureFlags(clubId);
  }

  /**
   * Merge tier defaults with club-specific overrides.
   * Overrides only apply to operational flags — module and feature flags
   * are determined strictly by the subscription tier.
   */
  private mergeFlags(
    tierDefaults: ClubFeatureFlags,
    overrides: Record<string, any>,
  ): ClubFeatureFlags {
    return {
      modules: { ...tierDefaults.modules },
      features: { ...tierDefaults.features },
      operational: {
        ...tierDefaults.operational,
        ...(overrides.operational || {}),
      },
    };
  }
}

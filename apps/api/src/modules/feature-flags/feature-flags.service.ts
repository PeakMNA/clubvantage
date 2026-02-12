import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';
import { FeatureCategory } from '@prisma/client';

/**
 * Backward-compatible output shape for resolved feature flags.
 * This interface MUST NOT change — existing hooks (useFeatureFlags, useIsFeatureEnabled)
 * in apps/application depend on this exact shape.
 */
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

/** Default operational flag values (used when no override exists) */
const DEFAULT_OPERATIONAL: Record<string, boolean> = {
  maintenanceMode: false,
  newMemberRegistration: true,
  onlineBooking: true,
  emailCampaigns: true,
};

/** All module keys in fixed order */
const MODULE_KEYS = ['golf', 'bookings', 'billing', 'marketing', 'pos', 'reports'] as const;

/** All feature keys in fixed order */
const FEATURE_KEYS = [
  'golfLottery', 'memberWindows', 'aiDynamicPricing', 'automatedFlows',
  'memberPricing', 'houseAccounts', 'whiteLabelApp', 'customDomain',
] as const;

/** All operational keys in fixed order */
const OPERATIONAL_KEYS = ['maintenanceMode', 'newMemberRegistration', 'onlineBooking', 'emailCampaigns'] as const;

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
   * Resolution: ClubPackage → Package → PackageFeatures + ClubAddons + ClubOperationalFlags
   * Falls back to legacy Club.subscriptionTier if no ClubPackage exists yet.
   * Cached in Redis for 5 minutes.
   */
  async getFeatureFlags(clubId: string): Promise<ClubFeatureFlags> {
    const cacheKey = `${FeatureFlagsService.CACHE_PREFIX}${clubId}`;

    return this.redis.cacheAside<ClubFeatureFlags>(
      cacheKey,
      FeatureFlagsService.CACHE_TTL,
      async () => this.resolveFlags(clubId),
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
   * Get default feature flags for a subscription tier / package tier.
   * Now queries the database for the first package matching that tier.
   */
  getDefaultFlagsForTier(tier: string): ClubFeatureFlags {
    // Fallback: return all-false for unknown tiers
    return this.buildEmptyFlags();
  }

  /**
   * Get tier defaults for all package tiers (backward-compatible).
   * Returns an array of { tier, flags } for the Golf vertical packages.
   */
  async getTierDefaults(): Promise<Array<{ tier: string; flags: ClubFeatureFlags }>> {
    const packages = await this.prisma.package.findMany({
      where: {
        isActive: true,
        vertical: { slug: 'golf' },
        tier: { not: 'CUSTOM' },
      },
      include: {
        features: {
          include: { featureDefinition: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return packages.map((pkg) => ({
      tier: pkg.tier,
      flags: this.packageToFlags(pkg.features),
    }));
  }

  /**
   * Get all clubs with their resolved feature flags.
   * Used by platform admins to view feature flags across all clubs.
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
        clubPackage: {
          select: {
            package: {
              select: { tier: true },
            },
          },
        },
        clubOperationalFlags: {
          select: { id: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return Promise.all(
      clubs.map(async (club) => {
        const flags = await this.getFeatureFlags(club.id);
        // Use package tier if available, fall back to legacy subscriptionTier
        const tier = club.clubPackage?.package?.tier || club.subscriptionTier;

        return {
          clubId: club.id,
          clubName: club.name,
          subscriptionTier: tier,
          flags,
          hasOperationalOverrides: club.clubOperationalFlags.length > 0,
        };
      }),
    );
  }

  /**
   * Update an operational flag for a club.
   * Writes to the ClubOperationalFlag table (not Club.features JSON).
   */
  async updateOperationalFlag(
    clubId: string,
    key: string,
    value: boolean,
  ): Promise<ClubFeatureFlags> {
    // Validate key is a known operational flag
    if (!OPERATIONAL_KEYS.includes(key as any)) {
      throw new Error(
        `Invalid operational flag key: ${key}. Valid keys: ${OPERATIONAL_KEYS.join(', ')}`,
      );
    }

    // Find the feature definition for this operational flag
    const featureDef = await this.prisma.featureDefinition.findUnique({
      where: { key },
    });

    if (!featureDef || featureDef.category !== FeatureCategory.OPERATIONAL) {
      throw new Error(`Feature definition not found for operational flag: ${key}`);
    }

    // Upsert the operational flag override
    if (value === DEFAULT_OPERATIONAL[key]) {
      // If setting to default, remove the override
      await this.prisma.clubOperationalFlag.deleteMany({
        where: {
          clubId,
          featureDefinitionId: featureDef.id,
        },
      });
    } else {
      await this.prisma.clubOperationalFlag.upsert({
        where: {
          clubId_featureDefinitionId: {
            clubId,
            featureDefinitionId: featureDef.id,
          },
        },
        update: { enabled: value },
        create: {
          clubId,
          featureDefinitionId: featureDef.id,
          enabled: value,
        },
      });
    }

    // Invalidate cache
    await this.redis.del(`${FeatureFlagsService.CACHE_PREFIX}${clubId}`);

    return this.getFeatureFlags(clubId);
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Resolve flags from the new package tables.
   * Falls back to legacy Club.subscriptionTier + features JSON if no ClubPackage exists.
   */
  private async resolveFlags(clubId: string): Promise<ClubFeatureFlags> {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      select: {
        subscriptionTier: true,
        features: true,
        clubPackage: {
          select: {
            package: {
              select: {
                features: {
                  include: { featureDefinition: true },
                },
              },
            },
          },
        },
        clubAddons: {
          where: {
            OR: [
              { endDate: null },
              { endDate: { gt: new Date() } },
            ],
          },
          select: {
            featureDefinition: {
              select: { key: true, category: true },
            },
          },
        },
        clubOperationalFlags: {
          select: {
            featureDefinition: {
              select: { key: true },
            },
            enabled: true,
          },
        },
      },
    });

    if (!club) {
      this.logger.warn(`Club not found: ${clubId}, returning empty flags`);
      return this.buildEmptyFlags();
    }

    // If club has a ClubPackage, use the new resolution
    if (club.clubPackage) {
      return this.resolveFromPackage(
        club.clubPackage.package.features,
        club.clubAddons,
        club.clubOperationalFlags,
      );
    }

    // Legacy fallback: use hardcoded tier defaults + Club.features JSON overrides
    this.logger.debug(`Club ${clubId} has no ClubPackage, using legacy resolution`);
    return this.legacyResolve(club.subscriptionTier, club.features);
  }

  /**
   * Resolve flags from Package → PackageFeatures + ClubAddons + ClubOperationalFlags.
   */
  private resolveFromPackage(
    packageFeatures: Array<{
      featureDefinition: { key: string; category: FeatureCategory };
      enabled: boolean;
    }>,
    clubAddons: Array<{
      featureDefinition: { key: string; category: FeatureCategory };
    }>,
    clubOperationalFlags: Array<{
      featureDefinition: { key: string };
      enabled: boolean;
    }>,
  ): ClubFeatureFlags {
    // Build enabled feature set from package
    const enabledFromPackage = new Set<string>();
    for (const pf of packageFeatures) {
      if (pf.enabled) {
        enabledFromPackage.add(pf.featureDefinition.key);
      }
    }

    // Add club-level add-ons (always enabled if active)
    for (const addon of clubAddons) {
      enabledFromPackage.add(addon.featureDefinition.key);
    }

    // Build operational flags with overrides
    const operationalOverrides = new Map<string, boolean>();
    for (const flag of clubOperationalFlags) {
      operationalOverrides.set(flag.featureDefinition.key, flag.enabled);
    }

    // Assemble output
    const modules: Record<string, boolean> = {};
    for (const key of MODULE_KEYS) {
      modules[key] = enabledFromPackage.has(key);
    }

    const features: Record<string, boolean> = {};
    for (const key of FEATURE_KEYS) {
      features[key] = enabledFromPackage.has(key);
    }

    const operational: Record<string, boolean> = {};
    for (const key of OPERATIONAL_KEYS) {
      operational[key] = operationalOverrides.has(key)
        ? operationalOverrides.get(key)!
        : DEFAULT_OPERATIONAL[key] ?? false;
    }

    return {
      modules: modules as ClubFeatureFlags['modules'],
      features: features as ClubFeatureFlags['features'],
      operational: operational as ClubFeatureFlags['operational'],
    };
  }

  /**
   * Legacy fallback for clubs without a ClubPackage assignment.
   * Uses the old hardcoded TIER_DEFAULTS approach.
   */
  private legacyResolve(
    subscriptionTier: string,
    featuresJson: any,
  ): ClubFeatureFlags {
    const tierDefaults = LEGACY_TIER_DEFAULTS[subscriptionTier] || LEGACY_TIER_DEFAULTS.STARTER;
    const overrides = (featuresJson as Record<string, any>) || {};

    return {
      modules: { ...tierDefaults.modules },
      features: { ...tierDefaults.features },
      operational: {
        ...tierDefaults.operational,
        ...(overrides.operational || {}),
      },
    };
  }

  private buildEmptyFlags(): ClubFeatureFlags {
    return {
      modules: { golf: false, bookings: false, billing: false, marketing: false, pos: false, reports: false },
      features: { golfLottery: false, memberWindows: false, aiDynamicPricing: false, automatedFlows: false, memberPricing: false, houseAccounts: false, whiteLabelApp: false, customDomain: false },
      operational: { maintenanceMode: false, newMemberRegistration: true, onlineBooking: true, emailCampaigns: true },
    };
  }

  /**
   * Convert PackageFeature rows to the ClubFeatureFlags shape.
   */
  private packageToFlags(
    packageFeatures: Array<{
      featureDefinition: { key: string; category: FeatureCategory };
      enabled: boolean;
    }>,
  ): ClubFeatureFlags {
    return this.resolveFromPackage(packageFeatures, [], []);
  }
}

/**
 * Legacy tier defaults — kept for backward compatibility with clubs
 * that haven't been migrated to the new ClubPackage system yet.
 */
const LEGACY_TIER_DEFAULTS: Record<string, ClubFeatureFlags> = {
  STARTER: {
    modules: { golf: true, bookings: true, billing: true, marketing: true, pos: true, reports: true },
    features: { golfLottery: false, memberWindows: false, aiDynamicPricing: false, automatedFlows: false, memberPricing: false, houseAccounts: false, whiteLabelApp: false, customDomain: false },
    operational: { maintenanceMode: false, newMemberRegistration: true, onlineBooking: true, emailCampaigns: true },
  },
  PROFESSIONAL: {
    modules: { golf: true, bookings: true, billing: true, marketing: true, pos: true, reports: true },
    features: { golfLottery: true, memberWindows: true, aiDynamicPricing: false, automatedFlows: true, memberPricing: true, houseAccounts: true, whiteLabelApp: false, customDomain: false },
    operational: { maintenanceMode: false, newMemberRegistration: true, onlineBooking: true, emailCampaigns: true },
  },
  ENTERPRISE: {
    modules: { golf: true, bookings: true, billing: true, marketing: true, pos: true, reports: true },
    features: { golfLottery: true, memberWindows: true, aiDynamicPricing: true, automatedFlows: true, memberPricing: true, houseAccounts: true, whiteLabelApp: true, customDomain: true },
    operational: { maintenanceMode: false, newMemberRegistration: true, onlineBooking: true, emailCampaigns: true },
  },
};

/**
 * ClubVantage Configurable Packages Seed Script
 * Seeds feature definitions, verticals, packages, package-features,
 * and migrates existing clubs to the new package system.
 *
 * Run standalone: cd database && npx tsx prisma/seed-configurable-packages.ts
 * Also called at the end of seed.ts
 */

import {
  PrismaClient,
  FeatureCategory,
  PackageTier,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

let _prisma: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!_prisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    _prisma = new PrismaClient({ adapter });
  }
  return _prisma;
}

// ============================================================================
// FEATURE DEFINITIONS
// ============================================================================

const MODULE_FEATURES = [
  { key: 'golf', name: 'Golf Management', description: 'Tee sheet, courses, carts, caddies, scoring', sortOrder: 1 },
  { key: 'bookings', name: 'Facility Bookings', description: 'Facility reservations, calendar, equipment', sortOrder: 2 },
  { key: 'billing', name: 'Billing & Invoicing', description: 'Invoices, payments, AR, autopay', sortOrder: 3 },
  { key: 'marketing', name: 'Marketing & Campaigns', description: 'Email campaigns, audiences, AI content', sortOrder: 4 },
  { key: 'pos', name: 'Point of Sale', description: 'POS terminals, outlets, cash management', sortOrder: 5 },
  { key: 'reports', name: 'Reports & Analytics', description: 'Dashboards, custom reports, data export', sortOrder: 6 },
];

const FEATURE_FLAGS = [
  { key: 'golfLottery', name: 'Golf Lottery', description: 'Tee time lottery system for high-demand slots', addonPrice: 99, sortOrder: 1 },
  { key: 'memberWindows', name: 'Member Booking Windows', description: 'Priority booking windows by membership type', addonPrice: 49, sortOrder: 2 },
  { key: 'aiDynamicPricing', name: 'AI Dynamic Pricing', description: 'AI-powered demand-based tee time pricing', addonPrice: 199, sortOrder: 3 },
  { key: 'automatedFlows', name: 'Automated Workflows', description: 'Automated email flows, triggers, sequences', addonPrice: 149, sortOrder: 4 },
  { key: 'memberPricing', name: 'Member-Specific Pricing', description: 'Custom pricing tiers per membership type', addonPrice: 79, sortOrder: 5 },
  { key: 'houseAccounts', name: 'House Accounts', description: 'Member charge accounts with monthly billing', addonPrice: 99, sortOrder: 6 },
  { key: 'whiteLabelApp', name: 'White-Label App', description: 'Custom-branded member mobile app', addonPrice: 299, sortOrder: 7 },
  { key: 'customDomain', name: 'Custom Domain', description: 'Custom domain for member portal', addonPrice: 49, sortOrder: 8 },
];

const OPERATIONAL_FLAGS = [
  { key: 'maintenanceMode', name: 'Maintenance Mode', description: 'Toggle club into maintenance mode', sortOrder: 1 },
  { key: 'newMemberRegistration', name: 'New Member Registration', description: 'Allow new member applications', sortOrder: 2 },
  { key: 'onlineBooking', name: 'Online Booking', description: 'Allow online facility/tee time booking', sortOrder: 3 },
  { key: 'emailCampaigns', name: 'Email Campaigns', description: 'Enable email campaign sending', sortOrder: 4 },
];

// ============================================================================
// TIER → FEATURE MAPPINGS (which features are enabled per tier)
// ============================================================================

const STARTER_FEATURES = new Set([
  // All modules enabled
  'golf', 'bookings', 'billing', 'marketing', 'pos', 'reports',
  // No premium features for starter
]);

const PRO_FEATURES = new Set([
  // All modules enabled
  'golf', 'bookings', 'billing', 'marketing', 'pos', 'reports',
  // Pro-level features
  'golfLottery', 'memberWindows', 'automatedFlows', 'memberPricing', 'houseAccounts',
]);

const ENTERPRISE_FEATURES = new Set([
  // All modules and all features
  'golf', 'bookings', 'billing', 'marketing', 'pos', 'reports',
  'golfLottery', 'memberWindows', 'aiDynamicPricing', 'automatedFlows',
  'memberPricing', 'houseAccounts', 'whiteLabelApp', 'customDomain',
]);

// Map old SubscriptionTier to new PackageTier
const TIER_MAP: Record<string, PackageTier> = {
  STARTER: PackageTier.STARTER,
  PROFESSIONAL: PackageTier.PRO,
  ENTERPRISE: PackageTier.ENTERPRISE,
};

// Map tier to features set
const TIER_FEATURES: Record<string, Set<string>> = {
  STARTER: STARTER_FEATURES,
  PRO: PRO_FEATURES,
  ENTERPRISE: ENTERPRISE_FEATURES,
};

// Default operational flag values
const DEFAULT_OPERATIONAL: Record<string, boolean> = {
  maintenanceMode: false,
  newMemberRegistration: true,
  onlineBooking: true,
  emailCampaigns: true,
};

export async function seedConfigurablePackages(prismaArg?: PrismaClient) {
  const prisma = prismaArg || getPrisma();

  console.log('');
  console.log('📦 Starting configurable packages seed...');

  // ============================================================================
  // 1. FEATURE DEFINITIONS
  // ============================================================================
  console.log('Creating feature definitions...');

  const featureDefs: Record<string, string> = {};

  for (const mod of MODULE_FEATURES) {
    const fd = await prisma.featureDefinition.upsert({
      where: { key: mod.key },
      update: { name: mod.name, description: mod.description, sortOrder: mod.sortOrder },
      create: {
        key: mod.key,
        name: mod.name,
        description: mod.description,
        category: FeatureCategory.MODULE,
        sortOrder: mod.sortOrder,
        isActive: true,
      },
    });
    featureDefs[mod.key] = fd.id;
  }

  for (const feat of FEATURE_FLAGS) {
    const fd = await prisma.featureDefinition.upsert({
      where: { key: feat.key },
      update: { name: feat.name, description: feat.description, addonPrice: feat.addonPrice, sortOrder: feat.sortOrder },
      create: {
        key: feat.key,
        name: feat.name,
        description: feat.description,
        category: FeatureCategory.FEATURE,
        addonPrice: feat.addonPrice,
        sortOrder: feat.sortOrder,
        isActive: true,
      },
    });
    featureDefs[feat.key] = fd.id;
  }

  for (const op of OPERATIONAL_FLAGS) {
    const fd = await prisma.featureDefinition.upsert({
      where: { key: op.key },
      update: { name: op.name, description: op.description, sortOrder: op.sortOrder },
      create: {
        key: op.key,
        name: op.name,
        description: op.description,
        category: FeatureCategory.OPERATIONAL,
        sortOrder: op.sortOrder,
        isActive: true,
      },
    });
    featureDefs[op.key] = fd.id;
  }

  console.log(`✅ Created ${Object.keys(featureDefs).length} feature definitions`);

  // ============================================================================
  // 2. VERTICALS
  // ============================================================================
  console.log('Creating verticals...');

  const golfVertical = await prisma.vertical.upsert({
    where: { slug: 'golf' },
    update: {},
    create: {
      name: 'Golf Club',
      slug: 'golf',
      description: 'Full-service golf clubs with courses, pro shops, and dining',
      sortOrder: 1,
      isActive: true,
    },
  });

  const spaVertical = await prisma.vertical.upsert({
    where: { slug: 'spa' },
    update: {},
    create: {
      name: 'Spa & Wellness',
      slug: 'spa',
      description: 'Spa and wellness centers with treatment rooms and fitness',
      sortOrder: 2,
      isActive: true,
    },
  });

  const sportsVertical = await prisma.vertical.upsert({
    where: { slug: 'sports' },
    update: {},
    create: {
      name: 'Sports Club',
      slug: 'sports',
      description: 'Multi-sport clubs with courts, pools, and fitness facilities',
      sortOrder: 3,
      isActive: true,
    },
  });

  const privateVertical = await prisma.vertical.upsert({
    where: { slug: 'private' },
    update: {},
    create: {
      name: 'Private Club',
      slug: 'private',
      description: 'Exclusive private membership clubs with dining and social events',
      sortOrder: 4,
      isActive: true,
    },
  });

  console.log('✅ Created 4 verticals');

  // ============================================================================
  // 3. PACKAGES (3 tiers per vertical + Custom)
  // ============================================================================
  console.log('Creating packages...');

  const allPackages: Record<string, string> = {};

  const verticals = [
    { vertical: golfVertical, prefix: 'golf' },
    { vertical: spaVertical, prefix: 'spa' },
    { vertical: sportsVertical, prefix: 'sports' },
    { vertical: privateVertical, prefix: 'private' },
  ];

  const tierConfigs = [
    { tier: PackageTier.STARTER, label: 'Starter', basePrice: 2999, annualPrice: 29990, memberLimit: 500, userLimit: 5, features: STARTER_FEATURES },
    { tier: PackageTier.PRO, label: 'Pro', basePrice: 7999, annualPrice: 79990, memberLimit: 2000, userLimit: 20, features: PRO_FEATURES },
    { tier: PackageTier.ENTERPRISE, label: 'Enterprise', basePrice: 19999, annualPrice: 199990, memberLimit: null, userLimit: null, features: ENTERPRISE_FEATURES },
  ];

  for (const { vertical, prefix } of verticals) {
    for (const config of tierConfigs) {
      const slug = `${prefix}-${config.tier.toLowerCase()}`;
      const pkg = await prisma.package.upsert({
        where: { slug },
        update: {},
        create: {
          verticalId: vertical.id,
          name: `${vertical.name} ${config.label}`,
          slug,
          tier: config.tier,
          basePrice: config.basePrice,
          annualPrice: config.annualPrice,
          defaultMemberLimit: config.memberLimit,
          defaultUserLimit: config.userLimit,
          isActive: true,
          sortOrder: tierConfigs.indexOf(config) + 1,
        },
      });
      allPackages[slug] = pkg.id;

      // Create PackageFeature rows
      const allFeatureKeys = [...MODULE_FEATURES.map(m => m.key), ...FEATURE_FLAGS.map(f => f.key)];
      for (const key of allFeatureKeys) {
        const featureDefId = featureDefs[key];
        if (!featureDefId) continue;

        await prisma.packageFeature.upsert({
          where: {
            packageId_featureDefinitionId: {
              packageId: pkg.id,
              featureDefinitionId: featureDefId,
            },
          },
          update: { enabled: config.features.has(key) },
          create: {
            packageId: pkg.id,
            featureDefinitionId: featureDefId,
            enabled: config.features.has(key),
          },
        });
      }
    }

    // Custom package per vertical
    const customSlug = `${prefix}-custom`;
    const customPkg = await prisma.package.upsert({
      where: { slug: customSlug },
      update: {},
      create: {
        verticalId: vertical.id,
        name: `${vertical.name} Custom`,
        slug: customSlug,
        tier: PackageTier.CUSTOM,
        basePrice: 0,
        defaultMemberLimit: null,
        defaultUserLimit: null,
        isActive: true,
        sortOrder: 4,
      },
    });
    allPackages[customSlug] = customPkg.id;
  }

  const packageCount = Object.keys(allPackages).length;
  console.log(`✅ Created ${packageCount} packages (4 verticals × 4 tiers)`);

  // ============================================================================
  // 4. MIGRATE EXISTING CLUBS
  // ============================================================================
  console.log('Migrating existing clubs to packages...');

  const clubs = await prisma.club.findMany({
    select: {
      id: true,
      name: true,
      subscriptionTier: true,
      features: true,
    },
  });

  for (const club of clubs) {
    // Map old tier to new package (use golf vertical as legacy default)
    const newTier = TIER_MAP[club.subscriptionTier] || PackageTier.PRO;
    const packageSlug = `golf-${newTier.toLowerCase()}`;
    const packageId = allPackages[packageSlug];

    if (!packageId) {
      console.warn(`⚠️ No package found for slug: ${packageSlug}, skipping club: ${club.name}`);
      continue;
    }

    // Create ClubPackage (skip if already exists)
    await prisma.clubPackage.upsert({
      where: { clubId: club.id },
      update: {},
      create: {
        clubId: club.id,
        packageId,
        startDate: new Date(),
      },
    });

    // Migrate operational overrides from Club.features JSON → ClubOperationalFlag rows
    const clubFeatures = (club.features as Record<string, any>) || {};
    const operationalOverrides = clubFeatures.operational || {};

    for (const [key, value] of Object.entries(operationalOverrides)) {
      const featureDefId = featureDefs[key];
      if (!featureDefId || typeof value !== 'boolean') continue;

      // Only create override if it differs from default
      if (value !== DEFAULT_OPERATIONAL[key]) {
        await prisma.clubOperationalFlag.upsert({
          where: {
            clubId_featureDefinitionId: {
              clubId: club.id,
              featureDefinitionId: featureDefId,
            },
          },
          update: { enabled: value },
          create: {
            clubId: club.id,
            featureDefinitionId: featureDefId,
            enabled: value,
          },
        });
      }
    }

    console.log(`  ✅ ${club.name} → ${packageSlug}`);
  }

  console.log(`✅ Migrated ${clubs.length} clubs to configurable packages`);
  console.log('📦 Configurable packages seed complete!');
}

// Allow standalone execution
if (require.main === module) {
  const prisma = getPrisma();
  seedConfigurablePackages(prisma)
    .catch((e) => {
      console.error('❌ Configurable packages seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

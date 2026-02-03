/**
 * ClubVantage Lookup Tables Seed Script
 * Seeds default lookup categories and values that clubs can customize
 */

import { PrismaClient } from '@prisma/client';

// Types for seed data
interface LookupValueSeed {
  code: string;
  name: string;
  icon: string;
  color: string;
}

interface LookupCategorySeed {
  code: string;
  name: string;
  description: string;
  isSystem: boolean;
  isGlobal: boolean;
  sortOrder: number;
  values: LookupValueSeed[];
}

// Lookup categories and their default values
const LOOKUP_CATEGORIES: LookupCategorySeed[] = [
  {
    code: 'PLAYER_TYPE',
    name: 'Player Type',
    description: 'Types of players for golf bookings',
    isSystem: true,
    isGlobal: true,
    sortOrder: 1,
    values: [
      { code: 'MEMBER', name: 'Member', icon: 'User', color: '#3B82F6' },
      { code: 'GUEST', name: 'Guest', icon: 'UserPlus', color: '#F59E0B' },
      { code: 'DEPENDENT', name: 'Dependent', icon: 'Users', color: '#14B8A6' },
      { code: 'WALK_UP', name: 'Walk-up', icon: 'Footprints', color: '#A8A29E' },
    ],
  },
  {
    code: 'PAYMENT_METHOD',
    name: 'Payment Method',
    description: 'Available payment methods for transactions',
    isSystem: true,
    isGlobal: true,
    sortOrder: 2,
    values: [
      { code: 'CASH', name: 'Cash', icon: 'Banknote', color: '#22C55E' },
      { code: 'CREDIT_CARD', name: 'Credit Card', icon: 'CreditCard', color: '#3B82F6' },
      { code: 'BANK_TRANSFER', name: 'Bank Transfer', icon: 'Building', color: '#8B5CF6' },
      { code: 'QR_PROMPTPAY', name: 'QR PromptPay', icon: 'QrCode', color: '#06B6D4' },
      { code: 'CHECK', name: 'Check', icon: 'Receipt', color: '#64748B' },
      { code: 'MEMBER_ACCOUNT', name: 'Member Account', icon: 'Wallet', color: '#F59E0B' },
    ],
  },
  {
    code: 'BLOCK_TYPE',
    name: 'Block Type',
    description: 'Types of time blocks for schedules (clubs can add custom)',
    isSystem: false,
    isGlobal: true,
    sortOrder: 3,
    values: [
      { code: 'MAINTENANCE', name: 'Maintenance', icon: 'Wrench', color: '#EF4444' },
      { code: 'TOURNAMENT', name: 'Tournament', icon: 'Trophy', color: '#F59E0B' },
      { code: 'WEATHER', name: 'Weather', icon: 'CloudRain', color: '#6366F1' },
      { code: 'PRIVATE', name: 'Private Event', icon: 'Lock', color: '#EC4899' },
      { code: 'STARTER', name: 'Starter Block', icon: 'Flag', color: '#10B981' },
    ],
  },
  {
    code: 'SKILL_LEVEL',
    name: 'Skill Level',
    description: 'Player skill levels for activities',
    isSystem: false,
    isGlobal: true,
    sortOrder: 4,
    values: [
      { code: 'BEGINNER', name: 'Beginner', icon: 'CircleDot', color: '#22C55E' },
      { code: 'INTERMEDIATE', name: 'Intermediate', icon: 'Target', color: '#3B82F6' },
      { code: 'ADVANCED', name: 'Advanced', icon: 'Flame', color: '#F59E0B' },
      { code: 'EXPERT', name: 'Expert', icon: 'Award', color: '#EF4444' },
    ],
  },
  {
    code: 'EQUIPMENT_CONDITION',
    name: 'Equipment Condition',
    description: 'Condition status for equipment and inventory',
    isSystem: true,
    isGlobal: true,
    sortOrder: 5,
    values: [
      { code: 'EXCELLENT', name: 'Excellent', icon: 'Sparkles', color: '#22C55E' },
      { code: 'GOOD', name: 'Good', icon: 'ThumbsUp', color: '#3B82F6' },
      { code: 'FAIR', name: 'Fair', icon: 'Minus', color: '#F59E0B' },
      { code: 'NEEDS_REPAIR', name: 'Needs Repair', icon: 'AlertTriangle', color: '#EF4444' },
      { code: 'OUT_OF_SERVICE', name: 'Out of Service', icon: 'XCircle', color: '#64748B' },
    ],
  },
];

/**
 * Seed lookup categories and their default values
 * Uses upsert pattern to avoid duplicates on re-run
 */
export async function seedLookups(prisma: PrismaClient): Promise<void> {
  console.log('Seeding lookup categories and values...');

  for (const category of LOOKUP_CATEGORIES) {
    // Upsert the category
    const upsertedCategory = await prisma.lookupCategory.upsert({
      where: { code: category.code },
      create: {
        code: category.code,
        name: category.name,
        description: category.description,
        isSystem: category.isSystem,
        isGlobal: category.isGlobal,
        sortOrder: category.sortOrder,
      },
      update: {
        name: category.name,
        description: category.description,
        isSystem: category.isSystem,
        isGlobal: category.isGlobal,
        sortOrder: category.sortOrder,
      },
    });

    console.log(`  Category: ${upsertedCategory.name} (${upsertedCategory.code})`);

    // Upsert each value in the category
    // PostgreSQL's ON CONFLICT doesn't work well with NULL values in unique constraints,
    // so we use a check-then-insert/update pattern
    for (let i = 0; i < category.values.length; i++) {
      const value = category.values[i];

      // Check if value already exists (global values have clubId = null)
      const existing = await prisma.lookupValue.findFirst({
        where: {
          categoryId: upsertedCategory.id,
          clubId: null,
          code: value.code,
        },
      });

      if (existing) {
        // Update existing value
        await prisma.lookupValue.update({
          where: { id: existing.id },
          data: {
            name: value.name,
            icon: value.icon,
            color: value.color,
            sortOrder: i + 1,
          },
        });
      } else {
        // Create new value
        await prisma.lookupValue.create({
          data: {
            categoryId: upsertedCategory.id,
            clubId: null,
            code: value.code,
            name: value.name,
            icon: value.icon,
            color: value.color,
            sortOrder: i + 1,
            isActive: true,
            isDefault: i === 0,
            metadata: {},
          },
        });
      }

      console.log(`    - ${value.name} (${value.code})`);
    }
  }

  // Log summary
  const categoryCount = await prisma.lookupCategory.count();
  const valueCount = await prisma.lookupValue.count();
  console.log(`Seeded ${categoryCount} lookup categories with ${valueCount} values`);
}

// Allow running standalone
if (require.main === module) {
  const { PrismaPg } = require('@prisma/adapter-pg');
  require('dotenv/config');

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  seedLookups(prisma)
    .then(() => {
      console.log('Lookup seed completed successfully!');
    })
    .catch((e) => {
      console.error('Lookup seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

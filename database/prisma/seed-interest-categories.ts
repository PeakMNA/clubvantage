/**
 * ClubVantage Interest Categories Seed Script
 * Seeds default interest categories for member engagement tracking
 *
 * Run with: npx ts-node prisma/seed-interest-categories.ts
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORIES = [
  { code: 'GOLF', name: 'Golf', icon: 'Flag', color: '#10B981', description: 'Golf courses, driving range, lessons' },
  { code: 'TENNIS', name: 'Tennis', icon: 'CircleDot', color: '#3B82F6', description: 'Tennis courts, lessons, tournaments' },
  { code: 'SQUASH', name: 'Squash', icon: 'Square', color: '#8B5CF6', description: 'Squash courts and programs' },
  { code: 'FITNESS', name: 'Fitness', icon: 'Dumbbell', color: '#EF4444', description: 'Gym, fitness classes, personal training' },
  { code: 'SWIMMING', name: 'Swimming', icon: 'Waves', color: '#06B6D4', description: 'Pool access, swim lessons, aqua classes' },
  { code: 'SPA', name: 'Spa & Wellness', icon: 'Sparkles', color: '#EC4899', description: 'Spa treatments, massage, wellness programs' },
  { code: 'DINING', name: 'Dining', icon: 'UtensilsCrossed', color: '#F59E0B', description: 'Restaurants, bars, private dining' },
  { code: 'SOCIAL', name: 'Social Events', icon: 'Users', color: '#6366F1', description: 'Club events, parties, networking' },
  { code: 'KIDS', name: 'Kids & Family', icon: 'Baby', color: '#14B8A6', description: 'Kids camps, family programs, childcare' },
];

async function main() {
  console.log('🎯 Starting interest categories seed...');

  // Get the demo club
  const club = await prisma.club.findFirst({
    where: { slug: 'royal-bangkok-club' },
  });

  if (!club) {
    console.error('❌ Demo club not found. Run the main seed first.');
    process.exit(1);
  }

  console.log(`📍 Found club: ${club.name}`);

  // Create interest categories
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
    const category = DEFAULT_CATEGORIES[i];

    // Check if already exists
    const existing = await prisma.interestCategory.findUnique({
      where: {
        clubId_code: {
          clubId: club.id,
          code: category.code,
        },
      },
    });

    if (existing) {
      console.log(`  ⏭️  Skipping ${category.name} (already exists)`);
      skipped++;
      continue;
    }

    await prisma.interestCategory.create({
      data: {
        clubId: club.id,
        code: category.code,
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        sortOrder: i,
        isActive: true,
      },
    });

    console.log(`  ✅ Created ${category.name}`);
    created++;
  }

  // Summary
  const totalCategories = await prisma.interestCategory.count({
    where: { clubId: club.id },
  });

  console.log('\n📈 Interest Categories Summary:');
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total in database: ${totalCategories}`);

  console.log('\n✨ Interest categories seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

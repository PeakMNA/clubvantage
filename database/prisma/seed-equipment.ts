/**
 * ClubVantage Equipment Seed Script
 * Seeds equipment categories and items for rental and resource management
 *
 * Run with: npx ts-node prisma/seed-equipment.ts
 */

import {
  PrismaClient,
  EquipmentAttachmentType,
  EquipmentCondition,
  EquipmentStatus,
  OperationType,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface EquipmentCategorySeed {
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  operationType: OperationType;
  attachmentType: EquipmentAttachmentType;
  defaultRentalRate?: number;
  requiresDeposit: boolean;
  depositAmount?: number;
}

interface EquipmentItemSeed {
  categoryCode: string;
  assetNumber: string;
  name: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  condition: EquipmentCondition;
  status: EquipmentStatus;
  location?: string;
  notes?: string;
}

const EQUIPMENT_CATEGORIES: EquipmentCategorySeed[] = [
  // Golf Equipment
  {
    code: 'GOLF_CARTS',
    name: 'Golf Carts',
    description: 'Electric and gas-powered golf carts for course navigation',
    icon: 'Car',
    color: '#10B981', // emerald
    operationType: OperationType.GOLF,
    attachmentType: EquipmentAttachmentType.OPTIONAL_ADDON,
    defaultRentalRate: 800,
    requiresDeposit: false,
  },
  {
    code: 'GOLF_CLUBS',
    name: 'Golf Club Sets',
    description: 'Rental golf club sets for members and guests',
    icon: 'Flag',
    color: '#3B82F6', // blue
    operationType: OperationType.GOLF,
    attachmentType: EquipmentAttachmentType.OPTIONAL_ADDON,
    defaultRentalRate: 500,
    requiresDeposit: true,
    depositAmount: 2000,
  },
  {
    code: 'PULL_CARTS',
    name: 'Pull Carts',
    description: 'Manual pull/push golf bag carts',
    icon: 'ShoppingCart',
    color: '#6366F1', // indigo
    operationType: OperationType.GOLF,
    attachmentType: EquipmentAttachmentType.OPTIONAL_ADDON,
    defaultRentalRate: 200,
    requiresDeposit: false,
  },
  {
    code: 'RANGE_BALLS',
    name: 'Range Balls',
    description: 'Practice range ball buckets',
    icon: 'Circle',
    color: '#F59E0B', // amber
    operationType: OperationType.GOLF,
    attachmentType: EquipmentAttachmentType.OPTIONAL_ADDON,
    defaultRentalRate: 150,
    requiresDeposit: false,
  },
  // Tennis Equipment (Facility)
  {
    code: 'TENNIS_RACKETS',
    name: 'Tennis Rackets',
    description: 'Rental tennis rackets',
    icon: 'CircleDot',
    color: '#EF4444', // red
    operationType: OperationType.FACILITY,
    attachmentType: EquipmentAttachmentType.OPTIONAL_ADDON,
    defaultRentalRate: 200,
    requiresDeposit: true,
    depositAmount: 1000,
  },
  {
    code: 'TENNIS_BALLS',
    name: 'Tennis Ball Canisters',
    description: 'Tennis ball canisters for court play',
    icon: 'Circle',
    color: '#84CC16', // lime
    operationType: OperationType.FACILITY,
    attachmentType: EquipmentAttachmentType.OPTIONAL_ADDON,
    defaultRentalRate: 100,
    requiresDeposit: false,
  },
  // Event Equipment (Required Resources)
  {
    code: 'PROJECTORS',
    name: 'Projectors',
    description: 'LCD projectors for meeting rooms',
    icon: 'Projector',
    color: '#8B5CF6', // violet
    operationType: OperationType.EVENT,
    attachmentType: EquipmentAttachmentType.REQUIRED_RESOURCE,
    defaultRentalRate: 500,
    requiresDeposit: false,
  },
  {
    code: 'AUDIO_SYSTEMS',
    name: 'Audio Systems',
    description: 'Portable PA and sound systems',
    icon: 'Speaker',
    color: '#EC4899', // pink
    operationType: OperationType.EVENT,
    attachmentType: EquipmentAttachmentType.REQUIRED_RESOURCE,
    defaultRentalRate: 800,
    requiresDeposit: false,
  },
  {
    code: 'TABLES',
    name: 'Event Tables',
    description: 'Folding tables for events and functions',
    icon: 'Table2',
    color: '#14B8A6', // teal
    operationType: OperationType.EVENT,
    attachmentType: EquipmentAttachmentType.REQUIRED_RESOURCE,
    defaultRentalRate: 50,
    requiresDeposit: false,
  },
  {
    code: 'CHAIRS',
    name: 'Event Chairs',
    description: 'Stackable chairs for events',
    icon: 'Armchair',
    color: '#64748B', // slate
    operationType: OperationType.EVENT,
    attachmentType: EquipmentAttachmentType.REQUIRED_RESOURCE,
    defaultRentalRate: 20,
    requiresDeposit: false,
  },
];

const EQUIPMENT_ITEMS: EquipmentItemSeed[] = [
  // Golf Carts
  {
    categoryCode: 'GOLF_CARTS',
    assetNumber: 'GC-001',
    name: 'Cart #1 - White',
    manufacturer: 'Club Car',
    model: 'Precedent i3',
    serialNumber: 'CC2024-001',
    condition: EquipmentCondition.GOOD,
    status: EquipmentStatus.AVAILABLE,
    location: 'Cart Barn',
  },
  {
    categoryCode: 'GOLF_CARTS',
    assetNumber: 'GC-002',
    name: 'Cart #2 - White',
    manufacturer: 'Club Car',
    model: 'Precedent i3',
    serialNumber: 'CC2024-002',
    condition: EquipmentCondition.EXCELLENT,
    status: EquipmentStatus.AVAILABLE,
    location: 'Cart Barn',
  },
  {
    categoryCode: 'GOLF_CARTS',
    assetNumber: 'GC-003',
    name: 'Cart #3 - White',
    manufacturer: 'Club Car',
    model: 'Precedent i3',
    serialNumber: 'CC2024-003',
    condition: EquipmentCondition.GOOD,
    status: EquipmentStatus.AVAILABLE,
    location: 'Cart Barn',
  },
  {
    categoryCode: 'GOLF_CARTS',
    assetNumber: 'GC-004',
    name: 'Cart #4 - White',
    manufacturer: 'Club Car',
    model: 'Onward 2',
    serialNumber: 'CC2023-001',
    condition: EquipmentCondition.FAIR,
    status: EquipmentStatus.MAINTENANCE,
    location: 'Maintenance Shop',
    notes: 'Battery replacement scheduled',
  },
  // Golf Club Sets
  {
    categoryCode: 'GOLF_CLUBS',
    assetNumber: 'RC-001',
    name: 'Men\'s Full Set - Callaway',
    manufacturer: 'Callaway',
    model: 'Strata Ultimate',
    condition: EquipmentCondition.GOOD,
    status: EquipmentStatus.AVAILABLE,
    location: 'Pro Shop',
  },
  {
    categoryCode: 'GOLF_CLUBS',
    assetNumber: 'RC-002',
    name: 'Men\'s Full Set - TaylorMade',
    manufacturer: 'TaylorMade',
    model: 'RBZ SpeedLite',
    condition: EquipmentCondition.EXCELLENT,
    status: EquipmentStatus.AVAILABLE,
    location: 'Pro Shop',
  },
  {
    categoryCode: 'GOLF_CLUBS',
    assetNumber: 'RC-003',
    name: 'Women\'s Full Set - Callaway',
    manufacturer: 'Callaway',
    model: 'Strata Plus',
    condition: EquipmentCondition.GOOD,
    status: EquipmentStatus.AVAILABLE,
    location: 'Pro Shop',
  },
  {
    categoryCode: 'GOLF_CLUBS',
    assetNumber: 'RC-004',
    name: 'Junior Set - US Kids',
    manufacturer: 'US Kids Golf',
    model: 'UL63',
    condition: EquipmentCondition.GOOD,
    status: EquipmentStatus.AVAILABLE,
    location: 'Pro Shop',
  },
  // Pull Carts
  {
    categoryCode: 'PULL_CARTS',
    assetNumber: 'PC-001',
    name: 'Pull Cart #1',
    manufacturer: 'Clicgear',
    model: '3.5+',
    condition: EquipmentCondition.GOOD,
    status: EquipmentStatus.AVAILABLE,
    location: 'Cart Barn',
  },
  {
    categoryCode: 'PULL_CARTS',
    assetNumber: 'PC-002',
    name: 'Pull Cart #2',
    manufacturer: 'Clicgear',
    model: '3.5+',
    condition: EquipmentCondition.GOOD,
    status: EquipmentStatus.AVAILABLE,
    location: 'Cart Barn',
  },
  {
    categoryCode: 'PULL_CARTS',
    assetNumber: 'PC-003',
    name: 'Pull Cart #3',
    manufacturer: 'Bag Boy',
    model: 'Nitron',
    condition: EquipmentCondition.FAIR,
    status: EquipmentStatus.AVAILABLE,
    location: 'Cart Barn',
  },
  // Tennis Rackets
  {
    categoryCode: 'TENNIS_RACKETS',
    assetNumber: 'TR-001',
    name: 'Racket #1 - Wilson',
    manufacturer: 'Wilson',
    model: 'Clash 100',
    condition: EquipmentCondition.GOOD,
    status: EquipmentStatus.AVAILABLE,
    location: 'Tennis Pro Shop',
  },
  {
    categoryCode: 'TENNIS_RACKETS',
    assetNumber: 'TR-002',
    name: 'Racket #2 - Head',
    manufacturer: 'Head',
    model: 'Speed MP',
    condition: EquipmentCondition.EXCELLENT,
    status: EquipmentStatus.AVAILABLE,
    location: 'Tennis Pro Shop',
  },
  {
    categoryCode: 'TENNIS_RACKETS',
    assetNumber: 'TR-003',
    name: 'Racket #3 - Babolat',
    manufacturer: 'Babolat',
    model: 'Pure Aero',
    condition: EquipmentCondition.GOOD,
    status: EquipmentStatus.AVAILABLE,
    location: 'Tennis Pro Shop',
  },
  // Projectors
  {
    categoryCode: 'PROJECTORS',
    assetNumber: 'PJ-001',
    name: 'Epson Projector #1',
    manufacturer: 'Epson',
    model: 'PowerLite 1781W',
    serialNumber: 'EP2023-001',
    condition: EquipmentCondition.EXCELLENT,
    status: EquipmentStatus.AVAILABLE,
    location: 'AV Storage',
  },
  {
    categoryCode: 'PROJECTORS',
    assetNumber: 'PJ-002',
    name: 'Epson Projector #2',
    manufacturer: 'Epson',
    model: 'PowerLite 1795F',
    serialNumber: 'EP2022-003',
    condition: EquipmentCondition.GOOD,
    status: EquipmentStatus.AVAILABLE,
    location: 'AV Storage',
  },
  // Audio Systems
  {
    categoryCode: 'AUDIO_SYSTEMS',
    assetNumber: 'PA-001',
    name: 'Portable PA System',
    manufacturer: 'JBL',
    model: 'EON ONE Compact',
    serialNumber: 'JBL2023-001',
    condition: EquipmentCondition.EXCELLENT,
    status: EquipmentStatus.AVAILABLE,
    location: 'AV Storage',
  },
  {
    categoryCode: 'AUDIO_SYSTEMS',
    assetNumber: 'PA-002',
    name: 'Wireless Microphone Set',
    manufacturer: 'Shure',
    model: 'BLX24/SM58',
    condition: EquipmentCondition.GOOD,
    status: EquipmentStatus.AVAILABLE,
    location: 'AV Storage',
  },
];

async function main() {
  console.log('🔧 Starting equipment seed...');

  // Get the demo club
  const club = await prisma.club.findFirst({
    where: { slug: 'royal-bangkok-club' },
  });

  if (!club) {
    console.error('❌ Demo club not found. Run the main seed first.');
    process.exit(1);
  }

  console.log(`📍 Found club: ${club.name}`);

  // Create equipment categories
  console.log('\n📦 Creating equipment categories...');
  const categoryMap = new Map<string, string>();
  let categoriesCreated = 0;
  let categoriesSkipped = 0;

  for (let i = 0; i < EQUIPMENT_CATEGORIES.length; i++) {
    const cat = EQUIPMENT_CATEGORIES[i];

    const existing = await prisma.equipmentCategory.findUnique({
      where: { clubId_code: { clubId: club.id, code: cat.code } },
    });

    if (existing) {
      // Update existing category with operationType
      await prisma.equipmentCategory.update({
        where: { id: existing.id },
        data: { operationType: cat.operationType },
      });
      console.log(`  🔄 Updated ${cat.name} with operationType: ${cat.operationType}`);
      categoryMap.set(cat.code, existing.id);
      categoriesSkipped++;
      continue;
    }

    const created = await prisma.equipmentCategory.create({
      data: {
        clubId: club.id,
        code: cat.code,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        operationType: cat.operationType,
        attachmentType: cat.attachmentType,
        defaultRentalRate: cat.defaultRentalRate,
        requiresDeposit: cat.requiresDeposit,
        depositAmount: cat.depositAmount,
        sortOrder: i,
        isActive: true,
      },
    });

    categoryMap.set(cat.code, created.id);
    console.log(`  ✅ Created ${cat.name}`);
    categoriesCreated++;
  }

  // Create equipment items
  console.log('\n🛠️  Creating equipment items...');
  let itemsCreated = 0;
  let itemsSkipped = 0;

  for (const item of EQUIPMENT_ITEMS) {
    const categoryId = categoryMap.get(item.categoryCode);

    if (!categoryId) {
      console.log(`  ⚠️  Skipping ${item.name} - category not found`);
      continue;
    }

    const existing = await prisma.equipment.findUnique({
      where: { clubId_assetNumber: { clubId: club.id, assetNumber: item.assetNumber } },
    });

    if (existing) {
      console.log(`  ⏭️  Skipping ${item.name} (already exists)`);
      itemsSkipped++;
      continue;
    }

    await prisma.equipment.create({
      data: {
        clubId: club.id,
        categoryId,
        assetNumber: item.assetNumber,
        name: item.name,
        manufacturer: item.manufacturer,
        model: item.model,
        serialNumber: item.serialNumber,
        condition: item.condition,
        status: item.status,
        location: item.location,
        notes: item.notes,
      },
    });

    console.log(`  ✅ Created ${item.name}`);
    itemsCreated++;
  }

  // Summary
  const totalCategories = await prisma.equipmentCategory.count({
    where: { clubId: club.id },
  });

  const totalItems = await prisma.equipment.count({
    where: { clubId: club.id },
  });

  const availableItems = await prisma.equipment.count({
    where: { clubId: club.id, status: EquipmentStatus.AVAILABLE },
  });

  console.log('\n📊 Equipment Summary:');
  console.log(`   Categories: ${categoriesCreated} created, ${categoriesSkipped} skipped, ${totalCategories} total`);
  console.log(`   Items: ${itemsCreated} created, ${itemsSkipped} skipped, ${totalItems} total`);
  console.log(`   Available items: ${availableItems}`);

  console.log('\n✨ Equipment seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

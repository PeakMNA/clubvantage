/**
 * Data migration: ProshopProduct -> Product
 *
 * This script migrates existing ProshopCategory, ProshopProduct, and ProshopVariant
 * records to the new unified Product, ProductCategory, and ProductVariant models.
 * It also creates default outlet configurations for the migrated products.
 *
 * Run with: npx ts-node database/prisma/migrations/migrate-proshop-to-products.ts
 *
 * Prerequisites:
 * - The new schema models (Product, ProductCategory, etc.) must be deployed
 * - This script should be run once per environment after schema deployment
 *
 * What this migration does:
 * 1. Migrates ProshopCategory -> ProductCategory (preserving hierarchy as flat categories)
 * 2. Migrates ProshopProduct -> Product (with proper ProductType assignment)
 * 3. Migrates ProshopVariant -> ProductVariant
 * 4. Creates default OutletProductConfig for each product/outlet combination
 * 5. Creates default OutletGridConfig for each outlet
 * 6. Creates default SmartSuggestionConfig for each outlet
 */

import { PrismaClient, ProductType, TaxType } from '@prisma/client';

const prisma = new PrismaClient();

interface MigrationStats {
  categoriesMigrated: number;
  productsMigrated: number;
  variantsMigrated: number;
  outletConfigsCreated: number;
  gridConfigsCreated: number;
  suggestionConfigsCreated: number;
  errors: string[];
}

async function migrateClub(clubId: string, clubName: string): Promise<MigrationStats> {
  const stats: MigrationStats = {
    categoriesMigrated: 0,
    productsMigrated: 0,
    variantsMigrated: 0,
    outletConfigsCreated: 0,
    gridConfigsCreated: 0,
    suggestionConfigsCreated: 0,
    errors: [],
  };

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Migrating club: ${clubName} (${clubId})`);
  console.log('='.repeat(60));

  // 1. Migrate ProshopCategory -> ProductCategory
  console.log('\n[Step 1/4] Migrating categories...');
  const oldCategories = await prisma.proshopCategory.findMany({
    where: { clubId },
    orderBy: { sortOrder: 'asc' },
  });

  const categoryIdMap = new Map<string, string>();

  for (const oldCat of oldCategories) {
    try {
      // Check if category with same name already exists
      const existing = await prisma.productCategory.findFirst({
        where: { clubId, name: oldCat.name },
      });

      if (existing) {
        categoryIdMap.set(oldCat.id, existing.id);
        console.log(`  [SKIP] Category "${oldCat.name}" already exists -> ${existing.id}`);
        continue;
      }

      const newCat = await prisma.productCategory.create({
        data: {
          clubId: oldCat.clubId,
          name: oldCat.name,
          description: oldCat.description,
          sortOrder: oldCat.sortOrder,
          isActive: oldCat.isActive,
          // parentId is null (flat structure for migrated categories)
          // color and iconName are null (can be set later in admin UI)
        },
      });
      categoryIdMap.set(oldCat.id, newCat.id);
      stats.categoriesMigrated++;
      console.log(`  [OK] Category "${oldCat.name}" -> ${newCat.id}`);
    } catch (error) {
      const message = `Failed to migrate category "${oldCat.name}": ${error}`;
      stats.errors.push(message);
      console.error(`  [ERROR] ${message}`);
    }
  }

  // 2. Migrate ProshopProduct -> Product
  console.log('\n[Step 2/4] Migrating products...');
  const oldProducts = await prisma.proshopProduct.findMany({
    where: { clubId },
    include: { variants: true },
    orderBy: { name: 'asc' },
  });

  const productIdMap = new Map<string, string>();

  for (const oldProd of oldProducts) {
    try {
      const newCategoryId = categoryIdMap.get(oldProd.categoryId);
      if (!newCategoryId) {
        const message = `Skipping product "${oldProd.name}": category ${oldProd.categoryId} not found in mapping`;
        stats.errors.push(message);
        console.warn(`  [WARN] ${message}`);
        continue;
      }

      // Check if product with same SKU already exists
      if (oldProd.sku) {
        const existing = await prisma.product.findFirst({
          where: { clubId, sku: oldProd.sku },
        });

        if (existing) {
          productIdMap.set(oldProd.id, existing.id);
          console.log(`  [SKIP] Product "${oldProd.name}" (SKU: ${oldProd.sku}) already exists -> ${existing.id}`);
          continue;
        }
      }

      // Determine product type based on variants
      const hasVariants = oldProd.variants.length > 0;
      const productType = hasVariants ? ProductType.VARIABLE : ProductType.SIMPLE;

      // Calculate sort priority based on isQuickAdd flag
      // Lower numbers = higher priority
      const sortPriority = oldProd.isQuickAdd ? 10 : 50;

      // Determine tax configuration
      // If useCategoryDefaults was true, we use the old category's defaults
      let taxRate = oldProd.taxRate;
      let taxType = oldProd.taxType;

      if (oldProd.useCategoryDefaults) {
        const oldCategory = oldCategories.find((c) => c.id === oldProd.categoryId);
        if (oldCategory) {
          taxRate = oldCategory.defaultTaxRate;
          taxType = oldCategory.defaultTaxType;
        }
      }

      const newProd = await prisma.product.create({
        data: {
          clubId: oldProd.clubId,
          categoryId: newCategoryId,
          name: oldProd.name,
          description: oldProd.description,
          sku: oldProd.sku,
          productType,
          basePrice: oldProd.price,
          taxRate,
          taxType,
          isActive: oldProd.isActive,
          sortPriority,
          // New fields default to null/false:
          // - costPrice: null (not tracked in old system)
          // - durationMinutes: null (retail product, not service)
          // - trackInventory: false
          // - imageUrl: null
        },
      });

      productIdMap.set(oldProd.id, newProd.id);
      stats.productsMigrated++;
      console.log(`  [OK] Product "${oldProd.name}" (${productType}) -> ${newProd.id}`);

      // 3. Migrate variants for this product
      for (const oldVar of oldProd.variants) {
        try {
          await prisma.productVariant.create({
            data: {
              productId: newProd.id,
              name: oldVar.name,
              sku: oldVar.sku,
              priceAdjustment: oldVar.priceAdjustment,
              // New fields:
              // - attributes: {} (default JSON object)
              // - stockQuantity: null
              // - imageUrl: null
              // - sortOrder: 0
              // - isActive: true
            },
          });
          stats.variantsMigrated++;
          console.log(`    [OK] Variant "${oldVar.name}"`);
        } catch (error) {
          const message = `Failed to migrate variant "${oldVar.name}" for product "${oldProd.name}": ${error}`;
          stats.errors.push(message);
          console.error(`    [ERROR] ${message}`);
        }
      }
    } catch (error) {
      const message = `Failed to migrate product "${oldProd.name}": ${error}`;
      stats.errors.push(message);
      console.error(`  [ERROR] ${message}`);
    }
  }

  // 4. Create outlet configurations
  console.log('\n[Step 3/4] Creating outlet configurations...');
  const outlets = await prisma.pOSOutlet.findMany({
    where: { clubId },
  });

  const products = await prisma.product.findMany({
    where: { clubId },
  });

  for (const outlet of outlets) {
    console.log(`\n  Outlet: ${outlet.name} (${outlet.code})`);

    // Create OutletProductConfig for each product
    for (const product of products) {
      try {
        // Check if config already exists
        const existing = await prisma.outletProductConfig.findUnique({
          where: {
            outletId_productId: {
              outletId: outlet.id,
              productId: product.id,
            },
          },
        });

        if (existing) {
          console.log(`    [SKIP] Config for "${product.name}" already exists`);
          continue;
        }

        // Determine if this should be a quick key based on sort priority
        const isQuickKey = product.sortPriority <= 10;

        await prisma.outletProductConfig.create({
          data: {
            outletId: outlet.id,
            productId: product.id,
            isVisible: true,
            isQuickKey,
            // Other fields use defaults:
            // - displayName: null (use product name)
            // - buttonColor: null (use category color)
            // - sortPriority: null (use product sort priority)
            // - gridPosition: null (auto-layout)
            // - visibilityRules: {} (always visible)
            // - quickKeyPosition: null (auto-assign)
          },
        });
        stats.outletConfigsCreated++;
      } catch (error) {
        const message = `Failed to create outlet config for product "${product.name}" in outlet "${outlet.name}": ${error}`;
        stats.errors.push(message);
        console.error(`    [ERROR] ${message}`);
      }
    }
    console.log(`    [OK] Created ${products.length} product configs`);

    // Create OutletGridConfig if not exists
    try {
      const existingGrid = await prisma.outletGridConfig.findUnique({
        where: { outletId: outlet.id },
      });

      if (existingGrid) {
        console.log(`    [SKIP] Grid config already exists`);
      } else {
        await prisma.outletGridConfig.create({
          data: {
            outletId: outlet.id,
            // All other fields use defaults from schema
          },
        });
        stats.gridConfigsCreated++;
        console.log(`    [OK] Created grid config`);
      }
    } catch (error) {
      const message = `Failed to create grid config for outlet "${outlet.name}": ${error}`;
      stats.errors.push(message);
      console.error(`    [ERROR] ${message}`);
    }

    // Create SmartSuggestionConfig if not exists
    try {
      const existingSuggestion = await prisma.smartSuggestionConfig.findUnique({
        where: { outletId: outlet.id },
      });

      if (existingSuggestion) {
        console.log(`    [SKIP] Suggestion config already exists`);
      } else {
        await prisma.smartSuggestionConfig.create({
          data: {
            outletId: outlet.id,
            // All other fields use defaults from schema
          },
        });
        stats.suggestionConfigsCreated++;
        console.log(`    [OK] Created suggestion config`);
      }
    } catch (error) {
      const message = `Failed to create suggestion config for outlet "${outlet.name}": ${error}`;
      stats.errors.push(message);
      console.error(`    [ERROR] ${message}`);
    }
  }

  return stats;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Data Migration: ProshopProduct -> Product                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nStarted at: ${new Date().toISOString()}`);

  // Get all clubs
  const clubs = await prisma.club.findMany({
    orderBy: { name: 'asc' },
  });

  console.log(`\nFound ${clubs.length} clubs to migrate`);

  const allStats: { clubName: string; stats: MigrationStats }[] = [];

  for (const club of clubs) {
    const stats = await migrateClub(club.id, club.name);
    allStats.push({ clubName: club.name, stats });
  }

  // Print summary
  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   Migration Summary                                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  let totalCategories = 0;
  let totalProducts = 0;
  let totalVariants = 0;
  let totalOutletConfigs = 0;
  let totalGridConfigs = 0;
  let totalSuggestionConfigs = 0;
  let totalErrors = 0;

  for (const { clubName, stats } of allStats) {
    console.log(`${clubName}:`);
    console.log(`  Categories migrated:     ${stats.categoriesMigrated}`);
    console.log(`  Products migrated:       ${stats.productsMigrated}`);
    console.log(`  Variants migrated:       ${stats.variantsMigrated}`);
    console.log(`  Outlet configs created:  ${stats.outletConfigsCreated}`);
    console.log(`  Grid configs created:    ${stats.gridConfigsCreated}`);
    console.log(`  Suggestion configs:      ${stats.suggestionConfigsCreated}`);
    if (stats.errors.length > 0) {
      console.log(`  Errors:                  ${stats.errors.length}`);
    }
    console.log('');

    totalCategories += stats.categoriesMigrated;
    totalProducts += stats.productsMigrated;
    totalVariants += stats.variantsMigrated;
    totalOutletConfigs += stats.outletConfigsCreated;
    totalGridConfigs += stats.gridConfigsCreated;
    totalSuggestionConfigs += stats.suggestionConfigsCreated;
    totalErrors += stats.errors.length;
  }

  console.log('─'.repeat(60));
  console.log('TOTALS:');
  console.log(`  Categories migrated:     ${totalCategories}`);
  console.log(`  Products migrated:       ${totalProducts}`);
  console.log(`  Variants migrated:       ${totalVariants}`);
  console.log(`  Outlet configs created:  ${totalOutletConfigs}`);
  console.log(`  Grid configs created:    ${totalGridConfigs}`);
  console.log(`  Suggestion configs:      ${totalSuggestionConfigs}`);
  if (totalErrors > 0) {
    console.log(`  ERRORS:                  ${totalErrors}`);
    console.log('\nErrors encountered:');
    for (const { clubName, stats } of allStats) {
      for (const error of stats.errors) {
        console.log(`  [${clubName}] ${error}`);
      }
    }
  }

  console.log(`\nCompleted at: ${new Date().toISOString()}`);
  console.log('\nMigration complete!');
}

main()
  .catch((error) => {
    console.error('\n\n[FATAL ERROR] Migration failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

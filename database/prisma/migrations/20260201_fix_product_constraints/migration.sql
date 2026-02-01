-- Fix: Add onDelete RESTRICT to products.category foreign key
-- This prevents deletion of ProductCategory when products exist

-- First drop the existing constraint
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_categoryId_fkey";

-- Re-add the constraint with ON DELETE RESTRICT
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Fix: Add unique constraint for SKU at product level
-- Two variants of the same product shouldn't have the same SKU
CREATE UNIQUE INDEX "product_variants_productId_sku_key" ON "product_variants"("productId", "sku");

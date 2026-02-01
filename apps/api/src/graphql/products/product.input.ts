import { InputType, Field, ID, Float, Int, PartialType } from '@nestjs/graphql';
import { ProductType, ModifierSelectionType } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

// ============================================================================
// CATEGORY INPUTS
// ============================================================================

@InputType()
export class CreateProductCategoryInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  iconName?: string;

  @Field(() => ID, { nullable: true })
  parentId?: string;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;
}

@InputType()
export class UpdateProductCategoryInput extends PartialType(CreateProductCategoryInput) {
  @Field({ nullable: true })
  isActive?: boolean;
}

// ============================================================================
// PRODUCT INPUTS
// ============================================================================

@InputType()
export class CreateProductVariantInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  sku?: string;

  @Field(() => Float, { nullable: true })
  priceAdjustment?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  attributes?: Record<string, string>;

  @Field(() => Int, { nullable: true })
  stockQuantity?: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;
}

@InputType()
export class CreateProductInput {
  @Field(() => ID)
  categoryId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  sku?: string;

  @Field(() => ProductType, { nullable: true })
  productType?: ProductType;

  @Field(() => Float)
  basePrice: number;

  @Field(() => Float, { nullable: true })
  costPrice?: number;

  @Field(() => Float, { nullable: true })
  taxRate?: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field(() => Int, { nullable: true })
  sortPriority?: number;

  // Service-specific
  @Field(() => Int, { nullable: true })
  durationMinutes?: number;

  @Field(() => Int, { nullable: true })
  bufferMinutes?: number;

  @Field(() => [String], { nullable: true })
  requiredCapabilities?: string[];

  // Inventory
  @Field({ nullable: true })
  trackInventory?: boolean;

  @Field(() => Int, { nullable: true })
  stockQuantity?: number;

  @Field(() => Int, { nullable: true })
  lowStockThreshold?: number;

  // Variants (for VARIABLE products)
  @Field(() => [CreateProductVariantInput], { nullable: true })
  variants?: CreateProductVariantInput[];

  // Modifier group IDs to link
  @Field(() => [ID], { nullable: true })
  modifierGroupIds?: string[];
}

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class ProductFilterInput {
  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  search?: string;

  @Field(() => ProductType, { nullable: true })
  productType?: ProductType;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  trackInventory?: boolean;

  @Field(() => Int, { nullable: true })
  first?: number;

  @Field({ nullable: true })
  after?: string;
}

// ============================================================================
// MODIFIER INPUTS
// ============================================================================

@InputType()
export class CreateModifierInput {
  @Field()
  name: string;

  @Field(() => Float, { nullable: true })
  priceAdjustment?: number;

  @Field({ nullable: true })
  isDefault?: boolean;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;
}

@InputType()
export class CreateModifierGroupInput {
  @Field()
  name: string;

  @Field(() => ModifierSelectionType, { nullable: true })
  selectionType?: ModifierSelectionType;

  @Field(() => Int, { nullable: true })
  minSelections?: number;

  @Field(() => Int, { nullable: true })
  maxSelections?: number;

  @Field(() => [CreateModifierInput], { nullable: true })
  modifiers?: CreateModifierInput[];
}

@InputType()
export class UpdateModifierGroupInput extends PartialType(CreateModifierGroupInput) {
  @Field({ nullable: true })
  isActive?: boolean;
}

import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { ProductType, TaxType, ModifierSelectionType } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

// Register enums
registerEnumType(ProductType, { name: 'ProductType' });
registerEnumType(ModifierSelectionType, { name: 'ModifierSelectionType' });

@ObjectType('ProductCategory')
export class ProductCategoryType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  iconName?: string;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;

  @Field(() => ID, { nullable: true })
  parentId?: string;

  @Field(() => [ProductCategoryType], { nullable: true })
  children?: ProductCategoryType[];

  @Field(() => Int, { nullable: true })
  productCount?: number;
}

@ObjectType('ProductVariant')
export class ProductVariantType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  sku?: string;

  @Field(() => Float)
  priceAdjustment: number;

  @Field(() => GraphQLJSON, { nullable: true })
  attributes?: Record<string, string>;

  @Field(() => Int, { nullable: true })
  stockQuantity?: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;
}

@ObjectType('Modifier')
export class ModifierType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Float)
  priceAdjustment: number;

  @Field()
  isDefault: boolean;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;
}

@ObjectType('ModifierGroup')
export class ModifierGroupType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => ModifierSelectionType)
  selectionType: ModifierSelectionType;

  @Field(() => Int)
  minSelections: number;

  @Field(() => Int, { nullable: true })
  maxSelections?: number;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;

  @Field(() => [ModifierType])
  modifiers: ModifierType[];
}

@ObjectType('Product')
export class ProductTypeGql {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  sku?: string;

  @Field(() => ProductType)
  productType: ProductType;

  @Field(() => Float)
  basePrice: number;

  @Field(() => Float, { nullable: true })
  costPrice?: number;

  @Field(() => Float)
  taxRate: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field(() => Int)
  sortPriority: number;

  @Field()
  isActive: boolean;

  // Service-specific
  @Field(() => Int, { nullable: true })
  durationMinutes?: number;

  @Field(() => Int, { nullable: true })
  bufferMinutes?: number;

  // Inventory
  @Field()
  trackInventory: boolean;

  @Field(() => Int, { nullable: true })
  stockQuantity?: number;

  @Field(() => Int, { nullable: true })
  lowStockThreshold?: number;

  // Relations
  @Field(() => ProductCategoryType)
  category: ProductCategoryType;

  @Field(() => [ProductVariantType])
  variants: ProductVariantType[];

  @Field(() => [ModifierGroupType])
  modifierGroups: ModifierGroupType[];

  // Computed
  @Field()
  hasVariants: boolean;

  @Field()
  hasModifiers: boolean;

  @Field()
  isInStock: boolean;
}

@ObjectType('ProductEdge')
export class ProductEdgeType {
  @Field(() => ProductTypeGql)
  node: ProductTypeGql;

  @Field()
  cursor: string;
}

@ObjectType('ProductConnection')
export class ProductConnectionType {
  @Field(() => [ProductEdgeType])
  edges: ProductEdgeType[];

  @Field(() => Int)
  totalCount: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;
}

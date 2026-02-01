import { InputType, Field, ID, Int } from '@nestjs/graphql';
import {
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  MaxLength,
  IsString,
  IsArray,
  IsEnum,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaxType } from './golf.types';

// ============================================================================
// CATEGORY INPUTS
// ============================================================================

@InputType()
export class CreateProShopCategoryInput {
  @Field()
  @IsString()
  @MaxLength(100)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @Field()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultTaxRate: number;

  @Field(() => TaxType)
  @IsEnum(TaxType)
  defaultTaxType: TaxType;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class UpdateProShopCategoryInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultTaxRate?: number;

  @Field(() => TaxType, { nullable: true })
  @IsOptional()
  @IsEnum(TaxType)
  defaultTaxType?: TaxType;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================================================
// VARIANT INPUTS
// ============================================================================

@InputType()
export class CreateProShopVariantInput {
  @Field()
  @IsString()
  @MaxLength(50)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @Field({ nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  priceAdjustment?: number;
}

@InputType()
export class UpdateProShopVariantInput {
  @Field(() => ID, { nullable: true, description: 'ID for existing variant, omit for new variant' })
  @IsOptional()
  @IsString()
  id?: string;

  @Field()
  @IsString()
  @MaxLength(50)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @Field({ nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  priceAdjustment?: number;

  @Field({ nullable: true, description: 'Set to true to delete this variant' })
  @IsOptional()
  @IsBoolean()
  _delete?: boolean;
}

// ============================================================================
// PRODUCT INPUTS
// ============================================================================

@InputType()
export class CreateProShopProductInput {
  @Field(() => ID)
  @IsString()
  categoryId: string;

  @Field()
  @IsString()
  @MaxLength(200)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @Field()
  @IsNumber()
  @Min(0)
  price: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;

  @Field(() => TaxType, { nullable: true })
  @IsOptional()
  @IsEnum(TaxType)
  taxType?: TaxType;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  useCategoryDefaults?: boolean;

  @Field(() => [CreateProShopVariantInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CreateProShopVariantInput)
  variants?: CreateProShopVariantInput[];

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isQuickAdd?: boolean;
}

@InputType()
export class UpdateProShopProductInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;

  @Field(() => TaxType, { nullable: true })
  @IsOptional()
  @IsEnum(TaxType)
  taxType?: TaxType;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  useCategoryDefaults?: boolean;

  @Field(() => [UpdateProShopVariantInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => UpdateProShopVariantInput)
  variants?: UpdateProShopVariantInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isQuickAdd?: boolean;
}

@InputType()
export class BulkUpdateProShopProductInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isQuickAdd?: boolean;
}

// ============================================================================
// FILTER/QUERY INPUTS
// ============================================================================

@InputType()
export class ProShopProductFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isQuickAdd?: boolean;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

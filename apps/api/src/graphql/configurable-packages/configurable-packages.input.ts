import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsEnum, IsNumber, IsUUID, IsBoolean, Min, Matches } from 'class-validator';
import { FeatureCategory, PackageTier } from '@prisma/client';

@InputType()
export class CreateFeatureDefinitionInput {
  @Field()
  @IsString()
  @Matches(/^[a-zA-Z][a-zA-Z0-9]*$/, { message: 'Key must be camelCase alphanumeric' })
  key: string;

  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => FeatureCategory)
  @IsEnum(FeatureCategory)
  category: FeatureCategory;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  addonPrice?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

@InputType()
export class UpdateFeatureDefinitionInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  addonPrice?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class CreateVerticalInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  @Matches(/^[a-z][a-z0-9-]*$/, { message: 'Slug must be lowercase alphanumeric with hyphens' })
  slug: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

@InputType()
export class UpdateVerticalInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class CreatePackageInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  verticalId?: string;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  @Matches(/^[a-z][a-z0-9-]*$/, { message: 'Slug must be lowercase alphanumeric with hyphens' })
  slug: string;

  @Field(() => PackageTier)
  @IsEnum(PackageTier)
  tier: PackageTier;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  basePrice: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualPrice?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultMemberLimit?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultUserLimit?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

@InputType()
export class UpdatePackageInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualPrice?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultMemberLimit?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultUserLimit?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class PackageFeatureInput {
  @Field(() => ID)
  @IsUUID()
  featureDefinitionId: string;

  @Field()
  @IsBoolean()
  enabled: boolean;
}

@InputType()
export class AssignClubPackageInput {
  @Field(() => ID)
  @IsUUID()
  clubId: string;

  @Field(() => ID)
  @IsUUID()
  packageId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  memberLimitOverride?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  userLimitOverride?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customPriceOverride?: number;
}

@InputType()
export class AddClubAddonInput {
  @Field(() => ID)
  @IsUUID()
  clubId: string;

  @Field(() => ID)
  @IsUUID()
  featureDefinitionId: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceOverride?: number;
}

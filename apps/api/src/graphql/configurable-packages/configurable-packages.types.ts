import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { FeatureCategory, PackageTier } from '@prisma/client';

// Register Prisma enums for GraphQL
registerEnumType(FeatureCategory, {
  name: 'FeatureCategory',
  description: 'Category of a feature definition',
});

registerEnumType(PackageTier, {
  name: 'PackageTier',
  description: 'Package tier level',
});

@ObjectType()
export class FeatureDefinitionType {
  @Field(() => ID)
  id: string;

  @Field()
  key: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => FeatureCategory)
  category: FeatureCategory;

  @Field(() => Float, { nullable: true })
  addonPrice?: number;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class VerticalType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  iconUrl?: string;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  sortOrder: number;

  @Field(() => [PackageType], { nullable: true })
  packages?: PackageType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PackageFeatureType {
  @Field(() => ID)
  id: string;

  @Field(() => FeatureDefinitionType)
  featureDefinition: FeatureDefinitionType;

  @Field()
  enabled: boolean;
}

@ObjectType()
export class PackageType {
  @Field(() => ID)
  id: string;

  @Field(() => VerticalType, { nullable: true })
  vertical?: VerticalType;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field(() => PackageTier)
  tier: PackageTier;

  @Field(() => Float)
  basePrice: number;

  @Field(() => Float, { nullable: true })
  annualPrice?: number;

  @Field(() => Int, { nullable: true })
  defaultMemberLimit?: number;

  @Field(() => Int, { nullable: true })
  defaultUserLimit?: number;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  sortOrder: number;

  @Field(() => [PackageFeatureType], { nullable: true })
  features?: PackageFeatureType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ClubSummaryType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}

@ObjectType()
export class ClubPackageType {
  @Field(() => ID)
  id: string;

  @Field(() => ClubSummaryType)
  club: ClubSummaryType;

  @Field(() => PackageType)
  package: PackageType;

  @Field(() => Int, { nullable: true })
  memberLimitOverride?: number;

  @Field(() => Int, { nullable: true })
  userLimitOverride?: number;

  @Field(() => Float, { nullable: true })
  customPriceOverride?: number;

  @Field()
  startDate: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ClubAddonType {
  @Field(() => ID)
  id: string;

  @Field(() => FeatureDefinitionType)
  featureDefinition: FeatureDefinitionType;

  @Field(() => Float, { nullable: true })
  priceOverride?: number;

  @Field()
  startDate: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

import { InputType, Field, ID, Int, ArgsType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  Max,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InterestSource } from '@prisma/client';

// ============================================================================
// INTEREST CATEGORY INPUTS
// ============================================================================

@InputType({ description: 'Input for creating an interest category' })
export class CreateInterestCategoryInput {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @Matches(/^[A-Z0-9_]+$/, { message: 'Code must be uppercase letters, numbers, and underscores only' })
  code: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color must be a valid hex code' })
  color?: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType({ description: 'Input for updating an interest category' })
export class UpdateInterestCategoryInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color must be a valid hex code' })
  color?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================================================
// MEMBER INTEREST INPUTS
// ============================================================================

@InputType({ description: 'Single interest entry for a member' })
export class MemberInterestInput {
  @Field(() => ID)
  @IsUUID()
  categoryId: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  @Max(100)
  interestLevel: number;

  @Field(() => InterestSource, { nullable: true })
  @IsOptional()
  @IsEnum(InterestSource)
  source?: InterestSource;
}

@InputType({ description: 'Input for setting member interests' })
export class SetMemberInterestsInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field(() => [MemberInterestInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemberInterestInput)
  interests: MemberInterestInput[];
}

// ============================================================================
// DEPENDENT INTEREST INPUTS
// ============================================================================

@InputType({ description: 'Single interest entry for a dependent' })
export class DependentInterestInput {
  @Field(() => ID)
  @IsUUID()
  categoryId: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  @Max(100)
  interestLevel: number;
}

@InputType({ description: 'Input for setting dependent interests' })
export class SetDependentInterestsInput {
  @Field(() => ID)
  @IsUUID()
  dependentId: string;

  @Field(() => [DependentInterestInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DependentInterestInput)
  interests: DependentInterestInput[];
}

// ============================================================================
// COMMUNICATION PREFERENCES INPUTS
// ============================================================================

@InputType({ description: 'Input for updating communication preferences' })
export class UpdateCommunicationPrefsInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  emailPromotions?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  smsPromotions?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  unsubscribedCategories?: string[];
}

// ============================================================================
// QUERY ARGS
// ============================================================================

@ArgsType()
export class InterestCategoriesQueryArgs {
  @Field({ nullable: true, description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

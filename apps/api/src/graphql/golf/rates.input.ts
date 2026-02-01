import { InputType, Field, ID, Float, Int, ArgsType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, IsInt, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// ============================================================================
// RATE CONFIGURATION INPUTS
// ============================================================================

@InputType()
export class CreateRateConfigInput {
  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @Type(() => Date)
  effectiveFrom: Date;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  effectiveTo?: Date;
}

@InputType()
export class UpdateRateConfigInput {
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
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  effectiveFrom?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  effectiveTo?: Date;
}

@ArgsType()
export class RateConfigsQueryArgs {
  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;
}

// ============================================================================
// GREEN FEE RATE INPUTS
// ============================================================================

@InputType()
export class CreateGreenFeeRateInput {
  @Field(() => ID)
  @IsUUID()
  rateConfigId: string;

  @Field()
  @IsString()
  playerType: string; // MEMBER, GUEST, DEPENDENT, WALK_UP

  @Field(() => Int)
  @IsInt()
  @Min(9)
  @Max(18)
  holes: number; // 9 or 18

  @Field({ defaultValue: 'STANDARD' })
  @IsString()
  timeCategory: string; // STANDARD, PRIME_TIME, OFF_PEAK

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;

  @Field({ defaultValue: 'ADD' })
  @IsString()
  taxType: string; // ADD, INCLUDE, NONE

  @Field(() => Float, { defaultValue: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate: number;
}

@InputType()
export class UpdateGreenFeeRateInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  playerType?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(9)
  @Max(18)
  holes?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timeCategory?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  taxType?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;
}

// ============================================================================
// CART RATE INPUTS
// ============================================================================

@InputType()
export class CreateCartRateInput {
  @Field(() => ID)
  @IsUUID()
  rateConfigId: string;

  @Field()
  @IsString()
  cartType: string; // SINGLE, SHARED, WALKING

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;

  @Field({ defaultValue: 'ADD' })
  @IsString()
  taxType: string; // ADD, INCLUDE, NONE

  @Field(() => Float, { defaultValue: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate: number;
}

@InputType()
export class UpdateCartRateInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cartType?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  taxType?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;
}

// ============================================================================
// CADDY RATE INPUTS
// ============================================================================

@InputType()
export class CreateCaddyRateInput {
  @Field(() => ID)
  @IsUUID()
  rateConfigId: string;

  @Field()
  @IsString()
  caddyType: string; // FORECADDY, SINGLE, DOUBLE

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;

  @Field({ defaultValue: 'NONE' })
  @IsString()
  taxType: string; // ADD, INCLUDE, NONE

  @Field(() => Float, { defaultValue: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate: number;
}

@InputType()
export class UpdateCaddyRateInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  caddyType?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  taxType?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;
}

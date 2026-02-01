import { InputType, Field, ID, ArgsType, Float } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { DiscountType, DiscountScope } from './discounts.types';
import { PaginationArgs } from '../common/pagination';

@InputType()
export class DiscountConditionsInput {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumAmount?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumDiscount?: number;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  membershipTypeIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  playerTypes?: string[];
}

@InputType()
export class DiscountValidityInput {
  @Field({ nullable: true })
  @IsOptional()
  validFrom?: Date;

  @Field({ nullable: true })
  @IsOptional()
  validTo?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;
}

@InputType()
export class DiscountApprovalInput {
  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  approvalThreshold?: number;
}

@InputType()
export class CreateDiscountInput {
  @Field()
  @IsString()
  @MaxLength(100)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @Field(() => DiscountType)
  @IsEnum(DiscountType)
  type: DiscountType;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @Max(100, { message: 'Percentage discount cannot exceed 100%' })
  value: number;

  @Field(() => DiscountScope)
  @IsEnum(DiscountScope)
  scope: DiscountScope;

  @Field(() => DiscountConditionsInput, { nullable: true })
  @IsOptional()
  conditions?: DiscountConditionsInput;

  @Field(() => DiscountValidityInput, { nullable: true })
  @IsOptional()
  validity?: DiscountValidityInput;

  @Field(() => DiscountApprovalInput, { nullable: true })
  @IsOptional()
  approval?: DiscountApprovalInput;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class UpdateDiscountInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @Field(() => DiscountType, { nullable: true })
  @IsOptional()
  @IsEnum(DiscountType)
  type?: DiscountType;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @Field(() => DiscountScope, { nullable: true })
  @IsOptional()
  @IsEnum(DiscountScope)
  scope?: DiscountScope;

  @Field(() => DiscountConditionsInput, { nullable: true })
  @IsOptional()
  conditions?: DiscountConditionsInput;

  @Field(() => DiscountValidityInput, { nullable: true })
  @IsOptional()
  validity?: DiscountValidityInput;

  @Field(() => DiscountApprovalInput, { nullable: true })
  @IsOptional()
  approval?: DiscountApprovalInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class ApplyDiscountInput {
  @Field(() => ID)
  @IsUUID()
  discountId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  lineItemId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  transactionId?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  originalAmount: number;
}

@InputType()
export class ApplyDiscountByCodeInput {
  @Field()
  @IsString()
  @MaxLength(50)
  code: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  lineItemId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  transactionId?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  originalAmount: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  playerType?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  membershipTypeId?: string;
}

@InputType()
export class ApproveDiscountInput {
  @Field(() => ID)
  @IsUUID()
  appliedDiscountId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  approvalNote?: string;
}

@InputType()
export class ValidateDiscountInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  discountId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  code?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  playerType?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  membershipTypeId?: string;
}

@ArgsType()
export class DiscountsQueryArgs extends PaginationArgs {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => DiscountType, { nullable: true })
  @IsOptional()
  @IsEnum(DiscountType)
  type?: DiscountType;

  @Field(() => DiscountScope, { nullable: true })
  @IsOptional()
  @IsEnum(DiscountScope)
  scope?: DiscountScope;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true, defaultValue: 'name' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field({ nullable: true, defaultValue: 'asc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  // Computed helpers for offset pagination
  get limit(): number {
    return this.first || 50;
  }

  get offset(): number {
    return this.skip || 0;
  }
}

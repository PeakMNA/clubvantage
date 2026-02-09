import { InputType, Field, ID, Int, Float } from '@nestjs/graphql';
import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsString,
  MaxLength,
  IsEmail,
} from 'class-validator';
import {
  ARProfileTypeEnum,
  ARProfileStatusEnum,
  StatementDeliveryEnum,
} from './ar-profile.types';

@InputType()
export class CreateARProfileInput {
  @Field(() => ARProfileTypeEnum)
  @IsEnum(ARProfileTypeEnum)
  profileType: ARProfileTypeEnum;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  cityLedgerId?: string;

  // Standalone account info (for CITY_LEDGER without linked entity)
  @Field({ nullable: true, description: 'Account name for standalone city ledger profiles' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  accountName?: string;

  @Field({ nullable: true, description: 'Contact email for standalone profiles' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @Field({ nullable: true, description: 'Contact phone for standalone profiles' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactPhone?: string;

  @Field({ nullable: true, description: 'Billing address for standalone profiles' })
  @IsOptional()
  @IsString()
  billingAddress?: string;

  // Business details (for CITY_LEDGER corporate accounts)
  @Field({ nullable: true, description: 'Tax ID for corporate accounts' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  taxId?: string;

  @Field({ nullable: true, description: 'Business registration number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  businessRegistrationId?: string;

  @Field({ nullable: true, description: 'Branch name (e.g., Head Office, Bangkok Branch)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  branchName?: string;

  @Field({ nullable: true, description: 'Branch code (e.g., 00000 for head office)' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  branchCode?: string;

  @Field(() => StatementDeliveryEnum, { nullable: true })
  @IsOptional()
  @IsEnum(StatementDeliveryEnum)
  statementDelivery?: StatementDeliveryEnum;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  paymentTermsDays?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;
}

@InputType()
export class UpdateARProfileInput {
  @Field(() => StatementDeliveryEnum, { nullable: true })
  @IsOptional()
  @IsEnum(StatementDeliveryEnum)
  statementDelivery?: StatementDeliveryEnum;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  paymentTermsDays?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @Field(() => ARProfileStatusEnum, { nullable: true })
  @IsOptional()
  @IsEnum(ARProfileStatusEnum)
  status?: ARProfileStatusEnum;

  // Standalone account info (can update for CITY_LEDGER profiles)
  @Field({ nullable: true, description: 'Account name for standalone city ledger profiles' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  accountName?: string;

  @Field({ nullable: true, description: 'Contact email for standalone profiles' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @Field({ nullable: true, description: 'Contact phone for standalone profiles' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactPhone?: string;

  @Field({ nullable: true, description: 'Billing address for standalone profiles' })
  @IsOptional()
  @IsString()
  billingAddress?: string;

  // Business details (for CITY_LEDGER corporate accounts)
  @Field({ nullable: true, description: 'Tax ID for corporate accounts' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  taxId?: string;

  @Field({ nullable: true, description: 'Business registration number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  businessRegistrationId?: string;

  @Field({ nullable: true, description: 'Branch name (e.g., Head Office, Bangkok Branch)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  branchName?: string;

  @Field({ nullable: true, description: 'Branch code (e.g., 00000 for head office)' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  branchCode?: string;
}

@InputType()
export class SuspendARProfileInput {
  @Field()
  @IsString()
  @MaxLength(500)
  reason: string;
}

@InputType()
export class CloseARProfileInput {
  @Field()
  @IsString()
  @MaxLength(500)
  reason: string;
}

@InputType()
export class ARProfileFilterInput {
  @Field(() => ARProfileTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(ARProfileTypeEnum)
  profileType?: ARProfileTypeEnum;

  @Field(() => ARProfileStatusEnum, { nullable: true })
  @IsOptional()
  @IsEnum(ARProfileStatusEnum)
  status?: ARProfileStatusEnum;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @Field(() => Float, { nullable: true, description: 'Minimum balance filter' })
  @IsOptional()
  @IsNumber()
  minBalance?: number;

  @Field(() => Float, { nullable: true, description: 'Maximum balance filter' })
  @IsOptional()
  @IsNumber()
  maxBalance?: number;
}

@InputType()
export class SyncARProfilesInput {
  @Field(() => StatementDeliveryEnum, { nullable: true, description: 'Default delivery method for new profiles' })
  @IsOptional()
  @IsEnum(StatementDeliveryEnum)
  statementDelivery?: StatementDeliveryEnum;

  @Field(() => Int, { nullable: true, description: 'Default payment terms in days' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  paymentTermsDays?: number;
}

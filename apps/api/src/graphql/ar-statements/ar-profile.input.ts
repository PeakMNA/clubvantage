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

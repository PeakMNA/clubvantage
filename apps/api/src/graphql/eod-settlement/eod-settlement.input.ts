import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import { ExceptionType, ExceptionSeverity, ExceptionResolution } from '@prisma/client';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  IsEnum,
  IsDate,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class OpenDayInput {
  @Field()
  @Type(() => Date)
  @IsDate()
  businessDate: Date;
}

@InputType()
export class UpdateSettlementTotalsInput {
  @Field(() => ID)
  @IsUUID()
  settlementId: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalGrossSales?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalDiscounts?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalNetSales?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalTax?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalServiceCharge?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalCash?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalCard?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalMemberAccount?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalOther?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalRefunds?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalVoids?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  transactionCount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  refundCount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  voidCount?: number;
}

@InputType()
export class RecordCashCountInput {
  @Field(() => ID)
  @IsUUID()
  settlementId: string;

  @Field(() => Float)
  @IsNumber()
  actualCash: number;
}

@InputType()
export class CreateExceptionInput {
  @Field(() => ID)
  @IsUUID()
  settlementId: string;

  @Field(() => ExceptionType)
  @IsEnum(ExceptionType)
  type: ExceptionType;

  @Field(() => ExceptionSeverity, { nullable: true })
  @IsOptional()
  @IsEnum(ExceptionSeverity)
  severity?: ExceptionSeverity;

  @Field()
  @IsString()
  @MaxLength(2000)
  description: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  transactionId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  shiftId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  lineItemId?: string;
}

@InputType()
export class ResolveExceptionInput {
  @Field(() => ID)
  @IsUUID()
  exceptionId: string;

  @Field(() => ExceptionResolution)
  @IsEnum(ExceptionResolution)
  resolution: ExceptionResolution;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  resolutionNote?: string;
}

@InputType()
export class CloseSettlementInput {
  @Field(() => ID)
  @IsUUID()
  settlementId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

@InputType()
export class ReopenSettlementInput {
  @Field(() => ID)
  @IsUUID()
  settlementId: string;

  @Field()
  @IsString()
  @MaxLength(500)
  reason: string;
}

@InputType()
export class GetSettlementsInput {
  @Field()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Field()
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}

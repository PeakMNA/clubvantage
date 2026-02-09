import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { PeriodStatusEnum } from './statement-period.types';

@InputType()
export class CreateStatementPeriodInput {
  @Field(() => Int)
  @IsInt()
  @Min(2020)
  @Max(2100)
  periodYear: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(52)
  periodNumber: number;

  @Field()
  @IsString()
  @MaxLength(50)
  periodLabel: string;

  @Field()
  @IsDateString()
  periodStart: string;

  @Field()
  @IsDateString()
  periodEnd: string;

  @Field()
  @IsDateString()
  cutoffDate: string;

  @Field({ nullable: true, defaultValue: false, description: 'Mark as catch-up period to consolidate historical data' })
  @IsOptional()
  @IsBoolean()
  isCatchUp?: boolean;
}

@InputType()
export class UpdateStatementPeriodInput {
  @Field({ nullable: true, description: 'Period label/name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  periodLabel?: string;

  @Field({ nullable: true, description: 'Start date of the period (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @Field({ nullable: true, description: 'End date of the period (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  periodEnd?: string;

  @Field({ nullable: true, description: 'Cutoff date for including transactions (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  cutoffDate?: string;
}

@InputType()
export class ReopenStatementPeriodInput {
  @Field()
  @IsString()
  @MaxLength(500)
  reason: string;
}

@InputType()
export class StatementPeriodFilterInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2100)
  periodYear?: number;

  @Field(() => PeriodStatusEnum, { nullable: true })
  @IsOptional()
  @IsEnum(PeriodStatusEnum)
  status?: PeriodStatusEnum;
}

import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
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

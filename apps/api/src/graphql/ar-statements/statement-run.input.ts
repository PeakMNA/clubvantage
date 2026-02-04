import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID, IsEnum, IsOptional, IsArray } from 'class-validator';
import { StatementRunTypeEnum, StatementRunStatusEnum } from './statement-run.types';

@InputType()
export class CreateStatementRunInput {
  @Field(() => ID)
  @IsUUID()
  statementPeriodId: string;

  @Field(() => StatementRunTypeEnum)
  @IsEnum(StatementRunTypeEnum)
  runType: StatementRunTypeEnum;

  @Field(() => [ID], { nullable: true, description: 'Optional list of AR profile IDs to include. If empty, includes all active profiles.' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  profileIds?: string[];
}

@InputType()
export class StatementRunFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  statementPeriodId?: string;

  @Field(() => StatementRunTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(StatementRunTypeEnum)
  runType?: StatementRunTypeEnum;

  @Field(() => StatementRunStatusEnum, { nullable: true })
  @IsOptional()
  @IsEnum(StatementRunStatusEnum)
  status?: StatementRunStatusEnum;
}

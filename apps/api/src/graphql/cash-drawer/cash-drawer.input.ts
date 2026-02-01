import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { CashMovementType } from '@prisma/client';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';

@InputType()
export class CreateCashDrawerInput {
  @Field()
  @IsString()
  @MaxLength(100)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;
}

@InputType()
export class UpdateCashDrawerInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class OpenShiftInput {
  @Field(() => ID)
  @IsUUID()
  cashDrawerId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  openingFloat: number;

  @Field({ nullable: true, description: 'JSON string of denomination counts' })
  @IsOptional()
  @IsString()
  denominations?: string;
}

@InputType()
export class CloseShiftInput {
  @Field(() => ID)
  @IsUUID()
  shiftId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  closingCount: number;

  @Field({ nullable: true, description: 'JSON string of denomination counts' })
  @IsOptional()
  @IsString()
  denominations?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  varianceNote?: string;
}

@InputType()
export class RecordMovementInput {
  @Field(() => ID)
  @IsUUID()
  shiftId: string;

  @Field(() => CashMovementType)
  @IsEnum(CashMovementType)
  type: CashMovementType;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  transactionId?: string;
}

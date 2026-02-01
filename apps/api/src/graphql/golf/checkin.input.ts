import { InputType, Field, ID, Int } from '@nestjs/graphql';
import {
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  MaxLength,
  IsString,
  IsArray,
  IsEnum,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaxType, LineItemType, PaymentMethodTypeEnum } from './golf.types';

// ============================================================================
// LINE ITEM INPUTS
// ============================================================================

@InputType()
export class AddLineItemInput {
  @Field(() => ID)
  @IsString()
  playerId: string;

  @Field(() => LineItemType)
  @IsEnum(LineItemType)
  type: LineItemType;

  @Field()
  @IsString()
  @MaxLength(200)
  description: string;

  @Field()
  @IsNumber()
  @Min(0)
  baseAmount: number;

  @Field(() => TaxType, { nullable: true })
  @IsOptional()
  @IsEnum(TaxType)
  taxType?: TaxType;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  productId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  variantId?: string;
}

@InputType()
export class RemoveLineItemInput {
  @Field(() => ID)
  @IsString()
  lineItemId: string;
}

// ============================================================================
// SETTLEMENT INPUTS
// ============================================================================

@InputType()
export class PlayerPaymentInput {
  @Field(() => ID)
  @IsString()
  playerId: string;

  @Field()
  @IsNumber()
  @Min(0)
  amount: number;

  @Field(() => [ID], { nullable: true, description: 'Specific line item IDs to mark as paid' })
  @IsOptional()
  @IsArray()
  lineItemIds?: string[];
}

@InputType()
export class ProcessSettlementInput {
  @Field(() => ID)
  @IsString()
  teeTimeId: string;

  @Field(() => [PlayerPaymentInput])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PlayerPaymentInput)
  payments: PlayerPaymentInput[];

  @Field(() => ID)
  @IsString()
  paymentMethodId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

@InputType()
export class SplitSettlementInput {
  @Field(() => ID)
  @IsString()
  teeTimeId: string;

  @Field(() => [ID])
  @IsArray()
  @ArrayMinSize(1)
  playerIds: string[];

  @Field(() => ID)
  @IsString()
  paymentMethodId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;
}

// ============================================================================
// CHECK-IN INPUTS
// ============================================================================

@InputType()
export class CheckInPlayerInput {
  @Field(() => ID)
  @IsString()
  playerId: string;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  skipPaymentValidation?: boolean;
}

@InputType()
export class CheckInFlightInput {
  @Field(() => ID)
  @IsString()
  teeTimeId: string;

  @Field(() => [CheckInPlayerInput])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckInPlayerInput)
  players: CheckInPlayerInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  cartNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  generateTicket?: boolean;
}

@InputType()
export class UndoCheckInInput {
  @Field(() => ID)
  @IsString()
  playerId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

// ============================================================================
// STARTER TICKET INPUTS
// ============================================================================

@InputType()
export class GenerateTicketInput {
  @Field(() => ID)
  @IsString()
  teeTimeId: string;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  forceRegenerate?: boolean;
}

@InputType()
export class PrintTicketInput {
  @Field(() => ID)
  @IsString()
  ticketId: string;

  @Field({ nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  copies?: number;
}

// ============================================================================
// BATCH OPERATION INPUTS
// ============================================================================

@InputType()
export class CheckInAllPlayersInput {
  @Field(() => ID)
  @IsString()
  teeTimeId: string;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  skipPaymentValidation?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  cartNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

@InputType()
export class SettleAllPlayersInput {
  @Field(() => ID)
  @IsString()
  teeTimeId: string;

  @Field(() => ID)
  @IsString()
  paymentMethodId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;
}

// ============================================================================
// REPORT FILTER INPUTS
// ============================================================================

@InputType()
export class CheckInHistoryFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  teeTimeId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  playerId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  action?: string;

  @Field({ nullable: true })
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  endDate?: Date;

  @Field({ nullable: true, defaultValue: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

@InputType()
export class DailyReportInput {
  @Field(() => ID)
  @IsString()
  courseId: string;

  @Field()
  date: Date;
}

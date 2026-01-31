import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsString, IsArray, IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';

@InputType()
export class TransferLineItemInput {
  @Field(() => ID)
  @IsString()
  lineItemId: string;

  @Field(() => ID)
  @IsString()
  fromPlayerId: string;

  @Field(() => ID)
  @IsString()
  toPlayerId: string;
}

@InputType()
export class UndoTransferInput {
  @Field(() => ID)
  @IsString()
  lineItemId: string;
}

@InputType()
export class BatchPaymentInput {
  @Field(() => ID)
  @IsString()
  teeTimeId: string;

  @Field(() => [ID])
  @IsArray()
  @IsString({ each: true })
  playerIds: string[];

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lineItemIds?: string[];

  @Field(() => ID)
  @IsString()
  paymentMethodId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reference?: string;

  @Field(() => ID, { nullable: true, description: 'For member account charges' })
  @IsOptional()
  @IsString()
  chargeToMemberId?: string;
}

@InputType()
export class CheckInSlotsInput {
  @Field(() => ID)
  @IsString()
  teeTimeId: string;

  @Field(() => [ID])
  @IsArray()
  @IsString({ each: true })
  playerIds: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class SaveCartDraftInput {
  @Field(() => ID)
  @IsString()
  teeTimeId: string;

  @Field({ description: 'JSON stringified draft data' })
  @IsString()
  draftData: string;
}

@InputType()
export class UpdateLineItemQuantityInput {
  @Field(() => ID)
  @IsUUID()
  lineItemId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number;
}

@InputType()
export class RemoveLineItemInput {
  @Field(() => ID)
  @IsUUID()
  lineItemId: string;
}

@InputType()
export class BulkRemoveLineItemsInput {
  @Field(() => [ID])
  @IsArray()
  @IsUUID('4', { each: true })
  lineItemIds: string[];
}

@InputType()
export class BulkTransferLineItemsInput {
  @Field(() => [ID])
  @IsArray()
  @IsUUID('4', { each: true })
  lineItemIds: string[];

  @Field(() => ID)
  @IsUUID()
  toPlayerId: string;
}

@InputType()
export class PayLineItemsInput {
  @Field(() => [ID])
  @IsArray()
  @IsUUID('4', { each: true })
  lineItemIds: string[];

  @Field(() => ID)
  @IsUUID()
  paymentMethodId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reference?: string;
}

import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsOptional, IsBoolean, IsNumber, Min, Max, MaxLength, IsString, IsArray, IsEnum } from 'class-validator';
import { TaxType, LineItemType, TicketGenerateOn, PrintOption, PaymentMethodTypeEnum } from './golf.types';

// ============================================================================
// CHECK-IN POLICY INPUT
// ============================================================================

@InputType()
export class CheckInPolicyInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allowPartialPayment?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  blockSuspendedMembers?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  showSuspensionReason?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requireAllItemsPaid?: boolean;
}

// ============================================================================
// TAX CONFIGURATION INPUT
// ============================================================================

@InputType()
export class TaxOverrideInput {
  @Field(() => LineItemType)
  @IsEnum(LineItemType)
  itemType: LineItemType;

  @Field()
  @IsNumber()
  @Min(0)
  @Max(100)
  rate: number;

  @Field(() => TaxType)
  @IsEnum(TaxType)
  taxType: TaxType;
}

@InputType()
export class TaxConfigInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultRate?: number;

  @Field(() => TaxType, { nullable: true })
  @IsOptional()
  @IsEnum(TaxType)
  defaultType?: TaxType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  taxLabel?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  showBreakdown?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  showTypeIndicator?: boolean;

  @Field(() => [TaxOverrideInput], { nullable: true })
  @IsOptional()
  @IsArray()
  overrides?: TaxOverrideInput[];
}

// ============================================================================
// STARTER TICKET CONFIGURATION INPUT
// ============================================================================

@InputType()
export class TicketContentInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  showTeeTime?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  showCourse?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  showStartingHole?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  showPlayerNames?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  showMemberNumbers?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  showCartNumber?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  showCaddyName?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  showRentalItems?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  showSpecialRequests?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  showQRCode?: boolean;
}

@InputType()
export class StarterTicketConfigInput {
  @Field(() => TicketGenerateOn, { nullable: true })
  @IsOptional()
  @IsEnum(TicketGenerateOn)
  generateOn?: TicketGenerateOn;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  autoGenerate?: boolean;

  @Field(() => PrintOption, { nullable: true })
  @IsOptional()
  @IsEnum(PrintOption)
  defaultPrintOption?: PrintOption;

  @Field(() => TicketContentInput, { nullable: true })
  @IsOptional()
  content?: TicketContentInput;
}

// ============================================================================
// PRO SHOP CONFIGURATION INPUT
// ============================================================================

@InputType()
export class ProShopConfigInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allowAddAtCheckIn?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  showQuickAddItems?: boolean;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  quickAddProductIds?: string[];
}

// ============================================================================
// POS CONFIGURATION INPUT
// ============================================================================

@InputType()
export class POSConfigInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isConnected?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  provider?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  terminalId?: string;
}

// ============================================================================
// PAYMENT METHOD INPUT
// ============================================================================

@InputType()
export class CreatePaymentMethodInput {
  @Field()
  @IsString()
  @MaxLength(50)
  name: string;

  @Field()
  @IsString()
  @MaxLength(30)
  icon: string;

  @Field(() => PaymentMethodTypeEnum)
  @IsEnum(PaymentMethodTypeEnum)
  type: PaymentMethodTypeEnum;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  requiresRef?: boolean;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  opensPOS?: boolean;
}

@InputType()
export class UpdatePaymentMethodInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  icon?: string;

  @Field(() => PaymentMethodTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(PaymentMethodTypeEnum)
  type?: PaymentMethodTypeEnum;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requiresRef?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  opensPOS?: boolean;
}

@InputType()
export class ReorderPaymentMethodsInput {
  @Field(() => [ID])
  @IsArray()
  orderedIds: string[];
}

import { InputType, Field, ID, ArgsType, Float, Int } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus, PaymentMethod, CreditNoteType, CreditNoteReason, CreditNoteStatus, ArAccountType, ARCycleType, ARCloseBehavior } from './billing.types';
import { PaginationArgs } from '../common/pagination';

@InputType()
export class InvoiceLineItemInput {
  @Field(() => ID)
  @IsUUID()
  chargeTypeId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  quantity: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPct?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  taxType?: string;

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;
}

@InputType()
export class CreateInvoiceInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field()
  invoiceDate: Date;

  @Field()
  dueDate: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  billingPeriod?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @Field(() => [InvoiceLineItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemInput)
  lineItems: InvoiceLineItemInput[];

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  sendEmail?: boolean;
}

@InputType()
export class PaymentAllocationInput {
  @Field(() => ID)
  @IsUUID()
  invoiceId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;
}

@InputType()
export class CreatePaymentInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;

  @Field(() => PaymentMethod)
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @Field({ nullable: true })
  @IsOptional()
  paymentDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bankName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accountLast4?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => [PaymentAllocationInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAllocationInput)
  allocations?: PaymentAllocationInput[];
}

@ArgsType()
export class InvoicesQueryArgs extends PaginationArgs {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => InvoiceStatus, { nullable: true })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  endDate?: Date;

  @Field({ nullable: true, defaultValue: 'invoiceDate' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field({ nullable: true, defaultValue: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

@ArgsType()
export class PaymentsQueryArgs extends PaginationArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  endDate?: Date;

  @Field(() => PaymentMethod, { nullable: true })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;
}

@InputType()
export class VoidInvoiceInput {
  @Field()
  @IsString()
  reason: string;
}

// Credit Note inputs
@InputType()
export class CreditNoteLineItemInput {
  @Field()
  @IsString()
  description: string;

  @Field(() => Float, { defaultValue: 1 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  taxable?: boolean;

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  chargeTypeId?: string;
}

@InputType()
export class CreateCreditNoteInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field(() => CreditNoteType)
  @IsEnum(CreditNoteType)
  type: CreditNoteType;

  @Field(() => CreditNoteReason)
  @IsEnum(CreditNoteReason)
  reason: CreditNoteReason;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reasonDetail?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  sourceInvoiceId?: string;

  @Field(() => [CreditNoteLineItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreditNoteLineItemInput)
  lineItems: CreditNoteLineItemInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  memberVisibleNotes?: string;
}

@InputType()
export class ApplyCreditNoteInput {
  @Field(() => ID)
  @IsUUID()
  invoiceId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;
}

@InputType()
export class VoidCreditNoteInput {
  @Field()
  @IsString()
  reason: string;
}

@ArgsType()
export class CreditNotesQueryArgs extends PaginationArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field(() => CreditNoteStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CreditNoteStatus)
  status?: CreditNoteStatus;

  @Field({ nullable: true })
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  endDate?: Date;
}

// Batch Settlement Input - for FIFO-based payment settlement
@InputType()
export class BatchSettlementInput {
  @Field(() => ID)
  @IsUUID()
  accountId: string;

  @Field(() => ArAccountType)
  @IsEnum(ArAccountType)
  accountType: ArAccountType;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  paymentAmount: number;

  @Field(() => PaymentMethod)
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  paymentDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  useFifo?: boolean; // If true, auto-allocate using FIFO; if false, add all to credit
}

// Statement generation input
@InputType()
export class GenerateStatementInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Field()
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}

// AR Period Settings Input
@InputType()
export class UpdateARSettingsInput {
  @Field(() => ARCycleType, { nullable: true })
  @IsOptional()
  @IsEnum(ARCycleType)
  arCycleType?: ARCycleType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  arCustomCycleStartDay?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(15)
  arCutoffDays?: number;

  @Field(() => ARCloseBehavior, { nullable: true })
  @IsOptional()
  @IsEnum(ARCloseBehavior)
  arCloseBehavior?: ARCloseBehavior;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  arAutoGenerateNext?: boolean;
}

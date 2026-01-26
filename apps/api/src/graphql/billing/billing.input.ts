import { InputType, Field, ID, ArgsType, Float } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus, PaymentMethod } from './billing.types';
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

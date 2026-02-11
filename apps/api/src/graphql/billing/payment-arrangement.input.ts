import { InputType, Field, ID, ArgsType, Float, Int } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsNumber,
  IsArray,
  IsDate,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationArgs } from '../common/pagination';
import {
  ArrangementFrequencyEnum,
  ArrangementStatusEnum,
} from './payment-arrangement.types';

@InputType()
export class CreatePaymentArrangementInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field(() => [ID])
  @IsArray()
  invoiceIds: string[];

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  installmentCount: number;

  @Field(() => ArrangementFrequencyEnum)
  @IsEnum(ArrangementFrequencyEnum)
  frequency: ArrangementFrequencyEnum;

  @Field()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class RecordInstallmentPaymentInput {
  @Field(() => ID)
  @IsUUID()
  arrangementId: string;

  @Field(() => ID)
  @IsUUID()
  installmentId: string;

  @Field(() => ID)
  @IsUUID()
  paymentId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  amount: number;
}

@ArgsType()
export class PaymentArrangementsQueryArgs extends PaginationArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field(() => ArrangementStatusEnum, { nullable: true })
  @IsOptional()
  @IsEnum(ArrangementStatusEnum)
  status?: ArrangementStatusEnum;
}

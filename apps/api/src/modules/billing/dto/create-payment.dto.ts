import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsDateString,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
  ValidateNested,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  DIRECT_DEBIT = 'DIRECT_DEBIT',
  MOBILE_PAYMENT = 'MOBILE_PAYMENT',
  OTHER = 'OTHER',
}

export class PaymentAllocationDto {
  @ApiProperty({ description: 'Invoice ID' })
  @IsUUID()
  invoiceId: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0.01)
  amount: number;
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'Member ID' })
  @IsUUID()
  memberId: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({ example: 'TRF-123456' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceNumber?: string;

  @ApiPropertyOptional({ example: 'Bangkok Bank' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiPropertyOptional({ example: '1234' })
  @IsOptional()
  @IsString()
  @MaxLength(4)
  accountLast4?: string;

  @ApiPropertyOptional({ type: [PaymentAllocationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAllocationDto)
  allocations?: PaymentAllocationDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

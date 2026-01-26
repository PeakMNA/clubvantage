import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsDateString,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceLineItemDto {
  @ApiPropertyOptional({ description: 'Charge type ID' })
  @IsOptional()
  @IsUUID()
  chargeTypeId?: string;

  @ApiProperty({ example: 'Monthly membership fee' })
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiProperty({ example: 1, minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPct?: number;

  @ApiPropertyOptional({ example: 'VAT' })
  @IsOptional()
  @IsString()
  taxType?: string;

  @ApiPropertyOptional({ example: 7, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Member ID' })
  @IsUUID()
  memberId: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  invoiceDate: string;

  @ApiProperty({ example: '2024-01-31' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ example: 'January 2024' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  billingPeriod?: string;

  @ApiProperty({ type: [CreateInvoiceLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineItemDto)
  lineItems: CreateInvoiceLineItemDto[];

  @ApiPropertyOptional({ example: 'Special handling required' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'VIP member - priority' })
  @IsOptional()
  @IsString()
  internalNotes?: string;
}

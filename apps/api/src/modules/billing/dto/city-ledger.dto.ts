import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsEmail,
  MaxLength,
  Min,
} from 'class-validator';

export enum CityLedgerTypeDto {
  CORPORATE = 'CORPORATE',
  HOUSE = 'HOUSE',
  VENDOR = 'VENDOR',
  OTHER = 'OTHER',
}

export enum CityLedgerStatusDto {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export class CreateCityLedgerDto {
  @ApiProperty({ example: 'CL-001' })
  @IsString()
  @MaxLength(30)
  accountNumber: string;

  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @MaxLength(255)
  accountName: string;

  @ApiPropertyOptional({ enum: CityLedgerTypeDto, default: CityLedgerTypeDto.CORPORATE })
  @IsOptional()
  @IsEnum(CityLedgerTypeDto)
  accountType?: CityLedgerTypeDto;

  @ApiPropertyOptional({ example: 'John Smith' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactName?: string;

  @ApiPropertyOptional({ example: 'john@acme.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+66-2-123-4567' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactPhone?: string;

  @ApiPropertyOptional({ example: '123 Business St, Bangkok 10110' })
  @IsOptional()
  @IsString()
  billingAddress?: string;

  @ApiPropertyOptional({ example: '1234567890123' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({ example: 30, default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paymentTerms?: number;

  @ApiPropertyOptional({ example: 'VIP corporate account' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCityLedgerDto {
  @ApiPropertyOptional({ example: 'Acme Corporation Ltd.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  accountName?: string;

  @ApiPropertyOptional({ enum: CityLedgerTypeDto })
  @IsOptional()
  @IsEnum(CityLedgerTypeDto)
  accountType?: CityLedgerTypeDto;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactName?: string;

  @ApiPropertyOptional({ example: 'jane@acme.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+66-2-123-4568' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactPhone?: string;

  @ApiPropertyOptional({ example: '456 Corporate Ave, Bangkok 10120' })
  @IsOptional()
  @IsString()
  billingAddress?: string;

  @ApiPropertyOptional({ example: '9876543210123' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @ApiPropertyOptional({ example: 150000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paymentTerms?: number;

  @ApiPropertyOptional({ enum: CityLedgerStatusDto })
  @IsOptional()
  @IsEnum(CityLedgerStatusDto)
  status?: CityLedgerStatusDto;

  @ApiPropertyOptional({ example: 'Updated notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CityLedgerQueryDto {
  @ApiPropertyOptional({ description: 'Search by account number or name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CityLedgerTypeDto })
  @IsOptional()
  @IsEnum(CityLedgerTypeDto)
  accountType?: CityLedgerTypeDto;

  @ApiPropertyOptional({ enum: CityLedgerStatusDto })
  @IsOptional()
  @IsEnum(CityLedgerStatusDto)
  status?: CityLedgerStatusDto;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsDateString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum MemberStatus {
  PROSPECT = 'PROSPECT',
  LEAD = 'LEAD',
  APPLICANT = 'APPLICANT',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  LAPSED = 'LAPSED',
  RESIGNED = 'RESIGNED',
  TERMINATED = 'TERMINATED',
  REACTIVATED = 'REACTIVATED',
}

export class CreateMemberDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+66 81 234 5678' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ example: '1985-05-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'male', enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: '123 Main St, Bangkok 10110' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Thai' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationality?: string;

  @ApiPropertyOptional({ example: '1234567890123' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  idNumber?: string;

  @ApiProperty({ description: 'Membership type ID' })
  @IsUUID()
  membershipTypeId: string;

  @ApiPropertyOptional({ description: 'Membership tier ID' })
  @IsOptional()
  @IsUUID()
  membershipTierId?: string;

  @ApiPropertyOptional({ enum: MemberStatus, default: MemberStatus.ACTIVE })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  joinDate?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'Household ID for family memberships' })
  @IsOptional()
  @IsUUID()
  householdId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrimaryMember?: boolean;

  @ApiPropertyOptional({ description: 'Referrer member ID' })
  @IsOptional()
  @IsUUID()
  referredById?: string;

  @ApiPropertyOptional({ example: 'Website' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referralSource?: string;

  @ApiPropertyOptional({ example: 'Emergency contact: Jane Doe, Wife' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({ example: '+66 81 987 6543' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  emergencyPhone?: string;

  @ApiPropertyOptional({ example: 'VIP member, requires special attention' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: ['vip', 'golf-enthusiast'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: 'object' })
  @IsOptional()
  customFields?: Record<string, any>;
}

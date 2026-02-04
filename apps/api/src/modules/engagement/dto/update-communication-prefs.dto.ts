import {
  IsBoolean,
  IsOptional,
  IsArray,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCommunicationPrefsDto {
  @ApiProperty({ description: 'Member ID' })
  @IsUUID()
  memberId: string;

  @ApiPropertyOptional({ description: 'Receive email promotions', default: true })
  @IsOptional()
  @IsBoolean()
  emailPromotions?: boolean;

  @ApiPropertyOptional({ description: 'Receive SMS promotions', default: false })
  @IsOptional()
  @IsBoolean()
  smsPromotions?: boolean;

  @ApiPropertyOptional({ description: 'Receive push notifications', default: true })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Category IDs to unsubscribe from', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  unsubscribedCategories?: string[];
}

export class CommunicationPrefsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  memberId: string;

  @ApiProperty()
  emailPromotions: boolean;

  @ApiProperty()
  smsPromotions: boolean;

  @ApiProperty()
  pushNotifications: boolean;

  @ApiProperty({ type: [String] })
  unsubscribedCategories: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

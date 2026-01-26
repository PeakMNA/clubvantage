import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MemberStatus } from './create-member.dto';

export class ChangeStatusDto {
  @ApiProperty({ enum: MemberStatus })
  @IsEnum(MemberStatus)
  status: MemberStatus;

  @ApiPropertyOptional({ example: 'Member requested suspension' })
  @IsOptional()
  @IsString()
  reason?: string;
}

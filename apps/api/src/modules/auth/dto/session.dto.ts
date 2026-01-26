import { IsNotEmpty, IsString, IsOptional, IsEmail, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetSessionDto {
  @ApiProperty({ description: 'Supabase access token' })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({ description: 'Supabase refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiPropertyOptional({ description: 'Club ID for multi-tenancy' })
  @IsUUID()
  @IsOptional()
  clubId?: string;
}

export class SignInWithPasswordDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ description: 'Club ID for multi-tenancy' })
  @IsUUID()
  @IsOptional()
  clubId?: string;
}

export class RefreshSessionDto {
  @ApiPropertyOptional({ description: 'Refresh token (optional, uses cookie if not provided)' })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}

export class OAuthCallbackDto {
  @ApiProperty({ description: 'OAuth authorization code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: 'OAuth state parameter' })
  @IsString()
  @IsOptional()
  state?: string;
}

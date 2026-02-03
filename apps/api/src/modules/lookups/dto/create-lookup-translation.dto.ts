import { IsString, IsOptional, IsUUID, MaxLength, Matches } from 'class-validator';

export class CreateLookupTranslationDto {
  @IsUUID()
  lookupValueId: string;

  @IsString()
  @MaxLength(10)
  @Matches(/^[a-z]{2}(-[A-Z]{2})?$/, { message: 'locale must be a valid locale code (e.g., th, zh-CN)' })
  locale: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateLookupTranslationDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

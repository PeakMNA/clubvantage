import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class LookupCategoryFilterDto {
  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}

export class LookupValueFilterDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  categoryCode?: string;

  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean;
}

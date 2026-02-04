import {
  IsString,
  IsUUID,
  IsInt,
  IsEnum,
  IsOptional,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InterestSource } from '@prisma/client';

export class SetMemberInterestDto {
  @ApiProperty({ description: 'Interest category ID' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'Interest level 0-100', minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  interestLevel: number;

  @ApiPropertyOptional({ description: 'Source of the interest', enum: InterestSource })
  @IsOptional()
  @IsEnum(InterestSource)
  source?: InterestSource;
}

export class SetMemberInterestsDto {
  @ApiProperty({ description: 'Member ID' })
  @IsUUID()
  memberId: string;

  @ApiProperty({ description: 'List of interests to set', type: [SetMemberInterestDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetMemberInterestDto)
  interests: SetMemberInterestDto[];
}

export class SetDependentInterestDto {
  @ApiProperty({ description: 'Interest category ID' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'Interest level 0-100', minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  interestLevel: number;
}

export class SetDependentInterestsDto {
  @ApiProperty({ description: 'Dependent ID' })
  @IsUUID()
  dependentId: string;

  @ApiProperty({ description: 'List of interests to set', type: [SetDependentInterestDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetDependentInterestDto)
  interests: SetDependentInterestDto[];
}

export class RemoveMemberInterestDto {
  @ApiProperty({ description: 'Member ID' })
  @IsUUID()
  memberId: string;

  @ApiProperty({ description: 'Interest category ID' })
  @IsUUID()
  categoryId: string;
}

export class RemoveDependentInterestDto {
  @ApiProperty({ description: 'Dependent ID' })
  @IsUUID()
  dependentId: string;

  @ApiProperty({ description: 'Interest category ID' })
  @IsUUID()
  categoryId: string;
}

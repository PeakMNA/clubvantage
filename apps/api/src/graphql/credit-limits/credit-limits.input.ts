import { InputType, Field, ID, Float } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

@InputType()
export class CreateCreditOverrideInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  newLimit: number;

  @Field()
  @IsString()
  @MaxLength(500)
  reason: string;

  @Field({ nullable: true })
  @IsOptional()
  expiresAt?: Date;
}

@InputType()
export class UpdateCreditSettingsInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  creditLimitEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  creditAlertThreshold?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  creditBlockEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  creditOverrideAllowed?: boolean;
}

@InputType()
export class CheckCreditInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  chargeAmount: number;
}

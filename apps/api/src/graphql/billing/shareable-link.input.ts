import { InputType, Field, ID, Int, ArgsType } from '@nestjs/graphql';
import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ShareableEntityTypeEnum } from './shareable-link.types';

@InputType()
export class CreateShareableLinkInput {
  @Field(() => ShareableEntityTypeEnum)
  @IsEnum(ShareableEntityTypeEnum)
  entityType: ShareableEntityTypeEnum;

  @Field(() => ID)
  @IsUUID()
  entityId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  expiresInDays?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxViews?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  password?: string;
}

@ArgsType()
export class ShareableLinksQueryArgs {
  @Field(() => ShareableEntityTypeEnum)
  @IsEnum(ShareableEntityTypeEnum)
  entityType: ShareableEntityTypeEnum;

  @Field(() => ID)
  @IsUUID()
  entityId: string;
}

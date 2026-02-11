import { InputType, Field, ID, Int } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsArray,
  IsBoolean,
  IsInt,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';
import {
  SegmentTypeEnum,
  CampaignStatusEnum,
  CampaignTypeEnum,
  ContentTypeEnum,
} from './marketing.types';

// --- Segment Inputs ---

@InputType()
export class SegmentRuleInput {
  @Field()
  @IsString()
  field: string;

  @Field()
  @IsString()
  operator: string;

  @Field(() => GraphQLJSON)
  value: unknown;

  @Field()
  @IsString()
  source: string;
}

@InputType()
export class CreateSegmentInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => SegmentTypeEnum)
  @IsEnum(SegmentTypeEnum)
  type: SegmentTypeEnum;

  @Field(() => [SegmentRuleInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SegmentRuleInput)
  rules: SegmentRuleInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  naturalLanguageQuery?: string;
}

@InputType()
export class UpdateSegmentInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [SegmentRuleInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SegmentRuleInput)
  rules?: SegmentRuleInput[];
}

@InputType()
export class SegmentFilterInput {
  @Field(() => SegmentTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(SegmentTypeEnum)
  type?: SegmentTypeEnum;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}

// --- Campaign Inputs ---

@InputType()
export class CreateCampaignInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => CampaignTypeEnum)
  @IsEnum(CampaignTypeEnum)
  type: CampaignTypeEnum;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  channels: string[];

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  segmentIds?: string[];
}

@InputType()
export class UpdateCampaignInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => CampaignTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(CampaignTypeEnum)
  type?: CampaignTypeEnum;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  channels?: string[];

  @Field({ nullable: true })
  @IsOptional()
  scheduledAt?: Date;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  segmentIds?: string[];
}

@InputType()
export class CampaignFilterInput {
  @Field(() => CampaignStatusEnum, { nullable: true })
  @IsOptional()
  @IsEnum(CampaignStatusEnum)
  status?: CampaignStatusEnum;

  @Field(() => CampaignTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(CampaignTypeEnum)
  type?: CampaignTypeEnum;

  @Field(() => Int, { nullable: true, defaultValue: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

// --- Content Inputs ---

@InputType()
export class GenerateContentInput {
  @Field()
  @IsString()
  campaignGoal: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  audienceDescription?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tone?: string;

  @Field(() => ContentTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(ContentTypeEnum)
  contentType?: ContentTypeEnum;
}

@InputType()
export class ImproveContentInput {
  @Field(() => ID)
  @IsUUID()
  contentId: string;

  @Field()
  @IsString()
  feedback: string;
}

// --- Brand Config Input ---

@InputType()
export class UpdateBrandConfigInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  language?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fromName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fromEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  replyToEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guidelines?: string;
}

// --- Channel Config Input ---

@InputType()
export class UpdateChannelConfigInput {
  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  credentials?: unknown;
}

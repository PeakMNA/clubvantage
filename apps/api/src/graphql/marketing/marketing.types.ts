import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

// GraphQL enums for marketing module
export enum SegmentTypeEnum {
  SMART = 'SMART',
  CUSTOM = 'CUSTOM',
  MANUAL = 'MANUAL',
}

export enum CampaignStatusEnum {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum CampaignTypeEnum {
  ONE_SHOT = 'ONE_SHOT',
  AUTOMATED_FLOW = 'AUTOMATED_FLOW',
}

export enum ContentTypeEnum {
  EMAIL = 'EMAIL',
  SOCIAL_POST = 'SOCIAL_POST',
  LINE_MESSAGE = 'LINE_MESSAGE',
  LANDING_PAGE = 'LANDING_PAGE',
}

export enum ContentStatusEnum {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
}

export enum ChannelTypeEnum {
  EMAIL = 'EMAIL',
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  LINE = 'LINE',
  LANDING_PAGE = 'LANDING_PAGE',
}

export enum ChannelStatusEnum {
  NOT_CONNECTED = 'NOT_CONNECTED',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
  SUSPENDED = 'SUSPENDED',
}

export enum MetricPeriodEnum {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
}

registerEnumType(SegmentTypeEnum, {
  name: 'SegmentType',
  description: 'Audience segment type',
});

registerEnumType(CampaignStatusEnum, {
  name: 'CampaignStatus',
  description: 'Campaign status',
});

registerEnumType(CampaignTypeEnum, {
  name: 'CampaignKind',
  description: 'Campaign type (one-shot or automated flow)',
});

registerEnumType(ContentTypeEnum, {
  name: 'ContentType',
  description: 'Content piece type',
});

registerEnumType(ContentStatusEnum, {
  name: 'ContentStatus',
  description: 'Content piece status',
});

registerEnumType(ChannelTypeEnum, {
  name: 'ChannelType',
  description: 'Marketing channel type',
});

registerEnumType(ChannelStatusEnum, {
  name: 'ChannelStatus',
  description: 'Channel connection status',
});

registerEnumType(MetricPeriodEnum, {
  name: 'MetricPeriod',
  description: 'Analytics metric period',
});

// --- Object Types ---

@ObjectType()
export class AudienceSegmentType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => SegmentTypeEnum)
  type: SegmentTypeEnum;

  @Field(() => GraphQLJSON, { nullable: true })
  rules?: unknown;

  @Field({ nullable: true })
  naturalLanguageQuery?: string;

  @Field(() => Int)
  memberCount: number;

  @Field()
  isArchived: boolean;

  @Field({ nullable: true })
  refreshedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class SegmentMemberType {
  @Field(() => ID)
  id: string;

  @Field()
  memberId: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  email?: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  membershipTypeName?: string;
}

@ObjectType()
export class SegmentTranslationResultType {
  @Field(() => GraphQLJSON)
  rules: unknown;

  @Field()
  explanation: string;

  @Field(() => Int)
  estimatedCount: number;
}

@ObjectType()
export class ContentPieceType {
  @Field(() => ID)
  id: string;

  @Field(() => ContentTypeEnum)
  type: ContentTypeEnum;

  @Field({ nullable: true })
  subject?: string;

  @Field()
  body: string;

  @Field({ nullable: true })
  previewText?: string;

  @Field(() => ContentStatusEnum)
  status: ContentStatusEnum;

  @Field({ nullable: true })
  generatedBy?: string;

  @Field({ nullable: true })
  variantLabel?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class CampaignType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => CampaignTypeEnum)
  type: CampaignTypeEnum;

  @Field(() => CampaignStatusEnum)
  status: CampaignStatusEnum;

  @Field(() => [String])
  channels: string[];

  @Field({ nullable: true })
  scheduledAt?: Date;

  @Field({ nullable: true })
  sentAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [AudienceSegmentType], { nullable: true })
  segments?: AudienceSegmentType[];

  @Field(() => [ContentPieceType], { nullable: true })
  contentPieces?: ContentPieceType[];

  @Field(() => Int, { nullable: true })
  segmentCount?: number;

  @Field(() => Int, { nullable: true })
  contentPieceCount?: number;

  @Field(() => Int, { nullable: true })
  memberCount?: number;
}

@ObjectType()
export class CampaignMetricsType {
  @Field(() => Int)
  sent: number;

  @Field(() => Int)
  delivered: number;

  @Field(() => Int)
  opened: number;

  @Field(() => Int)
  clicked: number;

  @Field(() => Int)
  bounced: number;

  @Field(() => Int)
  unsubscribed: number;
}

@ObjectType()
export class CampaignAnalyticsType {
  @Field(() => ID)
  id: string;

  @Field(() => MetricPeriodEnum)
  period: MetricPeriodEnum;

  @Field()
  date: Date;

  @Field(() => Int)
  sent: number;

  @Field(() => Int)
  delivered: number;

  @Field(() => Int)
  opened: number;

  @Field(() => Int)
  clicked: number;

  @Field(() => Int)
  bounced: number;

  @Field(() => Int)
  unsubscribed: number;
}

@ObjectType()
export class ChannelConfigType {
  @Field(() => ID)
  id: string;

  @Field(() => ChannelTypeEnum)
  type: ChannelTypeEnum;

  @Field(() => ChannelStatusEnum)
  status: ChannelStatusEnum;

  @Field({ nullable: true })
  lastSyncAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class BrandConfigType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  primaryColor?: string;

  @Field({ nullable: true })
  secondaryColor?: string;

  @Field({ nullable: true })
  tone?: string;

  @Field({ nullable: true })
  language?: string;

  @Field({ nullable: true })
  fromName?: string;

  @Field({ nullable: true })
  fromEmail?: string;

  @Field({ nullable: true })
  replyToEmail?: string;

  @Field({ nullable: true })
  guidelines?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class MarketingStatsType {
  @Field(() => Int)
  totalCampaigns: number;

  @Field(() => Int)
  activeCampaigns: number;

  @Field(() => Int)
  totalAudienceSize: number;

  @Field(() => Int)
  totalEmailsSent: number;
}

@ObjectType()
export class GeneratedContentType {
  @Field()
  subject: string;

  @Field()
  body: string;

  @Field()
  previewText: string;
}

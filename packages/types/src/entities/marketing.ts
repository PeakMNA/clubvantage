/**
 * Marketing entity types for ClubVantage
 * Phase 1: Foundation + Email
 */

// Audience segment types
export const SegmentType = {
  SMART: 'SMART',
  CUSTOM: 'CUSTOM',
  MANUAL: 'MANUAL',
} as const;
export type SegmentType = (typeof SegmentType)[keyof typeof SegmentType];

export const FilterOperator = {
  EQUALS: 'EQUALS',
  NOT_EQUALS: 'NOT_EQUALS',
  GREATER_THAN: 'GREATER_THAN',
  LESS_THAN: 'LESS_THAN',
  GREATER_THAN_OR_EQUAL: 'GREATER_THAN_OR_EQUAL',
  LESS_THAN_OR_EQUAL: 'LESS_THAN_OR_EQUAL',
  CONTAINS: 'CONTAINS',
  NOT_CONTAINS: 'NOT_CONTAINS',
  IN: 'IN',
  NOT_IN: 'NOT_IN',
  BETWEEN: 'BETWEEN',
  IS_NULL: 'IS_NULL',
  IS_NOT_NULL: 'IS_NOT_NULL',
  BEFORE: 'BEFORE',
  AFTER: 'AFTER',
  WITHIN_LAST: 'WITHIN_LAST',
} as const;
export type FilterOperator = (typeof FilterOperator)[keyof typeof FilterOperator];

export const SegmentSource = {
  MEMBERS: 'MEMBERS',
  BOOKINGS: 'BOOKINGS',
  BILLING: 'BILLING',
  GOLF: 'GOLF',
} as const;
export type SegmentSource = (typeof SegmentSource)[keyof typeof SegmentSource];

// Content types
export const ContentType = {
  EMAIL: 'EMAIL',
  SOCIAL_POST: 'SOCIAL_POST',
  LINE_MESSAGE: 'LINE_MESSAGE',
  LANDING_PAGE: 'LANDING_PAGE',
} as const;
export type ContentType = (typeof ContentType)[keyof typeof ContentType];

export const ContentStatus = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED',
} as const;
export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus];

// Campaign types
export const CampaignType = {
  ONE_SHOT: 'ONE_SHOT',
  AUTOMATED_FLOW: 'AUTOMATED_FLOW',
} as const;
export type CampaignType = (typeof CampaignType)[keyof typeof CampaignType];

export const CampaignStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type CampaignStatus = (typeof CampaignStatus)[keyof typeof CampaignStatus];

// Channel types
export const ChannelType = {
  EMAIL: 'EMAIL',
  FACEBOOK: 'FACEBOOK',
  INSTAGRAM: 'INSTAGRAM',
  LINE: 'LINE',
  LANDING_PAGE: 'LANDING_PAGE',
} as const;
export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType];

export const ChannelStatus = {
  NOT_CONNECTED: 'NOT_CONNECTED',
  CONNECTED: 'CONNECTED',
  ERROR: 'ERROR',
  SUSPENDED: 'SUSPENDED',
} as const;
export type ChannelStatus = (typeof ChannelStatus)[keyof typeof ChannelStatus];

// Campaign member delivery status
export const CampaignMemberStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  OPENED: 'OPENED',
  CLICKED: 'CLICKED',
  BOUNCED: 'BOUNCED',
  UNSUBSCRIBED: 'UNSUBSCRIBED',
} as const;
export type CampaignMemberStatus = (typeof CampaignMemberStatus)[keyof typeof CampaignMemberStatus];

// Analytics types
export const MetricPeriod = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
} as const;
export type MetricPeriod = (typeof MetricPeriod)[keyof typeof MetricPeriod];

export const AttributionModel = {
  FIRST_TOUCH: 'FIRST_TOUCH',
  LAST_TOUCH: 'LAST_TOUCH',
  LINEAR: 'LINEAR',
} as const;
export type AttributionModel = (typeof AttributionModel)[keyof typeof AttributionModel];

// Marketing event types
export const MarketingEventType = {
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  OPENED: 'OPENED',
  CLICKED: 'CLICKED',
  BOUNCED: 'BOUNCED',
  UNSUBSCRIBED: 'UNSUBSCRIBED',
  COMPLAINED: 'COMPLAINED',
} as const;
export type MarketingEventType = (typeof MarketingEventType)[keyof typeof MarketingEventType];

// Content generator source
export const ContentGeneratedBy = {
  AI: 'AI',
  STAFF: 'STAFF',
} as const;
export type ContentGeneratedBy = (typeof ContentGeneratedBy)[keyof typeof ContentGeneratedBy];

// Campaign tier
export const CampaignTier = {
  SELF_SERVE: 'SELF_SERVE',
  MANAGED: 'MANAGED',
} as const;
export type CampaignTier = (typeof CampaignTier)[keyof typeof CampaignTier];

// Segment rule interface
export interface SegmentRule {
  field: string;
  operator: FilterOperator;
  value: unknown;
  source: SegmentSource;
}

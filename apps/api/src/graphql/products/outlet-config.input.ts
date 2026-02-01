import { InputType, Field, ID, Int, PartialType } from '@nestjs/graphql';
import {
  TileSize,
  CategoryDisplayStyle,
  QuickKeysPosition,
  SuggestionPosition,
} from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

// ============================================================================
// OUTLET PRODUCT CONFIG
// ============================================================================

@InputType()
export class TimeRuleInput {
  @Field()
  startTime: string;

  @Field()
  endTime: string;

  @Field(() => [Int])
  daysOfWeek: number[];
}

@InputType()
export class RoleRulesInput {
  @Field(() => [String], { nullable: true })
  allowedRoles?: string[];

  @Field(() => [String], { nullable: true })
  deniedRoles?: string[];
}

@InputType()
export class VisibilityRulesInput {
  @Field(() => [TimeRuleInput], { nullable: true })
  timeRules?: TimeRuleInput[];

  @Field(() => RoleRulesInput, { nullable: true })
  roleRules?: RoleRulesInput;

  @Field({ nullable: true })
  inventoryRule?: string;

  @Field({ nullable: true })
  memberOnly?: boolean;
}

@InputType()
export class UpdateOutletProductConfigInput {
  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  buttonColor?: string;

  @Field(() => Int, { nullable: true })
  sortPriority?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  gridPosition?: { row: number; col: number };

  @Field({ nullable: true })
  isVisible?: boolean;

  @Field(() => VisibilityRulesInput, { nullable: true })
  visibilityRules?: VisibilityRulesInput;

  @Field({ nullable: true })
  isQuickKey?: boolean;

  @Field(() => Int, { nullable: true })
  quickKeyPosition?: number;
}

@InputType()
export class BulkOutletProductConfigInput {
  @Field(() => [ID])
  productIds: string[];

  @Field({ nullable: true })
  isVisible?: boolean;

  @Field({ nullable: true })
  isQuickKey?: boolean;

  @Field(() => ID, { nullable: true })
  categoryId?: string;
}

// ============================================================================
// OUTLET GRID CONFIG
// ============================================================================

@InputType()
export class UpdateOutletGridConfigInput {
  @Field(() => Int, { nullable: true })
  gridColumns?: number;

  @Field(() => Int, { nullable: true })
  gridRows?: number;

  @Field(() => TileSize, { nullable: true })
  tileSize?: TileSize;

  @Field({ nullable: true })
  showImages?: boolean;

  @Field({ nullable: true })
  showPrices?: boolean;

  @Field(() => CategoryDisplayStyle, { nullable: true })
  categoryStyle?: CategoryDisplayStyle;

  @Field({ nullable: true })
  showAllCategory?: boolean;

  @Field({ nullable: true })
  quickKeysEnabled?: boolean;

  @Field(() => Int, { nullable: true })
  quickKeysCount?: number;

  @Field(() => QuickKeysPosition, { nullable: true })
  quickKeysPosition?: QuickKeysPosition;
}

// ============================================================================
// SMART SUGGESTIONS
// ============================================================================

@InputType()
export class UpdateSmartSuggestionConfigInput {
  @Field({ nullable: true })
  enabled?: boolean;

  @Field(() => Int, { nullable: true })
  suggestionCount?: number;

  @Field(() => SuggestionPosition, { nullable: true })
  position?: SuggestionPosition;

  @Field(() => Int, { nullable: true })
  timeOfDayWeight?: number;

  @Field(() => Int, { nullable: true })
  salesVelocityWeight?: number;

  @Field(() => Int, { nullable: true })
  staffHistoryWeight?: number;

  @Field(() => Int, { nullable: true })
  refreshIntervalMinutes?: number;
}

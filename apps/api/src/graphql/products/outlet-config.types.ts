import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import {
  TileSize,
  CategoryDisplayStyle,
  QuickKeysPosition,
  SuggestionPosition,
} from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';
import { ProductTypeGql } from './product.types';

// Register enums
registerEnumType(TileSize, { name: 'TileSize' });
registerEnumType(CategoryDisplayStyle, { name: 'CategoryDisplayStyle' });
registerEnumType(QuickKeysPosition, { name: 'QuickKeysPosition' });
registerEnumType(SuggestionPosition, { name: 'SuggestionPosition' });

@ObjectType('OutletProductConfig')
export class OutletProductConfigType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  outletId: string;

  @Field(() => ID)
  productId: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  buttonColor?: string;

  @Field(() => Int, { nullable: true })
  sortPriority?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  gridPosition?: { row: number; col: number };

  @Field()
  isVisible: boolean;

  @Field(() => GraphQLJSON)
  visibilityRules: Record<string, any>;

  @Field()
  isQuickKey: boolean;

  @Field(() => Int, { nullable: true })
  quickKeyPosition?: number;

  @Field(() => ProductTypeGql, { nullable: true })
  product?: ProductTypeGql;
}

@ObjectType('OutletCategoryConfig')
export class OutletCategoryConfigType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  outletId: string;

  @Field(() => ID)
  categoryId: string;

  @Field()
  isVisible: boolean;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;

  @Field({ nullable: true })
  colorOverride?: string;
}

@ObjectType('OutletGridConfig')
export class OutletGridConfigType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  outletId: string;

  @Field(() => Int)
  gridColumns: number;

  @Field(() => Int)
  gridRows: number;

  @Field(() => TileSize)
  tileSize: TileSize;

  @Field()
  showImages: boolean;

  @Field()
  showPrices: boolean;

  @Field(() => CategoryDisplayStyle)
  categoryStyle: CategoryDisplayStyle;

  @Field()
  showAllCategory: boolean;

  @Field()
  quickKeysEnabled: boolean;

  @Field(() => Int)
  quickKeysCount: number;

  @Field(() => QuickKeysPosition)
  quickKeysPosition: QuickKeysPosition;
}

@ObjectType('SmartSuggestionConfig')
export class SmartSuggestionConfigType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  outletId: string;

  @Field()
  enabled: boolean;

  @Field(() => Int)
  suggestionCount: number;

  @Field(() => SuggestionPosition)
  position: SuggestionPosition;

  @Field(() => Int)
  timeOfDayWeight: number;

  @Field(() => Int)
  salesVelocityWeight: number;

  @Field(() => Int)
  staffHistoryWeight: number;

  @Field(() => Int)
  refreshIntervalMinutes: number;
}

@ObjectType('OutletProductPanel')
export class OutletProductPanelType {
  @Field(() => OutletGridConfigType)
  gridConfig: OutletGridConfigType;

  @Field(() => SmartSuggestionConfigType, { nullable: true })
  suggestionConfig?: SmartSuggestionConfigType;

  @Field(() => [ProductTypeGql])
  quickKeys: ProductTypeGql[];

  @Field(() => [ProductTypeGql])
  suggestions: ProductTypeGql[];
}

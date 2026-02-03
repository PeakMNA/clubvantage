import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType('LookupCategory')
export class LookupCategoryType {
  @Field(() => ID)
  id: string;

  @Field()
  code: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isSystem: boolean;

  @Field()
  isGlobal: boolean;

  @Field(() => Int)
  sortOrder: number;

  @Field(() => Int)
  valueCount: number;

  @Field(() => [LookupValueType], { nullable: true })
  values?: LookupValueType[];
}

@ObjectType('LookupValue')
export class LookupValueType {
  @Field(() => ID)
  id: string;

  @Field()
  categoryId: string;

  @Field({ nullable: true })
  clubId?: string;

  @Field()
  code: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;

  @Field()
  isDefault: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;

  @Field(() => [LookupTranslationType], { nullable: true })
  translations?: LookupTranslationType[];

  @Field(() => LookupCategoryType, { nullable: true })
  category?: LookupCategoryType;
}

@ObjectType('LookupTranslation')
export class LookupTranslationType {
  @Field(() => ID)
  id: string;

  @Field()
  lookupValueId: string;

  @Field()
  locale: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType('LookupMutationResult')
export class LookupMutationResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  error?: string;

  @Field(() => LookupValueType, { nullable: true })
  value?: LookupValueType;

  @Field(() => LookupTranslationType, { nullable: true })
  translation?: LookupTranslationType;
}

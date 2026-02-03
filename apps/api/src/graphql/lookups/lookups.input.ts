import { InputType, Field, ID, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class LookupCategoryFilterInput {
  @Field({ nullable: true })
  isGlobal?: boolean;

  @Field({ nullable: true })
  isSystem?: boolean;
}

@InputType()
export class LookupValueFilterInput {
  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  categoryCode?: string;

  @Field({ nullable: true })
  includeInactive?: boolean;
}

@InputType()
export class CreateLookupValueInput {
  @Field(() => ID)
  categoryId: string;

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

  @Field(() => Int, { nullable: true })
  sortOrder?: number;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  isDefault?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}

@InputType()
export class UpdateLookupValueInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  isDefault?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}

@InputType()
export class AddLookupTranslationInput {
  @Field(() => ID)
  lookupValueId: string;

  @Field()
  locale: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class UpdateLookupTranslationInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;
}

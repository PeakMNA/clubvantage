import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { InterestSource } from '@prisma/client';

// Register enum for GraphQL
registerEnumType(InterestSource, {
  name: 'InterestSource',
  description: 'Source of the interest data',
});

@ObjectType({ description: 'Interest category for member engagement' })
export class InterestCategoryType {
  @Field(() => ID)
  id: string;

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
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType({ description: 'Member interest in an activity category' })
export class MemberInterestType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  memberId: string;

  @Field(() => ID)
  categoryId: string;

  @Field(() => Int, { description: 'Interest level 0-100' })
  interestLevel: number;

  @Field(() => InterestSource)
  source: InterestSource;

  @Field({ nullable: true })
  lastActivityAt?: Date;

  @Field(() => Int)
  activityCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => InterestCategoryType, { nullable: true })
  category?: InterestCategoryType;
}

@ObjectType({ description: 'Dependent interest in an activity category' })
export class DependentInterestType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  dependentId: string;

  @Field(() => ID)
  categoryId: string;

  @Field(() => Int, { description: 'Interest level 0-100' })
  interestLevel: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => InterestCategoryType, { nullable: true })
  category?: InterestCategoryType;
}

@ObjectType({ description: 'Member communication preferences' })
export class MemberCommunicationPrefsType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  memberId: string;

  @Field()
  emailPromotions: boolean;

  @Field()
  smsPromotions: boolean;

  @Field()
  pushNotifications: boolean;

  @Field(() => [String])
  unsubscribedCategories: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType('EngagementDeleteResponse', { description: 'Response for engagement delete operations' })
export class EngagementDeleteResponseType {
  @Field()
  message: string;
}

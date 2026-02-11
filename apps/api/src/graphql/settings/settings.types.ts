import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class ClubProfileType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  primaryColor?: string;

  @Field({ nullable: true })
  timezone?: string;

  @Field({ nullable: true })
  region?: string;

  @Field()
  subscriptionTier: string;

  @Field()
  subscriptionStatus: string;

  @Field(() => Int, { nullable: true })
  maxMembers?: number;

  @Field(() => Int, { nullable: true })
  maxUsers?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  features?: any;
}

@ObjectType()
export class BillingSettingsType {
  @Field(() => Float, { nullable: true })
  taxRate?: number;

  @Field({ nullable: true })
  taxType?: string;

  @Field({ nullable: true })
  currency?: string;

  @Field()
  invoicePrefix: string;

  @Field(() => Int)
  paymentTermDays: number;
}

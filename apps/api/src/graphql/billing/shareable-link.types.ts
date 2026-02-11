import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';

export enum ShareableEntityTypeEnum {
  INVOICE = 'INVOICE',
  RECEIPT = 'RECEIPT',
  STATEMENT = 'STATEMENT',
}

registerEnumType(ShareableEntityTypeEnum, {
  name: 'ShareableEntityType',
  description: 'Type of entity that can be shared via link',
});

@ObjectType()
export class ShareableLinkType {
  @Field(() => ID)
  id: string;

  @Field()
  token: string;

  @Field(() => ShareableEntityTypeEnum)
  entityType: ShareableEntityTypeEnum;

  @Field(() => ID)
  entityId: string;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field(() => Int, { nullable: true })
  maxViews?: number;

  @Field(() => Int)
  viewCount: number;

  @Field()
  isActive: boolean;

  @Field()
  hasPassword: boolean;

  @Field({ nullable: true })
  lastViewedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  url: string;
}

import { ObjectType, Field, ID, registerEnumType, Int } from '@nestjs/graphql';
import { UserRole } from '@/modules/users/users.service';

// Register enum for GraphQL
registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User role options',
});

export { UserRole };

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => UserRole)
  role: string;

  @Field(() => [String])
  permissions: string[];

  @Field({ nullable: true })
  phone?: string;

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  emailVerified?: boolean;

  @Field({ nullable: true })
  lastLoginAt?: Date;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class PaginationMetaType {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType()
export class UserListResultType {
  @Field(() => [UserType])
  data: UserType[];

  @Field(() => PaginationMetaType)
  meta: PaginationMetaType;
}

@ObjectType()
export class StatusMessageType {
  @Field()
  message: string;
}

@ObjectType()
export class ActivityEntryType {
  @Field(() => ID)
  id: string;

  @Field()
  aggregateType: string;

  @Field()
  aggregateId: string;

  @Field()
  type: string;

  @Field()
  data: string;

  @Field()
  userId: string;

  @Field()
  userEmail: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class ActivityLogResultType {
  @Field(() => [ActivityEntryType])
  data: ActivityEntryType[];

  @Field(() => PaginationMetaType)
  meta: PaginationMetaType;
}

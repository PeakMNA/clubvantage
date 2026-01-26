import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Paginated } from '../common/pagination';
import { MemberStatus } from '@/modules/members/dto/create-member.dto';

// Re-export and register enum for GraphQL
export { MemberStatus };

registerEnumType(MemberStatus, {
  name: 'MemberStatus',
  description: 'Member status options',
});

@ObjectType()
export class MembershipTypeType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  code: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  monthlyFee?: number;

  @Field({ nullable: true })
  annualFee?: number;

  @Field({ nullable: true })
  joiningFee?: number;

  @Field()
  allowGuests: boolean;

  @Field()
  maxGuestsPerBooking: number;

  @Field()
  allowFamilyMembers: boolean;

  @Field()
  maxFamilyMembers: number;

  @Field()
  bookingAdvanceDays: number;

  @Field()
  priorityBooking: boolean;
}

@ObjectType()
export class MembershipTierType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  code: string;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
export class HouseholdType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  email?: string;
}

@ObjectType()
export class MemberSummaryType {
  @Field(() => ID)
  id: string;

  @Field()
  memberId: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => Boolean, { nullable: true })
  isPrimaryMember?: boolean;
}

@ObjectType()
export class DependentType {
  @Field(() => ID)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  relationship: string;

  @Field({ nullable: true })
  dateOfBirth?: Date;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  isActive: boolean;
}

@ObjectType()
export class MemberType {
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

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  dateOfBirth?: Date;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  nationality?: string;

  @Field({ nullable: true })
  idNumber?: string;

  @Field({ nullable: true })
  emergencyContact?: string;

  @Field({ nullable: true })
  emergencyPhone?: string;

  @Field(() => MemberStatus)
  status: MemberStatus;

  @Field()
  joinDate: Date;

  @Field({ nullable: true })
  expiryDate?: Date;

  @Field({ nullable: true })
  renewalDate?: Date;

  @Field(() => Boolean)
  isPrimaryMember: boolean;

  @Field()
  creditBalance: string;

  @Field()
  outstandingBalance: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [String])
  tags: string[];

  @Field(() => Boolean)
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations
  @Field(() => MembershipTypeType, { nullable: true })
  membershipType?: MembershipTypeType;

  @Field(() => MembershipTierType, { nullable: true })
  membershipTier?: MembershipTierType;

  @Field(() => HouseholdType, { nullable: true })
  household?: HouseholdType;

  @Field(() => MemberSummaryType, { nullable: true })
  referredBy?: MemberSummaryType;

  @Field(() => [DependentType], { nullable: true })
  dependents?: DependentType[];
}

@ObjectType()
export class MemberConnection extends Paginated(MemberType) {}

@ObjectType()
export class MemberStatsType {
  @Field()
  total: number;

  @Field()
  active: number;

  @Field()
  suspended: number;

  @Field()
  inactive: number;
}

@ObjectType()
export class DeleteMemberResponseType {
  @Field()
  message: string;
}

@ObjectType()
export class DeleteDependentResponseType {
  @Field()
  message: string;
}

import { ObjectType, Field, ID, registerEnumType, Int } from '@nestjs/graphql';
import { Paginated } from '../common/pagination';
import { ApplicationStatus } from '@prisma/client';

// Register enum for GraphQL
registerEnumType(ApplicationStatus, {
  name: 'ApplicationStatus',
  description: 'Membership application status options',
});

export { ApplicationStatus };

@ObjectType()
export class ApplicationSponsorType {
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
}

@ObjectType()
export class ApplicationMembershipTypeType {
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
export class MembershipApplicationType {
  @Field(() => ID)
  id: string;

  @Field()
  applicationNumber: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => ApplicationMembershipTypeType)
  membershipType: ApplicationMembershipTypeType;

  @Field(() => ApplicationSponsorType, { nullable: true })
  sponsor?: ApplicationSponsorType;

  @Field(() => ApplicationStatus)
  status: ApplicationStatus;

  @Field()
  submittedAt: Date;

  @Field({ nullable: true })
  reviewedAt?: Date;

  @Field({ nullable: true })
  reviewedBy?: string;

  @Field({ nullable: true })
  approvedAt?: Date;

  @Field({ nullable: true })
  approvedBy?: string;

  @Field({ nullable: true })
  rejectedAt?: Date;

  @Field({ nullable: true })
  rejectedBy?: string;

  @Field({ nullable: true })
  withdrawnAt?: Date;

  @Field({ nullable: true })
  reviewNotes?: string;

  @Field({ nullable: true })
  rejectionReason?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ApplicationEdge {
  @Field(() => MembershipApplicationType)
  node: MembershipApplicationType;

  @Field()
  cursor: string;
}

@ObjectType()
export class ApplicationConnection extends Paginated(MembershipApplicationType) {
  @Field(() => [ApplicationEdge])
  edges: ApplicationEdge[];
}

@ObjectType()
export class ApplicationStatsType {
  @Field(() => Int)
  submitted: number;

  @Field(() => Int)
  underReview: number;

  @Field(() => Int)
  pendingBoard: number;

  @Field(() => Int)
  approved: number;

  @Field(() => Int)
  rejected: number;

  @Field(() => Int)
  total: number;
}

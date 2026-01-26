import { InputType, Field, ID, ArgsType, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsEmail, IsUUID, IsEnum, IsBoolean, IsInt, Min, Max, IsArray } from 'class-validator';
import { MemberStatus } from './members.types';
import { PaginationArgs } from '../common/pagination';

@InputType()
export class CreateMemberInput {
  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  dateOfBirth?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  gender?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nationality?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  idNumber?: string;

  @Field(() => ID)
  @IsUUID()
  membershipTypeId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  membershipTierId?: string;

  @Field(() => MemberStatus, { nullable: true })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @Field({ nullable: true })
  @IsOptional()
  joinDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  expiryDate?: Date;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  householdId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPrimaryMember?: boolean;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  referredById?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  referralSource?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

@InputType()
export class UpdateMemberInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  dateOfBirth?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  gender?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nationality?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  idNumber?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  membershipTypeId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  membershipTierId?: string;

  @Field({ nullable: true })
  @IsOptional()
  expiryDate?: Date;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  householdId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPrimaryMember?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

@InputType()
export class ChangeStatusInput {
  @Field(() => MemberStatus)
  @IsEnum(MemberStatus)
  status: MemberStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}

@InputType()
export class CreateDependentInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;

  @Field()
  @IsString()
  relationship: string;

  @Field({ nullable: true })
  @IsOptional()
  dateOfBirth?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;
}

@InputType()
export class UpdateDependentInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  relationship?: string;

  @Field({ nullable: true })
  @IsOptional()
  dateOfBirth?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@ArgsType()
export class MembersQueryArgs extends PaginationArgs {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => MemberStatus, { nullable: true })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  membershipTypeId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  householdId?: string;

  @Field({ nullable: true, defaultValue: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field({ nullable: true, defaultValue: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

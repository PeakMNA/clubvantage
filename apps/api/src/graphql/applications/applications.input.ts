import { InputType, Field, ID, ArgsType, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsEmail, IsUUID, IsEnum } from 'class-validator';
import { ApplicationStatus } from './applications.types';
import { PaginationArgs } from '../common/pagination';

@InputType()
export class CreateApplicationInput {
  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;

  @Field()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field(() => ID)
  @IsUUID()
  membershipTypeId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  sponsorId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

@InputType()
export class UpdateApplicationInput {
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

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  membershipTypeId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  sponsorId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

@InputType()
export class ChangeApplicationStatusInput {
  @Field(() => ApplicationStatus)
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reviewNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

@ArgsType()
export class ApplicationsQueryArgs extends PaginationArgs {
  @Field(() => ApplicationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

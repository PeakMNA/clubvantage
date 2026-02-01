import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  IsObject,
  MaxLength,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

/**
 * GraphQL inputs for POS Configuration mutations
 */

@InputType()
export class POSTemplateInput {
  @Field()
  @IsString()
  @MaxLength(100)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @Field()
  @IsString()
  @MaxLength(50)
  outletType: string;

  @Field(() => GraphQLJSON)
  @IsObject()
  toolbarConfig: any;

  @Field(() => GraphQLJSON)
  @IsObject()
  actionBarConfig: any;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

@InputType()
export class POSRoleOverridesInput {
  @Field()
  @IsString()
  @MaxLength(50)
  role: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  hidden?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  disabled?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  requireApproval?: string[];
}

@InputType()
export class AssignTemplateInput {
  @Field(() => ID)
  @IsUUID()
  outletId: string;

  @Field(() => ID)
  @IsUUID()
  templateId: string;
}

@InputType()
export class UpdateButtonRegistryInput {
  @Field(() => GraphQLJSON)
  @IsObject()
  registry: any;
}

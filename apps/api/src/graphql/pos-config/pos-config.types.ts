import { ObjectType, Field, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

/**
 * GraphQL types for POS Configuration system
 */

@ObjectType()
export class POSTemplateGraphQLType {
  @Field(() => ID)
  id: string;

  @Field()
  clubId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  outletType: string;

  @Field(() => GraphQLJSON)
  toolbarConfig: any;

  @Field(() => GraphQLJSON)
  actionBarConfig: any;

  @Field()
  isDefault: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [POSOutletGraphQLType], { nullable: true })
  outlets?: POSOutletGraphQLType[];
}

@ObjectType()
export class POSOutletGraphQLType {
  @Field(() => ID)
  id: string;

  @Field()
  clubId: string;

  @Field()
  name: string;

  @Field()
  outletType: string;

  @Field({ nullable: true })
  templateId?: string;

  @Field(() => GraphQLJSON)
  customConfig: any;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => POSTemplateGraphQLType, { nullable: true })
  template?: POSTemplateGraphQLType;

  @Field(() => [POSOutletRoleConfigGraphQLType], { nullable: true })
  roleConfigs?: POSOutletRoleConfigGraphQLType[];
}

@ObjectType()
export class POSOutletRoleConfigGraphQLType {
  @Field(() => ID)
  id: string;

  @Field()
  outletId: string;

  @Field()
  role: string;

  @Field(() => GraphQLJSON)
  buttonOverrides: any;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class POSButtonStateGraphQLType {
  @Field()
  buttonId: string;

  @Field()
  visible: boolean;

  @Field()
  enabled: boolean;

  @Field()
  requiresApproval: boolean;
}

@ObjectType()
export class POSResolvedConfigGraphQLType {
  @Field(() => POSOutletGraphQLType)
  outlet: POSOutletGraphQLType;

  @Field(() => POSTemplateGraphQLType, { nullable: true })
  template?: POSTemplateGraphQLType;

  @Field(() => GraphQLJSON)
  toolbarConfig: any;

  @Field(() => GraphQLJSON)
  actionBarConfig: any;

  @Field(() => [POSButtonStateGraphQLType])
  buttonStates: POSButtonStateGraphQLType[];
}

@ObjectType()
export class POSButtonRegistryGraphQLType {
  @Field()
  clubId: string;

  @Field(() => GraphQLJSON)
  registry: any;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class CloneTemplateMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => POSTemplateGraphQLType, { nullable: true })
  template?: POSTemplateGraphQLType;
}

@ObjectType()
export class UpsertTemplateMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => POSTemplateGraphQLType, { nullable: true })
  template?: POSTemplateGraphQLType;
}

@ObjectType()
export class AssignTemplateMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => POSOutletGraphQLType, { nullable: true })
  outlet?: POSOutletGraphQLType;
}

@ObjectType()
export class SetRoleOverridesMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => POSOutletRoleConfigGraphQLType, { nullable: true })
  roleConfig?: POSOutletRoleConfigGraphQLType;
}

@ObjectType()
export class UpdateButtonRegistryMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => POSButtonRegistryGraphQLType, { nullable: true })
  buttonRegistry?: POSButtonRegistryGraphQLType;
}

@ObjectType()
export class DeleteTemplateMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}

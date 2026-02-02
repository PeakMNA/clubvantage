import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { POSConfigService } from './pos-config.service';
import {
  POSTemplateGraphQLType,
  POSOutletGraphQLType,
  POSOutletRoleConfigGraphQLType,
  POSResolvedConfigGraphQLType,
  POSButtonRegistryGraphQLType,
  CloneTemplateMutationResponse,
  UpsertTemplateMutationResponse,
  AssignTemplateMutationResponse,
  SetRoleOverridesMutationResponse,
  UpdateButtonRegistryMutationResponse,
  DeleteTemplateMutationResponse,
} from './pos-config.types';
import {
  POSTemplateInput,
  POSRoleOverridesInput,
  AssignTemplateInput,
  UpdateButtonRegistryInput,
} from './pos-config.input';

/**
 * Resolver for POS Configuration management
 */
@Resolver()
@UseGuards(GqlAuthGuard)
export class POSConfigResolver {
  constructor(private readonly posConfigService: POSConfigService) {}

  // ============================================================================
  // TEMPLATE QUERIES
  // ============================================================================

  @Query(() => [POSTemplateGraphQLType], {
    name: 'posTemplates',
    description: 'Get all POS templates for the current club',
  })
  async getPOSTemplates(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<POSTemplateGraphQLType[]> {
    const templates = await this.posConfigService.getTemplates(user.tenantId);
    return templates.map(this.mapTemplateToGraphQL);
  }

  @Query(() => POSTemplateGraphQLType, {
    name: 'posTemplate',
    description: 'Get a single POS template by ID',
    nullable: true,
  })
  async getPOSTemplate(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<POSTemplateGraphQLType | null> {
    const template = await this.posConfigService.getTemplate(id, user.tenantId);
    return template ? this.mapTemplateToGraphQL(template) : null;
  }

  // ============================================================================
  // OUTLET QUERIES
  // ============================================================================

  @Query(() => [POSOutletGraphQLType], {
    name: 'posOutlets',
    description: 'Get all POS outlets for the current club',
  })
  async getPOSOutlets(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<POSOutletGraphQLType[]> {
    const outlets = await this.posConfigService.getOutlets(user.tenantId);
    return outlets.map(this.mapOutletToGraphQL);
  }

  @Query(() => POSOutletGraphQLType, {
    name: 'posOutlet',
    description: 'Get a single POS outlet by ID',
    nullable: true,
  })
  async getPOSOutlet(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<POSOutletGraphQLType | null> {
    const outlet = await this.posConfigService.getOutlet(id, user.tenantId);
    return outlet ? this.mapOutletToGraphQL(outlet) : null;
  }

  // ============================================================================
  // BUTTON REGISTRY QUERIES
  // ============================================================================

  @Query(() => POSButtonRegistryGraphQLType, {
    name: 'posButtonRegistry',
    description: 'Get the button registry for the current club',
  })
  async getPOSButtonRegistry(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<POSButtonRegistryGraphQLType> {
    return this.posConfigService.getButtonRegistry(user.tenantId);
  }

  // ============================================================================
  // RESOLVED CONFIG QUERY
  // ============================================================================

  @Query(() => POSResolvedConfigGraphQLType, {
    name: 'posConfig',
    description: 'Get resolved POS configuration for an outlet and user role',
  })
  async getPOSConfig(
    @GqlCurrentUser() user: JwtPayload,
    @Args('outletId', { type: () => ID }) outletId: string,
    @Args('userRole') userRole: string,
    @Args('userPermissions', { type: () => [String], nullable: true })
    userPermissions?: string[],
  ): Promise<POSResolvedConfigGraphQLType> {
    const config = await this.posConfigService.getResolvedConfig(
      outletId,
      userRole,
      user.tenantId,
      userPermissions || [],
    );

    return {
      outlet: this.mapOutletToGraphQL(config.outlet),
      template: config.template ? this.mapTemplateToGraphQL(config.template) : undefined,
      toolbarConfig: config.toolbarConfig,
      actionBarConfig: config.actionBarConfig,
      buttonStates: config.buttonStates,
    };
  }

  // ============================================================================
  // TEMPLATE MUTATIONS
  // ============================================================================

  @Mutation(() => UpsertTemplateMutationResponse, {
    name: 'upsertPOSTemplate',
    description: 'Create or update a POS template',
  })
  async upsertPOSTemplate(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: POSTemplateInput,
    @Args('id', { type: () => ID, nullable: true }) id?: string,
  ): Promise<UpsertTemplateMutationResponse> {
    try {
      const template = await this.posConfigService.upsertTemplate(
        user.tenantId,
        id || null,
        input,
      );
      return {
        success: true,
        message: id ? 'Template updated successfully' : 'Template created successfully',
        template: this.mapTemplateToGraphQL(template),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to upsert template',
      };
    }
  }

  @Mutation(() => CloneTemplateMutationResponse, {
    name: 'clonePOSTemplate',
    description: 'Clone a POS template with a new name',
  })
  async clonePOSTemplate(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('newName') newName: string,
  ): Promise<CloneTemplateMutationResponse> {
    try {
      const template = await this.posConfigService.cloneTemplate(id, newName, user.tenantId);
      return {
        success: true,
        message: 'Template cloned successfully',
        template: this.mapTemplateToGraphQL(template),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to clone template',
      };
    }
  }

  @Mutation(() => DeleteTemplateMutationResponse, {
    name: 'deletePOSTemplate',
    description: 'Delete a POS template',
  })
  async deletePOSTemplate(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteTemplateMutationResponse> {
    try {
      await this.posConfigService.deleteTemplate(id, user.tenantId);
      return {
        success: true,
        message: 'Template deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to delete template',
      };
    }
  }

  // ============================================================================
  // OUTLET MUTATIONS
  // ============================================================================

  @Mutation(() => AssignTemplateMutationResponse, {
    name: 'assignPOSTemplate',
    description: 'Assign a template to an outlet',
  })
  async assignPOSTemplate(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: AssignTemplateInput,
  ): Promise<AssignTemplateMutationResponse> {
    try {
      const outlet = await this.posConfigService.assignTemplate(
        input.outletId,
        input.templateId,
        user.tenantId,
      );
      return {
        success: true,
        message: 'Template assigned successfully',
        outlet: this.mapOutletToGraphQL(outlet),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to assign template',
      };
    }
  }

  // ============================================================================
  // ROLE CONFIG MUTATIONS
  // ============================================================================

  @Mutation(() => SetRoleOverridesMutationResponse, {
    name: 'setPOSRoleOverrides',
    description: 'Set role-specific button overrides for an outlet',
  })
  async setPOSRoleOverrides(
    @GqlCurrentUser() user: JwtPayload,
    @Args('outletId', { type: () => ID }) outletId: string,
    @Args('input') input: POSRoleOverridesInput,
  ): Promise<SetRoleOverridesMutationResponse> {
    try {
      const roleConfig = await this.posConfigService.setRoleOverrides(outletId, input, user.tenantId);
      return {
        success: true,
        message: 'Role overrides set successfully',
        roleConfig: this.mapRoleConfigToGraphQL(roleConfig),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to set role overrides',
      };
    }
  }

  // ============================================================================
  // BUTTON REGISTRY MUTATIONS
  // ============================================================================

  @Mutation(() => UpdateButtonRegistryMutationResponse, {
    name: 'updatePOSButtonRegistry',
    description: 'Update the button registry for the club',
  })
  async updatePOSButtonRegistry(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UpdateButtonRegistryInput,
  ): Promise<UpdateButtonRegistryMutationResponse> {
    try {
      const buttonRegistry = await this.posConfigService.updateButtonRegistry(
        user.tenantId,
        input.registry,
      );
      return {
        success: true,
        message: 'Button registry updated successfully',
        buttonRegistry,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update button registry',
      };
    }
  }

  // ============================================================================
  // MAPPING HELPERS
  // ============================================================================

  private mapTemplateToGraphQL = (template: any): POSTemplateGraphQLType => ({
    id: template.id,
    clubId: template.clubId,
    name: template.name,
    description: template.description,
    outletType: template.outletType,
    toolbarConfig: template.toolbarConfig,
    actionBarConfig: template.actionBarConfig,
    isDefault: template.isDefault,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
    outlets: template.outlets?.map(this.mapOutletToGraphQL),
  });

  private mapOutletToGraphQL = (outlet: any): POSOutletGraphQLType => ({
    id: outlet.id,
    clubId: outlet.clubId,
    name: outlet.name,
    outletType: outlet.outletType,
    templateId: outlet.templateId,
    customConfig: outlet.customConfig,
    isActive: outlet.isActive,
    createdAt: outlet.createdAt,
    updatedAt: outlet.updatedAt,
    template: outlet.template ? this.mapTemplateToGraphQL(outlet.template) : undefined,
    roleConfigs: outlet.roleConfigs?.map(this.mapRoleConfigToGraphQL),
  });

  private mapRoleConfigToGraphQL = (
    roleConfig: any,
  ): POSOutletRoleConfigGraphQLType => ({
    id: roleConfig.id,
    outletId: roleConfig.outletId,
    role: roleConfig.role,
    buttonOverrides: roleConfig.buttonOverrides,
    createdAt: roleConfig.createdAt,
    updatedAt: roleConfig.updatedAt,
  });
}

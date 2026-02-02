import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { POSTemplateInput, POSRoleOverridesInput } from './pos-config.input';

/**
 * Service for managing POS configuration including templates, outlets, and role-based overrides
 */

export interface ButtonState {
  buttonId: string;
  visible: boolean;
  enabled: boolean;
  requiresApproval: boolean;
}

export interface ResolvedConfig {
  outlet: any;
  template: any | null;
  toolbarConfig: any;
  actionBarConfig: any;
  buttonStates: ButtonState[];
}

@Injectable()
export class POSConfigService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // TEMPLATE OPERATIONS
  // ============================================================================

  /**
   * Get all templates for a club
   */
  async getTemplates(clubId: string) {
    return this.prisma.pOSTemplate.findMany({
      where: { clubId },
      include: {
        outlets: true,
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  /**
   * Get a single template by ID with tenant isolation
   */
  async getTemplate(id: string, clubId: string) {
    const template = await this.prisma.pOSTemplate.findFirst({
      where: { id, clubId },
      include: {
        outlets: true,
      },
    });

    if (!template) {
      throw new NotFoundException('POS Template not found');
    }

    return template;
  }

  /**
   * Upsert (create or update) a template
   */
  async upsertTemplate(clubId: string, id: string | null, input: POSTemplateInput) {
    // If setting as default, unset other defaults first
    if (input.isDefault) {
      await this.prisma.pOSTemplate.updateMany({
        where: {
          clubId,
          outletType: input.outletType,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    if (id) {
      // Update existing template
      const existing = await this.prisma.pOSTemplate.findFirst({
        where: { id, clubId },
      });

      if (!existing) {
        throw new NotFoundException('POS Template not found');
      }

      return this.prisma.pOSTemplate.update({
        where: { id },
        data: {
          name: input.name,
          description: input.description,
          outletType: input.outletType,
          toolbarConfig: input.toolbarConfig as Prisma.InputJsonValue,
          actionBarConfig: input.actionBarConfig as Prisma.InputJsonValue,
          isDefault: input.isDefault ?? false,
        },
      });
    } else {
      // Create new template
      return this.prisma.pOSTemplate.create({
        data: {
          clubId,
          name: input.name,
          description: input.description,
          outletType: input.outletType,
          toolbarConfig: input.toolbarConfig as Prisma.InputJsonValue,
          actionBarConfig: input.actionBarConfig as Prisma.InputJsonValue,
          isDefault: input.isDefault ?? false,
        },
      });
    }
  }

  /**
   * Clone a template with a new name with tenant isolation
   */
  async cloneTemplate(id: string, newName: string, clubId: string) {
    const original = await this.prisma.pOSTemplate.findFirst({
      where: { id, clubId },
    });

    if (!original) {
      throw new NotFoundException('POS Template not found');
    }

    // Check for duplicate name
    const existing = await this.prisma.pOSTemplate.findFirst({
      where: {
        clubId,
        name: newName,
      },
    });

    if (existing) {
      throw new BadRequestException(`Template with name "${newName}" already exists`);
    }

    return this.prisma.pOSTemplate.create({
      data: {
        clubId,
        name: newName,
        description: original.description,
        outletType: original.outletType,
        toolbarConfig: original.toolbarConfig as Prisma.InputJsonValue,
        actionBarConfig: original.actionBarConfig as Prisma.InputJsonValue,
        isDefault: false, // Clones are never default
      },
    });
  }

  /**
   * Delete a template with tenant isolation
   * Fails if template is assigned to any outlets
   */
  async deleteTemplate(id: string, clubId: string) {
    const template = await this.prisma.pOSTemplate.findFirst({
      where: { id, clubId },
      include: { outlets: true },
    });

    if (!template) {
      throw new NotFoundException('POS Template not found');
    }

    if (template.outlets && template.outlets.length > 0) {
      const outletNames = template.outlets.map((o) => o.name).join(', ');
      throw new BadRequestException(
        `Cannot delete template. It is assigned to outlets: ${outletNames}`,
      );
    }

    await this.prisma.pOSTemplate.delete({
      where: { id },
    });

    return { success: true };
  }

  // ============================================================================
  // OUTLET OPERATIONS
  // ============================================================================

  /**
   * Get all outlets for a club
   */
  async getOutlets(clubId: string) {
    return this.prisma.pOSOutlet.findMany({
      where: { clubId },
      include: {
        template: true,
        roleConfigs: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get a single outlet by ID with tenant isolation
   */
  async getOutlet(id: string, clubId: string) {
    const outlet = await this.prisma.pOSOutlet.findFirst({
      where: { id, clubId },
      include: {
        template: true,
        roleConfigs: true,
      },
    });

    if (!outlet) {
      throw new NotFoundException('POS Outlet not found');
    }

    return outlet;
  }

  /**
   * Assign a template to an outlet with tenant isolation
   */
  async assignTemplate(outletId: string, templateId: string, clubId: string) {
    const outlet = await this.prisma.pOSOutlet.findFirst({
      where: { id: outletId, clubId },
    });

    if (!outlet) {
      throw new NotFoundException('POS Outlet not found');
    }

    const template = await this.prisma.pOSTemplate.findFirst({
      where: { id: templateId, clubId },
    });

    if (!template) {
      throw new NotFoundException('POS Template not found');
    }

    return this.prisma.pOSOutlet.update({
      where: { id: outletId },
      data: { templateId },
      include: {
        template: true,
        roleConfigs: true,
      },
    });
  }

  // ============================================================================
  // ROLE CONFIGURATION OPERATIONS
  // ============================================================================

  /**
   * Set role overrides for an outlet with tenant isolation
   */
  async setRoleOverrides(outletId: string, input: POSRoleOverridesInput, clubId: string) {
    const outlet = await this.prisma.pOSOutlet.findFirst({
      where: { id: outletId, clubId },
    });

    if (!outlet) {
      throw new NotFoundException('POS Outlet not found');
    }

    // Build button overrides object
    const buttonOverrides = {
      hidden: input.hidden || [],
      disabled: input.disabled || [],
      requireApproval: input.requireApproval || [],
    };

    // Upsert role configuration
    return this.prisma.pOSOutletRoleConfig.upsert({
      where: {
        outletId_role: {
          outletId,
          role: input.role,
        },
      },
      create: {
        outletId,
        role: input.role,
        buttonOverrides: buttonOverrides as Prisma.InputJsonValue,
      },
      update: {
        buttonOverrides: buttonOverrides as Prisma.InputJsonValue,
      },
    });
  }

  // ============================================================================
  // BUTTON REGISTRY OPERATIONS
  // ============================================================================

  /**
   * Get button registry for a club (stored in Club table)
   */
  async getButtonRegistry(clubId: string) {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      select: {
        id: true,
        posButtonRegistry: true,
        updatedAt: true,
      },
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    return {
      clubId: club.id,
      registry: club.posButtonRegistry || {},
      updatedAt: club.updatedAt,
    };
  }

  /**
   * Update button registry for a club
   */
  async updateButtonRegistry(clubId: string, registry: any) {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    await this.prisma.club.update({
      where: { id: clubId },
      data: {
        posButtonRegistry: registry as Prisma.InputJsonValue,
      },
    });

    return this.getButtonRegistry(clubId);
  }

  // ============================================================================
  // RESOLVED CONFIGURATION
  // ============================================================================

  /**
   * Get resolved configuration for an outlet and user role with tenant isolation
   * Merges template config + outlet overrides + role overrides
   */
  async getResolvedConfig(
    outletId: string,
    userRole: string,
    clubId: string,
    userPermissions: string[] = [],
  ): Promise<ResolvedConfig> {
    const outlet = await this.prisma.pOSOutlet.findFirst({
      where: { id: outletId, clubId },
      include: {
        template: true,
        roleConfigs: {
          where: { role: userRole },
        },
      },
    });

    if (!outlet) {
      throw new NotFoundException('POS Outlet not found');
    }

    // Start with template config or empty defaults
    let toolbarConfig: any = outlet.template?.toolbarConfig || {};
    let actionBarConfig: any = outlet.template?.actionBarConfig || {};

    // Apply outlet-specific overrides
    if (outlet.customConfig && typeof outlet.customConfig === 'object') {
      const custom = outlet.customConfig as any;
      if (custom.toolbarConfig && typeof custom.toolbarConfig === 'object') {
        toolbarConfig = { ...(toolbarConfig as object), ...(custom.toolbarConfig as object) };
      }
      if (custom.actionBarConfig && typeof custom.actionBarConfig === 'object') {
        actionBarConfig = { ...(actionBarConfig as object), ...(custom.actionBarConfig as object) };
      }
    }

    // Get role-specific button overrides
    const roleConfig = outlet.roleConfigs[0];
    const buttonOverrides = (roleConfig?.buttonOverrides as any) || {
      hidden: [],
      disabled: [],
      requireApproval: [],
    };

    // Build button states
    const buttonStates = this.computeButtonStates(
      toolbarConfig,
      actionBarConfig,
      buttonOverrides,
      userPermissions,
    );

    return {
      outlet,
      template: outlet.template,
      toolbarConfig,
      actionBarConfig,
      buttonStates,
    };
  }

  /**
   * Compute button visibility, enabled state, and approval requirements
   */
  private computeButtonStates(
    toolbarConfig: any,
    actionBarConfig: any,
    buttonOverrides: any,
    userPermissions: string[],
  ): ButtonState[] {
    const allButtons = new Set<string>();

    // Extract button IDs from toolbar zones
    if (toolbarConfig.zones) {
      Object.values(toolbarConfig.zones).forEach((zone: any) => {
        if (zone.buttons) {
          zone.buttons.forEach((btn: any) => {
            if (btn.id) allButtons.add(btn.id);
          });
        }
      });
    }

    // Extract button IDs from action bar
    if (actionBarConfig.buttons) {
      actionBarConfig.buttons.forEach((btn: any) => {
        if (btn.id) allButtons.add(btn.id);
      });
    }

    // Compute state for each button
    const states: ButtonState[] = [];
    allButtons.forEach((buttonId) => {
      const hidden = buttonOverrides.hidden?.includes(buttonId) || false;
      const disabled = buttonOverrides.disabled?.includes(buttonId) || false;
      const requiresApproval = buttonOverrides.requireApproval?.includes(buttonId) || false;

      states.push({
        buttonId,
        visible: !hidden,
        enabled: !disabled,
        requiresApproval,
      });
    });

    return states;
  }
}

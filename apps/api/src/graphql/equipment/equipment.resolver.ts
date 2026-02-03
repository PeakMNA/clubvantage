import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { EquipmentService } from '@/modules/equipment/equipment.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { EquipmentStatus } from '@prisma/client';
import {
  EquipmentCategoryType,
  EquipmentType,
  EquipmentAssignmentType,
  EquipmentCategoryResponseType,
  EquipmentResponseType,
  EquipmentAssignmentResponseType,
  EquipmentDeleteResponseType,
  EquipmentReleaseResponseType,
} from './equipment.types';
import {
  CreateEquipmentCategoryInput,
  UpdateEquipmentCategoryInput,
  CreateEquipmentInput,
  UpdateEquipmentInput,
  UpdateEquipmentStatusInput,
  EquipmentFilterInput,
  EquipmentCategoryFilterInput,
  AssignEquipmentInput,
  ReturnEquipmentInput,
  EquipmentAvailabilityInput,
} from './equipment.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class EquipmentResolver {
  private readonly logger = new Logger(EquipmentResolver.name);

  constructor(private readonly equipmentService: EquipmentService) {}

  // ============================================================================
  // Category Queries
  // ============================================================================

  @Query(() => [EquipmentCategoryType], { name: 'equipmentCategories' })
  async getEquipmentCategories(
    @GqlCurrentUser() user: JwtPayload,
    @Args('filter', { type: () => EquipmentCategoryFilterInput, nullable: true })
    filter?: EquipmentCategoryFilterInput,
  ): Promise<EquipmentCategoryType[]> {
    const categories = await this.equipmentService.findAllCategories(user.tenantId, filter);

    return categories.map((cat) => this.transformCategory(cat, cat._count.equipment, 0));
  }

  @Query(() => EquipmentCategoryType, { name: 'equipmentCategory', nullable: true })
  async getEquipmentCategory(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<EquipmentCategoryType | null> {
    try {
      const cat = await this.equipmentService.findCategoryById(user.tenantId, id);
      return this.transformCategory(
        cat,
        cat.equipment.length,
        cat.equipment.filter((e: any) => e.status === EquipmentStatus.AVAILABLE).length,
      );
    } catch {
      return null;
    }
  }

  // ============================================================================
  // Equipment Queries
  // ============================================================================

  @Query(() => [EquipmentType], { name: 'equipment' })
  async getEquipment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('filter', { type: () => EquipmentFilterInput, nullable: true })
    filter?: EquipmentFilterInput,
  ): Promise<EquipmentType[]> {
    const equipment = await this.equipmentService.findAllEquipment(user.tenantId, filter);

    return equipment.map((e) => this.transformEquipment(e));
  }

  @Query(() => EquipmentType, { name: 'equipmentItem', nullable: true })
  async getEquipmentItem(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<EquipmentType | null> {
    try {
      const e = await this.equipmentService.findEquipmentById(user.tenantId, id);
      return this.transformEquipment(e);
    } catch {
      return null;
    }
  }

  @Query(() => [EquipmentType], { name: 'equipmentAvailability' })
  async getEquipmentAvailability(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: EquipmentAvailabilityInput,
  ): Promise<EquipmentType[]> {
    const equipment = await this.equipmentService.findAvailable(
      user.tenantId,
      input.categoryId,
      input.startTime,
      input.endTime,
    );

    return equipment.map((e) => this.transformEquipment(e));
  }

  // ============================================================================
  // Category Mutations
  // ============================================================================

  @Mutation(() => EquipmentCategoryResponseType, { name: 'createEquipmentCategory' })
  async createEquipmentCategory(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateEquipmentCategoryInput,
  ): Promise<EquipmentCategoryResponseType> {
    try {
      const category = await this.equipmentService.createCategory(user.tenantId, input);
      return {
        success: true,
        category: this.transformCategory(category, 0, 0),
      };
    } catch (error: any) {
      this.logger.error(`Failed to create equipment category: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Mutation(() => EquipmentCategoryResponseType, { name: 'updateEquipmentCategory' })
  async updateEquipmentCategory(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UpdateEquipmentCategoryInput,
  ): Promise<EquipmentCategoryResponseType> {
    try {
      const { id, ...data } = input;
      const category = await this.equipmentService.updateCategory(user.tenantId, id, data);
      return {
        success: true,
        category: this.transformCategory(category, 0, 0),
      };
    } catch (error: any) {
      this.logger.error(`Failed to update equipment category: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Mutation(() => EquipmentDeleteResponseType, { name: 'deleteEquipmentCategory' })
  async deleteEquipmentCategory(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<EquipmentDeleteResponseType> {
    try {
      const result = await this.equipmentService.deleteCategory(user.tenantId, id);
      return result;
    } catch (error: any) {
      this.logger.error(`Failed to delete equipment category: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // Equipment Mutations
  // ============================================================================

  @Mutation(() => EquipmentResponseType, { name: 'createEquipment' })
  async createEquipment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateEquipmentInput,
  ): Promise<EquipmentResponseType> {
    try {
      const equipment = await this.equipmentService.createEquipment(user.tenantId, input);
      return { success: true, equipment: this.transformEquipment(equipment) };
    } catch (error: any) {
      this.logger.error(`Failed to create equipment: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Mutation(() => EquipmentResponseType, { name: 'updateEquipment' })
  async updateEquipment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UpdateEquipmentInput,
  ): Promise<EquipmentResponseType> {
    try {
      const { id, ...data } = input;
      const equipment = await this.equipmentService.updateEquipment(user.tenantId, id, data);
      return { success: true, equipment: this.transformEquipment(equipment) };
    } catch (error: any) {
      this.logger.error(`Failed to update equipment: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Mutation(() => EquipmentResponseType, { name: 'updateEquipmentStatus' })
  async updateEquipmentStatus(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UpdateEquipmentStatusInput,
  ): Promise<EquipmentResponseType> {
    try {
      const equipment = await this.equipmentService.updateEquipmentStatus(
        user.tenantId,
        input.id,
        input.status,
        user.sub,
        user.email,
      );
      return { success: true, equipment: this.transformEquipment(equipment) };
    } catch (error: any) {
      this.logger.error(`Failed to update equipment status: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Mutation(() => EquipmentDeleteResponseType, { name: 'deleteEquipment' })
  async deleteEquipment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<EquipmentDeleteResponseType> {
    try {
      const result = await this.equipmentService.deleteEquipment(user.tenantId, id);
      return result;
    } catch (error: any) {
      this.logger.error(`Failed to delete equipment: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // Assignment Mutations
  // ============================================================================

  @Mutation(() => EquipmentAssignmentResponseType, { name: 'assignEquipment' })
  async assignEquipment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: AssignEquipmentInput,
  ): Promise<EquipmentAssignmentResponseType> {
    try {
      const assignment = await this.equipmentService.assignEquipment(
        user.tenantId,
        input,
        user.sub,
        user.email,
      );
      return { success: true, assignment: this.transformAssignment(assignment) };
    } catch (error: any) {
      this.logger.error(`Failed to assign equipment: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Mutation(() => EquipmentAssignmentResponseType, { name: 'returnEquipment' })
  async returnEquipment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: ReturnEquipmentInput,
  ): Promise<EquipmentAssignmentResponseType> {
    try {
      const assignment = await this.equipmentService.returnEquipment(
        user.tenantId,
        input.assignmentId,
        { conditionAtReturn: input.conditionAtReturn, notes: input.notes },
        user.sub,
        user.email,
      );
      return { success: true, assignment: this.transformAssignment(assignment) };
    } catch (error: any) {
      this.logger.error(`Failed to return equipment: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Mutation(() => EquipmentReleaseResponseType, { name: 'releaseEquipmentForBooking' })
  async releaseEquipmentForBooking(
    @GqlCurrentUser() user: JwtPayload,
    @Args('bookingId', { type: () => ID }) bookingId: string,
  ): Promise<EquipmentReleaseResponseType> {
    try {
      const result = await this.equipmentService.releaseEquipmentForBooking(
        user.tenantId,
        bookingId,
        user.sub,
        user.email,
      );
      return result;
    } catch (error: any) {
      this.logger.error(`Failed to release equipment for booking: ${error.message}`);
      return { success: false, releasedCount: 0, error: error.message };
    }
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private transformCategory(
    cat: any,
    equipmentCount: number,
    availableCount: number,
  ): EquipmentCategoryType {
    return {
      id: cat.id,
      code: cat.code,
      name: cat.name,
      description: cat.description ?? undefined,
      icon: cat.icon ?? undefined,
      color: cat.color ?? undefined,
      attachmentType: cat.attachmentType,
      operationType: cat.operationType,
      defaultRentalRate: cat.defaultRentalRate?.toNumber() ?? undefined,
      requiresDeposit: cat.requiresDeposit,
      depositAmount: cat.depositAmount?.toNumber() ?? undefined,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      equipmentCount,
      availableCount,
    };
  }

  private transformEquipment(e: any): EquipmentType {
    const currentAssignment = e.assignments?.find((a: any) => !a.returnedAt);

    return {
      id: e.id,
      assetNumber: e.assetNumber,
      name: e.name,
      category: this.transformCategory(e.category, 0, 0),
      serialNumber: e.serialNumber ?? undefined,
      manufacturer: e.manufacturer ?? undefined,
      model: e.model ?? undefined,
      condition: e.condition,
      status: e.status,
      location: e.location ?? undefined,
      notes: e.notes ?? undefined,
      purchaseDate: e.purchaseDate ?? undefined,
      warrantyExpiry: e.warrantyExpiry ?? undefined,
      lastMaintenanceAt: e.lastMaintenanceAt ?? undefined,
      nextMaintenanceAt: e.nextMaintenanceAt ?? undefined,
      currentAssignment: currentAssignment
        ? this.transformAssignment(currentAssignment)
        : undefined,
    };
  }

  private transformAssignment(a: any): EquipmentAssignmentType {
    const member = a.booking?.member || a.teeTimePlayer?.member;

    return {
      id: a.id,
      member: member
        ? {
            id: member.id,
            memberId: member.memberId,
            firstName: member.firstName,
            lastName: member.lastName,
            avatarUrl: member.avatarUrl ?? undefined,
          }
        : undefined,
      bookingNumber: a.booking?.bookingNumber ?? undefined,
      assignedAt: a.assignedAt,
      returnedAt: a.returnedAt ?? undefined,
      rentalFee: a.rentalFee?.toNumber() ?? undefined,
      conditionAtCheckout: a.conditionAtCheckout ?? undefined,
      conditionAtReturn: a.conditionAtReturn ?? undefined,
      notes: a.notes ?? undefined,
    };
  }
}

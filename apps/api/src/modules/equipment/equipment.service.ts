import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { EventStoreService } from '@/shared/events/event-store.service';
import { EquipmentStatus, EquipmentCondition, OperationType } from '@prisma/client';
import {
  CreateEquipmentCategoryDto,
  UpdateEquipmentCategoryDto,
} from './dto/create-equipment-category.dto';
import {
  CreateEquipmentDto,
  UpdateEquipmentDto,
} from './dto/create-equipment.dto';
import { AssignEquipmentDto, ReturnEquipmentDto } from './dto/assign-equipment.dto';

@Injectable()
export class EquipmentService {
  private readonly logger = new Logger(EquipmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventStore: EventStoreService,
  ) {}

  // ============================================================================
  // Category Operations
  // ============================================================================

  async findAllCategories(
    clubId: string,
    filter?: { operationType?: OperationType; isActive?: boolean },
  ) {
    return this.prisma.equipmentCategory.findMany({
      where: {
        clubId,
        ...(filter?.operationType && { operationType: filter.operationType }),
        ...(filter?.isActive !== undefined && { isActive: filter.isActive }),
      },
      include: {
        _count: { select: { equipment: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findCategoryById(clubId: string, id: string) {
    const category = await this.prisma.equipmentCategory.findFirst({
      where: { id, clubId },
      include: { equipment: true },
    });

    if (!category) {
      throw new NotFoundException('Equipment category not found');
    }

    return category;
  }

  async createCategory(clubId: string, dto: CreateEquipmentCategoryDto) {
    // Check for duplicate code
    const existing = await this.prisma.equipmentCategory.findUnique({
      where: { clubId_code: { clubId, code: dto.code } },
    });

    if (existing) {
      throw new ConflictException(`Category with code '${dto.code}' already exists`);
    }

    return this.prisma.equipmentCategory.create({
      data: {
        clubId,
        ...dto,
      },
    });
  }

  async updateCategory(clubId: string, id: string, dto: UpdateEquipmentCategoryDto) {
    await this.findCategoryById(clubId, id);

    return this.prisma.equipmentCategory.update({
      where: { id },
      data: dto,
    });
  }

  async deleteCategory(clubId: string, id: string) {
    const category = await this.findCategoryById(clubId, id);

    // Check for active equipment
    const activeEquipment = await this.prisma.equipment.count({
      where: {
        categoryId: id,
        status: { not: EquipmentStatus.RETIRED },
      },
    });

    if (activeEquipment > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${activeEquipment} active equipment items`,
      );
    }

    await this.prisma.equipmentCategory.delete({ where: { id } });
    return { success: true, message: 'Category deleted' };
  }

  // ============================================================================
  // Equipment Operations
  // ============================================================================

  async findAllEquipment(
    clubId: string,
    filters?: {
      categoryId?: string;
      status?: EquipmentStatus;
      condition?: EquipmentCondition;
      operationType?: OperationType;
    },
  ) {
    const where: any = { clubId };

    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.status) where.status = filters.status;
    if (filters?.condition) where.condition = filters.condition;
    if (filters?.operationType) {
      where.category = { operationType: filters.operationType };
    }

    return this.prisma.equipment.findMany({
      where,
      include: {
        category: true,
        assignments: {
          where: { returnedAt: null },
          include: {
            booking: { include: { member: true } },
            teeTimePlayer: { include: { member: true } },
          },
          take: 1,
        },
      },
      orderBy: [{ category: { sortOrder: 'asc' } }, { assetNumber: 'asc' }],
    });
  }

  async findEquipmentById(clubId: string, id: string) {
    const equipment = await this.prisma.equipment.findFirst({
      where: { id, clubId },
      include: {
        category: true,
        assignments: {
          orderBy: { assignedAt: 'desc' },
          take: 10,
          include: {
            booking: { include: { member: true } },
            teeTimePlayer: { include: { member: true } },
            assignedBy: true,
          },
        },
      },
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    return equipment;
  }

  async createEquipment(clubId: string, dto: CreateEquipmentDto) {
    // Verify category exists
    await this.findCategoryById(clubId, dto.categoryId);

    // Check for duplicate asset number
    const existing = await this.prisma.equipment.findUnique({
      where: { clubId_assetNumber: { clubId, assetNumber: dto.assetNumber } },
    });

    if (existing) {
      throw new ConflictException(`Equipment with asset number '${dto.assetNumber}' already exists`);
    }

    return this.prisma.equipment.create({
      data: {
        clubId,
        ...dto,
      },
      include: { category: true },
    });
  }

  async updateEquipment(clubId: string, id: string, dto: UpdateEquipmentDto) {
    await this.findEquipmentById(clubId, id);

    return this.prisma.equipment.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async updateEquipmentStatus(
    clubId: string,
    id: string,
    status: EquipmentStatus,
    userId: string,
    userEmail: string,
  ) {
    const equipment = await this.findEquipmentById(clubId, id);

    // If setting to AVAILABLE, check for active assignments
    if (status === EquipmentStatus.AVAILABLE) {
      const activeAssignment = await this.prisma.equipmentAssignment.findFirst({
        where: { equipmentId: id, returnedAt: null },
      });

      if (activeAssignment) {
        throw new BadRequestException(
          'Cannot set to available while equipment is assigned',
        );
      }
    }

    const updated = await this.prisma.equipment.update({
      where: { id },
      data: { status },
      include: { category: true },
    });

    await this.eventStore.append({
      tenantId: clubId,
      aggregateType: 'Equipment',
      aggregateId: id,
      type: 'STATUS_CHANGED',
      data: { oldStatus: equipment.status, newStatus: status },
      userId,
      userEmail,
    });

    return updated;
  }

  async deleteEquipment(clubId: string, id: string) {
    await this.findEquipmentById(clubId, id);

    // Check for assignments
    const assignments = await this.prisma.equipmentAssignment.count({
      where: { equipmentId: id },
    });

    if (assignments > 0) {
      throw new BadRequestException(
        'Cannot delete equipment with assignment history. Set to RETIRED instead.',
      );
    }

    await this.prisma.equipment.delete({ where: { id } });
    return { success: true, message: 'Equipment deleted' };
  }

  // ============================================================================
  // Availability Operations
  // ============================================================================

  async findAvailable(
    clubId: string,
    categoryId: string,
    startTime: Date,
    endTime: Date,
  ) {
    // Get all equipment in category that's not retired/maintenance
    const available = await this.prisma.equipment.findMany({
      where: {
        clubId,
        categoryId,
        status: { in: [EquipmentStatus.AVAILABLE, EquipmentStatus.RESERVED] },
        condition: { not: EquipmentCondition.OUT_OF_SERVICE },
      },
      include: { category: true },
    });

    // Filter out equipment with overlapping assignments
    const assignedIds = await this.prisma.equipmentAssignment.findMany({
      where: {
        equipmentId: { in: available.map((e) => e.id) },
        returnedAt: null,
        OR: [
          {
            booking: {
              startTime: { lt: endTime },
              endTime: { gt: startTime },
              status: { not: 'CANCELLED' },
            },
          },
          {
            teeTimePlayer: {
              teeTime: {
                teeDate: {
                  gte: new Date(startTime.toDateString()),
                  lte: new Date(endTime.toDateString()),
                },
              },
            },
          },
        ],
      },
      select: { equipmentId: true },
    });

    const assignedSet = new Set(assignedIds.map((a) => a.equipmentId));

    return available.filter((e) => !assignedSet.has(e.id));
  }

  // ============================================================================
  // Assignment Operations
  // ============================================================================

  async assignEquipment(
    clubId: string,
    dto: AssignEquipmentDto,
    userId: string,
    userEmail: string,
  ) {
    const equipment = await this.findEquipmentById(clubId, dto.equipmentId);

    // Verify equipment is available
    if (equipment.status !== EquipmentStatus.AVAILABLE) {
      throw new ConflictException('Equipment is not available for assignment');
    }

    // Verify either bookingId or teeTimePlayerId is provided
    if (!dto.bookingId && !dto.teeTimePlayerId) {
      throw new BadRequestException(
        'Either bookingId or teeTimePlayerId must be provided',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Create assignment
      const assignment = await tx.equipmentAssignment.create({
        data: {
          clubId,
          equipmentId: dto.equipmentId,
          bookingId: dto.bookingId,
          teeTimePlayerId: dto.teeTimePlayerId,
          assignedById: userId,
          rentalFee: dto.rentalFee,
          conditionAtCheckout: dto.conditionAtCheckout || equipment.condition,
          notes: dto.notes,
        },
        include: {
          equipment: { include: { category: true } },
          booking: { include: { member: true } },
          teeTimePlayer: { include: { member: true } },
        },
      });

      // Update equipment status
      await tx.equipment.update({
        where: { id: dto.equipmentId },
        data: { status: EquipmentStatus.IN_USE },
      });

      // Log event
      await this.eventStore.append({
        tenantId: clubId,
        aggregateType: 'EquipmentAssignment',
        aggregateId: assignment.id,
        type: 'ASSIGNED',
        data: {
          equipmentId: dto.equipmentId,
          bookingId: dto.bookingId,
          teeTimePlayerId: dto.teeTimePlayerId,
        },
        userId,
        userEmail,
      });

      return assignment;
    });
  }

  async returnEquipment(
    clubId: string,
    assignmentId: string,
    dto: ReturnEquipmentDto,
    userId: string,
    userEmail: string,
  ) {
    const assignment = await this.prisma.equipmentAssignment.findFirst({
      where: { id: assignmentId, clubId },
      include: { equipment: true },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.returnedAt) {
      throw new BadRequestException('Equipment already returned');
    }

    // Default to condition at checkout or GOOD if not specified
    const conditionAtReturn = dto.conditionAtReturn || assignment.conditionAtCheckout || EquipmentCondition.GOOD;

    return this.prisma.$transaction(async (tx) => {
      // Update assignment
      const updated = await tx.equipmentAssignment.update({
        where: { id: assignmentId },
        data: {
          returnedAt: new Date(),
          conditionAtReturn,
          notes: dto.notes ? `${assignment.notes || ''}\n${dto.notes}` : assignment.notes,
        },
        include: {
          equipment: { include: { category: true } },
          booking: { include: { member: true } },
          teeTimePlayer: { include: { member: true } },
        },
      });

      // Update equipment status and condition
      const newStatus =
        conditionAtReturn === EquipmentCondition.NEEDS_REPAIR ||
        conditionAtReturn === EquipmentCondition.OUT_OF_SERVICE
          ? EquipmentStatus.MAINTENANCE
          : EquipmentStatus.AVAILABLE;

      await tx.equipment.update({
        where: { id: assignment.equipmentId },
        data: {
          status: newStatus,
          condition: conditionAtReturn,
        },
      });

      // Log event
      await this.eventStore.append({
        tenantId: clubId,
        aggregateType: 'EquipmentAssignment',
        aggregateId: assignmentId,
        type: 'RETURNED',
        data: {
          conditionAtReturn,
          newEquipmentStatus: newStatus,
        },
        userId,
        userEmail,
      });

      return updated;
    });
  }

  async releaseEquipmentForBooking(
    clubId: string,
    bookingId: string,
    userId: string,
    userEmail: string,
  ) {
    // Find all active assignments for this booking
    const assignments = await this.prisma.equipmentAssignment.findMany({
      where: { clubId, bookingId, returnedAt: null },
    });

    for (const assignment of assignments) {
      await this.returnEquipment(
        clubId,
        assignment.id,
        { conditionAtReturn: assignment.conditionAtCheckout || EquipmentCondition.GOOD },
        userId,
        userEmail,
      );
    }

    return { success: true, releasedCount: assignments.length };
  }

  async releaseEquipmentForTeeTimePlayer(
    clubId: string,
    teeTimePlayerId: string,
    userId: string,
    userEmail: string,
  ) {
    // Find all active assignments for this tee time player
    const assignments = await this.prisma.equipmentAssignment.findMany({
      where: { clubId, teeTimePlayerId, returnedAt: null },
    });

    for (const assignment of assignments) {
      await this.returnEquipment(
        clubId,
        assignment.id,
        { conditionAtReturn: assignment.conditionAtCheckout || EquipmentCondition.GOOD },
        userId,
        userEmail,
      );
    }

    return { success: true, releasedCount: assignments.length };
  }
}

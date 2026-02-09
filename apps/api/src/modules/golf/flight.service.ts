import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';
import { EventStoreService } from '@/shared/events/event-store.service';
import { LineItemGeneratorService } from '@/graphql/golf/line-item-generator.service';
import { TeeSheetService } from './tee-sheet.service';
import {
  CreateFlightDto,
  UpdateFlightDto,
  UpdateFlightPlayersDto,
} from './golf.types';

@Injectable()
export class FlightService {
  private readonly logger = new Logger(FlightService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private eventStore: EventStoreService,
    @Inject(forwardRef(() => LineItemGeneratorService))
    private lineItemGenerator: LineItemGeneratorService,
    private teeSheetService: TeeSheetService,
  ) {}

  async createFlight(
    tenantId: string,
    dto: CreateFlightDto,
    userId: string,
    userEmail: string,
  ) {
    // Lock the tee time slot to prevent double booking
    const lockKey = `teesheet:${dto.courseId}:${dto.teeDate}:${dto.teeTime}`;
    const acquired = await this.redis.acquireLock(lockKey, 30);

    if (!acquired) {
      throw new ConflictException('This tee time is currently being booked');
    }

    try {
      // Normalize teeDate to UTC midnight to match database storage
      // Input can be "2026-01-27" or "2026-01-27T00:00:00.000Z"
      const dateStr = dto.teeDate.split('T')[0];
      const teeDate = new Date(`${dateStr}T00:00:00.000Z`);

      // Check if time is blocked
      const blocks = await this.teeSheetService.getBlocksForDate(tenantId, dto.courseId, teeDate);
      const block = this.teeSheetService.findBlockForTime(blocks, teeDate, dto.teeTime);

      if (block) {
        throw new BadRequestException(
          `This tee time is blocked for ${block.blockType.toLowerCase()}${block.reason ? `: ${block.reason}` : ''}`,
        );
      }

      // Check if slot has capacity for new players
      // Multiple bookings can share a flight as long as total players <= 4
      // Filter by startingHole to support CROSS mode (front 9 and back 9 are separate)
      const startingHole = dto.startingHole || 1;
      const existingBookings = await this.prisma.teeTime.findMany({
        where: {
          clubId: tenantId,
          courseId: dto.courseId,
          teeDate,
          teeTime: dto.teeTime,
          startingHole,
          status: { not: 'CANCELLED' },
        },
        include: {
          players: true,
        },
      });

      const existingPlayerCount = existingBookings.reduce(
        (total, booking) => total + booking.players.length,
        0,
      );
      const newPlayerCount = dto.players.length;

      if (existingPlayerCount + newPlayerCount > 4) {
        const availableSlots = 4 - existingPlayerCount;
        throw new ConflictException(
          availableSlots > 0
            ? `Only ${availableSlots} position${availableSlots === 1 ? '' : 's'} available at this tee time`
            : 'This tee time is fully booked',
        );
      }

      // Generate tee time number
      const year = new Date().getFullYear();
      const lastTeeTime = await this.prisma.teeTime.findFirst({
        where: {
          clubId: tenantId,
          teeTimeNumber: { startsWith: `TT-${year}` },
        },
        orderBy: { teeTimeNumber: 'desc' },
      });

      const nextNumber = lastTeeTime
        ? parseInt(lastTeeTime.teeTimeNumber.split('-')[2], 10) + 1
        : 1;
      const teeTimeNumber = `TT-${year}-${nextNumber.toString().padStart(5, '0')}`;

      const teeTime = await this.prisma.teeTime.create({
        data: {
          clubId: tenantId,
          teeTimeNumber,
          courseId: dto.courseId,
          teeDate,
          teeTime: dto.teeTime,
          holes: dto.holes || 18,
          startingHole,
          status: 'CONFIRMED',
          notes: dto.notes,
          players: {
            create: dto.players.map((p: any) => ({
              position: p.position,
              playerType: p.playerType,
              // For MEMBER: set memberId (FK to members table)
              // For DEPENDENT: set dependentId (FK to dependents table)
              // For GUEST/WALK_UP: use guestName/Email/Phone instead
              memberId: p.playerType === 'MEMBER' ? p.memberId : null,
              dependentId: p.playerType === 'DEPENDENT' ? p.dependentId : null,
              guestName: p.guestName,
              guestEmail: p.guestEmail,
              guestPhone: p.guestPhone,
              cartType: p.cartType || 'WALKING',
              sharedWithPosition: p.sharedWithPosition,
              caddyId: p.caddyId,
              // Per-player booking options (Task #6)
              caddyRequest: p.caddyRequest || 'NONE',
              cartRequest: p.cartRequest || 'NONE',
              rentalRequest: p.rentalRequest || 'NONE',
            })),
          },
        },
        include: {
          players: {
            include: {
              member: true,
              caddy: true,
              dependent: true,
            },
          },
          course: true,
        },
      });

      // Generate line items for all players
      try {
        await this.lineItemGenerator.generateLineItemsForFlight(teeTime.id);
      } catch (error) {
        // Don't fail the booking if line item generation fails
        // Just log the error - staff can add items manually
        this.logger.warn(
          `Failed to generate line items for tee time ${teeTime.id}: ${error.message}`,
        );
      }

      await this.eventStore.append({
        tenantId,
        aggregateType: 'TeeTime',
        aggregateId: teeTime.id,
        type: 'CREATED',
        data: { teeTimeNumber, teeDate: dto.teeDate, teeTime: dto.teeTime },
        userId,
        userEmail,
      });

      return teeTime;
    } finally {
      await this.redis.releaseLock(lockKey);
    }
  }

  async getFlight(tenantId: string, id: string) {
    const teeTime = await this.prisma.teeTime.findFirst({
      where: { id, clubId: tenantId },
      include: {
        players: {
          include: { member: true, caddy: true, dependent: true },
          orderBy: { position: 'asc' },
        },
        course: true,
      },
    });

    if (!teeTime) {
      throw new NotFoundException('Tee time not found');
    }

    return teeTime;
  }

  async updateFlight(
    tenantId: string,
    id: string,
    dto: UpdateFlightDto,
    userId: string,
    userEmail: string,
  ) {
    await this.getFlight(tenantId, id);

    const updated = await this.prisma.teeTime.update({
      where: { id },
      data: {
        ...(dto.holes !== undefined && { holes: dto.holes }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status !== undefined && { status: dto.status as any }),
      },
      include: {
        players: { include: { member: true, caddy: true, dependent: true } },
        course: true,
      },
    });

    await this.eventStore.append({
      tenantId,
      aggregateType: 'TeeTime',
      aggregateId: id,
      type: 'UPDATED',
      data: dto,
      userId,
      userEmail,
    });

    return updated;
  }

  async updateFlightPlayers(
    tenantId: string,
    id: string,
    players: UpdateFlightPlayersDto[],
    userId: string,
    userEmail: string,
  ) {
    // Get the existing tee time to verify it exists
    const existing = await this.getFlight(tenantId, id);

    // Validate player count (max 4 per tee time)
    if (players.length > 4) {
      throw new BadRequestException('Maximum 4 players per tee time');
    }

    // For updates, we only enforce max 4 players per booking
    // The booking already exists and its slot was validated on creation
    // We trust that the user can edit their own booking's players

    // Delete existing players and create new ones in a transaction
    const updated = await this.prisma.$transaction(async (tx) => {
      // Delete existing players
      await tx.teeTimePlayer.deleteMany({
        where: { teeTimeId: id },
      });

      // Prepare player data for creation
      const playerData = players.map((p) => ({
        teeTimeId: id,
        position: p.position,
        playerType: p.playerType as any,
        // For MEMBER: set memberId (FK to members table)
        // For DEPENDENT: set dependentId (FK to dependents table)
        // For GUEST/WALK_UP: use guestName/Email/Phone instead
        memberId: p.playerType === 'MEMBER' ? p.memberId : null,
        dependentId: p.playerType === 'DEPENDENT' ? p.dependentId : null,
        guestName: p.guestName,
        guestEmail: p.guestEmail,
        guestPhone: p.guestPhone,
        cartType: (p.cartType as any) || 'WALKING',
        sharedWithPosition: p.sharedWithPosition,
        caddyId: p.caddyId,
        caddyRequest: p.caddyRequest || 'NONE',
        cartRequest: p.cartRequest || 'NONE',
        cartId: p.cartId || null,
        rentalRequest: p.rentalRequest || 'NONE',
        cartStatus: (p.cartStatus as any) || 'NONE',
        caddyStatus: (p.caddyStatus as any) || 'NONE',
      }));

      // Create new players
      await tx.teeTimePlayer.createMany({
        data: playerData,
      });

      // Return updated tee time
      return tx.teeTime.findUnique({
        where: { id },
        include: {
          players: {
            include: { member: true, caddy: true, dependent: true },
            orderBy: { position: 'asc' },
          },
          course: true,
        },
      });
    });

    // Regenerate line items for all players (since we replaced all players)
    // This handles changes to cart/caddy requests
    try {
      await this.lineItemGenerator.generateLineItemsForFlight(id);
    } catch (error) {
      this.logger.warn(
        `Failed to regenerate line items for tee time ${id}: ${error.message}`,
      );
    }

    await this.eventStore.append({
      tenantId,
      aggregateType: 'TeeTime',
      aggregateId: id,
      type: 'PLAYERS_UPDATED',
      data: { players },
      userId,
      userEmail,
    });

    return updated;
  }

  async cancelFlight(
    tenantId: string,
    id: string,
    reason: string,
    userId: string,
    userEmail: string,
  ) {
    const teeTime = await this.getFlight(tenantId, id);

    if (teeTime.status === 'CANCELLED') {
      throw new BadRequestException('Flight is already cancelled');
    }

    const updated = await this.prisma.teeTime.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelReason: reason,
        cancelledAt: new Date(),
        cancelledBy: userId,
      },
    });

    await this.eventStore.append({
      tenantId,
      aggregateType: 'TeeTime',
      aggregateId: id,
      type: 'CANCELLED',
      data: { reason },
      userId,
      userEmail,
    });

    return updated;
  }

  async checkinFlight(
    tenantId: string,
    id: string,
    userId: string,
    userEmail: string,
  ) {
    const teeTime = await this.getFlight(tenantId, id);

    if (teeTime.status !== 'CONFIRMED') {
      throw new BadRequestException('Only confirmed flights can be checked in');
    }

    const updated = await this.prisma.teeTime.update({
      where: { id },
      data: {
        status: 'CHECKED_IN',
        checkedInAt: new Date(),
      },
    });

    // Check in all players
    await this.prisma.teeTimePlayer.updateMany({
      where: { teeTimeId: id },
      data: { checkedIn: true, checkedInAt: new Date() },
    });

    await this.eventStore.append({
      tenantId,
      aggregateType: 'TeeTime',
      aggregateId: id,
      type: 'CHECKED_IN',
      data: {},
      userId,
      userEmail,
    });

    return updated;
  }
}

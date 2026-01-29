import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';
import { EventStoreService } from '@/shared/events/event-store.service';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum CartType {
  WALKING = 'WALKING',
  SINGLE = 'SINGLE',
  SHARED = 'SHARED',
}

export enum PlayerType {
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
  DEPENDENT = 'DEPENDENT',
  WALK_UP = 'WALK_UP',
}

export interface CreateFlightDto {
  courseId: string;
  teeDate: string;
  teeTime: string;
  holes?: number;
  startingHole?: number; // 1 or 10 (for Cross mode)
  players: {
    position: number;
    playerType: PlayerType;
    memberId?: string;
    dependentId?: string; // For DEPENDENT player type - links to Dependent table
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    cartType?: CartType;
    sharedWithPosition?: number;
    caddyId?: string;
    // Per-player booking options (Task #6)
    caddyRequest?: string;
    cartRequest?: string;
    rentalRequest?: string;
  }[];
  notes?: string;
}

export interface UpdateFlightDto {
  players?: CreateFlightDto['players'];
  holes?: number;
  notes?: string;
  status?: BookingStatus;
}

export interface TeeSheetSlot {
  time: string;
  courseId: string;
  date: string;
  booking: any | null;
  available: boolean;
  blocked: boolean;
  blockInfo?: {
    id: string;
    blockType: string;
    reason?: string;
  };
  isPrimeTime: boolean;
}

@Injectable()
export class GolfService {
  private readonly logger = new Logger(GolfService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private eventStore: EventStoreService,
  ) {}

  async getTeeSheet(
    tenantId: string,
    courseId: string,
    date: string,
  ): Promise<TeeSheetSlot[]> {
    this.logger.log(`getTeeSheet called with tenantId: ${tenantId}, courseId: ${courseId}, date: ${date}`);

    const course = await this.prisma.golfCourse.findFirst({
      where: { id: courseId, clubId: tenantId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Parse the input date - it could be "2026-01-27" or "2026-01-27T00:00:00.000Z"
    // Extract just the date part for consistency
    const dateOnly = date.split('T')[0];
    // Ensure date is at UTC midnight to match database storage
    const teeDate = new Date(`${dateOnly}T00:00:00.000Z`);
    this.logger.log(`Parsed teeDate: ${teeDate.toISOString()}, dateOnly: ${dateOnly}`);

    // Get active schedule for this date
    const activeSchedule = await this.getActiveScheduleForDate(tenantId, courseId, teeDate);

    // Get blocks for this date
    const blocks = await this.getBlocksForDate(tenantId, courseId, teeDate);

    // Use raw SQL to query by date string to avoid timezone issues
    // The DATE column stores just the date without time
    const teeTimes = await this.prisma.$queryRaw<any[]>`
      SELECT
        tt.id, tt."teeTimeNumber", tt."teeDate", tt."teeTime", tt.holes, tt.status,
        tt."confirmedAt", tt."checkedInAt", tt."startedAt", tt."completedAt",
        tt.notes, tt."internalNotes", tt."cancelReason", tt."cancelledAt", tt."cancelledBy"
      FROM tee_times tt
      WHERE tt."clubId" = ${tenantId}::uuid
        AND tt."courseId" = ${courseId}::uuid
        AND tt."teeDate" = ${dateOnly}::date
      ORDER BY tt."teeTime" ASC
    `;

    this.logger.log(`Found ${teeTimes.length} tee times for date ${dateOnly} (raw query)`);
    this.logger.log(`Query params - tenantId: ${tenantId}, courseId: ${courseId}, dateOnly: ${dateOnly}`);
    if (teeTimes.length > 0) {
      this.logger.log(`First tee time: ${JSON.stringify(teeTimes[0])}`);
    }

    // Fetch players for each tee time
    const teeTimesWithPlayers = await Promise.all(
      teeTimes.map(async (tt: any) => {
        const players = await this.prisma.teeTimePlayer.findMany({
          where: { teeTimeId: tt.id },
          include: {
            member: {
              select: { id: true, memberId: true, firstName: true, lastName: true },
            },
            caddy: {
              select: { id: true, caddyNumber: true, firstName: true, lastName: true },
            },
          },
          orderBy: { position: 'asc' },
        });
        return { ...tt, players };
      })
    );

    // Use schedule times/intervals if available, otherwise fall back to course defaults
    const firstTeeTime = activeSchedule?.firstTeeTime || course.firstTeeTime;
    const lastTeeTime = activeSchedule?.lastTeeTime || course.lastTeeTime;

    // Generate time slots using schedule intervals if available
    const slots = activeSchedule?.intervals?.length
      ? this.generateTimeSlotsFromIntervals(firstTeeTime, lastTeeTime, activeSchedule.intervals, teeDate)
      : this.generateTimeSlots(firstTeeTime, lastTeeTime, course.teeInterval);

    // Map bookings and blocks to slots
    // Multiple bookings can share a time slot - aggregate all players
    return slots.map((slotInfo) => {
      const time = typeof slotInfo === 'string' ? slotInfo : slotInfo.time;
      const isPrimeTime = typeof slotInfo === 'string' ? false : slotInfo.isPrimeTime;

      // Find ALL bookings at this time (multiple booking groups can share a slot)
      const bookingsAtTime = teeTimesWithPlayers.filter((t: any) => t.teeTime === time && t.status !== 'CANCELLED');
      const block = this.findBlockForTime(blocks, teeDate, time);

      // Aggregate all players from all bookings into a single view
      // Use the first booking's metadata (id, status, etc.) for the slot
      let aggregatedBooking = null;
      if (bookingsAtTime.length > 0) {
        const firstBooking = bookingsAtTime[0];
        const allPlayers = bookingsAtTime.flatMap((b: any) => b.players);

        // Build booking groups array for UI to display separate bookings
        // Use first player's info as "bookedBy" since we don't track booking member separately
        const bookingGroups = bookingsAtTime.map((b: any, index: number) => {
          const firstPlayer = b.players[0];
          const bookerName = firstPlayer?.member
            ? `${firstPlayer.member.firstName} ${firstPlayer.member.lastName}`
            : firstPlayer?.guestName || 'Unknown';
          return {
            id: b.id,
            groupNumber: (index + 1) as 1 | 2,
            bookedBy: {
              id: firstPlayer?.member?.id || firstPlayer?.id || '',
              name: bookerName,
              memberId: firstPlayer?.member?.memberId || undefined,
            },
            playerIds: b.players.map((p: any) => p.id),
          };
        });

        aggregatedBooking = {
          ...firstBooking,
          players: allPlayers,
          // Store all booking IDs for reference
          bookingIds: bookingsAtTime.map((b: any) => b.id),
          // Include booking groups for UI
          bookingGroups,
        };
      }

      const totalPlayers = aggregatedBooking?.players?.length || 0;

      return {
        time,
        courseId,
        date,
        booking: aggregatedBooking,
        available: totalPlayers < 4 && !block,
        blocked: !!block,
        blockInfo: block ? {
          id: block.id,
          blockType: block.blockType,
          reason: block.reason || undefined,
        } : undefined,
        isPrimeTime,
      };
    });
  }

  /**
   * Get the active schedule for a specific date
   */
  async getActiveScheduleForDate(tenantId: string, courseId: string, date: Date) {
    return this.prisma.golfCourseSchedule.findFirst({
      where: {
        courseId,
        isActive: true,
        startDate: { lte: date },
        endDate: { gte: date },
        course: { clubId: tenantId },
      },
      include: {
        intervals: true,
      },
    });
  }

  /**
   * Get all blocks for a specific date
   */
  async getBlocksForDate(tenantId: string, courseId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.teeTimeBlock.findMany({
      where: {
        courseId,
        course: { clubId: tenantId },
        OR: [
          // Non-recurring blocks that overlap with the date
          {
            isRecurring: false,
            startTime: { lte: endOfDay },
            endTime: { gte: startOfDay },
          },
          // Recurring blocks (need to check pattern match)
          {
            isRecurring: true,
          },
        ],
      },
    });
  }

  /**
   * Check if a specific time falls within any block
   */
  private findBlockForTime(blocks: any[], date: Date, time: string): any | null {
    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(hours, minutes, 0, 0);

    for (const block of blocks) {
      if (block.isRecurring) {
        // For recurring blocks, check if this day of week matches the pattern
        if (this.matchesRecurringPattern(date, block.recurringPattern)) {
          // Check if the time falls within the block's time range
          const blockStartTime = new Date(block.startTime);
          const blockEndTime = new Date(block.endTime);
          const startHour = blockStartTime.getHours();
          const startMin = blockStartTime.getMinutes();
          const endHour = blockEndTime.getHours();
          const endMin = blockEndTime.getMinutes();

          const slotMinutes = hours * 60 + minutes;
          const blockStartMinutes = startHour * 60 + startMin;
          const blockEndMinutes = endHour * 60 + endMin;

          if (slotMinutes >= blockStartMinutes && slotMinutes < blockEndMinutes) {
            return block;
          }
        }
      } else {
        // Non-recurring: check if slot time falls within the block
        if (slotTime >= block.startTime && slotTime < block.endTime) {
          return block;
        }
      }
    }
    return null;
  }

  /**
   * Check if a date matches a recurring pattern
   * Pattern format: "WEEKLY:MON,TUE,WED" or "DAILY" or "MONTHLY:1,15"
   */
  private matchesRecurringPattern(date: Date, pattern: string | null): boolean {
    if (!pattern) return false;

    const [type, values] = pattern.split(':');
    const dayOfWeek = date.getDay(); // 0 = Sunday
    const dayOfMonth = date.getDate();

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    switch (type.toUpperCase()) {
      case 'DAILY':
        return true;
      case 'WEEKLY':
        const days = values?.split(',').map(d => d.trim().toUpperCase()) || [];
        return days.includes(dayNames[dayOfWeek]);
      case 'MONTHLY':
        const datesOfMonth = values?.split(',').map(d => parseInt(d.trim(), 10)) || [];
        return datesOfMonth.includes(dayOfMonth);
      default:
        return false;
    }
  }

  /**
   * Generate time slots using variable intervals from schedule
   */
  private generateTimeSlotsFromIntervals(
    firstTee: string,
    lastTee: string,
    intervals: any[],
    date: Date,
  ): { time: string; isPrimeTime: boolean }[] {
    const slots: { time: string; isPrimeTime: boolean }[] = [];
    const [startHour, startMin] = firstTee.split(':').map(Number);
    const [endHour, endMin] = lastTee.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Determine day type
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    // TODO: Check holiday table for HOLIDAY day type
    const dayType = isWeekend ? 'WEEKEND' : 'WEEKDAY';

    while (currentMinutes <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

      // Find the applicable interval for this time
      const interval = this.findIntervalForTime(intervals, timeStr, dayType);
      const intervalMin = interval?.intervalMin || 8;
      const isPrimeTime = interval?.isPrimeTime || false;

      slots.push({ time: timeStr, isPrimeTime });
      currentMinutes += intervalMin;
    }

    return slots;
  }

  /**
   * Find the interval configuration that applies to a specific time
   */
  private findIntervalForTime(intervals: any[], time: string, dayType: string): any | null {
    for (const interval of intervals) {
      if (interval.dayType !== dayType) continue;

      const [timeHour, timeMin] = time.split(':').map(Number);
      const [startHour, startMin] = interval.timeStart.split(':').map(Number);
      const [endHour, endMin] = interval.timeEnd.split(':').map(Number);

      const timeMinutes = timeHour * 60 + timeMin;
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (timeMinutes >= startMinutes && timeMinutes < endMinutes) {
        return interval;
      }
    }

    // Return first matching day type interval as default, or null
    return intervals.find(i => i.dayType === dayType) || null;
  }

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
      const blocks = await this.getBlocksForDate(tenantId, dto.courseId, teeDate);
      const block = this.findBlockForTime(blocks, teeDate, dto.teeTime);

      if (block) {
        throw new BadRequestException(
          `This tee time is blocked for ${block.blockType.toLowerCase()}${block.reason ? `: ${block.reason}` : ''}`,
        );
      }

      // Check if slot has capacity for new players
      // Multiple bookings can share a flight as long as total players ≤ 4
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
    players: Array<{
      position: number;
      playerType: string;
      memberId?: string;
      dependentId?: string; // For DEPENDENT player type - links to Dependent table
      guestName?: string;
      guestEmail?: string;
      guestPhone?: string;
      cartType?: string;
      sharedWithPosition?: number;
      caddyId?: string;
      caddyRequest?: string;
      cartRequest?: string;
      cartId?: string;
      rentalRequest?: string;
      cartStatus?: string;
      caddyStatus?: string;
    }>,
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

  async getCourses(tenantId: string) {
    return this.prisma.golfCourse.findMany({
      where: { clubId: tenantId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getCaddies(tenantId: string) {
    return this.prisma.caddy.findMany({
      where: { clubId: tenantId, isActive: true },
      orderBy: { caddyNumber: 'asc' },
    });
  }

  private generateTimeSlots(
    firstTee: string,
    lastTee: string,
    interval: number,
  ): string[] {
    const slots: string[] = [];
    const [startHour, startMin] = firstTee.split(':').map(Number);
    const [endHour, endMin] = lastTee.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      slots.push(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
      );
      currentMinutes += interval;
    }

    return slots;
  }

  // ============================================================================
  // COURSE SCHEDULE METHODS (US-10)
  // ============================================================================

  async getCourseSchedules(tenantId: string, courseId: string) {
    return this.prisma.golfCourseSchedule.findMany({
      where: {
        courseId,
        course: { clubId: tenantId },
      },
      include: {
        intervals: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async createCourseSchedule(
    tenantId: string,
    data: {
      courseId: string;
      seasonName: string;
      startDate: Date;
      endDate: Date;
      firstTeeTime: string;
      lastTeeTime: string;
      playFormat?: string;
      paceOfPlay?: number;
      intervals?: {
        dayType: string;
        timeStart: string;
        timeEnd: string;
        intervalMin: number;
        isPrimeTime: boolean;
      }[];
    },
  ) {
    // Verify course belongs to tenant
    const course = await this.prisma.golfCourse.findFirst({
      where: { id: data.courseId, clubId: tenantId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check for overlapping schedules
    const overlapping = await this.prisma.golfCourseSchedule.findFirst({
      where: {
        courseId: data.courseId,
        isActive: true,
        OR: [
          {
            startDate: { lte: data.endDate },
            endDate: { gte: data.startDate },
          },
        ],
      },
    });

    if (overlapping) {
      throw new ConflictException(
        `Schedule overlaps with existing schedule: ${overlapping.seasonName}`,
      );
    }

    return this.prisma.golfCourseSchedule.create({
      data: {
        courseId: data.courseId,
        seasonName: data.seasonName,
        startDate: data.startDate,
        endDate: data.endDate,
        firstTeeTime: data.firstTeeTime,
        lastTeeTime: data.lastTeeTime,
        playFormat: (data.playFormat as any) || 'EIGHTEEN_HOLE',
        paceOfPlay: data.paceOfPlay,
        isActive: true,
        intervals: data.intervals?.length
          ? {
              create: data.intervals.map((interval) => ({
                dayType: interval.dayType as any,
                timeStart: interval.timeStart,
                timeEnd: interval.timeEnd,
                intervalMin: interval.intervalMin,
                isPrimeTime: interval.isPrimeTime,
              })),
            }
          : undefined,
      },
      include: {
        intervals: true,
      },
    });
  }

  async updateCourseSchedule(
    tenantId: string,
    scheduleId: string,
    data: {
      seasonName?: string;
      startDate?: Date;
      endDate?: Date;
      firstTeeTime?: string;
      lastTeeTime?: string;
      playFormat?: string;
      paceOfPlay?: number;
      isActive?: boolean;
    },
  ) {
    const schedule = await this.prisma.golfCourseSchedule.findFirst({
      where: {
        id: scheduleId,
        course: { clubId: tenantId },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return this.prisma.golfCourseSchedule.update({
      where: { id: scheduleId },
      data: {
        seasonName: data.seasonName,
        startDate: data.startDate,
        endDate: data.endDate,
        firstTeeTime: data.firstTeeTime,
        lastTeeTime: data.lastTeeTime,
        playFormat: data.playFormat as any,
        paceOfPlay: data.paceOfPlay,
        isActive: data.isActive,
      },
      include: {
        intervals: true,
      },
    });
  }

  async deleteCourseSchedule(tenantId: string, scheduleId: string) {
    const schedule = await this.prisma.golfCourseSchedule.findFirst({
      where: {
        id: scheduleId,
        course: { clubId: tenantId },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Delete associated intervals first
    await this.prisma.golfCourseInterval.deleteMany({
      where: { scheduleId },
    });

    return this.prisma.golfCourseSchedule.delete({
      where: { id: scheduleId },
    });
  }

  // ============================================================================
  // TEE TIME BLOCK METHODS (US-2)
  // ============================================================================

  async getTeeTimeBlocks(
    tenantId: string,
    courseId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      blockType?: string;
    },
  ) {
    const where: any = {
      courseId,
      course: { clubId: tenantId },
    };

    if (filters?.startDate && filters?.endDate) {
      where.OR = [
        {
          startTime: { lte: filters.endDate },
          endTime: { gte: filters.startDate },
        },
        { isRecurring: true },
      ];
    }

    if (filters?.blockType) {
      where.blockType = filters.blockType;
    }

    return this.prisma.teeTimeBlock.findMany({
      where,
      include: {
        course: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async createTeeTimeBlock(
    tenantId: string,
    data: {
      courseId: string;
      startTime: Date;
      endTime: Date;
      blockType: string;
      reason?: string;
      isRecurring?: boolean;
      recurringPattern?: string;
    },
    userId: string,
  ) {
    // Verify course belongs to tenant
    const course = await this.prisma.golfCourse.findFirst({
      where: { id: data.courseId, clubId: tenantId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check for existing bookings in this time range (only for non-recurring blocks)
    if (!data.isRecurring) {
      const existingBookings = await this.prisma.teeTime.findMany({
        where: {
          clubId: tenantId,
          courseId: data.courseId,
          teeDate: {
            gte: new Date(data.startTime.toDateString()),
            lte: new Date(data.endTime.toDateString()),
          },
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        },
      });

      // Filter to bookings that actually fall within the block time
      const conflictingBookings = existingBookings.filter((booking) => {
        const [bookingHour, bookingMin] = booking.teeTime.split(':').map(Number);
        const bookingMinutes = bookingHour * 60 + bookingMin;

        const startMinutes = data.startTime.getHours() * 60 + data.startTime.getMinutes();
        const endMinutes = data.endTime.getHours() * 60 + data.endTime.getMinutes();

        return bookingMinutes >= startMinutes && bookingMinutes < endMinutes;
      });

      if (conflictingBookings.length > 0) {
        throw new ConflictException(
          `Cannot create block: ${conflictingBookings.length} existing booking(s) in this time range. Cancel them first or adjust block time.`,
        );
      }
    }

    return this.prisma.teeTimeBlock.create({
      data: {
        courseId: data.courseId,
        startTime: data.startTime,
        endTime: data.endTime,
        blockType: data.blockType as any,
        reason: data.reason,
        isRecurring: data.isRecurring || false,
        recurringPattern: data.recurringPattern,
        createdBy: userId,
      },
      include: {
        course: true,
      },
    });
  }

  async updateTeeTimeBlock(
    tenantId: string,
    blockId: string,
    data: {
      startTime?: Date;
      endTime?: Date;
      blockType?: string;
      reason?: string;
      isRecurring?: boolean;
      recurringPattern?: string;
    },
  ) {
    const block = await this.prisma.teeTimeBlock.findFirst({
      where: {
        id: blockId,
        course: { clubId: tenantId },
      },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return this.prisma.teeTimeBlock.update({
      where: { id: blockId },
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        blockType: data.blockType as any,
        reason: data.reason,
        isRecurring: data.isRecurring,
        recurringPattern: data.recurringPattern,
      },
      include: {
        course: true,
      },
    });
  }

  async deleteTeeTimeBlock(tenantId: string, blockId: string) {
    const block = await this.prisma.teeTimeBlock.findFirst({
      where: {
        id: blockId,
        course: { clubId: tenantId },
      },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return this.prisma.teeTimeBlock.delete({
      where: { id: blockId },
    });
  }

  // ============================================================================
  // WEEK VIEW OCCUPANCY
  // ============================================================================

  /**
   * Get week view occupancy data showing player positions for each time slot
   * Used by the Week view to display 4 player blocks per flight
   */
  async getWeekViewOccupancy(
    tenantId: string,
    courseId: string,
    startDate: string,
    endDate: string,
    startTime?: string,
    endTime?: string,
  ): Promise<{
    date: string;
    time: string;
    nine: 'FRONT' | 'BACK';
    isBlocked: boolean;
    positions: {
      position: number;
      status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
      player?: {
        id: string;
        name: string;
        type: PlayerType;
        memberId?: string;
      };
    }[];
  }[]> {
    this.logger.log(`getWeekViewOccupancy: tenantId=${tenantId}, courseId=${courseId}, startDate=${startDate}, endDate=${endDate}, startTime=${startTime}, endTime=${endTime}`);

    // Parse date range first
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T00:00:00.000Z`);

    // Helper to convert HH:MM to minutes for comparison
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return (hours ?? 0) * 60 + (minutes ?? 0);
    };

    // Parse optional time filters
    const startTimeMinutes = startTime ? timeToMinutes(startTime) : null;
    const endTimeMinutes = endTime ? timeToMinutes(endTime) : null;

    // OPTIMIZATION: Batch fetch all data in parallel (reduces from ~10 sequential queries to 4 parallel)
    const [course, teeTimes, blocks, schedules] = await Promise.all([
      // 1. Fetch course
      this.prisma.golfCourse.findFirst({
        where: { id: courseId, clubId: tenantId },
      }),
      // 2. Fetch all tee times in the date range
      this.prisma.teeTime.findMany({
        where: {
          clubId: tenantId,
          courseId,
          teeDate: {
            gte: start,
            lte: end,
          },
          status: { not: BookingStatus.CANCELLED },
        },
        include: {
          players: {
            include: {
              member: {
                select: { id: true, memberId: true, firstName: true, lastName: true },
              },
            },
            orderBy: { position: 'asc' },
          },
        },
      }),
      // 3. Fetch all blocks in the date range
      this.prisma.teeTimeBlock.findMany({
        where: {
          courseId,
          course: { clubId: tenantId },
          OR: [
            {
              isRecurring: false,
              startTime: { lte: end },
              endTime: { gte: start },
            },
            {
              isRecurring: true,
            },
          ],
        },
      }),
      // 4. OPTIMIZATION: Batch fetch all schedules that overlap the date range (instead of N queries)
      this.prisma.golfCourseSchedule.findMany({
        where: {
          courseId,
          isActive: true,
          startDate: { lte: end },
          endDate: { gte: start },
          course: { clubId: tenantId },
        },
        include: {
          intervals: true,
        },
      }),
    ]);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    this.logger.log(`Found ${teeTimes.length} tee times, ${schedules.length} schedules in range`);

    // Build a map of bookings by date+time+nine for quick lookup
    // Multiple bookings can exist at the same time slot, so store arrays
    const bookingMap = new Map<string, typeof teeTimes>();
    for (const tt of teeTimes) {
      const dateStr = tt.teeDate.toISOString().split('T')[0];
      const nine = tt.startingHole === 10 ? 'BACK' : 'FRONT';
      const key = `${dateStr}|${tt.teeTime}|${nine}`;
      const existing = bookingMap.get(key) || [];
      existing.push(tt);
      bookingMap.set(key, existing);
    }

    // Helper to find the active schedule for a specific date (from pre-fetched data - no DB query!)
    const findScheduleForDate = (date: Date) => {
      return schedules.find(s => s.startDate <= date && s.endDate >= date);
    };

    // Generate all slots for each day in the range
    const slots: {
      date: string;
      time: string;
      nine: 'FRONT' | 'BACK';
      isBlocked: boolean;
      positions: {
        position: number;
        status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
        player?: {
          id: string;
          name: string;
          type: PlayerType;
          memberId?: string;
        };
      }[];
    }[] = [];

    // Iterate through each day
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];

      // Get schedule for this date (from pre-fetched data - no DB query!)
      const schedule = findScheduleForDate(currentDate);
      const firstTeeTime = schedule?.firstTeeTime || course.firstTeeTime;
      const lastTeeTime = schedule?.lastTeeTime || course.lastTeeTime;

      // Generate time slots for this day
      const timeSlots = schedule?.intervals?.length
        ? this.generateTimeSlotsFromIntervals(firstTeeTime, lastTeeTime, schedule.intervals, currentDate)
        : this.generateTimeSlots(firstTeeTime, lastTeeTime, course.teeInterval);

      // For each time slot, generate Front 9 and Back 9 entries
      for (const slotInfo of timeSlots) {
        const time = typeof slotInfo === 'string' ? slotInfo : slotInfo.time;

        // Apply time range filter if specified
        if (startTimeMinutes !== null || endTimeMinutes !== null) {
          const slotMinutes = timeToMinutes(time);
          if (startTimeMinutes !== null && slotMinutes < startTimeMinutes) continue;
          if (endTimeMinutes !== null && slotMinutes >= endTimeMinutes) continue;
        }

        for (const nine of ['FRONT', 'BACK'] as const) {
          const key = `${dateStr}|${time}|${nine}`;
          const bookings = bookingMap.get(key) || [];
          const block = this.findBlockForTime(blocks, currentDate, time);
          const isBlocked = !!block;

          // Aggregate all players from all bookings at this time slot
          const allPlayers = bookings.flatMap(b => b.players);

          // Generate 4 positions
          const positions: {
            position: number;
            status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
            player?: {
              id: string;
              name: string;
              type: PlayerType;
              memberId?: string;
            };
          }[] = [];

          for (let pos = 1; pos <= 4; pos++) {
            const player = allPlayers.find(p => p.position === pos);

            if (isBlocked) {
              positions.push({ position: pos, status: 'BLOCKED' });
            } else if (player) {
              const playerName = player.member
                ? `${player.member.firstName} ${player.member.lastName}`
                : player.guestName || 'Unknown';

              positions.push({
                position: pos,
                status: 'BOOKED',
                player: {
                  id: player.id,
                  name: playerName,
                  type: player.playerType as PlayerType,
                  memberId: player.member?.memberId,
                },
              });
            } else {
              positions.push({ position: pos, status: 'AVAILABLE' });
            }
          }

          slots.push({
            date: dateStr,
            time,
            nine,
            isBlocked,
            positions,
          });
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    this.logger.log(`Generated ${slots.length} week view slots`);
    return slots;
  }

  /**
   * Update a single player's rental status (cart/caddy)
   */
  async updatePlayerRentalStatus(
    tenantId: string,
    playerId: string,
    updates: {
      cartStatus?: string;
      caddyStatus?: string;
      caddyId?: string | null;
    },
    userId: string,
  ) {
    this.logger.log(`Updating player rental status: ${playerId}, updates: ${JSON.stringify(updates)}`);

    // Verify the player exists and belongs to a tee time in this tenant
    const player = await this.prisma.teeTimePlayer.findFirst({
      where: {
        id: playerId,
        teeTime: {
          course: {
            clubId: tenantId,
          },
        },
      },
      include: {
        teeTime: true,
        member: true,
        caddy: true,
      },
    });

    if (!player) {
      throw new NotFoundException(`Player not found: ${playerId}`);
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (updates.cartStatus !== undefined) {
      updateData.cartStatus = updates.cartStatus;
    }

    if (updates.caddyStatus !== undefined) {
      updateData.caddyStatus = updates.caddyStatus;
    }

    if (updates.caddyId !== undefined) {
      updateData.caddyId = updates.caddyId;
    }

    // Update the player
    const updatedPlayer = await this.prisma.teeTimePlayer.update({
      where: { id: playerId },
      data: updateData,
      include: {
        member: true,
        caddy: true,
      },
    });

    this.logger.log(`Updated player rental status: ${playerId}`);

    return updatedPlayer;
  }
}

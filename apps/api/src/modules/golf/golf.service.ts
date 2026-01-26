import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
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
  players: {
    position: number;
    playerType: PlayerType;
    memberId?: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    cartType?: CartType;
    sharedWithPosition?: number;
    caddyId?: string;
  }[];
  notes?: string;
}

export interface UpdateFlightDto {
  players?: CreateFlightDto['players'];
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
    const course = await this.prisma.golfCourse.findFirst({
      where: { id: courseId, clubId: tenantId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const teeDate = new Date(date);

    // Get active schedule for this date
    const activeSchedule = await this.getActiveScheduleForDate(tenantId, courseId, teeDate);

    // Get blocks for this date
    const blocks = await this.getBlocksForDate(tenantId, courseId, teeDate);

    const teeTimes = await this.prisma.teeTime.findMany({
      where: {
        clubId: tenantId,
        courseId,
        teeDate,
      },
      include: {
        players: {
          include: {
            member: {
              select: { id: true, memberId: true, firstName: true, lastName: true },
            },
            caddy: {
              select: { id: true, caddyNumber: true, firstName: true, lastName: true },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { teeTime: 'asc' },
    });

    // Use schedule times/intervals if available, otherwise fall back to course defaults
    const firstTeeTime = activeSchedule?.firstTeeTime || course.firstTeeTime;
    const lastTeeTime = activeSchedule?.lastTeeTime || course.lastTeeTime;

    // Generate time slots using schedule intervals if available
    const slots = activeSchedule?.intervals?.length
      ? this.generateTimeSlotsFromIntervals(firstTeeTime, lastTeeTime, activeSchedule.intervals, teeDate)
      : this.generateTimeSlots(firstTeeTime, lastTeeTime, course.teeInterval);

    // Map bookings and blocks to slots
    return slots.map((slotInfo) => {
      const time = typeof slotInfo === 'string' ? slotInfo : slotInfo.time;
      const isPrimeTime = typeof slotInfo === 'string' ? false : slotInfo.isPrimeTime;

      const booking = teeTimes.find((t) => t.teeTime === time);
      const block = this.findBlockForTime(blocks, teeDate, time);

      return {
        time,
        courseId,
        date,
        booking: booking || null,
        available: !booking && !block,
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
      const teeDate = new Date(dto.teeDate);

      // Check if time is blocked
      const blocks = await this.getBlocksForDate(tenantId, dto.courseId, teeDate);
      const block = this.findBlockForTime(blocks, teeDate, dto.teeTime);

      if (block) {
        throw new BadRequestException(
          `This tee time is blocked for ${block.blockType.toLowerCase()}${block.reason ? `: ${block.reason}` : ''}`,
        );
      }

      // Check if slot is available
      const existing = await this.prisma.teeTime.findFirst({
        where: {
          clubId: tenantId,
          courseId: dto.courseId,
          teeDate,
          teeTime: dto.teeTime,
        },
      });

      if (existing) {
        throw new ConflictException('This tee time is already booked');
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
          status: 'CONFIRMED',
          notes: dto.notes,
          players: {
            create: dto.players.map((p: any) => ({
              position: p.position,
              playerType: p.playerType,
              memberId: p.memberId,
              guestName: p.guestName,
              guestEmail: p.guestEmail,
              guestPhone: p.guestPhone,
              cartType: p.cartType || 'WALKING',
              sharedWithPosition: p.sharedWithPosition,
              caddyId: p.caddyId,
            })),
          },
        },
        include: {
          players: {
            include: {
              member: true,
              caddy: true,
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
          include: { member: true, caddy: true },
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
        notes: dto.notes,
        status: dto.status as any,
      },
      include: {
        players: { include: { member: true, caddy: true } },
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
}

import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import {
  TeeSheetSlot,
  WeekViewOccupancySlot,
  PlayerType,
  BookingStatus,
} from './golf.types';
import {
  scheduleCache,
  courseCache,
  scheduleKey,
  courseKey,
} from '@/shared/cache';

@Injectable()
export class TeeSheetService {
  private readonly logger = new Logger(TeeSheetService.name);

  constructor(private prisma: PrismaService) {}

  async getTeeSheet(
    tenantId: string,
    courseId: string,
    date: string,
  ): Promise<TeeSheetSlot[]> {
    this.logger.log(`getTeeSheet called with tenantId: ${tenantId}, courseId: ${courseId}, date: ${date}`);

    // Use cached course data
    const course = await this.getCachedCourse(tenantId, courseId);

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

    // OPTIMIZATION: Batch fetch all players in a single query (eliminates N+1)
    const teeTimeIds = teeTimes.map((tt: any) => tt.id);
    const allPlayers = teeTimeIds.length > 0
      ? await this.prisma.teeTimePlayer.findMany({
          where: { teeTimeId: { in: teeTimeIds } },
          include: {
            member: {
              select: { id: true, memberId: true, firstName: true, lastName: true },
            },
            caddy: {
              select: { id: true, caddyNumber: true, firstName: true, lastName: true },
            },
          },
          orderBy: { position: 'asc' },
        })
      : [];

    // Group players by teeTimeId
    const playersByTeeTime = new Map<string, typeof allPlayers>();
    for (const player of allPlayers) {
      const existing = playersByTeeTime.get(player.teeTimeId) || [];
      existing.push(player);
      playersByTeeTime.set(player.teeTimeId, existing);
    }

    // Attach players to tee times
    const teeTimesWithPlayers = teeTimes.map((tt: any) => ({
      ...tt,
      players: playersByTeeTime.get(tt.id) || [],
    }));

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
   * Get the active schedule for a specific date (with caching)
   */
  async getActiveScheduleForDate(tenantId: string, courseId: string, date: Date) {
    const cacheKey = scheduleKey(courseId, date);

    // Check cache first
    const cached = scheduleCache.get(cacheKey);
    if (cached !== undefined) {
      this.logger.debug(`Schedule cache HIT for ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`Schedule cache MISS for ${cacheKey}`);

    const schedule = await this.prisma.golfCourseSchedule.findFirst({
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

    // Cache the result (even if null - to avoid repeated queries for non-existent schedules)
    scheduleCache.set(cacheKey, schedule);

    return schedule;
  }

  /**
   * Get course by ID (with caching)
   */
  async getCachedCourse(tenantId: string, courseId: string) {
    const cacheKey = courseKey(courseId);

    // Check cache first
    const cached = courseCache.get(cacheKey);
    if (cached !== undefined) {
      // Verify tenant match for security
      if (cached?.clubId === tenantId) {
        this.logger.debug(`Course cache HIT for ${cacheKey}`);
        return cached;
      }
    }

    this.logger.debug(`Course cache MISS for ${cacheKey}`);

    const course = await this.prisma.golfCourse.findFirst({
      where: { id: courseId, clubId: tenantId },
    });

    if (course) {
      courseCache.set(cacheKey, course);
    }

    return course;
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
  findBlockForTime(blocks: any[], date: Date, time: string): any | null {
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
  matchesRecurringPattern(date: Date, pattern: string | null): boolean {
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
  generateTimeSlotsFromIntervals(
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
  findIntervalForTime(intervals: any[], time: string, dayType: string): any | null {
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

  /**
   * Generate time slots with fixed interval
   */
  generateTimeSlots(
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
  ): Promise<WeekViewOccupancySlot[]> {
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
    const slots: WeekViewOccupancySlot[] = [];

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
          const positions: WeekViewOccupancySlot['positions'] = [];

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
}

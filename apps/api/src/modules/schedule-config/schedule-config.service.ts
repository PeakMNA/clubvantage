import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import type { ApplicableDays, TwilightMode, SpecialDayType, BookingMode } from '@prisma/client';

export interface TimePeriodConfig {
  id: string;
  name: string;
  startTime: string;
  endTime: string | null;
  intervalMinutes: number;
  isPrimeTime: boolean;
  applicableDays: ApplicableDays;
  sortOrder: number;
}

export interface EffectiveSchedule {
  courseId: string;
  date: string;

  // Operating hours for the specific date
  firstTee: string;
  lastTee: string;

  // Twilight configuration
  twilightMode: TwilightMode;
  twilightTime: string;

  // Booking window
  bookingWindowDays: number;

  // Tee sheet booking mode
  bookingMode: BookingMode;

  // Active time periods for this date
  timePeriods: TimePeriodConfig[];

  // Active season (if any)
  activeSeason?: {
    id: string;
    name: string;
  };

  // Active special day (if any)
  activeSpecialDay?: {
    id: string;
    name: string;
    type: SpecialDayType;
  };

  // Whether the course is closed on this day
  isClosed: boolean;
}

export interface ScheduleConfigData {
  id: string;
  courseId: string;
  weekdayFirstTee: string;
  weekdayLastTee: string;
  weekdayBookingMode: BookingMode;
  weekendFirstTee: string;
  weekendLastTee: string;
  weekendBookingMode: BookingMode;
  twilightMode: TwilightMode;
  twilightMinutesBeforeSunset: number;
  twilightFixedDefault: string;
  clubLatitude: number | null;
  clubLongitude: number | null;
  defaultBookingWindowDays: number;
  timePeriods: TimePeriodConfig[];
  seasons: Array<{
    id: string;
    name: string;
    startMonth: number;
    startDay: number;
    endMonth: number;
    endDay: number;
    isRecurring: boolean;
    priority: number;
    overrideFirstTee: string | null;
    overrideLastTee: string | null;
    overrideBookingWindow: number | null;
    overrideTwilightTime: string | null;
    overrideTimePeriods: boolean;
    weekdayBookingMode: BookingMode | null;
    weekendBookingMode: BookingMode | null;
    timePeriods: TimePeriodConfig[];
  }>;
  specialDays: Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isRecurring: boolean;
    type: SpecialDayType;
    customFirstTee: string | null;
    customLastTee: string | null;
    customTimePeriods: boolean;
    bookingMode: BookingMode | null;
    timePeriods: TimePeriodConfig[];
  }>;
}

@Injectable()
export class ScheduleConfigService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get the schedule configuration for a course
   * If autoCreate is true and no config exists, creates a default one
   */
  async getScheduleConfig(
    tenantId: string,
    courseId: string,
    autoCreate: boolean = false,
  ): Promise<ScheduleConfigData | null> {
    // First verify the course belongs to the tenant
    const course = await this.prisma.golfCourse.findFirst({
      where: { id: courseId, clubId: tenantId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    let config = await this.prisma.golfScheduleConfig.findUnique({
      where: { courseId },
      include: {
        timePeriods: {
          orderBy: { sortOrder: 'asc' },
        },
        seasons: {
          include: {
            timePeriods: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { priority: 'desc' },
        },
        specialDays: {
          include: {
            timePeriods: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    // Auto-create default config if requested and none exists
    if (!config && autoCreate) {
      return this.createDefaultConfig(tenantId, courseId);
    }

    if (!config) {
      return null;
    }

    return {
      id: config.id,
      courseId: config.courseId,
      weekdayFirstTee: config.weekdayFirstTee,
      weekdayLastTee: config.weekdayLastTee,
      weekdayBookingMode: config.weekdayBookingMode,
      weekendFirstTee: config.weekendFirstTee,
      weekendLastTee: config.weekendLastTee,
      weekendBookingMode: config.weekendBookingMode,
      twilightMode: config.twilightMode,
      twilightMinutesBeforeSunset: config.twilightMinutesBeforeSunset,
      twilightFixedDefault: config.twilightFixedDefault,
      clubLatitude: config.clubLatitude ? Number(config.clubLatitude) : null,
      clubLongitude: config.clubLongitude ? Number(config.clubLongitude) : null,
      defaultBookingWindowDays: config.defaultBookingWindowDays,
      timePeriods: config.timePeriods.map((p) => ({
        id: p.id,
        name: p.name,
        startTime: p.startTime,
        endTime: p.endTime,
        intervalMinutes: p.intervalMinutes,
        isPrimeTime: p.isPrimeTime,
        applicableDays: p.applicableDays,
        sortOrder: p.sortOrder,
      })),
      seasons: config.seasons.map((s) => ({
        id: s.id,
        name: s.name,
        startMonth: s.startMonth,
        startDay: s.startDay,
        endMonth: s.endMonth,
        endDay: s.endDay,
        isRecurring: s.isRecurring,
        priority: s.priority,
        overrideFirstTee: s.overrideFirstTee,
        overrideLastTee: s.overrideLastTee,
        overrideBookingWindow: s.overrideBookingWindow,
        overrideTwilightTime: s.overrideTwilightTime,
        overrideTimePeriods: s.overrideTimePeriods,
        weekdayBookingMode: s.weekdayBookingMode,
        weekendBookingMode: s.weekendBookingMode,
        timePeriods: s.timePeriods.map((p) => ({
          id: p.id,
          name: p.name,
          startTime: p.startTime,
          endTime: p.endTime,
          intervalMinutes: p.intervalMinutes,
          isPrimeTime: p.isPrimeTime,
          applicableDays: p.applicableDays,
          sortOrder: p.sortOrder,
        })),
      })),
      specialDays: config.specialDays.map((d) => ({
        id: d.id,
        name: d.name,
        startDate: d.startDate,
        endDate: d.endDate,
        isRecurring: d.isRecurring,
        type: d.type,
        customFirstTee: d.customFirstTee,
        customLastTee: d.customLastTee,
        customTimePeriods: d.customTimePeriods,
        bookingMode: d.bookingMode,
        timePeriods: d.timePeriods.map((p) => ({
          id: p.id,
          name: p.name,
          startTime: p.startTime,
          endTime: p.endTime,
          intervalMinutes: p.intervalMinutes,
          isPrimeTime: p.isPrimeTime,
          applicableDays: p.applicableDays,
          sortOrder: p.sortOrder,
        })),
      })),
    };
  }

  /**
   * Get the effective schedule for a specific date
   * This applies season and special day overrides to the base config
   */
  async getEffectiveScheduleForDate(
    tenantId: string,
    courseId: string,
    date: Date,
  ): Promise<EffectiveSchedule> {
    const config = await this.getScheduleConfig(tenantId, courseId);

    if (!config) {
      // Return defaults if no config exists
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      return {
        courseId,
        date: date.toISOString().split('T')[0],
        firstTee: isWeekend ? '05:30' : '06:00',
        lastTee: isWeekend ? '17:30' : '17:00',
        twilightMode: 'FIXED',
        twilightTime: '16:00',
        bookingWindowDays: 7,
        bookingMode: 'EIGHTEEN',
        timePeriods: [],
        isClosed: false,
      };
    }

    const dateStr = date.toISOString().split('T')[0];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const dayType = isWeekend ? 'WEEKEND' : 'WEEKDAY';

    // Start with base operating hours
    let firstTee = isWeekend ? config.weekendFirstTee : config.weekdayFirstTee;
    let lastTee = isWeekend ? config.weekendLastTee : config.weekdayLastTee;
    let bookingWindowDays = config.defaultBookingWindowDays;
    let twilightTime = config.twilightFixedDefault;
    let bookingMode: BookingMode = isWeekend ? config.weekendBookingMode : config.weekdayBookingMode;
    let timePeriods = config.timePeriods;
    let activeSeason: EffectiveSchedule['activeSeason'] = undefined;
    let activeSpecialDay: EffectiveSchedule['activeSpecialDay'] = undefined;
    let isClosed = false;

    // Check for active season
    const matchingSeason = this.findMatchingSeason(config.seasons, date);
    if (matchingSeason) {
      activeSeason = {
        id: matchingSeason.id,
        name: matchingSeason.name,
      };

      // Apply season overrides
      if (matchingSeason.overrideFirstTee) {
        firstTee = matchingSeason.overrideFirstTee;
      }
      if (matchingSeason.overrideLastTee) {
        lastTee = matchingSeason.overrideLastTee;
      }
      if (matchingSeason.overrideBookingWindow !== null) {
        bookingWindowDays = matchingSeason.overrideBookingWindow;
      }
      if (matchingSeason.overrideTwilightTime) {
        twilightTime = matchingSeason.overrideTwilightTime;
      }
      if (matchingSeason.overrideTimePeriods && matchingSeason.timePeriods.length > 0) {
        timePeriods = matchingSeason.timePeriods;
      }
      // Apply season booking mode overrides
      const seasonBookingMode = isWeekend
        ? matchingSeason.weekendBookingMode
        : matchingSeason.weekdayBookingMode;
      if (seasonBookingMode) {
        bookingMode = seasonBookingMode;
      }
    }

    // Check for special day (takes precedence over season)
    const matchingSpecialDay = this.findMatchingSpecialDay(config.specialDays, date);
    if (matchingSpecialDay) {
      activeSpecialDay = {
        id: matchingSpecialDay.id,
        name: matchingSpecialDay.name,
        type: matchingSpecialDay.type,
      };

      // Handle different special day types
      if (matchingSpecialDay.type === 'CLOSED') {
        isClosed = true;
      } else if (matchingSpecialDay.type === 'WEEKEND') {
        // Treat as weekend regardless of actual day
        firstTee = config.weekendFirstTee;
        lastTee = config.weekendLastTee;
      } else if (matchingSpecialDay.type === 'HOLIDAY') {
        // Use weekend hours for holidays
        firstTee = config.weekendFirstTee;
        lastTee = config.weekendLastTee;
      }

      // Apply custom overrides if type is CUSTOM
      if (matchingSpecialDay.type === 'CUSTOM') {
        if (matchingSpecialDay.customFirstTee) {
          firstTee = matchingSpecialDay.customFirstTee;
        }
        if (matchingSpecialDay.customLastTee) {
          lastTee = matchingSpecialDay.customLastTee;
        }
        if (matchingSpecialDay.customTimePeriods && matchingSpecialDay.timePeriods.length > 0) {
          timePeriods = matchingSpecialDay.timePeriods;
        }
      }
      // Apply special day booking mode override (takes precedence over everything)
      if (matchingSpecialDay.bookingMode) {
        bookingMode = matchingSpecialDay.bookingMode;
      }
    }

    // Calculate twilight time if using SUNSET mode
    if (config.twilightMode === 'SUNSET' && config.clubLatitude && config.clubLongitude) {
      twilightTime = this.calculateTwilightFromSunset(
        date,
        config.clubLatitude,
        config.clubLongitude,
        config.twilightMinutesBeforeSunset,
      );
    }

    // Filter time periods by applicable days
    const effectiveTimePeriods = timePeriods.filter(
      (p) => p.applicableDays === 'ALL' || p.applicableDays === dayType,
    );

    return {
      courseId,
      date: dateStr,
      firstTee,
      lastTee,
      twilightMode: config.twilightMode,
      twilightTime,
      bookingWindowDays,
      bookingMode,
      timePeriods: effectiveTimePeriods,
      activeSeason,
      activeSpecialDay,
      isClosed,
    };
  }

  /**
   * Find the matching season for a given date
   */
  private findMatchingSeason(
    seasons: ScheduleConfigData['seasons'],
    date: Date,
  ): ScheduleConfigData['seasons'][0] | null {
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    // Sort by priority (highest first) then find first match
    const sortedSeasons = [...seasons].sort((a, b) => b.priority - a.priority);

    for (const season of sortedSeasons) {
      if (this.isDateInSeasonRange(month, day, season)) {
        return season;
      }
    }

    return null;
  }

  /**
   * Check if a date (month/day) falls within a season's range
   * Handles seasons that span across years (e.g., Nov 1 - Feb 28)
   */
  private isDateInSeasonRange(
    month: number,
    day: number,
    season: ScheduleConfigData['seasons'][0],
  ): boolean {
    const startVal = season.startMonth * 100 + season.startDay;
    const endVal = season.endMonth * 100 + season.endDay;
    const dateVal = month * 100 + day;

    if (startVal <= endVal) {
      // Normal range (e.g., Mar 1 - Oct 31)
      return dateVal >= startVal && dateVal <= endVal;
    } else {
      // Range spans year boundary (e.g., Nov 1 - Feb 28)
      return dateVal >= startVal || dateVal <= endVal;
    }
  }

  /**
   * Find the matching special day for a given date
   */
  private findMatchingSpecialDay(
    specialDays: ScheduleConfigData['specialDays'],
    date: Date,
  ): ScheduleConfigData['specialDays'][0] | null {
    const dateStr = date.toISOString().split('T')[0];
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const mmdd = `${month}-${day}`;

    for (const specialDay of specialDays) {
      if (specialDay.isRecurring) {
        // Check MM-DD format
        if (specialDay.startDate <= mmdd && mmdd <= specialDay.endDate) {
          return specialDay;
        }
        // Handle range across year boundary
        if (specialDay.startDate > specialDay.endDate) {
          if (mmdd >= specialDay.startDate || mmdd <= specialDay.endDate) {
            return specialDay;
          }
        }
      } else {
        // Check YYYY-MM-DD format
        if (specialDay.startDate <= dateStr && dateStr <= specialDay.endDate) {
          return specialDay;
        }
      }
    }

    return null;
  }

  /**
   * Calculate twilight time based on sunset
   * Uses a simplified solar calculation
   */
  private calculateTwilightFromSunset(
    date: Date,
    latitude: number,
    longitude: number,
    minutesBeforeSunset: number,
  ): string {
    // Simplified sunset calculation
    // For production, use suncalc or similar library
    const dayOfYear = this.getDayOfYear(date);
    const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * (Math.PI / 180));
    const latRad = latitude * (Math.PI / 180);
    const decRad = declination * (Math.PI / 180);

    // Hour angle at sunset
    const cosHourAngle = -Math.tan(latRad) * Math.tan(decRad);
    const hourAngle = Math.acos(Math.max(-1, Math.min(1, cosHourAngle))) * (180 / Math.PI);

    // Sunset time in hours (local solar time)
    const solarNoon = 12 - longitude / 15; // Approximate
    const sunsetHours = solarNoon + hourAngle / 15;

    // Apply minutes before sunset
    const twilightMinutes = sunsetHours * 60 - minutesBeforeSunset;
    const twilightHours = Math.floor(twilightMinutes / 60);
    const twilightMins = Math.floor(twilightMinutes % 60);

    return `${twilightHours.toString().padStart(2, '0')}:${twilightMins.toString().padStart(2, '0')}`;
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  /**
   * Create a default schedule config for a course
   */
  async createDefaultConfig(tenantId: string, courseId: string): Promise<ScheduleConfigData> {
    // Verify course belongs to tenant
    const course = await this.prisma.golfCourse.findFirst({
      where: { id: courseId, clubId: tenantId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if config already exists
    const existing = await this.prisma.golfScheduleConfig.findUnique({
      where: { courseId },
    });

    if (existing) {
      return this.getScheduleConfig(tenantId, courseId) as Promise<ScheduleConfigData>;
    }

    // Create default config with time periods
    const config = await this.prisma.golfScheduleConfig.create({
      data: {
        courseId,
        weekdayFirstTee: '06:00',
        weekdayLastTee: '17:00',
        weekdayBookingMode: 'EIGHTEEN',
        weekendFirstTee: '05:30',
        weekendLastTee: '17:30',
        weekendBookingMode: 'EIGHTEEN',
        twilightMode: 'FIXED',
        twilightMinutesBeforeSunset: 90,
        twilightFixedDefault: '16:00',
        defaultBookingWindowDays: 7,
        timePeriods: {
          create: [
            {
              name: 'Early Bird',
              startTime: '06:00',
              endTime: '07:00',
              intervalMinutes: 12,
              isPrimeTime: false,
              applicableDays: 'ALL',
              sortOrder: 0,
            },
            {
              name: 'Prime AM',
              startTime: '07:00',
              endTime: '11:00',
              intervalMinutes: 8,
              isPrimeTime: true,
              applicableDays: 'ALL',
              sortOrder: 1,
            },
            {
              name: 'Midday',
              startTime: '11:00',
              endTime: '14:00',
              intervalMinutes: 10,
              isPrimeTime: false,
              applicableDays: 'ALL',
              sortOrder: 2,
            },
            {
              name: 'Prime PM',
              startTime: '14:00',
              endTime: '16:00',
              intervalMinutes: 8,
              isPrimeTime: true,
              applicableDays: 'ALL',
              sortOrder: 3,
            },
            {
              name: 'Twilight',
              startTime: '16:00',
              endTime: null,
              intervalMinutes: 12,
              isPrimeTime: false,
              applicableDays: 'ALL',
              sortOrder: 4,
            },
          ],
        },
      },
      include: {
        timePeriods: true,
        seasons: true,
        specialDays: true,
      },
    });

    return {
      id: config.id,
      courseId: config.courseId,
      weekdayFirstTee: config.weekdayFirstTee,
      weekdayLastTee: config.weekdayLastTee,
      weekdayBookingMode: config.weekdayBookingMode,
      weekendFirstTee: config.weekendFirstTee,
      weekendLastTee: config.weekendLastTee,
      weekendBookingMode: config.weekendBookingMode,
      twilightMode: config.twilightMode,
      twilightMinutesBeforeSunset: config.twilightMinutesBeforeSunset,
      twilightFixedDefault: config.twilightFixedDefault,
      clubLatitude: config.clubLatitude ? Number(config.clubLatitude) : null,
      clubLongitude: config.clubLongitude ? Number(config.clubLongitude) : null,
      defaultBookingWindowDays: config.defaultBookingWindowDays,
      timePeriods: config.timePeriods.map((p) => ({
        id: p.id,
        name: p.name,
        startTime: p.startTime,
        endTime: p.endTime,
        intervalMinutes: p.intervalMinutes,
        isPrimeTime: p.isPrimeTime,
        applicableDays: p.applicableDays,
        sortOrder: p.sortOrder,
      })),
      seasons: [],
      specialDays: [],
    };
  }

  /**
   * Update schedule config
   */
  async updateScheduleConfig(
    tenantId: string,
    configId: string,
    data: {
      weekdayFirstTee?: string;
      weekdayLastTee?: string;
      weekdayBookingMode?: BookingMode;
      weekendFirstTee?: string;
      weekendLastTee?: string;
      weekendBookingMode?: BookingMode;
      twilightMode?: TwilightMode;
      twilightMinutesBeforeSunset?: number;
      twilightFixedDefault?: string;
      clubLatitude?: number | null;
      clubLongitude?: number | null;
      defaultBookingWindowDays?: number;
    },
  ): Promise<ScheduleConfigData> {
    // Verify config belongs to tenant's course
    const config = await this.prisma.golfScheduleConfig.findFirst({
      where: {
        id: configId,
        course: { clubId: tenantId },
      },
    });

    if (!config) {
      throw new NotFoundException('Schedule config not found');
    }

    await this.prisma.golfScheduleConfig.update({
      where: { id: configId },
      data: {
        weekdayFirstTee: data.weekdayFirstTee,
        weekdayLastTee: data.weekdayLastTee,
        weekdayBookingMode: data.weekdayBookingMode,
        weekendFirstTee: data.weekendFirstTee,
        weekendLastTee: data.weekendLastTee,
        weekendBookingMode: data.weekendBookingMode,
        twilightMode: data.twilightMode,
        twilightMinutesBeforeSunset: data.twilightMinutesBeforeSunset,
        twilightFixedDefault: data.twilightFixedDefault,
        clubLatitude: data.clubLatitude,
        clubLongitude: data.clubLongitude,
        defaultBookingWindowDays: data.defaultBookingWindowDays,
      },
    });

    return this.getScheduleConfig(tenantId, config.courseId) as Promise<ScheduleConfigData>;
  }

  /**
   * Create a time period
   */
  async createTimePeriod(
    tenantId: string,
    scheduleId: string,
    data: {
      name: string;
      startTime: string;
      endTime: string | null;
      intervalMinutes: number;
      isPrimeTime: boolean;
      applicableDays: ApplicableDays;
      sortOrder?: number;
    },
  ) {
    // Verify schedule belongs to tenant's course
    const config = await this.prisma.golfScheduleConfig.findFirst({
      where: {
        id: scheduleId,
        course: { clubId: tenantId },
      },
    });

    if (!config) {
      throw new NotFoundException('Schedule config not found');
    }

    // Get max sort order if not provided
    let sortOrder = data.sortOrder;
    if (sortOrder === undefined) {
      const lastPeriod = await this.prisma.golfScheduleTimePeriod.findFirst({
        where: { scheduleId },
        orderBy: { sortOrder: 'desc' },
      });
      sortOrder = (lastPeriod?.sortOrder ?? -1) + 1;
    }

    return this.prisma.golfScheduleTimePeriod.create({
      data: {
        scheduleId,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        intervalMinutes: data.intervalMinutes,
        isPrimeTime: data.isPrimeTime,
        applicableDays: data.applicableDays,
        sortOrder,
      },
    });
  }

  /**
   * Update a time period
   */
  async updateTimePeriod(
    tenantId: string,
    periodId: string,
    data: {
      name?: string;
      startTime?: string;
      endTime?: string | null;
      intervalMinutes?: number;
      isPrimeTime?: boolean;
      applicableDays?: ApplicableDays;
      sortOrder?: number;
    },
  ) {
    // Verify period belongs to tenant's course
    const period = await this.prisma.golfScheduleTimePeriod.findFirst({
      where: {
        id: periodId,
        schedule: { course: { clubId: tenantId } },
      },
    });

    if (!period) {
      throw new NotFoundException('Time period not found');
    }

    return this.prisma.golfScheduleTimePeriod.update({
      where: { id: periodId },
      data,
    });
  }

  /**
   * Delete a time period
   */
  async deleteTimePeriod(tenantId: string, periodId: string): Promise<boolean> {
    // Verify period belongs to tenant's course
    const period = await this.prisma.golfScheduleTimePeriod.findFirst({
      where: {
        id: periodId,
        schedule: { course: { clubId: tenantId } },
      },
    });

    if (!period) {
      throw new NotFoundException('Time period not found');
    }

    await this.prisma.golfScheduleTimePeriod.delete({
      where: { id: periodId },
    });

    return true;
  }

  /**
   * Create a season
   */
  async createSeason(
    tenantId: string,
    scheduleId: string,
    data: {
      name: string;
      startMonth: number;
      startDay: number;
      endMonth: number;
      endDay: number;
      isRecurring?: boolean;
      priority?: number;
      overrideFirstTee?: string | null;
      overrideLastTee?: string | null;
      overrideBookingWindow?: number | null;
      overrideTwilightTime?: string | null;
      overrideTimePeriods?: boolean;
      weekdayBookingMode?: BookingMode | null;
      weekendBookingMode?: BookingMode | null;
    },
  ) {
    // Verify schedule belongs to tenant's course
    const config = await this.prisma.golfScheduleConfig.findFirst({
      where: {
        id: scheduleId,
        course: { clubId: tenantId },
      },
    });

    if (!config) {
      throw new NotFoundException('Schedule config not found');
    }

    return this.prisma.golfScheduleSeason.create({
      data: {
        scheduleId,
        name: data.name,
        startMonth: data.startMonth,
        startDay: data.startDay,
        endMonth: data.endMonth,
        endDay: data.endDay,
        isRecurring: data.isRecurring ?? true,
        priority: data.priority ?? 0,
        overrideFirstTee: data.overrideFirstTee,
        overrideLastTee: data.overrideLastTee,
        overrideBookingWindow: data.overrideBookingWindow,
        overrideTwilightTime: data.overrideTwilightTime,
        overrideTimePeriods: data.overrideTimePeriods ?? false,
        weekdayBookingMode: data.weekdayBookingMode,
        weekendBookingMode: data.weekendBookingMode,
      },
      include: {
        timePeriods: true,
      },
    });
  }

  /**
   * Update a season
   */
  async updateSeason(
    tenantId: string,
    seasonId: string,
    data: {
      name?: string;
      startMonth?: number;
      startDay?: number;
      endMonth?: number;
      endDay?: number;
      isRecurring?: boolean;
      priority?: number;
      overrideFirstTee?: string | null;
      overrideLastTee?: string | null;
      overrideBookingWindow?: number | null;
      overrideTwilightTime?: string | null;
      overrideTimePeriods?: boolean;
      weekdayBookingMode?: BookingMode | null;
      weekendBookingMode?: BookingMode | null;
    },
  ) {
    // Verify season belongs to tenant's course
    const season = await this.prisma.golfScheduleSeason.findFirst({
      where: {
        id: seasonId,
        schedule: { course: { clubId: tenantId } },
      },
    });

    if (!season) {
      throw new NotFoundException('Season not found');
    }

    return this.prisma.golfScheduleSeason.update({
      where: { id: seasonId },
      data,
      include: {
        timePeriods: true,
      },
    });
  }

  /**
   * Delete a season
   */
  async deleteSeason(tenantId: string, seasonId: string): Promise<boolean> {
    // Verify season belongs to tenant's course
    const season = await this.prisma.golfScheduleSeason.findFirst({
      where: {
        id: seasonId,
        schedule: { course: { clubId: tenantId } },
      },
    });

    if (!season) {
      throw new NotFoundException('Season not found');
    }

    await this.prisma.golfScheduleSeason.delete({
      where: { id: seasonId },
    });

    return true;
  }

  /**
   * Create a special day
   */
  async createSpecialDay(
    tenantId: string,
    scheduleId: string,
    data: {
      name: string;
      startDate: string;
      endDate: string;
      isRecurring?: boolean;
      type: SpecialDayType;
      customFirstTee?: string | null;
      customLastTee?: string | null;
      customTimePeriods?: boolean;
      bookingMode?: BookingMode | null;
      notes?: string | null;
    },
  ) {
    // Verify schedule belongs to tenant's course
    const config = await this.prisma.golfScheduleConfig.findFirst({
      where: {
        id: scheduleId,
        course: { clubId: tenantId },
      },
    });

    if (!config) {
      throw new NotFoundException('Schedule config not found');
    }

    return this.prisma.golfScheduleSpecialDay.create({
      data: {
        scheduleId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        isRecurring: data.isRecurring ?? true,
        type: data.type,
        customFirstTee: data.customFirstTee,
        customLastTee: data.customLastTee,
        customTimePeriods: data.customTimePeriods ?? false,
        bookingMode: data.bookingMode,
        notes: data.notes,
      },
      include: {
        timePeriods: true,
      },
    });
  }

  /**
   * Update a special day
   */
  async updateSpecialDay(
    tenantId: string,
    specialDayId: string,
    data: {
      name?: string;
      startDate?: string;
      endDate?: string;
      isRecurring?: boolean;
      type?: SpecialDayType;
      customFirstTee?: string | null;
      customLastTee?: string | null;
      customTimePeriods?: boolean;
      bookingMode?: BookingMode | null;
      notes?: string | null;
    },
  ) {
    // Verify special day belongs to tenant's course
    const specialDay = await this.prisma.golfScheduleSpecialDay.findFirst({
      where: {
        id: specialDayId,
        schedule: { course: { clubId: tenantId } },
      },
    });

    if (!specialDay) {
      throw new NotFoundException('Special day not found');
    }

    return this.prisma.golfScheduleSpecialDay.update({
      where: { id: specialDayId },
      data,
      include: {
        timePeriods: true,
      },
    });
  }

  /**
   * Delete a special day
   */
  async deleteSpecialDay(tenantId: string, specialDayId: string): Promise<boolean> {
    // Verify special day belongs to tenant's course
    const specialDay = await this.prisma.golfScheduleSpecialDay.findFirst({
      where: {
        id: specialDayId,
        schedule: { course: { clubId: tenantId } },
      },
    });

    if (!specialDay) {
      throw new NotFoundException('Special day not found');
    }

    await this.prisma.golfScheduleSpecialDay.delete({
      where: { id: specialDayId },
    });

    return true;
  }
}

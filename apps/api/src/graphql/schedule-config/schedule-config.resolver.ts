import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ScheduleConfigService } from '@/modules/schedule-config/schedule-config.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
  GolfScheduleConfigType,
  GolfTimePeriodType,
  GolfSeasonType,
  GolfSpecialDayType,
  EffectiveScheduleType,
  ScheduleConfigMutationResponse,
  TimePeriodMutationResponse,
  SeasonMutationResponse,
  SpecialDayMutationResponse,
  DeleteMutationResponse,
  TwilightModeGql,
  ApplicableDaysGql,
  SpecialDayTypeGql,
  BookingModeGql,
} from './schedule-config.types';
import {
  GetScheduleConfigArgs,
  GetEffectiveScheduleArgs,
  UpdateScheduleConfigInput,
  CreateTimePeriodInput,
  UpdateTimePeriodInput,
  CreateSeasonInput,
  UpdateSeasonInput,
  CreateSpecialDayInput,
  UpdateSpecialDayInput,
} from './schedule-config.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class ScheduleConfigResolver {
  constructor(private readonly scheduleConfigService: ScheduleConfigService) {}

  // ============================================
  // Queries
  // ============================================

  @Query(() => GolfScheduleConfigType, {
    name: 'getScheduleConfig',
    description: 'Get schedule configuration for a course. Creates default config if autoCreate is true.',
    nullable: true,
  })
  async getScheduleConfig(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: GetScheduleConfigArgs,
    @Args('autoCreate', { type: () => Boolean, nullable: true, defaultValue: false }) autoCreate: boolean,
  ): Promise<GolfScheduleConfigType | null> {
    const config = await this.scheduleConfigService.getScheduleConfig(
      user.tenantId,
      args.courseId,
      autoCreate,
    );

    if (!config) {
      return null;
    }

    return this.transformConfig(config);
  }

  @Query(() => EffectiveScheduleType, {
    name: 'getEffectiveScheduleForDate',
    description: 'Get the effective schedule for a specific date (with season/special day overrides applied)',
  })
  async getEffectiveScheduleForDate(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: GetEffectiveScheduleArgs,
  ): Promise<EffectiveScheduleType> {
    const effective = await this.scheduleConfigService.getEffectiveScheduleForDate(
      user.tenantId,
      args.courseId,
      args.date,
    );

    return {
      courseId: effective.courseId,
      date: effective.date,
      firstTee: effective.firstTee,
      lastTee: effective.lastTee,
      twilightMode: effective.twilightMode as TwilightModeGql,
      twilightTime: effective.twilightTime,
      bookingWindowDays: effective.bookingWindowDays,
      bookingMode: effective.bookingMode as BookingModeGql,
      timePeriods: effective.timePeriods.map((p) => ({
        id: p.id,
        name: p.name,
        startTime: p.startTime,
        endTime: p.endTime ?? undefined,
        intervalMinutes: p.intervalMinutes,
        isPrimeTime: p.isPrimeTime,
        applicableDays: p.applicableDays as ApplicableDaysGql,
        sortOrder: p.sortOrder,
      })),
      activeSeason: effective.activeSeason
        ? {
            id: effective.activeSeason.id,
            name: effective.activeSeason.name,
          }
        : undefined,
      activeSpecialDay: effective.activeSpecialDay
        ? {
            id: effective.activeSpecialDay.id,
            name: effective.activeSpecialDay.name,
            type: effective.activeSpecialDay.type as SpecialDayTypeGql,
          }
        : undefined,
      isClosed: effective.isClosed,
    };
  }

  // ============================================
  // Schedule Config Mutations
  // ============================================

  @Mutation(() => ScheduleConfigMutationResponse, {
    name: 'createDefaultScheduleConfig',
    description: 'Create default schedule configuration for a course',
  })
  async createDefaultScheduleConfig(
    @GqlCurrentUser() user: JwtPayload,
    @Args('courseId', { type: () => ID }) courseId: string,
  ): Promise<ScheduleConfigMutationResponse> {
    try {
      const config = await this.scheduleConfigService.createDefaultConfig(
        user.tenantId,
        courseId,
      );
      return {
        success: true,
        config: this.transformConfig(config),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create schedule config',
      };
    }
  }

  @Mutation(() => ScheduleConfigMutationResponse, {
    name: 'updateScheduleConfig',
    description: 'Update schedule configuration',
  })
  async updateScheduleConfig(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateScheduleConfigInput,
  ): Promise<ScheduleConfigMutationResponse> {
    try {
      const config = await this.scheduleConfigService.updateScheduleConfig(user.tenantId, id, {
        weekdayFirstTee: input.weekdayFirstTee,
        weekdayLastTee: input.weekdayLastTee,
        weekendFirstTee: input.weekendFirstTee,
        weekendLastTee: input.weekendLastTee,
        twilightMode: input.twilightMode as any,
        twilightMinutesBeforeSunset: input.twilightMinutesBeforeSunset,
        twilightFixedDefault: input.twilightFixedDefault,
        clubLatitude: input.clubLatitude,
        clubLongitude: input.clubLongitude,
        defaultBookingWindowDays: input.defaultBookingWindowDays,
      });
      return {
        success: true,
        config: this.transformConfig(config),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update schedule config',
      };
    }
  }

  // ============================================
  // Time Period Mutations
  // ============================================

  @Mutation(() => TimePeriodMutationResponse, {
    name: 'createTimePeriod',
    description: 'Create a time period',
  })
  async createTimePeriod(
    @GqlCurrentUser() user: JwtPayload,
    @Args('scheduleId', { type: () => ID }) scheduleId: string,
    @Args('input') input: CreateTimePeriodInput,
  ): Promise<TimePeriodMutationResponse> {
    try {
      const timePeriod = await this.scheduleConfigService.createTimePeriod(
        user.tenantId,
        scheduleId,
        {
          name: input.name,
          startTime: input.startTime,
          endTime: input.endTime ?? null,
          intervalMinutes: input.intervalMinutes,
          isPrimeTime: input.isPrimeTime,
          applicableDays: input.applicableDays as any,
          sortOrder: input.sortOrder,
        },
      );
      return {
        success: true,
        timePeriod: {
          id: timePeriod.id,
          name: timePeriod.name,
          startTime: timePeriod.startTime,
          endTime: timePeriod.endTime ?? undefined,
          intervalMinutes: timePeriod.intervalMinutes,
          isPrimeTime: timePeriod.isPrimeTime,
          applicableDays: timePeriod.applicableDays as ApplicableDaysGql,
          sortOrder: timePeriod.sortOrder,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create time period',
      };
    }
  }

  @Mutation(() => TimePeriodMutationResponse, {
    name: 'updateTimePeriod',
    description: 'Update a time period',
  })
  async updateTimePeriod(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTimePeriodInput,
  ): Promise<TimePeriodMutationResponse> {
    try {
      const timePeriod = await this.scheduleConfigService.updateTimePeriod(user.tenantId, id, {
        name: input.name,
        startTime: input.startTime,
        endTime: input.endTime,
        intervalMinutes: input.intervalMinutes,
        isPrimeTime: input.isPrimeTime,
        applicableDays: input.applicableDays as any,
        sortOrder: input.sortOrder,
      });
      return {
        success: true,
        timePeriod: {
          id: timePeriod.id,
          name: timePeriod.name,
          startTime: timePeriod.startTime,
          endTime: timePeriod.endTime ?? undefined,
          intervalMinutes: timePeriod.intervalMinutes,
          isPrimeTime: timePeriod.isPrimeTime,
          applicableDays: timePeriod.applicableDays as ApplicableDaysGql,
          sortOrder: timePeriod.sortOrder,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update time period',
      };
    }
  }

  @Mutation(() => DeleteMutationResponse, {
    name: 'deleteTimePeriod',
    description: 'Delete a time period',
  })
  async deleteTimePeriod(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteMutationResponse> {
    try {
      await this.scheduleConfigService.deleteTimePeriod(user.tenantId, id);
      return {
        success: true,
        message: 'Time period deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete time period',
      };
    }
  }

  // ============================================
  // Season Mutations
  // ============================================

  @Mutation(() => SeasonMutationResponse, {
    name: 'createSeason',
    description: 'Create a season',
  })
  async createSeason(
    @GqlCurrentUser() user: JwtPayload,
    @Args('scheduleId', { type: () => ID }) scheduleId: string,
    @Args('input') input: CreateSeasonInput,
  ): Promise<SeasonMutationResponse> {
    try {
      const season = await this.scheduleConfigService.createSeason(user.tenantId, scheduleId, {
        name: input.name,
        startMonth: input.startMonth,
        startDay: input.startDay,
        endMonth: input.endMonth,
        endDay: input.endDay,
        isRecurring: input.isRecurring,
        priority: input.priority,
        overrideFirstTee: input.overrideFirstTee,
        overrideLastTee: input.overrideLastTee,
        overrideBookingWindow: input.overrideBookingWindow,
        overrideTwilightTime: input.overrideTwilightTime,
        overrideTimePeriods: input.overrideTimePeriods,
      });
      return {
        success: true,
        season: this.transformSeason(season),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create season',
      };
    }
  }

  @Mutation(() => SeasonMutationResponse, {
    name: 'updateSeason',
    description: 'Update a season',
  })
  async updateSeason(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSeasonInput,
  ): Promise<SeasonMutationResponse> {
    try {
      const season = await this.scheduleConfigService.updateSeason(user.tenantId, id, {
        name: input.name,
        startMonth: input.startMonth,
        startDay: input.startDay,
        endMonth: input.endMonth,
        endDay: input.endDay,
        isRecurring: input.isRecurring,
        priority: input.priority,
        overrideFirstTee: input.overrideFirstTee,
        overrideLastTee: input.overrideLastTee,
        overrideBookingWindow: input.overrideBookingWindow,
        overrideTwilightTime: input.overrideTwilightTime,
        overrideTimePeriods: input.overrideTimePeriods,
      });
      return {
        success: true,
        season: this.transformSeason(season),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update season',
      };
    }
  }

  @Mutation(() => DeleteMutationResponse, {
    name: 'deleteSeason',
    description: 'Delete a season',
  })
  async deleteSeason(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteMutationResponse> {
    try {
      await this.scheduleConfigService.deleteSeason(user.tenantId, id);
      return {
        success: true,
        message: 'Season deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete season',
      };
    }
  }

  // ============================================
  // Special Day Mutations
  // ============================================

  @Mutation(() => SpecialDayMutationResponse, {
    name: 'createSpecialDay',
    description: 'Create a special day',
  })
  async createSpecialDay(
    @GqlCurrentUser() user: JwtPayload,
    @Args('scheduleId', { type: () => ID }) scheduleId: string,
    @Args('input') input: CreateSpecialDayInput,
  ): Promise<SpecialDayMutationResponse> {
    try {
      const specialDay = await this.scheduleConfigService.createSpecialDay(
        user.tenantId,
        scheduleId,
        {
          name: input.name,
          startDate: input.startDate,
          endDate: input.endDate,
          isRecurring: input.isRecurring,
          type: input.type as any,
          customFirstTee: input.customFirstTee,
          customLastTee: input.customLastTee,
          customTimePeriods: input.customTimePeriods,
          notes: input.notes,
        },
      );
      return {
        success: true,
        specialDay: this.transformSpecialDay(specialDay),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create special day',
      };
    }
  }

  @Mutation(() => SpecialDayMutationResponse, {
    name: 'updateSpecialDay',
    description: 'Update a special day',
  })
  async updateSpecialDay(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSpecialDayInput,
  ): Promise<SpecialDayMutationResponse> {
    try {
      const specialDay = await this.scheduleConfigService.updateSpecialDay(user.tenantId, id, {
        name: input.name,
        startDate: input.startDate,
        endDate: input.endDate,
        isRecurring: input.isRecurring,
        type: input.type as any,
        customFirstTee: input.customFirstTee,
        customLastTee: input.customLastTee,
        customTimePeriods: input.customTimePeriods,
        notes: input.notes,
      });
      return {
        success: true,
        specialDay: this.transformSpecialDay(specialDay),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update special day',
      };
    }
  }

  @Mutation(() => DeleteMutationResponse, {
    name: 'deleteSpecialDay',
    description: 'Delete a special day',
  })
  async deleteSpecialDay(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteMutationResponse> {
    try {
      await this.scheduleConfigService.deleteSpecialDay(user.tenantId, id);
      return {
        success: true,
        message: 'Special day deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete special day',
      };
    }
  }

  // ============================================
  // Transform helpers
  // ============================================

  private transformConfig(config: any): GolfScheduleConfigType {
    return {
      id: config.id,
      courseId: config.courseId,
      weekdayFirstTee: config.weekdayFirstTee,
      weekdayLastTee: config.weekdayLastTee,
      weekdayBookingMode: config.weekdayBookingMode as BookingModeGql,
      weekendFirstTee: config.weekendFirstTee,
      weekendLastTee: config.weekendLastTee,
      weekendBookingMode: config.weekendBookingMode as BookingModeGql,
      twilightMode: config.twilightMode as TwilightModeGql,
      twilightMinutesBeforeSunset: config.twilightMinutesBeforeSunset,
      twilightFixedDefault: config.twilightFixedDefault,
      clubLatitude: config.clubLatitude,
      clubLongitude: config.clubLongitude,
      defaultBookingWindowDays: config.defaultBookingWindowDays,
      timePeriods: config.timePeriods.map((p: any) => ({
        id: p.id,
        name: p.name,
        startTime: p.startTime,
        endTime: p.endTime ?? undefined,
        intervalMinutes: p.intervalMinutes,
        isPrimeTime: p.isPrimeTime,
        applicableDays: p.applicableDays as ApplicableDaysGql,
        sortOrder: p.sortOrder,
      })),
      seasons: config.seasons.map((s: any) => this.transformSeason(s)),
      specialDays: config.specialDays.map((d: any) => this.transformSpecialDay(d)),
    };
  }

  private transformSeason(season: any): GolfSeasonType {
    return {
      id: season.id,
      name: season.name,
      startMonth: season.startMonth,
      startDay: season.startDay,
      endMonth: season.endMonth,
      endDay: season.endDay,
      isRecurring: season.isRecurring,
      priority: season.priority,
      overrideFirstTee: season.overrideFirstTee ?? undefined,
      overrideLastTee: season.overrideLastTee ?? undefined,
      overrideBookingWindow: season.overrideBookingWindow ?? undefined,
      overrideTwilightTime: season.overrideTwilightTime ?? undefined,
      overrideTimePeriods: season.overrideTimePeriods,
      weekdayBookingMode: season.weekdayBookingMode ? (season.weekdayBookingMode as BookingModeGql) : undefined,
      weekendBookingMode: season.weekendBookingMode ? (season.weekendBookingMode as BookingModeGql) : undefined,
      timePeriods: (season.timePeriods || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        startTime: p.startTime,
        endTime: p.endTime ?? undefined,
        intervalMinutes: p.intervalMinutes,
        isPrimeTime: p.isPrimeTime,
        applicableDays: p.applicableDays as ApplicableDaysGql,
        sortOrder: p.sortOrder,
      })),
    };
  }

  private transformSpecialDay(specialDay: any): GolfSpecialDayType {
    return {
      id: specialDay.id,
      name: specialDay.name,
      startDate: specialDay.startDate,
      endDate: specialDay.endDate,
      isRecurring: specialDay.isRecurring,
      type: specialDay.type as SpecialDayTypeGql,
      customFirstTee: specialDay.customFirstTee ?? undefined,
      customLastTee: specialDay.customLastTee ?? undefined,
      customTimePeriods: specialDay.customTimePeriods,
      bookingMode: specialDay.bookingMode ? (specialDay.bookingMode as BookingModeGql) : undefined,
      notes: specialDay.notes ?? undefined,
      timePeriods: (specialDay.timePeriods || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        startTime: p.startTime,
        endTime: p.endTime ?? undefined,
        intervalMinutes: p.intervalMinutes,
        isPrimeTime: p.isPrimeTime,
        applicableDays: p.applicableDays as ApplicableDaysGql,
        sortOrder: p.sortOrder,
      })),
    };
  }
}

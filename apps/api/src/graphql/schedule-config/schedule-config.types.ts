import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';

// Register enums
export enum TwilightModeGql {
  FIXED = 'FIXED',
  SUNSET = 'SUNSET',
}

export enum ApplicableDaysGql {
  WEEKDAY = 'WEEKDAY',
  WEEKEND = 'WEEKEND',
  ALL = 'ALL',
}

export enum SpecialDayTypeGql {
  WEEKEND = 'WEEKEND',
  HOLIDAY = 'HOLIDAY',
  CLOSED = 'CLOSED',
  CUSTOM = 'CUSTOM',
}

export enum BookingModeGql {
  EIGHTEEN = 'EIGHTEEN', // Tee sheet: Single column (Hole 1 start only)
  CROSS = 'CROSS',       // Tee sheet: Dual columns (Hole 1 + Hole 10 starts)
}

registerEnumType(TwilightModeGql, {
  name: 'TwilightMode',
  description: 'Twilight calculation mode',
});

registerEnumType(ApplicableDaysGql, {
  name: 'ApplicableDays',
  description: 'Days to which a configuration applies',
});

registerEnumType(SpecialDayTypeGql, {
  name: 'SpecialDayType',
  description: 'Type of special day',
});

registerEnumType(BookingModeGql, {
  name: 'BookingMode',
  description: 'Tee sheet display mode - EIGHTEEN (single column) or CROSS (dual columns)',
});

@ObjectType()
export class GolfTimePeriodType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  startTime: string;

  @Field({ nullable: true })
  endTime?: string;

  @Field(() => Int)
  intervalMinutes: number;

  @Field()
  isPrimeTime: boolean;

  @Field(() => ApplicableDaysGql)
  applicableDays: ApplicableDaysGql;

  @Field(() => Int)
  sortOrder: number;
}

@ObjectType()
export class GolfSeasonType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  startMonth: number;

  @Field(() => Int)
  startDay: number;

  @Field(() => Int)
  endMonth: number;

  @Field(() => Int)
  endDay: number;

  @Field()
  isRecurring: boolean;

  @Field(() => Int)
  priority: number;

  @Field({ nullable: true })
  overrideFirstTee?: string;

  @Field({ nullable: true })
  overrideLastTee?: string;

  @Field(() => Int, { nullable: true })
  overrideBookingWindow?: number;

  @Field({ nullable: true })
  overrideTwilightTime?: string;

  @Field()
  overrideTimePeriods: boolean;

  @Field(() => BookingModeGql, { nullable: true })
  weekdayBookingMode?: BookingModeGql;

  @Field(() => BookingModeGql, { nullable: true })
  weekendBookingMode?: BookingModeGql;

  @Field(() => [GolfTimePeriodType])
  timePeriods: GolfTimePeriodType[];
}

@ObjectType()
export class GolfSpecialDayType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  startDate: string;

  @Field()
  endDate: string;

  @Field()
  isRecurring: boolean;

  @Field(() => SpecialDayTypeGql)
  type: SpecialDayTypeGql;

  @Field({ nullable: true })
  customFirstTee?: string;

  @Field({ nullable: true })
  customLastTee?: string;

  @Field()
  customTimePeriods: boolean;

  @Field(() => BookingModeGql, { nullable: true })
  bookingMode?: BookingModeGql;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [GolfTimePeriodType])
  timePeriods: GolfTimePeriodType[];
}

@ObjectType()
export class GolfScheduleConfigType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  courseId: string;

  @Field()
  weekdayFirstTee: string;

  @Field()
  weekdayLastTee: string;

  @Field(() => BookingModeGql)
  weekdayBookingMode: BookingModeGql;

  @Field()
  weekendFirstTee: string;

  @Field()
  weekendLastTee: string;

  @Field(() => BookingModeGql)
  weekendBookingMode: BookingModeGql;

  @Field(() => TwilightModeGql)
  twilightMode: TwilightModeGql;

  @Field(() => Int)
  twilightMinutesBeforeSunset: number;

  @Field()
  twilightFixedDefault: string;

  @Field({ nullable: true })
  clubLatitude?: number;

  @Field({ nullable: true })
  clubLongitude?: number;

  @Field(() => Int)
  defaultBookingWindowDays: number;

  @Field(() => [GolfTimePeriodType])
  timePeriods: GolfTimePeriodType[];

  @Field(() => [GolfSeasonType])
  seasons: GolfSeasonType[];

  @Field(() => [GolfSpecialDayType])
  specialDays: GolfSpecialDayType[];
}

@ObjectType()
export class ActiveSeasonInfo {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}

@ObjectType()
export class ActiveSpecialDayInfo {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => SpecialDayTypeGql)
  type: SpecialDayTypeGql;
}

@ObjectType()
export class EffectiveScheduleType {
  @Field(() => ID)
  courseId: string;

  @Field()
  date: string;

  @Field()
  firstTee: string;

  @Field()
  lastTee: string;

  @Field(() => TwilightModeGql)
  twilightMode: TwilightModeGql;

  @Field()
  twilightTime: string;

  @Field(() => Int)
  bookingWindowDays: number;

  @Field(() => BookingModeGql)
  bookingMode: BookingModeGql;

  @Field(() => [GolfTimePeriodType])
  timePeriods: GolfTimePeriodType[];

  @Field(() => ActiveSeasonInfo, { nullable: true })
  activeSeason?: ActiveSeasonInfo;

  @Field(() => ActiveSpecialDayInfo, { nullable: true })
  activeSpecialDay?: ActiveSpecialDayInfo;

  @Field()
  isClosed: boolean;
}

// Mutation response types
@ObjectType()
export class ScheduleConfigMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => GolfScheduleConfigType, { nullable: true })
  config?: GolfScheduleConfigType;
}

@ObjectType()
export class TimePeriodMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => GolfTimePeriodType, { nullable: true })
  timePeriod?: GolfTimePeriodType;
}

@ObjectType()
export class SeasonMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => GolfSeasonType, { nullable: true })
  season?: GolfSeasonType;
}

@ObjectType()
export class SpecialDayMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => GolfSpecialDayType, { nullable: true })
  specialDay?: GolfSpecialDayType;
}

@ObjectType()
export class DeleteMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}

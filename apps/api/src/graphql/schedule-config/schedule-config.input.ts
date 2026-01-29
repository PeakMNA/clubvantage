import { InputType, Field, ID, Int, ArgsType } from '@nestjs/graphql';
import { TwilightModeGql, ApplicableDaysGql, SpecialDayTypeGql, BookingModeGql } from './schedule-config.types';

@ArgsType()
export class GetScheduleConfigArgs {
  @Field(() => ID)
  courseId: string;
}

@ArgsType()
export class GetEffectiveScheduleArgs {
  @Field(() => ID)
  courseId: string;

  @Field()
  date: Date;
}

@InputType()
export class UpdateScheduleConfigInput {
  @Field({ nullable: true })
  weekdayFirstTee?: string;

  @Field({ nullable: true })
  weekdayLastTee?: string;

  @Field(() => BookingModeGql, { nullable: true })
  weekdayBookingMode?: BookingModeGql;

  @Field({ nullable: true })
  weekendFirstTee?: string;

  @Field({ nullable: true })
  weekendLastTee?: string;

  @Field(() => BookingModeGql, { nullable: true })
  weekendBookingMode?: BookingModeGql;

  @Field(() => TwilightModeGql, { nullable: true })
  twilightMode?: TwilightModeGql;

  @Field(() => Int, { nullable: true })
  twilightMinutesBeforeSunset?: number;

  @Field({ nullable: true })
  twilightFixedDefault?: string;

  @Field({ nullable: true })
  clubLatitude?: number;

  @Field({ nullable: true })
  clubLongitude?: number;

  @Field(() => Int, { nullable: true })
  defaultBookingWindowDays?: number;
}

@InputType()
export class CreateTimePeriodInput {
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

  @Field(() => Int, { nullable: true })
  sortOrder?: number;
}

@InputType()
export class UpdateTimePeriodInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  startTime?: string;

  @Field({ nullable: true })
  endTime?: string;

  @Field(() => Int, { nullable: true })
  intervalMinutes?: number;

  @Field({ nullable: true })
  isPrimeTime?: boolean;

  @Field(() => ApplicableDaysGql, { nullable: true })
  applicableDays?: ApplicableDaysGql;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;
}

@InputType()
export class CreateSeasonInput {
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

  @Field({ nullable: true, defaultValue: true })
  isRecurring?: boolean;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  priority?: number;

  @Field({ nullable: true })
  overrideFirstTee?: string;

  @Field({ nullable: true })
  overrideLastTee?: string;

  @Field(() => Int, { nullable: true })
  overrideBookingWindow?: number;

  @Field({ nullable: true })
  overrideTwilightTime?: string;

  @Field({ nullable: true, defaultValue: false })
  overrideTimePeriods?: boolean;

  @Field(() => BookingModeGql, { nullable: true })
  weekdayBookingMode?: BookingModeGql;

  @Field(() => BookingModeGql, { nullable: true })
  weekendBookingMode?: BookingModeGql;
}

@InputType()
export class UpdateSeasonInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  startMonth?: number;

  @Field(() => Int, { nullable: true })
  startDay?: number;

  @Field(() => Int, { nullable: true })
  endMonth?: number;

  @Field(() => Int, { nullable: true })
  endDay?: number;

  @Field({ nullable: true })
  isRecurring?: boolean;

  @Field(() => Int, { nullable: true })
  priority?: number;

  @Field({ nullable: true })
  overrideFirstTee?: string;

  @Field({ nullable: true })
  overrideLastTee?: string;

  @Field(() => Int, { nullable: true })
  overrideBookingWindow?: number;

  @Field({ nullable: true })
  overrideTwilightTime?: string;

  @Field({ nullable: true })
  overrideTimePeriods?: boolean;

  @Field(() => BookingModeGql, { nullable: true })
  weekdayBookingMode?: BookingModeGql;

  @Field(() => BookingModeGql, { nullable: true })
  weekendBookingMode?: BookingModeGql;
}

@InputType()
export class CreateSpecialDayInput {
  @Field()
  name: string;

  @Field()
  startDate: string;

  @Field()
  endDate: string;

  @Field({ nullable: true, defaultValue: true })
  isRecurring?: boolean;

  @Field(() => SpecialDayTypeGql)
  type: SpecialDayTypeGql;

  @Field({ nullable: true })
  customFirstTee?: string;

  @Field({ nullable: true })
  customLastTee?: string;

  @Field({ nullable: true, defaultValue: false })
  customTimePeriods?: boolean;

  @Field(() => BookingModeGql, { nullable: true })
  bookingMode?: BookingModeGql;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class UpdateSpecialDayInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  startDate?: string;

  @Field({ nullable: true })
  endDate?: string;

  @Field({ nullable: true })
  isRecurring?: boolean;

  @Field(() => SpecialDayTypeGql, { nullable: true })
  type?: SpecialDayTypeGql;

  @Field({ nullable: true })
  customFirstTee?: string;

  @Field({ nullable: true })
  customLastTee?: string;

  @Field({ nullable: true })
  customTimePeriods?: boolean;

  @Field(() => BookingModeGql, { nullable: true })
  bookingMode?: BookingModeGql;

  @Field({ nullable: true })
  notes?: string;
}

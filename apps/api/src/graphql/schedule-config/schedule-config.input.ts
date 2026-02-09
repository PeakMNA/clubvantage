import { InputType, Field, ID, Int, ArgsType } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsDate,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TwilightModeGql, ApplicableDaysGql, SpecialDayTypeGql, BookingModeGql } from './schedule-config.types';

@ArgsType()
export class GetScheduleConfigArgs {
  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  autoCreate?: boolean;
}

@ArgsType()
export class GetEffectiveScheduleArgs {
  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field()
  @IsDate()
  @Type(() => Date)
  date: Date;
}

@InputType()
export class UpdateScheduleConfigInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  weekdayFirstTee?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  weekdayLastTee?: string;

  @Field(() => BookingModeGql, { nullable: true })
  @IsOptional()
  @IsEnum(BookingModeGql)
  weekdayBookingMode?: BookingModeGql;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  weekendFirstTee?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  weekendLastTee?: string;

  @Field(() => BookingModeGql, { nullable: true })
  @IsOptional()
  @IsEnum(BookingModeGql)
  weekendBookingMode?: BookingModeGql;

  @Field(() => TwilightModeGql, { nullable: true })
  @IsOptional()
  @IsEnum(TwilightModeGql)
  twilightMode?: TwilightModeGql;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(180)
  twilightMinutesBeforeSunset?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  twilightFixedDefault?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  clubLatitude?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  clubLongitude?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  defaultBookingWindowDays?: number;
}

@InputType()
export class CreateTimePeriodInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  startTime: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  endTime?: string;

  @Field(() => Int)
  @IsInt()
  @Min(5)
  @Max(60)
  intervalMinutes: number;

  @Field()
  @IsBoolean()
  isPrimeTime: boolean;

  @Field(() => ApplicableDaysGql)
  @IsEnum(ApplicableDaysGql)
  applicableDays: ApplicableDaysGql;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

@InputType()
export class UpdateTimePeriodInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  startTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  endTime?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(60)
  intervalMinutes?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPrimeTime?: boolean;

  @Field(() => ApplicableDaysGql, { nullable: true })
  @IsOptional()
  @IsEnum(ApplicableDaysGql)
  applicableDays?: ApplicableDaysGql;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

@InputType()
export class CreateSeasonInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(12)
  startMonth: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(31)
  startDay: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(12)
  endMonth: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(31)
  endDay: number;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  overrideFirstTee?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  overrideLastTee?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  overrideBookingWindow?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  overrideTwilightTime?: string;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  overrideTimePeriods?: boolean;

  @Field(() => BookingModeGql, { nullable: true })
  @IsOptional()
  @IsEnum(BookingModeGql)
  weekdayBookingMode?: BookingModeGql;

  @Field(() => BookingModeGql, { nullable: true })
  @IsOptional()
  @IsEnum(BookingModeGql)
  weekendBookingMode?: BookingModeGql;
}

@InputType()
export class UpdateSeasonInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  startMonth?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  startDay?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  endMonth?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  endDay?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  overrideFirstTee?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  overrideLastTee?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  overrideBookingWindow?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  overrideTwilightTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  overrideTimePeriods?: boolean;

  @Field(() => BookingModeGql, { nullable: true })
  @IsOptional()
  @IsEnum(BookingModeGql)
  weekdayBookingMode?: BookingModeGql;

  @Field(() => BookingModeGql, { nullable: true })
  @IsOptional()
  @IsEnum(BookingModeGql)
  weekendBookingMode?: BookingModeGql;
}

@InputType()
export class CreateSpecialDayInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  startDate: string;

  @Field()
  @IsString()
  endDate: string;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @Field(() => SpecialDayTypeGql)
  @IsEnum(SpecialDayTypeGql)
  type: SpecialDayTypeGql;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customFirstTee?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customLastTee?: string;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  customTimePeriods?: boolean;

  @Field(() => BookingModeGql, { nullable: true })
  @IsOptional()
  @IsEnum(BookingModeGql)
  bookingMode?: BookingModeGql;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateSpecialDayInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  endDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @Field(() => SpecialDayTypeGql, { nullable: true })
  @IsOptional()
  @IsEnum(SpecialDayTypeGql)
  type?: SpecialDayTypeGql;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customFirstTee?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customLastTee?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  customTimePeriods?: boolean;

  @Field(() => BookingModeGql, { nullable: true })
  @IsOptional()
  @IsEnum(BookingModeGql)
  bookingMode?: BookingModeGql;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

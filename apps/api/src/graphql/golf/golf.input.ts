import { InputType, Field, ID, ArgsType, Int } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsEmail,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TeeTimeStatus, CartType, PlayerType, PlayFormat, DayType, BlockType } from './golf.types';

@InputType()
export class TeeTimePlayerInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(4)
  position: number;

  @Field(() => PlayerType)
  @IsEnum(PlayerType)
  playerType: PlayerType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guestName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guestPhone?: string;

  @Field(() => CartType, { nullable: true, defaultValue: CartType.WALKING })
  @IsOptional()
  @IsEnum(CartType)
  cartType?: CartType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  sharedWithPosition?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  caddyId?: string;
}

@InputType()
export class CreateTeeTimeInput {
  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field()
  teeDate: Date;

  @Field()
  @IsString()
  teeTime: string;

  @Field(() => Int, { nullable: true, defaultValue: 18 })
  @IsOptional()
  @IsInt()
  @Min(9)
  @Max(18)
  holes?: number;

  @Field(() => [TeeTimePlayerInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeeTimePlayerInput)
  players: TeeTimePlayerInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateTeeTimeInput {
  @Field(() => [TeeTimePlayerInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeeTimePlayerInput)
  players?: TeeTimePlayerInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => TeeTimeStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TeeTimeStatus)
  status?: TeeTimeStatus;
}

@InputType()
export class MoveTeeTimeInput {
  @Field()
  newTeeDate: Date;

  @Field()
  @IsString()
  newTeeTime: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  newCourseId?: string;
}

@ArgsType()
export class TeeSheetArgs {
  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field()
  date: Date;
}

@ArgsType()
export class TeeTimesQueryArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @Field({ nullable: true })
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  endDate?: Date;

  @Field(() => TeeTimeStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TeeTimeStatus)
  status?: TeeTimeStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  first?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;
}

// ============================================================================
// COURSE SCHEDULE INPUTS (US-10)
// ============================================================================

@InputType()
export class CourseIntervalInput {
  @Field(() => DayType)
  @IsEnum(DayType)
  dayType: DayType;

  @Field()
  @IsString()
  timeStart: string;

  @Field()
  @IsString()
  timeEnd: string;

  @Field(() => Int, { defaultValue: 8 })
  @IsInt()
  @Min(5)
  @Max(15)
  intervalMin: number;

  @Field({ defaultValue: false })
  @IsBoolean()
  isPrimeTime: boolean;
}

@InputType()
export class CreateScheduleInput {
  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field()
  @IsString()
  seasonName: string;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field()
  @IsString()
  firstTeeTime: string;

  @Field()
  @IsString()
  lastTeeTime: string;

  @Field(() => PlayFormat, { defaultValue: PlayFormat.EIGHTEEN_HOLE })
  @IsEnum(PlayFormat)
  playFormat: PlayFormat;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(180)
  @Max(360)
  paceOfPlay?: number;

  @Field(() => [CourseIntervalInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseIntervalInput)
  intervals?: CourseIntervalInput[];
}

@InputType()
export class UpdateScheduleInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  seasonName?: string;

  @Field({ nullable: true })
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  endDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstTeeTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastTeeTime?: string;

  @Field(() => PlayFormat, { nullable: true })
  @IsOptional()
  @IsEnum(PlayFormat)
  playFormat?: PlayFormat;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  paceOfPlay?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================================================
// TEE TIME BLOCK INPUTS (US-2)
// ============================================================================

@InputType()
export class CreateBlockInput {
  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;

  @Field(() => BlockType)
  @IsEnum(BlockType)
  blockType: BlockType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  isRecurring: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  recurringPattern?: string;
}

@InputType()
export class UpdateBlockInput {
  @Field({ nullable: true })
  @IsOptional()
  startTime?: Date;

  @Field({ nullable: true })
  @IsOptional()
  endTime?: Date;

  @Field(() => BlockType, { nullable: true })
  @IsOptional()
  @IsEnum(BlockType)
  blockType?: BlockType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  recurringPattern?: string;
}

@ArgsType()
export class BlocksQueryArgs {
  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field({ nullable: true })
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  endDate?: Date;

  @Field(() => BlockType, { nullable: true })
  @IsOptional()
  @IsEnum(BlockType)
  blockType?: BlockType;
}

// ============================================================================
// GROUP/TOURNAMENT BOOKING INPUTS (US-7)
// ============================================================================

import { StartFormat, GroupBookingStatus, LotteryType, LotteryStatus } from './golf.types';

@InputType()
export class GroupPlayerInput {
  @Field(() => PlayerType)
  @IsEnum(PlayerType)
  playerType: PlayerType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guestName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guestPhone?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(54)
  handicap?: number;
}

@InputType()
export class CreateGroupBookingInput {
  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field()
  @IsString()
  groupName: string;

  @Field()
  eventDate: Date;

  @Field()
  @IsString()
  startTime: string;

  @Field(() => StartFormat, { defaultValue: StartFormat.SEQUENTIAL })
  @IsEnum(StartFormat)
  startFormat: StartFormat;

  @Field(() => [GroupPlayerInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupPlayerInput)
  players?: GroupPlayerInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateGroupBookingInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  groupName?: string;

  @Field({ nullable: true })
  @IsOptional()
  eventDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  startTime?: string;

  @Field(() => StartFormat, { nullable: true })
  @IsOptional()
  @IsEnum(StartFormat)
  startFormat?: StartFormat;

  @Field(() => GroupBookingStatus, { nullable: true })
  @IsOptional()
  @IsEnum(GroupBookingStatus)
  status?: GroupBookingStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class AddGroupPlayersInput {
  @Field(() => [GroupPlayerInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupPlayerInput)
  players: GroupPlayerInput[];
}

@InputType()
export class CSVPlayerRow {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  handicap?: number;
}

@InputType()
export class ImportPlayersFromCSVInput {
  @Field(() => [CSVPlayerRow])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CSVPlayerRow)
  rows: CSVPlayerRow[];
}

@ArgsType()
export class GroupBookingsQueryArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @Field({ nullable: true })
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  endDate?: Date;

  @Field(() => GroupBookingStatus, { nullable: true })
  @IsOptional()
  @IsEnum(GroupBookingStatus)
  status?: GroupBookingStatus;
}

// ============================================================================
// LOTTERY SYSTEM INPUTS (US-8)
// ============================================================================

@InputType()
export class CreateLotteryInput {
  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field()
  lotteryDate: Date;

  @Field(() => LotteryType, { defaultValue: LotteryType.PRIME_TIME })
  @IsEnum(LotteryType)
  lotteryType: LotteryType;

  @Field()
  requestWindowStart: Date;

  @Field()
  requestWindowEnd: Date;

  @Field()
  drawTime: Date;

  @Field()
  @IsString()
  timeRangeStart: string;

  @Field()
  @IsString()
  timeRangeEnd: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  @Max(3)
  maxRequestsPerMember: number;
}

@InputType()
export class UpdateLotteryInput {
  @Field({ nullable: true })
  @IsOptional()
  lotteryDate?: Date;

  @Field(() => LotteryType, { nullable: true })
  @IsOptional()
  @IsEnum(LotteryType)
  lotteryType?: LotteryType;

  @Field({ nullable: true })
  @IsOptional()
  requestWindowStart?: Date;

  @Field({ nullable: true })
  @IsOptional()
  requestWindowEnd?: Date;

  @Field({ nullable: true })
  @IsOptional()
  drawTime?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timeRangeStart?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timeRangeEnd?: string;

  @Field(() => LotteryStatus, { nullable: true })
  @IsOptional()
  @IsEnum(LotteryStatus)
  status?: LotteryStatus;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  maxRequestsPerMember?: number;
}

@InputType()
export class CreateLotteryRequestInput {
  @Field(() => ID)
  @IsUUID()
  lotteryId: string;

  @Field()
  @IsString()
  preference1: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  preference2?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  preference3?: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  @Max(4)
  playerCount: number;
}

@ArgsType()
export class LotteriesQueryArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @Field({ nullable: true })
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  endDate?: Date;

  @Field(() => LotteryStatus, { nullable: true })
  @IsOptional()
  @IsEnum(LotteryStatus)
  status?: LotteryStatus;
}

// ============================================================================
// WAITLIST INPUTS (US-9)
// ============================================================================

import { GolfWaitlistStatus } from './golf.types';

@InputType()
export class CreateWaitlistEntryInput {
  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field()
  requestedDate: Date;

  @Field()
  @IsString()
  timeRangeStart: string;

  @Field()
  @IsString()
  timeRangeEnd: string;

  @Field()
  @IsString()
  requesterName: string;

  @Field()
  @IsString()
  requesterPhone: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  requesterEmail?: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  @Max(4)
  playerCount: number;
}

@InputType()
export class UpdateWaitlistEntryInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timeRangeStart?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timeRangeEnd?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  requesterName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  requesterPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  requesterEmail?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  playerCount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  priority?: number;

  @Field(() => GolfWaitlistStatus, { nullable: true })
  @IsOptional()
  @IsEnum(GolfWaitlistStatus)
  status?: GolfWaitlistStatus;
}

@ArgsType()
export class WaitlistQueryArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @Field({ nullable: true })
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  endDate?: Date;

  @Field(() => GolfWaitlistStatus, { nullable: true })
  @IsOptional()
  @IsEnum(GolfWaitlistStatus)
  status?: GolfWaitlistStatus;
}


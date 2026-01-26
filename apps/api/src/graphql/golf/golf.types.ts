import { ObjectType, Field, ID, registerEnumType, Int } from '@nestjs/graphql';
import { Paginated } from '../common/pagination';
import {
  BookingStatus,
  CartType,
  PlayerType,
} from '@/modules/golf/golf.service';

// Re-export enums for GraphQL usage
export { BookingStatus as TeeTimeStatus, CartType, PlayerType };

registerEnumType(BookingStatus, {
  name: 'TeeTimeStatus',
  description: 'Tee time booking status',
});

registerEnumType(CartType, {
  name: 'CartType',
  description: 'Golf cart type',
});

registerEnumType(PlayerType, {
  name: 'PlayerType',
  description: 'Type of player in a tee time',
});

@ObjectType()
export class GolfCourseType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  code: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  holes: number;

  @Field(() => Int)
  par: number;

  @Field({ nullable: true })
  slope?: number;

  @Field({ nullable: true })
  rating?: number;

  @Field()
  firstTeeTime: string;

  @Field()
  lastTeeTime: string;

  @Field(() => Int)
  teeInterval: number;

  @Field()
  isActive: boolean;
}

@ObjectType()
export class CaddyType {
  @Field(() => ID)
  id: string;

  @Field()
  caddyNumber: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  isActive: boolean;
}

@ObjectType()
export class PlayerMemberType {
  @Field(() => ID)
  id: string;

  @Field()
  memberId: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;
}

@ObjectType()
export class TeeTimePlayerType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  position: number;

  @Field(() => PlayerType)
  playerType: PlayerType;

  @Field(() => PlayerMemberType, { nullable: true })
  member?: PlayerMemberType;

  @Field({ nullable: true })
  guestName?: string;

  @Field({ nullable: true })
  guestEmail?: string;

  @Field({ nullable: true })
  guestPhone?: string;

  @Field(() => CartType)
  cartType: CartType;

  @Field(() => Int, { nullable: true })
  sharedWithPosition?: number;

  @Field(() => CaddyType, { nullable: true })
  caddy?: CaddyType;

  @Field({ nullable: true })
  checkedInAt?: Date;
}

@ObjectType()
export class TeeTimeType {
  @Field(() => ID)
  id: string;

  @Field()
  teeTimeNumber: string;

  @Field()
  teeDate: Date;

  @Field()
  teeTime: string;

  @Field(() => Int)
  holes: number;

  @Field(() => BookingStatus)
  status: BookingStatus;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => GolfCourseType, { nullable: true })
  course?: GolfCourseType;

  @Field(() => [TeeTimePlayerType])
  players: TeeTimePlayerType[];
}

@ObjectType()
export class TeeTimeConnection extends Paginated(TeeTimeType) {}

@ObjectType()
export class TeeSheetBlockInfoType {
  @Field(() => ID)
  id: string;

  @Field()
  blockType: string;

  @Field({ nullable: true })
  reason?: string;
}

@ObjectType()
export class TeeSheetSlotType {
  @Field()
  time: string;

  @Field(() => ID)
  courseId: string;

  @Field()
  date: string;

  @Field()
  available: boolean;

  @Field()
  blocked: boolean;

  @Field(() => TeeSheetBlockInfoType, { nullable: true })
  blockInfo?: TeeSheetBlockInfoType;

  @Field()
  isPrimeTime: boolean;

  @Field(() => TeeTimeType, { nullable: true })
  booking?: TeeTimeType;
}

@ObjectType()
export class FlightCheckInResponseType {
  @Field()
  success: boolean;

  @Field()
  checkedInAt: Date;

  @Field(() => TeeTimeType)
  teeTime: TeeTimeType;
}

@ObjectType()
export class CancelResponseType {
  @Field()
  message: string;
}

// ============================================================================
// COURSE CONFIGURATION TYPES (US-10)
// ============================================================================

export enum PlayFormat {
  EIGHTEEN_HOLE = 'EIGHTEEN_HOLE',
  CROSS_TEE = 'CROSS_TEE',
}

export enum DayType {
  WEEKDAY = 'WEEKDAY',
  WEEKEND = 'WEEKEND',
  HOLIDAY = 'HOLIDAY',
}

export enum BlockType {
  MAINTENANCE = 'MAINTENANCE',
  TOURNAMENT = 'TOURNAMENT',
  WEATHER = 'WEATHER',
  PRIVATE = 'PRIVATE',
  STARTER = 'STARTER',
}

registerEnumType(PlayFormat, {
  name: 'PlayFormat',
  description: 'Golf play format (18 holes or cross-tee)',
});

registerEnumType(DayType, {
  name: 'DayType',
  description: 'Day type for scheduling',
});

registerEnumType(BlockType, {
  name: 'BlockType',
  description: 'Type of tee time block',
});

@ObjectType()
export class GolfCourseIntervalType {
  @Field(() => ID)
  id: string;

  @Field(() => DayType)
  dayType: DayType;

  @Field()
  timeStart: string;

  @Field()
  timeEnd: string;

  @Field(() => Int)
  intervalMin: number;

  @Field()
  isPrimeTime: boolean;
}

@ObjectType()
export class GolfCourseScheduleType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  courseId: string;

  @Field()
  seasonName: string;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field()
  firstTeeTime: string;

  @Field()
  lastTeeTime: string;

  @Field(() => PlayFormat)
  playFormat: PlayFormat;

  @Field(() => Int, { nullable: true })
  paceOfPlay?: number;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [GolfCourseIntervalType], { nullable: true })
  intervals?: GolfCourseIntervalType[];
}

@ObjectType()
export class GolfCourseHolidayType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  date: Date;

  @Field()
  isRecurring: boolean;
}

// ============================================================================
// TEE TIME BLOCK TYPES (US-2)
// ============================================================================

@ObjectType()
export class TeeTimeBlockType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  courseId: string;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;

  @Field(() => BlockType)
  blockType: BlockType;

  @Field({ nullable: true })
  reason?: string;

  @Field()
  isRecurring: boolean;

  @Field({ nullable: true })
  recurringPattern?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => GolfCourseType, { nullable: true })
  course?: GolfCourseType;
}

@ObjectType()
export class ScheduleMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => GolfCourseScheduleType, { nullable: true })
  schedule?: GolfCourseScheduleType;
}

@ObjectType()
export class BlockMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => TeeTimeBlockType, { nullable: true })
  block?: TeeTimeBlockType;
}

// ============================================================================
// GROUP/TOURNAMENT BOOKING TYPES (US-7)
// ============================================================================

export enum StartFormat {
  SEQUENTIAL = 'SEQUENTIAL',
  SHOTGUN = 'SHOTGUN',
}

export enum GroupBookingStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(StartFormat, {
  name: 'StartFormat',
  description: 'Tournament start format',
});

registerEnumType(GroupBookingStatus, {
  name: 'GroupBookingStatus',
  description: 'Group booking status',
});

@ObjectType()
export class GolfGroupPlayerType {
  @Field(() => ID)
  id: string;

  @Field(() => PlayerType)
  playerType: PlayerType;

  @Field(() => ID, { nullable: true })
  memberId?: string;

  @Field({ nullable: true })
  guestName?: string;

  @Field({ nullable: true })
  guestEmail?: string;

  @Field({ nullable: true })
  guestPhone?: string;

  @Field(() => Int, { nullable: true })
  handicap?: number;

  @Field(() => Int, { nullable: true })
  assignedFlight?: number;

  @Field(() => Int, { nullable: true })
  assignedPosition?: number;
}

@ObjectType()
export class GolfGroupBookingType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  courseId: string;

  @Field()
  groupName: string;

  @Field()
  eventDate: Date;

  @Field()
  startTime: string;

  @Field(() => StartFormat)
  startFormat: StartFormat;

  @Field(() => Int)
  totalPlayers: number;

  @Field(() => GroupBookingStatus)
  status: GroupBookingStatus;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => GolfCourseType, { nullable: true })
  course?: GolfCourseType;

  @Field(() => [GolfGroupPlayerType])
  players: GolfGroupPlayerType[];
}

@ObjectType()
export class GroupBookingMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => GolfGroupBookingType, { nullable: true })
  groupBooking?: GolfGroupBookingType;

  @Field(() => [String], { nullable: true })
  warnings?: string[];
}

@ObjectType()
export class FlightAssignment {
  @Field(() => Int)
  flightNumber: number;

  @Field()
  teeTime: string;

  @Field(() => [GolfGroupPlayerType])
  players: GolfGroupPlayerType[];
}

@ObjectType()
export class GroupBookingFlightsResponse {
  @Field()
  success: boolean;

  @Field(() => [FlightAssignment])
  flights: FlightAssignment[];

  @Field(() => Int)
  totalFlights: number;
}

// ============================================================================
// LOTTERY SYSTEM TYPES (US-8)
// ============================================================================

export enum LotteryType {
  PRIME_TIME = 'PRIME_TIME',
  SPECIAL_EVENT = 'SPECIAL_EVENT',
}

export enum LotteryStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  DRAWN = 'DRAWN',
  PUBLISHED = 'PUBLISHED',
}

export enum LotteryRequestStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  WAITLISTED = 'WAITLISTED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(LotteryType, {
  name: 'LotteryType',
  description: 'Type of lottery',
});

registerEnumType(LotteryStatus, {
  name: 'LotteryStatus',
  description: 'Lottery status',
});

registerEnumType(LotteryRequestStatus, {
  name: 'LotteryRequestStatus',
  description: 'Lottery request status',
});

@ObjectType()
export class GolfLotteryRequestType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  lotteryId: string;

  @Field(() => ID)
  memberId: string;

  @Field()
  preference1: string;

  @Field({ nullable: true })
  preference2?: string;

  @Field({ nullable: true })
  preference3?: string;

  @Field(() => Int)
  playerCount: number;

  @Field(() => LotteryRequestStatus)
  status: LotteryRequestStatus;

  @Field({ nullable: true })
  assignedTime?: string;

  @Field(() => Int, { nullable: true })
  drawOrder?: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => PlayerMemberType, { nullable: true })
  member?: PlayerMemberType;
}

@ObjectType()
export class GolfLotteryType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  courseId: string;

  @Field()
  lotteryDate: Date;

  @Field(() => LotteryType)
  lotteryType: LotteryType;

  @Field()
  requestWindowStart: Date;

  @Field()
  requestWindowEnd: Date;

  @Field()
  drawTime: Date;

  @Field()
  timeRangeStart: string;

  @Field()
  timeRangeEnd: string;

  @Field(() => LotteryStatus)
  status: LotteryStatus;

  @Field(() => Int)
  maxRequestsPerMember: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => GolfCourseType, { nullable: true })
  course?: GolfCourseType;

  @Field(() => [GolfLotteryRequestType], { nullable: true })
  requests?: GolfLotteryRequestType[];

  @Field(() => Int, { nullable: true })
  totalRequests?: number;
}

@ObjectType()
export class LotteryMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => GolfLotteryType, { nullable: true })
  lottery?: GolfLotteryType;
}

@ObjectType()
export class LotteryRequestMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => GolfLotteryRequestType, { nullable: true })
  request?: GolfLotteryRequestType;
}

@ObjectType()
export class LotteryDrawResult {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => Int)
  totalRequests: number;

  @Field(() => Int)
  assignedCount: number;

  @Field(() => Int)
  waitlistedCount: number;

  @Field(() => GolfLotteryType, { nullable: true })
  lottery?: GolfLotteryType;
}

// ============================================================================
// GOLF WAITLIST TYPES (US-9)
// ============================================================================

export enum GolfWaitlistStatus {
  PENDING = 'PENDING',
  NOTIFIED = 'NOTIFIED',
  BOOKED = 'BOOKED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(GolfWaitlistStatus, {
  name: 'GolfWaitlistStatus',
  description: 'Golf waitlist entry status',
});

@ObjectType()
export class GolfWaitlistType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  courseId: string;

  @Field()
  requestedDate: Date;

  @Field()
  timeRangeStart: string;

  @Field()
  timeRangeEnd: string;

  @Field(() => ID, { nullable: true })
  memberId?: string;

  @Field()
  requesterName: string;

  @Field()
  requesterPhone: string;

  @Field({ nullable: true })
  requesterEmail?: string;

  @Field(() => Int)
  playerCount: number;

  @Field(() => Int)
  priority: number;

  @Field(() => GolfWaitlistStatus)
  status: GolfWaitlistStatus;

  @Field({ nullable: true })
  notifiedAt?: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field(() => ID, { nullable: true })
  bookedTeeTimeId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => GolfCourseType, { nullable: true })
  course?: GolfCourseType;

  @Field(() => PlayerMemberType, { nullable: true })
  member?: PlayerMemberType;
}

@ObjectType()
export class WaitlistMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => GolfWaitlistType, { nullable: true })
  waitlistEntry?: GolfWaitlistType;
}

@ObjectType()
export class WaitlistNotificationResult {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => Int)
  notifiedCount: number;

  @Field(() => [GolfWaitlistType])
  notifiedEntries: GolfWaitlistType[];
}

// ============================================================================
// TEE TICKET TYPES (US-3)
// ============================================================================

@ObjectType()
export class TeeTicketPlayerType {
  @Field(() => Int)
  position: number;

  @Field()
  name: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  memberId?: string;

  @Field(() => Int, { nullable: true })
  handicap?: number;

  @Field()
  cartType: string;

  @Field({ nullable: true })
  caddyName?: string;
}

@ObjectType()
export class TeeTicketType {
  @Field()
  ticketNumber: string;

  @Field()
  clubName: string;

  @Field({ nullable: true })
  clubLogo?: string;

  @Field()
  courseName: string;

  @Field()
  teeDate: Date;

  @Field()
  teeTime: string;

  @Field(() => Int)
  holes: number;

  @Field(() => [TeeTicketPlayerType])
  players: TeeTicketPlayerType[];

  @Field({ nullable: true })
  cartAssignment?: string;

  @Field({ nullable: true })
  caddyAssignment?: string;

  @Field()
  checkedInAt: Date;

  @Field()
  checkedInBy: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  qrCode?: string;

  @Field({ nullable: true })
  barcode?: string;
}

@ObjectType()
export class TeeTicketValidationResult {
  @Field()
  valid: boolean;

  @Field(() => ID, { nullable: true })
  teeTimeId?: string;

  @Field({ nullable: true })
  message?: string;
}

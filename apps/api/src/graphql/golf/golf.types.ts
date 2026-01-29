import { ObjectType, Field, ID, registerEnumType, Int, InputType } from '@nestjs/graphql';
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

// ============================================================================
// CLUB GOLF SETTINGS TYPES (Task #6)
// ============================================================================

export enum CartPolicy {
  OPTIONAL = 'OPTIONAL',
  REQUIRED = 'REQUIRED',
}

export enum RentalPolicy {
  OPTIONAL = 'OPTIONAL',
  REQUIRED = 'REQUIRED',
}

registerEnumType(CartPolicy, {
  name: 'CartPolicy',
  description: 'Cart policy for golf bookings',
});

registerEnumType(RentalPolicy, {
  name: 'RentalPolicy',
  description: 'Rental club policy for golf bookings',
});

// Rental status tracking for carts and caddies
export enum RentalStatus {
  NONE = 'NONE',
  REQUESTED = 'REQUESTED',
  PAID = 'PAID',
  ASSIGNED = 'ASSIGNED',
  RETURNED = 'RETURNED',
}

registerEnumType(RentalStatus, {
  name: 'RentalStatus',
  description: 'Status of rental item (cart/caddy) for a player',
});

@ObjectType()
export class ClubGolfSettingsType {
  @Field(() => ID)
  id: string;

  @Field(() => CartPolicy)
  cartPolicy: CartPolicy;

  @Field(() => RentalPolicy)
  rentalPolicy: RentalPolicy;

  @Field()
  caddyDrivesCart: boolean;

  @Field(() => Int)
  maxGuestsPerMember: number;

  @Field()
  requireGuestContact: boolean;
}

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
export class PlayerDependentType {
  @Field(() => ID)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  relationship: string;

  @Field(() => ID, { nullable: true, description: 'Parent member UUID' })
  memberId?: string;
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

  @Field(() => PlayerDependentType, { nullable: true })
  dependent?: PlayerDependentType;

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

  // Per-player booking options (Task #6)
  @Field({ nullable: true })
  caddyRequest?: string;

  @Field({ nullable: true })
  cartRequest?: string;

  @Field({ nullable: true })
  rentalRequest?: string;

  @Field(() => RentalStatus, { nullable: true, defaultValue: RentalStatus.NONE })
  cartStatus?: RentalStatus;

  @Field(() => RentalStatus, { nullable: true, defaultValue: RentalStatus.NONE })
  caddyStatus?: RentalStatus;

  @Field({ nullable: true })
  checkedInAt?: Date;
}

@ObjectType()
export class BookingGroupBookedByType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  memberId?: string;
}

@ObjectType()
export class BookingGroupType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  groupNumber: number;

  @Field(() => BookingGroupBookedByType)
  bookedBy: BookingGroupBookedByType;

  @Field(() => [String])
  playerIds: string[];
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

  @Field(() => Int)
  startingHole: number;

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

  @Field(() => [BookingGroupType], { nullable: true })
  bookingGroups?: BookingGroupType[];
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

// ============================================================================
// WEEK VIEW OCCUPANCY TYPES
// ============================================================================

export enum NineType {
  FRONT = 'FRONT',
  BACK = 'BACK',
}

registerEnumType(NineType, {
  name: 'NineType',
  description: 'Which nine holes (front or back) for crossover mode',
});

export enum PositionStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  BLOCKED = 'BLOCKED',
}

registerEnumType(PositionStatus, {
  name: 'PositionStatus',
  description: 'Status of a player position in a tee time slot',
});

@ObjectType()
export class WeekViewPlayerType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => PlayerType)
  type: PlayerType;

  @Field({ nullable: true })
  memberId?: string;
}

@ObjectType()
export class WeekViewPositionType {
  @Field(() => Int)
  position: number;

  @Field(() => PositionStatus)
  status: PositionStatus;

  @Field(() => WeekViewPlayerType, { nullable: true })
  player?: WeekViewPlayerType;
}

@ObjectType()
export class WeekViewSlotType {
  @Field()
  date: string;

  @Field()
  time: string;

  @Field(() => NineType)
  nine: NineType;

  @Field()
  isBlocked: boolean;

  @Field(() => [WeekViewPositionType])
  positions: WeekViewPositionType[];
}

@InputType()
export class WeekViewOccupancyInput {
  @Field(() => ID)
  courseId: string;

  @Field()
  startDate: string;

  @Field()
  endDate: string;

  @Field({ nullable: true, description: 'Optional start time filter (HH:MM format, e.g., "06:00")' })
  startTime?: string;

  @Field({ nullable: true, description: 'Optional end time filter (HH:MM format, e.g., "12:00")' })
  endTime?: string;
}

@ObjectType()
export class WeekViewOccupancyResponse {
  @Field(() => [WeekViewSlotType])
  slots: WeekViewSlotType[];
}

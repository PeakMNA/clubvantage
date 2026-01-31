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

// ============================================================================
// GOLF CHECK-IN TYPES
// ============================================================================

// Tax calculation type
export enum TaxType {
  ADD = 'ADD',
  INCLUDE = 'INCLUDE',
  NONE = 'NONE',
}

registerEnumType(TaxType, {
  name: 'TaxType',
  description: 'Tax calculation type: ADD (on top), INCLUDE (in price), NONE',
});

// Line item category
export enum LineItemType {
  GREEN_FEE = 'GREEN_FEE',
  CART = 'CART',
  CADDY = 'CADDY',
  RENTAL = 'RENTAL',
  PROSHOP = 'PROSHOP',
}

registerEnumType(LineItemType, {
  name: 'LineItemType',
  description: 'Type of booking line item',
});

// Ticket generation timing
export enum TicketGenerateOn {
  CHECK_IN = 'CHECK_IN',
  SETTLEMENT = 'SETTLEMENT',
  MANUAL = 'MANUAL',
}

registerEnumType(TicketGenerateOn, {
  name: 'TicketGenerateOn',
  description: 'When to generate starter ticket',
});

// Print options
export enum PrintOption {
  TICKET = 'TICKET',
  RECEIPT = 'RECEIPT',
  COMBINED = 'COMBINED',
  NONE = 'NONE',
}

registerEnumType(PrintOption, {
  name: 'PrintOption',
  description: 'Print output options for starter ticket',
});

// Payment status for check-in
export enum PaymentStatus {
  PREPAID = 'PREPAID',     // Has line items AND all are paid
  PARTIAL = 'PARTIAL',     // Has line items AND some are paid
  UNPAID = 'UNPAID',       // Has line items AND none are paid
  NO_CHARGES = 'NO_CHARGES', // No line items - needs charges added
}

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'Payment status for player check-in',
});

// Extended player type for check-in
export enum CheckInPlayerType {
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
  DEPENDENT = 'DEPENDENT',
  WALKUP = 'WALKUP',
}

registerEnumType(CheckInPlayerType, {
  name: 'CheckInPlayerType',
  description: 'Player type for check-in (more granular than PlayerType)',
});

// Payment method type
export enum PaymentMethodTypeEnum {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  ACCOUNT = 'ACCOUNT',
  CUSTOM = 'CUSTOM',
}

registerEnumType(PaymentMethodTypeEnum, {
  name: 'PaymentMethodTypeEnum',
  description: 'Type of payment method',
});

// ============================================================================
// CHECK-IN PAYMENT METHOD
// ============================================================================

@ObjectType()
export class CheckInPaymentMethodType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  icon: string;

  @Field(() => PaymentMethodTypeEnum)
  type: PaymentMethodTypeEnum;

  @Field()
  isEnabled: boolean;

  @Field()
  requiresRef: boolean;

  @Field()
  opensPOS: boolean;

  @Field(() => Int)
  sortOrder: number;
}

// ============================================================================
// TAX CONFIGURATION
// ============================================================================

@ObjectType()
export class TaxOverrideType {
  @Field(() => LineItemType)
  itemType: LineItemType;

  @Field()
  rate: number;

  @Field(() => TaxType)
  taxType: TaxType;
}

@ObjectType()
export class TaxConfigType {
  @Field()
  defaultRate: number;

  @Field(() => TaxType)
  defaultType: TaxType;

  @Field()
  taxLabel: string;

  @Field()
  showBreakdown: boolean;

  @Field()
  showTypeIndicator: boolean;

  @Field(() => [TaxOverrideType])
  overrides: TaxOverrideType[];
}

// ============================================================================
// STARTER TICKET CONFIGURATION
// ============================================================================

@ObjectType()
export class TicketContentConfigType {
  @Field()
  showTeeTime: boolean;

  @Field()
  showCourse: boolean;

  @Field()
  showStartingHole: boolean;

  @Field()
  showPlayerNames: boolean;

  @Field()
  showMemberNumbers: boolean;

  @Field()
  showCartNumber: boolean;

  @Field()
  showCaddyName: boolean;

  @Field()
  showRentalItems: boolean;

  @Field()
  showSpecialRequests: boolean;

  @Field()
  showQRCode: boolean;
}

@ObjectType()
export class StarterTicketConfigType {
  @Field(() => TicketGenerateOn)
  generateOn: TicketGenerateOn;

  @Field()
  autoGenerate: boolean;

  @Field(() => PrintOption)
  defaultPrintOption: PrintOption;

  @Field(() => TicketContentConfigType)
  content: TicketContentConfigType;
}

// ============================================================================
// PRO SHOP CONFIGURATION
// ============================================================================

@ObjectType()
export class ProShopConfigType {
  @Field()
  allowAddAtCheckIn: boolean;

  @Field()
  showQuickAddItems: boolean;

  @Field(() => [ID])
  quickAddProductIds: string[];
}

// ============================================================================
// POS CONFIGURATION
// ============================================================================

@ObjectType()
export class POSConfigType {
  @Field()
  isConnected: boolean;

  @Field({ nullable: true })
  provider?: string;

  @Field({ nullable: true })
  terminalId?: string;
}

// ============================================================================
// CHECK-IN POLICY
// ============================================================================

@ObjectType()
export class CheckInPolicyType {
  @Field()
  allowPartialPayment: boolean;

  @Field()
  blockSuspendedMembers: boolean;

  @Field()
  showSuspensionReason: boolean;

  @Field()
  requireAllItemsPaid: boolean;
}

// ============================================================================
// CHECK-IN SETTINGS (COMPLETE)
// ============================================================================

@ObjectType()
export class CheckInSettingsType {
  @Field(() => CheckInPolicyType)
  policy: CheckInPolicyType;

  @Field(() => [CheckInPaymentMethodType])
  paymentMethods: CheckInPaymentMethodType[];

  @Field(() => TaxConfigType)
  tax: TaxConfigType;

  @Field(() => StarterTicketConfigType)
  starterTicket: StarterTicketConfigType;

  @Field(() => ProShopConfigType)
  proShop: ProShopConfigType;

  @Field(() => POSConfigType)
  pos: POSConfigType;
}

// ============================================================================
// PRO SHOP CATEGORY
// ============================================================================

@ObjectType()
export class ProShopCategoryType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  defaultTaxRate: number;

  @Field(() => TaxType)
  defaultTaxType: TaxType;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;

  @Field(() => Int, { nullable: true })
  productCount?: number;
}

// ============================================================================
// PRO SHOP PRODUCT
// ============================================================================

@ObjectType()
export class ProShopVariantType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  sku?: string;

  @Field()
  priceAdjustment: number;

  @Field()
  finalPrice: number;
}

@ObjectType()
export class ProShopProductType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  categoryId: string;

  @Field(() => ProShopCategoryType, { nullable: true })
  category?: ProShopCategoryType;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  sku?: string;

  @Field()
  price: number;

  @Field()
  taxRate: number;

  @Field(() => TaxType)
  taxType: TaxType;

  @Field()
  useCategoryDefaults: boolean;

  @Field()
  effectiveTaxRate: number;

  @Field(() => TaxType)
  effectiveTaxType: TaxType;

  @Field(() => [ProShopVariantType])
  variants: ProShopVariantType[];

  @Field()
  isActive: boolean;

  @Field()
  isQuickAdd: boolean;
}

@ObjectType()
export class ProShopProductConnectionType {
  @Field(() => [ProShopProductType])
  items: ProShopProductType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field()
  hasMore: boolean;
}

// ============================================================================
// BOOKING LINE ITEM
// ============================================================================

@ObjectType()
export class BookingLineItemType {
  @Field(() => ID)
  id: string;

  @Field(() => LineItemType)
  type: LineItemType;

  @Field()
  description: string;

  @Field()
  baseAmount: number;

  @Field(() => TaxType)
  taxType: TaxType;

  @Field()
  taxRate: number;

  @Field()
  taxAmount: number;

  @Field()
  totalAmount: number;

  @Field()
  isPaid: boolean;

  @Field({ nullable: true })
  paidAt?: Date;

  @Field({ nullable: true })
  paymentMethod?: string;

  @Field({ nullable: true })
  reference?: string;

  @Field(() => ID, { nullable: true })
  productId?: string;

  @Field(() => ID, { nullable: true })
  variantId?: string;
}

// ============================================================================
// PLAYER PAYMENT INFO
// ============================================================================

@ObjectType()
export class PlayerPaymentInfoType {
  @Field(() => ID)
  playerId: string;

  @Field()
  playerName: string;

  @Field(() => CheckInPlayerType)
  playerType: CheckInPlayerType;

  @Field({ nullable: true })
  memberNumber?: string;

  @Field(() => [BookingLineItemType])
  lineItems: BookingLineItemType[];

  @Field()
  subtotal: number;

  @Field()
  totalTax: number;

  @Field()
  grandTotal: number;

  @Field()
  paidOnline: number;

  @Field()
  balanceDue: number;

  @Field()
  isSettled: boolean;

  @Field({ nullable: true })
  settledAt?: Date;

  @Field({ nullable: true })
  settledVia?: string;

  @Field({ nullable: true })
  settledBy?: string;
}

// ============================================================================
// CHECK-IN PLAYER INFO
// ============================================================================

@ObjectType()
export class CheckInPlayerInfoType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => CheckInPlayerType)
  type: CheckInPlayerType;

  @Field({ nullable: true })
  memberNumber?: string;

  @Field()
  isCheckedIn: boolean;

  @Field({ nullable: true })
  checkedInAt?: Date;

  @Field()
  isSuspended: boolean;

  @Field({ nullable: true })
  suspensionReason?: string;

  @Field(() => PaymentStatus)
  paymentStatus: PaymentStatus;

  @Field()
  totalDue: number;

  @Field()
  totalPaid: number;

  @Field()
  balanceDue: number;

  @Field(() => [BookingLineItemType])
  lineItems: BookingLineItemType[];
}

// ============================================================================
// FLIGHT CHECK-IN INFO
// ============================================================================

@ObjectType()
export class FlightCheckInInfoType {
  @Field(() => ID)
  id: string;

  @Field()
  teeTime: Date;

  @Field()
  course: string;

  @Field(() => Int)
  startingHole: number;

  @Field({ nullable: true })
  cartNumber?: string;

  @Field({ nullable: true })
  caddyAssignment?: string;

  @Field(() => [CheckInPlayerInfoType])
  players: CheckInPlayerInfoType[];
}

// ============================================================================
// SETTLEMENT RESULT
// ============================================================================

@ObjectType()
export class PlayerSettlementResultType {
  @Field(() => ID)
  playerId: string;

  @Field()
  amountPaid: number;

  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;
}

@ObjectType()
export class SettlementResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  transactionId?: string;

  @Field()
  settledAt: Date;

  @Field()
  settledBy: string;

  @Field(() => [PlayerSettlementResultType])
  players: PlayerSettlementResultType[];

  @Field({ nullable: true })
  error?: string;
}

// ============================================================================
// CHECK-IN RESULT
// ============================================================================

@ObjectType()
export class PlayerCheckInResultType {
  @Field(() => ID)
  playerId: string;

  @Field()
  checkedIn: boolean;

  @Field({ nullable: true })
  error?: string;
}

@ObjectType()
export class CheckInResultType {
  @Field()
  success: boolean;

  @Field()
  checkedInAt: Date;

  @Field()
  checkedInBy: string;

  @Field(() => [PlayerCheckInResultType])
  players: PlayerCheckInResultType[];

  @Field(() => ID, { nullable: true })
  ticketId?: string;

  @Field({ nullable: true })
  ticketNumber?: string;
}

// ============================================================================
// STARTER TICKET
// ============================================================================

@ObjectType()
export class StarterTicketPlayerType {
  @Field()
  name: string;

  @Field({ nullable: true })
  memberNumber?: string;

  @Field(() => CheckInPlayerType)
  type: CheckInPlayerType;
}

@ObjectType()
export class StarterTicketResponseType {
  @Field(() => ID)
  id: string;

  @Field()
  ticketNumber: string;

  @Field()
  teeTime: Date;

  @Field()
  course: string;

  @Field(() => Int)
  startingHole: number;

  @Field(() => [StarterTicketPlayerType])
  players: StarterTicketPlayerType[];

  @Field({ nullable: true })
  cartNumber?: string;

  @Field({ nullable: true })
  caddyName?: string;

  @Field(() => [String])
  rentalItems: string[];

  @Field({ nullable: true })
  specialRequests?: string;

  @Field({ nullable: true })
  qrCodeData?: string;

  @Field()
  generatedAt: Date;

  @Field()
  generatedBy: string;

  @Field({ nullable: true })
  printedAt?: Date;

  @Field(() => Int)
  reprintCount: number;
}

// ============================================================================
// PRINT JOB TYPES
// ============================================================================

@ObjectType()
export class PrintJobResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  jobId?: string;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  printedAt?: Date;
}

@ObjectType()
export class TicketValidationResultType {
  @Field()
  valid: boolean;

  @Field(() => ID, { nullable: true })
  ticketId?: string;

  @Field(() => ID, { nullable: true })
  teeTimeId?: string;

  @Field({ nullable: true })
  message?: string;
}

// ============================================================================
// FLIGHT PAYMENT SUMMARY
// ============================================================================

@ObjectType()
export class FlightPaymentSummaryType {
  @Field(() => ID)
  teeTimeId: string;

  @Field()
  teeTime: Date;

  @Field()
  course: string;

  @Field(() => Int)
  totalPlayers: number;

  @Field(() => Int)
  checkedInCount: number;

  @Field(() => Int)
  settledCount: number;

  @Field()
  totalDue: number;

  @Field()
  totalPaid: number;

  @Field()
  totalBalance: number;

  @Field()
  isFullyCheckedIn: boolean;

  @Field()
  isFullySettled: boolean;
}

// ============================================================================
// CHECK-IN HISTORY / AUDIT TYPES
// ============================================================================

@ObjectType()
export class CheckInAuditEntryType {
  @Field(() => ID)
  id: string;

  @Field()
  action: string;

  @Field(() => ID)
  teeTimeId: string;

  @Field(() => ID, { nullable: true })
  playerId?: string;

  @Field({ nullable: true })
  playerName?: string;

  @Field()
  performedBy: string;

  @Field()
  performedAt: Date;

  @Field({ nullable: true })
  details?: string;

  @Field({ nullable: true })
  amount?: number;
}

@ObjectType()
export class DailyCheckInReportType {
  @Field()
  date: Date;

  @Field()
  course: string;

  @Field(() => Int)
  totalFlights: number;

  @Field(() => Int)
  totalPlayers: number;

  @Field(() => Int)
  checkedInPlayers: number;

  @Field(() => Int)
  noShowPlayers: number;

  @Field()
  totalRevenue: number;

  @Field()
  totalCash: number;

  @Field()
  totalCard: number;

  @Field()
  totalTransfer: number;

  @Field()
  totalAccount: number;

  @Field(() => [FlightPaymentSummaryType])
  flights: FlightPaymentSummaryType[];
}

// ============================================================================
// PAYMENT TRANSACTION TYPES
// ============================================================================

export enum TransactionStatus {
  COMPLETED = 'COMPLETED',
  VOIDED = 'VOIDED',
  REFUNDED = 'REFUNDED',
  PENDING = 'PENDING',
}

registerEnumType(TransactionStatus, {
  name: 'TransactionStatus',
  description: 'Payment transaction status',
});

@ObjectType()
export class LineItemPaymentType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  lineItemId: string;

  @Field()
  amount: number;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
export class PaymentTransactionType {
  @Field(() => ID)
  id: string;

  @Field()
  transactionNumber: string;

  @Field(() => ID)
  clubId: string;

  @Field(() => ID, { nullable: true })
  teeTimeId?: string;

  @Field()
  amount: number;

  @Field(() => ID)
  paymentMethodId: string;

  @Field({ nullable: true })
  paymentMethodName?: string;

  @Field(() => TransactionStatus)
  status: TransactionStatus;

  @Field({ nullable: true })
  reference?: string;

  @Field()
  paidAt: Date;

  @Field()
  paidBy: string;

  @Field({ nullable: true })
  voidedAt?: Date;

  @Field({ nullable: true })
  voidedBy?: string;

  @Field({ nullable: true })
  voidReason?: string;

  @Field({ nullable: true })
  refundedAt?: Date;

  @Field({ nullable: true })
  refundedBy?: string;

  @Field({ nullable: true })
  refundAmount?: number;

  @Field({ nullable: true })
  refundReason?: string;

  @Field()
  allocatedToRevenue: boolean;

  @Field({ nullable: true })
  allocatedAt?: Date;

  @Field(() => [LineItemPaymentType], { nullable: true })
  lineItemPayments?: LineItemPaymentType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// ============================================================================
// SHOPPING CART TYPES (US-CART)
// ============================================================================

@ObjectType()
export class TransferredItemType {
  @Field(() => ID)
  lineItemId: string;

  @Field()
  description: string;

  @Field()
  amount: number;

  @Field(() => ID)
  fromPlayerId: string;

  @Field()
  fromPlayerName: string;

  @Field(() => ID, { nullable: true })
  toPlayerId?: string;

  @Field({ nullable: true })
  toPlayerName?: string;
}

@ObjectType()
export class SlotLineItemType {
  @Field(() => ID)
  id: string;

  @Field()
  type: string;

  @Field()
  description: string;

  @Field()
  baseAmount: number;

  @Field()
  taxType: string;

  @Field()
  taxRate: number;

  @Field()
  taxAmount: number;

  @Field()
  totalAmount: number;

  @Field(() => Int)
  quantity: number;

  @Field()
  isPaid: boolean;

  @Field({ nullable: true })
  paidAt?: Date;

  @Field({ nullable: true })
  paymentMethod?: string;

  @Field()
  isTransferred: boolean;

  @Field({ nullable: true })
  transferredFromPlayerName?: string;
}

@ObjectType()
export class SlotCartType {
  @Field(() => ID)
  playerId: string;

  @Field()
  playerName: string;

  @Field()
  playerType: string;

  @Field(() => ID, { nullable: true })
  memberId?: string;

  @Field({ nullable: true })
  memberNumber?: string;

  @Field(() => [SlotLineItemType])
  lineItems: SlotLineItemType[];

  @Field(() => [TransferredItemType])
  transferredInItems: TransferredItemType[];

  @Field(() => [TransferredItemType])
  transferredOutItems: TransferredItemType[];

  @Field()
  subtotal: number;

  @Field()
  taxTotal: number;

  @Field()
  grandTotal: number;

  @Field()
  paidAmount: number;

  @Field()
  balanceDue: number;

  @Field()
  isCheckedIn: boolean;

  @Field({ nullable: true })
  checkedInAt?: Date;

  @Field()
  isSettled: boolean;
}

@ObjectType()
export class BatchTotalType {
  @Field(() => [ID])
  playerIds: string[];

  @Field()
  subtotal: number;

  @Field()
  taxTotal: number;

  @Field()
  grandTotal: number;

  @Field()
  paidAmount: number;

  @Field()
  balanceDue: number;

  @Field(() => Int)
  lineItemCount: number;
}

@ObjectType()
export class TransferResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => ID, { nullable: true })
  lineItemId?: string;

  @Field({ nullable: true })
  isTransferred?: boolean;

  @Field(() => ID, { nullable: true })
  transferredToPlayerId?: string;
}

@ObjectType()
export class CartDraftType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  teeTimeId: string;

  @Field(() => String, { description: 'JSON stringified draft data' })
  draftData: string;

  @Field()
  updatedAt: Date;

  @Field()
  createdBy: string;
}

@ObjectType()
export class BatchPaymentResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  transactionId?: string;

  @Field({ nullable: true })
  error?: string;

  @Field(() => [SlotPaymentResultType], { nullable: true })
  processedSlots?: SlotPaymentResultType[];
}

@ObjectType()
export class SlotPaymentResultType {
  @Field(() => ID)
  playerId: string;

  @Field()
  amountPaid: number;

  @Field()
  newBalance: number;

  @Field()
  isSettled: boolean;
}

@ObjectType()
export class CheckInSlotsResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => [SlotCheckInResultType], { nullable: true })
  checkedInSlots?: SlotCheckInResultType[];

  @Field(() => ID, { nullable: true })
  ticketId?: string;

  @Field({ nullable: true })
  ticketNumber?: string;
}

@ObjectType()
export class SlotCheckInResultType {
  @Field(() => ID)
  playerId: string;

  @Field({ nullable: true })
  checkedInAt?: Date;

  @Field({ nullable: true })
  error?: string;
}

// Wrapper type for teeTimeCarts query with context info
@ObjectType()
export class TeeTimeCartsType {
  @Field(() => ID)
  teeTimeId: string;

  @Field()
  teeTime: string;

  @Field()
  courseName: string;

  @Field(() => ID)
  courseId: string;

  @Field()
  date: Date;

  @Field(() => [SlotCartType])
  slots: SlotCartType[];

  @Field()
  isFullySettled: boolean;

  @Field()
  isFullyCheckedIn: boolean;
}

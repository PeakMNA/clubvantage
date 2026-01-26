/**
 * Golf entity types for ClubVantage
 * Based on PRD-01 data model
 */

export type TeeTimeStatus =
  | 'AVAILABLE'
  | 'BOOKED'
  | 'CHECKED_IN'
  | 'STARTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'BLOCKED';

export type PlayerType = 'MEMBER' | 'GUEST';

export type CartType = 'SINGLE' | 'SHARED' | 'WALKING';

export interface GolfCourse {
  id: string;
  tenantId: string;
  clubId: string;
  name: string;
  code: string;
  description?: string;
  holes: number; // 9 or 18
  par: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Tee Time Configuration
  config: TeeSheetConfig;
}

export interface TeeSheetConfig {
  id: string;
  courseId: string;
  startTime: string;  // HH:mm format (e.g., "06:00")
  endTime: string;    // HH:mm format (e.g., "18:00")
  interval: number;   // minutes between tee times (e.g., 8, 10, 12)
  maxPlayersPerSlot: number; // typically 4
  advanceBookingDays: number;
  peakHoursStart?: string;
  peakHoursEnd?: string;
}

export interface TeeTime {
  id: string;
  tenantId: string;
  clubId: string;
  courseId: string;

  // Time
  date: Date;
  time: string; // HH:mm format
  status: TeeTimeStatus;

  // Booking Info
  bookingNumber?: string;
  bookedById?: string;
  bookedByMemberId?: string;

  // Players (Flight Composition)
  players: TeeTimePlayer[];

  // Charges
  totalGreenFee: number;
  totalCaddyFee: number;
  totalCartFee: number;
  totalGuestFee: number;
  totalAmount: number;
  invoiceId?: string;

  // Notes
  notes?: string;
  internalNotes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  cancelledById?: string;
}

export interface TeeTimePlayer {
  id: string;
  teeTimeId: string;
  position: number; // 1-4

  // Player Type
  playerType: PlayerType;

  // Member (if member)
  memberId?: string;
  memberName?: string;
  memberId_display?: string;

  // Guest (if guest)
  guestId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  createAsLead: boolean;

  // Caddy Assignment
  caddyId?: string;
  caddyName?: string;
  caddyPreferred: boolean;

  // Cart Assignment
  cartType: CartType;
  cartId?: string;
  cartNumber?: string;
  sharedWithPlayerId?: string; // For shared carts

  // Fees
  greenFee: number;
  caddyFee: number;
  cartFee: number;
  guestFee: number;

  // Status
  checkedIn: boolean;
  checkedInAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface Caddy {
  id: string;
  tenantId: string;
  clubId: string;
  name: string;
  code: string;
  phone?: string;
  photoUrl?: string;
  isActive: boolean;
  rating?: number; // Average rating
  totalRounds: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaddyAssignment {
  id: string;
  caddyId: string;
  teeTimeId: string;
  playerId: string;
  date: Date;
  fee: number;
  tip?: number;
  rating?: number;
  notes?: string;
  createdAt: Date;
}

export interface GolfCart {
  id: string;
  tenantId: string;
  clubId: string;
  cartNumber: string;
  type: 'SINGLE' | 'DOUBLE';
  isActive: boolean;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GolfCartRental {
  id: string;
  cartId: string;
  teeTimeId: string;
  playerIds: string[];
  date: Date;
  fee: number;
  createdAt: Date;
}

// Tee Sheet View Types
export interface TeeSheetSlot {
  time: string;
  status: TeeTimeStatus;
  teeTimeId?: string;
  players: TeeSheetPlayer[];
}

export interface TeeSheetPlayer {
  position: number;
  playerType?: PlayerType;
  name?: string;
  memberId?: string;
  caddyName?: string;
  cartNumber?: string;
  isEmpty: boolean;
}

// Green Fee Configuration
export interface GreenFeeRate {
  id: string;
  tenantId: string;
  courseId: string;
  membershipTypeId?: string; // null = guest rate
  dayType: 'WEEKDAY' | 'WEEKEND' | 'HOLIDAY';
  timeType: 'PEAK' | 'OFF_PEAK' | 'ALL_DAY';
  rate: number;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
  createdAt: Date;
  updatedAt: Date;
}

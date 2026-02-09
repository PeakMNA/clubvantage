/**
 * Shared types for Golf module services
 */

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum CartType {
  WALKING = 'WALKING',
  SINGLE = 'SINGLE',
  SHARED = 'SHARED',
}

export enum PlayerType {
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
  DEPENDENT = 'DEPENDENT',
  WALK_UP = 'WALK_UP',
}

export interface CreateFlightDto {
  courseId: string;
  teeDate: string;
  teeTime: string;
  holes?: number;
  startingHole?: number; // 1 or 10 (for Cross mode)
  players: {
    position: number;
    playerType: PlayerType;
    memberId?: string;
    dependentId?: string; // For DEPENDENT player type - links to Dependent table
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    cartType?: CartType;
    sharedWithPosition?: number;
    caddyId?: string;
    // Per-player booking options (Task #6)
    caddyRequest?: string;
    cartRequest?: string;
    rentalRequest?: string;
  }[];
  notes?: string;
}

export interface UpdateFlightDto {
  players?: CreateFlightDto['players'];
  holes?: number;
  notes?: string;
  status?: BookingStatus;
}

export interface TeeSheetSlot {
  time: string;
  courseId: string;
  date: string;
  booking: any | null;
  available: boolean;
  blocked: boolean;
  blockInfo?: {
    id: string;
    blockType: string;
    reason?: string;
  };
  isPrimeTime: boolean;
}

export interface UpdateFlightPlayersDto {
  position: number;
  playerType: string;
  memberId?: string;
  dependentId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  cartType?: string;
  sharedWithPosition?: number;
  caddyId?: string;
  caddyRequest?: string;
  cartRequest?: string;
  cartId?: string;
  rentalRequest?: string;
  cartStatus?: string;
  caddyStatus?: string;
}

export interface CreateScheduleDto {
  courseId: string;
  seasonName: string;
  startDate: Date;
  endDate: Date;
  firstTeeTime: string;
  lastTeeTime: string;
  playFormat?: string;
  paceOfPlay?: number;
  intervals?: {
    dayType: string;
    timeStart: string;
    timeEnd: string;
    intervalMin: number;
    isPrimeTime: boolean;
  }[];
}

export interface UpdateScheduleDto {
  seasonName?: string;
  startDate?: Date;
  endDate?: Date;
  firstTeeTime?: string;
  lastTeeTime?: string;
  playFormat?: string;
  paceOfPlay?: number;
  isActive?: boolean;
}

export interface CreateBlockDto {
  courseId: string;
  startTime: Date;
  endTime: Date;
  blockType: string;
  reason?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
}

export interface UpdateBlockDto {
  startTime?: Date;
  endTime?: Date;
  blockType?: string;
  reason?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
}

export interface BlocksFilter {
  startDate?: Date;
  endDate?: Date;
  blockType?: string;
}

export interface WeekViewOccupancySlot {
  date: string;
  time: string;
  nine: 'FRONT' | 'BACK';
  isBlocked: boolean;
  positions: {
    position: number;
    status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
    player?: {
      id: string;
      name: string;
      type: PlayerType;
      memberId?: string;
    };
  }[];
}

export interface UpdatePlayerRentalStatusDto {
  cartStatus?: string;
  caddyStatus?: string;
  caddyId?: string | null;
}

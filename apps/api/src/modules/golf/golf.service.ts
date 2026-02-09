import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

// Re-export types for backward compatibility
export {
  BookingStatus,
  CartType,
  PlayerType,
  CreateFlightDto,
  UpdateFlightDto,
  TeeSheetSlot,
  UpdateFlightPlayersDto,
  CreateScheduleDto,
  UpdateScheduleDto,
  CreateBlockDto,
  UpdateBlockDto,
  BlocksFilter,
  WeekViewOccupancySlot,
  UpdatePlayerRentalStatusDto,
} from './golf.types';

// Re-export services for facade pattern
export { TeeSheetService } from './tee-sheet.service';
export { FlightService } from './flight.service';
export { GolfScheduleService } from './golf-schedule.service';
export { BlockService } from './block.service';
export { PlayerRentalService } from './player-rental.service';

/**
 * GolfService - Facade for golf-related operations
 *
 * This service has been decomposed into focused services:
 * - TeeSheetService: Tee sheet queries, time slot generation, week view
 * - FlightService: Flight/booking CRUD operations
 * - GolfScheduleService: Course schedule management
 * - BlockService: Tee time block management
 * - PlayerRentalService: Player rental status updates
 *
 * This facade remains for:
 * 1. Backward compatibility with existing code
 * 2. Simple queries (getCourses, getCaddies)
 * 3. Delegating to focused services
 */
@Injectable()
export class GolfService {
  private readonly logger = new Logger(GolfService.name);

  constructor(
    private prisma: PrismaService,
  ) {}

  /**
   * Get all active golf courses for a tenant
   */
  async getCourses(tenantId: string) {
    return this.prisma.golfCourse.findMany({
      where: { clubId: tenantId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Get all active caddies for a tenant
   */
  async getCaddies(tenantId: string) {
    return this.prisma.caddy.findMany({
      where: { clubId: tenantId, isActive: true },
      orderBy: { caddyNumber: 'asc' },
    });
  }
}

import { Resolver, Query, Mutation, Subscription, Args, ID } from '@nestjs/graphql';
import { UseGuards, Inject, Logger } from '@nestjs/common';
import { GolfService } from '@/modules/golf/golf.service';
import { TeeSheetService } from '@/modules/golf/tee-sheet.service';
import { FlightService } from '@/modules/golf/flight.service';
import { GolfScheduleService } from '@/modules/golf/golf-schedule.service';
import { BlockService } from '@/modules/golf/block.service';
import { PlayerRentalService } from '@/modules/golf/player-rental.service';
import { TeeTicketService } from '@/modules/golf/tee-ticket.service';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
  TeeTimeType,
  TeeTimeConnection,
  TeeSheetSlotType,
  GolfCourseType,
  FlightCheckInResponseType,
  CancelResponseType,
  GolfCourseScheduleType,
  GolfCourseIntervalType,
  TeeTimeBlockType,
  ScheduleMutationResponse,
  BlockMutationResponse,
  PlayFormat,
  DayType,
  BlockType,
  TeeTicketType,
  TeeTicketValidationResult,
  ClubGolfSettingsType,
  CaddyType,
  WeekViewOccupancyInput,
  WeekViewOccupancyResponse,
  WeekViewSlotType,
  NineType,
  PositionStatus,
  WeekViewPositionType,
  WeekViewPlayerType,
  PlayerType,
  TeeTimePlayerType,
} from './golf.types';
import {
  CreateTeeTimeInput,
  UpdateTeeTimeInput,
  MoveTeeTimeInput,
  TeeSheetArgs,
  TeeTimesQueryArgs,
  CreateScheduleInput,
  UpdateScheduleInput,
  CreateBlockInput,
  UpdateBlockInput,
  BlocksQueryArgs,
  CourseIntervalInput,
  TeeTimePlayerInput,
  UpdatePlayerRentalStatusInput,
} from './golf.input';
import { encodeCursor } from '../common/pagination';
import { PUBSUB_TOKEN, SubscriptionEvents } from '../common/pubsub';
import { RatesService } from './rates.service';
import {
  RateConfigType,
  GreenFeeRateType,
  CartRateType,
  CaddyRateType,
  RateConfigMutationResponse,
  GreenFeeRateMutationResponse,
  CartRateMutationResponse,
  CaddyRateMutationResponse,
  DeleteRateMutationResponse,
} from './rates.types';
import {
  CreateRateConfigInput,
  UpdateRateConfigInput,
  CreateGreenFeeRateInput,
  UpdateGreenFeeRateInput,
  CreateCartRateInput,
  UpdateCartRateInput,
  CreateCaddyRateInput,
  UpdateCaddyRateInput,
  RateConfigsQueryArgs,
} from './rates.input';
import { LineItemGeneratorService } from './line-item-generator.service';

@Resolver(() => TeeTimeType)
@UseGuards(GqlAuthGuard)
export class GolfResolver {
  private readonly logger = new Logger(GolfResolver.name);

  constructor(
    private readonly golfService: GolfService,
    private readonly teeSheetService: TeeSheetService,
    private readonly flightService: FlightService,
    private readonly golfScheduleService: GolfScheduleService,
    private readonly blockService: BlockService,
    private readonly playerRentalService: PlayerRentalService,
    private readonly teeTicketService: TeeTicketService,
    private readonly prisma: PrismaService,
    private readonly ratesService: RatesService,
    private readonly lineItemGenerator: LineItemGeneratorService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(PUBSUB_TOKEN) private readonly pubSub: any,
  ) {}

  @Query(() => [TeeSheetSlotType], { name: 'teeSheet', description: 'Get tee sheet for a course and date' })
  async getTeeSheet(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: TeeSheetArgs,
  ): Promise<TeeSheetSlotType[]> {
    const dateStr = args.date.toISOString().split('T')[0];
    this.logger.debug(`getTeeSheet - tenantId: ${user.tenantId}, courseId: ${args.courseId}, date: ${dateStr}`);
    const slots = await this.teeSheetService.getTeeSheet(user.tenantId, args.courseId, dateStr);

    return slots.map((slot: any) => ({
      time: slot.time,
      courseId: slot.courseId,
      date: slot.date,
      available: slot.available,
      blocked: slot.blocked || false,
      blockInfo: slot.blockInfo,
      isPrimeTime: slot.isPrimeTime || false,
      booking: slot.booking ? this.transformTeeTime(slot.booking) : undefined,
    }));
  }

  @Query(() => [GolfCourseType], { name: 'courses', description: 'Get all golf courses' })
  async getCourses(@GqlCurrentUser() user: JwtPayload): Promise<GolfCourseType[]> {
    const courses = await this.prisma.golfCourse.findMany({
      where: { clubId: user.tenantId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return courses.map((c: any) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      description: c.description,
      holes: c.holes,
      par: c.par,
      slope: c.slope,
      rating: c.rating?.toNumber(),
      firstTeeTime: c.firstTeeTime,
      lastTeeTime: c.lastTeeTime,
      teeInterval: c.teeInterval,
      isActive: c.isActive,
    }));
  }

  // ============================================
  // Week View Occupancy Query
  // ============================================

  @Query(() => WeekViewOccupancyResponse, {
    name: 'weekViewOccupancy',
    description: 'Get week view occupancy data showing player positions for each time slot',
  })
  async getWeekViewOccupancy(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: WeekViewOccupancyInput,
  ): Promise<WeekViewOccupancyResponse> {
    const slots = await this.teeSheetService.getWeekViewOccupancy(
      user.tenantId,
      input.courseId,
      input.startDate,
      input.endDate,
      input.startTime,
      input.endTime,
    );

    return {
      slots: slots.map((slot) => ({
        date: slot.date,
        time: slot.time,
        nine: slot.nine as NineType,
        isBlocked: slot.isBlocked,
        positions: slot.positions.map((pos) => ({
          position: pos.position,
          status: pos.status as PositionStatus,
          player: pos.player
            ? {
                id: pos.player.id,
                name: pos.player.name,
                type: pos.player.type as PlayerType,
                memberId: pos.player.memberId,
              }
            : undefined,
        })),
      })),
    };
  }

  // ============================================
  // Club Golf Settings Query (Task #6)
  // ============================================

  @Query(() => ClubGolfSettingsType, {
    name: 'clubGolfSettings',
    description: 'Get club golf settings',
    nullable: true,
  })
  async getClubGolfSettings(@GqlCurrentUser() user: JwtPayload): Promise<ClubGolfSettingsType | null> {
    const settings = await this.prisma.clubGolfSettings.findUnique({
      where: { clubId: user.tenantId },
    });

    if (!settings) {
      return null;
    }

    return {
      id: settings.id,
      cartPolicy: settings.cartPolicy as any,
      rentalPolicy: settings.rentalPolicy as any,
      caddyDrivesCart: settings.caddyDrivesCart,
      maxGuestsPerMember: settings.maxGuestsPerMember,
      requireGuestContact: settings.requireGuestContact,
    };
  }

  // ============================================
  // Caddy Search Query (Task #6)
  // ============================================

  @Query(() => [CaddyType], {
    name: 'searchCaddies',
    description: 'Search for caddies by name or number',
  })
  async searchCaddies(
    @GqlCurrentUser() user: JwtPayload,
    @Args('search', { nullable: true }) search?: string,
    @Args('courseId', { type: () => ID, nullable: true }) courseId?: string,
  ): Promise<CaddyType[]> {
    const where: any = {
      clubId: user.tenantId,
      isActive: true,
    };

    // Add search filter if provided
    if (search) {
      where.OR = [
        { caddyNumber: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const caddies = await this.prisma.caddy.findMany({
      where,
      orderBy: { caddyNumber: 'asc' },
      take: 50, // Limit results
    });

    return caddies.map((caddy: any) => ({
      id: caddy.id,
      caddyNumber: caddy.caddyNumber,
      firstName: caddy.firstName,
      lastName: caddy.lastName,
      phone: caddy.phone,
      isActive: caddy.isActive,
    }));
  }

  @Query(() => TeeTimeType, { name: 'teeTime', description: 'Get a single tee time by ID' })
  async getTeeTime(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<TeeTimeType> {
    const teeTime = await this.flightService.getFlight(user.tenantId, id);
    return this.transformTeeTime(teeTime);
  }

  @Query(() => TeeTimeConnection, { name: 'teeTimes', description: 'Get paginated list of tee times' })
  async getTeeTimes(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: TeeTimesQueryArgs,
  ): Promise<TeeTimeConnection> {
    const where: any = {
      clubId: user.tenantId,
    };

    if (args.courseId) where.courseId = args.courseId;
    if (args.status) where.status = args.status;
    if (args.startDate) where.teeDate = { gte: args.startDate };
    if (args.endDate) {
      where.teeDate = { ...where.teeDate, lte: args.endDate };
    }
    if (args.memberId) {
      where.players = { some: { memberId: args.memberId } };
    }

    const skip = args.skip || 0;
    const take = args.first || 20;

    const [teeTimes, total] = await Promise.all([
      this.prisma.teeTime.findMany({
        where,
        orderBy: [{ teeDate: 'asc' }, { teeTime: 'asc' }],
        skip,
        take,
        include: {
          players: {
            include: { member: true, caddy: true, dependent: true },
            orderBy: { position: 'asc' },
          },
          course: true,
        },
      }),
      this.prisma.teeTime.count({ where }),
    ]);

    const edges = teeTimes.map((tt: any) => ({
      node: this.transformTeeTime(tt),
      cursor: encodeCursor(tt.id),
    }));

    const currentPage = Math.floor(skip / take) + 1;
    const totalPages = Math.ceil(total / take);

    return {
      edges,
      pageInfo: {
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
      totalCount: total,
    };
  }

  @Mutation(() => TeeTimeType, { name: 'createTeeTime', description: 'Create a new tee time booking' })
  async createTeeTime(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateTeeTimeInput,
  ): Promise<TeeTimeType> {
    this.logger.debug('createTeeTime called', {
      courseId: input.courseId,
      teeDate: input.teeDate,
      teeTime: input.teeTime,
      holes: input.holes,
      playerCount: input.players?.length,
      tenantId: user.tenantId,
    });

    try {
      const teeTime = await this.flightService.createFlight(
        user.tenantId,
        {
          courseId: input.courseId,
          teeDate: input.teeDate.toISOString().split('T')[0],
          teeTime: input.teeTime,
          holes: input.holes,
          startingHole: input.startingHole,
          players: input.players,
          notes: input.notes,
        },
        user.sub,
        user.email,
      );

      const transformedTeeTime = this.transformTeeTime(teeTime);

      // Publish creation event
      await this.pubSub.publish(SubscriptionEvents.TEE_TIME_CREATED, {
        teeTimeCreated: transformedTeeTime,
        tenantId: user.tenantId,
      });

      this.logger.log(`Tee time created successfully: ${teeTime.id}`);
      return transformedTeeTime;
    } catch (error) {
      this.logger.error('Error creating tee time', error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  @Mutation(() => TeeTimeType, { name: 'updateTeeTime', description: 'Update an existing tee time' })
  async updateTeeTime(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTeeTimeInput,
  ): Promise<TeeTimeType> {
    const teeTime = await this.flightService.updateFlight(
      user.tenantId,
      id,
      input,
      user.sub,
      user.email,
    );

    const transformedTeeTime = this.transformTeeTime(teeTime);

    // Publish update event
    await this.pubSub.publish(SubscriptionEvents.TEE_TIME_UPDATED, {
      teeTimeUpdated: transformedTeeTime,
      tenantId: user.tenantId,
    });

    return transformedTeeTime;
  }

  @Mutation(() => TeeTimeType, { name: 'updateTeeTimePlayers', description: 'Update players for an existing tee time (with proper capacity check)' })
  async updateTeeTimePlayers(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('players', { type: () => [TeeTimePlayerInput] }) players: TeeTimePlayerInput[],
  ): Promise<TeeTimeType> {
    const teeTime = await this.flightService.updateFlightPlayers(
      user.tenantId,
      id,
      players.map(p => ({
        position: p.position,
        playerType: p.playerType,
        memberId: p.memberId,
        guestName: p.guestName,
        guestEmail: p.guestEmail,
        guestPhone: p.guestPhone,
        cartType: p.cartType,
        sharedWithPosition: p.sharedWithPosition,
        caddyId: p.caddyId,
        caddyRequest: p.caddyRequest,
        cartRequest: p.cartRequest,
        cartId: p.cartId,
        rentalRequest: p.rentalRequest,
        cartStatus: p.cartStatus,
        caddyStatus: p.caddyStatus,
      })),
      user.sub,
      user.email,
    );

    const transformedTeeTime = this.transformTeeTime(teeTime);

    // Publish update event
    await this.pubSub.publish(SubscriptionEvents.TEE_TIME_UPDATED, {
      teeTimeUpdated: transformedTeeTime,
      tenantId: user.tenantId,
    });

    return transformedTeeTime;
  }

  @Mutation(() => TeeTimePlayerType, { name: 'updatePlayerRentalStatus', description: 'Update a single player rental status (cart/caddy)' })
  async updatePlayerRentalStatus(
    @GqlCurrentUser() user: JwtPayload,
    @Args('playerId', { type: () => ID }) playerId: string,
    @Args('input') input: UpdatePlayerRentalStatusInput,
  ) {
    const player = await this.playerRentalService.updatePlayerRentalStatus(
      user.tenantId,
      playerId,
      {
        cartStatus: input.cartStatus,
        caddyStatus: input.caddyStatus,
        caddyId: input.caddyId,
      },
      user.sub,
    );
    // Return raw Prisma data - GraphQL will serialize it
    return player as unknown as TeeTimePlayerType;
  }

  @Mutation(() => Boolean, { name: 'regenerateLineItems', description: 'Manually regenerate line items for a tee time' })
  async regenerateLineItems(
    @GqlCurrentUser() user: JwtPayload,
    @Args('teeTimeId', { type: () => ID }) teeTimeId: string,
  ): Promise<boolean> {
    // Verify tee time belongs to tenant
    const teeTime = await this.prisma.teeTime.findFirst({
      where: { id: teeTimeId, clubId: user.tenantId },
    });

    if (!teeTime) {
      throw new Error('Tee time not found');
    }

    await this.lineItemGenerator.generateLineItemsForFlight(teeTimeId);
    return true;
  }

  @Mutation(() => FlightCheckInResponseType, { name: 'checkIn', description: 'Check in all players for a tee time' })
  async checkIn(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<FlightCheckInResponseType> {
    const result = await this.flightService.checkinFlight(
      user.tenantId,
      id,
      user.sub,
      user.email,
    );
    const teeTime = await this.flightService.getFlight(user.tenantId, id);
    const transformedTeeTime = this.transformTeeTime(teeTime);

    // Publish check-in event
    await this.pubSub.publish(SubscriptionEvents.TEE_TIME_CHECKED_IN, {
      teeTimeCheckedIn: transformedTeeTime,
      tenantId: user.tenantId,
    });

    return {
      success: true,
      checkedInAt: result.checkedInAt || new Date(),
      teeTime: transformedTeeTime,
    };
  }

  @Mutation(() => CancelResponseType, { name: 'cancelTeeTime', description: 'Cancel a tee time' })
  async cancelTeeTime(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<CancelResponseType> {
    await this.flightService.cancelFlight(user.tenantId, id, reason || '', user.sub, user.email);

    // Publish cancellation event
    const teeTime = await this.flightService.getFlight(user.tenantId, id);
    await this.pubSub.publish(SubscriptionEvents.TEE_TIME_CANCELLED, {
      teeTimeCancelled: this.transformTeeTime(teeTime),
      tenantId: user.tenantId,
    });

    return { message: 'Tee time cancelled successfully' };
  }

  @Mutation(() => TeeTimeType, { name: 'moveTeeTime', description: 'Move a tee time to a different slot' })
  async moveTeeTime(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: MoveTeeTimeInput,
  ): Promise<TeeTimeType> {
    // Find the existing tee time
    const existingTeeTime = await this.prisma.teeTime.findFirst({
      where: { id, clubId: user.tenantId },
      include: { players: true },
    });

    if (!existingTeeTime) {
      throw new Error('Tee time not found');
    }

    if (existingTeeTime.status === 'CANCELLED') {
      throw new Error('Cannot move a cancelled tee time');
    }

    // Check for capacity at the new slot
    // Multiple bookings can share a flight as long as total players <= 4
    const existingAtDestination = await this.prisma.teeTime.findMany({
      where: {
        clubId: user.tenantId,
        courseId: input.newCourseId || existingTeeTime.courseId,
        teeDate: input.newTeeDate,
        teeTime: input.newTeeTime,
        status: { not: 'CANCELLED' },
        id: { not: id },
      },
      include: { players: true },
    });

    const destinationPlayerCount = existingAtDestination.reduce(
      (total, booking) => total + booking.players.length,
      0,
    );
    const movingPlayerCount = existingTeeTime.players.length;

    if (destinationPlayerCount + movingPlayerCount > 4) {
      const availableSlots = 4 - destinationPlayerCount;
      throw new Error(
        availableSlots > 0
          ? `Only ${availableSlots} position${availableSlots === 1 ? '' : 's'} available at the new time slot`
          : 'The new time slot is fully booked',
      );
    }

    // Update the tee time
    const updatedTeeTime = await this.prisma.teeTime.update({
      where: { id },
      data: {
        courseId: input.newCourseId || existingTeeTime.courseId,
        teeDate: input.newTeeDate,
        teeTime: input.newTeeTime,
        updatedAt: new Date(),
      },
      include: {
        course: true,
        players: {
          include: { member: true, caddy: true, dependent: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    const transformedTeeTime = this.transformTeeTime(updatedTeeTime);

    // Publish update event
    await this.pubSub.publish(SubscriptionEvents.TEE_TIME_UPDATED, {
      teeTimeUpdated: transformedTeeTime,
      tenantId: user.tenantId,
    });

    return transformedTeeTime;
  }

  // ============================================
  // Course Schedule Queries & Mutations (US-10)
  // ============================================

  @Query(() => [GolfCourseScheduleType], { name: 'courseSchedules', description: 'Get schedules for a course' })
  async getCourseSchedules(
    @GqlCurrentUser() user: JwtPayload,
    @Args('courseId', { type: () => ID }) courseId: string,
  ): Promise<GolfCourseScheduleType[]> {
    const schedules = await this.prisma.golfCourseSchedule.findMany({
      where: {
        courseId,
        course: { clubId: user.tenantId },
      },
      include: { intervals: true },
      orderBy: { startDate: 'desc' },
    });

    return schedules.map(this.transformSchedule);
  }

  @Query(() => GolfCourseScheduleType, { name: 'activeSchedule', description: 'Get active schedule for a course and date', nullable: true })
  async getActiveSchedule(
    @GqlCurrentUser() user: JwtPayload,
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('date') date: Date,
  ): Promise<GolfCourseScheduleType | null> {
    const schedule = await this.prisma.golfCourseSchedule.findFirst({
      where: {
        courseId,
        course: { clubId: user.tenantId },
        isActive: true,
        startDate: { lte: date },
        endDate: { gte: date },
      },
      include: { intervals: true },
    });

    return schedule ? this.transformSchedule(schedule) : null;
  }

  @Mutation(() => ScheduleMutationResponse, { name: 'createCourseSchedule', description: 'Create a course schedule' })
  async createCourseSchedule(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateScheduleInput,
  ): Promise<ScheduleMutationResponse> {
    // Verify course belongs to tenant
    const course = await this.prisma.golfCourse.findFirst({
      where: { id: input.courseId, clubId: user.tenantId },
    });

    if (!course) {
      return { success: false, message: 'Course not found' };
    }

    const schedule = await this.prisma.golfCourseSchedule.create({
      data: {
        courseId: input.courseId,
        seasonName: input.seasonName,
        startDate: input.startDate,
        endDate: input.endDate,
        firstTeeTime: input.firstTeeTime,
        lastTeeTime: input.lastTeeTime,
        playFormat: input.playFormat,
        paceOfPlay: input.paceOfPlay,
        isActive: true,
        intervals: input.intervals ? {
          create: input.intervals.map(i => ({
            dayType: i.dayType,
            timeStart: i.timeStart,
            timeEnd: i.timeEnd,
            intervalMin: i.intervalMin,
            isPrimeTime: i.isPrimeTime,
          })),
        } : undefined,
      },
      include: { intervals: true },
    });

    return {
      success: true,
      schedule: this.transformSchedule(schedule),
    };
  }

  @Mutation(() => ScheduleMutationResponse, { name: 'updateCourseSchedule', description: 'Update a course schedule' })
  async updateCourseSchedule(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateScheduleInput,
  ): Promise<ScheduleMutationResponse> {
    // Verify schedule belongs to tenant's course
    const existing = await this.prisma.golfCourseSchedule.findFirst({
      where: { id, course: { clubId: user.tenantId } },
    });

    if (!existing) {
      return { success: false, message: 'Schedule not found' };
    }

    const schedule = await this.prisma.golfCourseSchedule.update({
      where: { id },
      data: {
        seasonName: input.seasonName,
        startDate: input.startDate,
        endDate: input.endDate,
        firstTeeTime: input.firstTeeTime,
        lastTeeTime: input.lastTeeTime,
        playFormat: input.playFormat,
        paceOfPlay: input.paceOfPlay,
        isActive: input.isActive,
      },
      include: { intervals: true },
    });

    return {
      success: true,
      schedule: this.transformSchedule(schedule),
    };
  }

  @Mutation(() => ScheduleMutationResponse, { name: 'deleteCourseSchedule', description: 'Delete a course schedule' })
  async deleteCourseSchedule(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ScheduleMutationResponse> {
    // Verify schedule belongs to tenant's course
    const existing = await this.prisma.golfCourseSchedule.findFirst({
      where: { id, course: { clubId: user.tenantId } },
    });

    if (!existing) {
      return { success: false, message: 'Schedule not found' };
    }

    await this.prisma.golfCourseSchedule.delete({ where: { id } });

    return { success: true, message: 'Schedule deleted successfully' };
  }

  // ============================================
  // Tee Time Block Queries & Mutations (US-2)
  // ============================================

  @Query(() => [TeeTimeBlockType], { name: 'teeTimeBlocks', description: 'Get tee time blocks for a course' })
  async getTeeTimeBlocks(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: BlocksQueryArgs,
  ): Promise<TeeTimeBlockType[]> {
    const where: any = {
      courseId: args.courseId,
      course: { clubId: user.tenantId },
    };

    if (args.startDate) {
      where.startTime = { gte: args.startDate };
    }
    if (args.endDate) {
      where.endTime = { ...where.endTime, lte: args.endDate };
    }
    if (args.blockType) {
      where.blockType = args.blockType;
    }

    const blocks = await this.prisma.teeTimeBlock.findMany({
      where,
      include: { course: true },
      orderBy: { startTime: 'asc' },
    });

    return blocks.map(this.transformBlock.bind(this));
  }

  @Mutation(() => BlockMutationResponse, { name: 'createTeeTimeBlock', description: 'Create a tee time block' })
  async createTeeTimeBlock(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateBlockInput,
  ): Promise<BlockMutationResponse> {
    // Verify course belongs to tenant
    const course = await this.prisma.golfCourse.findFirst({
      where: { id: input.courseId, clubId: user.tenantId },
    });

    if (!course) {
      return { success: false, message: 'Course not found' };
    }

    // Check for conflicting bookings
    const conflictingTeeTimes = await this.prisma.teeTime.findMany({
      where: {
        courseId: input.courseId,
        teeDate: {
          gte: new Date(input.startTime.toISOString().split('T')[0] || ''),
          lte: new Date(input.endTime.toISOString().split('T')[0] || ''),
        },
        status: { notIn: ['CANCELLED'] },
      },
      take: 5,
    });

    if (conflictingTeeTimes.length > 0) {
      return {
        success: false,
        message: `Warning: ${conflictingTeeTimes.length} existing bookings conflict with this block`,
      };
    }

    const block = await this.prisma.teeTimeBlock.create({
      data: {
        courseId: input.courseId,
        startTime: input.startTime,
        endTime: input.endTime,
        blockType: input.blockType,
        reason: input.reason,
        isRecurring: input.isRecurring,
        recurringPattern: input.recurringPattern,
        createdBy: user.sub,
      },
      include: { course: true },
    });

    return {
      success: true,
      block: this.transformBlock(block),
    };
  }

  @Mutation(() => BlockMutationResponse, { name: 'updateTeeTimeBlock', description: 'Update a tee time block' })
  async updateTeeTimeBlock(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBlockInput,
  ): Promise<BlockMutationResponse> {
    // Verify block belongs to tenant's course
    const existing = await this.prisma.teeTimeBlock.findFirst({
      where: { id, course: { clubId: user.tenantId } },
    });

    if (!existing) {
      return { success: false, message: 'Block not found' };
    }

    const block = await this.prisma.teeTimeBlock.update({
      where: { id },
      data: {
        startTime: input.startTime,
        endTime: input.endTime,
        blockType: input.blockType,
        reason: input.reason,
        isRecurring: input.isRecurring,
        recurringPattern: input.recurringPattern,
      },
      include: { course: true },
    });

    return {
      success: true,
      block: this.transformBlock(block),
    };
  }

  @Mutation(() => BlockMutationResponse, { name: 'deleteTeeTimeBlock', description: 'Delete a tee time block' })
  async deleteTeeTimeBlock(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<BlockMutationResponse> {
    // Verify block belongs to tenant's course
    const existing = await this.prisma.teeTimeBlock.findFirst({
      where: { id, course: { clubId: user.tenantId } },
    });

    if (!existing) {
      return { success: false, message: 'Block not found' };
    }

    await this.prisma.teeTimeBlock.delete({ where: { id } });

    return { success: true, message: 'Block deleted successfully' };
  }

  // ============================================
  // Tee Ticket Queries (Phase 8)
  // ============================================

  @Query(() => TeeTicketType, { name: 'generateTeeTicket', description: 'Generate a tee ticket for a tee time', nullable: true })
  async generateTeeTicket(
    @GqlCurrentUser() user: JwtPayload,
    @Args('teeTimeId', { type: () => ID }) teeTimeId: string,
  ): Promise<TeeTicketType | null> {
    const ticketData = await this.teeTicketService.generateTeeTicket(teeTimeId, user.tenantId);

    if (!ticketData) {
      return null;
    }

    return {
      ticketNumber: ticketData.ticketNumber,
      clubName: ticketData.clubName,
      clubLogo: ticketData.clubLogo,
      courseName: ticketData.courseName,
      teeDate: ticketData.teeDate,
      teeTime: ticketData.teeTime,
      holes: ticketData.holes,
      players: ticketData.players.map(p => ({
        position: p.position,
        name: p.name,
        type: p.type,
        memberId: p.memberId,
        handicap: p.handicap,
        cartType: p.cartType,
        caddyName: p.caddyName,
      })),
      cartAssignment: ticketData.cartAssignment,
      caddyAssignment: ticketData.caddyAssignment,
      checkedInAt: ticketData.checkedInAt,
      checkedInBy: ticketData.checkedInBy,
      notes: ticketData.notes,
      qrCode: ticketData.qrCode,
      barcode: ticketData.barcode,
    };
  }

  @Query(() => TeeTicketValidationResult, { name: 'validateTeeTicket', description: 'Validate a tee ticket by barcode' })
  async validateTeeTicket(
    @GqlCurrentUser() user: JwtPayload,
    @Args('barcode') barcode: string,
  ): Promise<TeeTicketValidationResult> {
    return this.teeTicketService.validateTicket(barcode, user.tenantId);
  }

  // ============================================
  // Subscriptions
  // ============================================

  /**
   * SECURITY: All subscription filters MUST verify tenantId to prevent cross-tenant data leakage.
   * The filter function receives (payload, variables, context) where context contains the user.
   */

  @Subscription(() => TeeTimeType, {
    name: 'teeTimeUpdated',
    description: 'Subscribe to tee time updates for a specific course and date',
    filter: (payload, variables, context) => {
      // SECURITY: Always verify tenant isolation first
      const userTenantId = context?.req?.user?.tenantId;
      if (!userTenantId || payload.tenantId !== userTenantId) {
        return false;
      }

      // Filter by courseId and date if provided
      const teeTime = payload.teeTimeUpdated;
      if (variables.courseId && teeTime.course?.id !== variables.courseId) {
        return false;
      }
      if (variables.date) {
        const teeDate = new Date(teeTime.teeDate).toISOString().split('T')[0];
        const filterDate = new Date(variables.date).toISOString().split('T')[0];
        if (teeDate !== filterDate) {
          return false;
        }
      }
      return true;
    },
  })
  teeTimeUpdated(
    @Args('courseId', { type: () => ID, nullable: true }) _courseId?: string,
    @Args('date', { nullable: true }) _date?: Date,
  ) {
    return this.pubSub.asyncIterator(SubscriptionEvents.TEE_TIME_UPDATED);
  }

  @Subscription(() => TeeTimeType, {
    name: 'teeTimeCreated',
    description: 'Subscribe to new tee time creations',
    filter: (payload, variables, context) => {
      // SECURITY: Always verify tenant isolation first
      const userTenantId = context?.req?.user?.tenantId;
      if (!userTenantId || payload.tenantId !== userTenantId) {
        return false;
      }

      const teeTime = payload.teeTimeCreated;
      if (variables.courseId && teeTime.course?.id !== variables.courseId) {
        return false;
      }
      return true;
    },
  })
  teeTimeCreated(
    @Args('courseId', { type: () => ID, nullable: true }) _courseId?: string,
  ) {
    return this.pubSub.asyncIterator(SubscriptionEvents.TEE_TIME_CREATED);
  }

  @Subscription(() => TeeTimeType, {
    name: 'teeTimeCancelled',
    description: 'Subscribe to tee time cancellations',
    filter: (payload, _variables, context) => {
      // SECURITY: Always verify tenant isolation
      const userTenantId = context?.req?.user?.tenantId;
      return userTenantId && payload.tenantId === userTenantId;
    },
  })
  teeTimeCancelled() {
    return this.pubSub.asyncIterator(SubscriptionEvents.TEE_TIME_CANCELLED);
  }

  @Subscription(() => TeeTimeType, {
    name: 'teeTimeCheckedIn',
    description: 'Subscribe to tee time check-ins',
    filter: (payload, _variables, context) => {
      // SECURITY: Always verify tenant isolation
      const userTenantId = context?.req?.user?.tenantId;
      return userTenantId && payload.tenantId === userTenantId;
    },
  })
  teeTimeCheckedIn() {
    return this.pubSub.asyncIterator(SubscriptionEvents.TEE_TIME_CHECKED_IN);
  }

  private transformTeeTime(teeTime: any): TeeTimeType {
    return {
      id: teeTime.id,
      teeTimeNumber: teeTime.teeTimeNumber,
      teeDate: teeTime.teeDate,
      teeTime: teeTime.teeTime,
      holes: teeTime.holes,
      startingHole: teeTime.startingHole ?? 1,
      status: teeTime.status,
      notes: teeTime.notes,
      createdAt: teeTime.createdAt,
      updatedAt: teeTime.updatedAt,
      course: teeTime.course ? {
        id: teeTime.course.id,
        name: teeTime.course.name,
        code: teeTime.course.code,
        description: teeTime.course.description,
        holes: teeTime.course.holes,
        par: teeTime.course.par,
        slope: teeTime.course.slope,
        rating: teeTime.course.rating?.toNumber(),
        firstTeeTime: teeTime.course.firstTeeTime,
        lastTeeTime: teeTime.course.lastTeeTime,
        teeInterval: teeTime.course.teeInterval,
        isActive: teeTime.course.isActive,
      } : undefined,
      players: teeTime.players?.map((p: any) => ({
        id: p.id,
        position: p.position,
        playerType: p.playerType,
        member: p.member ? {
          id: p.member.id,
          memberId: p.member.memberId,
          firstName: p.member.firstName,
          lastName: p.member.lastName,
        } : undefined,
        dependent: p.dependent ? {
          id: p.dependent.id,
          firstName: p.dependent.firstName,
          lastName: p.dependent.lastName,
          relationship: p.dependent.relationship,
          memberId: p.dependent.memberId,
        } : undefined,
        guestName: p.guestName,
        guestEmail: p.guestEmail,
        guestPhone: p.guestPhone,
        cartType: p.cartType,
        sharedWithPosition: p.sharedWithPosition,
        caddy: p.caddy ? {
          id: p.caddy.id,
          caddyNumber: p.caddy.caddyNumber,
          firstName: p.caddy.firstName,
          lastName: p.caddy.lastName,
          phone: p.caddy.phone,
          isActive: p.caddy.isActive,
        } : undefined,
        // Per-player booking options (Task #6)
        caddyRequest: p.caddyRequest,
        cartRequest: p.cartRequest,
        rentalRequest: p.rentalRequest,
        // Rental status tracking
        cartStatus: p.cartStatus,
        caddyStatus: p.caddyStatus,
        checkedInAt: p.checkedInAt,
      })) || [],
      // Booking groups for multiple bookings at same time slot
      bookingGroups: teeTime.bookingGroups?.map((g: any) => ({
        id: g.id,
        groupNumber: g.groupNumber,
        bookedBy: {
          id: g.bookedBy?.id || '',
          name: g.bookedBy?.name || 'Unknown',
          memberId: g.bookedBy?.memberId,
        },
        playerIds: g.playerIds || [],
      })),
    };
  }

  private transformSchedule(schedule: any): GolfCourseScheduleType {
    return {
      id: schedule.id,
      courseId: schedule.courseId,
      seasonName: schedule.seasonName,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      firstTeeTime: schedule.firstTeeTime,
      lastTeeTime: schedule.lastTeeTime,
      playFormat: schedule.playFormat as PlayFormat,
      paceOfPlay: schedule.paceOfPlay,
      isActive: schedule.isActive,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
      intervals: schedule.intervals?.map((i: any) => ({
        id: i.id,
        dayType: i.dayType as DayType,
        timeStart: i.timeStart,
        timeEnd: i.timeEnd,
        intervalMin: i.intervalMin,
        isPrimeTime: i.isPrimeTime,
      })) || [],
    };
  }

  private transformBlock(block: any): TeeTimeBlockType {
    return {
      id: block.id,
      courseId: block.courseId,
      startTime: block.startTime,
      endTime: block.endTime,
      blockType: block.blockType as BlockType,
      reason: block.reason,
      isRecurring: block.isRecurring,
      recurringPattern: block.recurringPattern,
      createdAt: block.createdAt,
      updatedAt: block.updatedAt,
      course: block.course ? {
        id: block.course.id,
        name: block.course.name,
        code: block.course.code,
        description: block.course.description,
        holes: block.course.holes,
        par: block.course.par,
        slope: block.course.slope,
        rating: block.course.rating?.toNumber(),
        firstTeeTime: block.course.firstTeeTime,
        lastTeeTime: block.course.lastTeeTime,
        teeInterval: block.course.teeInterval,
        isActive: block.course.isActive,
      } : undefined,
    };
  }

  // ============================================
  // Rate Configuration Queries & Mutations (Task #17)
  // ============================================

  @Query(() => [RateConfigType], { name: 'golfRates', description: 'Get rate configurations for a course' })
  async getGolfRates(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: RateConfigsQueryArgs,
  ): Promise<RateConfigType[]> {
    const configs = await this.ratesService.getRateConfigs(
      user.tenantId,
      args.courseId,
      args.activeOnly,
    );
    return configs.map(this.transformRateConfig);
  }

  @Query(() => RateConfigType, { name: 'rateConfig', description: 'Get a single rate configuration by ID' })
  async getRateConfig(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<RateConfigType> {
    const config = await this.ratesService.getRateConfig(user.tenantId, id);
    return this.transformRateConfig(config);
  }

  @Mutation(() => RateConfigMutationResponse, { name: 'createRateConfig', description: 'Create a rate configuration' })
  async createRateConfig(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateRateConfigInput,
  ): Promise<RateConfigMutationResponse> {
    try {
      const config = await this.ratesService.createRateConfig(user.tenantId, input);
      return {
        success: true,
        rateConfig: this.transformRateConfig(config),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => RateConfigMutationResponse, { name: 'updateRateConfig', description: 'Update a rate configuration' })
  async updateRateConfig(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateRateConfigInput,
  ): Promise<RateConfigMutationResponse> {
    try {
      const config = await this.ratesService.updateRateConfig(user.tenantId, id, input);
      return {
        success: true,
        rateConfig: this.transformRateConfig(config),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => DeleteRateMutationResponse, { name: 'deleteRateConfig', description: 'Delete a rate configuration' })
  async deleteRateConfig(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteRateMutationResponse> {
    try {
      await this.ratesService.deleteRateConfig(user.tenantId, id);
      return {
        success: true,
        message: 'Rate configuration deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Green Fee Rate Mutations

  @Mutation(() => GreenFeeRateMutationResponse, { name: 'createGreenFeeRate', description: 'Create a green fee rate' })
  async createGreenFeeRate(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateGreenFeeRateInput,
  ): Promise<GreenFeeRateMutationResponse> {
    try {
      const rate = await this.ratesService.createGreenFeeRate(user.tenantId, input);
      return {
        success: true,
        greenFeeRate: this.transformGreenFeeRate(rate),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => GreenFeeRateMutationResponse, { name: 'updateGreenFeeRate', description: 'Update a green fee rate' })
  async updateGreenFeeRate(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateGreenFeeRateInput,
  ): Promise<GreenFeeRateMutationResponse> {
    try {
      const rate = await this.ratesService.updateGreenFeeRate(user.tenantId, id, input);
      return {
        success: true,
        greenFeeRate: this.transformGreenFeeRate(rate),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => DeleteRateMutationResponse, { name: 'deleteGreenFeeRate', description: 'Delete a green fee rate' })
  async deleteGreenFeeRate(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteRateMutationResponse> {
    try {
      await this.ratesService.deleteGreenFeeRate(user.tenantId, id);
      return {
        success: true,
        message: 'Green fee rate deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Cart Rate Mutations

  @Mutation(() => CartRateMutationResponse, { name: 'createCartRate', description: 'Create a cart rate' })
  async createCartRate(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateCartRateInput,
  ): Promise<CartRateMutationResponse> {
    try {
      const rate = await this.ratesService.createCartRate(user.tenantId, input);
      return {
        success: true,
        cartRate: this.transformCartRate(rate),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => CartRateMutationResponse, { name: 'updateCartRate', description: 'Update a cart rate' })
  async updateCartRate(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCartRateInput,
  ): Promise<CartRateMutationResponse> {
    try {
      const rate = await this.ratesService.updateCartRate(user.tenantId, id, input);
      return {
        success: true,
        cartRate: this.transformCartRate(rate),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => DeleteRateMutationResponse, { name: 'deleteCartRate', description: 'Delete a cart rate' })
  async deleteCartRate(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteRateMutationResponse> {
    try {
      await this.ratesService.deleteCartRate(user.tenantId, id);
      return {
        success: true,
        message: 'Cart rate deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Caddy Rate Mutations

  @Mutation(() => CaddyRateMutationResponse, { name: 'createCaddyRate', description: 'Create a caddy rate' })
  async createCaddyRate(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateCaddyRateInput,
  ): Promise<CaddyRateMutationResponse> {
    try {
      const rate = await this.ratesService.createCaddyRate(user.tenantId, input);
      return {
        success: true,
        caddyRate: this.transformCaddyRate(rate),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => CaddyRateMutationResponse, { name: 'updateCaddyRate', description: 'Update a caddy rate' })
  async updateCaddyRate(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCaddyRateInput,
  ): Promise<CaddyRateMutationResponse> {
    try {
      const rate = await this.ratesService.updateCaddyRate(user.tenantId, id, input);
      return {
        success: true,
        caddyRate: this.transformCaddyRate(rate),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => DeleteRateMutationResponse, { name: 'deleteCaddyRate', description: 'Delete a caddy rate' })
  async deleteCaddyRate(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteRateMutationResponse> {
    try {
      await this.ratesService.deleteCaddyRate(user.tenantId, id);
      return {
        success: true,
        message: 'Caddy rate deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Helper transformation methods for rate types

  private transformRateConfig(config: any): RateConfigType {
    return {
      id: config.id,
      courseId: config.courseId,
      name: config.name,
      description: config.description,
      isActive: config.isActive,
      effectiveFrom: config.effectiveFrom,
      effectiveTo: config.effectiveTo,
      greenFeeRates: config.greenFeeRates?.map(this.transformGreenFeeRate) || [],
      cartRates: config.cartRates?.map(this.transformCartRate) || [],
      caddyRates: config.caddyRates?.map(this.transformCaddyRate) || [],
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  private transformGreenFeeRate(rate: any): GreenFeeRateType {
    return {
      id: rate.id,
      playerType: rate.playerType,
      holes: rate.holes,
      timeCategory: rate.timeCategory,
      amount: rate.amount.toNumber ? rate.amount.toNumber() : rate.amount,
      taxType: rate.taxType,
      taxRate: rate.taxRate.toNumber ? rate.taxRate.toNumber() : rate.taxRate,
      createdAt: rate.createdAt,
      updatedAt: rate.updatedAt,
    };
  }

  private transformCartRate(rate: any): CartRateType {
    return {
      id: rate.id,
      cartType: rate.cartType,
      amount: rate.amount.toNumber ? rate.amount.toNumber() : rate.amount,
      taxType: rate.taxType,
      taxRate: rate.taxRate.toNumber ? rate.taxRate.toNumber() : rate.taxRate,
      createdAt: rate.createdAt,
      updatedAt: rate.updatedAt,
    };
  }

  private transformCaddyRate(rate: any): CaddyRateType {
    return {
      id: rate.id,
      caddyType: rate.caddyType,
      amount: rate.amount.toNumber ? rate.amount.toNumber() : rate.amount,
      taxType: rate.taxType,
      taxRate: rate.taxRate.toNumber ? rate.taxRate.toNumber() : rate.taxRate,
      createdAt: rate.createdAt,
      updatedAt: rate.updatedAt,
    };
  }
}

import { Resolver, Query, Mutation, Subscription, Args, ID } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { GolfService } from '@/modules/golf/golf.service';
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
} from './golf.input';
import { encodeCursor } from '../common/pagination';
import { PUBSUB_TOKEN, SubscriptionEvents } from '../common/pubsub';

@Resolver(() => TeeTimeType)
@UseGuards(GqlAuthGuard)
export class GolfResolver {
  constructor(
    private readonly golfService: GolfService,
    private readonly teeTicketService: TeeTicketService,
    private readonly prisma: PrismaService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(PUBSUB_TOKEN) private readonly pubSub: any,
  ) {}

  @Query(() => [TeeSheetSlotType], { name: 'teeSheet', description: 'Get tee sheet for a course and date' })
  async getTeeSheet(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: TeeSheetArgs,
  ): Promise<TeeSheetSlotType[]> {
    const dateStr = args.date.toISOString().split('T')[0];
    const slots = await this.golfService.getTeeSheet(user.tenantId, args.courseId, dateStr);

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
      slope: c.slope?.toNumber(),
      rating: c.rating?.toNumber(),
      firstTeeTime: c.firstTeeTime,
      lastTeeTime: c.lastTeeTime,
      teeInterval: c.teeInterval,
      isActive: c.isActive,
    }));
  }

  @Query(() => TeeTimeType, { name: 'teeTime', description: 'Get a single tee time by ID' })
  async getTeeTime(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<TeeTimeType> {
    const teeTime = await this.golfService.getFlight(user.tenantId, id);
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
            include: { member: true, caddy: true },
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
    const teeTime = await this.golfService.createFlight(
      user.tenantId,
      {
        courseId: input.courseId,
        teeDate: input.teeDate.toISOString().split('T')[0],
        teeTime: input.teeTime,
        holes: input.holes,
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

    return transformedTeeTime;
  }

  @Mutation(() => TeeTimeType, { name: 'updateTeeTime', description: 'Update an existing tee time' })
  async updateTeeTime(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTeeTimeInput,
  ): Promise<TeeTimeType> {
    const teeTime = await this.golfService.updateFlight(
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

  @Mutation(() => FlightCheckInResponseType, { name: 'checkIn', description: 'Check in all players for a tee time' })
  async checkIn(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<FlightCheckInResponseType> {
    const result = await this.golfService.checkinFlight(
      user.tenantId,
      id,
      user.sub,
      user.email,
    );
    const teeTime = await this.golfService.getFlight(user.tenantId, id);
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
    await this.golfService.cancelFlight(user.tenantId, id, reason || '', user.sub, user.email);

    // Publish cancellation event
    const teeTime = await this.golfService.getFlight(user.tenantId, id);
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

    // Check for conflicts at the new slot
    const conflictingTeeTime = await this.prisma.teeTime.findFirst({
      where: {
        clubId: user.tenantId,
        courseId: input.newCourseId || existingTeeTime.courseId,
        teeDate: input.newTeeDate,
        teeTime: input.newTeeTime,
        status: { not: 'CANCELLED' },
        id: { not: id },
      },
    });

    if (conflictingTeeTime) {
      throw new Error('The new time slot is already booked');
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
          include: { member: true, caddy: true },
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

  @Subscription(() => TeeTimeType, {
    name: 'teeTimeUpdated',
    description: 'Subscribe to tee time updates for a specific course and date',
    filter: (payload, variables) => {
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
    filter: (payload, variables) => {
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
  })
  teeTimeCancelled() {
    return this.pubSub.asyncIterator(SubscriptionEvents.TEE_TIME_CANCELLED);
  }

  @Subscription(() => TeeTimeType, {
    name: 'teeTimeCheckedIn',
    description: 'Subscribe to tee time check-ins',
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
        slope: teeTime.course.slope?.toNumber(),
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
        checkedInAt: p.checkedInAt,
      })) || [],
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
        slope: block.course.slope?.toNumber(),
        rating: block.course.rating?.toNumber(),
        firstTeeTime: block.course.firstTeeTime,
        lastTeeTime: block.course.lastTeeTime,
        teeInterval: block.course.teeInterval,
        isActive: block.course.isActive,
      } : undefined,
    };
  }
}

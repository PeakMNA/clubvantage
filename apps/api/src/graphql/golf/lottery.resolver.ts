import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
  GolfLotteryType,
  GolfLotteryRequestType,
  LotteryMutationResponse,
  LotteryRequestMutationResponse,
  LotteryDrawResult,
  LotteryType,
  LotteryStatus,
  LotteryRequestStatus,
  GolfCourseType,
  PlayerMemberType,
} from './golf.types';
import {
  CreateLotteryInput,
  UpdateLotteryInput,
  CreateLotteryRequestInput,
  LotteriesQueryArgs,
} from './golf.input';

@Resolver(() => GolfLotteryType)
@UseGuards(GqlAuthGuard)
export class LotteryResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [GolfLotteryType], { name: 'lotteries', description: 'Get lotteries' })
  async getLotteries(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: LotteriesQueryArgs,
  ): Promise<GolfLotteryType[]> {
    const where: any = {
      clubId: user.tenantId,
    };

    if (args.courseId) where.courseId = args.courseId;
    if (args.status) where.status = args.status;
    if (args.startDate) where.lotteryDate = { gte: args.startDate };
    if (args.endDate) {
      where.lotteryDate = { ...where.lotteryDate, lte: args.endDate };
    }

    const lotteries = await this.prisma.golfLottery.findMany({
      where,
      include: {
        course: true,
        _count: { select: { requests: true } },
      },
      orderBy: { lotteryDate: 'asc' },
    });

    return lotteries.map((l) => this.transformLottery(l, l._count.requests));
  }

  @Query(() => GolfLotteryType, { name: 'lottery', description: 'Get a single lottery' })
  async getLottery(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<GolfLotteryType> {
    const lottery = await this.prisma.golfLottery.findFirst({
      where: { id, clubId: user.tenantId },
      include: {
        course: true,
        requests: {
          include: {
            lottery: false,
          },
          orderBy: [{ drawOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!lottery) {
      throw new Error('Lottery not found');
    }

    return this.transformLotteryWithRequests(lottery);
  }

  @Query(() => [GolfLotteryType], { name: 'openLotteries', description: 'Get open lotteries for member portal' })
  async getOpenLotteries(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<GolfLotteryType[]> {
    const now = new Date();

    const lotteries = await this.prisma.golfLottery.findMany({
      where: {
        clubId: user.tenantId,
        status: 'OPEN',
        requestWindowStart: { lte: now },
        requestWindowEnd: { gte: now },
      },
      include: {
        course: true,
        _count: { select: { requests: true } },
      },
      orderBy: { lotteryDate: 'asc' },
    });

    return lotteries.map((l) => this.transformLottery(l, l._count.requests));
  }

  @Query(() => [GolfLotteryRequestType], { name: 'myLotteryRequests', description: 'Get current user lottery requests' })
  async getMyLotteryRequests(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<GolfLotteryRequestType[]> {
    // Get member ID for current user via the User relation
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      include: { member: true },
    });

    if (!currentUser?.member) {
      return [];
    }

    const member = currentUser.member;

    const requests = await this.prisma.golfLotteryRequest.findMany({
      where: { memberId: member.id },
      include: {
        lottery: {
          include: { course: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map(this.transformLotteryRequest.bind(this));
  }

  @Mutation(() => LotteryMutationResponse, { name: 'createLottery', description: 'Create a lottery' })
  async createLottery(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateLotteryInput,
  ): Promise<LotteryMutationResponse> {
    // Verify course belongs to tenant
    const course = await this.prisma.golfCourse.findFirst({
      where: { id: input.courseId, clubId: user.tenantId },
    });

    if (!course) {
      return { success: false, message: 'Course not found' };
    }

    // Validate window times
    if (input.requestWindowEnd <= input.requestWindowStart) {
      return { success: false, message: 'Request window end must be after start' };
    }

    if (input.drawTime <= input.requestWindowEnd) {
      return { success: false, message: 'Draw time must be after request window ends' };
    }

    const lottery = await this.prisma.golfLottery.create({
      data: {
        clubId: user.tenantId,
        courseId: input.courseId,
        lotteryDate: input.lotteryDate,
        lotteryType: input.lotteryType as any,
        requestWindowStart: input.requestWindowStart,
        requestWindowEnd: input.requestWindowEnd,
        drawTime: input.drawTime,
        timeRangeStart: input.timeRangeStart,
        timeRangeEnd: input.timeRangeEnd,
        maxRequestsPerMember: input.maxRequestsPerMember,
        status: 'DRAFT',
        createdBy: user.sub,
      },
      include: { course: true },
    });

    return {
      success: true,
      lottery: this.transformLottery(lottery, 0),
    };
  }

  @Mutation(() => LotteryMutationResponse, { name: 'updateLottery', description: 'Update a lottery' })
  async updateLottery(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateLotteryInput,
  ): Promise<LotteryMutationResponse> {
    const existing = await this.prisma.golfLottery.findFirst({
      where: { id, clubId: user.tenantId },
    });

    if (!existing) {
      return { success: false, message: 'Lottery not found' };
    }

    // Don't allow modifying drawn/published lotteries
    if (['DRAWN', 'PUBLISHED'].includes(existing.status)) {
      return { success: false, message: 'Cannot modify a lottery that has been drawn' };
    }

    const lottery = await this.prisma.golfLottery.update({
      where: { id },
      data: {
        lotteryDate: input.lotteryDate,
        lotteryType: input.lotteryType as any,
        requestWindowStart: input.requestWindowStart,
        requestWindowEnd: input.requestWindowEnd,
        drawTime: input.drawTime,
        timeRangeStart: input.timeRangeStart,
        timeRangeEnd: input.timeRangeEnd,
        status: input.status as any,
        maxRequestsPerMember: input.maxRequestsPerMember,
      },
      include: { course: true },
    });

    const requestCount = await this.prisma.golfLotteryRequest.count({
      where: { lotteryId: id },
    });

    return {
      success: true,
      lottery: this.transformLottery(lottery, requestCount),
    };
  }

  @Mutation(() => LotteryMutationResponse, { name: 'openLottery', description: 'Open a lottery for requests' })
  async openLottery(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LotteryMutationResponse> {
    const existing = await this.prisma.golfLottery.findFirst({
      where: { id, clubId: user.tenantId },
    });

    if (!existing) {
      return { success: false, message: 'Lottery not found' };
    }

    if (existing.status !== 'DRAFT') {
      return { success: false, message: 'Only draft lotteries can be opened' };
    }

    const lottery = await this.prisma.golfLottery.update({
      where: { id },
      data: { status: 'OPEN' },
      include: { course: true },
    });

    return {
      success: true,
      lottery: this.transformLottery(lottery, 0),
    };
  }

  @Mutation(() => LotteryMutationResponse, { name: 'closeLottery', description: 'Close a lottery to new requests' })
  async closeLottery(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LotteryMutationResponse> {
    const existing = await this.prisma.golfLottery.findFirst({
      where: { id, clubId: user.tenantId },
    });

    if (!existing) {
      return { success: false, message: 'Lottery not found' };
    }

    if (existing.status !== 'OPEN') {
      return { success: false, message: 'Only open lotteries can be closed' };
    }

    const lottery = await this.prisma.golfLottery.update({
      where: { id },
      data: { status: 'CLOSED' },
      include: { course: true },
    });

    const requestCount = await this.prisma.golfLotteryRequest.count({
      where: { lotteryId: id },
    });

    return {
      success: true,
      lottery: this.transformLottery(lottery, requestCount),
    };
  }

  @Mutation(() => LotteryDrawResult, { name: 'executeLotteryDraw', description: 'Execute the lottery draw' })
  async executeLotteryDraw(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LotteryDrawResult> {
    const lottery = await this.prisma.golfLottery.findFirst({
      where: { id, clubId: user.tenantId },
      include: {
        course: true,
        requests: {
          where: { status: 'PENDING' },
        },
      },
    });

    if (!lottery) {
      return {
        success: false,
        message: 'Lottery not found',
        totalRequests: 0,
        assignedCount: 0,
        waitlistedCount: 0,
      };
    }

    if (lottery.status !== 'CLOSED') {
      return {
        success: false,
        message: 'Lottery must be closed before drawing',
        totalRequests: lottery.requests.length,
        assignedCount: 0,
        waitlistedCount: 0,
      };
    }

    const requests = lottery.requests;

    // Assign random draw order to each request
    const shuffled = [...requests].sort(() => Math.random() - 0.5);

    // Generate available time slots
    const availableSlots = this.generateTimeSlots(
      lottery.timeRangeStart,
      lottery.timeRangeEnd,
      lottery.course?.teeInterval || 8,
    );

    // Track slot assignments (each slot can accommodate up to 4 players)
    const slotCapacity: Record<string, number> = {};
    for (const slot of availableSlots) {
      slotCapacity[slot] = 4;
    }

    let assignedCount = 0;
    let waitlistedCount = 0;

    // Process requests in random order
    for (let i = 0; i < shuffled.length; i++) {
      const request = shuffled[i];
      if (!request) continue;

      let assignedTime: string | null = null;

      // Try to assign based on preferences
      const preferences = [request.preference1, request.preference2, request.preference3].filter(Boolean);

      for (const pref of preferences) {
        if (pref && slotCapacity[pref] && slotCapacity[pref]! >= request.playerCount) {
          assignedTime = pref;
          slotCapacity[pref]! -= request.playerCount;
          break;
        }
      }

      // If no preferred time available, try any available slot
      if (!assignedTime) {
        for (const slot of availableSlots) {
          if (slotCapacity[slot]! >= request.playerCount) {
            assignedTime = slot;
            slotCapacity[slot]! -= request.playerCount;
            break;
          }
        }
      }

      // Update request with draw result
      if (assignedTime) {
        await this.prisma.golfLotteryRequest.update({
          where: { id: request.id },
          data: {
            drawOrder: i + 1,
            status: 'ASSIGNED',
            assignedTime,
          },
        });
        assignedCount++;
      } else {
        await this.prisma.golfLotteryRequest.update({
          where: { id: request.id },
          data: {
            drawOrder: i + 1,
            status: 'WAITLISTED',
          },
        });
        waitlistedCount++;
      }
    }

    // Update lottery status
    await this.prisma.golfLottery.update({
      where: { id },
      data: { status: 'DRAWN' },
    });

    const updatedLottery = await this.prisma.golfLottery.findFirst({
      where: { id },
      include: {
        course: true,
        requests: {
          orderBy: { drawOrder: 'asc' },
        },
      },
    });

    return {
      success: true,
      message: `Draw complete: ${assignedCount} assigned, ${waitlistedCount} waitlisted`,
      totalRequests: requests.length,
      assignedCount,
      waitlistedCount,
      lottery: updatedLottery ? this.transformLotteryWithRequests(updatedLottery) : undefined,
    };
  }

  @Mutation(() => LotteryMutationResponse, { name: 'publishLotteryResults', description: 'Publish lottery results and create tee times' })
  async publishLotteryResults(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LotteryMutationResponse> {
    const lottery = await this.prisma.golfLottery.findFirst({
      where: { id, clubId: user.tenantId },
      include: {
        course: true,
        requests: {
          where: { status: 'ASSIGNED' },
          orderBy: { assignedTime: 'asc' },
        },
      },
    });

    if (!lottery) {
      return { success: false, message: 'Lottery not found' };
    }

    if (lottery.status !== 'DRAWN') {
      return { success: false, message: 'Lottery must be drawn before publishing' };
    }

    // Group requests by assigned time
    const requestsByTime: Record<string, typeof lottery.requests> = {};
    for (const request of lottery.requests) {
      const time = request.assignedTime!;
      if (!requestsByTime[time]) {
        requestsByTime[time] = [];
      }
      requestsByTime[time]!.push(request);
    }

    // Create tee times for each time slot
    const year = new Date().getFullYear();
    let teeTimeCounter = 1;

    const lastTeeTime = await this.prisma.teeTime.findFirst({
      where: {
        clubId: user.tenantId,
        teeTimeNumber: { startsWith: `TT-${year}` },
      },
      orderBy: { teeTimeNumber: 'desc' },
    });

    if (lastTeeTime) {
      teeTimeCounter = parseInt(lastTeeTime.teeTimeNumber.split('-')[2] ?? '0', 10) + 1;
    }

    for (const [time, requests] of Object.entries(requestsByTime)) {
      // Create a tee time with all players from this slot
      const teeTimeNumber = `TT-${year}-${teeTimeCounter.toString().padStart(5, '0')}`;

      const players: any[] = [];
      let position = 1;

      for (const request of requests) {
        for (let i = 0; i < request.playerCount; i++) {
          players.push({
            position: position++,
            playerType: 'MEMBER',
            memberId: request.memberId,
            cartType: 'WALKING',
          });
        }
      }

      await this.prisma.teeTime.create({
        data: {
          clubId: user.tenantId,
          teeTimeNumber,
          courseId: lottery.courseId,
          teeDate: lottery.lotteryDate,
          teeTime: time,
          holes: 18,
          status: 'CONFIRMED',
          notes: `Lottery booking`,
          players: { create: players },
        },
      });

      teeTimeCounter++;
    }

    // Update lottery status
    const updatedLottery = await this.prisma.golfLottery.update({
      where: { id },
      data: { status: 'PUBLISHED' },
      include: { course: true },
    });

    const requestCount = await this.prisma.golfLotteryRequest.count({
      where: { lotteryId: id },
    });

    return {
      success: true,
      message: `Published ${Object.keys(requestsByTime).length} tee times`,
      lottery: this.transformLottery(updatedLottery, requestCount),
    };
  }

  @Mutation(() => LotteryRequestMutationResponse, { name: 'submitLotteryRequest', description: 'Submit a lottery request (member)' })
  async submitLotteryRequest(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateLotteryRequestInput,
  ): Promise<LotteryRequestMutationResponse> {
    // Get member ID for current user via the User relation
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      include: { member: true },
    });

    if (!currentUser?.member) {
      return { success: false, message: 'Member account not found' };
    }

    const member = currentUser.member;

    // Verify lottery exists and is open
    const lottery = await this.prisma.golfLottery.findFirst({
      where: { id: input.lotteryId, clubId: user.tenantId },
    });

    if (!lottery) {
      return { success: false, message: 'Lottery not found' };
    }

    if (lottery.status !== 'OPEN') {
      return { success: false, message: 'Lottery is not open for requests' };
    }

    const now = new Date();
    if (now < lottery.requestWindowStart || now > lottery.requestWindowEnd) {
      return { success: false, message: 'Request window is not open' };
    }

    // Check if member already has a request
    const existingRequest = await this.prisma.golfLotteryRequest.findFirst({
      where: { lotteryId: input.lotteryId, memberId: member.id },
    });

    if (existingRequest) {
      return { success: false, message: 'You have already submitted a request for this lottery' };
    }

    // Check member request limit
    const memberRequestCount = await this.prisma.golfLotteryRequest.count({
      where: {
        memberId: member.id,
        lottery: {
          clubId: user.tenantId,
          status: { in: ['OPEN', 'CLOSED'] },
        },
      },
    });

    if (memberRequestCount >= lottery.maxRequestsPerMember) {
      return { success: false, message: `You have reached the maximum of ${lottery.maxRequestsPerMember} lottery requests` };
    }

    const request = await this.prisma.golfLotteryRequest.create({
      data: {
        lotteryId: input.lotteryId,
        memberId: member.id,
        preference1: input.preference1,
        preference2: input.preference2,
        preference3: input.preference3,
        playerCount: input.playerCount,
        status: 'PENDING',
      },
    });

    return {
      success: true,
      request: this.transformLotteryRequest(request),
    };
  }

  @Mutation(() => LotteryRequestMutationResponse, { name: 'cancelLotteryRequest', description: 'Cancel a lottery request' })
  async cancelLotteryRequest(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LotteryRequestMutationResponse> {
    // Get member ID for current user via the User relation
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      include: { member: true },
    });

    if (!currentUser?.member) {
      return { success: false, message: 'Member account not found' };
    }

    const member = currentUser.member;

    const request = await this.prisma.golfLotteryRequest.findFirst({
      where: { id, memberId: member.id },
      include: { lottery: true },
    });

    if (!request) {
      return { success: false, message: 'Lottery request not found' };
    }

    if (request.status !== 'PENDING') {
      return { success: false, message: 'Only pending requests can be cancelled' };
    }

    if (!['OPEN', 'CLOSED'].includes(request.lottery.status)) {
      return { success: false, message: 'Cannot cancel request after lottery has been drawn' };
    }

    const updated = await this.prisma.golfLotteryRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return {
      success: true,
      request: this.transformLotteryRequest(updated),
    };
  }

  @Mutation(() => LotteryMutationResponse, { name: 'deleteLottery', description: 'Delete a draft lottery' })
  async deleteLottery(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LotteryMutationResponse> {
    const existing = await this.prisma.golfLottery.findFirst({
      where: { id, clubId: user.tenantId },
    });

    if (!existing) {
      return { success: false, message: 'Lottery not found' };
    }

    if (existing.status !== 'DRAFT') {
      return { success: false, message: 'Only draft lotteries can be deleted' };
    }

    await this.prisma.golfLottery.delete({
      where: { id },
    });

    return { success: true, message: 'Lottery deleted' };
  }

  private generateTimeSlots(startTime: string, endTime: string, interval: number): string[] {
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentMinutes = (startHour ?? 0) * 60 + (startMin ?? 0);
    const endMinutes = (endHour ?? 0) * 60 + (endMin ?? 0);

    while (currentMinutes <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
      currentMinutes += interval;
    }

    return slots;
  }

  private transformLottery(lottery: any, totalRequests: number): GolfLotteryType {
    return {
      id: lottery.id,
      courseId: lottery.courseId,
      lotteryDate: lottery.lotteryDate,
      lotteryType: lottery.lotteryType as LotteryType,
      requestWindowStart: lottery.requestWindowStart,
      requestWindowEnd: lottery.requestWindowEnd,
      drawTime: lottery.drawTime,
      timeRangeStart: lottery.timeRangeStart,
      timeRangeEnd: lottery.timeRangeEnd,
      status: lottery.status as LotteryStatus,
      maxRequestsPerMember: lottery.maxRequestsPerMember,
      createdAt: lottery.createdAt,
      updatedAt: lottery.updatedAt,
      course: lottery.course
        ? {
            id: lottery.course.id,
            name: lottery.course.name,
            code: lottery.course.code,
            description: lottery.course.description,
            holes: lottery.course.holes,
            par: lottery.course.par,
            slope: lottery.course.slope,
            rating: lottery.course.rating?.toNumber(),
            firstTeeTime: lottery.course.firstTeeTime,
            lastTeeTime: lottery.course.lastTeeTime,
            teeInterval: lottery.course.teeInterval,
            isActive: lottery.course.isActive,
          }
        : undefined,
      totalRequests,
    };
  }

  private transformLotteryWithRequests(lottery: any): GolfLotteryType {
    return {
      ...this.transformLottery(lottery, lottery.requests?.length || 0),
      requests: lottery.requests?.map(this.transformLotteryRequest.bind(this)) || [],
    };
  }

  private transformLotteryRequest(request: any): GolfLotteryRequestType {
    return {
      id: request.id,
      lotteryId: request.lotteryId,
      memberId: request.memberId,
      preference1: request.preference1,
      preference2: request.preference2,
      preference3: request.preference3,
      playerCount: request.playerCount,
      status: request.status as LotteryRequestStatus,
      assignedTime: request.assignedTime,
      drawOrder: request.drawOrder,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }
}

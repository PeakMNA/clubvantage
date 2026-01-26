import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
  GolfWaitlistType,
  GolfWaitlistStatus,
  WaitlistMutationResponse,
  WaitlistNotificationResult,
  GolfCourseType,
} from './golf.types';
import {
  CreateWaitlistEntryInput,
  UpdateWaitlistEntryInput,
  WaitlistQueryArgs,
} from './golf.input';

@Resolver(() => GolfWaitlistType)
@UseGuards(GqlAuthGuard)
export class WaitlistResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [GolfWaitlistType], { name: 'waitlistEntries', description: 'Get waitlist entries' })
  async getWaitlistEntries(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: WaitlistQueryArgs,
  ): Promise<GolfWaitlistType[]> {
    const where: any = {
      clubId: user.tenantId,
    };

    if (args.courseId) where.courseId = args.courseId;
    if (args.status) where.status = args.status;
    if (args.startDate) where.requestedDate = { gte: args.startDate };
    if (args.endDate) {
      where.requestedDate = { ...where.requestedDate, lte: args.endDate };
    }

    const entries = await this.prisma.golfWaitlist.findMany({
      where,
      include: {
        course: true,
      },
      orderBy: [{ requestedDate: 'asc' }, { priority: 'asc' }, { createdAt: 'asc' }],
    });

    return entries.map(this.transformWaitlistEntry.bind(this));
  }

  @Query(() => GolfWaitlistType, { name: 'waitlistEntry', description: 'Get a single waitlist entry' })
  async getWaitlistEntry(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<GolfWaitlistType> {
    const entry = await this.prisma.golfWaitlist.findFirst({
      where: { id, clubId: user.tenantId },
      include: { course: true },
    });

    if (!entry) {
      throw new Error('Waitlist entry not found');
    }

    return this.transformWaitlistEntry(entry);
  }

  @Query(() => [GolfWaitlistType], { name: 'myWaitlistEntries', description: 'Get current user waitlist entries' })
  async getMyWaitlistEntries(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<GolfWaitlistType[]> {
    // Get member ID for current user via the User relation
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      include: { member: true },
    });

    if (!currentUser?.member) {
      return [];
    }

    const entries = await this.prisma.golfWaitlist.findMany({
      where: {
        memberId: currentUser.member.id,
        status: { in: ['PENDING', 'NOTIFIED'] },
      },
      include: { course: true },
      orderBy: { requestedDate: 'asc' },
    });

    return entries.map(this.transformWaitlistEntry.bind(this));
  }

  @Query(() => [GolfWaitlistType], { name: 'waitlistForDate', description: 'Get waitlist entries for a specific date/course' })
  async getWaitlistForDate(
    @GqlCurrentUser() user: JwtPayload,
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('date') date: Date,
  ): Promise<GolfWaitlistType[]> {
    const entries = await this.prisma.golfWaitlist.findMany({
      where: {
        clubId: user.tenantId,
        courseId,
        requestedDate: date,
        status: { in: ['PENDING', 'NOTIFIED'] },
      },
      include: { course: true },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    });

    return entries.map(this.transformWaitlistEntry.bind(this));
  }

  @Mutation(() => WaitlistMutationResponse, { name: 'createWaitlistEntry', description: 'Add to waitlist' })
  async createWaitlistEntry(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateWaitlistEntryInput,
  ): Promise<WaitlistMutationResponse> {
    // Verify course belongs to tenant
    const course = await this.prisma.golfCourse.findFirst({
      where: { id: input.courseId, clubId: user.tenantId },
    });

    if (!course) {
      return { success: false, message: 'Course not found' };
    }

    // Get member ID if user is a member
    let memberId: string | undefined;
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      include: { member: true },
    });

    if (currentUser?.member) {
      memberId = currentUser.member.id;
    }

    // Check if there's already a pending waitlist entry for this member/date/time
    if (memberId) {
      const existingEntry = await this.prisma.golfWaitlist.findFirst({
        where: {
          memberId,
          courseId: input.courseId,
          requestedDate: input.requestedDate,
          status: { in: ['PENDING', 'NOTIFIED'] },
          OR: [
            {
              AND: [
                { timeRangeStart: { lte: input.timeRangeStart } },
                { timeRangeEnd: { gte: input.timeRangeStart } },
              ],
            },
            {
              AND: [
                { timeRangeStart: { lte: input.timeRangeEnd } },
                { timeRangeEnd: { gte: input.timeRangeEnd } },
              ],
            },
          ],
        },
      });

      if (existingEntry) {
        return { success: false, message: 'You already have a waitlist entry for this time range' };
      }
    }

    // Calculate priority (lower = higher priority)
    // Members get lower priority number (processed first)
    const priority = memberId ? 0 : 10;

    // Set expiry time (24 hours after requested date ends)
    const requestedDate = new Date(input.requestedDate);
    const expiresAt = new Date(requestedDate);
    expiresAt.setDate(expiresAt.getDate() + 1);
    expiresAt.setHours(23, 59, 59, 999);

    const entry = await this.prisma.golfWaitlist.create({
      data: {
        clubId: user.tenantId,
        courseId: input.courseId,
        requestedDate: input.requestedDate,
        timeRangeStart: input.timeRangeStart,
        timeRangeEnd: input.timeRangeEnd,
        memberId,
        requesterName: input.requesterName,
        requesterPhone: input.requesterPhone,
        requesterEmail: input.requesterEmail,
        playerCount: input.playerCount,
        priority,
        status: 'PENDING',
        expiresAt,
      },
      include: { course: true },
    });

    return {
      success: true,
      waitlistEntry: this.transformWaitlistEntry(entry),
    };
  }

  @Mutation(() => WaitlistMutationResponse, { name: 'updateWaitlistEntry', description: 'Update a waitlist entry' })
  async updateWaitlistEntry(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateWaitlistEntryInput,
  ): Promise<WaitlistMutationResponse> {
    const existing = await this.prisma.golfWaitlist.findFirst({
      where: { id, clubId: user.tenantId },
    });

    if (!existing) {
      return { success: false, message: 'Waitlist entry not found' };
    }

    // Don't allow modifying booked/expired/cancelled entries
    if (['BOOKED', 'EXPIRED', 'CANCELLED'].includes(existing.status)) {
      return { success: false, message: 'Cannot modify this waitlist entry' };
    }

    const entry = await this.prisma.golfWaitlist.update({
      where: { id },
      data: {
        timeRangeStart: input.timeRangeStart,
        timeRangeEnd: input.timeRangeEnd,
        requesterName: input.requesterName,
        requesterPhone: input.requesterPhone,
        requesterEmail: input.requesterEmail,
        playerCount: input.playerCount,
        priority: input.priority,
        status: input.status as any,
      },
      include: { course: true },
    });

    return {
      success: true,
      waitlistEntry: this.transformWaitlistEntry(entry),
    };
  }

  @Mutation(() => WaitlistMutationResponse, { name: 'cancelWaitlistEntry', description: 'Cancel a waitlist entry' })
  async cancelWaitlistEntry(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<WaitlistMutationResponse> {
    // Allow members to cancel their own entries
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      include: { member: true },
    });

    const existing = await this.prisma.golfWaitlist.findFirst({
      where: {
        id,
        OR: [
          { clubId: user.tenantId },
          { memberId: currentUser?.member?.id },
        ],
      },
    });

    if (!existing) {
      return { success: false, message: 'Waitlist entry not found' };
    }

    if (!['PENDING', 'NOTIFIED'].includes(existing.status)) {
      return { success: false, message: 'Only pending or notified entries can be cancelled' };
    }

    const entry = await this.prisma.golfWaitlist.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { course: true },
    });

    return {
      success: true,
      waitlistEntry: this.transformWaitlistEntry(entry),
    };
  }

  @Mutation(() => WaitlistNotificationResult, { name: 'notifyWaitlistForCancellation', description: 'Notify waitlist when a tee time is cancelled' })
  async notifyWaitlistForCancellation(
    @GqlCurrentUser() user: JwtPayload,
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('date') date: Date,
    @Args('time') time: string,
    @Args('availableSpots', { type: () => Number, defaultValue: 4 }) availableSpots: number,
  ): Promise<WaitlistNotificationResult> {
    // Find all pending waitlist entries that match the time slot
    const entries = await this.prisma.golfWaitlist.findMany({
      where: {
        clubId: user.tenantId,
        courseId,
        requestedDate: date,
        status: 'PENDING',
        timeRangeStart: { lte: time },
        timeRangeEnd: { gte: time },
        playerCount: { lte: availableSpots },
      },
      include: { course: true },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
      take: 5, // Limit notifications to top 5 entries
    });

    if (entries.length === 0) {
      return {
        success: true,
        message: 'No matching waitlist entries to notify',
        notifiedCount: 0,
        notifiedEntries: [],
      };
    }

    // Update entries to notified status
    const now = new Date();
    const notifiedIds = entries.map((e) => e.id);

    await this.prisma.golfWaitlist.updateMany({
      where: { id: { in: notifiedIds } },
      data: {
        status: 'NOTIFIED',
        notifiedAt: now,
      },
    });

    // Fetch updated entries
    const updatedEntries = await this.prisma.golfWaitlist.findMany({
      where: { id: { in: notifiedIds } },
      include: { course: true },
    });

    // TODO: Send actual notifications (email/SMS)
    // This would integrate with a notification service

    return {
      success: true,
      message: `Notified ${entries.length} waitlist entries`,
      notifiedCount: entries.length,
      notifiedEntries: updatedEntries.map(this.transformWaitlistEntry.bind(this)),
    };
  }

  @Mutation(() => WaitlistMutationResponse, { name: 'convertWaitlistToBooking', description: 'Convert a waitlist entry to a booking' })
  async convertWaitlistToBooking(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('teeTimeId', { type: () => ID }) teeTimeId: string,
  ): Promise<WaitlistMutationResponse> {
    const entry = await this.prisma.golfWaitlist.findFirst({
      where: { id, clubId: user.tenantId },
    });

    if (!entry) {
      return { success: false, message: 'Waitlist entry not found' };
    }

    if (entry.status !== 'NOTIFIED') {
      return { success: false, message: 'Only notified entries can be converted to bookings' };
    }

    // Verify the tee time exists and has capacity
    const teeTime = await this.prisma.teeTime.findFirst({
      where: { id: teeTimeId, clubId: user.tenantId },
      include: { players: true },
    });

    if (!teeTime) {
      return { success: false, message: 'Tee time not found' };
    }

    const currentPlayers = teeTime.players.length;
    if (currentPlayers + entry.playerCount > 4) {
      return { success: false, message: 'Not enough spots available on this tee time' };
    }

    // Update waitlist entry
    const updatedEntry = await this.prisma.golfWaitlist.update({
      where: { id },
      data: {
        status: 'BOOKED',
        bookedTeeTimeId: teeTimeId,
      },
      include: { course: true },
    });

    // Add players to the tee time
    const playerData: any[] = [];
    for (let i = 0; i < entry.playerCount; i++) {
      playerData.push({
        teeTimeId,
        position: currentPlayers + i + 1,
        playerType: entry.memberId ? 'MEMBER' : 'GUEST',
        memberId: entry.memberId,
        guestName: entry.memberId ? null : entry.requesterName,
        guestEmail: entry.requesterEmail,
        guestPhone: entry.requesterPhone,
        cartType: 'WALKING',
      });
    }

    await this.prisma.teeTimePlayer.createMany({
      data: playerData,
    });

    return {
      success: true,
      message: `Booking confirmed for ${entry.playerCount} players`,
      waitlistEntry: this.transformWaitlistEntry(updatedEntry),
    };
  }

  @Mutation(() => WaitlistMutationResponse, { name: 'expireOldWaitlistEntries', description: 'Mark expired waitlist entries' })
  async expireOldWaitlistEntries(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<WaitlistMutationResponse> {
    const now = new Date();

    const result = await this.prisma.golfWaitlist.updateMany({
      where: {
        clubId: user.tenantId,
        status: { in: ['PENDING', 'NOTIFIED'] },
        expiresAt: { lt: now },
      },
      data: { status: 'EXPIRED' },
    });

    return {
      success: true,
      message: `Expired ${result.count} waitlist entries`,
    };
  }

  @Mutation(() => WaitlistMutationResponse, { name: 'deleteWaitlistEntry', description: 'Delete a waitlist entry' })
  async deleteWaitlistEntry(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<WaitlistMutationResponse> {
    const existing = await this.prisma.golfWaitlist.findFirst({
      where: { id, clubId: user.tenantId },
    });

    if (!existing) {
      return { success: false, message: 'Waitlist entry not found' };
    }

    await this.prisma.golfWaitlist.delete({
      where: { id },
    });

    return { success: true, message: 'Waitlist entry deleted' };
  }

  private transformWaitlistEntry(entry: any): GolfWaitlistType {
    return {
      id: entry.id,
      courseId: entry.courseId,
      requestedDate: entry.requestedDate,
      timeRangeStart: entry.timeRangeStart,
      timeRangeEnd: entry.timeRangeEnd,
      memberId: entry.memberId,
      requesterName: entry.requesterName,
      requesterPhone: entry.requesterPhone,
      requesterEmail: entry.requesterEmail,
      playerCount: entry.playerCount,
      priority: entry.priority,
      status: entry.status as GolfWaitlistStatus,
      notifiedAt: entry.notifiedAt,
      expiresAt: entry.expiresAt,
      bookedTeeTimeId: entry.bookedTeeTimeId,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      course: entry.course
        ? {
            id: entry.course.id,
            name: entry.course.name,
            code: entry.course.code,
            description: entry.course.description,
            holes: entry.course.holes,
            par: entry.course.par,
            slope: entry.course.slope?.toNumber(),
            rating: entry.course.rating?.toNumber(),
            firstTeeTime: entry.course.firstTeeTime,
            lastTeeTime: entry.course.lastTeeTime,
            teeInterval: entry.course.teeInterval,
            isActive: entry.course.isActive,
          }
        : undefined,
    };
  }
}

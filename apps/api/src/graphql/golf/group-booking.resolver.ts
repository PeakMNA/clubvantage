import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
  GolfGroupBookingType,
  GolfGroupPlayerType,
  GroupBookingMutationResponse,
  GroupBookingFlightsResponse,
  FlightAssignment,
  StartFormat,
  GroupBookingStatus,
  GolfCourseType,
} from './golf.types';
import {
  CreateGroupBookingInput,
  UpdateGroupBookingInput,
  AddGroupPlayersInput,
  ImportPlayersFromCSVInput,
  GroupBookingsQueryArgs,
} from './golf.input';

@Resolver(() => GolfGroupBookingType)
@UseGuards(GqlAuthGuard)
export class GroupBookingResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [GolfGroupBookingType], { name: 'groupBookings', description: 'Get group bookings' })
  async getGroupBookings(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: GroupBookingsQueryArgs,
  ): Promise<GolfGroupBookingType[]> {
    const where: any = {
      clubId: user.tenantId,
    };

    if (args.courseId) where.courseId = args.courseId;
    if (args.status) where.status = args.status;
    if (args.startDate) where.eventDate = { gte: args.startDate };
    if (args.endDate) {
      where.eventDate = { ...where.eventDate, lte: args.endDate };
    }

    const bookings = await this.prisma.golfGroupBooking.findMany({
      where,
      include: {
        course: true,
        players: true,
      },
      orderBy: { eventDate: 'asc' },
    });

    return bookings.map(this.transformGroupBooking.bind(this));
  }

  @Query(() => GolfGroupBookingType, { name: 'groupBooking', description: 'Get a single group booking' })
  async getGroupBooking(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<GolfGroupBookingType> {
    const booking = await this.prisma.golfGroupBooking.findFirst({
      where: { id, clubId: user.tenantId },
      include: {
        course: true,
        players: {
          orderBy: [{ assignedFlight: 'asc' }, { assignedPosition: 'asc' }],
        },
      },
    });

    if (!booking) {
      throw new Error('Group booking not found');
    }

    return this.transformGroupBooking(booking);
  }

  @Mutation(() => GroupBookingMutationResponse, { name: 'createGroupBooking', description: 'Create a group booking' })
  async createGroupBooking(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateGroupBookingInput,
  ): Promise<GroupBookingMutationResponse> {
    // Verify course belongs to tenant
    const course = await this.prisma.golfCourse.findFirst({
      where: { id: input.courseId, clubId: user.tenantId },
    });

    if (!course) {
      return { success: false, message: 'Course not found' };
    }

    // Calculate total players
    const totalPlayers = input.players?.length || 0;

    const booking = await this.prisma.golfGroupBooking.create({
      data: {
        clubId: user.tenantId,
        courseId: input.courseId,
        groupName: input.groupName,
        eventDate: input.eventDate,
        startTime: input.startTime,
        startFormat: input.startFormat,
        totalPlayers,
        status: 'DRAFT',
        notes: input.notes,
        createdBy: user.sub,
        players: input.players?.length
          ? {
              create: input.players.map((p) => ({
                playerType: p.playerType as any,
                memberId: p.memberId,
                guestName: p.guestName,
                guestEmail: p.guestEmail,
                guestPhone: p.guestPhone,
                handicap: p.handicap,
              })),
            }
          : undefined,
      },
      include: {
        course: true,
        players: true,
      },
    });

    return {
      success: true,
      groupBooking: this.transformGroupBooking(booking),
    };
  }

  @Mutation(() => GroupBookingMutationResponse, { name: 'updateGroupBooking', description: 'Update a group booking' })
  async updateGroupBooking(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateGroupBookingInput,
  ): Promise<GroupBookingMutationResponse> {
    const existing = await this.prisma.golfGroupBooking.findFirst({
      where: { id, clubId: user.tenantId },
    });

    if (!existing) {
      return { success: false, message: 'Group booking not found' };
    }

    const booking = await this.prisma.golfGroupBooking.update({
      where: { id },
      data: {
        groupName: input.groupName,
        eventDate: input.eventDate,
        startTime: input.startTime,
        startFormat: input.startFormat as any,
        status: input.status as any,
        notes: input.notes,
      },
      include: {
        course: true,
        players: true,
      },
    });

    return {
      success: true,
      groupBooking: this.transformGroupBooking(booking),
    };
  }

  @Mutation(() => GroupBookingMutationResponse, { name: 'addGroupPlayers', description: 'Add players to a group booking' })
  async addGroupPlayers(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: AddGroupPlayersInput,
  ): Promise<GroupBookingMutationResponse> {
    const existing = await this.prisma.golfGroupBooking.findFirst({
      where: { id, clubId: user.tenantId },
    });

    if (!existing) {
      return { success: false, message: 'Group booking not found' };
    }

    // Add new players
    await this.prisma.golfGroupPlayer.createMany({
      data: input.players.map((p) => ({
        groupBookingId: id,
        playerType: p.playerType as any,
        memberId: p.memberId,
        guestName: p.guestName,
        guestEmail: p.guestEmail,
        guestPhone: p.guestPhone,
        handicap: p.handicap,
      })),
    });

    // Update total player count
    const playerCount = await this.prisma.golfGroupPlayer.count({
      where: { groupBookingId: id },
    });

    const booking = await this.prisma.golfGroupBooking.update({
      where: { id },
      data: { totalPlayers: playerCount },
      include: {
        course: true,
        players: true,
      },
    });

    return {
      success: true,
      groupBooking: this.transformGroupBooking(booking),
    };
  }

  @Mutation(() => GroupBookingMutationResponse, { name: 'importPlayersFromCSV', description: 'Import players from CSV data' })
  async importPlayersFromCSV(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: ImportPlayersFromCSVInput,
  ): Promise<GroupBookingMutationResponse> {
    const existing = await this.prisma.golfGroupBooking.findFirst({
      where: { id, clubId: user.tenantId },
    });

    if (!existing) {
      return { success: false, message: 'Group booking not found' };
    }

    const warnings: string[] = [];
    const playersToCreate: any[] = [];

    for (const row of input.rows) {
      let playerType = 'GUEST';
      let memberId: string | undefined;

      // Try to match member by ID
      if (row.memberId) {
        const member = await this.prisma.member.findFirst({
          where: {
            clubId: user.tenantId,
            memberId: row.memberId,
          },
        });

        if (member) {
          playerType = 'MEMBER';
          memberId = member.id;
        } else {
          warnings.push(`Member ID ${row.memberId} not found, treating as guest`);
        }
      }

      playersToCreate.push({
        groupBookingId: id,
        playerType,
        memberId,
        guestName: playerType === 'GUEST' ? row.name : undefined,
        guestEmail: row.email,
        guestPhone: row.phone,
        handicap: row.handicap,
      });
    }

    await this.prisma.golfGroupPlayer.createMany({
      data: playersToCreate,
    });

    // Update total player count
    const playerCount = await this.prisma.golfGroupPlayer.count({
      where: { groupBookingId: id },
    });

    const booking = await this.prisma.golfGroupBooking.update({
      where: { id },
      data: { totalPlayers: playerCount },
      include: {
        course: true,
        players: true,
      },
    });

    return {
      success: true,
      groupBooking: this.transformGroupBooking(booking),
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  @Mutation(() => GroupBookingMutationResponse, { name: 'removeGroupPlayer', description: 'Remove a player from a group booking' })
  async removeGroupPlayer(
    @GqlCurrentUser() user: JwtPayload,
    @Args('groupBookingId', { type: () => ID }) groupBookingId: string,
    @Args('playerId', { type: () => ID }) playerId: string,
  ): Promise<GroupBookingMutationResponse> {
    const existing = await this.prisma.golfGroupBooking.findFirst({
      where: { id: groupBookingId, clubId: user.tenantId },
    });

    if (!existing) {
      return { success: false, message: 'Group booking not found' };
    }

    await this.prisma.golfGroupPlayer.delete({
      where: { id: playerId },
    });

    // Update total player count
    const playerCount = await this.prisma.golfGroupPlayer.count({
      where: { groupBookingId },
    });

    const booking = await this.prisma.golfGroupBooking.update({
      where: { id: groupBookingId },
      data: { totalPlayers: playerCount },
      include: {
        course: true,
        players: true,
      },
    });

    return {
      success: true,
      groupBooking: this.transformGroupBooking(booking),
    };
  }

  @Mutation(() => GroupBookingFlightsResponse, { name: 'assignFlights', description: 'Auto-assign players to flights' })
  async assignFlights(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('interval', { type: () => Number, defaultValue: 8 }) interval: number,
  ): Promise<GroupBookingFlightsResponse> {
    const booking = await this.prisma.golfGroupBooking.findFirst({
      where: { id, clubId: user.tenantId },
      include: {
        players: {
          orderBy: { handicap: 'asc' }, // Sort by handicap for balanced flights
        },
      },
    });

    if (!booking) {
      throw new Error('Group booking not found');
    }

    const players = booking.players;
    const playersPerFlight = 4;
    const totalFlights = Math.ceil(players.length / playersPerFlight);

    // Generate tee times for each flight
    const [startHour, startMin] = booking.startTime.split(':').map(Number);
    let currentMinutes = (startHour ?? 0) * 60 + (startMin ?? 0);

    const flights: FlightAssignment[] = [];

    for (let flightNum = 1; flightNum <= totalFlights; flightNum++) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      const teeTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

      // Get players for this flight
      const startIdx = (flightNum - 1) * playersPerFlight;
      const flightPlayers = players.slice(startIdx, startIdx + playersPerFlight);

      // Update player assignments in database
      for (let position = 0; position < flightPlayers.length; position++) {
        const player = flightPlayers[position];
        if (player) {
          await this.prisma.golfGroupPlayer.update({
            where: { id: player.id },
            data: {
              assignedFlight: flightNum,
              assignedPosition: position + 1,
            },
          });
        }
      }

      flights.push({
        flightNumber: flightNum,
        teeTime,
        players: flightPlayers.map((p, idx) => ({
          id: p.id,
          playerType: p.playerType as any,
          memberId: p.memberId || undefined,
          guestName: p.guestName || undefined,
          guestEmail: p.guestEmail || undefined,
          guestPhone: p.guestPhone || undefined,
          handicap: p.handicap || undefined,
          assignedFlight: flightNum,
          assignedPosition: idx + 1,
        })),
      });

      currentMinutes += interval;
    }

    return {
      success: true,
      flights,
      totalFlights,
    };
  }

  @Mutation(() => GroupBookingMutationResponse, { name: 'confirmGroupBooking', description: 'Confirm group booking and create tee times' })
  async confirmGroupBooking(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<GroupBookingMutationResponse> {
    const booking = await this.prisma.golfGroupBooking.findFirst({
      where: { id, clubId: user.tenantId },
      include: {
        course: true,
        players: {
          orderBy: [{ assignedFlight: 'asc' }, { assignedPosition: 'asc' }],
        },
      },
    });

    if (!booking) {
      return { success: false, message: 'Group booking not found' };
    }

    if (booking.status !== 'DRAFT') {
      return { success: false, message: 'Only draft bookings can be confirmed' };
    }

    // Check that all players have flight assignments
    const unassignedPlayers = booking.players.filter((p) => !p.assignedFlight);
    if (unassignedPlayers.length > 0) {
      return { success: false, message: `${unassignedPlayers.length} players have not been assigned to flights` };
    }

    // Group players by flight
    const flightGroups: Record<number, typeof booking.players> = {};
    for (const player of booking.players) {
      const flight = player.assignedFlight!;
      if (!flightGroups[flight]) {
        flightGroups[flight] = [];
      }
      flightGroups[flight]!.push(player);
    }

    // Generate tee times for each flight
    const [startHour, startMin] = booking.startTime.split(':').map(Number);
    const interval = booking.course?.teeInterval || 8;
    let currentMinutes = (startHour ?? 0) * 60 + (startMin ?? 0);

    const year = new Date().getFullYear();
    let teeTimeCounter = 1;

    // Get the last tee time number
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

    // Create tee times for each flight
    const sortedFlights = Object.keys(flightGroups).map(Number).sort((a, b) => a - b);

    for (const flightNum of sortedFlights) {
      const flightPlayers = flightGroups[flightNum] || [];
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      const teeTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      const teeTimeNumber = `TT-${year}-${teeTimeCounter.toString().padStart(5, '0')}`;

      await this.prisma.teeTime.create({
        data: {
          clubId: user.tenantId,
          teeTimeNumber,
          courseId: booking.courseId,
          teeDate: booking.eventDate,
          teeTime,
          holes: 18,
          status: 'CONFIRMED',
          notes: `${booking.groupName} - Flight ${flightNum}`,
          players: {
            create: flightPlayers.map((p, idx) => ({
              position: idx + 1,
              playerType: p.playerType,
              memberId: p.memberId,
              guestName: p.guestName,
              guestEmail: p.guestEmail,
              guestPhone: p.guestPhone,
              cartType: 'WALKING',
            })),
          },
        },
      });

      teeTimeCounter++;
      currentMinutes += interval;
    }

    // Update booking status
    const updatedBooking = await this.prisma.golfGroupBooking.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: {
        course: true,
        players: true,
      },
    });

    return {
      success: true,
      message: `Created ${sortedFlights.length} tee times for ${booking.totalPlayers} players`,
      groupBooking: this.transformGroupBooking(updatedBooking),
    };
  }

  @Mutation(() => GroupBookingMutationResponse, { name: 'cancelGroupBooking', description: 'Cancel a group booking' })
  async cancelGroupBooking(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<GroupBookingMutationResponse> {
    const existing = await this.prisma.golfGroupBooking.findFirst({
      where: { id, clubId: user.tenantId },
    });

    if (!existing) {
      return { success: false, message: 'Group booking not found' };
    }

    const booking = await this.prisma.golfGroupBooking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        course: true,
        players: true,
      },
    });

    return {
      success: true,
      groupBooking: this.transformGroupBooking(booking),
    };
  }

  @Mutation(() => GroupBookingMutationResponse, { name: 'deleteGroupBooking', description: 'Delete a draft group booking' })
  async deleteGroupBooking(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<GroupBookingMutationResponse> {
    const existing = await this.prisma.golfGroupBooking.findFirst({
      where: { id, clubId: user.tenantId },
    });

    if (!existing) {
      return { success: false, message: 'Group booking not found' };
    }

    if (existing.status !== 'DRAFT') {
      return { success: false, message: 'Only draft bookings can be deleted' };
    }

    await this.prisma.golfGroupBooking.delete({
      where: { id },
    });

    return { success: true, message: 'Group booking deleted' };
  }

  private transformGroupBooking(booking: any): GolfGroupBookingType {
    return {
      id: booking.id,
      courseId: booking.courseId,
      groupName: booking.groupName,
      eventDate: booking.eventDate,
      startTime: booking.startTime,
      startFormat: booking.startFormat as StartFormat,
      totalPlayers: booking.totalPlayers,
      status: booking.status as GroupBookingStatus,
      notes: booking.notes,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      course: booking.course
        ? {
            id: booking.course.id,
            name: booking.course.name,
            code: booking.course.code,
            description: booking.course.description,
            holes: booking.course.holes,
            par: booking.course.par,
            slope: booking.course.slope?.toNumber(),
            rating: booking.course.rating?.toNumber(),
            firstTeeTime: booking.course.firstTeeTime,
            lastTeeTime: booking.course.lastTeeTime,
            teeInterval: booking.course.teeInterval,
            isActive: booking.course.isActive,
          }
        : undefined,
      players:
        booking.players?.map((p: any) => ({
          id: p.id,
          playerType: p.playerType,
          memberId: p.memberId,
          guestName: p.guestName,
          guestEmail: p.guestEmail,
          guestPhone: p.guestPhone,
          handicap: p.handicap,
          assignedFlight: p.assignedFlight,
          assignedPosition: p.assignedPosition,
        })) || [],
    };
  }
}

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { BookingsService } from '@/modules/bookings/bookings.service';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
  BookingType,
  BookingConnection,
  BookingStatsType,
  CalendarDayType,
  CalendarBookingType,
  CalendarResourceType,
  FacilityType,
  ServiceType,
  StaffType,
  CreateBookingResponseType,
  CancelBookingResponseType,
  CheckInResponseType,
  BookingStatusEnum,
  ResourceTypeEnum,
  WaitlistEntryType,
  WaitlistConnection,
  WaitlistResponseType,
  WaitlistStatusEnum,
  FacilityResponseType,
  DeleteResponseType,
  ServiceResponseType,
  StaffResponseType,
  ExtendedStaffType,
} from './bookings.types';
import {
  CalendarQueryArgs,
  BookingsQueryArgs,
  CreateBookingInput,
  UpdateBookingInput,
  CancelBookingInput,
  CheckInInput,
  RescheduleBookingInput,
  FacilityFilterInput,
  ServiceFilterInput,
  StaffFilterInput,
  WaitlistQueryArgs,
  JoinWaitlistInput,
  SendWaitlistOfferInput,
  WaitlistActionInput,
  CreateFacilityInput,
  UpdateFacilityInput,
  CreateServiceInput,
  UpdateServiceInput,
  CreateStaffMemberInput,
  UpdateStaffMemberInput,
} from './bookings.input';
import { encodeCursor } from '../common/pagination';

@Resolver(() => BookingType)
@UseGuards(GqlAuthGuard)
export class BookingsResolver {
  private readonly logger = new Logger(BookingsResolver.name);

  constructor(
    private readonly bookingsService: BookingsService,
    private readonly prisma: PrismaService,
  ) {}

  // ============================================================================
  // Queries
  // ============================================================================

  @Query(() => CalendarDayType, { name: 'calendarDay', description: 'Get calendar data for a specific day' })
  async getCalendarDay(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: CalendarQueryArgs,
  ): Promise<CalendarDayType> {
    const { date, facilityId, resourceIds, statuses } = args;

    // Get resources
    const resourcesWhere: any = {
      facility: { clubId: user.tenantId },
      isActive: true,
    };
    if (facilityId) {
      resourcesWhere.facilityId = facilityId;
    }
    if (resourceIds?.length) {
      resourcesWhere.id = { in: resourceIds };
    }

    const resources = await this.prisma.resource.findMany({
      where: resourcesWhere,
      include: { facility: true },
      orderBy: [{ facility: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    });

    // Get bookings for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookingsWhere: any = {
      clubId: user.tenantId,
      startTime: { gte: startOfDay },
      endTime: { lte: endOfDay },
    };
    if (resourceIds?.length) {
      bookingsWhere.resourceId = { in: resourceIds };
    }
    if (statuses?.length) {
      bookingsWhere.status = { in: statuses };
    } else {
      bookingsWhere.status = { not: 'CANCELLED' };
    }

    const bookings = await this.prisma.booking.findMany({
      where: bookingsWhere,
      include: {
        member: { select: { id: true, memberId: true, firstName: true, lastName: true, avatarUrl: true } },
        facility: true,
        resource: true,
        service: true,
      },
      orderBy: { startTime: 'asc' },
    });

    return {
      date: startOfDay,
      resources: resources.map((r) => ({
        id: r.id,
        name: r.name,
        type: this.mapResourceType(r.facility?.category),
        subtitle: r.facility?.name,
      })),
      bookings: bookings.map((b) => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        resourceId: b.resourceId || '',
        memberName: `${b.member?.firstName || ''} ${b.member?.lastName || ''}`.trim(),
        memberPhotoUrl: b.member?.avatarUrl ?? undefined,
        serviceName: b.service?.name || b.facility?.name || 'Booking',
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status as BookingStatusEnum,
        bufferBefore: b.service?.bufferMinutes || 0,
        bufferAfter: b.service?.bufferMinutes || 0,
      })),
    };
  }

  @Query(() => BookingConnection, { name: 'bookings', description: 'Get paginated list of bookings' })
  async getBookings(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: BookingsQueryArgs,
  ): Promise<BookingConnection> {
    const { first = 20, skip = 0, startDate, endDate, statuses, bookingType, memberId, facilityId, staffId, search } = args;

    const where: any = { clubId: user.tenantId };

    if (startDate) where.startTime = { gte: new Date(startDate) };
    if (endDate) where.endTime = { ...(where.endTime || {}), lte: new Date(endDate) };
    if (statuses?.length) where.status = { in: statuses };
    if (bookingType) where.bookingType = bookingType;
    if (memberId) where.memberId = memberId;
    if (facilityId) where.facilityId = facilityId;
    if (staffId) where.staffId = staffId;
    if (search) {
      where.OR = [
        { bookingNumber: { contains: search, mode: 'insensitive' } },
        { member: { firstName: { contains: search, mode: 'insensitive' } } },
        { member: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          member: true,
          facility: true,
          resource: true,
          service: true,
          staff: true,
        },
        orderBy: { startTime: 'desc' },
        take: first,
        skip,
      }),
      this.prisma.booking.count({ where }),
    ]);

    const edges = bookings.map((booking) => ({
      node: this.transformBooking(booking),
      cursor: encodeCursor(booking.id),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: skip + first < total,
        hasPreviousPage: skip > 0,
        startCursor: edges[0]?.cursor,
        endCursor: edges[edges.length - 1]?.cursor,
      },
      totalCount: total,
    };
  }

  @Query(() => BookingType, { name: 'booking', description: 'Get a single booking by ID' })
  async getBooking(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<BookingType> {
    const booking = await this.bookingsService.findOne(user.tenantId, id);
    return this.transformBooking(booking);
  }

  @Query(() => BookingStatsType, { name: 'bookingStats', description: 'Get booking statistics for today' })
  async getBookingStats(@GqlCurrentUser() user: JwtPayload): Promise<BookingStatsType> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayBookings, confirmed, checkedIn, completed, noShows] = await Promise.all([
      this.prisma.booking.count({
        where: {
          clubId: user.tenantId,
          startTime: { gte: today, lt: tomorrow },
          status: { not: 'CANCELLED' },
        },
      }),
      this.prisma.booking.count({
        where: {
          clubId: user.tenantId,
          startTime: { gte: today, lt: tomorrow },
          status: 'CONFIRMED',
        },
      }),
      this.prisma.booking.count({
        where: {
          clubId: user.tenantId,
          startTime: { gte: today, lt: tomorrow },
          status: 'CHECKED_IN',
        },
      }),
      this.prisma.booking.count({
        where: {
          clubId: user.tenantId,
          startTime: { gte: today, lt: tomorrow },
          status: 'COMPLETED',
        },
      }),
      this.prisma.booking.count({
        where: {
          clubId: user.tenantId,
          startTime: { gte: today, lt: tomorrow },
          status: 'NO_SHOW',
        },
      }),
    ]);

    const utilizationRate = todayBookings > 0 ? (completed + checkedIn) / todayBookings : 0;

    return {
      todayBookings,
      confirmedBookings: confirmed,
      checkedInBookings: checkedIn,
      completedBookings: completed,
      noShows,
      utilizationRate,
    };
  }

  @Query(() => [FacilityType], { name: 'facilities', description: 'Get list of facilities' })
  async getFacilities(
    @GqlCurrentUser() user: JwtPayload,
    @Args('filter', { type: () => FacilityFilterInput, nullable: true }) filter?: FacilityFilterInput,
  ): Promise<FacilityType[]> {
    const where: any = { clubId: user.tenantId };
    if (filter?.type) where.category = filter.type;
    if (filter?.isActive !== undefined) where.isActive = filter.isActive;

    const facilities = await this.prisma.facility.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return facilities.map((f) => ({
      id: f.id,
      name: f.name,
      type: this.mapResourceType(f.category),
      location: f.location ?? undefined,
      capacity: f.capacity ?? undefined,
      isActive: f.isActive,
    }));
  }

  @Query(() => [ServiceType], { name: 'services', description: 'Get list of services' })
  async getServices(
    @GqlCurrentUser() user: JwtPayload,
    @Args('filter', { type: () => ServiceFilterInput, nullable: true }) filter?: ServiceFilterInput,
  ): Promise<ServiceType[]> {
    const where: any = { clubId: user.tenantId };
    if (filter?.category) where.category = filter.category;
    if (filter?.isActive !== undefined) where.isActive = filter.isActive;

    const services = await this.prisma.service.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return services.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      durationMinutes: s.durationMinutes,
      basePrice: s.basePrice.toNumber(),
      description: s.description ?? undefined,
      isActive: s.isActive,
    }));
  }

  @Query(() => [StaffType], { name: 'bookingStaff', description: 'Get list of staff for booking' })
  async getBookingStaff(
    @GqlCurrentUser() user: JwtPayload,
    @Args('filter', { type: () => StaffFilterInput, nullable: true }) filter?: StaffFilterInput,
  ): Promise<StaffType[]> {
    const where: any = { clubId: user.tenantId };
    if (filter?.isActive !== undefined) where.isActive = filter.isActive;

    const staff = await this.prisma.staff.findMany({
      where,
      include: {
        capabilities: true,
      },
      orderBy: { firstName: 'asc' },
    });

    return staff.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      photoUrl: s.avatarUrl ?? undefined,
      role: undefined, // Staff doesn't have a title/role field
      capabilities: s.capabilities.map((c) => c.capability),
      isActive: s.isActive,
    }));
  }

  // ============================================================================
  // Mutations
  // ============================================================================

  @Mutation(() => CreateBookingResponseType, { name: 'createBooking', description: 'Create a new booking' })
  async createBooking(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateBookingInput,
  ): Promise<CreateBookingResponseType> {
    try {
      const booking = await this.bookingsService.create(
        user.tenantId,
        {
          facilityId: input.facilityId || '',
          resourceId: input.resourceId,
          memberId: input.memberId,
          startTime: input.startTime,
          endTime: input.endTime,
          guestCount: input.guestCount,
          notes: input.notes,
        },
        user.sub,
        user.email,
      );

      return {
        success: true,
        booking: this.transformBooking(booking),
      };
    } catch (error) {
      this.logger.error(`Failed to create booking: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Mutation(() => CancelBookingResponseType, { name: 'cancelBooking', description: 'Cancel a booking' })
  async cancelBooking(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CancelBookingInput,
  ): Promise<CancelBookingResponseType> {
    try {
      await this.bookingsService.cancel(
        user.tenantId,
        input.id,
        input.reason,
        user.sub,
        user.email,
      );

      return {
        success: true,
        message: 'Booking cancelled successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to cancel booking: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Mutation(() => CheckInResponseType, { name: 'checkIn', description: 'Check in a booking' })
  async checkIn(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CheckInInput,
  ): Promise<CheckInResponseType> {
    try {
      const checkedInAt = new Date();

      const booking = await this.prisma.booking.update({
        where: { id: input.bookingId },
        data: {
          status: 'CHECKED_IN',
          checkedInAt,
        },
        include: {
          member: true,
          facility: true,
          resource: true,
          service: true,
          staff: true,
        },
      });

      return {
        success: true,
        booking: this.transformBooking(booking),
        checkedInAt,
      };
    } catch (error) {
      this.logger.error(`Failed to check in booking: ${error.message}`, error.stack);
      return {
        success: false,
        checkedInAt: new Date(),
        error: error.message,
      };
    }
  }

  @Mutation(() => CreateBookingResponseType, { name: 'rescheduleBooking', description: 'Reschedule a booking' })
  async rescheduleBooking(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: RescheduleBookingInput,
  ): Promise<CreateBookingResponseType> {
    try {
      const existingBooking = await this.bookingsService.findOne(user.tenantId, input.id);
      const duration = existingBooking.endTime.getTime() - existingBooking.startTime.getTime();
      const newStartTime = new Date(input.newStartTime);
      const newEndTime = new Date(newStartTime.getTime() + duration);

      const booking = await this.prisma.booking.update({
        where: { id: input.id },
        data: {
          startTime: newStartTime,
          endTime: newEndTime,
          resourceId: input.newResourceId || existingBooking.resourceId,
        },
        include: {
          member: true,
          facility: true,
          resource: true,
          service: true,
          staff: true,
        },
      });

      return {
        success: true,
        booking: this.transformBooking(booking),
      };
    } catch (error) {
      this.logger.error(`Failed to reschedule booking: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================================================
  // Facility CRUD Mutations
  // ============================================================================

  @Mutation(() => FacilityResponseType, { name: 'createFacility', description: 'Create a new facility' })
  async createFacility(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateFacilityInput,
  ): Promise<FacilityResponseType> {
    try {
      const facility = await this.prisma.facility.create({
        data: {
          clubId: user.tenantId,
          name: input.name,
          description: input.description,
          category: input.type,
          location: input.location,
          capacity: input.capacity,
          amenities: input.features || [],
          operatingHours: input.operatingHours ? JSON.stringify(input.operatingHours) : undefined,
          code: input.name.toLowerCase().replace(/\s+/g, '-').substring(0, 20),
          isActive: input.isActive ?? true,
        },
      });

      return {
        success: true,
        facility: {
          id: facility.id,
          name: facility.name,
          type: this.mapResourceType(facility.category),
          location: facility.location ?? undefined,
          capacity: facility.capacity ?? undefined,
          isActive: facility.isActive,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to create facility: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Mutation(() => FacilityResponseType, { name: 'updateFacility', description: 'Update an existing facility' })
  async updateFacility(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UpdateFacilityInput,
  ): Promise<FacilityResponseType> {
    try {
      const data: any = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.description !== undefined) data.description = input.description;
      if (input.type !== undefined) data.category = input.type;
      if (input.location !== undefined) data.location = input.location;
      if (input.capacity !== undefined) data.capacity = input.capacity;
      if (input.features !== undefined) data.amenities = input.features;
      if (input.operatingHours !== undefined) data.operatingHours = JSON.stringify(input.operatingHours);
      if (input.isActive !== undefined) data.isActive = input.isActive;

      const facility = await this.prisma.facility.update({
        where: { id: input.id, clubId: user.tenantId },
        data,
      });

      return {
        success: true,
        facility: {
          id: facility.id,
          name: facility.name,
          type: this.mapResourceType(facility.category),
          location: facility.location ?? undefined,
          capacity: facility.capacity ?? undefined,
          isActive: facility.isActive,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to update facility: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Mutation(() => DeleteResponseType, { name: 'deleteFacility', description: 'Delete a facility' })
  async deleteFacility(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteResponseType> {
    try {
      const activeBookings = await this.prisma.booking.count({
        where: {
          facilityId: id,
          status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
        },
      });

      if (activeBookings > 0) {
        return {
          success: false,
          error: `Cannot delete facility with ${activeBookings} active bookings.`,
        };
      }

      await this.prisma.facility.delete({
        where: { id, clubId: user.tenantId },
      });

      return {
        success: true,
        message: 'Facility deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to delete facility: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================================================
  // Service CRUD Mutations
  // ============================================================================

  @Mutation(() => ServiceResponseType, { name: 'createService', description: 'Create a new service' })
  async createService(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateServiceInput,
  ): Promise<ServiceResponseType> {
    try {
      const service = await this.prisma.service.create({
        data: {
          clubId: user.tenantId,
          name: input.name,
          description: input.description,
          category: input.category,
          durationMinutes: input.durationMinutes,
          bufferMinutes: input.bufferMinutes || 0,
          basePrice: input.basePrice,
          tierDiscounts: input.tierDiscounts ? JSON.stringify(input.tierDiscounts) : undefined,
          requiredCapabilities: input.requiredCapabilities || [],
          requiredFeatures: input.requiredFacilityFeatures || [],
          revenueCenterId: input.revenueCenterId,
          isActive: input.isActive ?? true,
        },
      });

      // Create variations if provided
      if (input.variations?.length) {
        await this.prisma.serviceVariation.createMany({
          data: input.variations.map((v) => ({
            serviceId: service.id,
            name: v.name,
            priceValue: v.priceModifier,
            priceType: v.priceType === 'add' ? 'FIXED_ADD' : v.priceType === 'multiply' ? 'PERCENTAGE_ADD' : 'FIXED_ADD',
          })),
        });
      }

      const variations = await this.prisma.serviceVariation.findMany({
        where: { serviceId: service.id },
      });

      return {
        success: true,
        service: {
          id: service.id,
          name: service.name,
          category: service.category,
          durationMinutes: service.durationMinutes,
          basePrice: Number(service.basePrice),
          description: service.description ?? undefined,
          isActive: service.isActive,
          bufferMinutes: service.bufferMinutes,
          requiredCapabilities: service.requiredCapabilities as string[],
          requiredFacilityFeatures: service.requiredFeatures as string[],
          tierDiscounts: service.tierDiscounts ? JSON.parse(service.tierDiscounts as string) : [],
          variations: variations.map((v) => ({
            id: v.id,
            name: v.name,
            priceModifier: Number(v.priceValue),
            priceType: v.priceType,
          })),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to create service: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Mutation(() => ServiceResponseType, { name: 'updateService', description: 'Update an existing service' })
  async updateService(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UpdateServiceInput,
  ): Promise<ServiceResponseType> {
    try {
      const data: any = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.description !== undefined) data.description = input.description;
      if (input.category !== undefined) data.category = input.category;
      if (input.durationMinutes !== undefined) data.durationMinutes = input.durationMinutes;
      if (input.bufferMinutes !== undefined) data.bufferMinutes = input.bufferMinutes;
      if (input.basePrice !== undefined) data.basePrice = input.basePrice;
      if (input.tierDiscounts !== undefined) data.tierDiscounts = JSON.stringify(input.tierDiscounts);
      if (input.requiredCapabilities !== undefined) data.requiredCapabilities = input.requiredCapabilities;
      if (input.requiredFacilityFeatures !== undefined) data.requiredFeatures = input.requiredFacilityFeatures;
      if (input.revenueCenterId !== undefined) data.revenueCenterId = input.revenueCenterId;
      if (input.isActive !== undefined) data.isActive = input.isActive;

      const service = await this.prisma.service.update({
        where: { id: input.id, clubId: user.tenantId },
        data,
      });

      // Update variations if provided
      if (input.variations !== undefined) {
        await this.prisma.serviceVariation.deleteMany({
          where: { serviceId: input.id },
        });

        if (input.variations.length) {
          await this.prisma.serviceVariation.createMany({
            data: input.variations.map((v) => ({
              serviceId: input.id,
              name: v.name,
              priceValue: v.priceModifier,
              priceType: v.priceType === 'add' ? 'FIXED_ADD' : v.priceType === 'multiply' ? 'PERCENTAGE_ADD' : 'FIXED_ADD',
            })),
          });
        }
      }

      const variations = await this.prisma.serviceVariation.findMany({
        where: { serviceId: service.id },
      });

      return {
        success: true,
        service: {
          id: service.id,
          name: service.name,
          category: service.category,
          durationMinutes: service.durationMinutes,
          basePrice: Number(service.basePrice),
          description: service.description ?? undefined,
          isActive: service.isActive,
          bufferMinutes: service.bufferMinutes,
          requiredCapabilities: service.requiredCapabilities as string[],
          requiredFacilityFeatures: service.requiredFeatures as string[],
          tierDiscounts: service.tierDiscounts ? JSON.parse(service.tierDiscounts as string) : [],
          variations: variations.map((v) => ({
            id: v.id,
            name: v.name,
            priceModifier: Number(v.priceValue),
            priceType: v.priceType,
          })),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to update service: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Mutation(() => DeleteResponseType, { name: 'deleteService', description: 'Delete a service' })
  async deleteService(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteResponseType> {
    try {
      const activeBookings = await this.prisma.booking.count({
        where: {
          serviceId: id,
          status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
        },
      });

      if (activeBookings > 0) {
        return {
          success: false,
          error: `Cannot delete service with ${activeBookings} active bookings.`,
        };
      }

      await this.prisma.serviceVariation.deleteMany({
        where: { serviceId: id },
      });

      await this.prisma.service.delete({
        where: { id, clubId: user.tenantId },
      });

      return {
        success: true,
        message: 'Service deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to delete service: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================================================
  // Staff CRUD Mutations
  // ============================================================================

  @Mutation(() => StaffResponseType, { name: 'createStaffMember', description: 'Create a new staff member' })
  async createStaffMember(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateStaffMemberInput,
  ): Promise<StaffResponseType> {
    try {
      const staff = await this.prisma.staff.create({
        data: {
          clubId: user.tenantId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          avatarUrl: input.avatarUrl,
          userId: input.userId,
          workingSchedule: input.workingHours ? JSON.stringify(input.workingHours) : undefined,
          defaultFacilityId: input.defaultFacilityId,
          isActive: input.isActive ?? true,
        },
      });

      // Create capabilities if provided
      if (input.capabilities?.length) {
        await this.prisma.staffCapability.createMany({
          data: input.capabilities.map((c) => ({
            staffId: staff.id,
            capability: c.capability,
            skillLevel: c.level === 'beginner' ? 'BEGINNER' : c.level === 'expert' ? 'EXPERT' : 'INTERMEDIATE',
          })),
        });
      }

      // Create certifications if provided
      if (input.certifications?.length) {
        await this.prisma.staffCertification.createMany({
          data: input.certifications.map((c) => ({
            staffId: staff.id,
            name: c.name,
            expiryDate: c.expiresAt ? new Date(c.expiresAt) : null,
          })),
        });
      }

      return {
        success: true,
        staff: await this.getExtendedStaff(staff.id),
      };
    } catch (error) {
      this.logger.error(`Failed to create staff member: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Mutation(() => StaffResponseType, { name: 'updateStaffMember', description: 'Update a staff member' })
  async updateStaffMember(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UpdateStaffMemberInput,
  ): Promise<StaffResponseType> {
    try {
      const data: any = {};
      if (input.firstName !== undefined) data.firstName = input.firstName;
      if (input.lastName !== undefined) data.lastName = input.lastName;
      if (input.email !== undefined) data.email = input.email;
      if (input.phone !== undefined) data.phone = input.phone;
      if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
      if (input.userId !== undefined) data.userId = input.userId;
      if (input.workingHours !== undefined) data.workingSchedule = JSON.stringify(input.workingHours);
      if (input.defaultFacilityId !== undefined) data.defaultFacilityId = input.defaultFacilityId;
      if (input.isActive !== undefined) data.isActive = input.isActive;

      await this.prisma.staff.update({
        where: { id: input.id, clubId: user.tenantId },
        data,
      });

      // Update capabilities if provided
      if (input.capabilities !== undefined) {
        await this.prisma.staffCapability.deleteMany({
          where: { staffId: input.id },
        });

        if (input.capabilities.length) {
          await this.prisma.staffCapability.createMany({
            data: input.capabilities.map((c) => ({
              staffId: input.id,
              capability: c.capability,
              skillLevel: c.level === 'beginner' ? 'BEGINNER' : c.level === 'expert' ? 'EXPERT' : 'INTERMEDIATE',
            })),
          });
        }
      }

      // Update certifications if provided
      if (input.certifications !== undefined) {
        await this.prisma.staffCertification.deleteMany({
          where: { staffId: input.id },
        });

        if (input.certifications.length) {
          await this.prisma.staffCertification.createMany({
            data: input.certifications.map((c) => ({
              staffId: input.id,
              name: c.name,
              expiryDate: c.expiresAt ? new Date(c.expiresAt) : null,
            })),
          });
        }
      }

      return {
        success: true,
        staff: await this.getExtendedStaff(input.id),
      };
    } catch (error) {
      this.logger.error(`Failed to update staff member: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Mutation(() => DeleteResponseType, { name: 'deleteStaffMember', description: 'Delete a staff member' })
  async deleteStaffMember(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteResponseType> {
    try {
      const upcomingBookings = await this.prisma.booking.count({
        where: {
          staffId: id,
          startTime: { gte: new Date() },
          status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
        },
      });

      if (upcomingBookings > 0) {
        return {
          success: false,
          error: `Cannot delete staff member with ${upcomingBookings} upcoming bookings.`,
        };
      }

      await this.prisma.staffCapability.deleteMany({ where: { staffId: id } });
      await this.prisma.staffCertification.deleteMany({ where: { staffId: id } });

      await this.prisma.staff.delete({
        where: { id, clubId: user.tenantId },
      });

      return {
        success: true,
        message: 'Staff member deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to delete staff member: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async getExtendedStaff(staffId: string): Promise<ExtendedStaffType> {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        capabilities: true,
        certifications: true,
      },
    });

    if (!staff) throw new Error('Staff not found');

    const now = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    return {
      id: staff.id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      photoUrl: staff.avatarUrl ?? undefined,
      role: undefined,
      capabilities: staff.capabilities.map((c) => c.capability),
      isActive: staff.isActive,
      email: staff.email ?? undefined,
      phone: staff.phone ?? undefined,
      userId: staff.userId ?? undefined,
      detailedCapabilities: staff.capabilities.map((c) => ({
        capability: c.capability,
        level: c.skillLevel,
      })),
      certifications: staff.certifications.map((c) => ({
        id: c.id,
        name: c.name,
        expiresAt: c.expiryDate ?? undefined,
        status: !c.expiryDate ? 'valid' : c.expiryDate < now ? 'expired' : c.expiryDate < ninetyDaysFromNow ? 'expiring' : 'valid',
      })),
      workingHours: staff.workingSchedule ? JSON.parse(staff.workingSchedule as string) : undefined,
      defaultFacilityId: staff.defaultFacilityId ?? undefined,
    };
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private mapResourceType(type?: string): ResourceTypeEnum {
    const map: Record<string, ResourceTypeEnum> = {
      COURT: ResourceTypeEnum.COURT,
      SPA: ResourceTypeEnum.SPA,
      STUDIO: ResourceTypeEnum.STUDIO,
      POOL: ResourceTypeEnum.POOL,
      ROOM: ResourceTypeEnum.ROOM,
    };
    return map[type || ''] || ResourceTypeEnum.ROOM;
  }

  private transformBooking(booking: any): BookingType {
    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      bookingType: booking.bookingType || 'FACILITY',
      status: booking.status as BookingStatusEnum,
      member: {
        id: booking.member?.id || '',
        memberId: booking.member?.memberId || '',
        firstName: booking.member?.firstName || '',
        lastName: booking.member?.lastName || '',
        photoUrl: booking.member?.photoUrl,
        status: booking.member?.status || 'ACTIVE',
      },
      facility: booking.facility
        ? {
            id: booking.facility.id,
            name: booking.facility.name,
            type: this.mapResourceType(booking.facility.type),
            location: booking.facility.location,
            capacity: booking.facility.capacity,
            isActive: booking.facility.isActive,
          }
        : undefined,
      resource: booking.resource
        ? {
            id: booking.resource.id,
            name: booking.resource.name,
            facilityId: booking.resource.facilityId,
            isActive: booking.resource.isActive,
          }
        : undefined,
      service: booking.service
        ? {
            id: booking.service.id,
            name: booking.service.name,
            category: booking.service.category,
            durationMinutes: booking.service.durationMinutes,
            basePrice: Number(booking.service.basePrice),
            description: booking.service.description,
            isActive: booking.service.isActive,
          }
        : undefined,
      staff: booking.staff
        ? {
            id: booking.staff.id,
            firstName: booking.staff.firstName,
            lastName: booking.staff.lastName,
            photoUrl: booking.staff.photoUrl,
            role: booking.staff.title,
            isActive: booking.staff.isActive,
          }
        : undefined,
      startTime: booking.startTime,
      endTime: booking.endTime,
      durationMinutes: booking.durationMinutes || booking.duration || 0,
      guestCount: booking.guestCount,
      notes: booking.notes,
      bufferBefore: booking.bufferBefore,
      bufferAfter: booking.bufferAfter,
      createdAt: booking.createdAt,
      createdBy: booking.createdBy,
      checkedInAt: booking.checkedInAt,
      cancelledAt: booking.cancelledAt,
      cancelReason: booking.cancelReason,
    };
  }

  // ============================================================================
  // Waitlist Queries
  // ============================================================================

  @Query(() => WaitlistConnection, { name: 'waitlist', description: 'Get waitlist entries' })
  async getWaitlist(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: WaitlistQueryArgs,
  ): Promise<WaitlistConnection> {
    const { first = 20, skip = 0, facilityId, serviceId, date } = args;

    const where: any = { clubId: user.tenantId };
    if (facilityId) where.facilityId = facilityId;
    if (serviceId) where.serviceId = serviceId;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.preferredDate = { gte: startOfDay, lte: endOfDay };
    }

    const [entries, total] = await Promise.all([
      this.prisma.waitlistEntry.findMany({
        where,
        include: {
          member: true,
          service: true,
        },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        take: first,
        skip,
      }),
      this.prisma.waitlistEntry.count({ where }),
    ]);

    const edges = entries.map((entry) => ({
      node: this.transformWaitlistEntry(entry),
      cursor: encodeCursor(entry.id),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: skip + first < total,
        hasPreviousPage: skip > 0,
        startCursor: edges[0]?.cursor,
        endCursor: edges[edges.length - 1]?.cursor,
      },
      totalCount: total,
    };
  }

  // ============================================================================
  // Waitlist Mutations
  // ============================================================================

  @Mutation(() => WaitlistResponseType, { name: 'joinWaitlist', description: 'Join a waitlist' })
  async joinWaitlist(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: JoinWaitlistInput,
  ): Promise<WaitlistResponseType> {
    try {
      // Get next position
      const lastEntry = await this.prisma.waitlistEntry.findFirst({
        where: {
          clubId: user.tenantId,
          facilityId: input.facilityId,
          serviceId: input.serviceId,
          preferredDate: new Date(input.requestedDate),
          preferredTime: input.requestedTime,
        },
        orderBy: { position: 'desc' },
      });

      const position = (lastEntry?.position || 0) + 1;

      const entry = await this.prisma.waitlistEntry.create({
        data: {
          clubId: user.tenantId,
          memberId: input.memberId,
          facilityId: input.facilityId,
          serviceId: input.serviceId,
          preferredDate: new Date(input.requestedDate),
          preferredTime: input.requestedTime,
          position,
          status: 'WAITING',
        },
        include: {
          member: true,
          service: true,
        },
      });

      return {
        success: true,
        entry: this.transformWaitlistEntry(entry),
        message: `Added to waitlist at position #${position}`,
      };
    } catch (error) {
      this.logger.error(`Failed to join waitlist: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Mutation(() => WaitlistResponseType, { name: 'sendWaitlistOffer', description: 'Send offer to waitlist entry' })
  async sendWaitlistOffer(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: SendWaitlistOfferInput,
  ): Promise<WaitlistResponseType> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (input.expiresInHours || 24));

      const entry = await this.prisma.waitlistEntry.update({
        where: { id: input.entryId },
        data: {
          status: 'OFFERED',
          offeredAt: new Date(),
          offerExpiresAt: expiresAt,
        },
        include: {
          member: true,
          service: true,
        },
      });

      return {
        success: true,
        entry: this.transformWaitlistEntry(entry),
        message: 'Offer sent successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to send waitlist offer: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Mutation(() => WaitlistResponseType, { name: 'removeFromWaitlist', description: 'Remove entry from waitlist' })
  async removeFromWaitlist(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: WaitlistActionInput,
  ): Promise<WaitlistResponseType> {
    try {
      await this.prisma.waitlistEntry.delete({
        where: { id: input.entryId },
      });

      return {
        success: true,
        message: 'Removed from waitlist',
      };
    } catch (error) {
      this.logger.error(`Failed to remove from waitlist: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Mutation(() => WaitlistResponseType, { name: 'acceptWaitlistOffer', description: 'Accept a waitlist offer' })
  async acceptWaitlistOffer(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: WaitlistActionInput,
  ): Promise<WaitlistResponseType> {
    try {
      // Find the waitlist entry
      const waitlistEntry = await this.prisma.waitlistEntry.findFirst({
        where: { id: input.entryId, clubId: user.tenantId },
        include: { member: true, service: true },
      });

      if (!waitlistEntry) {
        return { success: false, error: 'Waitlist entry not found' };
      }

      if (waitlistEntry.status !== 'OFFERED') {
        return { success: false, error: 'No offer to accept' };
      }

      if (waitlistEntry.offerExpiresAt && waitlistEntry.offerExpiresAt < new Date()) {
        // Update status to EXPIRED
        await this.prisma.waitlistEntry.update({
          where: { id: input.entryId },
          data: { status: 'EXPIRED' },
        });
        return { success: false, error: 'Offer has expired' };
      }

      // Update waitlist entry status to ACCEPTED
      const entry = await this.prisma.waitlistEntry.update({
        where: { id: input.entryId },
        data: { status: 'ACCEPTED' },
        include: { member: true, service: true },
      });

      // TODO: Create a booking from the waitlist entry here if needed

      return {
        success: true,
        entry: this.transformWaitlistEntry(entry),
        message: 'Offer accepted successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to accept waitlist offer: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Mutation(() => WaitlistResponseType, { name: 'declineWaitlistOffer', description: 'Decline a waitlist offer' })
  async declineWaitlistOffer(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: WaitlistActionInput,
  ): Promise<WaitlistResponseType> {
    try {
      // Find the waitlist entry
      const waitlistEntry = await this.prisma.waitlistEntry.findFirst({
        where: { id: input.entryId, clubId: user.tenantId },
      });

      if (!waitlistEntry) {
        return { success: false, error: 'Waitlist entry not found' };
      }

      if (waitlistEntry.status !== 'OFFERED') {
        return { success: false, error: 'No offer to decline' };
      }

      // Update waitlist entry status to DECLINED
      const entry = await this.prisma.waitlistEntry.update({
        where: { id: input.entryId },
        data: { status: 'DECLINED' },
        include: { member: true, service: true },
      });

      return {
        success: true,
        entry: this.transformWaitlistEntry(entry),
        message: 'Offer declined',
      };
    } catch (error) {
      this.logger.error(`Failed to decline waitlist offer: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private transformWaitlistEntry(entry: any): WaitlistEntryType {
    return {
      id: entry.id,
      member: {
        id: entry.member?.id || '',
        memberId: entry.member?.memberId || '',
        firstName: entry.member?.firstName || '',
        lastName: entry.member?.lastName || '',
        photoUrl: entry.member?.photoUrl,
        status: entry.member?.status || 'ACTIVE',
      },
      serviceName: entry.service?.name,
      facilityName: undefined, // Facility name would need separate lookup
      requestedDate: entry.preferredDate,
      requestedTime: entry.preferredTime,
      position: entry.position,
      status: entry.status as WaitlistStatusEnum,
      offerExpiresAt: entry.offerExpiresAt,
      createdAt: entry.createdAt,
      notes: undefined,
    };
  }
}

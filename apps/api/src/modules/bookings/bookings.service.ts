import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';
import { EventStoreService } from '@/shared/events/event-store.service';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export interface CreateBookingDto {
  facilityId: string;
  resourceId?: string;
  memberId: string;
  startTime: string;
  endTime: string;
  guestCount?: number;
  notes?: string;
}

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private eventStore: EventStoreService,
  ) {}

  async getFacilities(tenantId: string) {
    return this.prisma.facility.findMany({
      where: { clubId: tenantId, isActive: true },
      include: {
        resources: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getAvailability(
    tenantId: string,
    facilityId: string,
    date: string,
    resourceId?: string,
  ) {
    const facility = await this.prisma.facility.findFirst({
      where: { id: facilityId, clubId: tenantId },
      include: { resources: { where: { isActive: true } } },
    });

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await this.prisma.booking.findMany({
      where: {
        clubId: tenantId,
        facilityId,
        resourceId: resourceId || undefined,
        startTime: { gte: startOfDay },
        endTime: { lte: endOfDay },
        status: { not: 'CANCELLED' },
      },
      include: {
        member: { select: { id: true, memberId: true, firstName: true, lastName: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    return {
      facility,
      date,
      bookings,
    };
  }

  async create(
    tenantId: string,
    dto: CreateBookingDto,
    userId: string,
    userEmail: string,
  ) {
    const lockKey = `booking:${dto.facilityId}:${dto.resourceId || 'any'}:${dto.startTime}`;
    const acquired = await this.redis.acquireLock(lockKey, 30);

    if (!acquired) {
      throw new ConflictException('This slot is currently being booked');
    }

    try {
      // Check for conflicts
      const startTime = new Date(dto.startTime);
      const endTime = new Date(dto.endTime);

      const conflict = await this.prisma.booking.findFirst({
        where: {
          clubId: tenantId,
          facilityId: dto.facilityId,
          resourceId: dto.resourceId,
          status: { not: 'CANCELLED' },
          OR: [
            { startTime: { lt: endTime }, endTime: { gt: startTime } },
          ],
        },
      });

      if (conflict) {
        throw new ConflictException('This slot is already booked');
      }

      // Generate booking number
      const year = new Date().getFullYear();
      const lastBooking = await this.prisma.booking.findFirst({
        where: {
          clubId: tenantId,
          bookingNumber: { startsWith: `BK-${year}` },
        },
        orderBy: { bookingNumber: 'desc' },
      });

      const nextNumber = lastBooking
        ? parseInt(lastBooking.bookingNumber.split('-')[2], 10) + 1
        : 1;
      const bookingNumber = `BK-${year}-${nextNumber.toString().padStart(5, '0')}`;

      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

      const booking = await this.prisma.booking.create({
        data: {
          clubId: tenantId,
          bookingNumber,
          memberId: dto.memberId,
          facilityId: dto.facilityId,
          resourceId: dto.resourceId,
          startTime,
          endTime,
          durationMinutes,
          guestCount: dto.guestCount || 0,
          notes: dto.notes,
          status: 'CONFIRMED',
          basePrice: 0, // Default for facility bookings
        },
        include: {
          member: true,
          facility: true,
          resource: true,
        },
      });

      await this.eventStore.append({
        tenantId,
        aggregateType: 'Booking',
        aggregateId: booking.id,
        type: 'CREATED',
        data: { bookingNumber, startTime: dto.startTime, endTime: dto.endTime },
        userId,
        userEmail,
      });

      return booking;
    } finally {
      await this.redis.releaseLock(lockKey);
    }
  }

  async findOne(tenantId: string, id: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, clubId: tenantId },
      include: {
        member: true,
        facility: true,
        resource: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async cancel(
    tenantId: string,
    id: string,
    reason: string,
    userId: string,
    userEmail: string,
  ) {
    const booking = await this.findOne(tenantId, id);

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelReason: reason,
        cancelledAt: new Date(),
        cancelledBy: userId,
      },
    });

    await this.eventStore.append({
      tenantId,
      aggregateType: 'Booking',
      aggregateId: id,
      type: 'CANCELLED',
      data: { reason },
      userId,
      userEmail,
    });

    return updated;
  }

  async findAllByMember(tenantId: string, memberId: string) {
    return this.prisma.booking.findMany({
      where: {
        clubId: tenantId,
        memberId,
        status: { not: 'CANCELLED' },
      },
      include: {
        facility: true,
        resource: true,
      },
      orderBy: { startTime: 'desc' },
      take: 20,
    });
  }
}

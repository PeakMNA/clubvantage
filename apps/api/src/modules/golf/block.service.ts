import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import {
  CreateBlockDto,
  UpdateBlockDto,
  BlocksFilter,
} from './golf.types';

@Injectable()
export class BlockService {
  private readonly logger = new Logger(BlockService.name);

  constructor(private prisma: PrismaService) {}

  async getTeeTimeBlocks(
    tenantId: string,
    courseId: string,
    filters?: BlocksFilter,
  ) {
    const where: any = {
      courseId,
      course: { clubId: tenantId },
    };

    if (filters?.startDate && filters?.endDate) {
      where.OR = [
        {
          startTime: { lte: filters.endDate },
          endTime: { gte: filters.startDate },
        },
        { isRecurring: true },
      ];
    }

    if (filters?.blockType) {
      where.blockType = filters.blockType;
    }

    return this.prisma.teeTimeBlock.findMany({
      where,
      include: {
        course: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async createTeeTimeBlock(
    tenantId: string,
    data: CreateBlockDto,
    userId: string,
  ) {
    // Verify course belongs to tenant
    const course = await this.prisma.golfCourse.findFirst({
      where: { id: data.courseId, clubId: tenantId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check for existing bookings in this time range (only for non-recurring blocks)
    if (!data.isRecurring) {
      const existingBookings = await this.prisma.teeTime.findMany({
        where: {
          clubId: tenantId,
          courseId: data.courseId,
          teeDate: {
            gte: new Date(data.startTime.toDateString()),
            lte: new Date(data.endTime.toDateString()),
          },
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        },
      });

      // Filter to bookings that actually fall within the block time
      const conflictingBookings = existingBookings.filter((booking) => {
        const [bookingHour, bookingMin] = booking.teeTime.split(':').map(Number);
        const bookingMinutes = bookingHour * 60 + bookingMin;

        const startMinutes = data.startTime.getHours() * 60 + data.startTime.getMinutes();
        const endMinutes = data.endTime.getHours() * 60 + data.endTime.getMinutes();

        return bookingMinutes >= startMinutes && bookingMinutes < endMinutes;
      });

      if (conflictingBookings.length > 0) {
        throw new ConflictException(
          `Cannot create block: ${conflictingBookings.length} existing booking(s) in this time range. Cancel them first or adjust block time.`,
        );
      }
    }

    return this.prisma.teeTimeBlock.create({
      data: {
        courseId: data.courseId,
        startTime: data.startTime,
        endTime: data.endTime,
        blockType: data.blockType as any,
        reason: data.reason,
        isRecurring: data.isRecurring || false,
        recurringPattern: data.recurringPattern,
        createdBy: userId,
      },
      include: {
        course: true,
      },
    });
  }

  async updateTeeTimeBlock(
    tenantId: string,
    blockId: string,
    data: UpdateBlockDto,
  ) {
    const block = await this.prisma.teeTimeBlock.findFirst({
      where: {
        id: blockId,
        course: { clubId: tenantId },
      },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return this.prisma.teeTimeBlock.update({
      where: { id: blockId },
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        blockType: data.blockType as any,
        reason: data.reason,
        isRecurring: data.isRecurring,
        recurringPattern: data.recurringPattern,
      },
      include: {
        course: true,
      },
    });
  }

  async deleteTeeTimeBlock(tenantId: string, blockId: string) {
    const block = await this.prisma.teeTimeBlock.findFirst({
      where: {
        id: blockId,
        course: { clubId: tenantId },
      },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return this.prisma.teeTimeBlock.delete({
      where: { id: blockId },
    });
  }
}

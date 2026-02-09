import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
} from './golf.types';
import { invalidateScheduleCache } from '@/shared/cache';

@Injectable()
export class GolfScheduleService {
  private readonly logger = new Logger(GolfScheduleService.name);

  constructor(private prisma: PrismaService) {}

  async getCourseSchedules(tenantId: string, courseId: string) {
    return this.prisma.golfCourseSchedule.findMany({
      where: {
        courseId,
        course: { clubId: tenantId },
      },
      include: {
        intervals: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async createCourseSchedule(tenantId: string, data: CreateScheduleDto) {
    // Verify course belongs to tenant
    const course = await this.prisma.golfCourse.findFirst({
      where: { id: data.courseId, clubId: tenantId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check for overlapping schedules
    const overlapping = await this.prisma.golfCourseSchedule.findFirst({
      where: {
        courseId: data.courseId,
        isActive: true,
        OR: [
          {
            startDate: { lte: data.endDate },
            endDate: { gte: data.startDate },
          },
        ],
      },
    });

    if (overlapping) {
      throw new ConflictException(
        `Schedule overlaps with existing schedule: ${overlapping.seasonName}`,
      );
    }

    const schedule = await this.prisma.golfCourseSchedule.create({
      data: {
        courseId: data.courseId,
        seasonName: data.seasonName,
        startDate: data.startDate,
        endDate: data.endDate,
        firstTeeTime: data.firstTeeTime,
        lastTeeTime: data.lastTeeTime,
        playFormat: (data.playFormat as any) || 'EIGHTEEN_HOLE',
        paceOfPlay: data.paceOfPlay,
        isActive: true,
        intervals: data.intervals?.length
          ? {
              create: data.intervals.map((interval) => ({
                dayType: interval.dayType as any,
                timeStart: interval.timeStart,
                timeEnd: interval.timeEnd,
                intervalMin: interval.intervalMin,
                isPrimeTime: interval.isPrimeTime,
              })),
            }
          : undefined,
      },
      include: {
        intervals: true,
      },
    });

    // Invalidate schedule cache for this course
    invalidateScheduleCache(data.courseId);
    this.logger.log(`Invalidated schedule cache for course ${data.courseId}`);

    return schedule;
  }

  async updateCourseSchedule(
    tenantId: string,
    scheduleId: string,
    data: UpdateScheduleDto,
  ) {
    const schedule = await this.prisma.golfCourseSchedule.findFirst({
      where: {
        id: scheduleId,
        course: { clubId: tenantId },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    const updated = await this.prisma.golfCourseSchedule.update({
      where: { id: scheduleId },
      data: {
        seasonName: data.seasonName,
        startDate: data.startDate,
        endDate: data.endDate,
        firstTeeTime: data.firstTeeTime,
        lastTeeTime: data.lastTeeTime,
        playFormat: data.playFormat as any,
        paceOfPlay: data.paceOfPlay,
        isActive: data.isActive,
      },
      include: {
        intervals: true,
      },
    });

    // Invalidate schedule cache for this course
    invalidateScheduleCache(schedule.courseId);
    this.logger.log(`Invalidated schedule cache for course ${schedule.courseId}`);

    return updated;
  }

  async deleteCourseSchedule(tenantId: string, scheduleId: string) {
    const schedule = await this.prisma.golfCourseSchedule.findFirst({
      where: {
        id: scheduleId,
        course: { clubId: tenantId },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Delete associated intervals first
    await this.prisma.golfCourseInterval.deleteMany({
      where: { scheduleId },
    });

    const deleted = await this.prisma.golfCourseSchedule.delete({
      where: { id: scheduleId },
    });

    // Invalidate schedule cache for this course
    invalidateScheduleCache(schedule.courseId);
    this.logger.log(`Invalidated schedule cache for course ${schedule.courseId}`);

    return deleted;
  }
}

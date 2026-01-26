import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface CreateNotificationDto {
  memberId?: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  channel?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        clubId: tenantId,
        memberId: dto.memberId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data || {},
        channel: dto.channel || 'in_app',
      },
    });
  }

  async findByMember(tenantId: string, memberId: string, limit = 20) {
    return this.prisma.notification.findMany({
      where: { clubId: tenantId, memberId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findUnread(tenantId: string, memberId: string) {
    return this.prisma.notification.findMany({
      where: {
        clubId: tenantId,
        memberId,
        readAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(tenantId: string, id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(tenantId: string, memberId: string) {
    return this.prisma.notification.updateMany({
      where: {
        clubId: tenantId,
        memberId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  }

  async getUnreadCount(tenantId: string, memberId: string) {
    return this.prisma.notification.count({
      where: {
        clubId: tenantId,
        memberId,
        readAt: null,
      },
    });
  }
}

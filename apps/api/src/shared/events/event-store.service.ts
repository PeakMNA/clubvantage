import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DomainEvent<T = any> {
  tenantId: string;
  aggregateType: string;
  aggregateId: string;
  type: string;
  data: T;
  userId: string;
  userEmail: string;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface StoredEvent {
  id: string;
  tenantId: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  eventData: any;
  userId: string;
  userEmail: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

@Injectable()
export class EventStoreService {
  private readonly logger = new Logger(EventStoreService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Append an event to the event store
   */
  async append<T>(event: DomainEvent<T>): Promise<StoredEvent> {
    try {
      const stored = await this.prisma.auditLog.create({
        data: {
          clubId: event.tenantId,
          userId: event.userId,
          action: event.type,
          entityType: event.aggregateType,
          entityId: event.aggregateId,
          newValues: event.data as any,
          ipAddress: event.metadata?.ipAddress,
          userAgent: event.metadata?.userAgent,
        },
      });

      return {
        id: stored.id,
        tenantId: stored.clubId,
        aggregateType: stored.entityType,
        aggregateId: stored.entityId || '',
        eventType: stored.action,
        eventData: stored.newValues,
        userId: stored.userId || '',
        userEmail: event.userEmail,
        ipAddress: stored.ipAddress || undefined,
        userAgent: stored.userAgent || undefined,
        createdAt: stored.createdAt,
      };
    } catch (error) {
      this.logger.error('Failed to append event:', error);
      throw error;
    }
  }

  /**
   * Get event history for an aggregate
   */
  async getHistory(
    aggregateType: string,
    aggregateId: string,
  ): Promise<StoredEvent[]> {
    const events = await this.prisma.auditLog.findMany({
      where: {
        entityType: aggregateType,
        entityId: aggregateId,
      },
      orderBy: { createdAt: 'asc' },
    });

    return events.map((e: any) => ({
      id: e.id,
      tenantId: e.clubId,
      aggregateType: e.entityType,
      aggregateId: e.entityId || '',
      eventType: e.action,
      eventData: e.newValues,
      userId: e.userId || '',
      userEmail: '', // Not stored in current schema
      ipAddress: e.ipAddress || undefined,
      userAgent: e.userAgent || undefined,
      createdAt: e.createdAt,
    }));
  }

  /**
   * Get all events for a tenant within a time range
   */
  async getEventsByTenant(
    tenantId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      aggregateType?: string;
      eventType?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ events: StoredEvent[]; total: number }> {
    const where: any = { clubId: tenantId };

    if (options?.startDate) {
      where.createdAt = { gte: options.startDate };
    }
    if (options?.endDate) {
      where.createdAt = { ...where.createdAt, lte: options.endDate };
    }
    if (options?.aggregateType) {
      where.entityType = options.aggregateType;
    }
    if (options?.eventType) {
      where.action = options.eventType;
    }

    const [events, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      events: events.map((e: any) => ({
        id: e.id,
        tenantId: e.clubId,
        aggregateType: e.entityType,
        aggregateId: e.entityId || '',
        eventType: e.action,
        eventData: e.newValues,
        userId: e.userId || '',
        userEmail: '',
        ipAddress: e.ipAddress || undefined,
        userAgent: e.userAgent || undefined,
        createdAt: e.createdAt,
      })),
      total,
    };
  }

  /**
   * Get events by user
   */
  async getEventsByUser(
    userId: string,
    tenantId: string,
    limit: number = 50,
  ): Promise<StoredEvent[]> {
    const events = await this.prisma.auditLog.findMany({
      where: {
        userId,
        clubId: tenantId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return events.map((e: any) => ({
      id: e.id,
      tenantId: e.clubId,
      aggregateType: e.entityType,
      aggregateId: e.entityId || '',
      eventType: e.action,
      eventData: e.newValues,
      userId: e.userId || '',
      userEmail: '',
      ipAddress: e.ipAddress || undefined,
      userAgent: e.userAgent || undefined,
      createdAt: e.createdAt,
    }));
  }
}

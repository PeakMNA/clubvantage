import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface AvailabilityCheck {
  resourceId: string;
  startTime: Date;
  endTime: Date;
  excludeBookingId?: string;
}

export interface AvailabilityResult {
  available: boolean;
  conflictingBookings?: ConflictingBooking[];
  reason?: string;
}

export interface ConflictingBooking {
  id: string;
  bookingNumber: string;
  resourceId: string;
  resourceName: string;
  startTime: Date;
  endTime: Date;
  memberName: string;
}

export interface ResourceWithHierarchy {
  id: string;
  name: string;
  parentResourceId: string | null;
  isBookable: boolean;
  children?: ResourceWithHierarchy[];
}

/**
 * Service for checking resource availability with support for nested resources.
 *
 * Nested Resource Conflict Detection:
 * - When booking a parent resource (e.g., "Grand Ballroom"), all child resources
 *   (e.g., "Ballroom A", "Ballroom B") are also considered booked
 * - When booking a child resource, the parent resource is considered partially booked
 *   and cannot be booked as a whole during that time
 * - Sibling resources remain independently bookable
 *
 * Example:
 * - Grand Ballroom (parent)
 *   - Ballroom A (child)
 *   - Ballroom B (child)
 *
 * If Ballroom A is booked 2-4pm:
 * - Grand Ballroom cannot be booked 2-4pm (child is in use)
 * - Ballroom B can still be booked 2-4pm (sibling is independent)
 *
 * If Grand Ballroom is booked 2-4pm:
 * - Ballroom A cannot be booked 2-4pm (parent is booked)
 * - Ballroom B cannot be booked 2-4pm (parent is booked)
 */
@Injectable()
export class ResourceAvailabilityService {
  private readonly logger = new Logger(ResourceAvailabilityService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if a resource is available for booking during a specific time range.
   * Considers parent and child resources for conflict detection.
   */
  async checkAvailability(
    tenantId: string,
    check: AvailabilityCheck,
  ): Promise<AvailabilityResult> {
    const resource = await this.getResourceWithHierarchy(tenantId, check.resourceId);

    if (!resource) {
      return { available: false, reason: 'Resource not found' };
    }

    if (!resource.isBookable) {
      return { available: false, reason: 'Resource is not bookable' };
    }

    // Get all resource IDs that need to be checked for conflicts
    const resourceIdsToCheck = await this.getResourceIdsToCheck(tenantId, check.resourceId);

    // Find any conflicting bookings
    const conflicts = await this.findConflictingBookings(
      tenantId,
      resourceIdsToCheck,
      check.startTime,
      check.endTime,
      check.excludeBookingId,
    );

    if (conflicts.length > 0) {
      return {
        available: false,
        conflictingBookings: conflicts,
        reason: this.formatConflictReason(conflicts, check.resourceId),
      };
    }

    return { available: true };
  }

  /**
   * Check availability for multiple resources at once.
   * Useful for bulk booking or displaying availability grids.
   */
  async checkMultipleAvailability(
    tenantId: string,
    checks: AvailabilityCheck[],
  ): Promise<Map<string, AvailabilityResult>> {
    const results = new Map<string, AvailabilityResult>();

    // Process in parallel for better performance
    await Promise.all(
      checks.map(async (check) => {
        const result = await this.checkAvailability(tenantId, check);
        results.set(check.resourceId, result);
      }),
    );

    return results;
  }

  /**
   * Get all available time slots for a resource on a given date.
   * Considers operating hours and existing bookings.
   */
  async getAvailableSlots(
    tenantId: string,
    resourceId: string,
    date: Date,
    slotDurationMinutes: number = 60,
    operatingHours?: { start: number; end: number },
  ): Promise<{ start: Date; end: Date }[]> {
    const startHour = operatingHours?.start ?? 8;
    const endHour = operatingHours?.end ?? 22;

    const startOfDay = new Date(date);
    startOfDay.setHours(startHour, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(endHour, 0, 0, 0);

    // Get all resource IDs to check
    const resourceIdsToCheck = await this.getResourceIdsToCheck(tenantId, resourceId);

    // Get all bookings for these resources on this day
    const bookings = await this.prisma.booking.findMany({
      where: {
        clubId: tenantId,
        resourceId: { in: resourceIdsToCheck },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        startTime: { lt: endOfDay },
        endTime: { gt: startOfDay },
      },
      orderBy: { startTime: 'asc' },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Generate all possible slots
    const slots: { start: Date; end: Date }[] = [];
    let currentTime = new Date(startOfDay);

    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime.getTime() + slotDurationMinutes * 60000);

      if (slotEnd > endOfDay) break;

      // Check if this slot conflicts with any booking
      const hasConflict = bookings.some(
        (booking) =>
          booking.startTime < slotEnd && booking.endTime > currentTime,
      );

      if (!hasConflict) {
        slots.push({ start: new Date(currentTime), end: new Date(slotEnd) });
      }

      currentTime = new Date(currentTime.getTime() + slotDurationMinutes * 60000);
    }

    return slots;
  }

  /**
   * Get a resource with its full hierarchy (parent and children).
   */
  private async getResourceWithHierarchy(
    tenantId: string,
    resourceId: string,
  ): Promise<ResourceWithHierarchy | null> {
    const resource = await this.prisma.resource.findFirst({
      where: {
        id: resourceId,
        clubId: tenantId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        parentResourceId: true,
        isBookable: true,
        children: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            parentResourceId: true,
            isBookable: true,
          },
        },
      },
    });

    return resource;
  }

  /**
   * Get all resource IDs that need to be checked for conflicts.
   * Includes the resource itself, its parent (if any), and all children.
   */
  private async getResourceIdsToCheck(
    tenantId: string,
    resourceId: string,
  ): Promise<string[]> {
    const resource = await this.prisma.resource.findFirst({
      where: { id: resourceId, clubId: tenantId },
      select: {
        id: true,
        parentResourceId: true,
        children: {
          where: { isActive: true },
          select: { id: true },
        },
      },
    });

    if (!resource) return [resourceId];

    const resourceIds = new Set<string>();

    // Add the resource itself
    resourceIds.add(resourceId);

    // Add parent if exists
    if (resource.parentResourceId) {
      resourceIds.add(resource.parentResourceId);
    }

    // Add all children
    resource.children.forEach((child) => resourceIds.add(child.id));

    // If this resource has a parent, also get siblings (other children of parent)
    // This is important for checking if parent can be booked
    if (resource.parentResourceId) {
      const siblings = await this.prisma.resource.findMany({
        where: {
          parentResourceId: resource.parentResourceId,
          isActive: true,
        },
        select: { id: true },
      });
      siblings.forEach((sibling) => resourceIds.add(sibling.id));
    }

    return Array.from(resourceIds);
  }

  /**
   * Find all conflicting bookings for the given resources and time range.
   */
  private async findConflictingBookings(
    tenantId: string,
    resourceIds: string[],
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string,
  ): Promise<ConflictingBooking[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        clubId: tenantId,
        resourceId: { in: resourceIds },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        // Time overlap check: booking.start < check.end AND booking.end > check.start
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      select: {
        id: true,
        bookingNumber: true,
        resourceId: true,
        startTime: true,
        endTime: true,
        resource: {
          select: { name: true },
        },
        member: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return bookings.map((booking) => ({
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      resourceId: booking.resourceId!,
      resourceName: booking.resource?.name || 'Unknown',
      startTime: booking.startTime,
      endTime: booking.endTime,
      memberName: booking.member
        ? `${booking.member.firstName} ${booking.member.lastName}`
        : 'Unknown',
    }));
  }

  /**
   * Format a human-readable conflict reason.
   */
  private formatConflictReason(
    conflicts: ConflictingBooking[],
    requestedResourceId: string,
  ): string {
    const directConflict = conflicts.find((c) => c.resourceId === requestedResourceId);

    if (directConflict) {
      return `This resource is already booked by ${directConflict.memberName} from ${this.formatTime(directConflict.startTime)} to ${this.formatTime(directConflict.endTime)}`;
    }

    // Conflict is with parent or child
    const parentConflict = conflicts.find((c) => c.resourceId !== requestedResourceId);
    if (parentConflict) {
      return `Cannot book this resource because ${parentConflict.resourceName} is booked by ${parentConflict.memberName} from ${this.formatTime(parentConflict.startTime)} to ${this.formatTime(parentConflict.endTime)}`;
    }

    return 'This time slot is not available';
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Get the complete resource tree for a facility.
   * Useful for displaying nested resource structures in the UI.
   */
  async getResourceTree(
    tenantId: string,
    facilityId: string,
  ): Promise<ResourceWithHierarchy[]> {
    // Get all top-level resources (no parent)
    const topLevelResources = await this.prisma.resource.findMany({
      where: {
        clubId: tenantId,
        facilityId,
        parentResourceId: null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        parentResourceId: true,
        isBookable: true,
        children: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            parentResourceId: true,
            isBookable: true,
            children: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                parentResourceId: true,
                isBookable: true,
              },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return topLevelResources;
  }
}

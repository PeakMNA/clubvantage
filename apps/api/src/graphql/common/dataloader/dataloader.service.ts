import { Injectable, Logger } from '@nestjs/common';
import DataLoader from 'dataloader';
import { PrismaService } from '@/shared/prisma/prisma.service';

/**
 * Interface for all DataLoaders available in the GraphQL context
 */
export interface IDataLoaders {
  // Member-related loaders
  memberById: DataLoader<string, any>;
  dependentsByMemberId: DataLoader<string, any[]>;
  membershipByMemberId: DataLoader<string, any>;

  // Billing-related loaders
  invoicesByMemberId: DataLoader<string, any[]>;
  invoiceLineItemsByInvoiceId: DataLoader<string, any[]>;
  receiptsByMemberId: DataLoader<string, any[]>;
  paymentAllocationsByReceiptId: DataLoader<string, any[]>;

  // Golf-related loaders
  teeTimePlayersByTeeTimeId: DataLoader<string, any[]>;
  courseById: DataLoader<string, any>;

  // Generic loaders
  clubById: DataLoader<string, any>;
  userById: DataLoader<string, any>;
}

/**
 * DataLoader Service
 *
 * Creates request-scoped DataLoaders for batching and caching database queries.
 * Each request gets fresh DataLoader instances to prevent cross-request data leakage.
 *
 * Best Practices:
 * - DataLoaders should be created per-request (handled by createLoaders)
 * - Keys must be serializable (strings or numbers)
 * - Loaders return results in the same order as input keys
 * - Missing items should return null, not throw errors
 */
@Injectable()
export class DataLoaderService {
  private readonly logger = new Logger(DataLoaderService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create all DataLoaders for a request.
   * Call this once per GraphQL request in the context factory.
   *
   * @param tenantId - The tenant ID to scope queries
   */
  createLoaders(tenantId: string): IDataLoaders {
    return {
      // Member loaders
      memberById: this.createMemberByIdLoader(tenantId),
      dependentsByMemberId: this.createDependentsByMemberIdLoader(tenantId),
      membershipByMemberId: this.createMembershipByMemberIdLoader(tenantId),

      // Billing loaders
      invoicesByMemberId: this.createInvoicesByMemberIdLoader(tenantId),
      invoiceLineItemsByInvoiceId: this.createInvoiceLineItemsByInvoiceIdLoader(tenantId),
      receiptsByMemberId: this.createPaymentsByMemberIdLoader(tenantId),
      paymentAllocationsByReceiptId: this.createPaymentAllocationsByPaymentIdLoader(tenantId),

      // Golf loaders
      teeTimePlayersByTeeTimeId: this.createTeeTimePlayersByTeeTimeIdLoader(tenantId),
      courseById: this.createCourseByIdLoader(tenantId),

      // Generic loaders
      clubById: this.createClubByIdLoader(),
      userById: this.createUserByIdLoader(tenantId),
    };
  }

  // ============================================
  // Member DataLoaders
  // ============================================

  private createMemberByIdLoader(tenantId: string): DataLoader<string, any> {
    return new DataLoader(async (ids: readonly string[]) => {
      this.logger.debug(`Batch loading ${ids.length} members`);

      const members = await this.prisma.member.findMany({
        where: {
          id: { in: [...ids] },
          clubId: tenantId,
        },
      });

      // Create a map for O(1) lookup
      const memberMap = new Map(members.map((m) => [m.id, m]));

      // Return in same order as input IDs
      return ids.map((id) => memberMap.get(id) || null);
    });
  }

  private createDependentsByMemberIdLoader(tenantId: string): DataLoader<string, any[]> {
    return new DataLoader(async (memberIds: readonly string[]) => {
      this.logger.debug(`Batch loading dependents for ${memberIds.length} members`);

      const dependents = await this.prisma.dependent.findMany({
        where: {
          memberId: { in: [...memberIds] },
          member: { clubId: tenantId },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Group by memberId
      const dependentMap = new Map<string, any[]>();
      for (const dep of dependents) {
        const existing = dependentMap.get(dep.memberId) || [];
        existing.push(dep);
        dependentMap.set(dep.memberId, existing);
      }

      // Return in same order as input IDs, empty array for members with no dependents
      return memberIds.map((id) => dependentMap.get(id) || []);
    });
  }

  private createMembershipByMemberIdLoader(tenantId: string): DataLoader<string, any> {
    return new DataLoader(async (memberIds: readonly string[]) => {
      this.logger.debug(`Batch loading memberships for ${memberIds.length} members`);

      const memberships = await this.prisma.membershipType.findMany({
        where: {
          members: {
            some: {
              id: { in: [...memberIds] },
              clubId: tenantId,
            },
          },
        },
        include: {
          members: {
            where: { id: { in: [...memberIds] } },
            select: { id: true },
          },
        },
      });

      // Create a map: memberId -> membershipType
      const membershipMap = new Map<string, any>();
      for (const membership of memberships) {
        for (const member of membership.members) {
          membershipMap.set(member.id, { ...membership, members: undefined });
        }
      }

      return memberIds.map((id) => membershipMap.get(id) || null);
    });
  }

  // ============================================
  // Billing DataLoaders
  // ============================================

  private createInvoicesByMemberIdLoader(tenantId: string): DataLoader<string, any[]> {
    return new DataLoader(async (memberIds: readonly string[]) => {
      this.logger.debug(`Batch loading invoices for ${memberIds.length} members`);

      const invoices = await this.prisma.invoice.findMany({
        where: {
          memberId: { in: [...memberIds] },
          clubId: tenantId,
        },
        orderBy: { invoiceDate: 'desc' },
      });

      // Group by memberId
      const invoiceMap = new Map<string, any[]>();
      for (const inv of invoices) {
        if (inv.memberId) {
          const existing = invoiceMap.get(inv.memberId) || [];
          existing.push(inv);
          invoiceMap.set(inv.memberId, existing);
        }
      }

      return memberIds.map((id) => invoiceMap.get(id) || []);
    });
  }

  private createInvoiceLineItemsByInvoiceIdLoader(tenantId: string): DataLoader<string, any[]> {
    return new DataLoader(async (invoiceIds: readonly string[]) => {
      this.logger.debug(`Batch loading line items for ${invoiceIds.length} invoices`);

      const lineItems = await this.prisma.invoiceLineItem.findMany({
        where: {
          invoiceId: { in: [...invoiceIds] },
          invoice: { clubId: tenantId },
        },
        orderBy: { sortOrder: 'asc' },
      });

      // Group by invoiceId
      const itemMap = new Map<string, any[]>();
      for (const item of lineItems) {
        const existing = itemMap.get(item.invoiceId) || [];
        existing.push(item);
        itemMap.set(item.invoiceId, existing);
      }

      return invoiceIds.map((id) => itemMap.get(id) || []);
    });
  }

  private createPaymentsByMemberIdLoader(tenantId: string): DataLoader<string, any[]> {
    return new DataLoader(async (memberIds: readonly string[]) => {
      this.logger.debug(`Batch loading payments for ${memberIds.length} members`);

      const payments = await this.prisma.payment.findMany({
        where: {
          memberId: { in: [...memberIds] },
          clubId: tenantId,
        },
        orderBy: { paymentDate: 'desc' },
      });

      // Group by memberId
      const paymentMap = new Map<string, any[]>();
      for (const payment of payments) {
        if (payment.memberId) {
          const existing = paymentMap.get(payment.memberId) || [];
          existing.push(payment);
          paymentMap.set(payment.memberId, existing);
        }
      }

      return memberIds.map((id) => paymentMap.get(id) || []);
    });
  }

  private createPaymentAllocationsByPaymentIdLoader(tenantId: string): DataLoader<string, any[]> {
    return new DataLoader(async (paymentIds: readonly string[]) => {
      this.logger.debug(`Batch loading allocations for ${paymentIds.length} payments`);

      const allocations = await this.prisma.paymentAllocation.findMany({
        where: {
          paymentId: { in: [...paymentIds] },
          payment: { clubId: tenantId },
        },
        include: {
          invoice: true,
        },
      });

      // Group by paymentId
      const allocationMap = new Map<string, any[]>();
      for (const alloc of allocations) {
        const existing = allocationMap.get(alloc.paymentId) || [];
        existing.push(alloc);
        allocationMap.set(alloc.paymentId, existing);
      }

      return paymentIds.map((id) => allocationMap.get(id) || []);
    });
  }

  // ============================================
  // Golf DataLoaders
  // ============================================

  private createTeeTimePlayersByTeeTimeIdLoader(tenantId: string): DataLoader<string, any[]> {
    return new DataLoader(async (teeTimeIds: readonly string[]) => {
      this.logger.debug(`Batch loading players for ${teeTimeIds.length} tee times`);

      const players = await this.prisma.teeTimePlayer.findMany({
        where: {
          teeTimeId: { in: [...teeTimeIds] },
          teeTime: { clubId: tenantId },
        },
        include: {
          member: true,
          caddy: true,
        },
        orderBy: { position: 'asc' },
      });

      // Group by teeTimeId
      const playerMap = new Map<string, any[]>();
      for (const player of players) {
        const existing = playerMap.get(player.teeTimeId) || [];
        existing.push(player);
        playerMap.set(player.teeTimeId, existing);
      }

      return teeTimeIds.map((id) => playerMap.get(id) || []);
    });
  }

  private createCourseByIdLoader(tenantId: string): DataLoader<string, any> {
    return new DataLoader(async (ids: readonly string[]) => {
      this.logger.debug(`Batch loading ${ids.length} courses`);

      const courses = await this.prisma.golfCourse.findMany({
        where: {
          id: { in: [...ids] },
          clubId: tenantId,
        },
      });

      const courseMap = new Map(courses.map((c) => [c.id, c]));
      return ids.map((id) => courseMap.get(id) || null);
    });
  }

  // ============================================
  // Generic DataLoaders
  // ============================================

  private createClubByIdLoader(): DataLoader<string, any> {
    return new DataLoader(async (ids: readonly string[]) => {
      this.logger.debug(`Batch loading ${ids.length} clubs`);

      const clubs = await this.prisma.club.findMany({
        where: { id: { in: [...ids] } },
      });

      const clubMap = new Map(clubs.map((c) => [c.id, c]));
      return ids.map((id) => clubMap.get(id) || null);
    });
  }

  private createUserByIdLoader(tenantId: string): DataLoader<string, any> {
    return new DataLoader(async (ids: readonly string[]) => {
      this.logger.debug(`Batch loading ${ids.length} users`);

      const users = await this.prisma.user.findMany({
        where: {
          id: { in: [...ids] },
          clubId: tenantId,
        },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));
      return ids.map((id) => userMap.get(id) || null);
    });
  }
}

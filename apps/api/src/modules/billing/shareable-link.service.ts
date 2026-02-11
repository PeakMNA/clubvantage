import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class ShareableLinkService {
  private readonly logger = new Logger(ShareableLinkService.name);

  constructor(private prisma: PrismaService) {}

  async createLink(
    tenantId: string,
    dto: {
      entityType: 'INVOICE' | 'RECEIPT' | 'STATEMENT';
      entityId: string;
      expiresInDays?: number;
      maxViews?: number;
      password?: string;
    },
    userId: string,
  ) {
    // Validate entity exists
    if (dto.entityType === 'INVOICE') {
      const invoice = await this.prisma.invoice.findFirst({
        where: { id: dto.entityId, clubId: tenantId },
      });
      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }
    } else if (dto.entityType === 'RECEIPT') {
      const payment = await this.prisma.payment.findFirst({
        where: { id: dto.entityId, clubId: tenantId },
      });
      if (!payment) {
        throw new NotFoundException('Receipt not found');
      }
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = dto.expiresInDays
      ? new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const link = await this.prisma.shareableLink.create({
      data: {
        clubId: tenantId,
        token,
        entityType: dto.entityType,
        entityId: dto.entityId,
        expiresAt,
        maxViews: dto.maxViews ?? null,
        password: dto.password ?? null,
        createdBy: userId,
      },
    });

    this.logger.log(
      `Created shareable link ${link.id} for ${dto.entityType} ${dto.entityId}`,
    );

    return link;
  }

  async resolveLink(token: string, password?: string) {
    const link = await this.prisma.shareableLink.findUnique({
      where: { token },
    });

    if (!link) {
      throw new NotFoundException('Link not found or has expired');
    }

    if (!link.isActive) {
      throw new BadRequestException('This link has been revoked');
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new BadRequestException('This link has expired');
    }

    if (link.maxViews && link.viewCount >= link.maxViews) {
      throw new BadRequestException('This link has reached its view limit');
    }

    if (link.password && link.password !== password) {
      throw new BadRequestException('Invalid password');
    }

    // Increment view count
    await this.prisma.shareableLink.update({
      where: { id: link.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });

    // Fetch the entity data
    if (link.entityType === 'INVOICE') {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: link.entityId },
        include: {
          member: {
            select: { id: true, memberId: true, firstName: true, lastName: true },
          },
          lineItems: true,
          club: {
            select: { id: true, name: true, address: true, phone: true, email: true },
          },
        },
      });
      return { entityType: link.entityType, entity: invoice };
    }

    if (link.entityType === 'RECEIPT') {
      const payment = await this.prisma.payment.findUnique({
        where: { id: link.entityId },
        include: {
          member: {
            select: { id: true, memberId: true, firstName: true, lastName: true },
          },
          allocations: {
            include: {
              invoice: {
                select: { id: true, invoiceNumber: true, totalAmount: true },
              },
            },
          },
          club: {
            select: { id: true, name: true, address: true, phone: true, email: true },
          },
        },
      });
      return { entityType: link.entityType, entity: payment };
    }

    throw new BadRequestException('Unsupported entity type');
  }

  async revokeLink(tenantId: string, linkId: string) {
    const link = await this.prisma.shareableLink.findFirst({
      where: { id: linkId, clubId: tenantId },
    });

    if (!link) {
      throw new NotFoundException('Shareable link not found');
    }

    return this.prisma.shareableLink.update({
      where: { id: linkId },
      data: { isActive: false },
    });
  }

  async getLinksForEntity(
    tenantId: string,
    entityType: string,
    entityId: string,
  ) {
    return this.prisma.shareableLink.findMany({
      where: {
        clubId: tenantId,
        entityType: entityType as any,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

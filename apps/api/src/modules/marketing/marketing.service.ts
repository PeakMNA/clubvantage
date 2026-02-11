import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { AudienceService } from './audience.service';
import { ChannelEmailService } from './channel-email.service';

export interface CreateCampaignDto {
  name: string;
  type: string;
  channels: string[];
  segmentIds?: string[];
}

export interface UpdateCampaignDto {
  name?: string;
  type?: string;
  channels?: string[];
  scheduledAt?: Date;
  segmentIds?: string[];
}

export interface CampaignFilters {
  status?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audienceService: AudienceService,
    private readonly channelEmailService: ChannelEmailService,
  ) {}

  async createCampaign(clubId: string, dto: CreateCampaignDto, userId: string) {
    const campaign = await this.prisma.marketingCampaign.create({
      data: {
        clubId,
        name: dto.name,
        type: dto.type,
        status: 'DRAFT',
        channels: dto.channels,
        createdBy: userId,
        ...(dto.segmentIds?.length
          ? { segments: { connect: dto.segmentIds.map((id) => ({ id })) } }
          : {}),
      },
      include: {
        segments: true,
        contentPieces: true,
      },
    });
    return campaign;
  }

  async getCampaigns(clubId: string, filters?: CampaignFilters) {
    return this.prisma.marketingCampaign.findMany({
      where: {
        clubId,
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.type ? { type: filters.type } : {}),
      },
      include: {
        segments: { select: { id: true, name: true, memberCount: true } },
        _count: { select: { contentPieces: true, members: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit ?? 50,
      skip: filters?.offset ?? 0,
    });
  }

  async getCampaign(clubId: string, campaignId: string) {
    const campaign = await this.prisma.marketingCampaign.findFirst({
      where: { id: campaignId, clubId },
      include: {
        segments: true,
        contentPieces: true,
        analytics: { orderBy: { date: 'desc' }, take: 30 },
      },
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }

  async updateCampaign(clubId: string, campaignId: string, dto: UpdateCampaignDto) {
    const campaign = await this.getCampaign(clubId, campaignId);

    return this.prisma.marketingCampaign.update({
      where: { id: campaign.id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.channels !== undefined ? { channels: dto.channels } : {}),
        ...(dto.scheduledAt !== undefined ? { scheduledAt: dto.scheduledAt } : {}),
        ...(dto.segmentIds
          ? { segments: { set: dto.segmentIds.map((id) => ({ id })) } }
          : {}),
      },
      include: {
        segments: true,
        contentPieces: true,
      },
    });
  }

  async deleteCampaign(clubId: string, campaignId: string) {
    const campaign = await this.getCampaign(clubId, campaignId);
    if (campaign.status !== 'DRAFT') {
      throw new Error('Only draft campaigns can be deleted');
    }
    await this.prisma.marketingCampaign.delete({
      where: { id: campaign.id },
    });
    return true;
  }

  async sendCampaign(clubId: string, campaignId: string, userId: string) {
    const campaign = await this.prisma.marketingCampaign.findFirst({
      where: { id: campaignId, clubId },
      include: {
        segments: true,
        contentPieces: { where: { type: 'EMAIL' } },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status !== 'DRAFT') {
      throw new Error('Campaign must be in DRAFT status to send');
    }

    const emailContent = campaign.contentPieces[0];
    if (!emailContent) {
      throw new Error('Campaign has no email content');
    }

    // 1. Resolve audience segments → member list
    const memberIds = new Set<string>();
    for (const segment of campaign.segments) {
      const members = await this.audienceService.getSegmentMembers(
        clubId,
        segment.id,
        { take: 10000 },
      );
      for (const m of members) {
        memberIds.add(m.id);
      }
    }

    // 2. Filter out unsubscribed members
    const eligibleMembers = await this.prisma.member.findMany({
      where: {
        id: { in: Array.from(memberIds) },
        isActive: true,
        OR: [
          { communicationPrefs: { emailPromotions: true } },
          { communicationPrefs: null },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        membershipType: { select: { name: true } },
      },
    });

    // 3. Personalize and send emails
    const emails = eligibleMembers
      .filter((m) => m.email)
      .map((m) => {
        let body = emailContent.body;
        body = body.replace(/\{\{firstName\}\}/g, m.firstName);
        body = body.replace(/\{\{lastName\}\}/g, m.lastName);
        body = body.replace(
          /\{\{membershipType\}\}/g,
          m.membershipType?.name || '',
        );

        let subject = emailContent.subject || '';
        subject = subject.replace(/\{\{firstName\}\}/g, m.firstName);

        return {
          memberId: m.id,
          to: m.email!,
          subject,
          html: body,
        };
      });

    // 4. Batch send via email channel
    const batchEmails = emails.map((e) => ({
      to: e.to,
      subject: e.subject,
      html: e.html,
    }));
    const results = await this.channelEmailService.sendBatch(clubId, batchEmails);

    // 5. Create campaign member records
    const campaignMembers = emails.map((e, i) => ({
      campaignId: campaign.id,
      memberId: e.memberId,
      status: results[i]?.success ? 'SENT' : 'BOUNCED',
      sentAt: results[i]?.success ? new Date() : null,
    }));

    await this.prisma.marketingCampaignMember.createMany({
      data: campaignMembers,
      skipDuplicates: true,
    });

    // 6. Update campaign status
    const sentCount = results.filter((r) => r.success).length;
    const updated = await this.prisma.marketingCampaign.update({
      where: { id: campaign.id },
      data: {
        status: 'ACTIVE',
        sentAt: new Date(),
      },
      include: {
        segments: true,
        contentPieces: true,
      },
    });

    // 7. Create initial analytics record
    await this.prisma.marketingCampaignAnalytics.create({
      data: {
        campaignId: campaign.id,
        period: 'DAILY',
        date: new Date(),
        sent: sentCount,
        bounced: results.filter((r) => !r.success).length,
      },
    });

    this.logger.log(
      `Campaign ${campaign.name} sent to ${sentCount}/${emails.length} recipients`,
    );

    return updated;
  }

  async getCampaignMetrics(clubId: string, campaignId: string) {
    const campaign = await this.getCampaign(clubId, campaignId);

    const metrics = await this.prisma.marketingCampaignMember.groupBy({
      by: ['status'],
      where: { campaignId: campaign.id },
      _count: true,
    });

    const statusCounts: Record<string, number> = {};
    for (const m of metrics) {
      statusCounts[m.status] = m._count;
    }

    const sent = (statusCounts['SENT'] || 0) +
      (statusCounts['DELIVERED'] || 0) +
      (statusCounts['OPENED'] || 0) +
      (statusCounts['CLICKED'] || 0);
    const delivered = (statusCounts['DELIVERED'] || 0) +
      (statusCounts['OPENED'] || 0) +
      (statusCounts['CLICKED'] || 0);

    return {
      sent,
      delivered,
      opened: statusCounts['OPENED'] || 0,
      clicked: statusCounts['CLICKED'] || 0,
      bounced: statusCounts['BOUNCED'] || 0,
      unsubscribed: statusCounts['UNSUBSCRIBED'] || 0,
    };
  }

  async getMarketingStats(clubId: string) {
    const [totalCampaigns, activeCampaigns, totalAudienceSize, totalEmailsSent] =
      await Promise.all([
        this.prisma.marketingCampaign.count({ where: { clubId } }),
        this.prisma.marketingCampaign.count({
          where: { clubId, status: 'ACTIVE' },
        }),
        this.prisma.marketingAudienceSegment
          .aggregate({
            where: { clubId, isArchived: false },
            _sum: { memberCount: true },
          })
          .then((r) => r._sum.memberCount || 0),
        this.prisma.marketingCampaignMember.count({
          where: {
            campaign: { clubId },
            status: { in: ['SENT', 'DELIVERED', 'OPENED', 'CLICKED'] },
          },
        }),
      ]);

    return {
      totalCampaigns,
      activeCampaigns,
      totalAudienceSize,
      totalEmailsSent,
    };
  }
}

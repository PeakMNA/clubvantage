import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MarketingService } from '@/modules/marketing/marketing.service';
import { AudienceService } from '@/modules/marketing/audience.service';
import { ContentGenerationService } from '@/modules/marketing/content-generation.service';
import { ChannelEmailService } from '@/modules/marketing/channel-email.service';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
  AudienceSegmentType,
  SegmentMemberType,
  SegmentTranslationResultType,
  CampaignType,
  CampaignMetricsType,
  CampaignAnalyticsType,
  ContentPieceType,
  ChannelConfigType,
  BrandConfigType,
  MarketingStatsType,
  GeneratedContentType,
  SegmentTypeEnum,
  CampaignStatusEnum,
  CampaignTypeEnum,
  ContentTypeEnum,
  ContentStatusEnum,
  ChannelTypeEnum,
  ChannelStatusEnum,
  MetricPeriodEnum,
} from './marketing.types';
import {
  CreateSegmentInput,
  UpdateSegmentInput,
  SegmentFilterInput,
  CreateCampaignInput,
  UpdateCampaignInput,
  CampaignFilterInput,
  GenerateContentInput,
  ImproveContentInput,
  UpdateBrandConfigInput,
  UpdateChannelConfigInput,
} from './marketing.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class MarketingResolver {
  constructor(
    private readonly marketingService: MarketingService,
    private readonly audienceService: AudienceService,
    private readonly contentGenerationService: ContentGenerationService,
    private readonly channelEmailService: ChannelEmailService,
    private readonly prisma: PrismaService,
  ) {}

  // ==================== Segment Queries ====================

  @Query(() => [AudienceSegmentType], { name: 'marketingSegments', description: 'Get audience segments' })
  async getSegments(
    @GqlCurrentUser() user: JwtPayload,
    @Args('filter', { nullable: true }) filter?: SegmentFilterInput,
  ): Promise<AudienceSegmentType[]> {
    const segments = await this.audienceService.getSegments(user.tenantId, {
      type: filter?.type,
      isArchived: filter?.isArchived,
    });
    return segments.map((s) => this.transformSegment(s));
  }

  @Query(() => AudienceSegmentType, { name: 'marketingSegment', description: 'Get a single audience segment' })
  async getSegment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<AudienceSegmentType> {
    const segment = await this.audienceService.getSegment(user.tenantId, id);
    return this.transformSegment(segment);
  }

  @Query(() => [SegmentMemberType], { name: 'marketingSegmentMembers', description: 'Get members in a segment' })
  async getSegmentMembers(
    @GqlCurrentUser() user: JwtPayload,
    @Args('segmentId', { type: () => ID }) segmentId: string,
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 }) skip?: number,
    @Args('take', { type: () => Int, nullable: true, defaultValue: 50 }) take?: number,
  ): Promise<SegmentMemberType[]> {
    const members = await this.audienceService.getSegmentMembers(
      user.tenantId,
      segmentId,
      { skip, take },
    );
    return members.map((m) => ({
      id: m.id,
      memberId: m.memberId,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email ?? undefined,
      status: m.status,
      membershipTypeName: m.membershipType?.name ?? undefined,
    }));
  }

  @Query(() => SegmentTranslationResultType, { name: 'translateSegmentQuery', description: 'Translate natural language to segment rules' })
  async translateSegmentQuery(
    @GqlCurrentUser() user: JwtPayload,
    @Args('query') query: string,
  ): Promise<SegmentTranslationResultType> {
    const result = await this.audienceService.translateNaturalLanguage(
      user.tenantId,
      query,
    );
    return {
      rules: result.rules,
      explanation: result.explanation,
      estimatedCount: result.estimatedCount,
    };
  }

  // ==================== Segment Mutations ====================

  @Mutation(() => AudienceSegmentType, { name: 'createMarketingSegment', description: 'Create an audience segment' })
  async createSegment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateSegmentInput,
  ): Promise<AudienceSegmentType> {
    const segment = await this.audienceService.createSegment(user.tenantId, {
      name: input.name,
      description: input.description,
      type: input.type,
      rules: input.rules,
      naturalLanguageQuery: input.naturalLanguageQuery,
    });
    return this.transformSegment(segment);
  }

  @Mutation(() => AudienceSegmentType, { name: 'updateMarketingSegment', description: 'Update an audience segment' })
  async updateSegment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSegmentInput,
  ): Promise<AudienceSegmentType> {
    const segment = await this.audienceService.updateSegment(user.tenantId, id, {
      name: input.name,
      description: input.description,
      rules: input.rules,
    });
    return this.transformSegment(segment);
  }

  @Mutation(() => Boolean, { name: 'deleteMarketingSegment', description: 'Archive an audience segment' })
  async deleteSegment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.audienceService.deleteSegment(user.tenantId, id);
  }

  @Mutation(() => AudienceSegmentType, { name: 'refreshSegmentCount', description: 'Refresh segment member count' })
  async refreshSegmentCount(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<AudienceSegmentType> {
    const segment = await this.audienceService.refreshSegmentCount(user.tenantId, id);
    return this.transformSegment(segment);
  }

  // ==================== Campaign Queries ====================

  @Query(() => [CampaignType], { name: 'marketingCampaigns', description: 'Get marketing campaigns' })
  async getCampaigns(
    @GqlCurrentUser() user: JwtPayload,
    @Args('filter', { nullable: true }) filter?: CampaignFilterInput,
  ): Promise<CampaignType[]> {
    const campaigns = await this.marketingService.getCampaigns(user.tenantId, {
      status: filter?.status,
      type: filter?.type,
      limit: filter?.limit,
      offset: filter?.offset,
    });
    return campaigns.map((c) => this.transformCampaign(c));
  }

  @Query(() => CampaignType, { name: 'marketingCampaign', description: 'Get a single campaign' })
  async getCampaign(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CampaignType> {
    const campaign = await this.marketingService.getCampaign(user.tenantId, id);
    return this.transformCampaign(campaign);
  }

  @Query(() => CampaignMetricsType, { name: 'marketingCampaignMetrics', description: 'Get campaign delivery metrics' })
  async getCampaignMetrics(
    @GqlCurrentUser() user: JwtPayload,
    @Args('campaignId', { type: () => ID }) campaignId: string,
  ): Promise<CampaignMetricsType> {
    return this.marketingService.getCampaignMetrics(user.tenantId, campaignId);
  }

  @Query(() => MarketingStatsType, { name: 'marketingStats', description: 'Get marketing overview stats' })
  async getMarketingStats(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<MarketingStatsType> {
    return this.marketingService.getMarketingStats(user.tenantId);
  }

  // ==================== Campaign Mutations ====================

  @Mutation(() => CampaignType, { name: 'createMarketingCampaign', description: 'Create a new campaign' })
  async createCampaign(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateCampaignInput,
  ): Promise<CampaignType> {
    const campaign = await this.marketingService.createCampaign(
      user.tenantId,
      {
        name: input.name,
        type: input.type,
        channels: input.channels,
        segmentIds: input.segmentIds,
      },
      user.sub,
    );
    return this.transformCampaign(campaign);
  }

  @Mutation(() => CampaignType, { name: 'updateMarketingCampaign', description: 'Update a campaign' })
  async updateCampaign(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCampaignInput,
  ): Promise<CampaignType> {
    const campaign = await this.marketingService.updateCampaign(
      user.tenantId,
      id,
      {
        name: input.name,
        type: input.type,
        channels: input.channels,
        scheduledAt: input.scheduledAt,
        segmentIds: input.segmentIds,
      },
    );
    return this.transformCampaign(campaign);
  }

  @Mutation(() => Boolean, { name: 'deleteMarketingCampaign', description: 'Delete a draft campaign' })
  async deleteCampaign(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.marketingService.deleteCampaign(user.tenantId, id);
  }

  @Mutation(() => CampaignType, { name: 'sendMarketingCampaign', description: 'Send a campaign to its audience' })
  async sendCampaign(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CampaignType> {
    const campaign = await this.marketingService.sendCampaign(
      user.tenantId,
      id,
      user.sub,
    );
    return this.transformCampaign(campaign);
  }

  // ==================== Content Queries & Mutations ====================

  @Query(() => [ContentPieceType], { name: 'marketingContent', description: 'Get content pieces for a campaign' })
  async getContentPieces(
    @GqlCurrentUser() user: JwtPayload,
    @Args('campaignId', { type: () => ID }) campaignId: string,
  ): Promise<ContentPieceType[]> {
    const campaign = await this.marketingService.getCampaign(user.tenantId, campaignId);
    return (campaign.contentPieces || []).map((c: any) => this.transformContent(c));
  }

  @Mutation(() => GeneratedContentType, { name: 'generateMarketingContent', description: 'AI-generate email content' })
  async generateContent(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: GenerateContentInput,
  ): Promise<GeneratedContentType> {
    return this.contentGenerationService.generateEmailContent(user.tenantId, {
      campaignGoal: input.campaignGoal,
      audienceDescription: input.audienceDescription,
      tone: input.tone,
      contentType: input.contentType,
    });
  }

  @Mutation(() => GeneratedContentType, { name: 'generateMarketingVariant', description: 'Generate A/B variant of content' })
  async generateVariant(
    @GqlCurrentUser() user: JwtPayload,
    @Args('contentId', { type: () => ID }) contentId: string,
  ): Promise<GeneratedContentType> {
    return this.contentGenerationService.generateVariant(user.tenantId, contentId);
  }

  @Mutation(() => GeneratedContentType, { name: 'improveMarketingContent', description: 'Improve content based on feedback' })
  async improveContent(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: ImproveContentInput,
  ): Promise<GeneratedContentType> {
    return this.contentGenerationService.improveContent(
      user.tenantId,
      input.contentId,
      input.feedback,
    );
  }

  // ==================== Channel & Brand Config ====================

  @Query(() => [ChannelConfigType], { name: 'marketingChannels', description: 'Get marketing channel configurations' })
  async getChannels(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<ChannelConfigType[]> {
    const channels = await this.prisma.marketingChannelConfig.findMany({
      where: { clubId: user.tenantId },
    });
    return channels.map((ch) => this.transformChannel(ch));
  }

  @Query(() => BrandConfigType, { name: 'marketingBrandConfig', description: 'Get brand configuration' })
  async getBrandConfig(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<BrandConfigType> {
    let config = await this.prisma.marketingBrandConfig.findUnique({
      where: { clubId: user.tenantId },
    });

    if (!config) {
      // Create default brand config
      config = await this.prisma.marketingBrandConfig.create({
        data: {
          clubId: user.tenantId,
          tone: 'professional',
          language: 'en',
        },
      });
    }

    return this.transformBrandConfig(config);
  }

  @Mutation(() => BrandConfigType, { name: 'updateMarketingBrandConfig', description: 'Update brand configuration' })
  async updateBrandConfig(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UpdateBrandConfigInput,
  ): Promise<BrandConfigType> {
    const config = await this.prisma.marketingBrandConfig.upsert({
      where: { clubId: user.tenantId },
      create: {
        clubId: user.tenantId,
        ...input,
      },
      update: {
        ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
        ...(input.primaryColor !== undefined ? { primaryColor: input.primaryColor } : {}),
        ...(input.secondaryColor !== undefined ? { secondaryColor: input.secondaryColor } : {}),
        ...(input.tone !== undefined ? { tone: input.tone } : {}),
        ...(input.language !== undefined ? { language: input.language } : {}),
        ...(input.fromName !== undefined ? { fromName: input.fromName } : {}),
        ...(input.fromEmail !== undefined ? { fromEmail: input.fromEmail } : {}),
        ...(input.replyToEmail !== undefined ? { replyToEmail: input.replyToEmail } : {}),
        ...(input.guidelines !== undefined ? { guidelines: input.guidelines } : {}),
      },
    });
    return this.transformBrandConfig(config);
  }

  @Mutation(() => ChannelConfigType, { name: 'updateMarketingChannel', description: 'Update a channel configuration' })
  async updateChannel(
    @GqlCurrentUser() user: JwtPayload,
    @Args('type', { type: () => ChannelTypeEnum }) type: ChannelTypeEnum,
    @Args('input') input: UpdateChannelConfigInput,
  ): Promise<ChannelConfigType> {
    const channel = await this.prisma.marketingChannelConfig.upsert({
      where: { clubId_type: { clubId: user.tenantId, type } },
      create: {
        clubId: user.tenantId,
        type,
        status: 'CONNECTED',
        credentials: input.credentials as any,
      },
      update: {
        credentials: input.credentials as any,
        status: 'CONNECTED',
      },
    });
    return this.transformChannel(channel);
  }

  // ==================== Transform Helpers ====================

  private transformSegment(segment: any): AudienceSegmentType {
    return {
      id: segment.id,
      name: segment.name,
      description: segment.description ?? undefined,
      type: segment.type as SegmentTypeEnum,
      rules: segment.rules,
      naturalLanguageQuery: segment.naturalLanguageQuery ?? undefined,
      memberCount: segment.memberCount || 0,
      isArchived: segment.isArchived || false,
      refreshedAt: segment.refreshedAt ?? undefined,
      createdAt: segment.createdAt,
      updatedAt: segment.updatedAt,
    };
  }

  private transformCampaign(campaign: any): CampaignType {
    return {
      id: campaign.id,
      name: campaign.name,
      type: campaign.type as CampaignTypeEnum,
      status: campaign.status as CampaignStatusEnum,
      channels: campaign.channels || [],
      scheduledAt: campaign.scheduledAt ?? undefined,
      sentAt: campaign.sentAt ?? undefined,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      segments: campaign.segments?.map((s: any) => this.transformSegment(s)),
      contentPieces: campaign.contentPieces?.map((c: any) => this.transformContent(c)),
      segmentCount: campaign._count?.segments ?? campaign.segments?.length,
      contentPieceCount: campaign._count?.contentPieces ?? campaign.contentPieces?.length,
      memberCount: campaign._count?.members,
    };
  }

  private transformContent(content: any): ContentPieceType {
    return {
      id: content.id,
      type: content.type as ContentTypeEnum,
      subject: content.subject ?? undefined,
      body: content.body,
      previewText: content.previewText ?? undefined,
      status: content.status as ContentStatusEnum,
      generatedBy: content.generatedBy ?? undefined,
      variantLabel: content.variantLabel ?? undefined,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
    };
  }

  private transformChannel(channel: any): ChannelConfigType {
    return {
      id: channel.id,
      type: channel.type as ChannelTypeEnum,
      status: channel.status as ChannelStatusEnum,
      lastSyncAt: channel.lastSyncAt ?? undefined,
      createdAt: channel.createdAt,
      updatedAt: channel.updatedAt,
    };
  }

  private transformBrandConfig(config: any): BrandConfigType {
    return {
      id: config.id,
      logoUrl: config.logoUrl ?? undefined,
      primaryColor: config.primaryColor ?? undefined,
      secondaryColor: config.secondaryColor ?? undefined,
      tone: config.tone ?? undefined,
      language: config.language ?? undefined,
      fromName: config.fromName ?? undefined,
      fromEmail: config.fromEmail ?? undefined,
      replyToEmail: config.replyToEmail ?? undefined,
      guidelines: config.guidelines ?? undefined,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
}

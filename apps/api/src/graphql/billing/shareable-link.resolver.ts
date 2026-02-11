import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ShareableLinkService } from '@/modules/billing/shareable-link.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { ShareableLinkType } from './shareable-link.types';
import {
  CreateShareableLinkInput,
  ShareableLinksQueryArgs,
} from './shareable-link.input';

@Resolver(() => ShareableLinkType)
@UseGuards(GqlAuthGuard)
export class ShareableLinkResolver {
  constructor(
    private readonly linkService: ShareableLinkService,
  ) {}

  @Query(() => [ShareableLinkType], { name: 'shareableLinks' })
  async getShareableLinks(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: ShareableLinksQueryArgs,
  ): Promise<ShareableLinkType[]> {
    const links = await this.linkService.getLinksForEntity(
      user.tenantId,
      args.entityType,
      args.entityId,
    );

    const baseUrl = process.env.MEMBER_PORTAL_URL || 'https://portal.clubvantage.app';

    return links.map((link: any) => ({
      id: link.id,
      token: link.token,
      entityType: link.entityType as any,
      entityId: link.entityId,
      expiresAt: link.expiresAt ?? undefined,
      maxViews: link.maxViews ?? undefined,
      viewCount: link.viewCount,
      isActive: link.isActive,
      hasPassword: !!link.password,
      lastViewedAt: link.lastViewedAt ?? undefined,
      createdAt: link.createdAt,
      url: `${baseUrl}/share/${link.token}`,
    }));
  }

  @Mutation(() => ShareableLinkType, { name: 'createShareableLink' })
  async createShareableLink(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateShareableLinkInput,
  ): Promise<ShareableLinkType> {
    const link = await this.linkService.createLink(
      user.tenantId,
      {
        entityType: input.entityType,
        entityId: input.entityId,
        expiresInDays: input.expiresInDays,
        maxViews: input.maxViews,
        password: input.password,
      },
      user.sub,
    );

    const baseUrl = process.env.MEMBER_PORTAL_URL || 'https://portal.clubvantage.app';

    return {
      id: link.id,
      token: link.token,
      entityType: link.entityType as any,
      entityId: link.entityId,
      expiresAt: link.expiresAt ?? undefined,
      maxViews: link.maxViews ?? undefined,
      viewCount: link.viewCount,
      isActive: link.isActive,
      hasPassword: !!link.password,
      lastViewedAt: link.lastViewedAt ?? undefined,
      createdAt: link.createdAt,
      url: `${baseUrl}/share/${link.token}`,
    };
  }

  @Mutation(() => ShareableLinkType, { name: 'revokeShareableLink' })
  async revokeShareableLink(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ShareableLinkType> {
    const link = await this.linkService.revokeLink(user.tenantId, id);

    const baseUrl = process.env.MEMBER_PORTAL_URL || 'https://portal.clubvantage.app';

    return {
      id: link.id,
      token: link.token,
      entityType: link.entityType as any,
      entityId: link.entityId,
      expiresAt: link.expiresAt ?? undefined,
      maxViews: link.maxViews ?? undefined,
      viewCount: link.viewCount,
      isActive: link.isActive,
      hasPassword: !!link.password,
      lastViewedAt: link.lastViewedAt ?? undefined,
      createdAt: link.createdAt,
      url: `${baseUrl}/share/${link.token}`,
    };
  }
}

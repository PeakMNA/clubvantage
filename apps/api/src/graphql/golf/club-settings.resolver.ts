import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { ClubGolfSettingsType, CaddyType } from './golf.types';

/**
 * Resolver for club golf settings and caddy management (Task #6)
 */
@Resolver()
@UseGuards(GqlAuthGuard)
export class ClubSettingsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => ClubGolfSettingsType, {
    name: 'clubGolfSettings',
    description: 'Get club golf settings including cart, rental, and caddy policies',
    nullable: true,
  })
  async getClubGolfSettings(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<ClubGolfSettingsType | null> {
    const settings = await this.prisma.clubGolfSettings.findUnique({
      where: { clubId: user.tenantId },
    });

    if (!settings) {
      // Return default settings if none exist
      return {
        id: '',
        cartPolicy: 'OPTIONAL' as any,
        rentalPolicy: 'OPTIONAL' as any,
        caddyDrivesCart: true,
        maxGuestsPerMember: 3,
        requireGuestContact: false,
      };
    }

    return {
      id: settings.id,
      cartPolicy: settings.cartPolicy as any,
      rentalPolicy: settings.rentalPolicy as any,
      caddyDrivesCart: settings.caddyDrivesCart,
      maxGuestsPerMember: settings.maxGuestsPerMember,
      requireGuestContact: settings.requireGuestContact,
    };
  }

  @Query(() => [CaddyType], {
    name: 'searchCaddies',
    description: 'Search for caddies by name or caddy number',
  })
  async searchCaddies(
    @GqlCurrentUser() user: JwtPayload,
    @Args('search', { nullable: true }) search?: string,
    @Args('courseId', { type: () => ID, nullable: true }) courseId?: string,
  ): Promise<CaddyType[]> {
    const where: any = {
      clubId: user.tenantId,
      isActive: true,
    };

    // Add search filter if provided
    if (search) {
      where.OR = [
        { caddyNumber: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Note: courseId filter could be implemented if caddies are assigned to specific courses
    // For now, we return all active caddies for the club

    const caddies = await this.prisma.caddy.findMany({
      where,
      orderBy: [{ caddyNumber: 'asc' }],
      take: 50, // Limit results to prevent large responses
    });

    return caddies.map((caddy) => ({
      id: caddy.id,
      caddyNumber: caddy.caddyNumber,
      firstName: caddy.firstName,
      lastName: caddy.lastName,
      phone: caddy.phone || undefined,
      isActive: caddy.isActive,
    }));
  }
}

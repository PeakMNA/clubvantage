import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TIER_LIMIT_KEY } from '../decorators/tier-limit.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

@Injectable()
export class TierLimitsGuard implements CanActivate {
  private readonly logger = new Logger(TierLimitsGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.getAllAndOverride<string>(TIER_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No tier limit decorator = no limit check needed
    if (!resource) {
      return true;
    }

    // Extract user from GraphQL context
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();
    const user = gqlContext?.req?.user as JwtPayload;

    if (!user?.tenantId) {
      return true; // Let auth guard handle missing tenant
    }

    const club = await this.prisma.club.findUnique({
      where: { id: user.tenantId },
      select: {
        maxMembers: true,
        maxUsers: true,
        subscriptionTier: true,
      },
    });

    if (!club) {
      return true; // Let downstream handle missing club
    }

    if (resource === 'members') {
      const currentCount = await this.prisma.member.count({
        where: { clubId: user.tenantId, deletedAt: null },
      });

      if (currentCount >= club.maxMembers) {
        this.logger.warn(
          `Tier limit reached: Club ${user.tenantId} has ${currentCount}/${club.maxMembers} members (${club.subscriptionTier})`,
        );
        throw new ForbiddenException(
          `Member limit reached (${currentCount}/${club.maxMembers}). ` +
          `Upgrade your subscription to add more members.`,
        );
      }
    }

    if (resource === 'users') {
      const currentCount = await this.prisma.user.count({
        where: { clubId: user.tenantId, deletedAt: null },
      });

      if (currentCount >= club.maxUsers) {
        this.logger.warn(
          `Tier limit reached: Club ${user.tenantId} has ${currentCount}/${club.maxUsers} users (${club.subscriptionTier})`,
        );
        throw new ForbiddenException(
          `Staff user limit reached (${currentCount}/${club.maxUsers}). ` +
          `Upgrade your subscription to add more users.`,
        );
      }
    }

    return true;
  }
}

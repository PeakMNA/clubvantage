import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';

/**
 * Cached user data for auth validation.
 * Only includes fields needed for authorization decisions.
 */
interface CachedUserData {
  id: string;
  isActive: boolean;
  lockedUntil: string | null;
  clubId: string | null;
  role: string;
  permissions: string[];
}

/**
 * Cache TTL for user auth data in seconds.
 * Short TTL (60s) balances performance vs security:
 * - Reduces DB queries for frequently authenticated users
 * - Still catches deactivated/locked accounts within a minute
 */
const AUTH_CACHE_TTL_SECONDS = 60;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const cacheKey = `auth:user:${payload.sub}`;

    // Try cache-aside pattern: get from cache or fetch from DB
    const user = await this.redisService.cacheAside<CachedUserData | null>(
      cacheKey,
      AUTH_CACHE_TTL_SECONDS,
      async () => {
        this.logger.debug(`Cache miss for user ${payload.sub}, fetching from DB`);
        const dbUser = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          select: {
            id: true,
            isActive: true,
            lockedUntil: true,
            clubId: true,
            role: true,
            permissions: true,
          },
        });

        if (!dbUser) {
          return null;
        }

        // Convert Date to string for JSON serialization
        return {
          id: dbUser.id,
          isActive: dbUser.isActive,
          lockedUntil: dbUser.lockedUntil?.toISOString() || null,
          clubId: dbUser.clubId,
          role: dbUser.role,
          permissions: dbUser.permissions || [],
        };
      },
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      // Invalidate cache for deactivated users (in case of cache hit with stale data)
      await this.redisService.del(cacheKey);
      throw new UnauthorizedException('User account is deactivated');
    }

    if (user.lockedUntil) {
      const lockedUntilDate = new Date(user.lockedUntil);
      if (lockedUntilDate > new Date()) {
        throw new UnauthorizedException('User account is locked');
      }
    }

    // Return the payload enriched with fresh permissions
    return {
      ...payload,
      tenantId: user.clubId || payload.tenantId,
      roles: [user.role],
      permissions: user.permissions || payload.permissions,
    };
  }

  /**
   * Invalidate a user's auth cache.
   * Call this when a user is deactivated, locked, or permissions change.
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await this.redisService.del(`auth:user:${userId}`);
    this.logger.debug(`Invalidated auth cache for user ${userId}`);
  }
}

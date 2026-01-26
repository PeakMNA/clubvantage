import { Injectable, ExecutionContext, UnauthorizedException, CanActivate, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import * as jwt from 'jsonwebtoken';

// App JWT payload (from /login endpoint)
interface AppJwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

// Supabase JWT payload (from /signin endpoint)
interface SupabaseJwtPayload {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  email?: string;
  user_metadata: {
    clubId?: string;
    role?: string;
    permissions?: string[];
    [key: string]: any;
  };
}

@Injectable()
export class GqlAuthGuard implements CanActivate {
  private readonly logger = new Logger(GqlAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();
    const request = gqlContext?.req;

    if (!request) {
      throw new UnauthorizedException('No request context available');
    }

    // Extract token from cookie or header
    const accessToken = this.extractToken(request);

    if (!accessToken) {
      throw new UnauthorizedException('No access token provided');
    }

    // Verify and decode token
    const user = await this.validateToken(accessToken);

    // Attach user to request for later use
    request.user = user;

    return true;
  }

  private extractToken(request: any): string | null {
    // Try HttpOnly cookie first
    const accessCookieName = this.configService.get<string>('supabase.cookie.accessName') || 'sb-access-token';
    if (request.cookies && request.cookies[accessCookieName]) {
      return request.cookies[accessCookieName];
    }

    // Fallback to Authorization header
    const authHeader = request.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    return null;
  }

  private async validateToken(accessToken: string): Promise<JwtPayload> {
    // Try app JWT secret first (from /login endpoint)
    const appJwtSecret = this.configService.get<string>('auth.jwt.secret');
    const supabaseJwtSecret = this.configService.get<string>('supabase.jwtSecret');

    if (!appJwtSecret && !supabaseJwtSecret) {
      throw new UnauthorizedException('JWT secret not configured');
    }

    let payload: AppJwtPayload | SupabaseJwtPayload | null = null;
    let isAppToken = false;

    // Try app JWT secret first
    if (appJwtSecret) {
      try {
        payload = jwt.verify(accessToken, appJwtSecret) as AppJwtPayload;
        isAppToken = true;
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          throw new UnauthorizedException('Access token has expired');
        }
        // Try Supabase secret if app JWT verification failed (not expired)
      }
    }

    // Try Supabase JWT secret if app JWT failed
    if (!payload && supabaseJwtSecret) {
      try {
        payload = jwt.verify(accessToken, supabaseJwtSecret) as SupabaseJwtPayload;
        isAppToken = false;
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          throw new UnauthorizedException('Access token has expired');
        }
        throw new UnauthorizedException('Invalid access token');
      }
    }

    if (!payload) {
      throw new UnauthorizedException('Token verification failed');
    }

    // Handle app JWT payload (already has tenantId directly)
    if (isAppToken) {
      const appPayload = payload as AppJwtPayload;

      // Verify user still exists and is active
      const user = await this.prisma.user.findFirst({
        where: { email: appPayload.email?.toLowerCase() },
        select: { id: true, isActive: true, lockedUntil: true },
      });

      if (user && !user.isActive) {
        throw new UnauthorizedException('User account is deactivated');
      }
      if (user?.lockedUntil && user.lockedUntil > new Date()) {
        throw new UnauthorizedException('User account is locked');
      }

      return {
        sub: appPayload.sub,
        email: appPayload.email,
        tenantId: appPayload.tenantId,
        roles: appPayload.roles,
        permissions: appPayload.permissions,
      };
    }

    // Handle Supabase JWT payload (need to extract from user_metadata or database)
    const supabasePayload = payload as SupabaseJwtPayload;
    const supabaseUserId = supabasePayload.sub;
    const email = supabasePayload.email;
    const userMetadata = supabasePayload.user_metadata || {};
    const clubId = userMetadata.clubId;
    const role = userMetadata.role || 'MEMBER';
    const permissions = userMetadata.permissions || [];

    // Look up user in database
    const user = await this.prisma.user.findFirst({
      where: {
        email: email?.toLowerCase(),
      },
      select: {
        id: true,
        email: true,
        isActive: true,
        lockedUntil: true,
        clubId: true,
        role: true,
        permissions: true,
      },
    });

    if (user) {
      if (!user.isActive) {
        throw new UnauthorizedException('User account is deactivated');
      }

      if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw new UnauthorizedException('User account is locked');
      }

      return {
        sub: user.id,
        email: user.email,
        tenantId: user.clubId || '',
        roles: [user.role],
        permissions: user.permissions || [],
        supabaseId: supabaseUserId,
      };
    }

    // Check for member
    const member = await this.prisma.member.findFirst({
      where: {
        email: email?.toLowerCase(),
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        clubId: true,
      },
    });

    if (member) {
      return {
        sub: member.id,
        email: member.email || '',
        tenantId: member.clubId,
        roles: ['MEMBER'],
        permissions: ['member:read', 'member:portal'],
        supabaseId: supabaseUserId,
        isMember: true,
      } as JwtPayload;
    }

    // Fallback to token data
    return {
      sub: supabaseUserId,
      email: email || '',
      tenantId: clubId || '',
      roles: [role],
      permissions: permissions,
      supabaseId: supabaseUserId,
    };
  }
}

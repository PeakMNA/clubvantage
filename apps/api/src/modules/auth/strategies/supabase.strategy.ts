import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export interface SupabaseJwtPayload {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  email?: string;
  phone?: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
    [key: string]: any;
  };
  user_metadata: {
    clubId?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    permissions?: string[];
    [key: string]: any;
  };
  role?: string;
  session_id?: string;
}

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super();
  }

  async validate(request: Request): Promise<JwtPayload> {
    const accessToken = this.extractToken(request);

    if (!accessToken) {
      throw new UnauthorizedException('No access token provided');
    }

    const jwtSecret = this.configService.get<string>('supabase.jwtSecret');
    if (!jwtSecret) {
      throw new UnauthorizedException('Supabase JWT secret not configured');
    }

    let payload: SupabaseJwtPayload;
    try {
      payload = jwt.verify(accessToken, jwtSecret) as SupabaseJwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Access token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid access token');
      }
      throw new UnauthorizedException('Token verification failed');
    }

    // Extract user data from Supabase payload
    const supabaseUserId = payload.sub;
    const email = payload.email;
    const userMetadata = payload.user_metadata || {};
    const clubId = userMetadata.clubId;
    const role = userMetadata.role || 'MEMBER';
    const permissions = userMetadata.permissions || [];

    // Look up user in our database to get fresh data
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

    // If user exists in our DB, validate and use their data
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

    // For member portal users who might not be in the User table
    // but are in the Member table (linked via Supabase)
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

    // Fallback: use data from Supabase token (for new users)
    return {
      sub: supabaseUserId,
      email: email || '',
      tenantId: clubId || '',
      roles: [role],
      permissions: permissions,
      supabaseId: supabaseUserId,
    };
  }

  private extractToken(request: Request): string | null {
    // Try to get from HttpOnly cookie first
    const accessCookieName = this.configService.get<string>('supabase.cookie.accessName') || 'sb-access-token';
    if (request.cookies && request.cookies[accessCookieName]) {
      return request.cookies[accessCookieName];
    }

    // Fallback to Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    return null;
  }
}

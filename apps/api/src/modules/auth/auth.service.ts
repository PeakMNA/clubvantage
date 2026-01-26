import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';
import { EventStoreService } from '@/shared/events/event-store.service';
import { SupabaseService } from '@/shared/supabase/supabase.service';
import { SupabaseAdminService } from '@/shared/supabase/supabase-admin.service';
import { JwtPayload, TokenPair } from './interfaces/jwt-payload.interface';
import { LoginDto, SignInWithPasswordDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
    private eventStore: EventStoreService,
    private supabaseService: SupabaseService,
    private supabaseAdmin: SupabaseAdminService,
  ) {}

  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenPair & { user: any }> {
    // Find user by email
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase() },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account is locked. Try again in ${remainingMinutes} minutes.`,
      );
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed attempts
      const failedAttempts = user.failedAttempts + 1;
      const lockoutThreshold = this.configService.get<number>('auth.lockoutThreshold') || 5;
      const lockoutDuration = this.configService.get<number>('auth.lockoutDuration') || 30;

      const updates: any = { failedAttempts };

      if (failedAttempts >= lockoutThreshold) {
        updates.lockedUntil = new Date(Date.now() + lockoutDuration * 60000);
        this.logger.warn(`Account locked for user ${user.email}`);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updates,
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Log the event
    if (user.clubId) {
      await this.eventStore.append({
        tenantId: user.clubId,
        aggregateType: 'User',
        aggregateId: user.id,
        type: 'LOGIN',
        data: { ipAddress, userAgent },
        userId: user.id,
        userEmail: user.email,
        metadata: { ipAddress, userAgent },
      });
    }

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions,
        club: user.club,
      },
    };
  }

  async refreshTokens(
    refreshToken: string,
    ipAddress?: string,
  ): Promise<TokenPair> {
    // Verify refresh token
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('auth.refresh.secret'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if refresh token is stored and not revoked
    const storedToken = await this.redisService.get<string>(
      `refresh:${payload.sub}:${refreshToken.slice(-10)}`,
    );

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user);

    // Revoke old refresh token
    await this.revokeRefreshToken(payload.sub, refreshToken);

    // Store new refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.revokeRefreshToken(userId, refreshToken);
    } else {
      // Revoke all refresh tokens for user
      await this.revokeAllRefreshTokens(userId);
    }
  }

  async validateUser(userId: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        permissions: true,
        clubId: true,
        isActive: true,
      },
    });
  }

  private async generateTokens(user: any): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.clubId || '',
      roles: [user.role],
      permissions: user.permissions || [],
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('auth.jwt.secret'),
        expiresIn: this.configService.get<string>('auth.jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('auth.refresh.secret'),
        expiresIn: this.configService.get<string>('auth.refresh.expiresIn'),
      }),
    ]);

    // Parse expiresIn to seconds
    const expiresIn = this.parseExpiresIn(
      this.configService.get<string>('auth.jwt.expiresIn') || '15m',
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    // Store with 30-day expiry (or configured refresh token expiry)
    const expirySeconds = this.parseExpiresIn(
      this.configService.get<string>('auth.refresh.expiresIn') || '30d',
    );

    await this.redisService.set(
      `refresh:${userId}:${refreshToken.slice(-10)}`,
      refreshToken,
      expirySeconds,
    );
  }

  private async revokeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.redisService.del(
      `refresh:${userId}:${refreshToken.slice(-10)}`,
    );
  }

  private async revokeAllRefreshTokens(userId: string): Promise<void> {
    // In a real implementation, you'd want to use Redis SCAN
    // For now, we'll rely on token expiry
    this.logger.log(`Revoking all refresh tokens for user ${userId}`);
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default to 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }

  // ===========================================
  // Supabase Authentication Methods
  // ===========================================

  async signInWithSupabase(
    dto: SignInWithPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: number;
    user: any;
  }> {
    const { user, session, error } = await this.supabaseService.signInWithPassword(
      dto.email,
      dto.password,
    );

    if (error || !session) {
      throw new UnauthorizedException(error?.message || 'Invalid credentials');
    }

    // Look up user in our database
    const dbUser = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase() },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Check if account is active
    if (dbUser && !dbUser.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check if account is locked
    if (dbUser?.lockedUntil && dbUser.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (dbUser.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account is locked. Try again in ${remainingMinutes} minutes.`,
      );
    }

    // Update last login
    if (dbUser) {
      await this.prisma.user.update({
        where: { id: dbUser.id },
        data: {
          lastLoginAt: new Date(),
          lastLoginIp: ipAddress,
          failedAttempts: 0,
          lockedUntil: null,
        },
      });

      // Log the event
      if (dbUser.clubId) {
        await this.eventStore.append({
          tenantId: dbUser.clubId,
          aggregateType: 'User',
          aggregateId: dbUser.id,
          type: 'LOGIN',
          data: { ipAddress, userAgent, provider: 'supabase' },
          userId: dbUser.id,
          userEmail: dbUser.email,
          metadata: { ipAddress, userAgent },
        });
      }
    }

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in,
      expiresAt: session.expires_at || Date.now() / 1000 + session.expires_in,
      user: dbUser ? {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
        permissions: dbUser.permissions,
        club: dbUser.club,
      } : {
        id: user?.id,
        email: user?.email,
        firstName: user?.user_metadata?.firstName,
        lastName: user?.user_metadata?.lastName,
        role: user?.user_metadata?.role || 'MEMBER',
      },
    };
  }

  async refreshSupabaseSession(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: number;
  }> {
    const { session, error } = await this.supabaseService.refreshSession(refreshToken);

    if (error || !session) {
      throw new UnauthorizedException(error?.message || 'Invalid refresh token');
    }

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in,
      expiresAt: session.expires_at || Date.now() / 1000 + session.expires_in,
    };
  }

  async signOutSupabase(accessToken: string): Promise<void> {
    try {
      await this.supabaseService.signOut(accessToken);
    } catch (error) {
      this.logger.warn(`Supabase sign out error: ${error.message}`);
      // Continue anyway - we'll clear cookies on the client
    }
  }

  async getSupabaseUser(accessToken: string): Promise<any> {
    const { user, error } = await this.supabaseService.getUser(accessToken);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Enrich with database user info
    const dbUser = await this.prisma.user.findFirst({
      where: { email: user.email?.toLowerCase() },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (dbUser) {
      return {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
        permissions: dbUser.permissions,
        clubId: dbUser.clubId,
        club: dbUser.club,
        supabaseId: user.id,
      };
    }

    // Check for member
    const member = await this.prisma.member.findFirst({
      where: { email: user.email?.toLowerCase() },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (member) {
      return {
        id: member.id,
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        role: 'MEMBER',
        permissions: ['member:read', 'member:portal'],
        clubId: member.clubId,
        club: member.club,
        supabaseId: user.id,
        isMember: true,
      };
    }

    // Return Supabase user data if no local user found
    return {
      id: user.id,
      email: user.email,
      firstName: user.user_metadata?.firstName,
      lastName: user.user_metadata?.lastName,
      role: user.user_metadata?.role || 'MEMBER',
      permissions: [],
      clubId: user.user_metadata?.clubId,
      supabaseId: user.id,
    };
  }
}

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, SetSessionDto, SignInWithPasswordDto, RefreshSessionDto } from './dto';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private getCookieOptions(maxAgeSeconds: number = 900) {
    return {
      httpOnly: true,
      secure: this.configService.get('supabase.cookie.secure') ?? false,
      sameSite: this.configService.get('supabase.cookie.sameSite') ?? 'lax',
      maxAge: maxAgeSeconds * 1000,
      path: '/',
      domain: this.configService.get('supabase.cookie.domain'),
    } as const;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.authService.login(dto, ipAddress, userAgent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Successfully refreshed tokens',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;

    return this.authService.refreshTokens(dto.refreshToken, ipAddress);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  async logout(
    @CurrentUser() user: JwtPayload,
    @Body() dto?: RefreshTokenDto,
  ) {
    await this.authService.logout(user.sub, dto?.refreshToken);
    return { message: 'Successfully logged out' };
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        role: { type: 'string' },
        permissions: { type: 'array', items: { type: 'string' } },
        clubId: { type: 'string' },
      },
    },
  })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.authService.validateUser(user.sub);
  }

  // ===========================================
  // Supabase Session Endpoints
  // ===========================================

  @Public()
  @Post('session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set HttpOnly cookies from Supabase tokens' })
  @ApiResponse({
    status: 200,
    description: 'Session cookies set successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        expiresAt: { type: 'number' },
      },
    },
  })
  async setSession(
    @Body() dto: SetSessionDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessCookieName = this.configService.get<string>('supabase.cookie.accessName') || 'sb-access-token';
    const refreshCookieName = this.configService.get<string>('supabase.cookie.refreshName') || 'sb-refresh-token';

    // Set access token cookie (15 minute expiry)
    res.cookie(accessCookieName, dto.accessToken, this.getCookieOptions(15 * 60));

    // Set refresh token cookie (30 day expiry)
    res.cookie(refreshCookieName, dto.refreshToken, this.getCookieOptions(30 * 24 * 60 * 60));

    return {
      success: true,
      expiresAt: Date.now() + 15 * 60 * 1000,
    };
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with Supabase and set HttpOnly cookies' })
  @ApiResponse({
    status: 200,
    description: 'Successfully signed in',
    schema: {
      type: 'object',
      properties: {
        expiresIn: { type: 'number' },
        expiresAt: { type: 'number' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signIn(
    @Body() dto: SignInWithPasswordDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await this.authService.signInWithSupabase(dto, ipAddress, userAgent);

    // Set HttpOnly cookies
    const accessCookieName = this.configService.get<string>('supabase.cookie.accessName') || 'sb-access-token';
    const refreshCookieName = this.configService.get<string>('supabase.cookie.refreshName') || 'sb-refresh-token';

    res.cookie(accessCookieName, result.accessToken, this.getCookieOptions(result.expiresIn));
    res.cookie(refreshCookieName, result.refreshToken, this.getCookieOptions(30 * 24 * 60 * 60));

    // Return user info but not tokens (they're in cookies)
    return {
      expiresIn: result.expiresIn,
      expiresAt: result.expiresAt,
      user: result.user,
    };
  }

  @Public()
  @Post('refresh-session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh session using cookie or provided token' })
  @ApiResponse({
    status: 200,
    description: 'Session refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        expiresIn: { type: 'number' },
        expiresAt: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshSession(
    @Body() dto: RefreshSessionDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshCookieName = this.configService.get<string>('supabase.cookie.refreshName') || 'sb-refresh-token';
    const accessCookieName = this.configService.get<string>('supabase.cookie.accessName') || 'sb-access-token';

    // Get refresh token from cookie or body
    const refreshToken = dto.refreshToken || req.cookies?.[refreshCookieName];

    if (!refreshToken) {
      throw new Error('No refresh token provided');
    }

    const result = await this.authService.refreshSupabaseSession(refreshToken);

    // Set new cookies
    res.cookie(accessCookieName, result.accessToken, this.getCookieOptions(result.expiresIn));
    res.cookie(refreshCookieName, result.refreshToken, this.getCookieOptions(30 * 24 * 60 * 60));

    return {
      expiresIn: result.expiresIn,
      expiresAt: result.expiresAt,
    };
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Sign out and clear session cookies' })
  @ApiResponse({ status: 200, description: 'Successfully signed out' })
  async signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessCookieName = this.configService.get<string>('supabase.cookie.accessName') || 'sb-access-token';
    const refreshCookieName = this.configService.get<string>('supabase.cookie.refreshName') || 'sb-refresh-token';

    // Get access token from cookie
    const accessToken = req.cookies?.[accessCookieName];

    // Sign out from Supabase
    if (accessToken) {
      await this.authService.signOutSupabase(accessToken);
    }

    // Clear cookies
    const cookieDomain = this.configService.get<string>('supabase.cookie.domain');
    res.clearCookie(accessCookieName, { path: '/', domain: cookieDomain });
    res.clearCookie(refreshCookieName, { path: '/', domain: cookieDomain });

    return { message: 'Successfully signed out' };
  }

  @Get('session')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current session user info' })
  @ApiResponse({
    status: 200,
    description: 'Current session user',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        role: { type: 'string' },
        permissions: { type: 'array', items: { type: 'string' } },
        clubId: { type: 'string' },
      },
    },
  })
  async getSession(@CurrentUser() user: JwtPayload, @Req() req: Request) {
    const accessCookieName = this.configService.get<string>('supabase.cookie.accessName') || 'sb-access-token';
    const accessToken = req.cookies?.[accessCookieName];

    if (accessToken) {
      return this.authService.getSupabaseUser(accessToken);
    }

    // Fallback to using the already validated user from the guard
    return this.authService.validateUser(user.sub);
  }
}

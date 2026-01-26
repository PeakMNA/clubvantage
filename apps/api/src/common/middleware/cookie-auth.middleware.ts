import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
  domain?: string;
}

@Injectable()
export class CookieAuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Add helper methods to response for setting/clearing auth cookies
    (res as any).setAuthCookies = (accessToken: string, refreshToken: string) => {
      this.setAuthCookies(res, accessToken, refreshToken);
    };

    (res as any).clearAuthCookies = () => {
      this.clearAuthCookies(res);
    };

    next();
  }

  private getCookieOptions(): CookieOptions {
    return {
      httpOnly: this.configService.get<boolean>('supabase.cookie.httpOnly') ?? true,
      secure: this.configService.get<boolean>('supabase.cookie.secure') ?? false,
      sameSite: this.configService.get<'strict' | 'lax' | 'none'>('supabase.cookie.sameSite') ?? 'lax',
      maxAge: (this.configService.get<number>('supabase.cookie.maxAge') ?? 2592000) * 1000, // Convert to ms
      path: this.configService.get<string>('supabase.cookie.path') ?? '/',
      domain: this.configService.get<string>('supabase.cookie.domain'),
    };
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const options = this.getCookieOptions();
    const accessCookieName = this.configService.get<string>('supabase.cookie.accessName') || 'sb-access-token';
    const refreshCookieName = this.configService.get<string>('supabase.cookie.refreshName') || 'sb-refresh-token';

    // Set access token cookie with shorter expiry (15 min)
    res.cookie(accessCookieName, accessToken, {
      ...options,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set refresh token cookie with longer expiry (30 days)
    res.cookie(refreshCookieName, refreshToken, {
      ...options,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  private clearAuthCookies(res: Response): void {
    const options = this.getCookieOptions();
    const accessCookieName = this.configService.get<string>('supabase.cookie.accessName') || 'sb-access-token';
    const refreshCookieName = this.configService.get<string>('supabase.cookie.refreshName') || 'sb-refresh-token';

    res.clearCookie(accessCookieName, {
      path: options.path,
      domain: options.domain,
    });

    res.clearCookie(refreshCookieName, {
      path: options.path,
      domain: options.domain,
    });
  }
}

// Helper type for extended Response
declare global {
  namespace Express {
    interface Response {
      setAuthCookies?: (accessToken: string, refreshToken: string) => void;
      clearAuthCookies?: () => void;
    }
  }
}

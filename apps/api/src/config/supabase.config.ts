import { registerAs } from '@nestjs/config';

export default registerAs('supabase', () => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Only set domain in production if explicitly configured
  // In development, let browser handle same-origin cookies automatically
  // Setting domain: 'localhost' explicitly can cause issues in some browsers
  const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

  return {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    jwtSecret: process.env.SUPABASE_JWT_SECRET || '',
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'clubvantage',
    cookie: {
      name: 'sb-auth-token',
      accessName: 'sb-access-token',
      refreshName: 'sb-refresh-token',
      secure: isProduction,
      sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax' | 'none',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      domain: cookieDomain,
    },
  };
});

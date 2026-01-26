import { registerAs } from '@nestjs/config';

export default registerAs('supabase', () => ({
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  jwtSecret: process.env.SUPABASE_JWT_SECRET || '',
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'clubvantage',
  cookie: {
    name: 'sb-auth-token',
    accessName: 'sb-access-token',
    refreshName: 'sb-refresh-token',
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax' | 'none',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined,
  },
}));

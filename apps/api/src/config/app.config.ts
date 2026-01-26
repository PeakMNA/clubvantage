import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: 'ClubVantage API',
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
  ],

  // Meilisearch
  meilisearch: {
    host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
    apiKey: process.env.MEILISEARCH_API_KEY || '',
  },

  // Supabase Storage
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'clubvantage',
  },

  // Email (Resend)
  email: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.EMAIL_FROM || 'noreply@clubvantage.app',
    fromName: process.env.EMAIL_FROM_NAME || 'ClubVantage',
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },

  // Sentry
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
  },
}));

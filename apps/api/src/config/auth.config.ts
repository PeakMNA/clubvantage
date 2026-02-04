import { registerAs } from '@nestjs/config';

/**
 * Get a required secret, failing fast in production if not set.
 * In development, returns a default value with a warning.
 */
function getRequiredSecret(envVar: string, defaultValue: string): string {
  const value = process.env[envVar];

  if (value) {
    return value;
  }

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    throw new Error(
      `FATAL: ${envVar} environment variable must be set in production. ` +
        'Never use default secrets in production environments.',
    );
  }

  // Development only - log warning
  console.warn(
    `⚠️  WARNING: ${envVar} not set, using default value. ` +
      'This is acceptable for development but MUST be set in production.',
  );

  return defaultValue;
}

export default registerAs('auth', () => ({
  jwt: {
    secret: getRequiredSecret('JWT_SECRET', 'dev-only-jwt-secret-not-for-production'),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  refresh: {
    secret: getRequiredSecret(
      'JWT_REFRESH_SECRET',
      'dev-only-refresh-secret-not-for-production',
    ),
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  lockoutThreshold: parseInt(process.env.LOCKOUT_THRESHOLD || '5', 10),
  lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '30', 10), // minutes
}));

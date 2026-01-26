import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  refresh: {
    secret:
      process.env.JWT_REFRESH_SECRET ||
      'super-secret-refresh-key-change-in-production',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  lockoutThreshold: parseInt(process.env.LOCKOUT_THRESHOLD || '5', 10),
  lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '30', 10), // minutes
}));

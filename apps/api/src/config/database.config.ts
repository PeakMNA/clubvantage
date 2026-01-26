import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_DATABASE_URL,
  poolTimeout: parseInt(process.env.DATABASE_POOL_TIMEOUT || '10', 10),
  connectionLimit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10', 10),
}));

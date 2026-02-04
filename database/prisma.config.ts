import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',

  migrate: {
    migrations: 'prisma/migrations',
    seed: 'pnpm exec tsx prisma/seed.ts',
  },

  datasource: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
});

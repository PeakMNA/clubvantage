// ClubVantage Database Client
// Re-exports Prisma client and utilities

import { PrismaClient } from '@prisma/client';

// Global type augmentation for development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Create a singleton Prisma client instance
 * In development, stores on global to prevent multiple instances during hot reload
 */
export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Re-export Prisma types
export * from '@prisma/client';

/**
 * Create a tenant-scoped Prisma client
 * Uses PostgreSQL RLS via current_setting
 */
export async function createTenantClient(clubId: string): Promise<PrismaClient> {
  const client = new PrismaClient();

  // Set the tenant context for RLS
  await client.$executeRaw`SELECT set_config('app.current_club_id', ${clubId}, true)`;

  return client;
}

/**
 * Execute operations within a tenant context
 */
export async function withTenant<T>(
  clubId: string,
  callback: (client: PrismaClient) => Promise<T>
): Promise<T> {
  const client = await createTenantClient(clubId);
  try {
    return await callback(client);
  } finally {
    await client.$disconnect();
  }
}

/**
 * Transaction helper with tenant context
 */
export async function withTenantTransaction<T>(
  clubId: string,
  callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // Set tenant context within transaction
    await tx.$executeRaw`SELECT set_config('app.current_club_id', ${clubId}, true)`;
    return callback(tx);
  });
}

// Database health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

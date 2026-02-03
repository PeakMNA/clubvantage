import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { withTenantContext } from './tenant.middleware';

/**
 * Validates that a tenant ID is a valid UUID format to prevent injection attacks.
 * This is a defense-in-depth measure even though we use parameterized queries.
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    const adapter = new PrismaPg({ connectionString: configService.get('database.url') });
    const env = configService.get('app.env');

    super({
      adapter,
      log:
        env === 'development'
          ? [{ level: 'query', emit: 'event' }, { level: 'info', emit: 'stdout' }, { level: 'warn', emit: 'stdout' }, { level: 'error', emit: 'stdout' }]
          : [{ level: 'error', emit: 'stdout' }],
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    await this.$connect();
    this.logger.log('Database connection established');
  }

  /**
   * Execute operations within an automatic tenant context.
   * All queries within this context will be automatically filtered by tenant.
   *
   * This is the preferred method for tenant-scoped operations as it
   * provides automatic filtering without manual clubId additions.
   *
   * @param tenantId - The tenant ID to scope queries
   * @param fn - Function to execute within tenant context
   * @param bypassFilter - If true, skips automatic tenant filtering (admin only)
   */
  async withAutoTenantContext<T>(
    tenantId: string,
    fn: () => Promise<T>,
    bypassFilter = false,
  ): Promise<T> {
    return withTenantContext(tenantId, fn, bypassFilter);
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  /**
   * Execute operations within a tenant context using RLS.
   * Uses parameterized queries to prevent SQL injection.
   *
   * @param tenantId - Must be a valid UUID
   * @param fn - Function to execute within tenant context
   * @throws Error if tenantId is not a valid UUID
   */
  async withTenant<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
    // Validate tenant ID format (defense in depth)
    if (!isValidUUID(tenantId)) {
      this.logger.error(`Invalid tenant ID format: ${tenantId.substring(0, 20)}...`);
      throw new Error('Invalid tenant ID format');
    }

    // Use parameterized query to prevent SQL injection
    // Prisma's tagged template literal automatically escapes parameters
    await this.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

    return fn();
  }

  /**
   * Execute a transaction with tenant context.
   * Uses parameterized queries to prevent SQL injection.
   *
   * @param tenantId - Must be a valid UUID
   * @param fn - Transaction function to execute
   * @throws Error if tenantId is not a valid UUID
   */
  async transactionWithTenant<T>(
    tenantId: string,
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    // Validate tenant ID format (defense in depth)
    if (!isValidUUID(tenantId)) {
      this.logger.error(`Invalid tenant ID format: ${tenantId.substring(0, 20)}...`);
      throw new Error('Invalid tenant ID format');
    }

    return this.$transaction(async (tx) => {
      // Use parameterized query within transaction
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
      return fn(tx);
    });
  }

  /**
   * Clean up resources (useful for testing).
   * Only allowed in test environment.
   */
  async cleanDatabase() {
    if (this.configService.get('app.env') !== 'test') {
      throw new Error('cleanDatabase can only be called in test environment');
    }

    const tablenames = await this.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }: { tablename: string }) => tablename)
      .filter((name: string) => name !== '_prisma_migrations');

    // Use transaction for atomic cleanup
    if (tables.length > 0) {
      await this.$transaction(async (tx) => {
        for (const table of tables) {
          // Use Prisma.sql for safe table name interpolation
          await tx.$executeRaw`TRUNCATE TABLE ${Prisma.raw(`"public"."${table}"`)} CASCADE`;
        }
      });
    }
  }
}

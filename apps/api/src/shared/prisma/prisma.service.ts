import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('database.url'),
        },
      },
      log:
        configService.get('app.env') === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Execute operations within a tenant context using RLS
   */
  async withTenant<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
    // Set the tenant context for RLS
    await this.$executeRawUnsafe(
      `SET LOCAL app.tenant_id = '${tenantId}'`,
    );

    return fn();
  }

  /**
   * Execute a transaction with tenant context
   */
  async transactionWithTenant<T>(
    tenantId: string,
    fn: (tx: PrismaService) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx: any) => {
      await tx.$executeRawUnsafe(
        `SET LOCAL app.tenant_id = '${tenantId}'`,
      );
      return fn(tx as PrismaService);
    });
  }

  /**
   * Clean up resources (useful for testing)
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
      .filter((name: string) => name !== '_prisma_migrations')
      .map((name: string) => `"public"."${name}"`)
      .join(', ');

    if (tables.length > 0) {
      await this.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
  }
}

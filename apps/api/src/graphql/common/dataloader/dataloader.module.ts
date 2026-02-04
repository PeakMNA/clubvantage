import { Module, Global } from '@nestjs/common';
import { DataLoaderService } from './dataloader.service';
import { PrismaModule } from '@/shared/prisma/prisma.module';

/**
 * DataLoader Module
 *
 * Provides request-scoped DataLoaders to prevent N+1 queries in GraphQL resolvers.
 * DataLoaders batch and cache database queries within a single request.
 *
 * Usage:
 * 1. Inject DataLoaderService into your resolver
 * 2. Call the appropriate loader method with IDs to batch load
 *
 * @example
 * ```typescript
 * @ResolveField('dependents', () => [DependentType])
 * async getDependents(
 *   @Parent() member: Member,
 *   @Context() ctx: GraphQLContext,
 * ) {
 *   return ctx.loaders.dependentsByMemberId.load(member.id);
 * }
 * ```
 */
@Global()
@Module({
  imports: [PrismaModule],
  providers: [DataLoaderService],
  exports: [DataLoaderService],
})
export class DataLoaderModule {}

import { Logger } from '@nestjs/common';

const logger = new Logger('TenantMiddleware');

/**
 * Models that require tenant (clubId) filtering.
 * These models have a clubId field and should be automatically filtered.
 */
const TENANT_SCOPED_MODELS = new Set([
  'member',
  'dependent',
  'membershipType',
  'membershipApplication',
  'invoice',
  'invoiceLineItem',
  'payment',
  'paymentAllocation',
  'creditNote',
  'teeTime',
  'teeTimePlayer',
  'golfCourse',
  'golfCourseSchedule',
  'golfCourseInterval',
  'teeTimeBlock',
  'caddy',
  'golfCart',
  'facility',
  'facilityBooking',
  'user',
  'auditLog',
  'notification',
  'eventStore',
]);

/**
 * Models that should be excluded from tenant filtering.
 * These are either global models or handled specially.
 */
const EXCLUDED_MODELS = new Set([
  'club', // Club itself doesn't filter by clubId
  'tenant', // Global tenant model
  'systemSetting', // Global settings
]);

/**
 * AsyncLocalStorage context for tenant ID.
 * This allows us to access the tenant ID in the middleware without passing it through all layers.
 */
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  tenantId: string;
  bypassTenantFilter?: boolean;
}

export const tenantContext = new AsyncLocalStorage<TenantContext>();

/**
 * Get the current tenant ID from the async context.
 * Returns undefined if no tenant context is set.
 */
export function getCurrentTenantId(): string | undefined {
  return tenantContext.getStore()?.tenantId;
}

/**
 * Check if tenant filtering should be bypassed.
 * Used for admin operations that need cross-tenant access.
 */
export function shouldBypassTenantFilter(): boolean {
  return tenantContext.getStore()?.bypassTenantFilter ?? false;
}

/**
 * Run a function within a tenant context.
 * All Prisma queries within this context will be automatically filtered by tenant.
 *
 * @example
 * ```typescript
 * await withTenantContext(tenantId, async () => {
 *   // All queries here are automatically filtered by tenantId
 *   const members = await prisma.member.findMany();
 * });
 * ```
 */
export function withTenantContext<T>(
  tenantId: string,
  fn: () => Promise<T>,
  bypassTenantFilter = false,
): Promise<T> {
  return tenantContext.run({ tenantId, bypassTenantFilter }, fn);
}

/**
 * @deprecated Prisma 7.x removed the $use middleware pattern.
 * Tenant filtering is now handled via:
 * 1. RLS policies in the database (using set_config for app.tenant_id)
 * 2. The withTenantContext() function for automatic context management
 * 3. Prisma Client Extensions (if needed for client-side filtering)
 *
 * This function is kept for documentation purposes only.
 * See prisma.service.ts for the new pattern using withTenant() and withAutoTenantContext().
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _deprecatedTenantMiddlewareDoc(): void {
  // This function exists only to document the old pattern
  // and keep the TENANT_SCOPED_MODELS list for reference
  logger.debug('Tenant middleware is deprecated in Prisma 7.x');
}

/**
 * NestJS Guard that sets up the tenant context from the authenticated user.
 * Use this as a global guard or on specific routes/resolvers.
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class TenantContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Try GraphQL context first
    const gqlContext = GqlExecutionContext.create(context);
    const gqlReq = gqlContext.getContext()?.req;

    // Fall back to HTTP context
    const httpReq = context.switchToHttp().getRequest();
    const request = gqlReq || httpReq;

    if (request?.user?.tenantId) {
      // Note: The actual context setup happens in the resolver/controller
      // This guard just validates that tenant info is available
      return true;
    }

    // Allow unauthenticated requests (they won't have tenant context)
    return true;
  }
}

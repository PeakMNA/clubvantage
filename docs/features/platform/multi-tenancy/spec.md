# Platform / Multi-Tenancy / Database-Per-Tier Routing

## Overview

Database-Per-Tier Routing is the multi-tenancy isolation layer that routes tenant (club) requests to different Neon Postgres databases based on their subscription tier. A control-plane database (Supabase) stores tenant-to-database mappings, authentication, and user management. Domain data (members, bookings, golf, billing, invoices) moves to tier-appropriate Neon databases. This architecture provides performance isolation between tiers, dedicated databases for enterprise clients, and a migration path from shared to dedicated infrastructure as clubs grow.

## Status

**Not Yet Implemented.** This is a draft design. Currently, all tenants share a single Supabase PostgreSQL instance for both control-plane and domain data. The design has been approved for phased rollout starting with foundation work (ConnectionManager service, TenantDatabase model, feature flag) followed by shadow routing, canary testing, and tier-by-tier migration.

**Pre-existing infrastructure:** Supabase is operational as the sole database. Prisma is the ORM. Redis is not yet provisioned. The `TENANT_ROUTING_ENABLED` feature flag does not exist yet.

## Capabilities

- Route database queries to different Neon Postgres instances based on tenant subscription tier (Starter, Professional, Enterprise)
- Maintain a control-plane database (Supabase) for cross-tenant data: clubs, users, authentication, tenant-to-database mapping, audit logs, notifications, system settings
- Isolate domain data per tier: Starter clubs share one Neon DB with RLS, Professional clubs share a higher-compute Neon DB, Enterprise clubs get dedicated Neon databases
- Lazy-create and cache PrismaClient instances per database with LRU eviction (max 5 clients per serverless instance)
- Cache tenant-to-database resolution in Redis with 5-minute TTL for sub-millisecond routing
- Support live tier upgrades via data migration (pg_dump/pg_restore) with atomic database pointer switch and zero downtime
- Transparent to application code: existing `this.prisma.member.findMany()` calls work unchanged
- Feature-flagged: disabled by default in local development (all queries hit single localhost Postgres)
- Schema synchronization: single source of truth `schema.prisma` generates split schemas for control-plane and tenant databases
- Automated tenant database provisioning via Neon API for new Enterprise clients

## Dependencies

### Interface Dependencies

| Component | Path | Purpose |
|-----------|------|---------|
| PrismaService | `apps/api/src/prisma/prisma.service.ts` | Current database service (to be wrapped) |
| ConnectionManager | (new) `apps/api/src/database/connection-manager.service.ts` | Tenant-aware database routing |
| schema.prisma | `database/prisma/schema.prisma` | Full schema (single source of truth) |
| control-plane.prisma | (new) `database/prisma/control-plane.prisma` | Control-plane-only tables |
| tenant.prisma | (new) `database/prisma/tenant.prisma` | Domain-only tables for Neon |

### Settings Dependencies

| Setting | Source | Purpose |
|---------|--------|---------|
| TENANT_ROUTING_ENABLED | Environment | Feature flag to enable/disable tier-based routing |
| TENANT_DB_ENCRYPTION_KEY | Environment | Key for encrypting connection strings in TenantDatabase table |
| REDIS_URL | Environment | Redis connection for tenant-to-database cache |
| DATABASE_URL | Environment | Control-plane Supabase connection (pooled) |
| DIRECT_URL | Environment | Control-plane Supabase connection (direct, for migrations) |

### Data Dependencies

| Entity | Location | Notes |
|--------|----------|-------|
| Club | Control Plane | Includes new `tenantDatabaseId` FK |
| TenantDatabase | Control Plane (new) | Maps databases to tiers with encrypted connection strings |
| User | Control Plane | Authentication stays on Supabase |
| AuditLog | Control Plane | Cross-tenant audit trail |
| Notification | Control Plane | Cross-tenant notification system |
| SystemSetting | Control Plane | Global configuration |
| Member, Dependent | Tenant DB | Moved to per-tier Neon databases |
| Invoice, Payment, CreditNote | Tenant DB | Financial data per club |
| GolfCourse, TeeTime, etc. | Tenant DB | Golf operations data |
| Facility, FacilityBooking | Tenant DB | Booking data |
| ChargeType, ChargeCategory | Tenant DB | Billing configuration |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| TENANT_ROUTING_ENABLED | boolean | `false` | DevOps (env) | Master switch for tier-based database routing |
| TENANT_DB_ENCRYPTION_KEY | string | (required in prod) | DevOps (env) | AES-256 key for encrypting Neon connection strings stored in TenantDatabase table |
| REDIS_URL | string | (required when routing enabled) | DevOps (env) | Redis instance URL for tenant-to-database cache |
| REDIS_CACHE_TTL_SECONDS | number | `300` | DevOps (env) | TTL for tenant-to-database cache entries (5 minutes) |
| MAX_PRISMA_CLIENTS | number | `5` | Developer | Maximum concurrent PrismaClient instances per serverless function |
| connectionPoolSize | number | `10` | Per TenantDatabase | Prisma connection pool size per database |
| maxTenants | number | varies | Per TenantDatabase | Capacity limit per shared database (null for Enterprise = 1) |
| region | string | `us-east-1` | Per TenantDatabase | Neon database region |

## Data Model

### TenantDatabase (new control-plane table)

```prisma
model TenantDatabase {
  id              String   @id @default(uuid())
  name            String   // "starter-shared", "professional-shared", "enterprise-acme"
  connectionUrl   String   // Encrypted Neon connection string (pooled)
  directUrl       String   // Encrypted Neon direct connection (migrations)
  tier            String   // STARTER, PROFESSIONAL, ENTERPRISE
  maxTenants      Int?     // Capacity limit (null for Enterprise = 1)
  currentTenants  Int      @default(0)
  isActive        Boolean  @default(true)
  region          String   @default("us-east-1")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  clubs           Club[]
}
```

### Club (modified control-plane table)

```prisma
model Club {
  // ... existing fields ...
  tenantDatabaseId  String?
  tenantDatabase    TenantDatabase?  @relation(fields: [tenantDatabaseId], references: [id])
}
```

### Tier-to-Database Mapping

| Tier | Database Type | Isolation | Compute |
|------|--------------|-----------|---------|
| Starter | Shared Neon DB (all Starter clubs) | RLS only | Scale-to-zero |
| Professional | Shared-premium Neon DB (all Pro clubs) | RLS + dedicated compute | Always-on |
| Enterprise | Dedicated Neon DB (one per client) | Full isolation | Dedicated |

### Table Split

**Control Plane (Supabase):** Club, User, TenantDatabase, AuditLog, Notification, SystemSetting

**Domain Data (Neon per-tier):** Member, MemberDependent, Invoice, Payment, CreditNote, GolfCourse, GolfRate, TeeTime, TeeTimePlayer, GolfCart, GolfCaddy, GolfScheduleConfig (and children), Facility, FacilityBooking, ChargeType, ChargeCategory, and all other clubId-scoped tables

### ConnectionManager Service

```typescript
@Injectable()
export class ConnectionManager {
  private static clients: Map<string, PrismaClient> = new Map();
  private static MAX_CLIENTS = 5;

  async getClientForTenant(tenantId: string): Promise<PrismaClient> {
    const databaseId = await this.resolveDatabaseId(tenantId);
    return this.getOrCreateClient(databaseId);
  }

  // Redis cache: tenantId -> databaseId (5min TTL)
  private async resolveDatabaseId(tenantId: string): Promise<string> { ... }

  // Lazy-create PrismaClient per database, LRU eviction at capacity
  private async getOrCreateClient(databaseId: string): Promise<PrismaClient> { ... }

  // Decrypt connection string from TenantDatabase record
  private async getDecryptedConfig(databaseId: string): Promise<DbConfig> { ... }

  async onModuleDestroy() {
    for (const client of this.clients.values()) {
      await client.$disconnect();
    }
  }
}
```

### Request Flow

```
1. Request arrives -> JWT extracted -> tenantId resolved
2. Lookup tenant subscription tier (cached in Redis, 5min TTL)
3. Resolve tier -> database connection string
4. Get or create PrismaClient for that database
5. Execute query with RLS (set app.tenant_id)
6. Return response
```

## Business Rules

1. When `TENANT_ROUTING_ENABLED=false` (default), ConnectionManager returns the single localhost/Supabase PrismaClient. Zero behavior change from current state.
2. Connection strings stored in TenantDatabase are AES-256 encrypted at rest. The encryption key is in an environment variable, never in the database.
3. The Redis cache for tenant-to-database mappings has a 5-minute TTL. Cache misses query the control-plane Supabase database.
4. PrismaClient instances are cached in a static Map that survives across warm serverless invocations. LRU eviction occurs at MAX_CLIENTS (5).
5. All domain data queries include RLS via `SET app.tenant_id` regardless of tier. Enterprise dedicated databases still apply RLS for defense-in-depth.
6. Tier upgrades (e.g., Starter to Enterprise) involve: (a) provision target database, (b) pg_dump club data, (c) pg_restore to target, (d) verify row counts, (e) atomic switch of `Club.tenantDatabaseId`, (f) invalidate Redis cache.
7. Rollback from a failed migration is accomplished by reverting `Club.tenantDatabaseId` and invalidating Redis cache. Recovery time is under 1 minute.
8. Schema migrations are run against all tenant databases using a loop over TenantDatabase records. Each database must be at the same schema version.
9. Adding a new database does not require a Vercel redeploy; connection strings live in the TenantDatabase table.
10. Local development always uses a single database regardless of the TENANT_ROUTING_ENABLED flag.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Redis unavailable during request | Fall back to direct Supabase query for tenant-to-database lookup; log warning; continue serving request |
| Neon database unreachable for a specific tier | Return 503 for affected tenants; other tiers unaffected; alert fires on failed routing attempts |
| PrismaClient creation fails (invalid connection string) | Log error with databaseId; return 500; do not cache the failed client; alert on decryption failure |
| LRU eviction disconnects a client that has an in-flight query | PrismaClient disconnect waits for pending queries to complete before closing; next request creates a new client |
| Tenant database at capacity (maxTenants reached) | Block new club assignment to that database; admin must provision a new database or increase capacity |
| Schema version drift between tenant databases | Migration script reports which databases are behind; block deployments if any database is out of sync |
| Club.tenantDatabaseId is null (not yet assigned) | Route to control-plane database (current behavior); this is the default for all clubs before Phase 2 |
| Concurrent tier upgrade for same club | Use optimistic locking on Club.tenantDatabaseId; second attempt fails and must retry |
| Redis cache poisoning (stale mapping after tier change) | Invalidate cache for affected tenantId immediately after Club.tenantDatabaseId update; 5-minute TTL provides upper bound for stale reads |
| Cold start: no PrismaClient in cache | First request incurs ~200-500ms latency to create client; subsequent requests reuse cached client |
| Enterprise client database needs maintenance | Neon handles maintenance windows; ConnectionManager retries with exponential backoff on transient connection errors |
| Data leak between tenants on shared database | RLS policies enforce tenant isolation; every query includes `WHERE tenant_id = current_setting('app.tenant_id')` |

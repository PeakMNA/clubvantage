# Database-Per-Tier Routing Layer Design

**Date**: 2026-02-06
**Status**: Draft
**Stack**: NestJS, Supabase (control plane), Neon Postgres (tenant databases), Prisma, Vercel

## Problem

All tenants share a single PostgreSQL instance. High-usage clubs degrade performance for everyone.

## Solution

Route tenants to different Neon Postgres databases based on their subscription tier. A control-plane database (Supabase) stores the tenant-to-database mapping. The API resolves the correct database connection at request time.

## Architecture

```
                        +---------------------+
                        |   Supabase Cloud     |
                        |  (Control Plane DB)  |
                        |  - Club registry     |
                        |  - Auth / users      |
                        |  - Tenant -> DB map  |
                        +----------+----------+
                                   |
         +-------------------------+-------------------------+
         |                         |                         |
+--------v--------+  +-------------v------------+  +---------v---------+
|  Neon: Starter  |  |  Neon: Professional      |  |  Neon: Enterprise |
|  (shared DB)    |  |  (shared DB)             |  |  (dedicated DB)   |
|  - RLS enabled  |  |  - RLS enabled           |  |  - per client     |
|  - Scale to 0   |  |  - Higher compute        |  |  - Full isolation |
+-----------------+  +--------------------------+  +-------------------+
```

### Tier-to-Database Mapping

| Tier | Database | Isolation |
|------|----------|-----------|
| Starter | Shared Neon DB (all Starter clubs) | RLS only |
| Professional | Shared-premium Neon DB (all Pro clubs) | RLS + dedicated compute |
| Enterprise | Dedicated Neon DB (one per client) | Full isolation |

### Request Flow

```
1. Request arrives -> JWT extracted -> tenantId resolved
2. Lookup tenant subscription tier (cached in Redis, 5min TTL)
3. Resolve tier -> database connection string
4. Get or create PrismaClient for that database
5. Execute query with RLS (set app.tenant_id)
6. Return response
```

### Key Design Decisions

- Control plane stays on Supabase (Auth, user management, tenant registry, subscription billing)
- Domain data moves to Neon (Members, bookings, golf, billing, invoices)
- Local dev unchanged (all tiers route to single localhost Postgres)
- Connection pooling via Neon's built-in serverless pooler (no external PgBouncer)

## Data Model

### Control Plane Schema (Supabase)

New `TenantDatabase` table maps tenants to their database:

```prisma
model TenantDatabase {
  id              String   @id @default(uuid())
  name            String   // "starter-shared", "professional-shared", "enterprise-acme"
  connectionUrl   String   // Encrypted Neon connection string (pooled)
  directUrl       String   // Encrypted Neon direct connection (migrations)
  tier            String   // STARTER, PROFESSIONAL, ENTERPRISE
  maxTenants      Int      // Capacity limit (null for Enterprise = 1)
  currentTenants  Int      @default(0)
  isActive        Boolean  @default(true)
  region          String   @default("us-east-1")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  clubs           Club[]
}
```

The `Club` model gets one new field:

```prisma
model Club {
  // ... existing fields ...
  tenantDatabaseId  String?
  tenantDatabase    TenantDatabase?  @relation(fields: [tenantDatabaseId], references: [id])
}
```

### Connection Manager Service

```typescript
@Injectable()
export class ConnectionManager {
  private clients: Map<string, PrismaClient> = new Map();

  async getClientForTenant(tenantId: string): Promise<PrismaClient> {
    const databaseId = await this.resolveDatabaseId(tenantId);
    return this.getOrCreateClient(databaseId);
  }

  // Cache lookup: tenantId -> databaseId (Redis, 5min TTL)
  private async resolveDatabaseId(tenantId: string): Promise<string> { ... }

  // Lazy-create PrismaClient per database
  private async getOrCreateClient(databaseId: string): Promise<PrismaClient> { ... }

  // Graceful shutdown
  async onModuleDestroy() {
    for (const client of this.clients.values()) {
      await client.$disconnect();
    }
  }
}
```

### Integration With Existing PrismaService

Calling code does not change:

```typescript
// Before and after (identical)
this.prisma.member.findMany({ where: { clubId } })
// PrismaService internally routes to the correct database
```

### Local Development

```typescript
// When TENANT_ROUTING_ENABLED=false (default in .env.local)
// ConnectionManager returns the single localhost PrismaClient
// Zero behavior change from today
```

## Table Split

### Control Plane (Supabase)

- Club
- User
- TenantDatabase
- AuditLog
- Notification
- SystemSetting

### Domain Data (Neon per-tier)

- Member, MemberDependent
- Invoice, Payment, CreditNote
- GolfCourse, GolfRate, TeeTime, TeeTimePlayer
- GolfCart, GolfCaddy
- GolfScheduleConfig + children
- Facility, FacilityBooking
- ChargeType, ChargeCategory
- All other clubId-scoped tables

## Schema Sync

Split schema approach:

```
database/
  prisma/
    schema.prisma           # Full schema (local dev, current)
    control-plane.prisma    # Control-plane only tables
    tenant.prisma           # Domain-only tables (deployed to Neon)
```

### Migration Workflow

```bash
# 1. Edit schema.prisma (single source of truth)
# 2. Generate split schemas
pnpm run db:split-schemas
# 3. Migrate control plane (Supabase)
pnpm run db:migrate:control-plane
# 4. Migrate all tenant databases (Neon)
pnpm run db:migrate:tenants
```

### Tenant Database Provisioning

When a new tenant database is needed:

1. Create Neon project via Neon API
2. Run `prisma migrate deploy` against new database
3. Apply RLS policies (same SQL, automated)
4. Insert TenantDatabase record in control plane
5. Update `Club.tenantDatabaseId` for assigned clubs
6. Invalidate Redis cache for affected tenants

### Existing Tenant Migration (e.g., Starter -> Enterprise upgrade)

1. Create target database + run migrations
2. `pg_dump` club-specific data from source DB
3. `pg_restore` into target Neon database
4. Verify row counts match
5. Update `Club.tenantDatabaseId` (atomic switch, zero downtime)
6. Invalidate Redis cache
7. Delete old data from source DB (deferred, after verification window)

### Rollback

1. Set `Club.tenantDatabaseId` back to previous value
2. Invalidate Redis cache
3. Tenant immediately routes back to old database (< 1 minute)

## Vercel Deployment

### Environment Variables

```
# Control plane (same as today)
DATABASE_URL=postgresql://...@db.supabase.co:6543/postgres
DIRECT_URL=postgresql://...@db.supabase.co:5432/postgres
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Routing layer (new)
TENANT_ROUTING_ENABLED=true
TENANT_DB_ENCRYPTION_KEY=base64...

# Redis
REDIS_URL=redis://...
```

Connection strings for Neon databases live in the `TenantDatabase` table, not in env vars. Adding a new database does not require a redeploy.

### Serverless Connection Strategy

```typescript
@Injectable()
export class ConnectionManager {
  // Static cache survives across warm invocations
  private static clients: Map<string, PrismaClient> = new Map();
  private static MAX_CLIENTS = 5; // Prevent memory bloat

  async getOrCreateClient(databaseId: string): Promise<PrismaClient> {
    if (ConnectionManager.clients.has(databaseId)) {
      return ConnectionManager.clients.get(databaseId);
    }

    // Evict LRU if at capacity
    if (ConnectionManager.clients.size >= ConnectionManager.MAX_CLIENTS) {
      const oldest = ConnectionManager.clients.keys().next().value;
      await ConnectionManager.clients.get(oldest).$disconnect();
      ConnectionManager.clients.delete(oldest);
    }

    // Create with Neon serverless adapter
    const dbConfig = await this.getDecryptedConfig(databaseId);
    const client = new PrismaClient({
      datasourceUrl: dbConfig.connectionUrl,
    });

    ConnectionManager.clients.set(databaseId, client);
    return client;
  }
}
```

### Deployment Pipeline

```
git push -> Vercel Build
  +-- Build apps (no schema changes needed)
  +-- Run db:migrate:control-plane (Supabase)
  +-- Run db:migrate:tenants (loops through TenantDatabase records)
```

## Testing Strategy

### Unit Tests

- Resolves correct database for each tier
- Falls back to control-plane DB when TENANT_ROUTING_ENABLED=false
- LRU eviction works at MAX_CLIENTS limit
- Handles decryption failures gracefully
- Cache invalidation triggers fresh lookup

### Integration Tests

- Starter tenant queries hit Starter shared DB
- Professional tenant queries hit Professional DB
- Enterprise tenant queries hit dedicated DB
- Cross-tenant isolation: Tenant A cannot see Tenant B data
- Tier upgrade: Club moves between databases seamlessly
- Cold start: First request creates client, second reuses it

### Load Tests

- Starter shared DB under load doesn't affect Professional DB
- Enterprise dedicated DB meets SLA under peak
- Connection pool saturation behavior
- Redis cache miss storm handling

## Rollout Plan

### Phase 0: Foundation (Week 1-2, no user impact)

- Create TenantDatabase model in control-plane schema
- Build ConnectionManager service
- Add TENANT_ROUTING_ENABLED feature flag (default: false)
- Write unit tests
- All traffic still hits single Supabase DB

### Phase 1: Shadow Mode (Week 3)

- Provision one Neon database (Starter tier)
- Run schema migrations against it
- ConnectionManager resolves databases but still queries control-plane DB
- Log which database WOULD have been used (shadow routing)
- Verify routing decisions are correct from logs

### Phase 2: Single Tenant Canary (Week 4)

- Pick one low-risk Starter club
- Migrate its data to Neon Starter DB
- Set `Club.tenantDatabaseId` to Neon Starter
- Monitor: query latency, error rates, data correctness
- Rollback plan: revert tenantDatabaseId (< 1 minute)

### Phase 3: Tier-by-Tier Migration (Week 5-6)

- Migrate all Starter clubs to Neon Starter DB
- Provision Neon Professional DB
- Migrate Professional clubs
- Monitor each batch for 48 hours before next

### Phase 4: Enterprise Ready (Week 7+)

- Provisioning script tested and documented
- First Enterprise client gets dedicated DB
- Admin UI in Platform Manager for database assignment
- Runbook for tier upgrades / database migrations

## Monitoring & Alerts

- Per-database query latency (P50, P95, P99)
- Connection pool utilization per Neon database
- Redis cache hit rate for tenant-to-database lookups
- Failed routing attempts (database unreachable)
- Schema version drift between tenant databases

## Estimated Costs

| Component | Plan | Cost |
|-----------|------|------|
| Supabase (control plane + auth) | Pro | ~$35-75/mo |
| Neon (Starter shared DB) | Launch | ~$19/mo |
| Neon (Professional shared DB) | Scale | ~$69/mo |
| Neon (Enterprise dedicated, per client) | Scale | ~$69/mo (pass to client) |
| **Total (early stage, no Enterprise)** | | **~$125-165/mo** |

## What We're NOT Building (YAGNI)

- No geographic routing (single region for now)
- No automatic tier-based migration (manual via Platform Manager)
- No database sharding within a tier
- No custom connection strings per tenant (only per tier, except Enterprise)
- No real-time database health dashboard (use Neon's built-in monitoring)

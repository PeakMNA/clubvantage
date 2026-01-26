# ClubVantage Backend Implementation Plan

## Overview

Build a **NestJS modular monolith** backend to service all 8 ClubVantage modules (Members, Billing, Golf, Bookings, Reports, Settings, Users, Portal). The backend will be added to the existing monorepo at `apps/api`.

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | NestJS | TypeScript-native, modular architecture, excellent DI |
| API | REST + GraphQL hybrid | REST for CRUD, GraphQL for complex queries |
| Database | PostgreSQL + Prisma | Existing schema, type-safe ORM |
| Multi-tenancy | Row-Level Security (RLS) | Database-level isolation per club |
| Auth | Custom JWT + Refresh Tokens | Full control, RBAC integration |
| Real-time | Socket.io | Tee sheet updates, notifications |
| Jobs | BullMQ + Redis | Invoice generation, email sending |
| Search | Meilisearch | Fast member/invoice lookup |
| Storage | Supabase Storage | Documents, profile photos |
| Email | Resend | Transactional emails |
| Payments | Stripe | Recurring billing, payment processing |
| Monitoring | Sentry | Error tracking, performance |
| Docs | Swagger (auto-generated) | NestJS decorators |

---

## Project Structure

```
clubvantage/
├── apps/
│   ├── application/          # Next.js frontend (existing)
│   └── api/                  # NestJS backend (NEW)
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/                    # Shared utilities
│       │   │   ├── decorators/
│       │   │   ├── filters/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   └── pipes/
│       │   ├── config/                    # Configuration
│       │   │   ├── database.config.ts
│       │   │   ├── auth.config.ts
│       │   │   ├── redis.config.ts
│       │   │   └── index.ts
│       │   ├── shared/                    # Shared service layer
│       │   │   ├── prisma/
│       │   │   │   ├── prisma.module.ts
│       │   │   │   └── prisma.service.ts
│       │   │   ├── redis/
│       │   │   ├── meilisearch/
│       │   │   ├── storage/
│       │   │   └── email/
│       │   └── modules/                   # Domain modules
│       │       ├── auth/
│       │       ├── members/
│       │       ├── billing/
│       │       ├── golf/
│       │       ├── bookings/
│       │       ├── reports/
│       │       ├── settings/
│       │       ├── users/
│       │       ├── notifications/
│       │       └── portal/
│       ├── test/
│       │   ├── unit/
│       │   └── integration/
│       ├── nest-cli.json
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── database/             # Prisma schema (existing, enhanced)
│   ├── types/                # Shared TypeScript types
│   └── ui/                   # UI components (existing)
└── services/                 # External service configs
    ├── meilisearch/
    └── redis/
```

---

## Module Architecture

Each domain module follows this structure:

```
modules/members/
├── members.module.ts         # Module definition
├── members.controller.ts     # REST endpoints
├── members.resolver.ts       # GraphQL resolver (optional)
├── members.service.ts        # Business logic
├── dto/                      # Data transfer objects
│   ├── create-member.dto.ts
│   ├── update-member.dto.ts
│   └── member-query.dto.ts
├── entities/                 # Response entities
├── events/                   # Domain events
│   ├── member-created.event.ts
│   └── member-status-changed.event.ts
└── __tests__/
    ├── members.service.spec.ts
    └── members.controller.spec.ts
```

---

## Database Schema Enhancements

### 1. Event Sourcing Tables (Audit Trail)

```prisma
// packages/database/prisma/schema.prisma

model AuditEvent {
  id            String   @id @default(cuid())
  tenantId      String
  aggregateType String   // 'Member', 'Invoice', 'Payment'
  aggregateId   String
  eventType     String   // 'CREATED', 'UPDATED', 'STATUS_CHANGED'
  eventData     Json     // Full event payload
  userId        String
  userEmail     String
  ipAddress     String?
  userAgent     String?
  createdAt     DateTime @default(now())

  tenant        Tenant   @relation(fields: [tenantId], references: [id])

  @@index([tenantId, aggregateType, aggregateId])
  @@index([tenantId, createdAt])
  @@index([aggregateType, eventType])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  revokedAt DateTime?

  user      User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([token])
}
```

### 2. Row-Level Security (RLS)

```sql
-- Applied via Prisma migration

-- Enable RLS on all tenant tables
ALTER TABLE "Member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
-- ... all tenant-scoped tables

-- Create policies
CREATE POLICY tenant_isolation ON "Member"
  USING (tenant_id = current_setting('app.tenant_id')::text);

CREATE POLICY tenant_isolation ON "Invoice"
  USING (tenant_id = current_setting('app.tenant_id')::text);
```

---

## API Design

### REST Endpoints (v1)

#### Members Module
```
GET    /api/v1/members              # List with pagination, filters
GET    /api/v1/members/:id          # Get member detail
POST   /api/v1/members              # Create member
PATCH  /api/v1/members/:id          # Update member
DELETE /api/v1/members/:id          # Soft delete
POST   /api/v1/members/:id/status   # Change status
GET    /api/v1/members/:id/dependents
GET    /api/v1/members/:id/contracts
GET    /api/v1/members/:id/invoices
GET    /api/v1/members/:id/activity
```

#### Billing Module
```
GET    /api/v1/invoices
POST   /api/v1/invoices
GET    /api/v1/invoices/:id
PATCH  /api/v1/invoices/:id
POST   /api/v1/invoices/:id/void
POST   /api/v1/invoices/:id/send

GET    /api/v1/payments
POST   /api/v1/payments
GET    /api/v1/payments/:id
POST   /api/v1/payments/:id/void

GET    /api/v1/receipts
POST   /api/v1/receipts/:id/resend

POST   /api/v1/wht/verify
GET    /api/v1/wht/pending
```

#### Golf Module
```
GET    /api/v1/golf/teesheet          # Date-based tee sheet
POST   /api/v1/golf/flights           # Create booking
GET    /api/v1/golf/flights/:id
PATCH  /api/v1/golf/flights/:id
DELETE /api/v1/golf/flights/:id
POST   /api/v1/golf/flights/:id/checkin
POST   /api/v1/golf/flights/:id/checkout

GET    /api/v1/golf/courses
GET    /api/v1/golf/caddies
GET    /api/v1/golf/carts
POST   /api/v1/golf/caddies/:id/assign
```

#### Bookings Module
```
GET    /api/v1/facilities
GET    /api/v1/facilities/:id/availability
POST   /api/v1/bookings
GET    /api/v1/bookings/:id
PATCH  /api/v1/bookings/:id
DELETE /api/v1/bookings/:id
```

#### Reports Module
```
GET    /api/v1/reports/dashboard
GET    /api/v1/reports/financial
GET    /api/v1/reports/membership
GET    /api/v1/reports/ar-aging
GET    /api/v1/reports/golf-utilization
POST   /api/v1/reports/export
```

#### Settings Module
```
GET    /api/v1/settings/club-profile
PATCH  /api/v1/settings/club-profile
GET    /api/v1/settings/billing
PATCH  /api/v1/settings/billing
GET    /api/v1/settings/gl-mapping
PATCH  /api/v1/settings/gl-mapping
POST   /api/v1/settings/gl-mapping/sync
GET    /api/v1/settings/integrations
POST   /api/v1/settings/integrations/:type/connect
DELETE /api/v1/settings/integrations/:type/disconnect
```

#### Users Module
```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
POST   /api/v1/users/:id/lock
POST   /api/v1/users/:id/unlock

GET    /api/v1/roles
POST   /api/v1/roles
PATCH  /api/v1/roles/:id
DELETE /api/v1/roles/:id

GET    /api/v1/permissions
GET    /api/v1/activity-log
```

### GraphQL Schema (Complex Queries)

```graphql
type Query {
  # Members
  members(
    filter: MemberFilter
    pagination: PaginationInput
    sort: MemberSort
  ): MemberConnection!

  member(id: ID!): Member

  # Dashboard
  dashboardStats: DashboardStats!

  # Reports
  financialReport(
    startDate: DateTime!
    endDate: DateTime!
    groupBy: GroupByPeriod
  ): FinancialReport!

  # Search
  globalSearch(query: String!, types: [SearchType!]): SearchResults!
}

type Mutation {
  # Billing
  createInvoice(input: CreateInvoiceInput!): Invoice!
  processPayment(input: ProcessPaymentInput!): Payment!

  # Golf
  createFlightBooking(input: FlightBookingInput!): Flight!
  bulkCheckin(flightIds: [ID!]!): [Flight!]!
}

type Subscription {
  # Real-time updates
  teesheetUpdated(courseId: ID!, date: Date!): TeesheetUpdate!
  notificationReceived: Notification!
}
```

---

## Authentication & Authorization

### JWT Strategy

```typescript
// modules/auth/strategies/jwt.strategy.ts

interface JwtPayload {
  sub: string;        // userId
  email: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

// Access token: 15 minutes
// Refresh token: 30 days (stored in DB, revocable)
```

### RBAC Guard

```typescript
// common/guards/permissions.guard.ts

@Injectable()
export class PermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler()
    );

    const user = context.switchToHttp().getRequest().user;
    return requiredPermissions.every(p =>
      user.permissions.includes(p) || user.permissions.includes('*')
    );
  }
}

// Usage:
@RequirePermissions('members.profile.edit')
@Patch(':id')
async updateMember() { ... }
```

---

## Event Sourcing (Audit Trail)

```typescript
// shared/events/event-store.service.ts

@Injectable()
export class EventStoreService {
  async append<T>(event: DomainEvent<T>): Promise<void> {
    await this.prisma.auditEvent.create({
      data: {
        tenantId: event.tenantId,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        eventType: event.type,
        eventData: event.data as any,
        userId: event.userId,
        userEmail: event.userEmail,
        ipAddress: event.metadata?.ipAddress,
        userAgent: event.metadata?.userAgent,
      },
    });
  }

  async getHistory(
    aggregateType: string,
    aggregateId: string
  ): Promise<AuditEvent[]> {
    return this.prisma.auditEvent.findMany({
      where: { aggregateType, aggregateId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
```

---

## Real-time (WebSocket Gateway)

```typescript
// modules/notifications/gateways/notifications.gateway.ts

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: process.env.FRONTEND_URL },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('subscribe:teesheet')
  handleTeesheetSubscribe(
    @MessageBody() data: { courseId: string; date: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `teesheet:${data.courseId}:${data.date}`;
    client.join(room);
  }

  emitTeesheetUpdate(courseId: string, date: string, update: any) {
    const room = `teesheet:${courseId}:${date}`;
    this.server.to(room).emit('teesheet:updated', update);
  }
}
```

---

## Background Jobs (BullMQ)

```typescript
// modules/billing/queues/invoice.processor.ts

@Processor('invoices')
export class InvoiceProcessor {
  @Process('generate-monthly')
  async generateMonthlyInvoices(job: Job) {
    const { tenantId, billingPeriod } = job.data;
    // Generate invoices for all active members
  }

  @Process('send-reminder')
  async sendPaymentReminder(job: Job) {
    const { invoiceId } = job.data;
    // Send reminder email via Resend
  }
}

// Queue definitions
const queues = [
  { name: 'invoices', jobs: ['generate-monthly', 'send-reminder', 'void'] },
  { name: 'emails', jobs: ['send-transactional', 'send-bulk'] },
  { name: 'reports', jobs: ['generate-scheduled', 'export'] },
  { name: 'search', jobs: ['index-member', 'index-invoice', 'reindex-all'] },
  { name: 'integrations', jobs: ['sync-gl', 'sync-stripe'] },
];
```

---

## Search (Meilisearch)

```typescript
// shared/meilisearch/meilisearch.service.ts

@Injectable()
export class MeilisearchService {
  private indexes = {
    members: 'members',
    invoices: 'invoices',
  };

  async indexMember(member: Member) {
    await this.client.index(this.indexes.members).addDocuments([{
      id: member.id,
      tenantId: member.tenantId,
      membershipNumber: member.membershipNumber,
      name: `${member.firstName} ${member.lastName}`,
      email: member.email,
      phone: member.phone,
      status: member.status,
      membershipType: member.membershipType,
    }]);
  }

  async search(tenantId: string, query: string, types?: string[]) {
    const results = await this.client.multiSearch({
      queries: [
        { indexUid: 'members', q: query, filter: `tenantId = ${tenantId}` },
        { indexUid: 'invoices', q: query, filter: `tenantId = ${tenantId}` },
      ],
    });
    return results;
  }
}
```

---

## External Integrations

### Stripe Integration

```typescript
// modules/billing/services/stripe.service.ts

@Injectable()
export class StripeService {
  async createCustomer(member: Member): Promise<string> { }
  async createSubscription(customerId: string, priceId: string): Promise<void> { }
  async processPayment(invoiceId: string, paymentMethodId: string): Promise<void> { }
  async handleWebhook(event: Stripe.Event): Promise<void> { }
}
```

### GL System Integration

```typescript
// modules/settings/services/gl-sync.service.ts

@Injectable()
export class GLSyncService {
  async syncToXero(transactions: GLTransaction[]): Promise<void> { }
  async syncToSAP(transactions: GLTransaction[]): Promise<void> { }
  async syncToOracle(transactions: GLTransaction[]): Promise<void> { }

  async importChartOfAccounts(provider: GLProvider): Promise<void> { }
}
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-3)
- [ ] Initialize `apps/api` with NestJS
- [ ] Configure Prisma with existing schema
- [ ] Set up configuration module (env variables)
- [ ] Implement JWT auth with refresh tokens
- [ ] Create base RBAC guards and decorators
- [ ] Set up event sourcing infrastructure
- [ ] Configure Redis connection
- [ ] Set up Swagger documentation

### Phase 2: Core Modules (Weeks 4-7)
- [ ] **Members Module**: CRUD, status changes, search
- [ ] **Billing Module**: Invoices, payments, receipts
- [ ] **Users Module**: User management, roles, permissions
- [ ] **Settings Module**: Club profile, billing defaults

### Phase 3: Domain Features (Weeks 8-11)
- [ ] **Golf Module**: Tee sheet, flights, check-in/out
- [ ] **Bookings Module**: Facility reservations
- [ ] **Reports Module**: Dashboard stats, financial reports
- [ ] Redis distributed locks for booking conflicts

### Phase 4: Real-time & Jobs (Weeks 12-14)
- [ ] WebSocket gateway for real-time updates
- [ ] BullMQ queues for background jobs
- [ ] Meilisearch indexing
- [ ] Scheduled job processing

### Phase 5: Integrations & Polish (Weeks 15-17)
- [ ] Stripe payment integration
- [ ] Resend email integration
- [ ] GL system sync (Xero/SAP/Oracle)
- [ ] Supabase storage for documents
- [ ] Portal API (lightweight, member-facing)
- [ ] Performance optimization
- [ ] Integration tests

---

## Critical Files to Create

```
apps/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/guards/permissions.guard.ts
│   ├── common/guards/tenant.guard.ts
│   ├── common/decorators/permissions.decorator.ts
│   ├── common/interceptors/audit.interceptor.ts
│   ├── shared/prisma/prisma.service.ts
│   ├── shared/events/event-store.service.ts
│   ├── modules/auth/auth.module.ts
│   ├── modules/auth/auth.service.ts
│   ├── modules/auth/strategies/jwt.strategy.ts
│   ├── modules/members/members.module.ts
│   ├── modules/members/members.controller.ts
│   ├── modules/members/members.service.ts
│   └── modules/billing/billing.module.ts
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## Verification Plan

### Unit Tests
```bash
# Run all unit tests
pnpm --filter api test

# Run specific module tests
pnpm --filter api test -- --testPathPattern=members
```

### Integration Tests
```bash
# Run integration tests (requires test DB)
pnpm --filter api test:e2e
```

### Manual Verification
1. Start the API server: `pnpm --filter api dev`
2. Access Swagger docs: `http://localhost:3001/api/docs`
3. Test auth flow:
   - POST `/api/v1/auth/login` with credentials
   - Verify JWT token response
   - Use token for protected endpoints
4. Test member CRUD:
   - Create, read, update, delete member
   - Verify audit events created
5. Test real-time:
   - Connect WebSocket client
   - Subscribe to tee sheet updates
   - Create golf booking, verify event received

---

## Environment Variables

```env
# apps/api/.env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
MEILISEARCH_HOST=...
MEILISEARCH_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
RESEND_API_KEY=...
SENTRY_DSN=...
```

---

## Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/graphql": "^12.0.0",
    "@nestjs/apollo": "^12.0.0",
    "@nestjs/websockets": "^10.0.0",
    "@nestjs/platform-socket.io": "^10.0.0",
    "@nestjs/bullmq": "^10.0.0",
    "@prisma/client": "^5.0.0",
    "passport-jwt": "^4.0.0",
    "bullmq": "^5.0.0",
    "meilisearch": "^0.37.0",
    "@supabase/supabase-js": "^2.0.0",
    "stripe": "^14.0.0",
    "resend": "^2.0.0",
    "@sentry/node": "^7.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.0.0",
    "prisma": "^5.0.0"
  }
}
```

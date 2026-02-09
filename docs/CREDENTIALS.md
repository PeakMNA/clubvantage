# ClubVantage Demo Credentials

This document contains all demo user credentials for development and testing.

## Application Ports

| App | URL | Purpose |
|-----|-----|---------|
| Staff Application | http://localhost:3000 | Staff/Admin dashboard for club operations |
| Member Portal | http://localhost:3004 | Self-service portal for club members |
| Platform Manager | http://localhost:3002 | Multi-tenant platform administration |
| Tenant Admin | http://localhost:3003 | Club-specific configuration and settings |
| API | http://localhost:3001 | Backend API server |

## Demo Accounts

### Staff Application (http://localhost:3000)

**Royal Bangkok Sports Club:**

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@royalbangkokclub.com | Admin123! | TENANT_ADMIN | Full admin access to club |
| manager@royalbangkokclub.com | Admin123! | TENANT_ADMIN | Club manager access |
| accountant@royalbangkokclub.com | Admin123! | STAFF | Accounting staff |
| frontdesk@royalbangkokclub.com | Admin123! | STAFF | Front desk staff |
| membership@royalbangkokclub.com | Admin123! | STAFF | Membership staff |
| booking@royalbangkokclub.com | Admin123! | STAFF | Booking staff |

**Phuket Ocean Club:**

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@phuketoceanclub.com | Admin123! | TENANT_ADMIN | Full admin access (Starter tier, no golf) |

### Platform Manager (http://localhost:3002)

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| superadmin@vantage.com | Admin123! | SUPER_ADMIN | Full platform access, all clubs |
| platformadmin@vantage.com | Admin123! | PLATFORM_ADMIN | Platform read access, reports |

### Tenant Admin (http://localhost:3003)

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@royalbangkokclub.com | Admin123! | TENANT_ADMIN | Club configuration access |
| manager@royalbangkokclub.com | Admin123! | TENANT_ADMIN | Club settings access |

### Member Portal (http://localhost:3004)

**Royal Bangkok Sports Club:**

| Email | Password | Member | Membership Type | Notes |
|-------|----------|--------|----------------|-------|
| member@demo.com | Member123! | Somchai Tanaka (M-0001) | Full | Primary demo member — has tee times, facility bookings, event registrations, household, dependents |
| nattaya@demo.com | Member123! | Nattaya Wong (M-0002) | Full | |
| thaksin@demo.com | Member123! | Thaksin Yamamoto (M-0006) | Golf | Golf-only membership |
| chaiwat@demo.com | Member123! | Chaiwat Sato (M-0010) | Social | No golf access |
| corporate@demo.com | Member123! | Tanawat Srivichai (M-0021) | Corporate | Corporate member (Siam Cement Group) |

**Phuket Ocean Club:**

| Email | Password | Member | Membership Type | Notes |
|-------|----------|--------|----------------|-------|
| phuket@demo.com | Member123! | Anan Kittikhun (P-0001) | Full | Starter tier club — facilities only, no golf module |

## Role Hierarchy

```
SUPER_ADMIN         <- Full platform access (no clubId)
└── PLATFORM_ADMIN  <- Platform read access (no clubId)
    └── TENANT_ADMIN    <- Full club admin access
        └── MANAGER     <- Club manager access
            └── STAFF   <- Limited staff access
                └── MEMBER  <- Member self-service only
```

## Multi-Tenancy Notes

- **Platform users** (SUPER_ADMIN, PLATFORM_ADMIN): Have no `clubId`, can access all clubs
- **Tenant users** (TENANT_ADMIN, MANAGER, STAFF): Have a `clubId`, can only access their club
- **Members**: Have a `clubId` and linked `memberId`, can only access member portal

## Demo Clubs

### Royal Bangkok Sports Club

| Field | Value |
|-------|-------|
| Name | Royal Bangkok Sports Club |
| Slug | royal-bangkok-club |
| Region | Thailand (TH) |
| Timezone | Asia/Bangkok |
| Currency | THB |
| Tax Rate | 7% VAT |
| Tier | PROFESSIONAL |
| Features | Golf, Facility, Billing, Leads, Reports |
| Members | 23 (20 base + 3 corporate) |
| Membership Types | FULL, SOCIAL, GOLF, JUNIOR, CORPORATE |

### Phuket Ocean Club

| Field | Value |
|-------|-------|
| Name | Phuket Ocean Club |
| Slug | phuket-ocean-club |
| Region | Thailand (TH) |
| Timezone | Asia/Bangkok |
| Currency | THB |
| Tax Rate | 7% VAT |
| Tier | STARTER |
| Features | Facility, Billing (no golf, no leads, no reports) |
| Members | 6 |
| Membership Types | FULL, SOCIAL |

## Resetting Demo Data

To reset the database with fresh demo data:

```bash
cd database
pnpm prisma db push --force-reset
pnpm prisma db seed
```

The main seed (`seed.ts`) automatically calls the multi-tenancy seed at the end.
To run the multi-tenancy seed standalone (e.g. after a partial reset):

```bash
cd database
npx tsx prisma/seed-multitenancy.ts
```

All seed scripts are idempotent — safe to re-run without duplicating data.

## Authentication Flow

1. User submits email/password to `/api/v1/auth/login`
2. Backend validates credentials with Supabase Auth
3. On success, sets HttpOnly cookies:
   - `sb-access-token`: JWT access token (15 min expiry)
   - `sb-refresh-token`: Refresh token (7 day expiry)
4. Frontend uses cookies automatically for authenticated requests
5. Session refresh happens automatically every 10 minutes

## Troubleshooting

### "Invalid credentials" error
- Ensure the database has been seeded: `pnpm prisma db seed`
- Check that the API server is running on port 3001

### "Unauthorized" after login
- Clear browser cookies and try again
- Check that CORS is configured with `credentials: true`
- Verify API_URL environment variable is set correctly

### Session expired
- The auth provider automatically refreshes sessions
- If issues persist, log out and log in again

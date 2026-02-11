# Settings Wiring Plan — Connect ClubBillingSettings to Consuming Modules

## Problem

The `ClubBillingSettings` table has 54+ configurable fields. The settings UI and API are fully built. However, most backend services ignore these settings and use hardcoded values. This means admins can configure settings that have no effect.

## Scope

Three phases, each buildable and testable independently:

| Phase | What | Impact | Effort |
|-------|------|--------|--------|
| 1 | Wire existing settings into existing services | Settings actually take effect | ~150 LOC changed |
| 2 | Add enforcement logic (late fees, suspension, credit alerts) | Automation features work | ~200 LOC new |
| 3 | Add scheduled cron jobs | Fully automated billing operations | ~150 LOC new |

---

## Phase 1 — Wire Settings Into Existing Services

No new features. Just make services read from `ClubBillingSettings` instead of hardcoding.

### 1A. Invoice Numbering

**File:** `apps/api/src/modules/billing/billing.service.ts`

**Current:** Hardcoded `INV-${year}-${sequence}`
**After:** Read `settings.invoicePrefix` and `settings.invoiceStartNumber`

```typescript
// Before
const invoiceNumber = `INV-${year}-${String(sequence).padStart(5, '0')}`;

// After
const settings = await this.billingCycleSettingsService.getSettings(clubId);
const prefix = settings.invoicePrefix || 'INV-';
const invoiceNumber = `${prefix}${year}-${String(sequence).padStart(5, '0')}`;
```

**Changes:**
- Inject `BillingCycleSettingsService` into `BillingService`
- Replace hardcoded prefix with `settings.invoicePrefix`
- Use `settings.invoiceStartNumber` as the floor for the sequence counter

### 1B. Invoice Due Date Calculation

**File:** `apps/api/src/modules/billing/billing.service.ts`

**Current:** `dueDate` accepted as raw DTO input — caller must calculate
**After:** Auto-calculate from `settings.invoiceDueDays` when not explicitly provided

```typescript
// In createInvoice():
const settings = await this.billingCycleSettingsService.getSettings(clubId);
const effectiveDueDate = dto.dueDate
  ?? addDays(dto.invoiceDate ?? new Date(), settings.invoiceDueDays ?? 15);
```

**Changes:**
- Add fallback due date calculation using `settings.invoiceDueDays`
- Keep explicit `dto.dueDate` override for edge cases

### 1C. VAT Rate From Settings

**Files (frontend):**
- `apps/application/src/app/(dashboard)/pos/sales/page.tsx`
- `apps/application/src/app/(dashboard)/billing/invoices/[id]/page.tsx`

**Current:** Hardcoded `7` for VAT calculations
**After:** Read `defaultVatRate` from `useClubBillingSettings()`

```typescript
// Before
const vatRate = 7;

// After
const { data: billingSettings } = useClubBillingSettings();
const vatRate = billingSettings?.defaultVatRate ?? 7;
const taxMethod = billingSettings?.taxMethod ?? 'ADDON';
```

**Changes:**
- Import and call `useClubBillingSettings()` in both pages
- Replace hardcoded `7` with `billingSettings.defaultVatRate`
- Respect `taxMethod` (ADDON vs INCLUDED vs EXEMPT)

### 1D. Credit Limit Defaults

**File:** `apps/api/src/modules/billing/credit-limits.service.ts`

**Current:** Only member-specific overrides work. No club-level fallback.
**After:** Cascade: member override > membership type default > club default

```typescript
async getEffectiveCreditLimit(memberId: string, clubId: string): Promise<number | null> {
  // 1. Check member-specific override
  const memberLimit = await this.getMemberCreditLimit(memberId);
  if (memberLimit != null) return memberLimit;

  // 2. Check membership-type default
  const settings = await this.billingCycleSettingsService.getSettings(clubId);
  const member = await this.prisma.member.findUnique({
    where: { id: memberId },
    select: { membershipTypeId: true },
  });
  const typeDefaults = settings.creditLimitByMembershipType as Record<string, number> | null;
  if (typeDefaults && member?.membershipTypeId && typeDefaults[member.membershipTypeId] != null) {
    return typeDefaults[member.membershipTypeId];
  }

  // 3. Fall back to club default
  return settings.defaultCreditLimit ? Number(settings.defaultCreditLimit) : null;
}
```

**Changes:**
- Inject `BillingCycleSettingsService`
- Add 3-tier fallback: member > type > club default
- Expose `getEffectiveCreditLimit()` for use by allocation and POS

### 1E. Proration Method From Settings

**File:** Any service that calls `proration.util.ts`

**Current:** Caller must pass `method` explicitly
**After:** Service layer auto-fetches `settings.prorationMethod`

```typescript
// In the service that creates prorated invoices:
const settings = await this.billingCycleSettingsService.getSettings(clubId);
const proratedAmount = calculateProration({
  method: settings.prorationMethod ?? ProrationMethod.DAILY,
  ...otherConfig,
});
```

**Changes:**
- Wherever `calculateProration()` is called, fetch settings and pass `method`
- Remove need for caller to know the proration method

---

## Phase 2 — Enforcement Logic

New service methods that use Phase 1 wiring. Each method is callable both manually (via GraphQL mutation) and automatically (via Phase 3 cron).

### 2A. Late Fee Application

**File:** `apps/api/src/modules/billing/billing.service.ts`
**New method:** `applyLateFees(clubId: string): Promise<LateFeeResult>`

```typescript
async applyLateFees(clubId: string): Promise<{ applied: number; skipped: number; total: Decimal }> {
  const settings = await this.billingCycleSettingsService.getSettings(clubId);

  if (!settings.autoApplyLateFee) {
    return { applied: 0, skipped: 0, total: new Decimal(0) };
  }

  const graceCutoff = subDays(new Date(), settings.gracePeriodDays ?? 15);

  // Find overdue invoices that haven't had a late fee applied yet
  const overdueInvoices = await this.prisma.invoice.findMany({
    where: {
      clubId,
      status: 'UNPAID',
      dueDate: { lt: graceCutoff },
      lateFeeApplied: false, // needs new column or check
    },
    include: { member: true },
  });

  let applied = 0;
  let totalFees = new Decimal(0);

  for (const invoice of overdueInvoices) {
    // Skip exempt members
    if (invoice.member?.customLateFeeExempt) continue;

    const fee = calculateLateFee({
      type: settings.lateFeeType,
      amount: Number(settings.lateFeeAmount ?? 0),
      percentage: Number(settings.lateFeePercentage ?? 1.5),
      maxFee: settings.maxLateFee ? Number(settings.maxLateFee) : undefined,
      gracePeriodDays: settings.gracePeriodDays ?? 15,
      invoiceAmount: Number(invoice.totalAmount),
      daysOverdue: differenceInDays(new Date(), invoice.dueDate),
    });

    if (fee > 0) {
      // Create late fee record on the invoice
      await this.createLateFeeAdjustment(invoice.id, fee);
      applied++;
      totalFees = totalFees.add(fee);
    }
  }

  return { applied, skipped: overdueInvoices.length - applied, total: totalFees };
}
```

**GraphQL mutation:** `applyLateFees: LateFeeResult` (admin-only, guarded)

### 2B. Auto-Suspension Check

**File:** `apps/api/src/modules/members/members.service.ts` (or new `suspension.service.ts`)
**New method:** `checkAutoSuspension(clubId: string): Promise<SuspensionResult>`

```typescript
async checkAutoSuspension(clubId: string): Promise<{ suspended: number; members: string[] }> {
  const settings = await this.billingCycleSettingsService.getSettings(clubId);

  if (!settings.autoSuspendEnabled) {
    return { suspended: 0, members: [] };
  }

  const suspendCutoff = subDays(new Date(), settings.autoSuspendDays ?? 91);

  // Members with any invoice overdue past the threshold who are not already suspended
  const membersToSuspend = await this.prisma.member.findMany({
    where: {
      clubId,
      status: { not: 'SUSPENDED' },
      invoices: {
        some: {
          status: 'UNPAID',
          dueDate: { lt: suspendCutoff },
        },
      },
    },
    select: { id: true, memberNumber: true },
  });

  const suspendedIds: string[] = [];

  for (const member of membersToSuspend) {
    await this.prisma.member.update({
      where: { id: member.id },
      data: {
        status: 'SUSPENDED',
        suspendedAt: new Date(),
        suspensionReason: 'AUTO_OVERDUE',
      },
    });
    suspendedIds.push(member.memberNumber);
  }

  // Also check credit-exceeded if enabled
  if (settings.autoSuspendOnCreditExceeded) {
    // Query members exceeding creditBlockThreshold
    // ... similar pattern
  }

  return { suspended: suspendedIds.length, members: suspendedIds };
}
```

**GraphQL mutation:** `runAutoSuspensionCheck: SuspensionResult` (admin-only)

### 2C. Credit Alert Check

**File:** New `apps/api/src/modules/billing/credit-alert.service.ts`
**New method:** `checkCreditAlerts(clubId: string): Promise<AlertResult>`

```typescript
async checkCreditAlerts(clubId: string): Promise<{ alerts: number; blocks: number }> {
  const settings = await this.billingCycleSettingsService.getSettings(clubId);
  const alertThreshold = (settings.creditAlertThreshold ?? 80) / 100;
  const blockThreshold = (settings.creditBlockThreshold ?? 100) / 100;

  // Get all active members with their effective credit limits
  const members = await this.getActiveMembersWithBalances(clubId);

  let alerts = 0;
  let blocks = 0;

  for (const member of members) {
    const limit = await this.creditLimitsService.getEffectiveCreditLimit(member.id, clubId);
    if (!limit) continue; // No limit = unlimited

    const usage = member.outstandingBalance / limit;

    if (usage >= blockThreshold) {
      await this.flagMember(member.id, 'CREDIT_BLOCKED');
      blocks++;
    } else if (usage >= alertThreshold) {
      if (settings.sendCreditAlertToMember) {
        await this.notifyMember(member.id, usage, limit);
      }
      if (settings.sendCreditAlertToStaff) {
        await this.notifyStaff(clubId, member.id, usage, limit);
      }
      alerts++;
    }
  }

  return { alerts, blocks };
}
```

**GraphQL mutation:** `runCreditAlertCheck: AlertResult` (admin-only)

### 2D. Manual Trigger Resolver

**File:** New `apps/api/src/graphql/billing/billing-operations.resolver.ts`

```typescript
@Resolver()
@UseGuards(GqlAuthGuard)
export class BillingOperationsResolver {
  @Mutation(() => LateFeeResultType)
  async applyLateFees(@GqlCurrentUser() user: AuthUser) {
    return this.billingService.applyLateFees(user.tenantId);
  }

  @Mutation(() => SuspensionResultType)
  async runAutoSuspensionCheck(@GqlCurrentUser() user: AuthUser) {
    return this.membersService.checkAutoSuspension(user.tenantId);
  }

  @Mutation(() => AlertResultType)
  async runCreditAlertCheck(@GqlCurrentUser() user: AuthUser) {
    return this.creditAlertService.checkCreditAlerts(user.tenantId);
  }
}
```

---

## Phase 3 — Scheduled Automation

### 3A. Scheduler Module Setup

**New files:**
- `apps/api/src/modules/scheduler/scheduler.module.ts`
- `apps/api/src/modules/scheduler/billing-scheduler.service.ts`

```typescript
// scheduler.module.ts
@Module({
  imports: [ScheduleModule.forRoot(), BillingModule, MembersModule],
  providers: [BillingSchedulerService],
})
export class SchedulerModule {}
```

**Change:** `apps/api/src/app.module.ts` — add `SchedulerModule` to imports

### 3B-3E. Cron Jobs

**File:** `billing-scheduler.service.ts`

```typescript
@Injectable()
export class BillingSchedulerService {
  private readonly logger = new Logger(BillingSchedulerService.name);

  constructor(
    private billingService: BillingService,
    private membersService: MembersService,
    private creditAlertService: CreditAlertService,
    private billingCycleSettingsService: BillingCycleSettingsService,
    private prisma: PrismaService,
  ) {}

  // 3B: Auto-generate invoices — daily at 2:00 AM
  @Cron('0 2 * * *')
  async handleInvoiceGeneration() {
    const clubs = await this.prisma.club.findMany({ select: { id: true } });
    for (const club of clubs) {
      try {
        const settings = await this.billingCycleSettingsService.getSettings(club.id);
        const today = new Date().getDate();
        const generateDay = settings.invoiceAutoGenerationDay ?? 1;
        const lead = settings.invoiceGenerationLead ?? 5;

        // Check if today is the right day to generate (accounting for lead time)
        if (this.shouldGenerateToday(today, generateDay, lead)) {
          this.logger.log(`Generating invoices for club ${club.id}`);
          await this.billingService.generateMonthlyInvoices(club.id);
        }
      } catch (error) {
        this.logger.error(`Invoice generation failed for club ${club.id}`, error.stack);
      }
    }
  }

  // 3C: Auto-apply late fees — daily at 3:00 AM
  @Cron('0 3 * * *')
  async handleLateFees() {
    const clubs = await this.prisma.club.findMany({ select: { id: true } });
    for (const club of clubs) {
      try {
        const result = await this.billingService.applyLateFees(club.id);
        if (result.applied > 0) {
          this.logger.log(`Applied ${result.applied} late fees for club ${club.id}`);
        }
      } catch (error) {
        this.logger.error(`Late fee application failed for club ${club.id}`, error.stack);
      }
    }
  }

  // 3D: Auto-suspension check — daily at 4:00 AM
  @Cron('0 4 * * *')
  async handleAutoSuspension() {
    const clubs = await this.prisma.club.findMany({ select: { id: true } });
    for (const club of clubs) {
      try {
        const result = await this.membersService.checkAutoSuspension(club.id);
        if (result.suspended > 0) {
          this.logger.warn(`Auto-suspended ${result.suspended} members for club ${club.id}`);
        }
      } catch (error) {
        this.logger.error(`Auto-suspension failed for club ${club.id}`, error.stack);
      }
    }
  }

  // 3E: Credit alert check — daily at 5:00 AM
  @Cron('0 5 * * *')
  async handleCreditAlerts() {
    const clubs = await this.prisma.club.findMany({ select: { id: true } });
    for (const club of clubs) {
      try {
        const result = await this.creditAlertService.checkCreditAlerts(club.id);
        if (result.alerts > 0 || result.blocks > 0) {
          this.logger.log(`Credit alerts: ${result.alerts} warnings, ${result.blocks} blocks for club ${club.id}`);
        }
      } catch (error) {
        this.logger.error(`Credit alert check failed for club ${club.id}`, error.stack);
      }
    }
  }

  // 3F: Idempotency helper
  private shouldGenerateToday(today: number, generateDay: number, lead: number): boolean {
    const effectiveDay = generateDay - lead;
    if (effectiveDay <= 0) {
      // Wraps to previous month — simplified: just check the adjusted day
      return today === (effectiveDay + 28); // approximate
    }
    return today === effectiveDay;
  }
}
```

### 3F. Safety & Idempotency

Each job must be safe to run multiple times:

- **Late fees:** Track `lateFeeApplied` flag on invoices — skip if already applied
- **Suspension:** Skip members already in `SUSPENDED` status
- **Credit alerts:** Deduplicate by checking if alert was sent within last 24h
- **Invoice generation:** Check if invoices for the period already exist before creating

---

## Build Sequence

| Order | Task | Dependencies | Test |
|-------|------|-------------|------|
| 1 | 1A+1B: Invoice numbering + due date | None | Create invoice, verify prefix and due date from settings |
| 2 | 1C: VAT from settings | None | Change VAT rate in settings, verify POS/invoice pages update |
| 3 | 1D: Credit limit defaults | None | Remove member override, verify club default applies |
| 4 | 1E: Proration method | None | Change proration method, verify calculation changes |
| 5 | 2A: Late fee application | 1A+1B done | Call mutation, verify fees created on overdue invoices |
| 6 | 2B: Auto-suspension | None | Call mutation, verify members suspended |
| 7 | 2C: Credit alerts | 1D done | Call mutation, verify alerts/blocks |
| 8 | 2D: Manual trigger resolver | 2A+2B+2C done | Call mutations from GraphQL playground |
| 9 | 3A-3F: Scheduler module | 2A+2B+2C done | Temporarily set cron to every minute, verify execution |

## Files Changed Summary

**Modified (existing):**
- `apps/api/src/modules/billing/billing.service.ts` — 1A, 1B, 2A
- `apps/api/src/modules/billing/credit-limits.service.ts` — 1D
- `apps/api/src/modules/members/members.service.ts` — 2B
- `apps/api/src/app.module.ts` — 3A (import scheduler)
- `apps/application/src/app/(dashboard)/pos/sales/page.tsx` — 1C
- `apps/application/src/app/(dashboard)/billing/invoices/[id]/page.tsx` — 1C

**New files:**
- `apps/api/src/modules/billing/credit-alert.service.ts` — 2C
- `apps/api/src/graphql/billing/billing-operations.resolver.ts` — 2D
- `apps/api/src/graphql/billing/billing-operations.types.ts` — 2D (result types)
- `apps/api/src/modules/scheduler/scheduler.module.ts` — 3A
- `apps/api/src/modules/scheduler/billing-scheduler.service.ts` — 3B-3F

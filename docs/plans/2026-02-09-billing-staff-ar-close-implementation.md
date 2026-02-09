# Billing Staff — AR Close Checklist & Cycle Mode Implementation

## Parent Design
`docs/plans/2026-02-09-ar-period-close-redesign.md`

## Scope
Staff-facing billing features: AR Close Checklist UI, billing cycle mode support, statement register updates, aging dashboard, permissions, period re-open workflow.

## Prerequisites
- AR period close redesign plan approved
- Current statement register component (`statement-register.tsx`) in place
- AR Statements page (`/billing/statements`) functional with period/run management
- Existing hooks: `useStatementPeriods`, `useStatementRunsByPeriod`, `useStatementsByRun`, `useARPeriodSettings`

## Current State

### What Exists
- **Statement Register** (`statement-register.tsx`): Period dropdown, summary cards, flat table of statements — assumes uniform period dates
- **AR Statements page** (`/billing/statements/page.tsx`): Period management, run workflows (PREVIEW/FINAL), init wizard
- **Run detail page** (`/billing/statements/runs/[runId]/page.tsx`): Statement table with `getMemberInfo()` from profileSnapshot, delivery status icons
- **Period settings**: `useARPeriodSettings` hook with `arCycleType`, `arCustomCycleStartDay`, `arCutoffDays`, `arCloseBehavior`, `arAutoGenerateNext`
- **Aging dashboard tab** (`aging-dashboard-tab.tsx`): Bucket cards, member aging list
- **Period status badges**, **run status badges**: Existing UI components

### What's Missing
- Close checklist UI (entire feature)
- Billing cycle mode switch and mode-aware period creation
- Per-member date range column in statement register / run detail
- Permissions for checklist sign-off, period close, period re-open
- Period re-open approval workflow
- Statement number format for Member Cycle mode
- FIFO settlement verification UI

---

## Implementation Tasks

### Task 1: Database Schema — Close Checklist Models

**Files:**
- `database/prisma/schema.prisma`

**Changes:**
Add new models:

```prisma
model CloseChecklist {
  id            String   @id @default(uuid())
  clubId        String
  periodId      String   @unique
  status        CloseChecklistStatus @default(NOT_STARTED)
  startedAt     DateTime?
  completedAt   DateTime?
  completedById String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  club          Club             @relation(fields: [clubId], references: [id])
  period        StatementPeriod  @relation(fields: [periodId], references: [id])
  completedBy   User?            @relation(fields: [completedById], references: [id])
  steps         CloseChecklistStep[]
}

model CloseChecklistStep {
  id                String   @id @default(uuid())
  checklistId       String
  stepKey           String   // e.g. "pre_close.review_invoices"
  phase             CloseChecklistPhase
  label             String
  description       String?
  enforcement       StepEnforcement @default(REQUIRED)
  verification      StepVerification @default(MANUAL)
  status            StepStatus @default(PENDING)
  autoCheckResult   Json?
  signedOffById     String?
  signedOffAt       DateTime?
  notes             String?
  sortOrder         Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  checklist         CloseChecklist @relation(fields: [checklistId], references: [id])
  signedOffBy       User?          @relation(fields: [signedOffById], references: [id])

  @@unique([checklistId, stepKey])
}

enum CloseChecklistStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}

enum CloseChecklistPhase {
  PRE_CLOSE
  CUT_OFF
  RECEIVABLES
  TAX
  RECONCILIATION
  REPORTING
  CLOSE
  STATEMENTS
}

enum StepEnforcement {
  REQUIRED
  OPTIONAL
}

enum StepVerification {
  AUTO
  MANUAL
  SYSTEM_ACTION
}

enum StepStatus {
  PENDING
  PASSED
  FAILED
  SKIPPED
  SIGNED_OFF
}
```

Add to `ClubBillingSettings` (or `ARSettings`):
```prisma
  billingCycleMode        BillingCycleMode @default(CLUB_CYCLE)
  clubCycleClosingDay     Int              @default(28) // 1-28
  financialPeriodType     FinancialPeriodType @default(CALENDAR_MONTH)

enum BillingCycleMode {
  CLUB_CYCLE
  MEMBER_CYCLE
}

enum FinancialPeriodType {
  CALENDAR_MONTH
  CUSTOM
}
```

**Verification:** `npx prisma validate`

---

### Task 2: Backend — Close Checklist Service & Resolver

**Files:**
- NEW: `apps/api/src/graphql/ar-statements/close-checklist.service.ts`
- NEW: `apps/api/src/graphql/ar-statements/close-checklist.types.ts`
- NEW: `apps/api/src/graphql/ar-statements/close-checklist.input.ts`
- MODIFY: `apps/api/src/graphql/ar-statements/ar-statements.resolver.ts`
- MODIFY: `apps/api/src/graphql/ar-statements/ar-statements.module.ts`

**Service methods:**
- `createChecklistForPeriod(periodId)` — creates checklist with default steps based on club's configured step enforcement and jurisdiction
- `getChecklistByPeriod(periodId)` — returns checklist with all steps
- `signOffStep(stepId, userId, notes?)` — manual sign-off for a step
- `runAutoVerification(stepId)` — runs auto-check for a step, stores result in `autoCheckResult`
- `skipStep(stepId)` — mark optional step as skipped
- `runAllAutoChecks(checklistId)` — batch auto-verify all auto steps
- `canClosePeriod(checklistId)` — returns boolean + list of blocking steps
- `getPhaseProgress(checklistId, phase)` — returns completed/total required counts

**GraphQL queries/mutations:**
```graphql
query getCloseChecklist($periodId: ID!) { ... }
mutation signOffChecklistStep($stepId: ID!, $notes: String) { ... }
mutation runAutoVerification($stepId: ID!) { ... }
mutation skipChecklistStep($stepId: ID!) { ... }
mutation runAllAutoChecks($checklistId: ID!) { ... }
```

**Auto-verification hooks** (Phase 3 — Receivables):
- `allPaymentsApplied` → check for orphan receipts with no allocation
- `batchSettlement` → verify zero unallocated receipt amounts (FIFO auto-apply)
- `creditBalancesPosted` → verify all remainders posted as member credits

**Auto-verification hooks** (Phase 4 — Tax):
- `taxInvoiceSequence` → query invoice numbers, check for gaps
- `taxRateApplied` → verify all line items have correct tax rate for jurisdiction

**Auto-verification hooks** (Phase 5 — Reconciliation):
- `arGlReconciled` → compare AR subsidiary ledger total vs GL control account
- `taxSequenceIntegrity` → duplicate of Phase 4 check with additional cross-reference

---

### Task 3: Backend — Billing Cycle Mode in Period Creation

**Files:**
- MODIFY: `apps/api/src/modules/billing/billing-cycle-settings.service.ts`
- MODIFY: `apps/api/src/graphql/ar-statements/statement-period.service.ts`

**Changes:**
- `createPeriodForCycleMode()`:
  - **Club Cycle**: Compute `periodStart`/`periodEnd` from `clubCycleClosingDay` setting (e.g., closing day 24 → period is 25th to 24th next month)
  - **Member Cycle**: Create a financial period (umbrella). `periodStart`/`periodEnd` represent the accounting period, not individual member cycles.
- `computeMemberStatementDates(arProfileId, periodId)`:
  - **Club Cycle**: Use period dates, except first statement uses `member.joinDate` as `periodStart`
  - **Member Cycle**: Compute from member's join date anniversary (e.g., joined 15th → 15th to 14th monthly)

---

### Task 4: Backend — Statement Generation Per-Member Dates

**Files:**
- MODIFY: `apps/api/src/graphql/ar-statements/statement-period.service.ts` (or wherever generation logic lives)

**Changes:**
1. Before generating statements, fetch `billingCycleMode` from settings
2. For each AR profile:
   - Call `computeMemberStatementDates(profileId, periodId)` to get per-member `periodStart`/`periodEnd`
   - Use per-member dates for: opening balance query, transaction inclusion, aging calculation
   - Store per-member dates on the `Statement` record (these may differ from the `StatementPeriod` dates)
3. Statement number format: Keep `STMT-YY-PP-NNNNNN` where `PP` = financial period number (same in both modes)

---

### Task 5: Frontend — Close Checklist Hooks

**Files:**
- MODIFY: `apps/application/src/hooks/use-ar-statements.ts`

**New hooks:**
```typescript
// Types
export interface CloseChecklist { id, periodId, status, startedAt, completedAt, steps }
export interface CloseChecklistStep { id, stepKey, phase, label, description, enforcement, verification, status, autoCheckResult, signedOffBy, signedOffAt, notes, sortOrder }

// Queries
export function useCloseChecklist(periodId: string)
export function useCanClosePeriod(checklistId: string)

// Mutations
export function useSignOffStep()
export function useRunAutoVerification()
export function useSkipStep()
export function useRunAllAutoChecks()
```

---

### Task 6: Frontend — Close Checklist Component

**Files:**
- NEW: `apps/application/src/components/billing/close-checklist.tsx`

**Component: `CloseChecklist`**

Props:
```typescript
interface CloseChecklistProps {
  periodId: string
  onPeriodClose?: () => void
}
```

**UI Structure:**
```
┌─ Checklist Header ─────────────────────────────────┐
│ AR Close Checklist — January 2026                   │
│ Status: IN_PROGRESS  │  Progress: 12/18 required    │
└─────────────────────────────────────────────────────┘

┌─ Phase 1: Pre-Closing ──────────── 3/4 required ─┐
│ [expand/collapse]                                   │
│  ✅ Review all member invoices      [Required]      │
│  ✅ Reconcile POS transactions      [Required]      │
│  ⬜ Follow up on disputed charges   [Optional] Skip │
│  ⬜ Send final reminders            [Optional] Skip │
└─────────────────────────────────────────────────────┘

┌─ Phase 2: Period-End Cut-Off ──── 1/3 required ──┐
│ [expand/collapse]                                   │
│  ✅ Set transaction cut-off time    [Required]      │
│  ⬜ Process final transactions      [Required] Sign │
│  🔒 Lock transaction posting        [Auto] ⏳       │
└─────────────────────────────────────────────────────┘
... (phases 3-8)

┌─ Actions ───────────────────────────────────────────┐
│ [Run All Auto-Checks]  [Close Period] (disabled)    │
└─────────────────────────────────────────────────────┘
```

**Step status rendering:**
| Status | Icon | Color |
|--------|------|-------|
| PENDING | `Circle` | stone |
| PASSED | `CheckCircle` | emerald |
| FAILED | `XCircle` | red (with detail popover) |
| SKIPPED | `MinusCircle` | stone |
| SIGNED_OFF | `CheckCircle` | emerald |

**Step actions:**
- Manual + PENDING → "Sign Off" button → opens notes input → calls `useSignOffStep`
- Auto + PENDING → "Verify" button → calls `useRunAutoVerification` → shows result
- Optional + PENDING → "Skip" button → calls `useSkipStep`
- FAILED → shows `autoCheckResult` details in popover/accordion

**Phase accordion:**
- Each phase is collapsible (default: first incomplete phase expanded)
- Phase header shows: name, progress indicator ("4/5 required steps"), timeline hint ("Days -3 to -1")
- Locked phases (not yet reachable) shown as disabled

---

### Task 7: Frontend — Integrate Checklist into AR Statements Page

**Files:**
- MODIFY: `apps/application/src/app/(dashboard)/billing/statements/page.tsx`

**Changes:**
- When a period is selected and has status OPEN or IN_PROGRESS:
  - Show `<CloseChecklist periodId={selectedPeriod.id} />` below the period card
- When checklist `canClosePeriod` returns true:
  - Enable "Close Period" button → calls `closeStatementPeriod` mutation
- After period is CLOSED:
  - Show statement generation actions (PREVIEW/FINAL runs) — Phase 8 of checklist
- Add checklist status indicator on period cards in the period list

---

### Task 8: Frontend — Statement Register Cycle Mode Updates

**Files:**
- MODIFY: `apps/application/src/components/billing/statement-register.tsx`

**Changes:**
1. Fetch `useARPeriodSettings()` to get `billingCycleMode`
2. Add "Statement Period" column to the table:
   - Shows per-statement `periodStart` — `periodEnd` dates
   - In Club Cycle: same for most members (except first partial statements)
   - In Member Cycle: varies per member — this column is essential
3. In Member Cycle mode:
   - Period dropdown label changes from "AR Period" to "Financial Period"
   - Default sort by member name (not period date)
4. Add Due Date column (already done from earlier work)

---

### Task 9: Frontend — Run Detail Page Cycle Mode Updates

**Files:**
- MODIFY: `apps/application/src/app/(dashboard)/billing/statements/runs/[runId]/page.tsx`

**Changes:**
1. Add per-member "Statement Period" column showing `statement.periodStart` — `statement.periodEnd`
2. In Member Cycle mode: header shows financial period label, table shows per-member dates
3. Sort by member name in Member Cycle mode

---

### Task 10: Frontend — Aging Dashboard Cycle Mode Updates

**Files:**
- MODIFY: `apps/application/src/components/billing/aging-dashboard-tab.tsx`

**Changes:**
1. Fetch `billingCycleMode` from settings
2. In Member Cycle mode:
   - Aging is calculated from per-member invoice due dates (already the case — aging is invoice-date-based, not period-based)
   - Add note: "Aging is based on individual invoice due dates, not member cycle dates"
3. No structural changes needed — aging buckets are already invoice-driven

---

### Task 11: Backend — Permissions for Close Workflow

**Files:**
- MODIFY: Permission configuration (wherever permissions are defined in the API)

**New permissions:**
| Permission | Description |
|------------|-------------|
| `SIGN_OFF_CHECKLIST` | Can manually sign off checklist steps |
| `CLOSE_PERIOD` | Can complete the AR close checklist and close a period |
| `REOPEN_PERIOD` | Can initiate period re-open (requires approval) |
| `APPROVE_REOPEN` | Can approve another user's re-open request |

**Enforcement:**
- `signOffStep` mutation requires `SIGN_OFF_CHECKLIST`
- `closePeriod` mutation requires `CLOSE_PERIOD`
- `reopenPeriod` mutation requires `REOPEN_PERIOD` + a second user with `APPROVE_REOPEN` must confirm

---

### Task 12: Backend & Frontend — Period Re-Open Workflow

**Files:**
- MODIFY: `apps/api/src/graphql/ar-statements/statement-period.service.ts`
- NEW: `apps/application/src/components/billing/reopen-period-modal.tsx`

**Backend:**
- `requestPeriodReopen(periodId, reason, requestedById)` — creates a reopen request
- `approvePeriodReopen(requestId, approvedById)` — different user approves → period status reverts to OPEN, checklist resets affected steps
- Reopening a period does NOT delete delivered statements — it unlocks the period for additional transactions

**Frontend:**
- "Reopen Period" button on closed period card (requires `REOPEN_PERIOD` permission)
- Modal: reason text field, submit creates request
- Approval: notification to users with `APPROVE_REOPEN` permission → approve/deny action
- After approval: period status changes, checklist resets

---

### Task 13: Frontend — Billing Cycle Mode Settings UI

**Files:**
- MODIFY: `apps/application/src/components/settings/ar-period-section.tsx`

**Changes:**
Add cycle mode configuration:
- Radio toggle: "Club Cycle" / "Member Cycle"
- Club Cycle: show `clubCycleClosingDay` selector (1-28)
- Member Cycle: show `financialPeriodType` selector (Calendar Month / Custom)
- Save calls `useUpdateARPeriodSettings`
- Warning: "Changing billing cycle mode affects all future periods. Existing periods and statements are not affected."

---

## Verification Checklist

- [ ] Prisma schema validates and migrates
- [ ] Close checklist creates with correct default steps per club jurisdiction
- [ ] Auto-verification steps check FIFO settlement, tax sequence, AR/GL reconciliation
- [ ] Manual steps accept sign-off with notes
- [ ] Phase gating prevents skipping ahead
- [ ] Period close blocked until all required steps green
- [ ] Statement register shows per-member date ranges
- [ ] Run detail shows per-member date ranges
- [ ] Period dropdown shows financial period label in Member Cycle mode
- [ ] Settings UI allows cycle mode switch
- [ ] Reopen workflow requires two-user approval
- [ ] Permissions enforced on all checklist/close mutations

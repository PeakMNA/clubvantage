# AR Period Settings - Design Document

**Date:** 2026-02-04
**Status:** Approved
**Author:** Brainstorming session

## Overview

Redesign AR statement periods from ad-hoc creation to a system-wide configuration. Periods are defined once in settings and automatically managed, with full aging visibility throughout.

## Current State

- Periods created manually via modal (Calendar Month, Custom Range, Catch-Up modes)
- Each period is standalone, no automatic progression
- Aging data exists but not prominently displayed
- No system-wide period configuration

## Goals

1. Configure billing cycle once, periods auto-manage
2. Single open period at any time, auto-generates next on close
3. Full aging visibility (dashboard, period summary, individual statements)
4. Clean migration path for clubs with existing aging data

---

## AR Period Settings

### Configuration Fields

| Field | Type | Options | Default |
|-------|------|---------|---------|
| `cycleType` | enum | `CALENDAR_MONTH`, `ROLLING_30`, `CUSTOM` | `CALENDAR_MONTH` |
| `customCycleStartDay` | int | 1-28 (only for CUSTOM) | 1 |
| `cutoffDays` | int | Days after period end | 5 |
| `closeBehavior` | enum | `MANUAL`, `AUTO_AFTER_FINAL_RUN`, `AUTO_ON_CUTOFF` | `MANUAL` |
| `autoGenerateNext` | boolean | Create next period on close | true |

### Location

- **Primary:** Club Settings > Billing section
- **Secondary:** Read-only summary panel on AR Statements page with "Edit in Settings" link

### Period Lifecycle

```
OPEN → CLOSED
  │
  └─→ (if autoGenerateNext) → New period OPEN
```

**Constraint:** Only one period can be `OPEN` at a time (enforced by system).

---

## AR Statements Page UI

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  AR Statements                              [Settings Panel ▼]  │
├─────────────────────────────────────────────────────────────────┤
│  AGING DASHBOARD                                                │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐           │
│  │ Current │  1-30   │  31-60  │  61-90  │   90+   │           │
│  │ ฿450K   │  ฿125K  │  ฿78K   │  ฿45K   │  ฿32K   │           │
│  │ 12 acct │  8 acct │  5 acct │  3 acct │  2 acct │           │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘           │
├─────────────────────────────────────────────────────────────────┤
│  CURRENT PERIOD                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ February 2026                              [OPEN]        │   │
│  │ Feb 1 - Feb 28, 2026 | Cutoff: Mar 5                    │   │
│  │                                                          │   │
│  │ Aging: Current ฿X | 30d ฿X | 60d ฿X | 90d ฿X | 90+ ฿X  │   │
│  │                                                          │   │
│  │ [Run Preview]  [Run Final]  [Close Period]              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Statement Runs (for this period)                              │
│  └─ Run #1 PREVIEW - 14 statements - View                      │
├─────────────────────────────────────────────────────────────────┤
│  PERIOD HISTORY ▼                                               │
│  └─ January 2026 [CLOSED] - 14 statements - ฿730K             │
│  └─ December 2025 [CLOSED] - 14 statements - ฿680K            │
└─────────────────────────────────────────────────────────────────┘
```

### Settings Panel (Collapsible)

Shows current configuration:
- Cycle: Monthly (1st - End of month)
- Cutoff: 5 days after period end
- Close: Manual
- Auto-generate: Yes

Link: "Edit in Settings →"

### Removed Elements

- "New Period" button
- Mode toggle (Calendar/Custom/Catch-up)
- CreatePeriodModal component (replaced by settings)

---

## Initial Setup & Migration

### First-Time Experience

When visiting AR Statements with no settings configured:

1. **Prompt displayed:**
   - "AR Period Settings not configured"
   - "Configure your billing cycle to start generating statements"
   - Button: "Configure AR Settings"

2. **After settings saved:**
   - Return to Statements page
   - Prompt: "Initialize your first period"
   - Options:
     - **Start Fresh** - Create current period only
     - **Import Historical Aging** - Open migration wizard

### Aging Import Wizard

For clubs migrating with existing outstanding balances:

| Step | Screen | Action |
|------|--------|--------|
| 1 | Upload | Upload CSV or enter aging per AR profile |
| 2 | Review | System shows historical periods to create |
| 3 | Confirm | Creates periods: 120+, 90, 60, 30 days |
| 4 | Complete | Historical periods closed, current period opened |

**CSV Format:**
```csv
account_number,current,aging_30,aging_60,aging_90,aging_120_plus
M000001,5000,2000,1000,500,0
M000002,3000,0,0,0,0
```

---

## Aging Display

### Dashboard Cards (Top of Page)

Five cards showing total AR by aging bucket:
- **Current** - Not yet due
- **1-30 Days** - 1-30 days overdue
- **31-60 Days** - 31-60 days overdue
- **61-90 Days** - 61-90 days overdue
- **90+ Days** - Over 90 days overdue

Each card shows:
- Total amount
- Number of accounts
- Optional: Trend indicator vs previous period

### Period Summary

Each period displays aging totals:
- At time of close (snapshot stored)
- Comparison to previous period

### Individual Statement Modal

Already implemented - shows member's personal aging breakdown with color coding.

### Statement Run Results

Run summary includes:
- Aging totals for generated statements
- Flag accounts with aging > 90 days

---

## Database Changes

### Modify `club_billing_settings` Table

Add columns:
```sql
ar_cycle_type VARCHAR(20) DEFAULT 'CALENDAR_MONTH',
ar_custom_cycle_start_day INT DEFAULT 1,
ar_cutoff_days INT DEFAULT 5,
ar_close_behavior VARCHAR(30) DEFAULT 'MANUAL',
ar_auto_generate_next BOOLEAN DEFAULT true
```

### Modify `statement_periods` Table

Add aging snapshot columns:
```sql
aging_current DECIMAL(12,2),
aging_1_to_30 DECIMAL(12,2),
aging_31_to_60 DECIMAL(12,2),
aging_61_to_90 DECIMAL(12,2),
aging_90_plus DECIMAL(12,2)
```

---

## Backend Changes

### Period Auto-Generation

When period closes (in `closeStatementPeriod` mutation):
1. If `autoGenerateNext` is true
2. Calculate next period dates based on `cycleType`
3. Create new period with status `OPEN`
4. Store aging snapshot on closed period

### Single Open Period Enforcement

- On period creation: Check no other `OPEN` period exists
- On period status change: Validate constraints

### Aging Calculation

New service method: `calculateAgingTotals(clubId)`
- Queries all AR profiles
- Calculates aging based on invoice due dates
- Returns totals by bucket

---

## Frontend Changes

| Component | Change |
|-----------|--------|
| `Club Settings > Billing` | Add AR Period Settings section |
| `AR Statements page` | New layout with dashboard, settings panel |
| `CreatePeriodModal` | Remove (replaced by auto-generation) |
| `EditPeriodModal` | Keep for editing period label/dates |
| Statement detail modal | Already has aging |
| New: `ARSettingsPanel` | Collapsible settings summary |
| New: `AgingDashboard` | Five-card aging display |
| New: `PeriodInitWizard` | First-time setup flow |
| New: `AgingImportWizard` | CSV import for migration |

---

## Migration Path

For existing clubs with periods:

1. Settings default to: `CALENDAR_MONTH`, `MANUAL`, 5 days, auto-generate ON
2. Existing periods remain unchanged
3. System adopts existing open period
4. Next close will auto-generate per new settings

---

## Implementation Order

1. Database migrations (settings fields, aging snapshot)
2. Backend: Settings API, aging calculation, auto-generation
3. Frontend: Settings UI in Club Settings
4. Frontend: New Statements page layout
5. Frontend: Initialization wizard
6. Testing & migration validation

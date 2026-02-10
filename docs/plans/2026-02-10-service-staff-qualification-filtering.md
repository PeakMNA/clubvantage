# Service–Staff Qualification Filtering

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add bidirectional qualification filtering between services and staff in the booking flow, controlled by a per-service `enforceQualification` toggle.

**Architecture:** Each service gains an `enforceQualification` boolean. When ON, only staff whose capabilities include ALL of the service's `requiredCapabilities` can be matched. When OFF, any staff can perform the service. Filtering is applied in both directions: Service→Staff (client-side) and Staff→Service (server-side in `getServicesForStaff`).

**Tech Stack:** Prisma migration, NestJS GraphQL resolver, Next.js React components, server actions.

---

## Data Model

**Service model** (existing `requiredCapabilities: String[]` + new field):

```prisma
enforceQualification  Boolean  @default(false)
```

**Matching logic** (AND — staff must have ALL required capabilities):

```typescript
function isQualified(
  staffCapabilities: string[],
  requiredCapabilities: string[]
): boolean {
  return requiredCapabilities.every(req =>
    staffCapabilities.includes(req)
  );
}
```

Edge case: `enforceQualification = true` but `requiredCapabilities = []` → every staff qualifies.

---

## Flows

### Service Tab (service/page.tsx)

1. User picks a service from POS panel
2. If `service.enforceQualification === false` → show all staff in StaffSchedule
3. If `service.enforceQualification === true` → filter staff client-side using `isQualified()`, pass only qualified staff to StaffSchedule
4. If zero staff qualify → show inline warning: "No qualified staff available for this service"

### Staff Tab (staff/page.tsx)

1. User clicks available slot on a staff timeline
2. `getServicesForStaff(staffId)` server action returns filtered services:
   - All services where `enforceQualification = false`
   - Plus services where `enforceQualification = true` AND staff has all `requiredCapabilities`
3. Dialog displays filtered list
4. If empty → "No services available for this staff member"

---

## Tasks

### Task 1: Add `enforceQualification` to Prisma schema

**Files:**
- Modify: `database/prisma/schema.prisma` (Service model, ~line 1178)

**Step 1: Add field to schema**

Add after the `isActive` field in the Service model:

```prisma
enforceQualification  Boolean  @default(false)
```

**Step 2: Run migration**

```bash
cd database && npx prisma migrate dev --name add_service_enforce_qualification
```

Expected: Migration created, no data loss (additive column with default).

**Step 3: Regenerate Prisma client**

```bash
npx prisma generate
```

**Step 4: Commit**

```bash
git add database/prisma/schema.prisma database/prisma/migrations/
git commit -m "feat(db): add enforceQualification to Service model"
```

---

### Task 2: Expose `enforceQualification` in GraphQL

**Files:**
- Modify: `apps/api/src/modules/booking/entities/service.entity.ts`
- Modify: `apps/api/src/modules/booking/dto/create-service.input.ts`
- Modify: `apps/api/src/modules/booking/dto/update-service.input.ts`

**Step 1: Add field to Service entity**

```typescript
@Field(() => Boolean)
enforceQualification: boolean;
```

**Step 2: Add to CreateServiceInput**

```typescript
@Field(() => Boolean, { nullable: true })
@IsOptional()
@IsBoolean()
enforceQualification?: boolean;
```

**Step 3: Add to UpdateServiceInput**

Same as CreateServiceInput.

**Step 4: Regenerate schema and codegen**

```bash
cd apps/api && pnpm run dev  # start briefly to regen schema.gql, then Ctrl+C
pnpm --filter @clubvantage/api-client run codegen
```

**Step 5: Verify**

```bash
cd apps/api && pnpm exec tsc --noEmit
```

**Step 6: Commit**

```bash
git add apps/api/src/modules/booking/ packages/api-client/
git commit -m "feat(api): expose enforceQualification in GraphQL Service type"
```

---

### Task 3: Create shared `isQualified` utility

**Files:**
- Create: `packages/utils/src/booking/is-qualified.ts`
- Modify: `packages/utils/src/index.ts` (add export)

**Step 1: Create the utility**

```typescript
/**
 * Check if a staff member is qualified to perform a service.
 * Staff must have ALL of the service's required capabilities (AND logic).
 * Returns true if service has no required capabilities.
 */
export function isStaffQualified(
  staffCapabilities: string[],
  requiredCapabilities: string[]
): boolean {
  if (requiredCapabilities.length === 0) return true;
  return requiredCapabilities.every((req) =>
    staffCapabilities.includes(req)
  );
}
```

**Step 2: Export from package**

Add to `packages/utils/src/index.ts`:

```typescript
export { isStaffQualified } from './booking/is-qualified';
```

**Step 3: Commit**

```bash
git add packages/utils/
git commit -m "feat(utils): add isStaffQualified capability matcher"
```

---

### Task 4: Update `getServicesForStaff` server action (Staff Tab filtering)

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/staff/actions.ts` (or wherever the server action lives)

**Step 1: Find the server action**

Search for `getServicesForStaff` in `apps/application/src/`.

**Step 2: Update query to filter by qualification**

The server action should:
1. Fetch the staff member's capabilities
2. Fetch all active services
3. Filter: include service if `enforceQualification === false` OR `isStaffQualified(staffCaps, service.requiredCapabilities)`
4. Return filtered list

```typescript
const staff = await prisma.staff.findUnique({
  where: { id: staffId },
  include: { capabilities: true },
});

const staffCaps = staff?.capabilities.map(c => c.capability) ?? [];

const services = await prisma.service.findMany({
  where: { clubId, isActive: true },
});

return services.filter(s =>
  !s.enforceQualification ||
  isStaffQualified(staffCaps, s.requiredCapabilities)
);
```

**Step 3: Verify the staff tab still works**

Navigate to `/bookings/staff`, click a slot, confirm the service picker Dialog shows filtered services.

**Step 4: Commit**

```bash
git add apps/application/src/
git commit -m "feat(bookings): filter services by staff qualification in staff tab"
```

---

### Task 5: Update Service Tab to filter staff by qualification

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/service/page.tsx`

**Step 1: Import the utility**

```typescript
import { isStaffQualified } from '@clubvantage/utils';
```

**Step 2: Filter staff when transitioning to StaffSchedule view**

In the `handleServiceSelect` callback, when transitioning from POS to staff-schedule view, store the selected service's `enforceQualification` and `requiredCapabilities`.

When rendering StaffSchedule, filter the staff list:

```typescript
const filteredStaff = useMemo(() => {
  if (!selectedService?.enforceQualification) return allStaff;
  return allStaff.filter(staff =>
    isStaffQualified(
      staff.capabilities.map(c => c.capability),
      selectedService.requiredCapabilities
    )
  );
}, [allStaff, selectedService]);
```

**Step 3: Add empty state for zero qualified staff**

If `filteredStaff.length === 0` and `selectedService.enforceQualification`, show:

```tsx
<BookingEmptyState
  variant="no-data"
  title="No qualified staff"
  description="No staff members are qualified to perform this service. Check staff capabilities in Settings."
/>
```

**Step 4: Verify**

Navigate to `/bookings/service`, pick a service with `enforceQualification = true` and `requiredCapabilities`, confirm only qualified staff appear.

**Step 5: Commit**

```bash
git add apps/application/src/app/(dashboard)/bookings/service/
git commit -m "feat(bookings): filter staff by qualification in service tab"
```

---

### Task 6: Add `enforceQualification` toggle to Manage Services form

**Files:**
- Modify: `apps/application/src/components/bookings/service-modal.tsx`

**Step 1: Add toggle field**

In the service form, add a switch/checkbox after the `requiredCapabilities` field:

```tsx
<div className="flex items-center justify-between">
  <div>
    <Label>Enforce staff qualification</Label>
    <p className="text-sm text-stone-500">
      Only qualified staff can be booked for this service
    </p>
  </div>
  <Switch
    checked={form.enforceQualification}
    onCheckedChange={(checked) => setForm(prev => ({ ...prev, enforceQualification: checked }))}
  />
</div>
```

**Step 2: Include in form data and submit**

Add `enforceQualification: boolean` to `ServiceFormData` type and include it in the create/update mutation input.

**Step 3: Verify**

Open Manage Services → edit a service → toggle enforce qualification ON → save → confirm it persists.

**Step 4: Commit**

```bash
git add apps/application/src/components/bookings/service-modal.tsx
git commit -m "feat(bookings): add enforce qualification toggle to service modal"
```

---

### Task 7: TypeScript verification and cleanup

**Step 1: Run TypeScript check**

```bash
cd apps/application && npx tsc --noEmit 2>&1 | grep -E "bookings|facility|service|staff" | head -20
```

Expected: No new errors from our changes.

**Step 2: Run API TypeScript check**

```bash
cd apps/api && pnpm exec tsc --noEmit 2>&1 | head -20
```

**Step 3: Commit if any fixes needed**

```bash
git commit -m "fix: resolve TypeScript errors from qualification filtering"
```

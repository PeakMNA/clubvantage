# Staff-First Booking Flow Implementation Plan

## Overview
Add a third booking type where users select a trainer/therapist/pro first, then see services they can provide, optionally select a facility, and pick a time.

**New Flow:** `Type → Staff → Service → [Facility] → Time → Options → Confirm`

---

## Files to Modify

### 1. `apps/application/src/components/bookings/create-booking-wizard.tsx`

**Changes:**
- Extend `BookingType` to include `'staff'`
- Extend `WizardStep` to include `'staff'` and `'facility'`
- Add third BookingTypeCard for "Staff" with Users icon
- Make `StepIndicator` accept dynamic steps prop

```typescript
export type BookingType = 'facility' | 'service' | 'staff';
export type WizardStep = 'type' | 'staff' | 'select' | 'facility' | 'time' | 'options' | 'confirm';
```

### 2. `apps/application/src/components/bookings/booking-provider.tsx`

**Changes:**
- Extend `SelectedStaff` interface with capabilities:
  ```typescript
  interface SelectedStaff {
    id: string;
    name: string;
    photoUrl?: string;
    capabilities?: string[];      // NEW
    defaultFacilityId?: string;   // NEW
  }
  ```
- Create dynamic step order function based on booking type
- Update `goToNextStep`/`goToPreviousStep` to use dynamic steps

### 3. `apps/application/src/components/bookings/create-booking-modal.tsx`

**Changes:**
- Add conditional rendering for new steps:
  - `'staff'` step → render `BookingStaffStep`
  - `'facility'` step → render `BookingFacilityStep`
- Handle staff selection and capability-based service filtering
- Auto-select facility from staff's `defaultFacilityId` when applicable

---

## New Files to Create

### 4. `apps/application/src/components/bookings/booking-staff-step.tsx`

Staff selection step component:
- Search bar for filtering staff
- Role filter chips (All, Trainer, Therapist, Coach, Instructor)
- Staff cards showing: photo, name, role, capabilities as badges
- Status indicator (available/busy/off)
- Reuse patterns from existing `staff-tab.tsx`

### 5. `apps/application/src/components/bookings/booking-service-by-staff-step.tsx`

Service selection filtered by staff capabilities:
- Header showing "Services by [Staff Name]"
- Query services where `requiredCapabilities` match staff's `capabilities`
- Reuse ServiceCard pattern from `booking-picker-step.tsx`
- Filter logic:
  ```typescript
  const filteredServices = services.filter(service =>
    service.requiredCapabilities.every(cap =>
      selectedStaff.capabilities.includes(cap)
    )
  );
  ```

### 6. `apps/application/src/components/bookings/booking-facility-step.tsx`

Optional facility selection (only shown when needed):
- Query available facilities for the service type
- Show when: service requires facility AND staff has no default
- Skip when: staff has `defaultFacilityId` matching service type

---

## Step Navigation Logic

```typescript
function getStepOrder(bookingType: BookingType | null, needsFacility: boolean): WizardStep[] {
  if (bookingType === 'staff') {
    if (needsFacility) {
      return ['type', 'staff', 'select', 'facility', 'time', 'options', 'confirm'];
    }
    return ['type', 'staff', 'select', 'time', 'options', 'confirm'];
  }
  // Default facility/service flow
  return ['type', 'select', 'time', 'options', 'confirm'];
}
```

---

## Backend Changes (if needed)

### 7. `apps/api/src/graphql/bookings/bookings.input.ts`

May need to extend `ServiceFilterInput` to filter by capabilities:
```typescript
@Field(() => [String], { nullable: true })
capabilities?: string[];
```

### 8. `apps/api/src/graphql/bookings/bookings.resolver.ts`

Add service filtering by capabilities in the `services` query resolver.

---

## Implementation Order

1. **Types & State** - Update types in wizard and provider
2. **Type Selection UI** - Add Staff card to type selection
3. **Staff Step** - Create `booking-staff-step.tsx`
4. **Service Step** - Create `booking-service-by-staff-step.tsx`
5. **Facility Step** - Create `booking-facility-step.tsx`
6. **Modal Integration** - Wire up new steps in modal
7. **Step Indicator** - Make dynamic based on booking type
8. **Backend** - Add capability filtering if needed

---

## Verification

1. Run `pnpm dev:app` and navigate to Facility Booking page
2. Click "New Booking"
3. Select "Staff" booking type
4. Verify staff list appears with search/filter
5. Select a staff member
6. Verify only their capable services show
7. Complete booking flow
8. Verify booking is created with correct staff/service/facility

---

## Edge Cases

- Staff with no capabilities → show empty state
- No matching services → show "No services available" message
- Staff unavailable → disable selection with status badge
- Service needs facility but staff has no default → show facility step

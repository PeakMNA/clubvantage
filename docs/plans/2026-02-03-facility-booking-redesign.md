# Facility Booking Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Facility page with 4 context-aware booking tabs and unify the equipment system across Golf and Facility operations.

**Architecture:** Entry-point-driven booking flows where each tab (Facilities, Services, Classes, Staff) provides a different starting context, and a guided modal completes the remaining steps. Equipment is unified at the backend but scoped by operation type.

**Tech Stack:** Next.js, React, TanStack Query, Prisma, NestJS/GraphQL

---

## 1. Navigation & Tab Structure

### Facility Page (`/facility`) - 4 Tabs

| Tab | Entry Point | What User Sees | Booking Flow |
|-----|-------------|----------------|--------------|
| **Facilities** | Resource-first | Calendar grid of courts, rooms, pools | Facility → Service (optional) → Staff |
| **Services** | Service-first | List of services by category | Service → Available slots (facility+staff+time) |
| **Classes** | Class-first | Schedule of group classes with capacity | Class → Add member |
| **Staff** | Staff-first | Staff schedules/availability | Staff + Time → Service → Facility |

### Tab Bar
```
[ Facilities ]  [ Services ]  [ Classes ]  [ Staff ]
```

---

## 2. Facilities Tab

### Calendar View
- Day/Week toggle
- Resource columns (Tennis Court 1, Tennis Court 2, Yoga Studio, Pool Lane 1, etc.)
- Time rows (30-min or 1-hour intervals)
- Filter by facility type
- Click empty slot [+] to start booking

### Booking Flow (Facility-first)
1. **Facility + Time** - Pre-filled from clicked slot
2. **Add Service?** - Optional step, can skip for facility-only booking
3. **Select Staff** - If service selected, filtered to qualified + available staff
4. **Select Member** - Search/select member
5. **Confirm** - Review and create booking

---

## 3. Services Tab

### List View
- Services grouped by category (Spa & Wellness, Tennis, Fitness, etc.)
- Each service shows: name, duration, price, [Book] button
- Search and filter by category

### Booking Flow (Service-first)
1. **Service** - Pre-filled from clicked [Book] button
2. **Select Slot** - Shows combined availability cards:
   - Each card = valid combination of Time + Facility + Staff
   - No dead ends - every option is bookable
3. **Select Member** - Search/select member
4. **Confirm** - Review and create booking

### Slot Card Display
```
┌─────────┐
│  9:00   │
│ Spa 1   │
│ Somchai │
└─────────┘
```

---

## 4. Classes Tab

### Schedule View
- Day/Week/List toggle
- Filter by class type (Yoga, Fitness, Swimming, etc.)
- Each class card shows:
  - Class name and icon
  - Facility and instructor
  - Capacity bar (e.g., ████████░░ 8/10 spots)
  - [Add Member] or [Waitlist] button

### Capacity States
| State | Display | Action |
|-------|---------|--------|
| Available | `███░░░░░░░ 3/15 spots` | [Add Member] |
| Almost Full | `████████░░ 8/10 spots` | [Add Member] |
| Full | `██████████ 12/12 FULL` | [Waitlist] |

### Booking Flow (Class-first)
1. **Class** - Pre-filled (facility, time, instructor are fixed)
2. **Select Member** - Search/select member to add
3. **Confirm** - Add to class roster

---

## 5. Staff Tab

### Timeline View
- Each staff member has a row
- Shows their services/capabilities
- Horizontal timeline with:
  - Booked slots (filled, shows service + member)
  - Available slots ([+] button)
  - Blocked time (lunch, off-hours)

### Staff Row Layout
```
┌──────────────────────────────────────────────────────────┐
│ 👤 Nari Suwannapong                                      │
│    Spa Therapist • Thai Massage, Swedish, Aromatherapy   │
├──────────────────────────────────────────────────────────┤
│  9:00  │ 10:00 │ 11:00 │ 12:00 │  1:00 │  2:00 │  3:00  │
│  ░░░░  │ ████  │ ████  │ lunch │  ░░░░ │  ░░░░ │  ████  │
│  avail │ Thai  │ Thai  │       │ avail │ avail │ Swed.  │
│  [+]   │ M-042 │ M-108 │       │  [+]  │  [+]  │ M-221  │
└──────────────────────────────────────────────────────────┘
```

### Booking Flow (Staff-first)
1. **Staff + Time** - Pre-filled from clicked [+] slot
2. **Select Service** - Filtered to services this staff can perform
3. **Select Facility** - Auto-filtered to available facilities for that duration
4. **Select Member** - Search/select member
5. **Confirm** - Review and create booking

---

## 6. Unified Equipment System

### Data Model

```prisma
model EquipmentCategory {
  id                String                  @id @default(uuid())
  clubId            String
  code              String                  // e.g., "TENNIS_RACKETS"
  name              String                  // e.g., "Tennis Rackets"
  operationType     OperationType           // GOLF, FACILITY, SPA, EVENT
  attachmentType    EquipmentAttachmentType // OPTIONAL_ADDON, REQUIRED_RESOURCE
  icon              String?
  color             String?
  defaultRentalRate Decimal?
  requiresDeposit   Boolean                 @default(false)
  depositAmount     Decimal?

  equipment         Equipment[]
}

model Equipment {
  id            String            @id @default(uuid())
  clubId        String
  categoryId    String
  assetNumber   String
  name          String
  condition     EquipmentCondition
  status        EquipmentStatus
  location      String?
  manufacturer  String?
  model         String?
  serialNumber  String?

  category      EquipmentCategory @relation(...)
  assignments   EquipmentAssignment[]
}

model EquipmentAssignment {
  id                  String    @id @default(uuid())
  equipmentId         String
  memberId            String?
  bookingId           String?   // For facility bookings
  teeTimePlayerId     String?   // For golf bookings
  assignedAt          DateTime
  returnedAt          DateTime?
  rentalFee           Decimal?
  conditionAtCheckout EquipmentCondition
  conditionAtReturn   EquipmentCondition?

  equipment           Equipment @relation(...)
}

enum OperationType {
  GOLF
  FACILITY
  SPA
  EVENT
}
```

### Operation Scoping

| Operation | URL | Sees Equipment Categories |
|-----------|-----|---------------------------|
| Golf | `/golf` | GOLF (carts, clubs, pull carts, range balls) |
| Facility | `/facility` | FACILITY (tennis rackets, yoga mats, swim gear) |
| Spa | `/facility` (spa filter) | SPA (robes, towels) |
| Events | `/facility` (events filter) | EVENT (projectors, AV, tables, chairs) |

### Equipment Assignment Flow

Equipment is assigned at **check-in**, not during booking creation:

1. Member arrives for booking
2. Staff opens check-in interface
3. **Equipment Add-ons** section shows available equipment for that operation
4. Staff selects equipment items
5. System records assignment with condition
6. On departure, staff marks equipment returned with condition

### Check-in Interface (Equipment Section)

```
─────────────────────────────────────────────────────────────
EQUIPMENT ADD-ONS

🎾 Tennis Rackets
┌─────────────────────────────────────────────────────────┐
│ [ ] Racket #1 - Wilson Clash    Good      ฿200         │
│ [✓] Racket #2 - Head Speed      Excellent ฿200         │
│ [ ] Racket #3 - Babolat Aero    Good      ฿200         │
└─────────────────────────────────────────────────────────┘

🎾 Tennis Balls
┌─────────────────────────────────────────────────────────┐
│ [✓] Ball Canister (3 balls)               ฿100         │
└─────────────────────────────────────────────────────────┘

Equipment Total: ฿300
─────────────────────────────────────────────────────────────
```

---

## 7. What's NOT Changing

- **Golf module** (`/golf`) - UI is finalized, no changes
- **Golf tee sheet** - Stays as-is
- **Golf check-in** - Stays as-is, uses unified equipment backend
- **Golf cart/caddy assignment** - Per-player pattern stays

---

## 8. Migration Path

### Phase 1: Equipment Unification
1. Add `operationType` to `EquipmentCategory` schema
2. Migrate existing equipment categories with appropriate operation types
3. Update Golf equipment queries to filter by `operationType: GOLF`
4. Update Facility equipment queries to filter by `operationType: FACILITY`

### Phase 2: Facility Tab Restructure
1. Replace current Facility page with 4-tab layout
2. Implement Facilities tab (calendar view exists, needs flow integration)
3. Implement Services tab (new)
4. Implement Classes tab (new)
5. Implement Staff tab (adapt from existing staff components)

### Phase 3: Booking Flows
1. Create context-aware booking modal
2. Implement Facility-first flow
3. Implement Service-first flow
4. Implement Class-first flow
5. Implement Staff-first flow

### Phase 4: Check-in Integration
1. Create unified check-in interface for facility bookings
2. Integrate equipment assignment at check-in
3. Add equipment return flow

---

## 9. File Structure (Proposed)

```
components/
├── facility/
│   ├── facility-page.tsx           # Main page with 4 tabs
│   ├── tabs/
│   │   ├── facilities-tab.tsx      # Calendar grid view
│   │   ├── services-tab.tsx        # Service list view
│   │   ├── classes-tab.tsx         # Class schedule view
│   │   └── staff-tab.tsx           # Staff timeline view
│   ├── booking-flows/
│   │   ├── booking-modal.tsx       # Context-aware modal shell
│   │   ├── facility-first-flow.tsx
│   │   ├── service-first-flow.tsx
│   │   ├── class-first-flow.tsx
│   │   └── staff-first-flow.tsx
│   └── check-in/
│       ├── check-in-modal.tsx
│       └── equipment-addons.tsx
│
├── equipment/                       # Shared equipment components
│   ├── equipment-selector.tsx      # Used by both Golf and Facility
│   ├── equipment-return-modal.tsx
│   └── equipment-condition-badge.tsx
```

---

## 10. Success Criteria

- [ ] Facility page has 4 functional tabs
- [ ] Each tab provides appropriate entry point for booking
- [ ] Booking modal adapts flow based on entry point
- [ ] No dead ends in booking flow (every option leads to valid booking)
- [ ] Equipment system unified in backend
- [ ] Golf sees only golf equipment
- [ ] Facility sees only facility equipment
- [ ] Equipment assigned at check-in (not booking creation)
- [ ] Condition tracking on checkout and return

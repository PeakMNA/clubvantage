# Enum Flexibility Analysis

> Analysis of 77 enums in the ClubVantage Prisma schema for mutability and i18n potential.

## Executive Summary

| Category | Count | Recommendation |
|----------|-------|----------------|
| **Immutable (System States)** | 28 | Keep as code enums |
| **Configurable (Club-Specific)** | 22 | Migrate to lookup tables |
| **Technical/Internal** | 12 | Keep as code enums |
| **Display-Only i18n** | 15 | Add translation keys |

---

## Category 1: Immutable System States (Keep as Enums)

These represent workflow/state machine states that have specific business logic tied to them.

| Enum | Values | Reason |
|------|--------|--------|
| `MemberStatus` | PROSPECT, LEAD, APPLICANT, ACTIVE, SUSPENDED, LAPSED, RESIGNED, TERMINATED, REACTIVATED | Core workflow states with transition rules |
| `InvoiceStatus` | DRAFT, SENT, PAID, PARTIALLY_PAID, OVERDUE, VOID, CANCELLED | Financial workflow with specific handling |
| `BookingStatus` | PENDING, CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED, NO_SHOW | Core booking lifecycle |
| `LeadStage` | NEW, CONTACTED, QUALIFIED, CONVERTED, LOST | CRM pipeline states |
| `WaitlistStatus` | WAITING, OFFERED, ACCEPTED, DECLINED, EXPIRED, CANCELLED | Waitlist workflow |
| `LotteryStatus` | DRAFT, OPEN, CLOSED, DRAWN, PUBLISHED | Lottery workflow |
| `LotteryRequestStatus` | PENDING, ASSIGNED, WAITLISTED, CANCELLED | Lottery request lifecycle |
| `GolfWaitlistStatus` | PENDING, NOTIFIED, BOOKED, EXPIRED, CANCELLED | Golf waitlist workflow |
| `GroupBookingStatus` | DRAFT, CONFIRMED, COMPLETED, CANCELLED | Group booking lifecycle |
| `BookingPaymentStatus` | PENDING, PAID, REFUNDED, PARTIALLY_REFUNDED | Payment workflow |
| `CityLedgerStatus` | ACTIVE, INACTIVE, SUSPENDED, CLOSED | Account status |
| `RentalStatus` | NONE, REQUESTED, PAID, ASSIGNED, RETURNED | Rental workflow |
| `CashDrawerStatus` | OPEN, CLOSED, SUSPENDED | Cash drawer state |
| `SettlementStatus` | OPEN, IN_REVIEW, CLOSED, REOPENED | EOD settlement workflow |
| `ExceptionResolution` | PENDING, ACKNOWLEDGED, ADJUSTED, WRITTEN_OFF, ESCALATED, RESOLVED | Exception handling workflow |
| `MemberSpendStatus` | ON_TRACK, AT_RISK, MET, SHORTFALL, EXEMPT, PENDING_ACTION, RESOLVED | Spend tracking states |
| `SubAccountStatus` | ACTIVE, SUSPENDED, EXPIRED, REVOKED | Sub-account lifecycle |
| `StoredPaymentMethodStatus` | ACTIVE, EXPIRED, FAILED, REMOVED | Payment method states |
| `AutoPayAttemptStatus` | PENDING, PROCESSING, SUCCEEDED, FAILED, CANCELLED | Payment processing workflow |
| `CreditNoteStatus` | DRAFT, PENDING_APPROVAL, APPROVED, APPLIED, PARTIALLY_APPLIED, REFUNDED, VOIDED | Credit note workflow |
| `ApplicationStatus` | SUBMITTED, UNDER_REVIEW, PENDING_BOARD, APPROVED, REJECTED, WITHDRAWN | Membership application workflow |
| `EquipmentStatus` | AVAILABLE, IN_USE, RESERVED, MAINTENANCE, RETIRED | Equipment lifecycle |

**Recommendation:** These enums should remain as code enums. Add i18n support via translation files for display labels.

---

## Category 2: Configurable Values (Migrate to Lookup Tables)

These should become database tables to allow per-club customization.

### High Priority (User-Facing, Frequently Customized)

| Enum | Current Values | Why Configurable |
|------|----------------|------------------|
| `PlayerType` | MEMBER, GUEST, DEPENDENT, WALK_UP | Clubs may have different player categories (Corporate, Junior, Senior, etc.) |
| `BlockType` | MAINTENANCE, TOURNAMENT, WEATHER, PRIVATE, STARTER | Clubs may need custom block reasons |
| `PaymentMethod` | CASH, BANK_TRANSFER, CREDIT_CARD, QR_PROMPTPAY, QR_PAYNOW, QR_DUITNOW, CHECK, DIRECT_DEBIT, CREDIT | Region-specific, clubs may add/remove methods |
| `CityLedgerType` | CORPORATE, HOUSE_ACCOUNT, VENDOR, OTHER | Clubs may have different account categories |
| `SkillLevel` | BEGINNER, INTERMEDIATE, ADVANCED, EXPERT | Clubs may use different terminology |
| `UserRole` | SUPER_ADMIN, PLATFORM_ADMIN, TENANT_ADMIN, MANAGER, STAFF, MEMBER | Clubs may need custom role names |
| `ExceptionType` | CASH_VARIANCE, CARD_VARIANCE, MISSING_RECEIPT, etc. | Clubs may define custom exception types |
| `ExceptionSeverity` | LOW, MEDIUM, HIGH, CRITICAL | Labels may differ by club |
| `CollectionActionType` | REMINDER_EMAIL, REMINDER_SMS, etc. | Clubs have different collection processes |
| `CollectionResult` | PAYMENT_RECEIVED, PAYMENT_PROMISED, etc. | Clubs may track different outcomes |
| `CreditNoteType` | REFUND, ADJUSTMENT, COURTESY, etc. | Clubs may have different credit categories |
| `CreditNoteReason` | BILLING_ERROR, DUPLICATE_CHARGE, etc. | Clubs may have different reasons |

### Medium Priority (Operational Customization)

| Enum | Current Values | Why Configurable |
|------|----------------|------------------|
| `CartType` | SINGLE, SHARED, WALKING | Clubs may have different cart options |
| `PlayFormat` | EIGHTEEN_HOLE, CROSS_TEE | Some clubs have 27/36 holes, par 3 courses |
| `StartFormat` | SEQUENTIAL, SHOTGUN | Clubs may have custom formats |
| `LotteryType` | PRIME_TIME, SPECIAL_EVENT | Clubs may categorize lotteries differently |
| `EquipmentCondition` | EXCELLENT, GOOD, FAIR, NEEDS_REPAIR, OUT_OF_SERVICE | Clubs may use different grading |
| `OperationType` | GOLF, FACILITY, SPA, EVENT | Clubs may have different operation areas |
| `SubAccountPermission` | GOLF, FOOD_BEVERAGE, RETAIL, SPA, EVENTS, ALL | Clubs may have different spending categories |

### Recommended Schema for Lookup Tables

```prisma
model LookupCategory {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code      String   @db.VarChar(50)  // e.g., "PLAYER_TYPE", "PAYMENT_METHOD"
  name      String   @db.VarChar(100)
  isSystem  Boolean  @default(false)  // System-managed, not deletable

  club      Club?    @relation(fields: [clubId], references: [id])
  clubId    String?  @db.Uuid         // null = global defaults

  values    LookupValue[]

  @@unique([clubId, code])
  @@map("lookup_categories")
}

model LookupValue {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  categoryId   String   @db.Uuid
  code         String   @db.VarChar(50)     // Internal code (e.g., "MEMBER")
  name         String   @db.VarChar(100)    // Display name (e.g., "Club Member")
  description  String?
  icon         String?  @db.VarChar(50)     // Lucide icon name
  color        String?  @db.VarChar(7)      // Hex color
  sortOrder    Int      @default(0)
  isActive     Boolean  @default(true)
  isDefault    Boolean  @default(false)
  metadata     Json     @default("{}")      // Custom attributes

  category     LookupCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  // Translation support
  translations LookupTranslation[]

  @@unique([categoryId, code])
  @@index([categoryId, isActive])
  @@map("lookup_values")
}

model LookupTranslation {
  id           String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  lookupValueId String     @db.Uuid
  locale       String      @db.VarChar(10)   // e.g., "th", "zh-CN", "ja"
  name         String      @db.VarChar(100)
  description  String?

  lookupValue  LookupValue @relation(fields: [lookupValueId], references: [id], onDelete: Cascade)

  @@unique([lookupValueId, locale])
  @@map("lookup_translations")
}
```

---

## Category 3: Technical/Internal Enums (Keep as Enums)

These are internal system values that don't need user customization or translation.

| Enum | Values | Purpose |
|------|--------|---------|
| `VariationPriceType` | FIXED_ADD, PERCENTAGE_ADD, REPLACEMENT | Pricing calculation logic |
| `TaxType` | ADD, INCLUDE, NONE | Tax calculation method |
| `DiscountType` | PERCENTAGE, FIXED_AMOUNT | Discount calculation |
| `DiscountScope` | LINE_ITEM, ORDER | Discount application |
| `ProductType` | SIMPLE, VARIABLE, SERVICE, COMPOSITE | Product catalog structure |
| `ModifierSelectionType` | SINGLE, MULTIPLE | UI behavior |
| `TileSize` | SMALL, MEDIUM, LARGE | UI layout |
| `CategoryDisplayStyle` | TABS, SIDEBAR, DROPDOWN | UI layout |
| `QuickKeysPosition` | TOP, LEFT | UI layout |
| `SuggestionPosition` | TOP_ROW, SIDEBAR, FLOATING | UI layout |
| `InventoryVisibilityRule` | ALWAYS_SHOW, HIDE_WHEN_ZERO, SHOW_DISABLED | UI behavior |
| `CashMovementType` | OPENING_FLOAT, CASH_SALE, etc. | Cash drawer operations |
| `BillingFrequency` | MONTHLY, QUARTERLY, etc. | Billing configuration |
| `BillingTiming` | ADVANCE, ARREARS | Billing logic |
| `CycleAlignment` | CALENDAR, ANNIVERSARY | Date calculation |
| `ProrationMethod` | DAILY, MONTHLY, NONE | Proration logic |
| `LateFeeType` | PERCENTAGE, FIXED, TIERED | Fee calculation |
| `InterestSource` | EXPLICIT, BOOKING, INFERRED | Data origin tracking |
| `EquipmentAttachmentType` | OPTIONAL_ADDON, REQUIRED_RESOURCE | Equipment linking logic |
| `StoredPaymentMethodType` | CARD, BANK_ACCOUNT | Payment method category |
| `AutoPaySchedule` | INVOICE_DUE, STATEMENT_DATE, MONTHLY_FIXED | Scheduling logic |

---

## Category 4: Display-Only i18n (Add Translation Keys)

These enums are user-facing and need translation but don't need to be configurable.

| Enum | Translation Key Pattern | Example (EN) | Example (TH) |
|------|------------------------|--------------|--------------|
| `DayType` | `enum.day_type.{value}` | "Weekday" | "วันธรรมดา" |
| `SpecialDayType` | `enum.special_day.{value}` | "Holiday" | "วันหยุด" |
| `ApplicableDays` | `enum.applicable_days.{value}` | "All Days" | "ทุกวัน" |
| `TwilightMode` | `enum.twilight.{value}` | "Fixed Time" | "เวลาคงที่" |
| `BookingType` | `enum.booking_type.{value}` | "Facility" | "สิ่งอำนวยความสะดวก" |
| `BookingMode` | `enum.booking_mode.{value}` | "18 Holes" | "18 หลุม" |
| `CartPolicy` | `enum.cart_policy.{value}` | "Optional" | "ไม่บังคับ" |
| `RentalPolicy` | `enum.rental_policy.{value}` | "Required" | "บังคับ" |
| `BookingPaymentMethod` | `enum.payment_method.{value}` | "On Account" | "ลงบัญชี" |
| `LineItemType` | `enum.line_item.{value}` | "Green Fee" | "ค่ากรีนฟี" |
| `PrintOption` | `enum.print_option.{value}` | "Ticket" | "ตั๋ว" |
| `TicketGenerateOn` | `enum.ticket_gen.{value}` | "Check-in" | "เช็คอิน" |
| `Region` | `enum.region.{value}` | "Thailand" | "ไทย" |
| `SubscriptionTier` | `enum.tier.{value}` | "Professional" | "มืออาชีพ" |
| `ShortfallAction` | `enum.shortfall.{value}` | "Charge Difference" | "เรียกเก็บส่วนต่าง" |
| `MinimumSpendPeriod` | `enum.spend_period.{value}` | "Quarterly" | "รายไตรมาส" |

---

## Implementation Roadmap

### Phase 1: i18n Infrastructure
1. Create translation table or integrate with i18n library (i18next)
2. Add translation keys for display-only enums
3. Create helper functions to get translated enum labels

### Phase 2: High-Priority Lookups
1. Create LookupCategory and LookupValue tables
2. Migrate `PlayerType`, `PaymentMethod`, `BlockType`
3. Create seed data from current enum values
4. Update queries to use lookup tables

### Phase 3: Medium-Priority Lookups
1. Migrate remaining configurable enums
2. Create admin UI for managing lookup values
3. Implement club-level overrides

### Phase 4: Full i18n
1. Add LookupTranslation table
2. Implement locale-aware display
3. Support RTL languages if needed

---

## Migration Strategy for Configurable Enums

For each enum migrated to a lookup table:

1. **Keep enum in Prisma** for type safety during transition
2. **Create lookup table** with same values as seed data
3. **Add foreign key column** alongside enum column
4. **Migrate data** to use lookup table references
5. **Update queries** to join with lookup table
6. **Deprecate enum column** after full migration
7. **Remove enum** after all references updated

### Example: PlayerType Migration

```prisma
// Step 1: Add lookup reference
model TeeTimePlayer {
  // Existing
  playerType    PlayerType?  // Deprecated

  // New
  playerTypeId  String?      @db.Uuid
  playerTypeRef LookupValue? @relation(fields: [playerTypeId], references: [id])
}

// Step 2: Create migration script
// INSERT INTO lookup_categories (code, name) VALUES ('PLAYER_TYPE', 'Player Type');
// INSERT INTO lookup_values (category_id, code, name, color) VALUES
//   (..., 'MEMBER', 'Member', '#3B82F6'),
//   (..., 'GUEST', 'Guest', '#F59E0B'),
//   (..., 'DEPENDENT', 'Dependent', '#14B8A6'),
//   (..., 'WALK_UP', 'Walk-up', '#A8A29E');
```

---

## Summary

| Action | Count | Timeline |
|--------|-------|----------|
| Keep as immutable enums | 28 | Now |
| Add i18n translations | 15 | Phase 1 |
| Migrate to lookup tables | 22 | Phase 2-3 |
| Technical enums (no change) | 12 | N/A |

This approach provides:
- **Type safety** for workflow states (immutable enums)
- **Flexibility** for club-specific customization (lookup tables)
- **Internationalization** for user-facing labels (translations)
- **Backward compatibility** during migration

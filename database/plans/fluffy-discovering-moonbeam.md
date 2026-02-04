# AR Account & City Ledger Payment Enhancement Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance the receipt/payment system to support AR account selection (Members + City Ledger), FIFO settlement options, batch settlement, and credit balance handling.

**Architecture:** Add City Ledger model, create unified AR account search, implement FIFO allocation algorithm and batch settlement UI, track unapplied payments as credit.

**Tech Stack:** Prisma, GraphQL/NestJS, React/Next.js, TypeScript

---

## Requirements Summary

Based on user input:
1. **Account Types**: All types - Corporate, House accounts, Vendor credits, custom
2. **FIFO Behavior**: Three options - Manual selection, Auto FIFO, Batch settlement
3. **Payment Scope**: One account per payment (including dependents for members)
4. **Credit Handling**: Auto-add unapplied amounts to credit balance

---

## Phase 1: Database Schema Changes

### Task 1: Add CityLedger Enum and Model

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add CityLedgerType enum**
```prisma
enum CityLedgerType {
  CORPORATE     // Company accounts
  HOUSE_ACCOUNT // Internal club accounts
  VENDOR        // Supplier credits
  OTHER         // Custom account types
}

enum AccountStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  CLOSED
}
```

**Step 2: Add CityLedger model**
```prisma
model CityLedger {
  id                 String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId             String           @db.Uuid
  accountNumber      String           @db.VarChar(30)
  accountName        String           @db.VarChar(255)
  accountType        CityLedgerType   @default(CORPORATE)
  contactName        String?          @db.VarChar(200)
  contactEmail       String?          @db.VarChar(255)
  contactPhone       String?          @db.VarChar(50)
  billingAddress     String?
  taxId              String?          @db.VarChar(50)
  creditLimit        Decimal?         @db.Decimal(12, 2)
  creditBalance      Decimal          @default(0) @db.Decimal(12, 2)
  outstandingBalance Decimal          @default(0) @db.Decimal(12, 2)
  paymentTerms       Int              @default(30)
  status             AccountStatus    @default(ACTIVE)
  notes              String?
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt

  club     Club      @relation(fields: [clubId], references: [id], onDelete: Cascade)
  invoices Invoice[]
  payments Payment[]

  @@unique([clubId, accountNumber])
  @@index([clubId])
  @@index([clubId, status])
  @@map("city_ledgers")
}
```

**Step 3: Run migration**
```bash
cd database && npx prisma migrate dev --name add_city_ledger
```

### Task 2: Update Invoice Model for City Ledger Support

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Changes to Invoice model:**
```prisma
model Invoice {
  // ... existing fields ...
  memberId        String?         @db.Uuid  // Make optional
  cityLedgerId    String?         @db.Uuid  // Add new field

  // ... existing relations ...
  member          Member?         @relation(fields: [memberId], references: [id])
  cityLedger      CityLedger?     @relation(fields: [cityLedgerId], references: [id])

  // Add index for city ledger
  @@index([cityLedgerId])
}
```

**Step: Run migration**
```bash
npx prisma migrate dev --name invoice_city_ledger_support
```

### Task 3: Update Payment Model for City Ledger Support

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Changes to Payment model:**
```prisma
model Payment {
  // ... existing fields ...
  memberId        String?         @db.Uuid  // Make optional
  cityLedgerId    String?         @db.Uuid  // Add new field

  // ... existing relations ...
  member          Member?         @relation(fields: [memberId], references: [id])
  cityLedger      CityLedger?     @relation(fields: [cityLedgerId], references: [id])

  @@index([cityLedgerId])
}
```

**Step: Run migration**
```bash
npx prisma migrate dev --name payment_city_ledger_support
```

---

## Phase 2: Backend API Changes

### Task 4: Create City Ledger Service

**Files:**
- Create: `/apps/api/src/modules/billing/city-ledger.service.ts`

**Implement:**
- `create(dto)` - Create city ledger account
- `findAll(clubId, filters)` - List with search/filters
- `findById(id)` - Get single account
- `update(id, dto)` - Update account
- `getOutstandingInvoices(id)` - Get unpaid invoices sorted by due date (FIFO)
- `updateBalances(id)` - Recalculate outstanding/credit balances

### Task 5: Create AR Account Search Query

**Files:**
- Modify: `/apps/api/src/graphql/billing/billing.resolver.ts`
- Create: `/apps/api/src/graphql/billing/types/ar-account.type.ts`

**GraphQL Types:**
```typescript
@ObjectType()
export class ArAccountSearchResult {
  @Field(() => ID)
  id: string;

  @Field()
  accountType: 'MEMBER' | 'CITY_LEDGER';

  @Field()
  accountNumber: string;

  @Field()
  accountName: string;

  @Field({ nullable: true })
  subType?: string; // Membership type for members, CityLedgerType for city ledger

  @Field()
  outstandingBalance: number;

  @Field()
  creditBalance: number;

  @Field()
  invoiceCount: number;

  @Field({ nullable: true })
  agingStatus?: string;
}
```

**Query:**
```typescript
@Query(() => [ArAccountSearchResult])
async searchArAccounts(
  @Args('search') search: string,
  @Args('accountTypes', { type: () => [String], nullable: true }) accountTypes?: string[]
): Promise<ArAccountSearchResult[]> {
  // Search both members and city ledgers
  // Return unified results with accountType discriminator
}
```

### Task 6: Implement FIFO Allocation Algorithm

**Files:**
- Modify: `/apps/api/src/modules/billing/billing.service.ts`
- Create: `/apps/api/src/modules/billing/allocation.service.ts`

**AllocationService methods:**
```typescript
// Calculate FIFO allocation for a given payment amount
calculateFifoAllocation(
  invoices: Invoice[],  // Sorted by dueDate ASC
  paymentAmount: number
): { invoiceId: string; allocatedAmount: number }[]

// Apply allocations and update balances
applyAllocations(
  paymentId: string,
  allocations: { invoiceId: string; amount: number }[],
  creditToAccount: number
): Promise<void>
```

### Task 7: Create Batch Settlement Mutation

**Files:**
- Modify: `/apps/api/src/graphql/billing/billing.resolver.ts`

**Mutation:**
```typescript
@Mutation(() => BatchSettlementResult)
async batchSettleInvoices(
  @Args('input') input: BatchSettlementInput
): Promise<BatchSettlementResult> {
  // Input: { accountId, accountType, paymentAmount, method, reference }
  // Auto-allocates using FIFO
  // Creates payment + allocations
  // Updates account balances
  // Returns: { receiptNumber, allocations[], creditAdded }
}
```

---

## Phase 3: Frontend UI Changes

### Task 8: Create AR Account Search Component

**Files:**
- Create: `/apps/application/src/components/billing/ar-account-search.tsx`

**Features:**
- Unified search input for Members + City Ledger
- Visual badges to distinguish account types:
  - Members: Blue badge with "M" + member number
  - City Ledger: Purple badge with account type icon
- Display outstanding balance and credit balance in results
- Show dependent count for member accounts
- Keyboard navigation support

**Props:**
```typescript
interface ArAccountSearchProps {
  onSelect: (account: ArAccountSearchResult) => void;
  onClear: () => void;
  selectedAccount?: ArAccountSearchResult | null;
  isLoading?: boolean;
  placeholder?: string;
}
```

### Task 9: Update Receipt Form with Settlement Options

**Files:**
- Modify: `/apps/application/src/components/billing/receipt-form.tsx`

**Changes:**
1. Replace member search with AR Account search component
2. Add settlement mode selector:
   - **Manual**: User selects individual invoices (current behavior)
   - **FIFO**: Auto-allocate to oldest invoices first
   - **Full Settlement**: Pay all outstanding invoices
3. For FIFO mode:
   - As user enters amount, show allocation preview
   - Display which invoices will be paid/partially paid
   - Show remaining credit if overpayment
4. Add "Apply FIFO" button for explicit application
5. Show credit balance update preview

### Task 10: Create Outstanding Invoices Panel

**Files:**
- Modify: `/apps/application/src/components/billing/receipt-form.tsx`
- Extract: `/apps/application/src/components/billing/outstanding-invoices-table.tsx`

**Features:**
- Display invoices sorted by due date (oldest first)
- Column: Checkbox | Invoice# | Date | Due | Amount | Balance | Aging | Allocate
- Color coding by aging: Current (green), 30+ (yellow), 60+ (orange), 90+ (red)
- Toolbar actions:
  - "Select All" checkbox
  - "Apply FIFO" button (allocates up to payment amount)
  - "Clear All" button
- Real-time allocation total vs payment amount comparison
- Warning if allocating more than payment amount

### Task 11: Create Settlement Summary Component

**Files:**
- Modify: `/apps/application/src/components/billing/settlement-summary.tsx`

**Enhancements:**
- Show payment breakdown:
  - Cash received: ฿X
  - WHT deducted: ฿X
  - Total settlement: ฿X
- Show allocation summary:
  - Invoices selected: N
  - Total allocated: ฿X
  - Credit added: ฿X (if overpayment)
- Show account balance after:
  - Outstanding balance: ฿X → ฿Y
  - Credit balance: ฿X → ฿Y

---

## Phase 4: Seed Data & Testing

### Task 12: Create City Ledger Seed Data

**Files:**
- Create: `/database/prisma/seed-city-ledger.ts`

**Seed:**
- 3 Corporate accounts (different companies)
- 2 House accounts (staff meals, promo credits)
- 1 Vendor account
- Sample invoices for each
- Mix of paid/unpaid/partial invoices

### Task 13: Add Integration Tests

**Files:**
- Create: `/apps/api/src/modules/billing/tests/allocation.service.spec.ts`
- Create: `/apps/api/src/modules/billing/tests/city-ledger.service.spec.ts`

**Test cases:**
- FIFO allocation with exact amount
- FIFO allocation with overpayment (credit)
- FIFO allocation with underpayment (partial)
- City Ledger invoice creation
- City Ledger payment with allocations
- Balance calculation accuracy

---

## Key Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `/database/prisma/schema.prisma` | Modify | Add CityLedger model, update Invoice/Payment |
| `/apps/api/src/modules/billing/city-ledger.service.ts` | Create | City ledger CRUD operations |
| `/apps/api/src/modules/billing/allocation.service.ts` | Create | FIFO allocation algorithm |
| `/apps/api/src/graphql/billing/billing.resolver.ts` | Modify | AR search query, batch settlement |
| `/apps/api/src/graphql/billing/types/ar-account.type.ts` | Create | GraphQL types for AR accounts |
| `/apps/application/src/components/billing/ar-account-search.tsx` | Create | Unified AR account search UI |
| `/apps/application/src/components/billing/receipt-form.tsx` | Modify | Settlement modes, FIFO UI |
| `/apps/application/src/components/billing/outstanding-invoices-table.tsx` | Create | Enhanced invoice table with FIFO |
| `/database/prisma/seed-city-ledger.ts` | Create | Test data |

---

## Verification Plan

1. **Schema Verification**
   - Run `npx prisma migrate dev` successfully
   - Verify CityLedger table created in database
   - Verify Invoice/Payment FK constraints work

2. **API Verification**
   - Test AR account search returns both members and city ledgers
   - Test FIFO allocation with various scenarios
   - Test batch settlement creates correct allocations

3. **UI Verification**
   - Search for member → shows invoices including dependents
   - Search for city ledger → shows corporate invoices
   - Enter payment → FIFO preview shows correct allocations
   - Submit payment → balances update correctly
   - Overpayment → credit balance increases

4. **E2E Test Flow**
   ```
   1. Create City Ledger account (API/seed)
   2. Create invoices for City Ledger (3 invoices: ฿5000, ฿3000, ฿2000)
   3. Open receipt form
   4. Search and select City Ledger account
   5. See outstanding invoices listed (FIFO order)
   6. Enter payment amount ฿7000
   7. Click "Apply FIFO" → allocates ฿5000 + ฿2000 (skips middle invoice partially)
   8. Actually: ฿5000 to first, ฿2000 to second (partial)
   9. Submit → verify allocations and credit
   ```

---

## Timeline Estimate

- Phase 1 (Schema): 2 tasks
- Phase 2 (Backend): 4 tasks
- Phase 3 (Frontend): 4 tasks
- Phase 4 (Testing): 2 tasks

**Total: 12 tasks**


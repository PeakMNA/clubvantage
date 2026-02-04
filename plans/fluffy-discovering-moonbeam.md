# CRM Membership Profile Gap Closure Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Close identified gaps in membership CRM to meet industry standards for country club management software.

**Scope:** 5 phases prioritized by impact and effort

**Tech Stack:** Prisma, NestJS/GraphQL, Next.js/React, TanStack Query, Supabase Storage

---

## Executive Summary

### Already Implemented (No Work Needed):
- F&B Minimum Tracking (complete)
- Auto-Pay Backend (Stripe integration ready)
- Playing Partners in Bookings (TeeTimePlayer + Guest models)
- File Storage Infrastructure (Supabase buckets configured)
- Transaction History API (GraphQL query exists)
- Digital ID Card with QR (member portal)

### Work Required:
| Phase | Feature | Effort | Impact |
|-------|---------|--------|--------|
| 1 | Connect Transaction History UI | Low | High |
| 1B | Enable Statement Viewing | Low | High |
| 2 | Complete Address Management UI | Low | Medium |
| 3 | Member Document Storage | Medium | High |
| 4 | Auto-Pay Settings UI | Medium | High |
| 5 | Apple/Google Wallet Passes | High | Medium |

---

## Phase 1: Connect Transaction History (Staff App)

**Status:** API complete, frontend disconnected

**Files:**
- `apps/application/src/app/(dashboard)/members/[id]/page.tsx` (line 165-167)
- `apps/application/src/hooks/use-billing.ts` (add new hook)

### Task 1.1: Create useMemberTransactions Hook

**File:** `apps/application/src/hooks/use-billing.ts`

Add hook that wraps the existing `useGetMemberTransactionsQuery`:

```typescript
export function useMemberTransactions(memberId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useGetMemberTransactionsQuery(
    { memberId },
    { enabled: enabled && !!memberId, staleTime: 30000 }
  );

  const transactions = useMemo(() => {
    if (!data?.memberTransactions?.transactions) return [];
    return data.memberTransactions.transactions.map((tx) => ({
      id: tx.id,
      memberId,
      date: tx.date,
      type: tx.type as 'INVOICE' | 'PAYMENT' | 'CREDIT' | 'ADJUSTMENT',
      description: tx.description,
      invoiceNumber: tx.invoiceNumber ?? undefined,
      amount: parseFloat(tx.amount),
      runningBalance: parseFloat(tx.runningBalance),
    }));
  }, [data, memberId]);

  const currentBalance = useMemo(() => {
    return parseFloat(data?.memberTransactions?.currentBalance ?? '0');
  }, [data]);

  return { transactions, currentBalance, isLoading, error, refetch };
}
```

### Task 1.2: Connect Hook to Member Detail Page

**File:** `apps/application/src/app/(dashboard)/members/[id]/page.tsx`

Replace lines 165-167:
```typescript
// OLD:
const arTransactions = useMemo(() => {
  return []; // TODO: Implement GetMemberTransactions query
}, []);

// NEW:
const { transactions: arTransactions } = useMemberTransactions(memberId);
```

Add import at top:
```typescript
import { useMemberTransactions } from '@/hooks/use-billing';
```

### Task 1.3: Verify AR History Tab Displays Data

Test by opening a member with invoices - transactions should now appear.

---

## Phase 1B: Enable Statement Viewing (Billing Module)

**Status:** UI components complete, backend query exists, admin page uses mock data

**Current State:**
- `StatementModal` component exists and works (member selection, date range)
- `MemberStatement` component renders statement with transactions
- `memberTransactions` GraphQL query exists (line 422 in billing.resolver.ts)
- Admin billing page `handleFetchStatement()` uses mock data (lines 415-445)

**Files:**
- `apps/application/src/app/(dashboard)/billing/page.tsx` (lines 415-445)
- `apps/application/src/hooks/use-billing.ts` (add new hook)
- `apps/api/src/graphql/billing/billing.resolver.ts` (enhance query)
- `apps/api/src/graphql/billing/billing.types.ts` (add StatementType)
- `apps/api/src/graphql/billing/billing.input.ts` (add StatementInput)

### Task 1B.1: Add Statement GraphQL Query

**File:** `apps/api/src/graphql/billing/billing.input.ts`

Add input type:
```typescript
@InputType()
export class GenerateStatementInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Field()
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}
```

**File:** `apps/api/src/graphql/billing/billing.types.ts`

Add return type:
```typescript
@ObjectType()
export class StatementType {
  @Field(() => MemberStatementInfoType)
  member: MemberStatementInfoType;

  @Field()
  periodStart: Date;

  @Field()
  periodEnd: Date;

  @Field()
  openingBalance: string;

  @Field()
  closingBalance: string;

  @Field(() => [MemberTransactionType])
  transactions: MemberTransactionType[];
}

@ObjectType()
export class MemberStatementInfoType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  memberNumber: string;

  @Field()
  membershipType: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  address?: string;
}
```

**File:** `apps/api/src/graphql/billing/billing.resolver.ts`

Add query:
```typescript
@Query(() => StatementType)
async generateStatement(
  @Args('input') input: GenerateStatementInput,
  @CurrentUser() user: AuthUser,
): Promise<StatementType> {
  return this.billingService.generateStatement(
    user.clubId,
    input.memberId,
    input.startDate,
    input.endDate,
  );
}
```

### Task 1B.2: Implement Statement Generation Service

**File:** `apps/api/src/modules/billing/billing.service.ts`

Add method:
```typescript
async generateStatement(
  clubId: string,
  memberId: string,
  startDate: Date,
  endDate: Date,
): Promise<StatementType> {
  // 1. Fetch member info
  const member = await this.prisma.member.findUnique({
    where: { id: memberId },
    include: { membershipType: true, addresses: { where: { isPrimary: true } } },
  });

  // 2. Calculate opening balance (sum before startDate)
  const openingBalance = await this.calculateBalanceAsOf(clubId, memberId, startDate);

  // 3. Fetch transactions in date range (reuse existing memberTransactions logic)
  const transactions = await this.getTransactionsInRange(clubId, memberId, startDate, endDate);

  // 4. Calculate closing balance
  let runningBalance = openingBalance;
  const transactionsWithBalance = transactions.map(tx => {
    runningBalance = tx.type === 'INVOICE'
      ? runningBalance + parseFloat(tx.amount)
      : runningBalance - parseFloat(tx.amount);
    return { ...tx, runningBalance: runningBalance.toFixed(2) };
  });

  return {
    member: {
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      memberNumber: member.memberNumber,
      membershipType: member.membershipType?.name || 'Standard',
      email: member.email,
      address: member.addresses[0]?.addressLine1,
    },
    periodStart: startDate,
    periodEnd: endDate,
    openingBalance: openingBalance.toFixed(2),
    closingBalance: runningBalance.toFixed(2),
    transactions: transactionsWithBalance,
  };
}
```

### Task 1B.3: Add GraphQL Operations and Hook

**File:** `packages/api-client/src/operations/billing.graphql`

Add query:
```graphql
query GenerateStatement($input: GenerateStatementInput!) {
  generateStatement(input: $input) {
    member {
      id
      name
      memberNumber
      membershipType
      email
      address
    }
    periodStart
    periodEnd
    openingBalance
    closingBalance
    transactions {
      id
      date
      type
      description
      invoiceNumber
      amount
      runningBalance
    }
  }
}
```

**File:** `apps/application/src/hooks/use-billing.ts`

Add hook:
```typescript
export function useGenerateStatement() {
  const [generateStatementMutation, { loading }] = useGenerateStatementLazyQuery();

  const generateStatement = async (memberId: string, startDate: Date, endDate: Date) => {
    const { data } = await generateStatementMutation({
      variables: { input: { memberId, startDate, endDate } },
    });

    if (!data?.generateStatement) return null;

    const stmt = data.generateStatement;
    return {
      member: stmt.member,
      periodStart: new Date(stmt.periodStart),
      periodEnd: new Date(stmt.periodEnd),
      openingBalance: parseFloat(stmt.openingBalance),
      closingBalance: parseFloat(stmt.closingBalance),
      transactions: stmt.transactions.map(tx => ({
        ...tx,
        date: new Date(tx.date),
        debit: tx.type === 'INVOICE' ? parseFloat(tx.amount) : undefined,
        credit: tx.type !== 'INVOICE' ? parseFloat(tx.amount) : undefined,
        runningBalance: parseFloat(tx.runningBalance),
      })),
    };
  };

  return { generateStatement, isLoading: loading };
}
```

### Task 1B.4: Connect Billing Page to Real API

**File:** `apps/application/src/app/(dashboard)/billing/page.tsx`

Replace mock `handleFetchStatement` (lines 415-445):
```typescript
// Import the hook
import { useGenerateStatement } from '@/hooks/use-billing';

// In component:
const { generateStatement, isLoading: statementLoading } = useGenerateStatement();

const handleFetchStatement = async () => {
  if (!selectedMember || !dateRange?.from || !dateRange?.to) return;

  setIsLoadingStatement(true);
  try {
    const statement = await generateStatement(
      selectedMember.id,
      dateRange.from,
      dateRange.to
    );
    setStatementData(statement);
    setShowStatement(true);
  } catch (error) {
    toast.error('Failed to generate statement');
  } finally {
    setIsLoadingStatement(false);
  }
};
```

### Task 1B.5: Verify Statement Generation Works

1. Go to Billing > Statements tab
2. Select a member with invoices/payments
3. Select date range (e.g., "Last 3 months")
4. Click "Generate Statement"
5. Verify statement displays with:
   - Correct member info
   - Opening balance
   - Transaction list with running balances
   - Closing balance

---

## Phase 2: Complete Address Management UI

**Status:** Schema complete, UI components partially built

**Files:**
- `apps/application/src/components/members/profile-tab.tsx`
- `apps/application/src/components/members/address-modal.tsx` (create)

### Task 2.1: Create Address Modal Component

**File:** `apps/application/src/components/members/address-modal.tsx`

Create modal for add/edit address with fields:
- Label (select: Billing, Mailing, Both)
- Address Line 1, Line 2
- Sub-district, District, Province
- Postal Code, Country
- Is Primary checkbox

### Task 2.2: Add Address GraphQL Operations

**File:** `packages/api-client/src/operations/members.graphql`

Add mutations:
```graphql
mutation CreateMemberAddress($input: CreateAddressInput!) {
  createMemberAddress(input: $input) { id }
}

mutation UpdateMemberAddress($id: ID!, $input: UpdateAddressInput!) {
  updateMemberAddress(id: $id, input: $input) { id }
}

mutation DeleteMemberAddress($id: ID!) {
  deleteMemberAddress(id: $id) { success }
}
```

### Task 2.3: Wire Address Modal to Profile Tab

Update `profile-tab.tsx` to:
- Open modal on "Add Address" click
- Open modal with data on edit icon click
- Call mutations on save

---

## Phase 3: Member Document Storage

**Status:** Storage backend ready, no document model or UI

### Task 3.1: Add MemberDocument Model to Schema

**File:** `database/prisma/schema.prisma`

```prisma
model MemberDocument {
  id              String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId          String            @db.Uuid
  memberId        String            @db.Uuid

  // Document info
  name            String            @db.VarChar(255)
  type            DocumentType
  fileName        String            @db.VarChar(255)
  fileUrl         String            @db.VarChar(500)
  fileSize        Int?              // bytes
  mimeType        String?           @db.VarChar(100)

  // Metadata
  description     String?
  expiryDate      DateTime?         @db.Date
  isVerified      Boolean           @default(false)
  verifiedBy      String?           @db.Uuid
  verifiedAt      DateTime?

  uploadedBy      String            @db.Uuid
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  deletedAt       DateTime?

  club            Club              @relation(fields: [clubId], references: [id])
  member          Member            @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@index([memberId])
  @@index([clubId, type])
  @@map("member_documents")
}

enum DocumentType {
  CONTRACT           // Signed membership contract
  ID_DOCUMENT        // Passport, national ID
  PROOF_OF_ADDRESS   // Utility bill, bank statement
  MEDICAL_CERT       // Health certificate
  WAIVER             // Liability waiver
  PHOTO              // Additional photos
  OTHER
}
```

### Task 3.2: Create Document GraphQL Module

**Files:**
- `apps/api/src/graphql/documents/documents.module.ts`
- `apps/api/src/graphql/documents/documents.service.ts`
- `apps/api/src/graphql/documents/documents.resolver.ts`
- `apps/api/src/graphql/documents/documents.types.ts`
- `apps/api/src/graphql/documents/documents.input.ts`

Key operations:
- Query: `memberDocuments(memberId)`, `document(id)`
- Mutation: `uploadMemberDocument`, `deleteMemberDocument`, `verifyDocument`

### Task 3.3: Create Documents Tab in Member Detail

**File:** `apps/application/src/components/members/tabs/documents-tab.tsx`

Features:
- Grid of document cards with type icons
- Upload button with drag-drop zone
- Document preview/download
- Delete with confirmation
- Expiry date warnings
- Verification status badges

### Task 3.4: Add Documents Tab to Member Detail Page

**File:** `apps/application/src/app/(dashboard)/members/[id]/page.tsx`

Add new tab trigger and content after Engagement tab.

---

## Phase 4: Auto-Pay Settings UI

**Status:** Backend complete (StoredPaymentMethod, AutoPaySetting models), no UI

### Task 4.1: Create Payment Methods Section in Billing Tab

**File:** `apps/application/src/components/members/tabs/billing-methods-section.tsx`

Display:
- List of stored cards (brand, last4, expiry)
- Default card indicator
- Add new card button
- Remove card button
- Auto-pay toggle per card

### Task 4.2: Create Auto-Pay Settings Modal

**File:** `apps/application/src/components/members/auto-pay-modal.tsx`

Settings:
- Enable/disable toggle
- Payment method selector
- Schedule (Invoice Due, Statement Date, Monthly Fixed)
- Max payment amount limit
- Require approval above amount
- Notification preferences

### Task 4.3: Add Payment History to AR Tab

Enhance AR History tab to show:
- Auto-pay attempt history
- Success/failure indicators
- Retry buttons for failed payments

---

## Phase 5: Digital Wallet Passes (Advanced)

**Status:** QR code works, no wallet integration

### Task 5.1: Install Pass Generation Libraries

```bash
pnpm add passkit-generator  # For Apple Wallet
pnpm add @anthropic/google-wallet  # For Google Wallet (if available)
```

### Task 5.2: Create Wallet Pass Service

**File:** `apps/api/src/shared/wallet/wallet-pass.service.ts`

Methods:
- `generateApplePass(member)` - Creates .pkpass file
- `generateGooglePass(member)` - Creates Google Wallet JWT
- Pass template with club branding
- Member info (name, number, photo, QR)

### Task 5.3: Add Wallet Pass Endpoints

**File:** `apps/api/src/graphql/members/members.resolver.ts`

Add queries:
- `appleWalletPass(memberId)` - Returns base64 .pkpass
- `googleWalletUrl(memberId)` - Returns save-to-wallet URL

### Task 5.4: Add Wallet Buttons to Member Portal

**File:** `apps/member-portal/src/app/portal/member-id/page.tsx`

Add "Add to Apple Wallet" and "Add to Google Wallet" buttons below QR code.

---

## Critical Files Reference

| Purpose | Path |
|---------|------|
| Member Detail Page | `apps/application/src/app/(dashboard)/members/[id]/page.tsx` |
| Billing Hooks | `apps/application/src/hooks/use-billing.ts` |
| AR History Tab | `apps/application/src/components/members/tabs/ar-history-tab.tsx` |
| Profile Tab | `apps/application/src/components/members/profile-tab.tsx` |
| Prisma Schema | `database/prisma/schema.prisma` |
| GraphQL Billing | `apps/api/src/graphql/billing/` |
| Billing Page | `apps/application/src/app/(dashboard)/billing/page.tsx` |
| Statement Modal | `apps/application/src/components/billing/statement-modal.tsx` |
| Member Statement | `apps/application/src/components/billing/member-statement.tsx` |
| Billing Resolver | `apps/api/src/graphql/billing/billing.resolver.ts` |
| Billing Service | `apps/api/src/modules/billing/billing.service.ts` |
| Supabase Storage | `apps/api/src/shared/supabase/supabase-storage.service.ts` |
| Member Portal ID | `apps/member-portal/src/app/portal/member-id/page.tsx` |
| API Client Ops | `packages/api-client/src/operations/` |

---

## Verification Plan

### Phase 1 Verification:
1. Open member with invoices/payments
2. Navigate to Billing History tab
3. Verify transactions appear with correct amounts and running balance
4. Verify balance color-coding (red for owing, green for credit)

### Phase 1B Verification:
1. Go to Billing module > Statements tab
2. Click "New Statement" - modal should open
3. Select a member with transaction history
4. Choose date range (e.g., "Last 3 months")
5. Click "Generate" - statement should display with:
   - Member name, number, membership type
   - Period dates
   - Opening balance
   - Transaction list with running balances
   - Closing balance
6. Verify Download/Print buttons function (optional for MVP)

### Phase 2 Verification:
1. Open member profile tab
2. Click "Add Address" - modal should open
3. Fill form and save - address appears in list
4. Click edit on address - modal opens with data
5. Delete address - confirms and removes

### Phase 3 Verification:
1. Navigate to new Documents tab
2. Upload PDF document - appears in grid
3. Download document - file downloads
4. Delete document - confirms and removes
5. Verify document - badge updates

### Phase 4 Verification:
1. Open member billing section
2. Add payment method - card appears in list
3. Enable auto-pay - settings modal works
4. View auto-pay history in AR tab

### Phase 5 Verification:
1. Open member portal on mobile
2. Click "Add to Apple Wallet" - pass downloads
3. Open Wallet app - card appears
4. Scan QR at gate - validates correctly

---

## Implementation Order

**Selected Scope: Phases 1, 1B, 2, 3, 4** (Wallet passes deferred)

**Sequence:**

1. **Phase 1** - Connect Transaction History UI (member AR history tab)
2. **Phase 1B** - Enable Statement Viewing (billing module statements tab)
3. **Phase 2** - Complete Address Management UI
4. **Phase 4** - Auto-Pay Settings UI (reordered before Phase 3 since backend is ready)
5. **Phase 3** - Member Document Storage

**Deferred:** Phase 5 (Apple/Google Wallet Passes) - requires Apple Developer certificates

---

## Task Checklist

### Phase 1: Transaction History
- [ ] Task 1.1: Create `useMemberTransactions` hook in `use-billing.ts`
- [ ] Task 1.2: Connect hook to member detail page (replace empty array)
- [ ] Task 1.3: Verify AR History tab displays data

### Phase 1B: Statement Viewing
- [ ] Task 1B.1: Add Statement GraphQL query (input type, return type, resolver)
- [ ] Task 1B.2: Implement `generateStatement` method in BillingService
- [ ] Task 1B.3: Add GraphQL operations and `useGenerateStatement` hook
- [ ] Task 1B.4: Replace mock `handleFetchStatement` in billing page with real API
- [ ] Task 1B.5: Run codegen and verify statement generation works

### Phase 2: Address Management
- [ ] Task 2.1: Create `address-modal.tsx` component
- [ ] Task 2.2: Add address GraphQL mutations (if not exists)
- [ ] Task 2.3: Wire modal to profile tab

### Phase 4: Auto-Pay Settings UI
- [ ] Task 4.1: Create `billing-methods-section.tsx` for payment methods display
- [ ] Task 4.2: Create `auto-pay-modal.tsx` for settings configuration
- [ ] Task 4.3: Add auto-pay history to AR tab

### Phase 3: Document Storage
- [ ] Task 3.1: Add `MemberDocument` model and `DocumentType` enum to schema
- [ ] Task 3.2: Run migration: `npx prisma migrate dev --name add_member_documents`
- [ ] Task 3.3: Create documents GraphQL module (service, resolver, types, inputs)
- [ ] Task 3.4: Create `documents-tab.tsx` component
- [ ] Task 3.5: Add Documents tab to member detail page
- [ ] Task 3.6: Run codegen and verify

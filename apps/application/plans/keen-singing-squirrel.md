# Connect Receipt Tab to Real Database Data

## Context

The Receipt tab in the billing page (`apps/application/src/app/(dashboard)/billing/page.tsx`) currently renders only 2 hardcoded mock receipts (`mockReceipts`), while the database has many more payment records from the seed. The statement closing process queries real data and shows all payments, creating an inconsistency. This plan connects the receipt tab to real data via GraphQL, following the same pattern used by the invoice tab.

## Key Findings

- **Service layer already exists**: `billingService.findAllPayments()` at `apps/api/src/modules/billing/billing.service.ts:430` already queries payments with pagination, member includes, and allocations.
- **GraphQL types already exist**: `PaymentType`, `PaymentConnection` at `billing.types.ts:241-277`.
- **Transform function exists**: `transformPayment()` at `billing.resolver.ts:877-896`.
- **Missing**: A `@Query` for `payments` in the resolver (only `recordPayment` mutation exists).
- **Missing**: A `PaymentsQueryArgs` input type.
- **Missing**: A `GetPayments` GraphQL operation in `billing.graphql`.
- **Missing**: A `usePayments()` hook in `use-billing.ts`.
- **PaymentType needs extension**: Current type lacks `allocations` and `status` fields needed by `ReceiptRegisterItem`.

## Approach

Follow the exact pattern of `getInvoices` → `useGetInvoicesQuery` → `useInvoices()` → `InvoiceRegister`.

### Note on `outlet` and `whtAmount`

The Prisma `Payment` model has no `outlet` or `whtAmount` fields. For the receipt register:
- `outlet`: Default to `'Main Office'` (the Payment model doesn't track this)
- `whtAmount`: Default to `0` (WHT is tracked separately via WHT certificates)

---

## Tasks

### Task 1: Add `PaymentsQueryArgs` input type

**File**: `apps/api/src/graphql/billing/billing.input.ts`

Add after `InvoicesQueryArgs` (line ~189):

```typescript
@ArgsType()
export class PaymentsQueryArgs extends PaginationArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field(() => PaymentMethod, { nullable: true })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @Field({ nullable: true })
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  endDate?: Date;
}
```

### Task 2: Extend `PaymentType` with allocations and status

**File**: `apps/api/src/graphql/billing/billing.types.ts`

Add an allocation type and add `allocations` + `status` fields to `PaymentType`:

```typescript
// Add after PaymentType (before PaymentConnection)
@ObjectType()
export class PaymentAllocationType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  invoiceId: string;

  @Field()
  invoiceNumber: string;

  @Field()
  amount: string;

  @Field()
  balanceAfter: string;
}
```

Add to `PaymentType`:
```typescript
  @Field({ nullable: true })
  status?: string;

  @Field(() => [PaymentAllocationType], { nullable: true })
  allocations?: PaymentAllocationType[];
```

### Task 3: Add `getPayments` query to resolver

**File**: `apps/api/src/graphql/billing/billing.resolver.ts`

Add after `recordPayment` mutation (~line 762), before `batchSettleInvoices`:

```typescript
@Query(() => PaymentConnection, { name: 'payments', description: 'Get paginated list of payments/receipts' })
async getPayments(
  @GqlCurrentUser() user: JwtPayload,
  @Args() args: PaymentsQueryArgs,
): Promise<PaymentConnection> {
  const { first, skip, memberId, method, startDate, endDate } = args;
  const page = skip ? Math.floor(skip / (first || 20)) + 1 : 1;
  const limit = first || 20;

  const result = await this.billingService.findAllPayments(user.tenantId, {
    memberId,
    method,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
    page,
    limit,
  });

  const edges = result.data.map((payment: any) => ({
    node: this.transformPaymentWithAllocations(payment),
    cursor: encodeCursor(payment.id),
  }));

  return {
    edges,
    pageInfo: {
      hasNextPage: page < result.meta.totalPages,
      hasPreviousPage: page > 1,
      startCursor: edges.length > 0 ? edges[0].cursor : null,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    },
    totalCount: result.meta.total,
  };
}
```

Add `transformPaymentWithAllocations` private method:

```typescript
private transformPaymentWithAllocations(payment: any): PaymentType {
  return {
    ...this.transformPayment(payment),
    status: payment.status || 'completed',
    allocations: payment.allocations?.map((a: any) => ({
      id: a.id,
      invoiceId: a.invoiceId,
      invoiceNumber: a.invoice?.invoiceNumber || '',
      amount: a.amount?.toString() || '0',
      balanceAfter: a.invoice?.balanceDue?.toString() || '0',
    })) || [],
  };
}
```

### Task 4: Extend `findAllPayments` service with method/date filters

**File**: `apps/api/src/modules/billing/billing.service.ts`

Update `findAllPayments` options to support `method`, `startDate`, `endDate`:

```typescript
async findAllPayments(
  tenantId: string,
  options?: {
    memberId?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  },
) {
  const { memberId, method, startDate, endDate, page = 1, limit = 20 } = options || {};

  const where: any = { clubId: tenantId };
  if (memberId) where.memberId = memberId;
  if (method) where.method = method;
  if (startDate || endDate) {
    where.paymentDate = {};
    if (startDate) where.paymentDate.gte = new Date(startDate);
    if (endDate) where.paymentDate.lte = new Date(endDate);
  }
  // ... rest stays the same
}
```

### Task 5: Regenerate GraphQL schema

```bash
cd apps/api && pnpm run dev  # Start briefly, let schema.gql regenerate, then stop
```

### Task 6: Add `GetPayments` GraphQL operation

**File**: `packages/api-client/src/operations/billing.graphql`

Add after `GetInvoices` query:

```graphql
query GetPayments(
  $first: Int
  $skip: Int
  $memberId: ID
  $method: PaymentMethod
  $startDate: DateTime
  $endDate: DateTime
) {
  payments(
    first: $first
    skip: $skip
    memberId: $memberId
    method: $method
    startDate: $startDate
    endDate: $endDate
  ) {
    edges {
      node {
        id
        receiptNumber
        amount
        method
        paymentDate
        referenceNumber
        status
        createdAt
        member {
          id
          memberId
          firstName
          lastName
        }
        allocations {
          id
          invoiceId
          invoiceNumber
          amount
          balanceAfter
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

### Task 7: Run codegen

```bash
pnpm --filter @clubvantage/api-client run codegen
```

### Task 8: Create `usePayments()` hook

**File**: `apps/application/src/hooks/use-billing.ts`

Add imports for `useGetPaymentsQuery` from `@clubvantage/api-client`.

Add `PaymentMethod` mapping and transform function:

```typescript
function mapPaymentMethod(apiMethod: string): ReceiptRegisterItem['method'] {
  const methodMap: Record<string, ReceiptRegisterItem['method']> = {
    CASH: 'cash',
    CREDIT_CARD: 'card',
    BANK_TRANSFER: 'transfer',
    CHECK: 'check',
    QR_PROMPTPAY: 'transfer',
    DIRECT_DEBIT: 'transfer',
  };
  return methodMap[apiMethod] || 'cash';
}

function transformPayment(apiPayment: any): ReceiptRegisterItem {
  return {
    id: apiPayment.id,
    receiptNumber: apiPayment.receiptNumber || '',
    memberId: apiPayment.member?.memberId || '',
    memberName: apiPayment.member
      ? `${apiPayment.member.firstName} ${apiPayment.member.lastName}`
      : '',
    date: new Date(apiPayment.paymentDate),
    amount: parseFloat(apiPayment.amount || '0'),
    method: mapPaymentMethod(apiPayment.method),
    outlet: 'Main Office',
    status: (apiPayment.status || 'completed') as ReceiptRegisterItem['status'],
    allocations: (apiPayment.allocations || []).map((a: any) => ({
      invoiceId: a.invoiceId,
      invoiceNumber: a.invoiceNumber,
      amountAllocated: parseFloat(a.amount || '0'),
      balanceAfter: parseFloat(a.balanceAfter || '0'),
    })),
  };
}
```

Add hook:

```typescript
export interface UsePaymentsOptions {
  page?: number;
  pageSize?: number;
  memberId?: string;
  method?: string;
  startDate?: Date;
  endDate?: Date;
  enabled?: boolean;
}

export function usePayments(options: UsePaymentsOptions = {}) {
  const { page = 1, pageSize = 20, memberId, method, startDate, endDate, enabled = true } = options;

  const { data, isLoading, error, refetch } = useGetPaymentsQuery(
    {
      first: pageSize,
      skip: (page - 1) * pageSize,
      memberId: memberId || undefined,
      method: method as any,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    },
    { enabled }
  );

  const receipts = useMemo(() => {
    if (!data?.payments?.edges) return [];
    return data.payments.edges.map((edge: any) => transformPayment(edge.node));
  }, [data]);

  const totalCount = data?.payments?.totalCount || 0;

  const summary = useMemo((): ReceiptRegisterSummary => {
    const totals = { totalReceipts: totalCount, cashReceived: 0, whtReceived: 0, invoicesSettled: 0, depositsToCredit: 0 };
    receipts.forEach((r) => { totals.cashReceived += r.amount; });
    return totals;
  }, [receipts, totalCount]);

  return {
    receipts,
    summary,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    isLoading,
    error,
    refetch,
  };
}
```

### Task 9: Update billing page to use real data

**File**: `apps/application/src/app/(dashboard)/billing/page.tsx`

1. Import `usePayments` from `@/hooks/use-billing`
2. Add `receiptPage` state: `const [receiptPage, setReceiptPage] = useState(1)`
3. Call hook: `const { receipts, summary: receiptSummary, totalCount: receiptTotalCount, totalPages: receiptTotalPages, isLoading: isReceiptsLoading } = usePayments({ page: receiptPage, pageSize: 20 })`
4. Replace the receipt tab case to use real data:

```tsx
case 'receipts':
  return (
    <ReceiptRegister
      receipts={receipts}
      summary={receiptSummary}
      outlets={['Main Office', 'Pro Shop', 'Restaurant', 'Fitness Center']}
      currentPage={receiptPage}
      totalPages={receiptTotalPages}
      totalCount={receiptTotalCount}
      pageSize={20}
      isLoading={isReceiptsLoading}
      onCreateReceipt={handleNewReceipt}
      onRowAction={(action, id) => {
        if (action === 'view') router.push(`/billing/receipts/${id}`)
        else if (action === 'download') console.log('Download receipt PDF:', id)
        else if (action === 'void') console.log('Void receipt:', id)
      }}
      onPageChange={setReceiptPage}
    />
  )
```

5. Remove `mockReceipts` and `mockReceiptSummary` constants.

---

## Files Modified

| File | Change |
|------|--------|
| `apps/api/src/graphql/billing/billing.input.ts` | Add `PaymentsQueryArgs` |
| `apps/api/src/graphql/billing/billing.types.ts` | Add `PaymentAllocationType`, extend `PaymentType` |
| `apps/api/src/graphql/billing/billing.resolver.ts` | Add `getPayments` query + `transformPaymentWithAllocations` |
| `apps/api/src/modules/billing/billing.service.ts` | Extend `findAllPayments` with method/date filters |
| `packages/api-client/src/operations/billing.graphql` | Add `GetPayments` query |
| `apps/application/src/hooks/use-billing.ts` | Add `usePayments()` hook |
| `apps/application/src/app/(dashboard)/billing/page.tsx` | Replace mock data with `usePayments()` |

## Verification

1. Start the API server briefly to regenerate `schema.gql`:
   ```bash
   cd apps/api && pnpm run dev
   ```
2. Run codegen:
   ```bash
   pnpm --filter @clubvantage/api-client run codegen
   ```
3. TypeScript check on API:
   ```bash
   cd apps/api && pnpm exec tsc --noEmit
   ```
4. TypeScript check on staff app:
   ```bash
   cd apps/application && npx tsc --noEmit
   ```
5. Verify receipt tab loads real data from the database (all seeded payments should appear, not just 2).

# POS Phase 5: Advanced Features - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement 6 advanced POS features: Unified Ledger (gift cards/credits), VIP Member Recognition, Commission Tracking, Barcode Scanning, Advanced Inventory, and Offline Mode with Sync.

**Architecture:** Each feature follows a layered approach: Prisma schema → GraphQL types/inputs → Service layer → Resolvers → API Client codegen → React components. Features build on existing POS infrastructure from Phases 1-4, adding cross-outlet capabilities and operational enhancements.

**Tech Stack:** Prisma ORM, NestJS GraphQL, TanStack Query, React, Tailwind CSS, Radix UI primitives, IndexedDB (offline), Web Workers (sync), Quagga.js (barcode scanning).

---

## Prerequisites

Before starting implementation:
1. Ensure Phases 1-4 are complete
2. Create feature branch: `git checkout -b feature/pos-phase5-advanced`
3. Verify dev environment: `pnpm dev`

---

## Part 1: Unified Ledger (Gift Cards & Credits)

### Task 1: Add Unified Ledger Prisma Models

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add the GiftCard and related models**

Add at the end of the schema file:

```prisma
// ─────────────────────────────────────────────────────────────
// UNIFIED LEDGER - GIFT CARDS & CREDITS
// ─────────────────────────────────────────────────────────────

enum LedgerAccountType {
  GIFT_CARD
  STORE_CREDIT
  PREPAID_PACKAGE
  LOYALTY_POINTS
}

enum LedgerTransactionType {
  ISSUE
  REDEEM
  REFUND
  ADJUSTMENT
  TRANSFER
  EXPIRE
}

model LedgerAccount {
  id                String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId            String              @db.Uuid
  club              Club                @relation(fields: [clubId], references: [id], onDelete: Cascade)

  accountNumber     String              @db.VarChar(50)
  accountType       LedgerAccountType

  // Owner (one of these)
  memberId          String?             @db.Uuid
  member            Member?             @relation(fields: [memberId], references: [id])
  holderName        String?             @db.VarChar(255)
  holderEmail       String?             @db.VarChar(255)
  holderPhone       String?             @db.VarChar(50)

  // Balance
  initialBalance    Decimal             @db.Decimal(12, 2)
  currentBalance    Decimal             @db.Decimal(12, 2)
  currency          String              @default("THB") @db.VarChar(3)

  // Gift card specifics
  cardNumber        String?             @unique @db.VarChar(50)
  pin               String?             @db.VarChar(10)
  barcode           String?             @db.VarChar(100)

  // Validity
  issuedAt          DateTime            @default(now())
  activatedAt       DateTime?
  expiresAt         DateTime?
  isActive          Boolean             @default(true)

  // Usage restrictions
  validOutlets      String[]            @default([])
  minRedemption     Decimal?            @db.Decimal(10, 2)
  maxRedemption     Decimal?            @db.Decimal(10, 2)

  // Source tracking
  sourceType        String?             @db.VarChar(50)
  sourceId          String?             @db.Uuid
  purchasedById     String?             @db.Uuid
  purchaseAmount    Decimal?            @db.Decimal(12, 2)

  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  transactions      LedgerTransaction[]

  @@unique([clubId, accountNumber])
  @@index([clubId])
  @@index([cardNumber])
  @@index([memberId])
  @@index([clubId, accountType])
  @@map("ledger_accounts")
}

model LedgerTransaction {
  id                String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  accountId         String                @db.Uuid
  account           LedgerAccount         @relation(fields: [accountId], references: [id], onDelete: Cascade)

  transactionType   LedgerTransactionType
  amount            Decimal               @db.Decimal(12, 2)
  balanceBefore     Decimal               @db.Decimal(12, 2)
  balanceAfter      Decimal               @db.Decimal(12, 2)

  // Where it was used
  outletType        String?               @db.VarChar(50)
  outletId          String?               @db.Uuid
  reference         String?               @db.VarChar(100)

  // Link to payment
  paymentTransactionId String?            @db.Uuid

  description       String                @db.VarChar(500)
  performedBy       String                @db.Uuid
  performedAt       DateTime              @default(now())

  // Reversal tracking
  isReversed        Boolean               @default(false)
  reversedBy        String?               @db.Uuid
  reversedAt        DateTime?
  reversalReason    String?               @db.VarChar(500)
  originalTransactionId String?           @db.Uuid

  createdAt         DateTime              @default(now())

  @@index([accountId])
  @@index([performedAt])
  @@index([outletType, outletId])
  @@map("ledger_transactions")
}
```

**Step 2: Add relation to Club model**

Find the `Club` model and add:

```prisma
model Club {
  // ... existing fields ...
  ledgerAccounts    LedgerAccount[]
}
```

**Step 3: Add relation to Member model**

Find the `Member` model and add:

```prisma
model Member {
  // ... existing fields ...
  ledgerAccounts    LedgerAccount[]
}
```

**Step 4: Generate and migrate**

```bash
cd database && pnpm prisma generate && pnpm prisma migrate dev --name add_unified_ledger
```

**Step 5: Commit**

```bash
git add database/prisma/
git commit -m "feat(db): add Unified Ledger models for gift cards and credits

- Add LedgerAccountType enum (GIFT_CARD, STORE_CREDIT, etc.)
- Add LedgerTransactionType enum (ISSUE, REDEEM, etc.)
- Add LedgerAccount model with balance tracking
- Add LedgerTransaction for transaction history
- Support cross-outlet redemption with validOutlets"
```

---

### Task 2: Add Unified Ledger GraphQL Types

**Files:**
- Create: `/apps/api/src/graphql/pos/ledger.types.ts`

**Step 1: Create the types file**

```typescript
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { LedgerAccountType, LedgerTransactionType } from '@prisma/client';

registerEnumType(LedgerAccountType, {
  name: 'LedgerAccountType',
  description: 'Type of ledger account',
});

registerEnumType(LedgerTransactionType, {
  name: 'LedgerTransactionType',
  description: 'Type of ledger transaction',
});

@ObjectType()
export class LedgerAccountType {
  @Field(() => ID)
  id: string;

  @Field()
  clubId: string;

  @Field()
  accountNumber: string;

  @Field(() => LedgerAccountType)
  accountType: LedgerAccountType;

  @Field({ nullable: true })
  memberId?: string;

  @Field({ nullable: true })
  holderName?: string;

  @Field({ nullable: true })
  holderEmail?: string;

  @Field()
  initialBalance: number;

  @Field()
  currentBalance: number;

  @Field()
  currency: string;

  @Field({ nullable: true })
  cardNumber?: string;

  @Field({ nullable: true })
  barcode?: string;

  @Field()
  issuedAt: Date;

  @Field({ nullable: true })
  activatedAt?: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field()
  isActive: boolean;

  @Field(() => [String])
  validOutlets: string[];

  @Field({ nullable: true })
  minRedemption?: number;

  @Field({ nullable: true })
  maxRedemption?: number;
}

@ObjectType()
export class LedgerTransactionType {
  @Field(() => ID)
  id: string;

  @Field()
  accountId: string;

  @Field(() => LedgerTransactionType)
  transactionType: LedgerTransactionType;

  @Field()
  amount: number;

  @Field()
  balanceBefore: number;

  @Field()
  balanceAfter: number;

  @Field({ nullable: true })
  outletType?: string;

  @Field({ nullable: true })
  reference?: string;

  @Field()
  description: string;

  @Field()
  performedAt: Date;

  @Field()
  isReversed: boolean;
}

@ObjectType()
export class LedgerBalanceCheckResult {
  @Field()
  accountId: string;

  @Field()
  accountNumber: string;

  @Field()
  currentBalance: number;

  @Field()
  requestedAmount: number;

  @Field()
  hasSufficientBalance: boolean;

  @Field({ nullable: true })
  shortfall?: number;

  @Field()
  isActive: boolean;

  @Field()
  isExpired: boolean;

  @Field()
  isValidForOutlet: boolean;
}

@ObjectType()
export class RedeemResult {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  transactionId?: string;

  @Field({ nullable: true })
  amountRedeemed?: number;

  @Field({ nullable: true })
  remainingBalance?: number;
}

@ObjectType()
export class GiftCardLookupResult {
  @Field()
  found: boolean;

  @Field({ nullable: true })
  account?: LedgerAccountType;

  @Field({ nullable: true })
  error?: string;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/pos/ledger.types.ts
git commit -m "feat(api): add Unified Ledger GraphQL types

- Add LedgerAccountType for account display
- Add LedgerTransactionType for transaction history
- Add LedgerBalanceCheckResult for validation
- Add RedeemResult for redemption operations
- Add GiftCardLookupResult for card lookups"
```

---

### Task 3: Add Unified Ledger GraphQL Inputs

**Files:**
- Create: `/apps/api/src/graphql/pos/ledger.input.ts`

**Step 1: Create the inputs file**

```typescript
import { Field, ID, InputType } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsEnum, IsArray, Min, IsEmail } from 'class-validator';
import { LedgerAccountType } from '@prisma/client';

@InputType()
export class CreateGiftCardInput {
  @Field()
  @IsNumber()
  @Min(0)
  initialBalance: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  holderName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  holderEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  holderPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  expiresAt?: Date;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  validOutlets?: string[];
}

@InputType()
export class CreateStoreCreditInput {
  @Field()
  @IsString()
  memberId: string;

  @Field()
  @IsNumber()
  @Min(0)
  amount: number;

  @Field()
  @IsString()
  reason: string;

  @Field({ nullable: true })
  @IsOptional()
  expiresAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sourceType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sourceId?: string;
}

@InputType()
export class LookupGiftCardInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  barcode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accountNumber?: string;
}

@InputType()
export class CheckBalanceInput {
  @Field()
  @IsString()
  accountId: string;

  @Field()
  @IsNumber()
  @Min(0)
  amount: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  outletType?: string;
}

@InputType()
export class RedeemInput {
  @Field()
  @IsString()
  accountId: string;

  @Field()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @Field()
  @IsString()
  outletType: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  outletId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reference?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  pin?: string;
}

@InputType()
export class RefundToLedgerInput {
  @Field()
  @IsString()
  accountId: string;

  @Field()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @Field()
  @IsString()
  reason: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  originalTransactionId?: string;
}

@InputType()
export class TransferBalanceInput {
  @Field()
  @IsString()
  fromAccountId: string;

  @Field()
  @IsString()
  toAccountId: string;

  @Field()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}

@InputType()
export class AdjustBalanceInput {
  @Field()
  @IsString()
  accountId: string;

  @Field()
  @IsNumber()
  amount: number; // Can be negative

  @Field()
  @IsString()
  reason: string;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/pos/ledger.input.ts
git commit -m "feat(api): add Unified Ledger GraphQL inputs

- Add CreateGiftCardInput for issuing gift cards
- Add CreateStoreCreditInput for member credits
- Add LookupGiftCardInput for card/barcode lookup
- Add RedeemInput for redemption with PIN validation
- Add TransferBalanceInput for balance transfers"
```

---

### Task 4: Create Unified Ledger Service

**Files:**
- Create: `/apps/api/src/graphql/pos/ledger.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { LedgerAccountType, LedgerTransactionType } from '@prisma/client';
import {
  CreateGiftCardInput,
  CreateStoreCreditInput,
  LookupGiftCardInput,
  CheckBalanceInput,
  RedeemInput,
  RefundToLedgerInput,
  TransferBalanceInput,
  AdjustBalanceInput,
} from './ledger.input';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  // Generate unique card number: GC-XXXX-XXXX-XXXX
  private generateCardNumber(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'GC';
    for (let i = 0; i < 3; i++) {
      result += '-';
      for (let j = 0; j < 4; j++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    return result;
  }

  // Generate PIN: 4 digits
  private generatePin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Generate account number: ACC-YYYYMM-NNNNN
  private async generateAccountNumber(clubId: string): Promise<string> {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const prefix = `ACC-${yearMonth}-`;

    const lastAccount = await this.prisma.ledgerAccount.findFirst({
      where: { clubId, accountNumber: { startsWith: prefix } },
      orderBy: { accountNumber: 'desc' },
    });

    const nextNum = lastAccount
      ? parseInt(lastAccount.accountNumber.split('-')[2], 10) + 1
      : 1;

    return `${prefix}${nextNum.toString().padStart(5, '0')}`;
  }

  // Create a gift card
  async createGiftCard(clubId: string, input: CreateGiftCardInput, createdBy: string) {
    const accountNumber = await this.generateAccountNumber(clubId);
    const cardNumber = this.generateCardNumber();
    const pin = this.generatePin();

    const account = await this.prisma.ledgerAccount.create({
      data: {
        clubId,
        accountNumber,
        accountType: 'GIFT_CARD',
        memberId: input.memberId,
        holderName: input.holderName,
        holderEmail: input.holderEmail,
        holderPhone: input.holderPhone,
        initialBalance: input.initialBalance,
        currentBalance: input.initialBalance,
        cardNumber,
        pin,
        barcode: cardNumber.replace(/-/g, ''),
        expiresAt: input.expiresAt,
        validOutlets: input.validOutlets || [],
        activatedAt: new Date(),
        transactions: {
          create: {
            transactionType: 'ISSUE',
            amount: input.initialBalance,
            balanceBefore: 0,
            balanceAfter: input.initialBalance,
            description: 'Gift card issued',
            performedBy: createdBy,
          },
        },
      },
    });

    return { ...account, pin }; // Return PIN only on creation
  }

  // Create store credit for a member
  async createStoreCredit(clubId: string, input: CreateStoreCreditInput, createdBy: string) {
    const accountNumber = await this.generateAccountNumber(clubId);

    // Check if member has existing store credit account
    let account = await this.prisma.ledgerAccount.findFirst({
      where: {
        clubId,
        memberId: input.memberId,
        accountType: 'STORE_CREDIT',
        isActive: true,
      },
    });

    if (account) {
      // Add to existing account
      const newBalance = Number(account.currentBalance) + input.amount;

      await this.prisma.$transaction([
        this.prisma.ledgerAccount.update({
          where: { id: account.id },
          data: { currentBalance: newBalance },
        }),
        this.prisma.ledgerTransaction.create({
          data: {
            accountId: account.id,
            transactionType: 'ISSUE',
            amount: input.amount,
            balanceBefore: Number(account.currentBalance),
            balanceAfter: newBalance,
            description: input.reason,
            performedBy: createdBy,
          },
        }),
      ]);

      return this.prisma.ledgerAccount.findUnique({ where: { id: account.id } });
    }

    // Create new store credit account
    return this.prisma.ledgerAccount.create({
      data: {
        clubId,
        accountNumber,
        accountType: 'STORE_CREDIT',
        memberId: input.memberId,
        initialBalance: input.amount,
        currentBalance: input.amount,
        expiresAt: input.expiresAt,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        transactions: {
          create: {
            transactionType: 'ISSUE',
            amount: input.amount,
            balanceBefore: 0,
            balanceAfter: input.amount,
            description: input.reason,
            performedBy: createdBy,
          },
        },
      },
    });
  }

  // Lookup gift card by number, barcode, or account number
  async lookupGiftCard(clubId: string, input: LookupGiftCardInput) {
    const account = await this.prisma.ledgerAccount.findFirst({
      where: {
        clubId,
        OR: [
          input.cardNumber ? { cardNumber: input.cardNumber } : {},
          input.barcode ? { barcode: input.barcode } : {},
          input.accountNumber ? { accountNumber: input.accountNumber } : {},
        ].filter(o => Object.keys(o).length > 0),
      },
    });

    if (!account) {
      return { found: false, error: 'Card not found' };
    }

    return { found: true, account };
  }

  // Check balance and validate for redemption
  async checkBalance(clubId: string, input: CheckBalanceInput) {
    const account = await this.prisma.ledgerAccount.findUnique({
      where: { id: input.accountId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const currentBalance = Number(account.currentBalance);
    const isExpired = account.expiresAt && account.expiresAt < new Date();
    const isValidForOutlet = account.validOutlets.length === 0 ||
      (input.outletType && account.validOutlets.includes(input.outletType));

    return {
      accountId: account.id,
      accountNumber: account.accountNumber,
      currentBalance,
      requestedAmount: input.amount,
      hasSufficientBalance: currentBalance >= input.amount,
      shortfall: currentBalance < input.amount ? input.amount - currentBalance : undefined,
      isActive: account.isActive,
      isExpired: !!isExpired,
      isValidForOutlet,
    };
  }

  // Redeem from account
  async redeem(clubId: string, input: RedeemInput, performedBy: string) {
    const account = await this.prisma.ledgerAccount.findUnique({
      where: { id: input.accountId },
    });

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Validate PIN for gift cards
    if (account.accountType === 'GIFT_CARD' && account.pin) {
      if (!input.pin || input.pin !== account.pin) {
        return { success: false, error: 'Invalid PIN' };
      }
    }

    // Check if active
    if (!account.isActive) {
      return { success: false, error: 'Account is not active' };
    }

    // Check expiry
    if (account.expiresAt && account.expiresAt < new Date()) {
      return { success: false, error: 'Account has expired' };
    }

    // Check outlet validity
    if (account.validOutlets.length > 0 && !account.validOutlets.includes(input.outletType)) {
      return { success: false, error: `Not valid for ${input.outletType}` };
    }

    // Check balance
    const currentBalance = Number(account.currentBalance);
    if (currentBalance < input.amount) {
      return { success: false, error: 'Insufficient balance', remainingBalance: currentBalance };
    }

    // Check min/max redemption
    if (account.minRedemption && input.amount < Number(account.minRedemption)) {
      return { success: false, error: `Minimum redemption is ${account.minRedemption}` };
    }
    if (account.maxRedemption && input.amount > Number(account.maxRedemption)) {
      return { success: false, error: `Maximum redemption is ${account.maxRedemption}` };
    }

    const newBalance = currentBalance - input.amount;

    const transaction = await this.prisma.$transaction(async (tx) => {
      await tx.ledgerAccount.update({
        where: { id: account.id },
        data: { currentBalance: newBalance },
      });

      return tx.ledgerTransaction.create({
        data: {
          accountId: account.id,
          transactionType: 'REDEEM',
          amount: input.amount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          outletType: input.outletType,
          outletId: input.outletId,
          reference: input.reference,
          description: input.description || `Redeemed at ${input.outletType}`,
          performedBy,
        },
      });
    });

    return {
      success: true,
      transactionId: transaction.id,
      amountRedeemed: input.amount,
      remainingBalance: newBalance,
    };
  }

  // Refund to ledger account
  async refund(clubId: string, input: RefundToLedgerInput, performedBy: string) {
    const account = await this.prisma.ledgerAccount.findUnique({
      where: { id: input.accountId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const currentBalance = Number(account.currentBalance);
    const newBalance = currentBalance + input.amount;

    const transaction = await this.prisma.$transaction(async (tx) => {
      await tx.ledgerAccount.update({
        where: { id: account.id },
        data: { currentBalance: newBalance },
      });

      return tx.ledgerTransaction.create({
        data: {
          accountId: account.id,
          transactionType: 'REFUND',
          amount: input.amount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          description: input.reason,
          originalTransactionId: input.originalTransactionId,
          performedBy,
        },
      });
    });

    return { success: true, transactionId: transaction.id, newBalance };
  }

  // Transfer balance between accounts
  async transfer(clubId: string, input: TransferBalanceInput, performedBy: string) {
    const [fromAccount, toAccount] = await Promise.all([
      this.prisma.ledgerAccount.findUnique({ where: { id: input.fromAccountId } }),
      this.prisma.ledgerAccount.findUnique({ where: { id: input.toAccountId } }),
    ]);

    if (!fromAccount || !toAccount) {
      throw new NotFoundException('One or both accounts not found');
    }

    const fromBalance = Number(fromAccount.currentBalance);
    if (fromBalance < input.amount) {
      throw new BadRequestException('Insufficient balance for transfer');
    }

    const newFromBalance = fromBalance - input.amount;
    const newToBalance = Number(toAccount.currentBalance) + input.amount;

    await this.prisma.$transaction([
      this.prisma.ledgerAccount.update({
        where: { id: fromAccount.id },
        data: { currentBalance: newFromBalance },
      }),
      this.prisma.ledgerAccount.update({
        where: { id: toAccount.id },
        data: { currentBalance: newToBalance },
      }),
      this.prisma.ledgerTransaction.create({
        data: {
          accountId: fromAccount.id,
          transactionType: 'TRANSFER',
          amount: -input.amount,
          balanceBefore: fromBalance,
          balanceAfter: newFromBalance,
          description: `Transfer to ${toAccount.accountNumber}`,
          performedBy,
        },
      }),
      this.prisma.ledgerTransaction.create({
        data: {
          accountId: toAccount.id,
          transactionType: 'TRANSFER',
          amount: input.amount,
          balanceBefore: Number(toAccount.currentBalance),
          balanceAfter: newToBalance,
          description: `Transfer from ${fromAccount.accountNumber}`,
          performedBy,
        },
      }),
    ]);

    return { success: true };
  }

  // Get member's ledger accounts
  async getMemberAccounts(memberId: string) {
    return this.prisma.ledgerAccount.findMany({
      where: { memberId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get transaction history
  async getTransactionHistory(accountId: string, limit = 50) {
    return this.prisma.ledgerTransaction.findMany({
      where: { accountId },
      orderBy: { performedAt: 'desc' },
      take: limit,
    });
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/pos/ledger.service.ts
git commit -m "feat(api): add LedgerService for unified ledger operations

- Add gift card creation with card number/PIN generation
- Add store credit with cumulative balance support
- Add card lookup by number, barcode, or account
- Add redemption with PIN, expiry, and outlet validation
- Add refund and transfer operations
- Add member accounts and transaction history"
```

---

### Task 5: Create Unified Ledger Resolver

**Files:**
- Create: `/apps/api/src/graphql/pos/ledger.resolver.ts`

**Step 1: Create the resolver**

```typescript
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@/shared/auth/gql-auth.guard';
import { GqlCurrentUser } from '@/shared/auth/gql-current-user.decorator';
import { LedgerService } from './ledger.service';
import {
  LedgerAccountType as LedgerAccountObjectType,
  LedgerTransactionType as LedgerTransactionObjectType,
  LedgerBalanceCheckResult,
  RedeemResult,
  GiftCardLookupResult,
} from './ledger.types';
import {
  CreateGiftCardInput,
  CreateStoreCreditInput,
  LookupGiftCardInput,
  CheckBalanceInput,
  RedeemInput,
  RefundToLedgerInput,
  TransferBalanceInput,
} from './ledger.input';

interface CurrentUser {
  id: string;
  clubId: string;
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class LedgerResolver {
  constructor(private readonly ledgerService: LedgerService) {}

  // ─────────────────────────────────────────────────────────────
  // QUERIES
  // ─────────────────────────────────────────────────────────────

  @Query(() => GiftCardLookupResult)
  async lookupGiftCard(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: LookupGiftCardInput,
  ) {
    return this.ledgerService.lookupGiftCard(user.clubId, input);
  }

  @Query(() => LedgerBalanceCheckResult)
  async checkLedgerBalance(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CheckBalanceInput,
  ) {
    return this.ledgerService.checkBalance(user.clubId, input);
  }

  @Query(() => [LedgerAccountObjectType])
  async memberLedgerAccounts(@Args('memberId') memberId: string) {
    return this.ledgerService.getMemberAccounts(memberId);
  }

  @Query(() => [LedgerTransactionObjectType])
  async ledgerTransactionHistory(
    @Args('accountId') accountId: string,
    @Args('limit', { nullable: true, defaultValue: 50 }) limit: number,
  ) {
    return this.ledgerService.getTransactionHistory(accountId, limit);
  }

  // ─────────────────────────────────────────────────────────────
  // MUTATIONS
  // ─────────────────────────────────────────────────────────────

  @Mutation(() => LedgerAccountObjectType)
  async createGiftCard(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CreateGiftCardInput,
  ) {
    return this.ledgerService.createGiftCard(user.clubId, input, user.id);
  }

  @Mutation(() => LedgerAccountObjectType)
  async createStoreCredit(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CreateStoreCreditInput,
  ) {
    return this.ledgerService.createStoreCredit(user.clubId, input, user.id);
  }

  @Mutation(() => RedeemResult)
  async redeemFromLedger(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: RedeemInput,
  ) {
    return this.ledgerService.redeem(user.clubId, input, user.id);
  }

  @Mutation(() => RedeemResult)
  async refundToLedger(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: RefundToLedgerInput,
  ) {
    return this.ledgerService.refund(user.clubId, input, user.id);
  }

  @Mutation(() => Boolean)
  async transferLedgerBalance(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: TransferBalanceInput,
  ) {
    const result = await this.ledgerService.transfer(user.clubId, input, user.id);
    return result.success;
  }
}
```

**Step 2: Update POS module**

Add to `/apps/api/src/graphql/pos/pos.module.ts`:

```typescript
import { LedgerService } from './ledger.service';
import { LedgerResolver } from './ledger.resolver';

@Module({
  // ...
  providers: [
    // ... existing providers
    LedgerService,
    LedgerResolver,
  ],
  exports: [/* existing exports */, LedgerService],
})
```

**Step 3: Commit**

```bash
git add apps/api/src/graphql/pos/
git commit -m "feat(api): add LedgerResolver for unified ledger

- Add lookupGiftCard query for card lookup
- Add checkLedgerBalance query for validation
- Add memberLedgerAccounts query
- Add createGiftCard, createStoreCredit mutations
- Add redeemFromLedger, refundToLedger mutations
- Add transferLedgerBalance mutation"
```

---

## Part 2: VIP Member Recognition

### Task 6: Add VIP Recognition Prisma Models

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add VIP recognition models**

```prisma
// ─────────────────────────────────────────────────────────────
// VIP MEMBER RECOGNITION
// ─────────────────────────────────────────────────────────────

model VipRecognitionRule {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId            String   @db.Uuid
  club              Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)

  name              String   @db.VarChar(100)
  description       String?  @db.VarChar(500)

  // Trigger conditions (OR logic)
  membershipTiers   String[] @default([])
  minSpendAmount    Decimal? @db.Decimal(12, 2)
  minVisitsCount    Int?
  tags              String[] @default([])
  customCondition   Json?    // For complex rules

  // Alert settings
  alertType         String   @db.VarChar(50) // POPUP, BANNER, SOUND, ALL
  alertTitle        String   @db.VarChar(100)
  alertMessage      String   @db.VarChar(500)
  alertColor        String   @default("#FFD700") @db.VarChar(7)
  alertIcon         String?  @db.VarChar(50)
  alertSound        String?  @db.VarChar(100)

  // Display preferences
  showSpendHistory  Boolean  @default(false)
  showPreferences   Boolean  @default(true)
  showLastVisit     Boolean  @default(true)
  showNotes         Boolean  @default(true)

  isActive          Boolean  @default(true)
  priority          Int      @default(0)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([clubId])
  @@index([clubId, isActive])
  @@map("vip_recognition_rules")
}

model MemberPreference {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  memberId          String   @db.Uuid
  member            Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)

  category          String   @db.VarChar(50) // DINING, GOLF, SPA, GENERAL
  preferenceKey     String   @db.VarChar(100)
  preferenceValue   String   @db.VarChar(500)
  notes             String?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  createdBy         String   @db.Uuid

  @@unique([memberId, category, preferenceKey])
  @@index([memberId])
  @@map("member_preferences")
}

model MemberNote {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  memberId          String   @db.Uuid
  member            Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)

  noteType          String   @db.VarChar(50) // PREFERENCE, ALERT, GENERAL, COMPLAINT
  content           String
  isImportant       Boolean  @default(false)
  showOnCheckIn     Boolean  @default(false)
  expiresAt         DateTime?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  createdBy         String   @db.Uuid

  @@index([memberId])
  @@index([memberId, showOnCheckIn])
  @@map("member_notes")
}
```

**Step 2: Add relations to Club and Member models**

```prisma
model Club {
  // ... existing fields ...
  vipRules          VipRecognitionRule[]
}

model Member {
  // ... existing fields ...
  preferences       MemberPreference[]
  notes             MemberNote[]
}
```

**Step 3: Generate and migrate**

```bash
cd database && pnpm prisma generate && pnpm prisma migrate dev --name add_vip_recognition
```

**Step 4: Commit**

```bash
git add database/prisma/
git commit -m "feat(db): add VIP recognition models

- Add VipRecognitionRule for configurable VIP alerts
- Add MemberPreference for tracking member preferences
- Add MemberNote for check-in alerts and notes
- Support multiple trigger conditions (tier, spend, visits, tags)"
```

---

### Task 7: Create VIP Recognition Service

**Files:**
- Create: `/apps/api/src/graphql/pos/vip-recognition.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface VipAlert {
  ruleId: string;
  ruleName: string;
  alertType: string;
  alertTitle: string;
  alertMessage: string;
  alertColor: string;
  alertIcon?: string;
  alertSound?: string;
  priority: number;
}

export interface MemberRecognitionData {
  memberId: string;
  memberName: string;
  memberNumber: string;
  membershipTier?: string;
  isVip: boolean;
  vipAlerts: VipAlert[];
  preferences: Array<{
    category: string;
    key: string;
    value: string;
  }>;
  notes: Array<{
    id: string;
    type: string;
    content: string;
    isImportant: boolean;
  }>;
  stats: {
    lastVisit?: Date;
    visitCount: number;
    totalSpend: number;
    averageSpend: number;
  };
}

@Injectable()
export class VipRecognitionService {
  constructor(private readonly prisma: PrismaService) {}

  // Check if member matches VIP rules and return recognition data
  async getMemberRecognition(clubId: string, memberId: string): Promise<MemberRecognitionData> {
    // Get member with membership info
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: {
        membershipType: true,
        membershipTier: true,
        preferences: true,
        notes: {
          where: {
            showOnCheckIn: true,
            OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
          },
        },
      },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // Get active VIP rules
    const vipRules = await this.prisma.vipRecognitionRule.findMany({
      where: { clubId, isActive: true },
      orderBy: { priority: 'desc' },
    });

    // Calculate member stats
    const stats = await this.getMemberStats(memberId);

    // Check which rules apply
    const matchingAlerts: VipAlert[] = [];

    for (const rule of vipRules) {
      const matches = this.checkRuleMatch(rule, member, stats);
      if (matches) {
        matchingAlerts.push({
          ruleId: rule.id,
          ruleName: rule.name,
          alertType: rule.alertType,
          alertTitle: rule.alertTitle,
          alertMessage: this.interpolateMessage(rule.alertMessage, member, stats),
          alertColor: rule.alertColor,
          alertIcon: rule.alertIcon || undefined,
          alertSound: rule.alertSound || undefined,
          priority: rule.priority,
        });
      }
    }

    return {
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      memberNumber: member.memberId,
      membershipTier: member.membershipTier?.name,
      isVip: matchingAlerts.length > 0,
      vipAlerts: matchingAlerts,
      preferences: member.preferences.map(p => ({
        category: p.category,
        key: p.preferenceKey,
        value: p.preferenceValue,
      })),
      notes: member.notes.map(n => ({
        id: n.id,
        type: n.noteType,
        content: n.content,
        isImportant: n.isImportant,
      })),
      stats,
    };
  }

  private checkRuleMatch(rule: any, member: any, stats: any): boolean {
    // Check membership tier
    if (rule.membershipTiers.length > 0) {
      const tierCode = member.membershipTier?.code;
      if (tierCode && rule.membershipTiers.includes(tierCode)) {
        return true;
      }
    }

    // Check minimum spend
    if (rule.minSpendAmount && stats.totalSpend >= Number(rule.minSpendAmount)) {
      return true;
    }

    // Check visit count
    if (rule.minVisitsCount && stats.visitCount >= rule.minVisitsCount) {
      return true;
    }

    // Check tags
    if (rule.tags.length > 0 && member.tags.some((t: string) => rule.tags.includes(t))) {
      return true;
    }

    return false;
  }

  private interpolateMessage(message: string, member: any, stats: any): string {
    return message
      .replace('{firstName}', member.firstName)
      .replace('{lastName}', member.lastName)
      .replace('{memberNumber}', member.memberId)
      .replace('{tier}', member.membershipTier?.name || '')
      .replace('{visitCount}', stats.visitCount.toString())
      .replace('{totalSpend}', stats.totalSpend.toFixed(0));
  }

  private async getMemberStats(memberId: string) {
    // Get last check-in
    const lastCheckIn = await this.prisma.teeTimePlayer.findFirst({
      where: { memberId, checkedIn: true },
      orderBy: { checkedInAt: 'desc' },
      select: { checkedInAt: true },
    });

    // Count visits
    const visitCount = await this.prisma.teeTimePlayer.count({
      where: { memberId, checkedIn: true },
    });

    // Calculate total spend
    const spendResult = await this.prisma.bookingLineItem.aggregate({
      where: {
        teeTimePlayer: { memberId },
        isPaid: true,
      },
      _sum: { totalAmount: true },
    });

    const totalSpend = Number(spendResult._sum.totalAmount || 0);

    return {
      lastVisit: lastCheckIn?.checkedInAt,
      visitCount,
      totalSpend,
      averageSpend: visitCount > 0 ? totalSpend / visitCount : 0,
    };
  }

  // Add/update member preference
  async setPreference(
    memberId: string,
    category: string,
    key: string,
    value: string,
    createdBy: string,
  ) {
    return this.prisma.memberPreference.upsert({
      where: {
        memberId_category_preferenceKey: {
          memberId,
          category,
          preferenceKey: key,
        },
      },
      update: { preferenceValue: value },
      create: {
        memberId,
        category,
        preferenceKey: key,
        preferenceValue: value,
        createdBy,
      },
    });
  }

  // Add member note
  async addNote(
    memberId: string,
    noteType: string,
    content: string,
    options: { isImportant?: boolean; showOnCheckIn?: boolean; expiresAt?: Date },
    createdBy: string,
  ) {
    return this.prisma.memberNote.create({
      data: {
        memberId,
        noteType,
        content,
        isImportant: options.isImportant || false,
        showOnCheckIn: options.showOnCheckIn || false,
        expiresAt: options.expiresAt,
        createdBy,
      },
    });
  }

  // Create VIP rule
  async createRule(clubId: string, input: any) {
    return this.prisma.vipRecognitionRule.create({
      data: { clubId, ...input },
    });
  }

  // Get all VIP rules
  async getRules(clubId: string) {
    return this.prisma.vipRecognitionRule.findMany({
      where: { clubId },
      orderBy: { priority: 'desc' },
    });
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/pos/vip-recognition.service.ts
git commit -m "feat(api): add VipRecognitionService

- Add getMemberRecognition for check-in VIP detection
- Add rule matching logic for tier, spend, visits, tags
- Add member stats calculation
- Add preference and note management
- Add message interpolation with member data"
```

---

## Part 3: Commission Tracking

### Task 8: Add Commission Tracking Prisma Models

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add commission models**

```prisma
// ─────────────────────────────────────────────────────────────
// COMMISSION TRACKING
// ─────────────────────────────────────────────────────────────

enum CommissionType {
  PERCENTAGE
  FIXED_AMOUNT
  TIERED
}

enum CommissionStatus {
  PENDING
  APPROVED
  PAID
  DISPUTED
  CANCELLED
}

model CommissionRule {
  id                String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId            String         @db.Uuid
  club              Club           @relation(fields: [clubId], references: [id], onDelete: Cascade)

  name              String         @db.VarChar(100)
  description       String?        @db.VarChar(500)

  // Applies to
  serviceCategory   String?        @db.VarChar(50) // SPA, GOLF_LESSONS, etc.
  serviceIds        String[]       @default([])
  staffIds          String[]       @default([]) // Empty = all staff

  // Commission calculation
  commissionType    CommissionType
  rate              Decimal        @db.Decimal(10, 2) // % or fixed amount
  tiers             Json?          // For tiered: [{ min: 0, max: 1000, rate: 10 }, ...]

  // Conditions
  minServiceAmount  Decimal?       @db.Decimal(10, 2)
  includeProducts   Boolean        @default(false)
  includeRetail     Boolean        @default(false)

  isActive          Boolean        @default(true)
  effectiveFrom     DateTime?
  effectiveTo       DateTime?

  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  commissions       Commission[]

  @@index([clubId])
  @@index([clubId, serviceCategory])
  @@map("commission_rules")
}

model Commission {
  id                String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId            String           @db.Uuid
  club              Club             @relation(fields: [clubId], references: [id], onDelete: Cascade)

  staffId           String           @db.Uuid
  staff             Staff            @relation(fields: [staffId], references: [id])

  ruleId            String?          @db.Uuid
  rule              CommissionRule?  @relation(fields: [ruleId], references: [id])

  // Source transaction
  serviceType       String           @db.VarChar(50)
  serviceId         String?          @db.Uuid
  bookingId         String?          @db.Uuid
  transactionId     String?          @db.Uuid

  // Amounts
  saleAmount        Decimal          @db.Decimal(12, 2)
  commissionAmount  Decimal          @db.Decimal(12, 2)
  adjustmentAmount  Decimal          @default(0) @db.Decimal(12, 2)
  finalAmount       Decimal          @db.Decimal(12, 2)

  // Status tracking
  status            CommissionStatus @default(PENDING)
  periodStart       DateTime         @db.Date
  periodEnd         DateTime         @db.Date

  approvedBy        String?          @db.Uuid
  approvedAt        DateTime?
  paidAt            DateTime?
  paymentRef        String?          @db.VarChar(100)

  notes             String?

  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  @@index([clubId])
  @@index([staffId])
  @@index([clubId, periodStart, periodEnd])
  @@index([status])
  @@map("commissions")
}

model CommissionPayoutBatch {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId            String   @db.Uuid
  club              Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)

  batchNumber       String   @unique @db.VarChar(30)
  periodStart       DateTime @db.Date
  periodEnd         DateTime @db.Date

  totalAmount       Decimal  @db.Decimal(12, 2)
  staffCount        Int
  commissionCount   Int
  commissionIds     String[] @default([])

  status            String   @default("PENDING") @db.VarChar(20)
  processedAt       DateTime?
  processedBy       String?  @db.Uuid

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([clubId])
  @@index([clubId, periodStart, periodEnd])
  @@map("commission_payout_batches")
}
```

**Step 2: Add relations**

```prisma
model Club {
  // ... existing fields ...
  commissionRules       CommissionRule[]
  commissions           Commission[]
  commissionPayouts     CommissionPayoutBatch[]
}

model Staff {
  // ... existing fields ...
  commissions           Commission[]
}
```

**Step 3: Generate and migrate**

```bash
cd database && pnpm prisma generate && pnpm prisma migrate dev --name add_commission_tracking
```

**Step 4: Commit**

```bash
git add database/prisma/
git commit -m "feat(db): add Commission tracking models

- Add CommissionRule for configurable commission rates
- Add Commission for tracking earned commissions
- Add CommissionPayoutBatch for batch payments
- Support percentage, fixed, and tiered commission types"
```

---

### Task 9: Create Commission Service

**Files:**
- Create: `/apps/api/src/graphql/pos/commission.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CommissionType, CommissionStatus } from '@prisma/client';

@Injectable()
export class CommissionService {
  constructor(private readonly prisma: PrismaService) {}

  // Calculate commission for a completed service
  async calculateCommission(input: {
    clubId: string;
    staffId: string;
    serviceType: string;
    serviceId?: string;
    bookingId?: string;
    transactionId?: string;
    saleAmount: number;
  }) {
    // Find applicable commission rule
    const rule = await this.prisma.commissionRule.findFirst({
      where: {
        clubId: input.clubId,
        isActive: true,
        OR: [
          { serviceCategory: input.serviceType },
          { serviceIds: { has: input.serviceId } },
        ],
        AND: [
          { OR: [{ staffIds: { isEmpty: true } }, { staffIds: { has: input.staffId } }] },
          { OR: [{ effectiveFrom: null }, { effectiveFrom: { lte: new Date() } }] },
          { OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }] },
          { OR: [{ minServiceAmount: null }, { minServiceAmount: { lte: input.saleAmount } }] },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!rule) {
      return null; // No commission rule applies
    }

    // Calculate commission amount
    let commissionAmount = 0;

    if (rule.commissionType === 'PERCENTAGE') {
      commissionAmount = (input.saleAmount * Number(rule.rate)) / 100;
    } else if (rule.commissionType === 'FIXED_AMOUNT') {
      commissionAmount = Number(rule.rate);
    } else if (rule.commissionType === 'TIERED' && rule.tiers) {
      const tiers = rule.tiers as Array<{ min: number; max: number; rate: number }>;
      for (const tier of tiers) {
        if (input.saleAmount >= tier.min && input.saleAmount <= tier.max) {
          commissionAmount = (input.saleAmount * tier.rate) / 100;
          break;
        }
      }
    }

    // Determine period
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Create commission record
    return this.prisma.commission.create({
      data: {
        clubId: input.clubId,
        staffId: input.staffId,
        ruleId: rule.id,
        serviceType: input.serviceType,
        serviceId: input.serviceId,
        bookingId: input.bookingId,
        transactionId: input.transactionId,
        saleAmount: input.saleAmount,
        commissionAmount,
        finalAmount: commissionAmount,
        status: 'PENDING',
        periodStart,
        periodEnd,
      },
    });
  }

  // Get staff commission summary for a period
  async getStaffCommissionSummary(staffId: string, periodStart: Date, periodEnd: Date) {
    const commissions = await this.prisma.commission.findMany({
      where: {
        staffId,
        periodStart: { gte: periodStart },
        periodEnd: { lte: periodEnd },
      },
      include: { rule: true },
    });

    const summary = {
      staffId,
      periodStart,
      periodEnd,
      totalSales: 0,
      totalCommission: 0,
      pendingAmount: 0,
      approvedAmount: 0,
      paidAmount: 0,
      commissionCount: commissions.length,
      byServiceType: {} as Record<string, { sales: number; commission: number }>,
    };

    for (const comm of commissions) {
      summary.totalSales += Number(comm.saleAmount);
      summary.totalCommission += Number(comm.finalAmount);

      if (comm.status === 'PENDING') {
        summary.pendingAmount += Number(comm.finalAmount);
      } else if (comm.status === 'APPROVED') {
        summary.approvedAmount += Number(comm.finalAmount);
      } else if (comm.status === 'PAID') {
        summary.paidAmount += Number(comm.finalAmount);
      }

      if (!summary.byServiceType[comm.serviceType]) {
        summary.byServiceType[comm.serviceType] = { sales: 0, commission: 0 };
      }
      summary.byServiceType[comm.serviceType].sales += Number(comm.saleAmount);
      summary.byServiceType[comm.serviceType].commission += Number(comm.finalAmount);
    }

    return summary;
  }

  // Approve commissions
  async approveCommissions(commissionIds: string[], approvedBy: string) {
    await this.prisma.commission.updateMany({
      where: { id: { in: commissionIds }, status: 'PENDING' },
      data: { status: 'APPROVED', approvedBy, approvedAt: new Date() },
    });

    return { success: true, count: commissionIds.length };
  }

  // Create payout batch
  async createPayoutBatch(clubId: string, periodStart: Date, periodEnd: Date, createdBy: string) {
    // Get all approved commissions for the period
    const commissions = await this.prisma.commission.findMany({
      where: {
        clubId,
        status: 'APPROVED',
        periodStart: { gte: periodStart },
        periodEnd: { lte: periodEnd },
      },
    });

    if (commissions.length === 0) {
      return { success: false, error: 'No approved commissions for this period' };
    }

    const totalAmount = commissions.reduce((sum, c) => sum + Number(c.finalAmount), 0);
    const staffIds = [...new Set(commissions.map(c => c.staffId))];
    const commissionIds = commissions.map(c => c.id);

    // Generate batch number
    const yearMonth = `${periodStart.getFullYear()}${(periodStart.getMonth() + 1).toString().padStart(2, '0')}`;
    const count = await this.prisma.commissionPayoutBatch.count({
      where: { clubId, batchNumber: { startsWith: `PAY-${yearMonth}` } },
    });
    const batchNumber = `PAY-${yearMonth}-${(count + 1).toString().padStart(3, '0')}`;

    const batch = await this.prisma.commissionPayoutBatch.create({
      data: {
        clubId,
        batchNumber,
        periodStart,
        periodEnd,
        totalAmount,
        staffCount: staffIds.length,
        commissionCount: commissions.length,
        commissionIds,
      },
    });

    return { success: true, batch };
  }

  // Process payout
  async processPayout(batchId: string, processedBy: string) {
    const batch = await this.prisma.commissionPayoutBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return { success: false, error: 'Batch not found' };
    }

    await this.prisma.$transaction([
      this.prisma.commission.updateMany({
        where: { id: { in: batch.commissionIds } },
        data: { status: 'PAID', paidAt: new Date() },
      }),
      this.prisma.commissionPayoutBatch.update({
        where: { id: batchId },
        data: { status: 'PROCESSED', processedAt: new Date(), processedBy },
      }),
    ]);

    return { success: true };
  }

  // CRUD for commission rules
  async createRule(clubId: string, input: any) {
    return this.prisma.commissionRule.create({
      data: { clubId, ...input },
    });
  }

  async getRules(clubId: string) {
    return this.prisma.commissionRule.findMany({
      where: { clubId },
      orderBy: { name: 'asc' },
    });
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/pos/commission.service.ts
git commit -m "feat(api): add CommissionService

- Add calculateCommission for automatic commission tracking
- Add getStaffCommissionSummary for period summaries
- Add approveCommissions for manager approval
- Add createPayoutBatch and processPayout for payments
- Support percentage, fixed, and tiered commission types"
```

---

## Part 4: Barcode Scanning Integration

### Task 10: Add Barcode Scanning Support

**Files:**
- Create: `/apps/application/src/components/pos/barcode-scanner.tsx`

**Step 1: Create the barcode scanner component**

```typescript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@clubvantage/ui/primitives/dialog';
import { Button } from '@clubvantage/ui/primitives/button';
import { Input } from '@clubvantage/ui/primitives/input';
import { Camera, Keyboard, X, Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
  placeholder?: string;
}

export function BarcodeScanner({
  open,
  onClose,
  onScan,
  title = 'Scan Barcode',
  placeholder = 'Enter barcode manually...',
}: BarcodeScannerProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [manualInput, setManualInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Dynamic import Quagga for barcode scanning
      const Quagga = (await import('quagga')).default;

      Quagga.init(
        {
          inputStream: {
            type: 'LiveStream',
            target: videoRef.current,
            constraints: {
              facingMode: 'environment',
            },
          },
          decoder: {
            readers: [
              'code_128_reader',
              'ean_reader',
              'ean_8_reader',
              'upc_reader',
              'upc_e_reader',
              'code_39_reader',
            ],
          },
          locate: true,
        },
        (err: Error | null) => {
          if (err) {
            setError('Failed to initialize scanner');
            setScanning(false);
            return;
          }
          Quagga.start();
        }
      );

      Quagga.onDetected((result: { codeResult: { code: string } }) => {
        if (result.codeResult.code) {
          Quagga.stop();
          stopCamera();
          onScan(result.codeResult.code);
          onClose();
        }
      });
    } catch (err) {
      setError('Camera access denied or not available');
      setScanning(false);
    }
  }, [onScan, onClose]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleModeChange = useCallback((newMode: 'camera' | 'manual') => {
    if (mode === 'camera') {
      stopCamera();
    }
    setMode(newMode);
    if (newMode === 'camera') {
      startCamera();
    }
  }, [mode, stopCamera, startCamera]);

  const handleManualSubmit = useCallback(() => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
      onClose();
    }
  }, [manualInput, onScan, onClose]);

  const handleClose = useCallback(() => {
    stopCamera();
    setManualInput('');
    setError(null);
    onClose();
  }, [stopCamera, onClose]);

  // Handle keyboard shortcuts for scanner input
  useEffect(() => {
    if (!open || mode !== 'manual') return;

    let buffer = '';
    let timeout: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement) return;

      // Enter completes the scan
      if (e.key === 'Enter' && buffer) {
        onScan(buffer);
        buffer = '';
        onClose();
        return;
      }

      // Add to buffer
      if (e.key.length === 1) {
        buffer += e.key;

        // Clear buffer after 100ms of no input (scanner timeout)
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          buffer = '';
        }, 100);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      clearTimeout(timeout);
    };
  }, [open, mode, onScan, onClose]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'manual' ? 'default' : 'outline'}
              onClick={() => handleModeChange('manual')}
              className="flex-1"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Manual
            </Button>
            <Button
              variant={mode === 'camera' ? 'default' : 'outline'}
              onClick={() => handleModeChange('camera')}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </Button>
          </div>

          {/* Manual input mode */}
          {mode === 'manual' && (
            <div className="space-y-2">
              <Input
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder={placeholder}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Scan with a barcode scanner or enter manually
              </p>
              <Button onClick={handleManualSubmit} disabled={!manualInput.trim()} className="w-full">
                Submit
              </Button>
            </div>
          )}

          {/* Camera mode */}
          {mode === 'camera' && (
            <div className="space-y-2">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-amber-500 w-3/4 h-1/2 rounded-lg" />
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <p className="text-xs text-muted-foreground text-center">
                Position barcode within the frame
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Add barcode lookup hook**

Create `/apps/application/src/hooks/use-barcode-lookup.ts`:

```typescript
import { useCallback } from 'react';
import { useLookupGiftCardQuery, useGetProductByBarcodeQuery } from '@clubvantage/api-client';

export type BarcodeResult =
  | { type: 'GIFT_CARD'; data: any }
  | { type: 'PRODUCT'; data: any }
  | { type: 'MEMBER'; data: any }
  | { type: 'NOT_FOUND'; barcode: string };

export function useBarcodeLookup() {
  const lookupBarcode = useCallback(async (barcode: string): Promise<BarcodeResult> => {
    // Try gift card first
    // Then try product
    // Then try member card
    // Return NOT_FOUND if none match

    // This would call the appropriate APIs
    // For now, return a placeholder
    return { type: 'NOT_FOUND', barcode };
  }, []);

  return { lookupBarcode };
}
```

**Step 3: Commit**

```bash
git add apps/application/src/components/pos/ apps/application/src/hooks/
git commit -m "feat(ui): add BarcodeScanner component

- Add camera-based barcode scanning with Quagga.js
- Add manual input mode for scanner devices
- Add keyboard buffer for hardware scanners
- Support multiple barcode formats (EAN, UPC, Code128, Code39)
- Add useBarcodeLookup hook for barcode resolution"
```

---

## Part 5: Advanced Inventory Management

### Task 11: Add Inventory Prisma Models

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add inventory models**

```prisma
// ─────────────────────────────────────────────────────────────
// ADVANCED INVENTORY MANAGEMENT
// ─────────────────────────────────────────────────────────────

enum InventoryMovementType {
  PURCHASE
  SALE
  ADJUSTMENT
  TRANSFER
  RETURN
  WASTE
  COUNT
}

model InventoryLocation {
  id                String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId            String              @db.Uuid
  club              Club                @relation(fields: [clubId], references: [id], onDelete: Cascade)

  name              String              @db.VarChar(100)
  code              String              @db.VarChar(20)
  type              String              @db.VarChar(50) // WAREHOUSE, OUTLET, DISPLAY
  address           String?

  isActive          Boolean             @default(true)
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  stock             InventoryStock[]
  movementsFrom     InventoryMovement[] @relation("MovementFromLocation")
  movementsTo       InventoryMovement[] @relation("MovementToLocation")

  @@unique([clubId, code])
  @@index([clubId])
  @@map("inventory_locations")
}

model InventoryStock {
  id                String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  locationId        String            @db.Uuid
  location          InventoryLocation @relation(fields: [locationId], references: [id], onDelete: Cascade)

  productId         String            @db.Uuid
  product           ProshopProduct    @relation(fields: [productId], references: [id])
  variantId         String?           @db.Uuid

  quantity          Int               @default(0)
  reservedQuantity  Int               @default(0)
  availableQuantity Int               @default(0)
  reorderPoint      Int?
  reorderQuantity   Int?

  lastCountedAt     DateTime?
  lastCountedBy     String?           @db.Uuid

  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  @@unique([locationId, productId, variantId])
  @@index([locationId])
  @@index([productId])
  @@map("inventory_stock")
}

model InventoryMovement {
  id                String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId            String                @db.Uuid
  club              Club                  @relation(fields: [clubId], references: [id], onDelete: Cascade)

  movementType      InventoryMovementType
  referenceNumber   String                @unique @db.VarChar(30)

  productId         String                @db.Uuid
  product           ProshopProduct        @relation(fields: [productId], references: [id])
  variantId         String?               @db.Uuid

  fromLocationId    String?               @db.Uuid
  fromLocation      InventoryLocation?    @relation("MovementFromLocation", fields: [fromLocationId], references: [id])
  toLocationId      String?               @db.Uuid
  toLocation        InventoryLocation?    @relation("MovementToLocation", fields: [toLocationId], references: [id])

  quantity          Int
  unitCost          Decimal?              @db.Decimal(10, 2)
  totalCost         Decimal?              @db.Decimal(12, 2)

  reason            String?               @db.VarChar(500)
  notes             String?

  // Source reference
  sourceType        String?               @db.VarChar(50)
  sourceId          String?               @db.Uuid

  performedBy       String                @db.Uuid
  performedAt       DateTime              @default(now())

  createdAt         DateTime              @default(now())

  @@index([clubId])
  @@index([productId])
  @@index([fromLocationId])
  @@index([toLocationId])
  @@index([performedAt])
  @@map("inventory_movements")
}

model InventoryCount {
  id                String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId            String               @db.Uuid
  club              Club                 @relation(fields: [clubId], references: [id], onDelete: Cascade)

  locationId        String               @db.Uuid
  countNumber       String               @unique @db.VarChar(30)
  countDate         DateTime             @db.Date
  status            String               @default("IN_PROGRESS") @db.VarChar(20)

  totalItems        Int                  @default(0)
  countedItems      Int                  @default(0)
  discrepancies     Int                  @default(0)

  startedAt         DateTime             @default(now())
  completedAt       DateTime?
  approvedAt        DateTime?
  approvedBy        String?              @db.Uuid

  notes             String?

  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt

  items             InventoryCountItem[]

  @@index([clubId])
  @@index([locationId])
  @@map("inventory_counts")
}

model InventoryCountItem {
  id                String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  countId           String         @db.Uuid
  count             InventoryCount @relation(fields: [countId], references: [id], onDelete: Cascade)

  productId         String         @db.Uuid
  variantId         String?        @db.Uuid

  expectedQuantity  Int
  countedQuantity   Int?
  variance          Int?
  varianceValue     Decimal?       @db.Decimal(12, 2)

  countedAt         DateTime?
  countedBy         String?        @db.Uuid
  notes             String?

  @@index([countId])
  @@map("inventory_count_items")
}
```

**Step 2: Add relations**

```prisma
model Club {
  // ... existing fields ...
  inventoryLocations    InventoryLocation[]
  inventoryMovements    InventoryMovement[]
  inventoryCounts       InventoryCount[]
}

model ProshopProduct {
  // ... existing fields ...
  inventoryStock        InventoryStock[]
  inventoryMovements    InventoryMovement[]
}
```

**Step 3: Generate and migrate**

```bash
cd database && pnpm prisma generate && pnpm prisma migrate dev --name add_inventory_management
```

**Step 4: Commit**

```bash
git add database/prisma/
git commit -m "feat(db): add Advanced Inventory Management models

- Add InventoryLocation for multi-location stock
- Add InventoryStock for per-location quantities
- Add InventoryMovement for stock tracking
- Add InventoryCount and InventoryCountItem for stock takes
- Support transfers, adjustments, returns, and waste tracking"
```

---

## Part 6: Offline Mode with Sync

### Task 12: Add Offline Queue Prisma Model

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add offline sync model**

```prisma
// ─────────────────────────────────────────────────────────────
// OFFLINE MODE & SYNC
// ─────────────────────────────────────────────────────────────

enum SyncStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
  CONFLICT
}

model OfflineSyncQueue {
  id                String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId            String     @db.Uuid
  club              Club       @relation(fields: [clubId], references: [id], onDelete: Cascade)

  deviceId          String     @db.VarChar(100)
  userId            String     @db.Uuid

  operationType     String     @db.VarChar(50)
  entityType        String     @db.VarChar(50)
  entityId          String?    @db.Uuid
  payload           Json

  clientTimestamp   DateTime
  serverTimestamp   DateTime?
  syncAttempts      Int        @default(0)
  lastAttemptAt     DateTime?

  status            SyncStatus @default(PENDING)
  errorMessage      String?
  conflictData      Json?

  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt

  @@index([clubId, deviceId])
  @@index([status])
  @@index([clubId, status])
  @@map("offline_sync_queue")
}

model DeviceSyncState {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId            String   @db.Uuid
  club              Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)

  deviceId          String   @unique @db.VarChar(100)
  deviceName        String?  @db.VarChar(100)
  lastSyncAt        DateTime?
  lastOnlineAt      DateTime @default(now())

  // Sync cursors for each entity type
  syncCursors       Json     @default("{}")

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([clubId])
  @@map("device_sync_states")
}
```

**Step 2: Add relations**

```prisma
model Club {
  // ... existing fields ...
  offlineSyncQueue      OfflineSyncQueue[]
  deviceSyncStates      DeviceSyncState[]
}
```

**Step 3: Generate and migrate**

```bash
cd database && pnpm prisma generate && pnpm prisma migrate dev --name add_offline_sync
```

**Step 4: Commit**

```bash
git add database/prisma/
git commit -m "feat(db): add Offline Mode sync models

- Add OfflineSyncQueue for queued offline operations
- Add DeviceSyncState for tracking device sync status
- Support conflict detection and resolution
- Track sync attempts and error messages"
```

---

### Task 13: Create Offline Storage Service

**Files:**
- Create: `/apps/application/src/services/offline-storage.ts`

**Step 1: Create the offline storage service**

```typescript
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'clubvantage-offline';
const DB_VERSION = 1;

interface OfflineOperation {
  id: string;
  operationType: string;
  entityType: string;
  entityId?: string;
  payload: any;
  timestamp: Date;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
  error?: string;
}

interface CachedEntity {
  id: string;
  type: string;
  data: any;
  cachedAt: Date;
  expiresAt?: Date;
}

class OfflineStorageService {
  private db: IDBPDatabase | null = null;

  async init() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Operations queue
        if (!db.objectStoreNames.contains('operations')) {
          const opStore = db.createObjectStore('operations', { keyPath: 'id' });
          opStore.createIndex('status', 'status');
          opStore.createIndex('entityType', 'entityType');
        }

        // Cached entities
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'id' });
          cacheStore.createIndex('type', 'type');
          cacheStore.createIndex('expiresAt', 'expiresAt');
        }

        // Sync metadata
        if (!db.objectStoreNames.contains('sync')) {
          db.createObjectStore('sync', { keyPath: 'key' });
        }
      },
    });
  }

  private async ensureDb() {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // ─────────────────────────────────────────────────────────────
  // OPERATIONS QUEUE
  // ─────────────────────────────────────────────────────────────

  async queueOperation(operation: Omit<OfflineOperation, 'id' | 'status' | 'retryCount'>) {
    const db = await this.ensureDb();
    const id = crypto.randomUUID();

    const op: OfflineOperation = {
      ...operation,
      id,
      status: 'pending',
      retryCount: 0,
    };

    await db.add('operations', op);
    return id;
  }

  async getPendingOperations(): Promise<OfflineOperation[]> {
    const db = await this.ensureDb();
    return db.getAllFromIndex('operations', 'status', 'pending');
  }

  async updateOperationStatus(
    id: string,
    status: OfflineOperation['status'],
    error?: string
  ) {
    const db = await this.ensureDb();
    const op = await db.get('operations', id);
    if (op) {
      op.status = status;
      if (error) op.error = error;
      if (status === 'failed') op.retryCount++;
      await db.put('operations', op);
    }
  }

  async removeOperation(id: string) {
    const db = await this.ensureDb();
    await db.delete('operations', id);
  }

  async clearCompletedOperations() {
    const db = await this.ensureDb();
    const tx = db.transaction('operations', 'readwrite');
    const index = tx.store.index('status');

    let cursor = await index.openCursor('pending');
    const pending: OfflineOperation[] = [];

    while (cursor) {
      pending.push(cursor.value);
      cursor = await cursor.continue();
    }

    await tx.store.clear();

    for (const op of pending) {
      await tx.store.add(op);
    }

    await tx.done;
  }

  // ─────────────────────────────────────────────────────────────
  // CACHE
  // ─────────────────────────────────────────────────────────────

  async cacheEntity(type: string, id: string, data: any, ttlMs?: number) {
    const db = await this.ensureDb();

    const entity: CachedEntity = {
      id: `${type}:${id}`,
      type,
      data,
      cachedAt: new Date(),
      expiresAt: ttlMs ? new Date(Date.now() + ttlMs) : undefined,
    };

    await db.put('cache', entity);
  }

  async getCachedEntity<T>(type: string, id: string): Promise<T | null> {
    const db = await this.ensureDb();
    const entity = await db.get('cache', `${type}:${id}`);

    if (!entity) return null;

    // Check expiry
    if (entity.expiresAt && new Date(entity.expiresAt) < new Date()) {
      await db.delete('cache', entity.id);
      return null;
    }

    return entity.data as T;
  }

  async getCachedEntitiesByType<T>(type: string): Promise<T[]> {
    const db = await this.ensureDb();
    const entities = await db.getAllFromIndex('cache', 'type', type);

    const now = new Date();
    const valid: T[] = [];

    for (const entity of entities) {
      if (!entity.expiresAt || new Date(entity.expiresAt) >= now) {
        valid.push(entity.data);
      }
    }

    return valid;
  }

  async clearExpiredCache() {
    const db = await this.ensureDb();
    const tx = db.transaction('cache', 'readwrite');
    const index = tx.store.index('expiresAt');
    const now = new Date();

    let cursor = await index.openCursor(IDBKeyRange.upperBound(now));

    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }

    await tx.done;
  }

  // ─────────────────────────────────────────────────────────────
  // SYNC METADATA
  // ─────────────────────────────────────────────────────────────

  async getSyncCursor(entityType: string): Promise<string | null> {
    const db = await this.ensureDb();
    const record = await db.get('sync', `cursor:${entityType}`);
    return record?.value || null;
  }

  async setSyncCursor(entityType: string, cursor: string) {
    const db = await this.ensureDb();
    await db.put('sync', { key: `cursor:${entityType}`, value: cursor });
  }

  async getLastSyncTime(): Promise<Date | null> {
    const db = await this.ensureDb();
    const record = await db.get('sync', 'lastSync');
    return record?.value ? new Date(record.value) : null;
  }

  async setLastSyncTime(time: Date) {
    const db = await this.ensureDb();
    await db.put('sync', { key: 'lastSync', value: time.toISOString() });
  }
}

export const offlineStorage = new OfflineStorageService();
```

**Step 2: Commit**

```bash
git add apps/application/src/services/
git commit -m "feat(ui): add OfflineStorageService with IndexedDB

- Add operations queue for offline mutations
- Add entity cache with TTL support
- Add sync cursor tracking
- Support for pending, syncing, failed operation states"
```

---

### Task 14: Create Sync Manager Service

**Files:**
- Create: `/apps/application/src/services/sync-manager.ts`

**Step 1: Create the sync manager**

```typescript
import { offlineStorage } from './offline-storage';

type SyncEventType = 'online' | 'offline' | 'sync-start' | 'sync-complete' | 'sync-error' | 'operation-synced';

interface SyncEvent {
  type: SyncEventType;
  data?: any;
}

class SyncManager {
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timer | null = null;
  private listeners: Map<SyncEventType, Set<(event: SyncEvent) => void>> = new Map();

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Initialize online status
    this.isOnline = navigator.onLine;
  }

  // ─────────────────────────────────────────────────────────────
  // EVENT HANDLING
  // ─────────────────────────────────────────────────────────────

  on(event: SyncEventType, callback: (event: SyncEvent) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: SyncEvent) {
    this.listeners.get(event.type)?.forEach(cb => cb(event));
  }

  // ─────────────────────────────────────────────────────────────
  // ONLINE/OFFLINE
  // ─────────────────────────────────────────────────────────────

  private handleOnline() {
    this.isOnline = true;
    this.emit({ type: 'online' });
    this.startSync();
  }

  private handleOffline() {
    this.isOnline = false;
    this.emit({ type: 'offline' });
    this.stopSync();
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // ─────────────────────────────────────────────────────────────
  // SYNC OPERATIONS
  // ─────────────────────────────────────────────────────────────

  async startSync() {
    if (this.isSyncing || !this.isOnline) return;

    this.isSyncing = true;
    this.emit({ type: 'sync-start' });

    try {
      await this.syncPendingOperations();
      await offlineStorage.setLastSyncTime(new Date());
      this.emit({ type: 'sync-complete' });
    } catch (error) {
      this.emit({ type: 'sync-error', data: error });
    } finally {
      this.isSyncing = false;
    }
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncPendingOperations() {
    const operations = await offlineStorage.getPendingOperations();

    for (const op of operations) {
      if (!this.isOnline) break;

      try {
        await offlineStorage.updateOperationStatus(op.id, 'syncing');
        await this.executeOperation(op);
        await offlineStorage.removeOperation(op.id);
        this.emit({ type: 'operation-synced', data: op });
      } catch (error: any) {
        const shouldRetry = op.retryCount < 3;
        await offlineStorage.updateOperationStatus(
          op.id,
          shouldRetry ? 'pending' : 'failed',
          error.message
        );
      }
    }
  }

  private async executeOperation(op: any) {
    // This would call the appropriate GraphQL mutation
    // based on operationType and entityType

    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operationName: op.operationType,
        variables: op.payload,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data;
  }

  // ─────────────────────────────────────────────────────────────
  // QUEUE OPERATION
  // ─────────────────────────────────────────────────────────────

  async queueOperation(
    operationType: string,
    entityType: string,
    payload: any,
    entityId?: string
  ) {
    const id = await offlineStorage.queueOperation({
      operationType,
      entityType,
      entityId,
      payload,
      timestamp: new Date(),
    });

    // Try to sync immediately if online
    if (this.isOnline && !this.isSyncing) {
      this.startSync();
    }

    return id;
  }

  // ─────────────────────────────────────────────────────────────
  // STATUS
  // ─────────────────────────────────────────────────────────────

  async getPendingCount(): Promise<number> {
    const ops = await offlineStorage.getPendingOperations();
    return ops.length;
  }

  getSyncStatus(): { isOnline: boolean; isSyncing: boolean } {
    return { isOnline: this.isOnline, isSyncing: this.isSyncing };
  }
}

export const syncManager = new SyncManager();
```

**Step 2: Commit**

```bash
git add apps/application/src/services/sync-manager.ts
git commit -m "feat(ui): add SyncManager for offline operations

- Add online/offline detection
- Add automatic sync on reconnect
- Add operation queue with retry logic
- Add sync status and event system"
```

---

### Task 15: Create Offline Status Indicator Component

**Files:**
- Create: `/apps/application/src/components/pos/offline-indicator.tsx`

**Step 1: Create the component**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@clubvantage/ui';
import { syncManager } from '@/services/sync-manager';
import { offlineStorage } from '@/services/offline-storage';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Initial status
    const status = syncManager.getSyncStatus();
    setIsOnline(status.isOnline);
    setIsSyncing(status.isSyncing);

    // Load pending count and last sync
    const loadStatus = async () => {
      const count = await syncManager.getPendingCount();
      setPendingCount(count);

      const sync = await offlineStorage.getLastSyncTime();
      setLastSync(sync);
    };
    loadStatus();

    // Subscribe to events
    const unsubOnline = syncManager.on('online', () => {
      setIsOnline(true);
    });

    const unsubOffline = syncManager.on('offline', () => {
      setIsOnline(false);
    });

    const unsubSyncStart = syncManager.on('sync-start', () => {
      setIsSyncing(true);
    });

    const unsubSyncComplete = syncManager.on('sync-complete', async () => {
      setIsSyncing(false);
      setLastSync(new Date());
      const count = await syncManager.getPendingCount();
      setPendingCount(count);
    });

    const unsubSynced = syncManager.on('operation-synced', async () => {
      const count = await syncManager.getPendingCount();
      setPendingCount(count);
    });

    return () => {
      unsubOnline();
      unsubOffline();
      unsubSyncStart();
      unsubSyncComplete();
      unsubSynced();
    };
  }, []);

  const handleManualSync = () => {
    if (isOnline && !isSyncing) {
      syncManager.startSync();
    }
  };

  // Don't show anything if online and nothing pending
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg',
        isOnline ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
      )}
    >
      {isOnline ? (
        <>
          {isSyncing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : pendingCount > 0 ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Wifi className="h-4 w-4" />
          )}

          <span className="text-sm font-medium">
            {isSyncing
              ? 'Syncing...'
              : pendingCount > 0
              ? `${pendingCount} pending`
              : 'Online'}
          </span>

          {pendingCount > 0 && !isSyncing && (
            <button
              onClick={handleManualSync}
              className="ml-2 p-1 hover:bg-amber-200 rounded"
              title="Sync now"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          )}
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">
            Offline
            {pendingCount > 0 && ` (${pendingCount} pending)`}
          </span>
        </>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/pos/offline-indicator.tsx
git commit -m "feat(ui): add OfflineIndicator component

- Show online/offline status
- Display pending operation count
- Show sync progress
- Add manual sync trigger"
```

---

## Final Tasks

### Task 16: Update POS Module with All Services

**Files:**
- Modify: `/apps/api/src/graphql/pos/pos.module.ts`

**Step 1: Update the module to include all services**

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';

// Existing services
import { DiscountService } from './discount.service';
import { DiscountResolver } from './discount.resolver';
import { CreditLimitService } from './credit-limit.service';
import { CreditLimitResolver } from './credit-limit.resolver';

// Phase 5 services
import { LedgerService } from './ledger.service';
import { LedgerResolver } from './ledger.resolver';
import { VipRecognitionService } from './vip-recognition.service';
import { VipRecognitionResolver } from './vip-recognition.resolver';
import { CommissionService } from './commission.service';
import { CommissionResolver } from './commission.resolver';
import { InventoryService } from './inventory.service';
import { InventoryResolver } from './inventory.resolver';
import { OfflineSyncService } from './offline-sync.service';
import { OfflineSyncResolver } from './offline-sync.resolver';

@Module({
  imports: [PrismaModule],
  providers: [
    // Existing
    DiscountService,
    DiscountResolver,
    CreditLimitService,
    CreditLimitResolver,

    // Phase 5
    LedgerService,
    LedgerResolver,
    VipRecognitionService,
    VipRecognitionResolver,
    CommissionService,
    CommissionResolver,
    InventoryService,
    InventoryResolver,
    OfflineSyncService,
    OfflineSyncResolver,
  ],
  exports: [
    DiscountService,
    CreditLimitService,
    LedgerService,
    VipRecognitionService,
    CommissionService,
    InventoryService,
    OfflineSyncService,
  ],
})
export class PosModule {}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/pos/pos.module.ts
git commit -m "feat(api): register all Phase 5 services in PosModule

- Add LedgerService and LedgerResolver
- Add VipRecognitionService and VipRecognitionResolver
- Add CommissionService and CommissionResolver
- Add InventoryService and InventoryResolver
- Add OfflineSyncService and OfflineSyncResolver"
```

---

### Task 17: Add GraphQL Operations for All Features

**Files:**
- Update: `/packages/api-client/src/operations/pos.graphql`

Add comprehensive GraphQL operations for all Phase 5 features, then run codegen:

```bash
cd packages/api-client && pnpm codegen
```

**Commit:**

```bash
git add packages/api-client/
git commit -m "feat(api-client): add Phase 5 GraphQL operations

- Add unified ledger queries and mutations
- Add VIP recognition queries
- Add commission tracking queries and mutations
- Add inventory management operations
- Add offline sync operations
- Generate TanStack Query hooks"
```

---

### Task 18: Verify All Features Work Together

**Step 1: Run full test suite**

```bash
pnpm test
```

**Step 2: Verify in development**

1. Start dev server: `pnpm dev`
2. Test unified ledger (create gift card, redeem at checkout)
3. Test VIP recognition (check-in a VIP member)
4. Test commission tracking (complete a service)
5. Test barcode scanning (scan a product)
6. Test inventory (stock count, transfer)
7. Test offline mode (disconnect, make transactions, reconnect)

---

## Summary

| Part | Feature | Tasks | Estimated Effort |
|------|---------|-------|------------------|
| 1 | Unified Ledger | 1-5 | 6-8 hours |
| 2 | VIP Recognition | 6-7 | 4-5 hours |
| 3 | Commission Tracking | 8-9 | 5-6 hours |
| 4 | Barcode Scanning | 10 | 3-4 hours |
| 5 | Advanced Inventory | 11 | 5-6 hours |
| 6 | Offline Mode | 12-15 | 6-8 hours |
| - | Final Tasks | 16-18 | 3-4 hours |

**Total: ~32-41 hours across 18 tasks**

---

## Appendix: File Reference

| Layer | Location Pattern |
|-------|------------------|
| Prisma Schema | `/database/prisma/schema.prisma` |
| GraphQL Types | `/apps/api/src/graphql/pos/*.types.ts` |
| GraphQL Inputs | `/apps/api/src/graphql/pos/*.input.ts` |
| Services | `/apps/api/src/graphql/pos/*.service.ts` |
| Resolvers | `/apps/api/src/graphql/pos/*.resolver.ts` |
| Module | `/apps/api/src/graphql/pos/pos.module.ts` |
| Operations | `/packages/api-client/src/operations/pos.graphql` |
| Generated Hooks | `/packages/api-client/src/hooks/generated.ts` |
| UI Components | `/apps/application/src/components/pos/*.tsx` |
| Offline Services | `/apps/application/src/services/*.ts` |

---

## Dependencies to Install

```bash
# For barcode scanning
pnpm add quagga --filter @clubvantage/application

# For offline storage
pnpm add idb --filter @clubvantage/application
```

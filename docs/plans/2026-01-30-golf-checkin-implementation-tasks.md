# Golf Check-in Feature - Implementation Tasks

## Task Dependency Graph

```
Phase 1: Database & Types
├── T1.1 Prisma Schema
├── T1.2 TypeScript Types
└── T1.3 Database Migration

Phase 2: Settings & Configuration (depends on Phase 1)
├── T2.1 Settings API ─────────────────┐
├── T2.2 Payment Methods CRUD ─────────┤
├── T2.3 Tax Configuration ────────────┤
├── T2.4 Starter Ticket Config ────────┤
└── T2.5 Settings UI ──────────────────┴─► (depends on T2.1-T2.4)

Phase 3: Pro Shop (depends on Phase 1)
├── T3.1 Category API ─────────────────┐
├── T3.2 Product API ──────────────────┤
├── T3.3 Category UI ──────────────────┴─► (depends on T3.1)
└── T3.4 Product UI ───────────────────────► (depends on T3.2, T3.3)

Phase 4: Check-in Core (depends on Phase 1, 2)
├── T4.1 Payment Status API ───────────┐
├── T4.2 Settlement API ───────────────┤
├── T4.3 Check-in API ─────────────────┤
├── T4.4 Check-in Modal UI ────────────┴─► (depends on T4.1-T4.3)
├── T4.5 Settlement Modal UI ──────────────► (depends on T4.4, T3.4)
└── T4.6 Quick Check-in Popover ───────────► (depends on T4.4)

Phase 5: Starter Ticket (depends on Phase 4)
├── T5.1 Ticket Generation API ────────┐
├── T5.2 Print Service ────────────────┤
├── T5.3 Ticket Display UI ────────────┴─► (depends on T5.1)
└── T5.4 Print Dialog UI ──────────────────► (depends on T5.2, T5.3)

Phase 6: Integration & Polish (depends on all)
├── T6.1 Tee Sheet Integration
├── T6.2 POS Integration (optional)
├── T6.3 Error Handling & Loading States
└── T6.4 Accessibility & Keyboard Nav
```

---

## Phase 1: Database & Types

### T1.1 Prisma Schema Updates

**File**: `packages/database/prisma/schema.prisma`

**Dependencies**: None

**New Models**:

```prisma
// Payment Method Configuration
model PaymentMethod {
  id              String   @id @default(cuid())
  clubId          String
  club            Club     @relation(fields: [clubId], references: [id])
  name            String   // "Cash", "Card", "QR Transfer", "Member Account"
  icon            String   // "cash", "card", "qr", "account"
  type            String   // cash | card | transfer | account | custom
  isEnabled       Boolean  @default(true)
  requiresRef     Boolean  @default(false)
  opensPOS        Boolean  @default(false)
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([clubId])
}

// Tax Configuration Override
model TaxOverride {
  id              String   @id @default(cuid())
  clubId          String
  club            Club     @relation(fields: [clubId], references: [id])
  itemType        String   // green_fee | cart | caddy | rental
  rate            Decimal  @db.Decimal(5, 2)
  taxType         String   // add | include | none
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([clubId, itemType])
}

// Club Check-in Settings (JSON field on Club or separate table)
model ClubGolfSettings {
  id                      String   @id @default(cuid())
  clubId                  String   @unique
  club                    Club     @relation(fields: [clubId], references: [id])

  // Policy
  allowPartialPayment     Boolean  @default(false)
  blockSuspendedMembers   Boolean  @default(true)
  showSuspensionReason    Boolean  @default(true)
  requireAllItemsPaid     Boolean  @default(true)

  // Tax defaults
  defaultTaxRate          Decimal  @db.Decimal(5, 2) @default(7.00)
  defaultTaxType          String   @default("include") // add | include | none
  taxLabel                String   @default("Tax")
  showTaxBreakdown        Boolean  @default(true)
  showTaxTypeIndicator    Boolean  @default(true)

  // Starter Ticket
  ticketGenerateOn        String   @default("settlement") // check_in | settlement | manual
  ticketAutoGenerate      Boolean  @default(true)
  ticketDefaultPrint      String   @default("combined") // ticket | receipt | combined | none
  ticketShowTeeTime       Boolean  @default(true)
  ticketShowCourse        Boolean  @default(true)
  ticketShowStartingHole  Boolean  @default(true)
  ticketShowPlayerNames   Boolean  @default(true)
  ticketShowMemberNumbers Boolean  @default(true)
  ticketShowCartNumber    Boolean  @default(true)
  ticketShowCaddyName     Boolean  @default(true)
  ticketShowRentalItems   Boolean  @default(true)
  ticketShowSpecialReqs   Boolean  @default(true)
  ticketShowQRCode        Boolean  @default(true)

  // Pro Shop
  allowProShopAtCheckIn   Boolean  @default(true)
  showQuickAddItems       Boolean  @default(true)
  quickAddProductIds      String[] @default([])

  // POS
  posIsConnected          Boolean  @default(false)
  posProvider             String?
  posTerminalId           String?
  posConfig               Json?

  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}

// Pro Shop Category
model ProShopCategory {
  id              String           @id @default(cuid())
  clubId          String
  club            Club             @relation(fields: [clubId], references: [id])
  name            String
  description     String?
  defaultTaxRate  Decimal          @db.Decimal(5, 2) @default(7.00)
  defaultTaxType  String           @default("add") // add | include | none
  sortOrder       Int              @default(0)
  isActive        Boolean          @default(true)
  products        ProShopProduct[]
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([clubId])
}

// Pro Shop Product
model ProShopProduct {
  id                  String              @id @default(cuid())
  clubId              String
  club                Club                @relation(fields: [clubId], references: [id])
  categoryId          String
  category            ProShopCategory     @relation(fields: [categoryId], references: [id])
  name                String
  description         String?
  sku                 String?
  price               Decimal             @db.Decimal(10, 2)
  taxRate             Decimal             @db.Decimal(5, 2)
  taxType             String              // add | include | none
  useCategoryDefaults Boolean             @default(true)
  isActive            Boolean             @default(true)
  isQuickAdd          Boolean             @default(false)
  variants            ProShopVariant[]
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  @@unique([clubId, sku])
  @@index([clubId])
  @@index([categoryId])
}

// Pro Shop Product Variant
model ProShopVariant {
  id              String         @id @default(cuid())
  productId       String
  product         ProShopProduct @relation(fields: [productId], references: [id], onDelete: Cascade)
  name            String         // "Size M", "Color Red"
  sku             String?
  priceAdjustment Decimal        @db.Decimal(10, 2) @default(0)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([productId])
}

// Booking Line Item (for payment tracking)
model BookingLineItem {
  id              String    @id @default(cuid())
  bookingPlayerId String
  bookingPlayer   BookingPlayer @relation(fields: [bookingPlayerId], references: [id])
  type            String    // green_fee | cart | caddy | rental | proshop
  description     String
  baseAmount      Decimal   @db.Decimal(10, 2)
  taxType         String    // add | include | none
  taxRate         Decimal   @db.Decimal(5, 2)
  taxAmount       Decimal   @db.Decimal(10, 2)
  totalAmount     Decimal   @db.Decimal(10, 2)
  isPaid          Boolean   @default(false)
  paidAt          DateTime?
  paidVia         String?   // payment method id
  reference       String?   // transaction reference
  productId       String?   // if proshop item
  variantId       String?   // if proshop variant
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([bookingPlayerId])
}

// Player Check-in Record
model PlayerCheckIn {
  id              String    @id @default(cuid())
  bookingPlayerId String    @unique
  bookingPlayer   BookingPlayer @relation(fields: [bookingPlayerId], references: [id])
  checkedInAt     DateTime  @default(now())
  checkedInBy     String    // staff user id
  settledAt       DateTime?
  settledVia      String?   // payment method id
  settledBy       String?   // staff user id
  totalPaid       Decimal   @db.Decimal(10, 2) @default(0)
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([bookingPlayerId])
}

// Starter Ticket
model StarterTicket {
  id              String    @id @default(cuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  flightId        String
  ticketNumber    String    @unique
  teeTime         DateTime
  course          String
  startingHole    Int
  players         Json      // Array of player info
  cartNumber      String?
  caddyName       String?
  rentalItems     String[]  @default([])
  specialRequests String?
  qrCodeData      String?
  generatedAt     DateTime  @default(now())
  generatedBy     String
  printedAt       DateTime?
  reprintCount    Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([clubId])
  @@index([flightId])
}
```

**Actions**:
- [ ] Add models to schema.prisma
- [ ] Add relations to existing Club, BookingPlayer models
- [ ] Run `npx prisma format`

---

### T1.2 TypeScript Types

**File**: `packages/shared/src/types/golf-checkin.ts`

**Dependencies**: None

```typescript
// ============================================
// ENUMS
// ============================================

export type TaxType = 'add' | 'include' | 'none';

export type PaymentMethodType = 'cash' | 'card' | 'transfer' | 'account' | 'custom';

export type LineItemType = 'green_fee' | 'cart' | 'caddy' | 'rental' | 'proshop';

export type TicketGenerateOn = 'check_in' | 'settlement' | 'manual';

export type PrintOption = 'ticket' | 'receipt' | 'combined' | 'none';

export type PlayerType = 'member' | 'guest' | 'dependent' | 'walkup';

// ============================================
// PAYMENT METHOD
// ============================================

export interface PaymentMethodConfig {
  id: string;
  name: string;
  icon: string;
  type: PaymentMethodType;
  isEnabled: boolean;
  requiresRef: boolean;
  opensPOS: boolean;
  sortOrder: number;
}

export interface PaymentMethodFormData {
  name: string;
  icon: string;
  type: PaymentMethodType;
  isEnabled: boolean;
  requiresRef: boolean;
  opensPOS: boolean;
}

// ============================================
// TAX CONFIGURATION
// ============================================

export interface TaxOverride {
  itemType: LineItemType;
  rate: number;
  taxType: TaxType;
}

export interface TaxConfig {
  defaultRate: number;
  defaultType: TaxType;
  taxLabel: string;
  showBreakdown: boolean;
  showTypeIndicator: boolean;
  overrides: TaxOverride[];
}

export interface TaxOverrideFormData {
  itemType: LineItemType;
  rate: number;
  taxType: TaxType;
}

// ============================================
// STARTER TICKET CONFIG
// ============================================

export interface StarterTicketConfig {
  generateOn: TicketGenerateOn;
  autoGenerate: boolean;
  defaultPrintOption: PrintOption;
  content: {
    showTeeTime: boolean;
    showCourse: boolean;
    showStartingHole: boolean;
    showPlayerNames: boolean;
    showMemberNumbers: boolean;
    showCartNumber: boolean;
    showCaddyName: boolean;
    showRentalItems: boolean;
    showSpecialRequests: boolean;
    showQRCode: boolean;
  };
}

// ============================================
// PRO SHOP CONFIG
// ============================================

export interface ProShopConfig {
  allowAddAtCheckIn: boolean;
  showQuickAddItems: boolean;
  quickAddProductIds: string[];
}

// ============================================
// POS CONFIG
// ============================================

export interface POSConfig {
  isConnected: boolean;
  provider?: string;
  terminalId?: string;
  config?: Record<string, unknown>;
}

// ============================================
// CHECK-IN SETTINGS (COMPLETE)
// ============================================

export interface CheckInPolicy {
  allowPartialPayment: boolean;
  blockSuspendedMembers: boolean;
  showSuspensionReason: boolean;
  requireAllItemsPaid: boolean;
}

export interface CheckInSettings {
  policy: CheckInPolicy;
  paymentMethods: PaymentMethodConfig[];
  tax: TaxConfig;
  starterTicket: StarterTicketConfig;
  proShop: ProShopConfig;
  pos: POSConfig;
}

// ============================================
// PRO SHOP CATEGORY
// ============================================

export interface ProShopCategory {
  id: string;
  name: string;
  description?: string;
  defaultTaxRate: number;
  defaultTaxType: TaxType;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
}

export interface ProShopCategoryFormData {
  name: string;
  description?: string;
  defaultTaxRate: number;
  defaultTaxType: TaxType;
  isActive: boolean;
}

// ============================================
// PRO SHOP PRODUCT
// ============================================

export interface ProShopVariant {
  id: string;
  name: string;
  sku?: string;
  priceAdjustment: number;
}

export interface ProShopVariantFormData {
  name: string;
  sku?: string;
  priceAdjustment: number;
}

export interface ProShopProduct {
  id: string;
  categoryId: string;
  category?: ProShopCategory;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  taxRate: number;
  taxType: TaxType;
  useCategoryDefaults: boolean;
  variants: ProShopVariant[];
  isActive: boolean;
  isQuickAdd: boolean;
}

export interface ProShopProductFormData {
  categoryId: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  taxRate: number;
  taxType: TaxType;
  useCategoryDefaults: boolean;
  variants: ProShopVariantFormData[];
  isActive: boolean;
  isQuickAdd: boolean;
}

// ============================================
// BOOKING LINE ITEM
// ============================================

export interface BookingLineItem {
  id: string;
  type: LineItemType;
  description: string;
  baseAmount: number;
  taxType: TaxType;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  isPaid: boolean;
  paidAt?: Date;
  paidVia?: string;
  reference?: string;
  productId?: string;
  variantId?: string;
}

export interface AddLineItemFormData {
  type: LineItemType;
  description: string;
  baseAmount: number;
  productId?: string;
  variantId?: string;
}

// ============================================
// PLAYER PAYMENT INFO
// ============================================

export interface PlayerPaymentInfo {
  playerId: string;
  playerName: string;
  playerType: PlayerType;
  memberNumber?: string;
  lineItems: BookingLineItem[];
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  paidOnline: number;
  balanceDue: number;
  isSettled: boolean;
  settledAt?: Date;
  settledVia?: string;
  settledBy?: string;
}

// ============================================
// CHECK-IN PLAYER (for modal display)
// ============================================

export interface CheckInPlayer {
  id: string;
  name: string;
  type: PlayerType;
  memberNumber?: string;
  isCheckedIn: boolean;
  checkedInAt?: Date;
  isSuspended: boolean;
  suspensionReason?: string;
  paymentStatus: 'prepaid' | 'partial' | 'unpaid';
  totalDue: number;
  totalPaid: number;
  balanceDue: number;
}

// ============================================
// SETTLEMENT
// ============================================

export interface SettlementRequest {
  playerIds: string[];
  paymentMethodId: string;
  reference?: string;
  notes?: string;
}

export interface SettlementResult {
  success: boolean;
  transactionId?: string;
  settledAt: Date;
  settledBy: string;
  players: Array<{
    playerId: string;
    amountPaid: number;
  }>;
  error?: string;
}

// ============================================
// CHECK-IN REQUEST/RESPONSE
// ============================================

export interface CheckInRequest {
  flightId: string;
  playerIds: string[];
  generateTicket: boolean;
  printOption?: PrintOption;
}

export interface CheckInResult {
  success: boolean;
  checkedInAt: Date;
  checkedInBy: string;
  players: Array<{
    playerId: string;
    checkedIn: boolean;
    error?: string;
  }>;
  ticketId?: string;
  ticketNumber?: string;
}

// ============================================
// STARTER TICKET
// ============================================

export interface StarterTicketPlayer {
  name: string;
  memberNumber?: string;
  type: PlayerType;
}

export interface StarterTicket {
  id: string;
  ticketNumber: string;
  teeTime: Date;
  course: string;
  startingHole: number;
  players: StarterTicketPlayer[];
  cartNumber?: string;
  caddyName?: string;
  rentalItems: string[];
  specialRequests?: string;
  qrCodeData?: string;
  generatedAt: Date;
  generatedBy: string;
  printedAt?: Date;
  reprintCount: number;
}

export interface GenerateTicketRequest {
  flightId: string;
  printOption: PrintOption;
  sendEmail?: boolean;
  sendSMS?: boolean;
  emailAddress?: string;
  phoneNumber?: string;
}

// ============================================
// FLIGHT INFO (for check-in modal header)
// ============================================

export interface FlightCheckInInfo {
  id: string;
  teeTime: Date;
  course: string;
  startingHole: number;
  players: CheckInPlayer[];
  cartNumber?: string;
  caddyAssignment?: string;
}
```

**Actions**:
- [ ] Create types file
- [ ] Export from package index
- [ ] Add to tsconfig paths if needed

---

### T1.3 Database Migration

**Dependencies**: T1.1

**Actions**:
- [ ] Run `npx prisma migrate dev --name add_golf_checkin_models`
- [ ] Verify migration applied
- [ ] Seed default payment methods for existing clubs
- [ ] Seed default settings for existing clubs

**Seed Script** (`packages/database/prisma/seed-checkin.ts`):
```typescript
async function seedCheckInDefaults(clubId: string) {
  // Default payment methods
  const paymentMethods = [
    { name: 'Cash', icon: 'cash', type: 'cash', sortOrder: 0 },
    { name: 'QR Transfer', icon: 'qr', type: 'transfer', requiresRef: true, sortOrder: 1 },
    { name: 'Card', icon: 'card', type: 'card', opensPOS: true, sortOrder: 2 },
    { name: 'Member Account', icon: 'account', type: 'account', sortOrder: 3 },
  ];

  // Default golf settings
  const defaultSettings = {
    allowPartialPayment: false,
    blockSuspendedMembers: true,
    showSuspensionReason: true,
    requireAllItemsPaid: true,
    defaultTaxRate: 7.00,
    defaultTaxType: 'include',
    // ... rest of defaults
  };
}
```

---

## Phase 2: Settings & Configuration

### T2.1 Settings API

**Files**:
- `apps/api/src/graphql/golf/settings.resolver.ts`
- `apps/api/src/graphql/golf/settings.service.ts`
- `apps/api/src/graphql/golf/settings.input.ts`

**Dependencies**: T1.1, T1.2, T1.3

**GraphQL Schema**:

```graphql
# ============================================
# QUERIES
# ============================================

type Query {
  """Get golf check-in settings for a club"""
  golfCheckInSettings(clubId: ID!): GolfCheckInSettings!
}

# ============================================
# MUTATIONS
# ============================================

type Mutation {
  """Update check-in policy settings"""
  updateCheckInPolicy(clubId: ID!, input: CheckInPolicyInput!): GolfCheckInSettings!

  """Update tax configuration"""
  updateTaxConfig(clubId: ID!, input: TaxConfigInput!): GolfCheckInSettings!

  """Update starter ticket settings"""
  updateStarterTicketConfig(clubId: ID!, input: StarterTicketConfigInput!): GolfCheckInSettings!

  """Update pro shop settings"""
  updateProShopConfig(clubId: ID!, input: ProShopConfigInput!): GolfCheckInSettings!

  """Update POS settings"""
  updatePOSConfig(clubId: ID!, input: POSConfigInput!): GolfCheckInSettings!

  """Reset settings to defaults"""
  resetCheckInSettings(clubId: ID!): GolfCheckInSettings!
}

# ============================================
# TYPES
# ============================================

type GolfCheckInSettings {
  policy: CheckInPolicy!
  paymentMethods: [PaymentMethod!]!
  tax: TaxConfig!
  starterTicket: StarterTicketConfig!
  proShop: ProShopConfig!
  pos: POSConfig!
}

type CheckInPolicy {
  allowPartialPayment: Boolean!
  blockSuspendedMembers: Boolean!
  showSuspensionReason: Boolean!
  requireAllItemsPaid: Boolean!
}

type TaxConfig {
  defaultRate: Float!
  defaultType: TaxType!
  taxLabel: String!
  showBreakdown: Boolean!
  showTypeIndicator: Boolean!
  overrides: [TaxOverride!]!
}

type TaxOverride {
  itemType: LineItemType!
  rate: Float!
  taxType: TaxType!
}

type StarterTicketConfig {
  generateOn: TicketGenerateOn!
  autoGenerate: Boolean!
  defaultPrintOption: PrintOption!
  content: TicketContentConfig!
}

type TicketContentConfig {
  showTeeTime: Boolean!
  showCourse: Boolean!
  showStartingHole: Boolean!
  showPlayerNames: Boolean!
  showMemberNumbers: Boolean!
  showCartNumber: Boolean!
  showCaddyName: Boolean!
  showRentalItems: Boolean!
  showSpecialRequests: Boolean!
  showQRCode: Boolean!
}

type ProShopConfig {
  allowAddAtCheckIn: Boolean!
  showQuickAddItems: Boolean!
  quickAddProductIds: [ID!]!
  quickAddProducts: [ProShopProduct!]!
}

type POSConfig {
  isConnected: Boolean!
  provider: String
  terminalId: String
}

# ============================================
# INPUTS
# ============================================

input CheckInPolicyInput {
  allowPartialPayment: Boolean
  blockSuspendedMembers: Boolean
  showSuspensionReason: Boolean
  requireAllItemsPaid: Boolean
}

input TaxConfigInput {
  defaultRate: Float
  defaultType: TaxType
  taxLabel: String
  showBreakdown: Boolean
  showTypeIndicator: Boolean
  overrides: [TaxOverrideInput!]
}

input TaxOverrideInput {
  itemType: LineItemType!
  rate: Float!
  taxType: TaxType!
}

input StarterTicketConfigInput {
  generateOn: TicketGenerateOn
  autoGenerate: Boolean
  defaultPrintOption: PrintOption
  content: TicketContentInput
}

input TicketContentInput {
  showTeeTime: Boolean
  showCourse: Boolean
  showStartingHole: Boolean
  showPlayerNames: Boolean
  showMemberNumbers: Boolean
  showCartNumber: Boolean
  showCaddyName: Boolean
  showRentalItems: Boolean
  showSpecialRequests: Boolean
  showQRCode: Boolean
}

input ProShopConfigInput {
  allowAddAtCheckIn: Boolean
  showQuickAddItems: Boolean
  quickAddProductIds: [ID!]
}

input POSConfigInput {
  isConnected: Boolean
  provider: String
  terminalId: String
  config: JSON
}

# ============================================
# ENUMS
# ============================================

enum TaxType {
  ADD
  INCLUDE
  NONE
}

enum LineItemType {
  GREEN_FEE
  CART
  CADDY
  RENTAL
  PROSHOP
}

enum TicketGenerateOn {
  CHECK_IN
  SETTLEMENT
  MANUAL
}

enum PrintOption {
  TICKET
  RECEIPT
  COMBINED
  NONE
}
```

**Validation Rules**:
- Tax rate: 0-100
- Tax label: max 20 characters
- Quick add products: max 10 items

**Actions**:
- [ ] Create settings.input.ts with input types and validation decorators
- [ ] Create settings.service.ts with business logic
- [ ] Create settings.resolver.ts with queries and mutations
- [ ] Add to golf module
- [ ] Write unit tests

---

### T2.2 Payment Methods CRUD

**Files**:
- `apps/api/src/graphql/golf/payment-methods.resolver.ts`
- `apps/api/src/graphql/golf/payment-methods.service.ts`
- `apps/api/src/graphql/golf/payment-methods.input.ts`

**Dependencies**: T1.1, T1.2, T1.3

**GraphQL Schema**:

```graphql
type Query {
  """Get payment methods for a club"""
  paymentMethods(clubId: ID!): [PaymentMethod!]!

  """Get single payment method"""
  paymentMethod(id: ID!): PaymentMethod
}

type Mutation {
  """Create new payment method"""
  createPaymentMethod(clubId: ID!, input: CreatePaymentMethodInput!): PaymentMethod!

  """Update payment method"""
  updatePaymentMethod(id: ID!, input: UpdatePaymentMethodInput!): PaymentMethod!

  """Delete payment method"""
  deletePaymentMethod(id: ID!): Boolean!

  """Reorder payment methods"""
  reorderPaymentMethods(clubId: ID!, orderedIds: [ID!]!): [PaymentMethod!]!

  """Toggle payment method enabled status"""
  togglePaymentMethod(id: ID!, isEnabled: Boolean!): PaymentMethod!
}

type PaymentMethod {
  id: ID!
  name: String!
  icon: String!
  type: PaymentMethodType!
  isEnabled: Boolean!
  requiresRef: Boolean!
  opensPOS: Boolean!
  sortOrder: Int!
}

input CreatePaymentMethodInput {
  name: String!
  icon: String!
  type: PaymentMethodType!
  requiresRef: Boolean
  opensPOS: Boolean
}

input UpdatePaymentMethodInput {
  name: String
  icon: String
  type: PaymentMethodType
  isEnabled: Boolean
  requiresRef: Boolean
  opensPOS: Boolean
}

enum PaymentMethodType {
  CASH
  CARD
  TRANSFER
  ACCOUNT
  CUSTOM
}
```

**Validation Rules**:
- Name: required, max 50 characters
- Icon: required, one of predefined set
- At least one payment method must remain enabled

**Actions**:
- [ ] Create payment-methods.input.ts
- [ ] Create payment-methods.service.ts
- [ ] Create payment-methods.resolver.ts
- [ ] Add validation for minimum one enabled method
- [ ] Write unit tests

---

### T2.3 Tax Configuration

**Dependencies**: T2.1

**Included in T2.1 Settings API**

**Additional Tax Calculation Service** (`apps/api/src/services/tax-calculator.service.ts`):

```typescript
export class TaxCalculatorService {
  /**
   * Calculate tax for a line item
   */
  calculateTax(
    baseAmount: number,
    taxType: TaxType,
    taxRate: number
  ): { netAmount: number; taxAmount: number; totalAmount: number } {
    switch (taxType) {
      case 'add':
        const taxAdd = baseAmount * (taxRate / 100);
        return {
          netAmount: baseAmount,
          taxAmount: taxAdd,
          totalAmount: baseAmount + taxAdd,
        };

      case 'include':
        const netAmount = baseAmount / (1 + taxRate / 100);
        const taxInclude = baseAmount - netAmount;
        return {
          netAmount,
          taxAmount: taxInclude,
          totalAmount: baseAmount,
        };

      case 'none':
      default:
        return {
          netAmount: baseAmount,
          taxAmount: 0,
          totalAmount: baseAmount,
        };
    }
  }

  /**
   * Get tax config for item type
   */
  getTaxConfigForItem(
    itemType: LineItemType,
    taxConfig: TaxConfig
  ): { rate: number; type: TaxType } {
    const override = taxConfig.overrides.find(o => o.itemType === itemType);
    if (override) {
      return { rate: override.rate, type: override.taxType };
    }
    return { rate: taxConfig.defaultRate, type: taxConfig.defaultType };
  }
}
```

**Actions**:
- [ ] Create tax-calculator.service.ts
- [ ] Add to providers
- [ ] Write unit tests with edge cases

---

### T2.4 Starter Ticket Configuration

**Dependencies**: T2.1

**Included in T2.1 Settings API**

---

### T2.5 Settings UI

**Files**:
- `apps/application/src/components/golf/settings/check-in-settings.tsx`
- `apps/application/src/components/golf/settings/payment-methods-settings.tsx`
- `apps/application/src/components/golf/settings/tax-settings.tsx`
- `apps/application/src/components/golf/settings/starter-ticket-settings.tsx`
- `apps/application/src/components/golf/settings/proshop-settings.tsx`
- `apps/application/src/components/golf/settings/pos-settings.tsx`

**Dependencies**: T2.1, T2.2, T2.3, T2.4

#### 2.5.1 Check-in Policy Settings Form

**Component**: `CheckInPolicySettings`

**Form Fields**:
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| allowPartialPayment | checkbox | false | - |
| blockSuspendedMembers | checkbox | true | - |
| showSuspensionReason | checkbox | true | depends on blockSuspendedMembers |
| requireAllItemsPaid | checkbox | true | - |

**Actions**:
- [ ] Form state with react-hook-form
- [ ] Mutation hook for updateCheckInPolicy
- [ ] Success/error toast notifications
- [ ] Dirty state tracking
- [ ] Unsaved changes warning

#### 2.5.2 Payment Methods Settings Form

**Component**: `PaymentMethodsSettings`

**Features**:
- Drag-to-reorder list (react-beautiful-dnd or @dnd-kit)
- Toggle enable/disable
- Edit modal
- Delete with confirmation
- Add new method modal

**Add/Edit Payment Method Modal Form**:
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| name | text | "" | required, max 50 chars |
| icon | select | "cash" | required |
| type | select | "cash" | required |
| requiresRef | checkbox | false | - |
| opensPOS | checkbox | false | - |

**Icon Options**: cash, card, qr, account, wallet, bank, mobile

**Actions**:
- [ ] List component with drag-drop
- [ ] Add payment method modal
- [ ] Edit payment method modal
- [ ] Delete confirmation dialog
- [ ] Reorder mutation
- [ ] Prevent delete of last enabled method

#### 2.5.3 Tax Settings Form

**Component**: `TaxSettings`

**Form Fields**:
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| defaultRate | number | 7 | min 0, max 100 |
| defaultType | select | "include" | required |
| taxLabel | text | "Tax" | max 20 chars |
| showBreakdown | checkbox | true | - |
| showTypeIndicator | checkbox | true | - |

**Tax Overrides Table**:
| Column | Type | Validation |
|--------|------|------------|
| itemType | select (readonly) | - |
| rate | number | min 0, max 100 |
| type | select | required |

**Item Types**: green_fee, cart, caddy, rental

**Actions**:
- [ ] Main tax settings form
- [ ] Overrides table with inline editing
- [ ] Edit override modal (alternative to inline)
- [ ] Validation feedback

#### 2.5.4 Starter Ticket Settings Form

**Component**: `StarterTicketSettings`

**Form Fields**:
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| generateOn | radio | "settlement" | required |
| autoGenerate | checkbox | true | - |
| defaultPrintOption | select | "combined" | required |

**Content Checkboxes** (all boolean, default true):
- showTeeTime
- showCourse
- showStartingHole
- showPlayerNames
- showMemberNumbers
- showCartNumber
- showCaddyName
- showRentalItems
- showSpecialRequests
- showQRCode

**Actions**:
- [ ] Generate options radio group
- [ ] Print option select
- [ ] Content checkboxes grid
- [ ] Preview button (optional)

#### 2.5.5 Pro Shop Settings Form

**Component**: `ProShopSettings`

**Form Fields**:
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| allowAddAtCheckIn | checkbox | true | - |
| showQuickAddItems | checkbox | true | depends on allowAddAtCheckIn |
| quickAddProductIds | multi-select | [] | max 10 items |

**Quick Add Product Selector**:
- Search products
- Show selected as chips with remove button
- Max 10 warning

**Actions**:
- [ ] Settings checkboxes
- [ ] Product multi-select with search
- [ ] Selected products chip list
- [ ] Remove product from quick add
- [ ] Max limit validation (10)

#### 2.5.6 POS Settings Form

**Component**: `POSSettings`

**Display**:
- Connection status indicator
- Provider name (if connected)
- Terminal ID (if connected)

**Actions**:
- [ ] Test Connection button
- [ ] Configure button (opens provider-specific modal)
- [ ] Disconnect button with confirmation
- [ ] Connection status polling

---

## Phase 3: Pro Shop

### T3.1 Category API

**Files**:
- `apps/api/src/graphql/proshop/category.resolver.ts`
- `apps/api/src/graphql/proshop/category.service.ts`
- `apps/api/src/graphql/proshop/category.input.ts`

**Dependencies**: T1.1, T1.2, T1.3

**GraphQL Schema**:

```graphql
type Query {
  """List all pro shop categories"""
  proShopCategories(clubId: ID!): [ProShopCategory!]!

  """Get single category"""
  proShopCategory(id: ID!): ProShopCategory
}

type Mutation {
  """Create category"""
  createProShopCategory(clubId: ID!, input: CreateCategoryInput!): ProShopCategory!

  """Update category"""
  updateProShopCategory(id: ID!, input: UpdateCategoryInput!): ProShopCategory!

  """Delete category"""
  deleteProShopCategory(id: ID!, moveProductsTo: ID): Boolean!

  """Reorder categories"""
  reorderProShopCategories(clubId: ID!, orderedIds: [ID!]!): [ProShopCategory!]!
}

type ProShopCategory {
  id: ID!
  name: String!
  description: String
  defaultTaxRate: Float!
  defaultTaxType: TaxType!
  sortOrder: Int!
  isActive: Boolean!
  productCount: Int!
  products: [ProShopProduct!]!
}

input CreateCategoryInput {
  name: String!
  description: String
  defaultTaxRate: Float!
  defaultTaxType: TaxType!
  isActive: Boolean
}

input UpdateCategoryInput {
  name: String
  description: String
  defaultTaxRate: Float
  defaultTaxType: TaxType
  isActive: Boolean
}
```

**Validation Rules**:
- Name: required, max 100 characters, unique per club
- Tax rate: 0-100
- Cannot delete category with products unless moveProductsTo specified

**Actions**:
- [ ] Create category.input.ts with validation
- [ ] Create category.service.ts
- [ ] Create category.resolver.ts
- [ ] Handle cascade on delete (move products)
- [ ] Write unit tests

---

### T3.2 Product API

**Files**:
- `apps/api/src/graphql/proshop/product.resolver.ts`
- `apps/api/src/graphql/proshop/product.service.ts`
- `apps/api/src/graphql/proshop/product.input.ts`

**Dependencies**: T1.1, T1.2, T1.3, T3.1

**GraphQL Schema**:

```graphql
type Query {
  """List products with filtering"""
  proShopProducts(
    clubId: ID!
    categoryId: ID
    search: String
    isActive: Boolean
    isQuickAdd: Boolean
    page: Int
    limit: Int
  ): ProShopProductConnection!

  """Get single product"""
  proShopProduct(id: ID!): ProShopProduct

  """Get quick add products"""
  quickAddProducts(clubId: ID!): [ProShopProduct!]!
}

type Mutation {
  """Create product"""
  createProShopProduct(clubId: ID!, input: CreateProductInput!): ProShopProduct!

  """Update product"""
  updateProShopProduct(id: ID!, input: UpdateProductInput!): ProShopProduct!

  """Delete product"""
  deleteProShopProduct(id: ID!): Boolean!

  """Bulk update products"""
  bulkUpdateProShopProducts(ids: [ID!]!, input: BulkUpdateProductInput!): [ProShopProduct!]!

  """Toggle quick add status"""
  toggleProductQuickAdd(id: ID!, isQuickAdd: Boolean!): ProShopProduct!
}

type ProShopProductConnection {
  items: [ProShopProduct!]!
  total: Int!
  page: Int!
  limit: Int!
  hasMore: Boolean!
}

type ProShopProduct {
  id: ID!
  category: ProShopCategory!
  name: String!
  description: String
  sku: String
  price: Float!
  taxRate: Float!
  taxType: TaxType!
  useCategoryDefaults: Boolean!
  effectiveTaxRate: Float!
  effectiveTaxType: TaxType!
  variants: [ProShopVariant!]!
  isActive: Boolean!
  isQuickAdd: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ProShopVariant {
  id: ID!
  name: String!
  sku: String
  priceAdjustment: Float!
  finalPrice: Float!
}

input CreateProductInput {
  categoryId: ID!
  name: String!
  description: String
  sku: String
  price: Float!
  taxRate: Float
  taxType: TaxType
  useCategoryDefaults: Boolean
  variants: [CreateVariantInput!]
  isActive: Boolean
  isQuickAdd: Boolean
}

input CreateVariantInput {
  name: String!
  sku: String
  priceAdjustment: Float
}

input UpdateProductInput {
  categoryId: ID
  name: String
  description: String
  sku: String
  price: Float
  taxRate: Float
  taxType: TaxType
  useCategoryDefaults: Boolean
  variants: [UpdateVariantInput!]
  isActive: Boolean
  isQuickAdd: Boolean
}

input UpdateVariantInput {
  id: ID
  name: String!
  sku: String
  priceAdjustment: Float
  _delete: Boolean
}

input BulkUpdateProductInput {
  categoryId: ID
  isActive: Boolean
  isQuickAdd: Boolean
}
```

**Validation Rules**:
- Name: required, max 200 characters
- SKU: unique per club (if provided)
- Price: positive number
- Tax rate: 0-100 (if not using category defaults)
- Variants: name required, max 20 variants

**Actions**:
- [ ] Create product.input.ts with validation
- [ ] Create product.service.ts
- [ ] Create product.resolver.ts
- [ ] Implement SKU uniqueness check
- [ ] Implement effective tax rate resolver
- [ ] Write unit tests

---

### T3.3 Category UI

**Files**:
- `apps/application/src/components/golf/proshop/category-list.tsx`
- `apps/application/src/components/golf/proshop/category-form-modal.tsx`
- `apps/application/src/components/golf/proshop/category-delete-dialog.tsx`

**Dependencies**: T3.1

#### 3.3.1 Category List Component

**Features**:
- Drag-to-reorder
- Show product count per category
- Show tax settings summary
- Edit button
- Delete button (with move products option)
- Active/inactive indicator

**Actions**:
- [ ] List component with drag-drop
- [ ] Reorder mutation on drop
- [ ] Loading skeleton
- [ ] Empty state

#### 3.3.2 Category Form Modal

**Form Fields**:
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| name | text | "" | required, max 100 |
| description | textarea | "" | max 500 |
| defaultTaxRate | number | 7 | min 0, max 100 |
| defaultTaxType | select | "add" | required |
| isActive | checkbox | true | - |

**Actions**:
- [ ] Create modal with form
- [ ] Edit mode (populate existing)
- [ ] Validation feedback
- [ ] Loading state on submit
- [ ] Success toast

#### 3.3.3 Category Delete Dialog

**Content**:
- Warning about affected products
- Product count display
- Move products to dropdown (required if products exist)
- Confirm/Cancel buttons

**Actions**:
- [ ] Show product count
- [ ] Category select for move target
- [ ] Disable confirm until target selected (if needed)
- [ ] Delete mutation
- [ ] Success toast

---

### T3.4 Product UI

**Files**:
- `apps/application/src/components/golf/proshop/product-list.tsx`
- `apps/application/src/components/golf/proshop/product-form-modal.tsx`
- `apps/application/src/components/golf/proshop/product-delete-dialog.tsx`
- `apps/application/src/components/golf/proshop/variant-form.tsx`

**Dependencies**: T3.2, T3.3

#### 3.4.1 Product List Component

**Features**:
- Search input with debounce (300ms)
- Category filter dropdown
- Active filter toggle
- Sortable columns (name, price, category)
- Pagination
- Multi-select for bulk actions
- Quick add toggle per row

**Columns**:
| Column | Sortable | Width |
|--------|----------|-------|
| Checkbox | No | 40px |
| Name | Yes | flex |
| SKU | No | 100px |
| Category | Yes | 150px |
| Price | Yes | 100px |
| Tax | No | 80px |
| Quick Add | No | 80px |
| Actions | No | 80px |

**Bulk Actions** (when items selected):
- Activate
- Deactivate
- Move to category
- Toggle quick add

**Actions**:
- [ ] Data table with sorting
- [ ] Search with debounce
- [ ] Category filter
- [ ] Pagination
- [ ] Multi-select
- [ ] Bulk action toolbar
- [ ] Loading skeleton
- [ ] Empty state

#### 3.4.2 Product Form Modal

**Form Fields**:
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| name | text | "" | required, max 200 |
| categoryId | select | "" | required |
| description | textarea | "" | max 1000 |
| sku | text | "" | unique per club |
| price | number | 0 | required, positive |
| useCategoryDefaults | checkbox | true | - |
| taxRate | number | (from category) | 0-100, shown if !useCategoryDefaults |
| taxType | select | (from category) | shown if !useCategoryDefaults |
| isActive | checkbox | true | - |
| isQuickAdd | checkbox | false | - |

**Variants Section**:
- Add variant button
- Variant rows with: name, sku, price adjustment, delete
- Max 20 variants warning

**Actions**:
- [ ] Main form fields
- [ ] Category select with loading
- [ ] Conditional tax fields
- [ ] Variant management (add/edit/remove)
- [ ] SKU uniqueness check (on blur)
- [ ] Validation feedback
- [ ] Loading state on submit

#### 3.4.3 Variant Form (inline)

**Fields**:
| Field | Type | Validation |
|-------|------|------------|
| name | text | required, max 50 |
| sku | text | unique per club |
| priceAdjustment | number | number (can be negative) |

**Actions**:
- [ ] Inline editable row
- [ ] Add new variant row
- [ ] Delete variant with confirmation
- [ ] Show final price preview

---

## Phase 4: Check-in Core

### T4.1 Payment Status API

**Files**:
- `apps/api/src/graphql/golf/payment.resolver.ts`
- `apps/api/src/graphql/golf/payment.service.ts`

**Dependencies**: T1.1, T1.2, T1.3, T2.1, T2.3

**GraphQL Schema**:

```graphql
type Query {
  """Get flight check-in info with payment status"""
  flightCheckInInfo(flightId: ID!): FlightCheckInInfo!

  """Get player payment details"""
  playerPaymentInfo(playerId: ID!): PlayerPaymentInfo!
}

type FlightCheckInInfo {
  id: ID!
  teeTime: DateTime!
  course: String!
  startingHole: Int!
  cartNumber: String
  caddyAssignment: String
  players: [CheckInPlayer!]!
}

type CheckInPlayer {
  id: ID!
  name: String!
  type: PlayerType!
  memberNumber: String
  isCheckedIn: Boolean!
  checkedInAt: DateTime
  isSuspended: Boolean!
  suspensionReason: String
  paymentStatus: PaymentStatus!
  totalDue: Float!
  totalPaid: Float!
  balanceDue: Float!
}

type PlayerPaymentInfo {
  playerId: ID!
  playerName: String!
  playerType: PlayerType!
  memberNumber: String
  lineItems: [BookingLineItem!]!
  subtotal: Float!
  totalTax: Float!
  grandTotal: Float!
  paidOnline: Float!
  balanceDue: Float!
  isSettled: Boolean!
  settledAt: DateTime
  settledVia: String
}

type BookingLineItem {
  id: ID!
  type: LineItemType!
  description: String!
  baseAmount: Float!
  taxType: TaxType!
  taxRate: Float!
  taxAmount: Float!
  totalAmount: Float!
  isPaid: Boolean!
  paidAt: DateTime
  paidVia: String
  reference: String
}

enum PaymentStatus {
  PREPAID
  PARTIAL
  UNPAID
}

enum PlayerType {
  MEMBER
  GUEST
  DEPENDENT
  WALKUP
}
```

**Actions**:
- [ ] Create payment.service.ts
- [ ] Query for flight with players and payment status
- [ ] Query for individual player payment details
- [ ] Calculate totals from line items
- [ ] Include suspension status check
- [ ] Write unit tests

---

### T4.2 Settlement API

**Files**:
- `apps/api/src/graphql/golf/settlement.resolver.ts`
- `apps/api/src/graphql/golf/settlement.service.ts`
- `apps/api/src/graphql/golf/settlement.input.ts`

**Dependencies**: T1.1, T1.2, T1.3, T2.1, T2.2, T4.1

**GraphQL Schema**:

```graphql
type Mutation {
  """Process settlement for players"""
  processSettlement(input: SettlementInput!): SettlementResult!

  """Add line item to player"""
  addLineItem(playerId: ID!, input: AddLineItemInput!): BookingLineItem!

  """Remove line item"""
  removeLineItem(lineItemId: ID!): Boolean!

  """Mark line item as paid"""
  markLineItemPaid(lineItemId: ID!, paymentMethodId: ID!, reference: String): BookingLineItem!

  """Void recent payment (within 2 minutes)"""
  voidPayment(lineItemId: ID!): BookingLineItem!
}

input SettlementInput {
  playerIds: [ID!]!
  paymentMethodId: ID!
  reference: String
  notes: String
}

input AddLineItemInput {
  type: LineItemType!
  description: String!
  baseAmount: Float!
  productId: ID
  variantId: ID
}

type SettlementResult {
  success: Boolean!
  transactionId: String
  settledAt: DateTime!
  settledBy: String!
  players: [PlayerSettlementResult!]!
  error: String
}

type PlayerSettlementResult {
  playerId: ID!
  amountPaid: Float!
  success: Boolean!
  error: String
}
```

**Business Logic**:
- Calculate tax based on club settings
- Validate payment method exists and is enabled
- For POS methods, integrate with POS service
- Record all line items as paid
- Create audit trail
- Void only within 2-minute window

**Actions**:
- [ ] Create settlement.input.ts with validation
- [ ] Create settlement.service.ts
- [ ] Implement processSettlement with transaction
- [ ] Implement addLineItem (for pro shop items)
- [ ] Implement markLineItemPaid (individual items)
- [ ] Implement voidPayment with time check
- [ ] Add audit logging
- [ ] Write unit tests

---

### T4.3 Check-in API

**Files**:
- `apps/api/src/graphql/golf/checkin.resolver.ts`
- `apps/api/src/graphql/golf/checkin.service.ts`
- `apps/api/src/graphql/golf/checkin.input.ts`

**Dependencies**: T1.1, T1.2, T1.3, T2.1, T4.1, T4.2

**GraphQL Schema**:

```graphql
type Mutation {
  """Check in players"""
  checkInPlayers(input: CheckInInput!): CheckInResult!

  """Undo check-in (within 5 minutes)"""
  undoCheckIn(playerId: ID!): Boolean!
}

input CheckInInput {
  flightId: ID!
  playerIds: [ID!]!
  generateTicket: Boolean!
  printOption: PrintOption
}

type CheckInResult {
  success: Boolean!
  checkedInAt: DateTime!
  checkedInBy: String!
  players: [PlayerCheckInResult!]!
  ticketId: ID
  ticketNumber: String
}

type PlayerCheckInResult {
  playerId: ID!
  checkedIn: Boolean!
  error: String
}
```

**Business Logic**:
- Validate all players belong to flight
- Check for suspended members (if policy enabled)
- Validate payment status (if requireAllItemsPaid enabled)
- Create PlayerCheckIn records
- Generate starter ticket (if requested)
- Update flight status if all players checked in

**Actions**:
- [ ] Create checkin.input.ts with validation
- [ ] Create checkin.service.ts
- [ ] Validate player eligibility
- [ ] Check suspension status
- [ ] Check payment requirements
- [ ] Create check-in records
- [ ] Trigger ticket generation
- [ ] Update flight status
- [ ] Write unit tests

---

### T4.4 Check-in Modal UI

**Files**:
- `apps/application/src/components/golf/check-in/check-in-modal.tsx`
- `apps/application/src/components/golf/check-in/player-selection-card.tsx`
- `apps/application/src/components/golf/check-in/suspended-member-warning.tsx`

**Dependencies**: T4.1, T4.2, T4.3

#### 4.4.1 Check-in Modal

**Props**:
```typescript
interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  flightId: string;
  onCheckInComplete: (result: CheckInResult) => void;
}
```

**State**:
```typescript
interface CheckInModalState {
  selectedPlayerIds: string[];
  isLoading: boolean;
  error: string | null;
}
```

**Sections**:
1. Header: Flight info (time, course, hole)
2. Player list with checkboxes
3. Suspended member warning (if any)
4. Footer: Selected count, total due, action buttons

**Actions**:
- [ ] Query flightCheckInInfo on mount
- [ ] Player selection with checkboxes
- [ ] Disable already checked-in players
- [ ] Show suspended warning
- [ ] Calculate selected totals
- [ ] "Proceed to Settlement" button
- [ ] Loading skeleton
- [ ] Error display

#### 4.4.2 Player Selection Card

**Props**:
```typescript
interface PlayerSelectionCardProps {
  player: CheckInPlayer;
  isSelected: boolean;
  onToggle: (playerId: string) => void;
  disabled: boolean;
}
```

**Display**:
- Checkbox
- Player name + type badge
- Payment status badge (Pre-paid / Pay at desk)
- Line items summary
- Disabled state for checked-in or suspended

**Actions**:
- [ ] Checkbox interaction
- [ ] Payment status badge styling
- [ ] Disabled visual state
- [ ] Keyboard accessible

#### 4.4.3 Suspended Member Warning

**Props**:
```typescript
interface SuspendedMemberWarningProps {
  playerName: string;
  reason?: string;
  showReason: boolean;
  onViewDetails: () => void;
}
```

**Actions**:
- [ ] Warning banner styling
- [ ] Conditional reason display
- [ ] Details link

---

### T4.5 Settlement Modal UI

**Files**:
- `apps/application/src/components/golf/check-in/settlement-modal.tsx`
- `apps/application/src/components/golf/check-in/player-line-items.tsx`
- `apps/application/src/components/golf/check-in/payment-method-selector.tsx`
- `apps/application/src/components/golf/check-in/add-proshop-item-modal.tsx`
- `apps/application/src/components/golf/check-in/payment-error-display.tsx`

**Dependencies**: T4.4, T3.4, T2.2

#### 4.5.1 Settlement Modal

**Props**:
```typescript
interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  flightId: string;
  playerIds: string[];
  onSettlementComplete: (result: SettlementResult) => void;
}
```

**State**:
```typescript
interface SettlementModalState {
  players: PlayerPaymentInfo[];
  selectedPaymentMethodId: string | null;
  reference: string;
  isProcessing: boolean;
  error: PaymentError | null;
  voidablePayments: string[]; // line item IDs within void window
}
```

**Sections**:
1. Header: Player count, flight info
2. Player accordion/cards with line items
3. Add pro shop item button per player
4. Balance summary
5. Payment method selector
6. Reference input (if required)
7. Action buttons

**Actions**:
- [ ] Query playerPaymentInfo for each player
- [ ] Collapsible player sections
- [ ] Add line item integration
- [ ] Payment method selection
- [ ] Reference field (conditional)
- [ ] Process payment mutation
- [ ] Loading state during payment
- [ ] Error handling with retry
- [ ] Void payment (within window)
- [ ] Success transition to ticket

#### 4.5.2 Player Line Items

**Props**:
```typescript
interface PlayerLineItemsProps {
  player: PlayerPaymentInfo;
  onAddItem: () => void;
  allowAddItems: boolean;
}
```

**Display per line item**:
- Type icon
- Description
- Amount
- Tax indicator (if showing)
- Paid status badge

**Actions**:
- [ ] Line item list
- [ ] Paid/unpaid badges
- [ ] Tax breakdown (if enabled)
- [ ] Add item button
- [ ] Subtotal, tax, total row

#### 4.5.3 Payment Method Selector

**Props**:
```typescript
interface PaymentMethodSelectorProps {
  methods: PaymentMethodConfig[];
  selectedId: string | null;
  onSelect: (methodId: string) => void;
  disabled: boolean;
}
```

**Actions**:
- [ ] Grid of payment method buttons
- [ ] Icon + label per button
- [ ] Selected state styling
- [ ] Disabled state
- [ ] Keyboard navigation

#### 4.5.4 Add Pro Shop Item Modal

**Props**:
```typescript
interface AddProShopItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  onItemAdded: (item: BookingLineItem) => void;
}
```

**Features**:
- Search input with debounce
- Quick add items row (if enabled)
- Category tabs/filter
- Product list
- Variant selection (if product has variants)
- Add button

**Actions**:
- [ ] Search with debounce
- [ ] Quick add items display
- [ ] Category filtering
- [ ] Product list with scroll
- [ ] Variant selection modal/dropdown
- [ ] Add mutation
- [ ] Success feedback

#### 4.5.5 Payment Error Display

**Props**:
```typescript
interface PaymentErrorDisplayProps {
  error: PaymentError;
  onRetry: () => void;
  onChangeMethod: () => void;
}
```

**Actions**:
- [ ] Error message display
- [ ] Error code (if available)
- [ ] Retry button
- [ ] Change method button

---

### T4.6 Quick Check-in Popover

**Files**:
- `apps/application/src/components/golf/check-in/quick-checkin-popover.tsx`

**Dependencies**: T4.1, T4.3

**Props**:
```typescript
interface QuickCheckInPopoverProps {
  playerId: string;
  trigger: React.ReactNode;
  onCheckInComplete: () => void;
}
```

**Features**:
- Floating UI positioning
- Click outside to close
- Escape to close
- Focus trap
- Pre-paid player summary
- One-click check-in

**Display**:
- Player name
- Line items with paid status
- Total (pre-paid)
- Check In & Print button

**Actions**:
- [ ] Popover with Floating UI
- [ ] Boundary detection
- [ ] Focus management
- [ ] Payment info query
- [ ] Check-in mutation
- [ ] Success toast/animation
- [ ] Close on complete

---

## Phase 5: Starter Ticket

### T5.1 Ticket Generation API

**Files**:
- `apps/api/src/graphql/golf/ticket.resolver.ts`
- `apps/api/src/graphql/golf/ticket.service.ts`
- `apps/api/src/graphql/golf/ticket.input.ts`

**Dependencies**: T1.1, T1.2, T2.4, T4.3

**GraphQL Schema**:

```graphql
type Query {
  """Get starter ticket by ID"""
  starterTicket(id: ID!): StarterTicket

  """Get starter ticket by flight"""
  starterTicketByFlight(flightId: ID!): StarterTicket
}

type Mutation {
  """Generate starter ticket"""
  generateStarterTicket(input: GenerateTicketInput!): StarterTicket!

  """Mark ticket as printed"""
  markTicketPrinted(id: ID!): StarterTicket!

  """Reprint ticket"""
  reprintTicket(id: ID!): StarterTicket!
}

input GenerateTicketInput {
  flightId: ID!
  printOption: PrintOption!
  sendEmail: Boolean
  sendSMS: Boolean
  emailAddress: String
  phoneNumber: String
}

type StarterTicket {
  id: ID!
  ticketNumber: String!
  teeTime: DateTime!
  course: String!
  startingHole: Int!
  players: [TicketPlayer!]!
  cartNumber: String
  caddyName: String
  rentalItems: [String!]!
  specialRequests: String
  qrCodeData: String
  generatedAt: DateTime!
  generatedBy: String!
  printedAt: DateTime
  reprintCount: Int!
}

type TicketPlayer {
  name: String!
  memberNumber: String
  type: PlayerType!
}
```

**Business Logic**:
- Generate unique ticket number (ST-YYYY-MMDD-XXX)
- Pull data from flight and checked-in players
- Apply content settings from club config
- Generate QR code data
- Send email/SMS if requested

**Actions**:
- [ ] Create ticket.input.ts
- [ ] Create ticket.service.ts
- [ ] Ticket number generation
- [ ] Content assembly based on settings
- [ ] QR code generation
- [ ] Email service integration (optional)
- [ ] SMS service integration (optional)
- [ ] Write unit tests

---

### T5.2 Print Service

**Files**:
- `apps/application/src/services/print.service.ts`
- `apps/application/src/components/golf/check-in/printable-ticket.tsx`
- `apps/application/src/components/golf/check-in/printable-receipt.tsx`

**Dependencies**: T5.1

#### 5.2.1 Print Service

**Functions**:
```typescript
interface PrintService {
  printTicket(ticket: StarterTicket): Promise<void>;
  printReceipt(settlement: SettlementResult): Promise<void>;
  printCombined(ticket: StarterTicket, settlement: SettlementResult): Promise<void>;
  checkPrinterStatus(): Promise<PrinterStatus>;
}
```

**Actions**:
- [ ] Create print service
- [ ] Browser print API integration
- [ ] Print styling (CSS @media print)
- [ ] Printer status check (if supported)

#### 5.2.2 Printable Ticket Component

**Props**:
```typescript
interface PrintableTicketProps {
  ticket: StarterTicket;
}
```

**Actions**:
- [ ] Print-optimized layout
- [ ] QR code rendering
- [ ] Proper margins and sizing

#### 5.2.3 Printable Receipt Component

**Props**:
```typescript
interface PrintableReceiptProps {
  settlement: SettlementResult;
  players: PlayerPaymentInfo[];
}
```

**Actions**:
- [ ] Receipt layout
- [ ] Line items with amounts
- [ ] Tax breakdown
- [ ] Payment method and reference
- [ ] Timestamp

---

### T5.3 Ticket Display UI

**Files**:
- `apps/application/src/components/golf/check-in/ticket-preview.tsx`

**Dependencies**: T5.1

**Props**:
```typescript
interface TicketPreviewProps {
  ticket: StarterTicket;
}
```

**Actions**:
- [ ] Visual ticket display
- [ ] QR code display
- [ ] All configured fields

---

### T5.4 Print Dialog UI

**Files**:
- `apps/application/src/components/golf/check-in/print-dialog.tsx`

**Dependencies**: T5.1, T5.2, T5.3

**Props**:
```typescript
interface PrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: StarterTicket;
  settlement?: SettlementResult;
  players?: PlayerPaymentInfo[];
  defaultOption: PrintOption;
}
```

**Features**:
- Print option radio buttons
- Email receipt checkbox + input
- SMS receipt checkbox + input
- Preview button
- Print & Done button

**Actions**:
- [ ] Print option selection
- [ ] Email/SMS inputs (conditional)
- [ ] Preview modal/drawer
- [ ] Print execution
- [ ] Email/SMS sending
- [ ] Success feedback

---

## Phase 6: Integration & Polish

### T6.1 Tee Sheet Integration

**Files**:
- `apps/application/src/components/golf/tee-sheet/flight-row.tsx` (modify)
- `apps/application/src/components/golf/tee-sheet/player-cell.tsx` (modify)

**Dependencies**: T4.4, T4.5, T4.6, T5.4

**Changes**:
1. Add check-in status indicators to player cells
2. Add quick check-in action to player hover/menu
3. Add "Check In" button to flight row actions
4. Update flight status based on check-in state
5. Add starter ticket reprint action

**Actions**:
- [ ] Player cell check-in indicator
- [ ] Player cell quick action
- [ ] Flight row check-in button
- [ ] Flight status update logic
- [ ] Ticket reprint menu item
- [ ] Refresh data after check-in

---

### T6.2 POS Integration (Optional)

**Files**:
- `apps/api/src/services/pos/pos.service.ts`
- `apps/api/src/services/pos/providers/square.provider.ts`

**Dependencies**: T4.2

**Actions**:
- [ ] POS service interface
- [ ] Square provider implementation
- [ ] Payment request/response handling
- [ ] Error mapping
- [ ] Webhook handling (optional)

---

### T6.3 Error Handling & Loading States

**Dependencies**: All UI tasks

**Checklist**:
- [ ] All modals have loading skeletons
- [ ] All mutations have loading states
- [ ] All errors show user-friendly messages
- [ ] Retry buttons where appropriate
- [ ] Timeout handling for POS
- [ ] Network error handling
- [ ] Form validation errors inline

---

### T6.4 Accessibility & Keyboard Navigation

**Dependencies**: All UI tasks

**Checklist**:
- [ ] All buttons have aria-labels
- [ ] Focus management in modals
- [ ] Focus trap in modals/popovers
- [ ] Tab order follows visual hierarchy
- [ ] Escape closes modals/popovers
- [ ] Enter submits forms
- [ ] Space toggles checkboxes
- [ ] Screen reader announcements
- [ ] Color contrast compliance
- [ ] Focus visible states

---

## Testing Checklist

### Unit Tests
- [ ] Tax calculator service
- [ ] Settlement service
- [ ] Check-in service
- [ ] Ticket generation service

### Integration Tests
- [ ] Settings API endpoints
- [ ] Payment methods CRUD
- [ ] Category CRUD
- [ ] Product CRUD
- [ ] Settlement flow
- [ ] Check-in flow
- [ ] Ticket generation

### E2E Tests
- [ ] Full check-in flow (pre-paid)
- [ ] Full check-in flow (pay at desk)
- [ ] Settlement with pro shop items
- [ ] Ticket printing
- [ ] Settings configuration

---

## Summary

**Total Tasks**: 47 main tasks across 6 phases

**Estimated Components**:
- API: 12 new files
- UI: 25+ new components
- Services: 4 new services
- Types: 1 comprehensive types file

**Dependencies Flow**:
```
Phase 1 (Schema/Types)
    ↓
Phase 2 (Settings) ←→ Phase 3 (Pro Shop)
    ↓                      ↓
Phase 4 (Check-in Core) ←──┘
    ↓
Phase 5 (Starter Ticket)
    ↓
Phase 6 (Integration)
```

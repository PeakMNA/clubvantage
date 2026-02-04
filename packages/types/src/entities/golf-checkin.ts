/**
 * Golf Check-in Types for ClubVantage
 * Supports individual player check-in, settlement, and starter tickets
 */

// ============================================
// ENUMS & LITERAL TYPES
// ============================================

/** Tax calculation type */
export type TaxType = 'add' | 'include' | 'none';

/** Payment method category */
export type PaymentMethodType = 'cash' | 'card' | 'transfer' | 'account' | 'custom';

/** Line item category */
export type LineItemType = 'green_fee' | 'cart' | 'caddy' | 'rental' | 'proshop';

/** When to generate starter ticket */
export type TicketGenerateOn = 'check_in' | 'settlement' | 'manual';

/** Print output options */
export type PrintOption = 'ticket' | 'receipt' | 'combined' | 'none';

/** Extended player type for check-in (more granular than golf.ts PlayerType) */
export type CheckInPlayerType = 'member' | 'guest' | 'dependent' | 'walkup';

/** Payment status for a player */
export type PaymentStatus = 'prepaid' | 'partial' | 'unpaid';

// ============================================
// PAYMENT METHOD
// ============================================

/** Payment method configuration */
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

/** Form data for creating/updating payment method */
export interface PaymentMethodFormData {
  name: string;
  icon: string;
  type: PaymentMethodType;
  isEnabled?: boolean;
  requiresRef?: boolean;
  opensPOS?: boolean;
}

// ============================================
// TAX CONFIGURATION
// ============================================

/** Tax override for specific item type */
export interface TaxOverride {
  itemType: LineItemType;
  rate: number;
  taxType: TaxType;
}

/** Complete tax configuration */
export interface TaxConfig {
  defaultRate: number;
  defaultType: TaxType;
  taxLabel: string;
  showBreakdown: boolean;
  showTypeIndicator: boolean;
  overrides: TaxOverride[];
}

/** Form data for tax override */
export interface TaxOverrideFormData {
  itemType: LineItemType;
  rate: number;
  taxType: TaxType;
}

/** Tax calculation result */
export interface TaxCalculation {
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
}

// ============================================
// STARTER TICKET CONFIG
// ============================================

/** Ticket content visibility settings */
export interface TicketContentConfig {
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
}

/** Starter ticket configuration */
export interface StarterTicketConfig {
  generateOn: TicketGenerateOn;
  autoGenerate: boolean;
  defaultPrintOption: PrintOption;
  content: TicketContentConfig;
}

// ============================================
// PRO SHOP CONFIG
// ============================================

/** Pro shop check-in integration settings */
export interface ProShopConfig {
  allowAddAtCheckIn: boolean;
  showQuickAddItems: boolean;
  quickAddProductIds: string[];
}

// ============================================
// POS CONFIG
// ============================================

/** POS terminal configuration */
export interface POSConfig {
  isConnected: boolean;
  provider?: string;
  terminalId?: string;
  config?: Record<string, unknown>;
}

// ============================================
// CHECK-IN SETTINGS (COMPLETE)
// ============================================

/** Check-in policy rules */
export interface CheckInPolicy {
  allowPartialPayment: boolean;
  blockSuspendedMembers: boolean;
  showSuspensionReason: boolean;
  requireAllItemsPaid: boolean;
}

/** Complete check-in settings for a club */
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

/** Pro shop product category */
export interface ProShopCategory {
  id: string;
  clubId: string;
  name: string;
  description?: string;
  defaultTaxRate: number;
  defaultTaxType: TaxType;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Form data for creating/updating category */
export interface ProShopCategoryFormData {
  name: string;
  description?: string;
  defaultTaxRate: number;
  defaultTaxType: TaxType;
  isActive?: boolean;
}

// ============================================
// PRO SHOP PRODUCT
// ============================================

/** Product variant (size, color, etc.) */
export interface ProShopVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  priceAdjustment: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Form data for creating/updating variant */
export interface ProShopVariantFormData {
  id?: string;
  name: string;
  sku?: string;
  priceAdjustment: number;
  _delete?: boolean;
}

/** Pro shop product */
export interface ProShopProduct {
  id: string;
  clubId: string;
  categoryId: string;
  category?: ProShopCategory;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  taxRate: number;
  taxType: TaxType;
  useCategoryDefaults: boolean;
  /** Calculated: actual tax rate (from product or category) */
  effectiveTaxRate?: number;
  /** Calculated: actual tax type (from product or category) */
  effectiveTaxType?: TaxType;
  variants: ProShopVariant[];
  isActive: boolean;
  isQuickAdd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Form data for creating/updating product */
export interface ProShopProductFormData {
  categoryId: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  taxRate?: number;
  taxType?: TaxType;
  useCategoryDefaults?: boolean;
  variants?: ProShopVariantFormData[];
  isActive?: boolean;
  isQuickAdd?: boolean;
}

/** Paginated product list response */
export interface ProShopProductConnection {
  items: ProShopProduct[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/** Product list query filters */
export interface ProShopProductFilters {
  categoryId?: string;
  search?: string;
  isActive?: boolean;
  isQuickAdd?: boolean;
  page?: number;
  limit?: number;
}

// ============================================
// BOOKING LINE ITEM
// ============================================

/** Line item for a player's booking charges */
export interface BookingLineItem {
  id: string;
  bookingPlayerId: string;
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
  createdAt: Date;
  updatedAt: Date;
}

/** Form data for adding a line item */
export interface AddLineItemInput {
  type: LineItemType;
  description: string;
  baseAmount: number;
  productId?: string;
  variantId?: string;
}

// ============================================
// PLAYER PAYMENT INFO
// ============================================

/** Complete payment information for a player */
export interface PlayerPaymentInfo {
  playerId: string;
  playerName: string;
  playerType: CheckInPlayerType;
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

/** Player data for check-in modal selection */
export interface CheckInPlayer {
  id: string;
  name: string;
  type: CheckInPlayerType;
  memberNumber?: string;
  isCheckedIn: boolean;
  checkedInAt?: Date;
  isSuspended: boolean;
  suspensionReason?: string;
  paymentStatus: PaymentStatus;
  totalDue: number;
  totalPaid: number;
  balanceDue: number;
}

// ============================================
// FLIGHT CHECK-IN INFO
// ============================================

/** Flight data for check-in modal header */
export interface FlightCheckInInfo {
  id: string;
  teeTime: Date;
  course: string;
  startingHole: number;
  cartNumber?: string;
  caddyAssignment?: string;
  players: CheckInPlayer[];
}

// ============================================
// SETTLEMENT
// ============================================

/** Settlement request payload */
export interface SettlementInput {
  playerIds: string[];
  paymentMethodId: string;
  reference?: string;
  notes?: string;
}

/** Result for a single player settlement */
export interface PlayerSettlementResult {
  playerId: string;
  amountPaid: number;
  success: boolean;
  error?: string;
}

/** Complete settlement result */
export interface SettlementResult {
  success: boolean;
  transactionId?: string;
  settledAt: Date;
  settledBy: string;
  players: PlayerSettlementResult[];
  error?: string;
}

/** Payment error details */
export interface PaymentError {
  code: string;
  message: string;
  isRetryable: boolean;
  details?: Record<string, unknown>;
}

// ============================================
// CHECK-IN REQUEST/RESPONSE
// ============================================

/** Check-in request payload */
export interface CheckInInput {
  flightId: string;
  playerIds: string[];
  generateTicket: boolean;
  printOption?: PrintOption;
}

/** Result for a single player check-in */
export interface PlayerCheckInResult {
  playerId: string;
  checkedIn: boolean;
  error?: string;
}

/** Complete check-in result */
export interface CheckInResult {
  success: boolean;
  checkedInAt: Date;
  checkedInBy: string;
  players: PlayerCheckInResult[];
  ticketId?: string;
  ticketNumber?: string;
}

// ============================================
// STARTER TICKET
// ============================================

/** Player info on starter ticket */
export interface StarterTicketPlayer {
  name: string;
  memberNumber?: string;
  type: CheckInPlayerType;
}

/** Complete starter ticket */
export interface StarterTicket {
  id: string;
  clubId: string;
  flightId: string;
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
  createdAt: Date;
  updatedAt: Date;
}

/** Ticket generation request */
export interface GenerateTicketInput {
  flightId: string;
  printOption: PrintOption;
  sendEmail?: boolean;
  sendSMS?: boolean;
  emailAddress?: string;
  phoneNumber?: string;
}

// ============================================
// PLAYER CHECK-IN RECORD
// ============================================

/** Database record for player check-in */
export interface PlayerCheckInRecord {
  id: string;
  bookingPlayerId: string;
  checkedInAt: Date;
  checkedInBy: string;
  settledAt?: Date;
  settledVia?: string;
  settledBy?: string;
  totalPaid: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// BULK OPERATIONS
// ============================================

/** Bulk update for products */
export interface BulkUpdateProductInput {
  categoryId?: string;
  isActive?: boolean;
  isQuickAdd?: boolean;
}

/** Reorder items input */
export interface ReorderInput {
  orderedIds: string[];
}

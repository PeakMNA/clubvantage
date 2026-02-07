# POS / Sales / Core Transaction Flow

## Overview

The POS Sales module is the primary staff-facing transaction interface for all ClubVantage outlets. It provides a unified screen for ticket creation, product selection, cart management, discount application, payment processing, and receipt generation. The sales page composes shared UI components (POSToolbar, POSProductPanel, POSLineItemPanel, POSReceiptTotals, POSActionBar) into a full-screen layout that adapts to the active outlet's template configuration.

Every transaction follows a lifecycle: a ticket is created (explicitly or implicitly on first item add), line items accumulate, optional discounts and member associations are applied, payment is processed through one or more methods, and a receipt is generated. Tickets can be held and recalled, split across payers, voided with appropriate authorization, and are always recorded with station and staff attribution.

## Status

| Aspect | State |
|--------|-------|
| Sales page layout | Built -- full-screen with toolbar, product panel, line item sidebar, action bar |
| Product panel | Built -- renders categories, tiles, quick keys, suggestions from mock data |
| Cart management | Built -- add/remove items, quantity adjustment, variant+modifier price calculation |
| Outlet selector | Built -- dropdown in header, fetches outlets via useGetPosOutletsQuery |
| Template config loading | Built -- reads toolbarGroups and actionButtons from posConfig.toolbarConfig JSON |
| Toolbar (3-zone) | Built -- converts template groups to zone-based layout, routes handler callbacks |
| Action bar (grid) | Built -- converts template buttons to grid layout with button registry and states |
| Keyboard shortcuts | Built -- useKeyboardShortcuts hook in POSConfigProvider |
| Payment processing | Placeholder -- handler logs to console and shows alert |
| Discount application | Placeholder -- action bar button wired, no modal or logic |
| Void/cancel | Placeholder -- clears cart, no transaction recording |
| Hold/recall ticket | Placeholder -- handler stubs only |
| Member lookup & attach | Placeholder -- alert stubs |
| Credit limit checking | Not started |
| Cash drawer integration | Not started |
| EOD settlement flow | Not started |
| Station locking | Not started |
| Receipt printing | Not started |
| Transaction persistence | Not started -- cart is local state, no GraphQL mutations |
| Real product data | Not started -- using 20 hardcoded mock products |

## Capabilities

- Create and manage a ticket (current order) with line items
- Add products via product panel tile click, with variant picker and modifier modal flows
- Adjust line item quantity inline with +/- controls
- Remove line items individually or clear the entire cart
- Display running subtotal, tax (configurable rate), and grand total
- Switch between outlets via header dropdown, reloading template config per outlet
- Render toolbar buttons from template toolbarConfig, routed to zone-based layout
- Render action bar buttons from template actionBarConfig, with enabled/disabled states based on cart contents
- Show date, time, server identity, and session stats in the POS header
- Support keyboard shortcut execution for registered buttons
- Apply line item discounts (percentage or fixed amount) with reason tracking
- Apply order-level discounts with member tier auto-application
- Enforce discount approval workflow when thresholds are exceeded
- Check member credit limits before processing account charges
- Process payments via card, cash, member account charge, or split across methods
- Hold a ticket for later recall and recall held tickets
- Void a ticket or individual line items with manager authorization
- Print receipts to configured station printer
- Record all transactions with staff, station, and timestamp attribution

## Dependencies

### Interface Dependencies

| Component | Package | Purpose |
|-----------|---------|---------|
| POSToolbar | @clubvantage/ui | Three-zone header toolbar with search, member, table, and ticket actions |
| POSProductPanel | @clubvantage/ui | Product grid with categories, quick keys, suggestions, variant/modifier modals |
| POSLineItemPanel | @clubvantage/ui | Scrollable line item list with quantity controls and notes display |
| POSReceiptTotals | @clubvantage/ui | Subtotal, discount breakdown, tax, total, balance due display |
| POSActionBar | @clubvantage/ui | Bottom button grid rendered from template actionBarConfig |
| POSButton | @clubvantage/ui | Individual action button with variant, size, icon, shortcut badge |
| POSConfigProvider | @/components/pos | React Context fetching resolved config and providing button states, action handlers |
| POSStationGuard | @/components/pos | Ensures a station is selected before rendering POS UI |
| useGetPosConfigQuery | @clubvantage/api-client | Fetches resolved POS config for outlet + user role |
| useGetPosOutletsQuery | @clubvantage/api-client | Fetches list of active outlets for the club |

### Settings Dependencies

| Setting | Location | Impact |
|---------|----------|--------|
| Club tax settings | ClubSettings | Default tax rate and tax type (ADD/INCLUDE/NONE) applied to transactions |
| Outlet template assignment | POSOutlet.templateId | Determines toolbar layout, action bar buttons, grid config |
| Role overrides | POSOutletRoleConfig | Controls button visibility/enabled/approval per staff role |
| Discount presets | Discount table | Available preset discounts shown in discount modal |
| Member credit limits | Member model | creditLimit, creditAlertThreshold, creditBlockEnabled fields |
| Payment methods | ClubSettings | Enabled payment methods (card, cash, member account, split) |
| Station peripherals | POSStation.peripherals | Receipt printer, cash drawer, card terminal assignments |
| Session timeout | AuthContext | Inactivity timeout duration, warning threshold |

### Data Dependencies

| Entity | Relation | Usage |
|--------|----------|-------|
| POSOutlet | Template, Station | Provides resolved config for the sales page |
| POSTemplate | toolbarConfig, actionBarConfig | Defines UI layout and available actions |
| Product | Category, Variants, ModifierGroups | Populates product panel grid |
| OutletProductConfig | Per-outlet display overrides | Controls visibility, quick keys, sort priority per product |
| OutletGridConfig | Grid layout settings | Columns, rows, tile size, category style |
| Member | CreditLimit, AccountBalance | Validates charges, displays balance info |
| Discount | Conditions, Approval rules | Preset discounts available for selection |
| PaymentTransaction | LineItems, AppliedDiscounts | Persisted transaction record |
| BookingLineItem | Product, Variant, Modifiers | Individual items on the ticket |
| POSStation | Peripherals | Station context for receipts and drawer operations |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| defaultTaxRate | Decimal | 0.07 | Club admin | Tax percentage applied to taxable items |
| taxCalculationMethod | Enum (ADD, INCLUDE, NONE) | ADD | Club admin | Whether tax is added on top, included in price, or exempt |
| currencyCode | String | USD | Club admin | ISO 4217 currency code for formatting |
| currencyLocale | String | en-US | Club admin | Locale for number/currency formatting |
| requireMemberForCharge | Boolean | true | Club admin | Whether a member must be attached before member account charge |
| maxDiscountPercentWithoutApproval | Decimal | 20 | Club admin | Maximum discount percentage before manager approval required |
| maxDiscountAmountWithoutApproval | Decimal | 500 | Club admin | Maximum discount amount before manager approval required |
| autoApplyMemberDiscount | Boolean | true | Club admin | Whether member tier discounts auto-apply when member is attached |
| holdTicketMaxAge | Integer (minutes) | 1440 | Club admin | Maximum age of a held ticket before auto-void (24 hours) |
| receiptFooterText | String | "Thank you for visiting!" | Club admin | Custom text printed at bottom of receipts |
| receiptShowMemberNumber | Boolean | true | Club admin | Whether to print member number on receipt |
| receiptShowStaffName | Boolean | true | Club admin | Whether to print staff name on receipt |
| tipEnabled | Boolean | false | Outlet template | Whether tip prompt appears during payment |
| tipPresets | Number[] | [10, 15, 20] | Outlet template | Percentage presets shown on tip prompt |
| splitPaymentEnabled | Boolean | true | Outlet template | Whether split payment option is available |
| cashPaymentEnabled | Boolean | true | Outlet template | Whether cash payment is available at this outlet |
| sessionInactivityTimeout | Integer (minutes) | 15 | Club admin | Minutes of inactivity before auto-logout |
| sessionWarningBefore | Integer (minutes) | 2 | Club admin | Minutes before timeout to show warning prompt |

## Data Model

interface CartItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  variantId?: string;
  variantName?: string;
  modifiers?: Array<{ id: string; name: string; price: number }>;
  totalPrice: number;
  discounts?: AppliedLineDiscount[];
  notes?: string;
}

interface AppliedLineDiscount {
  discountId?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  amount: number;
  reason: string;
  approvedBy?: string;
}

interface Ticket {
  id: string;
  outletId: string;
  stationId?: string;
  stationName?: string;
  ticketNumber: string;
  staffId: string;
  staffName: string;
  memberId?: string;
  memberName?: string;
  memberNumber?: string;
  status: TicketStatus;
  lineItems: CartItem[];
  orderDiscount?: AppliedLineDiscount;
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  payments: TicketPayment[];
  createdAt: string;
  updatedAt: string;
  heldAt?: string;
  settledAt?: string;
}

type TicketStatus = 'OPEN' | 'HELD' | 'SETTLED' | 'VOIDED' | 'PARTIALLY_PAID';

interface TicketPayment {
  id: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  processedAt: string;
  processedBy: string;
}

type PaymentMethod = 'CASH' | 'CARD' | 'MEMBER_ACCOUNT' | 'GIFT_CARD' | 'SPLIT';

interface ToolbarGroup {
  id: string;
  label: string;
  zone: 'left' | 'center' | 'right';
  items: string[];
}

interface TemplateToolbarConfig {
  groups: ToolbarGroup[];
}

interface TemplateActionButton {
  id: string;
  label: string;
  actionType: string;
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  position: 'left' | 'center' | 'right';
}

interface TemplateActionBarConfig {
  buttons: TemplateActionButton[];
}

## Business Rules

1. A ticket is implicitly created when the first item is added to an empty cart. The ticket number is generated as YYMMDD-NNNN where NNNN is a sequential counter per outlet per day.

2. When a product tile is clicked, the system checks product type and modifier status to determine the flow: SIMPLE without modifiers adds directly, SIMPLE with modifiers opens the modifier modal, VARIABLE opens the variant picker first, VARIABLE with modifiers chains variant picker then modifier modal.

3. If an identical product+variant+modifier combination already exists in the cart, the quantity increments by one rather than creating a duplicate line item. Identity is determined by hashing productId + variantId + sorted modifier IDs.

4. Line item unit price is calculated as basePrice + variantPriceAdjustment + sum of modifier price adjustments. This price is locked at time of addition and does not change if the product price is later updated.

5. Tax is calculated on the discounted subtotal. If an order-level discount is applied, tax applies to (subtotal - discount). Line item discounts reduce the taxable amount of the individual item.

6. Discount approval is required when the discount percentage exceeds maxDiscountPercentWithoutApproval or the discount amount exceeds maxDiscountAmountWithoutApproval. The approval flow opens a manager PIN entry modal.

7. Member tier discounts auto-apply when autoApplyMemberDiscount is true and a member is attached to the ticket. The discount is recalculated if the member is changed or detached.

8. Credit limit checking occurs at payment time when the payment method is MEMBER_ACCOUNT. If the charge would bring the member's balance above creditAlertThreshold percentage, a warning is shown. If it would exceed creditLimit and creditBlockEnabled is true, payment is blocked unless a manager override is provided.

9. Held tickets are persisted server-side and appear on the Open Tickets page. They can be recalled by any staff member at the same outlet. Held tickets older than holdTicketMaxAge are auto-voided by a scheduled job.

10. Voiding a ticket or line item requires manager authorization if the item total exceeds a configurable threshold. Voided items remain in the transaction record with status VOIDED for audit purposes.

11. Split payment allows a ticket to be paid across multiple methods. The balance due updates after each partial payment. The ticket transitions to SETTLED only when balanceDue reaches zero.

12. All transactions record stationId and stationName. The station name is denormalized so it persists even if the station is renamed or deleted later.

13. The toolbar and action bar layouts are driven entirely by the outlet's assigned template. If no template is assigned or config is missing, hardcoded defaults are used as fallback.

14. Button states (visible/enabled/requiresApproval) are resolved server-side by merging template config with role overrides, then sent to the client. The client re-evaluates enabled states locally for cart-dependent conditions (e.g., pay button disabled when cart is empty).

15. Session timeout is activity-based. Mouse, keyboard, touch, and scroll events reset the inactivity timer. The timer is throttled to once per second. A warning modal appears sessionWarningBefore minutes before logout.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| No outlet assigned to user | Show outlet selector dropdown with all active outlets; do not render POS until one is selected |
| Outlet has no template | Fall back to hardcoded default toolbar and action bar configs (F&B template) |
| Template toolbarConfig JSON is malformed | Catch parse error, fall back to default config, log warning |
| Product is out of stock after adding to cart | Show warning toast; allow completing the current ticket but prevent adding more of that item |
| Price changed while ticket is open | Keep the locked-in price from when the item was added; do not retroactively update |
| Member detached after auto-discount applied | Remove the auto-applied member discount and recalculate totals |
| Discount makes line total negative | Cap discount at the line item total; line total cannot go below zero |
| Multiple discounts on same line item | Only one discount per line item is allowed; applying a new one replaces the existing one |
| Split payment where first method fails | Keep the ticket in OPEN status; do not record the failed payment; allow retry or alternate method |
| Network failure during payment | Show error toast with retry option; do not mark ticket as settled; preserve cart state |
| Browser tab hidden during session | On visibility change, check session validity and refresh tokens; logout if session expired |
| Cart cleared accidentally | No undo for clear cart; voided tickets retain full line item history for audit |
| Station disconnected from outlet | Show station selector modal; block POS operations until a valid station is selected |
| Manager PIN entered incorrectly 3 times | Lock approval flow for 5 minutes; show "Contact administrator" message |
| Held ticket recalled at different station | Allow recall; update stationId to the new station for subsequent operations |
| Two staff try to recall same held ticket | First recall succeeds; second gets "Ticket already in use" error with option to force-take |
| Receipt printer offline | Show print failure toast; offer to email receipt or retry print later |
| Cash drawer fails to open | Show warning; allow manual drawer open option; continue with transaction |
| Tax rate changes mid-day | Apply the tax rate that was in effect when the ticket was created; do not retroactively change open tickets |
| Outlet deactivated while staff is using POS | Show "Outlet unavailable" overlay; redirect to outlet selector; preserve any open ticket as held |

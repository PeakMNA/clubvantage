# Integration: POS Settlement from Golf Check-In

## Overview

Documents how the golf check-in process integrates with the POS system for payment processing, particularly for green fees, cart rentals, proshop purchases, and F&B charges at check-in. The Golf module's SettlementPanel and the POS module's transaction pipeline must share product catalogs, payment processing infrastructure, outlet context, and receipt generation.

Currently, the Golf check-in flow manages its own PlayerCart with CartLineItems and supports payment methods (CASH, CARD, MEMBER_ACCOUNT). The POS module has a separate Ticket/CartItem model with its own product panel, payment processing, and receipt flow. This integration spec defines how these two systems converge so that golf check-in can leverage POS product catalogs for proshop/F&B additions, route card payments through POS terminal infrastructure, and generate unified receipts.

## Status

- Design: Documented here
- Implementation: Not yet built -- Golf check-in and POS are separate modules with independent cart models and payment flows. Golf uses PlayerCart/CartLineItem; POS uses Ticket/CartItem. The `enableProShopAtCheckIn` setting exists in Golf, and `quickAddProducts` array is configured, but these reference hardcoded mock products rather than the POS Product catalog. Card payment in Golf logs to console (placeholder). POS card payment is also placeholder. No shared payment processing layer exists yet.

## Data Flow

```
Golf Check-In initiated (staff clicks check-in on FlightCheckInPanel)
  -> PlayerCart loaded for selected player(s)
    -> Cart displays existing items: GREEN_FEE, CART, CADDY line items
      -> Staff optionally adds proshop items:
        -> [INTEGRATION POINT] Product lookup against POS Product catalog
          -> Product/variant/modifier selection (reuse POSProductPanel or simplified picker)
            -> CartLineItem created with type PRO_SHOP, linked to POS productId
      -> Staff optionally adds F&B items:
        -> [INTEGRATION POINT] F&B outlet menu lookup via POS Product catalog
          -> CartLineItem created with type PRO_SHOP, linked to POS productId
      -> Settlement screen displayed (SettlementPanel)
        -> Subtotal, tax, grand total calculated
          -> Payment method selected:
            -> MEMBER_ACCOUNT:
              -> Credit limit check against Member model
                -> CartLineItem.isPaid = true
                  -> [INTEGRATION POINT] Post to member AR account
            -> CARD:
              -> [INTEGRATION POINT] Route to POS terminal via POSStation.peripherals
                -> Card terminal processes payment
                  -> CartLineItem.isPaid = true, reference = terminal txn ID
            -> CASH:
              -> [INTEGRATION POINT] Open cash drawer via POSStation.peripherals
                -> Cash tendered, change calculated
                  -> CartLineItem.isPaid = true
          -> Receipt generated:
            -> [INTEGRATION POINT] Print via POSStation receipt printer
              -> Receipt includes: player name, tee time, course, charges breakdown, payment method
                -> Player status updated to CHECKED_IN
                  -> Event: player.checkedIn emitted
```

## Trigger Points

1. **Check-in button pressed**: Opens FlightCheckInPanel with the player's PlayerCart. Cart pre-populated with golf-specific charges (GREEN_FEE, CART, CADDY) from the booking.
2. **Add proshop/F&B items**: When `enableProShopAtCheckIn` is true, staff can add products from the POS catalog. `quickAddProducts` setting provides shortcut tiles. Full product search available for other items. Products are sourced from the POS Product table, filtered by the Golf Pro Shop outlet's product configuration (OutletProductConfig).
3. **Pay button pressed**: Initiates payment through the selected method. CARD and CASH payments should route through the POS terminal and cash drawer infrastructure tied to the staff's current POSStation. MEMBER_ACCOUNT payments bypass POS hardware and post directly to the member's AR account.
4. **Receipt generation**: After successful payment, receipt data is formatted and sent to the receipt printer configured on the POSStation. Receipt format follows POS receipt template but includes golf-specific fields (tee time, course, starting hole, cart number).
5. **Batch settlement**: When multiple players are selected for group settlement, the system combines PlayerCarts and presents a unified settlement view. Payment can be split across players (individual mode) or combined (group mode with single payment).

## Dependencies

- **Golf module**: PlayerCart, CartLineItem, CartDraft, FlightCheckInPanel, SettlementPanel, check-in workflow, `enableProShopAtCheckIn` setting, `quickAddProducts` setting, `paymentMethods` setting, `posTerminalEnabled` setting
- **POS module**: Product, ProductCategory, ProductVariant, ModifierGroup, OutletProductConfig (for pro shop product catalog), POSOutlet (Golf Pro Shop outlet), POSStation (terminal, printer, cash drawer peripherals), POSTemplate (receipt format), Ticket (for creating a POS transaction record when card/cash payment is used)
- **Billing module**: InvoiceLineItem (for MEMBER_ACCOUNT charges), ARProfile (member balance and credit limit), ChargeType (GREEN_FEE, CART_RENTAL, CADDY_FEE, PRO_SHOP)
- **Members module**: Member model (creditLimit, creditAlertThreshold, creditBlockEnabled for credit checks), membership type (for tier-based pricing and auto-discounts)
- **Settings**: Club tax settings, POS terminal configuration, receipt configuration (`receiptFooterText`, `receiptShowMemberNumber`, `receiptShowStaffName`)

## Business Rules

- The default outlet for all golf check-in transactions is the "Golf Pro Shop" POSOutlet. This outlet determines which products are available (via OutletProductConfig), which receipt template is used, and which GL cost center receives revenue attribution.
- Member account charge posts to the member's AR account as an InvoiceLineItem. No immediate payment is processed through POS hardware. The charge appears on the member's next billing cycle invoice.
- Card payments must be processed through the POS terminal assigned to the staff's current POSStation. If `posTerminalEnabled` is false in Golf settings, card payment option is hidden. If the terminal is offline, card payment is unavailable with a clear error message.
- Cash payments trigger a cash drawer open command via the POSStation peripheral. Change calculation is displayed on the SettlementPanel. If no cash drawer is configured, payment is still recorded but no drawer command is sent.
- Receipt includes: player name, member number (if member), tee time, course name, starting hole, cart number (if assigned), itemized charges with tax, payment method, staff name, date/time, and `receiptFooterText`. Format follows the POS receipt template assigned to the Golf Pro Shop outlet.
- When proshop items are added at check-in, they are added as CartLineItems with `type: 'PRO_SHOP'` and linked to the POS `productId`. Price is locked at time of addition (consistent with POS business rule that prices do not retroactively update on open tickets).
- Member tier discounts: if `autoApplyMemberDiscount` is true in POS settings and a member is attached (which they always are at golf check-in for member/dependent players), tier discounts auto-apply to eligible proshop items. Golf fees (GREEN_FEE, CART, CADDY) use their own rate card pricing and are not subject to POS discount rules.
- Cart deposit handling: if a cart deposit is required, it appears as a CartLineItem. On cart return, the deposit is refunded. If original payment was CARD, refund routes through POS terminal. If MEMBER_ACCOUNT, a credit line item is created.
- Caddy tip is separate from caddy fee. Tips are typically cash-only and handled outside the system. If a club wants to track tips through the system, they appear as a separate CartLineItem with type PRO_SHOP and a dedicated ChargeType.
- When a POS Ticket is created for card/cash golf transactions, it must be tagged with the Golf Pro Shop `outletId` and the `stationId` for proper financial attribution and station-level reporting.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| POS system/terminal offline | Fall back to MEMBER_ACCOUNT and CASH (without drawer) payment methods only. Card payment option is disabled with message "Card terminal unavailable". Staff can manually record card payment with reference number if terminal processes offline. |
| Split payment (partial card + partial member charge) | Create separate payment records for each method. Card portion creates a POS transaction; member charge portion creates an InvoiceLineItem. Both link back to the same PlayerCart via reference. CartLineItems can be split across payment methods. |
| Group check-in (4 players at once) | Batch settlement mode: present combined cart for all selected players. Options: (a) one payer covers all -- single payment, (b) split evenly -- divide total by player count, (c) individual -- each player settles their own cart. Item transfers between carts available pre-settlement. |
| Proshop item out of stock at check-in | Item is greyed out in quick-add panel. If added via manual search and stock is zero, show warning toast. Allow completing the transaction (consistent with POS edge case handling) but prevent adding more of that item. |
| Member payment declined (over credit limit) | Show credit limit warning with current balance and limit. If `creditBlockEnabled`, block MEMBER_ACCOUNT payment and offer CARD/CASH alternatives. Manager override available via PIN entry modal (same flow as POS discount approval). |
| Receipt printer offline | Show print failure toast. Offer alternatives: email receipt to member (if email on file), save as PDF, or retry print. Transaction is still completed regardless of print status. |
| Product price changed between adding to cart and settlement | Price locked at time of addition to cart (same as POS rule). No retroactive price updates. |
| Discount exceeds approval threshold | If a staff member applies a discount on a proshop item that exceeds `maxDiscountPercentWithoutApproval` or `maxDiscountAmountWithoutApproval`, the manager approval PIN modal is triggered before the discount is applied. |
| Golf Pro Shop outlet not configured | Fall back to club default outlet for product catalog and receipt template. Log warning for admin to configure the Golf Pro Shop outlet. |
| Staff has no POSStation assigned | Show station selector modal before processing card/cash payments. MEMBER_ACCOUNT payment does not require a station. |
| Network failure during card payment | Card terminal handles offline mode per its own protocol. If terminal reports success but server fails to record, show retry/manual-record option. Cart draft is preserved for recovery. |
| Walk-up player (no member record) | MEMBER_ACCOUNT payment is unavailable. CARD and CASH only. No member number on receipt. No credit limit check needed. |

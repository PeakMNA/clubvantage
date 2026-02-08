# Integration: Golf Charges to Billing

## Overview

Documents how golf-related charges (green fees, cart rentals, caddy fees) flow from golf tee time bookings into the billing/invoicing system. When a player books a tee time, fee estimates are captured on the PlayerCart as CartLineItems. At check-in, fees are confirmed or adjusted through the SettlementPanel. Once settled via member account charge, the amounts must flow into the Billing module as InvoiceLineItems tied to the member's ARProfile, ultimately appearing on the next billing cycle invoice.

This integration bridges the Golf module's per-player shopping cart model (PlayerCart, CartLineItem) with the Billing module's invoice generation pipeline (ClubBillingSettings, MemberBillingProfile, Invoice, InvoiceLineItem). It also covers guest and dependent fee attribution, no-show/cancellation charges, and fee dispute workflows.

## Status

- Design: Documented here
- Implementation: Partial -- charges are stored on PlayerCart via CartLineItem (types: GREEN_FEE, CART, CADDY, RENTAL, PRO_SHOP) with full price, tax, and payment tracking. However, automatic creation of InvoiceLineItems from settled member account charges is not yet implemented. The Golf check-in settlement flow records payments with `paidVia` and `reference` fields, but the bridge to the Billing module's invoice pipeline does not exist yet.

## Data Flow

```
TeeTime booking confirmed
  -> PlayerCart created per player with CartLineItems (GREEN_FEE, CART, CADDY)
    -> (At check-in) SettlementPanel displays cart; fees confirmed/adjusted
      -> Payment method selected:
        -> If MEMBER_ACCOUNT:
          -> CartLineItem.isPaid = true, paidVia = 'MEMBER_ACCOUNT'
            -> [NOT YET BUILT] InvoiceLineItem created per charge type
              -> Linked to ChargeType (GREEN_FEE, CART_RENTAL, CADDY_FEE)
                -> Linked to member's ARProfile
                  -> Included in next billing cycle invoice generation
        -> If CASH/CARD:
          -> CartLineItem.isPaid = true, paidVia = 'CASH'/'CARD'
            -> Payment recorded directly; no invoice line item needed
              -> Revenue attributed to Golf Pro Shop outlet
```

## Trigger Points

1. **Booking creation**: PlayerCart initialized with CartLineItems based on booking configuration (course, time slot, player type, cart/caddy selections). Amounts calculated from rate cards but not yet billed.
2. **Check-in settlement**: Staff reviews charges in SettlementPanel. Items can be added (pro shop quick-add), removed, or quantity-adjusted. Tax calculated per item based on `defaultTaxType` and `defaultTaxRate` settings. Payment method selected.
3. **Member account charge**: When payment method is MEMBER_ACCOUNT, the settled amount must create InvoiceLineItems linked to the member's ARProfile. Credit limit check occurs here (if `creditBlockEnabled` on Member model).
4. **Billing cycle run**: The billing cycle job (governed by ClubBillingSettings frequency, timing, alignment) collects all unbilled InvoiceLineItems for each member, groups them by ChargeType, and generates the period invoice. Invoice generation respects `invoiceGenerationLead` days.
5. **Round completion / no-show detection**: After tee time passes, any no-show players trigger configurable no-show fee logic. Cancellations outside the policy window trigger cancellation fees.

## Dependencies

- **Golf module**: PlayerCart, CartLineItem (types: GREEN_FEE, CART, CADDY, RENTAL, PRO_SHOP), CartDraft, check-in workflow, SettlementPanel, payment processing
- **Billing module**: Invoice, InvoiceLineItem, ChargeType, ClubBillingSettings (frequency, timing, alignment, billing day), MemberBillingProfile (per-member overrides), billing cycle job
- **AR module**: ARProfile for member billing account linkage, balance tracking, credit limit enforcement
- **Members module**: Member status (ACTIVE required for billing), membership type (determines rate cards), dependent relationships (for dependent fee attribution)
- **Settings**: Club tax settings (defaultTaxRate, taxCalculationMethod), golf-specific fee configuration

## Business Rules

- Green fee determined by: course, time of day (peak/off-peak), day of week (weekday/weekend), member tier (from membership type), holes (9/18), and player type (member/guest/dependent/walk-up).
- Cart fee determined by: cart type (SINGLE/SHARED), duration, and whether cart is included in membership tier benefits.
- Caddy fee determined by: caddy skill level, shared/individual assignment, and club-configured caddy rate card.
- Guest fees are charged to the sponsoring member's ARProfile. The InvoiceLineItem must reference both the guest name and the sponsoring member's account.
- Dependent fees are charged to the primary member's ARProfile. The InvoiceLineItem must reference the dependent name.
- Walk-up players cannot use MEMBER_ACCOUNT payment; they must pay via CASH or CARD at check-in.
- No-show fees: configurable per club (charge full green fee / partial percentage / no charge). Applied when tee time passes and player status remains BOOKED (not CHECKED_IN).
- Cancellation within policy window (configurable hours before tee time): no charge. Cancellation outside policy window: configurable fee (percentage of green fee or fixed amount).
- Tax on golf charges follows the club's `taxCalculationMethod` (ADD, INCLUDE, NONE) and `defaultTaxRate`. Per-item tax override is possible if `perItemTaxOverride` is enabled.
- Member account charges respect `creditAlertThreshold` (warning) and `creditLimit` + `creditBlockEnabled` (block). Manager override can bypass the block.
- InvoiceLineItems created from golf charges must include the `outletId` of the Golf Pro Shop outlet for financial attribution and GL posting.
- Settled charges where `isPaid = true` and `paidVia = 'MEMBER_ACCOUNT'` are the only charges that flow into the billing pipeline. CASH and CARD payments are recorded as direct revenue.
- Billing hold (`MemberBillingProfile.billingHold = true`) prevents invoice generation but does NOT prevent member account charges from being recorded as InvoiceLineItems. The items accumulate and appear on the first invoice after hold is lifted.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Member has no ARProfile | Block MEMBER_ACCOUNT payment at check-in; offer CASH/CARD only. Staff can create ARProfile from member detail page before retrying. |
| Member over credit limit | Warning displayed at settlement if charge exceeds `creditAlertThreshold`. Payment blocked if `creditBlockEnabled` is true and charge would exceed `creditLimit`. Manager override available via PIN entry. |
| Round cancelled mid-play (weather, injury) | Pro-rate charges based on holes completed vs. total holes booked. Staff adjusts CartLineItem amounts in SettlementPanel before settling. Adjustment creates a credit note if already partially paid. |
| Guest no-show | Charge sponsoring member per club no-show policy. InvoiceLineItem created on sponsor's ARProfile with description indicating guest name and no-show. |
| Dependent no-show | Charge primary member per club no-show policy, same as guest no-show handling. |
| Fee dispute after settlement | Staff can issue a credit note via the Application billing interface. Credit note creates a negative InvoiceLineItem linked to the original charge's ChargeType. Requires manager authorization if amount exceeds threshold. |
| Member suspended between check-in and billing cycle | InvoiceLineItem already created at settlement time. Billing cycle skips SUSPENDED members (per billing rules), so the charge remains as an unbilled line item until member is reactivated or account is reconciled manually. |
| Booking modified after initial cart creation | PlayerCart items are recalculated. If cart was in draft state (CartDraft), updates are straightforward. If already partially paid, paid items are locked and only unpaid items can be adjusted. |
| Multiple rounds in same billing cycle | Each round's charges create separate InvoiceLineItems. All appear on the same billing cycle invoice, grouped by ChargeType. |
| Proration applies to member joining mid-cycle | Golf charges are transactional (not recurring), so proration from ClubBillingSettings does not apply. Golf charges appear in full on whichever billing cycle they fall within. |
| Tax rate changes between booking and check-in | Tax is calculated at settlement time (check-in), not at booking time. The rate in effect at settlement applies. |
| Cart deposit required | Cart deposit is tracked as a separate CartLineItem of type RENTAL. Refund on cart return creates a negative line item or direct refund depending on payment method. |

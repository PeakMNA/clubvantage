# Integration: Multi-Outlet Context & Routing

## Overview

Documents how outlet context flows across modules (POS, Golf, Bookings, Billing) for proper financial attribution, permissions scoping, and reporting segregation. Every financial transaction in ClubVantage must be attributed to a specific POSOutlet, which represents a revenue center (e.g., Golf Pro Shop, Main Restaurant, Pool Bar, Banquet Hall). Outlet context determines which products are available, which GL cost center receives the revenue, which staff have access, and how reports are segmented.

The POSOutlet model already exists and is used by the POS Sales module for template configuration and product filtering. This integration spec extends outlet context to the Golf module (pro shop attribution), Billing module (invoice line item attribution), and Reporting module (outlet-level P&L), ensuring consistent financial tracking across all transaction sources.

## Status

- Design: Documented here
- Implementation: Partial -- POSOutlet model exists with `templateId` for POS configuration. POS Sales module uses `useGetPosOutletsQuery` to fetch outlets and `outletId` is present on Ticket records. Golf module does not yet stamp `outletId` on PlayerCart or CartLineItem records. Billing module's InvoiceLineItem does not yet have an `outletId` field. Reporting module does not yet support outlet-level filtering. Staff permission scoping by outlet is not yet implemented.

## Data Flow

```
User logs in
  -> Default outlet resolved:
    -> If User.defaultOutletId is set: use it
    -> Else if club has single outlet: use club default
    -> Else: show outlet selector (POSStationGuard pattern)
      -> Session outletId stored in React context (POSConfigProvider)
        -> All POS transactions stamped with outletId (Ticket.outletId)

Golf Check-In:
  -> Outlet auto-assigned as Golf Pro Shop outlet
    -> CartLineItems inherit outletId from Golf Pro Shop
      -> If MEMBER_ACCOUNT payment: InvoiceLineItem.outletId = Golf Pro Shop
      -> If CARD/CASH: POS Ticket.outletId = Golf Pro Shop

Billing Cycle Run:
  -> InvoiceLineItems collected for member
    -> Grouped by outletId for invoice presentation
      -> GL posting routes to outlet-specific cost center
        -> Revenue attributed per outlet in reporting

Outlet Switch (staff action):
  -> Staff selects different outlet from POS header dropdown
    -> POSConfigProvider updates session outletId
      -> Template reloaded for new outlet (toolbar, action bar, product grid)
        -> Subsequent transactions use new outletId
          -> Previous outlet's held tickets remain accessible but tagged to original outlet

Report Generation:
  -> User selects report scope: single outlet, multiple outlets, or all outlets
    -> Query filters by outletId on transaction records
      -> P&L, revenue, and operational reports segmented accordingly
```

## Trigger Points

1. **Login / session start**: Default outlet resolved from `User.defaultOutletId` or club settings. If multiple outlets exist and no default is set, the outlet selector modal is presented (similar to POSStationGuard blocking pattern). Outlet context is required before any financial transaction can be created.
2. **Outlet switch**: Staff manually selects a different outlet from the POS header dropdown (`useGetPosOutletsQuery` provides the list). This triggers a full config reload: template, product grid, toolbar, action bar, and keyboard shortcuts are all re-resolved for the new outlet. Open cart in the old outlet context is preserved as a held ticket.
3. **Transaction creation**: Every financial record (POS Ticket, CartLineItem, InvoiceLineItem, Payment) must include `outletId`. This is stamped automatically from the session context at creation time, not user-selected per transaction.
4. **Golf check-in settlement**: Outlet is automatically set to the Golf Pro Shop outlet. Staff do not manually select an outlet during golf check-in. The Golf Pro Shop outlet must be pre-configured in club settings.
5. **Report generation**: Reports accept outlet filter parameters. Default view shows aggregate across all outlets. Drill-down allows single-outlet views. Outlet filter applies to all financial queries (revenue, expenses, payments, refunds, voids).
6. **Billing cycle invoice generation**: When generating invoices, InvoiceLineItems retain their source `outletId`. The invoice itself is not outlet-specific (a single invoice may contain items from multiple outlets), but line items are grouped by outlet in the invoice presentation for clarity.

## Dependencies

- **POS module**: POSOutlet (primary outlet model), POSTemplate (per-outlet UI configuration), POSStation (per-outlet station assignments), POSTransaction/Ticket (`outletId` field), OutletProductConfig (per-outlet product visibility and pricing), OutletGridConfig (per-outlet product panel layout)
- **Golf module**: PlayerCart and CartLineItem need `outletId` field (not yet added). Golf Pro Shop must be a configured POSOutlet. Golf settings need a `golfProShopOutletId` reference.
- **Billing module**: InvoiceLineItem needs `outletId` field (not yet added). Invoice presentation should group line items by outlet. GL posting rules need outlet-to-cost-center mapping.
- **Members module**: Member charges from different outlets appear on a single invoice but are attributed separately.
- **Settings module**: Club outlet configuration (CRUD for POSOutlet), default outlet assignment per user, Golf Pro Shop outlet designation, GL account mapping per outlet.
- **Reporting module**: All financial reports need outlet filter support. P&L by outlet, revenue by outlet, transaction volume by outlet.
- **Auth/Permissions module**: Staff role permissions can be scoped by outlet (e.g., a cashier assigned only to the Main Restaurant outlet cannot access Golf Pro Shop POS). Permission resolution: global permissions OR outlet-specific permissions.

## Business Rules

- Every club has at least one outlet. On club creation, a default "Main" outlet is auto-created. This serves as the fallback for any transaction that lacks explicit outlet context.
- Financial transactions MUST have an `outletId`. If a transaction is created without outlet context (defensive case), the club's default outlet is assigned and a warning is logged for admin review.
- Member account charges (InvoiceLineItems) inherit `outletId` from the source module: golf charges use the Golf Pro Shop outlet, dining charges use the restaurant outlet, facility booking charges use the relevant facility outlet.
- Staff permissions can be scoped by outlet. A staff member with role `CASHIER` and outlet scope `[restaurant_outlet_id]` can only access POS for that outlet. A staff member with role `MANAGER` and outlet scope `[*]` (all outlets) can access any outlet. Outlet scope is an array on the staff role assignment, not on the user record directly.
- Reports can filter by single outlet, a set of outlets, or aggregate across all outlets. The default report view shows club-wide aggregation. Export and print follow the selected filter.
- GL account mapping is per-outlet. Each outlet maps to a cost center in the chart of accounts. When an InvoiceLineItem is posted to GL, the cost center is resolved from the `outletId`. If no mapping exists, the club default GL account is used.
- Outlet-specific pricing is supported via OutletProductConfig. The same product can have different prices at different outlets (e.g., a beer costs more at the pool bar than at the main restaurant). The price in effect is determined by the active outlet at the time the item is added to the cart.
- When a staff member switches outlets, any open (unsettled) cart/ticket in the previous outlet is automatically held. The held ticket retains its original `outletId`. The staff member can recall it later by switching back to that outlet or from the Open Tickets view.
- Held tickets are visible to any staff member with access to that outlet, regardless of which station they are on (consistent with POS business rule 9 about held ticket recall).
- Void and refund transactions inherit the `outletId` of the original transaction. A refund for a Golf Pro Shop purchase is attributed to the Golf Pro Shop outlet even if processed at a different physical location.
- End-of-day settlement is per-outlet per-station. Each outlet's cash drawer is reconciled independently. POS reports for shift close only show transactions for the active outlet.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Transaction created with no outlet context | Assign to club default outlet. Log warning with transaction ID and source module for admin review. This should only occur due to a bug; all transaction creation paths should enforce outlet context. |
| Outlet deleted with pending transactions | Soft delete only (`isActive = false`). Historical transactions retain the `outletId` reference. The outlet no longer appears in the outlet selector or reports filter (unless "include inactive" is toggled). Pending/held tickets at the deleted outlet are flagged for manager resolution. |
| Member charge spanning multiple outlets (single invoice) | Single invoice contains InvoiceLineItems from multiple outlets. Each line item retains its `outletId`. Invoice presentation groups items under outlet headers. GL posting creates separate entries per outlet cost center. |
| Staff transfers between outlets mid-shift | Staff must close their shift at the current outlet (cash drawer reconciliation if applicable), then switch to the new outlet. Open tickets at the old outlet are held and available for other staff at that outlet. The new outlet requires station selection if `POSStationGuard` is active. |
| Outlet-specific pricing (e.g., happy hour at bar) | Price rules are linked to OutletProductConfig with optional time window conditions. When a product is added to the cart, the system checks: (1) outlet-specific price override, (2) active time-based promotions for the outlet, (3) base product price. Price is locked at addition time. |
| Golf Pro Shop outlet not configured | Golf check-in settlement falls back to club default outlet. Warning displayed to staff: "Golf Pro Shop outlet not configured. Charges will be attributed to the default outlet." Admin notification created to configure the outlet. |
| User has access to zero outlets | Block POS access entirely. Show message: "No outlets assigned. Contact your administrator." User can still access non-POS modules (Members, Reports as viewer, etc.) if their role permits. |
| Outlet template missing or corrupted | Fall back to hardcoded default F&B template (consistent with POS edge case handling). Log warning. POS is still functional with default layout. |
| Reporting across outlets with different tax rates | Each transaction records the tax rate and amount at the time of creation. Reports aggregate actual tax collected, not re-calculated tax. Outlet-level tax reports show the effective rate per outlet. |
| Two outlets share the same physical location (e.g., pro shop counter also serves as snack bar) | Each outlet is a separate logical entity with its own product catalog, template, and GL mapping. Staff switch between outlets using the dropdown. Products and pricing are independent. Station peripherals (printer, drawer) can be shared across outlets if configured on both. |
| Seasonal outlet (pool bar open May-September) | Outlet has `isActive` flag. When deactivated for the off-season, it disappears from the outlet selector and POS. Historical transactions and reports remain accessible. Reactivation restores the outlet with its existing configuration. |

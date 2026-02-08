# Portal / Spending / Spending Dashboard

## Overview
Visual spending analytics for members, aggregating invoice line items by charge type category with monthly trend analysis.

## Status
- Backend: Implemented (data layer with Prisma aggregation)
- Frontend: Implemented (category breakdown, monthly chart, recent charges)
- Phase: 5 (Premium Features)

## Capabilities
- Category spending breakdown with percentage bars and absolute amounts
- Monthly spending trend (12-month bar chart for current year)
- Recent charges list (last 10 line items)
- Year-to-date total spending
- Category icons mapped to charge type categories

## Dependencies
### Interface Dependencies
- Member Portal navigation (accessible from profile or dashboard)

### Settings Dependencies
- `features.portal.spendingDashboard` must be true

### Data Dependencies
- InvoiceLineItem records with ChargeType relation
- Invoice records for date-based grouping

## Settings Requirements
| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| features.portal.spendingDashboard | boolean | true | Club Admin | Enables spending dashboard |

## Data Model
```typescript
interface SpendingSummary {
  totalSpend: number
  categories: CategorySpend[]
  monthly: MonthlySpend[]
  recentItems: RecentCharge[]
}

interface CategorySpend {
  category: string    // ChargeType.category value
  total: number
  percentage: number
}

interface MonthlySpend {
  month: string       // "Jan", "Feb", etc.
  amount: number
}

interface RecentCharge {
  id: string
  description: string
  amount: number
  date: Date
  category: string
}
```

## Business Rules
- Aggregation scoped to current calendar year (Jan 1 to now)
- Categories come from ChargeType.category field on InvoiceLineItem
- Percentage calculated as category total / grand total * 100
- Monthly breakdown uses Invoice.dueDate for month grouping
- Only SENT, PAID, PARTIALLY_PAID, OVERDUE invoices included (not DRAFT or VOID)

## Edge Cases
| Scenario | Handling |
|----------|----------|
| No invoices for current year | Empty state: "No spending data yet" |
| Category with 0 spend | Omitted from breakdown list |
| Negative line items (credits) | Subtracted from category total |

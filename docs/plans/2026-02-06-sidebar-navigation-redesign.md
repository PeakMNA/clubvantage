# Sidebar Navigation Redesign

**Date**: 2026-02-06
**Status**: Draft
**Scope**: Move all in-page tab navigation to sidebar sub-items, accordion behavior, all sections collapsed on app open

## Problem

Golf, Bookings, Reports, Users, and Billing use in-page horizontal tab bars for sub-navigation. This is inconsistent with POS which already uses sidebar sub-items. Tab bars consume vertical space on every page and aren't discoverable from the sidebar.

## Solution

Move all tabbed sections to expandable sidebar sub-items with actual Next.js routes. Accordion-style — only one section expanded at a time. All sections start collapsed on app open.

## Navigation Structure

```
Sidebar (all collapsed on app open)
├── Dashboard                          /
├── Members                            /members
├── Billing  [expandable]
│   ├── Invoices & Payments            /billing
│   ├── AR Profiles                    /billing/profiles
│   └── AR Statements                  /billing/statements
├── Facility                           /facility
├── Golf  [expandable]
│   ├── Tee Sheet                      /golf/tee-sheet
│   ├── Bookings                       /golf/bookings
│   ├── Courses                        /golf/courses
│   ├── Carts                          /golf/carts
│   ├── Caddies                        /golf/caddies
│   └── Settings                       /golf/settings
├── Bookings  [expandable]
│   ├── Calendar                       /bookings/calendar
│   ├── Facilities                     /bookings/facilities
│   ├── Services                       /bookings/services
│   ├── Staff                          /bookings/staff
│   ├── Equipment                      /bookings/equipment
│   └── Waitlist                       /bookings/waitlist
├── POS  [expandable]  (no change)
│   ├── Sales                          /pos/sales
│   ├── Open Tickets                   /pos/open-tickets
│   ├── Transactions                   /pos/transactions
│   ├── Reports                        /pos/reports
│   ├── Outlets                        /pos/outlets
│   └── Templates                      /pos/templates
├── Reports  [expandable]
│   ├── Dashboard                      /reports/dashboard
│   ├── Financial                      /reports/financial
│   ├── Revenue                        /reports/revenue
│   ├── Receivables                    /reports/receivables
│   ├── WHT                            /reports/wht
│   ├── Collections                    /reports/collections
│   └── Membership                     /reports/membership
└── Footer
    ├── Users  [expandable]
    │   └── (sub-items from current UsersTabsLayout)
    ├── Settings                       /settings
    └── Help                           /help
```

## Behavior Rules

- All expandable sections start collapsed on app open
- Clicking parent item expands/collapses only (no navigation)
- Accordion: expanding one section auto-collapses any other open section
- Active sub-item's parent auto-expands on navigation (URL change, bookmark, back/forward)
- Collapsed sidebar (icon-only mode) shows popover flyout on hover

## File Structure Changes

### Golf (single page -> 6 route pages)

```
# Current
app/(dashboard)/golf/page.tsx              # Single page with all 6 tabs

# New
app/(dashboard)/golf/layout.tsx            # Section header, shared context
app/(dashboard)/golf/page.tsx              # Redirects to /golf/tee-sheet
app/(dashboard)/golf/tee-sheet/page.tsx
app/(dashboard)/golf/bookings/page.tsx
app/(dashboard)/golf/courses/page.tsx
app/(dashboard)/golf/carts/page.tsx
app/(dashboard)/golf/caddies/page.tsx
app/(dashboard)/golf/settings/page.tsx
```

### Bookings

```
# Current
app/(dashboard)/bookings/page.tsx          # Single page with 6 tabs

# New
app/(dashboard)/bookings/layout.tsx
app/(dashboard)/bookings/page.tsx          # Redirects to /bookings/calendar
app/(dashboard)/bookings/calendar/page.tsx
app/(dashboard)/bookings/facilities/page.tsx
app/(dashboard)/bookings/services/page.tsx
app/(dashboard)/bookings/staff/page.tsx
app/(dashboard)/bookings/equipment/page.tsx
app/(dashboard)/bookings/waitlist/page.tsx
```

### Reports

```
# Current
app/(dashboard)/reports/page.tsx           # Single page with 7 tabs

# New
app/(dashboard)/reports/layout.tsx
app/(dashboard)/reports/page.tsx           # Redirects to /reports/dashboard
app/(dashboard)/reports/dashboard/page.tsx
app/(dashboard)/reports/financial/page.tsx
app/(dashboard)/reports/revenue/page.tsx
app/(dashboard)/reports/receivables/page.tsx
app/(dashboard)/reports/wht/page.tsx
app/(dashboard)/reports/collections/page.tsx
app/(dashboard)/reports/membership/page.tsx
```

### Users

```
# Current
app/(dashboard)/users/page.tsx             # Single page with tabs

# New
app/(dashboard)/users/layout.tsx
app/(dashboard)/users/page.tsx             # Redirects to first sub-page
app/(dashboard)/users/[sub-pages]/page.tsx
```

### Billing (routes already exist, remove in-page tabs only)

```
# No new routes — just remove BillingTabsLayout from page.tsx
# Add billing/layout.tsx with section header
```

### POS — No changes needed

## Sidebar Component Changes

### Accordion State

```typescript
// Single expanded section (null = all collapsed)
const [expandedSection, setExpandedSection] = useState<string | null>(null);

function toggleSection(label: string) {
  setExpandedSection(prev => prev === label ? null : label);
}
```

### Auto-Expand on Navigation

```typescript
useEffect(() => {
  const activeParent = navigation.find(item =>
    item.children?.some(child => pathname.startsWith(child.href))
  );
  if (activeParent) {
    setExpandedSection(activeParent.label);
  }
}, [pathname]);
```

### Collapsed Sidebar Flyout

When sidebar is in icon-only mode, hovering on an expandable section shows a popover with sub-items.

## Golf Shared State

The current golf/page.tsx shares state across tabs (selectedCourse, selectedDate, scheduleConfig). With separate routes, use URL search params:

```
/golf/tee-sheet?course=abc&date=2026-02-06
```

Each sub-page reads params independently. Shareable, bookmarkable, survives page refresh.

## Implementation Order

### Phase 1: Sidebar Changes

1. Update sidebar.tsx navigation config with all children
2. Replace multi-expand with accordion state
3. Add auto-expand on pathname match
4. Ensure collapsed sidebar flyout works
5. Default expandedSection to null

### Phase 2: Route Extraction (simplest first)

1. **Billing** — Routes exist, remove BillingTabsLayout, add layout.tsx
2. **Reports** — Extract 7 tabs into sub-route pages
3. **Users** — Extract tabs into sub-route pages
4. **Bookings** — Extract 6 tabs into sub-route pages
5. **Golf** — Extract 6 tabs, handle shared state via URL params

### Files Deleted

```
components/golf/golf-tabs-layout.tsx
components/bookings/bookings-tabs-layout.tsx
components/reports/reports-tabs-layout.tsx
components/users/users-tabs-layout.tsx
components/billing/billing-tabs-layout.tsx
```

### Files Created

- ~25 new page.tsx files (one per sub-route)
- ~5 new layout.tsx files (one per section)

### Files Modified

- sidebar.tsx (navigation config + accordion behavior)
- dashboard layout.tsx (no functional change needed)

## What We're NOT Building

- No nested sub-sub-items (max 2 levels: parent + children)
- No drag-to-reorder sidebar items
- No sidebar state persistence to localStorage (accordion resets on refresh, auto-expands based on URL)
- No custom sidebar per user role (same sidebar for all, permissions hide routes at page level)

# Platform / Navigation / Sidebar Navigation

## Overview

Sidebar Navigation provides the primary navigation structure for the ClubVantage staff application (`apps/application`). The redesign moves all in-page horizontal tab navigation to expandable sidebar sub-items with real Next.js routes, implements accordion behavior (only one section expanded at a time), and starts all sections collapsed on app open. This replaces the inconsistent pattern where some sections (POS) used sidebar sub-items while others (Golf, Bookings, Reports, Users, Billing) used in-page tab bars.

## Status

**Substantially Implemented.** The sidebar component (`apps/application/src/components/layout/sidebar.tsx`) has been fully updated with:

- Complete navigation configuration including all expandable sections with children: Billing (3 items), Golf (6 items), Bookings (6 items), POS (6 items), Reports (7 items), Users (5 items)
- Accordion state management: single `expandedSection` state with `null` default (all collapsed on open)
- `toggleSection()` handler that collapses current and expands clicked (or collapses if same)
- Auto-expand on navigation: `useEffect` watches `currentPath` and auto-expands the parent of the active child route
- Collapsed sidebar mode: icon-only view with title attributes for tooltips
- Footer navigation section with Users, Settings, Help separated by border
- Theme toggle integrated into sidebar footer
- Collapse/expand toggle button
- Active state highlighting with `bg-primary/10 text-primary` for both parent and child items
- Child items rendered with left border line (`border-l border-sidebar-border`) for visual hierarchy

**Route extraction status:**
- POS: Already uses sidebar sub-routes (no change needed)
- Billing: Routes already exist (`/billing`, `/billing/profiles`, `/billing/statements`); tab layout removal pending
- Golf: Currently single page with 6 tabs; needs extraction to 6 route pages
- Bookings: Currently single page with 6 tabs; needs extraction to 6 route pages
- Reports: Currently single page with 7 tabs; needs extraction to 7 route pages
- Users: Currently single page with tabs; needs extraction to sub-route pages

**Not yet implemented:** Route extraction for Golf, Bookings, Reports, Users (the actual page splitting); layout.tsx files for extracted sections; removal of tab layout components; collapsed sidebar popover flyout for expandable sections; URL search params for shared state (Golf course/date selection).

## Capabilities

- Two-level sidebar navigation: top-level items and expandable children
- Accordion behavior: expanding one section auto-collapses any other open section
- All sections start collapsed on app open (expandedSection defaults to null)
- Auto-expand parent section when navigating to a child route (URL change, bookmark, back/forward)
- Collapsed sidebar mode with icon-only display and title tooltips
- Active route highlighting for both parent and child items
- Badge support for notification counts on navigation items
- Footer navigation section (Users, Settings, Help) with separate styling
- Theme toggle (light/dark mode) in sidebar footer
- Responsive collapse toggle button

## Dependencies

### Interface Dependencies

| Component | Path | Purpose |
|-----------|------|---------|
| Sidebar | `apps/application/src/components/layout/sidebar.tsx` | Main sidebar navigation component |
| Logo | `apps/application/src/components/brand/` | Logo and LogoIcon for expanded/collapsed states |
| ThemeToggle | `apps/application/src/components/theme/` | Dark/light mode toggle |
| Button | `@clubvantage/ui` | UI button component |
| cn | `@clubvantage/ui` | Class name merge utility |

### Settings Dependencies

| Setting | Source | Purpose |
|---------|--------|---------|
| currentPath | usePathname() | Current URL path for active state determination |
| collapsed | Parent layout state | Whether sidebar is in collapsed (icon-only) mode |

### Data Dependencies

| Entity | Relationship | Notes |
|--------|-------------|-------|
| Navigation config | Hardcoded in sidebar.tsx | Array of NavItem objects with label, icon, href, children |
| Route pages | `apps/application/src/app/(dashboard)/` | Each child item corresponds to a Next.js page route |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| expandedSection | string or null | `null` | Runtime state | Currently expanded sidebar section; null means all collapsed |
| collapsed | boolean | `false` | User preference | Whether sidebar is in icon-only collapsed mode |
| navigation | NavItem[] | (hardcoded) | Developer | Main navigation items array |
| footerNavigation | NavItem[] | (hardcoded) | Developer | Footer navigation items (Users, Settings, Help) |
| activeHighlightClass | string | `bg-primary/10 text-primary` | Design system | CSS classes for active navigation items |
| childBorderClass | string | `border-l border-sidebar-border` | Design system | CSS classes for child item container left border |
| expandAnimationClass | string | `rotate-180` | Design system | CSS transform for chevron rotation on expand |

## Data Model

### NavItem Interface

```typescript
interface NavItem {
  label: string;        // Display text
  icon: LucideIcon;     // Lucide React icon component
  href: string;         // Route path
  badge?: number;       // Optional notification count
  children?: NavItem[]; // Sub-items for expandable sections
}
```

### Navigation Configuration (as implemented)

```typescript
const navigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Members', icon: Users, href: '/members' },
  {
    label: 'Billing', icon: Receipt, href: '/billing',
    children: [
      { label: 'Invoices & Payments', icon: CreditCard, href: '/billing' },
      { label: 'AR Profiles', icon: UserCog, href: '/billing/profiles' },
      { label: 'AR Statements', icon: FileText, href: '/billing/statements' },
    ],
  },
  {
    label: 'Golf', icon: Flag, href: '/golf',
    children: [
      { label: 'Tee Sheet', icon: Calendar, href: '/golf/tee-sheet' },
      { label: 'Bookings', icon: ListOrdered, href: '/golf/bookings' },
      { label: 'Courses', icon: MapPin, href: '/golf/courses' },
      { label: 'Carts', icon: Car, href: '/golf/carts' },
      { label: 'Caddies', icon: Users, href: '/golf/caddies' },
      { label: 'Settings', icon: Settings, href: '/golf/settings' },
    ],
  },
  {
    label: 'Bookings', icon: CalendarCheck, href: '/bookings',
    children: [
      { label: 'Calendar', icon: Calendar, href: '/bookings/calendar' },
      { label: 'Facilities', icon: Building2, href: '/bookings/facilities' },
      { label: 'Services', icon: Sparkles, href: '/bookings/services' },
      { label: 'Staff', icon: Users, href: '/bookings/staff' },
      { label: 'Equipment', icon: Wrench, href: '/bookings/equipment' },
      { label: 'Waitlist', icon: Clock, href: '/bookings/waitlist' },
    ],
  },
  {
    label: 'POS', icon: ShoppingCart, href: '/pos',
    children: [
      { label: 'Sales', icon: CreditCard, href: '/pos/sales' },
      { label: 'Open Tickets', icon: ClipboardList, href: '/pos/open-tickets' },
      { label: 'Transactions', icon: Receipt, href: '/pos/transactions' },
      { label: 'Reports', icon: FileBarChart, href: '/pos/reports' },
      { label: 'Outlets', icon: Store, href: '/pos/outlets' },
      { label: 'Templates', icon: LayoutTemplate, href: '/pos/templates' },
    ],
  },
  {
    label: 'Reports', icon: BarChart3, href: '/reports',
    children: [
      { label: 'Dashboard', icon: PieChart, href: '/reports/dashboard' },
      { label: 'Financial', icon: DollarSign, href: '/reports/financial' },
      { label: 'Revenue', icon: TrendingUp, href: '/reports/revenue' },
      { label: 'Receivables', icon: FileText, href: '/reports/receivables' },
      { label: 'WHT', icon: FileBarChart, href: '/reports/wht' },
      { label: 'Collections', icon: CreditCard, href: '/reports/collections' },
      { label: 'Membership', icon: Users, href: '/reports/membership' },
    ],
  },
];

const footerNavigation: NavItem[] = [
  {
    label: 'Users', icon: UserCog, href: '/users',
    children: [
      { label: 'Users', icon: Users, href: '/users/list' },
      { label: 'Roles', icon: Shield, href: '/users/roles' },
      { label: 'Permissions', icon: Key, href: '/users/permissions' },
      { label: 'Security', icon: Lock, href: '/users/security' },
      { label: 'Activity', icon: Activity, href: '/users/activity' },
    ],
  },
  { label: 'Settings', icon: Settings, href: '/settings' },
  { label: 'Help', icon: HelpCircle, href: '/help' },
];
```

### Accordion State

```typescript
const [expandedSection, setExpandedSection] = useState<string | null>(null);

function toggleSection(label: string) {
  setExpandedSection(prev => prev === label ? null : label);
}

function isSectionExpanded(label: string) {
  return expandedSection === label;
}
```

### Auto-Expand Logic

```typescript
useEffect(() => {
  const allNavItems = [...navigation, ...footerNavigation];
  const activeParent = allNavItems.find(item =>
    item.children?.some(child => {
      if (child.href === '/') return currentPath === '/';
      return currentPath.startsWith(child.href);
    })
  );
  if (activeParent) {
    setExpandedSection(activeParent.label);
  }
}, [currentPath]);
```

### Route Extraction Plan

| Section | Current State | Target State | Pages to Create |
|---------|--------------|-------------|-----------------|
| Billing | Routes exist | Remove tab layout only | 0 new pages, 1 layout.tsx |
| Reports | Single page with 7 tabs | 7 sub-route pages | 7 pages + 1 layout.tsx |
| Users | Single page with tabs | Sub-route pages | ~5 pages + 1 layout.tsx |
| Bookings | Single page with 6 tabs | 6 sub-route pages | 6 pages + 1 layout.tsx |
| Golf | Single page with 6 tabs | 6 sub-route pages + URL params | 6 pages + 1 layout.tsx |
| POS | Already sub-routes | No change | 0 |

### Tab Layout Components to Delete

```
components/golf/golf-tabs-layout.tsx
components/bookings/bookings-tabs-layout.tsx
components/reports/reports-tabs-layout.tsx
components/users/users-tabs-layout.tsx
components/billing/billing-tabs-layout.tsx
```

## Business Rules

1. On app open, all sidebar sections are collapsed (`expandedSection = null`).
2. Clicking a parent item with children only toggles expand/collapse. It does not navigate.
3. Accordion: only one section can be expanded at a time. Expanding section A auto-collapses section B.
4. When the URL changes (navigation, bookmark, browser back/forward), the parent of the active child route auto-expands.
5. The `isActive` function uses `startsWith` matching for all routes except `/` which requires exact match.
6. Collapsed sidebar (icon-only mode) shows sub-items only via popover flyout on hover (not yet implemented; currently hides children entirely).
7. Non-expandable items (Dashboard, Members, Settings, Help) navigate directly on click.
8. Badge counts are supported on any nav item but currently unused (ready for notification integration).
9. Sidebar state (collapsed/expanded) does not persist to localStorage; it resets to expanded on page refresh.
10. Accordion state does not persist to localStorage; it resets to all-collapsed on page refresh, then auto-expands based on current URL.
11. Maximum navigation depth is 2 levels (parent + children). Nested sub-sub-items are not supported.
12. Same sidebar is shown to all user roles. Permission-based route hiding happens at the page level, not the sidebar level.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User navigates to a child route via URL bar (bypassing sidebar click) | Auto-expand effect fires, expanding the correct parent section |
| User navigates to a route not in any sidebar section (e.g., /members/123) | No parent auto-expands; Members item highlights as active via startsWith matching |
| Multiple child routes share a path prefix (e.g., /billing and /billing/profiles) | Both highlight; the more specific match (/billing/profiles) and the parent (/billing) both show active styles |
| Browser back button to a route in a different section | Auto-expand effect collapses current section and expands the target section |
| Sidebar collapsed and user hovers on expandable item | Currently shows title tooltip only. Flyout popover is planned but not implemented. |
| Navigation config changed but routes not yet created | Sidebar renders links that produce 404; route pages must be created in sync with nav config |
| Golf shared state (course, date) across sub-routes | Use URL search params (e.g., /golf/tee-sheet?course=abc&date=2026-02-06). Each page reads params independently. |
| Rapid section toggling (click expand/collapse quickly) | State updates are synchronous; no debounce needed; React batches renders |
| Very long section list overflows viewport | Sidebar has `overflow-y-auto` on the main nav area; footer nav is fixed at bottom with border-top separator |
| Screen resize from desktop to mobile | Sidebar collapse behavior is controlled by parent layout; mobile typically shows as overlay/drawer (handled by layout, not sidebar component) |
| User role has no access to a sidebar section | Section still renders in sidebar; page-level access control returns 403 or redirects. No sidebar-level permission filtering (by design). |

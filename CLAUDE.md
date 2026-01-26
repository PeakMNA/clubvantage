# ClubVantage Project Reference

## Project Overview
ClubVantage is an AI-First Club Management ERP system for country clubs and golf courses. The Application (PRD-01) is the staff-facing administrative system.

## Documentation Locations

### PRD Documents
- **Main Application PRD**: `/Users/peak/development/vantage/docs/clubvantage-prd-01-application.md`
- **Section Specs**: `/Users/peak/development/vantage/docs/product/sections/`
  - `golf/spec.md` - Golf tee sheet, caddies, carts, courses
  - `members/spec.md` - Member directory, applications, contracts, dependents
  - `billing/spec.md` - Invoices, payments, AR
  - `bookings/spec.md` - Facility bookings
  - `reports/spec.md` - Reporting & analytics
  - `settings/spec.md` - System configuration
  - `users/spec.md` - User management
  - `portal/spec.md` - Member portal

### Design System
- **Location**: `/Users/peak/development/vantage/docs/product/design-system/`
- **Colors**: `colors.json` - Primary: Amber, Secondary: Emerald, Neutral: Stone
- **Typography**: `typography.json` - DM Sans (headings/body), IBM Plex Mono (code)

## Design System Quick Reference

### Color Palette
| Role | Color | Usage |
|------|-------|-------|
| Primary | Amber | CTAs, active states, primary actions |
| Secondary | Emerald | Success states, secondary actions |
| Neutral | Stone | Backgrounds, borders, text |

### Status Badge Colors
| Status | Background | Text |
|--------|------------|------|
| Active | `bg-emerald-500` | `text-white` |
| Pending | `bg-amber-500` | `text-white` |
| Suspended | `bg-red-500` | `text-white` |
| Inactive | `bg-stone-100` | `text-stone-600` |
| Cancelled | `bg-stone-100` | `text-stone-500` |

### Player Type Badges (Golf)
| Type | Background | Text |
|------|------------|------|
| Member (M) | `bg-blue-500` | `text-white` |
| Guest (G) | `bg-amber-500` | `text-white` |
| Dependent (D) | `bg-teal-500` | `text-white` |
| Walk-up (W) | `bg-stone-200` | `text-stone-700` |

### Flight Status Badges (Golf)
| Status | Background | Text |
|--------|------------|------|
| Available | `bg-stone-100` | `text-stone-600` |
| Booked | `bg-blue-500` | `text-white` |
| Checked-in | `bg-emerald-500` | `text-white` |
| On Course | `bg-amber-500` | `text-white` |
| Finished | `bg-stone-100` | `text-stone-600` |
| No-show | `bg-red-500` | `text-white` |
| Cancelled | `bg-stone-100` | `text-stone-500` (strikethrough) |
| Blocked | `bg-gray-200` | `text-gray-600` (with warning icon) |

### Visual Patterns
- **Glassmorphism**: `bg-white/80 backdrop-blur-sm`
- **Card shadows**: `shadow-lg shadow-stone-200/30`
- **Border radius**: `rounded-xl` (cards), `rounded-lg` (inputs), `rounded-full` (badges)
- **Active nav items**: `bg-gradient-to-br from-amber-500 to-amber-600 text-white`

### Contrast Guidelines
- Always use `text-white` on amber/emerald/blue/red backgrounds (not amber-950)
- Use `text-stone-600` for secondary text on light backgrounds
- Use `text-stone-900` for primary text on light backgrounds

## Project Structure

```
clubvantage/
├── apps/
│   └── application/          # Staff Admin (Next.js)
│       └── src/
│           ├── app/          # App router pages
│           │   └── (dashboard)/
│           │       ├── page.tsx           # Dashboard
│           │       ├── members/           # Members module
│           │       ├── billing/           # Billing module
│           │       ├── facility/          # Facility bookings
│           │       └── golf/              # Golf module
│           └── components/   # React components
│               ├── dashboard/
│               ├── members/
│               ├── billing/
│               ├── facility/
│               └── golf/
├── packages/
│   └── ui/                   # Shared UI library
│       └── src/
│           ├── primitives/   # Base components (button, input, etc.)
│           ├── layouts/      # Layout components (sidebar, etc.)
│           └── globals.css   # Design system CSS variables
└── package.json
```

## Implementation Status vs PRD

### Fully Implemented
- Dashboard (KPI cards, activity, insights, quick actions)
- Members (directory, detail view, tabs, applications workflow)
- Golf (tee sheet with all views, modals, courses/carts/caddies tabs)

### Partially Implemented
- Billing (invoices table - missing creation/payment modals)
- Facility (calendar view - needs modal verification)

### Not Yet Implemented
- Reports module (PRD Section 3.5.3)
- Lead pipeline kanban view (PRD Section 4.7)
- Notification center (PRD NOTIF-001 to NOTIF-004)
- Settings module
- Global header search

## Development Guidelines

### Before Making Changes
1. Check the relevant spec in `/docs/product/sections/`
2. Follow existing component patterns in the codebase
3. Use design system colors from this reference

### CSS/Styling
- Import `@clubvantage/ui/globals.css` for design tokens
- Both UI package and app need `@tailwind base/components/utilities`
- Use stone/amber/emerald palette consistently

### Component Patterns
- Use `cn()` utility for className merging
- Follow existing modal patterns (header, body, footer sections)
- Status badges should use the color mappings above

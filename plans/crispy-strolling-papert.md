# Plan: Users & Settings Modules - PRD → UX → Implementation

## Overview

Implement the Users and Settings modules following the same pipeline used for Reports:
1. **Phase 1**: Run `prd-to-ux` skill on each spec to generate UX specifications
2. **Phase 2**: Run `ux-spec-to-prompt` skill on UX specs to generate build prompts
3. **Phase 3**: Execute build prompts to implement components

## Source Files

| Module | PRD Location |
|--------|--------------|
| Users | `/Users/peak/development/vantage/docs/product/sections/users/spec.md` |
| Settings | `/Users/peak/development/vantage/docs/product/sections/settings/spec.md` |

## Module Summaries

### Users Module (5 tabs)
- **Users Tab**: User directory with search, filters, CRUD operations
- **Roles Tab**: Role management with permission assignment
- **Permissions Tab**: Permission catalog reference (read-only)
- **Security Tab**: Password policies, 2FA, session management
- **Activity Tab**: Audit logs with filtering and export

### Settings Module (12+ sections with sticky nav)
- Club Profile, Organization (Outlets/Revenue/Cost/Profit Centers)
- Billing Defaults, Localization, Notifications, Branding
- Reminders, Integrations, Lookups, GL Mapping, WHT Config, Audit Trail

## Output Structure

```
/apps/application/src/
├── app/(dashboard)/
│   ├── users/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
├── components/
│   ├── users/
│   │   ├── index.ts
│   │   ├── users-tabs-layout.tsx
│   │   ├── users-tab.tsx
│   │   ├── roles-tab.tsx
│   │   ├── permissions-tab.tsx
│   │   ├── security-tab.tsx
│   │   └── activity-tab.tsx
│   └── settings/
│       ├── index.ts
│       ├── settings-nav.tsx
│       ├── club-profile-section.tsx
│       ├── organization-section.tsx
│       ├── billing-defaults-section.tsx
│       ├── localization-section.tsx
│       ├── notifications-section.tsx
│       ├── branding-section.tsx
│       ├── integrations-section.tsx
│       ├── lookups-section.tsx
│       ├── gl-mapping-section.tsx
│       └── audit-trail-section.tsx

/docs/product/sections/
├── users/
│   ├── spec.md (existing)
│   ├── spec-ux-spec.md (generated)
│   └── spec-build-prompts.md (generated)
└── settings/
    ├── spec.md (existing)
    ├── spec-ux-spec.md (generated)
    └── spec-build-prompts.md (generated)
```

## Execution Plan

### Phase 1: Generate UX Specs (Sequential)

```
1.1 Run prd-to-ux on users/spec.md
    → Output: users/spec-ux-spec.md

1.2 Run prd-to-ux on settings/spec.md
    → Output: settings/spec-ux-spec.md
```

### Phase 2: Generate Build Prompts (Sequential)

```
2.1 Run ux-spec-to-prompt on users/spec-ux-spec.md
    → Output: users/spec-build-prompts.md

2.2 Run ux-spec-to-prompt on settings/spec-ux-spec.md
    → Output: settings/spec-build-prompts.md
```

### Phase 3: Implement Components

#### Users Module (estimated ~10 prompts)
```
Sequential:
├── Foundation: users-tabs-layout.tsx, shared components
└── Tabs (can parallelize after foundation):
    ├── users-tab.tsx (user table, modals)
    ├── roles-tab.tsx (role cards, permission picker)
    ├── permissions-tab.tsx (permission catalog)
    ├── security-tab.tsx (policy config cards)
    └── activity-tab.tsx (activity log table)

Final: /users/page.tsx with tab routing
```

#### Settings Module (estimated ~15 prompts)
```
Sequential:
├── Foundation: settings-nav.tsx (sticky section nav)
└── Sections (can parallelize after foundation):
    ├── club-profile-section.tsx
    ├── organization-section.tsx (with 4 sub-tabs)
    ├── billing-defaults-section.tsx
    ├── localization-section.tsx
    ├── notifications-section.tsx
    ├── branding-section.tsx
    ├── integrations-section.tsx
    ├── lookups-section.tsx
    ├── gl-mapping-section.tsx
    └── audit-trail-section.tsx

Final: /settings/page.tsx with section routing
```

### Phase 4: Wire Up Navigation

- Add Users link to sidebar (if not present)
- Add Settings link to sidebar (if not present)
- Update any dashboard quick actions linking to these modules

## Technical Notes

- Follow patterns established in reports/billing modules
- Use `'use client'` directive for interactive components
- Use `@clubvantage/ui` for shared components
- Use `lucide-react` for icons
- Use `date-fns` for date formatting
- Mock data with realistic defaults (following billing pattern)

## Verification

1. Run `pnpm tsc --noEmit` after each phase
2. Navigate to `/users` - verify all 5 tabs render
3. Navigate to `/settings` - verify all sections render
4. Test sticky nav scroll behavior in settings
5. Verify sidebar navigation links work

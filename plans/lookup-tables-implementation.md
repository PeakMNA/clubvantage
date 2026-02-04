# Lookup Tables Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a flexible lookup tables system allowing per-club customization of enum values with i18n support.

**Architecture:** Database-driven lookup values with club-level overrides, GraphQL API for CRUD operations, and a polished admin UI following the frontend-design skill aesthetics.

**Tech Stack:** Prisma, NestJS/GraphQL (code-first), Next.js App Router, TanStack Query, Tailwind CSS

---

## Database Schema

**File:** `database/prisma/schema.prisma`

```prisma
model LookupCategory {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code        String   @db.VarChar(50)   // e.g., "PLAYER_TYPE", "PAYMENT_METHOD"
  name        String   @db.VarChar(100)
  description String?
  isSystem    Boolean  @default(false)   // System-managed, values not deletable
  isGlobal    Boolean  @default(true)    // Available to all clubs
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  values      LookupValue[]

  @@unique([code])
  @@index([isGlobal])
  @@map("lookup_categories")
}

model LookupValue {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  categoryId   String   @db.Uuid
  clubId       String?  @db.Uuid          // null = global default
  code         String   @db.VarChar(50)   // Internal code (MEMBER, GUEST)
  name         String   @db.VarChar(100)  // Display name
  description  String?
  icon         String?  @db.VarChar(50)   // Lucide icon name
  color        String?  @db.VarChar(7)    // Hex color
  sortOrder    Int      @default(0)
  isActive     Boolean  @default(true)
  isDefault    Boolean  @default(false)
  metadata     Json     @default("{}")    // Custom attributes

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  category     LookupCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  club         Club?          @relation(fields: [clubId], references: [id], onDelete: Cascade)
  translations LookupTranslation[]

  @@unique([categoryId, clubId, code])
  @@index([categoryId, isActive])
  @@index([clubId])
  @@map("lookup_values")
}

model LookupTranslation {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  lookupValueId String   @db.Uuid
  locale        String   @db.VarChar(10)  // e.g., "th", "zh-CN", "ja"
  name          String   @db.VarChar(100)
  description   String?

  lookupValue   LookupValue @relation(fields: [lookupValueId], references: [id], onDelete: Cascade)

  @@unique([lookupValueId, locale])
  @@map("lookup_translations")
}
```

---

## Implementation Tasks

### Task 1: Database Schema & Migration

**Files:**
- Modify: `database/prisma/schema.prisma`
- Run: `npx prisma migrate dev --name add_lookup_tables`

**Requirements:**
1. Add LookupCategory, LookupValue, LookupTranslation models as specified above
2. Add relation to Club model: `lookupValues LookupValue[]`
3. Run migration successfully
4. Verify tables created with correct constraints

---

### Task 2: Seed Default Lookup Data

**Files:**
- Create: `database/prisma/seed-lookups.ts`
- Modify: `database/prisma/seed.ts` (add import)

**Requirements:**
1. Create seed file with categories: PLAYER_TYPE, PAYMENT_METHOD, BLOCK_TYPE, SKILL_LEVEL, EQUIPMENT_CONDITION
2. Seed default values for each category (from existing enums)
3. Mark system categories as isSystem: true
4. Include icon and color for each value
5. Run seed and verify data

**Seed Data Example:**
```typescript
const PLAYER_TYPE_VALUES = [
  { code: 'MEMBER', name: 'Member', icon: 'User', color: '#3B82F6' },
  { code: 'GUEST', name: 'Guest', icon: 'UserPlus', color: '#F59E0B' },
  { code: 'DEPENDENT', name: 'Dependent', icon: 'Users', color: '#14B8A6' },
  { code: 'WALK_UP', name: 'Walk-up', icon: 'UserX', color: '#A8A29E' },
];
```

---

### Task 3: NestJS Lookups Module - DTOs

**Files:**
- Create: `apps/api/src/modules/lookups/dto/create-lookup-category.dto.ts`
- Create: `apps/api/src/modules/lookups/dto/create-lookup-value.dto.ts`
- Create: `apps/api/src/modules/lookups/dto/lookup-filter.dto.ts`

**Requirements:**
1. CreateLookupCategoryDto with class-validator decorators
2. UpdateLookupCategoryDto (partial)
3. CreateLookupValueDto with all fields
4. UpdateLookupValueDto (partial)
5. CreateLookupTranslationDto
6. LookupFilterDto for query filtering

---

### Task 4: NestJS Lookups Module - Service

**Files:**
- Create: `apps/api/src/modules/lookups/lookups.service.ts`
- Create: `apps/api/src/modules/lookups/lookups.module.ts`

**Requirements:**
1. LookupsService with PrismaService injection
2. Methods:
   - `findAllCategories()` - list all categories
   - `findCategoryByCode(code: string)` - get category with values
   - `findValuesByCategory(categoryCode: string, clubId?: string)` - get values with club overrides
   - `createValue(clubId: string, dto)` - create club-specific value
   - `updateValue(id: string, dto)` - update value
   - `deleteValue(id: string)` - soft delete (set isActive: false) or hard delete if not system
   - `addTranslation(valueId: string, dto)` - add translation
3. Club override logic: return club-specific values merged with global defaults
4. LookupsModule that exports LookupsService

---

### Task 5: GraphQL Types & Inputs

**Files:**
- Create: `apps/api/src/graphql/lookups/lookups.types.ts`
- Create: `apps/api/src/graphql/lookups/lookups.input.ts`

**Requirements:**
1. LookupCategoryType with @ObjectType decorator
2. LookupValueType with @ObjectType decorator
3. LookupTranslationType with @ObjectType decorator
4. Input types for create/update operations
5. LookupFilterInput for queries

---

### Task 6: GraphQL Resolver

**Files:**
- Create: `apps/api/src/graphql/lookups/lookups.resolver.ts`
- Create: `apps/api/src/graphql/lookups/lookups.module.ts`
- Modify: `apps/api/src/graphql/graphql.module.ts` (register module)

**Requirements:**
1. Queries:
   - `lookupCategories` - list all categories
   - `lookupCategory(code: String!)` - get single category
   - `lookupValues(categoryCode: String!, includeInactive: Boolean)` - get values for category
2. Mutations:
   - `createLookupValue(input: CreateLookupValueInput!)` - create value
   - `updateLookupValue(input: UpdateLookupValueInput!)` - update value
   - `deleteLookupValue(id: ID!)` - delete value
   - `addLookupTranslation(input: AddLookupTranslationInput!)` - add translation
3. Use @GqlCurrentUser for tenantId
4. Register LookupsGraphQLModule in graphql.module.ts

---

### Task 7: Generate GraphQL Schema & API Client

**Files:**
- Regenerate: `apps/api/schema.gql`
- Regenerate: `packages/api-client/src/generated/`

**Requirements:**
1. Start API server to generate schema.gql
2. Run codegen: `pnpm --filter @clubvantage/api-client run codegen`
3. Verify generated hooks: useGetLookupCategoriesQuery, useGetLookupValuesQuery, etc.

---

### Task 8: Frontend Hooks

**Files:**
- Create: `apps/application/src/hooks/use-lookups.ts`

**Requirements:**
1. `useLookupCategories()` - fetch all categories
2. `useLookupValues(categoryCode: string)` - fetch values for category
3. `useLookupMutations()` - create/update/delete mutations
4. Helper: `getLookupLabel(categoryCode, valueCode)` - get display label
5. TypeScript types for frontend use

---

### Task 9: Lookup Values Admin UI Component

**Files:**
- Create: `apps/application/src/components/settings/lookups/lookup-values-manager.tsx`

**Requirements:**
1. Display lookup values in a polished card grid
2. Each card shows: icon, name, code, color indicator, active status
3. Add/Edit modal with form fields
4. Delete confirmation dialog
5. Drag-and-drop reordering (sortOrder)
6. Color picker for value color
7. Icon selector (Lucide icons dropdown)
8. Follow frontend-design skill aesthetics:
   - Distinctive typography (not Inter)
   - Cohesive color theme
   - Micro-interactions and hover states
   - Card shadows and glassmorphism effects

---

### Task 10: Lookup Categories Admin Page

**Files:**
- Create: `apps/application/src/components/settings/lookups/lookup-categories-list.tsx`
- Create: `apps/application/src/app/(dashboard)/settings/lookups/page.tsx`

**Requirements:**
1. List all lookup categories with expandable sections
2. Click category to manage its values (inline or navigate)
3. Show value count per category
4. System categories marked with badge (not deletable)
5. Search/filter functionality
6. Responsive layout
7. Integrate into Settings navigation

---

### Task 11: Translation Management UI

**Files:**
- Create: `apps/application/src/components/settings/lookups/translation-editor.tsx`

**Requirements:**
1. Modal or inline editor for translations
2. Show all supported locales (TH, ZH, JA, etc.)
3. Edit translation for each locale
4. Auto-save on blur
5. Visual indicator for missing translations
6. Preview in different locales

---

### Task 12: Integration & Testing

**Files:**
- Test: Manual E2E testing

**Requirements:**
1. Create a new lookup value via UI
2. Edit value name, color, icon
3. Add Thai translation
4. Verify value appears in dropdown (replace enum usage)
5. Test club-specific override (if different club has different value)
6. Verify API queries return correct merged data

---

## Critical Files Reference

| Purpose | Path |
|---------|------|
| Prisma Schema | `database/prisma/schema.prisma` |
| Service Pattern | `apps/api/src/modules/members/members.service.ts` |
| Resolver Pattern | `apps/api/src/graphql/members/members.resolver.ts` |
| GraphQL Module | `apps/api/src/graphql/graphql.module.ts` |
| Hook Pattern | `apps/application/src/hooks/use-members.ts` |
| Settings Page | `apps/application/src/app/(dashboard)/settings/page.tsx` |
| UI Components | `packages/ui/src/primitives/` |

---

## Design Guidelines (frontend-design skill)

**Typography:** Use distinctive fonts, not Inter/Roboto
**Colors:** Follow ClubVantage design system (Amber primary, Stone neutral)
**Cards:** `bg-white/80 backdrop-blur-sm shadow-lg rounded-xl`
**Icons:** Lucide icons with consistent sizing
**Motion:** Subtle hover states, staggered animations on load
**Status badges:** Use design system badge colors

---

## Verification Checklist

- [ ] Database tables created successfully
- [ ] Seed data populates all categories
- [ ] GraphQL queries return correct data
- [ ] API client hooks generated
- [ ] UI displays lookup categories
- [ ] Can create/edit/delete values
- [ ] Translations save correctly
- [ ] Club-specific overrides work
- [ ] Build passes with no TypeScript errors

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

### Rental Status Badges (Golf Cart/Caddy)
| Status | Background | Text | Usage |
|--------|------------|------|-------|
| None | `bg-stone-100` | `text-stone-600` | No rental requested |
| Requested | `bg-amber-100` | `text-amber-700` | Member requested rental |
| Paid | `bg-emerald-100` | `text-emerald-700` | Payment received |
| Assigned | `bg-blue-100` | `text-blue-700` | Cart/caddy assigned to player |
| Returned | `bg-purple-100` | `text-purple-700` | Rental completed/returned |

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

## Database & Prisma Guidelines

### Schema Changes
When modifying the Prisma schema (`/database/prisma/schema.prisma`):

1. **NEVER use `--force-reset` or `--accept-data-loss`** - These flags delete all data
2. **Use migrations for schema changes:**
   ```bash
   cd database
   npx prisma migrate dev --name descriptive_migration_name
   ```
3. **For additive changes only** (new tables, new optional columns), you can use:
   ```bash
   npx prisma db push
   ```
   This is safe for adding new models/fields that don't affect existing data.

### If Database Gets Reset
If data is accidentally lost, re-seed the database:
```bash
cd database
npx prisma db seed
```

**Demo Credentials:**
- Staff App: `admin@royalbangkokclub.com` / `Admin123!`
- Member Portal: `member@demo.com` / `Member123!`

### Generating Prisma Client
After schema changes, regenerate the client:
```bash
npx prisma generate
```

### GraphQL Schema Regeneration
After adding new GraphQL types/resolvers, start the API briefly to regenerate `schema.gql`:
```bash
cd apps/api
pnpm run dev  # Let it start, then stop with Ctrl+C
```
Then run codegen for the API client:
```bash
pnpm --filter @clubvantage/api-client run codegen
```

## TypeScript Checking

### Running tsc with Full Project Context
**IMPORTANT:** Never run `tsc file.ts` on individual files - it ignores tsconfig settings.

```bash
# Correct: Use --project flag or run from project root
cd apps/api && pnpm exec tsc --noEmit --project tsconfig.json

# Or simply run from the app directory (picks up tsconfig automatically)
pnpm exec tsc --noEmit

# Or use the build script
pnpm --filter @clubvantage/api run build
```

Without `--project`, TypeScript won't resolve:
- Path aliases (`@/modules/...`)
- Decorator settings (`experimentalDecorators`, `emitDecoratorMetadata`)
- Monorepo package references

## NestJS API Guidelines

### GraphQL Input Validation
The API uses `ValidationPipe` with `forbidNonWhitelisted: true`. **All GraphQL input class properties MUST have class-validator decorators:**

```typescript
import { IsOptional, IsEnum, IsUUID, IsString } from 'class-validator';

@InputType()
export class MyFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()          // Required for optional fields
  @IsUUID()              // Validates the type
  categoryId?: string;

  @Field(() => MyEnum, { nullable: true })
  @IsOptional()
  @IsEnum(MyEnum)        // Required for enum fields
  status?: MyEnum;
}
```

Without these decorators, the ValidationPipe will reject the input with "Bad Request Exception".

### Common Decorators
| Type | Decorators |
|------|------------|
| Optional field | `@IsOptional()` |
| UUID/ID | `@IsUUID()` |
| String | `@IsString()` |
| Number | `@IsNumber()` |
| Boolean | `@IsBoolean()` |
| Enum | `@IsEnum(EnumType)` |
| Date | `@Type(() => Date)` + `@IsDate()` |

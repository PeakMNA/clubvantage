# Configurable Packages & Feature Flags

## Overview

Replace the hardcoded 3-tier feature flag system with a fully dynamic, database-driven package configuration system. Supports multiple verticals (Golf, Spa, Sports, Private, etc.), each with tiered packages (Starter, Pro, Enterprise) plus a Custom package type for one-off configurations.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Package model | Vertical-based tiers + Custom | Marketing-friendly per-vertical tiers, flexibility via Custom |
| Pricing | Base price + per-module add-on pricing | Enables upselling individual modules on top of base |
| Feature registry | Dynamic in database | Add/register new flags without code deploy |
| Verticals | Dynamic/configurable | Platform admins create new verticals from UI |
| Resource limits | Package defaults with per-club overrides | Sensible defaults, negotiation flexibility |
| Operational flags | Per-club overrides | Same as before, independent of package |

## Data Model

### FeatureDefinition — Master registry of all available features/modules

```prisma
model FeatureDefinition {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  key         String   @unique          // e.g. "golf", "aiDynamicPricing", "maintenanceMode"
  name        String                     // e.g. "Golf Management"
  description String?
  category    FeatureCategory            // MODULE, FEATURE, OPERATIONAL
  addonPrice  Decimal? @db.Decimal(10,2) // optional per-module monthly add-on price
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  packageFeatures PackageFeature[]
  clubAddons      ClubAddon[]
  clubOperationalFlags ClubOperationalFlag[]
}

enum FeatureCategory {
  MODULE
  FEATURE
  OPERATIONAL
}
```

### Vertical — Club verticals (Golf, Spa, Sports, Private...)

```prisma
model Vertical {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String                  // e.g. "Golf Club"
  slug        String   @unique        // e.g. "golf-club"
  description String?
  iconUrl     String?
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  packages Package[]
}
```

### Package — Subscription packages

```prisma
model Package {
  id                 String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  verticalId         String?     @db.Uuid       // null for Custom packages
  vertical           Vertical?   @relation(fields: [verticalId], references: [id])
  name               String                      // e.g. "Golf Club Pro"
  slug               String      @unique         // e.g. "golf-club-pro"
  tier               PackageTier                  // STARTER, PRO, ENTERPRISE, CUSTOM
  basePrice          Decimal     @db.Decimal(10,2)  // monthly base price
  annualPrice        Decimal?    @db.Decimal(10,2)  // annual price (if different from 12x monthly)
  defaultMemberLimit Int?                         // null = unlimited
  defaultUserLimit   Int?                         // null = unlimited
  isActive           Boolean     @default(true)
  sortOrder          Int         @default(0)
  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt

  features    PackageFeature[]
  clubPackages ClubPackage[]
}

enum PackageTier {
  STARTER
  PRO
  ENTERPRISE
  CUSTOM
}
```

### PackageFeature — Which features a package includes

```prisma
model PackageFeature {
  id                  String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  packageId           String            @db.Uuid
  package             Package           @relation(fields: [packageId], references: [id], onDelete: Cascade)
  featureDefinitionId String            @db.Uuid
  featureDefinition   FeatureDefinition @relation(fields: [featureDefinitionId], references: [id], onDelete: Cascade)
  enabled             Boolean           @default(true)
  createdAt           DateTime          @default(now())

  @@unique([packageId, featureDefinitionId])
}
```

### ClubPackage — A club's assigned package + overrides

```prisma
model ClubPackage {
  id                   String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId               String   @db.Uuid
  club                 Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)
  packageId            String   @db.Uuid
  package              Package  @relation(fields: [packageId], references: [id])
  memberLimitOverride  Int?               // null = use package default
  userLimitOverride    Int?               // null = use package default
  customPriceOverride  Decimal? @db.Decimal(10,2)  // null = use package price
  startDate            DateTime @default(now())
  endDate              DateTime?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@unique([clubId])  // one active package per club
}
```

### ClubAddon — Per-club add-on modules

```prisma
model ClubAddon {
  id                  String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId              String            @db.Uuid
  club                Club              @relation(fields: [clubId], references: [id], onDelete: Cascade)
  featureDefinitionId String            @db.Uuid
  featureDefinition   FeatureDefinition @relation(fields: [featureDefinitionId], references: [id])
  priceOverride       Decimal?          @db.Decimal(10,2)  // null = use FeatureDefinition.addonPrice
  startDate           DateTime          @default(now())
  endDate             DateTime?
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  @@unique([clubId, featureDefinitionId])
}
```

### ClubOperationalFlag — Per-club operational toggle overrides

```prisma
model ClubOperationalFlag {
  id                  String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId              String            @db.Uuid
  club                Club              @relation(fields: [clubId], references: [id], onDelete: Cascade)
  featureDefinitionId String            @db.Uuid
  featureDefinition   FeatureDefinition @relation(fields: [featureDefinitionId], references: [id])
  enabled             Boolean
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  @@unique([clubId, featureDefinitionId])
}
```

## Flag Resolution Logic

How flags get resolved for a club:

```
1. Load club's assigned Package (via ClubPackage)
2. Load PackageFeatures for that package → base enabled flags
3. Load ClubAddons for the club → merge (any add-on = enabled)
4. Load ClubOperationalFlags → merge operational overrides
5. Cache result in Redis (5 min TTL)
```

**Resolution rules:**
- A feature is **enabled** if: PackageFeature.enabled=true for the club's package, OR a ClubAddon exists for that feature
- A feature is **disabled** if: Not in package AND no add-on
- Operational flags: PackageFeature defaults merged with ClubOperationalFlag (club override wins)
- Limits: `ClubPackage.memberLimitOverride ?? Package.defaultMemberLimit`

**Output shape stays the same** for backward compatibility:
```typescript
{
  modules: { golf: true, billing: true, ... },
  features: { aiDynamicPricing: false, ... },
  operational: { maintenanceMode: false, ... }
}
```

## Service Layer

### Key query methods

| Method | Description |
|--------|-------------|
| `getResolvedFlags(clubId)` | Full resolved flags for a club (cached) |
| `isFeatureEnabled(clubId, featureKey)` | Single flag check |
| `getPackagesForVertical(verticalId)` | List packages in a vertical |
| `getAllVerticals()` | List all verticals |
| `getFeatureRegistry()` | All registered feature definitions |

### Platform admin CRUD methods

| Method | Description |
|--------|-------------|
| `createVertical(input)` | Create new vertical |
| `updateVertical(id, input)` | Update vertical |
| `createPackage(input)` | Create new package with features |
| `updatePackage(id, input)` | Update package details |
| `updatePackageFeatures(packageId, features[])` | Bulk toggle features on a package |
| `assignClubPackage(clubId, packageId)` | Assign package to club |
| `addClubAddon(clubId, featureId)` | Add add-on module to club |
| `removeClubAddon(clubId, featureId)` | Remove add-on from club |
| `overrideClubLimits(clubId, limits)` | Set per-club limit overrides |
| `updateClubOperationalFlag(clubId, featureId, enabled)` | Toggle operational flag |

## Platform Manager UI

### `/features/registry` — Feature Registry
- Table of all feature definitions (modules, features, operational)
- Columns: Name, Key, Category, Add-on Price, Status
- "Add Feature" button to register new flags
- Edit/deactivate existing features
- This is the master list everything else references

### `/features/verticals` — Verticals & Packages
- Left sidebar: list of verticals (Golf, Spa, Sports, Private...)
- "Add Vertical" button
- Selecting a vertical shows its packages in a card grid
- Each card shows: Package name, tier badge, base price, feature count
- Click card to open package detail/editor
- Package editor: toggle features from registry, set prices, set default limits

### `/features` — Overview (updated)
- KPI cards: Total clubs, clubs per vertical, clubs on custom, clubs with add-ons
- Clubs table: Club name, vertical, package, tier, add-on count, operational status
- Click club row to go to tenant detail

### `/tenants/[id]?tab=configuration` — Per-Club Config (updated)
- **Assigned Package** card: current package with "Change Package" button
- **Add-ons** section: list of active add-ons, "Add Module" button, remove action
- **Limits** section: effective limits (package default vs override), edit override
- **Operational Flags** section: toggle switches (reads from ClubOperationalFlag)
- **Resolved Features** section: read-only grid showing final resolved state

### UI Implementation Note
Use `frontend-design` skill during all frontend implementation for polished, production-grade components.

## Migration Strategy

### Step 1: Database Migration
- Create new tables: FeatureDefinition, Vertical, Package, PackageFeature, ClubPackage, ClubAddon, ClubOperationalFlag
- Keep existing Club.subscriptionTier, Club.features, Club.maxMembers, Club.maxUsers columns (don't delete)

### Step 2: Seed Migration Data
- Create a "Legacy" vertical with 3 packages: Starter, Professional, Enterprise (matching current TIER_DEFAULTS)
- Insert all 18 current feature definitions into FeatureDefinition
- Insert PackageFeature rows matching current tier-to-flag mappings
- For each existing club: create ClubPackage row mapping subscriptionTier to Legacy package
- Migrate Club.features.operational overrides into ClubOperationalFlag rows

### Step 3: Service Layer Switchover
- Update FeatureFlagsService to read from new tables instead of TIER_DEFAULTS constant
- getResolvedFlags() queries Package + Addons + Operational overrides
- Same Redis caching, same output interface — downstream code unchanged
- @FeatureGate decorator and isFeatureEnabled() keep working as-is

### Step 4: Cleanup (later, separate PR)
- Remove TIER_DEFAULTS constant from service
- Remove SubscriptionTier enum from Prisma (replace with Package reference)
- Remove Club.features JSON column
- Drop Club.subscriptionTier after all references updated

## Implementation Phases

### Phase 1: Database & Service Layer
1. Add Prisma models and run migration
2. Create seed script for migration data
3. Update FeatureFlagsService to use new tables
4. Update GraphQL types and resolvers
5. Run codegen
6. Verify existing feature flag checks still work

### Phase 2: Feature Registry UI
7. Build /features/registry page (CRUD for FeatureDefinition)
8. GraphQL operations for feature registry

### Phase 3: Verticals & Packages UI
9. Build /features/verticals page with package management
10. Package editor with feature toggles, pricing, limits
11. GraphQL operations for verticals and packages

### Phase 4: Per-Club Configuration UI
12. Update /tenants/[id] Configuration tab
13. Package assignment, add-ons, limit overrides, operational flags
14. Resolved features view

### Phase 5: Overview & Polish
15. Update /features overview page with new data model
16. KPIs by vertical, package, add-ons

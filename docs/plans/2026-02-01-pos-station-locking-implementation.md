# POS Station Locking - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement persistent device-to-station binding for POS outlets.

**Architecture:** URL-based station identification with localStorage fallback, POSStation model, and station context in POSConfigProvider.

**Tech Stack:** Prisma, NestJS/GraphQL, React, Next.js App Router

**Reference:** See `docs/plans/2026-02-01-pos-station-locking-design.md` for full design details.

---

## Task 1: Add POSStation Database Model

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Add POSStation model to schema**

Add after the `POSOutletRoleConfig` model (~line 2400):

```prisma
model POSStation {
  id          String   @id @default(uuid())
  clubId      String
  outletId    String

  name        String
  code        String
  description String?
  peripherals Json?

  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  club        Club      @relation(fields: [clubId], references: [id])
  outlet      POSOutlet @relation(fields: [outletId], references: [id], onDelete: Cascade)

  @@unique([outletId, code])
  @@index([clubId])
  @@index([outletId, isActive])
}
```

**Step 2: Add relation to POSOutlet**

Find `POSOutlet` model and add:

```prisma
stations    POSStation[]
```

**Step 3: Add relation to Club**

Find `Club` model and add:

```prisma
posStations POSStation[]
```

**Step 4: Run migration**

```bash
cd database
npx prisma migrate dev --name add_pos_station_model
```

**Step 5: Verify migration**

```bash
npx prisma generate
```

Expected: No errors, POSStation table created.

**Step 6: Commit**

```bash
git add database/prisma/
git commit -m "feat(db): add POSStation model for device-to-station binding"
```

---

## Task 2: Add Station Tracking to Transactions

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Find POSTransaction model (or Transaction model used for POS)**

If no dedicated POS transaction model exists, this task can be deferred until transactions are implemented. Skip to Task 3.

If it exists, add these fields:

```prisma
stationId   String?
stationName String?

station     POSStation? @relation(fields: [stationId], references: [id], onDelete: SetNull)
```

**Step 2: Add relation to POSStation**

Add to POSStation model:

```prisma
transactions POSTransaction[]
```

**Step 3: Run migration**

```bash
cd database
npx prisma migrate dev --name add_station_to_transactions
```

**Step 4: Commit**

```bash
git add database/prisma/
git commit -m "feat(db): add station tracking to POS transactions"
```

---

## Task 3: Create POSStation TypeScript Types

**Files:**
- Create: `apps/application/src/components/pos/types/station.ts`
- Modify: `apps/application/src/components/pos/types/index.ts`

**Step 1: Create station types file**

```typescript
// apps/application/src/components/pos/types/station.ts

export interface POSStation {
  id: string
  clubId: string
  outletId: string
  name: string
  code: string
  description?: string | null
  peripherals?: StationPeripherals | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StationPeripherals {
  receiptPrinter?: PeripheralConfig
  cashDrawer?: PeripheralConfig
  cardTerminal?: CardTerminalConfig
}

export interface PeripheralConfig {
  type: 'network' | 'cloud' | 'usb' | 'bluetooth' | 'printer-driven'
  address: string
  name: string
  model?: string
}

export interface CardTerminalConfig {
  type: 'stripe' | 'square' | 'verifone' | 'other'
  address: string
  name: string
  model?: string
}

export interface CreatePOSStationInput {
  outletId: string
  name: string
  code: string
  description?: string
  peripherals?: StationPeripherals
}

export interface UpdatePOSStationInput {
  name?: string
  code?: string
  description?: string
  peripherals?: StationPeripherals
  isActive?: boolean
}
```

**Step 2: Export from index**

Add to `apps/application/src/components/pos/types/index.ts`:

```typescript
export * from './station'
```

**Step 3: Commit**

```bash
git add apps/application/src/components/pos/types/
git commit -m "feat(pos): add POSStation TypeScript types"
```

---

## Task 4: Create POSStation GraphQL Module

**Files:**
- Create: `apps/api/src/graphql/pos-station/pos-station.module.ts`
- Create: `apps/api/src/graphql/pos-station/pos-station.service.ts`
- Create: `apps/api/src/graphql/pos-station/pos-station.resolver.ts`
- Create: `apps/api/src/graphql/pos-station/dto/index.ts`
- Modify: `apps/api/src/graphql/graphql.module.ts`

**Step 1: Create DTO file**

```typescript
// apps/api/src/graphql/pos-station/dto/index.ts

import { InputType, Field, ID } from '@nestjs/graphql'
import { GraphQLJSON } from 'graphql-type-json'

@InputType()
export class CreatePOSStationInput {
  @Field(() => ID)
  outletId: string

  @Field()
  name: string

  @Field()
  code: string

  @Field({ nullable: true })
  description?: string

  @Field(() => GraphQLJSON, { nullable: true })
  peripherals?: Record<string, unknown>
}

@InputType()
export class UpdatePOSStationInput {
  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  code?: string

  @Field({ nullable: true })
  description?: string

  @Field(() => GraphQLJSON, { nullable: true })
  peripherals?: Record<string, unknown>

  @Field({ nullable: true })
  isActive?: boolean
}
```

**Step 2: Create service file**

```typescript
// apps/api/src/graphql/pos-station/pos-station.service.ts

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { CreatePOSStationInput, UpdatePOSStationInput } from './dto'

@Injectable()
export class POSStationService {
  constructor(private prisma: PrismaService) {}

  async findByOutlet(outletId: string, clubId: string) {
    return this.prisma.pOSStation.findMany({
      where: { outletId, clubId, isActive: true },
      orderBy: { name: 'asc' },
    })
  }

  async findById(id: string, clubId: string) {
    const station = await this.prisma.pOSStation.findFirst({
      where: { id, clubId },
    })
    if (!station) throw new NotFoundException('Station not found')
    return station
  }

  async findByCode(outletId: string, code: string, clubId: string) {
    return this.prisma.pOSStation.findFirst({
      where: { outletId, code, clubId, isActive: true },
    })
  }

  async create(input: CreatePOSStationInput, clubId: string) {
    // Verify outlet exists and belongs to club
    const outlet = await this.prisma.pOSOutlet.findFirst({
      where: { id: input.outletId, clubId },
    })
    if (!outlet) throw new NotFoundException('Outlet not found')

    // Check code uniqueness within outlet
    const existing = await this.prisma.pOSStation.findFirst({
      where: { outletId: input.outletId, code: input.code },
    })
    if (existing) throw new ConflictException('Station code already exists for this outlet')

    return this.prisma.pOSStation.create({
      data: {
        ...input,
        clubId,
      },
    })
  }

  async update(id: string, input: UpdatePOSStationInput, clubId: string) {
    const station = await this.findById(id, clubId)

    // If changing code, check uniqueness
    if (input.code && input.code !== station.code) {
      const existing = await this.prisma.pOSStation.findFirst({
        where: { outletId: station.outletId, code: input.code, id: { not: id } },
      })
      if (existing) throw new ConflictException('Station code already exists for this outlet')
    }

    return this.prisma.pOSStation.update({
      where: { id },
      data: input,
    })
  }

  async deactivate(id: string, clubId: string) {
    await this.findById(id, clubId)
    return this.prisma.pOSStation.update({
      where: { id },
      data: { isActive: false },
    })
  }
}
```

**Step 3: Create resolver file**

```typescript
// apps/api/src/graphql/pos-station/pos-station.resolver.ts

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface'
import { POSStationService } from './pos-station.service'
import { CreatePOSStationInput, UpdatePOSStationInput } from './dto'

@Resolver('POSStation')
@UseGuards(JwtAuthGuard)
export class POSStationResolver {
  constructor(private stationService: POSStationService) {}

  @Query('posStations')
  async getStations(
    @Args('outletId', { type: () => ID }) outletId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stationService.findByOutlet(outletId, user.clubId)
  }

  @Query('posStation')
  async getStation(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stationService.findById(id, user.clubId)
  }

  @Query('posStationByCode')
  async getStationByCode(
    @Args('outletId', { type: () => ID }) outletId: string,
    @Args('code') code: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stationService.findByCode(outletId, code, user.clubId)
  }

  @Mutation('createPOSStation')
  async createStation(
    @Args('input') input: CreatePOSStationInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stationService.create(input, user.clubId)
  }

  @Mutation('updatePOSStation')
  async updateStation(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePOSStationInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stationService.update(id, input, user.clubId)
  }

  @Mutation('deactivatePOSStation')
  async deactivateStation(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stationService.deactivate(id, user.clubId)
  }
}
```

**Step 4: Create module file**

```typescript
// apps/api/src/graphql/pos-station/pos-station.module.ts

import { Module } from '@nestjs/common'
import { POSStationService } from './pos-station.service'
import { POSStationResolver } from './pos-station.resolver'

@Module({
  providers: [POSStationService, POSStationResolver],
  exports: [POSStationService],
})
export class POSStationModule {}
```

**Step 5: Register module**

Add to `apps/api/src/graphql/graphql.module.ts`:

```typescript
import { POSStationModule } from './pos-station/pos-station.module'

@Module({
  imports: [
    // ... existing modules
    POSStationModule,
  ],
})
```

**Step 6: Add GraphQL schema types**

Create or update `apps/api/src/graphql/pos-station/pos-station.graphql`:

```graphql
type POSStation {
  id: ID!
  clubId: String!
  outletId: String!
  name: String!
  code: String!
  description: String
  peripherals: JSON
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  outlet: POSOutlet
}

extend type Query {
  posStations(outletId: ID!): [POSStation!]!
  posStation(id: ID!): POSStation
  posStationByCode(outletId: ID!, code: String!): POSStation
}

extend type Mutation {
  createPOSStation(input: CreatePOSStationInput!): POSStation!
  updatePOSStation(id: ID!, input: UpdatePOSStationInput!): POSStation!
  deactivatePOSStation(id: ID!): POSStation!
}

input CreatePOSStationInput {
  outletId: ID!
  name: String!
  code: String!
  description: String
  peripherals: JSON
}

input UpdatePOSStationInput {
  name: String
  code: String
  description: String
  peripherals: JSON
  isActive: Boolean
}
```

**Step 7: Commit**

```bash
git add apps/api/src/graphql/pos-station/
git commit -m "feat(api): add POSStation GraphQL module with CRUD operations"
```

---

## Task 5: Update POSConfig Query to Include Station

**Files:**
- Modify: `apps/api/src/graphql/pos-config/pos-config.service.ts`
- Modify: `apps/api/src/graphql/pos-config/pos-config.resolver.ts`

**Step 1: Update service to accept stationCode**

Add to `POSConfigService.getResolvedConfig()` method:

```typescript
async getResolvedConfig(
  outletId: string,
  stationCode: string | null,  // NEW parameter
  userRole: string,
  userPermissions: string[],
  clubId: string,
): Promise<POSResolvedConfig> {
  // ... existing outlet/template fetching ...

  // NEW: Fetch station if code provided
  let station = null
  if (stationCode) {
    station = await this.prisma.pOSStation.findFirst({
      where: {
        outletId: outlet.id,
        code: stationCode,
        clubId,
        isActive: true,
      },
    })
  }

  return {
    outlet,
    station,  // NEW
    template,
    toolbarConfig,
    actionBarConfig,
    buttonStates,
  }
}
```

**Step 2: Update resolver**

```typescript
@Query('posConfig')
async getPOSConfig(
  @Args('outletId') outletId: string,
  @Args('stationCode', { nullable: true }) stationCode: string | null,  // NEW
  @Args('userRole') userRole: string,
  @Args('userPermissions', { type: () => [String] }) userPermissions: string[],
  @CurrentUser() user: JwtPayload,
) {
  return this.configService.getResolvedConfig(
    outletId,
    stationCode,  // NEW
    userRole,
    userPermissions,
    user.clubId,
  )
}
```

**Step 3: Update GraphQL schema**

Add `stationCode` argument to posConfig query and `station` field to response type.

**Step 4: Commit**

```bash
git add apps/api/src/graphql/pos-config/
git commit -m "feat(api): add station context to POSConfig query"
```

---

## Task 6: Update POSConfigProvider for Station Context

**Files:**
- Modify: `apps/application/src/components/pos/pos-config-provider.tsx`
- Modify: `apps/application/src/components/pos/types.ts`

**Step 1: Update provider props interface**

```typescript
export interface POSConfigProviderProps {
  outlet: string
  station?: string | null  // NEW
  children: React.ReactNode
}
```

**Step 2: Update context value interface**

```typescript
export interface POSConfigContextValue {
  // ... existing fields ...
  station: POSStation | null  // NEW
  peripherals: StationPeripherals | null  // NEW
}
```

**Step 3: Update GraphQL query**

Add `stationCode` variable and `station` field to the query.

**Step 4: Update provider implementation**

Pass `station` prop to query variables, add station to context value.

**Step 5: Commit**

```bash
git add apps/application/src/components/pos/
git commit -m "feat(pos): add station context to POSConfigProvider"
```

---

## Task 7: Create Station Selector Modal

**Files:**
- Create: `apps/application/src/components/pos/modals/station-selector-modal.tsx`
- Modify: `apps/application/src/components/pos/modals/index.ts`

**Step 1: Create modal component**

Create a modal that:
- Fetches stations for the current outlet
- Displays stations as selectable cards
- Has "Remember this register" checkbox
- Calls `onSelect(code, remember)` callback

**Step 2: Export from index**

**Step 3: Commit**

```bash
git add apps/application/src/components/pos/modals/
git commit -m "feat(pos): add station selector modal"
```

---

## Task 8: Create POSStationGuard Component

**Files:**
- Create: `apps/application/src/components/pos/pos-station-guard.tsx`
- Modify: `apps/application/src/components/pos/index.ts`

**Step 1: Create guard component**

Component that:
- Checks if station is in context
- If not, checks localStorage for saved station
- If found, triggers redirect with station code
- If not found, shows station selector modal
- Renders children when station is resolved

**Step 2: Export from index**

**Step 3: Commit**

```bash
git add apps/application/src/components/pos/
git commit -m "feat(pos): add POSStationGuard component"
```

---

## Task 9: Update POS Sales Page

**Files:**
- Modify: `apps/application/src/app/(dashboard)/pos/sales/page.tsx`

**Step 1: Get station from URL**

```typescript
const searchParams = useSearchParams()
const stationCode = searchParams.get('station')
```

**Step 2: Pass station to provider**

```typescript
<POSConfigProvider outlet="pro-shop" station={stationCode}>
```

**Step 3: Wrap content in POSStationGuard**

```typescript
<POSStationGuard onSelectStation={handleStationSelect}>
  {/* existing content */}
</POSStationGuard>
```

**Step 4: Add station select handler**

```typescript
const handleStationSelect = (code: string, remember: boolean) => {
  if (remember) {
    localStorage.setItem(`pos-station-${outletId}`, code)
  }
  router.push(`/pos/sales?station=${code}`)
}
```

**Step 5: Commit**

```bash
git add apps/application/src/app/(dashboard)/pos/sales/
git commit -m "feat(pos): integrate station locking in sales page"
```

---

## Task 10: Add Station Management to Outlets Page

**Files:**
- Modify: `apps/application/src/app/(dashboard)/pos/outlets/page.tsx`
- Create: `apps/application/src/components/pos/station-management.tsx`

**Step 1: Create station management component**

Component for:
- Listing stations for selected outlet
- Add/edit/deactivate stations
- Configure peripherals form

**Step 2: Integrate into outlets page**

Show stations panel when an outlet is selected.

**Step 3: Commit**

```bash
git add apps/application/src/app/(dashboard)/pos/outlets/
git add apps/application/src/components/pos/
git commit -m "feat(pos): add station management UI to outlets page"
```

---

## Task 11: Add QR Code Generation

**Files:**
- Create: `apps/application/src/components/pos/station-qr-code.tsx`
- Modify: `apps/application/package.json` (add qrcode dependency)

**Step 1: Install qrcode library**

```bash
pnpm --filter @clubvantage/application add qrcode @types/qrcode
```

**Step 2: Create QR code component**

```typescript
import QRCode from 'qrcode'

interface StationQRCodeProps {
  station: POSStation
  baseUrl: string
}

function StationQRCode({ station, baseUrl }: StationQRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    const url = `${baseUrl}/pos/sales?station=${station.code}`
    QRCode.toDataURL(url, { width: 300, margin: 2 })
      .then(setQrDataUrl)
  }, [station, baseUrl])

  // Render QR image with download button
}
```

**Step 3: Add to station management UI**

**Step 4: Commit**

```bash
git add apps/application/
git commit -m "feat(pos): add QR code generation for stations"
```

---

## Task 12: Create Seed Data for Testing

**Files:**
- Modify: `database/prisma/seed.ts`

**Step 1: Add sample stations to seed**

```typescript
// After creating POSOutlets, create stations
const proShopStations = [
  { name: 'Register A', code: 'reg-a', description: 'Main counter' },
  { name: 'Register B', code: 'reg-b', description: 'Back room' },
]

for (const station of proShopStations) {
  await prisma.pOSStation.create({
    data: {
      ...station,
      clubId: club.id,
      outletId: proShopOutlet.id,
    },
  })
}
```

**Step 2: Run seed**

```bash
cd database
npx prisma db seed
```

**Step 3: Commit**

```bash
git add database/prisma/seed.ts
git commit -m "feat(db): add POSStation seed data"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | POSStation database model | schema.prisma |
| 2 | Transaction station tracking | schema.prisma |
| 3 | TypeScript types | types/station.ts |
| 4 | GraphQL CRUD module | pos-station/*.ts |
| 5 | Update POSConfig query | pos-config/*.ts |
| 6 | Update POSConfigProvider | pos-config-provider.tsx |
| 7 | Station selector modal | station-selector-modal.tsx |
| 8 | POSStationGuard component | pos-station-guard.tsx |
| 9 | Update sales page | sales/page.tsx |
| 10 | Station management UI | outlets/page.tsx |
| 11 | QR code generation | station-qr-code.tsx |
| 12 | Seed data | seed.ts |

# POS Station Locking Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable POS devices to persistently identify as specific stations (registers) within an outlet, supporting configuration persistence, peripheral assignments, and transaction audit trails.

**Architecture:** URL-based station identification with localStorage fallback. Stations are child records of outlets, each with their own peripheral configuration. Station context flows through POSConfigProvider to all POS components.

**Tech Stack:** Prisma, GraphQL (NestJS), React, Next.js App Router

---

## 1. Data Model

### New `POSStation` Model

```prisma
model POSStation {
  id          String   @id @default(uuid())
  clubId      String
  outletId    String

  // Identity
  name        String   // "Register A", "Register 1"
  code        String   // URL-safe: "reg-a", "register-1"
  description String?  // "Main counter near entrance"

  // Peripheral assignments (JSON for flexibility)
  peripherals Json?    // { receiptPrinter: {...}, cashDrawer: {...}, cardTerminal: {...} }

  // Status
  isActive    Boolean  @default(true)

  // Audit
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  club        Club      @relation(fields: [clubId], references: [id])
  outlet      POSOutlet @relation(fields: [outletId], references: [id], onDelete: Cascade)

  @@unique([outletId, code])  // Each outlet has unique station codes
  @@index([clubId])
  @@index([outletId, isActive])
}
```

### Peripheral Config Structure

```typescript
interface StationPeripherals {
  receiptPrinter?: {
    type: 'network' | 'cloud' | 'usb' | 'bluetooth'
    address: string      // IP, cloud ID, or device path
    name: string         // Human-readable name
    model?: string       // "Epson TM-T88VI"
  }
  cashDrawer?: {
    type: 'printer-driven' | 'network' | 'usb'
    address: string
    name: string
  }
  cardTerminal?: {
    type: 'stripe' | 'square' | 'verifone' | 'other'
    address: string      // Terminal ID or IP
    name: string
  }
}
```

### Transaction Tracking Update

Add to existing transaction model:

```prisma
model POSTransaction {
  // ... existing fields ...

  // Station tracking (denormalized for historical accuracy)
  stationId   String?
  stationName String?          // Preserved even if station renamed/deleted

  station     POSStation? @relation(fields: [stationId], references: [id], onDelete: SetNull)
}
```

---

## 2. Station Identification Flow

### URL Structure

```
/pos/sales?station={stationCode}

Examples:
/pos/sales?station=reg-a
/pos/sales?station=register-1
/pos/sales?station=golf-cart
```

### Resolution Flow

```
User opens /pos/sales
│
├─► URL has ?station= parameter
│   │
│   ├─► Validate: station exists, is active, belongs to outlet
│   │   │
│   │   ├─► VALID: Save to localStorage, load config
│   │   │
│   │   └─► INVALID: Show error, redirect to station selector
│   │
│   └─► Save to localStorage: pos-station-{outletId} = stationCode
│
└─► URL has NO ?station= parameter
    │
    ├─► Check localStorage for pos-station-{outletId}
    │   │
    │   ├─► FOUND: Redirect to /pos/sales?station={code}
    │   │
    │   └─► NOT FOUND: Show station selector modal
    │
    └─► Station selector modal
        │
        └─► User selects → Save to localStorage → Redirect with ?station=
```

### localStorage Keys

```typescript
// Pattern: pos-station-{outletId} → stationCode
localStorage.setItem('pos-station-outlet-uuid-123', 'reg-a')

// Clear station memory (for admin/troubleshooting)
localStorage.removeItem('pos-station-outlet-uuid-123')
```

---

## 3. API Changes

### GraphQL Schema Additions

```graphql
type POSStation {
  id: ID!
  name: String!
  code: String!
  description: String
  peripherals: JSON
  isActive: Boolean!
  outlet: POSOutlet!
  createdAt: DateTime!
  updatedAt: DateTime!
}

extend type POSResolvedConfig {
  station: POSStation          # NEW - current station context
}

extend type Query {
  # Get stations for an outlet
  posStations(outletId: ID!): [POSStation!]!

  # Get single station
  posStation(id: ID!): POSStation

  # Validate station code for outlet
  posStationByCode(outletId: ID!, code: String!): POSStation
}

extend type Mutation {
  # Create station
  createPOSStation(input: CreatePOSStationInput!): POSStation!

  # Update station
  updatePOSStation(id: ID!, input: UpdatePOSStationInput!): POSStation!

  # Deactivate station (soft delete)
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

### Updated GetPOSConfig Query

```graphql
query GetPOSConfig(
  $outletId: String!
  $stationCode: String        # NEW - optional station code
  $userRole: String!
  $userPermissions: [String!]!
) {
  posConfig(
    outletId: $outletId
    stationCode: $stationCode
    userRole: $userRole
    userPermissions: $userPermissions
  ) {
    outlet { id, name, outletType }
    station { id, name, code, peripherals }  # NEW
    template { id, name, toolbarConfig, actionBarConfig }
    toolbarConfig
    actionBarConfig
    buttonStates { buttonId, visible, enabled, requiresApproval }
  }
}
```

---

## 4. Frontend Components

### POSConfigProvider Updates

```typescript
interface POSConfigProviderProps {
  outlet: string           // Outlet ID or name
  station?: string | null  // Station code from URL
  children: ReactNode
}

interface POSConfigContextValue {
  // Existing
  outlet: POSOutlet | null
  template: POSTemplate | null
  toolbarConfig: ToolbarConfig | null
  actionBarConfig: ActionBarConfig | null
  buttonStates: Map<string, POSButtonState>

  // NEW
  station: POSStation | null
  peripherals: StationPeripherals | null
}
```

### Sales Page Updates

```typescript
'use client'

import { useSearchParams, useRouter } from 'next/navigation'

export default function POSSalesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const stationCode = searchParams.get('station')

  // Handle station selection callback
  const handleStationSelect = (code: string, remember: boolean) => {
    if (remember) {
      localStorage.setItem(`pos-station-${outletId}`, code)
    }
    router.push(`/pos/sales?station=${code}`)
  }

  return (
    <POSConfigProvider outlet="pro-shop" station={stationCode}>
      <POSStationGuard onSelectStation={handleStationSelect}>
        {/* Existing POS UI */}
      </POSStationGuard>
    </POSConfigProvider>
  )
}
```

### POSStationGuard Component

```typescript
interface POSStationGuardProps {
  children: ReactNode
  onSelectStation: (code: string, remember: boolean) => void
}

function POSStationGuard({ children, onSelectStation }: POSStationGuardProps) {
  const { station, outlet } = usePOSConfig()
  const [showSelector, setShowSelector] = useState(false)

  useEffect(() => {
    if (!station && outlet) {
      // Check localStorage for saved station
      const savedCode = localStorage.getItem(`pos-station-${outlet.id}`)
      if (savedCode) {
        onSelectStation(savedCode, false)
      } else {
        setShowSelector(true)
      }
    }
  }, [station, outlet])

  if (showSelector) {
    return (
      <StationSelectorModal
        outletId={outlet?.id}
        onSelect={(code, remember) => {
          setShowSelector(false)
          onSelectStation(code, remember)
        }}
      />
    )
  }

  if (!station) {
    return <LoadingSpinner />
  }

  return children
}
```

### Station Selector Modal

```typescript
interface StationSelectorModalProps {
  outletId: string
  onSelect: (code: string, remember: boolean) => void
}

function StationSelectorModal({ outletId, onSelect }: StationSelectorModalProps) {
  const [remember, setRemember] = useState(true)
  const { data: stations } = useQuery(GET_POS_STATIONS, {
    variables: { outletId }
  })

  return (
    <Modal open>
      <ModalHeader>Select Register</ModalHeader>
      <ModalBody>
        <div className="grid grid-cols-2 gap-4">
          {stations?.posStations.map(station => (
            <button
              key={station.id}
              onClick={() => onSelect(station.code, remember)}
              disabled={!station.isActive}
              className="p-4 border rounded-lg hover:border-amber-500"
            >
              <div className="font-medium">{station.name}</div>
              {station.description && (
                <div className="text-sm text-stone-500">{station.description}</div>
              )}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Remember this register on this device
        </label>
      </ModalBody>
    </Modal>
  )
}
```

---

## 5. Station Management UI

### Location

Add to existing `/pos/outlets` page or create `/pos/outlets/[id]/stations` page.

### Features

- List stations for selected outlet
- Add new station (name, code, description)
- Edit station details
- Configure peripherals (form for each peripheral type)
- Activate/deactivate stations
- Generate QR code (downloads PNG with station URL encoded)

### QR Code Generation

```typescript
import QRCode from 'qrcode'

async function generateStationQR(station: POSStation, baseUrl: string) {
  const url = `${baseUrl}/pos/sales?station=${station.code}`
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: { dark: '#1c1917', light: '#ffffff' }
  })
  return qrDataUrl
}
```

---

## 6. Receipt Display

Station name appears on receipts:

```
================================
        PRO SHOP
      Register A
================================
Date: 2026-02-01 14:32
Ticket: 260201-4821
Staff: Jane Smith
--------------------------------
...
```

---

## 7. Out of Scope (Future)

- **Peripheral integration** - Actual printing, drawer opening, card processing
- **Device security** - Requiring device registration/approval before POS access
- **Offline mode** - Working without network, syncing later
- **Station permissions** - Per-station button/feature restrictions
- **Device fingerprinting** - Hardware-based device identification
- **Multi-club roaming** - Same device used across different clubs

---

## 8. Implementation Tasks

1. **Database**: Add POSStation model, update POSTransaction
2. **API**: Station CRUD resolvers, update GetPOSConfig
3. **Frontend - Core**: Update POSConfigProvider, create POSStationGuard
4. **Frontend - Selector**: Station selector modal component
5. **Frontend - Admin**: Station management in outlets page
6. **Frontend - QR**: QR code generation and download
7. **Integration**: Wire station to transaction creation

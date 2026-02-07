# POS Customizable Panel Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a configurable POS action panel system for use across Golf check-in, Spa check-in/out, Facility check-in/out, Pro Shop sales, and F&B - with a dedicated POS section for sales management.

**Architecture:** Context-based configuration injection with template + role overrides. Two-zone UI layout (toolbar header + action bar bottom). JSON-based extensible button registry. Wraps existing module panels without replacing them.

**Tech Stack:** React Context, TanStack Query, Prisma with JSON fields, NestJS GraphQL, Tailwind CSS

---

## Section 1: High-Level Architecture

### Context Provider Pattern
```
POSConfigProvider
├── Fetches config for current outlet + user role
├── Merges template defaults with role overrides
├── Provides button states (visible, enabled, requiresApproval)
└── Exposes action handlers registry
```

### Two-Zone UI Layout
```
┌─────────────────────────────────────────────────────────┐
│ POSToolbar (header zone)                                │
│ [Search] [Member Lookup] [Categories] [Hold] [New]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│           Existing Module Panel Content                 │
│           (TeeSheet, Appointments, etc.)                │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ POSActionBar (bottom zone)                              │
│ [Add Item] [Discount] [Void] [Transfer] [Hold] [Print]  │
│ [      PAY      ] [Card] [Account] [Cash]               │
└─────────────────────────────────────────────────────────┘
```

### New POS Sidebar Section
```
POS (new top-level section)
├── /pos/templates     - Manage button layout templates
├── /pos/outlets       - Configure outlets and role overrides
├── /pos/transactions  - View all POS transactions
├── /pos/open-tickets  - Manage incomplete tickets
├── /pos/cash-drawers  - Cash drawer management
├── /pos/reports       - Sales reports and analytics
└── /pos/products      - Product catalog management
```

---

## Section 2: Data Model (JSON-based)

### Prisma Schema

```prisma
model POSTemplate {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId          String      @db.Uuid
  name            String      @db.VarChar(100)
  description     String?     @db.VarChar(500)
  outletType      String      @db.VarChar(50)  // golf, spa, fnb, pro-shop, facility
  toolbarConfig   Json        @default("{}")   // Zone layout for toolbar
  actionBarConfig Json        @default("{}")   // Button grid configuration
  isDefault       Boolean     @default(false)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  outlets         POSOutlet[]

  @@unique([clubId, name])
  @@map("pos_templates")
}

model POSOutlet {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId          String      @db.Uuid
  name            String      @db.VarChar(100)  // "Pro Shop", "Golf Check-in"
  outletType      String      @db.VarChar(50)
  templateId      String?     @db.Uuid
  customConfig    Json        @default("{}")    // Outlet-specific overrides
  isActive        Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  template        POSTemplate? @relation(fields: [templateId], references: [id])
  roleConfigs     POSOutletRoleConfig[]

  @@unique([clubId, name])
  @@map("pos_outlets")
}

model POSOutletRoleConfig {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  outletId        String      @db.Uuid
  role            String      @db.VarChar(50)   // cashier, manager, admin
  buttonOverrides Json        @default("{}")    // hidden, disabled, requireApproval arrays
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  outlet          POSOutlet   @relation(fields: [outletId], references: [id], onDelete: Cascade)

  @@unique([outletId, role])
  @@map("pos_outlet_role_configs")
}
```

### Button Registry (Club-level JSON setting)

```typescript
// Stored in ClubSettings or dedicated table
// posButtonRegistry: Json
{
  "golf.checkin": {
    "id": "golf.checkin",
    "label": "Check In",
    "icon": "UserCheck",
    "category": "checkin",
    "color": "success",
    "permissions": ["golf.checkin.execute"],
    "outlets": ["golf-checkin"]
  },
  "pos.pay": {
    "id": "pos.pay",
    "label": "Pay",
    "icon": "CreditCard",
    "category": "payment",
    "color": "primary",
    "permissions": ["pos.payment.process"],
    "outlets": ["*"]
  }
  // ... extensible - new buttons added via JSON
}
```

### Config Resolution Order
```
1. Load POSTemplate for outlet
2. Load POSOutletRoleConfig for user's role
3. Merge: template.actionBarConfig + roleConfig.buttonOverrides
4. Filter buttons by user permissions
5. Return final resolved config with button states
```

---

## Section 3: Component Architecture

### Shared Components (packages/ui/src/pos/)

```
packages/ui/src/pos/
├── index.ts
├── pos-toolbar.tsx           # Header zone with configurable slots
├── pos-action-bar.tsx        # Bottom button grid
├── pos-button.tsx            # Individual action button
├── pos-sales-header.tsx      # Ticket/member info header
├── pos-line-item-panel.tsx   # Item list with edit controls
├── pos-receipt-totals.tsx    # Subtotal, discounts, tax, total
└── pos-product-grid.tsx      # Category-filtered product selection
```

### Application Components (apps/application/src/components/pos/)

```
apps/application/src/components/pos/
├── pos-config-provider.tsx   # Context + config fetching
├── pos-action-handlers.ts    # Action handler registry
├── dialogs/
│   ├── member-lookup-dialog.tsx
│   ├── manager-approval-dialog.tsx
│   └── discount-selector-dialog.tsx
└── hooks/
    ├── use-pos-config.ts     # Access resolved config
    ├── use-pos-actions.ts    # Execute button actions
    └── use-pos-shortcuts.ts  # Keyboard shortcut handling
```

### Integration Pattern

```tsx
// Wrap existing panels - no replacement
<POSConfigProvider outlet="golf-checkin">
  <POSToolbar />
  <TeeSheetPanel {...existingProps} />
  <POSActionBar />
</POSConfigProvider>
```

---

## Section 4: POS Management Pages

### Templates Page (`/pos/templates`)
- **List view**: Table of all POSTemplate records with name, description, button count
- **Edit view**: Visual grid editor for arranging buttons (drag-and-drop), category filters, preview mode
- **Actions**: Clone template, export/import JSON, set as default for outlet type

### Outlets Page (`/pos/outlets`)
- **List view**: All outlets (Pro Shop, Golf Check-in, Spa Front Desk, etc.) with their assigned template
- **Edit view**: Assign base template, define role overrides, test configuration
- **Role Matrix**: Grid showing which buttons each role can access at this outlet

### Transactions Page (`/pos/transactions`)
- **List view**: Real-time feed of all POS transactions across outlets
- **Filters**: Date range, outlet, payment method, status, staff member
- **Detail view**: Line items, discounts applied, payment breakdown, receipt preview/reprint

### Open Tickets Page (`/pos/open-tickets`)
- **List view**: All incomplete carts/tickets across outlets
- **Columns**: Ticket #, outlet, member/guest, amount, age (time open), assigned staff
- **Actions**: Transfer to self, void ticket (with manager approval), send to member account

### Cash Drawers Page (`/pos/cash-drawers`)
- **Links to existing**: Wraps current cash drawer management functionality
- **Adds**: Cross-outlet view, shift handoff scheduling, variance alerts

### Reports Page (`/pos/reports`)
- **Standard reports**: Daily sales, hourly breakdown, category analysis, staff performance
- **Export**: PDF, CSV, scheduled email delivery
- **Dashboards**: Real-time widgets for today's sales, open tickets count, drawer status

### Products Page (`/pos/products`)
- **Catalog management**: Pro shop items, F&B menu items, service add-ons
- **Categories**: Hierarchical organization with drag-drop reordering
- **Pricing**: Base price, member discounts, happy hour rules, inventory tracking

---

## Section 5: Module Integration Pattern

### Generic POS Sales Components

For standalone POS sales (Pro Shop, F&B counter, etc.):

**POSSalesHeader** - Customer/ticket identification
```tsx
<POSSalesHeader
  ticketNumber="POS-2024-0847"
  member={selectedMember}        // Optional - can be guest sale
  staffName="John Smith"
  outletName="Pro Shop"
  startedAt={ticketStartTime}
/>
```
- Displays: Ticket #, member name/number (or "Guest"), staff, outlet, time open
- Quick member lookup button (opens member search modal)
- "New Ticket" button to start fresh

**POSLineItemPanel** - Interactive item list
```tsx
<POSLineItemPanel
  items={cartItems}
  onQuantityChange={updateQuantity}
  onRemoveItem={removeItem}
  onItemClick={openItemDetail}
  allowEditing={!ticketSettled}
/>
```
- Scrollable list with item name, quantity, unit price, line total
- Inline quantity +/- controls
- Swipe-to-remove or delete button
- Expandable row for item notes/modifiers
- Empty state with "Scan or search to add items"

**POSReceiptTotals** - Running totals display
```tsx
<POSReceiptTotals
  subtotal={245.00}
  discounts={[
    { name: "Member 10%", amount: -24.50 },
    { name: "Promo Code SUMMER", amount: -10.00 }
  ]}
  tax={14.74}
  total={225.24}
  amountPaid={0}
  balanceDue={225.24}
/>
```
- Subtotal, itemized discounts, tax, grand total
- Shows amount paid and balance due for split payments
- Highlights balance due in accent color

### Direct POS Layout
```tsx
// /pos/sales or embedded in outlet pages
<POSConfigProvider outlet="pro-shop">
  <div className="flex h-full">
    {/* Left: Transaction */}
    <div className="w-1/3 flex flex-col border-r">
      <POSSalesHeader {...headerProps} />
      <POSLineItemPanel items={items} className="flex-1 overflow-auto" />
      <POSReceiptTotals {...totals} />
    </div>

    {/* Right: Product grid / Search */}
    <div className="w-2/3 flex flex-col">
      <POSToolbar />  {/* Search, categories */}
      <POSProductGrid onAddItem={addItem} />
      <POSActionBar /> {/* Pay, Hold, Void, etc. */}
    </div>
  </div>
</POSConfigProvider>
```

### Module Integration (Golf, Spa, etc.)
Existing panels wrap with just toolbar and action bar:

```tsx
<POSConfigProvider outlet="golf-checkin">
  <POSToolbar />
  <TeeSheetPanel {...existingProps} />
  <POSActionBar />
</POSConfigProvider>
```

### Button Actions Map to Existing Functionality
| Button ID | Action | Maps To |
|-----------|--------|---------|
| `golf.checkin` | Check in selected flight | `useCheckInFlightMutation` |
| `golf.settle` | Open settlement modal | Opens `SettlementModal` |
| `golf.addItem` | Add pro shop item | `useAddLineItemMutation` |
| `golf.discount` | Apply discount | Opens discount selector |
| `golf.printTicket` | Print starter ticket | `usePrintStarterTicketMutation` |

### Action Handler Registry
```tsx
// Each module registers its action handlers
const golfActionHandlers: POSActionHandlerMap = {
  'golf.checkin': async (context) => {
    await checkInFlight({ teeTimeId: context.selectedTeeTime })
  },
  'golf.settle': (context) => {
    context.openModal('settlement', { teeTimeId: context.selectedTeeTime })
  },
  // ... more handlers
}
```

### Context Passes Selection State
The `POSConfigProvider` receives current selection from the wrapped panel:
- Golf: `selectedTeeTime`, `selectedPlayers`
- Spa: `selectedAppointment`, `selectedGuest`
- F&B: `selectedTable`, `selectedTicket`

Buttons enable/disable based on whether required context exists.

---

## Section 6: Button Configuration Schema

### Button Definition in Registry
```typescript
// posButtonRegistry JSON structure
{
  "golf.checkin": {
    "id": "golf.checkin",
    "label": "Check In",
    "icon": "UserCheck",
    "category": "checkin",
    "color": "success",           // success | warning | danger | neutral | primary
    "size": "large",              // small | medium | large
    "requiresSelection": true,    // Disabled when nothing selected
    "selectionType": "teeTime",   // What must be selected
    "confirmAction": false,       // Show confirmation dialog?
    "permissions": ["golf.checkin.execute"],
    "outlets": ["golf-checkin"],  // Where this button can appear
    "shortcut": "C"               // Keyboard shortcut
  },
  "pos.pay": {
    "id": "pos.pay",
    "label": "Pay",
    "icon": "CreditCard",
    "category": "payment",
    "color": "primary",
    "size": "large",
    "requiresSelection": false,
    "minimumCartTotal": 0.01,     // Only enabled with items
    "confirmAction": false,
    "permissions": ["pos.payment.process"],
    "outlets": ["*"],             // Available everywhere
    "shortcut": "P"
  }
}
```

### Template Layout Configuration
```typescript
// POSTemplate.toolbarConfig
{
  "zones": {
    "left": ["search", "memberLookup"],
    "center": ["categoryTabs"],
    "right": ["holdTicket", "newTicket"]
  }
}

// POSTemplate.actionBarConfig
{
  "rows": 2,
  "columns": 6,
  "buttons": [
    { "position": [0, 0], "buttonId": "pos.addItem", "span": 1 },
    { "position": [0, 1], "buttonId": "pos.discount", "span": 1 },
    { "position": [0, 2], "buttonId": "pos.void", "span": 1 },
    { "position": [0, 3], "buttonId": "pos.transfer", "span": 1 },
    { "position": [0, 4], "buttonId": "pos.hold", "span": 1 },
    { "position": [0, 5], "buttonId": "pos.print", "span": 1 },
    { "position": [1, 0], "buttonId": "pos.pay", "span": 3 },      // Large pay button
    { "position": [1, 3], "buttonId": "pos.payCard", "span": 1 },
    { "position": [1, 4], "buttonId": "pos.payAccount", "span": 1 },
    { "position": [1, 5], "buttonId": "pos.payCash", "span": 1 }
  ]
}
```

### Role Override Example
```typescript
// POSOutletRoleConfig.buttonOverrides
{
  "role": "cashier",
  "hidden": ["pos.void", "pos.refund"],      // Can't see these
  "disabled": ["pos.discountManual"],         // Can see but not use
  "requireApproval": ["pos.discount"]         // Needs manager PIN
}
```

### Runtime Button State
```typescript
interface POSButtonState {
  visible: boolean      // From role config
  enabled: boolean      // From selection + permissions
  requiresApproval: boolean
  shortcut: string | null
}
```

---

## Section 7: GraphQL API Operations

### Queries
```graphql
# Get resolved config for current user at outlet
query GetPOSConfig($outletId: ID!) {
  posConfig(outletId: $outletId) {
    outlet { id name type }
    template { id name }
    toolbarConfig    # Merged JSON
    actionBarConfig  # Merged JSON with role overrides applied
    buttonStates {   # Pre-computed visibility/enabled per button
      buttonId
      visible
      enabled
      requiresApproval
    }
  }
}

# Admin: List all templates
query GetPOSTemplates {
  posTemplates {
    id name description outletType
    buttonCount
    createdAt updatedAt
  }
}

# Admin: Get template detail for editing
query GetPOSTemplate($id: ID!) {
  posTemplate(id: $id) {
    id name description outletType
    toolbarConfig
    actionBarConfig
    outlets { id name }  # Where it's used
  }
}

# Get button registry (cacheable, rarely changes)
query GetPOSButtonRegistry {
  posButtonRegistry  # Returns full JSON
}

# Admin: List outlets with their configs
query GetPOSOutlets {
  posOutlets {
    id name type
    template { id name }
    roleOverrideCount
  }
}
```

### Mutations
```graphql
# Admin: Create/update template
mutation UpsertPOSTemplate($input: POSTemplateInput!) {
  upsertPOSTemplate(input: $input) {
    id name
  }
}

# Admin: Assign template to outlet
mutation AssignPOSTemplate($outletId: ID!, $templateId: ID!) {
  assignPOSTemplate(outletId: $outletId, templateId: $templateId) {
    id
  }
}

# Admin: Set role overrides for outlet
mutation SetPOSRoleOverrides($outletId: ID!, $input: POSRoleOverridesInput!) {
  setPOSRoleOverrides(outletId: $outletId, input: $input) {
    id
  }
}

# Admin: Update button registry (add new button types)
mutation UpdatePOSButtonRegistry($registry: JSON!) {
  updatePOSButtonRegistry(registry: $registry)
}

# Admin: Clone template
mutation ClonePOSTemplate($id: ID!, $newName: String!) {
  clonePOSTemplate(id: $id, newName: $newName) {
    id name
  }
}
```

### React Hooks (Generated)
```typescript
// Auto-generated from GraphQL operations
useGetPOSConfigQuery({ outletId })
useGetPOSTemplatesQuery()
useGetPOSTemplateQuery({ id })
useGetPOSButtonRegistryQuery()
useUpsertPOSTemplateMutation()
useAssignPOSTemplateMutation()
useSetPOSRoleOverridesMutation()
```

---

## Section 8: Implementation Phases

### Phase 1: Foundation (Backend)
1. **Prisma schema** - POSTemplate, POSOutlet, POSOutletRoleConfig, posButtonRegistry
2. **Seed data** - Default templates for Golf, Spa, Pro Shop, F&B
3. **GraphQL module** - Types, inputs, service, resolver for all operations
4. **Config resolution logic** - Merge template + role overrides, compute button states

### Phase 2: Shared Components
1. **POSConfigProvider** - Context with config fetching, button state management
2. **POSToolbar** - Renders toolbar zones from config
3. **POSActionBar** - Renders button grid from config
4. **POSButton** - Individual button with state, shortcuts, approval flow
5. **POSSalesHeader** - Ticket/member header
6. **POSLineItemPanel** - Item list with edit controls
7. **POSReceiptTotals** - Totals display

### Phase 3: Golf Integration
1. Wrap TeeSheetPanel with POSConfigProvider
2. Register golf action handlers
3. Create golf-checkin default template
4. Test end-to-end flow

### Phase 4: Direct POS Sales
1. Build `/pos/sales` page with full layout
2. Product grid component with category tabs
3. Member lookup modal
4. Integrate with existing shopping cart mutations

### Phase 5: Admin Pages
1. Template editor with visual grid builder
2. Outlet configuration page
3. Role override matrix
4. Button registry viewer/editor

### Phase 6: Remaining Modules
1. Spa check-in/out integration
2. F&B integration
3. Facility booking integration

---

## Summary

This design provides:

- **Configurability**: JSON-based button layouts, per-outlet templates, role-based overrides
- **Extensibility**: New buttons added to registry without code changes
- **Consistency**: Shared components across all POS touchpoints
- **Integration**: Wraps existing panels without replacing them
- **Permissions**: Role-based visibility, approval workflows, keyboard shortcuts

The implementation follows a phased approach, starting with backend foundation and progressing through shared components, module integration, and admin tooling.

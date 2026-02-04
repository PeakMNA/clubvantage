# POS Frontend UI Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build complete frontend UI for POS Product Panel — staff-facing product grid with quick keys/suggestions/modals, plus admin template editor and outlet config pages.

**Architecture:** Enhanced POSProductPanel component with modals, shared UI components in packages/ui, admin pages in apps/application, GraphQL hooks via api-client.

**Tech Stack:** React/Next.js, TailwindCSS, Radix UI primitives, GraphQL with codegen hooks

---

## 1. Staff-Facing POSProductPanel

### 1.1 Component Structure

```
POSProductPanel
├── QuickKeysBar (horizontal strip of manager-curated favorites)
├── SmartSuggestionsRow (AI-recommended items based on time/sales/staff)
├── CategoryNav (tabs | sidebar | dropdown - configurable)
├── ProductGrid (tiles with variant/modifier indicators)
│   └── ProductTile (shows price, image, stock status, type icons)
├── VariantPickerModal (size/color selection for VARIABLE products)
├── ModifierModal (add bacon, cooking temp for F&B items)
└── SearchOverlay (quick product lookup)
```

### 1.2 Click Behaviors

| Product Type | Has Modifiers | Action |
|--------------|---------------|--------|
| SIMPLE | No | Add to cart immediately |
| SIMPLE | Yes | Open modifier modal → add to cart |
| VARIABLE | No | Open variant picker → add to cart |
| VARIABLE | Yes | Open variant picker → modifier modal → add to cart |
| SERVICE | - | Add to cart (booking handled separately) |
| COMPOSITE | - | Open bundle configurator (future) |

### 1.3 Product Tile States

| State | Appearance |
|-------|------------|
| Default | Category color bg, name, price, image |
| Out of stock | Grayed, "Out of Stock" badge, non-clickable |
| Low stock | Amber "Low: N" badge |
| Has variants | Small grid icon in corner |
| Has modifiers | Small sliders icon in corner |
| Quick key | Subtle star icon |

### 1.4 Data Fetching

```typescript
// Single query for main panel data
query OutletProductPanel($outletId: ID!, $staffId: ID) {
  outletGridConfig(outletId: $outletId) { ... }
  outletCategories(outletId: $outletId) { ... }
  outletProducts(outletId: $outletId) { ... }  // visibility pre-applied
  quickKeys(outletId: $outletId) { ... }
}

// Separate query for suggestions (refreshed on interval)
query SmartSuggestions($outletId: ID!, $staffId: ID) {
  smartSuggestions(outletId: $outletId, staffId: $staffId) { ... }
}
```

---

## 2. Admin Template Editor

### 2.1 Page Structure

Located at `/settings/pos/templates`

```
TemplateListPage
├── Header ("POS Templates", "New Template" button)
├── TemplateTable (name, outlet type, outlets using, last modified, actions)
└── TemplateEditorModal (or full page)
    ├── GeneralTab
    │   ├── Name input
    │   ├── Description textarea
    │   └── Outlet type dropdown (Pro Shop, F&B, Spa, etc.)
    ├── GridLayoutTab
    │   ├── POSGridPreview (live preview with sample products)
    │   ├── Columns slider (4-8)
    │   ├── Rows slider (3-6)
    │   ├── Tile size radio (Small/Medium/Large)
    │   ├── Show images toggle
    │   ├── Show prices toggle
    │   └── Category style radio (Tabs/Sidebar/Dropdown)
    ├── QuickKeysTab
    │   ├── Enable toggle
    │   ├── Position radio (Top/Left)
    │   ├── Count slider (6-12)
    │   └── Product selector (search + drag-drop list)
    └── SmartSuggestionsTab
        ├── Enable toggle
        ├── Position radio (Top Row/Sidebar/Floating)
        ├── Count slider (4-8)
        └── Weight sliders (Time / Velocity / Staff History = 100%)
```

### 2.2 Live Preview

The `POSGridPreview` component shows a scaled-down representation of the grid:
- Uses actual grid dimensions from sliders
- Shows placeholder tiles in category colors
- Updates in real-time as settings change
- Displays quick keys bar if enabled
- Shows suggestions row if enabled

---

## 3. Admin Outlet Config

### 3.1 Page Structure

Located at `/settings/pos/outlets/[outletId]`

```
OutletConfigPage
├── Header
│   ├── Outlet name + badge (outlet type)
│   ├── Template dropdown (with "Use template defaults" option)
│   └── "Reset all to template" button
├── Tabs
│   ├── ProductsTab
│   │   ├── CategoryTree (left sidebar)
│   │   │   ├── "All Products" root
│   │   │   └── Collapsible category nodes
│   │   ├── ProductGrid (center, draggable)
│   │   │   └── ProductTile × N (with visibility/quick-key badges)
│   │   └── ProductDetailPanel (right drawer, shown when tile selected)
│   │       ├── Product info (read-only: name, SKU, base price)
│   │       ├── Display name override input
│   │       ├── Button color picker
│   │       ├── Sort priority input
│   │       ├── Visibility toggle
│   │       ├── Quick key toggle + position input
│   │       └── Visibility Rules accordion
│   │           ├── Time rules (add/remove time windows)
│   │           ├── Role rules (allowed/denied multi-select)
│   │           └── Inventory rule dropdown
│   ├── CategoriesTab
│   │   ├── Draggable category list
│   │   ├── Per-category: Hide toggle, Color override picker
│   │   └── "Reset order" button
│   ├── GridOverridesTab
│   │   ├── "Use template defaults" master toggle
│   │   └── Same controls as template (disabled when using defaults)
│   └── VisibilityRulesTab (bulk editor)
│       ├── Product multi-select list
│       ├── Rule builder form
│       └── "Apply to selected" button
```

### 3.2 Visibility Rules Builder

```typescript
interface VisibilityRule {
  timeRules?: {
    startTime: string;  // "06:00"
    endTime: string;    // "11:00"
    daysOfWeek: number[]; // 1-7 (Mon-Sun)
  }[];
  roleRules?: {
    allowedRoles?: string[];
    deniedRoles?: string[];
  };
  inventoryRule?: 'ALWAYS_SHOW' | 'HIDE_WHEN_ZERO' | 'SHOW_DISABLED';
  memberOnly?: boolean;
}
```

UI Components:
- Time rule: Start time picker, End time picker, Day checkboxes (M T W T F S S)
- Role rule: Two multi-selects (Allowed roles, Denied roles)
- Inventory: Dropdown with three options
- Member only: Checkbox

---

## 4. Shared Components

### 4.1 Component List

```
packages/ui/src/pos/
├── pos-product-panel.tsx       # Main staff-facing orchestrator
├── pos-product-tile.tsx        # Enhanced tile with indicators
├── pos-quick-keys-bar.tsx      # Horizontal/vertical quick keys
├── pos-suggestions-row.tsx     # Smart suggestions strip
├── pos-category-nav.tsx        # Tabs/sidebar/dropdown modes
├── pos-variant-picker.tsx      # Modal for variant selection
├── pos-modifier-modal.tsx      # Modal for modifier selection
├── pos-grid-preview.tsx        # Live preview for admin
├── pos-visibility-rules.tsx    # Rule builder component
└── pos-product-search.tsx      # Search overlay/modal
```

### 4.2 Existing Components to Reuse

From `packages/ui/src/pos/`:
- `pos-button.tsx` - POS-styled button
- `pos-action-bar.tsx` - Bottom action bar
- `pos-line-item-panel.tsx` - Cart/receipt panel
- `pos-receipt-totals.tsx` - Totals display
- `pos-sales-header.tsx` - Header with member info
- `pos-toolbar.tsx` - Top toolbar

From `packages/ui/src/primitives/`:
- Button, Input, Select, Checkbox, Radio
- Dialog, Sheet, Tabs
- Slider (for grid config)
- Command (for product search)

---

## 5. Data Flow

### 5.1 Staff POS Page

```typescript
function usePOSProductPanel(outletId: string, staffId?: string) {
  // Main panel data
  const { data: panelData } = useOutletProductPanelQuery({ outletId });

  // Suggestions (refreshed on interval)
  const { data: suggestions } = useSmartSuggestionsQuery(
    { outletId, staffId },
    { refetchInterval: 30 * 60 * 1000 }
  );

  // Add to cart with variant/modifier handling
  const addToCart = async (product, variant?, modifiers?) => { ... };

  return {
    config: panelData?.outletGridConfig,
    categories: panelData?.outletCategories,
    products: panelData?.outletProducts,
    quickKeys: panelData?.quickKeys,
    suggestions: suggestions?.smartSuggestions,
    addToCart,
  };
}
```

### 5.2 Admin Template Editor

```typescript
function useTemplateEditor(templateId?: string) {
  const { data: template } = useGetTemplateQuery(
    { templateId },
    { skip: !templateId }
  );

  const [createTemplate] = useCreateTemplateMutation();
  const [updateTemplate] = useUpdateTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();

  return { template, createTemplate, updateTemplate, deleteTemplate };
}
```

### 5.3 Admin Outlet Config

```typescript
function useOutletConfig(outletId: string) {
  const { data } = useOutletConfigQuery({ outletId });

  const [updateProductConfig] = useUpdateOutletProductConfigMutation();
  const [updateCategoryConfig] = useUpdateOutletCategoryConfigMutation();
  const [updateGridConfig] = useUpdateOutletGridConfigMutation();
  const [bulkUpdateVisibility] = useBulkUpdateProductVisibilityMutation();

  return {
    outlet: data?.outlet,
    template: data?.outlet?.template,
    productConfigs: data?.outletProductConfigs,
    categoryConfigs: data?.outletCategoryConfigs,
    gridConfig: data?.outletGridConfig,
    updateProductConfig,
    updateCategoryConfig,
    updateGridConfig,
    bulkUpdateVisibility,
  };
}
```

---

## 6. Implementation Phases

### Phase 1: Core Staff UI (POSProductPanel)
1. Create enhanced POSProductTile with type/modifier indicators
2. Create POSQuickKeysBar component
3. Create POSSmartSuggestionsRow component
4. Create POSCategoryNav with three display modes
5. Create POSVariantPickerModal
6. Create POSModifierModal
7. Create POSProductPanel composing all pieces
8. Add GraphQL operations to api-client
9. Generate hooks with codegen
10. Integrate into existing POS sales page

### Phase 2: Admin Template Editor
1. Create template list page at /settings/pos/templates
2. Create POSGridPreview live preview component
3. Create TemplateEditorModal with tabs
4. Add template GraphQL operations
5. Wire up CRUD mutations

### Phase 3: Admin Outlet Config
1. Create outlet config page at /settings/pos/outlets/[id]
2. Create POSVisibilityRulesBuilder component
3. Create ProductsTab with category tree + draggable grid + detail panel
4. Create CategoriesTab with drag-drop reordering
5. Create GridOverridesTab with template inheritance
6. Create VisibilityRulesTab for bulk editing
7. Wire up all mutations

---

## 7. Toolbar Configuration System

### 7.1 Zone-Based Layout

The POS toolbar uses a three-zone layout system for flexible customization:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [LEFT ZONE]          │    [CENTER ZONE]         │    [RIGHT ZONE]       │
│  Table Operations     │    Member Functions      │    Ticket Actions     │
└──────────────────────────────────────────────────────────────────────────┘
```

| Zone | Purpose | Default Items |
|------|---------|---------------|
| Left | Table/floor operations | Open Table, Floor Plan, Search |
| Center | Member interactions | Member Lookup, Attach Member, Charge to Member |
| Right | Ticket management | Split Check, Merge Tables, Transfer Table, Hold Ticket, New Ticket |

### 7.2 Available Toolbar Items

#### General Items
| ID | Label | Description |
|----|-------|-------------|
| `search` | Search | Global product/member search |
| `categoryTabs` | Category Tabs | Category navigation tabs (use only if not in product panel) |

#### Member Operations
| ID | Label | Description |
|----|-------|-------------|
| `memberLookup` | Member Lookup | Open member search modal |
| `attachMember` | Attach Member | Attach a member to current ticket |
| `detachMember` | Detach Member | Remove member from current ticket |
| `memberInfo` | Member Info | View attached member details |
| `chargeToMember` | Charge to Member | Charge ticket to member account |

#### Ticket Actions
| ID | Label | Description |
|----|-------|-------------|
| `holdTicket` | Hold Ticket | Hold current ticket for later |
| `newTicket` | New Ticket | Create a new ticket |
| `splitCheck` | Split Check | Split ticket across multiple payments |

#### F&B Table Operations
| ID | Label | Description |
|----|-------|-------------|
| `openTable` | Open Table | Quick access to open a table |
| `floorPlan` | Floor Plan | Visual floor plan view |
| `transferTable` | Transfer Table | Transfer table to another server |
| `mergeTables` | Merge Tables | Combine multiple tables into one ticket |

### 7.3 Template Configuration Structure

Toolbar configuration is stored in the `toolbarConfig` field of POS templates:

```typescript
interface TemplateToolbarConfig {
  groups: ToolbarGroup[];
}

interface ToolbarGroup {
  id: string;           // Unique group identifier
  label: string;        // Display label for admin UI
  zone: 'left' | 'center' | 'right';
  items: string[];      // Array of item IDs
}

// Example configuration
const defaultToolbarConfig: TemplateToolbarConfig = {
  groups: [
    {
      id: 'table-group',
      label: 'Table Operations',
      zone: 'left',
      items: ['openTable', 'floorPlan', 'search']
    },
    {
      id: 'member-group',
      label: 'Member',
      zone: 'center',
      items: ['memberLookup', 'attachMember', 'chargeToMember']
    },
    {
      id: 'actions-group',
      label: 'Table & Ticket',
      zone: 'right',
      items: ['splitCheck', 'mergeTables', 'transferTable', 'holdTicket', 'newTicket']
    }
  ]
};
```

### 7.4 Template Editor Integration

The Template Editor modal allows admins to configure toolbar groups:

```
TemplateEditorModal
└── ToolbarTab
    ├── Zone Selector (Left | Center | Right)
    ├── Available Items (filtered by category)
    │   ├── General: Search, Category Tabs
    │   ├── Ticket: Hold Ticket, New Ticket
    │   ├── Member: Member Lookup, Attach/Detach, Info, Charge
    │   └── F&B Tables: Open Table, Floor Plan, Transfer, Merge
    └── Zone Configuration (drag-drop item arrangement)
```

### 7.5 API Integration

Toolbar configuration is fetched via GraphQL:

```typescript
// Query outlet-specific POS config
const { data } = useGetPosConfigQuery({
  outletId: selectedOutletId,
  userRole: 'staff',
  userPermissions: []
});

// Parse toolbar config from API response
const toolbarConfig = data?.posConfig?.toolbarConfig as TemplateToolbarConfig;

// Access toolbar groups for rendering
const toolbarGroups = toolbarConfig?.toolbarGroups || defaultGroups;
```

---

## 8. Session Management

### 8.1 Activity-Based Timeout

POS sessions use activity-based timeout rather than fixed token expiration:

| Setting | Default Value | Description |
|---------|---------------|-------------|
| Inactivity Timeout | 15 minutes | Time without activity before logout |
| Activity Check Interval | 1 minute | How often to check for timeout |
| Warning Before Logout | 2 minutes | When to show "Stay logged in?" prompt |

### 8.2 Activity Detection

The following events reset the inactivity timer:

- Mouse clicks and movements
- Keyboard input
- Touch events
- Scroll events

Activity updates are throttled to once per second to minimize performance impact.

### 8.3 Session Extension

When the warning is shown, users can:

1. **Stay Logged In**: Resets timer and refreshes session tokens
2. **Log Out**: Immediately ends session

```typescript
interface AuthContextValue {
  // Existing methods...
  extendSession: () => Promise<void>;      // Reset timer + refresh tokens
  getTimeUntilTimeout: () => number;       // Milliseconds until timeout
}
```

### 8.4 Visibility Change Handling

When a browser tab becomes visible again:
- Session validity is checked
- Tokens are refreshed if needed
- User is logged out if session has expired

---

## 9. Success Criteria

1. **Staff efficiency**: Find and add any product in <3 taps
2. **Quick keys**: One-tap access to top 8-12 items
3. **Smart suggestions**: Relevant items shown >70% of the time
4. **Admin self-service**: Managers can configure layouts without developer help
5. **Template inheritance**: Changes to template cascade to outlets using defaults
6. **Visibility rules**: Rules apply correctly 100% of the time
7. **Performance**: Grid loads in <500ms with 500+ products
8. **Toolbar customization**: Changes in template editor reflect on POS sales page
9. **Session security**: Activity-based timeout prevents unauthorized access
10. **Member operations**: All member functions accessible from toolbar center zone

# POS / Outlets / Configuration

## Overview

The POS Outlets module manages the configuration of physical and virtual point-of-sale locations within a club. Each outlet represents a distinct selling context -- such as a Pro Shop, Fine Dining Restaurant, Poolside Bar, Spa Front Desk, Golf Check-in, or Membership Services desk -- with its own product catalog visibility, toolbar layout, action bar buttons, role-based access controls, grid display settings, and station assignments.

Outlets follow a hierarchical configuration model: Club Settings provide global defaults, Templates define outlet-type-specific defaults (toolbar, action bar, grid layout), individual Outlets can override template settings, and Role Configs further customize button visibility and approval requirements per staff role at each outlet. This hierarchy allows central administrators to manage consistency while giving outlet managers the flexibility to tailor their POS experience.

The outlet configuration system includes three admin interfaces: the Outlets list page for managing outlets and template assignments, the Templates page for creating and editing reusable layout templates, and the per-outlet config page for product visibility, category ordering, grid overrides, and visibility rules.

## Status

| Aspect | State |
|--------|-------|
| Outlets list page | Built -- displays outlets from API, shows template assignment dropdown |
| Template assignment | Built -- useAssignPosTemplateMutation wired to outlet list |
| Templates list page | Built -- CRUD via useGetPosTemplatesQuery, useUpsertPosTemplateMutation, useClonePosTemplateMutation |
| Template editor modal | Built -- general info, toolbar groups, action buttons tabs with live JSON editing |
| Outlet config page shell | Built -- route at /pos/outlets/[outletId]/config exists |
| POSOutlet Prisma model | Built -- id, clubId, name, outletType, templateId, customConfig, isActive |
| POSTemplate Prisma model | Built -- id, clubId, name, description, outletType, toolbarConfig, actionBarConfig, isDefault |
| POSOutletRoleConfig Prisma model | Built -- id, outletId, role, buttonOverrides |
| Config resolution API | Built -- GetPOSConfig query merges template + role overrides + permissions |
| Outlet type definitions | Built -- POSOutletType union in types.ts |
| Product visibility per outlet | Not started -- OutletProductConfig model not yet in schema |
| Category config per outlet | Not started -- OutletCategoryConfig model not yet in schema |
| Grid config per outlet | Not started -- OutletGridConfig model not yet in schema |
| Visibility rules builder | Component file exists but functionality not wired |
| Role override matrix UI | Not started |
| Outlet creation modal | Not started -- TODO placeholder in outlets page |
| Outlet deactivation | Not started |

## Capabilities

- List all POS outlets for the current club with name, type, template, and active status
- Assign or change the template for an outlet via dropdown selector
- Create, edit, clone, and delete POS templates with toolbar and action bar configurations
- Configure toolbar button groups per zone (left, center, right) in the template editor
- Configure action bar buttons with position, variant, and action type in the template editor
- Define per-outlet product visibility (show, hide, disable) with override display names and button colors
- Set per-outlet category ordering, visibility, and color overrides
- Override grid layout settings at the outlet level (columns, rows, tile size, category style)
- Configure quick key products per outlet with position ordering
- Define visibility rules per product per outlet (time-based, role-based, inventory-based, member-only)
- Bulk edit visibility rules across multiple products
- Set role-based button overrides per outlet (hidden, disabled, requires approval)
- Create and manage stations within each outlet

## Dependencies

### Interface Dependencies

| Component | Package | Purpose |
|-----------|---------|---------|
| TemplateEditorModal | @/components/pos | Modal with tabs for editing template toolbar and action bar configs |
| VisibilityRulesBuilder | @/components/pos | Form component for building time/role/inventory visibility rules |
| POSGridPreview | @clubvantage/ui | Live preview of grid layout settings during template editing |
| POSConfigProvider | @/components/pos | Context provider that resolves merged config for preview |
| useGetPosOutletsQuery | @clubvantage/api-client | Fetch all outlets for the club |
| useGetPosConfigQuery | @clubvantage/api-client | Fetch resolved config for a specific outlet |
| useGetPosTemplatesQuery | @clubvantage/api-client | Fetch all templates for listing and assignment |
| useUpsertPosTemplateMutation | @clubvantage/api-client | Create or update a template |
| useClonePosTemplateMutation | @clubvantage/api-client | Duplicate a template with a new name |
| useAssignPosTemplateMutation | @clubvantage/api-client | Assign a template to an outlet |

### Settings Dependencies

| Setting | Location | Impact |
|---------|----------|--------|
| Club default outlet types | ClubSettings | Available outlet types for creating new outlets |
| Default templates per type | POSTemplate.isDefault | Auto-assigned when new outlet of that type is created |
| Button registry | ClubSettings or dedicated table | Master list of all available button definitions for templates |
| Available roles | Club role definitions | Roles available for role override configuration |
| Product catalog | Product table | Products available for outlet product configuration |
| Category hierarchy | ProductCategory table | Categories available for outlet category configuration |

### Data Dependencies

| Entity | Relation | Usage |
|--------|----------|-------|
| POSOutlet | Belongs to Club, has one Template, has many RoleConfigs, has many Stations | Core outlet record |
| POSTemplate | Belongs to Club, has many Outlets | Reusable config template |
| POSOutletRoleConfig | Belongs to Outlet | Role-specific button overrides |
| OutletProductConfig | Belongs to Outlet and Product | Per-product display and visibility settings |
| OutletCategoryConfig | Belongs to Outlet and ProductCategory | Per-category display settings |
| OutletGridConfig | Belongs to Outlet (one-to-one) | Grid layout settings |
| SmartSuggestionConfig | Belongs to Outlet (one-to-one) | Suggestion algorithm weights and display settings |
| POSStation | Belongs to Outlet | Physical register/terminal assignments |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| outletName | String | (required) | Club admin | Human-readable outlet name displayed in POS header and reports |
| outletType | Enum | GENERAL | Club admin | Outlet type determines available default templates and toolbar items |
| templateId | UUID (nullable) | null | Club admin | Assigned template providing base toolbar and action bar config |
| isActive | Boolean | true | Club admin | Whether the outlet is available for POS operations |
| customConfig | JSON | {} | Outlet manager | Outlet-specific overrides merged on top of template config |
| gridColumns | Integer (4-8) | 6 | Template or outlet | Number of columns in the product grid |
| gridRows | Integer (3-6) | 4 | Template or outlet | Number of rows visible in the product grid |
| tileSize | Enum (SMALL, MEDIUM, LARGE) | MEDIUM | Template or outlet | Product tile size affecting information density |
| showImages | Boolean | true | Template or outlet | Whether product images appear on tiles |
| showPrices | Boolean | true | Template or outlet | Whether prices appear on tiles |
| categoryStyle | Enum (TABS, SIDEBAR, DROPDOWN) | TABS | Template or outlet | How category navigation is rendered |
| showAllCategory | Boolean | true | Template or outlet | Whether an "All" pseudo-category appears in navigation |
| quickKeysEnabled | Boolean | true | Template or outlet | Whether the quick keys bar is shown |
| quickKeysCount | Integer (6-12) | 8 | Template or outlet | Number of quick key slots available |
| quickKeysPosition | Enum (TOP, LEFT) | TOP | Template or outlet | Position of the quick keys bar |
| suggestionsEnabled | Boolean | true | Template or outlet | Whether smart suggestions row is shown |
| suggestionCount | Integer (4-8) | 6 | Template or outlet | Number of suggestion slots |
| suggestionPosition | Enum (TOP_ROW, SIDEBAR, FLOATING) | TOP_ROW | Template or outlet | Where suggestions appear |
| timeOfDayWeight | Integer (0-100) | 40 | Template or outlet | Weight for time-based suggestion scoring |
| salesVelocityWeight | Integer (0-100) | 35 | Template or outlet | Weight for sales velocity suggestion scoring |
| staffHistoryWeight | Integer (0-100) | 25 | Template or outlet | Weight for staff history suggestion scoring |
| suggestionRefreshInterval | Integer (minutes, 15-60) | 30 | Template or outlet | How often smart suggestions refresh |

## Data Model

type POSOutletType =
  | 'GOLF_TEE_SHEET'
  | 'GOLF_PRO_SHOP'
  | 'FNB_RESTAURANT'
  | 'FNB_BAR'
  | 'FNB_BANQUET'
  | 'FNB_QSR'
  | 'MEMBERSHIP'
  | 'SPA'
  | 'SPORTS_FACILITY'
  | 'GENERAL';

interface POSTemplate {
  id: string;
  clubId: string;
  name: string;
  description?: string;
  outletType: POSOutletType;
  toolbarConfig: ToolbarConfig;
  actionBarConfig: ActionBarConfig;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface POSOutlet {
  id: string;
  clubId: string;
  name: string;
  outletType: POSOutletType;
  templateId?: string;
  template?: POSTemplate;
  customConfig: Partial<ToolbarConfig & ActionBarConfig>;
  roleConfigs?: POSOutletRoleConfig[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface POSOutletRoleConfig {
  id: string;
  outletId: string;
  role: string;
  buttonOverrides: Record<string, Partial<POSButtonState>>;
  createdAt: string;
  updatedAt: string;
}

interface ToolbarConfig {
  groups: ToolbarGroup[];
}

interface ToolbarGroup {
  id: string;
  label: string;
  zone: 'left' | 'center' | 'right';
  items: string[];
}

interface ActionBarConfig {
  rows: number;
  columns: number;
  buttons: ActionBarButton[];
}

interface ActionBarButton {
  position: [number, number];
  buttonId: string;
  span?: number;
}

interface OutletProductConfig {
  id: string;
  outletId: string;
  productId: string;
  categoryId?: string;
  displayName?: string;
  buttonColor?: string;
  sortPriority?: number;
  gridPosition?: { row: number; col: number };
  isVisible: boolean;
  visibilityRules: VisibilityRules;
  isQuickKey: boolean;
  quickKeyPosition?: number;
}

interface VisibilityRules {
  timeRules?: {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
  }[];
  roleRules?: {
    allowedRoles?: string[];
    deniedRoles?: string[];
  };
  inventoryRule?: 'ALWAYS_SHOW' | 'HIDE_WHEN_ZERO' | 'SHOW_DISABLED';
  memberOnly?: boolean;
  customRules?: {
    type: string;
    value: any;
  }[];
}

interface OutletCategoryConfig {
  id: string;
  outletId: string;
  categoryId: string;
  isVisible: boolean;
  sortOrder?: number;
  colorOverride?: string;
}

interface OutletGridConfig {
  id: string;
  outletId: string;
  gridColumns: number;
  gridRows: number;
  tileSize: 'SMALL' | 'MEDIUM' | 'LARGE';
  showImages: boolean;
  showPrices: boolean;
  categoryStyle: 'TABS' | 'SIDEBAR' | 'DROPDOWN';
  showAllCategory: boolean;
  quickKeysEnabled: boolean;
  quickKeysCount: number;
  quickKeysPosition: 'TOP' | 'LEFT';
}

## Business Rules

1. The configuration hierarchy resolves in order: Club Settings (global) -> Template (outlet type defaults) -> Outlet customConfig (location overrides) -> Role Config (permission overrides). Each level only overrides fields that are explicitly set; unset fields inherit from the parent level.

2. Every outlet must have a unique name within its club. The outletType determines which default template is auto-assigned on creation if the club has a default template for that type.

3. Template toolbarConfig stores an array of ToolbarGroup objects, each assigned to a zone (left, center, right). Items within each group reference toolbar item IDs from a fixed registry of available items (search, memberLookup, floorPlan, etc.).

4. Template actionBarConfig stores button positions in a grid layout. Each button references a buttonId from the club's button registry. Buttons can span multiple columns. The grid dimensions (rows x columns) determine the layout density.

5. Role overrides use three arrays: hidden (button IDs that are not rendered), disabled (button IDs that are visible but non-interactive), and requireApproval (button IDs that trigger manager PIN entry before execution). These are merged with template button states at config resolution time.

6. Config resolution happens server-side in the GetPOSConfig query. The resolver loads the template, applies outlet customConfig overrides, applies role overrides based on the requesting user's role, filters by user permissions, and returns the final resolved config with pre-computed button states.

7. When a template is updated, all outlets using that template see the changes immediately on their next config fetch (staleTime is 5 minutes). There is no manual "push" -- it is pull-based with cache invalidation.

8. Outlet product configs use the template inheritance pattern: if no OutletProductConfig exists for a product at an outlet, the product inherits default visibility (visible) and default display settings from the product's own fields. Only products with explicit overrides have OutletProductConfig records.

9. Visibility rules are evaluated in order: time rules first (if current time is outside all time windows, product is hidden), then role rules (if user's role is in deniedRoles or not in allowedRoles, product is hidden), then inventory rule (HIDE_WHEN_ZERO hides when stock is 0, SHOW_DISABLED shows grayed out), then memberOnly (hidden if no member is attached to the ticket).

10. Quick keys are outlet-specific. The quickKeyPosition field determines the display order. Quick key count is capped by the template/outlet quickKeysCount setting. Products flagged as quick keys but beyond the count limit are not displayed.

11. Smart suggestion algorithm weights must sum to 100. If they do not, the system normalizes them proportionally. The algorithm runs server-side and returns a ranked list of product IDs refreshed at the configured interval.

12. When an outlet is deactivated (isActive = false), it no longer appears in the outlet selector on the POS sales page. Any open tickets at a deactivated outlet are automatically held and can be recalled by an admin.

13. Cloning a template creates a deep copy of all configuration including toolbar groups, action buttons, and JSON settings. The clone receives a new name and is not marked as default.

14. The outlet config page (Products tab) allows drag-and-drop reordering of products within a category. The resulting sort order is persisted as sortPriority values in OutletProductConfig records.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Outlet created with no template available for its type | Outlet functions with empty toolbar and action bar; admin sees a "No template assigned" warning banner |
| Template deleted while outlets are using it | Cascade sets outlet.templateId to null; outlets fall back to default config until a new template is assigned |
| Role config references a button ID not in the registry | Override is silently ignored; button renders with default state |
| Two outlets with the same name attempted | Unique constraint violation returns user-friendly "An outlet with this name already exists" error |
| Visibility rule time window spans midnight | Rule with startTime "22:00" and endTime "06:00" is interpreted as 10 PM to 6 AM the next day |
| All products hidden by visibility rules at an outlet | Product panel shows an empty state with message "No products available" and a link to outlet config |
| Quick key product is made invisible | Quick key flag is preserved but the product does not appear in the quick keys bar while invisible |
| Suggestion weights set to 0/0/0 | System normalizes to equal weights (34/33/33) and logs a configuration warning |
| Outlet customConfig contains invalid JSON | Parse error caught at save time; mutation returns validation error; existing config is preserved |
| Role override makes all action bar buttons hidden | Action bar renders empty; no payment or transaction actions available; admin must fix role config |
| Template edited while staff are using POS | Changes take effect on next config fetch (within 5 minutes); in-progress transactions are not affected |
| Grid dimensions set to values outside allowed range | Clamped to valid range (columns 4-8, rows 3-6) at save time with a toast notification |
| Outlet type changed after products are configured | OutletProductConfig records are preserved; products that do not apply to the new type may need manual cleanup |
| Multiple default templates exist for the same outlet type | Only the most recently created default is used; admin sees a warning to resolve the conflict |
| Category deleted while referenced by OutletCategoryConfig | Cascade deletes the OutletCategoryConfig record; products in that category fall back to their parent category or become uncategorized |

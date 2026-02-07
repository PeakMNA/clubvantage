# POS / Product Panel / Customizable Layout

## Overview

The POS Product Panel is the primary product selection interface on the POS sales page. It presents a configurable grid of product tiles organized by categories, supplemented by a quick keys bar for frequently used items and a smart suggestions row powered by analytics. The panel supports four product types (SIMPLE, VARIABLE, SERVICE, COMPOSITE) and handles the click-through flow from tile tap to cart addition, including variant selection and modifier customization modals.

The panel is fully configurable through a hierarchical system: POS Templates define base grid layout, category display style, quick key settings, and suggestion algorithm weights. Individual outlets can override any template setting. Per-product configuration at the outlet level controls visibility, display name overrides, button colors, sort priority, fixed grid positions, and conditional visibility rules based on time of day, staff role, inventory status, and member attachment.

The product panel is implemented as a shared component in the @clubvantage/ui package, making it reusable across the POS sales page, the admin template editor preview, and any future POS-enabled module. It communicates with parent components through callbacks (onAddToCart, onRefreshSuggestions) and receives its data as props, keeping it decoupled from specific data fetching strategies.

## Status

| Aspect | State |
|--------|-------|
| POSProductPanel component | Built -- composes QuickKeysBar, SuggestionsRow, CategoryNav, ProductGrid |
| POSProductTile component | Built -- displays name, price, image, category color, product type indicators |
| POSProductGrid component | Built -- renders grid of tiles with configurable columns |
| POSCategoryNav component | Built -- tabs mode implemented |
| POSQuickKeysBar component | Built -- horizontal bar of quick key tiles |
| POSSuggestionsRow component | Built -- horizontal suggestion strip with refresh button |
| POSVariantPicker component | Built -- modal for variant selection |
| POSModifierModal component | Built -- modal for modifier selection with single/multiple modes |
| POSGridPreview component | Built -- scaled-down preview for admin template editor |
| Data source | Mock data -- 20 hardcoded products in sales page, not connected to API |
| Unified Product model (Prisma) | Not started -- still using ProshopProduct for database |
| ProductCategory model (Prisma) | Not started |
| ProductVariant model (Prisma) | Not started |
| ModifierGroup/Modifier models | Not started |
| OutletProductConfig model | Not started |
| OutletCategoryConfig model | Not started |
| OutletGridConfig model | Not started |
| Smart suggestion algorithm | Not started -- server-side scoring not implemented |
| ProductSalesMetric tracking | Not started |
| StaffProductUsage tracking | Not started |
| SmartSuggestionConfig model | Not started |
| Visibility rules evaluation | Not started |
| Category sidebar mode | Not started -- only tabs mode built |
| Category dropdown mode | Not started |
| Product search overlay | Not started |
| Bundle/composite configurator | Not started |
| Real-time inventory updates | Not started |
| Admin outlet product config UI | Not started |

## Capabilities

- Render a configurable grid of product tiles with category color backgrounds, names, prices, and images
- Navigate products by category using tabs, sidebar, or dropdown navigation (configurable)
- Display an "All" pseudo-category that shows products from all categories
- Show quick keys bar (horizontal or vertical) with manager-curated favorite products for one-tap access
- Show smart suggestions row with analytics-driven product recommendations
- Handle product tile clicks based on product type: SIMPLE adds directly, VARIABLE opens variant picker, products with modifiers open modifier modal
- Chain variant picker and modifier modal for VARIABLE products with modifiers
- Increment quantity for identical product+variant+modifier combinations already in cart
- Show product stock status (in stock, low stock with count, out of stock with disabled state)
- Show visual indicators on tiles for variants (grid icon), modifiers (sliders icon), and quick key status (star icon)
- Support configurable tile sizes (small, medium, large) affecting information density
- Toggle image and price display per template/outlet setting
- Search products by name, SKU, or display name via search overlay
- Apply conditional visibility rules (time-based, role-based, inventory-based, member-only) per product per outlet
- Override product display names, button colors, and sort priority per outlet
- Assign fixed grid positions to specific products at an outlet
- Configure suggestion algorithm weights (time-of-day, sales velocity, staff history)
- Refresh suggestions on a configurable interval
- Preview grid layout changes in real time via POSGridPreview in the admin template editor

## Dependencies

### Interface Dependencies

| Component | Package | Purpose |
|-----------|---------|---------|
| POSProductPanel | @clubvantage/ui | Main orchestrator composing all sub-components |
| POSProductTile | @clubvantage/ui | Individual product tile with state indicators |
| POSProductGrid | @clubvantage/ui | Grid layout rendering tiles in configured columns/rows |
| POSCategoryNav | @clubvantage/ui | Category navigation in tabs/sidebar/dropdown modes |
| POSQuickKeysBar | @clubvantage/ui | Horizontal or vertical quick key strip |
| POSSuggestionsRow | @clubvantage/ui | Smart suggestions strip with refresh |
| POSVariantPicker | @clubvantage/ui | Modal for selecting product variants |
| POSModifierModal | @clubvantage/ui | Modal for selecting modifiers with min/max enforcement |
| POSGridPreview | @clubvantage/ui | Scaled-down admin preview of grid layout |
| POSProductSearch | @clubvantage/ui (planned) | Search overlay for quick product lookup |

### Settings Dependencies

| Setting | Location | Impact |
|---------|----------|--------|
| Grid layout config | OutletGridConfig or template defaults | Determines columns, rows, tile size, category style |
| Quick keys config | OutletGridConfig or template defaults | Enables/disables quick keys, sets count and position |
| Suggestion config | SmartSuggestionConfig or template defaults | Enables/disables suggestions, sets weights and refresh interval |
| Product visibility | OutletProductConfig.visibilityRules | Time, role, inventory, member rules per product |
| Product display overrides | OutletProductConfig | Display name, button color, sort priority per product |
| Category visibility | OutletCategoryConfig | Which categories appear at this outlet |

### Data Dependencies

| Entity | Relation | Usage |
|--------|----------|-------|
| Product | Core product record | Name, price, type, image, stock status |
| ProductCategory | Hierarchical categories | Category names, colors, icons for navigation and tile backgrounds |
| ProductVariant | Belongs to Product | Variant options for VARIABLE products |
| ModifierGroup | Linked to Product via ProductModifierGroup | Modifier groups with selection rules |
| Modifier | Belongs to ModifierGroup | Individual modifier options with price adjustments |
| OutletProductConfig | Per-outlet product settings | Visibility, display overrides, quick key status |
| OutletCategoryConfig | Per-outlet category settings | Visibility, sort order, color overrides |
| OutletGridConfig | Per-outlet grid settings | Layout dimensions and display options |
| SmartSuggestionConfig | Per-outlet suggestion settings | Algorithm weights and display configuration |
| ProductSalesMetric | Sales data per product per outlet per day | Hourly sales data for time-of-day scoring |
| StaffProductUsage | Usage counts per staff per product per outlet | Staff history for personalized suggestions |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| gridColumns | Integer (4-8) | 6 | Template or outlet admin | Number of product tile columns in the grid |
| gridRows | Integer (3-6) | 4 | Template or outlet admin | Number of visible product tile rows before scrolling |
| tileSize | Enum (SMALL, MEDIUM, LARGE) | MEDIUM | Template or outlet admin | Size of each product tile affecting information density |
| showImages | Boolean | true | Template or outlet admin | Whether product images appear on tiles |
| showPrices | Boolean | true | Template or outlet admin | Whether prices appear on tiles |
| categoryStyle | Enum (TABS, SIDEBAR, DROPDOWN) | TABS | Template or outlet admin | How category navigation is rendered |
| showAllCategory | Boolean | true | Template or outlet admin | Whether an "All" pseudo-category appears in navigation |
| quickKeysEnabled | Boolean | true | Template or outlet admin | Whether the quick keys bar is displayed |
| quickKeysCount | Integer (6-12) | 8 | Template or outlet admin | Maximum number of quick key slots |
| quickKeysPosition | Enum (TOP, LEFT) | TOP | Template or outlet admin | Orientation and position of the quick keys bar |
| suggestionsEnabled | Boolean | true | Template or outlet admin | Whether the smart suggestions row is displayed |
| suggestionCount | Integer (4-8) | 6 | Template or outlet admin | Number of suggestion slots shown |
| suggestionPosition | Enum (TOP_ROW, SIDEBAR, FLOATING) | TOP_ROW | Template or outlet admin | Where suggestions appear relative to the grid |
| timeOfDayWeight | Integer (0-100) | 40 | Template or outlet admin | Algorithm weight for time-of-day sales patterns |
| salesVelocityWeight | Integer (0-100) | 35 | Template or outlet admin | Algorithm weight for recent sales velocity |
| staffHistoryWeight | Integer (0-100) | 25 | Template or outlet admin | Algorithm weight for current staff's usage history |
| suggestionRefreshInterval | Integer (15-60 minutes) | 30 | Template or outlet admin | How often smart suggestions are recalculated |
| inventoryDefaultRule | Enum (ALWAYS_SHOW, HIDE_WHEN_ZERO, SHOW_DISABLED) | SHOW_DISABLED | Template or outlet admin | Default inventory visibility behavior when no per-product rule is set |
| lowStockThreshold | Integer | 5 | Product catalog admin | Global threshold for showing "Low: N" badge on tiles |

## Data Model

enum ProductType {
  SIMPLE      // Add to cart immediately
  VARIABLE    // Show variant picker first
  SERVICE     // May trigger booking flow
  COMPOSITE   // Bundle configurator
}

interface POSProduct {
  id: string;
  name: string;
  displayName?: string;
  price: number;
  productType: ProductType;
  categoryId: string;
  categoryColor?: string;
  inStock: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  imageUrl?: string;
  variants?: ProductVariant[];
  modifierGroups?: ModifierGroup[];
  isQuickKey?: boolean;
  buttonColor?: string;
}

interface POSCategory {
  id: string;
  name: string;
  color?: string;
  iconName?: string;
  parentId?: string;
  sortOrder: number;
}

interface ProductVariant {
  id: string;
  name: string;
  priceAdjustment: number;
  attributes?: Record<string, string>;
  stockQuantity?: number;
  imageUrl?: string;
  isActive: boolean;
}

interface ModifierGroup {
  id: string;
  name: string;
  selectionType: 'SINGLE' | 'MULTIPLE';
  minSelections: number;
  maxSelections?: number;
  isRequired: boolean;
  modifiers: Modifier[];
}

interface Modifier {
  id: string;
  name: string;
  priceAdjustment: number;
  isDefault: boolean;
  isActive: boolean;
}

interface SelectedModifier {
  modifierId: string;
  groupId: string;
  name: string;
  priceAdjustment: number;
}

interface GridConfig {
  gridColumns: number;
  gridRows: number;
  tileSize: 'small' | 'medium' | 'large';
  showImages: boolean;
  showPrices: boolean;
  categoryStyle: 'tabs' | 'sidebar' | 'dropdown';
  showAllCategory: boolean;
  quickKeysEnabled: boolean;
  quickKeysCount: number;
  quickKeysPosition: 'top' | 'left';
}

interface QuickKeyProduct {
  id: string;
  name: string;
  displayName?: string;
  price: number;
  imageUrl?: string;
  productType: ProductType;
  categoryColor?: string;
}

interface SuggestedProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  productType: ProductType;
  categoryColor?: string;
  score?: number;
}

interface SuggestionScore {
  productId: string;
  score: number;
  breakdown: {
    timeScore: number;
    velocityScore: number;
    staffScore: number;
  };
}

// Props for the main component
interface POSProductPanelProps {
  config: GridConfig;
  categories: POSCategory[];
  products: POSProduct[];
  quickKeys?: QuickKeyProduct[];
  suggestions?: SuggestedProduct[];
  onAddToCart: (product: POSProduct, variant?: ProductVariant, modifiers?: SelectedModifier[]) => void;
  onRefreshSuggestions?: () => void;
  isSuggestionsRefreshing?: boolean;
  className?: string;
}

## Business Rules

1. Product tile click behavior is determined by the product type and whether it has modifiers. The complete decision tree is: SIMPLE without modifiers adds to cart immediately. SIMPLE with modifiers opens the modifier modal, then adds to cart on confirmation. VARIABLE without modifiers opens the variant picker, then adds to cart on variant selection. VARIABLE with modifiers opens the variant picker, then the modifier modal on variant selection, then adds to cart. SERVICE products add directly or trigger a service booking flow depending on outlet configuration. COMPOSITE products open a bundle configurator (future).

2. The variant picker displays all active variants for a product with their name, price adjustment (+ or -), and stock status. Only one variant can be selected. The picker calculates and shows the final price (basePrice + priceAdjustment) for each variant.

3. The modifier modal enforces selection rules per modifier group: SINGLE groups allow exactly one selection (radio button behavior), MULTIPLE groups enforce minSelections and maxSelections limits (checkbox behavior with counter). Groups marked isRequired must meet minSelections before the confirm button enables. Default modifiers are pre-selected.

4. When adding to cart, the system first checks if an identical combination (same productId + variantId + sorted modifier IDs) already exists. If so, the existing line item's quantity increments by 1. If not, a new line item is created with quantity 1.

5. The unit price for a line item is calculated as: basePrice + variant.priceAdjustment + sum(modifier.priceAdjustment for each selected modifier). This price is locked at the time of addition.

6. Category navigation filters products client-side. When a category is selected, only products with a matching categoryId are displayed. The "All" pseudo-category (when enabled) shows all products sorted by their sort priority. Subcategories are supported -- selecting a parent category shows products from the parent and all its children.

7. Quick keys are rendered in a fixed-size bar (horizontal at top or vertical at left). The number of visible slots equals quickKeysCount. Products are ordered by their quickKeyPosition value. Clicking a quick key follows the same type-based flow as clicking a product tile.

8. Smart suggestions are fetched from the server as a ranked list of product IDs. The algorithm scores each product using a weighted formula: score = (timeScore * timeWeight/100) + (velocityScore * velocityWeight/100) + (staffScore * staffWeight/100). Time score uses hourly sales patterns for the current hour. Velocity score uses recent weekly average sales. Staff score uses the current staff member's product usage frequency.

9. Suggestions refresh automatically at the configured interval (default 30 minutes). A manual refresh button allows staff to trigger an immediate refresh. During refresh, a loading spinner appears on the suggestions row without blocking the rest of the panel.

10. Visibility rules are evaluated in order for each product at each outlet. A product is hidden if: (a) it fails any time rule (current time/day is not within any of the product's time windows), (b) it fails the role rule (user's role is in deniedRoles or not in allowedRoles when allowedRoles is defined), (c) inventory rule is HIDE_WHEN_ZERO and stock quantity is 0, or (d) memberOnly is true and no member is attached to the current ticket. If inventory rule is SHOW_DISABLED, the tile appears grayed out and non-clickable.

11. Products with no OutletProductConfig record at the current outlet inherit default visibility (visible), default display settings from the product's own fields, and default inventory rule from the outlet's inventoryDefaultRule setting.

12. The product grid paginates when there are more products than fit in the configured rows x columns. Pagination is implemented as scrollable overflow within the grid container, not as page numbers. The grid auto-scrolls to the top when the category changes.

13. Search overlay (when implemented) filters products by matching the search query against product name, display name, and SKU. Results are displayed in a separate grid overlay that closes when a product is selected or the search is cleared.

14. The grid preview component (POSGridPreview) renders a scaled-down version of the grid using the same layout logic but with smaller tiles and placeholder content. It updates in real time as admins adjust grid settings in the template editor.

15. Tile size affects what information is displayed: SMALL tiles show only name and price, MEDIUM tiles add an image thumbnail and type indicators, LARGE tiles show full images with stock status badges.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Product has no category assigned | Product is placed in an "Uncategorized" group visible only in the "All" view |
| Category has no products after visibility rules applied | Category tab/sidebar item is hidden; empty categories are not shown |
| All products in grid are out of stock | Grid shows all tiles in disabled state; no empty state message (products are still visible if rule is SHOW_DISABLED) |
| Product image fails to load | Tile falls back to category color background with product initials |
| Variant has priceAdjustment that makes final price negative | Display 0.00 as minimum; the system does not allow negative line item prices |
| Modifier group has maxSelections of 0 | Interpreted as unlimited selections for MULTIPLE type; no checkbox limit enforced |
| Required modifier group has no active modifiers | Product tile is disabled with tooltip "Configuration error -- contact admin"; logged as warning |
| Quick key product becomes invisible via visibility rule | Quick key slot is skipped; remaining keys shift to fill the gap; total visible keys may be less than quickKeysCount |
| Quick key product is deleted from catalog | Quick key reference becomes orphaned; slot is empty; admin needs to reassign |
| Suggestion algorithm returns fewer products than suggestionCount | Remaining slots show empty; no padding with random products |
| All suggestion weights set to zero | Normalize to equal weights (34/33/33); log configuration warning |
| Staff member has no usage history (new employee) | staffScore is 0 for all products; suggestions rely on time and velocity scores only |
| Product with 50+ variants | Variant picker displays scrollable list; search within picker is recommended for >20 variants |
| Product with 5+ modifier groups | Modifier modal displays scrollable form; each group is a collapsible section |
| Grid columns set to value that does not divide evenly with product count | Last row is partially filled; tiles are left-aligned with empty space on the right |
| Category color is null | Tile uses a neutral default color (stone-200) as background |
| Two products with same sortPriority | Secondary sort by product name alphabetically |
| Category hierarchy exceeds 3 levels deep | Display only top 2 levels in navigation; deeper categories are accessible only via "All" view or search |
| Network error when fetching products | Show cached products from last successful fetch; display "Unable to refresh -- showing cached data" banner |
| Product panel receives empty products array | Show empty state with message "No products configured for this outlet" |
| Display name override is empty string | Treated as null; fall back to product's original name |
| Button color override is invalid hex | Ignore override; fall back to category color |
| Fixed grid position conflicts (two products at same position) | Later-created config wins; first product shifts to next available position |
| Suggestions endpoint returns 500 error | Suggestions row shows "Unable to load suggestions" with retry button; rest of panel functions normally |
| Product type changes from SIMPLE to VARIABLE after being added to cart | In-progress cart items retain their original type behavior; future adds use new type |

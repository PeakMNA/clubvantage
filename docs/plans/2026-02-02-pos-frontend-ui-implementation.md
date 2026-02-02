# POS Frontend UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build complete frontend UI for POS Product Panel — staff-facing product grid with quick keys/suggestions/modals, plus admin template editor and outlet config pages.

**Architecture:** Enhanced POSProductPanel component with variant/modifier modals, shared UI components in packages/ui, admin pages in apps/application, GraphQL hooks via api-client codegen.

**Tech Stack:** React 18, Next.js 14, TailwindCSS, Radix UI primitives, GraphQL with @tanstack/react-query

---

## Phase 1: Staff UI Components

### Task 1: GraphQL Operations for Products

**Files:**
- Create: `packages/api-client/src/operations/products.graphql`

**Step 1: Create the GraphQL operations file**

```graphql
# Product Panel Operations

# Main query for outlet product panel
query OutletProductPanel($outletId: ID!) {
  outletGridConfig(outletId: $outletId) {
    id
    gridColumns
    gridRows
    tileSize
    showImages
    showPrices
    categoryStyle
    showAllCategory
    quickKeysEnabled
    quickKeysCount
    quickKeysPosition
  }

  productCategories(outletId: $outletId) {
    id
    name
    color
    iconName
    sortOrder
    parentId
  }

  outletProducts(outletId: $outletId) {
    id
    name
    sku
    productType
    basePrice
    imageUrl
    thumbnailUrl
    trackInventory
    stockQuantity
    lowStockThreshold
    category {
      id
      name
      color
    }
    variants {
      id
      name
      sku
      priceAdjustment
      attributes
      stockQuantity
      imageUrl
      isActive
    }
    modifierGroups {
      id
      modifierGroup {
        id
        name
        selectionType
        minSelections
        maxSelections
        modifiers {
          id
          name
          priceAdjustment
          isDefault
          isActive
        }
      }
      isRequired
      sortOrder
    }
    outletConfig {
      displayName
      buttonColor
      sortPriority
      gridPosition
      isVisible
      isQuickKey
      quickKeyPosition
    }
  }

  quickKeys(outletId: $outletId) {
    id
    name
    basePrice
    imageUrl
    productType
    category {
      id
      color
    }
  }
}

# Smart suggestions (separate query, refreshed on interval)
query SmartSuggestions($outletId: ID!, $staffId: ID) {
  smartSuggestions(outletId: $outletId, staffId: $staffId) {
    id
    name
    basePrice
    imageUrl
    productType
    category {
      id
      color
    }
  }
}

# Record sale for metrics
mutation RecordProductSale($outletId: ID!, $productId: ID!, $staffId: ID, $quantity: Int!) {
  recordProductSale(
    outletId: $outletId
    productId: $productId
    staffId: $staffId
    quantity: $quantity
  ) {
    success
  }
}

# Admin: Get all products for outlet config
query OutletProductConfigs($outletId: ID!) {
  outletProductConfigs(outletId: $outletId) {
    id
    productId
    displayName
    buttonColor
    sortPriority
    gridPosition
    isVisible
    visibilityRules
    isQuickKey
    quickKeyPosition
    product {
      id
      name
      sku
      productType
      basePrice
      imageUrl
      category {
        id
        name
        color
      }
    }
  }
}

# Admin: Update outlet product config
mutation UpdateOutletProductConfig($outletId: ID!, $productId: ID!, $input: UpdateOutletProductConfigInput!) {
  updateOutletProductConfig(outletId: $outletId, productId: $productId, input: $input) {
    id
    displayName
    buttonColor
    sortPriority
    isVisible
    isQuickKey
    quickKeyPosition
  }
}

# Admin: Bulk update product visibility
mutation BulkUpdateOutletProductConfigs($outletId: ID!, $input: BulkOutletProductConfigInput!) {
  bulkUpdateOutletProductConfigs(outletId: $outletId, input: $input) {
    id
    isVisible
    isQuickKey
  }
}

# Admin: Update outlet grid config
mutation UpdateOutletGridConfig($outletId: ID!, $input: UpdateOutletGridConfigInput!) {
  updateOutletGridConfig(outletId: $outletId, input: $input) {
    id
    gridColumns
    gridRows
    tileSize
    showImages
    showPrices
    categoryStyle
    quickKeysEnabled
    quickKeysCount
    quickKeysPosition
  }
}

# Admin: Update smart suggestion config
mutation UpdateSmartSuggestionConfig($outletId: ID!, $input: UpdateSmartSuggestionConfigInput!) {
  updateSmartSuggestionConfig(outletId: $outletId, input: $input) {
    id
    enabled
    suggestionCount
    position
    timeOfDayWeight
    salesVelocityWeight
    staffHistoryWeight
  }
}
```

**Step 2: Run codegen**

```bash
cd /Users/peak/development/vantage/clubvantage/.worktrees/pos-frontend-ui
pnpm --filter @clubvantage/api-client run codegen
```

**Step 3: Commit**

```bash
git add packages/api-client/src/operations/products.graphql
git commit -m "feat(api-client): add GraphQL operations for product panel

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Enhanced POSProductTile Component

**Files:**
- Create: `packages/ui/src/pos/pos-product-tile.tsx`
- Modify: `packages/ui/src/pos/index.ts`

**Step 1: Create the product tile component**

```tsx
'use client'

import * as React from 'react'
import { cn } from '../lib/utils'
import { Package, Grid3X3, SlidersHorizontal, Star } from 'lucide-react'

export type ProductType = 'SIMPLE' | 'VARIABLE' | 'SERVICE' | 'COMPOSITE'

export interface POSProductTileProps {
  id: string
  name: string
  displayName?: string
  price: number
  imageUrl?: string
  productType: ProductType
  categoryColor?: string
  inStock?: boolean
  stockQuantity?: number
  lowStockThreshold?: number
  hasVariants?: boolean
  hasModifiers?: boolean
  isQuickKey?: boolean
  tileSize?: 'small' | 'medium' | 'large'
  showImage?: boolean
  showPrice?: boolean
  onClick?: () => void
  className?: string
}

const tileSizeConfig = {
  small: {
    container: 'p-1.5',
    image: 'w-8 h-8 mb-1',
    name: 'text-[10px] min-h-[1.5rem]',
    price: 'text-[10px]',
    badge: 'text-[8px] px-1 py-0.5',
    icon: 'h-2.5 w-2.5',
  },
  medium: {
    container: 'p-2.5',
    image: 'w-10 h-10 mb-1.5',
    name: 'text-xs min-h-[2rem]',
    price: 'text-xs',
    badge: 'text-[9px] px-1 py-0.5',
    icon: 'h-3 w-3',
  },
  large: {
    container: 'p-3',
    image: 'w-14 h-14 mb-2',
    name: 'text-sm min-h-[2.5rem]',
    price: 'text-sm',
    badge: 'text-[10px] px-1.5 py-0.5',
    icon: 'h-3.5 w-3.5',
  },
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function POSProductTile({
  id,
  name,
  displayName,
  price,
  imageUrl,
  productType,
  categoryColor,
  inStock = true,
  stockQuantity,
  lowStockThreshold = 5,
  hasVariants = false,
  hasModifiers = false,
  isQuickKey = false,
  tileSize = 'medium',
  showImage = true,
  showPrice = true,
  onClick,
  className,
}: POSProductTileProps) {
  const isOutOfStock = !inStock || (stockQuantity !== undefined && stockQuantity <= 0)
  const isLowStock = !isOutOfStock && stockQuantity !== undefined && stockQuantity <= lowStockThreshold
  const config = tileSizeConfig[tileSize]
  const label = displayName || name

  // Determine background color
  const bgColor = categoryColor
    ? { backgroundColor: categoryColor }
    : undefined

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isOutOfStock}
      className={cn(
        'relative flex flex-col items-center rounded-lg border transition-all',
        'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1',
        config.container,
        isOutOfStock
          ? 'opacity-50 cursor-not-allowed bg-stone-100 border-stone-200'
          : 'bg-white hover:bg-stone-50 hover:border-amber-300 hover:shadow-sm border-stone-200',
        className
      )}
      style={!isOutOfStock ? bgColor : undefined}
      aria-label={`${label} - ${formatCurrency(price)}${isOutOfStock ? ' (Out of Stock)' : ''}`}
      aria-disabled={isOutOfStock}
    >
      {/* Quick key indicator */}
      {isQuickKey && (
        <Star
          className={cn('absolute top-1 left-1 text-amber-500 fill-amber-500', config.icon)}
        />
      )}

      {/* Product type indicators */}
      <div className="absolute top-1 right-1 flex gap-0.5">
        {hasVariants && (
          <Grid3X3 className={cn('text-stone-500', config.icon)} title="Has variants" />
        )}
        {hasModifiers && (
          <SlidersHorizontal className={cn('text-stone-500', config.icon)} title="Has modifiers" />
        )}
      </div>

      {/* Product Image / Placeholder */}
      {showImage && (
        <div
          className={cn(
            'rounded bg-white/50 flex items-center justify-center overflow-hidden flex-shrink-0',
            config.image
          )}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
          ) : (
            <Package className={cn('text-stone-400', config.icon)} />
          )}
        </div>
      )}

      {/* Product Name */}
      <span
        className={cn(
          'font-medium text-center line-clamp-2 leading-tight',
          config.name,
          categoryColor && !isOutOfStock ? 'text-white' : 'text-stone-900'
        )}
      >
        {label}
      </span>

      {/* Price */}
      {showPrice && (
        <span
          className={cn(
            'font-semibold mt-0.5',
            config.price,
            categoryColor && !isOutOfStock ? 'text-white/90' : 'text-amber-600'
          )}
        >
          {formatCurrency(price)}
        </span>
      )}

      {/* Out of Stock Badge */}
      {isOutOfStock && (
        <div
          className={cn(
            'absolute -top-1 -right-1 bg-red-500 text-white font-medium rounded shadow-sm',
            config.badge
          )}
        >
          Out of Stock
        </div>
      )}

      {/* Low Stock Badge */}
      {isLowStock && (
        <div
          className={cn(
            'absolute -top-1 -right-1 bg-amber-500 text-white font-medium rounded shadow-sm',
            config.badge
          )}
        >
          Low: {stockQuantity}
        </div>
      )}
    </button>
  )
}
```

**Step 2: Update barrel export**

Add to `packages/ui/src/pos/index.ts`:

```ts
export * from './pos-product-tile';
```

**Step 3: Commit**

```bash
git add packages/ui/src/pos/pos-product-tile.tsx packages/ui/src/pos/index.ts
git commit -m "feat(ui): add POSProductTile component with type indicators

- Supports small/medium/large tile sizes
- Shows variant/modifier icons
- Quick key star indicator
- Out of stock / low stock badges
- Category color backgrounds

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 3: QuickKeysBar Component

**Files:**
- Create: `packages/ui/src/pos/pos-quick-keys-bar.tsx`
- Modify: `packages/ui/src/pos/index.ts`

**Step 1: Create the quick keys bar component**

```tsx
'use client'

import * as React from 'react'
import { cn } from '../lib/utils'
import { POSProductTile, type ProductType } from './pos-product-tile'

export interface QuickKeyProduct {
  id: string
  name: string
  displayName?: string
  price: number
  imageUrl?: string
  productType: ProductType
  categoryColor?: string
}

export interface POSQuickKeysBarProps {
  products: QuickKeyProduct[]
  position?: 'top' | 'left'
  onProductClick: (product: QuickKeyProduct) => void
  className?: string
}

export function POSQuickKeysBar({
  products,
  position = 'top',
  onProductClick,
  className,
}: POSQuickKeysBarProps) {
  if (products.length === 0) return null

  const isHorizontal = position === 'top'

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-200',
        isHorizontal
          ? 'flex items-center gap-2 p-2 border-b overflow-x-auto'
          : 'flex flex-col gap-2 p-2 border-r w-24 overflow-y-auto',
        className
      )}
      role="toolbar"
      aria-label="Quick keys"
    >
      <span
        className={cn(
          'text-[10px] font-semibold text-amber-700 uppercase tracking-wider flex-shrink-0',
          isHorizontal ? 'px-1' : 'text-center py-1'
        )}
      >
        Quick
      </span>
      {products.map((product) => (
        <POSProductTile
          key={product.id}
          id={product.id}
          name={product.name}
          displayName={product.displayName}
          price={product.price}
          imageUrl={product.imageUrl}
          productType={product.productType}
          categoryColor={product.categoryColor}
          isQuickKey
          tileSize="small"
          showImage={false}
          showPrice={false}
          onClick={() => onProductClick(product)}
          className={cn(
            'flex-shrink-0',
            isHorizontal ? 'w-20' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}
```

**Step 2: Update barrel export**

Add to `packages/ui/src/pos/index.ts`:

```ts
export * from './pos-quick-keys-bar';
```

**Step 3: Commit**

```bash
git add packages/ui/src/pos/pos-quick-keys-bar.tsx packages/ui/src/pos/index.ts
git commit -m "feat(ui): add POSQuickKeysBar component

- Horizontal (top) or vertical (left) positioning
- Compact tile display for quick access
- Gradient background to distinguish from main grid

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 4: SmartSuggestionsRow Component

**Files:**
- Create: `packages/ui/src/pos/pos-suggestions-row.tsx`
- Modify: `packages/ui/src/pos/index.ts`

**Step 1: Create the suggestions row component**

```tsx
'use client'

import * as React from 'react'
import { cn } from '../lib/utils'
import { Sparkles, RefreshCw } from 'lucide-react'
import { POSProductTile, type ProductType } from './pos-product-tile'

export interface SuggestedProduct {
  id: string
  name: string
  price: number
  imageUrl?: string
  productType: ProductType
  categoryColor?: string
}

export interface POSSuggestionsRowProps {
  products: SuggestedProduct[]
  position?: 'top' | 'sidebar' | 'floating'
  onProductClick: (product: SuggestedProduct) => void
  onRefresh?: () => void
  isRefreshing?: boolean
  className?: string
}

export function POSSuggestionsRow({
  products,
  position = 'top',
  onProductClick,
  onRefresh,
  isRefreshing = false,
  className,
}: POSSuggestionsRowProps) {
  if (products.length === 0) return null

  const isSidebar = position === 'sidebar'
  const isFloating = position === 'floating'

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200',
        isSidebar
          ? 'flex flex-col gap-2 p-2 border-l w-28'
          : isFloating
            ? 'absolute right-4 top-4 p-3 rounded-xl shadow-lg border bg-white/95 backdrop-blur-sm'
            : 'flex items-center gap-2 p-2 border-b overflow-x-auto',
        className
      )}
      role="region"
      aria-label="Smart suggestions"
    >
      <div
        className={cn(
          'flex items-center gap-1 flex-shrink-0',
          isSidebar ? 'justify-center py-1' : 'px-1'
        )}
      >
        <Sparkles className="h-3 w-3 text-emerald-600" />
        <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
          Suggested
        </span>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="ml-1 p-0.5 rounded hover:bg-emerald-200/50 transition-colors"
            aria-label="Refresh suggestions"
          >
            <RefreshCw
              className={cn(
                'h-3 w-3 text-emerald-600',
                isRefreshing && 'animate-spin'
              )}
            />
          </button>
        )}
      </div>

      <div
        className={cn(
          'flex gap-2',
          isSidebar ? 'flex-col' : 'overflow-x-auto'
        )}
      >
        {products.map((product) => (
          <POSProductTile
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            imageUrl={product.imageUrl}
            productType={product.productType}
            categoryColor={product.categoryColor}
            tileSize="small"
            showImage={!isSidebar}
            onClick={() => onProductClick(product)}
            className={cn(
              'flex-shrink-0',
              isSidebar ? 'w-full' : 'w-20'
            )}
          />
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Update barrel export**

Add to `packages/ui/src/pos/index.ts`:

```ts
export * from './pos-suggestions-row';
```

**Step 3: Commit**

```bash
git add packages/ui/src/pos/pos-suggestions-row.tsx packages/ui/src/pos/index.ts
git commit -m "feat(ui): add POSSuggestionsRow component

- Top row, sidebar, or floating positions
- Refresh button with loading state
- Emerald gradient to distinguish from quick keys

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 5: CategoryNav Component

**Files:**
- Create: `packages/ui/src/pos/pos-category-nav.tsx`
- Modify: `packages/ui/src/pos/index.ts`

**Step 1: Create the category nav component**

```tsx
'use client'

import * as React from 'react'
import { cn } from '../lib/utils'
import { ChevronDown } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

export interface POSCategory {
  id: string
  name: string
  color?: string
  iconName?: string
  parentId?: string | null
}

export interface POSCategoryNavProps {
  categories: POSCategory[]
  selectedCategoryId?: string
  displayStyle?: 'tabs' | 'sidebar' | 'dropdown'
  showAllCategory?: boolean
  onCategoryChange: (categoryId: string | null) => void
  className?: string
}

function CategoryIcon({ iconName, className }: { iconName?: string; className?: string }) {
  if (!iconName || !(iconName in LucideIcons)) return null
  const Icon = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<{
    className?: string
  }>
  return <Icon className={className} />
}

function TabsNav({
  categories,
  selectedCategoryId,
  showAllCategory,
  onCategoryChange,
}: Omit<POSCategoryNavProps, 'displayStyle' | 'className'>) {
  const allCategories = showAllCategory
    ? [{ id: 'all', name: 'All', color: undefined, iconName: undefined }, ...categories]
    : categories

  return (
    <div
      className="flex items-center gap-1 overflow-x-auto px-3 py-2 bg-stone-50 border-b"
      role="tablist"
      aria-label="Product categories"
    >
      {allCategories.map((category) => {
        const isSelected =
          category.id === selectedCategoryId ||
          (category.id === 'all' && !selectedCategoryId)

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id === 'all' ? null : category.id)}
            role="tab"
            aria-selected={isSelected}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors',
              isSelected
                ? 'bg-amber-500 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            )}
            style={
              isSelected && category.color
                ? { backgroundColor: category.color }
                : undefined
            }
          >
            <CategoryIcon iconName={category.iconName} className="h-3.5 w-3.5" />
            {category.name}
          </button>
        )
      })}
    </div>
  )
}

function SidebarNav({
  categories,
  selectedCategoryId,
  showAllCategory,
  onCategoryChange,
}: Omit<POSCategoryNavProps, 'displayStyle' | 'className'>) {
  const allCategories = showAllCategory
    ? [{ id: 'all', name: 'All', color: undefined, iconName: undefined }, ...categories]
    : categories

  return (
    <div
      className="flex flex-col gap-1 p-2 bg-stone-50 border-r w-32 overflow-y-auto"
      role="tablist"
      aria-label="Product categories"
      aria-orientation="vertical"
    >
      {allCategories.map((category) => {
        const isSelected =
          category.id === selectedCategoryId ||
          (category.id === 'all' && !selectedCategoryId)

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id === 'all' ? null : category.id)}
            role="tab"
            aria-selected={isSelected}
            className={cn(
              'flex items-center gap-1.5 px-2 py-2 text-xs font-medium rounded-md transition-colors text-left',
              isSelected
                ? 'bg-amber-500 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100'
            )}
            style={
              isSelected && category.color
                ? { backgroundColor: category.color }
                : undefined
            }
          >
            <CategoryIcon iconName={category.iconName} className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{category.name}</span>
          </button>
        )
      })}
    </div>
  )
}

function DropdownNav({
  categories,
  selectedCategoryId,
  showAllCategory,
  onCategoryChange,
}: Omit<POSCategoryNavProps, 'displayStyle' | 'className'>) {
  const [isOpen, setIsOpen] = React.useState(false)
  const allCategories = showAllCategory
    ? [{ id: 'all', name: 'All', color: undefined, iconName: undefined }, ...categories]
    : categories

  const selectedCategory = allCategories.find(
    (c) => c.id === selectedCategoryId || (c.id === 'all' && !selectedCategoryId)
  )

  return (
    <div className="relative px-3 py-2 bg-stone-50 border-b">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full max-w-xs px-3 py-2 text-sm font-medium bg-white border border-stone-200 rounded-md hover:bg-stone-50"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <CategoryIcon iconName={selectedCategory?.iconName} className="h-4 w-4" />
          {selectedCategory?.name || 'Select category'}
        </span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute left-3 right-3 top-full mt-1 max-w-xs bg-white border border-stone-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {allCategories.map((category) => {
            const isSelected =
              category.id === selectedCategoryId ||
              (category.id === 'all' && !selectedCategoryId)

            return (
              <button
                key={category.id}
                onClick={() => {
                  onCategoryChange(category.id === 'all' ? null : category.id)
                  setIsOpen(false)
                }}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-stone-50',
                  isSelected && 'bg-amber-50 text-amber-700'
                )}
                role="option"
                aria-selected={isSelected}
              >
                <CategoryIcon iconName={category.iconName} className="h-4 w-4" />
                {category.name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function POSCategoryNav({
  categories,
  selectedCategoryId,
  displayStyle = 'tabs',
  showAllCategory = true,
  onCategoryChange,
  className,
}: POSCategoryNavProps) {
  const props = { categories, selectedCategoryId, showAllCategory, onCategoryChange }

  return (
    <div className={className}>
      {displayStyle === 'tabs' && <TabsNav {...props} />}
      {displayStyle === 'sidebar' && <SidebarNav {...props} />}
      {displayStyle === 'dropdown' && <DropdownNav {...props} />}
    </div>
  )
}
```

**Step 2: Update barrel export**

Add to `packages/ui/src/pos/index.ts`:

```ts
export * from './pos-category-nav';
```

**Step 3: Commit**

```bash
git add packages/ui/src/pos/pos-category-nav.tsx packages/ui/src/pos/index.ts
git commit -m "feat(ui): add POSCategoryNav component

- Three display modes: tabs, sidebar, dropdown
- Optional 'All' category
- Icon support via Lucide
- Category color highlights

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 6: VariantPickerModal Component

**Files:**
- Create: `packages/ui/src/pos/pos-variant-picker.tsx`
- Modify: `packages/ui/src/pos/index.ts`

**Step 1: Create the variant picker modal**

```tsx
'use client'

import * as React from 'react'
import { cn } from '../lib/utils'
import { X, Check, Package } from 'lucide-react'
import { Button } from '../primitives/button'

export interface ProductVariant {
  id: string
  name: string
  sku?: string
  priceAdjustment: number
  attributes?: Record<string, string>
  stockQuantity?: number
  imageUrl?: string
  isActive: boolean
}

export interface POSVariantPickerProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  productPrice: number
  productImageUrl?: string
  variants: ProductVariant[]
  onSelectVariant: (variant: ProductVariant) => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatPriceAdjustment(adjustment: number): string {
  if (adjustment === 0) return ''
  const sign = adjustment > 0 ? '+' : ''
  return ` (${sign}${formatCurrency(adjustment)})`
}

export function POSVariantPicker({
  isOpen,
  onClose,
  productName,
  productPrice,
  productImageUrl,
  variants,
  onSelectVariant,
}: POSVariantPickerProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  // Reset selection when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedId(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const selectedVariant = variants.find((v) => v.id === selectedId)
  const finalPrice = selectedVariant
    ? productPrice + selectedVariant.priceAdjustment
    : productPrice

  const handleConfirm = () => {
    if (selectedVariant) {
      onSelectVariant(selectedVariant)
      onClose()
    }
  }

  const activeVariants = variants.filter((v) => v.isActive)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="variant-picker-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center overflow-hidden">
              {productImageUrl ? (
                <img src={productImageUrl} alt={productName} className="w-full h-full object-cover" />
              ) : (
                <Package className="h-6 w-6 text-stone-400" />
              )}
            </div>
            <div>
              <h2 id="variant-picker-title" className="font-semibold text-stone-900">
                {productName}
              </h2>
              <p className="text-sm text-stone-500">Select a variant</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-stone-500" />
          </button>
        </div>

        {/* Variants List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeVariants.map((variant) => {
            const isSelected = variant.id === selectedId
            const isOutOfStock = variant.stockQuantity !== undefined && variant.stockQuantity <= 0
            const variantPrice = productPrice + variant.priceAdjustment

            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => !isOutOfStock && setSelectedId(variant.id)}
                disabled={isOutOfStock}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left',
                  isSelected
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-stone-200 hover:border-stone-300',
                  isOutOfStock && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="flex items-center gap-3">
                  {variant.imageUrl && (
                    <img
                      src={variant.imageUrl}
                      alt={variant.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-stone-900">
                      {variant.name}
                      {formatPriceAdjustment(variant.priceAdjustment)}
                    </p>
                    {variant.sku && (
                      <p className="text-xs text-stone-500">SKU: {variant.sku}</p>
                    )}
                    {isOutOfStock && (
                      <p className="text-xs text-red-500 font-medium">Out of Stock</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-900">
                    {formatCurrency(variantPrice)}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-stone-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-stone-600">Total</span>
            <span className="text-xl font-bold text-stone-900">
              {formatCurrency(finalPrice)}
            </span>
          </div>
          <Button
            onClick={handleConfirm}
            disabled={!selectedVariant}
            className="w-full bg-gradient-to-br from-amber-500 to-amber-600 text-white"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Update barrel export**

Add to `packages/ui/src/pos/index.ts`:

```ts
export * from './pos-variant-picker';
```

**Step 3: Commit**

```bash
git add packages/ui/src/pos/pos-variant-picker.tsx packages/ui/src/pos/index.ts
git commit -m "feat(ui): add POSVariantPicker modal

- Displays all active variants with prices
- Shows price adjustments (+ or -)
- Out of stock indication
- Accessible modal with keyboard support

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 7: ModifierModal Component

**Files:**
- Create: `packages/ui/src/pos/pos-modifier-modal.tsx`
- Modify: `packages/ui/src/pos/index.ts`

**Step 1: Create the modifier modal**

```tsx
'use client'

import * as React from 'react'
import { cn } from '../lib/utils'
import { X, Check, Minus, Plus } from 'lucide-react'
import { Button } from '../primitives/button'

export type ModifierSelectionType = 'SINGLE' | 'MULTIPLE'

export interface Modifier {
  id: string
  name: string
  priceAdjustment: number
  isDefault: boolean
  isActive: boolean
}

export interface ModifierGroup {
  id: string
  name: string
  selectionType: ModifierSelectionType
  minSelections: number
  maxSelections?: number
  isRequired: boolean
  modifiers: Modifier[]
}

export interface SelectedModifier {
  groupId: string
  modifierId: string
  name: string
  priceAdjustment: number
}

export interface POSModifierModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  basePrice: number
  modifierGroups: ModifierGroup[]
  onConfirm: (modifiers: SelectedModifier[]) => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatPriceAdjustment(adjustment: number): string {
  if (adjustment === 0) return ''
  const sign = adjustment > 0 ? '+' : ''
  return ` (${sign}${formatCurrency(adjustment)})`
}

export function POSModifierModal({
  isOpen,
  onClose,
  productName,
  basePrice,
  modifierGroups,
  onConfirm,
}: POSModifierModalProps) {
  const [selections, setSelections] = React.useState<Record<string, string[]>>({})

  // Initialize with defaults when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const defaults: Record<string, string[]> = {}
      modifierGroups.forEach((group) => {
        const defaultMods = group.modifiers
          .filter((m) => m.isDefault && m.isActive)
          .map((m) => m.id)
        if (defaultMods.length > 0) {
          defaults[group.id] = defaultMods
        }
      })
      setSelections(defaults)
    }
  }, [isOpen, modifierGroups])

  if (!isOpen) return null

  const toggleModifier = (groupId: string, modifierId: string, selectionType: ModifierSelectionType) => {
    setSelections((prev) => {
      const current = prev[groupId] || []

      if (selectionType === 'SINGLE') {
        // Radio behavior: replace selection
        return { ...prev, [groupId]: current.includes(modifierId) ? [] : [modifierId] }
      } else {
        // Checkbox behavior: toggle
        if (current.includes(modifierId)) {
          return { ...prev, [groupId]: current.filter((id) => id !== modifierId) }
        } else {
          const group = modifierGroups.find((g) => g.id === groupId)
          if (group?.maxSelections && current.length >= group.maxSelections) {
            return prev // At max
          }
          return { ...prev, [groupId]: [...current, modifierId] }
        }
      }
    })
  }

  // Calculate total price
  const modifierTotal = Object.entries(selections).reduce((total, [groupId, modifierIds]) => {
    const group = modifierGroups.find((g) => g.id === groupId)
    if (!group) return total
    return total + modifierIds.reduce((sum, modId) => {
      const mod = group.modifiers.find((m) => m.id === modId)
      return sum + (mod?.priceAdjustment || 0)
    }, 0)
  }, 0)
  const totalPrice = basePrice + modifierTotal

  // Validate required groups
  const isValid = modifierGroups.every((group) => {
    if (!group.isRequired) return true
    const selected = selections[group.id] || []
    return selected.length >= group.minSelections
  })

  const handleConfirm = () => {
    const selectedModifiers: SelectedModifier[] = []
    Object.entries(selections).forEach(([groupId, modifierIds]) => {
      const group = modifierGroups.find((g) => g.id === groupId)
      if (!group) return
      modifierIds.forEach((modId) => {
        const mod = group.modifiers.find((m) => m.id === modId)
        if (mod) {
          selectedModifiers.push({
            groupId,
            modifierId: mod.id,
            name: mod.name,
            priceAdjustment: mod.priceAdjustment,
          })
        }
      })
    })
    onConfirm(selectedModifiers)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modifier-modal-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 id="modifier-modal-title" className="font-semibold text-stone-900">
              Customize {productName}
            </h2>
            <p className="text-sm text-stone-500">Select your options</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-stone-500" />
          </button>
        </div>

        {/* Modifier Groups */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {modifierGroups.map((group) => {
            const selected = selections[group.id] || []
            const isSingle = group.selectionType === 'SINGLE'

            return (
              <div key={group.id}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-stone-900">
                    {group.name}
                    {group.isRequired && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  <span className="text-xs text-stone-500">
                    {isSingle
                      ? 'Choose one'
                      : group.maxSelections
                        ? `Choose up to ${group.maxSelections}`
                        : 'Choose any'}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.modifiers.filter((m) => m.isActive).map((modifier) => {
                    const isSelected = selected.includes(modifier.id)

                    return (
                      <button
                        key={modifier.id}
                        type="button"
                        onClick={() => toggleModifier(group.id, modifier.id, group.selectionType)}
                        className={cn(
                          'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left',
                          isSelected
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-stone-200 hover:border-stone-300'
                        )}
                      >
                        <span className="font-medium text-stone-900">
                          {modifier.name}
                          {formatPriceAdjustment(modifier.priceAdjustment)}
                        </span>
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                            isSelected
                              ? 'bg-amber-500 border-amber-500'
                              : 'border-stone-300'
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-stone-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-stone-600">Total</span>
            <span className="text-xl font-bold text-stone-900">
              {formatCurrency(totalPrice)}
            </span>
          </div>
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            className="w-full bg-gradient-to-br from-amber-500 to-amber-600 text-white"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Update barrel export**

Add to `packages/ui/src/pos/index.ts`:

```ts
export * from './pos-modifier-modal';
```

**Step 3: Commit**

```bash
git add packages/ui/src/pos/pos-modifier-modal.tsx packages/ui/src/pos/index.ts
git commit -m "feat(ui): add POSModifierModal component

- Single selection (radio) and multiple selection (checkbox) modes
- Required group validation
- Max selections limit
- Default modifier pre-selection
- Price adjustment display

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 8: POSProductPanel Main Component

**Files:**
- Create: `packages/ui/src/pos/pos-product-panel.tsx`
- Modify: `packages/ui/src/pos/index.ts`

**Step 1: Create the main product panel component**

```tsx
'use client'

import * as React from 'react'
import { cn } from '../lib/utils'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '../primitives/input'
import { Button } from '../primitives/button'
import { POSProductTile, type ProductType } from './pos-product-tile'
import { POSQuickKeysBar, type QuickKeyProduct } from './pos-quick-keys-bar'
import { POSSuggestionsRow, type SuggestedProduct } from './pos-suggestions-row'
import { POSCategoryNav, type POSCategory } from './pos-category-nav'
import { POSVariantPicker, type ProductVariant } from './pos-variant-picker'
import { POSModifierModal, type ModifierGroup, type SelectedModifier } from './pos-modifier-modal'

// ============================================================================
// Types
// ============================================================================

export interface POSProduct {
  id: string
  name: string
  displayName?: string
  sku?: string
  productType: ProductType
  price: number
  imageUrl?: string
  categoryId: string
  categoryColor?: string
  inStock?: boolean
  stockQuantity?: number
  lowStockThreshold?: number
  variants?: ProductVariant[]
  modifierGroups?: ModifierGroup[]
  isQuickKey?: boolean
}

export interface GridConfig {
  gridColumns: number
  gridRows: number
  tileSize: 'small' | 'medium' | 'large'
  showImages: boolean
  showPrices: boolean
  categoryStyle: 'tabs' | 'sidebar' | 'dropdown'
  showAllCategory: boolean
  quickKeysEnabled: boolean
  quickKeysCount: number
  quickKeysPosition: 'top' | 'left'
}

export interface POSProductPanelProps {
  config: GridConfig
  categories: POSCategory[]
  products: POSProduct[]
  quickKeys?: QuickKeyProduct[]
  suggestions?: SuggestedProduct[]
  onAddToCart: (
    product: POSProduct,
    variant?: ProductVariant,
    modifiers?: SelectedModifier[]
  ) => void
  onRefreshSuggestions?: () => void
  isSuggestionsRefreshing?: boolean
  className?: string
}

// ============================================================================
// Main Component
// ============================================================================

export function POSProductPanel({
  config,
  categories,
  products,
  quickKeys = [],
  suggestions = [],
  onAddToCart,
  onRefreshSuggestions,
  isSuggestionsRefreshing = false,
  className,
}: POSProductPanelProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)

  // Modal state
  const [variantPickerProduct, setVariantPickerProduct] = React.useState<POSProduct | null>(null)
  const [modifierProduct, setModifierProduct] = React.useState<{
    product: POSProduct
    variant?: ProductVariant
  } | null>(null)

  // Items per page based on grid config
  const itemsPerPage = config.gridColumns * config.gridRows

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategoryId])

  // Filter products
  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategoryId && product.categoryId !== selectedCategoryId) {
        return false
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = product.name.toLowerCase().includes(query)
        const matchesDisplayName = product.displayName?.toLowerCase().includes(query)
        const matchesSku = product.sku?.toLowerCase().includes(query)
        return matchesName || matchesDisplayName || matchesSku
      }
      return true
    })
  }, [products, selectedCategoryId, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProducts, currentPage, itemsPerPage])

  // Handle product click
  const handleProductClick = (product: POSProduct) => {
    const hasVariants = product.productType === 'VARIABLE' && product.variants && product.variants.length > 0
    const hasModifiers = product.modifierGroups && product.modifierGroups.length > 0

    if (hasVariants) {
      setVariantPickerProduct(product)
    } else if (hasModifiers) {
      setModifierProduct({ product })
    } else {
      onAddToCart(product)
    }
  }

  // Handle variant selection
  const handleVariantSelect = (variant: ProductVariant) => {
    if (!variantPickerProduct) return

    const hasModifiers =
      variantPickerProduct.modifierGroups && variantPickerProduct.modifierGroups.length > 0

    if (hasModifiers) {
      setModifierProduct({ product: variantPickerProduct, variant })
    } else {
      onAddToCart(variantPickerProduct, variant)
    }
    setVariantPickerProduct(null)
  }

  // Handle modifier confirmation
  const handleModifierConfirm = (modifiers: SelectedModifier[]) => {
    if (!modifierProduct) return
    onAddToCart(modifierProduct.product, modifierProduct.variant, modifiers)
    setModifierProduct(null)
  }

  // Handle quick key / suggestion click
  const handleQuickProductClick = (product: QuickKeyProduct | SuggestedProduct) => {
    const fullProduct = products.find((p) => p.id === product.id)
    if (fullProduct) {
      handleProductClick(fullProduct)
    }
  }

  const isSidebarCategory = config.categoryStyle === 'sidebar'
  const isSidebarQuickKeys = config.quickKeysPosition === 'left'

  return (
    <div className={cn('flex flex-col min-h-0 bg-white rounded-lg border', className)}>
      {/* Top Quick Keys (if enabled and position is top) */}
      {config.quickKeysEnabled && !isSidebarQuickKeys && quickKeys.length > 0 && (
        <POSQuickKeysBar
          products={quickKeys}
          position="top"
          onProductClick={handleQuickProductClick}
        />
      )}

      {/* Smart Suggestions Row */}
      {suggestions.length > 0 && (
        <POSSuggestionsRow
          products={suggestions}
          position="top"
          onProductClick={handleQuickProductClick}
          onRefresh={onRefreshSuggestions}
          isRefreshing={isSuggestionsRefreshing}
        />
      )}

      {/* Search Bar */}
      <div className="px-3 py-2 border-b flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm bg-stone-50 border-stone-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 min-h-0">
        {/* Left Quick Keys (if enabled and position is left) */}
        {config.quickKeysEnabled && isSidebarQuickKeys && quickKeys.length > 0 && (
          <POSQuickKeysBar
            products={quickKeys}
            position="left"
            onProductClick={handleQuickProductClick}
          />
        )}

        {/* Sidebar Category Nav (if style is sidebar) */}
        {isSidebarCategory && (
          <POSCategoryNav
            categories={categories}
            selectedCategoryId={selectedCategoryId || undefined}
            displayStyle="sidebar"
            showAllCategory={config.showAllCategory}
            onCategoryChange={setSelectedCategoryId}
          />
        )}

        {/* Main grid area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Tabs/Dropdown Category Nav */}
          {!isSidebarCategory && (
            <POSCategoryNav
              categories={categories}
              selectedCategoryId={selectedCategoryId || undefined}
              displayStyle={config.categoryStyle}
              showAllCategory={config.showAllCategory}
              onCategoryChange={setSelectedCategoryId}
            />
          )}

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-3">
            {paginatedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <p className="text-stone-600 font-medium text-sm">No products found</p>
                <p className="text-xs text-stone-500 mt-1">
                  {searchQuery ? 'Try adjusting your search' : 'No products in this category'}
                </p>
              </div>
            ) : (
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${config.gridColumns}, minmax(0, 1fr))`,
                }}
              >
                {paginatedProducts.map((product) => (
                  <POSProductTile
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    displayName={product.displayName}
                    price={product.price}
                    imageUrl={product.imageUrl}
                    productType={product.productType}
                    categoryColor={product.categoryColor}
                    inStock={product.inStock}
                    stockQuantity={product.stockQuantity}
                    lowStockThreshold={product.lowStockThreshold}
                    hasVariants={product.productType === 'VARIABLE' && (product.variants?.length ?? 0) > 0}
                    hasModifiers={(product.modifierGroups?.length ?? 0) > 0}
                    isQuickKey={product.isQuickKey}
                    tileSize={config.tileSize}
                    showImage={config.showImages}
                    showPrice={config.showPrices}
                    onClick={() => handleProductClick(product)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 border-t bg-stone-50 flex-shrink-0">
              <span className="text-xs text-stone-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-7 w-7"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-7 w-7"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Variant Picker Modal */}
      <POSVariantPicker
        isOpen={!!variantPickerProduct}
        onClose={() => setVariantPickerProduct(null)}
        productName={variantPickerProduct?.name || ''}
        productPrice={variantPickerProduct?.price || 0}
        productImageUrl={variantPickerProduct?.imageUrl}
        variants={variantPickerProduct?.variants || []}
        onSelectVariant={handleVariantSelect}
      />

      {/* Modifier Modal */}
      <POSModifierModal
        isOpen={!!modifierProduct}
        onClose={() => setModifierProduct(null)}
        productName={modifierProduct?.product.name || ''}
        basePrice={
          (modifierProduct?.product.price || 0) +
          (modifierProduct?.variant?.priceAdjustment || 0)
        }
        modifierGroups={modifierProduct?.product.modifierGroups || []}
        onConfirm={handleModifierConfirm}
      />
    </div>
  )
}
```

**Step 2: Update barrel export**

Add to `packages/ui/src/pos/index.ts`:

```ts
export * from './pos-product-panel';
```

**Step 3: Commit**

```bash
git add packages/ui/src/pos/pos-product-panel.tsx packages/ui/src/pos/index.ts
git commit -m "feat(ui): add POSProductPanel main component

- Composes all sub-components: tiles, quick keys, suggestions, nav
- Configurable grid layout (columns, rows, tile size)
- Three category display modes (tabs, sidebar, dropdown)
- Variant picker and modifier modal integration
- Search and pagination

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: Admin Template Editor

### Task 9: Grid Preview Component

**Files:**
- Create: `packages/ui/src/pos/pos-grid-preview.tsx`
- Modify: `packages/ui/src/pos/index.ts`

**Step 1: Create the grid preview component**

```tsx
'use client'

import * as React from 'react'
import { cn } from '../lib/utils'

export interface POSGridPreviewProps {
  columns: number
  rows: number
  tileSize: 'small' | 'medium' | 'large'
  showImages: boolean
  showPrices: boolean
  quickKeysEnabled: boolean
  quickKeysPosition: 'top' | 'left'
  quickKeysCount: number
  suggestionsEnabled: boolean
  categoryStyle: 'tabs' | 'sidebar' | 'dropdown'
  className?: string
}

const tileSizeMap = {
  small: { width: 40, height: 48 },
  medium: { width: 56, height: 64 },
  large: { width: 72, height: 80 },
}

const sampleColors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4']

export function POSGridPreview({
  columns,
  rows,
  tileSize,
  showImages,
  showPrices,
  quickKeysEnabled,
  quickKeysPosition,
  quickKeysCount,
  suggestionsEnabled,
  categoryStyle,
  className,
}: POSGridPreviewProps) {
  const { width: tileWidth, height: tileHeight } = tileSizeMap[tileSize]
  const gridWidth = columns * (tileWidth + 4) + 8
  const gridHeight = rows * (tileHeight + 4) + 8

  const tiles = Array.from({ length: columns * rows }, (_, i) => i)
  const quickKeyTiles = Array.from({ length: quickKeysCount }, (_, i) => i)

  return (
    <div
      className={cn(
        'bg-white border-2 border-dashed border-stone-300 rounded-lg p-2 inline-block',
        className
      )}
    >
      {/* Container layout */}
      <div className="flex flex-col gap-1">
        {/* Top Quick Keys */}
        {quickKeysEnabled && quickKeysPosition === 'top' && (
          <div className="flex gap-1 p-1 bg-amber-50 rounded border border-amber-200">
            <span className="text-[8px] text-amber-600 font-medium px-1">QK</span>
            {quickKeyTiles.slice(0, Math.min(quickKeysCount, 6)).map((i) => (
              <div
                key={i}
                className="w-6 h-4 bg-amber-200 rounded text-[6px] flex items-center justify-center text-amber-700"
              >
                {i + 1}
              </div>
            ))}
          </div>
        )}

        {/* Suggestions Row */}
        {suggestionsEnabled && (
          <div className="flex gap-1 p-1 bg-emerald-50 rounded border border-emerald-200">
            <span className="text-[8px] text-emerald-600 font-medium px-1">AI</span>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-6 h-4 bg-emerald-200 rounded"
              />
            ))}
          </div>
        )}

        {/* Category tabs */}
        {categoryStyle === 'tabs' && (
          <div className="flex gap-1 p-1 bg-stone-100 rounded">
            <div className="px-2 py-0.5 bg-amber-500 rounded text-[8px] text-white">All</div>
            <div className="px-2 py-0.5 bg-white rounded text-[8px] text-stone-500">Cat 1</div>
            <div className="px-2 py-0.5 bg-white rounded text-[8px] text-stone-500">Cat 2</div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex gap-1">
          {/* Left Quick Keys */}
          {quickKeysEnabled && quickKeysPosition === 'left' && (
            <div className="flex flex-col gap-1 p-1 bg-amber-50 rounded border border-amber-200">
              <span className="text-[8px] text-amber-600 font-medium text-center">QK</span>
              {quickKeyTiles.slice(0, Math.min(quickKeysCount, 4)).map((i) => (
                <div
                  key={i}
                  className="w-4 h-6 bg-amber-200 rounded"
                />
              ))}
            </div>
          )}

          {/* Sidebar categories */}
          {categoryStyle === 'sidebar' && (
            <div className="flex flex-col gap-1 p-1 bg-stone-100 rounded w-12">
              <div className="px-1 py-0.5 bg-amber-500 rounded text-[6px] text-white truncate">All</div>
              <div className="px-1 py-0.5 bg-white rounded text-[6px] text-stone-500 truncate">Cat 1</div>
              <div className="px-1 py-0.5 bg-white rounded text-[6px] text-stone-500 truncate">Cat 2</div>
            </div>
          )}

          {/* Product grid */}
          <div
            className="grid gap-1 p-1 bg-stone-50 rounded"
            style={{
              gridTemplateColumns: `repeat(${columns}, ${tileWidth}px)`,
              gridTemplateRows: `repeat(${rows}, ${tileHeight}px)`,
            }}
          >
            {tiles.map((i) => {
              const color = sampleColors[i % sampleColors.length]
              return (
                <div
                  key={i}
                  className="rounded border border-stone-200 flex flex-col items-center justify-center p-0.5"
                  style={{ backgroundColor: `${color}20` }}
                >
                  {showImages && (
                    <div
                      className="rounded bg-white/50 mb-0.5"
                      style={{ width: tileWidth * 0.4, height: tileWidth * 0.4 }}
                    />
                  )}
                  <div
                    className="bg-stone-300 rounded"
                    style={{ width: tileWidth * 0.6, height: 4 }}
                  />
                  {showPrices && (
                    <div
                      className="bg-amber-300 rounded mt-0.5"
                      style={{ width: tileWidth * 0.4, height: 3 }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Dropdown indicator */}
        {categoryStyle === 'dropdown' && (
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded">
            <div className="px-2 py-0.5 bg-white rounded text-[8px] text-stone-600 border flex items-center gap-1">
              All Categories
              <span className="text-[6px]">▼</span>
            </div>
          </div>
        )}
      </div>

      {/* Dimensions label */}
      <div className="mt-2 text-center text-[10px] text-stone-400">
        {columns} × {rows} grid ({tileSize})
      </div>
    </div>
  )
}
```

**Step 2: Update barrel export**

Add to `packages/ui/src/pos/index.ts`:

```ts
export * from './pos-grid-preview';
```

**Step 3: Commit**

```bash
git add packages/ui/src/pos/pos-grid-preview.tsx packages/ui/src/pos/index.ts
git commit -m "feat(ui): add POSGridPreview component

- Scaled-down preview of grid configuration
- Shows quick keys, suggestions, category nav
- Visual representation of tile sizes
- Updates in real-time with config changes

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 10: Template Editor Modal Component

**Files:**
- Create: `apps/application/src/components/pos/template-editor-modal.tsx`

**Step 1: Create the template editor modal**

```tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Slider,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@clubvantage/ui'
import { POSGridPreview } from '@clubvantage/ui/pos'
import { Loader2 } from 'lucide-react'

export interface TemplateConfig {
  name: string
  description: string
  outletType: string
  gridColumns: number
  gridRows: number
  tileSize: 'small' | 'medium' | 'large'
  showImages: boolean
  showPrices: boolean
  categoryStyle: 'tabs' | 'sidebar' | 'dropdown'
  showAllCategory: boolean
  quickKeysEnabled: boolean
  quickKeysPosition: 'top' | 'left'
  quickKeysCount: number
  suggestionsEnabled: boolean
  suggestionsPosition: 'top' | 'sidebar' | 'floating'
  suggestionsCount: number
  timeOfDayWeight: number
  salesVelocityWeight: number
  staffHistoryWeight: number
}

export interface TemplateEditorModalProps {
  isOpen: boolean
  onClose: () => void
  template?: TemplateConfig | null
  onSave: (config: TemplateConfig) => Promise<void>
  isSaving?: boolean
}

const defaultConfig: TemplateConfig = {
  name: '',
  description: '',
  outletType: 'PROSHOP',
  gridColumns: 6,
  gridRows: 4,
  tileSize: 'medium',
  showImages: true,
  showPrices: true,
  categoryStyle: 'tabs',
  showAllCategory: true,
  quickKeysEnabled: true,
  quickKeysPosition: 'top',
  quickKeysCount: 8,
  suggestionsEnabled: true,
  suggestionsPosition: 'top',
  suggestionsCount: 6,
  timeOfDayWeight: 40,
  salesVelocityWeight: 35,
  staffHistoryWeight: 25,
}

const outletTypes = [
  { value: 'PROSHOP', label: 'Pro Shop' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'BAR', label: 'Bar' },
  { value: 'SPA', label: 'Spa' },
  { value: 'FITNESS', label: 'Fitness Center' },
  { value: 'TENNIS', label: 'Tennis Shop' },
]

export function TemplateEditorModal({
  isOpen,
  onClose,
  template,
  onSave,
  isSaving = false,
}: TemplateEditorModalProps) {
  const [config, setConfig] = React.useState<TemplateConfig>(defaultConfig)
  const [activeTab, setActiveTab] = React.useState('general')

  // Reset config when template changes
  React.useEffect(() => {
    if (isOpen) {
      setConfig(template || defaultConfig)
      setActiveTab('general')
    }
  }, [isOpen, template])

  const updateConfig = <K extends keyof TemplateConfig>(
    key: K,
    value: TemplateConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  // Keep weights summing to 100
  const updateWeight = (key: 'timeOfDayWeight' | 'salesVelocityWeight' | 'staffHistoryWeight', value: number) => {
    const others = ['timeOfDayWeight', 'salesVelocityWeight', 'staffHistoryWeight'].filter(k => k !== key) as typeof key[]
    const remaining = 100 - value
    const currentOthersTotal = others.reduce((sum, k) => sum + config[k], 0)

    if (currentOthersTotal === 0) {
      // Distribute equally
      setConfig(prev => ({
        ...prev,
        [key]: value,
        [others[0]]: Math.floor(remaining / 2),
        [others[1]]: remaining - Math.floor(remaining / 2),
      }))
    } else {
      // Proportionally adjust others
      setConfig(prev => ({
        ...prev,
        [key]: value,
        [others[0]]: Math.round((prev[others[0]] / currentOthersTotal) * remaining),
        [others[1]]: remaining - Math.round((prev[others[0]] / currentOthersTotal) * remaining),
      }))
    }
  }

  const handleSave = async () => {
    await onSave(config)
  }

  const isValid = config.name.trim().length > 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template' : 'Create Template'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="grid">Grid Layout</TabsTrigger>
            <TabsTrigger value="quickkeys">Quick Keys</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            {/* General Tab */}
            <TabsContent value="general" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={config.name}
                  onChange={(e) => updateConfig('name', e.target.value)}
                  placeholder="e.g., Pro Shop Standard"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={(e) => updateConfig('description', e.target.value)}
                  placeholder="Optional description of this template"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outletType">Outlet Type</Label>
                <Select
                  value={config.outletType}
                  onValueChange={(v) => updateConfig('outletType', v)}
                >
                  <SelectTrigger id="outletType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {outletTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Grid Layout Tab */}
            <TabsContent value="grid" className="mt-0">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Columns: {config.gridColumns}</Label>
                    <Slider
                      value={[config.gridColumns]}
                      onValueChange={([v]) => updateConfig('gridColumns', v)}
                      min={4}
                      max={8}
                      step={1}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Rows: {config.gridRows}</Label>
                    <Slider
                      value={[config.gridRows]}
                      onValueChange={([v]) => updateConfig('gridRows', v)}
                      min={3}
                      max={6}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tile Size</Label>
                    <div className="flex gap-2">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <Button
                          key={size}
                          type="button"
                          variant={config.tileSize === size ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateConfig('tileSize', size)}
                          className={config.tileSize === size ? 'bg-amber-500 hover:bg-amber-600' : ''}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Category Display</Label>
                    <div className="flex gap-2">
                      {(['tabs', 'sidebar', 'dropdown'] as const).map((style) => (
                        <Button
                          key={style}
                          type="button"
                          variant={config.categoryStyle === style ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateConfig('categoryStyle', style)}
                          className={config.categoryStyle === style ? 'bg-amber-500 hover:bg-amber-600' : ''}
                        >
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Show Images</Label>
                    <Switch
                      checked={config.showImages}
                      onCheckedChange={(v) => updateConfig('showImages', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Show Prices</Label>
                    <Switch
                      checked={config.showPrices}
                      onCheckedChange={(v) => updateConfig('showPrices', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Show "All" Category</Label>
                    <Switch
                      checked={config.showAllCategory}
                      onCheckedChange={(v) => updateConfig('showAllCategory', v)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <POSGridPreview
                    columns={config.gridColumns}
                    rows={config.gridRows}
                    tileSize={config.tileSize}
                    showImages={config.showImages}
                    showPrices={config.showPrices}
                    quickKeysEnabled={config.quickKeysEnabled}
                    quickKeysPosition={config.quickKeysPosition}
                    quickKeysCount={config.quickKeysCount}
                    suggestionsEnabled={config.suggestionsEnabled}
                    categoryStyle={config.categoryStyle}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Quick Keys Tab */}
            <TabsContent value="quickkeys" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Quick Keys</Label>
                  <p className="text-sm text-stone-500">
                    Show quick access buttons for popular items
                  </p>
                </div>
                <Switch
                  checked={config.quickKeysEnabled}
                  onCheckedChange={(v) => updateConfig('quickKeysEnabled', v)}
                />
              </div>

              {config.quickKeysEnabled && (
                <>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <div className="flex gap-2">
                      {(['top', 'left'] as const).map((pos) => (
                        <Button
                          key={pos}
                          type="button"
                          variant={config.quickKeysPosition === pos ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateConfig('quickKeysPosition', pos)}
                          className={config.quickKeysPosition === pos ? 'bg-amber-500 hover:bg-amber-600' : ''}
                        >
                          {pos === 'top' ? 'Top (Horizontal)' : 'Left (Vertical)'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Number of Quick Keys: {config.quickKeysCount}</Label>
                    <Slider
                      value={[config.quickKeysCount]}
                      onValueChange={([v]) => updateConfig('quickKeysCount', v)}
                      min={6}
                      max={12}
                      step={1}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            {/* Suggestions Tab */}
            <TabsContent value="suggestions" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Smart Suggestions</Label>
                  <p className="text-sm text-stone-500">
                    AI-powered product recommendations
                  </p>
                </div>
                <Switch
                  checked={config.suggestionsEnabled}
                  onCheckedChange={(v) => updateConfig('suggestionsEnabled', v)}
                />
              </div>

              {config.suggestionsEnabled && (
                <>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <div className="flex gap-2">
                      {(['top', 'sidebar', 'floating'] as const).map((pos) => (
                        <Button
                          key={pos}
                          type="button"
                          variant={config.suggestionsPosition === pos ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateConfig('suggestionsPosition', pos)}
                          className={config.suggestionsPosition === pos ? 'bg-amber-500 hover:bg-amber-600' : ''}
                        >
                          {pos.charAt(0).toUpperCase() + pos.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Number of Suggestions: {config.suggestionsCount}</Label>
                    <Slider
                      value={[config.suggestionsCount]}
                      onValueChange={([v]) => updateConfig('suggestionsCount', v)}
                      min={4}
                      max={8}
                      step={1}
                    />
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <Label>Algorithm Weights (must sum to 100%)</Label>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Time of Day</span>
                        <span className="text-sm font-medium">{config.timeOfDayWeight}%</span>
                      </div>
                      <Slider
                        value={[config.timeOfDayWeight]}
                        onValueChange={([v]) => updateWeight('timeOfDayWeight', v)}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Sales Velocity</span>
                        <span className="text-sm font-medium">{config.salesVelocityWeight}%</span>
                      </div>
                      <Slider
                        value={[config.salesVelocityWeight]}
                        onValueChange={([v]) => updateWeight('salesVelocityWeight', v)}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Staff History</span>
                        <span className="text-sm font-medium">{config.staffHistoryWeight}%</span>
                      </div>
                      <Slider
                        value={[config.staffHistoryWeight]}
                        onValueChange={([v]) => updateWeight('staffHistoryWeight', v)}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {template ? 'Save Changes' : 'Create Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/pos/template-editor-modal.tsx
git commit -m "feat(app): add TemplateEditorModal component

- Four tabs: General, Grid Layout, Quick Keys, Suggestions
- Live grid preview updates as settings change
- Algorithm weight sliders that sum to 100%
- Supports create and edit modes

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 11: Update Templates Page with Editor

**Files:**
- Modify: `apps/application/src/app/(dashboard)/pos/templates/page.tsx`

**Step 1: Update the templates page**

Replace the file content with the enhanced version that includes the editor modal integration. The page should:
- Import and use the `TemplateEditorModal` component
- Add state for `editingTemplate` and `isEditorOpen`
- Wire up the Create, Edit, and Delete handlers
- Use the `useUpsertPosTemplateMutation` for save operations

**Step 2: Commit**

```bash
git add apps/application/src/app/(dashboard)/pos/templates/page.tsx
git commit -m "feat(app): integrate template editor into templates page

- Add create/edit modal functionality
- Wire up save mutations
- Add delete confirmation

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: Admin Outlet Config

### Task 12: Visibility Rules Builder Component

**Files:**
- Create: `packages/ui/src/pos/pos-visibility-rules.tsx`
- Modify: `packages/ui/src/pos/index.ts`

**Step 1: Create the visibility rules component**

This component provides a form for building visibility rules including:
- Time rules (start/end time, days of week)
- Role rules (allowed/denied roles)
- Inventory rule dropdown
- Member-only checkbox

**Step 2: Update barrel export**

**Step 3: Commit**

```bash
git add packages/ui/src/pos/pos-visibility-rules.tsx packages/ui/src/pos/index.ts
git commit -m "feat(ui): add POSVisibilityRulesBuilder component

- Time-based rules with day-of-week selection
- Role-based rules with allow/deny lists
- Inventory visibility options
- Member-only toggle

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 13: Outlet Config Page

**Files:**
- Create: `apps/application/src/app/(dashboard)/pos/outlets/[id]/page.tsx`

**Step 1: Create the outlet config page**

This page provides:
- Products tab with category tree, draggable grid, detail panel
- Categories tab with reordering
- Grid Overrides tab
- Visibility Rules bulk editor tab

**Step 2: Commit**

```bash
git add "apps/application/src/app/(dashboard)/pos/outlets/[id]/page.tsx"
git commit -m "feat(app): add outlet config page

- Products tab with category tree and product grid
- Product detail panel with visibility rules
- Categories tab with drag-drop reordering
- Grid overrides with template inheritance

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 14: Integration - Wire POS Sales Page

**Files:**
- Modify: `apps/application/src/components/golf/golf-pos-wrapper.tsx` (or create new POS integration component)

**Step 1: Create hook for product panel data**

Create a custom hook that fetches all product panel data and provides the `onAddToCart` handler.

**Step 2: Replace mock data with API data**

Update the POS sales page to use the new `POSProductPanel` component with real data from the API.

**Step 3: Commit**

```bash
git add apps/application/src/components/pos/use-product-panel.ts
git add apps/application/src/app/(dashboard)/golf/pos/page.tsx
git commit -m "feat(app): integrate POSProductPanel with API

- Add useProductPanel hook for data fetching
- Replace mock product grid with POSProductPanel
- Wire up add-to-cart flow with variants/modifiers

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 15: Final Testing and Cleanup

**Step 1: Run type check**

```bash
pnpm --filter @clubvantage/ui run typecheck
pnpm --filter @clubvantage/application run typecheck
```

**Step 2: Run linter**

```bash
pnpm --filter @clubvantage/ui run lint
pnpm --filter @clubvantage/application run lint
```

**Step 3: Fix any issues**

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: fix lint and type errors

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Success Criteria

1. **Staff efficiency**: Find and add any product in <3 taps
2. **Quick keys**: One-tap access to top 8-12 items
3. **Smart suggestions**: Relevant items shown with AI recommendations
4. **Admin self-service**: Managers can configure layouts without developer help
5. **Template inheritance**: Changes to template cascade to outlets using defaults
6. **Visibility rules**: Rules apply correctly (time, role, inventory)
7. **Performance**: Grid loads quickly with proper data fetching

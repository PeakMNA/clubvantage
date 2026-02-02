'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { POSProductTile, type ProductType } from './pos-product-tile'
import { POSQuickKeysBar, type QuickKeyProduct } from './pos-quick-keys-bar'
import { POSSuggestionsRow, type SuggestedProduct } from './pos-suggestions-row'
import { POSCategoryNav, type POSCategory } from './pos-category-nav'
import { POSVariantPicker, type ProductVariant } from './pos-variant-picker'
import {
  POSModifierModal,
  type ModifierGroup,
  type SelectedModifier,
} from './pos-modifier-modal'
import { Input } from '../primitives/input'
import { Button } from '../primitives/button'
import { cn } from '../lib/utils'

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
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [variantPickerProduct, setVariantPickerProduct] =
    useState<POSProduct | null>(null)
  const [modifierProduct, setModifierProduct] = useState<{
    product: POSProduct
    variant?: ProductVariant
  } | null>(null)

  // Calculate items per page
  const itemsPerPage = config.gridColumns * config.gridRows

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter by category
      if (selectedCategoryId && product.categoryId !== selectedCategoryId) {
        return false
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = product.name.toLowerCase().includes(query)
        const matchesDisplayName = product.displayName
          ?.toLowerCase()
          .includes(query)
        const matchesSku = product.sku?.toLowerCase().includes(query)

        if (!matchesName && !matchesDisplayName && !matchesSku) {
          return false
        }
      }

      return true
    })
  }, [products, selectedCategoryId, searchQuery])

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProducts, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategoryId, searchQuery])

  // Handle product click - check for variants, then modifiers, then add to cart
  const handleProductClick = useCallback(
    (product: POSProduct) => {
      // Check if product is VARIABLE type with variants
      if (
        product.productType === 'VARIABLE' &&
        product.variants &&
        product.variants.length > 0
      ) {
        setVariantPickerProduct(product)
        return
      }

      // Check if product has modifier groups
      if (product.modifierGroups && product.modifierGroups.length > 0) {
        setModifierProduct({ product })
        return
      }

      // No variants or modifiers, add directly to cart
      onAddToCart(product)
    },
    [onAddToCart]
  )

  // Handle variant selection
  const handleVariantSelect = useCallback(
    (variant: ProductVariant) => {
      if (!variantPickerProduct) return

      // Check if product has modifier groups
      if (
        variantPickerProduct.modifierGroups &&
        variantPickerProduct.modifierGroups.length > 0
      ) {
        setModifierProduct({ product: variantPickerProduct, variant })
        setVariantPickerProduct(null)
        return
      }

      // No modifiers, add to cart with variant
      onAddToCart(variantPickerProduct, variant)
      setVariantPickerProduct(null)
    },
    [variantPickerProduct, onAddToCart]
  )

  // Handle modifier confirmation
  const handleModifierConfirm = useCallback(
    (modifiers: SelectedModifier[]) => {
      if (!modifierProduct) return

      onAddToCart(modifierProduct.product, modifierProduct.variant, modifiers)
      setModifierProduct(null)
    },
    [modifierProduct, onAddToCart]
  )

  // Handle quick key click - find full product and use same flow
  const handleQuickKeyClick = useCallback(
    (quickKey: QuickKeyProduct) => {
      const fullProduct = products.find((p) => p.id === quickKey.id)
      if (fullProduct) {
        handleProductClick(fullProduct)
      } else {
        // Fallback: create a minimal product from quick key data
        const minimalProduct: POSProduct = {
          id: quickKey.id,
          name: quickKey.name,
          displayName: quickKey.displayName,
          price: quickKey.price,
          imageUrl: quickKey.imageUrl,
          productType: quickKey.productType,
          categoryId: '',
          categoryColor: quickKey.categoryColor,
        }
        onAddToCart(minimalProduct)
      }
    },
    [products, handleProductClick, onAddToCart]
  )

  // Handle suggestion click - find full product and use same flow
  const handleSuggestionClick = useCallback(
    (suggestion: SuggestedProduct) => {
      const fullProduct = products.find((p) => p.id === suggestion.id)
      if (fullProduct) {
        handleProductClick(fullProduct)
      } else {
        // Fallback: create a minimal product from suggestion data
        const minimalProduct: POSProduct = {
          id: suggestion.id,
          name: suggestion.name,
          price: suggestion.price,
          imageUrl: suggestion.imageUrl,
          productType: suggestion.productType,
          categoryId: '',
          categoryColor: suggestion.categoryColor,
        }
        onAddToCart(minimalProduct)
      }
    },
    [products, handleProductClick, onAddToCart]
  )

  // Handle category change
  const handleCategoryChange = useCallback((categoryId: string | null) => {
    setSelectedCategoryId(categoryId)
  }, [])

  // Pagination handlers
  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }, [totalPages])

  // Determine quick keys to display
  const displayedQuickKeys = config.quickKeysEnabled
    ? quickKeys.slice(0, config.quickKeysCount)
    : []

  const showQuickKeysTop =
    config.quickKeysEnabled &&
    config.quickKeysPosition === 'top' &&
    displayedQuickKeys.length > 0
  const showQuickKeysLeft =
    config.quickKeysEnabled &&
    config.quickKeysPosition === 'left' &&
    displayedQuickKeys.length > 0
  const showSuggestions = suggestions.length > 0
  const showSidebar = config.categoryStyle === 'sidebar'

  return (
    <div
      className={cn(
        'flex flex-col min-h-0 bg-white rounded-lg border border-stone-200',
        className
      )}
    >
      {/* Quick Keys Bar - Top position */}
      {showQuickKeysTop && (
        <POSQuickKeysBar
          products={displayedQuickKeys}
          position="top"
          onProductClick={handleQuickKeyClick}
        />
      )}

      {/* Smart Suggestions Row */}
      {showSuggestions && (
        <POSSuggestionsRow
          products={suggestions}
          position="top"
          onProductClick={handleSuggestionClick}
          onRefresh={onRefreshSuggestions}
          isRefreshing={isSuggestionsRefreshing}
        />
      )}

      {/* Search Bar */}
      <div className="p-3 border-b border-stone-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category Tabs/Dropdown - shown above grid if not sidebar */}
      {config.categoryStyle !== 'sidebar' && (
        <POSCategoryNav
          categories={categories}
          selectedCategoryId={selectedCategoryId ?? undefined}
          displayStyle={config.categoryStyle}
          showAllCategory={config.showAllCategory}
          onCategoryChange={handleCategoryChange}
          className={config.categoryStyle === 'dropdown' ? 'p-3 border-b' : ''}
        />
      )}

      {/* Main Area: sidebar (if applicable) + grid */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Quick Keys Bar - Left position */}
        {showQuickKeysLeft && (
          <POSQuickKeysBar
            products={displayedQuickKeys}
            position="left"
            onProductClick={handleQuickKeyClick}
          />
        )}

        {/* Category Sidebar */}
        {showSidebar && (
          <POSCategoryNav
            categories={categories}
            selectedCategoryId={selectedCategoryId ?? undefined}
            displayStyle="sidebar"
            showAllCategory={config.showAllCategory}
            onCategoryChange={handleCategoryChange}
          />
        )}

        {/* Product Grid + Pagination */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Product Grid */}
          <div className="flex-1 overflow-auto p-3">
            {paginatedProducts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-stone-500">
                <p>No products found</p>
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
                    hasVariants={
                      product.variants && product.variants.length > 0
                    }
                    hasModifiers={
                      product.modifierGroups &&
                      product.modifierGroups.length > 0
                    }
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-stone-200 bg-stone-50">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <span className="text-sm text-stone-600">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Variant Picker Modal */}
      {variantPickerProduct && (
        <POSVariantPicker
          isOpen={!!variantPickerProduct}
          onClose={() => setVariantPickerProduct(null)}
          productName={
            variantPickerProduct.displayName || variantPickerProduct.name
          }
          productPrice={variantPickerProduct.price}
          productImageUrl={variantPickerProduct.imageUrl}
          variants={variantPickerProduct.variants || []}
          onSelectVariant={handleVariantSelect}
        />
      )}

      {/* Modifier Modal */}
      {modifierProduct && (
        <POSModifierModal
          isOpen={!!modifierProduct}
          onClose={() => setModifierProduct(null)}
          productName={
            modifierProduct.product.displayName || modifierProduct.product.name
          }
          basePrice={
            modifierProduct.product.price +
            (modifierProduct.variant?.priceAdjustment || 0)
          }
          modifierGroups={modifierProduct.product.modifierGroups || []}
          onConfirm={handleModifierConfirm}
        />
      )}
    </div>
  )
}

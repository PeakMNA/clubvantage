'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Search, ChevronLeft, ChevronRight, X, Delete, Sparkles, ChevronUp, ChevronDown } from 'lucide-react'
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
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [searchModalValue, setSearchModalValue] = useState('')
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(true)
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
  const hasSuggestions = suggestions.length > 0
  const showSuggestions = hasSuggestions && showSuggestionsPanel
  const showSidebar = config.categoryStyle === 'sidebar'

  return (
    <div
      className={cn(
        'flex flex-col min-h-0 min-w-0 overflow-hidden bg-white rounded-lg border border-stone-200',
        className
      )}
    >
      {/* Quick Keys Bar - Top position with Suggestions Toggle */}
      {showQuickKeysTop ? (
        <div className="flex items-stretch">
          {/* Suggestions Toggle Button */}
          {hasSuggestions && (
            <button
              type="button"
              onClick={() => setShowSuggestionsPanel(!showSuggestionsPanel)}
              className={cn(
                'flex items-center gap-1.5 px-3 border-b border-r transition-colors',
                showSuggestionsPanel
                  ? 'bg-emerald-100 border-emerald-200 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-stone-100 border-stone-200 text-stone-500 hover:bg-stone-200'
              )}
              title={showSuggestionsPanel ? 'Hide suggestions' : 'Show suggestions'}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {showSuggestionsPanel ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          )}
          <div className="flex-1">
            <POSQuickKeysBar
              products={displayedQuickKeys}
              position="top"
              onProductClick={handleQuickKeyClick}
            />
          </div>
        </div>
      ) : hasSuggestions ? (
        /* Standalone Suggestions Toggle when no Quick Keys at top */
        <div className="flex items-center border-b border-stone-200">
          <button
            type="button"
            onClick={() => setShowSuggestionsPanel(!showSuggestionsPanel)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 transition-colors',
              showSuggestionsPanel
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
            )}
            title={showSuggestionsPanel ? 'Hide suggestions' : 'Show suggestions'}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Suggested</span>
            {showSuggestionsPanel ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </div>
      ) : null}

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

      {/* Search Bar - Opens modal with virtual keyboard */}
      <div className="p-3 border-b border-stone-200">
        <div
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
            searchQuery
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-stone-50 border-stone-200 text-stone-500'
          )}
        >
          <button
            type="button"
            onClick={() => {
              setSearchModalValue(searchQuery)
              setIsSearchModalOpen(true)
            }}
            className="flex items-center gap-2 flex-1 min-w-0 text-left hover:opacity-80"
          >
            <Search className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {searchQuery || 'Tap to search products...'}
            </span>
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1.5 hover:bg-amber-200 rounded-full flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
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

      {/* Search Modal with Virtual Keyboard */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-stone-50">
              <h3 className="font-semibold text-stone-900">Search Products</h3>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="p-2 hover:bg-stone-200 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-stone-500" />
              </button>
            </div>

            {/* Search Input Display */}
            <div className="p-4 border-b border-stone-200">
              <div className="flex items-center gap-2 px-4 py-3 bg-stone-100 rounded-lg border-2 border-amber-400">
                <Search className="h-5 w-5 text-stone-400 flex-shrink-0" />
                <span className="text-lg text-stone-900 flex-1 min-h-[1.5rem]">
                  {searchModalValue || <span className="text-stone-400">Type to search...</span>}
                </span>
                {searchModalValue && (
                  <span className="animate-pulse text-amber-500">|</span>
                )}
              </div>
            </div>

            {/* Virtual Keyboard */}
            <div className="p-4 bg-stone-100">
              {/* Number Row */}
              <div className="flex gap-1 mb-1 justify-center">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSearchModalValue((v) => v + key)}
                    className="w-12 h-12 bg-white rounded-lg shadow-sm border border-stone-200 font-semibold text-stone-700 hover:bg-stone-50 active:bg-stone-200 transition-colors"
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* QWERTY Row 1 */}
              <div className="flex gap-1 mb-1 justify-center">
                {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSearchModalValue((v) => v + key.toLowerCase())}
                    className="w-12 h-12 bg-white rounded-lg shadow-sm border border-stone-200 font-semibold text-stone-700 hover:bg-stone-50 active:bg-stone-200 transition-colors"
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* QWERTY Row 2 */}
              <div className="flex gap-1 mb-1 justify-center">
                {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSearchModalValue((v) => v + key.toLowerCase())}
                    className="w-12 h-12 bg-white rounded-lg shadow-sm border border-stone-200 font-semibold text-stone-700 hover:bg-stone-50 active:bg-stone-200 transition-colors"
                  >
                    {key}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSearchModalValue((v) => v.slice(0, -1))}
                  className="w-16 h-12 bg-stone-200 rounded-lg shadow-sm border border-stone-300 font-semibold text-stone-700 hover:bg-stone-300 active:bg-stone-400 transition-colors flex items-center justify-center"
                >
                  <Delete className="h-5 w-5" />
                </button>
              </div>

              {/* QWERTY Row 3 */}
              <div className="flex gap-1 mb-1 justify-center">
                {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSearchModalValue((v) => v + key.toLowerCase())}
                    className="w-12 h-12 bg-white rounded-lg shadow-sm border border-stone-200 font-semibold text-stone-700 hover:bg-stone-50 active:bg-stone-200 transition-colors"
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Space and Action Row */}
              <div className="flex gap-2 mt-2 justify-center">
                <button
                  type="button"
                  onClick={() => setSearchModalValue('')}
                  className="px-6 h-12 bg-red-100 text-red-700 rounded-lg shadow-sm border border-red-200 font-semibold hover:bg-red-200 active:bg-red-300 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setSearchModalValue((v) => v + ' ')}
                  className="flex-1 max-w-xs h-12 bg-white rounded-lg shadow-sm border border-stone-200 font-semibold text-stone-500 hover:bg-stone-50 active:bg-stone-200 transition-colors"
                >
                  Space
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery(searchModalValue)
                    setIsSearchModalOpen(false)
                  }}
                  className="px-8 h-12 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg shadow-sm font-semibold hover:from-amber-600 hover:to-amber-700 active:from-amber-700 active:to-amber-800 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

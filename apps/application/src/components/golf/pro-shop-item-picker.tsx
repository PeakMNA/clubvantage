'use client'

import { useState, useMemo } from 'react'
import { cn } from '@clubvantage/ui'
import { Search, X, Package, Loader2, User, ChevronDown } from 'lucide-react'
import { Modal } from './modal'
import {
  useGetProShopCategoriesQuery,
  useGetProShopProductsQuery,
} from '@clubvantage/api-client'
import { PlayerTypeBadge } from './player-type-badge'

// Use partial types for what we get from queries
interface ProductForPicker {
  id: string
  name: string
  price: number
  effectiveTaxRate: number
  effectiveTaxType: string
  category?: { id: string; name: string } | null
  variants: VariantForPicker[]
}

interface VariantForPicker {
  id: string
  name: string
  finalPrice: number
  priceAdjustment: number
}

// Player type for slot selector
export interface SlotPickerPlayer {
  id: string
  name: string
  type: 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP' | 'member' | 'guest' | 'dependent' | 'walkup'
  position?: 1 | 2 | 3 | 4
}

// Helper to normalize player type to lowercase form
function normalizePlayerType(type: string): 'member' | 'guest' | 'dependent' | 'walkup' {
  const typeMap: Record<string, 'member' | 'guest' | 'dependent' | 'walkup'> = {
    'MEMBER': 'member',
    'GUEST': 'guest',
    'DEPENDENT': 'dependent',
    'WALK_UP': 'walkup',
    'member': 'member',
    'guest': 'guest',
    'dependent': 'dependent',
    'walkup': 'walkup',
  }
  return typeMap[type] || 'guest'
}

export interface ProShopItemPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (product: ProductForPicker, variant?: VariantForPicker) => void
  // Slot selection props
  players?: SlotPickerPlayer[]
  selectedPlayerId?: string
  onPlayerChange?: (playerId: string) => void
}

export function ProShopItemPicker({
  isOpen,
  onClose,
  onSelect,
  players,
  selectedPlayerId,
  onPlayerChange,
}: ProShopItemPickerProps) {
  const [search, setSearch] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductForPicker | null>(null)
  const [slotDropdownOpen, setSlotDropdownOpen] = useState(false)

  // Get selected player info
  const selectedPlayer = players?.find(p => p.id === selectedPlayerId)

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useGetProShopCategoriesQuery()
  const categories = categoriesData?.proShopCategories || []

  // Fetch products with filters
  const { data: productsData, isLoading: productsLoading } = useGetProShopProductsQuery({
    filter: {
      categoryId: selectedCategoryId || undefined,
      search: search || undefined,
      isActive: true,
    },
  })
  const products = productsData?.proShopProducts?.items || []

  // Quick add products (shown at top)
  const { data: quickAddData } = useGetProShopProductsQuery({
    filter: { isQuickAdd: true, isActive: true },
  })
  const quickAddProducts = quickAddData?.proShopProducts?.items || []

  const handleProductClick = (product: ProductForPicker) => {
    if (product.variants.length > 0) {
      setSelectedProduct(product)
    } else {
      onSelect(product)
      handleClose()
    }
  }

  const handleVariantSelect = (variant: VariantForPicker) => {
    if (selectedProduct) {
      onSelect(selectedProduct, variant)
      handleClose()
    }
  }

  const handleClose = () => {
    setSearch('')
    setSelectedCategoryId(null)
    setSelectedProduct(null)
    onClose()
  }

  const isLoading = categoriesLoading || productsLoading

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={selectedProduct ? 'Select Variant' : 'Add Pro Shop Item'}
      size="lg"
    >
      <div className="space-y-4 -mx-4 px-4">
        {/* Variant Selection View */}
        {selectedProduct ? (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedProduct(null)}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              &larr; Back to products
            </button>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium">{selectedProduct.name}</h3>
              <p className="text-sm text-muted-foreground">
                Base price: ${selectedProduct.price.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Select variant:
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedProduct.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantSelect(variant)}
                    className="p-3 text-left border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <div className="font-medium">{variant.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ${variant.finalPrice.toFixed(2)}
                      {variant.priceAdjustment !== 0 && (
                        <span className="ml-1">
                          ({variant.priceAdjustment > 0 ? '+' : ''}
                          ${variant.priceAdjustment.toFixed(2)})
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Slot Selector - only show when players are provided */}
            {players && players.length > 0 && (
              <div className="relative">
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Add item to:
                </label>
                <button
                  type="button"
                  onClick={() => setSlotDropdownOpen(!slotDropdownOpen)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                >
                  {selectedPlayer ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{selectedPlayer.name}</span>
                        <PlayerTypeBadge type={normalizePlayerType(selectedPlayer.type)} />
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Select a player...</span>
                  )}
                  <ChevronDown className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    slotDropdownOpen && 'rotate-180'
                  )} />
                </button>

                {/* Dropdown */}
                {slotDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg overflow-hidden">
                    {players.map((player) => (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => {
                          onPlayerChange?.(player.id)
                          setSlotDropdownOpen(false)
                        }}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left',
                          player.id === selectedPlayerId && 'bg-primary/5'
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {player.position ? (
                            <span className="text-sm font-medium text-muted-foreground">
                              P{player.position}
                            </span>
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-medium">{player.name}</span>
                          <PlayerTypeBadge type={normalizePlayerType(player.type)} />
                        </div>
                        {player.id === selectedPlayerId && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-xs text-white">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick Add Section */}
            {quickAddProducts.length > 0 && !search && !selectedCategoryId && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Quick Add
                </h3>
                <div className="flex flex-wrap gap-2">
                  {quickAddProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="px-3 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                    >
                      {product.name} · ${product.price.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  selectedCategoryId === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                    selectedCategoryId === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mb-2" />
                <p>No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="p-3 text-left border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ${product.price.toFixed(2)}
                      {product.variants.length > 0 && (
                        <span className="ml-1">
                          ({product.variants.length} variants)
                        </span>
                      )}
                    </div>
                    {product.category && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {product.category.name}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

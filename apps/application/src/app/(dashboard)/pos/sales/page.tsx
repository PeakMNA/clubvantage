'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  POSProductPanel,
  POSLineItemPanel,
  POSReceiptTotals,
  Button,
  type POSProduct,
  type POSCategory,
  type GridConfig,
  type QuickKeyProduct,
  type SuggestedProduct,
  type ProductVariant,
  type SelectedModifier,
  type LineItem,
} from '@clubvantage/ui'
import {
  Store,
  Clock,
  LogOut,
  ChevronDown,
  Trash2,
  CreditCard,
  User,
} from 'lucide-react'
import { cn } from '@clubvantage/ui'

// ============================================================================
// Types
// ============================================================================

interface CartItem {
  id: string
  productId: string
  name: string
  quantity: number
  unitPrice: number
  variantId?: string
  variantName?: string
  modifiers?: Array<{ id: string; name: string; price: number }>
  totalPrice: number
}

interface Outlet {
  id: string
  name: string
}

// ============================================================================
// Mock Data
// ============================================================================

const mockOutlets: Outlet[] = [
  { id: 'outlet-1', name: 'Clubhouse Restaurant' },
  { id: 'outlet-2', name: 'Poolside Bar' },
  { id: 'outlet-3', name: 'Pro Shop' },
]

const mockConfig: GridConfig = {
  gridColumns: 6,
  gridRows: 4,
  tileSize: 'medium',
  showImages: true,
  showPrices: true,
  categoryStyle: 'tabs',
  showAllCategory: true,
  quickKeysEnabled: true,
  quickKeysCount: 8,
  quickKeysPosition: 'top',
}

const mockCategories: POSCategory[] = [
  { id: 'cat-1', name: 'Appetizers', color: '#F59E0B' },
  { id: 'cat-2', name: 'Main Course', color: '#10B981' },
  { id: 'cat-3', name: 'Beverages', color: '#3B82F6' },
  { id: 'cat-4', name: 'Desserts', color: '#EC4899' },
  { id: 'cat-5', name: 'Snacks', color: '#8B5CF6' },
]

const mockProducts: POSProduct[] = [
  // Appetizers
  {
    id: 'prod-1',
    name: 'Caesar Salad',
    displayName: 'Caesar Salad',
    price: 12.99,
    productType: 'SIMPLE',
    categoryId: 'cat-1',
    categoryColor: '#F59E0B',
    inStock: true,
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200',
  },
  {
    id: 'prod-2',
    name: 'Chicken Wings',
    displayName: 'Buffalo Wings',
    price: 14.99,
    productType: 'VARIABLE',
    categoryId: 'cat-1',
    categoryColor: '#F59E0B',
    inStock: true,
    imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=200',
    variants: [
      { id: 'var-1', name: '6 Pieces', priceAdjustment: 0, isActive: true },
      { id: 'var-2', name: '12 Pieces', priceAdjustment: 6.0, isActive: true },
      { id: 'var-3', name: '18 Pieces', priceAdjustment: 12.0, isActive: true },
    ],
    modifierGroups: [
      {
        id: 'mod-g1',
        name: 'Sauce',
        selectionType: 'SINGLE',
        minSelections: 1,
        isRequired: true,
        modifiers: [
          { id: 'mod-1', name: 'Buffalo', priceAdjustment: 0, isDefault: true, isActive: true },
          { id: 'mod-2', name: 'BBQ', priceAdjustment: 0, isDefault: false, isActive: true },
          { id: 'mod-3', name: 'Honey Garlic', priceAdjustment: 0.5, isDefault: false, isActive: true },
        ],
      },
    ],
  },
  {
    id: 'prod-3',
    name: 'Soup of the Day',
    price: 8.99,
    productType: 'SIMPLE',
    categoryId: 'cat-1',
    categoryColor: '#F59E0B',
    inStock: true,
  },
  {
    id: 'prod-4',
    name: 'Nachos Supreme',
    price: 16.99,
    productType: 'SIMPLE',
    categoryId: 'cat-1',
    categoryColor: '#F59E0B',
    inStock: true,
    imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=200',
    modifierGroups: [
      {
        id: 'mod-g2',
        name: 'Extra Toppings',
        selectionType: 'MULTIPLE',
        minSelections: 0,
        maxSelections: 3,
        isRequired: false,
        modifiers: [
          { id: 'mod-4', name: 'Extra Cheese', priceAdjustment: 2.0, isDefault: false, isActive: true },
          { id: 'mod-5', name: 'Jalapenos', priceAdjustment: 1.0, isDefault: false, isActive: true },
          { id: 'mod-6', name: 'Sour Cream', priceAdjustment: 1.5, isDefault: false, isActive: true },
          { id: 'mod-7', name: 'Guacamole', priceAdjustment: 3.0, isDefault: false, isActive: true },
        ],
      },
    ],
  },
  // Main Course
  {
    id: 'prod-5',
    name: 'Grilled Steak',
    displayName: 'Premium Ribeye',
    price: 38.99,
    productType: 'VARIABLE',
    categoryId: 'cat-2',
    categoryColor: '#10B981',
    inStock: true,
    imageUrl: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=200',
    variants: [
      { id: 'var-4', name: '8oz', priceAdjustment: 0, isActive: true },
      { id: 'var-5', name: '12oz', priceAdjustment: 12.0, isActive: true },
      { id: 'var-6', name: '16oz', priceAdjustment: 20.0, isActive: true },
    ],
    modifierGroups: [
      {
        id: 'mod-g3',
        name: 'Temperature',
        selectionType: 'SINGLE',
        minSelections: 1,
        isRequired: true,
        modifiers: [
          { id: 'mod-8', name: 'Rare', priceAdjustment: 0, isDefault: false, isActive: true },
          { id: 'mod-9', name: 'Medium Rare', priceAdjustment: 0, isDefault: true, isActive: true },
          { id: 'mod-10', name: 'Medium', priceAdjustment: 0, isDefault: false, isActive: true },
          { id: 'mod-11', name: 'Medium Well', priceAdjustment: 0, isDefault: false, isActive: true },
          { id: 'mod-12', name: 'Well Done', priceAdjustment: 0, isDefault: false, isActive: true },
        ],
      },
      {
        id: 'mod-g4',
        name: 'Sides',
        selectionType: 'MULTIPLE',
        minSelections: 1,
        maxSelections: 2,
        isRequired: true,
        modifiers: [
          { id: 'mod-13', name: 'Mashed Potatoes', priceAdjustment: 0, isDefault: true, isActive: true },
          { id: 'mod-14', name: 'Fries', priceAdjustment: 0, isDefault: false, isActive: true },
          { id: 'mod-15', name: 'Grilled Vegetables', priceAdjustment: 2.0, isDefault: false, isActive: true },
          { id: 'mod-16', name: 'Caesar Salad', priceAdjustment: 3.0, isDefault: false, isActive: true },
        ],
      },
    ],
  },
  {
    id: 'prod-6',
    name: 'Club Burger',
    price: 18.99,
    productType: 'SIMPLE',
    categoryId: 'cat-2',
    categoryColor: '#10B981',
    inStock: true,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
    modifierGroups: [
      {
        id: 'mod-g5',
        name: 'Extras',
        selectionType: 'MULTIPLE',
        minSelections: 0,
        isRequired: false,
        modifiers: [
          { id: 'mod-17', name: 'Extra Patty', priceAdjustment: 5.0, isDefault: false, isActive: true },
          { id: 'mod-18', name: 'Bacon', priceAdjustment: 2.5, isDefault: false, isActive: true },
          { id: 'mod-19', name: 'Avocado', priceAdjustment: 3.0, isDefault: false, isActive: true },
        ],
      },
    ],
  },
  {
    id: 'prod-7',
    name: 'Grilled Salmon',
    price: 28.99,
    productType: 'SIMPLE',
    categoryId: 'cat-2',
    categoryColor: '#10B981',
    inStock: true,
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200',
  },
  {
    id: 'prod-8',
    name: 'Pasta Carbonara',
    price: 22.99,
    productType: 'SIMPLE',
    categoryId: 'cat-2',
    categoryColor: '#10B981',
    inStock: true,
  },
  // Beverages
  {
    id: 'prod-9',
    name: 'Draft Beer',
    price: 6.99,
    productType: 'VARIABLE',
    categoryId: 'cat-3',
    categoryColor: '#3B82F6',
    inStock: true,
    imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=200',
    variants: [
      { id: 'var-7', name: 'Pint', priceAdjustment: 0, isActive: true },
      { id: 'var-8', name: 'Half Pint', priceAdjustment: -2.0, isActive: true },
      { id: 'var-9', name: 'Pitcher', priceAdjustment: 12.0, isActive: true },
    ],
  },
  {
    id: 'prod-10',
    name: 'House Wine',
    price: 9.99,
    productType: 'VARIABLE',
    categoryId: 'cat-3',
    categoryColor: '#3B82F6',
    inStock: true,
    variants: [
      { id: 'var-10', name: 'Glass', priceAdjustment: 0, isActive: true },
      { id: 'var-11', name: 'Bottle', priceAdjustment: 25.0, isActive: true },
    ],
  },
  {
    id: 'prod-11',
    name: 'Soft Drink',
    price: 3.99,
    productType: 'SIMPLE',
    categoryId: 'cat-3',
    categoryColor: '#3B82F6',
    inStock: true,
  },
  {
    id: 'prod-12',
    name: 'Fresh Juice',
    price: 5.99,
    productType: 'VARIABLE',
    categoryId: 'cat-3',
    categoryColor: '#3B82F6',
    inStock: true,
    variants: [
      { id: 'var-12', name: 'Orange', priceAdjustment: 0, isActive: true },
      { id: 'var-13', name: 'Apple', priceAdjustment: 0, isActive: true },
      { id: 'var-14', name: 'Grapefruit', priceAdjustment: 1.0, isActive: true },
    ],
  },
  {
    id: 'prod-13',
    name: 'Coffee',
    price: 4.49,
    productType: 'VARIABLE',
    categoryId: 'cat-3',
    categoryColor: '#3B82F6',
    inStock: true,
    variants: [
      { id: 'var-15', name: 'Regular', priceAdjustment: 0, isActive: true },
      { id: 'var-16', name: 'Large', priceAdjustment: 1.0, isActive: true },
    ],
    modifierGroups: [
      {
        id: 'mod-g6',
        name: 'Add-ons',
        selectionType: 'MULTIPLE',
        minSelections: 0,
        isRequired: false,
        modifiers: [
          { id: 'mod-20', name: 'Extra Shot', priceAdjustment: 1.0, isDefault: false, isActive: true },
          { id: 'mod-21', name: 'Oat Milk', priceAdjustment: 0.75, isDefault: false, isActive: true },
          { id: 'mod-22', name: 'Vanilla Syrup', priceAdjustment: 0.5, isDefault: false, isActive: true },
        ],
      },
    ],
  },
  // Desserts
  {
    id: 'prod-14',
    name: 'Chocolate Cake',
    price: 9.99,
    productType: 'SIMPLE',
    categoryId: 'cat-4',
    categoryColor: '#EC4899',
    inStock: true,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200',
  },
  {
    id: 'prod-15',
    name: 'Ice Cream',
    price: 6.99,
    productType: 'VARIABLE',
    categoryId: 'cat-4',
    categoryColor: '#EC4899',
    inStock: true,
    variants: [
      { id: 'var-17', name: 'Single Scoop', priceAdjustment: 0, isActive: true },
      { id: 'var-18', name: 'Double Scoop', priceAdjustment: 3.0, isActive: true },
      { id: 'var-19', name: 'Triple Scoop', priceAdjustment: 5.0, isActive: true },
    ],
    modifierGroups: [
      {
        id: 'mod-g7',
        name: 'Flavors',
        selectionType: 'MULTIPLE',
        minSelections: 1,
        maxSelections: 3,
        isRequired: true,
        modifiers: [
          { id: 'mod-23', name: 'Vanilla', priceAdjustment: 0, isDefault: true, isActive: true },
          { id: 'mod-24', name: 'Chocolate', priceAdjustment: 0, isDefault: false, isActive: true },
          { id: 'mod-25', name: 'Strawberry', priceAdjustment: 0, isDefault: false, isActive: true },
          { id: 'mod-26', name: 'Mint Chip', priceAdjustment: 0.5, isDefault: false, isActive: true },
        ],
      },
      {
        id: 'mod-g8',
        name: 'Toppings',
        selectionType: 'MULTIPLE',
        minSelections: 0,
        isRequired: false,
        modifiers: [
          { id: 'mod-27', name: 'Whipped Cream', priceAdjustment: 1.0, isDefault: false, isActive: true },
          { id: 'mod-28', name: 'Hot Fudge', priceAdjustment: 1.5, isDefault: false, isActive: true },
          { id: 'mod-29', name: 'Sprinkles', priceAdjustment: 0.5, isDefault: false, isActive: true },
        ],
      },
    ],
  },
  {
    id: 'prod-16',
    name: 'Cheesecake',
    price: 10.99,
    productType: 'SIMPLE',
    categoryId: 'cat-4',
    categoryColor: '#EC4899',
    inStock: true,
  },
  // Snacks
  {
    id: 'prod-17',
    name: 'French Fries',
    price: 5.99,
    productType: 'VARIABLE',
    categoryId: 'cat-5',
    categoryColor: '#8B5CF6',
    inStock: true,
    variants: [
      { id: 'var-20', name: 'Regular', priceAdjustment: 0, isActive: true },
      { id: 'var-21', name: 'Large', priceAdjustment: 2.0, isActive: true },
    ],
  },
  {
    id: 'prod-18',
    name: 'Onion Rings',
    price: 7.99,
    productType: 'SIMPLE',
    categoryId: 'cat-5',
    categoryColor: '#8B5CF6',
    inStock: true,
  },
  {
    id: 'prod-19',
    name: 'Mixed Nuts',
    price: 8.99,
    productType: 'SIMPLE',
    categoryId: 'cat-5',
    categoryColor: '#8B5CF6',
    inStock: true,
  },
  {
    id: 'prod-20',
    name: 'Cheese Platter',
    price: 18.99,
    productType: 'SIMPLE',
    categoryId: 'cat-5',
    categoryColor: '#8B5CF6',
    inStock: true,
    imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=200',
  },
]

// Quick keys - first 8 popular items
const mockQuickKeys: QuickKeyProduct[] = mockProducts.slice(0, 8).map((p) => ({
  id: p.id,
  name: p.name,
  displayName: p.displayName,
  price: p.price,
  imageUrl: p.imageUrl,
  productType: p.productType,
  categoryColor: p.categoryColor,
}))

// Suggestions - a mix of items for upselling
const mockSuggestions: SuggestedProduct[] = [
  mockProducts[8],
  mockProducts[10],
  mockProducts[13],
  mockProducts[14],
  mockProducts[17],
  mockProducts[19],
].filter((p): p is POSProduct => p !== undefined).map((p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  imageUrl: p.imageUrl,
  productType: p.productType,
  categoryColor: p.categoryColor,
}))

// ============================================================================
// Helper Functions
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function generateCartItemId(): string {
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// Create a unique key for cart item comparison (product + variant + modifiers)
function getCartItemKey(
  productId: string,
  variantId?: string,
  modifiers?: Array<{ id: string }>
): string {
  const modifierKey = modifiers
    ? modifiers
        .map((m) => m.id)
        .sort()
        .join('-')
    : ''
  return `${productId}:${variantId || ''}:${modifierKey}`
}

// ============================================================================
// Main Component
// ============================================================================

export default function POSSalesPage() {
  // State
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedOutletId, setSelectedOutletId] = useState<string>('outlet-1')
  const [isOutletDropdownOpen, setIsOutletDropdownOpen] = useState(false)
  const [isSuggestionsRefreshing, setIsSuggestionsRefreshing] = useState(false)

  // Get the selected outlet
  const selectedOutlet = mockOutlets.find((o) => o.id === selectedOutletId)

  // Calculate totals
  const { subtotal, tax, total } = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)
    const taxRate = 0.07 // 7% tax
    const tax = subtotal * taxRate
    const total = subtotal + tax
    return { subtotal, tax, total }
  }, [cart])

  // Cart item count
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Handle adding product to cart
  const handleAddToCart = useCallback(
    (
      product: POSProduct,
      variant?: ProductVariant,
      modifiers?: SelectedModifier[]
    ) => {
      // Calculate unit price
      let unitPrice = product.price
      if (variant) {
        unitPrice += variant.priceAdjustment
      }
      if (modifiers && modifiers.length > 0) {
        unitPrice += modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0)
      }

      // Create the cart item key
      const itemKey = getCartItemKey(
        product.id,
        variant?.id,
        modifiers?.map((m) => ({ id: m.modifierId }))
      )

      // Check if same product+variant+modifiers exists
      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            getCartItemKey(
              item.productId,
              item.variantId,
              item.modifiers?.map((m) => ({ id: m.id }))
            ) === itemKey
        )

        if (existingIndex !== -1) {
          // Update existing item quantity
          const updated = [...prev]
          const existing = updated[existingIndex]!
          updated[existingIndex] = {
            ...existing,
            quantity: existing.quantity + 1,
            totalPrice: (existing.quantity + 1) * existing.unitPrice,
          }
          return updated
        }

        // Add new item
        const newItem: CartItem = {
          id: generateCartItemId(),
          productId: product.id,
          name: product.displayName || product.name,
          quantity: 1,
          unitPrice,
          variantId: variant?.id,
          variantName: variant?.name,
          modifiers: modifiers?.map((m) => ({
            id: m.modifierId,
            name: m.name,
            price: m.priceAdjustment,
          })),
          totalPrice: unitPrice,
        }

        return [...prev, newItem]
      })
    },
    []
  )

  // Handle quantity change
  const handleQuantityChange = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) {
      // Remove item if quantity goes below 1
      setCart((prev) => prev.filter((item) => item.id !== itemId))
      return
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
          : item
      )
    )
  }, [])

  // Handle remove item
  const handleRemoveItem = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId))
  }, [])

  // Handle clear cart
  const handleClearCart = useCallback(() => {
    setCart([])
  }, [])

  // Handle refresh suggestions
  const handleRefreshSuggestions = useCallback(() => {
    setIsSuggestionsRefreshing(true)
    // Simulate refresh delay
    setTimeout(() => {
      setIsSuggestionsRefreshing(false)
    }, 1000)
  }, [])

  // Handle pay button
  const handlePay = useCallback(() => {
    // TODO: Implement payment flow
    console.log('Processing payment for:', { cart, subtotal, tax, total })
    alert(`Payment of ${formatCurrency(total)} would be processed here.`)
  }, [cart, subtotal, tax, total])

  // Convert cart items to line items for POSLineItemPanel
  const lineItems: LineItem[] = cart.map((item) => {
    // Build the display name with variant and modifiers
    let displayName = item.name
    if (item.variantName) {
      displayName += ` (${item.variantName})`
    }

    return {
      id: item.id,
      name: displayName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      notes: item.modifiers?.map((m) => `+ ${m.name}`).join(', '),
    }
  })

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-stone-100 -m-4 md:-m-6">
      {/* POS Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200 shadow-sm">
        {/* Left: Outlet Selector */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOutletDropdownOpen(!isOutletDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <Store className="h-4 w-4 text-stone-600" />
              <span className="font-medium text-stone-900">
                {selectedOutlet?.name || 'Select Outlet'}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-stone-500 transition-transform',
                  isOutletDropdownOpen && 'rotate-180'
                )}
              />
            </button>

            {isOutletDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 z-50 min-w-[200px] bg-white border border-stone-200 rounded-lg shadow-lg py-1">
                {mockOutlets.map((outlet) => (
                  <button
                    key={outlet.id}
                    type="button"
                    onClick={() => {
                      setSelectedOutletId(outlet.id)
                      setIsOutletDropdownOpen(false)
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm hover:bg-stone-50 transition-colors',
                      outlet.id === selectedOutletId &&
                        'bg-amber-50 text-amber-700 font-medium'
                    )}
                  >
                    {outlet.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Session info */}
          <div className="hidden md:flex items-center gap-2 text-sm text-stone-500">
            <Clock className="h-4 w-4" />
            <span>
              {new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span className="text-stone-300">|</span>
            <span>Shift started: 8:00 AM</span>
          </div>
        </div>

        {/* Right: Staff info and actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <User className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-stone-900">Sarah Johnson</p>
              <p className="text-xs text-stone-500">Server</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-stone-600 hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">End Shift</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Product Panel */}
        <div className="flex-1 p-4 overflow-hidden">
          <POSProductPanel
            config={mockConfig}
            categories={mockCategories}
            products={mockProducts}
            quickKeys={mockQuickKeys}
            suggestions={mockSuggestions}
            onAddToCart={handleAddToCart}
            onRefreshSuggestions={handleRefreshSuggestions}
            isSuggestionsRefreshing={isSuggestionsRefreshing}
            className="h-full"
          />
        </div>

        {/* Cart Sidebar */}
        <div className="w-80 lg:w-96 bg-white border-l border-stone-200 flex flex-col">
          {/* Cart Header */}
          <div className="px-4 py-3 border-b border-stone-200 bg-stone-50">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-stone-900">Current Order</h2>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            <POSLineItemPanel
              items={lineItems}
              onQuantityChange={handleQuantityChange}
              onRemoveItem={handleRemoveItem}
              allowEditing={true}
            />
          </div>

          {/* Cart Footer - Totals and Actions */}
          <div className="border-t border-stone-200 bg-stone-50">
            {/* Totals */}
            <div className="p-4">
              <POSReceiptTotals
                subtotal={subtotal}
                tax={tax}
                total={total}
              />
            </div>

            {/* Action Buttons */}
            <div className="p-4 pt-0 space-y-2">
              {cart.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full gap-2 text-stone-600 hover:text-red-600 hover:border-red-200"
                  onClick={handleClearCart}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Cart
                </Button>
              )}

              <Button
                className="w-full gap-2 h-12 text-base font-semibold bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                disabled={cart.length === 0}
                onClick={handlePay}
              >
                <CreditCard className="h-5 w-5" />
                Pay {formatCurrency(total)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

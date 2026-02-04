'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  POSProductPanel,
  POSLineItemPanel,
  POSReceiptTotals,
  POSActionBar,
  POSToolbar,
  Button,
  type POSProduct,
  type POSCategory,
  type GridConfig,
  type QuickKeyProduct,
  type SuggestedProduct,
  type ProductVariant,
  type SelectedModifier,
  type LineItem,
  type ActionBarConfig,
  type ActionBarButton,
  type ButtonDefinition,
  type ButtonState,
} from '@clubvantage/ui'
import {
  Store,
  Clock,
  LogOut,
  ChevronDown,
  Trash2,
  CreditCard,
  Users,
  UserCheck,
  Calendar,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { cn } from '@clubvantage/ui'
import { useGetPosConfigQuery, useGetPosOutletsQuery } from '@clubvantage/api-client'

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

// Template configuration types (from template editor)
interface ToolbarGroup {
  id: string
  label: string
  zone: 'left' | 'center' | 'right'
  items: string[]
}

interface TemplateToolbarConfig {
  groups: ToolbarGroup[]
}

interface TemplateActionButton {
  id: string
  label: string
  actionType: string
  variant: 'primary' | 'secondary' | 'danger' | 'ghost'
  position: 'left' | 'center' | 'right'
}

interface TemplateActionBarConfig {
  buttons: TemplateActionButton[]
}

// ============================================================================
// Fallback Data (used when API data is not available)
// ============================================================================

const fallbackOutlets: Outlet[] = [
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

// ============================================================================
// Template Configurations (would come from API/database in production)
// ============================================================================

// F&B Template - includes table operations
// Note: categoryTabs removed since category tabs are in the product panel
const defaultTemplateToolbarConfig: TemplateToolbarConfig = {
  groups: [
    { id: 'table-group', label: 'Table Operations', zone: 'left', items: ['openTable', 'floorPlan', 'search'] },
    { id: 'member-group', label: 'Member', zone: 'center', items: ['memberLookup', 'attachMember', 'chargeToMember'] },
    { id: 'actions-group', label: 'Table & Ticket', zone: 'right', items: ['splitCheck', 'mergeTables', 'transferTable', 'holdTicket', 'newTicket'] },
  ],
}

const defaultTemplateActionBarConfig: TemplateActionBarConfig = {
  buttons: [
    { id: 'cancel', label: 'Cancel', actionType: 'CANCEL_TRANSACTION', variant: 'danger', position: 'left' },
    { id: 'void', label: 'Void', actionType: 'VOID_ITEM', variant: 'ghost', position: 'left' },
    { id: 'discount', label: 'Discount', actionType: 'APPLY_DISCOUNT', variant: 'secondary', position: 'center' },
    { id: 'hold', label: 'Hold', actionType: 'HOLD_TICKET', variant: 'secondary', position: 'center' },
    { id: 'print', label: 'Print', actionType: 'PRINT_RECEIPT', variant: 'ghost', position: 'center' },
    { id: 'cash', label: 'Cash', actionType: 'PROCESS_CASH_PAYMENT', variant: 'secondary', position: 'right' },
    { id: 'card', label: 'Card', actionType: 'PROCESS_CARD_PAYMENT', variant: 'secondary', position: 'right' },
    { id: 'pay', label: 'Pay', actionType: 'OPEN_PAYMENT_MODAL', variant: 'primary', position: 'right' },
  ],
}

// ============================================================================
// Config Converter Functions
// ============================================================================

// Convert template toolbar config to POSToolbar format
function convertToolbarConfig(templateConfig: TemplateToolbarConfig) {
  const zones: { left: string[]; center: string[]; right: string[] } = {
    left: [],
    center: [],
    right: [],
  }

  for (const group of templateConfig.groups) {
    zones[group.zone].push(...group.items)
  }

  return { zones }
}

// Map action type to icon
const actionTypeToIcon: Record<string, string> = {
  CANCEL_TRANSACTION: 'X',
  VOID_ITEM: 'Ban',
  VOID_TRANSACTION: 'Trash2',
  APPLY_DISCOUNT: 'Percent',
  HOLD_TICKET: 'Pause',
  RECALL_TICKET: 'Play',
  PRINT_RECEIPT: 'Printer',
  OPEN_DRAWER: 'Archive',
  PRICE_CHECK: 'Search',
  OPEN_PAYMENT_MODAL: 'CreditCard',
  PROCESS_CASH_PAYMENT: 'Banknote',
  PROCESS_CARD_PAYMENT: 'CreditCard',
  CHARGE_TO_MEMBER: 'UserCheck',
  SPLIT_PAYMENT: 'Split',
  MEMBER_LOOKUP: 'Users',
  ATTACH_MEMBER: 'UserPlus',
  DETACH_MEMBER: 'UserMinus',
  NEW_TICKET: 'Plus',
  CHANGE_QUANTITY: 'Hash',
  CUSTOM: 'Settings',
}

// Map variant to color
const variantToColor: Record<string, string> = {
  primary: 'primary',
  secondary: 'neutral',
  danger: 'danger',
  ghost: 'neutral',
}

// Convert template action bar config to POSActionBar format
function convertActionBarConfig(templateConfig: TemplateActionBarConfig): {
  actionBarConfig: ActionBarConfig
  buttonRegistry: Record<string, ButtonDefinition>
} {
  const leftButtons = templateConfig.buttons.filter(b => b.position === 'left')
  const centerButtons = templateConfig.buttons.filter(b => b.position === 'center')
  const rightButtons = templateConfig.buttons.filter(b => b.position === 'right')

  // Calculate total buttons per position and determine grid layout
  const maxButtons = Math.max(leftButtons.length, centerButtons.length, rightButtons.length, 3)
  const columns = maxButtons * 3 // 3 positions, each can have maxButtons
  const rows = 1

  // Create button positions
  const buttons: ActionBarButton[] = []

  // Left buttons start at column 0
  leftButtons.forEach((btn, idx) => {
    buttons.push({ position: [0, idx], buttonId: btn.id })
  })

  // Center buttons start in the middle
  const centerStart = maxButtons
  centerButtons.forEach((btn, idx) => {
    buttons.push({ position: [0, centerStart + idx], buttonId: btn.id })
  })

  // Right buttons start towards the end
  const rightStart = maxButtons * 2
  rightButtons.forEach((btn, idx) => {
    buttons.push({ position: [0, rightStart + idx], buttonId: btn.id })
  })

  // Create button registry
  const buttonRegistry: Record<string, ButtonDefinition> = {}
  templateConfig.buttons.forEach(btn => {
    buttonRegistry[btn.id] = {
      id: btn.id,
      label: btn.label,
      icon: actionTypeToIcon[btn.actionType] || 'Circle',
      color: variantToColor[btn.variant] || 'neutral',
      shortcut: btn.actionType === 'OPEN_PAYMENT_MODAL' ? 'F12' :
                btn.actionType === 'CANCEL_TRANSACTION' ? 'Esc' : undefined,
    }
  })

  return {
    actionBarConfig: { rows, columns, buttons },
    buttonRegistry,
  }
}

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
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null)
  const [isOutletDropdownOpen, setIsOutletDropdownOpen] = useState(false)
  const [isSuggestionsRefreshing, setIsSuggestionsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined)

  // Fetch outlets from API
  const { data: outletsData, isLoading: isLoadingOutlets } = useGetPosOutletsQuery({})
  const outlets: Outlet[] = useMemo(() => {
    if (outletsData?.posOutlets && outletsData.posOutlets.length > 0) {
      return outletsData.posOutlets.map((o) => ({ id: o.id, name: o.name }))
    }
    return fallbackOutlets
  }, [outletsData])

  // Set default outlet when outlets are loaded
  useEffect(() => {
    if (outlets.length > 0 && selectedOutletId === null) {
      setSelectedOutletId(outlets[0]!.id)
    }
  }, [outlets, selectedOutletId])

  // Fetch POS config for selected outlet
  const { data: posConfigData, isLoading: isLoadingConfig } = useGetPosConfigQuery(
    {
      outletId: selectedOutletId || '',
      userRole: 'staff', // TODO: Get from user context
      userPermissions: [],
    },
    {
      enabled: !!selectedOutletId, // Only fetch when outlet is selected
    }
  )

  // Get the selected outlet
  const selectedOutlet = outlets.find((o) => o.id === selectedOutletId)

  // Parse and use API config, or fall back to defaults
  // Note: Template page stores toolbarGroups and actionButtons inside toolbarConfig JSON
  const templateToolbarConfig: TemplateToolbarConfig = useMemo(() => {
    if (posConfigData?.posConfig?.toolbarConfig) {
      const config = posConfigData.posConfig.toolbarConfig as any
      // toolbarGroups is stored inside toolbarConfig
      if (config.toolbarGroups && Array.isArray(config.toolbarGroups)) {
        return { groups: config.toolbarGroups } as TemplateToolbarConfig
      }
      // Fallback: check for groups directly (alternate format)
      if (config.groups && Array.isArray(config.groups)) {
        return config as TemplateToolbarConfig
      }
    }
    return defaultTemplateToolbarConfig
  }, [posConfigData])

  const templateActionBarConfig: TemplateActionBarConfig = useMemo(() => {
    // First check toolbarConfig for actionButtons (where template page stores them)
    if (posConfigData?.posConfig?.toolbarConfig) {
      const config = posConfigData.posConfig.toolbarConfig as any
      if (config.actionButtons && Array.isArray(config.actionButtons)) {
        return { buttons: config.actionButtons } as TemplateActionBarConfig
      }
    }
    // Then check actionBarConfig directly
    if (posConfigData?.posConfig?.actionBarConfig) {
      const config = posConfigData.posConfig.actionBarConfig as any
      if (config.buttons && Array.isArray(config.buttons)) {
        return config as TemplateActionBarConfig
      }
    }
    return defaultTemplateActionBarConfig
  }, [posConfigData])

  // Convert template configs to component-compatible formats
  const toolbarConfig = useMemo(() => {
    return convertToolbarConfig(templateToolbarConfig)
  }, [templateToolbarConfig])

  const { actionBarConfig: convertedActionBarConfig, buttonRegistry: convertedButtonRegistry } = useMemo(() => {
    return convertActionBarConfig(templateActionBarConfig)
  }, [templateActionBarConfig])

  // Create button states based on cart state
  const buttonStates = useMemo(() => {
    const hasItems = cart.length > 0
    return new Map<string, ButtonState>(
      Object.keys(convertedButtonRegistry).map(id => [
        id,
        {
          visible: true,
          enabled: id === 'pay' || id === 'cash' || id === 'card' || id === 'void' || id === 'cancel'
            ? hasItems
            : true,
          requiresApproval: false,
        },
      ])
    )
  }, [cart.length, convertedButtonRegistry])

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

  // Handle action bar button click
  const handleActionBarClick = useCallback((buttonId: string) => {
    console.log('Action bar button clicked:', buttonId)
    switch (buttonId) {
      case 'cancel':
        handleClearCart()
        break
      case 'pay':
      case 'cash':
      case 'card':
        handlePay()
        break
      case 'void':
        // TODO: Implement void item
        alert('Void item - select an item to void')
        break
      case 'discount':
        // TODO: Implement discount
        alert('Discount - apply discount to order')
        break
      case 'hold':
        // TODO: Implement hold order
        alert('Hold - order placed on hold')
        break
      case 'member':
        // TODO: Implement member lookup
        alert('Member lookup')
        break
      case 'print':
        // TODO: Implement print receipt
        alert('Print receipt')
        break
      case 'priceCheck':
        // TODO: Implement price check
        alert('Price check mode')
        break
      default:
        console.log('Unknown action:', buttonId)
    }
  }, [handleClearCart, handlePay])

  // Toolbar callbacks
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    // TODO: Filter products based on search query
    console.log('Searching for:', query)
  }, [])

  const handleMemberLookup = useCallback(() => {
    // TODO: Open member lookup modal
    console.log('Member lookup clicked')
    alert('Member lookup - search for a member')
  }, [])

  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId)
    console.log('Category changed to:', categoryId)
  }, [])

  const handleNewTicket = useCallback(() => {
    // TODO: Create new ticket
    console.log('New ticket clicked')
    handleClearCart()
  }, [handleClearCart])

  const handleHoldTicket = useCallback(() => {
    // TODO: Hold current ticket
    console.log('Hold ticket clicked')
    alert('Ticket placed on hold')
  }, [])

  // F&B Table Operation Callbacks
  const handleOpenTable = useCallback(() => {
    // TODO: Open table selection modal
    console.log('Open table clicked')
    alert('Open Table - Select a table to take orders')
  }, [])

  const handleFloorPlan = useCallback(() => {
    // TODO: Open floor plan view
    console.log('Floor plan clicked')
    alert('Floor Plan - View restaurant table layout')
  }, [])

  const handleTransferTable = useCallback(() => {
    // TODO: Open transfer table modal
    console.log('Transfer table clicked')
    alert('Transfer Table - Move order to another table')
  }, [])

  const handleMergeTables = useCallback(() => {
    // TODO: Open merge tables modal
    console.log('Merge tables clicked')
    alert('Merge Tables - Combine multiple tables into one check')
  }, [])

  const handleSplitCheck = useCallback(() => {
    // TODO: Open split check modal
    console.log('Split check clicked')
    alert('Split Check - Divide order into separate checks')
  }, [])

  const handleTableStatus = useCallback(() => {
    // TODO: Open table status modal
    console.log('Table status clicked')
    alert('Table Status - View/change table status (available, occupied, reserved)')
  }, [])

  // Member Operation Callbacks
  const handleAttachMember = useCallback(() => {
    // TODO: Open attach member modal
    console.log('Attach member clicked')
    alert('Attach Member - Link a member to this order')
  }, [])

  const handleDetachMember = useCallback(() => {
    // TODO: Detach member from order
    console.log('Detach member clicked')
    alert('Detach Member - Remove member from this order')
  }, [])

  const handleMemberInfo = useCallback(() => {
    // TODO: Show member info panel
    console.log('Member info clicked')
    alert('Member Info - View attached member details')
  }, [])

  const handleChargeToMember = useCallback(() => {
    // TODO: Open charge to member modal
    console.log('Charge to member clicked')
    alert('Charge to Member - Bill this order to member account')
  }, [])

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
    <div className="flex flex-col h-full bg-stone-100 overflow-hidden">
      {/* POS Header */}
      <div className="flex-shrink-0 bg-white border-b border-stone-200 shadow-sm">
        {/* Top row: Date, Time, Outlet, Stats */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-stone-100">
          {/* Left: Date & Time */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-stone-700">
              <Calendar className="h-4 w-4 text-stone-500" />
              <span className="font-medium">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-stone-700">
              <Clock className="h-4 w-4 text-stone-500" />
              <span className="font-medium tabular-nums">
                {new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Center: Outlet Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOutletDropdownOpen(!isOutletDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              disabled={isLoadingOutlets}
            >
              <Store className="h-4 w-4 text-amber-600" />
              <span className="font-semibold text-amber-900">
                {isLoadingOutlets ? 'Loading...' : (selectedOutlet?.name || 'Select Outlet')}
              </span>
              {isLoadingConfig && selectedOutletId && (
                <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />
              )}
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-amber-600 transition-transform',
                  isOutletDropdownOpen && 'rotate-180'
                )}
              />
            </button>

            {isOutletDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 min-w-[220px] bg-white border border-stone-200 rounded-lg shadow-lg py-1">
                {isLoadingOutlets ? (
                  <div className="px-4 py-2 text-sm text-stone-500 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading outlets...
                  </div>
                ) : (
                  outlets.map((outlet) => (
                    <button
                      key={outlet.id}
                      type="button"
                      onClick={() => {
                        setSelectedOutletId(outlet.id)
                        setIsOutletDropdownOpen(false)
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm hover:bg-stone-50 transition-colors',
                        outlet.id === selectedOutletId &&
                          'bg-amber-50 text-amber-700 font-medium'
                      )}
                    >
                      {outlet.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right: Session Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
              <div className="text-sm">
                <span className="font-semibold text-blue-900">3</span>
                <span className="text-blue-600 ml-1">Servers</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
              <UserCheck className="h-4 w-4 text-emerald-600" />
              <div className="text-sm">
                <span className="font-semibold text-emerald-900">24</span>
                <span className="text-emerald-600 ml-1">Pax</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: Server info and actions */}
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left: Current Server */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-semibold">
              SJ
            </div>
            <div>
              <p className="font-semibold text-stone-900">Sarah Johnson</p>
              <p className="text-xs text-stone-500">Server • Shift started 8:00 AM</p>
            </div>
          </div>

          {/* Center: Quick stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-stone-500">Tables</p>
              <p className="font-semibold text-stone-900">4 / 8</p>
            </div>
            <div className="text-center">
              <p className="text-stone-500">Orders</p>
              <p className="font-semibold text-stone-900">12</p>
            </div>
            <div className="text-center">
              <p className="text-stone-500">Sales</p>
              <p className="font-semibold text-emerald-600">$847.50</p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sync
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
            >
              <LogOut className="h-4 w-4" />
              End Shift
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <POSToolbar
        toolbarConfig={toolbarConfig}
        onSearch={handleSearch}
        onMemberLookup={handleMemberLookup}
        onCategoryChange={handleCategoryChange}
        onNewTicket={handleNewTicket}
        onHoldTicket={handleHoldTicket}
        // F&B Table Operations
        onOpenTable={handleOpenTable}
        onFloorPlan={handleFloorPlan}
        onTransferTable={handleTransferTable}
        onMergeTables={handleMergeTables}
        onSplitCheck={handleSplitCheck}
        onTableStatus={handleTableStatus}
        // Member Operations
        onAttachMember={handleAttachMember}
        onDetachMember={handleDetachMember}
        onMemberInfo={handleMemberInfo}
        onChargeToMember={handleChargeToMember}
        categories={mockCategories.map(c => ({ id: c.id, name: c.name }))}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        className="flex-shrink-0"
      />

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
        {/* Product Panel */}
        <div className="flex-1 min-w-0 p-4 overflow-hidden">
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
        <div className="w-80 lg:w-96 flex-shrink-0 bg-white border-l border-stone-200 flex flex-col overflow-hidden">
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

      {/* Action Bar at Bottom - Using converted template config */}
      <POSActionBar
        actionBarConfig={convertedActionBarConfig}
        buttonStates={buttonStates}
        buttonRegistry={convertedButtonRegistry}
        onButtonClick={handleActionBarClick}
        className="shrink-0"
      />
    </div>
  )
}

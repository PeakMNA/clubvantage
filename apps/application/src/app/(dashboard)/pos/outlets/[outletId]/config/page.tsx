'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import {
  ArrowLeft,
  Loader2,
  Layout,
  Package,
  Zap,
  Search,
  Eye,
  EyeOff,
  Plus,
  X,
  GripVertical,
  Settings,
  Palette,
  AlertCircle,
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'
import { POSGridPreview, cn } from '@clubvantage/ui'
import {
  useGetPosOutletQuery,
  useGetPosTemplatesQuery,
  useAssignPosTemplateMutation,
} from '@clubvantage/api-client'
import { useQueryClient } from '@tanstack/react-query'
import {
  VisibilityRulesBuilder,
  type VisibilityRule,
} from '@/components/pos'

// ============================================================================
// Types
// ============================================================================

interface ProductConfig {
  id: string
  name: string
  category: string
  isVisible: boolean
  displayNameOverride: string | null
  buttonColor: string | null
  isQuickKey: boolean
  quickKeyPosition: number | null
  visibilityRules: VisibilityRule[]
}

interface TemplateConfig {
  gridColumns: number
  gridRows: number
  tileSize: 'SMALL' | 'MEDIUM' | 'LARGE'
  showImages: boolean
  showPrices: boolean
  categoryStyle: 'TABS' | 'SIDEBAR' | 'DROPDOWN'
  showAllCategory: boolean
  quickKeysEnabled: boolean
  quickKeysCount: number
  quickKeysPosition: 'TOP' | 'LEFT'
  suggestionsEnabled: boolean
  suggestionsCount: number
  suggestionsPosition: 'TOP' | 'SIDEBAR' | 'FLOATING'
}

type TabKey = 'template' | 'products' | 'quickkeys'

// ============================================================================
// Mock Data
// ============================================================================

const mockOutlet = {
  id: 'outlet-1',
  name: 'Main Restaurant',
  templateId: 'template-1',
  outletType: 'RESTAURANT',
}

const mockProducts: ProductConfig[] = [
  {
    id: 'prod-1',
    name: 'Grilled Burger',
    category: 'Food',
    isVisible: true,
    displayNameOverride: null,
    buttonColor: null,
    isQuickKey: true,
    quickKeyPosition: 1,
    visibilityRules: [],
  },
  {
    id: 'prod-2',
    name: 'Caesar Salad',
    category: 'Food',
    isVisible: true,
    displayNameOverride: 'Caesar',
    buttonColor: '#22c55e',
    isQuickKey: true,
    quickKeyPosition: 2,
    visibilityRules: [],
  },
  {
    id: 'prod-3',
    name: 'Fish & Chips',
    category: 'Food',
    isVisible: true,
    displayNameOverride: null,
    buttonColor: null,
    isQuickKey: true,
    quickKeyPosition: 3,
    visibilityRules: [],
  },
  {
    id: 'prod-4',
    name: 'Club Sandwich',
    category: 'Food',
    isVisible: true,
    displayNameOverride: null,
    buttonColor: null,
    isQuickKey: false,
    quickKeyPosition: null,
    visibilityRules: [],
  },
  {
    id: 'prod-5',
    name: 'Coca-Cola',
    category: 'Beverages',
    isVisible: true,
    displayNameOverride: 'Coke',
    buttonColor: '#ef4444',
    isQuickKey: true,
    quickKeyPosition: 4,
    visibilityRules: [],
  },
  {
    id: 'prod-6',
    name: 'Sprite',
    category: 'Beverages',
    isVisible: true,
    displayNameOverride: null,
    buttonColor: '#22c55e',
    isQuickKey: true,
    quickKeyPosition: 5,
    visibilityRules: [],
  },
  {
    id: 'prod-7',
    name: 'Orange Juice',
    category: 'Beverages',
    isVisible: false,
    displayNameOverride: 'OJ',
    buttonColor: '#f97316',
    isQuickKey: false,
    quickKeyPosition: null,
    visibilityRules: [
      {
        id: 'rule-1',
        type: 'TIME_OF_DAY',
        operator: 'BETWEEN',
        value: { start: '06:00', end: '11:00' },
      },
    ],
  },
  {
    id: 'prod-8',
    name: 'House Red Wine',
    category: 'Beverages',
    isVisible: true,
    displayNameOverride: 'Red Wine',
    buttonColor: '#7c3aed',
    isQuickKey: true,
    quickKeyPosition: 6,
    visibilityRules: [],
  },
  {
    id: 'prod-9',
    name: 'Chocolate Cake',
    category: 'Desserts',
    isVisible: true,
    displayNameOverride: null,
    buttonColor: null,
    isQuickKey: false,
    quickKeyPosition: null,
    visibilityRules: [],
  },
  {
    id: 'prod-10',
    name: 'Ice Cream Sundae',
    category: 'Desserts',
    isVisible: true,
    displayNameOverride: 'Sundae',
    buttonColor: '#ec4899',
    isQuickKey: false,
    quickKeyPosition: null,
    visibilityRules: [],
  },
  {
    id: 'prod-11',
    name: 'French Fries',
    category: 'Sides',
    isVisible: true,
    displayNameOverride: 'Fries',
    buttonColor: '#eab308',
    isQuickKey: true,
    quickKeyPosition: 7,
    visibilityRules: [],
  },
  {
    id: 'prod-12',
    name: 'Onion Rings',
    category: 'Sides',
    isVisible: true,
    displayNameOverride: null,
    buttonColor: null,
    isQuickKey: true,
    quickKeyPosition: 8,
    visibilityRules: [],
  },
]

const mockTemplates = [
  {
    id: 'template-1',
    name: 'Standard Restaurant',
    description: 'Default layout with quick keys and suggestions',
    outletType: 'RESTAURANT',
    config: {
      gridColumns: 6,
      gridRows: 4,
      tileSize: 'MEDIUM' as const,
      showImages: true,
      showPrices: true,
      categoryStyle: 'TABS' as const,
      showAllCategory: true,
      quickKeysEnabled: true,
      quickKeysCount: 8,
      quickKeysPosition: 'TOP' as const,
      suggestionsEnabled: true,
      suggestionsCount: 6,
      suggestionsPosition: 'TOP' as const,
    },
  },
  {
    id: 'template-2',
    name: 'Compact Layout',
    description: 'Smaller tiles for more items on screen',
    outletType: 'RESTAURANT',
    config: {
      gridColumns: 8,
      gridRows: 5,
      tileSize: 'SMALL' as const,
      showImages: false,
      showPrices: true,
      categoryStyle: 'DROPDOWN' as const,
      showAllCategory: true,
      quickKeysEnabled: true,
      quickKeysCount: 12,
      quickKeysPosition: 'LEFT' as const,
      suggestionsEnabled: false,
      suggestionsCount: 0,
      suggestionsPosition: 'TOP' as const,
    },
  },
  {
    id: 'template-3',
    name: 'Visual Menu',
    description: 'Large tiles with images for visual selection',
    outletType: 'RESTAURANT',
    config: {
      gridColumns: 4,
      gridRows: 3,
      tileSize: 'LARGE' as const,
      showImages: true,
      showPrices: true,
      categoryStyle: 'SIDEBAR' as const,
      showAllCategory: true,
      quickKeysEnabled: false,
      quickKeysCount: 0,
      quickKeysPosition: 'TOP' as const,
      suggestionsEnabled: true,
      suggestionsCount: 4,
      suggestionsPosition: 'FLOATING' as const,
    },
  },
]

// ============================================================================
// Tab Navigation Component
// ============================================================================

const TABS: { key: TabKey; label: string; icon: typeof Layout }[] = [
  { key: 'template', label: 'Template', icon: Layout },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'quickkeys', label: 'Quick Keys', icon: Zap },
]

interface TabNavProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
}

function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="flex gap-1 p-1 bg-stone-100 rounded-lg">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
              isActive
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

// ============================================================================
// Template Tab Component
// ============================================================================

interface TemplateTabProps {
  currentTemplateId: string | null
  templates: typeof mockTemplates
  onApplyTemplate: (templateId: string) => void
  isApplying: boolean
}

function TemplateTab({
  currentTemplateId,
  templates,
  onApplyTemplate,
  isApplying,
}: TemplateTabProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    currentTemplateId || templates[0]?.id || ''
  )

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)
  const hasChanged = selectedTemplateId !== currentTemplateId

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Template Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Select Template
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTemplate && (
            <div className="p-4 bg-stone-50 rounded-lg">
              <h4 className="font-medium text-stone-900 mb-1">
                {selectedTemplate.name}
              </h4>
              <p className="text-sm text-stone-500">
                {selectedTemplate.description}
              </p>
            </div>
          )}

          {hasChanged && (
            <Button
              onClick={() => onApplyTemplate(selectedTemplateId)}
              disabled={isApplying}
              className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
            >
              {isApplying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                'Apply Template'
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Layout Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <POSGridPreview
                columns={selectedTemplate.config.gridColumns}
                rows={selectedTemplate.config.gridRows}
                tileSize={selectedTemplate.config.tileSize.toLowerCase() as 'small' | 'medium' | 'large'}
                showImages={selectedTemplate.config.showImages}
                showPrices={selectedTemplate.config.showPrices}
                quickKeysEnabled={selectedTemplate.config.quickKeysEnabled}
                quickKeysPosition={selectedTemplate.config.quickKeysPosition.toLowerCase() as 'top' | 'left'}
                quickKeysCount={selectedTemplate.config.quickKeysCount}
                suggestionsEnabled={selectedTemplate.config.suggestionsEnabled}
                categoryStyle={selectedTemplate.config.categoryStyle.toLowerCase() as 'tabs' | 'sidebar' | 'dropdown'}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Template Override (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-500 mb-4">
            Override template settings specifically for this outlet. These settings will take
            precedence over the base template configuration.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableOverride"
              className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
            />
            <label htmlFor="enableOverride" className="text-sm text-stone-700">
              Enable custom overrides for this outlet
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// Product Config Modal Component
// ============================================================================

interface ProductConfigModalProps {
  product: ProductConfig | null
  isOpen: boolean
  onClose: () => void
  onSave: (product: ProductConfig) => void
}

function ProductConfigModal({
  product,
  isOpen,
  onClose,
  onSave,
}: ProductConfigModalProps) {
  const [formData, setFormData] = useState<ProductConfig | null>(null)

  useEffect(() => {
    if (product) {
      setFormData({ ...product })
    }
  }, [product])

  if (!isOpen || !formData) return null

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  const predefinedColors = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#14b8a6', // teal
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
  ]

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-stone-200">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                Configure Product
              </h2>
              <p className="text-sm text-stone-500 mt-0.5">
                {formData.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Display Name Override */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Display Name Override
              </label>
              <input
                type="text"
                value={formData.displayNameOverride || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displayNameOverride: e.target.value || null,
                  })
                }
                placeholder={formData.name}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <p className="text-xs text-stone-400 mt-1">
                Leave empty to use the default product name
              </p>
            </div>

            {/* Button Color */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Button Color
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    setFormData({ ...formData, buttonColor: null })
                  }
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 transition-all',
                    formData.buttonColor === null
                      ? 'border-amber-500 ring-2 ring-amber-200'
                      : 'border-stone-200 hover:border-stone-300'
                  )}
                >
                  <span className="text-xs text-stone-400">Auto</span>
                </button>
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setFormData({ ...formData, buttonColor: color })
                    }
                    className={cn(
                      'w-8 h-8 rounded-lg border-2 transition-all',
                      formData.buttonColor === color
                        ? 'border-amber-500 ring-2 ring-amber-200'
                        : 'border-transparent hover:border-stone-300'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
              <div className="flex items-center gap-3">
                {formData.isVisible ? (
                  <Eye className="h-5 w-5 text-emerald-500" />
                ) : (
                  <EyeOff className="h-5 w-5 text-stone-400" />
                )}
                <div>
                  <span className="text-sm font-medium text-stone-900">
                    Visibility
                  </span>
                  <p className="text-xs text-stone-500">
                    {formData.isVisible
                      ? 'Product is visible on POS'
                      : 'Product is hidden from POS'}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setFormData({
                    ...formData,
                    isVisible: !formData.isVisible,
                  })
                }
                className={cn(
                  'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors',
                  formData.isVisible ? 'bg-emerald-500' : 'bg-stone-200'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5',
                    formData.isVisible ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>

            {/* Quick Key Toggle */}
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Zap
                  className={cn(
                    'h-5 w-5',
                    formData.isQuickKey
                      ? 'text-amber-500'
                      : 'text-stone-400'
                  )}
                />
                <div>
                  <span className="text-sm font-medium text-stone-900">
                    Quick Key
                  </span>
                  <p className="text-xs text-stone-500">
                    {formData.isQuickKey
                      ? `Position ${formData.quickKeyPosition}`
                      : 'Not assigned to quick keys'}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setFormData({
                    ...formData,
                    isQuickKey: !formData.isQuickKey,
                    quickKeyPosition: formData.isQuickKey
                      ? null
                      : 16, // Assign to last position
                  })
                }
                className={cn(
                  'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors',
                  formData.isQuickKey ? 'bg-amber-500' : 'bg-stone-200'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5',
                    formData.isQuickKey ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>

            {/* Visibility Rules */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Visibility Rules
              </label>
              <p className="text-xs text-stone-500 mb-3">
                Define conditions when this product should be visible
              </p>
              <VisibilityRulesBuilder
                rules={formData.visibilityRules}
                onChange={(rules) =>
                  setFormData({ ...formData, visibilityRules: rules })
                }
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-stone-200">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================================================
// Products Tab Component
// ============================================================================

interface ProductsTabProps {
  products: ProductConfig[]
  onUpdateProduct: (product: ProductConfig) => void
  onBulkAction: (action: 'show' | 'hide' | 'reset') => void
}

function ProductsTab({
  products,
  onUpdateProduct,
  onBulkAction,
}: ProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<ProductConfig | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const categories = ['all', ...new Set(products.map((p) => p.category))]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.displayNameOverride?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesCategory =
      categoryFilter === 'all' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleRowClick = (product: ProductConfig) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleSaveProduct = (updatedProduct: ProductConfig) => {
    onUpdateProduct(updatedProduct)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('show')}
          >
            Show All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('hide')}
          >
            Hide All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('reset')}
          >
            Reset to Template
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-stone-500 bg-stone-50">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium text-center">Visibility</th>
                  <th className="px-4 py-3 font-medium">Display Name</th>
                  <th className="px-4 py-3 font-medium text-center">Quick Key</th>
                  <th className="px-4 py-3 font-medium text-center">Rules</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-stone-50 cursor-pointer"
                    onClick={() => handleRowClick(product)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {product.buttonColor && (
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: product.buttonColor }}
                          />
                        )}
                        <span className="font-medium text-stone-900">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-stone-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onUpdateProduct({
                            ...product,
                            isVisible: !product.isVisible,
                          })
                        }}
                        className={cn(
                          'inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
                          product.isVisible
                            ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                            : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                        )}
                      >
                        {product.isVisible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'text-sm',
                          product.displayNameOverride
                            ? 'text-amber-600 font-medium'
                            : 'text-stone-400'
                        )}
                      >
                        {product.displayNameOverride || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {product.isQuickKey ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-100 text-amber-700 text-xs font-bold">
                          {product.quickKeyPosition}
                        </span>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {product.visibilityRules.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                          {product.visibilityRules.length} rule
                          {product.visibilityRules.length !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRowClick(product)
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500">No products found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Config Modal */}
      <ProductConfigModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
      />
    </div>
  )
}

// ============================================================================
// Quick Keys Tab Component
// ============================================================================

interface QuickKeysTabProps {
  products: ProductConfig[]
  quickKeysCount: number
  onAssignQuickKey: (productId: string, position: number) => void
  onRemoveQuickKey: (productId: string) => void
}

function QuickKeysTab({
  products,
  quickKeysCount,
  onAssignQuickKey,
  onRemoveQuickKey,
}: QuickKeysTabProps) {
  const [showProductPicker, setShowProductPicker] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const quickKeys = Array.from({ length: quickKeysCount }, (_, i) => {
    const position = i + 1
    const product = products.find((p) => p.quickKeyPosition === position)
    return { position, product }
  })

  const availableProducts = products.filter(
    (p) => !p.isQuickKey && p.isVisible
  )

  const filteredAvailableProducts = availableProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddProduct = (position: number) => {
    setSelectedPosition(position)
    setShowProductPicker(true)
    setSearchQuery('')
  }

  const handleSelectProduct = (productId: string) => {
    if (selectedPosition !== null) {
      onAssignQuickKey(productId, selectedPosition)
      setShowProductPicker(false)
      setSelectedPosition(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Quick Key Grid</CardTitle>
              <p className="text-sm text-stone-500 mt-1">
                Drag and drop to reorder, or click + to add products
              </p>
            </div>
            <span className="text-sm text-stone-500">
              {quickKeys.filter((qk) => qk.product).length} / {quickKeysCount}{' '}
              assigned
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${Math.min(quickKeysCount, 8)}, 1fr)`,
            }}
          >
            {quickKeys.map((qk) => (
              <div
                key={qk.position}
                className={cn(
                  'relative aspect-square rounded-xl border-2 transition-all',
                  qk.product
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-dashed border-stone-200 bg-stone-50 hover:border-amber-300 hover:bg-amber-50/50'
                )}
              >
                {qk.product ? (
                  <div className="absolute inset-0 p-2 flex flex-col">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-amber-600">
                        {qk.position}
                      </span>
                      <button
                        onClick={() => onRemoveQuickKey(qk.product!.id)}
                        className="p-1 rounded-full hover:bg-red-100 text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <GripVertical className="h-4 w-4 text-stone-300 mb-1 cursor-move" />
                      {qk.product.buttonColor && (
                        <div
                          className="w-6 h-6 rounded-lg mb-1"
                          style={{ backgroundColor: qk.product.buttonColor }}
                        />
                      )}
                      <span className="text-xs font-medium text-stone-700 line-clamp-2">
                        {qk.product.displayNameOverride || qk.product.name}
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddProduct(qk.position)}
                    className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 hover:text-amber-500 transition-colors"
                  >
                    <span className="text-xs font-bold mb-2">{qk.position}</span>
                    <Plus className="h-5 w-5" />
                    <span className="text-[10px] mt-1">Add Product</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Picker Modal */}
      {showProductPicker && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => setShowProductPicker(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center justify-between p-4 border-b border-stone-200">
                <div>
                  <h3 className="font-semibold text-stone-900">
                    Add Quick Key
                  </h3>
                  <p className="text-sm text-stone-500">
                    Position {selectedPosition}
                  </p>
                </div>
                <button
                  onClick={() => setShowProductPicker(false)}
                  className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 border-b border-stone-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    autoFocus
                  />
                </div>
              </div>

              <div className="overflow-y-auto max-h-[50vh]">
                {filteredAvailableProducts.length > 0 ? (
                  <div className="divide-y">
                    {filteredAvailableProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSelectProduct(product.id)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-amber-50 transition-colors text-left"
                      >
                        {product.buttonColor && (
                          <div
                            className="w-8 h-8 rounded-lg flex-shrink-0"
                            style={{ backgroundColor: product.buttonColor }}
                          />
                        )}
                        <div>
                          <span className="font-medium text-stone-900">
                            {product.name}
                          </span>
                          <span className="block text-xs text-stone-500">
                            {product.category}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-500">
                      {searchQuery
                        ? 'No matching products'
                        : 'No available products'}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      Products must be visible and not already assigned
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function OutletConfigPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const outletId = params.outletId as string

  // State
  const [activeTab, setActiveTab] = useState<TabKey>('template')
  const [products, setProducts] = useState<ProductConfig[]>(mockProducts)
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false)

  // Use mock data for now, with real queries available
  // In production, replace with: useGetPosOutletQuery({ id: outletId })
  const outlet = mockOutlet
  const templates = mockTemplates
  const isLoading = false
  const error = null

  // Find current template
  const currentTemplate = templates.find((t) => t.id === outlet.templateId)
  const quickKeysCount = currentTemplate?.config.quickKeysCount ?? 8

  // Handlers
  const handleApplyTemplate = useCallback(async (templateId: string) => {
    setIsApplyingTemplate(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // In production, use: assignMutation.mutateAsync({ input: { outletId, templateId } })
    console.log('Apply template:', templateId)
    setIsApplyingTemplate(false)
  }, [])

  const handleUpdateProduct = useCallback((updatedProduct: ProductConfig) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    )
  }, [])

  const handleBulkAction = useCallback((action: 'show' | 'hide' | 'reset') => {
    setProducts((prev) =>
      prev.map((p) => {
        switch (action) {
          case 'show':
            return { ...p, isVisible: true }
          case 'hide':
            return { ...p, isVisible: false }
          case 'reset':
            return {
              ...p,
              isVisible: true,
              displayNameOverride: null,
              buttonColor: null,
              visibilityRules: [],
            }
          default:
            return p
        }
      })
    )
  }, [])

  const handleAssignQuickKey = useCallback(
    (productId: string, position: number) => {
      setProducts((prev) =>
        prev.map((p) => {
          // Remove from old position if exists
          if (p.quickKeyPosition === position) {
            return { ...p, isQuickKey: false, quickKeyPosition: null }
          }
          // Assign to new position
          if (p.id === productId) {
            return { ...p, isQuickKey: true, quickKeyPosition: position }
          }
          return p
        })
      )
    },
    []
  )

  const handleRemoveQuickKey = useCallback((productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, isQuickKey: false, quickKeyPosition: null }
          : p
      )
    )
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
          <p className="mt-2 text-sm text-stone-500">Loading outlet configuration...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card className="py-12 border-red-200 bg-red-50/50">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-red-700 font-medium">Failed to load outlet</p>
            <p className="text-sm text-red-500 mt-1">{String(error)}</p>
            <Button
              variant="outline"
              className="mt-4 border-red-200 text-red-700 hover:bg-red-100"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <button
          onClick={() => router.push('/pos/outlets')}
          className="hover:text-stone-700"
        >
          POS
        </button>
        <span>/</span>
        <button
          onClick={() => router.push('/pos/outlets')}
          className="hover:text-stone-700"
        >
          Outlets
        </button>
        <span>/</span>
        <span className="text-stone-700">{outlet.name}</span>
        <span>/</span>
        <span className="text-amber-600 font-medium">Configuration</span>
      </div>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/pos/outlets')}
            className="mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">
              {outlet.name} Configuration
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Configure POS layout and product visibility for this outlet
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'template' && (
          <TemplateTab
            currentTemplateId={outlet.templateId}
            templates={templates}
            onApplyTemplate={handleApplyTemplate}
            isApplying={isApplyingTemplate}
          />
        )}

        {activeTab === 'products' && (
          <ProductsTab
            products={products}
            onUpdateProduct={handleUpdateProduct}
            onBulkAction={handleBulkAction}
          />
        )}

        {activeTab === 'quickkeys' && (
          <QuickKeysTab
            products={products}
            quickKeysCount={quickKeysCount}
            onAssignQuickKey={handleAssignQuickKey}
            onRemoveQuickKey={handleRemoveQuickKey}
          />
        )}
      </div>
    </div>
  )
}

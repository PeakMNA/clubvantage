'use client'

import * as React from 'react'
import { cn } from '../lib/utils'
import { Search, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '../primitives/input'
import { Button } from '../primitives/button'
import { type POSCategory } from './pos-category-nav'
import { type POSProduct } from './pos-product-panel'

export interface POSProductGridProps {
  products: POSProduct[]
  categories: POSCategory[]
  onAddItem: (product: POSProduct) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  selectedCategory?: string
  onCategoryChange?: (categoryId: string) => void
  itemsPerPage?: number
  className?: string
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

// ============================================================================
// Sub-components
// ============================================================================

interface ProductCardProps {
  product: POSProduct
  onClick: () => void
}

function ProductCard({ product, onClick }: ProductCardProps) {
  const isOutOfStock = product.inStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isOutOfStock}
      className={cn(
        'relative flex flex-col items-center p-2.5 rounded-lg border transition-all',
        'bg-white hover:bg-stone-50 hover:border-amber-300 hover:shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1',
        isOutOfStock && 'opacity-50 cursor-not-allowed hover:bg-white hover:border-stone-200 hover:shadow-none'
      )}
      aria-label={`Add ${product.name} to cart - ${formatCurrency(product.price)}`}
      aria-disabled={isOutOfStock}
    >
      {/* Product Image / Placeholder */}
      <div className="w-10 h-10 mb-1.5 rounded bg-stone-100 flex items-center justify-center overflow-hidden flex-shrink-0">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-5 w-5 text-stone-400" />
        )}
      </div>

      {/* Product Name */}
      <span className="text-xs font-medium text-stone-900 text-center line-clamp-2 leading-tight min-h-[2rem]">
        {product.name}
      </span>

      {/* SKU (optional) */}
      {product.sku && (
        <span className="text-[10px] text-stone-400 mt-0.5">
          {product.sku}
        </span>
      )}

      {/* Price */}
      <span className="text-xs font-semibold text-amber-600 mt-0.5">
        {formatCurrency(product.price)}
      </span>

      {/* Out of Stock Badge */}
      {isOutOfStock && (
        <div className="absolute -top-1 -right-1 px-1 py-0.5 bg-red-500 text-white text-[9px] font-medium rounded shadow-sm">
          Out of Stock
        </div>
      )}

      {/* Low Stock Badge */}
      {!isOutOfStock && product.stockQuantity !== undefined && product.stockQuantity > 0 && product.stockQuantity <= 5 && (
        <div className="absolute -top-1 -right-1 px-1 py-0.5 bg-amber-500 text-white text-[9px] font-medium rounded shadow-sm">
          Low: {product.stockQuantity}
        </div>
      )}
    </button>
  )
}

interface CategoryTabsProps {
  categories: POSCategory[]
  selectedCategory?: string
  onCategoryChange?: (categoryId: string) => void
}

function CategoryTabs({ categories, selectedCategory, onCategoryChange }: CategoryTabsProps) {
  const allCategories = [{ id: 'all', name: 'All' }, ...categories]

  return (
    <div
      className="flex items-center gap-1 overflow-x-auto pb-1"
      role="tablist"
      aria-label="Product categories"
    >
      {allCategories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange?.(category.id)}
          role="tab"
          aria-selected={selectedCategory === category.id || (!selectedCategory && category.id === 'all')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors',
            (selectedCategory === category.id || (!selectedCategory && category.id === 'all'))
              ? 'bg-amber-500 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
}

function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: PaginationProps) {
  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push('ellipsis')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }

      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-stone-200 bg-stone-50">
      <span className="text-xs text-stone-500">
        {startItem}-{endItem} of {totalItems}
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-7 w-7"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((page, index) => (
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-1 text-stone-400">...</span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onPageChange(page)}
              className={cn(
                'h-7 w-7 text-xs',
                currentPage === page && 'bg-amber-500 hover:bg-amber-600 text-white'
              )}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </Button>
          )
        ))}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-7 w-7"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function POSProductGrid({
  products,
  categories,
  onAddItem,
  searchQuery = '',
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  itemsPerPage = 18,
  className,
}: POSProductGridProps) {
  const [currentPage, setCurrentPage] = React.useState(1)

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

  // Filter products based on search query and category
  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory && selectedCategory !== 'all' && product.categoryId !== selectedCategory) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = product.name.toLowerCase().includes(query)
        const matchesSku = product.sku?.toLowerCase().includes(query)
        return matchesName || matchesSku
      }

      return true
    })
  }, [products, selectedCategory, searchQuery])

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProducts, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className={cn('flex flex-col min-h-0', className)}>
      {/* Search Bar */}
      <div className="px-3 py-2 border-b border-stone-200 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <Input
            type="search"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-8 h-8 text-sm bg-stone-50 border-stone-200 focus:bg-white"
            aria-label="Search products"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-3 py-2 border-b border-stone-200 bg-stone-50 flex-shrink-0">
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      </div>

      {/* Product Grid - scrollable area with fixed height */}
      <div className="flex-1 overflow-y-auto min-h-0 p-3">
        {paginatedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="mb-3 rounded-full bg-stone-100 p-3 text-stone-400">
              <Package className="h-6 w-6" />
            </div>
            <p className="text-stone-600 font-medium text-sm">No products found</p>
            <p className="text-xs text-stone-500 mt-1">
              {searchQuery
                ? 'Try adjusting your search or filter'
                : 'No products available in this category'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onAddItem(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination - fixed at bottom */}
      <div className="flex-shrink-0">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={filteredProducts.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  )
}

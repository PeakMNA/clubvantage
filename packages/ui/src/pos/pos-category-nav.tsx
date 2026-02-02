'use client'

import { useState, useRef, useEffect } from 'react'
import * as LucideIcons from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../lib/utils'

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

// Helper component to render dynamic Lucide icons
function CategoryIcon({
  iconName,
  className,
}: {
  iconName: string
  className?: string
}) {
  // Get the icon component from LucideIcons
  // Cast through unknown to avoid type incompatibility with createLucideIcon function
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>
  const IconComponent = icons[iconName]

  if (!IconComponent || typeof IconComponent !== 'function') {
    return null
  }

  return <IconComponent className={className} />
}

// Check if a color is dark (for text contrast)
function isColorDark(hexColor: string): boolean {
  // Remove # if present
  const hex = hexColor.replace('#', '')

  // Handle 3-character hex
  const fullHex = hex.length === 3
    ? hex.split('').map(c => c + c).join('')
    : hex

  // Parse RGB values
  const r = parseInt(fullHex.substring(0, 2), 16)
  const g = parseInt(fullHex.substring(2, 4), 16)
  const b = parseInt(fullHex.substring(4, 6), 16)

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance < 0.5
}

export function POSCategoryNav({
  categories,
  selectedCategoryId,
  displayStyle = 'tabs',
  showAllCategory = true,
  onCategoryChange,
  className,
}: POSCategoryNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  // Build the full category list including "All" if needed
  const allCategories: Array<POSCategory | { id: null; name: string }> = showAllCategory
    ? [{ id: null, name: 'All' }, ...categories]
    : categories

  // Find the currently selected category
  const selectedCategory = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId)
    : showAllCategory
      ? { id: null, name: 'All' }
      : null

  // Render category button content
  const renderCategoryContent = (
    category: POSCategory | { id: null; name: string },
    isSelected: boolean
  ) => {
    const hasIcon = 'iconName' in category && category.iconName
    const categoryColor = 'color' in category ? category.color : undefined

    return (
      <>
        {hasIcon && (
          <CategoryIcon
            iconName={category.iconName!}
            className="h-3.5 w-3.5 flex-shrink-0"
          />
        )}
        <span className="truncate">{category.name}</span>
      </>
    )
  }

  // Get button styles based on selection state and category color
  const getButtonStyles = (
    category: POSCategory | { id: null; name: string },
    isSelected: boolean,
    baseStyles: string
  ) => {
    const categoryColor = 'color' in category ? category.color : undefined

    if (isSelected && categoryColor) {
      const useWhiteText = isColorDark(categoryColor)
      return {
        className: cn(
          baseStyles,
          useWhiteText ? 'text-white' : 'text-stone-900'
        ),
        style: { backgroundColor: categoryColor },
      }
    }

    if (isSelected) {
      return {
        className: cn(baseStyles, 'bg-amber-500 text-white'),
        style: undefined,
      }
    }

    return {
      className: cn(
        baseStyles,
        'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
      ),
      style: undefined,
    }
  }

  // Tabs display mode
  if (displayStyle === 'tabs') {
    return (
      <div
        className={cn(
          'flex gap-1 overflow-x-auto px-3 py-2 bg-stone-50 border-b',
          className
        )}
        role="tablist"
        aria-label="Product categories"
      >
        {allCategories.map((category) => {
          const isSelected = category.id === selectedCategoryId
          const buttonProps = getButtonStyles(
            category,
            isSelected,
            'px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap flex items-center gap-1.5 transition-colors'
          )

          return (
            <button
              key={category.id ?? 'all'}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onCategoryChange(category.id)}
              className={buttonProps.className}
              style={buttonProps.style}
            >
              {renderCategoryContent(category, isSelected)}
            </button>
          )
        })}
      </div>
    )
  }

  // Sidebar display mode
  if (displayStyle === 'sidebar') {
    return (
      <div
        className={cn(
          'flex flex-col gap-1 p-2 bg-stone-50 border-r w-32 overflow-y-auto',
          className
        )}
        role="navigation"
        aria-label="Product categories"
      >
        {allCategories.map((category) => {
          const isSelected = category.id === selectedCategoryId
          const buttonProps = getButtonStyles(
            category,
            isSelected,
            'px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors w-full text-left'
          )

          return (
            <button
              key={category.id ?? 'all'}
              type="button"
              aria-current={isSelected ? 'page' : undefined}
              onClick={() => onCategoryChange(category.id)}
              className={buttonProps.className}
              style={buttonProps.style}
            >
              {renderCategoryContent(category, isSelected)}
            </button>
          )
        })}
      </div>
    )
  }

  // Dropdown display mode
  return (
    <div
      ref={dropdownRef}
      className={cn('relative inline-block', className)}
    >
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-haspopup="listbox"
        aria-expanded={dropdownOpen}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md',
          'bg-white text-stone-600 border border-stone-200',
          'hover:bg-stone-50 transition-colors',
          'min-w-[120px] justify-between'
        )}
      >
        <span className="flex items-center gap-1.5 truncate">
          {selectedCategory && 'iconName' in selectedCategory && selectedCategory.iconName && (
            <CategoryIcon
              iconName={selectedCategory.iconName}
              className="h-3.5 w-3.5 flex-shrink-0"
            />
          )}
          <span className="truncate">
            {selectedCategory?.name ?? 'Select category'}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 flex-shrink-0 transition-transform',
            dropdownOpen && 'rotate-180'
          )}
        />
      </button>

      {dropdownOpen && (
        <div
          role="listbox"
          className={cn(
            'absolute top-full left-0 mt-1 z-50',
            'min-w-[160px] max-h-64 overflow-y-auto',
            'bg-white border border-stone-200 rounded-md shadow-lg',
            'py-1'
          )}
        >
          {allCategories.map((category) => {
            const isSelected = category.id === selectedCategoryId
            const categoryColor = 'color' in category ? category.color : undefined

            return (
              <button
                key={category.id ?? 'all'}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onCategoryChange(category.id)
                  setDropdownOpen(false)
                }}
                className={cn(
                  'w-full px-3 py-1.5 text-xs font-medium',
                  'flex items-center gap-1.5 text-left',
                  'hover:bg-stone-50 transition-colors',
                  isSelected && 'bg-amber-50 text-amber-700'
                )}
              >
                {categoryColor && (
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: categoryColor }}
                  />
                )}
                {'iconName' in category && category.iconName && (
                  <CategoryIcon
                    iconName={category.iconName}
                    className="h-3.5 w-3.5 flex-shrink-0 text-stone-500"
                  />
                )}
                <span className="truncate">{category.name}</span>
                {isSelected && (
                  <LucideIcons.Check className="h-3.5 w-3.5 ml-auto flex-shrink-0 text-amber-600" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

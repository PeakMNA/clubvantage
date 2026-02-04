'use client'

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

// Tile size dimensions for preview (scaled down)
const tileSizeVariants = {
  small: { width: 40, height: 48 },
  medium: { width: 56, height: 64 },
  large: { width: 72, height: 80 },
}

// Sample colors for variety in preview tiles
const sampleColors = [
  '#fcd34d', // amber-300
  '#a3e635', // lime-400
  '#22d3ee', // cyan-400
  '#a78bfa', // violet-400
  '#fb7185', // rose-400
  '#f97316', // orange-500
  '#60a5fa', // blue-400
  '#34d399', // emerald-400
]

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
  const tileConfig = tileSizeVariants[tileSize]

  // Generate tile placeholders
  const totalTiles = columns * rows
  const tiles = Array.from({ length: totalTiles }, (_, i) => ({
    id: i,
    color: sampleColors[i % sampleColors.length],
  }))

  return (
    <div className={cn('inline-block', className)}>
      <div
        className={cn(
          'bg-white border-2 border-dashed border-stone-300 rounded-lg p-2',
          'flex',
          quickKeysEnabled && quickKeysPosition === 'left' ? 'flex-row' : 'flex-col'
        )}
      >
        {/* Quick Keys Bar - Left Position */}
        {quickKeysEnabled && quickKeysPosition === 'left' && (
          <QuickKeysPreview
            count={quickKeysCount}
            position="left"
          />
        )}

        <div className="flex flex-col">
          {/* Quick Keys Bar - Top Position */}
          {quickKeysEnabled && quickKeysPosition === 'top' && (
            <QuickKeysPreview
              count={quickKeysCount}
              position="top"
            />
          )}

          {/* Suggestions Row */}
          {suggestionsEnabled && (
            <SuggestionsPreview />
          )}

          {/* Category Navigation */}
          <CategoryNavPreview style={categoryStyle} />

          {/* Product Grid */}
          <div
            className="grid gap-1 p-1"
            style={{
              gridTemplateColumns: `repeat(${columns}, ${tileConfig.width}px)`,
            }}
          >
            {tiles.map((tile) => (
              <TilePreview
                key={tile.id}
                color={tile.color ?? '#fcd34d'}
                width={tileConfig.width}
                height={tileConfig.height}
                showImage={showImages}
                showPrice={showPrices}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Dimensions label */}
      <p className="text-xs text-stone-500 text-center mt-2">
        {columns} x {rows} grid ({tileSize})
      </p>
    </div>
  )
}

// Quick Keys Preview Component
function QuickKeysPreview({
  count,
  position,
}: {
  count: number
  position: 'top' | 'left'
}) {
  const isHorizontal = position === 'top'
  const quickKeys = Array.from({ length: count }, (_, i) => i)

  return (
    <div
      className={cn(
        'bg-amber-50 border border-amber-200 rounded p-1.5',
        isHorizontal
          ? 'flex items-center gap-1 mb-1'
          : 'flex flex-col items-center gap-1 mr-1'
      )}
    >
      <span className="text-[8px] font-semibold text-amber-700 uppercase">
        QK
      </span>
      <div
        className={cn(
          'flex gap-0.5',
          !isHorizontal && 'flex-col'
        )}
      >
        {quickKeys.map((i) => (
          <div
            key={i}
            className="w-4 h-4 bg-amber-200 rounded-sm"
          />
        ))}
      </div>
    </div>
  )
}

// Suggestions Preview Component
function SuggestionsPreview() {
  const suggestions = [0, 1, 2, 3]

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded p-1.5 flex items-center gap-1 mb-1">
      <span className="text-[8px] font-semibold text-emerald-700 uppercase">
        AI
      </span>
      <div className="flex gap-0.5">
        {suggestions.map((i) => (
          <div
            key={i}
            className="w-4 h-4 bg-emerald-200 rounded-sm"
          />
        ))}
      </div>
    </div>
  )
}

// Category Navigation Preview Component
function CategoryNavPreview({
  style,
}: {
  style: 'tabs' | 'sidebar' | 'dropdown'
}) {
  if (style === 'tabs') {
    return (
      <div className="flex gap-0.5 mb-1 px-1">
        <div className="px-2 py-0.5 text-[7px] bg-amber-500 text-white rounded">
          All
        </div>
        <div className="px-2 py-0.5 text-[7px] bg-stone-200 text-stone-600 rounded">
          Cat 1
        </div>
        <div className="px-2 py-0.5 text-[7px] bg-stone-200 text-stone-600 rounded">
          Cat 2
        </div>
      </div>
    )
  }

  if (style === 'sidebar') {
    return (
      <div className="flex mb-1">
        <div className="flex flex-col gap-0.5 pr-1 border-r border-stone-200">
          <div className="px-1.5 py-0.5 text-[7px] bg-amber-500 text-white rounded">
            All
          </div>
          <div className="px-1.5 py-0.5 text-[7px] bg-stone-200 text-stone-600 rounded">
            Cat 1
          </div>
          <div className="px-1.5 py-0.5 text-[7px] bg-stone-200 text-stone-600 rounded">
            Cat 2
          </div>
        </div>
      </div>
    )
  }

  // Dropdown
  return (
    <div className="mb-1 px-1">
      <div className="inline-flex items-center gap-1 px-2 py-0.5 text-[7px] bg-white border border-stone-200 rounded text-stone-600">
        All Categories
        <span className="text-[6px]">v</span>
      </div>
    </div>
  )
}

// Tile Preview Component
function TilePreview({
  color,
  width,
  height,
  showImage,
  showPrice,
}: {
  color: string
  width: number
  height: number
  showImage: boolean
  showPrice: boolean
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-0.5 rounded border border-stone-200 bg-white p-0.5"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Image placeholder */}
      {showImage && (
        <div
          className="rounded-sm flex-shrink-0"
          style={{
            backgroundColor: color,
            width: Math.max(width * 0.4, 12),
            height: Math.max(width * 0.4, 12),
          }}
        />
      )}

      {/* Name bar placeholder */}
      <div
        className="bg-stone-300 rounded-sm"
        style={{
          width: Math.max(width * 0.7, 20),
          height: 4,
        }}
      />

      {/* Price bar placeholder */}
      {showPrice && (
        <div
          className="bg-stone-200 rounded-sm"
          style={{
            width: Math.max(width * 0.5, 16),
            height: 3,
          }}
        />
      )}
    </div>
  )
}

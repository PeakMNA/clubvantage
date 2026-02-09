'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { cn } from '@clubvantage/ui'
import { ChevronDown } from 'lucide-react'
import type { UnbilledCategory } from '@/lib/data'

function CategoryGroup({ category }: { category: UnbilledCategory }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-stone-100 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3.5 active:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            className={cn(
              'h-4 w-4 text-stone-400 transition-transform',
              expanded && 'rotate-180'
            )}
          />
          <p className="text-[15px] font-medium text-stone-900">{category.name}</p>
        </div>
        <p className="text-[15px] font-semibold text-stone-900">
          ฿{category.subtotal.toLocaleString()}
        </p>
      </button>

      {expanded && (
        <div className="border-t border-stone-100 divide-y divide-stone-50">
          {category.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-2.5 pl-11">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-stone-700 truncate">{item.description}</p>
                <p className="text-xs text-stone-400">
                  {format(item.date, 'MMM d')}
                  {item.invoiceNumber && ` · ${item.invoiceNumber}`}
                </p>
              </div>
              <p className="text-sm font-medium text-stone-700 flex-shrink-0 ml-3">
                ฿{item.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function UnbilledCategoryList({ categories }: { categories: UnbilledCategory[] }) {
  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <CategoryGroup key={category.name} category={category} />
      ))}
    </div>
  )
}

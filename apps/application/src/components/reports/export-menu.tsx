'use client'

import { useState, useRef, useEffect } from 'react'
import { Download, FileSpreadsheet, FileText, Database, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn, Button } from '@clubvantage/ui'

type ExportFormat = 'csv' | 'pdf' | 'gl'

interface ExportMenuProps {
  dateRange: { start: Date; end: Date }
  onExport: (format: ExportFormat) => void
  isExporting?: boolean
  className?: string
}

const exportOptions = [
  {
    format: 'csv' as const,
    label: 'CSV',
    description: 'Full data export',
    Icon: FileSpreadsheet,
  },
  {
    format: 'pdf' as const,
    label: 'PDF',
    description: 'Formatted report',
    Icon: FileText,
  },
  {
    format: 'gl' as const,
    label: 'GL Format',
    description: 'Accounting import',
    Icon: Database,
  },
]

export function ExportMenu({ dateRange, onExport, isExporting, className }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExport = () => {
    onExport(selectedFormat)
  }

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={cn(
          'flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 transition-colors hover:border-stone-300 disabled:opacity-50',
          isOpen && 'ring-2 ring-amber-500/30'
        )}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>Export</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-stone-200 bg-white shadow-lg">
          {/* Format Options */}
          <div className="p-2">
            {exportOptions.map((option) => (
              <button
                key={option.format}
                onClick={() => setSelectedFormat(option.format)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                  selectedFormat === option.format
                    ? 'bg-amber-50'
                    : 'hover:bg-stone-50'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    selectedFormat === option.format ? 'bg-amber-100' : 'bg-stone-100'
                  )}
                >
                  <option.Icon
                    className={cn(
                      'h-4 w-4',
                      selectedFormat === option.format ? 'text-amber-600' : 'text-stone-500'
                    )}
                  />
                </div>
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      selectedFormat === option.format ? 'text-amber-700' : 'text-stone-900'
                    )}
                  >
                    {option.label}
                  </p>
                  <p className="text-xs text-stone-500">{option.description}</p>
                </div>
                {selectedFormat === option.format && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-amber-500" />
                )}
              </button>
            ))}
          </div>

          {/* Date Range Confirmation */}
          <div className="border-t border-stone-100 px-4 py-3">
            <p className="text-xs text-stone-500">
              Date range: {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
            </p>
          </div>

          {/* Export Button */}
          <div className="border-t border-stone-100 p-3">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-gradient-to-br from-amber-500 to-amber-600 text-white"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export {selectedFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

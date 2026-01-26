'use client';

import * as React from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  MoreHorizontal,
} from 'lucide-react';

import { cn } from '../lib/utils';
import { Button } from '../primitives/button';
import { Skeleton } from '../primitives/skeleton';

export interface Column<T> {
  /** Unique identifier for the column */
  id: string;
  /** Column header text */
  header: string;
  /** Accessor key or function to get cell value */
  accessorKey?: keyof T;
  /** Custom cell renderer */
  cell?: (row: T) => React.ReactNode;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Column width */
  width?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  /** Column definitions */
  columns: Column<T>[];
  /** Data rows */
  data: T[];
  /** Unique key accessor */
  keyAccessor: (row: T) => string;
  /** Loading state */
  isLoading?: boolean;
  /** Number of skeleton rows when loading */
  skeletonRows?: number;
  /** Empty state message */
  emptyMessage?: string;
  /** Current sort column */
  sortColumn?: string;
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Sort change callback */
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  /** Row click callback */
  onRowClick?: (row: T) => void;
  /** Selected row keys */
  selectedKeys?: Set<string>;
  /** Selection change callback */
  onSelectionChange?: (keys: Set<string>) => void;
  /** Enable row selection */
  selectable?: boolean;
  /** Pagination */
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  /** Additional class names */
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyAccessor,
  isLoading = false,
  skeletonRows = 5,
  emptyMessage = 'No data available.',
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  selectedKeys,
  onSelectionChange,
  selectable = false,
  pagination,
  className,
}: DataTableProps<T>) {
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;

    const newDirection =
      sortColumn === column.id && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column.id, newDirection);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    const allKeys = new Set(data.map(keyAccessor));
    const allSelected = data.every((row) => selectedKeys?.has(keyAccessor(row)));

    onSelectionChange(allSelected ? new Set() : allKeys);
  };

  const handleSelectRow = (row: T) => {
    if (!onSelectionChange || !selectedKeys) return;

    const key = keyAccessor(row);
    const newKeys = new Set(selectedKeys);

    if (newKeys.has(key)) {
      newKeys.delete(key);
    } else {
      newKeys.add(key);
    }

    onSelectionChange(newKeys);
  };

  const getCellValue = (row: T, column: Column<T>): React.ReactNode => {
    if (column.cell) return column.cell(row);
    if (column.accessorKey) return String(row[column.accessorKey] ?? '');
    return null;
  };

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1;

  return (
    <div className={cn('w-full', className)}>
      <div className="rounded-xl border border-stone-200/60 bg-white/80 backdrop-blur-sm shadow-lg shadow-stone-200/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="border-b border-stone-200/60 bg-stone-50/80">
              <tr>
                {selectable && (
                  <th className="h-12 w-12 px-4">
                    <input
                      type="checkbox"
                      checked={
                        data.length > 0 &&
                        data.every((row) => selectedKeys?.has(keyAccessor(row)))
                      }
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 focus:ring-offset-0"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className={cn(
                      'h-12 px-4 font-medium text-stone-500',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.sortable && 'cursor-pointer select-none hover:text-stone-900 transition-colors duration-200'
                    )}
                    style={{ width: column.width }}
                    onClick={() => handleSort(column)}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-1',
                        column.align === 'center' && 'justify-center',
                        column.align === 'right' && 'justify-end'
                      )}
                    >
                      {column.header}
                      {column.sortable && sortColumn === column.id && (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="h-4 w-4 text-amber-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-amber-600" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                Array.from({ length: skeletonRows }).map((_, i) => (
                  <tr key={i}>
                    {selectable && (
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-4 bg-stone-200/60" />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.id} className="px-4 py-3">
                        <Skeleton className="h-4 w-full bg-stone-200/60" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="h-24 text-center text-stone-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row) => {
                  const key = keyAccessor(row);
                  const isSelected = selectedKeys?.has(key);

                  return (
                    <tr
                      key={key}
                      className={cn(
                        'transition-colors duration-200 hover:bg-stone-50/50',
                        isSelected && 'bg-amber-50/50',
                        onRowClick && 'cursor-pointer'
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(row)}
                            className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 focus:ring-offset-0"
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.id}
                          className={cn(
                            'px-4 py-3 text-stone-700',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right'
                          )}
                        >
                          {getCellValue(row, column)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-stone-500">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-stone-600 font-medium">
              Page {pagination.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(totalPages)}
              disabled={pagination.page >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

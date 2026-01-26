'use client';

import * as React from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Column definition
export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Pagination info
interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

// Table props
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  sortable?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  currentSort?: { column: string; direction: 'asc' | 'desc' };
  rowActions?: (row: T) => { label: string; onClick: () => void; destructive?: boolean }[];
  emptyState?: React.ReactNode;
  getRowId?: (row: T) => string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  onRowClick,
  selectable = false,
  onSelectionChange,
  pagination,
  onPageChange,
  sortable = false,
  onSort,
  currentSort,
  rowActions,
  emptyState,
  getRowId = (row) => row.id,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [openActionsRow, setOpenActionsRow] = React.useState<string | null>(null);

  // Handle selection changes
  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = new Set(data.map(getRowId));
      setSelectedRows(allIds);
      onSelectionChange?.(data);
    }
  };

  const handleSelectRow = (row: T) => {
    const rowId = getRowId(row);
    const newSelected = new Set(selectedRows);

    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }

    setSelectedRows(newSelected);
    onSelectionChange?.(data.filter((r) => newSelected.has(getRowId(r))));
  };

  // Handle sort
  const handleSort = (columnId: string) => {
    if (!sortable || !onSort) return;

    const newDirection =
      currentSort?.column === columnId && currentSort.direction === 'asc'
        ? 'desc'
        : 'asc';

    onSort(columnId, newDirection);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {selectable && <th className="w-12 p-4"><div className="h-4 w-4 bg-slate-200 rounded animate-pulse" /></th>}
              {columns.map((col) => (
                <th key={col.id} className="p-4 text-left">
                  <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
                </th>
              ))}
              {rowActions && <th className="w-12" />}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className={cn(i % 2 === 1 && 'bg-slate-50/50')}>
                {selectable && <td className="p-4"><div className="h-4 w-4 bg-slate-200 rounded animate-pulse" /></td>}
                {columns.map((col, j) => (
                  <td key={col.id} className="p-4">
                    <div
                      className="h-4 bg-slate-200 rounded animate-pulse"
                      style={{ width: `${60 + (j % 3) * 20}%` }}
                    />
                  </td>
                ))}
                {rowActions && <td className="p-4"><div className="h-5 w-5 bg-slate-200 rounded animate-pulse" /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {selectable && <th className="w-12 p-4" />}
              {columns.map((col) => (
                <th
                  key={col.id}
                  className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                  {col.header}
                </th>
              ))}
              {rowActions && <th className="w-12" />}
            </tr>
          </thead>
        </table>
        <div className="p-12 text-center">
          {emptyState || (
            <div className="text-slate-500">
              <p className="font-medium">No data available</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
            <tr>
              {selectable && (
                <th className="w-12 p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    'p-4 text-xs font-semibold uppercase tracking-wider text-slate-600',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.sortable && sortable && 'cursor-pointer select-none hover:bg-slate-100'
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.id)}
                >
                  <div className={cn(
                    'flex items-center gap-1',
                    col.align === 'center' && 'justify-center',
                    col.align === 'right' && 'justify-end'
                  )}>
                    <span>{col.header}</span>
                    {col.sortable && sortable && (
                      <span className="text-slate-400">
                        {currentSort?.column === col.id ? (
                          currentSort.direction === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {rowActions && <th className="w-12" />}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.map((row, rowIndex) => {
              const rowId = getRowId(row);
              const isSelected = selectedRows.has(rowId);

              return (
                <tr
                  key={rowId}
                  className={cn(
                    'transition-colors',
                    rowIndex % 2 === 1 && 'bg-slate-50/50',
                    isSelected && 'bg-blue-50 border-l-2 border-l-blue-500',
                    onRowClick && 'cursor-pointer hover:bg-slate-100'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(row)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        'p-4 text-sm text-slate-900',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right'
                      )}
                    >
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? String(row[col.accessorKey] ?? '')
                        : ''}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <RowActionsMenu
                        actions={rowActions(row)}
                        isOpen={openActionsRow === rowId}
                        onToggle={() =>
                          setOpenActionsRow(openActionsRow === rowId ? null : rowId)
                        }
                        onClose={() => setOpenActionsRow(null)}
                      />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selection Bar */}
      {selectable && selectedRows.size > 0 && (
        <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm font-medium text-blue-700">
            {selectedRows.size} selected
          </span>
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

// Row Actions Menu
function RowActionsMenu({
  actions,
  isOpen,
  onToggle,
  onClose,
}: {
  actions: { label: string; onClick: () => void; destructive?: boolean }[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={onToggle}
        className="p-1.5 rounded hover:bg-slate-100 transition-colors"
      >
        <MoreVertical className="h-4 w-4 text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className={cn(
                'w-full px-3 py-2 text-left text-sm',
                action.destructive
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-slate-700 hover:bg-slate-50'
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Table Pagination
function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange?: (page: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (page > 3) pages.push('ellipsis');

      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) pages.push('ellipsis');

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">
        Showing {start}-{end} of {total}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange?.(page - 1)}
          disabled={page === 1}
          className="p-2 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((pageNum, i) =>
          pageNum === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={pageNum}
              onClick={() => onPageChange?.(pageNum)}
              className={cn(
                'h-8 w-8 rounded text-sm font-medium transition-colors',
                page === pageNum
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-100 text-slate-700'
              )}
            >
              {pageNum}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange?.(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

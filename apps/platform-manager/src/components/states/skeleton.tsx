'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Base Skeleton Component
interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-slate-200',
        className
      )}
      style={style}
    />
  );
}

// Skeleton Card
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white rounded-xl shadow-md p-6', className)}>
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-8 w-28 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

// Skeleton KPI (for KPI cards)
export function SkeletonKPI({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white rounded-xl shadow-md p-6 min-w-[200px]', className)}>
      <Skeleton className="h-3 w-16 mb-4" />
      <Skeleton className="h-7 w-20 mb-2" />
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

// Skeleton Table
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showCheckbox?: boolean;
  showActions?: boolean;
  className?: string;
}

export function SkeletonTable({
  rows = 10,
  columns = 5,
  showCheckbox = false,
  showActions = true,
  className,
}: SkeletonTableProps) {
  return (
    <div className={cn('bg-white rounded-lg border border-slate-200 overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-slate-50 border-b border-slate-200">
        {showCheckbox && <Skeleton className="h-4 w-4" />}
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-3"
            style={{ width: `${60 + (i % 3) * 20}px` }}
          />
        ))}
        {showActions && <Skeleton className="h-4 w-4 ml-auto" />}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className={cn(
            'flex items-center gap-4 px-4 py-4 border-b border-slate-100 last:border-0',
            rowIndex % 2 === 1 && 'bg-slate-50/50'
          )}
        >
          {showCheckbox && <Skeleton className="h-4 w-4" />}
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-4"
              style={{ width: `${50 + ((rowIndex + colIndex) % 4) * 30}px` }}
            />
          ))}
          {showActions && <Skeleton className="h-5 w-5 ml-auto" />}
        </div>
      ))}
    </div>
  );
}

// Skeleton Chart
export function SkeletonChart({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// Skeleton Avatar
export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return <Skeleton className={cn('rounded-full', sizes[size])} />;
}

// Skeleton Text Lines
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

// Skeleton Page (full page skeleton)
export function SkeletonPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* KPI Row */}
      <div className="grid md:grid-cols-4 gap-4">
        <SkeletonKPI />
        <SkeletonKPI />
        <SkeletonKPI />
        <SkeletonKPI />
      </div>

      {/* Table */}
      <SkeletonTable rows={8} columns={5} showCheckbox />
    </div>
  );
}

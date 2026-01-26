'use client';

import { Skeleton } from '@clubvantage/ui';
import { cn } from '@clubvantage/ui';

// =============================================================================
// Table Row Skeleton
// =============================================================================

interface TableRowSkeletonProps {
  rows?: number;
  className?: string;
}

export function TableRowSkeleton({ rows = 8, className }: TableRowSkeletonProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex h-[52px] items-center gap-4 border-b border-border px-4"
        >
          {/* Checkbox */}
          <Skeleton className="h-5 w-5 rounded" />
          {/* Name */}
          <Skeleton className="h-4 w-[150px]" />
          {/* Member # */}
          <Skeleton className="h-4 w-[120px]" />
          {/* Email */}
          <Skeleton className="h-4 w-[180px]" />
          {/* Type */}
          <Skeleton className="h-4 w-[80px]" />
          {/* Status */}
          <Skeleton className="h-6 w-[60px] rounded-full" />
          {/* Balance */}
          <Skeleton className="ml-auto h-4 w-[80px]" />
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Member Header Skeleton
// =============================================================================

interface MemberHeaderSkeletonProps {
  className?: string;
}

export function MemberHeaderSkeleton({ className }: MemberHeaderSkeletonProps) {
  return (
    <div className={cn('flex items-start gap-6', className)}>
      {/* Photo */}
      <Skeleton className="h-20 w-20 shrink-0 rounded-full" />

      {/* Info */}
      <div className="flex-1 space-y-3">
        {/* Name */}
        <Skeleton className="h-6 w-[200px]" />
        {/* Member # */}
        <Skeleton className="h-3.5 w-[140px]" />
        {/* Status */}
        <Skeleton className="h-6 w-[80px] rounded-full" />
      </div>

      {/* Balance on right */}
      <div className="text-right">
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  );
}

// =============================================================================
// Card Skeleton (for Dependent Cards, Charge Cards, etc.)
// =============================================================================

interface CardSkeletonProps {
  className?: string;
}

export function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div
      className={cn(
        'flex h-24 items-center gap-4 rounded-xl border border-border bg-card p-4',
        className
      )}
    >
      {/* Circle */}
      <Skeleton className="h-16 w-16 shrink-0 rounded-full" />

      {/* Text bars */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

// =============================================================================
// Search Result Skeleton
// =============================================================================

interface SearchResultSkeletonProps {
  results?: number;
  className?: string;
}

export function SearchResultSkeleton({
  results = 5,
  className,
}: SearchResultSkeletonProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {Array.from({ length: results }).map((_, index) => (
        <div
          key={index}
          className="flex h-[72px] items-center gap-3 rounded-lg px-3 py-2"
        >
          {/* Circle */}
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />

          {/* Text bars */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[160px]" />
            <Skeleton className="h-3 w-[120px]" />
          </div>

          {/* Small pill */}
          <Skeleton className="h-5 w-[50px] rounded-full" />
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Tab Content Skeleton
// =============================================================================

interface TabContentSkeletonProps {
  cards?: number;
  className?: string;
}

export function TabContentSkeleton({
  cards = 4,
  className,
}: TabContentSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: cards }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

// =============================================================================
// Dependents Tab Skeleton
// =============================================================================

interface DependentsSkeletonProps {
  className?: string;
}

export function DependentsSkeleton({ className }: DependentsSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-[120px]" />
        <Skeleton className="h-9 w-[120px] rounded-md" />
      </div>
      {/* Card list */}
      <TabContentSkeleton cards={3} />
    </div>
  );
}

// =============================================================================
// Contract Tab Skeleton
// =============================================================================

interface ContractSkeletonProps {
  className?: string;
}

export function ContractSkeleton({ className }: ContractSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Contract summary card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <Skeleton className="h-5 w-[180px]" />
            <Skeleton className="h-4 w-[140px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <Skeleton className="h-6 w-[80px] rounded-full" />
        </div>
      </div>

      {/* Charges section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-[100px]" />
          <Skeleton className="h-9 w-[100px] rounded-md" />
        </div>
        <TabContentSkeleton cards={3} />
      </div>
    </div>
  );
}

// =============================================================================
// AR History Skeleton
// =============================================================================

interface ARHistorySkeletonProps {
  rows?: number;
  className?: string;
}

export function ARHistorySkeleton({
  rows = 6,
  className,
}: ARHistorySkeletonProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex h-12 items-center gap-4 border-b border-border px-4"
        >
          {/* Date */}
          <Skeleton className="h-3 w-[80px]" />
          {/* Type */}
          <Skeleton className="h-5 w-[70px] rounded-full" />
          {/* Description */}
          <Skeleton className="h-3 w-[200px]" />
          {/* Amount */}
          <Skeleton className="ml-auto h-4 w-[80px]" />
          {/* Balance */}
          <Skeleton className="h-4 w-[80px]" />
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Member Detail Page Skeleton (Full page)
// =============================================================================

interface MemberDetailSkeletonProps {
  className?: string;
}

export function MemberDetailSkeleton({ className }: MemberDetailSkeletonProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <MemberHeaderSkeleton />

      {/* Tabs */}
      <div className="space-y-6">
        {/* Tab buttons */}
        <div className="flex gap-2 border-b border-border pb-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-[80px] rounded-md" />
          ))}
        </div>

        {/* Tab content */}
        <TabContentSkeleton cards={4} />
      </div>
    </div>
  );
}

// =============================================================================
// Member List Page Skeleton (Full page)
// =============================================================================

interface MemberListSkeletonProps {
  className?: string;
}

export function MemberListSkeleton({ className }: MemberListSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter bar */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-[280px] rounded-md" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-[80px] rounded-full" />
          ))}
        </div>
        <Skeleton className="ml-auto h-10 w-[120px] rounded-md" />
      </div>

      {/* Table header */}
      <div className="flex h-10 items-center gap-4 border-b border-border px-4">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-3 w-[60px]" />
        <Skeleton className="h-3 w-[80px]" />
        <Skeleton className="h-3 w-[50px]" />
        <Skeleton className="h-3 w-[40px]" />
        <Skeleton className="h-3 w-[50px]" />
        <Skeleton className="ml-auto h-3 w-[60px]" />
      </div>

      {/* Table rows */}
      <TableRowSkeleton rows={10} />
    </div>
  );
}

'use client';

import { Button } from '@clubvantage/ui';
import { cn } from '@clubvantage/ui';

// =============================================================================
// Base Empty State Component
// =============================================================================

interface EmptyStateProps {
  heading: string;
  description: string;
  ctaText?: string;
  ctaVariant?: 'button' | 'link';
  onCtaClick?: () => void;
  className?: string;
}

function EmptyState({
  heading,
  description,
  ctaText,
  ctaVariant = 'button',
  onCtaClick,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      {/* Illustration placeholder */}
      <div className="mb-6 flex h-[200px] w-[200px] items-center justify-center rounded-2xl bg-muted">
        <div className="h-24 w-24 rounded-full bg-muted" />
      </div>

      {/* Heading */}
      <h3 className="mb-2 text-xl font-semibold text-foreground">{heading}</h3>

      {/* Description */}
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>

      {/* CTA */}
      {ctaText && onCtaClick && (
        ctaVariant === 'button' ? (
          <Button onClick={onCtaClick}>{ctaText}</Button>
        ) : (
          <button
            onClick={onCtaClick}
            className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
          >
            {ctaText}
          </button>
        )
      )}
    </div>
  );
}

// =============================================================================
// Member List Empty States
// =============================================================================

interface MemberListNoResultsProps {
  onClearFilters: () => void;
  className?: string;
}

export function MemberListNoResults({
  onClearFilters,
  className,
}: MemberListNoResultsProps) {
  return (
    <EmptyState
      heading="No members found"
      description="Try adjusting your filters or search terms"
      ctaText="Clear filters"
      ctaVariant="link"
      onCtaClick={onClearFilters}
      className={className}
    />
  );
}

interface MemberListEmptyProps {
  onAddMember: () => void;
  className?: string;
}

export function MemberListEmpty({
  onAddMember,
  className,
}: MemberListEmptyProps) {
  return (
    <EmptyState
      heading="No members yet"
      description="Start by adding your first club member"
      ctaText="Add first member"
      ctaVariant="button"
      onCtaClick={onAddMember}
      className={className}
    />
  );
}

// =============================================================================
// Dependents Tab Empty State
// =============================================================================

interface DependentsEmptyProps {
  onAddDependent: () => void;
  className?: string;
}

export function DependentsEmpty({
  onAddDependent,
  className,
}: DependentsEmptyProps) {
  return (
    <EmptyState
      heading="No dependents added"
      description="Add family members to this membership"
      ctaText="Add dependent"
      ctaVariant="button"
      onCtaClick={onAddDependent}
      className={className}
    />
  );
}

// =============================================================================
// Contract Tab Empty State
// =============================================================================

interface ContractEmptyProps {
  onCreateContract: () => void;
  className?: string;
}

export function ContractEmpty({
  onCreateContract,
  className,
}: ContractEmptyProps) {
  return (
    <EmptyState
      heading="No contract assigned"
      description="Create a contract to start billing"
      ctaText="Create contract"
      ctaVariant="button"
      onCtaClick={onCreateContract}
      className={className}
    />
  );
}

// =============================================================================
// A/R History Empty State
// =============================================================================

interface ARHistoryEmptyProps {
  className?: string;
}

export function ARHistoryEmpty({ className }: ARHistoryEmptyProps) {
  return (
    <EmptyState
      heading="No transactions yet"
      description="Financial history will appear here"
      className={className}
    />
  );
}

// =============================================================================
// Applications List Empty State
// =============================================================================

interface ApplicationsEmptyProps {
  onInvite?: () => void;
  className?: string;
}

export function ApplicationsEmpty({
  onInvite,
  className,
}: ApplicationsEmptyProps) {
  return (
    <EmptyState
      heading="No pending applications"
      description="New membership applications will appear here"
      ctaText={onInvite ? 'Invite someone to apply' : undefined}
      ctaVariant="link"
      onCtaClick={onInvite}
      className={className}
    />
  );
}

// =============================================================================
// Search No Results Empty State
// =============================================================================

interface SearchNoResultsProps {
  query: string;
  onClearSearch: () => void;
  className?: string;
}

export function SearchNoResults({
  query,
  onClearSearch,
  className,
}: SearchNoResultsProps) {
  return (
    <EmptyState
      heading={`No results for "${query}"`}
      description="Try a different search term"
      ctaText="Clear search"
      ctaVariant="link"
      onCtaClick={onClearSearch}
      className={className}
    />
  );
}

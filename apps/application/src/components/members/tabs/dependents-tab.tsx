'use client';

import { Button, Badge, cn } from '@clubvantage/ui';
import { DependentCard } from '../dependent-card';
import { Member, Dependent } from '../types';
import { Plus, Users, AlertCircle } from 'lucide-react';

export interface DependentsTabProps {
  member: Member;
  maxDependents?: number;
  onAddDependent?: () => void;
  onEditDependent?: (dependent: Dependent) => void;
  onToggleDependentStatus?: (dependent: Dependent) => void;
  onRemoveDependent?: (dependent: Dependent) => void;
}

export function DependentsTab({
  member,
  maxDependents,
  onAddDependent,
  onEditDependent,
  onToggleDependentStatus,
  onRemoveDependent,
}: DependentsTabProps) {
  const dependents = member.dependents;
  const canAddMore = !maxDependents || dependents.length < maxDependents;
  const isAtLimit = maxDependents && dependents.length >= maxDependents;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

        <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Family Members</h2>
              {maxDependents && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        isAtLimit ? 'bg-amber-500' : 'bg-emerald-500'
                      )}
                      style={{ width: `${Math.min((dependents.length / maxDependents) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {dependents.length} of {maxDependents}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Button
            size="sm"
            onClick={onAddDependent}
            disabled={!canAddMore}
            className="w-fit shadow-md transition-all hover:shadow-lg"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Add Dependent</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Dependents Grid */}
      {dependents.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {dependents.map((dependent) => (
            <DependentCard
              key={dependent.id}
              dependent={dependent}
              onEdit={() => onEditDependent?.(dependent)}
              onToggleStatus={() => onToggleDependentStatus?.(dependent)}
              onRemove={() => onRemoveDependent?.(dependent)}
            />
          ))}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border bg-muted/50 p-8 text-center sm:p-12">
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">No Dependents</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Add family members to this membership to share benefits and access.
            </p>
            <Button
              size="sm"
              className="mt-5 shadow-md"
              onClick={onAddDependent}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add First Dependent
            </Button>
          </div>
        </div>
      )}

      {/* Limit Warning */}
      {isAtLimit && (
        <div className="relative overflow-hidden rounded-xl border border-amber-200/60 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-500/20 shadow-sm backdrop-blur-sm">
          <div className="flex items-start gap-3 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/30">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Dependent limit reached
              </p>
              <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                Maximum of {maxDependents} dependents allowed for this membership type. Upgrade membership to add more family members.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

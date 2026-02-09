'use client';

import { Plus, Info } from 'lucide-react';
import { Button } from '@clubvantage/ui';
import { Badge } from '@clubvantage/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@clubvantage/ui';
import { DependentCard } from './dependent-card';
import { DependentsEmpty } from './empty-states';
import type { Member, Dependent } from './types';

interface DependentsTabProps {
  member: Member;
  maxDependents?: number;
  onAddDependent?: () => void;
  onEditDependent?: (dependent: Dependent) => void;
  onToggleDependentStatus?: (dependent: Dependent) => void;
  onRemoveDependent?: (dependent: Dependent) => void;
}

export function DependentsTab({
  member,
  maxDependents = 0,
  onAddDependent,
  onEditDependent,
  onToggleDependentStatus,
  onRemoveDependent,
}: DependentsTabProps) {
  const dependents = member.dependents;
  const currentCount = dependents.length;
  const isAtMax = maxDependents > 0 && currentCount >= maxDependents;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">Dependents</h3>
          <Badge variant="secondary" className="text-xs">
            {currentCount}
            {maxDependents > 0 ? ` of ${maxDependents}` : ''}
          </Badge>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddDependent}
                  disabled={isAtMax}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Dependent
                </Button>
              </span>
            </TooltipTrigger>
            {isAtMax && (
              <TooltipContent>
                Maximum number of dependents reached for this membership type
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Info Banner */}
      {maxDependents > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-500/20 p-3 text-sm text-blue-700 dark:text-blue-400">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>
            This membership type allows up to {maxDependents} dependent
            {maxDependents > 1 ? 's' : ''}.
          </span>
        </div>
      )}

      {/* Dependents Grid or Empty State */}
      {dependents.length === 0 ? (
        <DependentsEmpty onAddDependent={onAddDependent ?? (() => {})} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
      )}
    </div>
  );
}

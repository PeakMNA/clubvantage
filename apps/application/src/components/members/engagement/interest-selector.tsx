'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Flag,
  CircleDot,
  Square,
  Dumbbell,
  Waves,
  Sparkles,
  UtensilsCrossed,
  Users,
  Baby,
  Minus,
  Plus,
  Check,
  RotateCcw,
  LucideIcon,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@clubvantage/ui';
import type { InterestCategory, MemberInterest } from './types';

// Icon mapping for category icons
const iconMap: Record<string, LucideIcon> = {
  Flag,
  CircleDot,
  Square,
  Dumbbell,
  Waves,
  Sparkles,
  UtensilsCrossed,
  Users,
  Baby,
};

function getIcon(iconName?: string): LucideIcon {
  if (!iconName) return Flag;
  return iconMap[iconName] || Flag;
}

// Interest level labels
function getLevelLabel(level: number): string {
  if (level === 0) return 'Not Interested';
  if (level <= 25) return 'Slight Interest';
  if (level <= 50) return 'Moderate Interest';
  if (level <= 75) return 'High Interest';
  return 'Very High Interest';
}

function getLevelColor(level: number): string {
  if (level === 0) return 'bg-stone-100 text-stone-500';
  if (level <= 25) return 'bg-stone-200 text-stone-700';
  if (level <= 50) return 'bg-amber-100 text-amber-700';
  if (level <= 75) return 'bg-emerald-100 text-emerald-700';
  return 'bg-emerald-500 text-white';
}

interface InterestCardProps {
  category: InterestCategory;
  currentLevel: number;
  onChange: (categoryId: string, level: number) => void;
  hasChange: boolean;
}

function InterestCard({ category, currentLevel, onChange, hasChange }: InterestCardProps) {
  const Icon = getIcon(category.icon);

  const handleDecrease = () => {
    const newLevel = Math.max(0, currentLevel - 25);
    onChange(category.id, newLevel);
  };

  const handleIncrease = () => {
    const newLevel = Math.min(100, currentLevel + 25);
    onChange(category.id, newLevel);
  };

  return (
    <Card className={`relative transition-all ${hasChange ? 'ring-2 ring-amber-400' : ''}`}>
      {hasChange && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 rounded-full" />
      )}
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: category.color ? `${category.color}20` : '#f5f5f4' }}
          >
            <Icon
              className="w-5 h-5"
              style={{ color: category.color || '#78716c' }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-sm truncate">{category.name}</h4>
              <Badge className={`text-xs ${getLevelColor(currentLevel)}`}>
                {currentLevel}%
              </Badge>
            </div>

            {category.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                {category.description}
              </p>
            )}

            {/* Level indicator bar */}
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${currentLevel}%`,
                  backgroundColor: category.color || '#78716c',
                }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {getLevelLabel(currentLevel)}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleDecrease}
                  disabled={currentLevel === 0}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleIncrease}
                  disabled={currentLevel === 100}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface InterestSelectorProps {
  categories: InterestCategory[];
  interests: MemberInterest[];
  onSave: (interests: Array<{ categoryId: string; interestLevel: number }>) => Promise<void>;
  isSaving?: boolean;
  className?: string;
}

export function InterestSelector({
  categories,
  interests,
  onSave,
  isSaving = false,
  className = '',
}: InterestSelectorProps) {
  // Build initial state from existing interests
  const initialLevels = useMemo(() => {
    const map = new Map<string, number>();
    interests.forEach((i) => map.set(i.categoryId, i.interestLevel));
    // Initialize unset categories to 0
    categories.forEach((c) => {
      if (!map.has(c.id)) {
        map.set(c.id, 0);
      }
    });
    return map;
  }, [categories, interests]);

  const [levels, setLevels] = useState<Map<string, number>>(initialLevels);

  // Track which categories have changes
  const changedCategories = useMemo(() => {
    const changed = new Set<string>();
    levels.forEach((level, categoryId) => {
      const original = initialLevels.get(categoryId) ?? 0;
      if (level !== original) {
        changed.add(categoryId);
      }
    });
    return changed;
  }, [levels, initialLevels]);

  const hasChanges = changedCategories.size > 0;

  const handleChange = useCallback((categoryId: string, level: number) => {
    setLevels((prev) => {
      const next = new Map(prev);
      next.set(categoryId, level);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setLevels(new Map(initialLevels));
  }, [initialLevels]);

  const handleSave = useCallback(async () => {
    // Only send changed interests
    const changedInterests = Array.from(changedCategories).map((categoryId) => ({
      categoryId,
      interestLevel: levels.get(categoryId) ?? 0,
    }));

    if (changedInterests.length > 0) {
      await onSave(changedInterests);
    }
  }, [changedCategories, levels, onSave]);

  // Sort categories by sortOrder
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );

  return (
    <div className={className}>
      {/* Header with action buttons */}
      {hasChanges && (
        <div className="flex items-center justify-between mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              {changedCategories.size} unsaved change{changedCategories.size !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={isSaving}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Discard all changes</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Interest cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedCategories.map((category) => (
          <InterestCard
            key={category.id}
            category={category}
            currentLevel={levels.get(category.id) ?? 0}
            onChange={handleChange}
            hasChange={changedCategories.has(category.id)}
          />
        ))}
      </div>

      {sortedCategories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No interest categories available
        </div>
      )}
    </div>
  );
}

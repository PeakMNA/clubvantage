'use client';

import { useState, useCallback } from 'react';
import { cn, Button } from '@clubvantage/ui';
import { Plus, X, ChevronDown } from 'lucide-react';

// Types
export interface StaffCapability {
  capability: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface CapabilitiesEditorProps {
  value: StaffCapability[];
  onChange: (capabilities: StaffCapability[]) => void;
  availableCapabilities?: string[];
  maxCapabilities?: number;
  className?: string;
}

const DEFAULT_CAPABILITIES = [
  'Thai Massage',
  'Swedish Massage',
  'Deep Tissue',
  'Aromatherapy',
  'Hot Stone',
  'Personal Training',
  'Group Fitness',
  'Yoga Instruction',
  'Pilates',
  'Tennis Coaching',
  'Golf Instruction',
  'Swimming Instruction',
  'Squash Coaching',
  'Badminton Coaching',
];

const SKILL_LEVELS: { value: StaffCapability['level']; label: string; dots: string }[] = [
  { value: 'beginner', label: 'Beginner', dots: '●○○○' },
  { value: 'intermediate', label: 'Intermediate', dots: '●●○○' },
  { value: 'advanced', label: 'Advanced', dots: '●●●○' },
  { value: 'expert', label: 'Expert', dots: '●●●●' },
];

const LEVEL_COLORS: Record<StaffCapability['level'], { bg: string; text: string }> = {
  beginner: { bg: 'bg-stone-100', text: 'text-stone-700' },
  intermediate: { bg: 'bg-blue-100', text: 'text-blue-700' },
  advanced: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  expert: { bg: 'bg-amber-100', text: 'text-amber-700' },
};

/**
 * CapabilitiesEditor
 *
 * An inline editor for staff capabilities. Each row pairs a capability with a skill level.
 */
export function CapabilitiesEditor({
  value = [],
  onChange,
  availableCapabilities = DEFAULT_CAPABILITIES,
  maxCapabilities = 10,
  className,
}: CapabilitiesEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCapability, setNewCapability] = useState('');
  const [newLevel, setNewLevel] = useState<StaffCapability['level']>('intermediate');
  const [showCapabilityDropdown, setShowCapabilityDropdown] = useState(false);
  const [showLevelDropdown, setShowLevelDropdown] = useState<string | null>(null);

  // Get capabilities not already selected
  const availableToAdd = availableCapabilities.filter(
    (cap) => !value.some((v) => v.capability === cap)
  );

  const addCapability = useCallback(() => {
    if (!newCapability) return;
    if (value.some((v) => v.capability === newCapability)) return;
    if (value.length >= maxCapabilities) return;

    onChange([...value, { capability: newCapability, level: newLevel }]);
    setNewCapability('');
    setNewLevel('intermediate');
    setIsAdding(false);
  }, [newCapability, newLevel, value, onChange, maxCapabilities]);

  const removeCapability = useCallback(
    (capability: string) => {
      onChange(value.filter((v) => v.capability !== capability));
    },
    [value, onChange]
  );

  const updateLevel = useCallback(
    (capability: string, level: StaffCapability['level']) => {
      onChange(
        value.map((v) =>
          v.capability === capability ? { ...v, level } : v
        )
      );
      setShowLevelDropdown(null);
    },
    [value, onChange]
  );

  const canAdd = value.length < maxCapabilities && availableToAdd.length > 0;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Existing capabilities */}
      {value.length > 0 ? (
        <div className="space-y-1">
          {value.map((cap) => {
            const levelConfig = LEVEL_COLORS[cap.level];
            const levelInfo = SKILL_LEVELS.find((l) => l.value === cap.level);

            return (
              <div
                key={cap.capability}
                className="flex items-center gap-2 rounded-lg border border-border bg-card p-2"
              >
                {/* Capability name */}
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {cap.capability}
                </span>

                {/* Level dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setShowLevelDropdown(
                        showLevelDropdown === cap.capability ? null : cap.capability
                      )
                    }
                    className={cn(
                      'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors',
                      levelConfig.bg,
                      levelConfig.text
                    )}
                  >
                    <span className="text-[10px]">{levelInfo?.dots}</span>
                    <span>{levelInfo?.label}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {showLevelDropdown === cap.capability && (
                    <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-card py-1 shadow-lg">
                      {SKILL_LEVELS.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => updateLevel(cap.capability, level.value)}
                          className={cn(
                            'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted',
                            cap.level === level.value && 'bg-muted'
                          )}
                        >
                          <span className="text-xs text-muted-foreground">{level.dots}</span>
                          <span>{level.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeCapability(cap.capability)}
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="py-3 text-center text-sm text-muted-foreground">
          No capabilities added
        </p>
      )}

      {/* Add new capability */}
      {isAdding ? (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-2 dark:border-amber-500/30 dark:bg-amber-500/10">
          {/* Capability dropdown */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setShowCapabilityDropdown(!showCapabilityDropdown)}
              className="flex h-9 w-full items-center justify-between rounded-md border border-border bg-background px-3 text-sm"
            >
              <span className={newCapability ? 'text-foreground' : 'text-muted-foreground'}>
                {newCapability || 'Select capability...'}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {showCapabilityDropdown && (
              <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg">
                {availableToAdd.map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => {
                      setNewCapability(cap);
                      setShowCapabilityDropdown(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    {cap}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Level dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setShowLevelDropdown(showLevelDropdown === 'new' ? null : 'new')
              }
              className={cn(
                'flex h-9 items-center gap-1 rounded-md border border-border bg-background px-3 text-sm',
                LEVEL_COLORS[newLevel].bg,
                LEVEL_COLORS[newLevel].text
              )}
            >
              <span className="text-[10px]">
                {SKILL_LEVELS.find((l) => l.value === newLevel)?.dots}
              </span>
              <span>{SKILL_LEVELS.find((l) => l.value === newLevel)?.label}</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showLevelDropdown === 'new' && (
              <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-card py-1 shadow-lg">
                {SKILL_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => {
                      setNewLevel(level.value);
                      setShowLevelDropdown(null);
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted',
                      newLevel === level.value && 'bg-muted'
                    )}
                  >
                    <span className="text-xs text-muted-foreground">{level.dots}</span>
                    <span>{level.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <Button
            type="button"
            size="sm"
            onClick={addCapability}
            disabled={!newCapability}
            className="bg-amber-500 text-white hover:bg-amber-600"
          >
            Add
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsAdding(false);
              setNewCapability('');
              setNewLevel('intermediate');
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        canAdd && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="w-full"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Capability
          </Button>
        )
      )}

      {/* Limit indicator */}
      {value.length > 0 && (
        <p className="text-right text-xs text-muted-foreground">
          {value.length}/{maxCapabilities} capabilities
        </p>
      )}
    </div>
  );
}

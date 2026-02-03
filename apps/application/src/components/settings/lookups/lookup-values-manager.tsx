'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Check,
  X,
  Search,
  Filter,
  ChevronDown,
  Palette,
  // Common icons for selector
  User,
  Users,
  UserPlus,
  Footprints,
  Banknote,
  CreditCard,
  Building,
  QrCode,
  Receipt,
  Wallet,
  Wrench,
  Trophy,
  CloudRain,
  Lock,
  Flag,
  CircleDot,
  Target,
  Flame,
  Award,
  Sparkles,
  ThumbsUp,
  Minus,
  AlertTriangle,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
  Badge,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from '@clubvantage/ui';
import { useLookupValues, useLookupMutations, type LookupValueDisplay } from '@/hooks/use-lookups';

// Icon mapping for selector
const ICON_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: 'User', label: 'User', icon: User },
  { value: 'Users', label: 'Users', icon: Users },
  { value: 'UserPlus', label: 'User Plus', icon: UserPlus },
  { value: 'Footprints', label: 'Footprints', icon: Footprints },
  { value: 'Banknote', label: 'Banknote', icon: Banknote },
  { value: 'CreditCard', label: 'Credit Card', icon: CreditCard },
  { value: 'Building', label: 'Building', icon: Building },
  { value: 'QrCode', label: 'QR Code', icon: QrCode },
  { value: 'Receipt', label: 'Receipt', icon: Receipt },
  { value: 'Wallet', label: 'Wallet', icon: Wallet },
  { value: 'Wrench', label: 'Wrench', icon: Wrench },
  { value: 'Trophy', label: 'Trophy', icon: Trophy },
  { value: 'CloudRain', label: 'Cloud Rain', icon: CloudRain },
  { value: 'Lock', label: 'Lock', icon: Lock },
  { value: 'Flag', label: 'Flag', icon: Flag },
  { value: 'CircleDot', label: 'Circle Dot', icon: CircleDot },
  { value: 'Target', label: 'Target', icon: Target },
  { value: 'Flame', label: 'Flame', icon: Flame },
  { value: 'Award', label: 'Award', icon: Award },
  { value: 'Sparkles', label: 'Sparkles', icon: Sparkles },
  { value: 'ThumbsUp', label: 'Thumbs Up', icon: ThumbsUp },
  { value: 'Minus', label: 'Minus', icon: Minus },
  { value: 'AlertTriangle', label: 'Alert', icon: AlertTriangle },
  { value: 'XCircle', label: 'X Circle', icon: XCircle },
];

// Color presets
const COLOR_PRESETS = [
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#64748B', // Slate
  '#A8A29E', // Stone
];

function getIconComponent(iconName?: string): LucideIcon {
  const iconOption = ICON_OPTIONS.find((opt) => opt.value === iconName);
  return iconOption?.icon || CircleDot;
}

interface LookupValuesManagerProps {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  isSystemCategory: boolean;
}

export function LookupValuesManager({
  categoryId,
  categoryCode,
  categoryName,
  isSystemCategory,
}: LookupValuesManagerProps) {
  const { values, activeValues, isLoading, error, refetch } = useLookupValues(categoryCode, {
    includeInactive: true,
  });
  const { createValue, updateValue, deleteValue, isMutating } = useLookupMutations();

  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [editingValue, setEditingValue] = useState<LookupValueDisplay | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState<LookupValueDisplay | null>(null);

  // Filter values
  const filteredValues = useMemo(() => {
    let result = showInactive ? values : activeValues;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.code.toLowerCase().includes(query)
      );
    }
    return result;
  }, [values, activeValues, showInactive, searchQuery]);

  // Handle create
  const handleCreate = async (data: {
    code: string;
    name: string;
    icon?: string;
    color?: string;
    isActive: boolean;
    isDefault: boolean;
  }) => {
    await createValue({
      categoryId,
      code: data.code,
      name: data.name,
      icon: data.icon,
      color: data.color,
      isActive: data.isActive,
      isDefault: data.isDefault,
      sortOrder: values.length,
    });
    setIsCreateModalOpen(false);
  };

  // Handle update
  const handleUpdate = async (data: {
    name?: string;
    icon?: string;
    color?: string;
    isActive?: boolean;
    isDefault?: boolean;
  }) => {
    if (!editingValue) return;
    await updateValue(editingValue.id, data);
    setEditingValue(null);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteConfirmValue) return;
    await deleteValue(deleteConfirmValue.id);
    setDeleteConfirmValue(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center">
        <p className="text-red-600">Failed to load lookup values</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-stone-900">{categoryName}</h3>
          <p className="text-sm text-stone-500">
            {values.length} value{values.length !== 1 ? 's' : ''}
            {isSystemCategory && (
              <Badge variant="secondary" className="ml-2">
                System
              </Badge>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              placeholder="Search values..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9"
            />
          </div>

          {/* Show inactive toggle */}
          <div className="flex items-center gap-2">
            <Switch
              checked={showInactive}
              onCheckedChange={setShowInactive}
              id="show-inactive"
            />
            <Label htmlFor="show-inactive" className="text-sm text-stone-600">
              Show inactive
            </Label>
          </div>

          {/* Add button */}
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Value
          </Button>
        </div>
      </div>

      {/* Value cards grid */}
      {filteredValues.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-stone-200 p-12 text-center">
          <p className="text-stone-500">
            {searchQuery ? 'No values match your search' : 'No values yet'}
          </p>
          {!searchQuery && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Value
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredValues.map((value) => (
            <LookupValueCard
              key={value.id}
              value={value}
              isSystemCategory={isSystemCategory}
              onEdit={() => setEditingValue(value)}
              onDelete={() => setDeleteConfirmValue(value)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <LookupValueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Add Lookup Value"
        isLoading={isMutating}
      />

      {/* Edit Modal */}
      <LookupValueModal
        isOpen={!!editingValue}
        onClose={() => setEditingValue(null)}
        onSubmit={handleUpdate}
        title="Edit Lookup Value"
        initialData={editingValue ?? undefined}
        isEdit
        isSystemValue={isSystemCategory && editingValue?.isGlobal}
        isLoading={isMutating}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmValue} onOpenChange={() => setDeleteConfirmValue(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lookup Value</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirmValue?.name}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmValue(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isMutating}>
              {isMutating ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// Value Card Component
// ============================================================================

interface LookupValueCardProps {
  value: LookupValueDisplay;
  isSystemCategory: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function LookupValueCard({ value, isSystemCategory, onEdit, onDelete }: LookupValueCardProps) {
  const IconComponent = getIconComponent(value.icon);
  const canDelete = !isSystemCategory || !value.isGlobal;

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-white p-4 shadow-sm transition-all duration-200',
        'hover:shadow-md hover:border-amber-200',
        !value.isActive && 'opacity-60'
      )}
    >
      {/* Color indicator */}
      {value.color && (
        <div
          className="absolute right-4 top-4 h-3 w-3 rounded-full ring-2 ring-white"
          style={{ backgroundColor: value.color }}
        />
      )}

      {/* Icon and name */}
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: value.color ? `${value.color}20` : '#f5f5f4' }}
        >
          <IconComponent
            className="h-5 w-5"
            style={{ color: value.color || '#78716c' }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-medium text-stone-900">{value.name}</h4>
          <p className="truncate text-sm text-stone-500">{value.code}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-3 flex flex-wrap gap-2">
        {value.isDefault && (
          <Badge variant="secondary" className="text-xs">
            Default
          </Badge>
        )}
        {!value.isActive && (
          <Badge variant="outline" className="text-xs text-stone-400">
            Inactive
          </Badge>
        )}
        {value.isGlobal && (
          <Badge variant="outline" className="text-xs text-blue-600">
            Global
          </Badge>
        )}
        {!value.isGlobal && (
          <Badge variant="outline" className="text-xs text-amber-600">
            Custom
          </Badge>
        )}
      </div>

      {/* Actions (visible on hover) */}
      <div className="absolute bottom-4 right-4 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Pencil className="h-4 w-4 text-stone-500" />
        </Button>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Value Modal Component
// ============================================================================

interface LookupValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  title: string;
  initialData?: LookupValueDisplay;
  isEdit?: boolean;
  isSystemValue?: boolean;
  isLoading?: boolean;
}

function LookupValueModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  isEdit,
  isSystemValue,
  isLoading,
}: LookupValueModalProps) {
  const [code, setCode] = useState(initialData?.code ?? '');
  const [name, setName] = useState(initialData?.name ?? '');
  const [icon, setIcon] = useState(initialData?.icon ?? 'CircleDot');
  const [color, setColor] = useState(initialData?.color ?? '#3B82F6');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [isDefault, setIsDefault] = useState(initialData?.isDefault ?? false);

  // Reset form when modal opens with new data
  const resetForm = () => {
    setCode(initialData?.code ?? '');
    setName(initialData?.name ?? '');
    setIcon(initialData?.icon ?? 'CircleDot');
    setColor(initialData?.color ?? '#3B82F6');
    setIsActive(initialData?.isActive ?? true);
    setIsDefault(initialData?.isDefault ?? false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(
      isEdit
        ? { name, icon, color, isActive, isDefault }
        : { code, name, icon, color, isActive, isDefault }
    );
  };

  const IconComponent = getIconComponent(icon);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); else resetForm(); }}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Code (only for create) */}
            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                  placeholder="MEMBER"
                  required
                />
                <p className="text-xs text-stone-500">
                  Uppercase letters, numbers, and underscores only
                </p>
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Member"
                required
              />
            </div>

            {/* Icon selector */}
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span>{ICON_OPTIONS.find((o) => o.value === icon)?.label ?? icon}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="h-4 w-4" />
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color picker */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-3">
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((presetColor) => (
                    <button
                      key={presetColor}
                      type="button"
                      className={cn(
                        'h-6 w-6 rounded-full transition-transform hover:scale-110',
                        color === presetColor && 'ring-2 ring-offset-2 ring-stone-400'
                      )}
                      style={{ backgroundColor: presetColor }}
                      onClick={() => setColor(presetColor)}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-12 cursor-pointer p-1"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="flex items-center gap-3 rounded-lg border bg-stone-50 p-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <IconComponent className="h-5 w-5" style={{ color }} />
                </div>
                <div>
                  <p className="font-medium text-stone-900">{name || 'Value Name'}</p>
                  <p className="text-sm text-stone-500">{code || 'CODE'}</p>
                </div>
              </div>
            </div>

            {/* Switches */}
            <div className="flex items-center justify-between">
              <Label htmlFor="is-active" className="cursor-pointer">
                Active
              </Label>
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isSystemValue}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is-default" className="cursor-pointer">
                Set as default
              </Label>
              <Switch
                id="is-default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
            </div>

            {isSystemValue && (
              <p className="text-xs text-amber-600">
                This is a system value. You can customize it for your club, but cannot deactivate
                the global default.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

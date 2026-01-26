'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn, Button } from '@clubvantage/ui';
import { Plus, X, Edit2, ChevronDown } from 'lucide-react';

// Types
export interface ServiceVariation {
  id?: string;
  name: string;
  priceModifier: number;
  priceType: 'add' | 'replace';
}

export interface VariationsEditorProps {
  value: ServiceVariation[];
  onChange: (variations: ServiceVariation[]) => void;
  currency?: string;
  maxVariations?: number;
  className?: string;
}

const PRICE_TYPES = [
  { value: 'add', label: '+', description: 'Add to base price' },
  { value: 'replace', label: '=', description: 'Replace base price' },
];

/**
 * VariationsEditor
 *
 * An inline list editor for service variations/add-ons.
 * Allows adding, editing, and removing price modifiers for a service.
 */
export function VariationsEditor({
  value = [],
  onChange,
  currency = '฿',
  maxVariations = 20,
  className,
}: VariationsEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    priceModifier: '',
    priceType: 'add' as 'add' | 'replace',
  });
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const generateId = () => `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const startAdd = useCallback(() => {
    setFormData({ name: '', priceModifier: '', priceType: 'add' });
    setIsAdding(true);
    setEditingId(null);
    setShowTypeDropdown(false);
  }, []);

  const startEdit = useCallback((variation: ServiceVariation) => {
    const id = variation.id || generateId();
    setFormData({
      name: variation.name,
      priceModifier: variation.priceModifier.toString(),
      priceType: variation.priceType,
    });
    setEditingId(id);
    setIsAdding(false);
    setShowTypeDropdown(false);

    if (!variation.id) {
      onChange(value.map((v) => (v === variation ? { ...v, id } : v)));
    }
  }, [value, onChange]);

  const cancelEdit = useCallback(() => {
    setFormData({ name: '', priceModifier: '', priceType: 'add' });
    setIsAdding(false);
    setEditingId(null);
    setShowTypeDropdown(false);
  }, []);

  const saveVariation = useCallback(() => {
    const price = parseFloat(formData.priceModifier);
    if (!formData.name.trim() || isNaN(price) || price < 0) return;

    // Check for duplicate names (excluding current edit)
    const isDuplicate = value.some(
      (v) => v.name.toLowerCase() === formData.name.trim().toLowerCase() && v.id !== editingId
    );
    if (isDuplicate) return;

    const variation: ServiceVariation = {
      id: editingId || generateId(),
      name: formData.name.trim(),
      priceModifier: price,
      priceType: formData.priceType,
    };

    if (isAdding) {
      onChange([...value, variation]);
    } else if (editingId) {
      onChange(value.map((v) => (v.id === editingId ? variation : v)));
    }

    cancelEdit();
  }, [formData, editingId, isAdding, value, onChange, cancelEdit]);

  const removeVariation = useCallback(
    (id: string) => {
      onChange(value.filter((v) => v.id !== id));
      setConfirmDelete(null);
    },
    [value, onChange]
  );

  const variationsWithIds = useMemo(() => {
    return value.map((v, index) => ({
      ...v,
      id: v.id || `variation-${index}`,
    }));
  }, [value]);

  const formatPrice = (amount: number, type: 'add' | 'replace') => {
    if (type === 'add') {
      return `+${currency}${amount.toLocaleString()}`;
    }
    return `${currency}${amount.toLocaleString()}`;
  };

  const isFormValid = formData.name.trim() && !isNaN(parseFloat(formData.priceModifier)) && parseFloat(formData.priceModifier) >= 0;
  const canAdd = value.length < maxVariations;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Existing variations */}
      {variationsWithIds.length > 0 ? (
        <div className="space-y-1">
          {variationsWithIds.map((variation) => {
            const isEditing = editingId === variation.id;
            const isConfirmingDelete = confirmDelete === variation.id;

            if (isEditing) {
              return (
                <div
                  key={variation.id}
                  className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-2 dark:border-amber-500/30 dark:bg-amber-500/10"
                >
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Variation name"
                    className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm"
                  />

                  {/* Price type dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      className="flex h-9 w-10 items-center justify-center rounded-md border border-border bg-background text-sm font-medium"
                    >
                      {formData.priceType === 'add' ? '+' : '='}
                    </button>
                    {showTypeDropdown && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-lg border border-border bg-card py-1 shadow-lg">
                        {PRICE_TYPES.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, priceType: type.value as 'add' | 'replace' });
                              setShowTypeDropdown(false);
                            }}
                            className={cn(
                              'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted',
                              formData.priceType === type.value && 'bg-muted'
                            )}
                          >
                            <span className="w-4 font-medium">{type.label}</span>
                            <span className="text-muted-foreground">{type.description}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">{currency}</span>
                    <input
                      type="number"
                      value={formData.priceModifier}
                      onChange={(e) => setFormData({ ...formData, priceModifier: e.target.value })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="h-9 w-24 rounded-md border border-border bg-background px-2 text-sm"
                    />
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={saveVariation}
                    disabled={!isFormValid}
                    className="bg-amber-500 text-white hover:bg-amber-600"
                  >
                    Save
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              );
            }

            if (isConfirmingDelete) {
              return (
                <div
                  key={variation.id}
                  className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/50 p-2 dark:border-red-500/30 dark:bg-red-500/10"
                >
                  <span className="text-sm text-red-600">Remove this variation?</span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeVariation(variation.id!)}
                    >
                      Remove
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmDelete(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={variation.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/30"
              >
                <span className="text-sm font-medium text-foreground">{variation.name}</span>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      variation.priceType === 'add' ? 'text-emerald-600' : 'text-foreground'
                    )}
                  >
                    {formatPrice(variation.priceModifier, variation.priceType)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(variation)}
                      className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(variation.id!)}
                      className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !isAdding && (
          <p className="py-3 text-center text-sm text-muted-foreground">
            No variations added
          </p>
        )
      )}

      {/* Add new variation form */}
      {isAdding && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-2 dark:border-amber-500/30 dark:bg-amber-500/10">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Variation name"
            className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm"
            autoFocus
          />

          {/* Price type dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="flex h-9 w-10 items-center justify-center rounded-md border border-border bg-background text-sm font-medium"
            >
              {formData.priceType === 'add' ? '+' : '='}
            </button>
            {showTypeDropdown && (
              <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-lg border border-border bg-card py-1 shadow-lg">
                {PRICE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, priceType: type.value as 'add' | 'replace' });
                      setShowTypeDropdown(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted',
                      formData.priceType === type.value && 'bg-muted'
                    )}
                  >
                    <span className="w-4 font-medium">{type.label}</span>
                    <span className="text-muted-foreground">{type.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">{currency}</span>
            <input
              type="number"
              value={formData.priceModifier}
              onChange={(e) => setFormData({ ...formData, priceModifier: e.target.value })}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="h-9 w-24 rounded-md border border-border bg-background px-2 text-sm"
            />
          </div>

          <Button
            type="button"
            size="sm"
            onClick={saveVariation}
            disabled={!isFormValid}
            className="bg-amber-500 text-white hover:bg-amber-600"
          >
            Add
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}>
            Cancel
          </Button>
        </div>
      )}

      {/* Add button */}
      {!isAdding && !editingId && canAdd && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={startAdd}
          className="w-full"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Variation
        </Button>
      )}

      {/* Limit indicator */}
      {value.length > 0 && (
        <p className="text-right text-xs text-muted-foreground">
          {value.length}/{maxVariations} variations
        </p>
      )}
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Blocks,
  Package,
  ToggleLeft,
  Settings,
  DollarSign,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { PageHeader, Section } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useFeatureDefinitions, useCreateFeatureDefinition, useUpdateFeatureDefinition } from '@/hooks/use-configurable-packages';
import { cn } from '@/lib/utils';

const CATEGORY_CONFIG = {
  MODULE: { label: 'Module', icon: Blocks, color: 'bg-blue-100 text-blue-700' },
  FEATURE: { label: 'Feature', icon: Package, color: 'bg-purple-100 text-purple-700' },
  OPERATIONAL: { label: 'Operational', icon: Settings, color: 'bg-amber-100 text-amber-700' },
} as const;

type CategoryKey = keyof typeof CATEGORY_CONFIG;

interface NewFeatureForm {
  key: string;
  name: string;
  description: string;
  category: CategoryKey;
  addonPrice: string;
}

const EMPTY_FORM: NewFeatureForm = {
  key: '',
  name: '',
  description: '',
  category: 'FEATURE',
  addonPrice: '',
};

export default function FeatureRegistryPage() {
  const { data, isLoading } = useFeatureDefinitions();
  const createMutation = useCreateFeatureDefinition();
  const updateMutation = useUpdateFeatureDefinition();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'ALL'>('ALL');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState<NewFeatureForm>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<{ name: string; description: string; addonPrice: string }>({ name: '', description: '', addonPrice: '' });

  const features = data?.featureDefinitions ?? [];

  const filteredFeatures = useMemo(() => {
    return features.filter((f) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!f.name.toLowerCase().includes(q) && !f.key.toLowerCase().includes(q)) return false;
      }
      if (selectedCategory !== 'ALL' && f.category !== selectedCategory) return false;
      return true;
    });
  }, [features, searchQuery, selectedCategory]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof features> = { MODULE: [], FEATURE: [], OPERATIONAL: [] };
    for (const f of filteredFeatures) {
      groups[f.category]?.push(f);
    }
    return groups;
  }, [filteredFeatures]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: features.length, MODULE: 0, FEATURE: 0, OPERATIONAL: 0 };
    for (const f of features) c[f.category] = (c[f.category] || 0) + 1;
    return c;
  }, [features]);

  async function handleCreate() {
    await createMutation.mutateAsync({
      input: {
        key: newFeature.key,
        name: newFeature.name,
        description: newFeature.description || undefined,
        category: newFeature.category as any,
        addonPrice: newFeature.addonPrice ? parseFloat(newFeature.addonPrice) : undefined,
      },
    });
    setNewFeature(EMPTY_FORM);
    setShowCreateForm(false);
  }

  function startEdit(f: typeof features[0]) {
    setEditingId(f.id);
    setEditForm({
      name: f.name,
      description: f.description || '',
      addonPrice: f.addonPrice?.toString() || '',
    });
  }

  async function handleUpdate(id: string) {
    await updateMutation.mutateAsync({
      id,
      input: {
        name: editForm.name,
        description: editForm.description || undefined,
        addonPrice: editForm.addonPrice ? parseFloat(editForm.addonPrice) : undefined,
      },
    });
    setEditingId(null);
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    await updateMutation.mutateAsync({
      id,
      input: { isActive: !isActive },
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Feature Registry" description="Manage all feature definitions" />
        <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature Registry"
        description="Define and manage all feature flags available across packages"
        actions={
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Feature
          </Button>
        }
      />

      {/* Category filter tabs */}
      <div className="flex items-center gap-2">
        {(['ALL', 'MODULE', 'FEATURE', 'OPERATIONAL'] as const).map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
              )}
            >
              {cat === 'ALL' ? 'All' : CATEGORY_CONFIG[cat].label}
              <span className={cn('ml-1.5 text-xs', isActive ? 'text-blue-500' : 'text-slate-400')}>
                {counts[cat] || 0}
              </span>
            </button>
          );
        })}
        <div className="flex-1" />
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <Section>
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">New Feature Definition</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Key (camelCase)</label>
                <Input
                  placeholder="e.g. golfLottery"
                  value={newFeature.key}
                  onChange={(e) => setNewFeature({ ...newFeature, key: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                <Input
                  placeholder="e.g. Golf Lottery"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={newFeature.category}
                  onChange={(e) => setNewFeature({ ...newFeature, category: e.target.value as CategoryKey })}
                >
                  <option value="MODULE">Module</option>
                  <option value="FEATURE">Feature</option>
                  <option value="OPERATIONAL">Operational</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Add-on Price (optional)</label>
                <Input
                  type="number"
                  placeholder="e.g. 99"
                  value={newFeature.addonPrice}
                  onChange={(e) => setNewFeature({ ...newFeature, addonPrice: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <Input
                  placeholder="Brief description"
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setShowCreateForm(false); setNewFeature(EMPTY_FORM); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={!newFeature.key || !newFeature.name}>
                Create Feature
              </Button>
            </div>
          </div>
        </Section>
      )}

      {/* Feature list by category */}
      {(selectedCategory === 'ALL' ? ['MODULE', 'FEATURE', 'OPERATIONAL'] : [selectedCategory]).map((cat) => {
        const items = grouped[cat] || [];
        if (items.length === 0) return null;
        const config = CATEGORY_CONFIG[cat as CategoryKey];
        const Icon = config.icon;

        return (
          <Section key={cat}>
            <div className="flex items-center gap-2 mb-4">
              <Icon className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                {config.label}s
              </h2>
              <span className="text-xs text-slate-400">({items.length})</span>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5 w-48">Key</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Name</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Description</th>
                    {cat === 'FEATURE' && (
                      <th className="text-right text-xs font-medium text-slate-500 px-4 py-2.5 w-32">Add-on Price</th>
                    )}
                    <th className="text-center text-xs font-medium text-slate-500 px-4 py-2.5 w-20">Status</th>
                    <th className="text-right text-xs font-medium text-slate-500 px-4 py-2.5 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((f) => (
                    <tr key={f.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          {f.key}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        {editingId === f.id ? (
                          <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="h-8 text-sm"
                          />
                        ) : (
                          <span className="text-sm font-medium text-slate-900">{f.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === f.id ? (
                          <Input
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="h-8 text-sm"
                          />
                        ) : (
                          <span className="text-sm text-slate-500">{f.description || '—'}</span>
                        )}
                      </td>
                      {cat === 'FEATURE' && (
                        <td className="px-4 py-3 text-right">
                          {editingId === f.id ? (
                            <Input
                              type="number"
                              value={editForm.addonPrice}
                              onChange={(e) => setEditForm({ ...editForm, addonPrice: e.target.value })}
                              className="h-8 text-sm w-24 ml-auto"
                            />
                          ) : f.addonPrice ? (
                            <span className="text-sm text-slate-700 flex items-center justify-end gap-1">
                              <DollarSign className="w-3 h-3 text-slate-400" />
                              {Number(f.addonPrice).toFixed(0)}/mo
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleActive(f.id, f.isActive)}
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors',
                            f.isActive
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                          )}
                        >
                          {f.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingId === f.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleUpdate(f.id)}
                              className="p-1 rounded hover:bg-emerald-100 text-emerald-600"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 rounded hover:bg-slate-100 text-slate-400"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(f)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        );
      })}

      {filteredFeatures.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <Blocks className="w-8 h-8 mb-2" />
          <p className="text-sm">No features found</p>
        </div>
      )}
    </div>
  );
}

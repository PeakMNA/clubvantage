'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Package,
  ChevronRight,
  Check,
  X as XIcon,
  DollarSign,
  Users,
  Shield,
  Pencil,
  Eye,
} from 'lucide-react';
import { PageHeader, Section } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  useVerticals,
  useVertical,
  useFeatureDefinitions,
  useCreateVertical,
  useCreatePackage,
  useSetPackageFeatures,
} from '@/hooks/use-configurable-packages';
import { cn } from '@/lib/utils';

const TIER_CONFIG = {
  STARTER: { label: 'Starter', color: 'bg-slate-100 text-slate-700', border: 'border-slate-200' },
  PRO: { label: 'Pro', color: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
  ENTERPRISE: { label: 'Enterprise', color: 'bg-purple-100 text-purple-700', border: 'border-purple-200' },
  CUSTOM: { label: 'Custom', color: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
} as const;

export default function VerticalsPage() {
  const { data: verticalsData, isLoading: verticalsLoading } = useVerticals();
  const { data: featuresData } = useFeatureDefinitions();
  const createVerticalMutation = useCreateVertical();

  const [selectedVerticalId, setSelectedVerticalId] = useState<string | null>(null);
  const [showCreateVertical, setShowCreateVertical] = useState(false);
  const [newVertical, setNewVertical] = useState({ name: '', slug: '', description: '' });

  const verticals = verticalsData?.verticals ?? [];
  const allFeatures = featuresData?.featureDefinitions ?? [];

  // Load details when a vertical is selected
  const { data: verticalDetail } = useVertical(selectedVerticalId || '');
  const selectedVertical = verticalDetail?.vertical;

  async function handleCreateVertical() {
    await createVerticalMutation.mutateAsync({
      input: {
        name: newVertical.name,
        slug: newVertical.slug,
        description: newVertical.description || undefined,
      },
    });
    setNewVertical({ name: '', slug: '', description: '' });
    setShowCreateVertical(false);
  }

  if (verticalsLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Verticals & Packages" description="Configure packages for each club vertical" />
        <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verticals & Packages"
        description="Define club verticals and their tiered subscription packages"
        actions={
          <Button onClick={() => setShowCreateVertical(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Vertical
          </Button>
        }
      />

      {/* Create vertical form */}
      {showCreateVertical && (
        <Section>
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">New Vertical</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                <Input
                  placeholder="e.g. Golf Club"
                  value={newVertical.name}
                  onChange={(e) => setNewVertical({ ...newVertical, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Slug</label>
                <Input
                  placeholder="e.g. golf"
                  value={newVertical.slug}
                  onChange={(e) => setNewVertical({ ...newVertical, slug: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <Input
                  placeholder="Brief description"
                  value={newVertical.description}
                  onChange={(e) => setNewVertical({ ...newVertical, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowCreateVertical(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateVertical} disabled={!newVertical.name || !newVertical.slug}>
                Create Vertical
              </Button>
            </div>
          </div>
        </Section>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Verticals list */}
        <div className="col-span-4">
          <Section>
            <div className="space-y-2">
              {verticals.map((v) => {
                const isSelected = selectedVerticalId === v.id;
                const packageCount = v.packages?.length ?? 0;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVerticalId(v.id)}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border transition-all',
                      isSelected
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={cn('text-sm font-semibold', isSelected ? 'text-blue-900' : 'text-slate-900')}>
                          {v.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">{v.description || v.slug}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{packageCount} pkgs</span>
                        <ChevronRight className={cn('w-4 h-4', isSelected ? 'text-blue-500' : 'text-slate-300')} />
                      </div>
                    </div>
                    {v.packages && v.packages.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {v.packages.map((pkg) => {
                          const config = TIER_CONFIG[pkg.tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.CUSTOM;
                          return (
                            <span
                              key={pkg.id}
                              className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', config.color)}
                            >
                              {config.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Section>
        </div>

        {/* Right: Package details */}
        <div className="col-span-8">
          {selectedVertical ? (
            <VerticalDetail
              vertical={selectedVertical}
              allFeatures={allFeatures}
            />
          ) : (
            <Section>
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Package className="w-8 h-8 mb-2" />
                <p className="text-sm">Select a vertical to view packages</p>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function VerticalDetail({
  vertical,
  allFeatures,
}: {
  vertical: NonNullable<ReturnType<typeof useVertical>['data']>['vertical'];
  allFeatures: any[];
}) {
  if (!vertical) return null;

  const packages = vertical.packages || [];
  const moduleFeatures = allFeatures.filter((f) => f.category === 'MODULE');
  const featureFeatures = allFeatures.filter((f) => f.category === 'FEATURE');

  // Build lookup: packageId → set of enabled feature keys
  const packageFeatureMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const pkg of packages) {
      const enabledKeys = new Set<string>();
      for (const pf of (pkg.features || [])) {
        if (pf.enabled) enabledKeys.add(pf.featureDefinition.key);
      }
      map[pkg.id] = enabledKeys;
    }
    return map;
  }, [packages]);

  return (
    <div className="space-y-6">
      {/* Vertical header */}
      <Section>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{vertical.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{vertical.description}</p>
          </div>
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            vertical.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500',
          )}>
            {vertical.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </Section>

      {/* Packages comparison */}
      <Section>
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Package Comparison</h3>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3 w-48"></th>
                {packages.map((pkg) => {
                  const config = TIER_CONFIG[pkg.tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.CUSTOM;
                  return (
                    <th key={pkg.id} className="text-center px-4 py-3">
                      <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', config.color)}>
                        {pkg.name}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Pricing row */}
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-2.5 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  Monthly Price
                </td>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="px-4 py-2.5 text-center">
                    <span className="text-sm font-semibold text-slate-900">
                      ${Number(pkg.basePrice).toLocaleString()}
                    </span>
                  </td>
                ))}
              </tr>
              {/* Annual pricing */}
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-2.5 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  Annual Price
                </td>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="px-4 py-2.5 text-center">
                    <span className="text-sm text-slate-700">
                      {pkg.annualPrice ? `$${Number(pkg.annualPrice).toLocaleString()}` : '—'}
                    </span>
                  </td>
                ))}
              </tr>
              {/* Limits */}
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="px-4 py-2.5 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Member Limit
                </td>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="px-4 py-2.5 text-center text-sm text-slate-700">
                    {pkg.defaultMemberLimit?.toLocaleString() ?? 'Unlimited'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <td className="px-4 py-2.5 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  Staff Limit
                </td>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="px-4 py-2.5 text-center text-sm text-slate-700">
                    {pkg.defaultUserLimit?.toLocaleString() ?? 'Unlimited'}
                  </td>
                ))}
              </tr>

              {/* Module features section */}
              <tr className="bg-blue-50/30">
                <td colSpan={packages.length + 1} className="px-4 py-2 text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Modules
                </td>
              </tr>
              {moduleFeatures.map((mf) => (
                <tr key={mf.id} className="border-b border-slate-100">
                  <td className="px-4 py-2 text-sm text-slate-700">{mf.name}</td>
                  {packages.map((pkg) => {
                    const enabled = packageFeatureMap[pkg.id]?.has(mf.key) ?? false;
                    return (
                      <td key={pkg.id} className="px-4 py-2 text-center">
                        {enabled ? (
                          <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <XIcon className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Feature flags section */}
              <tr className="bg-purple-50/30">
                <td colSpan={packages.length + 1} className="px-4 py-2 text-xs font-semibold text-purple-700 uppercase tracking-wide">
                  Features
                </td>
              </tr>
              {featureFeatures.map((ff) => (
                <tr key={ff.id} className="border-b border-slate-100">
                  <td className="px-4 py-2">
                    <div className="text-sm text-slate-700">{ff.name}</div>
                    {ff.addonPrice && (
                      <span className="text-[10px] text-slate-400">Add-on: ${Number(ff.addonPrice).toFixed(0)}/mo</span>
                    )}
                  </td>
                  {packages.map((pkg) => {
                    const enabled = packageFeatureMap[pkg.id]?.has(ff.key) ?? false;
                    return (
                      <td key={pkg.id} className="px-4 py-2 text-center">
                        {enabled ? (
                          <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <XIcon className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

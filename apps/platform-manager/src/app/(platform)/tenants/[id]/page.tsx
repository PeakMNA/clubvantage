'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  UserCog,
  Ban,
  Archive,
  Building2,
  Package,
  Plus,
  Check,
  X as XIcon,
  DollarSign,
  Users,
  Shield,
  Zap,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader, Section } from '@/components/layout';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { KPICard, KPIGrid, StatusBadge, TierBadge, FeaturesPanel } from '@/components/data';
import {
  useClubPackage,
  useClubAddons,
  useAssignClubPackage,
  useAddClubAddon,
  useRemoveClubAddon,
  useVerticals,
  useFeatureDefinitions,
} from '@/hooks/use-configurable-packages';
import { useAllClubFeatureFlags } from '@/hooks/use-feature-flags';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'configuration', label: 'Configuration' },
  { id: 'package', label: 'Package' },
  { id: 'subscription', label: 'Subscription' },
  { id: 'users', label: 'Users' },
  { id: 'audit', label: 'Audit Log' },
];

function mapTierDisplay(apiTier: string): 'starter' | 'professional' | 'enterprise' {
  const t = apiTier.toLowerCase();
  if (t === 'enterprise') return 'enterprise';
  if (t === 'professional' || t === 'pro') return 'professional';
  return 'starter';
}

export default function TenantDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const clubId = params.id as string;

  const activeTab = searchParams.get('tab') || 'overview';

  const setActiveTab = (tab: string) => {
    router.push(`/tenants/${clubId}?tab=${tab}`);
  };

  // Fetch club data from feature flags API (use allClubFeatureFlags for full summary type)
  const { data: allFlagsData, isLoading, error } = useAllClubFeatureFlags();
  const clubFlags = allFlagsData?.allClubFeatureFlags?.find(c => c.clubId === clubId);

  const clubName = clubFlags?.clubName ?? 'Loading...';
  const tier = clubFlags ? mapTierDisplay(clubFlags.subscriptionTier) : 'starter';
  const maintenanceMode = !!clubFlags?.flags?.operational?.maintenanceMode;

  // Compute enabled modules and features from flags
  const enabledModules = React.useMemo(() => {
    if (!clubFlags?.flags?.modules) return [];
    return Object.entries(clubFlags.flags.modules)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);
  }, [clubFlags]);

  const enabledFeatures = React.useMemo(() => {
    if (!clubFlags?.flags?.features) return [];
    return Object.entries(clubFlags.flags.features)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);
  }, [clubFlags]);

  if (isLoading) {
    return (
      <div>
        <Link
          href="/tenants"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tenants
        </Link>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Link
          href="/tenants"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tenants
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500">Failed to load tenant data</p>
            <p className="text-sm text-slate-500 mt-1">{String(error)}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Back Link */}
      <Link
        href="/tenants"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tenants
      </Link>

      {/* Header Card */}
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Logo Placeholder */}
              <div className="h-16 w-16 rounded-lg bg-slate-100 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-slate-400" />
              </div>

              {/* Tenant Info */}
              <div>
                <h1 className="text-xl font-bold text-slate-900">{clubName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {maintenanceMode ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      <AlertTriangle className="h-3 w-3" />
                      Maintenance Mode
                    </span>
                  ) : (
                    <StatusBadge status="active" />
                  )}
                  <TierBadge tier={tier} />
                  {clubFlags?.hasOperationalOverrides && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      Overrides Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Dropdown */}
            <div className="relative">
              <Button
                variant="secondary"
                onClick={() => setActionsOpen(!actionsOpen)}
              >
                Actions
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>

              {actionsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setActionsOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                    <button
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        // TODO: Wire to impersonation API when available
                        console.log('Impersonate', clubId);
                        setActionsOpen(false);
                      }}
                    >
                      <UserCog className="h-4 w-4" />
                      Impersonate
                    </button>
                    <button
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50"
                      onClick={() => {
                        // TODO: Wire to suspend API when available
                        console.log('Suspend', clubId);
                        setActionsOpen(false);
                      }}
                    >
                      <Ban className="h-4 w-4" />
                      Suspend
                    </button>
                    <button
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => {
                        // TODO: Wire to archive API when available
                        console.log('Archive', clubId);
                        setActionsOpen(false);
                      }}
                    >
                      <Archive className="h-4 w-4" />
                      Archive
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-6 border-b border-slate-200 -mx-6 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          clubId={clubId}
          clubName={clubName}
          tier={tier}
          enabledModules={enabledModules}
          enabledFeatures={enabledFeatures}
          maintenanceMode={maintenanceMode}
          hasOverrides={!!clubFlags?.hasOperationalOverrides}
        />
      )}
      {activeTab === 'configuration' && (
        <ConfigurationTab clubId={clubId} clubName={clubName} tier={tier} />
      )}
      {activeTab === 'package' && <PackageTab clubId={clubId} />}
      {activeTab === 'subscription' && <SubscriptionTab clubId={clubId} />}
      {activeTab === 'users' && <UsersTab clubId={clubId} />}
      {activeTab === 'audit' && <AuditTab clubId={clubId} />}
    </div>
  );
}

// Overview Tab — shows what we know from feature flags + package
function OverviewTab({
  clubId,
  clubName,
  tier,
  enabledModules,
  enabledFeatures,
  maintenanceMode,
  hasOverrides,
}: {
  clubId: string;
  clubName: string;
  tier: string;
  enabledModules: string[];
  enabledFeatures: string[];
  maintenanceMode: boolean;
  hasOverrides: boolean;
}) {
  const { data: clubPkgData } = useClubPackage(clubId);
  const { data: addonsData } = useClubAddons(clubId);

  const clubPackage = clubPkgData?.clubPackage;
  const addons = addonsData?.clubAddons ?? [];

  return (
    <>
      {/* KPI Cards */}
      <KPIGrid columns={4} className="mb-8">
        <KPICard
          label="Enabled Modules"
          value={enabledModules.length}
        />
        <KPICard
          label="Enabled Features"
          value={enabledFeatures.length}
        />
        <KPICard
          label="Active Add-ons"
          value={addons.length}
        />
        <KPICard
          label="Subscription Tier"
          value={tier.charAt(0).toUpperCase() + tier.slice(1)}
        />
      </KPIGrid>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Enabled Modules */}
        <Section title="Enabled Modules">
          <Card>
            <CardContent className="pt-6">
              {enabledModules.length > 0 ? (
                <div className="space-y-2">
                  {enabledModules.map((mod) => (
                    <div
                      key={mod}
                      className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-0"
                    >
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium text-slate-900 capitalize">
                        {mod}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No modules enabled</p>
              )}
            </CardContent>
          </Card>
        </Section>

        {/* Enabled Features */}
        <Section title="Enabled Features">
          <Card>
            <CardContent className="pt-6">
              {enabledFeatures.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {enabledFeatures.map((feat) => (
                    <span
                      key={feat}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700"
                    >
                      <Check className="h-3 w-3" />
                      {feat.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No features enabled</p>
              )}
            </CardContent>
          </Card>
        </Section>

        {/* Package Summary */}
        <Section title="Current Package">
          <Card>
            <CardContent className="pt-6">
              {clubPackage ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {clubPackage.package.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {clubPackage.package.vertical?.name} - {clubPackage.package.tier}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-sm text-slate-600">
                    <span>Base: ${Number(clubPackage.package.basePrice).toLocaleString()}/mo</span>
                    <span>Members: {clubPackage.memberLimitOverride ?? clubPackage.package.defaultMemberLimit ?? 'Unlimited'}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Package className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No package assigned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </Section>

        {/* Operational Status */}
        <Section title="Operational Status">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Maintenance Mode</span>
                {maintenanceMode ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    <AlertTriangle className="h-3 w-3" />
                    Active
                  </span>
                ) : (
                  <span className="text-xs text-emerald-600 font-medium">Off</span>
                )}
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Operational Overrides</span>
                <span className={cn('text-xs font-medium', hasOverrides ? 'text-blue-600' : 'text-slate-400')}>
                  {hasOverrides ? 'Active' : 'None'}
                </span>
              </div>
            </CardContent>
          </Card>
        </Section>
      </div>
    </>
  );
}

// Configuration Tab
function ConfigurationTab({
  clubId,
  clubName,
  tier,
}: {
  clubId: string;
  clubName: string;
  tier: string;
}) {
  return (
    <div className="space-y-6">
      {/* Feature Flags Section */}
      <Section title="Feature Flags">
        <FeaturesPanel
          clubId={clubId}
          clubName={clubName}
          tier={tier}
        />
      </Section>
    </div>
  );
}

// Subscription Tab
function SubscriptionTab({ clubId }: { clubId: string }) {
  const { data: clubPkgData, isLoading } = useClubPackage(clubId);
  const clubPackage = clubPkgData?.clubPackage;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Section title="Current Plan">
        <Card>
          <CardContent className="pt-6">
            {clubPackage ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {clubPackage.package.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {clubPackage.package.tier} tier - {clubPackage.package.vertical?.name}
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-slate-900">
                    ${Number(clubPackage.package.basePrice).toLocaleString()}/mo
                  </span>
                </div>

                {/* Limits */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500">Member Limit</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {clubPackage.memberLimitOverride ??
                        clubPackage.package.defaultMemberLimit?.toLocaleString() ??
                        'Unlimited'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Staff Limit</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {clubPackage.userLimitOverride ??
                        clubPackage.package.defaultUserLimit?.toLocaleString() ??
                        'Unlimited'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No subscription plan assigned</p>
              </div>
            )}
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}

// Package Tab — already fully wired from previous implementation
const TIER_COLORS: Record<string, string> = {
  STARTER: 'bg-slate-100 text-slate-700',
  PRO: 'bg-blue-100 text-blue-700',
  ENTERPRISE: 'bg-purple-100 text-purple-700',
  CUSTOM: 'bg-amber-100 text-amber-700',
};

function PackageTab({ clubId }: { clubId: string }) {
  const { data: clubPkgData, isLoading: pkgLoading } = useClubPackage(clubId);
  const { data: addonsData, isLoading: addonsLoading } = useClubAddons(clubId);
  const { data: verticalsData } = useVerticals();
  const { data: featuresData } = useFeatureDefinitions();
  const assignPackageMutation = useAssignClubPackage();
  const addAddonMutation = useAddClubAddon();
  const removeAddonMutation = useRemoveClubAddon();

  const [showAssign, setShowAssign] = React.useState(false);
  const [selectedPackageId, setSelectedPackageId] = React.useState('');
  const [showAddAddon, setShowAddAddon] = React.useState(false);
  const [selectedAddonId, setSelectedAddonId] = React.useState('');

  const clubPackage = clubPkgData?.clubPackage;
  const addons = addonsData?.clubAddons ?? [];
  const verticals = verticalsData?.verticals ?? [];
  const allFeatures = featuresData?.featureDefinitions ?? [];

  // Build flat list of all packages across verticals for the assign dropdown
  const allPackages = React.useMemo(() => {
    const pkgs: Array<{ id: string; name: string; verticalName: string; tier: string }> = [];
    for (const v of verticals) {
      for (const p of (v.packages || [])) {
        pkgs.push({ id: p.id, name: p.name, verticalName: v.name, tier: p.tier });
      }
    }
    return pkgs;
  }, [verticals]);

  // Available add-on features (FEATURE category with addonPrice, not already active)
  const availableAddons = React.useMemo(() => {
    const activeIds = new Set(addons.map((a) => a.featureDefinition?.id));
    return allFeatures.filter(
      (f) => f.category === 'FEATURE' && f.addonPrice && !activeIds.has(f.id),
    );
  }, [allFeatures, addons]);

  async function handleAssign() {
    if (!selectedPackageId) return;
    await assignPackageMutation.mutateAsync({
      input: { clubId, packageId: selectedPackageId },
    });
    setShowAssign(false);
    setSelectedPackageId('');
  }

  async function handleAddAddon() {
    if (!selectedAddonId) return;
    await addAddonMutation.mutateAsync({
      input: { clubId, featureDefinitionId: selectedAddonId },
    });
    setShowAddAddon(false);
    setSelectedAddonId('');
  }

  async function handleRemoveAddon(featureDefinitionId: string) {
    await removeAddonMutation.mutateAsync({ clubId, featureDefinitionId });
  }

  if (pkgLoading || addonsLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading package data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Package */}
      <Section title="Current Package">
        <Card>
          <CardContent className="pt-6">
            {clubPackage ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {clubPackage.package.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full',
                          TIER_COLORS[clubPackage.package.tier] || TIER_COLORS.CUSTOM,
                        )}>
                          {clubPackage.package.tier}
                        </span>
                        <span className="text-xs text-slate-500">
                          {clubPackage.package.vertical?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAssign(true)}
                  >
                    Change Package
                  </Button>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Monthly</p>
                      <p className="text-sm font-semibold text-slate-900">
                        ${Number(clubPackage.package.basePrice).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Member Limit</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {clubPackage.memberLimitOverride ??
                          clubPackage.package.defaultMemberLimit?.toLocaleString() ??
                          'Unlimited'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Staff Limit</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {clubPackage.userLimitOverride ??
                          clubPackage.package.defaultUserLimit?.toLocaleString() ??
                          'Unlimited'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Included Features */}
                {clubPackage.package.features && clubPackage.package.features.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-2">Included Features</p>
                    <div className="flex flex-wrap gap-1.5">
                      {clubPackage.package.features
                        .filter((pf: any) => pf.enabled)
                        .map((pf: any) => (
                          <span
                            key={pf.featureDefinition.key}
                            className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full"
                          >
                            <Check className="h-3 w-3" />
                            {pf.featureDefinition.name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500 mb-3">No package assigned</p>
                <Button size="sm" onClick={() => setShowAssign(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Assign Package
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </Section>

      {/* Assign Package Form */}
      {showAssign && (
        <Section>
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {clubPackage ? 'Change Package' : 'Assign Package'}
            </h3>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Select Package
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(e.target.value)}
              >
                <option value="">Choose a package...</option>
                {verticals.map((v) => (
                  <optgroup key={v.id} label={v.name}>
                    {(v.packages || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ${Number(p.basePrice).toLocaleString()}/mo
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowAssign(false); setSelectedPackageId(''); }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAssign}
                disabled={!selectedPackageId || assignPackageMutation.isPending}
              >
                {assignPackageMutation.isPending ? 'Assigning...' : 'Assign Package'}
              </Button>
            </div>
          </div>
        </Section>
      )}

      {/* Add-ons */}
      <Section title="Active Add-ons">
        <Card>
          <CardContent className="pt-6">
            {addons.length > 0 ? (
              <div className="space-y-3">
                {addons.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {addon.featureDefinition?.name}
                        </p>
                        {addon.featureDefinition?.addonPrice && (
                          <p className="text-xs text-slate-500">
                            ${Number(addon.featureDefinition.addonPrice).toFixed(0)}/mo
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAddon(addon.featureDefinition.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove add-on"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No active add-ons</p>
            )}

            {/* Add addon button */}
            {!showAddAddon && availableAddons.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddAddon(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Add-on
                </Button>
              </div>
            )}

            {/* Add addon form */}
            {showAddAddon && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <label className="block text-xs font-medium text-slate-600">
                  Select Feature Add-on
                </label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={selectedAddonId}
                  onChange={(e) => setSelectedAddonId(e.target.value)}
                >
                  <option value="">Choose a feature...</option>
                  {availableAddons.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — ${Number(f.addonPrice).toFixed(0)}/mo
                    </option>
                  ))}
                </select>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setShowAddAddon(false); setSelectedAddonId(''); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddAddon}
                    disabled={!selectedAddonId || addAddonMutation.isPending}
                  >
                    {addAddonMutation.isPending ? 'Adding...' : 'Add Add-on'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}

// Users Tab — needs backend API for tenant user listing
function UsersTab({ clubId }: { clubId: string }) {
  return (
    <Section title="Tenant Users">
      <Card>
        <CardContent className="py-12 text-center text-slate-500">
          {/* TODO: Wire to tenant user listing API when available */}
          <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm">User management requires a dedicated tenant users API.</p>
          <p className="text-xs text-slate-400 mt-1">Club ID: {clubId}</p>
        </CardContent>
      </Card>
    </Section>
  );
}

// Audit Tab — needs backend API for audit log
function AuditTab({ clubId }: { clubId: string }) {
  return (
    <Section title="Audit Log">
      <Card>
        <CardContent className="py-12 text-center text-slate-500">
          {/* TODO: Wire to audit log API when available */}
          <Shield className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm">Audit log requires a dedicated audit API.</p>
          <p className="text-xs text-slate-400 mt-1">Club ID: {clubId}</p>
        </CardContent>
      </Card>
    </Section>
  );
}

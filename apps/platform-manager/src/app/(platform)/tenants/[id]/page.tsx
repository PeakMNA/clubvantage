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
} from 'lucide-react';
import { PageHeader, Section } from '@/components/layout';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { KPICard, KPIGrid, HealthScore, StatusBadge, TierBadge, FeaturesPanel } from '@/components/data';
import {
  useClubPackage,
  useClubAddons,
  useAssignClubPackage,
  useAddClubAddon,
  useRemoveClubAddon,
  useVerticals,
  useFeatureDefinitions,
} from '@/hooks/use-configurable-packages';
import { cn } from '@/lib/utils';

// Mock tenant data
const mockTenant = {
  id: '1',
  name: 'Green Valley Country Club',
  subdomain: 'greenvalley',
  logoUrl: null,
  tier: 'enterprise' as const,
  status: 'active' as const,
  region: 'TH',
  members: 1247,
  staff: 18,
  mrr: 2500,
  healthScore: 85,
  healthBreakdown: {
    engagement: 92,
    adoption: 78,
    payment: 100,
    support: 65,
  },
  createdAt: '2023-06-15',
  subscription: {
    plan: 'Enterprise',
    billingCycle: 'Annual',
    nextRenewal: '2026-06-15',
    usage: {
      members: { used: 1247, limit: 5000 },
      staff: { used: 18, limit: 50 },
      storage: { used: 12.5, limit: 50 },
    },
  },
  config: {
    timezone: 'Asia/Bangkok',
    currency: 'THB',
    language: 'th',
    features: ['Golf Tee Sheet', 'Member Portal', 'Billing', 'Reports'],
  },
  branding: {
    primaryColor: '#1E40AF',
    secondaryColor: '#64748B',
  },
  recentActivity: [
    { type: 'member', message: 'New member: John Smith', time: '10 minutes ago' },
    { type: 'payment', message: 'Invoice paid: INV-0042', time: '2 hours ago' },
    { type: 'staff', message: 'Staff added: Napat Wongsa', time: '1 day ago' },
    { type: 'config', message: 'Branding updated', time: '3 days ago' },
  ],
};

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'configuration', label: 'Configuration' },
  { id: 'package', label: 'Package' },
  { id: 'subscription', label: 'Subscription' },
  { id: 'users', label: 'Users' },
  { id: 'audit', label: 'Audit Log' },
];

export default function TenantDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [actionsOpen, setActionsOpen] = React.useState(false);

  const activeTab = searchParams.get('tab') || 'overview';

  const setActiveTab = (tab: string) => {
    router.push(`/tenants/${params.id}?tab=${tab}`);
  };

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
              {/* Logo or Placeholder */}
              {mockTenant.logoUrl ? (
                <img
                  src={mockTenant.logoUrl}
                  alt={mockTenant.name}
                  className="h-16 w-16 rounded-lg object-contain"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-slate-400" />
                </div>
              )}

              {/* Tenant Info */}
              <div>
                <h1 className="text-xl font-bold text-slate-900">{mockTenant.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <a
                    href={`https://${mockTenant.subdomain}.clubvantage.io`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {mockTenant.subdomain}.clubvantage.io
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-slate-300">•</span>
                  <StatusBadge status={mockTenant.status} />
                  <TierBadge tier={mockTenant.tier} />
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
                    <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <UserCog className="h-4 w-4" />
                      Impersonate
                    </button>
                    <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50">
                      <Ban className="h-4 w-4" />
                      Suspend
                    </button>
                    <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
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
      {activeTab === 'overview' && <OverviewTab tenant={mockTenant} />}
      {activeTab === 'configuration' && <ConfigurationTab tenant={mockTenant} />}
      {activeTab === 'package' && <PackageTab clubId={params.id as string} />}
      {activeTab === 'subscription' && <SubscriptionTab tenant={mockTenant} />}
      {activeTab === 'users' && <UsersTab tenant={mockTenant} />}
      {activeTab === 'audit' && <AuditTab tenant={mockTenant} />}
    </div>
  );
}

// Overview Tab
function OverviewTab({ tenant }: { tenant: typeof mockTenant }) {
  return (
    <>
      {/* KPI Cards */}
      <KPIGrid columns={4} className="mb-8">
        <KPICard
          label="Health Score"
          value={tenant.healthScore}
          format="percentage"
        />
        <KPICard
          label="Members"
          value={tenant.members}
          trend={{ value: 3.2, direction: 'up' }}
        />
        <KPICard
          label="Staff Users"
          value={tenant.staff}
        />
        <KPICard
          label="MRR"
          value={tenant.mrr}
          format="currency"
          trend={{ value: 5.1, direction: 'up' }}
        />
      </KPIGrid>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Health Breakdown */}
        <Section title="Health Breakdown">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <HealthScore
                  score={tenant.healthScore}
                  size="lg"
                  showBreakdown
                  breakdown={tenant.healthBreakdown}
                />
                <div className="flex-1 space-y-3">
                  <HealthBar label="Engagement" value={tenant.healthBreakdown.engagement} />
                  <HealthBar label="Adoption" value={tenant.healthBreakdown.adoption} />
                  <HealthBar label="Payment" value={tenant.healthBreakdown.payment} />
                  <HealthBar label="Support" value={tenant.healthBreakdown.support} />
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Recent Activity */}
        <Section title="Recent Activity">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {tenant.recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between py-2 border-b border-slate-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                  </div>
                  <span className="text-xs text-slate-400">{activity.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </Section>
      </div>
    </>
  );
}

function HealthBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-medium text-slate-900">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={cn('h-full rounded-full', color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// Configuration Tab
function ConfigurationTab({ tenant }: { tenant: typeof mockTenant }) {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="Club Settings">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <ConfigRow label="Timezone" value={tenant.config.timezone} />
              <ConfigRow label="Currency" value={tenant.config.currency} />
              <ConfigRow label="Language" value={tenant.config.language.toUpperCase()} />
              <ConfigRow label="Created" value={tenant.createdAt} />
            </CardContent>
          </Card>
        </Section>

        <Section title="Branding Preview">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm text-slate-500">Primary</span>
                <div
                  className="mt-1 h-10 w-20 rounded border"
                  style={{ backgroundColor: tenant.branding.primaryColor }}
                />
              </div>
              <div>
                <span className="text-sm text-slate-500">Secondary</span>
                <div
                  className="mt-1 h-10 w-20 rounded border"
                  style={{ backgroundColor: tenant.branding.secondaryColor }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>
      </div>

      {/* Feature Flags Section */}
      <Section title="Feature Flags">
        <FeaturesPanel
          clubId={tenant.id}
          clubName={tenant.name}
          tier={tenant.tier}
        />
      </Section>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}

// Subscription Tab
function SubscriptionTab({ tenant }: { tenant: typeof mockTenant }) {
  const { subscription } = tenant;

  return (
    <div className="space-y-6">
      <Section title="Current Plan">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Badge variant="enterprise" className="mb-2">{subscription.plan}</Badge>
                <p className="text-sm text-slate-500">
                  Billing: {subscription.billingCycle} • Next renewal: {subscription.nextRenewal}
                </p>
              </div>
              <Button variant="secondary">Change Plan</Button>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section title="Usage">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <UsageRow
              label="Members"
              used={subscription.usage.members.used}
              limit={subscription.usage.members.limit}
            />
            <UsageRow
              label="Staff Users"
              used={subscription.usage.staff.used}
              limit={subscription.usage.staff.limit}
            />
            <UsageRow
              label="Storage"
              used={subscription.usage.storage.used}
              limit={subscription.usage.storage.limit}
              unit="GB"
            />
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}

function UsageRow({
  label,
  used,
  limit,
  unit = '',
}: {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}) {
  const percentage = Math.round((used / limit) * 100);
  const isWarning = percentage >= 80;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm text-slate-500">
          {used.toLocaleString()}{unit} / {limit.toLocaleString()}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full',
            isWarning ? 'bg-amber-500' : 'bg-blue-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Package Tab
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

// Users Tab (placeholder)
function UsersTab({ tenant }: { tenant: typeof mockTenant }) {
  return (
    <Section title="Tenant Users">
      <Card>
        <CardContent className="py-12 text-center text-slate-500">
          User list would go here
        </CardContent>
      </Card>
    </Section>
  );
}

// Audit Tab (placeholder)
function AuditTab({ tenant }: { tenant: typeof mockTenant }) {
  return (
    <Section title="Audit Log">
      <Card>
        <CardContent className="py-12 text-center text-slate-500">
          Audit log table would go here
        </CardContent>
      </Card>
    </Section>
  );
}

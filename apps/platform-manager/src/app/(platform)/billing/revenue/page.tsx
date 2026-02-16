'use client';

import * as React from 'react';
import { DollarSign, TrendingUp, Building2, Layers, Loader2, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAllClubFeatureFlags } from '@/hooks/use-feature-flags';
import { useVerticals } from '@/hooks/use-configurable-packages';

export default function RevenuePage() {
  const { data: flagsData, isLoading: loadingFlags } = useAllClubFeatureFlags();
  const { data: verticalsData, isLoading: loadingVerticals } = useVerticals();

  const clubs = flagsData?.allClubFeatureFlags ?? [];
  const verticals = verticalsData?.verticals ?? [];

  // Tier distribution
  const tierBreakdown = React.useMemo(() => {
    const counts = { STARTER: 0, PROFESSIONAL: 0, ENTERPRISE: 0 };
    for (const club of clubs) {
      const t = (club.subscriptionTier || '').toUpperCase();
      if (t === 'ENTERPRISE') counts.ENTERPRISE++;
      else if (t === 'PROFESSIONAL' || t === 'PRO') counts.PROFESSIONAL++;
      else counts.STARTER++;
    }
    return counts;
  }, [clubs]);

  // Collect packages with pricing for reference
  const packagesByTier = React.useMemo(() => {
    const tiers: Record<string, Array<{ name: string; basePrice: number; verticalName: string }>> = {};
    for (const v of verticals) {
      for (const p of (v.packages || [])) {
        const tier = (p.tier || 'CUSTOM').toUpperCase();
        if (!tiers[tier]) tiers[tier] = [];
        tiers[tier].push({
          name: p.name,
          basePrice: Number(p.basePrice) || 0,
          verticalName: v.name,
        });
      }
    }
    return tiers;
  }, [verticals]);

  // Calculate estimated MRR based on avg base price per tier * tenant count
  const revenueEstimate = React.useMemo(() => {
    let totalEstimatedMRR = 0;
    const tierRevenue: Array<{ tier: string; count: number; avgPrice: number; estimatedMRR: number }> = [];

    for (const [tier, count] of Object.entries(tierBreakdown)) {
      const packages = packagesByTier[tier] || [];
      const avgPrice = packages.length > 0
        ? packages.reduce((sum, p) => sum + p.basePrice, 0) / packages.length
        : 0;
      const estimated = Math.round(avgPrice * count);
      totalEstimatedMRR += estimated;
      tierRevenue.push({ tier, count, avgPrice: Math.round(avgPrice), estimatedMRR: estimated });
    }

    return { totalEstimatedMRR, tierRevenue };
  }, [tierBreakdown, packagesByTier]);

  const isLoading = loadingFlags || loadingVerticals;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Revenue Overview</h1>
          <p className="text-slate-500 mt-1">Platform-wide revenue metrics</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Revenue Overview</h1>
        <p className="text-slate-500 mt-1">Platform-wide revenue metrics and tenant breakdown</p>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <KPICard
          label="Total Tenants"
          value={clubs.length.toString()}
          icon={<Building2 className="h-5 w-5 text-blue-600" />}
        />
        <KPICard
          label="Estimated MRR"
          value={`$${revenueEstimate.totalEstimatedMRR.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
          subtitle="Based on package base prices"
        />
        <KPICard
          label="Verticals"
          value={verticals.length.toString()}
          icon={<Layers className="h-5 w-5 text-purple-600" />}
        />
        <KPICard
          label="Available Packages"
          value={Object.values(packagesByTier).flat().length.toString()}
          icon={<Package className="h-5 w-5 text-amber-600" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by Tier */}
        <Card>
          <CardHeader>
            <CardTitle>Estimated Revenue by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueEstimate.tierRevenue.map((tier) => {
                const pct = revenueEstimate.totalEstimatedMRR > 0
                  ? Math.round((tier.estimatedMRR / revenueEstimate.totalEstimatedMRR) * 100)
                  : 0;
                return (
                  <div key={tier.tier}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="font-medium text-slate-900 capitalize">{tier.tier.toLowerCase()}</span>
                        <span className="text-sm text-slate-500 ml-2">({tier.count} tenants)</span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        ${tier.estimatedMRR.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          tier.tier === 'ENTERPRISE' ? 'bg-purple-500' :
                          tier.tier === 'PROFESSIONAL' ? 'bg-blue-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {pct}% of estimated MRR (avg ${tier.avgPrice}/mo per tenant)
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
              Estimates based on average package base prices per tier. Actual revenue requires a billing API.
            </p>
          </CardContent>
        </Card>

        {/* Package Pricing Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Package Pricing Reference</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(packagesByTier).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(packagesByTier)
                  .sort(([a], [b]) => {
                    const order: Record<string, number> = { STARTER: 0, PRO: 1, PROFESSIONAL: 1, ENTERPRISE: 2 };
                    return (order[a] ?? 3) - (order[b] ?? 3);
                  })
                  .map(([tier, packages]) => (
                    <div key={tier}>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2 capitalize">
                        {tier.toLowerCase()} Tier
                      </h4>
                      <div className="space-y-2">
                        {packages.map((pkg) => (
                          <div
                            key={pkg.name}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-900">{pkg.name}</p>
                              <p className="text-xs text-slate-500">{pkg.verticalName}</p>
                            </div>
                            <span className="text-sm font-semibold text-slate-900">
                              ${pkg.basePrice.toLocaleString()}/mo
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No packages configured yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  icon,
  subtitle,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

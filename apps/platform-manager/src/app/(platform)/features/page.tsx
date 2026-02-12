'use client';

import * as React from 'react';
import { ToggleLeft, Check, X, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { PageHeader, Section } from '@/components/layout';
import { Card, CardContent } from '@/components/ui';
import { DataTable, ColumnDef, KPICard, KPIGrid, TierBadge } from '@/components/data';
import { useAllClubFeatureFlags, useTierDefaults } from '@/hooks/use-feature-flags';
import { getFeatureFlagLabel, getFeatureFlagsByCategory } from '@/lib/feature-flag-labels';
import { cn } from '@/lib/utils';

export default function FeatureFlagsPage() {
  const { data: clubsData, isLoading: clubsLoading } = useAllClubFeatureFlags();
  const { data: tierData, isLoading: tierLoading } = useTierDefaults();

  const clubs = clubsData?.allClubFeatureFlags || [];
  const tiers = tierData?.tierDefaults || [];

  // Calculate KPIs
  const totalClubs = clubs.length;
  const clubsByTier = React.useMemo(() => {
    const counts: Record<string, number> = {};
    clubs.forEach((club) => {
      counts[club.subscriptionTier] = (counts[club.subscriptionTier] || 0) + 1;
    });
    return counts;
  }, [clubs]);
  const clubsWithOverrides = clubs.filter((c) => c.hasOperationalOverrides).length;

  // Get flag metadata organized by category
  const flagsByCategory = getFeatureFlagsByCategory();

  // Helper to check if a flag is enabled in a tier
  const isFlagEnabled = (tier: any, flagKey: string): boolean => {
    const [category, key] = flagKey.split('.');
    if (!tier?.flags) return false;
    const categoryFlags = tier.flags[category as keyof typeof tier.flags];
    return categoryFlags?.[key as keyof typeof categoryFlags] === true;
  };

  // Count enabled modules and features for a club
  const countEnabledFlags = (flags: any, category: 'modules' | 'features') => {
    if (!flags || !flags[category]) return 0;
    return Object.values(flags[category]).filter(Boolean).length;
  };

  // Tier comparison table data
  const tierComparisonRows = React.useMemo(() => {
    const rows: { category: string; flag: string; label: string; tiers: Record<string, boolean> }[] = [];

    ['module', 'feature', 'operational'].forEach((category) => {
      const flags = flagsByCategory[category as keyof typeof flagsByCategory];
      Object.entries(flags).forEach(([key, metadata]) => {
        const row: any = {
          category,
          flag: key,
          label: metadata.label,
          tiers: {},
        };

        tiers.forEach((tier) => {
          row.tiers[tier.tier] = isFlagEnabled(tier, key);
        });

        rows.push(row);
      });
    });

    return rows;
  }, [tiers, flagsByCategory]);

  // Clubs table columns
  const clubColumns: ColumnDef<(typeof clubs)[0]>[] = [
    {
      id: 'club',
      header: 'Club',
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.clubName}</p>
          <p className="text-xs text-slate-500">{row.clubId}</p>
        </div>
      ),
    },
    {
      id: 'tier',
      header: 'Tier',
      cell: (row) => <TierBadge tier={row.subscriptionTier.toLowerCase() as any} />,
    },
    {
      id: 'modules',
      header: 'Modules',
      align: 'center',
      cell: (row) => (
        <span className="text-sm text-slate-600">
          {countEnabledFlags(row.flags, 'modules')}/6
        </span>
      ),
    },
    {
      id: 'features',
      header: 'Features',
      align: 'center',
      cell: (row) => (
        <span className="text-sm text-slate-600">
          {countEnabledFlags(row.flags, 'features')}/8
        </span>
      ),
    },
    {
      id: 'operational',
      header: 'Operational',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.hasOperationalOverrides && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
              <AlertTriangle className="h-3 w-3" />
              Overrides
            </span>
          )}
          {row.flags?.operational?.maintenanceMode && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
              <AlertTriangle className="h-3 w-3" />
              Maintenance
            </span>
          )}
        </div>
      ),
    },
  ];

  if (clubsLoading || tierLoading) {
    return (
      <div>
        <PageHeader
          title="Feature Flags"
          description="Manage tier-based feature access and operational toggles"
        />
        <div className="text-center py-12 text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Feature Flags"
        description="Manage tier-based feature access and operational toggles"
      />

      {/* KPI Cards */}
      <KPIGrid className="mb-8">
        <KPICard label="Total Clubs" value={totalClubs} />
        <KPICard label="Starter Tier" value={clubsByTier.STARTER || 0} />
        <KPICard label="Professional Tier" value={clubsByTier.PROFESSIONAL || 0} />
        <KPICard label="Enterprise Tier" value={clubsByTier.ENTERPRISE || 0} />
        <KPICard label="With Overrides" value={clubsWithOverrides} />
      </KPIGrid>

      {/* Tier Comparison Matrix */}
      <Section title="Tier Comparison" className="mb-8">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Feature
                    </th>
                    {tiers.map((tier) => (
                      <th key={tier.tier} className="px-6 py-3 text-center">
                        <TierBadge tier={tier.tier.toLowerCase() as any} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* Modules Section */}
                  <tr className="bg-slate-100">
                    <td colSpan={tiers.length + 1} className="px-6 py-2">
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Modules
                      </span>
                    </td>
                  </tr>
                  {tierComparisonRows
                    .filter((row) => row.category === 'module')
                    .map((row) => (
                      <tr key={row.flag} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{row.label}</td>
                        {tiers.map((tier) => (
                          <td key={tier.tier} className="px-6 py-4 text-center">
                            {row.tiers[tier.tier] ? (
                              <Check className="h-5 w-5 text-emerald-600 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-stone-300 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}

                  {/* Features Section */}
                  <tr className="bg-slate-100">
                    <td colSpan={tiers.length + 1} className="px-6 py-2">
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Features
                      </span>
                    </td>
                  </tr>
                  {tierComparisonRows
                    .filter((row) => row.category === 'feature')
                    .map((row) => (
                      <tr key={row.flag} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{row.label}</td>
                        {tiers.map((tier) => (
                          <td key={tier.tier} className="px-6 py-4 text-center">
                            {row.tiers[tier.tier] ? (
                              <Check className="h-5 w-5 text-emerald-600 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-stone-300 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}

                  {/* Operational Section */}
                  <tr className="bg-slate-100">
                    <td colSpan={tiers.length + 1} className="px-6 py-2">
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Operational
                      </span>
                    </td>
                  </tr>
                  {tierComparisonRows
                    .filter((row) => row.category === 'operational')
                    .map((row) => (
                      <tr key={row.flag} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{row.label}</td>
                        {tiers.map((tier) => (
                          <td key={tier.tier} className="px-6 py-4 text-center">
                            {row.tiers[tier.tier] ? (
                              <Check className="h-5 w-5 text-emerald-600 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-stone-300 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Clubs Table */}
      <Section title="Clubs">
        <DataTable
          data={clubs}
          columns={clubColumns}
          sortable
          onRowClick={(club) => {
            window.location.href = `/tenants/${club.clubId}?tab=configuration`;
          }}
        />
      </Section>
    </div>
  );
}

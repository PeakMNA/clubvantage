'use client';

import * as React from 'react';
import { Lock, Check, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useClubFeatureFlags } from '@/hooks/use-feature-flags';
import { getFeatureFlagLabel } from '@/lib/feature-flag-labels';
import { cn } from '@/lib/utils';

interface FeaturesPanelProps {
  clubId: string;
  clubName: string;
  tier: string;
}

export function FeaturesPanel({ clubId, clubName, tier }: FeaturesPanelProps) {
  const { data, isLoading } = useClubFeatureFlags(clubId);

  const flags = data?.clubFeatureFlags;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-slate-500">Loading feature flags...</div>
        </CardContent>
      </Card>
    );
  }

  if (!flags) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-slate-500">No feature flags found</div>
        </CardContent>
      </Card>
    );
  }

  const renderFlagCard = (
    key: string,
    enabled: boolean,
    category: 'modules' | 'features',
    isLocked: boolean = true,
  ) => {
    const metadata = getFeatureFlagLabel(`${category}.${key}`);
    if (!metadata) return null;

    return (
      <Card key={key} className={cn('relative', !enabled && 'opacity-60')}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                enabled ? 'bg-emerald-100' : 'bg-stone-100',
              )}
            >
              {enabled ? (
                <Check className={cn('h-5 w-5', enabled ? 'text-emerald-600' : 'text-stone-400')} />
              ) : (
                <X className="h-5 w-5 text-stone-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium text-slate-900">{metadata.label}</h4>
                {isLocked && <Lock className="h-3 w-3 text-slate-400" />}
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{metadata.description}</p>
              {!enabled && (
                <p className="text-xs text-amber-600 mt-1">
                  Upgrade to {category === 'modules' ? 'Professional' : 'Enterprise'} tier
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOperationalFlag = (key: string, enabled: boolean) => {
    const metadata = getFeatureFlagLabel(`operational.${key}`);
    if (!metadata) return null;

    const isMaintenanceMode = key === 'maintenanceMode';

    return (
      <div
        key={key}
        className={cn(
          'flex items-center justify-between p-4 rounded-lg border',
          isMaintenanceMode && enabled ? 'border-red-200 bg-red-50' : 'border-slate-200',
        )}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-slate-900">{metadata.label}</h4>
            {isMaintenanceMode && enabled && (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
          </div>
          <p className="text-xs text-slate-500">{metadata.description}</p>
        </div>
        <div className={cn(
          'flex h-6 w-11 items-center rounded-full px-0.5 transition-colors',
          enabled ? 'bg-emerald-600' : 'bg-stone-200'
        )}>
          <div className={cn(
            'h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
            enabled ? 'translate-x-5' : 'translate-x-0'
          )} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Modules Section */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
          Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flags.modules &&
            Object.entries(flags.modules).map(([key, enabled]) =>
              renderFlagCard(key, enabled as boolean, 'modules'),
            )}
        </div>
      </div>

      {/* Features Section */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
          Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flags.features &&
            Object.entries(flags.features).map(([key, enabled]) =>
              renderFlagCard(key, enabled as boolean, 'features'),
            )}
        </div>
      </div>

      {/* Operational Section */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
          Operational Controls (Read-Only)
        </h3>
        <Card>
          <CardContent className="pt-6 space-y-4">
            {flags.operational &&
              Object.entries(flags.operational).map(([key, enabled]) =>
                renderOperationalFlag(key, enabled as boolean),
              )}
          </CardContent>
        </Card>
        <p className="text-xs text-slate-500 mt-2">
          Note: Operational toggles are read-only in this view. Use the API or platform tools to modify.
        </p>
      </div>
    </div>
  );
}

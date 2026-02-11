'use client';

import { cn } from '@clubvantage/ui';
import { Lock } from 'lucide-react';

interface UpgradePromptProps {
  featureName: string;
  requiredTier?: string;
  className?: string;
}

export function UpgradePrompt({
  featureName,
  requiredTier = 'Professional',
  className,
}: UpgradePromptProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4',
        className,
      )}
    >
      <Lock className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
      <div className="min-w-0">
        <h3 className="font-semibold text-stone-900">
          {featureName} requires an upgrade
        </h3>
        <p className="text-sm text-stone-600">
          This feature is available on the {requiredTier} plan and above.
          Contact your administrator to upgrade.
        </p>
      </div>
    </div>
  );
}

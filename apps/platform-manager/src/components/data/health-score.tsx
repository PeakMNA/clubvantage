'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface HealthScoreProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
  breakdown?: {
    engagement: number;
    adoption: number;
    payment: number;
    support: number;
  };
  className?: string;
}

// Size configurations
const sizes = {
  sm: { diameter: 32, stroke: 3, fontSize: 'text-[10px]' },
  md: { diameter: 48, stroke: 4, fontSize: 'text-xs' },
  lg: { diameter: 80, stroke: 6, fontSize: 'text-base' },
};

// Color thresholds
function getHealthColor(score: number): string {
  if (score >= 80) return '#10B981'; // Emerald - Healthy
  if (score >= 60) return '#F59E0B'; // Amber - Warning
  return '#EF4444'; // Red - Critical
}

function getHealthLabel(score: number): string {
  if (score >= 80) return 'Healthy';
  if (score >= 60) return 'Warning';
  return 'Critical';
}

export function HealthScore({
  score,
  size = 'md',
  showBreakdown = false,
  breakdown,
  className,
}: HealthScoreProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const { diameter, stroke, fontSize } = sizes[size];

  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getHealthColor(score);

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      onMouseEnter={() => showBreakdown && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg
        width={diameter}
        height={diameter}
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={stroke}
        />
        {/* Progress ring */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Center text */}
      <span
        className={cn(
          'absolute font-semibold',
          fontSize
        )}
        style={{ color }}
      >
        {score}
      </span>

      {/* Tooltip with breakdown */}
      {showTooltip && breakdown && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 w-56 p-3 bg-white rounded-lg shadow-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-900">Health Score</span>
            <span
              className="text-sm font-bold"
              style={{ color }}
            >
              {score}%
            </span>
          </div>
          <div className="space-y-2">
            <BreakdownRow label="Engagement" value={breakdown.engagement} />
            <BreakdownRow label="Adoption" value={breakdown.adoption} />
            <BreakdownRow label="Payment" value={breakdown.payment} />
            <BreakdownRow label="Support" value={breakdown.support} />
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100">
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: color + '20',
                color,
              }}
            >
              {getHealthLabel(score)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Breakdown row with mini progress bar
function BreakdownRow({ label, value }: { label: string; value: number }) {
  const color = getHealthColor(value);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-600 w-20">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${value}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="text-xs font-medium text-slate-700 w-8 text-right">
        {value}%
      </span>
    </div>
  );
}

// Health Score Badge (inline version for tables)
export function HealthScoreBadge({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const color = getHealthColor(score);
  const label = getHealthLabel(score);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        className
      )}
      style={{
        backgroundColor: color + '15',
        color,
      }}
    >
      <span className="relative flex h-2 w-2">
        <span
          className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
          style={{ backgroundColor: color }}
        />
        <span
          className="relative inline-flex h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </span>
      <span>{score}</span>
    </div>
  );
}

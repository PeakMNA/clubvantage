'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  tooltip?: string;
  sparklineData?: number[];
  format?: 'number' | 'currency' | 'percentage';
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function KPICard({
  label,
  value,
  trend,
  tooltip,
  sparklineData,
  format = 'number',
  loading = false,
  onClick,
  className,
}: KPICardProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  // Format the value based on format prop
  const formattedValue = React.useMemo(() => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: value >= 1000000 ? 'compact' : 'standard',
          maximumFractionDigits: value >= 1000000 ? 1 : 0,
        }).format(value);
      case 'percentage':
        return `${value}%`;
      default:
        return new Intl.NumberFormat('en-US', {
          notation: value >= 10000 ? 'compact' : 'standard',
          maximumFractionDigits: 1,
        }).format(value);
    }
  }, [value, format]);

  // Format trend value
  const formattedTrend = React.useMemo(() => {
    if (!trend) return null;
    const prefix = trend.direction === 'up' ? '+' : trend.direction === 'down' ? '' : '';
    return `${prefix}${trend.value}%`;
  }, [trend]);

  if (loading) {
    return (
      <div className={cn('bg-white rounded-xl shadow-md p-6 min-w-[200px]', className)}>
        <div className="animate-pulse">
          <div className="h-3 w-16 bg-slate-200 rounded mb-3" />
          <div className="h-8 w-24 bg-slate-200 rounded mb-2" />
          <div className="h-3 w-12 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-md p-6 min-w-[200px] transition-shadow',
        onClick && 'cursor-pointer hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      {/* Label with tooltip */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {tooltip && (
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="p-1 rounded hover:bg-slate-100 transition-colors"
            >
              <Info className="h-3.5 w-3.5 text-slate-400" />
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-full mt-1 z-10 w-48 p-2 text-xs text-slate-700 bg-white rounded-lg shadow-lg border border-slate-200">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Value and Trend */}
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            'font-bold text-slate-900',
            String(formattedValue).length > 8 ? 'text-xl' : 'text-2xl'
          )}
        >
          {formattedValue}
        </span>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-sm font-medium',
              trend.direction === 'up' && 'text-emerald-600',
              trend.direction === 'down' && 'text-red-600',
              trend.direction === 'neutral' && 'text-slate-500'
            )}
          >
            {trend.direction === 'up' && <TrendingUp className="h-4 w-4" />}
            {trend.direction === 'down' && <TrendingDown className="h-4 w-4" />}
            {trend.direction === 'neutral' && <Minus className="h-4 w-4" />}
            <span>{formattedTrend}</span>
          </div>
        )}
      </div>

      {/* Optional Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-3">
          <Sparkline data={sparklineData} />
        </div>
      )}
    </div>
  );
}

// Simple SVG Sparkline
function Sparkline({ data }: { data: number[] }) {
  const width = 150;
  const height = 32;
  const padding = 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={pathD}
        fill="none"
        stroke="rgb(59, 130, 246)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// KPI Card Grid for consistent layouts
interface KPIGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function KPIGrid({ children, columns = 4, className }: KPIGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 2 && 'md:grid-cols-2',
        columns === 3 && 'md:grid-cols-3',
        columns === 4 && 'md:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {children}
    </div>
  );
}

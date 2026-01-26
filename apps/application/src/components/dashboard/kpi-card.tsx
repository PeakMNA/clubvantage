'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { cn, Card, CardContent } from '@clubvantage/ui';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
  subtitle?: string;
  icon: LucideIcon;
  href?: string;
}

export function KPICard({
  title,
  value,
  change,
  subtitle,
  icon: Icon,
  href,
}: KPICardProps) {
  const content = (
    <Card className={cn('transition-shadow', href && 'hover:shadow-md cursor-pointer')}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </p>
            <p className="text-3xl font-bold">{value}</p>
            {change && (
              <div className="flex items-center gap-1 text-sm">
                {change.direction === 'up' ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">+{change.value}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-red-600 dark:text-red-400">-{change.value}%</span>
                  </>
                )}
                <span className="text-muted-foreground">{change.period}</span>
              </div>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="rounded-full bg-muted p-3">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

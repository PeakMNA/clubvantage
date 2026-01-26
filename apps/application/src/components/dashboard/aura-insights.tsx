'use client';

import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Users,
  ArrowRight,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@clubvantage/ui';

interface Insight {
  id: string;
  type: 'suggestion' | 'warning' | 'info';
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  priority: 'high' | 'medium' | 'low';
}

// Mock data
const insights: Insight[] = [
  {
    id: '1',
    type: 'warning',
    title: '3 Members at Risk of Churn',
    description: 'Based on declining visit frequency and outstanding balances',
    action: { label: 'View Members', href: '/members?filter=at-risk' },
    priority: 'high',
  },
  {
    id: '2',
    type: 'suggestion',
    title: 'Peak Booking Hours Identified',
    description: 'Tennis courts are 90% utilized 5-7 PM. Consider adding capacity.',
    action: { label: 'View Report', href: '/reports/utilization' },
    priority: 'medium',
  },
  {
    id: '3',
    type: 'info',
    title: 'Membership Renewal Wave',
    description: '47 members have renewals due in the next 30 days',
    action: { label: 'Send Reminders', href: '/members?filter=renewal-due' },
    priority: 'medium',
  },
];

const typeStyles = {
  suggestion: {
    icon: TrendingUp,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-500/20',
  },
  info: {
    icon: Users,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-500/20',
  },
};

export function AuraInsights() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Aura Insights</CardTitle>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          AI Powered
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {insights.map((insight) => {
            const style = typeStyles[insight.type];
            const Icon = style.icon;

            return (
              <div
                key={insight.id}
                className="group relative p-4 rounded-lg border hover:border-primary/50 transition-colors"
              >
                <button
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                  aria-label="Dismiss insight"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>

                <div className="flex items-start gap-3">
                  <div className={`rounded-full p-2 ${style.bg}`}>
                    <Icon className={`h-4 w-4 ${style.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="font-medium">{insight.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 -ml-2 text-primary hover:text-primary"
                        asChild
                      >
                        <a href={insight.action.href}>
                          {insight.action.label}
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

import { PageHeader, Section } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Platform overview and key metrics"
      />

      {/* KPI Cards */}
      <Section className="mb-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Tenants"
            value="47"
            change="+3"
            changeType="positive"
          />
          <KpiCard
            title="Monthly Revenue"
            value="฿1.2M"
            change="+12%"
            changeType="positive"
          />
          <KpiCard
            title="Active Members"
            value="12,847"
            change="+5%"
            changeType="positive"
          />
          <KpiCard
            title="Platform Health"
            value="98.5%"
            change="-0.2%"
            changeType="neutral"
          />
        </div>
      </Section>

      {/* Tenant Health Distribution */}
      <Section title="Tenant Health Distribution" className="mb-8">
        <Card variant="outlined">
          <CardContent className="pt-6">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Healthy</p>
                  <p className="text-2xl font-bold text-emerald-600">38</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-amber-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Warning</p>
                  <p className="text-2xl font-bold text-amber-600">7</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-red-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Critical</p>
                  <p className="text-2xl font-bold text-red-600">2</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Section title="Quick Actions">
          <Card variant="outlined">
            <CardContent className="pt-6 space-y-3">
              <QuickAction
                label="View At-Risk Tenants"
                count={2}
                badge="Critical"
                badgeVariant="destructive"
              />
              <QuickAction
                label="Review Waitlist"
                count={12}
                badge="Pending"
                badgeVariant="pending"
              />
              <QuickAction
                label="Moderate Suggestions"
                count={5}
                badge="New"
                badgeVariant="info"
              />
            </CardContent>
          </Card>
        </Section>

        {/* Recent Activity */}
        <Section title="Recent Activity">
          <Card variant="outlined">
            <CardContent className="pt-6 space-y-4">
              <ActivityItem
                title="New tenant signed up"
                subtitle="Horizon Country Club"
                time="2 hours ago"
              />
              <ActivityItem
                title="Subscription upgraded"
                subtitle="Royal Palm Golf → Professional"
                time="4 hours ago"
              />
              <ActivityItem
                title="Payment received"
                subtitle="฿45,000 from Lakeside Resort"
                time="6 hours ago"
              />
              <ActivityItem
                title="Tenant suspended"
                subtitle="Sunset Beach Club - Payment overdue"
                time="1 day ago"
              />
            </CardContent>
          </Card>
        </Section>
      </div>
    </div>
  );
}

// KPI Card Component
function KpiCard({
  title,
  value,
  change,
  changeType,
}: {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
          <span
            className={
              changeType === 'positive'
                ? 'text-sm font-medium text-emerald-600'
                : changeType === 'negative'
                ? 'text-sm font-medium text-red-600'
                : 'text-sm font-medium text-slate-500'
            }
          >
            {change}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Action Component
function QuickAction({
  label,
  count,
  badge,
  badgeVariant,
}: {
  label: string;
  count: number;
  badge: string;
  badgeVariant: 'destructive' | 'pending' | 'info';
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-900">{label}</span>
        <Badge variant={badgeVariant}>{badge}</Badge>
      </div>
      <span className="text-sm font-bold text-slate-600">{count}</span>
    </div>
  );
}

// Activity Item Component
function ActivityItem({
  title,
  subtitle,
  time,
}: {
  title: string;
  subtitle: string;
  time: string;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <span className="text-xs text-slate-400">{time}</span>
    </div>
  );
}

'use client';

import {
  Users,
  Calendar,
  Receipt,
  TrendingUp,
  UserPlus,
  CalendarPlus,
  CreditCard,
  FileText,
} from 'lucide-react';

import { PageHeader } from '@clubvantage/ui';
import { KPICard } from '@/components/dashboard/kpi-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { TodayActivity } from '@/components/dashboard/today-activity';
import { AuraInsights } from '@/components/dashboard/aura-insights';
// Direct import to avoid pulling entire api-client bundle
import {
  useGetMemberStatsQuery,
  useGetBookingStatsQuery,
  useGetBillingStatsQuery,
} from '@clubvantage/api-client/hooks';

// Format number with Thai currency symbol
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `฿${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `฿${(amount / 1000).toFixed(0)}K`;
  }
  return `฿${amount.toFixed(0)}`;
}

const quickActions = [
  {
    id: 'new-member',
    label: 'New Member',
    icon: UserPlus,
    href: '/members/new',
  },
  {
    id: 'new-booking',
    label: 'New Booking',
    icon: CalendarPlus,
    href: '/facility/new',
  },
  {
    id: 'record-payment',
    label: 'Record Payment',
    icon: CreditCard,
    onClick: () => console.log('Open payment sheet'),
  },
  {
    id: 'generate-invoices',
    label: 'Generate Invoices',
    icon: FileText,
    href: '/billing/generate',
  },
];

export default function DashboardPage() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch real data from API
  const { data: memberStats, isLoading: memberStatsLoading } = useGetMemberStatsQuery();
  const { data: bookingStats, isLoading: bookingStatsLoading } = useGetBookingStatsQuery();
  const { data: billingStats, isLoading: billingStatsLoading } = useGetBillingStatsQuery();

  const isLoading = memberStatsLoading || bookingStatsLoading || billingStatsLoading;

  // Build KPI data from real API responses
  const kpiData = [
    {
      id: 'active-members',
      title: 'Active Members',
      value: isLoading ? '...' : memberStats?.memberStats?.active?.toLocaleString() || '0',
      subtitle: memberStats?.memberStats
        ? `${memberStats.memberStats.suspended} suspended`
        : undefined,
      icon: Users,
      href: '/members',
    },
    {
      id: 'today-bookings',
      title: "Today's Bookings",
      value: isLoading ? '...' : bookingStats?.bookingStats?.todayBookings?.toString() || '0',
      subtitle: bookingStats?.bookingStats
        ? `${bookingStats.bookingStats.confirmedBookings} confirmed, ${bookingStats.bookingStats.checkedInBookings} checked in`
        : undefined,
      icon: Calendar,
      href: '/facility',
    },
    {
      id: 'monthly-revenue',
      title: 'Monthly Revenue',
      value: isLoading
        ? '...'
        : formatCurrency(parseFloat(billingStats?.billingStats?.totalRevenue || '0')),
      subtitle: billingStats?.billingStats
        ? `${billingStats.billingStats.paidCount} paid invoices`
        : undefined,
      icon: TrendingUp,
      href: '/reports?tab=financial',
    },
    {
      id: 'outstanding',
      title: 'Outstanding Balance',
      value: isLoading
        ? '...'
        : formatCurrency(parseFloat(billingStats?.billingStats?.outstandingBalance || '0')),
      subtitle: billingStats?.billingStats
        ? `${formatCurrency(parseFloat(billingStats.billingStats.overdueAmount || '0'))} overdue`
        : undefined,
      icon: Receipt,
      href: '/reports?tab=receivables',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Dashboard"
        description={today}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <KPICard
            key={kpi.id}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            icon={kpi.icon}
            href={kpi.href}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Activity */}
        <TodayActivity />

        {/* Aura Insights */}
        <AuraInsights />
      </div>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />
    </div>
  );
}

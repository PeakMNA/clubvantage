'use client';

import * as React from 'react';
import { CreditCard, Download, AlertCircle, Check } from 'lucide-react';
import { PageHeader, Section } from '@/components/layout';
import { cn } from '@/lib/utils';

// Mock billing data
const mockPlan = {
  name: 'Professional',
  price: 25000,
  currency: '฿',
  billingCycle: 'Annual',
  nextPayment: '2026-01-15',
  annualAmount: 300000,
  paymentMethod: {
    type: 'card',
    last4: '4242',
    brand: 'Visa',
  },
  usage: {
    members: { used: 1247, limit: 2000 },
    staff: { used: 14, limit: 20 },
    storage: { used: 4.2, limit: 10 },
    apiCalls: { used: 8420, limit: 50000 },
  },
};

const mockInvoices = [
  { id: 'INV-2025-0012', date: '2025-01-01', amount: 300000, status: 'paid' },
  { id: 'INV-2024-0011', date: '2024-01-01', amount: 275000, status: 'paid' },
  { id: 'INV-2023-0010', date: '2023-01-01', amount: 250000, status: 'paid' },
];

const plans = [
  {
    name: 'Starter',
    price: 9900,
    features: ['Up to 500 members', '5 staff users', '2 GB storage'],
  },
  {
    name: 'Professional',
    price: 25000,
    current: true,
    features: ['Up to 2,000 members', '20 staff users', '10 GB storage', 'API access'],
  },
  {
    name: 'Enterprise',
    price: 75000,
    features: ['Unlimited members', 'Unlimited staff', '100 GB storage', 'Priority support', 'Custom integrations'],
  },
];

export default function BillingPage() {
  const [showPlanModal, setShowPlanModal] = React.useState(false);

  return (
    <div>
      <PageHeader
        title="Billing & Subscription"
        description="Manage your plan, usage, and payment details"
      />

      {/* Current Plan */}
      <Section className="mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 uppercase">
                  {mockPlan.name}
                </span>
                <span className="text-slate-500">
                  {mockPlan.currency}{mockPlan.price.toLocaleString()}/month (billed {mockPlan.billingCycle.toLowerCase()})
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span>Billing Cycle: {mockPlan.billingCycle}</span>
                <span>•</span>
                <span>Next Payment: {mockPlan.nextPayment}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-1">
                <span>Amount: {mockPlan.currency}{mockPlan.annualAmount.toLocaleString()}/year</span>
                <span>•</span>
                <span>Payment Method: •••• {mockPlan.paymentMethod.last4}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPlanModal(true)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                View Plan Details
              </button>
              <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                Request Plan Change
              </button>
              <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Update Payment
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Usage This Period */}
      <Section title="Usage This Period" className="mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="space-y-6">
            <UsageRow
              label="Members"
              used={mockPlan.usage.members.used}
              limit={mockPlan.usage.members.limit}
            />
            <UsageRow
              label="Staff Users"
              used={mockPlan.usage.staff.used}
              limit={mockPlan.usage.staff.limit}
            />
            <UsageRow
              label="Storage"
              used={mockPlan.usage.storage.used}
              limit={mockPlan.usage.storage.limit}
              unit="GB"
            />
            <UsageRow
              label="API Calls"
              used={mockPlan.usage.apiCalls.used}
              limit={mockPlan.usage.apiCalls.limit}
            />
          </div>
        </div>
      </Section>

      {/* Invoice History */}
      <Section title="Invoice History">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Status
                </th>
                <th className="px-6 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {invoice.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {mockPlan.currency}{invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                        invoice.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : invoice.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      )}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <Download className="h-4 w-4 text-slate-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Plan Details Modal */}
      {showPlanModal && (
        <PlanModal onClose={() => setShowPlanModal(false)} />
      )}
    </div>
  );
}

// Usage Row Component
function UsageRow({
  label,
  used,
  limit,
  unit = '',
}: {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}) {
  const percentage = Math.round((used / limit) * 100);
  const isWarning = percentage >= 80 && percentage < 100;
  const isCritical = percentage >= 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm text-slate-500">
          {used.toLocaleString()}{unit} / {limit.toLocaleString()}{unit}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span
          className={cn(
            'text-xs font-medium w-10 text-right',
            isCritical
              ? 'text-red-600'
              : isWarning
              ? 'text-amber-600'
              : 'text-slate-500'
          )}
        >
          {percentage}%
        </span>
      </div>
      {isCritical && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          You've reached your {label.toLowerCase()} limit
        </p>
      )}
    </div>
  );
}

// Plan Modal Component
function PlanModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl">
        <div className="bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Compare Plans</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              ×
            </button>
          </div>

          {/* Plans Grid */}
          <div className="p-6 grid md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'p-6 rounded-xl border-2',
                  plan.current
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200'
                )}
              >
                {plan.current && (
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded mb-2">
                    Current Plan
                  </span>
                )}
                <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  ฿{plan.price.toLocaleString()}
                  <span className="text-sm font-normal text-slate-500">/month</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {!plan.current && (
                  <button className="w-full mt-4 px-4 py-2 text-sm font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                    Request Change
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

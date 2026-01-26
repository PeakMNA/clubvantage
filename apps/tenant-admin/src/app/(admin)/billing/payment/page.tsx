'use client';

import * as React from 'react';
import { CreditCard, Plus, Trash2, Shield, AlertCircle } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  isDefault: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2027,
    isDefault: true,
  },
  {
    id: '2',
    type: 'card',
    last4: '8888',
    brand: 'Mastercard',
    expiryMonth: 6,
    expiryYear: 2026,
    isDefault: false,
  },
];

const brandLogos: Record<string, string> = {
  Visa: '💳',
  Mastercard: '💳',
  Amex: '💳',
};

export default function PaymentMethodsPage() {
  const [methods, setMethods] = React.useState(paymentMethods);

  const handleSetDefault = (id: string) => {
    setMethods(methods.map(m => ({ ...m, isDefault: m.id === id })));
  };

  const handleRemove = (id: string) => {
    if (methods.find(m => m.id === id)?.isDefault) {
      alert('Cannot remove the default payment method. Set another card as default first.');
      return;
    }
    setMethods(methods.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment Methods</h1>
        <p className="text-slate-500 mt-1">Manage your payment methods for subscription billing</p>
      </div>

      {/* Payment Methods List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Your Cards</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Add Card
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {methods.map((method) => (
            <div key={method.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-16 rounded-lg bg-slate-100 flex items-center justify-center text-2xl">
                  {brandLogos[method.brand || ''] || '💳'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">
                      {method.brand} •••• {method.last4}
                    </p>
                    {method.isDefault && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  {method.type === 'card' && (
                    <p className="text-sm text-slate-500">
                      Expires {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleRemove(method.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {methods.length === 0 && (
            <div className="px-6 py-12 text-center">
              <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No payment methods</h3>
              <p className="text-slate-500 mb-4">Add a payment method to continue your subscription</p>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4" />
                Add Card
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Security Note */}
      <div className="bg-slate-50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-slate-900">Secure Payment Processing</p>
            <p className="text-sm text-slate-600 mt-1">
              Your payment information is securely processed by Stripe. We never store your full card details on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* Billing Contact */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Billing Contact</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              defaultValue="billing@greenvalleycc.com"
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">Invoices will be sent to this email</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Billing Name</label>
            <input
              type="text"
              defaultValue="Green Valley Country Club Co., Ltd."
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
          Update Billing Contact
        </button>
      </div>
    </div>
  );
}

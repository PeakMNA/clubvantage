'use client';

import * as React from 'react';
import { Receipt, Save, Plus, Trash2 } from 'lucide-react';

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  description: string;
  isDefault: boolean;
}

export default function TaxSettingsPage() {
  const [taxRates, setTaxRates] = React.useState<TaxRate[]>([
    { id: '1', name: 'VAT', rate: 7, description: 'Standard Value Added Tax', isDefault: true },
    { id: '2', name: 'Service Charge', rate: 10, description: 'Service charge for F&B', isDefault: false },
  ]);

  const [settings, setSettings] = React.useState({
    taxIdLabel: 'Tax ID',
    showTaxBreakdown: true,
    includeTaxInPrices: false,
    roundTaxToDecimal: 2,
  });

  const [hasChanges, setHasChanges] = React.useState(false);

  const handleAddTaxRate = () => {
    const newRate: TaxRate = {
      id: String(Date.now()),
      name: '',
      rate: 0,
      description: '',
      isDefault: false,
    };
    setTaxRates([...taxRates, newRate]);
    setHasChanges(true);
  };

  const handleRemoveTaxRate = (id: string) => {
    setTaxRates(taxRates.filter(r => r.id !== id));
    setHasChanges(true);
  };

  const handleTaxRateChange = (id: string, field: keyof TaxRate, value: string | number | boolean) => {
    setTaxRates(taxRates.map(r => r.id === id ? { ...r, [field]: value } : r));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving tax settings:', { taxRates, settings });
    setHasChanges(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tax Settings</h1>
          <p className="text-slate-500 mt-1">Configure tax rates and billing preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            hasChanges
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      {/* Tax Rates */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Receipt className="h-5 w-5 text-slate-400" />
            Tax Rates
          </h2>
          <button
            onClick={handleAddTaxRate}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Tax Rate
          </button>
        </div>

        <div className="space-y-4">
          {taxRates.map((rate) => (
            <div key={rate.id} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex-1 grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Tax Name</label>
                  <input
                    type="text"
                    value={rate.name}
                    onChange={(e) => handleTaxRateChange(rate.id, 'name', e.target.value)}
                    placeholder="e.g., VAT"
                    className="w-full h-9 px-3 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Rate (%)</label>
                  <input
                    type="number"
                    value={rate.rate}
                    onChange={(e) => handleTaxRateChange(rate.id, 'rate', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full h-9 px-3 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                  <input
                    type="text"
                    value={rate.description}
                    onChange={(e) => handleTaxRateChange(rate.id, 'description', e.target.value)}
                    placeholder="Tax description"
                    className="w-full h-9 px-3 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-5">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={rate.isDefault}
                    onChange={(e) => handleTaxRateChange(rate.id, 'isDefault', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Default
                </label>
                <button
                  onClick={() => handleRemoveTaxRate(rate.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {taxRates.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No tax rates configured. Click "Add Tax Rate" to create one.
            </div>
          )}
        </div>
      </div>

      {/* Invoice Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Invoice Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tax ID Label</label>
            <input
              type="text"
              value={settings.taxIdLabel}
              onChange={(e) => {
                setSettings({ ...settings, taxIdLabel: e.target.value });
                setHasChanges(true);
              }}
              placeholder="e.g., Tax ID, VAT Number, GST Number"
              className="w-full max-w-md h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">How the tax ID field is labeled on invoices</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showTaxBreakdown"
              checked={settings.showTaxBreakdown}
              onChange={(e) => {
                setSettings({ ...settings, showTaxBreakdown: e.target.checked });
                setHasChanges(true);
              }}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="showTaxBreakdown" className="text-sm text-slate-700">
              Show tax breakdown on invoices
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="includeTaxInPrices"
              checked={settings.includeTaxInPrices}
              onChange={(e) => {
                setSettings({ ...settings, includeTaxInPrices: e.target.checked });
                setHasChanges(true);
              }}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="includeTaxInPrices" className="text-sm text-slate-700">
              Prices include tax (tax-inclusive pricing)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Round Tax To</label>
            <select
              value={settings.roundTaxToDecimal}
              onChange={(e) => {
                setSettings({ ...settings, roundTaxToDecimal: parseInt(e.target.value) });
                setHasChanges(true);
              }}
              className="w-full max-w-xs h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value={0}>Whole number</option>
              <option value={1}>1 decimal place</option>
              <option value={2}>2 decimal places</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

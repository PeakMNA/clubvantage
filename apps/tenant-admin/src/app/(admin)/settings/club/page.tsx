'use client';

import * as React from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Clock, Save } from 'lucide-react';

export default function ClubInfoPage() {
  const [formData, setFormData] = React.useState({
    name: 'Green Valley Country Club',
    legalName: 'Green Valley Country Club Co., Ltd.',
    taxId: '0105562012345',
    address: '123 Golf Road, Sukhumvit',
    city: 'Bangkok',
    country: 'Thailand',
    postalCode: '10110',
    phone: '+66 2 123 4567',
    email: 'info@greenvalleycc.com',
    website: 'https://greenvalleycc.com',
    timezone: 'Asia/Bangkok',
    currency: 'THB',
  });

  const [hasChanges, setHasChanges] = React.useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving club info:', formData);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Club Information</h1>
          <p className="text-slate-500 mt-1">Manage your club's basic details and contact information</p>
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

      {/* Basic Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
          <Building2 className="h-5 w-5 text-slate-400" />
          Basic Information
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Club Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Legal Name</label>
            <input
              type="text"
              value={formData.legalName}
              onChange={(e) => handleChange('legalName', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tax ID / Registration Number</label>
            <input
              type="text"
              value={formData.taxId}
              onChange={(e) => handleChange('taxId', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
          <MapPin className="h-5 w-5 text-slate-400" />
          Address
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
            <select
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Thailand">Thailand</option>
              <option value="Singapore">Singapore</option>
              <option value="Malaysia">Malaysia</option>
              <option value="Indonesia">Indonesia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
          <Phone className="h-5 w-5 text-slate-400" />
          Contact Information
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
          <Clock className="h-5 w-5 text-slate-400" />
          Regional Settings
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
            <select
              value={formData.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
              <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
              <option value="Asia/Kuala_Lumpur">Asia/Kuala Lumpur (GMT+8)</option>
              <option value="Asia/Jakarta">Asia/Jakarta (GMT+7)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="THB">Thai Baht (THB)</option>
              <option value="SGD">Singapore Dollar (SGD)</option>
              <option value="MYR">Malaysian Ringgit (MYR)</option>
              <option value="IDR">Indonesian Rupiah (IDR)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

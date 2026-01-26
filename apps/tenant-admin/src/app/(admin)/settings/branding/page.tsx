'use client';

import * as React from 'react';
import { Upload, X, Lock, Check, AlertCircle } from 'lucide-react';
import { PageHeader, Section } from '@/components/layout';
import { cn } from '@/lib/utils';

// Mock current branding data
const initialBranding = {
  lightLogo: null as string | null,
  darkLogo: null as string | null,
  primaryColor: '#1E40AF',
  secondaryColor: '#64748B',
  accentColor: '#10B981',
  subdomain: 'greenvalley',
};

export default function BrandingPage() {
  const [branding, setBranding] = React.useState(initialBranding);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [subdomainStatus, setSubdomainStatus] = React.useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [previewMode, setPreviewMode] = React.useState<'portal' | 'app' | 'email'>('portal');

  const handleColorChange = (key: 'primaryColor' | 'secondaryColor' | 'accentColor', value: string) => {
    setBranding((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSubdomainChange = (value: string) => {
    setBranding((prev) => ({ ...prev, subdomain: value }));
    setHasChanges(true);
    setSubdomainStatus('idle');
  };

  const checkSubdomain = () => {
    setSubdomainStatus('checking');
    // Simulate API call
    setTimeout(() => {
      setSubdomainStatus(branding.subdomain === 'greenvalley' ? 'available' : Math.random() > 0.5 ? 'available' : 'taken');
    }, 1000);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSaving(false);
    setHasChanges(false);
  };

  const handleReset = () => {
    setBranding(initialBranding);
    setHasChanges(false);
  };

  return (
    <div>
      <PageHeader
        title="Branding"
        description="Customize your club's visual identity"
        actions={
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="flex items-center gap-1.5 text-sm text-amber-600">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Unsaved changes
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                hasChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Settings */}
        <div className="space-y-8">
          {/* Logo Upload */}
          <Section title="Logo">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="grid grid-cols-2 gap-6">
                <LogoUpload
                  label="Light Mode"
                  logoUrl={branding.lightLogo}
                  onUpload={(url) => {
                    setBranding((prev) => ({ ...prev, lightLogo: url }));
                    setHasChanges(true);
                  }}
                  onRemove={() => {
                    setBranding((prev) => ({ ...prev, lightLogo: null }));
                    setHasChanges(true);
                  }}
                />
                <LogoUpload
                  label="Dark Mode"
                  logoUrl={branding.darkLogo}
                  onUpload={(url) => {
                    setBranding((prev) => ({ ...prev, darkLogo: url }));
                    setHasChanges(true);
                  }}
                  onRemove={() => {
                    setBranding((prev) => ({ ...prev, darkLogo: null }));
                    setHasChanges(true);
                  }}
                  dark
                />
              </div>
            </div>
          </Section>

          {/* Colors */}
          <Section title="Colors">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
              <ColorPicker
                label="Primary"
                value={branding.primaryColor}
                onChange={(v) => handleColorChange('primaryColor', v)}
              />
              <ColorPicker
                label="Secondary"
                value={branding.secondaryColor}
                onChange={(v) => handleColorChange('secondaryColor', v)}
              />
              <ColorPicker
                label="Accent"
                value={branding.accentColor}
                onChange={(v) => handleColorChange('accentColor', v)}
              />
              <button
                onClick={handleReset}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Reset to Defaults
              </button>
            </div>
          </Section>

          {/* Subdomain */}
          <Section title="Subdomain">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={branding.subdomain}
                  onChange={(e) => handleSubdomainChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-500">.clubvantage.io</span>
                <button
                  onClick={checkSubdomain}
                  disabled={subdomainStatus === 'checking'}
                  className="px-3 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {subdomainStatus === 'checking' ? 'Checking...' : 'Check'}
                </button>
              </div>
              {subdomainStatus === 'available' && (
                <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1">
                  <Check className="h-4 w-4" /> Available
                </p>
              )}
              {subdomainStatus === 'taken' && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <X className="h-4 w-4" /> Already taken
                </p>
              )}
              <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Subdomain changes may take up to 24 hours to propagate.
              </p>
            </div>
          </Section>

          {/* Enterprise Features (Locked) */}
          <Section title="Enterprise Features">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Custom Domain</span>
                </div>
                <button className="text-xs text-blue-600 hover:underline">
                  Upgrade to unlock
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Custom CSS</span>
                </div>
                <button className="text-xs text-blue-600 hover:underline">
                  Upgrade to unlock
                </button>
              </div>
            </div>
          </Section>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-24">
          <Section title="Preview">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Preview Tabs */}
              <div className="flex border-b border-slate-200">
                {(['portal', 'app', 'email'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPreviewMode(mode)}
                    className={cn(
                      'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                      previewMode === mode
                        ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                        : 'text-slate-500 hover:text-slate-700'
                    )}
                  >
                    {mode === 'portal' ? 'Member Portal' : mode === 'app' ? 'App' : 'Email'}
                  </button>
                ))}
              </div>

              {/* Preview Content */}
              <div className="p-6">
                <PreviewMockup
                  primaryColor={branding.primaryColor}
                  secondaryColor={branding.secondaryColor}
                  accentColor={branding.accentColor}
                  logoUrl={branding.lightLogo}
                />
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

// Logo Upload Component
function LogoUpload({
  label,
  logoUrl,
  onUpload,
  onRemove,
  dark = false,
}: {
  label: string;
  logoUrl: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
  dark?: boolean;
}) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Simulate upload - in real app, handle file upload
    onUpload('/placeholder-logo.png');
  };

  return (
    <div>
      <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          'relative h-32 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors',
          dark ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-300',
          'hover:border-blue-400'
        )}
      >
        {logoUrl ? (
          <>
            <img src={logoUrl} alt="Logo" className="max-h-20 max-w-full object-contain" />
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="text-center">
            <Upload className={cn('h-6 w-6 mx-auto mb-2', dark ? 'text-slate-400' : 'text-slate-400')} />
            <p className={cn('text-sm', dark ? 'text-slate-400' : 'text-slate-500')}>
              Drop or click to upload
            </p>
          </div>
        )}
        <input
          type="file"
          accept=".png,.svg"
          onChange={() => onUpload('/placeholder-logo.png')}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

// Color Picker Component
function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-12 rounded border border-slate-300 cursor-pointer"
        />
      </div>
    </div>
  );
}

// Preview Mockup
function PreviewMockup({
  primaryColor,
  secondaryColor,
  accentColor,
  logoUrl,
}: {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
}) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center gap-3">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="h-6" />
        ) : (
          <div className="h-6 w-6 rounded bg-slate-200" />
        )}
        <span className="text-sm font-medium text-slate-700">Green Valley CC</span>
      </div>

      {/* Content */}
      <div className="p-4 bg-slate-50">
        <p className="text-lg font-semibold text-slate-800 mb-4">Welcome back!</p>
        <div className="space-y-3">
          <div className="h-3 w-3/4 bg-slate-200 rounded" />
          <div className="h-3 w-1/2 bg-slate-200 rounded" />
        </div>
        <button
          className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Book Golf
        </button>
      </div>
    </div>
  );
}

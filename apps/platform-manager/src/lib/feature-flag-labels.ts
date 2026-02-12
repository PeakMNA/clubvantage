/**
 * Human-readable labels and descriptions for all feature flags.
 * Used in Platform Manager UI to display feature information.
 */

export interface FeatureFlagMetadata {
  label: string;
  description: string;
  category: 'module' | 'feature' | 'operational';
}

export const FEATURE_FLAG_LABELS: Record<string, FeatureFlagMetadata> = {
  // Module Flags (6 flags)
  'modules.golf': {
    label: 'Golf Management',
    description: 'Full golf operations including tee times, carts, caddies, and scoring',
    category: 'module',
  },
  'modules.bookings': {
    label: 'Facility Bookings',
    description: 'Facility, equipment, and service bookings with calendar management',
    category: 'module',
  },
  'modules.billing': {
    label: 'Billing & AR',
    description: 'Invoicing, payments, accounts receivable, and billing automation',
    category: 'module',
  },
  'modules.marketing': {
    label: 'Marketing Suite',
    description: 'Campaign management, audience segmentation, and AI content generation',
    category: 'module',
  },
  'modules.pos': {
    label: 'Point of Sale',
    description: 'POS terminals, product catalog, inventory, and multi-outlet support',
    category: 'module',
  },
  'modules.reports': {
    label: 'Reports & Analytics',
    description: 'Financial reports, operational dashboards, and custom analytics',
    category: 'module',
  },

  // Feature-Level Flags (8 flags)
  'features.golfLottery': {
    label: 'Golf Lottery System',
    description: 'Automated tee time lottery with ranking algorithms and allocation rules',
    category: 'feature',
  },
  'features.memberWindows': {
    label: 'Member Booking Windows',
    description: 'Tier-based advance booking windows and priority access',
    category: 'feature',
  },
  'features.aiDynamicPricing': {
    label: 'AI Dynamic Pricing',
    description: 'Machine learning-powered pricing optimization for golf and services',
    category: 'feature',
  },
  'features.automatedFlows': {
    label: 'Automated Workflows',
    description: 'Rule-based automation for AR, billing cycles, and operational tasks',
    category: 'feature',
  },
  'features.memberPricing': {
    label: 'Member-Specific Pricing',
    description: 'Individual pricing rules and custom rates per member',
    category: 'feature',
  },
  'features.houseAccounts': {
    label: 'House Accounts',
    description: 'Credit limits, consolidated billing, and AR profiles',
    category: 'feature',
  },
  'features.whiteLabelApp': {
    label: 'White-Label Mobile App',
    description: 'Custom-branded iOS/Android member portal apps',
    category: 'feature',
  },
  'features.customDomain': {
    label: 'Custom Domain',
    description: 'Host member portal on club-owned domain with SSL',
    category: 'feature',
  },

  // Operational Flags (4 flags)
  'operational.maintenanceMode': {
    label: 'Maintenance Mode',
    description: 'Disable member-facing features for system maintenance (staff access only)',
    category: 'operational',
  },
  'operational.newMemberRegistration': {
    label: 'New Member Registration',
    description: 'Allow new member applications through member portal',
    category: 'operational',
  },
  'operational.onlineBooking': {
    label: 'Online Booking',
    description: 'Enable member self-service booking for golf and facilities',
    category: 'operational',
  },
  'operational.emailCampaigns': {
    label: 'Email Campaigns',
    description: 'Enable marketing email sends and automated campaign delivery',
    category: 'operational',
  },
};

/**
 * Get label and description for a feature flag key.
 * Supports dot-notation keys like "modules.golf" or "features.golfLottery".
 */
export function getFeatureFlagLabel(key: string): FeatureFlagMetadata | null {
  return FEATURE_FLAG_LABELS[key] || null;
}

/**
 * Get all flags grouped by category.
 */
export function getFeatureFlagsByCategory() {
  const grouped: Record<'module' | 'feature' | 'operational', Record<string, FeatureFlagMetadata>> = {
    module: {},
    feature: {},
    operational: {},
  };

  Object.entries(FEATURE_FLAG_LABELS).forEach(([key, metadata]) => {
    grouped[metadata.category][key] = metadata;
  });

  return grouped;
}

/**
 * Extract flag keys from a nested feature flags object.
 * Converts { modules: { golf: true } } to ["modules.golf"]
 */
export function extractFlagKeys(flags: {
  modules?: Record<string, boolean>;
  features?: Record<string, boolean>;
  operational?: Record<string, boolean>;
}): string[] {
  const keys: string[] = [];

  if (flags.modules) {
    Object.keys(flags.modules).forEach((key) => {
      keys.push(`modules.${key}`);
    });
  }

  if (flags.features) {
    Object.keys(flags.features).forEach((key) => {
      keys.push(`features.${key}`);
    });
  }

  if (flags.operational) {
    Object.keys(flags.operational).forEach((key) => {
      keys.push(`operational.${key}`);
    });
  }

  return keys;
}

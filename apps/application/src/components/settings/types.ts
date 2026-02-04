// Types for Settings module

export type SettingsSection =
  | 'club-profile'
  | 'organization'
  | 'gl-mapping'
  | 'billing-defaults'
  | 'billing-cycle'
  | 'localization'
  | 'notifications'
  | 'branding'
  | 'integrations'
  | 'lookups'
  | 'audit-trail'

export type OrganizationTab = 'outlets' | 'revenue-centers' | 'cost-centers' | 'profit-centers'
export type LookupTab = 'membership-types' | 'contract-templates' | 'member-lookups' | 'billing-lookups' | 'facility-types' | 'interest-categories'

export interface ClubProfile {
  clubName: string
  legalName: string
  taxId: string
  address1: string
  address2?: string
  city: string
  province: string
  postalCode: string
  country: string
  phone: string
  email: string
  website?: string
  timezone: string
  fiscalYearStart: number
}

export interface Outlet {
  id: string
  code: string
  name: string
  description?: string
  location?: string
  phone?: string
  glCode?: string
  status: 'active' | 'inactive'
}

export interface RevenueCenter {
  id: string
  code: string
  name: string
  description?: string
  defaultOutletId?: string
  glCode?: string
  status: 'active' | 'inactive'
}

export interface CostCenter {
  id: string
  code: string
  name: string
  description?: string
  glCode?: string
  status: 'active' | 'inactive'
}

export interface ProfitCenter {
  id: string
  code: string
  name: string
  description?: string
  revenueCenterIds: string[]
  costCenterIds: string[]
  status: 'active' | 'inactive'
}

export interface BillingDefaults {
  paymentTerms: number
  gracePeriod: number
  invoicePrefix: string
  invoiceStartNumber: number
  autoGenerationDay: number
  vatRate: number
  taxMethod: 'addon' | 'included' | 'exempt'
  whtEnabled: boolean
  whtRates: number[]
  lateFeeEnabled: boolean
  lateFeeType: 'percentage' | 'fixed'
  lateFeeAmount: number
  lateFeeCap?: number
  agingBuckets: number[]
  autoSuspendEnabled: boolean
  autoSuspendDays: number
}

export interface Localization {
  language: string
  region: string
  baseCurrency: string
  displayCurrencies: string[]
  currencySymbolPosition: 'before' | 'after'
  dateFormat: string
  timeFormat: '12' | '24'
  decimalSeparator: string
  thousandsSeparator: string
  useThaiAddressFormat: boolean
  showBuddhistEra: boolean
  validateThaiNationalId: boolean
}

export interface NotificationTemplate {
  id: string
  name: string
  channel: 'email' | 'sms'
  enabled: boolean
  subject?: string
  body: string
}

export interface Branding {
  primaryLogo?: string
  secondaryLogo?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  emailHeaderStyle: 'logo' | 'logo-name' | 'text'
  emailFooter: string
  socialLinks: {
    facebook?: string
    instagram?: string
    line?: string
  }
}

export interface Integration {
  provider: string
  type: 'payment' | 'accounting' | 'email' | 'sms'
  connected: boolean
  lastActivity?: Date
  config?: Record<string, unknown>
}

export interface MembershipType {
  id: string
  code: string
  name: string
  description?: string
  monthlyFee: number
  entryFee: number
  billingCycle: 'monthly' | 'quarterly' | 'annual'
  proRatingMethod: 'daily' | 'monthly' | 'full'
  minimumTermMonths: number
  upgradeFee: number
  downgradeFee: number
  allowsDependents: boolean
  maxDependents?: number
  childAgeLimit?: number
  studentAgeLimit?: number
  allowedRelationships?: string[]
  defaultRevenueCenterId?: string
  defaultOutletId?: string
  requiresBoardApproval: boolean
  contractTemplateIds: string[]
  sortOrder: number
  status: 'active' | 'inactive'
}

export interface ContractTemplate {
  id: string
  code: string
  name: string
  description?: string
  durationMonths: number
  termsContent: string
  cancellationPolicy?: string
  earlyTerminationType: 'fixed' | 'percentage'
  earlyTerminationValue: number
  autoRenewal: boolean
  renewalNoticeDays: number
  status: 'active' | 'inactive'
}

export interface LookupValue {
  id: string
  value: string
  label: string
  sortOrder: number
  status: 'active' | 'inactive'
}

export interface GLMapping {
  id: string
  sourceType: 'revenue' | 'ar' | 'bank' | 'wht' | 'late-fee'
  sourceCode: string
  sourceName: string
  targetCode?: string
  targetName?: string
  status: 'mapped' | 'unmapped' | 'review'
}

export interface AuditConfig {
  retentionYears: number
  events: {
    financial: boolean
    memberChanges: boolean
    userActivity: boolean
    settingsChanges: boolean
    documentAccess: boolean
    apiAccess: boolean
  }
  exportFormat: 'csv' | 'json'
}

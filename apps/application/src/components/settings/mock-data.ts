import type {
  ClubProfile,
  Outlet,
  RevenueCenter,
  CostCenter,
  ProfitCenter,
  BillingDefaults,
  Localization,
  NotificationTemplate,
  Branding,
  Integration,
  MembershipType,
  ContractTemplate,
  LookupValue,
  GLMapping,
  AuditConfig,
} from './types'

export const mockClubProfile: ClubProfile = {
  clubName: 'Vantage Country Club',
  legalName: 'Vantage CC Co., Ltd.',
  taxId: '0105561234567',
  address1: '123 Sukhumvit Road',
  address2: 'Khlong Toei',
  city: 'Bangkok',
  province: 'Bangkok',
  postalCode: '10110',
  country: 'Thailand',
  phone: '+66 2 123 4567',
  email: 'info@vantagecc.com',
  website: 'https://vantagecc.com',
  timezone: 'Asia/Bangkok',
  fiscalYearStart: 1,
}

export const mockOutlets: Outlet[] = [
  { id: 'o1', code: 'MAIN', name: 'Main Clubhouse', location: 'Building A', phone: '02-123-4567', status: 'active' },
  { id: 'o2', code: 'GOLF', name: 'Golf Pro Shop', location: 'Golf Course', phone: '02-123-4568', status: 'active' },
  { id: 'o3', code: 'F&B', name: 'Restaurant & Bar', location: 'Building A, Floor 2', phone: '02-123-4569', status: 'active' },
  { id: 'o4', code: 'SPA', name: 'Wellness Center', location: 'Building B', phone: '02-123-4570', status: 'inactive' },
]

export const mockRevenueCenters: RevenueCenter[] = [
  { id: 'rc1', code: 'MBR-FEES', name: 'Membership Fees', description: 'Monthly and annual dues', defaultOutletId: 'o1', status: 'active' },
  { id: 'rc2', code: 'F&B-SALES', name: 'F&B Sales', description: 'Food and beverage revenue', defaultOutletId: 'o3', status: 'active' },
  { id: 'rc3', code: 'GOLF-FEES', name: 'Golf Fees', description: 'Green fees and cart rental', defaultOutletId: 'o2', status: 'active' },
  { id: 'rc4', code: 'SPA-REV', name: 'Spa Services', description: 'Wellness treatments', defaultOutletId: 'o4', status: 'active' },
]

export const mockCostCenters: CostCenter[] = [
  { id: 'cc1', code: 'ADMIN', name: 'Administration', description: 'General admin costs', status: 'active' },
  { id: 'cc2', code: 'MAINT', name: 'Maintenance', description: 'Facility maintenance', status: 'active' },
  { id: 'cc3', code: 'MARKETING', name: 'Marketing', description: 'Marketing and events', status: 'active' },
]

export const mockProfitCenters: ProfitCenter[] = [
  { id: 'pc1', code: 'GOLF-OPS', name: 'Golf Operations', revenueCenterIds: ['rc3'], costCenterIds: ['cc2'], status: 'active' },
  { id: 'pc2', code: 'F&B-OPS', name: 'F&B Operations', revenueCenterIds: ['rc2'], costCenterIds: ['cc1'], status: 'active' },
]

export const mockBillingDefaults: BillingDefaults = {
  paymentTerms: 30,
  gracePeriod: 7,
  invoicePrefix: 'INV-',
  invoiceStartNumber: 1001,
  autoGenerationDay: 1,
  vatRate: 7,
  taxMethod: 'included',
  whtEnabled: true,
  whtRates: [1, 2, 3],
  lateFeeEnabled: true,
  lateFeeType: 'percentage',
  lateFeeAmount: 1.5,
  lateFeeCap: 25,
  agingBuckets: [30, 60, 90, 120],
  autoSuspendEnabled: true,
  autoSuspendDays: 91,
}

export const mockLocalization: Localization = {
  language: 'en',
  region: 'TH',
  baseCurrency: 'THB',
  displayCurrencies: ['THB'],
  currencySymbolPosition: 'before',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24',
  decimalSeparator: '.',
  thousandsSeparator: ',',
  useThaiAddressFormat: true,
  showBuddhistEra: false,
  validateThaiNationalId: true,
}

export const mockNotificationTemplates: NotificationTemplate[] = [
  { id: 'nt1', name: 'Invoice Sent', channel: 'email', enabled: true, subject: 'Invoice {{invoice_number}} from {{club_name}}', body: 'Dear {{member_name}},\n\nYour invoice #{{invoice_number}} for {{amount}} is now available.\n\nDue Date: {{due_date}}\n\nThank you,\n{{club_name}}' },
  { id: 'nt2', name: 'Payment Received', channel: 'email', enabled: true, subject: 'Payment Received - {{club_name}}', body: 'Dear {{member_name}},\n\nWe have received your payment of {{amount}}.\n\nReceipt #: {{receipt_number}}\n\nThank you,\n{{club_name}}' },
  { id: 'nt3', name: 'Payment Reminder (60 days)', channel: 'email', enabled: true, subject: 'Payment Reminder - {{club_name}}', body: 'Dear {{member_name}},\n\nThis is a friendly reminder that you have an outstanding balance of {{balance}}.\n\nThank you,\n{{club_name}}' },
  { id: 'nt4', name: 'Payment Reminder (30 days)', channel: 'email', enabled: true, subject: 'Payment Reminder - {{club_name}}', body: 'Dear {{member_name}},\n\nYour account has an overdue balance of {{balance}}.\n\nPlease make payment as soon as possible.\n\nThank you,\n{{club_name}}' },
  { id: 'nt5', name: 'Late Fee Applied', channel: 'email', enabled: false, subject: 'Late Fee Notice - {{club_name}}', body: 'Dear {{member_name}},\n\nA late fee of {{late_fee}} has been applied to your account.\n\nCurrent balance: {{balance}}\n\n{{club_name}}' },
  { id: 'nt6', name: 'Suspension Notice', channel: 'email', enabled: true, subject: 'Account Suspension Notice - {{club_name}}', body: 'Dear {{member_name}},\n\nDue to an outstanding balance, your membership has been suspended.\n\n{{club_name}}' },
  { id: 'nt7', name: 'Welcome Email', channel: 'email', enabled: true, subject: 'Welcome to {{club_name}}!', body: 'Dear {{member_name}},\n\nWelcome to {{club_name}}! We are delighted to have you as a member.\n\n{{club_name}}' },
  { id: 'nt8', name: 'Booking Confirmation', channel: 'email', enabled: true, subject: 'Booking Confirmation - {{club_name}}', body: 'Dear {{member_name}},\n\nYour booking has been confirmed.\n\n{{booking_details}}\n\n{{club_name}}' },
  { id: 'nt9', name: 'Booking Reminder', channel: 'sms', enabled: false, body: 'Reminder: Your booking at {{club_name}} is tomorrow at {{time}}.' },
]

export const mockBranding: Branding = {
  primaryLogo: '/logos/vantage-primary.png',
  secondaryLogo: '/logos/vantage-light.png',
  primaryColor: '#4F46E5',
  secondaryColor: '#0F172A',
  accentColor: '#10B981',
  fontFamily: 'Inter',
  emailHeaderStyle: 'logo',
  emailFooter: '© 2024 Vantage Country Club. All rights reserved.',
  socialLinks: {
    facebook: 'https://facebook.com/vantagecc',
    instagram: '',
    line: '@vantagecc',
  },
}

export const mockIntegrations: Integration[] = [
  { provider: 'Stripe', type: 'payment', connected: true, lastActivity: new Date() },
  { provider: 'Xero', type: 'accounting', connected: true, lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000) },
  { provider: 'SendGrid', type: 'email', connected: false },
  { provider: 'Twilio', type: 'sms', connected: false },
]

export const mockMembershipTypes: MembershipType[] = [
  {
    id: 'mt1',
    code: 'IND',
    name: 'Individual',
    description: 'Single person membership',
    monthlyFee: 5000,
    entryFee: 100000,
    billingCycle: 'monthly',
    proRatingMethod: 'daily',
    minimumTermMonths: 12,
    upgradeFee: 0,
    downgradeFee: 0,
    allowsDependents: false,
    requiresBoardApproval: false,
    contractTemplateIds: ['ct1'],
    sortOrder: 1,
    status: 'active',
  },
  {
    id: 'mt2',
    code: 'FAM',
    name: 'Family',
    description: 'Family membership with dependents',
    monthlyFee: 15000,
    entryFee: 500000,
    billingCycle: 'monthly',
    proRatingMethod: 'daily',
    minimumTermMonths: 12,
    upgradeFee: 50000,
    downgradeFee: 0,
    allowsDependents: true,
    maxDependents: 4,
    childAgeLimit: 18,
    studentAgeLimit: 25,
    allowedRelationships: ['spouse', 'child'],
    requiresBoardApproval: true,
    contractTemplateIds: ['ct1', 'ct2'],
    sortOrder: 2,
    status: 'active',
  },
  {
    id: 'mt3',
    code: 'CORP',
    name: 'Corporate',
    description: 'Corporate membership package',
    monthlyFee: 50000,
    entryFee: 1000000,
    billingCycle: 'quarterly',
    proRatingMethod: 'monthly',
    minimumTermMonths: 24,
    upgradeFee: 0,
    downgradeFee: 0,
    allowsDependents: false,
    requiresBoardApproval: true,
    contractTemplateIds: ['ct2'],
    sortOrder: 3,
    status: 'active',
  },
]

export const mockContractTemplates: ContractTemplate[] = [
  {
    id: 'ct1',
    code: 'STD-12',
    name: 'Standard 12-Month',
    description: 'Standard individual or family contract',
    durationMonths: 12,
    termsContent: 'Standard terms and conditions...',
    cancellationPolicy: '30 days written notice required',
    earlyTerminationType: 'percentage',
    earlyTerminationValue: 50,
    autoRenewal: true,
    renewalNoticeDays: 30,
    status: 'active',
  },
  {
    id: 'ct2',
    code: 'CORP-24',
    name: 'Corporate 24-Month',
    description: 'Extended corporate contract',
    durationMonths: 24,
    termsContent: 'Corporate terms and conditions...',
    cancellationPolicy: '60 days written notice required',
    earlyTerminationType: 'fixed',
    earlyTerminationValue: 100000,
    autoRenewal: true,
    renewalNoticeDays: 60,
    status: 'active',
  },
]

export const mockTitleLookups: LookupValue[] = [
  { id: 'l1', value: 'mr', label: 'Mr.', sortOrder: 1, status: 'active' },
  { id: 'l2', value: 'mrs', label: 'Mrs.', sortOrder: 2, status: 'active' },
  { id: 'l3', value: 'ms', label: 'Ms.', sortOrder: 3, status: 'active' },
  { id: 'l4', value: 'dr', label: 'Dr.', sortOrder: 4, status: 'active' },
]

export const mockRelationshipLookups: LookupValue[] = [
  { id: 'r1', value: 'spouse', label: 'Spouse', sortOrder: 1, status: 'active' },
  { id: 'r2', value: 'child', label: 'Child', sortOrder: 2, status: 'active' },
  { id: 'r3', value: 'parent', label: 'Parent', sortOrder: 3, status: 'active' },
  { id: 'r4', value: 'sibling', label: 'Sibling', sortOrder: 4, status: 'active' },
]

export const mockPaymentMethodLookups: LookupValue[] = [
  { id: 'pm1', value: 'cash', label: 'Cash', sortOrder: 1, status: 'active' },
  { id: 'pm2', value: 'credit_card', label: 'Credit Card', sortOrder: 2, status: 'active' },
  { id: 'pm3', value: 'bank_transfer', label: 'Bank Transfer', sortOrder: 3, status: 'active' },
  { id: 'pm4', value: 'cheque', label: 'Cheque', sortOrder: 4, status: 'active' },
]

export const mockGLMappings: GLMapping[] = [
  { id: 'gl1', sourceType: 'revenue', sourceCode: 'MBR-FEES', sourceName: 'Membership Fees', targetCode: '4100', targetName: 'Membership Revenue', status: 'mapped' },
  { id: 'gl2', sourceType: 'revenue', sourceCode: 'F&B-SALES', sourceName: 'F&B Sales', targetCode: '4200', targetName: 'F&B Revenue', status: 'mapped' },
  { id: 'gl3', sourceType: 'revenue', sourceCode: 'GOLF-FEES', sourceName: 'Golf Fees', targetCode: '4300', targetName: 'Golf Revenue', status: 'mapped' },
  { id: 'gl4', sourceType: 'ar', sourceCode: 'AR', sourceName: 'Member Receivables', targetCode: '1200', targetName: 'Accounts Receivable', status: 'mapped' },
  { id: 'gl5', sourceType: 'bank', sourceCode: 'MAIN-BANK', sourceName: 'Main Account', targetCode: '1000', targetName: 'Operating Account', status: 'mapped' },
  { id: 'gl6', sourceType: 'bank', sourceCode: 'GOLF-BANK', sourceName: 'Golf Pro Shop', status: 'unmapped' },
  { id: 'gl7', sourceType: 'wht', sourceCode: 'WHT', sourceName: 'WHT Receivable', targetCode: '1250', targetName: 'WHT Receivable', status: 'review' },
  { id: 'gl8', sourceType: 'late-fee', sourceCode: 'LATE-FEE', sourceName: 'Late Fees', status: 'unmapped' },
]

export const mockAuditConfig: AuditConfig = {
  retentionYears: 7,
  events: {
    financial: true,
    memberChanges: true,
    userActivity: true,
    settingsChanges: true,
    documentAccess: false,
    apiAccess: false,
  },
  exportFormat: 'csv',
}

export const timezones = [
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (UTC+7)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (UTC+8)' },
  { value: 'Asia/Hong_Kong', label: 'Asia/Hong Kong (UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+9)' },
]

export const currencies = [
  { value: 'THB', label: 'THB - Thai Baht', symbol: '฿' },
  { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'SGD', label: 'SGD - Singapore Dollar', symbol: 'S$' },
]

export const dateFormats = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/01/2024' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '01/31/2024' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2024-01-31' },
]

export const thaiProvinces = [
  'Bangkok',
  'Chiang Mai',
  'Chiang Rai',
  'Chonburi',
  'Nonthaburi',
  'Phuket',
  'Samut Prakan',
]

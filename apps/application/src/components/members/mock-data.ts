/**
 * Mock data for Members Section
 * Based on PRD spec data.json
 */

import type {
  Member,
  MembershipType,
  MembershipApplication,
  PersonSearchResult,
  SavedFilter,
  ARTransaction,
  LookupItem,
} from './types';

// =============================================================================
// Membership Types
// =============================================================================

export const membershipTypes: MembershipType[] = [
  {
    id: 'mt-001',
    name: 'Individual',
    description: 'Single member access with full club privileges',
    billingCycle: 'MONTHLY',
    monthlyFee: 15000,
    entryFee: 50000,
    maxDependents: 0,
    requiresBoardApproval: false,
  },
  {
    id: 'mt-002',
    name: 'Family',
    description: 'Primary member plus up to 4 dependents with shared billing',
    billingCycle: 'MONTHLY',
    monthlyFee: 25000,
    entryFee: 75000,
    maxDependents: 4,
    requiresBoardApproval: true,
  },
  {
    id: 'mt-003',
    name: 'Corporate',
    description: 'Company membership with up to 3 designated representatives',
    billingCycle: 'QUARTERLY',
    monthlyFee: 45000,
    entryFee: 150000,
    maxDependents: 3,
    requiresBoardApproval: true,
  },
];

// =============================================================================
// Members
// =============================================================================

export const members: Member[] = [
  {
    id: 'mem-001',
    memberNumber: 'SKV-2024-0001',
    firstName: 'Somchai',
    lastName: 'Wongsakul',
    email: 'somchai.w@email.com',
    phone: '+66 81 234 5678',
    dateOfBirth: '1975-03-15',
    nationality: 'Thai',
    membershipTypeId: 'mt-002',
    membershipTypeName: 'Family',
    status: 'ACTIVE',
    joinDate: '2022-01-15',
    balance: 0,
    autoPay: true,
    addresses: [
      {
        id: 'addr-001',
        type: 'BILLING',
        isPrimary: true,
        label: 'Home',
        addressLine1: '123/45 Sukhumvit Road',
        addressLine2: 'Soi 31',
        subDistrict: 'Klongtoey Nuea',
        district: 'Wattana',
        province: 'Bangkok',
        postalCode: '10110',
        country: 'Thailand',
      },
    ],
    dependents: [
      {
        id: 'dep-001',
        memberNumber: 'SKV-2024-0001-D1',
        firstName: 'Siriporn',
        lastName: 'Wongsakul',
        relationship: 'SPOUSE',
        dateOfBirth: '1978-07-22',
        email: 'siriporn.w@email.com',
        phone: '+66 81 234 5679',
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
        status: 'ACTIVE',
      },
      {
        id: 'dep-002',
        memberNumber: 'SKV-2024-0001-D2',
        firstName: 'Natthapong',
        lastName: 'Wongsakul',
        relationship: 'CHILD',
        dateOfBirth: '2005-11-03',
        status: 'ACTIVE',
      },
    ],
    contract: {
      id: 'con-001',
      memberId: 'mem-001',
      membershipTypeId: 'mt-002',
      templateId: 'tpl-002',
      startDate: '2022-01-15',
      status: 'ACTIVE',
      createdAt: '2022-01-15',
      updatedAt: '2024-12-01',
      charges: [
        {
          id: 'chg-001',
          contractId: 'con-001',
          templateChargeId: 'tc-004',
          name: 'Monthly Membership Fee',
          description: 'Base monthly fee for Family membership',
          chargeType: 'RECURRING',
          frequency: 'MONTHLY',
          amount: 25000,
          taxMethod: 'ADD_ON',
          taxRate: 7,
          startDate: '2022-01-15',
          status: 'ACTIVE',
          revenueCenterId: 'rc-membership',
          revenueCenterName: 'Membership Revenue',
          outletId: 'outlet-main',
          outletName: 'Main Clubhouse',
        },
        {
          id: 'chg-002',
          contractId: 'con-001',
          name: 'Locker Rental - Premium',
          description: 'Large premium locker in main clubhouse',
          chargeType: 'RECURRING',
          frequency: 'MONTHLY',
          amount: 1000,
          taxMethod: 'ADD_ON',
          taxRate: 7,
          startDate: '2022-06-01',
          status: 'ACTIVE',
          revenueCenterId: 'rc-rentals',
          revenueCenterName: 'Rentals & Equipment',
          outletId: 'outlet-main',
          outletName: 'Main Clubhouse',
        },
        {
          id: 'chg-003',
          contractId: 'con-001',
          templateChargeId: 'tc-006',
          name: 'Guest Visit Fee',
          description: 'Per-visit fee for non-member guests',
          chargeType: 'USAGE_BASED',
          usageType: 'PER_VISIT',
          amount: 500,
          taxMethod: 'ADD_ON',
          taxRate: 7,
          startDate: '2022-01-15',
          status: 'ACTIVE',
          revenueCenterId: 'rc-membership',
          revenueCenterName: 'Membership Revenue',
          outletId: 'outlet-main',
          outletName: 'Main Clubhouse',
        },
      ],
    },
  },
  {
    id: 'mem-002',
    memberNumber: 'SKV-2024-0002',
    firstName: 'Patricia',
    lastName: 'Chen',
    email: 'patricia.chen@techcorp.com',
    phone: '+66 92 876 5432',
    dateOfBirth: '1982-09-28',
    nationality: 'Singaporean',
    membershipTypeId: 'mt-003',
    membershipTypeName: 'Corporate',
    status: 'ACTIVE',
    joinDate: '2023-06-01',
    balance: 45000,
    agingBucket: '30',
    oldestInvoiceDate: '2024-12-15',
    autoPay: false,
    addresses: [
      {
        id: 'addr-002',
        type: 'BILLING',
        isPrimary: true,
        label: 'Office',
        addressLine1: '888 Ploenchit Tower, Floor 25',
        subDistrict: 'Lumpini',
        district: 'Pathumwan',
        province: 'Bangkok',
        postalCode: '10330',
        country: 'Thailand',
      },
    ],
    dependents: [],
  },
  {
    id: 'mem-003',
    memberNumber: 'SKV-2024-0003',
    firstName: 'Tanaka',
    lastName: 'Hiroshi',
    email: 'h.tanaka@japanmail.jp',
    phone: '+66 89 111 2233',
    dateOfBirth: '1968-12-05',
    nationality: 'Japanese',
    membershipTypeId: 'mt-001',
    membershipTypeName: 'Individual',
    status: 'ACTIVE',
    joinDate: '2021-03-20',
    balance: 0,
    autoPay: true,
    addresses: [
      {
        id: 'addr-003',
        type: 'BOTH',
        isPrimary: true,
        label: 'Residence',
        addressLine1: '456 Riverside Condo, Unit 12B',
        subDistrict: 'Khlong Ton Sai',
        district: 'Khlong San',
        province: 'Bangkok',
        postalCode: '10600',
        country: 'Thailand',
      },
    ],
    dependents: [],
  },
  {
    id: 'mem-004',
    memberNumber: 'SKV-2024-0004',
    firstName: 'Prasert',
    lastName: 'Siriwan',
    email: 'prasert.s@gmail.com',
    phone: '+66 86 555 7890',
    dateOfBirth: '1955-06-18',
    nationality: 'Thai',
    membershipTypeId: 'mt-001',
    membershipTypeName: 'Individual',
    status: 'INACTIVE',
    inactiveReason: 'Medical leave - recovery from surgery',
    joinDate: '2019-08-10',
    balance: 0,
    autoPay: false,
    addresses: [
      {
        id: 'addr-004',
        type: 'BILLING',
        isPrimary: true,
        label: 'Home',
        addressLine1: '78/9 Moo 5',
        addressLine2: 'Soi Chaengwattana 14',
        subDistrict: 'Thung Song Hong',
        district: 'Lak Si',
        province: 'Bangkok',
        postalCode: '10210',
        country: 'Thailand',
      },
    ],
    dependents: [],
  },
  {
    id: 'mem-005',
    memberNumber: 'SKV-2024-0005',
    firstName: 'Michael',
    lastName: 'Roberts',
    email: 'm.roberts@consulting.co',
    phone: '+66 95 999 8877',
    dateOfBirth: '1979-02-14',
    nationality: 'British',
    membershipTypeId: 'mt-002',
    membershipTypeName: 'Family',
    status: 'SUSPENDED',
    suspensionReason: '91+ days overdue - booking blocked',
    joinDate: '2023-11-01',
    balance: 125700,
    agingBucket: '91+',
    oldestInvoiceDate: '2024-09-15',
    autoPay: false,
    addresses: [
      {
        id: 'addr-005',
        type: 'BILLING',
        isPrimary: true,
        label: 'Home',
        addressLine1: '99 The Met Sathorn',
        addressLine2: 'Unit 4502',
        subDistrict: 'Thung Maha Mek',
        district: 'Sathorn',
        province: 'Bangkok',
        postalCode: '10120',
        country: 'Thailand',
      },
    ],
    dependents: [
      {
        id: 'dep-003',
        memberNumber: 'SKV-2024-0005-D1',
        firstName: 'Emily',
        lastName: 'Roberts',
        relationship: 'SPOUSE',
        dateOfBirth: '1981-05-30',
        email: 'emily.r@email.com',
        phone: '+66 95 999 8878',
        photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
        status: 'ACTIVE',
      },
      {
        id: 'dep-004',
        memberNumber: 'SKV-2024-0005-D2',
        firstName: 'James',
        lastName: 'Roberts',
        relationship: 'CHILD',
        dateOfBirth: '2012-08-15',
        photoUrl: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=200&h=200&fit=crop&crop=face',
        status: 'ACTIVE',
      },
      {
        id: 'dep-005',
        memberNumber: 'SKV-2024-0005-D3',
        firstName: 'Sophie',
        lastName: 'Roberts',
        relationship: 'CHILD',
        dateOfBirth: '2015-01-22',
        status: 'INACTIVE',
      },
    ],
  },
  {
    id: 'mem-006',
    memberNumber: 'SKV-2024-0006',
    firstName: 'Nattaya',
    lastName: 'Kittisak',
    email: 'nattaya.k@outlook.com',
    phone: '+66 84 333 4455',
    dateOfBirth: '1990-11-08',
    nationality: 'Thai',
    membershipTypeId: 'mt-001',
    membershipTypeName: 'Individual',
    status: 'PENDING',
    joinDate: '2024-12-28',
    balance: 65000,
    autoPay: false,
    addresses: [
      {
        id: 'addr-006',
        type: 'BILLING',
        isPrimary: true,
        label: 'Home',
        addressLine1: '222/1 Soi Thonglor 10',
        subDistrict: 'Khlong Tan Nuea',
        district: 'Wattana',
        province: 'Bangkok',
        postalCode: '10110',
        country: 'Thailand',
      },
    ],
    dependents: [],
  },
  {
    id: 'mem-007',
    memberNumber: 'SKV-2023-0089',
    firstName: 'Surasak',
    lastName: 'Pongpanich',
    email: 'surasak.p@oldmail.com',
    phone: '+66 81 777 8899',
    dateOfBirth: '1960-04-25',
    nationality: 'Thai',
    membershipTypeId: 'mt-001',
    membershipTypeName: 'Individual',
    status: 'CANCELLED',
    inactiveReason: 'Relocated overseas',
    joinDate: '2018-02-14',
    balance: 0,
    autoPay: false,
    addresses: [],
    dependents: [],
  },
  {
    id: 'mem-008',
    memberNumber: 'SKV-2024-0007',
    firstName: 'Kim',
    lastName: 'Soo-yeon',
    email: 'sooyeon.kim@kmail.kr',
    phone: '+66 93 222 1100',
    dateOfBirth: '1985-08-12',
    nationality: 'Korean',
    membershipTypeId: 'mt-002',
    membershipTypeName: 'Family',
    status: 'ACTIVE',
    joinDate: '2024-03-15',
    balance: 0,
    autoPay: true,
    addresses: [
      {
        id: 'addr-007',
        type: 'BILLING',
        isPrimary: true,
        label: 'Home',
        addressLine1: '55 Noble Remix Thonglor',
        addressLine2: 'Building A, Floor 18',
        subDistrict: 'Khlong Tan Nuea',
        district: 'Wattana',
        province: 'Bangkok',
        postalCode: '10110',
        country: 'Thailand',
      },
    ],
    dependents: [
      {
        id: 'dep-006',
        memberNumber: 'SKV-2024-0007-D1',
        firstName: 'Park',
        lastName: 'Ji-hoon',
        relationship: 'SPOUSE',
        dateOfBirth: '1983-03-08',
        email: 'jihoon.park@kmail.kr',
        phone: '+66 93 222 1101',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        status: 'ACTIVE',
      },
    ],
  },
];

// =============================================================================
// Applications
// =============================================================================

export const applications: MembershipApplication[] = [
  {
    id: 'app-001',
    applicantFirstName: 'Wichai',
    applicantLastName: 'Pongpanich',
    email: 'wichai.p@newmember.com',
    phone: '+66 88 111 2233',
    requestedMembershipTypeId: 'mt-002',
    requestedMembershipTypeName: 'Family',
    sponsorId: 'mem-001',
    sponsorName: 'Somchai Wongsakul',
    submittedDate: '2025-01-05',
    status: 'PENDING_BOARD',
    documents: [
      { id: 'doc-001', type: 'id_card', fileName: 'national_id.pdf', uploadedDate: '2025-01-05', status: 'VERIFIED' },
      { id: 'doc-002', type: 'proof_of_address', fileName: 'utility_bill.pdf', uploadedDate: '2025-01-05', status: 'VERIFIED' },
    ],
    reviewNotes: 'Referred by platinum member. Strong corporate background in finance sector.',
    reviewedBy: 'Membership Administrator',
    reviewedDate: '2025-01-06',
  },
  {
    id: 'app-002',
    applicantFirstName: 'Sarah',
    applicantLastName: 'Johnson',
    email: 'sarah.j@corporate.com',
    phone: '+66 92 444 5566',
    requestedMembershipTypeId: 'mt-003',
    requestedMembershipTypeName: 'Corporate',
    sponsorId: 'mem-002',
    sponsorName: 'Patricia Chen',
    submittedDate: '2025-01-08',
    status: 'UNDER_REVIEW',
    documents: [
      { id: 'doc-003', type: 'passport', fileName: 'passport_scan.pdf', uploadedDate: '2025-01-08', status: 'PENDING' },
    ],
    reviewNotes: 'Awaiting corporate verification documents and company letter.',
  },
  {
    id: 'app-003',
    applicantFirstName: 'Kittisak',
    applicantLastName: 'Somboon',
    email: 'kittisak.s@email.com',
    phone: '+66 81 999 0000',
    requestedMembershipTypeId: 'mt-001',
    requestedMembershipTypeName: 'Individual',
    submittedDate: '2025-01-10',
    status: 'SUBMITTED',
    documents: [],
    reviewNotes: 'Walk-in applicant. Needs to submit ID and proof of address.',
  },
  {
    id: 'app-004',
    applicantFirstName: 'Ananya',
    applicantLastName: 'Charoenpol',
    email: 'ananya.c@firm.co.th',
    phone: '+66 89 222 3344',
    requestedMembershipTypeId: 'mt-002',
    requestedMembershipTypeName: 'Family',
    sponsorId: 'mem-003',
    sponsorName: 'Tanaka Hiroshi',
    submittedDate: '2024-12-20',
    status: 'APPROVED',
    documents: [
      { id: 'doc-004', type: 'id_card', fileName: 'id.pdf', uploadedDate: '2024-12-20', status: 'VERIFIED' },
      { id: 'doc-005', type: 'proof_of_address', fileName: 'bank_statement.pdf', uploadedDate: '2024-12-20', status: 'VERIFIED' },
    ],
    reviewNotes: 'Approved by board on 2025-01-02. Pending member record creation.',
    reviewedBy: 'Board Committee',
    reviewedDate: '2025-01-02',
    approvedDate: '2025-01-02',
    approvedBy: 'Board Vote (3-0)',
  },
  {
    id: 'app-005',
    applicantFirstName: 'Robert',
    applicantLastName: 'Martinez',
    email: 'r.martinez@company.com',
    phone: '+66 95 777 8899',
    requestedMembershipTypeId: 'mt-003',
    requestedMembershipTypeName: 'Corporate',
    sponsorId: 'mem-002',
    sponsorName: 'Patricia Chen',
    submittedDate: '2024-12-15',
    status: 'REJECTED',
    documents: [
      { id: 'doc-006', type: 'passport', fileName: 'passport.pdf', uploadedDate: '2024-12-15', status: 'VERIFIED' },
    ],
    reviewNotes: 'Application incomplete. Company not verified.',
    reviewedBy: 'Membership Administrator',
    reviewedDate: '2024-12-18',
    rejectedDate: '2024-12-20',
    rejectedReason: 'Unable to verify corporate affiliation. Applicant may reapply with proper documentation.',
  },
];

// =============================================================================
// Saved Filters
// =============================================================================

export const savedFilters: SavedFilter[] = [
  { id: 'sf-001', name: 'Active Members', filters: { statuses: ['ACTIVE'] }, isDefault: true },
  { id: 'sf-002', name: 'Overdue Balances', filters: { statuses: ['ACTIVE'], balanceMin: 1 } },
  { id: 'sf-003', name: 'New This Month', filters: {} },
  { id: 'sf-004', name: 'Inactive & Cancelled', filters: { statuses: ['INACTIVE', 'CANCELLED'] } },
  { id: 'sf-005', name: 'Suspended (91+ Days)', filters: { statuses: ['SUSPENDED'], agingBuckets: ['91+'] } },
];

// =============================================================================
// Person Search Sample Results
// =============================================================================

export const personSearchResults: PersonSearchResult[] = [
  {
    id: 'mem-001',
    personType: 'MEMBER',
    memberNumber: 'SKV-2024-0001',
    firstName: 'Somchai',
    lastName: 'Wongsakul',
    displayName: 'Somchai Wongsakul',
    email: 'somchai.w@email.com',
    phone: '+66 81 234 5678',
    status: 'ACTIVE',
    membershipTypeName: 'Family',
  },
  {
    id: 'dep-001',
    personType: 'DEPENDENT',
    memberNumber: 'SKV-2024-0001-D1',
    firstName: 'Siriporn',
    lastName: 'Wongsakul',
    displayName: 'Siriporn Wongsakul',
    email: 'siriporn.w@email.com',
    phone: '+66 81 234 5679',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    status: 'ACTIVE',
    parentMemberId: 'mem-001',
    parentMemberNumber: 'SKV-2024-0001',
    parentMemberName: 'Somchai Wongsakul',
    relationship: 'SPOUSE',
  },
  {
    id: 'guest-001',
    personType: 'GUEST',
    firstName: 'John',
    lastName: 'Smith',
    displayName: 'John Smith',
    email: 'john.smith@guest.com',
    phone: '+66 99 888 7777',
    status: 'ACTIVE',
    sponsorMemberId: 'mem-001',
    sponsorMemberNumber: 'SKV-2024-0001',
    sponsorMemberName: 'Somchai Wongsakul',
  },
];

// =============================================================================
// A/R Transactions
// =============================================================================

export const arTransactions: ARTransaction[] = [
  { id: 'ar-001', memberId: 'mem-001', date: '2025-01-01', type: 'INVOICE', description: 'Monthly Membership Fee - January 2025', invoiceNumber: 'INV-2025-0001', amount: 26750, runningBalance: 26750 },
  { id: 'ar-002', memberId: 'mem-001', date: '2025-01-05', type: 'PAYMENT', description: 'Online Payment - Card ending 4567', amount: -26750, runningBalance: 0 },
  { id: 'ar-003', memberId: 'mem-001', date: '2024-12-01', type: 'INVOICE', description: 'Monthly Membership Fee - December 2024', invoiceNumber: 'INV-2024-0312', amount: 26750, runningBalance: 26750 },
  { id: 'ar-004', memberId: 'mem-001', date: '2024-12-10', type: 'PAYMENT', description: 'Online Payment - Card ending 4567', amount: -26750, runningBalance: 0 },
];

// =============================================================================
// Lookup Data
// =============================================================================

export const revenueCenters: LookupItem[] = [
  { id: 'rc-membership', name: 'Membership Revenue', code: 'MEM' },
  { id: 'rc-rentals', name: 'Rentals & Equipment', code: 'RNT' },
  { id: 'rc-events', name: 'Events & Functions', code: 'EVT' },
  { id: 'rc-food', name: 'Food & Beverage', code: 'F&B' },
  { id: 'rc-golf', name: 'Golf Operations', code: 'GLF' },
];

export const outlets: LookupItem[] = [
  { id: 'outlet-main', name: 'Main Clubhouse', code: 'MAIN' },
  { id: 'outlet-golf', name: 'Golf Pro Shop', code: 'GOLF' },
  { id: 'outlet-tennis', name: 'Tennis Center', code: 'TNS' },
  { id: 'outlet-pool', name: 'Pool Club', code: 'POOL' },
];

// =============================================================================
// Helper Functions
// =============================================================================

export function getMemberById(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

export function getMembershipTypeById(id: string): MembershipType | undefined {
  return membershipTypes.find((mt) => mt.id === id);
}

export function getApplicationById(id: string): MembershipApplication | undefined {
  return applications.find((a) => a.id === id);
}

export function filterMembers(
  membersList: Member[],
  filters: import('./types').MemberFilters
): Member[] {
  return membersList.filter((member) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        member.firstName.toLowerCase().includes(searchLower) ||
        member.lastName.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower) ||
        member.memberNumber.toLowerCase().includes(searchLower) ||
        member.phone.includes(filters.search);
      if (!matchesSearch) return false;
    }

    // Status filter (plural: statuses)
    if (filters.statuses && filters.statuses.length > 0) {
      if (!filters.statuses.includes(member.status)) return false;
    }

    // Membership type filter (plural: membershipTypes)
    if (filters.membershipTypes && filters.membershipTypes.length > 0) {
      if (!filters.membershipTypes.includes(member.membershipTypeId)) return false;
    }

    // Join date range filter
    if (filters.joinDateFrom) {
      const joinDate = new Date(member.joinDate);
      const fromDate = new Date(filters.joinDateFrom);
      if (joinDate < fromDate) return false;
    }
    if (filters.joinDateTo) {
      const joinDate = new Date(member.joinDate);
      const toDate = new Date(filters.joinDateTo);
      if (joinDate > toDate) return false;
    }

    // Balance range filter
    if (filters.balanceMin !== undefined) {
      if (member.balance < filters.balanceMin) return false;
    }
    if (filters.balanceMax !== undefined) {
      if (member.balance > filters.balanceMax) return false;
    }

    // Aging bucket filter (plural: agingBuckets)
    if (filters.agingBuckets && filters.agingBuckets.length > 0) {
      if (!member.agingBucket || !filters.agingBuckets.includes(member.agingBucket)) return false;
    }

    // Phone filter
    if (filters.phone) {
      if (!member.phone.includes(filters.phone)) return false;
    }

    return true;
  });
}

export function searchPersons(query: string, types?: import('./types').PersonType[]): PersonSearchResult[] {
  if (!query || query.length < 2) return [];

  const queryLower = query.toLowerCase();

  // Build search results from members, dependents, and mock guests
  const results: PersonSearchResult[] = [];

  // Search members
  if (!types || types.includes('MEMBER')) {
    members.forEach((member) => {
      const matches =
        member.firstName.toLowerCase().includes(queryLower) ||
        member.lastName.toLowerCase().includes(queryLower) ||
        member.email.toLowerCase().includes(queryLower) ||
        member.memberNumber.toLowerCase().includes(queryLower) ||
        member.phone.includes(query);

      if (matches) {
        results.push({
          id: member.id,
          personType: 'MEMBER',
          memberNumber: member.memberNumber,
          firstName: member.firstName,
          lastName: member.lastName,
          displayName: `${member.firstName} ${member.lastName}`,
          email: member.email,
          phone: member.phone,
          photoUrl: member.photoUrl,
          status: member.status === 'ACTIVE' ? 'ACTIVE' : member.status === 'SUSPENDED' ? 'SUSPENDED' : member.status === 'PENDING' ? 'PENDING' : 'INACTIVE',
          membershipTypeName: member.membershipTypeName,
        });
      }
    });
  }

  // Search dependents
  if (!types || types.includes('DEPENDENT')) {
    members.forEach((member) => {
      member.dependents.forEach((dep) => {
        const matches =
          dep.firstName.toLowerCase().includes(queryLower) ||
          dep.lastName.toLowerCase().includes(queryLower) ||
          (dep.email && dep.email.toLowerCase().includes(queryLower)) ||
          dep.memberNumber.toLowerCase().includes(queryLower) ||
          (dep.phone && dep.phone.includes(query));

        if (matches) {
          results.push({
            id: dep.id,
            personType: 'DEPENDENT',
            memberNumber: dep.memberNumber,
            firstName: dep.firstName,
            lastName: dep.lastName,
            displayName: `${dep.firstName} ${dep.lastName}`,
            email: dep.email,
            phone: dep.phone,
            photoUrl: dep.photoUrl,
            status: dep.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
            parentMemberId: member.id,
            parentMemberNumber: member.memberNumber,
            parentMemberName: `${member.firstName} ${member.lastName}`,
            relationship: dep.relationship,
          });
        }
      });
    });
  }

  return results.slice(0, 10);
}

// Alias exports for easier imports
export { members as mockMembers };
export { membershipTypes as mockMembershipTypes };
export { applications as mockApplications };
export { arTransactions as mockARTransactions };

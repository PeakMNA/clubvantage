/**
 * Common types used across ClubVantage
 */

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// Audit
export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
  updatedById?: string;
}

// Region & Currency
export const Region = {
  TH: 'TH',
  SG: 'SG',
  MY: 'MY',
} as const;
export type Region = (typeof Region)[keyof typeof Region];

export interface RegionConfig {
  region: Region;
  currency: string;
  currencySymbol: string;
  taxType: string;
  taxRate: number;
  timezone: string;
  locale: string;
}

export const REGION_CONFIGS: Record<Region, RegionConfig> = {
  TH: {
    region: 'TH',
    currency: 'THB',
    currencySymbol: '฿',
    taxType: 'VAT',
    taxRate: 7,
    timezone: 'Asia/Bangkok',
    locale: 'th-TH',
  },
  SG: {
    region: 'SG',
    currency: 'SGD',
    currencySymbol: 'S$',
    taxType: 'GST',
    taxRate: 9,
    timezone: 'Asia/Singapore',
    locale: 'en-SG',
  },
  MY: {
    region: 'MY',
    currency: 'MYR',
    currencySymbol: 'RM',
    taxType: 'SST',
    taxRate: 6,
    timezone: 'Asia/Kuala_Lumpur',
    locale: 'en-MY',
  },
};

// User & Auth
export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CLUB_MANAGER: 'CLUB_MANAGER',
  FINANCE_STAFF: 'FINANCE_STAFF',
  FRONT_DESK: 'FRONT_DESK',
  GOLF_OPERATIONS: 'GOLF_OPERATIONS',
  F_AND_B_STAFF: 'F_AND_B_STAFF',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  tenantId: string;
  clubId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  userId: string;
  tenantId: string;
  clubId: string;
  role: UserRole;
  permissions: string[];
}

// Club Entity
export interface Club {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country: string;
  region: Region;
  currency: string;
  timezone: string;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

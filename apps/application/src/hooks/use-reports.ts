'use client';

import {
  useGetReportsDashboardQuery,
  useGetReportsFinancialQuery,
  useGetReportsMembershipQuery,
  useGetReportsArAgingQuery,
  useGetReportsGolfUtilizationQuery,
} from '@clubvantage/api-client/hooks';

export function useReportsDashboard() {
  return useGetReportsDashboardQuery();
}

export function useReportsFinancial(startDate: string, endDate: string) {
  return useGetReportsFinancialQuery(
    { startDate, endDate },
    { enabled: !!startDate && !!endDate },
  );
}

export function useReportsMembership() {
  return useGetReportsMembershipQuery();
}

export function useReportsARAging() {
  return useGetReportsArAgingQuery();
}

export function useReportsGolfUtilization(startDate: string, endDate: string) {
  return useGetReportsGolfUtilizationQuery(
    { startDate, endDate },
    { enabled: !!startDate && !!endDate },
  );
}

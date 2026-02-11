'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  useGetReportsDashboardQuery,
  useGetReportsFinancialQuery,
  useGetReportsMembershipQuery,
  useGetReportsArAgingQuery,
  useGetReportsGolfUtilizationQuery,
  useGetReportsCollectionsQuery,
  useGetReportsArAgingMembersQuery,
} from '@clubvantage/api-client/hooks';
import { format as formatFn, startOfMonth } from 'date-fns';

export function useDateRange() {
  const [range, setRangeState] = useState(() => {
    const now = new Date();
    return {
      startDate: formatFn(startOfMonth(now), 'yyyy-MM-dd'),
      endDate: formatFn(now, 'yyyy-MM-dd'),
    };
  });

  const setRange = useCallback((start: Date, end: Date) => {
    setRangeState({
      startDate: formatFn(start, 'yyyy-MM-dd'),
      endDate: formatFn(end, 'yyyy-MM-dd'),
    });
  }, []);

  const rangeLabel = useMemo(() => {
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    return `${formatFn(start, 'MMM d')} - ${formatFn(end, 'MMM d, yyyy')}`;
  }, [range.startDate, range.endDate]);

  return { ...range, setRange, rangeLabel };
}

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

export function useReportsCollections(startDate: string, endDate: string) {
  return useGetReportsCollectionsQuery(
    { startDate, endDate },
    { enabled: !!startDate && !!endDate },
  );
}

export function useReportsARAgingMembers() {
  return useGetReportsArAgingMembersQuery();
}

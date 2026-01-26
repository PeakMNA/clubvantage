/**
 * Membership types hooks
 * Fetches membership types from API with fallback to mock data
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { request } from '@clubvantage/api-client';
import type { MembershipType } from '@/components/members/types';

const GetMembershipTypesDocument = `
  query GetMembershipTypes {
    membershipTypes {
      id
      name
      code
      description
      monthlyFee
      annualFee
      joiningFee
      allowGuests
      maxGuestsPerBooking
      allowFamilyMembers
      maxFamilyMembers
      bookingAdvanceDays
      priorityBooking
    }
  }
`;

interface ApiMembershipType {
  id: string;
  name: string;
  code: string;
  description?: string;
  monthlyFee?: number;
  annualFee?: number;
  joiningFee?: number;
  allowGuests?: boolean;
  maxGuestsPerBooking?: number;
  allowFamilyMembers?: boolean;
  maxFamilyMembers?: number;
  bookingAdvanceDays?: number;
  priorityBooking?: boolean;
}

function transformMembershipType(apiType: ApiMembershipType): MembershipType {
  return {
    id: apiType.id,
    name: apiType.name,
    description: apiType.description || '',
    billingCycle: 'MONTHLY',
    monthlyFee: apiType.monthlyFee || 0,
    entryFee: apiType.joiningFee || 0,
    maxDependents: apiType.maxFamilyMembers || 0,
    requiresBoardApproval: false,
  };
}

export function useMembershipTypes() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['GetMembershipTypes'],
    queryFn: async () => {
      try {
        const result = await request<{ membershipTypes: ApiMembershipType[] }>(
          GetMembershipTypesDocument
        );
        return result;
      } catch (e) {
        // API might not have this endpoint yet, return null to use fallback
        console.warn('Failed to fetch membership types from API:', e);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if API doesn't have this endpoint
  });

  const membershipTypes = useMemo(() => {
    if (data?.membershipTypes) {
      return data.membershipTypes.map(transformMembershipType);
    }
    // Fallback to empty array - the component can provide defaults
    return [];
  }, [data]);

  return {
    membershipTypes,
    isLoading,
    error,
  };
}
